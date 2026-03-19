import {
  jsonResponse,
  verifyInitData,
  extractUser,
  loadUser,
  saveUser
} from "../_shared/utils.js";

const DAY_MS = 24 * 60 * 60 * 1000;

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

  const user = await loadUser(env, String(tgUser.id), tgUser.first_name);
  const now = Date.now();
  const nextAt = (user.lastDailyTs || 0) + DAY_MS;
  if (now < nextAt) {
    return jsonResponse({
      ok: false,
      error: "daily_not_ready",
      nextAt
    }, 400);
  }

  const reward = 120 + Math.floor((user.tapValue || 1) * 10);
  user.balance += reward;
  user.lastDailyTs = now;
  await saveUser(env, user);

  return jsonResponse({
    ok: true,
    reward,
    balance: user.balance,
    nextAt: now + DAY_MS
  });
}

export async function onRequest(context) {
  if (context.request.method === "POST") {
    return onRequestPost(context);
  }
  return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
}
