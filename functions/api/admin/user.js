import {
  jsonResponse,
  normalizeUser,
  saveUser,
  getRank,
  getRankPoints,
  getUserById,
  hasDurableUserStore,
  upsertLeaderboardEntry
} from "../../_shared/utils.js";
import {
  resolveDeviceAuth,
  verifyDeviceDetailed
} from "../../_shared/admin.js";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,OPTIONS",
  "access-control-allow-headers": "content-type,x-device-id,x-device-token"
};

function withCors(data, status = 200) {
  return jsonResponse(data, status, CORS_HEADERS);
}

function summarize(user) {
  return {
    id: String(user.id),
    name: user.name || "",
    username: user.username || "",
    balance: user.balance || 0,
    tapValue: user.tapValue || 1,
    totalTaps: user.totalTaps || 0,
    totalEarned: user.totalEarned || 0,
    referralsCount: user.referralsCount || 0,
    referralsEarned: user.referralsEarned || 0,
    referralsLevel2Count: user.referralsLevel2Count || 0,
    referralsLevel2Earned: user.referralsLevel2Earned || 0,
    boostUntil: user.boostUntil || 0,
    bannedUntil: user.bannedUntil || 0,
    leaderboardHidden: Boolean(user.leaderboardHidden),
    lastDailyTs: user.lastDailyTs || 0,
    dailyStreakCount: user.dailyStreakCount || 0,
    dailyStreakBest: user.dailyStreakBest || 0,
    dailyStreakLastDay: user.dailyStreakLastDay || "",
    dailyTapCount: user.dailyTapCount || 0,
    dailyPurchaseCount: user.dailyPurchaseCount || 0,
    miningStored: Math.floor(Number(user.miningStored || 0)),
    miningLastTs: Number(user.miningLastTs || 0),
    miningCapacityHours: Number(user.miningCapacityHours || 3),
    squadId: user.squadId || "",
    squadRole: user.squadRole || "",
    seasonKey: user.seasonKey || "",
    seasonPoints: Number(user.seasonPoints || 0),
    rank: getRank(getRankPoints(user))
  };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const store = hasDurableUserStore(env) ? "do" : "kv";
  const auth = resolveDeviceAuth(request);
  const authCheck = await verifyDeviceDetailed(
    env,
    auth.deviceId,
    auth.deviceToken
  );
  if (!authCheck.ok) {
    return withCors(
      {
        ok: false,
        error: "unauthorized",
        store,
        authErrorCode: authCheck.errorCode || auth.errorCode || "auth_missing"
      },
      401
    );
  }

  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") || url.searchParams.get("id");
  if (!userId) {
    return withCors({ ok: false, error: "user_id_required" }, 400);
  }

  let user = await getUserById(env, String(userId));
  if (!user) {
    return withCors({ ok: false, error: "not_found" }, 404);
  }

  const normalized = normalizeUser(user);
  if (normalized._dirty) {
    delete normalized._dirty;
    await saveUser(env, normalized);
    user = normalized;
  }
  await upsertLeaderboardEntry(env, user);

  return withCors({ ok: true, user: summarize(user), store });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

export async function onRequest(context) {
  if (context.request.method === "GET") {
    return onRequestGet(context);
  }
  if (context.request.method === "OPTIONS") {
    return onRequestOptions();
  }
  return withCors({ ok: false, error: "method_not_allowed" }, 405);
}
