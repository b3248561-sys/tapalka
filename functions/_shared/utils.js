function buildDataCheckString(initData) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  params.delete("hash");
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  return { hash, dataCheckString, params };
}

function safeEqualHex(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function parseMaxAgeSec(raw) {
  const value = Number(raw);
  if (!Number.isFinite(value)) return 300;
  if (value < 0) return 0;
  return Math.floor(value);
}

export async function verifyInitData(initData, botToken, maxAgeSec = 300) {
  if (!initData || !botToken) return false;
  const { hash, dataCheckString, params } = buildDataCheckString(initData);
  if (!hash) return false;
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(botToken)
  );
  const hmacKey = await crypto.subtle.importKey(
    "raw",
    secretKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    hmacKey,
    encoder.encode(dataCheckString)
  );
  const bytes = new Uint8Array(sig);
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  if (!safeEqualHex(hex, hash)) return false;

  const ttlSec = parseMaxAgeSec(maxAgeSec);
  if (ttlSec === 0) return true;
  const authDateSec = Number(params.get("auth_date"));
  if (!Number.isFinite(authDateSec) || authDateSec <= 0) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  if (authDateSec > nowSec + 30) return false;
  if (nowSec - authDateSec > ttlSec) return false;
  return true;
}

export function extractUser(initData) {
  const { params } = buildDataCheckString(initData);
  const userRaw = params.get("user");
  if (!userRaw) return null;
  try {
    return JSON.parse(userRaw);
  } catch {
    return null;
  }
}

export function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers
    }
  });
}

export function userKey(userId) {
  return `user:${userId}`;
}

function hasUserDo(env) {
  return env && env.USER_DO;
}

export function hasDurableUserStore(env) {
  return hasUserDo(env);
}

function getUserStub(env, userId) {
  const id = env.USER_DO.idFromName(String(userId));
  return env.USER_DO.get(id);
}

async function userDoRequest(
  env,
  userId,
  action,
  payload = {},
  { allowError = false } = {}
) {
  const stub = getUserStub(env, userId);
  const res = await stub.fetch(`https://user/${action}`, {
    method: "POST",
    body: JSON.stringify({ action, userId: String(userId), ...payload })
  });
  const data = await res.json();
  if (!data.ok && !allowError) {
    const err = new Error(data.error || "user_store_error");
    err.code = data.error || "user_store_error";
    throw err;
  }
  return data;
}

export async function runUserAction(env, userId, action, payload = {}) {
  if (!hasUserDo(env)) {
    throw new Error("user_store_not_configured");
  }
  return userDoRequest(env, userId, action, payload, { allowError: true });
}

export function createUser(userId, name, username = "") {
  return {
    id: String(userId),
    name: name || "Player",
    username: username || "",
    balance: 0,
    tapValue: 1,
    items: {},
    boostUntil: 0,
    lastDailyTs: 0,
    totalEarned: 0,
    totalTaps: 0,
    dailyQuestDay: "",
    dailyTapCount: 0,
    dailyPurchaseCount: 0,
    dailyQuestClaims: {},
    lastTapTs: 0,
    windowStartTs: 0,
    windowCount: 0,
    lastLogTs: 0,
    lastOpenLogTs: 0,
    bannedUntil: 0,
    maxEnergy: 50,
    energy: 50,
    energyRegen: 1,
    lastEnergyTs: Date.now()
  };
}

export async function loadUser(env, userId, name, username) {
  if (hasUserDo(env)) {
    const data = await userDoRequest(env, userId, "get", { name, username });
    return data.user;
  }
  const key = userKey(userId);
  let user = await env.KV.get(key, "json");
  if (!user) {
    user = createUser(userId, name, username);
    await env.KV.put(key, JSON.stringify(user));
  } else {
    let changed = false;
    if (name && user.name !== name) {
      user.name = name;
      changed = true;
    }
    if (username && user.username !== username) {
      user.username = username;
      changed = true;
    }
    if (changed) {
      await env.KV.put(key, JSON.stringify(user));
    }
  }
  const normalized = normalizeUser(user);
  const dailyChanged = ensureDaily(normalized);
  if (normalized._dirty || dailyChanged) {
    delete normalized._dirty;
    await env.KV.put(key, JSON.stringify(normalized));
    user = normalized;
  }
  return user;
}

