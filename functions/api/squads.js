import {
  jsonResponse,
  verifyInitData,
  extractUser,
  loadUser,
  saveUser,
  summarizeUser,
  resolveInitDataMaxAgeSec,
  isDemoAllowed,
  listSquads,
  resolveSquadCreateCost,
  getUserSquad,
  createSquadAction,
  joinSquadAction,
  leaveSquadAction
} from "../_shared/utils.js";
import { logEvent } from "../_shared/admin.js";

async function resolveTelegramUser(request, env, body = {}, maxAgeSec = 300) {
  const initData = body.initData || request.headers.get("x-init-data");
  const demoUserId = body.demoUserId;

  if (isDemoAllowed(env, request) && demoUserId) {
    return { ok: true, tgUser: { id: String(demoUserId), first_name: "Demo" } };
  }
  if (!initData) {
    return { ok: false, status: 401, error: "initData missing" };
  }
  const valid = await verifyInitData(initData, env.BOT_TOKEN, maxAgeSec);
  if (!valid) {
    return { ok: false, status: 401, error: "initData invalid" };
  }
  const tgUser = extractUser(initData);
  if (!tgUser?.id) {
    return { ok: false, status: 400, error: "user missing" };
  }
  return { ok: true, tgUser };
}

async function buildSquadsPayload(env, user) {
  const currentSquad = await getUserSquad(env, user);
  if (!currentSquad && user.squadId) {
    user.squadId = "";
    user.squadRole = "";
    await saveUser(env, user);
  }
  const squads = await listSquads(env, { limit: 20 });
  return {
    createCost: resolveSquadCreateCost(env),
    user: {
      id: String(user.id),
      squadId: String(user.squadId || ""),
      squadRole: String(user.squadRole || "")
    },
    currentSquad,
    squads
  };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const body = {
    initData: url.searchParams.get("initData") || "",
    demoUserId: url.searchParams.get("demoUserId") || ""
  };
  const maxAgeSec = resolveInitDataMaxAgeSec(env);
  const resolved = await resolveTelegramUser(request, env, body, maxAgeSec);
  if (!resolved.ok) {
    return jsonResponse({ ok: false, error: resolved.error }, resolved.status || 400);
  }
  const tgUser = resolved.tgUser;
  const user = await loadUser(
    env,
    String(tgUser.id),
    tgUser.first_name,
    tgUser.username,
    tgUser.photo_url || ""
  );
  const payload = await buildSquadsPayload(env, user);
  return jsonResponse({ ok: true, ...payload });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const maxAgeSec = resolveInitDataMaxAgeSec(env);
  const resolved = await resolveTelegramUser(request, env, body, maxAgeSec);
  if (!resolved.ok) {
    return jsonResponse({ ok: false, error: resolved.error }, resolved.status || 400);
  }
  const tgUser = resolved.tgUser;
  const user = await loadUser(
    env,
    String(tgUser.id),
    tgUser.first_name,
    tgUser.username,
    tgUser.photo_url || ""
  );
  const action = String(body.action || "").trim().toLowerCase();
  let result = null;

  if (action === "create") {
    result = await createSquadAction(env, user, body.name, Date.now());
  } else if (action === "join") {
    result = await joinSquadAction(env, user, body.squadId);
  } else if (action === "leave") {
    result = await leaveSquadAction(env, user);
  } else {
    return jsonResponse({ ok: false, error: "action_invalid" }, 400);
  }

  if (!result?.ok) {
    return jsonResponse(
      { ok: false, error: result?.error || "squad_action_failed" },
      result?.status || 400
    );
  }

  if (result.user) {
    context.waitUntil(
      logEvent(
        env,
        request,
        result.user,
        `squad_${action}`,
        {
          squadId: result.squad?.id || "",
          squadName: result.squad?.name || "",
          deleted: Boolean(result.deleted)
        },
        { throttleMs: 0 }
      )
    );
  }

  const payload = await buildSquadsPayload(env, result.user || user);
  return jsonResponse({
    ok: true,
    action,
    userSummary: summarizeUser(result.user || user),
    ...payload
  });
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
}
