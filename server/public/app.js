const balanceEl = document.getElementById("balance");
const tapBtn = document.getElementById("tap");
const metaEl = document.getElementById("meta");
const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");
const langToggle = document.getElementById("langToggle");

const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
const params = new URLSearchParams(window.location.search);
const demoMode = params.get("demo") === "1";

let initData = "";
let demoUserId = null;
let currentLang = "en";
let metaState = { key: "loading", vars: {} };

const STRINGS = {
  en: {
    title: "Tapalka",
    subtitle: "Tap to earn points",
    tap: "Tap",
    loading: "Loading...",
    demo: "Demo mode",
    player: "Player: {name}",
    niceTap: "Nice tap",
    authError: "Auth error",
    failedLoad: "Failed to load",
    tryAgain: "Try again",
    network: "Network error",
    rateLimited: "Too fast. Slow down."
  },
  ru: {
    title: "Tapalka",
    subtitle: "Тапай и зарабатывай",
    tap: "Тап",
    loading: "Загрузка...",
    demo: "Демо режим",
    player: "Игрок: {name}",
    niceTap: "Хороший тап",
    authError: "Ошибка авторизации",
    failedLoad: "Не удалось загрузить",
    tryAgain: "Попробуй еще",
    network: "Ошибка сети",
    rateLimited: "Слишком быстро. Помедленнее."
  }
};

function normalizeLang(code) {
  if (!code) return "en";
  const lower = String(code).toLowerCase();
  if (lower.startsWith("ru")) return "ru";
  return "en";
}

function t(key, vars = {}) {
  const dict = STRINGS[currentLang] || STRINGS.en;
  let text = dict[key] || STRINGS.en[key] || key;
  Object.entries(vars).forEach(([k, v]) => {
    text = text.replace(`{${k}}`, String(v));
  });
  return text;
}

function applyTexts() {
  if (titleEl) titleEl.textContent = t("title");
  if (subtitleEl) subtitleEl.textContent = t("subtitle");
  if (tapBtn) tapBtn.textContent = t("tap");
  if (langToggle) langToggle.textContent = currentLang.toUpperCase();
  setMeta(metaState.key, metaState.vars);
}

function setMeta(key, vars = {}) {
  metaState = { key, vars };
  metaEl.textContent = t(key, vars);
}

function setMetaText(text) {
  metaState = { key: "custom", vars: {} };
  metaEl.textContent = text;
}

if (tg) {
  tg.ready();
  tg.expand();
  initData = tg.initData || "";
}

const savedLang = localStorage.getItem("lang");
currentLang = normalizeLang(
  savedLang || tg?.initDataUnsafe?.user?.language_code || navigator.language
);
applyTexts();

if (demoMode) {
  demoUserId = localStorage.getItem("demoUserId");
  if (!demoUserId) {
    demoUserId = String(Math.floor(Math.random() * 1000000) + 1);
    localStorage.setItem("demoUserId", demoUserId);
  }
  setMeta("demo");
}

async function apiRequest(path, options = {}) {
  const opts = { ...options, headers: { "Content-Type": "application/json" } };
  let url = path;

  if (demoMode) {
    const body = opts.body ? JSON.parse(opts.body) : {};
    body.demoUserId = demoUserId;
    opts.body = JSON.stringify(body);
  } else if (initData) {
    const body = opts.body ? JSON.parse(opts.body) : {};
    body.initData = initData;
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(url, opts);
  return res.json();
}

async function loadProfile() {
  const query = demoMode
    ? `demoUserId=${encodeURIComponent(demoUserId)}`
    : `initData=${encodeURIComponent(initData)}`;
  const res = await fetch(`/api/me?${query}`);
  return res.json();
}

function updateBalance(value) {
  balanceEl.textContent = String(value);
}

async function init() {
  try {
    const profile = await loadProfile();
    if (!profile.ok) {
      setMetaText(profile.error || t("authError"));
      return;
    }
    setMeta("player", { name: profile.user.name });
    updateBalance(profile.user.balance);
  } catch (err) {
    setMeta("failedLoad");
  }
}

tapBtn.addEventListener("click", async () => {
  tapBtn.disabled = true;
  try {
    const data = await apiRequest("/api/tap", { method: "POST", body: "{}" });
    if (!data.ok) {
      if (data.error === "rate_limited") {
        setMeta("rateLimited");
      } else if (data.error) {
        setMetaText(data.error);
      } else {
        setMeta("tryAgain");
      }
      return;
    }
    updateBalance(data.balance);
    setMeta("niceTap");
  } catch (err) {
    setMeta("network");
  } finally {
    tapBtn.disabled = false;
  }
});

langToggle.addEventListener("click", () => {
  currentLang = currentLang === "ru" ? "en" : "ru";
  localStorage.setItem("lang", currentLang);
  applyTexts();
});

init();
