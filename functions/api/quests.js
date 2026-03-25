import {
  jsonResponse,
  verifyInitData,
  extractUser,
  loadUser,
  getDailyQuests,
  getRank,
  getRankPoints,
  resolveInitDataMaxAgeSec,
  isDemoAllowed
} from "../_shared/utils.js";

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const initData = url.searchParams.get("initData") || request.headers.get("x-init-data");
  const demoUserId = url.searchParams.get("demoUserId");
  const maxAgeSec = resolveInitDataMaxAgeSec(env);

  let tgUser = null;
  if (isDemoAllowed(env, request) && demoUserId) {
    tgUser = { id: String(demoUserId), first_name: "Demo" };
  } else {
    if (!initData) {
      return jsonResponse({ ok: false, error: "initData missing" }, 401);
    }
    const valid = await verifyInitData(initData, env.BOT_TOKEN, maxAgeSec);
    if (!valid) {
      return jsonResponse({ ok: false, error: "initData invalid" }, 401);
    }
    tgUser = extractUser(initData);
    if (!tgUser?.id) {
      return jsonResponse({ ok: false, error: "user missing" }, 400);
    }
  }

  const user = await loadUser(
    env,
    String(tgUser.id),
    tgUser.first_name,
    tgUser.username,
    tgUser.photo_url || ""
  );

  return jsonResponse({
    ok: true,
    quests: getDailyQuests(user),
    balance: user.balance,
    rank: getRank(getRankPoints(user))
  });
}
