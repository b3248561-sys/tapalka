import {
  jsonResponse,
  verifyInitData,
  extractUser,
  loadUser,
  saveUser,
  applyBuyAction,
  runUserAction,
  hasDurableUserStore,
  resolveInitDataMaxAgeSec
} from "../_shared/utils.js";
import { logEvent } from "../_shared/admin.js";

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
  const itemId = body.itemId;
  const maxAgeSec = resolveInitDataMaxAgeSec(env);

  if (!itemId) {
    return jsonResponse({ ok: false, error: "item_missing" }, 400);
  }

  let tgUser = null;
  if (env.ALLOW_INSECURE_DEMO === "1" && demoUserId) {
    tgUser = { id: String(demoUserId), first_name: "Demo" };
  } else {
    if (!initData) {
      return jsonResponse({ ok: false, error: "initData missing" }, 401);
    }
    const valid = await verifyInitData(initData, env.BOT_TOKEN, maxAgeSec);
    if (!valid) {
      return jsonResponse({ ok: false, error: "initData invalid" }, 401);
    }
    tgUser = extractUser(initData);
    if (!tgUser?.id) {
      return jsonResponse({ ok: false, error: "user missing" }, 400);
    }
  }

  const userId = String(tgUser.id);
  const now = Date.now();
  let user = null;
  let result = null;

  if (hasDurableUserStore(env)) {
    const data = await runUserAction(env, userId, "buy", {
      name: tgUser.first_name,
      username: tgUser.username,
      itemId,
      now
    });
    if (!data.ok) {
      const { status = 400, ...rest } = data;
      return jsonResponse({ ok: false, ...rest }, status);
    }
    user = data.user;
    const { user: _user, log, ...payload } = data;
    result = { payload, log };
  } else {
    user = await loadUser(env, userId, tgUser.first_name, tgUser.username);
    result = applyBuyAction(user, itemId, now);
    if (!result.ok) {
      const { status = 400, ...rest } = result;
      await saveUser(env, user);
      return jsonResponse({ ok: false, ...rest }, status);
    }
    await saveUser(env, user);
  }

  if (result?.log?.action) {
    context.waitUntil(
      logEvent(env, request, user, result.log.action, result.log.extra)
    );
  }

  return jsonResponse(result.payload);
}

export async function onRequest(context) {
  if (context.request.method === "POST") {
    return onRequestPost(context);
  }
  return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
}
