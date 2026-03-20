import { jsonResponse } from "../../_shared/utils.js";
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
  const deviceId = request.headers.get("x-device-id");
  const deviceToken = request.headers.get("x-device-token");
  const device = await verifyDevice(env, deviceId, deviceToken);
  if (!device) {
    return withCors({ ok: false, error: "unauthorized" }, 401);
  }

  const url = new URL(request.url);
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit")) || 50));
  const cursor = url.searchParams.get("cursor") || undefined;

  const list = await env.KV.list({ prefix: "log:", limit, cursor });
  const values = await Promise.all(
    list.keys.map((key) => env.KV.get(key.name, "json"))
  );

  const logs = values.filter(Boolean);
  return withCors({
    ok: true,
    logs,
    cursor: list.list_complete ? null : list.cursor
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
