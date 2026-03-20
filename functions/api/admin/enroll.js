import { jsonResponse } from "../../_shared/utils.js";
import { registerDevice } from "../../_shared/admin.js";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST,OPTIONS",
  "access-control-allow-headers": "content-type"
};

function withCors(data, status = 200) {
  return jsonResponse(data, status, CORS_HEADERS);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const token = body.token || "";
  if (!env.ADMIN_ENROLL_TOKEN || token !== env.ADMIN_ENROLL_TOKEN) {
    return withCors({ ok: false, error: "forbidden" }, 403);
  }

  const publicKeyJwk = body.publicKeyJwk;
  if (!publicKeyJwk || !publicKeyJwk.kty) {
    return withCors({ ok: false, error: "public_key_missing" }, 400);
  }

  const { device, token: deviceToken, fingerprint, existing } =
    await registerDevice(env, {
      name: body.deviceName || "Device",
      publicKeyJwk
    });

  return withCors({
    ok: true,
    deviceId: device.id,
    deviceToken,
    fingerprint,
    existing
  });
}

export async function onRequest(context) {
  if (context.request.method === "POST") {
    return onRequestPost(context);
  }
  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  return withCors({ ok: false, error: "method_not_allowed" }, 405);
}
