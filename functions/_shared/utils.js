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
  // Telegram WebApp signature:
  // secret_key = HMAC_SHA256("WebAppData", bot_token)
  // hash = HMAC_SHA256(secret_key, data_check_string)
  const phase1Key = await crypto.subtle.importKey(
    "raw",
    encoder.encode("WebAppData"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const secretKey = await crypto.subtle.sign(
    "HMAC",
    phase1Key,
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
  if (!safeEqualHex(hex, String(hash).toLowerCase())) return false;

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

export function extractStartParam(initData) {
  const { params } = buildDataCheckString(initData);
  return String(params.get("start_param") || "").trim();
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

export const GIFT_CATALOG = [
  { id: "gift_lucky_clover", emoji: "🍀", rarity: "common" },
  { id: "gift_prism_orb", emoji: "🔮", rarity: "rare" },
  { id: "gift_neon_phoenix", emoji: "🔥", rarity: "epic" },
  { id: "gift_cyber_crown", emoji: "👑", rarity: "epic" },
  { id: "gift_star_whale", emoji: "🐋", rarity: "mythic" },
  { id: "gift_solar_dragon", emoji: "🐉", rarity: "mythic" }
];

const GIFT_BY_ID = Object.fromEntries(
  GIFT_CATALOG.map((gift) => [gift.id, gift])
);

const GIFT_RARITY_WEIGHT = {
  common: 1,
  rare: 2,
  epic: 3,
  mythic: 4
};

const CASE_GIFT_POOLS = {
  case_lucky: ["gift_lucky_clover", "gift_prism_orb", "gift_neon_phoenix"],
  case_royal: [
    "gift_prism_orb",
    "gift_neon_phoenix",
    "gift_cyber_crown",
    "gift_star_whale",
    "gift_solar_dragon"
  ]
};

function normalizeGiftRarity(raw) {
  const value = String(raw || "").toLowerCase();
  return GIFT_RARITY_WEIGHT[value] ? value : "common";
}

export function getGiftById(giftId) {
  const id = String(giftId || "").trim();
  const known = GIFT_BY_ID[id];
  if (known) return known;
  return { id, emoji: "🎁", rarity: "common" };
}

export function listUserGifts(user, { limit = 30 } = {}) {
  const gifts = user?.gifts && typeof user.gifts === "object" ? user.gifts : {};
  const list = Object.entries(gifts)
    .map(([id, entry]) => {
      const count = Math.max(0, Math.floor(Number(entry?.count || 0)));
      if (!count) return null;
      const def = getGiftById(id);
      return {
        id,
        emoji: entry?.emoji || def.emoji,
        rarity: normalizeGiftRarity(entry?.rarity || def.rarity),
        count,
        firstReceivedAt: Math.max(0, Number(entry?.firstReceivedAt || 0)),
        lastReceivedAt: Math.max(0, Number(entry?.lastReceivedAt || 0)),
        source: String(entry?.source || "")
      };
    })
    .filter(Boolean);
  list.sort((a, b) => {
    const rarityDiff =
      Number(GIFT_RARITY_WEIGHT[b.rarity] || 0) -
      Number(GIFT_RARITY_WEIGHT[a.rarity] || 0);
    if (rarityDiff !== 0) return rarityDiff;
    const dateDiff = Number(b.lastReceivedAt || 0) - Number(a.lastReceivedAt || 0);
    if (dateDiff !== 0) return dateDiff;
    const countDiff = Number(b.count || 0) - Number(a.count || 0);
    if (countDiff !== 0) return countDiff;
    return String(a.id).localeCompare(String(b.id));
  });
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 30));
  return list.slice(0, safeLimit);
}

export function getUserGiftStats(user) {
  const gifts = user?.gifts && typeof user.gifts === "object" ? user.gifts : {};
  let total = 0;
  let types = 0;
  Object.values(gifts).forEach((entry) => {
    const count = Math.max(0, Math.floor(Number(entry?.count || 0)));
    if (count > 0) {
      total += count;
      types += 1;
    }
  });
  return { total, types };
}

export function grantGift(
  user,
  giftId,
  { count = 1, now = Date.now(), source = "" } = {}
) {
  if (!user || !giftId) return null;
  const id = String(giftId || "").trim();
  if (!id) return null;
  const increment = Math.max(1, Math.min(999, Math.floor(Number(count) || 1)));
  if (!user.gifts || typeof user.gifts !== "object" || Array.isArray(user.gifts)) {
    user.gifts = {};
  }
  const existing = user.gifts[id] || {};
  const def = getGiftById(id);
  const firstReceivedAt = Math.max(
    0,
    Number(existing.firstReceivedAt || existing.lastReceivedAt || now)
  );
  const merged = {
    count: Math.max(
      1,
      Math.min(999999, Math.floor(Number(existing.count || 0)) + increment)
    ),
    rarity: normalizeGiftRarity(existing.rarity || def.rarity),
    emoji: String(existing.emoji || def.emoji || "🎁"),
    firstReceivedAt,
    lastReceivedAt: Math.max(0, Math.floor(Number(now) || Date.now())),
    source: String(source || existing.source || "").slice(0, 80)
  };
  user.gifts[id] = merged;
  return { id, ...merged };
}

async function loadLegacyKvUser(env, userId) {
  if (!env?.KV) return null;
  return env.KV.get(userKey(userId), "json");
}

function applyIdentity(user, name, username, avatarUrl = "") {
  if (name && !user.nameCustomized && user.name !== name) {
    user.name = name;
  }
  if (username && user.username !== username) {
    user.username = username;
  }
  if (avatarUrl && !user.avatarCustomized && user.avatarUrl !== avatarUrl) {
    user.avatarUrl = avatarUrl;
  }
}

async function migrateKvUserToDo(env, userId, name, username, avatarUrl = "") {
  const legacy = await loadLegacyKvUser(env, userId);
  if (!legacy) return null;
  const normalized = normalizeUser(legacy);
  applyIdentity(normalized, name, username, avatarUrl);
  if (normalized._dirty) delete normalized._dirty;
  const data = await userDoRequest(env, userId, "put", { user: normalized });
  return data.user || normalized;
}

export function createUser(userId, name, username = "", avatarUrl = "") {
  const now = Date.now();
  return {
    id: String(userId),
    name: name || "Player",
    username: username || "",
    avatarUrl: avatarUrl || "",
    nameCustomized: false,
    avatarCustomized: false,
    welcomeBonusClaimed: false,
    referredBy: "",
    referralClaimed: false,
    referralsCount: 0,
    referralsEarned: 0,
    comboCount: 0,
    comboMultiplier: 1,
    lastComboTs: 0,
    goldenUntil: 0,
    nextGoldenAt: 0,
    antiCheatScore: 0,
    antiCheatStableCount: 0,
    antiCheatLastInterval: 0,
    antiCheatBlockedUntil: 0,
    antiCheatLastReason: "",
    antiCheatBurstStartTs: 0,
    antiCheatBurstCount: 0,
    antiCheatLastReportTs: 0,
    seasonKey: getSeasonKey(now),
    seasonPoints: 0,
    balance: 0,
    tapValue: 1,
    items: {},
    gifts: {},
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
    equippedCosmetic: "",
    equippedFrame: "",
    leaderboardHidden: false,
    maxEnergy: 50,
    energy: 50,
    energyRegen: 1,
    lastEnergyTs: now
  };
}

export async function loadUser(env, userId, name, username, avatarUrl = "") {
  if (hasUserDo(env)) {
    const peek = await userDoRequest(env, userId, "peek", {}, { allowError: true });
    if (peek.ok) {
      const data = await userDoRequest(env, userId, "get", {
        name,
        username,
        avatarUrl
      });
      const normalized = normalizeUser(data.user);
      const dailyChanged = ensureDaily(normalized);
      const seasonChanged = syncSeason(normalized);
      if (normalized._dirty || dailyChanged || seasonChanged) {
        if (normalized._dirty) delete normalized._dirty;
        const putData = await userDoRequest(env, userId, "put", { user: normalized });
        return putData.user || normalized;
      }
      return normalized;
    }
    if (peek.error === "not_found") {
      const migrated = await migrateKvUserToDo(
        env,
        userId,
        name,
        username,
        avatarUrl
      );
      if (migrated) return migrated;
      const data = await userDoRequest(env, userId, "get", {
        name,
        username,
        avatarUrl
      });
      const normalized = normalizeUser(data.user);
      const dailyChanged = ensureDaily(normalized);
      const seasonChanged = syncSeason(normalized);
      if (normalized._dirty || dailyChanged || seasonChanged) {
        if (normalized._dirty) delete normalized._dirty;
        const putData = await userDoRequest(env, userId, "put", { user: normalized });
        return putData.user || normalized;
      }
      return normalized;
    }
    const err = new Error(peek.error || "user_store_error");
    err.code = peek.error || "user_store_error";
    throw err;
  }
  const key = userKey(userId);
  let user = await env.KV.get(key, "json");
  if (!user) {
    user = createUser(userId, name, username, avatarUrl);
    await env.KV.put(key, JSON.stringify(user));
  } else {
    const before = JSON.stringify({
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl
    });
    applyIdentity(user, name, username, avatarUrl);
    const after = JSON.stringify({
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl
    });
    const changed = before !== after;
    if (changed) {
      await env.KV.put(key, JSON.stringify(user));
    }
  }
  const normalized = normalizeUser(user);
  const dailyChanged = ensureDaily(normalized);
  const seasonChanged = syncSeason(normalized);
  if (normalized._dirty || dailyChanged || seasonChanged) {
    delete normalized._dirty;
    await env.KV.put(key, JSON.stringify(normalized));
    user = normalized;
  }
  return user;
}

export async function saveUser(env, user) {
  syncSeason(user);
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
    if (data.ok) {
      return normalizeUser(data.user);
    }
    if (data.error === "not_found") {
      const migrated = await migrateKvUserToDo(env, userId);
      if (migrated) return migrated;
      return null;
    }
    const err = new Error(data.error || "user_store_error");
    err.code = data.error || "user_store_error";
    throw err;
  }
  return env.KV.get(userKey(userId), "json");
}

const LEADERBOARD_PREFIX = "lb:user:";

function leaderboardKey(userId) {
  return `${LEADERBOARD_PREFIX}${userId}`;
}

export async function upsertLeaderboardEntry(env, user) {
  if (!env?.KV || !user?.id) return;
  syncSeason(user);
  const key = leaderboardKey(user.id);
  if (user.leaderboardHidden) {
    await env.KV.delete(key);
    return;
  }
  const record = {
    id: String(user.id),
    name: user.name || "Player",
    username: user.username || "",
    avatarUrl: user.avatarUrl || "",
    balance: Number(user.balance || 0),
    totalEarned: Number(user.totalEarned || 0),
    totalTaps: Number(user.totalTaps || 0),
    tapValue: Number(user.tapValue || 1),
    seasonKey: String(user.seasonKey || getSeasonKey()),
    seasonPoints: Number(user.seasonPoints || 0),
    equippedFrame: user.equippedFrame || "",
    updatedAt: Date.now()
  };
  await env.KV.put(key, JSON.stringify(record));
}

export async function getLeaderboard(
  env,
  { limit = 50, mode = "season", seasonKey = getSeasonKey() } = {}
) {
  if (!env?.KV) return [];
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 50));
  const safeMode = mode === "alltime" ? "alltime" : "season";
  let cursor = undefined;
  let scanned = 0;
  const rows = [];
  do {
    const list = await env.KV.list({
      prefix: LEADERBOARD_PREFIX,
      limit: 200,
      cursor
    });
    const chunk = await Promise.all(
      list.keys.map((key) => env.KV.get(key.name, "json"))
    );
    chunk.forEach((entry) => {
      if (entry && entry.id) rows.push(entry);
    });
    scanned += list.keys.length;
    cursor = list.list_complete ? undefined : list.cursor;
  } while (cursor && scanned < 2000);

  rows.sort((a, b) => {
    const aSeason =
      String(a.seasonKey || "") === seasonKey ? Number(a.seasonPoints || 0) : 0;
    const bSeason =
      String(b.seasonKey || "") === seasonKey ? Number(b.seasonPoints || 0) : 0;
    if (safeMode === "season") {
      const seasonDiff = bSeason - aSeason;
      if (seasonDiff !== 0) return seasonDiff;
    }
    const balanceDiff = Number(b.balance || 0) - Number(a.balance || 0);
    if (balanceDiff !== 0) return balanceDiff;
    const earnedDiff =
      Number(b.totalEarned || 0) - Number(a.totalEarned || 0);
    if (earnedDiff !== 0) return earnedDiff;
    return String(a.id).localeCompare(String(b.id));
  });

  return rows.slice(0, safeLimit).map((entry, index) => ({
    rank: index + 1,
    id: String(entry.id),
    name: entry.name || "Player",
    username: entry.username || "",
    avatarUrl: entry.avatarUrl || "",
    balance: Number(entry.balance || 0),
    totalEarned: Number(entry.totalEarned || 0),
    totalTaps: Number(entry.totalTaps || 0),
    tapValue: Number(entry.tapValue || 1),
    seasonKey: String(entry.seasonKey || seasonKey),
    seasonPoints:
      String(entry.seasonKey || "") === seasonKey
        ? Number(entry.seasonPoints || 0)
        : 0,
    equippedFrame: entry.equippedFrame || ""
  }));
}

