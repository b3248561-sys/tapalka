import {
  jsonResponse,
  verifyInitData,
  extractUser,
  loadUser,
  getRank,
  ensureDaily
} from "../_shared/utils.js";

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const initData = url.searchParams.get("initData") || request.headers.get("x-init-data");
  const demoUserId = url.searchParams.get("demoUserId");

  if (env.ALLOW_INSECURE_DEMO === "1" && demoUserId) {
    const profile = await loadUser(env, String(demoUserId), "Demo", "demo");
    return jsonResponse({ ok: true, user: profile });
  }

  if (!initData) {
    return jsonResponse({ ok: false, error: "initData missing" }, 401);
  }

  const valid = await verifyInitData(initData, env.BOT_TOKEN);
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
  ensureDaily(profile);
  const rank = getRank(profile.totalEarned || 0);
  return jsonResponse({
    ok: true,
    user: {
      id: profile.id,
      name: profile.name,
      balance: profile.balance,
      tapValue: profile.tapValue || 1,
      lastTapTs: profile.lastTapTs,
      boostUntil: profile.boostUntil || 0,
      lastDailyTs: profile.lastDailyTs || 0,
      totalEarned: profile.totalEarned || 0,
      rank
    }
  });
}
