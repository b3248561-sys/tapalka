import {
  jsonResponse,
  verifyInitData,
  extractUser,
  loadUser,
  saveUser,
  SHOP_ITEMS,
  computePrice,
  getItemLevel,
  ensureDaily
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
    const valid = await verifyInitData(initData, env.BOT_TOKEN);
    if (!valid) {
      return jsonResponse({ ok: false, error: "initData invalid" }, 401);
    }
    tgUser = extractUser(initData);
    if (!tgUser?.id) {
      return jsonResponse({ ok: false, error: "user missing" }, 400);
    }
  }

  const user = await loadUser(env, String(tgUser.id), tgUser.first_name);
  ensureDaily(user);
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item) {
    return jsonResponse({ ok: false, error: "item_not_found" }, 404);
  }

  if (item.type === "boost") {
    const now = Date.now();
    if (user.boostUntil && now < user.boostUntil) {
      return jsonResponse({ ok: false, error: "boost_active" }, 400);
    }
    const price = computePrice(item, 0);
    if (user.balance < price) {
      return jsonResponse({ ok: false, error: "not_enough" }, 400);
    }
    user.balance -= price;
    user.dailyPurchaseCount = (user.dailyPurchaseCount || 0) + 1;
    user.boostUntil = now + (item.durationMs || 10000);
    await saveUser(env, user);
    context.waitUntil(
      logEvent(env, request, user, "buy_boost", {
        itemId: item.id,
        price,
        durationMs: item.durationMs || 10000
      })
    );
    return jsonResponse({
      ok: true,
      balance: user.balance,
      tapValue: user.tapValue || 1,
      boostUntil: user.boostUntil,
      item: {
        id: item.id,
        price,
        active: true,
        durationMs: item.durationMs || 10000
      }
    });
  }

  const level = getItemLevel(user, item.id);
  if (level >= item.maxLevel) {
    return jsonResponse({ ok: false, error: "item_maxed" }, 400);
  }

  const price = computePrice(item, level);
  if (user.balance < price) {
    return jsonResponse({ ok: false, error: "not_enough" }, 400);
  }

  user.balance -= price;
  user.items[item.id] = level + 1;
  user.tapValue = (user.tapValue || 1) + item.tapBonus;
  user.dailyPurchaseCount = (user.dailyPurchaseCount || 0) + 1;

  await saveUser(env, user);
  context.waitUntil(
    logEvent(env, request, user, "buy_upgrade", {
      itemId: item.id,
      level: user.items[item.id],
      price,
      tapBonus: item.tapBonus
    })
  );

  return jsonResponse({
    ok: true,
    balance: user.balance,
    tapValue: user.tapValue,
    item: {
      id: item.id,
      level: user.items[item.id],
      maxLevel: item.maxLevel,
      price: computePrice(item, user.items[item.id]),
      tapBonus: item.tapBonus
    }
  });
}

export async function onRequest(context) {
  if (context.request.method === "POST") {
    return onRequestPost(context);
  }
  return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
}
