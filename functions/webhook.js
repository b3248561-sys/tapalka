import {
  bt,
  pickLang,
  jsonResponse,
  normalizeReferralCode,
  loadUser,
  saveUser,
  upsertLeaderboardEntry,
  addSeasonPoints
} from "./_shared/utils.js";

const DONATE_BONUS_BY_PACKAGE = {
  support_s: 1800,
  support_m: 6200,
  support_l: 19000
};

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

async function botApi(env, method, payload) {
  const url = `https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

async function answerPreCheckout(env, preCheckoutQuery) {
  if (!preCheckoutQuery?.id) return;
  await botApi(env, "answerPreCheckoutQuery", {
    pre_checkout_query_id: preCheckoutQuery.id,
    ok: true
  });
}

function parseDonatePayload(payloadRaw = "") {
  const text = String(payloadRaw || "").trim();
  const match = /^donate:([a-z0-9_]+):(\d{3,20}):(\d{10,16})$/i.exec(text);
  if (!match) return null;
  return {
    packageId: match[1],
    userId: match[2]
  };
}

async function handleSuccessfulPayment(env, message) {
  const payment = message?.successful_payment;
  const from = message?.from;
  if (!payment || !from?.id) return;
  const payload = parseDonatePayload(payment.invoice_payload);
  if (!payload) return;
  if (String(from.id) !== String(payload.userId)) return;
  const bonus = Number(DONATE_BONUS_BY_PACKAGE[payload.packageId] || 0);
  if (!bonus || bonus <= 0) return;

  const chargeId =
    String(payment.telegram_payment_charge_id || "").trim() ||
    String(payment.provider_payment_charge_id || "").trim();
  const dedupeKey = chargeId ? `donate:paid:${chargeId}` : "";
  if (dedupeKey && env.KV) {
    const done = await env.KV.get(dedupeKey);
    if (done) return;
  }

  const user = await loadUser(
    env,
    String(from.id),
    from.first_name || "Player",
    from.username || "",
    ""
  );
  user.balance = Number(user.balance || 0) + bonus;
  user.totalEarned = Number(user.totalEarned || 0) + bonus;
  addSeasonPoints(user, bonus, Date.now());
  await saveUser(env, user);
  await upsertLeaderboardEntry(env, user);
  if (dedupeKey && env.KV) {
    await env.KV.put(dedupeKey, String(Date.now()), { expirationTtl: 86400 * 365 });
  }

  await botApi(env, "sendMessage", {
    chat_id: message.chat.id,
    text: `Thanks for support! +${bonus} NF credited to your balance.`
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

  if (update?.pre_checkout_query) {
    await answerPreCheckout(env, update.pre_checkout_query);
    return jsonResponse({ ok: true });
  }

  const message = update?.message;
  if (!message?.chat?.id) {
    return jsonResponse({ ok: true });
  }

  if (message.successful_payment) {
    await handleSuccessfulPayment(env, message);
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
