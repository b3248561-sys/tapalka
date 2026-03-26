import { bt, pickLang, jsonResponse, normalizeReferralCode } from "./_shared/utils.js";

function resolveWebAppUrl(env, startPayload = "") {
  const raw = String(env.WEBAPP_URL || "").trim();
  if (!raw) return "";
  const build =
    String(env.WEBAPP_CACHE_BUSTER || env.CF_PAGES_COMMIT_SHA || "20260325-7").trim() ||
    "20260325-7";
  const referralCode = normalizeReferralCode(startPayload);
  try {
    const url = new URL(raw);
    url.searchParams.set("v", build);
    if (referralCode) {
      url.searchParams.set("ref", referralCode);
    }
    return url.toString();
  } catch {
    const separator = raw.includes("?") ? "&" : "?";
    const referralPart = referralCode
      ? `&ref=${encodeURIComponent(referralCode)}`
      : "";
    return `${raw}${separator}v=${encodeURIComponent(build)}${referralPart}`;
  }
}

async function sendMessage(env, chatId, text, lang, startPayload = "") {
  const webAppUrl = resolveWebAppUrl(env, startPayload);
  const payload = {
    chat_id: chatId,
    text,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: bt(lang, "play"),
            web_app: { url: webAppUrl || env.WEBAPP_URL }
          }
        ]
      ]
    }
  };

  const url = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const expectedSecret = env.TELEGRAM_WEBHOOK_SECRET || "";
  // Safer default: require secret only if it is configured
  // (or explicitly forced via REQUIRE_WEBHOOK_SECRET=1).
  const requireSecret =
    env.REQUIRE_WEBHOOK_SECRET === "1" || Boolean(expectedSecret);
  if (requireSecret) {
    const actualSecret =
      request.headers.get("x-telegram-bot-api-secret-token") || "";
    if (!expectedSecret || actualSecret !== expectedSecret) {
      return jsonResponse({ ok: false, error: "forbidden" }, 403);
    }
  }

  let update = null;
  try {
    update = await request.json();
  } catch {
    return jsonResponse({ ok: true });
  }

  const message = update?.message;
  if (!message?.chat?.id) {
    return jsonResponse({ ok: true });
  }

  const text = message.text || "";
  const lang = pickLang(message.from?.language_code);
  const startPayload = String(
    text.match(/^\/start(?:@\w+)?\s+([^\s]+)$/i)?.[1] || ""
  ).trim();

  if (text.startsWith("/start")) {
    await sendMessage(env, message.chat.id, bt(lang, "start"), lang, startPayload);
  } else if (text.startsWith("/play")) {
    await sendMessage(env, message.chat.id, bt(lang, "playHint"), lang);
  }

  return jsonResponse({ ok: true });
}

export async function onRequest(context) {
  if (context.request.method === "POST") {
    return onRequestPost(context);
  }
  return jsonResponse({ ok: true });
}