export async function saveUser(env, user) {
  if (hasUserDo(env)) {
    const data = await userDoRequest(env, user.id, "put", { user });
    return data.user;
  }
  await env.KV.put(userKey(user.id), JSON.stringify(user));
  return user;
}

export async function getUserById(env, userId) {
  if (hasUserDo(env)) {
    const data = await userDoRequest(env, userId, "peek", {}, { allowError: true });
    if (!data.ok && data.error === "not_found") return null;
    if (!data.ok) {
      const err = new Error(data.error || "user_store_error");
      err.code = data.error || "user_store_error";
      throw err;
    }
    return data.user;
  }
  return env.KV.get(userKey(userId), "json");
}

export const SHOP_ITEMS = [
  {
    id: "gloves",
    basePrice: 300,
    tapBonus: 1,
    maxLevel: 10,
    priceMult: 1.75,
    type: "upgrade"
  },
  {
    id: "energy",
    basePrice: 900,
    tapBonus: 2,
    maxLevel: 8,
    priceMult: 1.85,
    type: "upgrade"
  },
  {
    id: "turbo",
    basePrice: 2200,
    tapBonus: 5,
    maxLevel: 6,
    priceMult: 2,
    type: "upgrade"
  },
  {
    id: "cap",
    basePrice: 1200,
    tapBonus: 0,
    maxLevel: 8,
    priceMult: 1.6,
    type: "energy_cap",
    energyBonus: 10
  },
  {
    id: "recharge",
    basePrice: 1800,
    tapBonus: 0,
    maxLevel: 6,
    priceMult: 1.7,
    type: "energy_regen",
    regenBonus: 1
  },
  {
    id: "boost",
    basePrice: 5000,
    tapBonus: 0,
    maxLevel: 0,
    priceMult: 1,
    type: "boost",
    durationMs: 10000
  }
];

export function computePrice(item, level) {
  if (item.type === "boost") return item.basePrice;
  const mult = item.priceMult || 1.5;
  return Math.round(item.basePrice * Math.pow(mult, level));
}

export function getItemLevel(user, itemId) {
  return user.items?.[itemId] || 0;
}

