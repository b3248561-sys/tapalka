import {
  jsonResponse,
  verifyInitData,
  extractUser,
  loadUser,
  saveUser,
  ensureDaily
} from "../_shared/utils.js";
import { logEvent } from "../_shared/admin.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const initData = body.initData || request.headers.get("x-init-data");
  const demoUserId = body.demoUserId;
  let count = Number(body.count || 1);
  if (!Number.isFinite(count)) count = 1;
  count = Math.max(1, Math.min(20, Math.floor(count)));

  let tgUser = null;
  if (env.ALLOW_INSECURE_DEMO === "1" && demoUserId) {
    tgUser = { id: String(demoUserId), first_name: "Demo" };
  } else {
    if (!initData) {
      return jsonResponse({ ok: false, error: "initData missing" }, 401);
    }
    const valid = await verifyInitData(initData, env.BOT_TOKEN);
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
    tgUser.username
  );
  ensureDaily(user);
  const now = Date.now();

  // No strict rate limit for MVP; allow fast tapping.
  const boostActive = user.boostUntil && now < user.boostUntil;
  const multiplier = boostActive ? 2 : 1;

  user.windowStartTs = now;
  user.windowCount = (user.windowCount || 0) + count;
  const earned = (user.tapValue || 1) * count * multiplier;
  user.balance += earned;
  user.totalEarned = (user.totalEarned || 0) + earned;
  user.totalTaps = (user.totalTaps || 0) + count;
  user.dailyTapCount = (user.dailyTapCount || 0) + count;
  user.lastTapTs = now;

  if (!user.lastLogTs || now - user.lastLogTs > 2000) {
    user.lastLogTs = now;
    context.waitUntil(
      logEvent(
        env,
        request,
        user,
        "tap",
        { count, earned, multiplier },
        { throttleMs: 0 }
      )
    );
  }

  await saveUser(env, user);

  return jsonResponse({
    ok: true,
    balance: user.balance,
    tapValue: user.tapValue || 1,
    multiplier,
    boostUntil: user.boostUntil || 0,
    windowCount: user.windowCount,
    lastTapTs: user.lastTapTs
  });
}

export async function onRequest(context) {
  if (context.request.method === "POST") {
    return onRequestPost(context);
  }
  return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
}
