# Tapalka Telegram bot (MVP)

This is a minimal Telegram Web App tapper: a bot opens a web app, and the web app sends tap events to the backend.

## Quick start (local)

1. Go to `server`.
2. Install dependencies.
3. Create `.env` based on `.env.example`.
4. Run the server.

```bash
cd server
npm install
npm run dev
```

## Environment

- `BOT_TOKEN` required (from BotFather)
- `PUBLIC_URL` public HTTPS URL of your server (Telegram requires HTTPS for Web Apps)
- `PORT` server port, default `3000`
- `ALLOW_INSECURE_DEMO=1` for local testing without Telegram (do not use in production)
- `INITDATA_MAX_AGE_SEC` TTL for Telegram `initData` (default `300`, `0` disables TTL check)

## Recommended: Cloudflare Pages + Functions (no tunnels)

This runs the web app and API on Cloudflare, so the URL is stable and HTTPS.

### 1) Create a Pages project

Set build config:
- Build command: empty
- Output directory: `server/public`
- Functions directory: `functions`

### 2) Create a KV namespace

Create a KV namespace and bind it as `KV` for the Pages project.

### 3) Set environment variables

In Pages project settings → Environment variables:
- `BOT_TOKEN` = your bot token
- `WEBAPP_URL` = your Pages URL, for example `https://your-project.pages.dev`
- `ALLOW_INSECURE_DEMO` = `0`
- `INITDATA_MAX_AGE_SEC` = `300`
- `TELEGRAM_WEBHOOK_SECRET` = random secret string
- `REQUIRE_WEBHOOK_SECRET` = `1`

### 4) Set Telegram webhook

Open in browser (replace token and URL):
```
https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=<WEBAPP_URL>/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>
```

### 5) Update BotFather domain

Use `/setdomain` and set the same `WEBAPP_URL`.

## Local demo

1. Set `ALLOW_INSECURE_DEMO=1` in `.env`.
2. Run server.
3. Open `http://localhost:3000/?demo=1`.
4. In production, `?demo=1` is ignored; WebApp must use Telegram `initData`.

## Bot usage

Send `/start` to your bot. It will show a `Play` button that opens the web app.

## Notes

- This MVP stores data in `server/data/db.json`.
- The web app supports RU/EN and auto-detects Telegram language; users can toggle in the UI.
- Add real anti-cheat, energy system, and economy rules before release.