export function normalizeUser(user) {
  let dirty = false;
  if (!user || typeof user !== "object") {
    return createUser("unknown", "Player", "");
  }
  if (!user.name) {
    user.name = "Player";
    dirty = true;
  }
  if (typeof user.username !== "string") {
    user.username = "";
    dirty = true;
  }
  if (!user.items || typeof user.items !== "object") {
    user.items = {};
    dirty = true;
  }
  if (typeof user.tapValue !== "number" || user.tapValue < 1) {
    user.tapValue = 1;
    dirty = true;
  }
  if (typeof user.boostUntil !== "number" || user.boostUntil < 0) {
    user.boostUntil = 0;
    dirty = true;
  }
  if (typeof user.lastDailyTs !== "number" || user.lastDailyTs < 0) {
    user.lastDailyTs = 0;
    dirty = true;
  }
  if (typeof user.totalEarned !== "number" || user.totalEarned < 0) {
    user.totalEarned = 0;
    dirty = true;
  }
  if (typeof user.totalTaps !== "number" || user.totalTaps < 0) {
    user.totalTaps = 0;
    dirty = true;
  }
  if (typeof user.dailyQuestDay !== "string") {
    user.dailyQuestDay = "";
    dirty = true;
  }
  if (typeof user.dailyTapCount !== "number" || user.dailyTapCount < 0) {
    user.dailyTapCount = 0;
    dirty = true;
  }
  if (
    typeof user.dailyPurchaseCount !== "number" ||
    user.dailyPurchaseCount < 0
  ) {
    user.dailyPurchaseCount = 0;
    dirty = true;
  }
  if (!user.dailyQuestClaims || typeof user.dailyQuestClaims !== "object") {
    user.dailyQuestClaims = {};
    dirty = true;
  }
  if (typeof user.lastLogTs !== "number" || user.lastLogTs < 0) {
    user.lastLogTs = 0;
    dirty = true;
  }
  if (typeof user.lastOpenLogTs !== "number" || user.lastOpenLogTs < 0) {
    user.lastOpenLogTs = 0;
    dirty = true;
  }
  if (typeof user.bannedUntil !== "number" || user.bannedUntil < 0) {
    user.bannedUntil = 0;
    dirty = true;
  }
  if (typeof user.maxEnergy !== "number" || user.maxEnergy < 10) {
    user.maxEnergy = 50;
    dirty = true;
  }
  if (typeof user.energyRegen !== "number" || user.energyRegen < 1) {
    user.energyRegen = 1;
    dirty = true;
  }
  if (typeof user.energy !== "number") {
    user.energy = user.maxEnergy;
    dirty = true;
  }
  if (typeof user.lastEnergyTs !== "number" || user.lastEnergyTs <= 0) {
    user.lastEnergyTs = Date.now();
    dirty = true;
  }
  if (typeof user.windowStartTs !== "number" || user.windowStartTs < 0) {
    user.windowStartTs = 0;
    dirty = true;
  }
  if (typeof user.windowCount !== "number" || user.windowCount < 0) {
    user.windowCount = 0;
    dirty = true;
  }
  if (typeof user.balance !== "number" || user.balance < 0) {
    user.balance = 0;
    dirty = true;
  }
  if (typeof user.lastTapTs !== "number" || user.lastTapTs < 0) {
    user.lastTapTs = 0;
    dirty = true;
  }
  if (user.energy > user.maxEnergy) {
    user.energy = user.maxEnergy;
    dirty = true;
  }
  const hasItems = Object.keys(user.items).length > 0;
  if (hasItems && user.tapValue === 1) {
    let tapValue = 1;
    SHOP_ITEMS.forEach((item) => {
      const level = getItemLevel(user, item.id);
      tapValue += level * item.tapBonus;
    });
    user.tapValue = tapValue;
    dirty = true;
  }
  if (dirty) user._dirty = true;
  return user;
}

export const RANKS = [
  { id: "bronze", min: 0 },
  { id: "silver", min: 5000 },
  { id: "gold", min: 15000 },
  { id: "platinum", min: 35000 },
  { id: "diamond", min: 80000 },
  { id: "master", min: 160000 }
];

export function getRank(totalEarned) {
  let current = RANKS[0];
  let next = null;
  for (let i = 0; i < RANKS.length; i += 1) {
    if (totalEarned >= RANKS[i].min) {
      current = RANKS[i];
      next = RANKS[i + 1] || null;
    }
  }
  const progress = next
    ? (totalEarned - current.min) / (next.min - current.min)
    : 1;
  return {
    id: current.id,
    min: current.min,
    nextMin: next ? next.min : null,
    progress: Math.min(1, Math.max(0, progress))
  };
}

export function isBanned(user) {
  if (!user?.bannedUntil) return false;
  return Date.now() < Number(user.bannedUntil);
}

export function syncEnergy(user, now = Date.now()) {
  let changed = false;
  if (typeof user.energy !== "number") {
    user.energy = user.maxEnergy || 50;
    changed = true;
  }
  if (!user.lastEnergyTs) {
    user.lastEnergyTs = now;
    return true;
  }
  if (user.energy >= user.maxEnergy) {
    if (now - user.lastEnergyTs > 1000) {
      user.lastEnergyTs = now;
      changed = true;
    }
    return changed;
  }
  const elapsedMs = Math.max(0, now - user.lastEnergyTs);
  const regen = Math.floor((elapsedMs / 1000) * (user.energyRegen || 1));
  if (regen > 0) {
    user.energy = Math.min(user.maxEnergy, user.energy + regen);
    user.lastEnergyTs = now;
    changed = true;
  }
  return changed;
}

