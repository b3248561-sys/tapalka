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

export async function verifyInitData(initData, botToken) {
  const { hash, dataCheckString } = buildDataCheckString(initData);
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
  return hex === hash;
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

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}

export function userKey(userId) {
  return `user:${userId}`;
}

export async function loadUser(env, userId, name) {
  const key = userKey(userId);
  let user = await env.KV.get(key, "json");
  if (!user) {
    user = {
      id: String(userId),
      name: name || "Player",
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
      windowCount: 0
    };
    await env.KV.put(key, JSON.stringify(user));
  } else if (name && user.name !== name) {
    user.name = name;
    await env.KV.put(key, JSON.stringify(user));
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
  await env.KV.put(userKey(user.id), JSON.stringify(user));
  return user;
}

export const SHOP_ITEMS = [
  {
    id: "gloves",
    basePrice: 120,
    tapBonus: 1,
    maxLevel: 10,
    priceMult: 1.6,
    type: "upgrade"
  },
  {
    id: "energy",
    basePrice: 350,
    tapBonus: 2,
    maxLevel: 8,
    priceMult: 1.65,
    type: "upgrade"
  },
  {
    id: "turbo",
    basePrice: 800,
    tapBonus: 5,
    maxLevel: 6,
    priceMult: 1.8,
    type: "upgrade"
  },
  {
    id: "boost",
    basePrice: 1200,
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
  if (!user.items || typeof user.items !== "object") {
    user.items = {};
    dirty = true;
  }
  if (!user.tapValue || user.tapValue < 1) {
    user.tapValue = 1;
    dirty = true;
  }
  if (!user.boostUntil) {
    user.boostUntil = 0;
    dirty = true;
  }
  if (!user.lastDailyTs) {
    user.lastDailyTs = 0;
    dirty = true;
  }
  if (!user.totalEarned) {
    user.totalEarned = 0;
    dirty = true;
  }
  if (!user.totalTaps) {
    user.totalTaps = 0;
    dirty = true;
  }
  if (!user.dailyQuestDay) {
    user.dailyQuestDay = "";
    dirty = true;
  }
  if (!user.dailyTapCount) {
    user.dailyTapCount = 0;
    dirty = true;
  }
  if (!user.dailyPurchaseCount) {
    user.dailyPurchaseCount = 0;
    dirty = true;
  }
  if (!user.dailyQuestClaims || typeof user.dailyQuestClaims !== "object") {
    user.dailyQuestClaims = {};
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
  { id: "silver", min: 2500 },
  { id: "gold", min: 9000 },
  { id: "platinum", min: 22000 },
  { id: "diamond", min: 50000 },
  { id: "master", min: 100000 }
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

export const DAILY_QUESTS = [
  { id: "tap_50", type: "tap", target: 50, reward: 60 },
  { id: "tap_200", type: "tap", target: 200, reward: 180 },
  { id: "buy_1", type: "buy", target: 1, reward: 140 }
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