export function getSeasonKey(now = Date.now()) {
  const date = new Date(now);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function getSeasonInfo(now = Date.now()) {
  const date = new Date(now);
  const year = date.getUTCFullYear();
  const monthIndex = date.getUTCMonth();
  const startTs = Date.UTC(year, monthIndex, 1, 0, 0, 0, 0);
  const endTs = Date.UTC(year, monthIndex + 1, 1, 0, 0, 0, 0);
  const key = getSeasonKey(now);
  return {
    key,
    startsAt: startTs,
    endsAt: endTs,
    remainingMs: Math.max(0, endTs - now),
    label: key
  };
}

export function syncSeason(user, now = Date.now()) {
  const key = getSeasonKey(now);
  if (!user.seasonKey) {
    user.seasonKey = key;
    user.seasonPoints = Math.max(0, Number(user.seasonPoints || 0));
    return true;
  }
  if (String(user.seasonKey) !== key) {
    user.seasonKey = key;
    user.seasonPoints = 0;
    return true;
  }
  if (!Number.isFinite(Number(user.seasonPoints)) || Number(user.seasonPoints) < 0) {
    user.seasonPoints = 0;
    return true;
  }
  return false;
}

export function addSeasonPoints(user, amount, now = Date.now()) {
  syncSeason(user, now);
  const value = Number(amount || 0);
  if (!Number.isFinite(value) || value <= 0) return 0;
  const points = Math.max(0, Math.round(value));
  user.seasonPoints = Number(user.seasonPoints || 0) + points;
  return points;
}

export const SHOP_ITEMS = [
  {
    id: "gloves",
    category: "power",
    basePrice: 300,
    tapBonus: 1,
    maxLevel: 10,
    priceMult: 1.75,
    type: "upgrade"
  },
  {
    id: "energy",
    category: "power",
    basePrice: 900,
    tapBonus: 2,
    maxLevel: 8,
    priceMult: 1.85,
    type: "upgrade"
  },
  {
    id: "turbo",
    category: "power",
    basePrice: 2200,
    tapBonus: 5,
    maxLevel: 6,
    priceMult: 2,
    type: "upgrade"
  },
  {
    id: "cap",
    category: "energy",
    basePrice: 1200,
    tapBonus: 0,
    maxLevel: 8,
    priceMult: 1.6,
    type: "energy_cap",
    energyBonus: 10
  },
  {
    id: "recharge",
    category: "energy",
    basePrice: 1800,
    tapBonus: 0,
    maxLevel: 6,
    priceMult: 1.7,
    type: "energy_regen",
    regenBonus: 1
  },
  {
    id: "boost",
    category: "special",
    basePrice: 5000,
    tapBonus: 0,
    maxLevel: 0,
    priceMult: 1,
    type: "boost",
    durationMs: 10000
  },
  {
    id: "crown",
    category: "cosmetic",
    basePrice: 1400,
    tapBonus: 0,
    maxLevel: 1,
    priceMult: 1,
    type: "cosmetic",
    cosmeticStyle: "crown"
  },
  {
    id: "neon",
    category: "cosmetic",
    basePrice: 2200,
    tapBonus: 0,
    maxLevel: 1,
    priceMult: 1,
    type: "cosmetic",
    cosmeticStyle: "neon"
  },
  {
    id: "sakura",
    category: "cosmetic",
    basePrice: 3600,
    tapBonus: 0,
    maxLevel: 1,
    priceMult: 1,
    type: "cosmetic",
    cosmeticStyle: "sakura"
  },
  {
    id: "frame_gold",
    category: "frame",
    basePrice: 4200,
    tapBonus: 0,
    maxLevel: 1,
    priceMult: 1,
    type: "frame",
    frameStyle: "gold"
  },
  {
    id: "frame_neon",
    category: "frame",
    basePrice: 5200,
    tapBonus: 0,
    maxLevel: 1,
    priceMult: 1,
    type: "frame",
    frameStyle: "neon"
  },
  {
    id: "frame_fire",
    category: "frame",
    basePrice: 7000,
    tapBonus: 0,
    maxLevel: 1,
    priceMult: 1,
    type: "frame",
    frameStyle: "fire"
  },
  {
    id: "void",
    category: "cosmetic",
    basePrice: 6400,
    tapBonus: 0,
    maxLevel: 1,
    priceMult: 1,
    type: "cosmetic",
    cosmeticStyle: "void"
  },
  {
    id: "aurora",
    category: "cosmetic",
    basePrice: 9200,
    tapBonus: 0,
    maxLevel: 1,
    priceMult: 1,
    type: "cosmetic",
    cosmeticStyle: "aurora"
  },
  {
    id: "frame_prism",
    category: "frame",
    basePrice: 9800,
    tapBonus: 0,
    maxLevel: 1,
    priceMult: 1,
    type: "frame",
    frameStyle: "prism"
  },
  {
    id: "frame_obsidian",
    category: "frame",
    basePrice: 13200,
    tapBonus: 0,
    maxLevel: 1,
    priceMult: 1,
    type: "frame",
    frameStyle: "obsidian"
  },
  {
    id: "case_lucky",
    category: "special",
    basePrice: 3200,
    tapBonus: 0,
    maxLevel: 0,
    priceMult: 1,
    type: "case"
  },
  {
    id: "case_royal",
    category: "special",
    basePrice: 9200,
    tapBonus: 0,
    maxLevel: 0,
    priceMult: 1,
    type: "case"
  }
];

const CASE_REWARD_POOLS = {
  case_lucky: ["crown", "neon", "frame_gold", "frame_neon"],
  case_royal: [
    "sakura",
    "void",
    "aurora",
    "frame_fire",
    "frame_prism",
    "frame_obsidian"
  ]
};

function pickRandomFromPool(pool = []) {
  if (!pool.length) return "";
  const index = Math.floor(Math.random() * pool.length);
  return pool[index] || "";
}

const ECONOMY_PRICE_MULT = 1.6;

export function computePrice(item, level) {
  if (item.type === "boost") {
    return Math.max(1, Math.round(item.basePrice * ECONOMY_PRICE_MULT));
  }
  const mult = item.priceMult || 1.5;
  return Math.max(
    1,
    Math.round(item.basePrice * Math.pow(mult, level) * ECONOMY_PRICE_MULT)
  );
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
  if (typeof user.avatarUrl !== "string") {
    user.avatarUrl = "";
    dirty = true;
  }
  if (typeof user.nameCustomized !== "boolean") {
    user.nameCustomized = false;
    dirty = true;
  }
  if (typeof user.avatarCustomized !== "boolean") {
    user.avatarCustomized = false;
    dirty = true;
  }
  if (typeof user.welcomeBonusClaimed !== "boolean") {
    user.welcomeBonusClaimed = false;
    dirty = true;
  }
  if (typeof user.referredBy !== "string") {
    user.referredBy = "";
    dirty = true;
  }
  if (typeof user.referralClaimed !== "boolean") {
    user.referralClaimed = false;
    dirty = true;
  }
  if (typeof user.referralsCount !== "number" || user.referralsCount < 0) {
    user.referralsCount = 0;
    dirty = true;
  }
  if (typeof user.referralsEarned !== "number" || user.referralsEarned < 0) {
    user.referralsEarned = 0;
    dirty = true;
  }
  if (typeof user.comboCount !== "number" || user.comboCount < 0) {
    user.comboCount = 0;
    dirty = true;
  }
  if (typeof user.comboMultiplier !== "number" || user.comboMultiplier < 1) {
    user.comboMultiplier = 1;
    dirty = true;
  }
  if (typeof user.lastComboTs !== "number" || user.lastComboTs < 0) {
    user.lastComboTs = 0;
    dirty = true;
  }
  if (typeof user.goldenUntil !== "number" || user.goldenUntil < 0) {
    user.goldenUntil = 0;
    dirty = true;
  }
  if (typeof user.nextGoldenAt !== "number" || user.nextGoldenAt < 0) {
    user.nextGoldenAt = 0;
    dirty = true;
  }
  if (typeof user.antiCheatScore !== "number" || user.antiCheatScore < 0) {
    user.antiCheatScore = 0;
    dirty = true;
  }
  if (
    typeof user.antiCheatStableCount !== "number" ||
    user.antiCheatStableCount < 0
  ) {
    user.antiCheatStableCount = 0;
    dirty = true;
  }
  if (
    typeof user.antiCheatLastInterval !== "number" ||
    user.antiCheatLastInterval < 0
  ) {
    user.antiCheatLastInterval = 0;
    dirty = true;
  }
  if (
    typeof user.antiCheatBlockedUntil !== "number" ||
    user.antiCheatBlockedUntil < 0
  ) {
    user.antiCheatBlockedUntil = 0;
    dirty = true;
  }
  if (typeof user.antiCheatLastReason !== "string") {
    user.antiCheatLastReason = "";
    dirty = true;
  }
  if (
    typeof user.antiCheatBurstStartTs !== "number" ||
    user.antiCheatBurstStartTs < 0
  ) {
    user.antiCheatBurstStartTs = 0;
    dirty = true;
  }
  if (
    typeof user.antiCheatBurstCount !== "number" ||
    user.antiCheatBurstCount < 0
  ) {
    user.antiCheatBurstCount = 0;
    dirty = true;
  }
  if (
    typeof user.antiCheatLastReportTs !== "number" ||
    user.antiCheatLastReportTs < 0
  ) {
    user.antiCheatLastReportTs = 0;
    dirty = true;
  }
  if (typeof user.seasonKey !== "string" || !/^\d{4}-\d{2}$/.test(user.seasonKey)) {
    user.seasonKey = getSeasonKey();
    dirty = true;
  }
  if (typeof user.seasonPoints !== "number" || user.seasonPoints < 0) {
    user.seasonPoints = 0;
    dirty = true;
  }
  const currentSeasonKey = getSeasonKey();
  if (user.seasonKey !== currentSeasonKey) {
    user.seasonKey = currentSeasonKey;
    user.seasonPoints = 0;
    dirty = true;
  }
  if (!user.items || typeof user.items !== "object") {
    user.items = {};
    dirty = true;
  }
  const rawGifts =
    user.gifts && typeof user.gifts === "object" && !Array.isArray(user.gifts)
      ? user.gifts
      : {};
  const beforeGifts = JSON.stringify(rawGifts);
  const normalizedGifts = {};
  Object.entries(rawGifts).forEach(([giftId, giftEntry]) => {
    const id = String(giftId || "").trim();
    if (!id) return;
    const count = Math.max(0, Math.floor(Number(giftEntry?.count || 0)));
    if (!count) return;
    const def = getGiftById(id);
    normalizedGifts[id] = {
      count,
      rarity: normalizeGiftRarity(giftEntry?.rarity || def.rarity),
      emoji: String(giftEntry?.emoji || def.emoji || "🎁"),
      firstReceivedAt: Math.max(
        0,
        Number(giftEntry?.firstReceivedAt || giftEntry?.lastReceivedAt || 0)
      ),
      lastReceivedAt: Math.max(0, Number(giftEntry?.lastReceivedAt || 0)),
      source: String(giftEntry?.source || "").slice(0, 80)
    };
  });
  const afterGifts = JSON.stringify(normalizedGifts);
  if (beforeGifts !== afterGifts || !user.gifts || Array.isArray(user.gifts)) {
    user.gifts = normalizedGifts;
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
  if (typeof user.equippedCosmetic !== "string") {
    user.equippedCosmetic = "";
    dirty = true;
  }
  if (typeof user.equippedFrame !== "string") {
    user.equippedFrame = "";
    dirty = true;
  }
  if (typeof user.leaderboardHidden !== "boolean") {
    user.leaderboardHidden = false;
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
  if (user.equippedCosmetic && !user.items?.[user.equippedCosmetic]) {
    user.equippedCosmetic = "";
    dirty = true;
  }
  if (user.equippedFrame && !user.items?.[user.equippedFrame]) {
    user.equippedFrame = "";
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

export function getRankPoints(user) {
  const balance = Number(user?.balance || 0);
  const totalEarned = Number(user?.totalEarned || 0);
  return Math.max(balance, totalEarned);
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
  { id: "tap_50", type: "tap", target: 50, reward: 90 },
  { id: "tap_200", type: "tap", target: 200, reward: 260 },
  { id: "buy_1", type: "buy", target: 1, reward: 380 }
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

export function isDemoAllowed(env, request) {
  if (env?.ALLOW_INSECURE_DEMO !== "1") return false;
  try {
    const host = new URL(request.url).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

export function summarizeUser(user) {
  const giftStats = getUserGiftStats(user);
  return {
    id: user.id,
    name: user.name,
    username: user.username || "",
    avatarUrl: user.avatarUrl || "",
    nameCustomized: Boolean(user.nameCustomized),
    avatarCustomized: Boolean(user.avatarCustomized),
    welcomeBonusClaimed: Boolean(user.welcomeBonusClaimed),
    referredBy: user.referredBy || "",
    referralClaimed: Boolean(user.referralClaimed),
    referralsCount: Number(user.referralsCount || 0),
    referralsEarned: Number(user.referralsEarned || 0),
    comboCount: Number(user.comboCount || 0),
    comboMultiplier: Number(user.comboMultiplier || 1),
    goldenUntil: Number(user.goldenUntil || 0),
    nextGoldenAt: Number(user.nextGoldenAt || 0),
    balance: user.balance,
    tapValue: user.tapValue || 1,
    lastTapTs: user.lastTapTs || 0,
    boostUntil: user.boostUntil || 0,
    lastDailyTs: user.lastDailyTs || 0,
    totalEarned: user.totalEarned || 0,
    totalTaps: user.totalTaps || 0,
    equippedCosmetic: user.equippedCosmetic || "",
    equippedFrame: user.equippedFrame || "",
    gifts: listUserGifts(user, { limit: 40 }),
    giftStats,
    leaderboardHidden: Boolean(user.leaderboardHidden),
    seasonKey: user.seasonKey || getSeasonKey(),
    seasonPoints: Number(user.seasonPoints || 0),
    energy: user.energy,
    maxEnergy: user.maxEnergy,
    energyRegen: user.energyRegen || 1,
    rank: getRank(getRankPoints(user))
  };
}

export const WELCOME_BONUS = 1800;
export const REFERRAL_NEW_USER_BONUS = 2200;
export const REFERRAL_REFERRER_BONUS = 1200;
const COMBO_WINDOW_MS = 1400;
const GOLDEN_WINDOW_MS = 1800;
const GOLDEN_MULTIPLIER = 4;
const GOLDEN_INTERVAL_MIN_MS = 30000;
const GOLDEN_INTERVAL_MAX_MS = 65000;
const CRIT_CHANCE = 0.08;
const CRIT_MULTIPLIERS = [3, 4, 5];
const ANTICHEAT_MIN_INTERVAL_MS = 35;
const ANTICHEAT_FAST_INTERVAL_MS = 120;
const ANTICHEAT_STABLE_VARIANCE_MS = 6;
const ANTICHEAT_STABLE_INTERVAL_MAX_MS = 220;
const ANTICHEAT_STABLE_WARN_COUNT = 12;
const ANTICHEAT_SCORE_WARN = 8;
const ANTICHEAT_SCORE_BLOCK = 14;
const ANTICHEAT_BLOCK_MS = 120000;
const ANTICHEAT_BURST_WINDOW_MS = 5000;
const ANTICHEAT_BURST_WARN_COUNT = 70;
const ANTICHEAT_BURST_BLOCK_COUNT = 100;
const ANTICHEAT_REPORT_COOLDOWN_MS = 15000;

export function normalizeReferralCode(raw) {
  const text = String(raw || "").trim();
  return /^ref_\d{3,20}$/.test(text) ? text : "";
}

export function applyWelcomeBonus(user) {
  if (!user || user.welcomeBonusClaimed) return 0;
  const now = Date.now();
  syncSeason(user, now);
  user.welcomeBonusClaimed = true;
  user.balance = (user.balance || 0) + WELCOME_BONUS;
  user.totalEarned = (user.totalEarned || 0) + WELCOME_BONUS;
  addSeasonPoints(user, WELCOME_BONUS, now);
  return WELCOME_BONUS;
}

export async function applyReferralBonus(env, user, referralCode) {
  const code = normalizeReferralCode(referralCode);
  if (!code || !user?.id) return { ok: false, reason: "invalid_ref_code" };

  const referrerId = code.slice(4);
  if (String(user.id) === referrerId) {
    return { ok: false, reason: "self_ref" };
  }

  const candidate = normalizeUser(user);
  const now = Date.now();
  syncSeason(candidate, now);
  if (candidate.referralClaimed || candidate.referredBy) {
    return { ok: false, reason: "already_claimed" };
  }

  const referrerRaw = await getUserById(env, referrerId);
  if (!referrerRaw) {
    return { ok: false, reason: "referrer_not_found" };
  }
  const referrer = normalizeUser(referrerRaw);
  syncSeason(referrer, now);

  candidate.referredBy = referrerId;
  candidate.referralClaimed = true;
  candidate.balance = (candidate.balance || 0) + REFERRAL_NEW_USER_BONUS;
  candidate.totalEarned =
    (candidate.totalEarned || 0) + REFERRAL_NEW_USER_BONUS;
  addSeasonPoints(candidate, REFERRAL_NEW_USER_BONUS, now);

  referrer.referralsCount = (referrer.referralsCount || 0) + 1;
  referrer.referralsEarned =
    (referrer.referralsEarned || 0) + REFERRAL_REFERRER_BONUS;
  referrer.balance = (referrer.balance || 0) + REFERRAL_REFERRER_BONUS;
  referrer.totalEarned =
    (referrer.totalEarned || 0) + REFERRAL_REFERRER_BONUS;
  addSeasonPoints(referrer, REFERRAL_REFERRER_BONUS, now);

  await Promise.all([saveUser(env, candidate), saveUser(env, referrer)]);
  await Promise.all([
    upsertLeaderboardEntry(env, candidate),
    upsertLeaderboardEntry(env, referrer)
  ]);

  return {
    ok: true,
    referrerId,
    referrerName: referrer.name || "",
    newUserBonus: REFERRAL_NEW_USER_BONUS,
    referrerBonus: REFERRAL_REFERRER_BONUS
  };
}

function randomBetween(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function resolveComboMultiplier(comboCount) {
  // Slower ramp: players need a longer stable streak to reach high multipliers.
  if (comboCount >= 120) return 2.2;
  if (comboCount >= 85) return 2;
  if (comboCount >= 55) return 1.7;
  if (comboCount >= 30) return 1.4;
  if (comboCount >= 15) return 1.25;
  if (comboCount >= 7) return 1.12;
  return 1;
}

function scheduleNextGolden(now) {
  return now + randomBetween(GOLDEN_INTERVAL_MIN_MS, GOLDEN_INTERVAL_MAX_MS);
}

function evaluateAntiCheat(user, now, safeCount) {
  if (user.antiCheatBlockedUntil && now < user.antiCheatBlockedUntil) {
    return {
      blocked: true,
      reason: "cooldown_active",
      level: "cooldown",
      score: Number(user.antiCheatScore || 0),
      intervalMs: 0,
      stableCount: Number(user.antiCheatStableCount || 0),
      burstCount: Number(user.antiCheatBurstCount || 0),
      blockedUntil: Number(user.antiCheatBlockedUntil || 0)
    };
  }

  let score = Math.max(0, Number(user.antiCheatScore || 0) - 2);
  let stableCount = Number(user.antiCheatStableCount || 0);
  const prevInterval = Number(user.antiCheatLastInterval || 0);
  const prevTapTs = Number(user.lastTapTs || 0);
  const intervalMs = prevTapTs > 0 ? now - prevTapTs : 0;
  let reason = "";

  if (
    !user.antiCheatBurstStartTs ||
    now - user.antiCheatBurstStartTs > ANTICHEAT_BURST_WINDOW_MS
  ) {
    user.antiCheatBurstStartTs = now;
    user.antiCheatBurstCount = safeCount;
  } else {
    user.antiCheatBurstCount = Number(user.antiCheatBurstCount || 0) + safeCount;
  }

  if (user.antiCheatBurstCount >= ANTICHEAT_BURST_BLOCK_COUNT) {
    score += 6;
    reason = "extreme_burst_rate";
  } else if (user.antiCheatBurstCount >= ANTICHEAT_BURST_WARN_COUNT) {
    score += 3;
    reason = "suspicious_burst_rate";
  }

  if (safeCount >= 16) {
    score += 3;
    reason = "large_batch_tap";
  } else if (safeCount >= 12) {
    score += 2;
    reason = "oversized_batch_tap";
  }

  if (intervalMs > 0) {
    if (intervalMs < ANTICHEAT_MIN_INTERVAL_MS) {
      score += 7;
      reason = "too_fast_interval";
    } else {
      const isStable =
        prevInterval > 0 &&
        Math.abs(intervalMs - prevInterval) <= ANTICHEAT_STABLE_VARIANCE_MS &&
        intervalMs <= ANTICHEAT_STABLE_INTERVAL_MAX_MS;
      if (isStable) {
        stableCount += 1;
      } else {
        stableCount = Math.max(0, stableCount - 2);
      }
      if (intervalMs < 70) {
        score += 3;
        if (!reason) reason = "very_fast_repeats";
      } else if (intervalMs < ANTICHEAT_FAST_INTERVAL_MS) {
        score += 2;
        if (!reason) reason = "suspicious_fast_repeats";
      }
      if (stableCount >= ANTICHEAT_STABLE_WARN_COUNT) {
        score += 4;
        reason = "robotic_constant_interval";
      }
      user.antiCheatLastInterval = intervalMs;
    }
  } else {
    stableCount = 0;
    user.antiCheatLastInterval = 0;
  }

  user.antiCheatScore = score;
  user.antiCheatStableCount = stableCount;
  user.antiCheatLastReason = reason || user.antiCheatLastReason || "";

  const shouldReport = Boolean(reason) && score >= ANTICHEAT_SCORE_WARN;
  const hasHardTrigger =
    reason === "too_fast_interval" ||
    reason === "very_fast_repeats" ||
    reason === "extreme_burst_rate" ||
    (intervalMs > 0 && intervalMs < ANTICHEAT_FAST_INTERVAL_MS) ||
    Number(user.antiCheatBurstCount || 0) >= ANTICHEAT_BURST_BLOCK_COUNT;
  if (shouldReport && score >= ANTICHEAT_SCORE_BLOCK && hasHardTrigger) {
    user.antiCheatBlockedUntil = now + ANTICHEAT_BLOCK_MS;
    return {
      blocked: true,
      level: "block",
      reason: reason || "suspicious_pattern",
      score,
      intervalMs,
      stableCount,
      burstCount: Number(user.antiCheatBurstCount || 0),
      blockedUntil: user.antiCheatBlockedUntil
    };
  }

  if (shouldReport) {
    return {
      blocked: false,
      level: "warn",
      reason: reason || "suspicious_pattern",
      score,
      intervalMs,
      stableCount,
      burstCount: Number(user.antiCheatBurstCount || 0),
      blockedUntil: Number(user.antiCheatBlockedUntil || 0)
    };
  }

  return {
    blocked: false,
    level: "ok",
    reason: "",
    score,
    intervalMs,
    stableCount,
    burstCount: Number(user.antiCheatBurstCount || 0),
    blockedUntil: Number(user.antiCheatBlockedUntil || 0)
  };
}

export function applyTapAction(user, { count = 1, now = Date.now() } = {}) {
  ensureDaily(user);
  syncEnergy(user, now);
  syncSeason(user, now);
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

  const antiCheat = evaluateAntiCheat(user, now, safeCount);
  const canReportByCooldown =
    now - Number(user.antiCheatLastReportTs || 0) >= ANTICHEAT_REPORT_COOLDOWN_MS;
  const shouldReportAntiCheat =
    antiCheat.level === "block" ||
    ((antiCheat.level === "warn" || antiCheat.level === "cooldown") &&
      canReportByCooldown);
  const antiCheatReport = shouldReportAntiCheat
    ? {
        level: antiCheat.level,
        reason: antiCheat.reason,
        score: antiCheat.score,
        intervalMs: antiCheat.intervalMs,
        stableCount: antiCheat.stableCount,
        burstCount: antiCheat.burstCount,
        blockedUntil: antiCheat.blockedUntil,
        count: safeCount
      }
    : null;
  if (antiCheatReport) {
    user.antiCheatLastReportTs = now;
  }
  if (antiCheat.blocked) {
    return {
      ok: false,
      status: 429,
      error: "anticheat_blocked",
      blockedUntil: antiCheat.blockedUntil || 0,
      reason: antiCheat.reason || "suspicious_pattern",
      antiCheat: antiCheatReport,
      log: {
        action: "anticheat_blocked",
        extra: antiCheatReport,
        shouldLog: Boolean(antiCheatReport)
      }
    };
  }

  if (!user.nextGoldenAt) {
    user.nextGoldenAt = scheduleNextGolden(now);
  }
  if (user.goldenUntil && now >= user.goldenUntil) {
    user.goldenUntil = 0;
  }
  if (!user.goldenUntil && now >= user.nextGoldenAt) {
    user.goldenUntil = now + GOLDEN_WINDOW_MS;
    user.nextGoldenAt = scheduleNextGolden(now);
  }

  const comboAlive =
    user.lastComboTs && now - user.lastComboTs <= COMBO_WINDOW_MS;
  user.comboCount = comboAlive
    ? Math.min(120, (user.comboCount || 0) + safeCount)
    : safeCount;
  user.lastComboTs = now;
  const comboMultiplier = resolveComboMultiplier(user.comboCount);
  user.comboMultiplier = comboMultiplier;

  const critHit = Math.random() < CRIT_CHANCE;
  const critMultiplier = critHit
    ? CRIT_MULTIPLIERS[randomBetween(0, CRIT_MULTIPLIERS.length - 1)]
    : 1;
  const goldenActive = Boolean(user.goldenUntil && now < user.goldenUntil);
  const goldenMultiplier = goldenActive ? GOLDEN_MULTIPLIER : 1;
  const boostActive = user.boostUntil && now < user.boostUntil;
  const boostMultiplier = boostActive ? 2 : 1;
  const multiplier =
    boostMultiplier * comboMultiplier * critMultiplier * goldenMultiplier;
  user.windowStartTs = now;
  user.windowCount = (user.windowCount || 0) + safeCount;
  const earned = Math.max(
    1,
    Math.round((user.tapValue || 1) * safeCount * multiplier)
  );
  user.balance += earned;
  user.totalEarned = (user.totalEarned || 0) + earned;
  addSeasonPoints(user, earned, now);
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
    log: {
      action: "tap",
      extra: {
        count: safeCount,
        earned,
        multiplier,
        comboCount: user.comboCount || 0,
        critHit,
        goldenActive,
        antiCheat: antiCheatReport
      },
      shouldLog: shouldLog || Boolean(antiCheatReport)
    },
    payload: {
      ok: true,
      balance: user.balance,
      tapValue: user.tapValue || 1,
      multiplier,
      comboCount: user.comboCount || 0,
      comboMultiplier: comboMultiplier,
      critHit,
      critMultiplier,
      goldenActive,
      goldenUntil: user.goldenUntil || 0,
      nextGoldenAt: user.nextGoldenAt || 0,
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
  syncSeason(user, now);
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

  if (item.type === "cosmetic" || item.type === "frame") {
    const isFrame = item.type === "frame";
    const equippedKey = isFrame ? "equippedFrame" : "equippedCosmetic";
    const alreadyEquippedError = isFrame
      ? "frame_already_equipped"
      : "cosmetic_already_equipped";
    const equipAction = isFrame ? "equip_frame" : "equip_cosmetic";
    const buyAction = isFrame ? "buy_frame" : "buy_cosmetic";
    const level = getItemLevel(user, item.id);
    if (level >= 1) {
      if (user[equippedKey] === item.id) {
        return { ok: false, status: 400, error: alreadyEquippedError };
      }
      user[equippedKey] = item.id;
      return {
        ok: true,
        log: {
          action: equipAction,
          extra: { itemId: item.id }
        },
        payload: {
          ok: true,
          balance: user.balance,
          tapValue: user.tapValue || 1,
          energy: user.energy,
          maxEnergy: user.maxEnergy,
          energyRegen: user.energyRegen || 1,
          equippedCosmetic: user.equippedCosmetic || "",
          equippedFrame: user.equippedFrame || "",
          item: {
            id: item.id,
            category: item.category || (isFrame ? "frame" : "cosmetic"),
            type: item.type,
            cosmeticStyle: item.cosmeticStyle || item.id,
            frameStyle: item.frameStyle || item.id,
            level: 1,
            maxLevel: 1,
            price: 0
          }
        }
      };
    }

    const price = computePrice(item, 0);
    if (user.balance < price) {
      return { ok: false, status: 400, error: "not_enough" };
    }
    user.balance -= price;
    user.items[item.id] = 1;
    user[equippedKey] = item.id;
    user.dailyPurchaseCount = (user.dailyPurchaseCount || 0) + 1;
    return {
      ok: true,
      log: {
        action: buyAction,
        extra: { itemId: item.id, price }
      },
      payload: {
        ok: true,
        balance: user.balance,
        tapValue: user.tapValue || 1,
        energy: user.energy,
        maxEnergy: user.maxEnergy,
        energyRegen: user.energyRegen || 1,
        equippedCosmetic: user.equippedCosmetic || "",
        equippedFrame: user.equippedFrame || "",
        item: {
          id: item.id,
          category: item.category || (isFrame ? "frame" : "cosmetic"),
          type: item.type,
          cosmeticStyle: item.cosmeticStyle || item.id,
          frameStyle: item.frameStyle || item.id,
          level: 1,
          maxLevel: 1,
          price: 0
        }
      }
    };
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
        equippedCosmetic: user.equippedCosmetic || "",
        equippedFrame: user.equippedFrame || "",
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

  if (item.type === "case") {
    const price = computePrice(item, 0);
    if (user.balance < price) {
      return { ok: false, status: 400, error: "not_enough" };
    }
    user.balance -= price;
    user.dailyPurchaseCount = (user.dailyPurchaseCount || 0) + 1;

    const roll = Math.random();
    let rarity = "common";
    let multiplier = 1;
    if (item.id === "case_royal") {
      if (roll < 0.02) {
        rarity = "mythic";
        multiplier = 2.6;
      } else if (roll < 0.14) {
        rarity = "epic";
        multiplier = 1.35;
      } else if (roll < 0.5) {
        rarity = "rare";
        multiplier = 0.95;
      } else {
        rarity = "common";
        multiplier = 0.65;
      }
    } else {
      if (roll < 0.01) {
        rarity = "mythic";
        multiplier = 2.2;
      } else if (roll < 0.11) {
        rarity = "epic";
        multiplier = 1.25;
      } else if (roll < 0.46) {
        rarity = "rare";
        multiplier = 0.85;
      } else {
        rarity = "common";
        multiplier = 0.55;
      }
    }

    const nfReward = Math.max(1, Math.round(price * multiplier));
    user.balance += nfReward;
    user.totalEarned = (user.totalEarned || 0) + nfReward;
    addSeasonPoints(user, nfReward, now);

    let unlockedItem = null;
    const unlockChance =
      rarity === "mythic"
        ? 0.98
        : rarity === "epic"
          ? 0.5
          : rarity === "rare"
            ? 0.25
            : 0.1;
    if (Math.random() < unlockChance) {
      const pool = (CASE_REWARD_POOLS[item.id] || []).filter(
        (candidateId) => !Number(user.items?.[candidateId] || 0)
      );
      const itemIdFromPool = pickRandomFromPool(pool);
      const rewardItem = SHOP_ITEMS.find((candidate) => candidate.id === itemIdFromPool);
      if (rewardItem) {
        user.items[itemIdFromPool] = 1;
        if (rewardItem.type === "cosmetic") user.equippedCosmetic = itemIdFromPool;
        if (rewardItem.type === "frame") user.equippedFrame = itemIdFromPool;
        unlockedItem = {
          id: rewardItem.id,
          type: rewardItem.type,
          category: rewardItem.category || "",
          cosmeticStyle: rewardItem.cosmeticStyle || "",
          frameStyle: rewardItem.frameStyle || ""
        };
      }
    }
    let droppedGift = null;
    const giftDropChance =
      rarity === "mythic"
        ? 0.9
        : rarity === "epic"
          ? 0.45
          : rarity === "rare"
            ? 0.22
            : 0.1;
    if (Math.random() < giftDropChance) {
      const giftPool = CASE_GIFT_POOLS[item.id] || [];
      const giftId = pickRandomFromPool(giftPool);
      if (giftId) {
        droppedGift = grantGift(user, giftId, {
          now,
          source: `case:${item.id}:${rarity}`
        });
      }
    }

    return {
      ok: true,
      log: {
        action: "open_case",
        extra: {
          itemId: item.id,
          price,
          nfReward,
          rarity,
          unlockedItemId: unlockedItem?.id || "",
          giftId: droppedGift?.id || ""
        }
      },
      payload: {
        ok: true,
        balance: user.balance,
        tapValue: user.tapValue || 1,
        equippedCosmetic: user.equippedCosmetic || "",
        equippedFrame: user.equippedFrame || "",
        energy: user.energy,
        maxEnergy: user.maxEnergy,
        energyRegen: user.energyRegen || 1,
        caseReward: {
          caseId: item.id,
          price,
          nfReward,
          rarity,
          unlockedItem,
          gift: droppedGift
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
      equippedCosmetic: user.equippedCosmetic || "",
      equippedFrame: user.equippedFrame || "",
      energy: user.energy,
      maxEnergy: user.maxEnergy,
      energyRegen: user.energyRegen || 1,
      item: {
        id: item.id,
        category: item.category || "power",
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
  syncSeason(user, now);
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
  const reward = 300 + Math.floor((user.tapValue || 1) * 25);
  user.balance += reward;
  user.totalEarned = (user.totalEarned || 0) + reward;
  addSeasonPoints(user, reward, now);
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
  syncSeason(user, now);
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
  addSeasonPoints(user, quest.reward, now);
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
      rank: getRank(getRankPoints(user)),
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

  if (body.removeFromLeaderboard) {
    user.leaderboardHidden = true;
    changes.removeFromLeaderboard = true;
  }
  if (body.returnToLeaderboard) {
    user.leaderboardHidden = false;
    changes.returnToLeaderboard = true;
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
    play: "Открыть",
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
