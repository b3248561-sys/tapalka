import {
  jsonResponse,
  verifyInitData,
  extractUser,
  loadUser,
  saveUser,
  applyMiningClaimAction,
  runUserAction,
  hasDurableUserStore,
  resolveInitDataMaxAgeSec,
  isDemoAllowed,
  getMiningSnapshot,
  upsertLeaderboardEntry
} from "../_shared/utils.js";
import { logEvent } from "../_shared/admin.js";

async function resolveTelegramUser(request, env, body = {}, maxAgeSec = 300) {
  const initData = body.initData || request.headers.get("x-init-data");
  const demoUserId = body.demoUserId;

  if (isDemoAllowed(env, request) && demoUserId) {
    return { ok: true, tgUser: { id: String(demoUserId), first_name: "Demo" } };
  }
  if (!initData) {
    return { ok: false, status: 401, error: "initData missing" };
  }
  const valid = await verifyInitData(initData, env.BOT_TOKEN, maxAgeSec);
  if (!valid) {
    return { ok: false, status: 401, error: "initData invalid" };
  }
  const tgUser = extractUser(initData);
  if (!tgUser?.id) {
    return { ok: false, status: 400, error: "user missing" };
  }
  return { ok: true, tgUser };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const body = {
    initData: url.searchParams.get("initData") || "",
    demoUserId: url.searchParams.get("demoUserId") || ""
  };
  const maxAgeSec = resolveInitDataMaxAgeSec(env);
  const resolved = await resolveTelegramUser(request, env, body, maxAgeSec);
  if (!resolved.ok) {
    return jsonResponse({ ok: false, error: resolved.error }, resolved.status || 400);
  }
  const tgUser = resolved.tgUser;
  const user = await loadUser(
    env,
    String(tgUser.id),
    tgUser.first_name,
    tgUser.username,
    tgUser.photo_url || ""
  );

  return jsonResponse({
    ok: true,
    mining: getMiningSnapshot(user),
    dailyStreak: {
      count: Number(user.dailyStreakCount || 0),
      best: Number(user.dailyStreakBest || 0),
      max: 7,
      lastClaimTs: Number(user.dailyStreakLastClaimTs || 0)
    }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const maxAgeSec = resolveInitDataMaxAgeSec(env);
  const resolved = await resolveTelegramUser(request, env, body, maxAgeSec);
  if (!resolved.ok) {
    return jsonResponse({ ok: false, error: resolved.error }, resolved.status || 400);
  }
  const tgUser = resolved.tgUser;
  const userId = String(tgUser.id);
  const now = Date.now();
  let user = null;
  let result = null;

  if (hasDurableUserStore(env)) {
    const data = await runUserAction(env, userId, "mining_claim", {
      name: tgUser.first_name,
      username: tgUser.username,
      avatarUrl: tgUser.photo_url || "",
      now
    });
    if (!data.ok) {
      const { status = 400, ...rest } = data;
      return jsonResponse({ ok: false, ...rest }, status);
    }
    user = data.user;
    const { user: _user, log, ...payload } = data;
    result = { payload, log };
  } else {
    user = await loadUser(
      env,
      userId,
      tgUser.first_name,
      tgUser.username,
      tgUser.photo_url || ""
    );
    result = applyMiningClaimAction(user, now);
    if (!result.ok) {
      const { status = 400, ...rest } = result;
      await saveUser(env, user);
      return jsonResponse({ ok: false, ...rest }, status);
    }
    await saveUser(env, user);
  }

  if (result?.log?.action) {
    context.waitUntil(logEvent(env, request, user, result.log.action, result.log.extra));
  }
  context.waitUntil(upsertLeaderboardEntry(env, user));

  return jsonResponse({
    ...result.payload,
    dailyStreak: {
      count: Number(user.dailyStreakCount || 0),
      best: Number(user.dailyStreakBest || 0),
      max: 7,
      lastClaimTs: Number(user.dailyStreakLastClaimTs || 0)
    }
  });
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
}
