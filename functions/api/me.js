import {
  jsonResponse,
  verifyInitData,
  extractUser,
  loadUser,
  syncEnergy,
  saveUser,
  summarizeUser,
  resolveInitDataMaxAgeSec,
  hasDurableUserStore
} from "../_shared/utils.js";
import { logEvent } from "../_shared/admin.js";

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const initData = url.searchParams.get("initData") || request.headers.get("x-init-data");
  const demoUserId = url.searchParams.get("demoUserId");
  const maxAgeSec = resolveInitDataMaxAgeSec(env);
  const useDurableStore = hasDurableUserStore(env);

  if (env.ALLOW_INSECURE_DEMO === "1" && demoUserId) {
    const profile = await loadUser(env, String(demoUserId), "Demo", "demo");
    const now = Date.now();
    const changed = syncEnergy(profile, now);
    if (changed && !useDurableStore) await saveUser(env, profile);
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

  const profile = await loadUser(
    env,
    String(tgUser.id),
    tgUser.first_name,
    tgUser.username
  );
  const now = Date.now();
  const changed = syncEnergy(profile, now);
  if (useDurableStore) {
    context.waitUntil(
      logEvent(env, request, profile, "open", { screen: "webapp" })
    );
    return jsonResponse({ ok: true, user: summarizeUser(profile) });
  }

  let openLogged = false;
  if (!profile.lastOpenLogTs || now - profile.lastOpenLogTs > 60_000) {
    profile.lastOpenLogTs = now;
    openLogged = true;
    context.waitUntil(
      logEvent(env, request, profile, "open", { screen: "webapp" })
    );
  }
  if (changed || openLogged) await saveUser(env, profile);
  return jsonResponse({ ok: true, user: summarizeUser(profile) });
}
