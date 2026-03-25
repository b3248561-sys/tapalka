import {
  jsonResponse,
  getRank,
  getUserById,
  saveUser,
  normalizeUser,
  applyAdminAdjustAction,
  hasDurableUserStore,
  runUserAction
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

  let user = null;
  let changes = null;
  const now = Date.now();
  const normalizedUserId = String(userId);

  let usedDurableAction = false;
  if (hasDurableUserStore(env)) {
    const data = await runUserAction(env, normalizedUserId, "admin_adjust", {
      now,
      ...body
    });
    if (data.ok) {
      usedDurableAction = true;
      user = data.user;
      changes = data.changes || {};
    } else {
      const nonBlockingDoErrors = new Set([
        "not_found",
        "method_not_allowed",
        "user_store_error",
        "invalid_user"
      ]);
      if (!nonBlockingDoErrors.has(String(data.error || ""))) {
        const status = data.status || 400;
        return withCors(
          { ok: false, error: data.error || "adjust_failed" },
          status
        );
      }
    }
  }

  if (!usedDurableAction) {
    user = await getUserById(env, normalizedUserId);
    if (!user) {
      return withCors({ ok: false, error: "not_found" }, 404);
    }
    user = normalizeUser(user);
    const result = applyAdminAdjustAction(user, body, now);
    if (!result.ok) {
      return withCors({ ok: false, error: result.error || "adjust_failed" }, result.status || 400);
    }
    changes = result.changes;
    await saveUser(env, user);
  }
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
