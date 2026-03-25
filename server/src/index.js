import express from "express";
import dotenv from "dotenv";
import crypto from "crypto";
import path from "path";
import { Telegraf, Markup } from "telegraf";
import { updateUser } from "./store.js";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = Number(process.env.PORT || 3000);
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
const ALLOW_INSECURE_DEMO = process.env.ALLOW_INSECURE_DEMO === "1";
const INITDATA_MAX_AGE_SEC = Number(process.env.INITDATA_MAX_AGE_SEC || 300);

if (!BOT_TOKEN) {
  console.error("BOT_TOKEN is required. Set it in .env");
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: "64kb" }));
app.use(express.static(path.join(process.cwd(), "public")));

const RANKS = [
  { id: "bronze", min: 0 },
  { id: "silver", min: 5000 },
  { id: "gold", min: 15000 },
  { id: "platinum", min: 35000 },
  { id: "diamond", min: 80000 },
  { id: "master", min: 160000 }
];

const SHOP_ITEMS = [
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

const DAILY_QUESTS = [
  { id: "tap_50", type: "tap", target: 50, reward: 30 },
  { id: "tap_200", type: "tap", target: 200, reward: 90 },
  { id: "buy_1", type: "buy", target: 1, reward: 120 }
];

function parseInitData(initData) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  params.delete("hash");
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  return { hash, dataCheckString, params };
}

function verifyInitData(initData, botToken, maxAgeSec = 300) {
  if (!initData || !botToken) return false;
  const { hash, dataCheckString, params } = parseInitData(initData);
  if (!hash) return false;
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const hashBuf = Buffer.from(String(hash).toLowerCase(), "hex");
  const hmacBuf = Buffer.from(hmac, "hex");
  if (hashBuf.length !== hmacBuf.length) return false;
  if (!crypto.timingSafeEqual(hashBuf, hmacBuf)) return false;

  const ttl = Number.isFinite(Number(maxAgeSec))
    ? Math.max(0, Math.floor(Number(maxAgeSec)))
    : 300;
  if (ttl === 0) return true;
  const authDateSec = Number(params.get("auth_date"));
  if (!Number.isFinite(authDateSec) || authDateSec <= 0) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  if (authDateSec > nowSec + 30) return false;
  return nowSec - authDateSec <= ttl;
}

function extractUser(initData) {
  const { params } = parseInitData(initData);
  const userRaw = params.get("user");
  if (!userRaw) return null;
  try {
    return JSON.parse(userRaw);
  } catch {
    return null;
  }
}

function getAuthFromRequest(req) {
  const initData =
    req.body?.initData ||
    req.query?.initData ||
    req.headers["x-init-data"];
  const demoUserId = req.body?.demoUserId || req.query?.demoUserId;
  return { initData, demoUserId };
}

