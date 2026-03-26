import {
  jsonResponse,
  verifyInitData,
  extractUser,
  loadUser,
  saveUser,
  summarizeUser,
  resolveInitDataMaxAgeSec,
  isDemoAllowed,
  upsertLeaderboardEntry
} from "../_shared/utils.js";
import { logEvent } from "../_shared/admin.js";

function normalizeNickname(raw) {
  const value = String(raw ?? "")
    .trim()
    .replace(/\s+/g, " ");
  if (!value) return { ok: false, error: "nickname_required" };
  if (value.length < 2) return { ok: false, error: "nickname_too_short" };
  if (value.length > 24) return { ok: false, error: "nickname_too_long" };
  if (/[\u0000-\u001F\u007F]/.test(value)) {
    return { ok: false, error: "nickname_invalid" };
  }
  return { ok: true, value };
}

function normalizeAvatar(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return { ok: true, value: "" };
  if (value.length > 180_000) return { ok: false, error: "avatar_too_large" };
  const isHttp = /^https?:\/\//i.test(value);
  const isDataImage = /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(value);
  if (!isHttp && !isDataImage) {
    return { ok: false, error: "avatar_invalid" };
  }
  return { ok: true, value };
}

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
  const maxAgeSec = resolveInitDataMaxAgeSec(env);

  let tgUser = null;
  if (isDemoAllowed(env, request) && demoUserId) {
    tgUser = { id: String(demoUserId), first_name: "Demo", username: "demo", photo_url: "" };
  } else {
    if (!initData) return jsonResponse({ ok: false, error: "initData missing" }, 401);
    const valid = await verifyInitData(initData, env.BOT_TOKEN, maxAgeSec);
    if (!valid) return jsonResponse({ ok: false, error: "initData invalid" }, 401);
    tgUser = extractUser(initData);
    if (!tgUser?.id) return jsonResponse({ ok: false, error: "user missing" }, 400);
  }

  const user = await loadUser(
    env,
    String(tgUser.id),
    tgUser.first_name,
    tgUser.username,
    tgUser.photo_url || ""
  );

  const resetNickname = Boolean(body.resetNickname);
  const resetAvatar = Boolean(body.resetAvatar);
  const hasNickname = Object.prototype.hasOwnProperty.call(body, "nickname");
  const hasAvatar = Object.prototype.hasOwnProperty.call(body, "avatarUrl");
  if (!resetNickname && !resetAvatar && !hasNickname && !hasAvatar) {
    return jsonResponse({ ok: false, error: "no_changes" }, 400);
  }

  const changes = {};
  if (resetNickname) {
    user.name = tgUser.first_name || user.name || "Player";
    user.nameCustomized = false;
    changes.nickname = "reset";
  } else if (hasNickname) {
    const nick = normalizeNickname(body.nickname);
    if (!nick.ok) return jsonResponse({ ok: false, error: nick.error }, 400);
    user.name = nick.value;
    user.nameCustomized = true;
    changes.nickname = "set";
  }

  if (resetAvatar) {
    user.avatarUrl = tgUser.photo_url || "";
    user.avatarCustomized = false;
    changes.avatar = "reset";
  } else if (hasAvatar) {
    const avatar = normalizeAvatar(body.avatarUrl);
    if (!avatar.ok) return jsonResponse({ ok: false, error: avatar.error }, 400);
    if (!avatar.value) {
      user.avatarUrl = tgUser.photo_url || "";
      user.avatarCustomized = false;
      changes.avatar = "reset";
    } else {
      user.avatarUrl = avatar.value;
      user.avatarCustomized = true;
      changes.avatar = "set";
    }
  }

  if (!Object.keys(changes).length) {
    return jsonResponse({ ok: false, error: "no_changes" }, 400);
  }

  await saveUser(env, user);
  await upsertLeaderboardEntry(env, user);
  context.waitUntil(
    logEvent(env, request, user, "profile_update", changes, { throttleMs: 0 })
  );

  return jsonResponse({ ok: true, user: summarizeUser(user) });
}

export async function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
}