export const DAILY_QUESTS = [
  { id: "tap_50", type: "tap", target: 50, reward: 30 },
  { id: "tap_200", type: "tap", target: 200, reward: 90 },
  { id: "buy_1", type: "buy", target: 1, reward: 120 }
];

export function ensureDaily(user) {
  const day = new Date().toISOString().slice(0, 10);
  if (user.dailyQuestDay !== day) {
    user.dailyQuestDay = day;
    user.dailyTapCount = 0;
    user.dailyPurchaseCount = 0;
    user.dailyQuestClaims = {};
    return true;
  }
  return false;
}

export function getDailyQuests(user) {
  return DAILY_QUESTS.map((q) => {
    const progress =
      q.type === "tap" ? user.dailyTapCount : user.dailyPurchaseCount;
    return {
      id: q.id,
      type: q.type,
      target: q.target,
      progress: Math.min(progress, q.target),
      reward: q.reward,
      claimed: Boolean(user.dailyQuestClaims?.[q.id])
    };
  });
}

export function resolveInitDataMaxAgeSec(env) {
  return parseMaxAgeSec(env?.INITDATA_MAX_AGE_SEC ?? 300);
}

export function summarizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username || "",
    balance: user.balance,
    tapValue: user.tapValue || 1,
    lastTapTs: user.lastTapTs || 0,
    boostUntil: user.boostUntil || 0,
    lastDailyTs: user.lastDailyTs || 0,
    totalEarned: user.totalEarned || 0,
    totalTaps: user.totalTaps || 0,
    energy: user.energy,
    maxEnergy: user.maxEnergy,
    energyRegen: user.energyRegen || 1,
    rank: getRank(user.totalEarned || 0)
  };
}

export function applyTapAction(user, { count = 1, now = Date.now() } = {}) {
  ensureDaily(user);
  syncEnergy(user, now);
  if (isBanned(user)) {
    return {
      ok: false,
      status: 403,
      error: "banned",
      bannedUntil: user.bannedUntil || 0
    };
  }
  if (user.energy <= 0) {
    return {
      ok: false,
      status: 400,
      error: "no_energy",
      energy: user.energy,
      maxEnergy: user.maxEnergy
    };
  }

  let safeCount = Number(count || 1);
  if (!Number.isFinite(safeCount)) safeCount = 1;
  safeCount = Math.max(1, Math.min(20, Math.floor(safeCount)));
  safeCount = Math.min(safeCount, user.energy);

  const boostActive = user.boostUntil && now < user.boostUntil;
  const multiplier = boostActive ? 2 : 1;
  user.windowStartTs = now;
  user.windowCount = (user.windowCount || 0) + safeCount;
  const earned = (user.tapValue || 1) * safeCount * multiplier;
  user.balance += earned;
  user.totalEarned = (user.totalEarned || 0) + earned;
  user.totalTaps = (user.totalTaps || 0) + safeCount;
  user.dailyTapCount = (user.dailyTapCount || 0) + safeCount;
  user.lastTapTs = now;
  user.energy = Math.max(0, (user.energy || 0) - safeCount);
  user.lastEnergyTs = now;
  let shouldLog = false;
  if (!user.lastLogTs || now - user.lastLogTs > 2000) {
    user.lastLogTs = now;
    shouldLog = true;
  }

  return {
    ok: true,
    log: { action: "tap", extra: { count: safeCount, earned, multiplier }, shouldLog },
    payload: {
      ok: true,
      balance: user.balance,
      tapValue: user.tapValue || 1,
      multiplier,
      boostUntil: user.boostUntil || 0,
      energy: user.energy,
      maxEnergy: user.maxEnergy,
      energyRegen: user.energyRegen || 1,
      windowCount: user.windowCount,
      lastTapTs: user.lastTapTs
    }
  };
}

