import express from "express";
import dotenv from "dotenv";
import crypto from "crypto";
import path from "path";
import { Telegraf, Markup } from "telegraf";
import { getUser, updateUser } from "./store.js";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = Number(process.env.PORT || 3000);
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
const ALLOW_INSECURE_DEMO = process.env.ALLOW_INSECURE_DEMO === "1";

if (!BOT_TOKEN) {
  console.error("BOT_TOKEN is required. Set it in .env");
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: "64kb" }));
app.use(express.static(path.join(process.cwd(), "public")));

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

function verifyInitData(initData, botToken) {
  const { hash, dataCheckString } = parseInitData(initData);
  if (!hash) return false;
  const secretKey = crypto.createHash("sha256").update(botToken).digest();
  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");
  return hmac === hash;
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

async function resolveUser(req, res) {
  const { initData, demoUserId } = getAuthFromRequest(req);

  if (ALLOW_INSECURE_DEMO && demoUserId) {
    return { id: String(demoUserId), first_name: "Demo" };
  }

  if (!initData) {
    res.status(401).json({ ok: false, error: "initData missing" });
    return null;
  }

  if (!verifyInitData(initData, BOT_TOKEN)) {
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

app.get("/api/health", (req, res) => {
  res.json({ ok: true, status: "up" });
});

app.get("/api/me", async (req, res) => {
  const user = await resolveUser(req, res);
  if (!user) return;

  const profile = await getUser(String(user.id), user.first_name);
  res.json({
    ok: true,
    user: {
      id: profile.id,
      name: profile.name,
      balance: profile.balance,
      lastTapTs: profile.lastTapTs
    }
  });
});

app.post("/api/tap", async (req, res) => {
  const user = await resolveUser(req, res);
  if (!user) return;

  const now = Date.now();
  const WINDOW_MS = 1000;
  const MAX_TAPS = 12;
  let rateLimited = false;

  const profile = await updateUser(String(user.id), user.first_name, (u) => {
    if (now - u.windowStartTs > WINDOW_MS) {
      u.windowStartTs = now;
      u.windowCount = 0;
    }

    if (u.windowCount >= MAX_TAPS) {
      rateLimited = true;
      return;
    }

    u.windowCount += 1;
    u.balance += 1;
    u.lastTapTs = now;
  });

  if (rateLimited) {
    res.status(429).json({ ok: false, error: "rate_limited" });
    return;
  }

  res.json({
    ok: true,
    balance: profile.balance,
    windowCount: profile.windowCount,
    lastTapTs: profile.lastTapTs
  });
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
