import {
  jsonResponse,
  verifyInitData,
  extractUser,
  loadUser,
  saveUser,
  getDailyQuests,
  ensureDaily,
  getRank,
  isBanned,
  syncEnergy
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
  const questId = body.questId;

  if (!questId) {
    return jsonResponse({ ok: false, error: "quest_missing" }, 400);
  }

  let tgUser = null;
  if (env.ALLOW_INSECURE_DEMO === "1" && demoUserId) {
    tgUser = { id: String(demoUserId), first_name: "Demo" };
  } else {
    if (!initData) {
      return jsonResponse({ ok: false, error: "initData missing" }, 401);
    }
    const valid = await verifyInitData(initData, env.BOT_TOKEN);
    if (!valid) {
      return jsonResponse({ ok: false, error: "initData invalid" }, 401);
    }
    tgUser = extractUser(initData);
    if (!tgUser?.id) {
      return jsonResponse({ ok: false, error: "user missing" }, 400);
    }
  }

  const user = await loadUser(
    env,
    String(tgUser.id),
    tgUser.first_name,
    tgUser.username
  );
  ensureDaily(user);
  const now = Date.now();
  const changed = syncEnergy(user, now);
  if (changed) await saveUser(env, user);
  if (isBanned(user)) {
    return jsonResponse(
      { ok: false, error: "banned", bannedUntil: user.bannedUntil || 0 },
      403
    );
  }
  const quests = getDailyQuests(user);
  const quest = quests.find((q) => q.id === questId);
  if (!quest) {
    return jsonResponse({ ok: false, error: "quest_not_found" }, 404);
  }
  if (quest.claimed) {
    return jsonResponse({ ok: false, error: "quest_claimed" }, 400);
  }
  if (quest.progress < quest.target) {
    return jsonResponse({ ok: false, error: "quest_not_ready" }, 400);
  }

  user.balance += quest.reward;
  user.dailyQuestClaims[quest.id] = true;
  await saveUser(env, user);
  context.waitUntil(
    logEvent(env, request, user, "quest_claim", {
      questId: quest.id,
      reward: quest.reward
    })
  );

  return jsonResponse({
    ok: true,
    reward: quest.reward,
    balance: user.balance,
    quests: getDailyQuests(user),
    rank: getRank(user.totalEarned || 0),
    energy: user.energy,
    maxEnergy: user.maxEnergy,
    energyRegen: user.energyRegen || 1
  });
}

export async function onRequest(context) {
  if (context.request.method === "POST") {
    return onRequestPost(context);
  }
  return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
}
