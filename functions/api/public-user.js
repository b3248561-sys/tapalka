import {
  jsonResponse,
  verifyInitData,
  extractUser,
  loadUser,
  getUserById,
  normalizeUser,
  summarizeUser,
  resolveInitDataMaxAgeSec,
  isDemoAllowed
} from "../_shared/utils.js";

function sanitizeUserId(raw) {
  const value = String(raw || "").trim();
  return /^\d{3,20}$/.test(value) ? value : "";
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "GET") {
    return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
  }

  const url = new URL(request.url);
  const initData =
    url.searchParams.get("initData") || request.headers.get("x-init-data");
  const demoUserId = sanitizeUserId(url.searchParams.get("demoUserId"));
  const requestedUserId = sanitizeUserId(url.searchParams.get("userId"));
  const maxAgeSec = resolveInitDataMaxAgeSec(env);

  let viewer = null;
  if (isDemoAllowed(env, request) && demoUserId) {
    viewer = await loadUser(env, demoUserId, "Demo", "demo", "");
  } else {
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
    viewer = await loadUser(
      env,
      String(tgUser.id),
      tgUser.first_name,
      tgUser.username,
      tgUser.photo_url || ""
    );
  }

  const targetId = requestedUserId || String(viewer.id || "");
  if (!targetId) {
    return jsonResponse({ ok: false, error: "user_missing" }, 400);
  }

  let target = null;
  if (String(viewer.id) === targetId) {
    target = viewer;
  } else {
    const loaded = await getUserById(env, targetId);
    if (!loaded) {
      return jsonResponse({ ok: false, error: "not_found" }, 404);
    }
    target = normalizeUser(loaded);
  }

  const summary = summarizeUser(target);
  return jsonResponse({
    ok: true,
    isYou: String(summary.id) === String(viewer.id),
    user: {
      id: summary.id,
      name: summary.name,
      username: summary.username,
      avatarUrl: summary.avatarUrl,
      balance: summary.balance,
      tapValue: summary.tapValue,
      rank: summary.rank,
      seasonPoints: summary.seasonPoints,
      totalEarned: summary.totalEarned,
      equippedCosmetic: summary.equippedCosmetic,
      equippedFrame: summary.equippedFrame,
      gifts: summary.gifts || [],
      giftStats: summary.giftStats || { total: 0, types: 0 }
    }
  });
}
