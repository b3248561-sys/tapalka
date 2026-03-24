import {
  jsonResponse,
  userKey,
  normalizeUser,
  saveUser,
  getRank
} from "../../_shared/utils.js";
import { verifyDevice, logEvent } from "../../_shared/admin.js";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST,OPTIONS",
  "access-control-allow-headers": "content-type,x-device-id,x-device-token"
};

function withCors(data, status = 200) {
  return jsonResponse(data, status, CORS_HEADERS);
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
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
    boostUntil: user.boostUntil || 0,
    bannedUntil: user.bannedUntil || 0,
    rank: getRank(user.totalEarned || 0)
  };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const deviceId = request.headers.get("x-device-id");
  const deviceToken = request.headers.get("x-device-token");
  const device = await verifyDevice(env, deviceId, deviceToken);
  if (!device) {
    return withCors({ ok: false, error: "unauthorized" }, 401);
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const userId = body.userId || body.id;
  if (!userId) {
    return withCors({ ok: false, error: "user_id_required" }, 400);
  }

  const key = userKey(String(userId));
  let user = await env.KV.get(key, "json");
  if (!user) {
    return withCors({ ok: false, error: "not_found" }, 404);
  }

  user = normalizeUser(user);

  const changes = {};
  const deltaBalance = toNumber(body.deltaBalance);
  const setBalance = toNumber(body.setBalance);
  const setTapValue = toNumber(body.setTapValue);
  const banMinutes = toNumber(body.banMinutes);

  if (deltaBalance !== null) {
    user.balance = Math.max(0, (user.balance || 0) + deltaBalance);
    changes.deltaBalance = deltaBalance;
  }
  if (setBalance !== null) {
    user.balance = Math.max(0, setBalance);
    changes.setBalance = setBalance;
  }
  if (setTapValue !== null) {
    user.tapValue = Math.max(1, Math.floor(setTapValue));
    changes.setTapValue = user.tapValue;
  }
  if (banMinutes !== null) {
    if (banMinutes <= 0) {
      user.bannedUntil = 0;
      changes.banMinutes = 0;
    } else {
      user.bannedUntil = Date.now() + banMinutes * 60 * 1000;
      changes.banMinutes = banMinutes;
    }
  }

  if (body.resetDaily) {
    const day = new Date().toISOString().slice(0, 10);
    user.dailyQuestDay = day;
    user.dailyTapCount = 0;
    user.dailyPurchaseCount = 0;
    user.dailyQuestClaims = {};
    changes.resetDaily = true;
  }

  if (body.clearBoost) {
    user.boostUntil = 0;
    changes.clearBoost = true;
  }

  if (!Object.keys(changes).length) {
    return withCors({ ok: false, error: "no_changes" }, 400);
  }

  await saveUser(env, user);
  context.waitUntil(
    logEvent(
      env,
      request,
      user,
      "admin_adjust",
      { changes, deviceId: device.id, deviceName: device.name },
      { throttleMs: 0 }
    )
  );

  return withCors({ ok: true, user: summarize(user), changes });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

export async function onRequest(context) {
  if (context.request.method === "POST") {
    return onRequestPost(context);
  }
  if (context.request.method === "OPTIONS") {
    return onRequestOptions();
  }
  return withCors({ ok: false, error: "method_not_allowed" }, 405);
}
