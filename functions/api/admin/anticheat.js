import { jsonResponse, hasDurableUserStore } from "../../_shared/utils.js";
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
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit")) || 50));
  const cursor = url.searchParams.get("cursor") || undefined;
  const userIdFilter = String(url.searchParams.get("userId") || "").trim();

  const list = await env.KV.list({ prefix: "anticheat:", limit, cursor });
  const raw = await Promise.all(list.keys.map((key) => env.KV.get(key.name, "json")));
  let complaints = raw.filter(Boolean);
  if (userIdFilter) {
    complaints = complaints.filter((entry) => String(entry.userId || "") === userIdFilter);
  }
  complaints.sort((a, b) => String(b.ts || "").localeCompare(String(a.ts || "")));

  return withCors({
    ok: true,
    store,
    complaints,
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

