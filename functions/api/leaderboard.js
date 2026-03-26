import {
  jsonResponse,
  verifyInitData,
  extractUser,
  loadUser,
  getLeaderboard,
  upsertLeaderboardEntry,
  getSeasonInfo,
  resolveInitDataMaxAgeSec,
  isDemoAllowed
} from "../_shared/utils.js";

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const initData =
    url.searchParams.get("initData") || request.headers.get("x-init-data");
  const demoUserId = url.searchParams.get("demoUserId");
  const maxAgeSec = resolveInitDataMaxAgeSec(env);
  const limit = Math.max(
    5,
    Math.min(100, Number(url.searchParams.get("limit")) || 50)
  );
  const mode = url.searchParams.get("mode") === "alltime" ? "alltime" : "season";

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

  const currentUser = await loadUser(
    env,
    String(tgUser.id),
    tgUser.first_name,
    tgUser.username,
    tgUser.photo_url || ""
  );
  await upsertLeaderboardEntry(env, currentUser);
  const season = getSeasonInfo();
  const players = await getLeaderboard(env, {
    limit,
    mode,
    seasonKey: season.key
  });
  const currentUserId = String(currentUser.id);

  return jsonResponse({
    ok: true,
    players,
    currentUserId,
    mode,
    season
  });
}
