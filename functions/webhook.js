import { bt, pickLang, jsonResponse } from "./_shared/utils.js";

async function sendMessage(env, chatId, text, lang) {
  const payload = {
    chat_id: chatId,
    text,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: bt(lang, "play"),
            web_app: { url: env.WEBAPP_URL }
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

  if (text.startsWith("/start")) {
    await sendMessage(env, message.chat.id, bt(lang, "start"), lang);
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
