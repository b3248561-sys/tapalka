import {
  jsonResponse,
  verifyInitData,
  extractUser,
  loadUser,
  SHOP_ITEMS,
  computePrice,
  getItemLevel,
  syncEnergy,
  saveUser
} from "../_shared/utils.js";

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const initData = url.searchParams.get("initData") || request.headers.get("x-init-data");
  const demoUserId = url.searchParams.get("demoUserId");

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
  const now = Date.now();
  const changed = syncEnergy(user, now);
  if (changed) await saveUser(env, user);
  const items = SHOP_ITEMS.map((item) => {
    const level = getItemLevel(user, item.id);
    const price = computePrice(item, level);
    if (item.type === "boost") {
      const active = user.boostUntil && now < user.boostUntil;
      return {
        id: item.id,
        type: item.type,
        basePrice: item.basePrice,
        tapBonus: item.tapBonus,
        energyBonus: item.energyBonus,
        regenBonus: item.regenBonus,
        maxLevel: item.maxLevel,
        level,
        price,
        durationMs: item.durationMs,
        active,
        remainingMs: active ? user.boostUntil - now : 0
      };
    }
    return {
      id: item.id,
      type: item.type,
      basePrice: item.basePrice,
      tapBonus: item.tapBonus,
      energyBonus: item.energyBonus,
      regenBonus: item.regenBonus,
      maxLevel: item.maxLevel,
      level,
      price
    };
  });

  return jsonResponse({
    ok: true,
    items,
    balance: user.balance,
    tapValue: user.tapValue || 1,
    boostUntil: user.boostUntil || 0,
    energy: user.energy,
    maxEnergy: user.maxEnergy,
    energyRegen: user.energyRegen || 1
  });
}