export function applyBuyAction(user, itemId, now = Date.now()) {
  ensureDaily(user);
  syncEnergy(user, now);
  if (isBanned(user)) {
    return {
      ok: false,
      status: 403,
      error: "banned",
      bannedUntil: user.bannedUntil || 0
    };
  }
  if (!itemId) {
    return { ok: false, status: 400, error: "item_missing" };
  }

  const item = SHOP_ITEMS.find((candidate) => candidate.id === itemId);
  if (!item) {
    return { ok: false, status: 404, error: "item_not_found" };
  }

  if (item.type === "boost") {
    if (user.boostUntil && now < user.boostUntil) {
      return { ok: false, status: 400, error: "boost_active" };
    }
    const price = computePrice(item, 0);
    if (user.balance < price) {
      return { ok: false, status: 400, error: "not_enough" };
    }
    user.balance -= price;
    user.dailyPurchaseCount = (user.dailyPurchaseCount || 0) + 1;
    user.boostUntil = now + (item.durationMs || 10000);
    return {
      ok: true,
      log: {
        action: "buy_boost",
        extra: { itemId: item.id, price, durationMs: item.durationMs || 10000 }
      },
      payload: {
        ok: true,
        balance: user.balance,
        tapValue: user.tapValue || 1,
        energy: user.energy,
        maxEnergy: user.maxEnergy,
        energyRegen: user.energyRegen || 1,
        boostUntil: user.boostUntil,
        item: {
          id: item.id,
          price,
          active: true,
          durationMs: item.durationMs || 10000
        }
      }
    };
  }

  const level = getItemLevel(user, item.id);
  if (level >= item.maxLevel) {
    return { ok: false, status: 400, error: "item_maxed" };
  }
  const price = computePrice(item, level);
  if (user.balance < price) {
    return { ok: false, status: 400, error: "not_enough" };
  }

  user.balance -= price;
  user.items[item.id] = level + 1;
  if (item.type === "upgrade") {
    user.tapValue = (user.tapValue || 1) + (item.tapBonus || 0);
  } else if (item.type === "energy_cap") {
    user.maxEnergy = (user.maxEnergy || 50) + (item.energyBonus || 0);
    user.energy = Math.min(
      user.maxEnergy,
      (user.energy || 0) + (item.energyBonus || 0)
    );
    user.lastEnergyTs = now;
  } else if (item.type === "energy_regen") {
    user.energyRegen = (user.energyRegen || 1) + (item.regenBonus || 1);
  }
  user.dailyPurchaseCount = (user.dailyPurchaseCount || 0) + 1;

  return {
    ok: true,
    log: {
      action: "buy_upgrade",
      extra: {
        itemId: item.id,
        level: user.items[item.id],
        price,
        tapBonus: item.tapBonus,
        energyBonus: item.energyBonus,
        regenBonus: item.regenBonus
      }
    },
    payload: {
      ok: true,
      balance: user.balance,
      tapValue: user.tapValue || 1,
      energy: user.energy,
      maxEnergy: user.maxEnergy,
      energyRegen: user.energyRegen || 1,
      item: {
        id: item.id,
        level: user.items[item.id],
        maxLevel: item.maxLevel,
        price: computePrice(item, user.items[item.id]),
        tapBonus: item.tapBonus,
        energyBonus: item.energyBonus,
        regenBonus: item.regenBonus
      }
    }
  };
}

export function applyDailyAction(user, now = Date.now()) {
  const DAY_MS = 24 * 60 * 60 * 1000;
  ensureDaily(user);
  syncEnergy(user, now);
  if (isBanned(user)) {
    return {
      ok: false,
      status: 403,
      error: "banned",
      bannedUntil: user.bannedUntil || 0
    };
  }
  const nextAt = (user.lastDailyTs || 0) + DAY_MS;
  if (now < nextAt) {
    return { ok: false, status: 400, error: "daily_not_ready", nextAt };
  }
  const reward = 120 + Math.floor((user.tapValue || 1) * 10);
  user.balance += reward;
  user.totalEarned = (user.totalEarned || 0) + reward;
  user.lastDailyTs = now;
  return {
    ok: true,
    log: { action: "daily_claim", extra: { reward } },
    payload: {
      ok: true,
      reward,
      balance: user.balance,
      nextAt: now + DAY_MS,
      energy: user.energy,
      maxEnergy: user.maxEnergy,
      energyRegen: user.energyRegen || 1
    }
  };
}

