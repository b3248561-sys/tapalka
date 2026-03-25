import {
  jsonResponse,
  getUserById,
  loadUser,
  normalizeUser,
  saveUser,
  hasDurableUserStore
} from "../../_shared/utils.js";
import { verifyDevice } from "../../_shared/admin.js";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,OPTIONS",
  "access-control-allow-headers": "content-type,x-device-id,x-device-token"
};

function withCors(data, status = 200) {
  return jsonResponse(data, status, CORS_HEADERS);
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const store = hasDurableUserStore(env) ? "do" : "kv";
  const deviceId = request.headers.get("x-device-id");
  const deviceToken = request.headers.get("x-device-token");
  const device = await verifyDevice(env, deviceId, deviceToken);
  if (!device) {
    return withCors({ ok: false, error: "unauthorized" }, 401);
  }

  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") || url.searchParams.get("id");
  if (!userId) {
    return withCors({ ok: false, error: "user_id_required" }, 400);
  }

  let adminUser = await getUserById(env, String(userId));
  if (!adminUser) {
    return withCors({ ok: false, error: "not_found", store }, 404);
  }

  const normalized = normalizeUser(adminUser);
  if (normalized._dirty) {
    delete normalized._dirty;
    await saveUser(env, normalized);
    adminUser = normalized;
  }

  // WebApp-side read path without Telegram initData for admin diagnostics.
  const webappUser = await loadUser(
    env,
    String(userId),
    adminUser.name || "Player",
    adminUser.username || ""
  );
  const adminBalance = Number(adminUser.balance || 0);
  const webappBalance = Number(webappUser.balance || 0);
  const consistent =
    String(adminUser.id) === String(webappUser.id) &&
    adminBalance === webappBalance;

  return withCors({
    ok: true,
    userId: String(userId),
    store,
    consistent,
    admin: {
      id: String(adminUser.id),
      balance: adminBalance,
      tapValue: Number(adminUser.tapValue || 1)
    },
    webapp: {
      id: String(webappUser.id),
      balance: webappBalance,
      tapValue: Number(webappUser.tapValue || 1),
      energy: Number(webappUser.energy || 0),
      maxEnergy: Number(webappUser.maxEnergy || 0)
    }
  });
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
