const textEncoder = new TextEncoder();

const DEVICES_KEY = "admin:devices";
const DEVICE_KEY_PREFIX = "admin:device:";
const ANTICHEAT_KEY_PREFIX = "anticheat:";

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function base64ToBytes(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function randomHex(byteLength = 16) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sha256Hex(input) {
  if (!input) return "";
  const data = textEncoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hash);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function loadDevices(env) {
  const list = await env.KV.get(DEVICES_KEY, "json");
  return Array.isArray(list) ? list : [];
}

async function saveDevices(env, devices) {
  await env.KV.put(DEVICES_KEY, JSON.stringify(devices));
}

export async function registerDevice(env, { name, publicKeyJwk }) {
  const devices = await loadDevices(env);
  const fingerprint = await sha256Hex(JSON.stringify(publicKeyJwk));
  const existing = devices.find((d) => d.fingerprint === fingerprint);
  if (existing) {
    return {
      device: existing,
      token: null,
      fingerprint,
      existing: true
    };
  }

  const id = `dev_${randomHex(8)}`;
  const token = randomHex(24);
  const tokenHash = await sha256Hex(token);
  const device = {
    id,
    name: name || "Device",
    publicKeyJwk,
    fingerprint,
    tokenHash,
    enabled: true,
    createdAt: new Date().toISOString()
  };
  devices.push(device);
  await saveDevices(env, devices);
  await env.KV.put(`${DEVICE_KEY_PREFIX}${id}`, JSON.stringify(device));
  return { device, token, fingerprint, existing: false };
}

export async function verifyDevice(env, deviceId, token) {
  if (!deviceId || !token) return null;
  const device =
    (await env.KV.get(`${DEVICE_KEY_PREFIX}${deviceId}`, "json")) ||
    (await loadDevices(env)).find((d) => d.id === deviceId);
  if (!device || !device.enabled) return null;
  const tokenHash = await sha256Hex(token);
  if (tokenHash !== device.tokenHash) return null;
  return device;
}

function normalizeAuthValue(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export function resolveDeviceAuth(
  request,
  { body = null, allowBodyFallback = false, allowQueryFallback = false } = {}
) {
  const headerDeviceId = normalizeAuthValue(request.headers.get("x-device-id"));
  const headerDeviceToken = normalizeAuthValue(
    request.headers.get("x-device-token")
  );
  if (headerDeviceId && headerDeviceToken) {
    return {
      deviceId: headerDeviceId,
      deviceToken: headerDeviceToken,
      source: "headers",
      errorCode: null
    };
  }
  if (headerDeviceId || headerDeviceToken) {
    return {
      deviceId: headerDeviceId,
      deviceToken: headerDeviceToken,
      source: "headers",
      errorCode: "auth_missing"
    };
  }

  if (allowBodyFallback && body && typeof body === "object") {
    const bodyDeviceId = normalizeAuthValue(body.deviceId);
    const bodyDeviceToken = normalizeAuthValue(body.deviceToken);
    if (bodyDeviceId && bodyDeviceToken) {
      return {
        deviceId: bodyDeviceId,
        deviceToken: bodyDeviceToken,
        source: "body",
        errorCode: null
      };
    }
    if (bodyDeviceId || bodyDeviceToken) {
      return {
        deviceId: bodyDeviceId,
        deviceToken: bodyDeviceToken,
        source: "body",
        errorCode: "auth_missing"
      };
    }
  }

  if (allowQueryFallback) {
    const url = new URL(request.url);
    const queryDeviceId = normalizeAuthValue(
      url.searchParams.get("deviceId")
    );
    const queryDeviceToken = normalizeAuthValue(
      url.searchParams.get("deviceToken")
    );
    if (queryDeviceId && queryDeviceToken) {
      return {
        deviceId: queryDeviceId,
        deviceToken: queryDeviceToken,
        source: "query",
        errorCode: null
      };
    }
    if (queryDeviceId || queryDeviceToken) {
      return {
        deviceId: queryDeviceId,
        deviceToken: queryDeviceToken,
        source: "query",
        errorCode: "auth_missing"
      };
    }
  }

  return {
    deviceId: "",
    deviceToken: "",
    source: "none",
    errorCode: "auth_missing"
  };
}

export async function verifyDeviceDetailed(env, deviceId, token) {
  const normalizedDeviceId = normalizeAuthValue(deviceId);
  const normalizedToken = normalizeAuthValue(token);
  if (!normalizedDeviceId || !normalizedToken) {
    return { ok: false, errorCode: "auth_missing", device: null };
  }

  const device =
    (await env.KV.get(`${DEVICE_KEY_PREFIX}${normalizedDeviceId}`, "json")) ||
    (await loadDevices(env)).find((d) => d.id === normalizedDeviceId);
  if (!device) {
    return { ok: false, errorCode: "auth_device_not_found", device: null };
  }
  if (!device.enabled) {
    return { ok: false, errorCode: "auth_device_disabled", device: null };
  }
  const tokenHash = await sha256Hex(normalizedToken);
  if (tokenHash !== device.tokenHash) {
    return { ok: false, errorCode: "auth_token_mismatch", device: null };
  }

  return { ok: true, errorCode: null, device };
}

export async function getAdminDevices(env) {
  const devices = await loadDevices(env);
  return devices.filter((d) => d.enabled && d.publicKeyJwk);
}

export async function encryptForDevices(payload, devices) {
  if (!devices.length) return null;
  const data = textEncoder.encode(JSON.stringify(payload));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, data);
  const rawKey = await crypto.subtle.exportKey("raw", aesKey);

  const recipients = {};
  for (const device of devices) {
    const publicKey = await crypto.subtle.importKey(
      "jwk",
      device.publicKeyJwk,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"]
    );
    const encryptedKey = await crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      rawKey
    );
    recipients[device.id] = bytesToBase64(new Uint8Array(encryptedKey));
  }

  return {
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    recipients
  };
}

