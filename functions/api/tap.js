import {
  jsonResponse,
  verifyInitData,
  extractUser,
  loadUser,
  saveUser,
  applyTapAction,
  runUserAction,
  hasDurableUserStore,
  resolveInitDataMaxAgeSec,
  isDemoAllowed
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
  const maxAgeSec = resolveInitDataMaxAgeSec(env);
  const count = body.count;

  let tgUser = null;
  if (isDemoAllowed(env, request) && demoUserId) {
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

  const now = Date.now();
  let user = null;
  let result = null;
  const userId = String(tgUser.id);

  if (hasDurableUserStore(env)) {
    const data = await runUserAction(env, userId, "tap", {
      name: tgUser.first_name,
      username: tgUser.username,
      count,
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
    result = applyTapAction(user, { count, now });
    if (!result.ok) {
      const { status = 400, ...rest } = result;
      await saveUser(env, user);
      return jsonResponse({ ok: false, ...rest }, status);
    }
    await saveUser(env, user);
  }

  if (result?.log?.shouldLog) {
    context.waitUntil(
      logEvent(
        env,
        request,
        user,
        result.log.action,
        result.log.extra,
        { throttleMs: 0 }
      )
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
