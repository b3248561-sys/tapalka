import {
  jsonResponse,
  verifyInitData,
  extractUser,
  extractStartParam,
  loadUser,
  getUserById,
  syncEnergy,
  saveUser,
  summarizeUser,
  resolveInitDataMaxAgeSec,
  hasDurableUserStore,
  isDemoAllowed,
  upsertLeaderboardEntry,
  applyWelcomeBonus,
  applyReferralBonus,
  normalizeReferralCode
} from "../_shared/utils.js";
import { logEvent } from "../_shared/admin.js";

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const initData = url.searchParams.get("initData") || request.headers.get("x-init-data");
  const demoUserId = url.searchParams.get("demoUserId");
  const maxAgeSec = resolveInitDataMaxAgeSec(env);
  const useDurableStore = hasDurableUserStore(env);

  if (isDemoAllowed(env, request) && demoUserId) {
    const profile = await loadUser(env, String(demoUserId), "Demo", "demo", "");
    const now = Date.now();
    const changed = syncEnergy(profile, now);
    if (changed && !useDurableStore) await saveUser(env, profile);
    context.waitUntil(upsertLeaderboardEntry(env, profile));
    return jsonResponse({ ok: true, user: summarizeUser(profile) });
  }

  if (!initData) {
    return jsonResponse({ ok: false, error: "initData missing" }, 401);
  }

  const valid = await verifyInitData(initData, env.BOT_TOKEN, maxAgeSec);
  if (!valid) {
    return jsonResponse({ ok: false, error: "initData invalid" }, 401);
  }

  const tgUser = extractUser(initData);
  if (!tgUser?.id) {
    return jsonResponse({ ok: false, error: "user missing" }, 400);
  }

  const referralCode =
    normalizeReferralCode(url.searchParams.get("ref")) ||
    normalizeReferralCode(extractStartParam(initData));

  let profile = await loadUser(
    env,
    String(tgUser.id),
    tgUser.first_name,
    tgUser.username,
    tgUser.photo_url || ""
  );
  let welcomeBonus = 0;
  let referral = null;

  welcomeBonus = applyWelcomeBonus(profile);
  if (referralCode) {
    const referralResult = await applyReferralBonus(env, profile, referralCode);
    if (referralResult.ok) {
      referral = {
        referrerId: referralResult.referrerId,
        referrerName: referralResult.referrerName || "",
        newUserBonus: referralResult.newUserBonus,
        referrerBonus: referralResult.referrerBonus
      };
      const fresh = await getUserById(env, String(profile.id));
      if (fresh) {
        profile = fresh;
      }
      context.waitUntil(
        logEvent(
          env,
          request,
          profile,
          "referral_claim",
          {
            referralCode,
            referrerId: referralResult.referrerId,
            newUserBonus: referralResult.newUserBonus
          },
          { throttleMs: 0 }
        )
      );
    }
  }
  const now = Date.now();
  const changed = syncEnergy(profile, now);
  context.waitUntil(upsertLeaderboardEntry(env, profile));
  if (useDurableStore) {
    if (welcomeBonus > 0) {
      await saveUser(env, profile);
    }
    context.waitUntil(
      logEvent(env, request, profile, "open", { screen: "webapp" })
    );
    return jsonResponse({
      ok: true,
      user: summarizeUser(profile),
      welcomeBonus,
      referral
    });
  }

  let openLogged = false;
  if (!profile.lastOpenLogTs || now - profile.lastOpenLogTs > 60_000) {
    profile.lastOpenLogTs = now;
    openLogged = true;
    context.waitUntil(
      logEvent(env, request, profile, "open", { screen: "webapp" })
    );
  }
  if (changed || openLogged || welcomeBonus > 0) await saveUser(env, profile);
  return jsonResponse({
    ok: true,
    user: summarizeUser(profile),
    welcomeBonus,
    referral
  });
}