export function decodeBase64(b64) {
  return base64ToBytes(b64);
}

function getHeader(request, name) {
  const target = String(name || "").toLowerCase();
  if (!target) return "";
  for (const [key, value] of request.headers.entries()) {
    if (key.toLowerCase() === target) return value;
  }
  return "";
}

function getClientIp(request) {
  const direct =
    getHeader(request, "cf-connecting-ip") ||
    getHeader(request, "true-client-ip") ||
    getHeader(request, "x-real-ip") ||
    getHeader(request, "x-client-ip");
  if (direct) return direct;
  const forwarded = getHeader(request, "x-forwarded-for") || "";
  if (!forwarded) return "";
  return forwarded.split(",")[0].trim();
}

function getCountry(request) {
  return (
    request.cf?.country ||
    getHeader(request, "cf-ipcountry") ||
    ""
  );
}

export async function reportAntiCheat(env, request, user, report = {}) {
  if (!env?.KV || !report || typeof report !== "object") return;
  const ts = new Date().toISOString();
  const ip = getClientIp(request);
  const ua = request.headers.get("User-Agent") || "";
  const country = getCountry(request);
  const ipHash = ip ? await sha256Hex(ip) : "";
  const uaHash = ua ? await sha256Hex(ua) : "";
  const path = new URL(request.url).pathname;

  const entry = {
    id: `ac_${randomHex(6)}`,
    ts,
    level: String(report.level || "warn"),
    reason: String(report.reason || "suspicious_pattern"),
    score: Number(report.score || 0),
    intervalMs: Number(report.intervalMs || 0),
    stableCount: Number(report.stableCount || 0),
    burstCount: Number(report.burstCount || 0),
    count: Number(report.count || 1),
    blockedUntil: Number(report.blockedUntil || 0),
    userId: user?.id ? String(user.id) : "",
    userName: user?.name || "",
    userUsername: user?.username || "",
    path,
    country,
    ipHash,
    uaHash
  };

  const ttlDays = Number(env.ANTICHEAT_TTL_DAYS || 30);
  const key = `${ANTICHEAT_KEY_PREFIX}${ts}:${randomHex(4)}`;
  await env.KV.put(key, JSON.stringify(entry), {
    expirationTtl: ttlDays * 86400
  });
}

export async function logEvent(env, request, user, action, extra = {}, opts = {}) {
  const devices = await getAdminDevices(env);
  if (!devices.length) return;

  const now = Date.now();
  if (opts.throttleMs && user?.lastLogTs && now - user.lastLogTs < opts.throttleMs) {
    return;
  }

  const ts = new Date(now).toISOString();
  const ip = getClientIp(request);
  const ua = request.headers.get("User-Agent") || "";
  const country = getCountry(request);
  const ipHash = ip ? await sha256Hex(ip) : "";
  const uaHash = ua ? await sha256Hex(ua) : "";
  const path = new URL(request.url).pathname;

  let countInMinute = 0;
  if (ipHash) {
    const minuteKey = ts.slice(0, 16);
    const statKey = `stat:req:${minuteKey}:${ipHash}`;
    const current = Number(await env.KV.get(statKey)) || 0;
    countInMinute = current + 1;
    const statTtlDays = Number(env.LOG_STAT_TTL_DAYS || 30);
    await env.KV.put(statKey, String(countInMinute), {
      expirationTtl: statTtlDays * 86400
    });
  }

  const payload = {
    ts,
    action,
    path,
    method: request.method,
    user: user
      ? {
          id: String(user.id),
          name: user.name || "",
          username: user.username || ""
        }
      : null,
    rawIp: ip,
    ipHash,
    userAgent: ua,
    country,
    countInMinute,
    extra
  };

  const enc = await encryptForDevices(payload, devices);
  if (!enc) return;

  const logEntry = {
    id: `log_${randomHex(6)}`,
    ts,
    action,
    path,
    method: request.method,
    userId: user?.id ? String(user.id) : null,
    userName: user?.name || "",
    userUsername: user?.username || "",
    ipHash,
    country,
    uaHash,
    enc
  };

  const ttlDays = Number(env.LOG_RAW_TTL_DAYS || 7);
  const logKey = `log:${ts}:${randomHex(4)}`;
  await env.KV.put(logKey, JSON.stringify(logEntry), {
    expirationTtl: ttlDays * 86400
  });
}