export function applyQuestClaimAction(user, questId, now = Date.now()) {
  ensureDaily(user);
  syncEnergy(user, now);
  if (isBanned(user)) {
    return {
      ok: false,
      status: 403,
      error: "banned",
      bannedUntil: user.bannedUntil || 0
    };
  }
  if (!questId) {
    return { ok: false, status: 400, error: "quest_missing" };
  }
  const quests = getDailyQuests(user);
  const quest = quests.find((candidate) => candidate.id === questId);
  if (!quest) {
    return { ok: false, status: 404, error: "quest_not_found" };
  }
  if (quest.claimed) {
    return { ok: false, status: 400, error: "quest_claimed" };
  }
  if (quest.progress < quest.target) {
    return { ok: false, status: 400, error: "quest_not_ready" };
  }
  user.balance += quest.reward;
  user.totalEarned = (user.totalEarned || 0) + quest.reward;
  user.dailyQuestClaims[quest.id] = true;
  return {
    ok: true,
    log: {
      action: "quest_claim",
      extra: { questId: quest.id, reward: quest.reward }
    },
    payload: {
      ok: true,
      reward: quest.reward,
      balance: user.balance,
      quests: getDailyQuests(user),
      rank: getRank(user.totalEarned || 0),
      energy: user.energy,
      maxEnergy: user.maxEnergy,
      energyRegen: user.energyRegen || 1
    }
  };
}

function toNumberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function applyAdminAdjustAction(user, body = {}, now = Date.now()) {
  if (!user || !user.id) {
    return { ok: false, status: 404, error: "not_found" };
  }

  const changes = {};
  const deltaBalance = toNumberOrNull(body.deltaBalance);
  const setBalance = toNumberOrNull(body.setBalance);
  const setTapValue = toNumberOrNull(body.setTapValue);
  const banMinutes = toNumberOrNull(body.banMinutes);

  if (deltaBalance !== null) {
    user.balance = Math.max(0, (user.balance || 0) + deltaBalance);
    changes.deltaBalance = deltaBalance;
  }
  if (setBalance !== null) {
    user.balance = Math.max(0, setBalance);
    changes.setBalance = setBalance;
  }
  if (setTapValue !== null) {
    user.tapValue = Math.max(1, Math.floor(setTapValue));
    changes.setTapValue = user.tapValue;
  }
  if (banMinutes !== null) {
    if (banMinutes <= 0) {
      user.bannedUntil = 0;
      changes.banMinutes = 0;
    } else {
      user.bannedUntil = now + banMinutes * 60 * 1000;
      changes.banMinutes = banMinutes;
    }
  }

  if (body.resetDaily) {
    const day = new Date(now).toISOString().slice(0, 10);
    user.dailyQuestDay = day;
    user.dailyTapCount = 0;
    user.dailyPurchaseCount = 0;
    user.dailyQuestClaims = {};
    changes.resetDaily = true;
  }

  if (body.clearBoost) {
    user.boostUntil = 0;
    changes.clearBoost = true;
  }

  if (!Object.keys(changes).length) {
    return { ok: false, status: 400, error: "no_changes" };
  }

  return { ok: true, changes };
}

const BOT_STRINGS = {
  en: {
    play: "Play",
    start: "Tap to earn points.",
    playHint: "Open the tapper."
  },
  ru: {
    play: "Играть",
    start: "Тапай и зарабатывай.",
    playHint: "Открой тапалку."
  }
};

export function pickLang(code) {
  if (!code) return "en";
  return String(code).toLowerCase().startsWith("ru") ? "ru" : "en";
}

export function bt(lang, key) {
  return BOT_STRINGS[lang]?.[key] || BOT_STRINGS.en[key] || key;
}
