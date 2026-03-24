import {
  jsonResponse,
  verifyInitData,
  extractUser,
  loadUser,
  saveUser,
  isBanned,
  syncEnergy
} from "../_shared/utils.js";
import { logEvent } from "../_shared/admin.js";

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

  const user = await loadUser(
    env,
    String(tgUser.id),
    tgUser.first_name,
    tgUser.username
  );
  const now = Date.now();
  const changed = syncEnergy(user, now);
  if (changed) await saveUser(env, user);
  if (isBanned(user)) {
    return jsonResponse(
      { ok: false, error: "banned", bannedUntil: user.bannedUntil || 0 },
      403
    );
  }
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
  context.waitUntil(logEvent(env, request, user, "daily_claim", { reward }));

  return jsonResponse({
    ok: true,
    reward,
    balance: user.balance,
    nextAt: now + DAY_MS,
    energy: user.energy,
    maxEnergy: user.maxEnergy,
    energyRegen: user.energyRegen || 1
  });
}

export async function onRequest(context) {
  if (context.request.method === "POST") {
    return onRequestPost(context);
  }
  return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
}