function isLocalRequest(req) {
  try {
    const hostHeader = String(req.headers.host || "").split(":")[0].toLowerCase();
    if (hostHeader === "localhost" || hostHeader === "127.0.0.1" || hostHeader === "::1") {
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

async function resolveUser(req, res) {
  const { initData, demoUserId } = getAuthFromRequest(req);

  if (ALLOW_INSECURE_DEMO && isLocalRequest(req) && demoUserId) {
    return { id: String(demoUserId), first_name: "Demo", username: "demo" };
  }

  if (!initData) {
    res.status(401).json({ ok: false, error: "initData missing" });
    return null;
  }

  if (!verifyInitData(initData, BOT_TOKEN, INITDATA_MAX_AGE_SEC)) {
    res.status(401).json({ ok: false, error: "initData invalid" });
    return null;
  }

  const user = extractUser(initData);
  if (!user?.id) {
    res.status(400).json({ ok: false, error: "user missing" });
    return null;
  }

  return user;
}

function computePrice(item, level) {
  if (item.type === "boost") return item.basePrice;
  return Math.round(item.basePrice * Math.pow(item.priceMult || 1.5, level));
}

function getItemLevel(user, itemId) {
  return user.items?.[itemId] || 0;
}

function ensureDaily(user, now = Date.now()) {
  const day = new Date(now).toISOString().slice(0, 10);
  if (user.dailyQuestDay !== day) {
    user.dailyQuestDay = day;
    user.dailyTapCount = 0;
    user.dailyPurchaseCount = 0;
    user.dailyQuestClaims = {};
  }
}

function syncEnergy(user, now = Date.now()) {
  if (typeof user.energy !== "number") user.energy = user.maxEnergy || 50;
  if (!user.lastEnergyTs) {
    user.lastEnergyTs = now;
    return;
  }
  if (user.energy >= user.maxEnergy) {
    if (now - user.lastEnergyTs > 1000) user.lastEnergyTs = now;
    return;
  }
  const elapsedMs = Math.max(0, now - user.lastEnergyTs);
  const regen = Math.floor((elapsedMs / 1000) * (user.energyRegen || 1));
  if (regen > 0) {
    user.energy = Math.min(user.maxEnergy, user.energy + regen);
    user.lastEnergyTs = now;
  }
}

function getDailyQuests(user) {
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

function getRank(totalEarned) {
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
    progress: Math.max(0, Math.min(1, progress))
  };
}

function isBanned(user, now = Date.now()) {
  return Number(user.bannedUntil || 0) > now;
}

function summarizeUser(user) {
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

function applyTapAction(user, count, now) {
  ensureDaily(user, now);
  syncEnergy(user, now);
  if (isBanned(user, now)) {
    return { ok: false, status: 403, error: "banned", bannedUntil: user.bannedUntil || 0 };
  }
  if (user.energy <= 0) {
    return { ok: false, status: 400, error: "no_energy", energy: user.energy, maxEnergy: user.maxEnergy };
  }

  let safeCount = Number(count || 1);
  if (!Number.isFinite(safeCount)) safeCount = 1;
  safeCount = Math.max(1, Math.min(20, Math.floor(safeCount)));
  safeCount = Math.min(safeCount, user.energy);

  const boostActive = user.boostUntil && now < user.boostUntil;
  const multiplier = boostActive ? 2 : 1;
  const earned = (user.tapValue || 1) * safeCount * multiplier;
  user.windowStartTs = now;
  user.windowCount = (user.windowCount || 0) + safeCount;
  user.balance += earned;
  user.totalEarned = (user.totalEarned || 0) + earned;
  user.totalTaps = (user.totalTaps || 0) + safeCount;
  user.dailyTapCount = (user.dailyTapCount || 0) + safeCount;
  user.lastTapTs = now;
  user.energy = Math.max(0, (user.energy || 0) - safeCount);
  user.lastEnergyTs = now;

  return {
    ok: true,
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

function applyBuyAction(user, itemId, now) {
  ensureDaily(user, now);
  syncEnergy(user, now);
  if (isBanned(user, now)) {
    return { ok: false, status: 403, error: "banned", bannedUntil: user.bannedUntil || 0 };
  }
  const item = SHOP_ITEMS.find((candidate) => candidate.id === itemId);
  if (!item) return { ok: false, status: 404, error: "item_not_found" };

  if (item.type === "boost") {
    if (user.boostUntil && now < user.boostUntil) {
      return { ok: false, status: 400, error: "boost_active" };
    }
    const price = computePrice(item, 0);
    if (user.balance < price) return { ok: false, status: 400, error: "not_enough" };
    user.balance -= price;
    user.dailyPurchaseCount = (user.dailyPurchaseCount || 0) + 1;
    user.boostUntil = now + (item.durationMs || 10000);
    return {
      ok: true,
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
  if (level >= item.maxLevel) return { ok: false, status: 400, error: "item_maxed" };
  const price = computePrice(item, level);
  if (user.balance < price) return { ok: false, status: 400, error: "not_enough" };

  user.balance -= price;
  user.items[item.id] = level + 1;
  if (item.type === "upgrade") {
    user.tapValue = (user.tapValue || 1) + (item.tapBonus || 0);
  } else if (item.type === "energy_cap") {
    user.maxEnergy = (user.maxEnergy || 50) + (item.energyBonus || 0);
    user.energy = Math.min(user.maxEnergy, (user.energy || 0) + (item.energyBonus || 0));
    user.lastEnergyTs = now;
  } else if (item.type === "energy_regen") {
    user.energyRegen = (user.energyRegen || 1) + (item.regenBonus || 1);
  }
  user.dailyPurchaseCount = (user.dailyPurchaseCount || 0) + 1;
  return {
    ok: true,
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

function applyDailyAction(user, now) {
  const DAY_MS = 24 * 60 * 60 * 1000;
  ensureDaily(user, now);
  syncEnergy(user, now);
  if (isBanned(user, now)) {
    return { ok: false, status: 403, error: "banned", bannedUntil: user.bannedUntil || 0 };
  }
  const nextAt = (user.lastDailyTs || 0) + DAY_MS;
  if (now < nextAt) return { ok: false, status: 400, error: "daily_not_ready", nextAt };
  const reward = 120 + Math.floor((user.tapValue || 1) * 10);
  user.balance += reward;
  user.totalEarned = (user.totalEarned || 0) + reward;
  user.lastDailyTs = now;
  return {
    ok: true,
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

function applyQuestClaimAction(user, questId, now) {
  ensureDaily(user, now);
  syncEnergy(user, now);
  if (isBanned(user, now)) {
    return { ok: false, status: 403, error: "banned", bannedUntil: user.bannedUntil || 0 };
  }
  const quests = getDailyQuests(user);
  const quest = quests.find((candidate) => candidate.id === questId);
  if (!quest) return { ok: false, status: 404, error: "quest_not_found" };
  if (quest.claimed) return { ok: false, status: 400, error: "quest_claimed" };
  if (quest.progress < quest.target) return { ok: false, status: 400, error: "quest_not_ready" };
  user.balance += quest.reward;
  user.totalEarned = (user.totalEarned || 0) + quest.reward;
  user.dailyQuestClaims[quest.id] = true;
  return {
    ok: true,
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

app.get("/api/health", (req, res) => {
  res.json({ ok: true, status: "up" });
});

app.get("/api/me", async (req, res) => {
  const user = await resolveUser(req, res);
  if (!user) return;
  const now = Date.now();
  const profile = await updateUser(
    String(user.id),
    user.first_name,
    user.username,
    (candidate) => {
      ensureDaily(candidate, now);
      syncEnergy(candidate, now);
    }
  );
  res.json({ ok: true, user: summarizeUser(profile) });
});

app.get("/api/shop", async (req, res) => {
  const user = await resolveUser(req, res);
  if (!user) return;
  const now = Date.now();
  const profile = await updateUser(
    String(user.id),
    user.first_name,
    user.username,
    (candidate) => {
      ensureDaily(candidate, now);
      syncEnergy(candidate, now);
    }
  );
  const items = SHOP_ITEMS.map((item) => {
    const level = getItemLevel(profile, item.id);
    const price = computePrice(item, level);
    if (item.type === "boost") {
      const active = profile.boostUntil && now < profile.boostUntil;
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
        remainingMs: active ? profile.boostUntil - now : 0
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
  res.json({
    ok: true,
    items,
    balance: profile.balance,
    tapValue: profile.tapValue || 1,
    boostUntil: profile.boostUntil || 0,
    energy: profile.energy,
    maxEnergy: profile.maxEnergy,
    energyRegen: profile.energyRegen || 1
  });
});

app.get("/api/quests", async (req, res) => {
  const user = await resolveUser(req, res);
  if (!user) return;
  const now = Date.now();
  const profile = await updateUser(
    String(user.id),
    user.first_name,
    user.username,
    (candidate) => {
      ensureDaily(candidate, now);
      syncEnergy(candidate, now);
    }
  );
  res.json({
    ok: true,
    quests: getDailyQuests(profile),
    balance: profile.balance,
    rank: getRank(profile.totalEarned || 0)
  });
});

app.post("/api/tap", async (req, res) => {
  const user = await resolveUser(req, res);
  if (!user) return;
  let result = null;
  const now = Date.now();
  const profile = await updateUser(
    String(user.id),
    user.first_name,
    user.username,
    (candidate) => {
      result = applyTapAction(candidate, req.body?.count, now);
    }
  );
  if (!result?.ok) {
    return res.status(result?.status || 400).json({
      ok: false,
      error: result?.error || "unknown",
      bannedUntil: result?.bannedUntil,
      nextAt: result?.nextAt,
      energy: profile.energy,
      maxEnergy: profile.maxEnergy
    });
  }
  return res.json(result.payload);
});

app.post("/api/buy", async (req, res) => {
  const user = await resolveUser(req, res);
  if (!user) return;
  let result = null;
  const now = Date.now();
  await updateUser(
    String(user.id),
    user.first_name,
    user.username,
    (candidate) => {
      result = applyBuyAction(candidate, req.body?.itemId, now);
    }
  );
  if (!result?.ok) {
    return res.status(result?.status || 400).json({
      ok: false,
      error: result?.error || "unknown",
      bannedUntil: result?.bannedUntil
    });
  }
  return res.json(result.payload);
});

app.post("/api/daily", async (req, res) => {
  const user = await resolveUser(req, res);
  if (!user) return;
  let result = null;
  const now = Date.now();
  await updateUser(
    String(user.id),
    user.first_name,
    user.username,
    (candidate) => {
      result = applyDailyAction(candidate, now);
    }
  );
  if (!result?.ok) {
    return res.status(result?.status || 400).json({
      ok: false,
      error: result?.error || "unknown",
      bannedUntil: result?.bannedUntil,
      nextAt: result?.nextAt
    });
  }
  return res.json(result.payload);
});

app.post("/api/quest", async (req, res) => {
  const user = await resolveUser(req, res);
  if (!user) return;
  let result = null;
  const now = Date.now();
  await updateUser(
    String(user.id),
    user.first_name,
    user.username,
    (candidate) => {
      result = applyQuestClaimAction(candidate, req.body?.questId, now);
    }
  );
  if (!result?.ok) {
    return res.status(result?.status || 400).json({
      ok: false,
      error: result?.error || "unknown",
      bannedUntil: result?.bannedUntil
    });
  }
  return res.json(result.payload);
});

const bot = new Telegraf(BOT_TOKEN);

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

function pickLang(code) {
  if (!code) return "en";
  return String(code).toLowerCase().startsWith("ru") ? "ru" : "en";
}

function bt(lang, key) {
  return BOT_STRINGS[lang]?.[key] || BOT_STRINGS.en[key] || key;
}

bot.start(async (ctx) => {
  const lang = pickLang(ctx.from?.language_code);
  const keyboard = Markup.inlineKeyboard([
    Markup.button.webApp(bt(lang, "play"), `${PUBLIC_URL}/`)
  ]);
  await ctx.reply(bt(lang, "start"), keyboard);
});

bot.command("play", async (ctx) => {
  const lang = pickLang(ctx.from?.language_code);
  const keyboard = Markup.inlineKeyboard([
    Markup.button.webApp(bt(lang, "play"), `${PUBLIC_URL}/`)
  ]);
  await ctx.reply(bt(lang, "playHint"), keyboard);
});

bot.launch().then(() => {
  console.log("Bot launched");
});

app.listen(PORT, () => {
  console.log(`Server running on ${PUBLIC_URL}`);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
