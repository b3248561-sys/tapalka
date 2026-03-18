import {
  jsonResponse,
  verifyInitData,
  extractUser,
  loadUser,
  saveUser
} from "../_shared/utils.js";

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

  const now = Date.now();
  const WINDOW_MS = 1000;
  const MAX_TAPS = 12;

  const user = await loadUser(env, String(tgUser.id), tgUser.first_name);

  if (now - user.windowStartTs > WINDOW_MS) {
    user.windowStartTs = now;
    user.windowCount = 0;
  }

  if (user.windowCount >= MAX_TAPS) {
    await saveUser(env, user);
    return jsonResponse({ ok: false, error: "rate_limited" }, 429);
  }

  user.windowCount += 1;
  user.balance += 1;
  user.lastTapTs = now;

  await saveUser(env, user);

  return jsonResponse({
    ok: true,
    balance: user.balance,
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
