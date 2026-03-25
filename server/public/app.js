const balanceEl = document.getElementById("balance");
const balanceLabelEl = document.getElementById("balanceLabel");
const playerIdEl = document.getElementById("playerId");
const tapBtn = document.getElementById("tap");
const rankEl = document.getElementById("rank");
const rankBarEl = document.getElementById("rankBar");
const energyLabelEl = document.getElementById("energyLabel");
const energyTextEl = document.getElementById("energyText");
const energyBarEl = document.getElementById("energyBar");
const metaEl = document.getElementById("meta");
const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");
const langToggle = document.getElementById("langToggle");
const langMenuEl = document.getElementById("langMenu");
const langDropdownEl = document.getElementById("langDropdown");
const shopTitleEl = document.getElementById("shopTitle");
const shopSubtitleEl = document.getElementById("shopSubtitle");
const shopListEl = document.getElementById("shopList");
const tapValueEl = document.getElementById("tapValue");
const shopBalanceEl = document.getElementById("shopBalance");
const screenTapEl = document.getElementById("screenTap");
const screenShopEl = document.getElementById("screenShop");
const screenLeaderboardEl = document.getElementById("screenLeaderboard");
const tabTapEl = document.getElementById("tabTap");
const tabShopEl = document.getElementById("tabShop");
const tabLeaderboardEl = document.getElementById("tabLeaderboard");
const leaderboardTitleEl = document.getElementById("leaderboardTitle");
const leaderboardSubtitleEl = document.getElementById("leaderboardSubtitle");
const leaderboardListEl = document.getElementById("leaderboardList");
const dailyTitleEl = document.getElementById("dailyTitle");
const dailySubtitleEl = document.getElementById("dailySubtitle");
const dailyBtnEl = document.getElementById("dailyBtn");
const dailyStatusEl = document.getElementById("dailyStatus");
const questsTitleEl = document.getElementById("questsTitle");
const questsSubtitleEl = document.getElementById("questsSubtitle");
const questsListEl = document.getElementById("questsList");
const panelEl = document.querySelector(".panel");

const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
const params = new URLSearchParams(window.location.search);
const demoRequested = params.get("demo") === "1";
const isLocalHost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "::1";
const demoMode = demoRequested && isLocalHost;

let initData = "";
let demoUserId = null;
let currentLang = "en";
let metaState = { key: "loading", vars: {} };
let shopState = [];
let questsState = [];
let leaderboardState = [];
let activeTab = "tap";
let currentUserId = "";
let equippedCosmetic = "";
let tapValue = 1;
let lastTouchAt = 0;
let lastPointerDownAt = 0;
let lastDailyTs = 0;
let boostUntil = 0;
let rankState = null;
let lastQuestSyncAt = 0;
let lastProfileSyncAt = 0;
let lastLeaderboardSyncAt = 0;
let isProfileSyncing = false;
let isLeaderboardSyncing = false;
let energy = 0;
let maxEnergy = 0;
let energyRegen = 1;
let energySyncedAt = Date.now();
let lastTapPoint = null;

const SHOP_CATEGORY_ORDER = ["power", "energy", "cosmetic", "special"];
const PANEL_THEMES = ["theme-crown", "theme-neon", "theme-sakura"];

const STRINGS = {
  en: {
    title: "Tapalka",
    subtitle: "Tap to earn points",
    tap: "Tap",
    loading: "Loading...",
    demo: "Demo mode",
    balanceLabel: "Balance",
    shopTitle: "Shop",
    shopSubtitle: "Build your setup with taps",
    tapValue: "+{value} / tap",
    tabTap: "Tap",
    tabShop: "Shop",
    tabLeaderboard: "Leaderboard",
    leaderboardTitle: "Leaderboard",
    leaderboardSubtitle: "Top players by taps",
    leaderboardEmpty: "Leaderboard is empty",
    leaderboardYou: "You",
    dailyTitle: "Daily Bonus",
    dailySubtitle: "Come back every day",
    dailyClaim: "Claim",
    dailyReady: "Ready",
    dailyNext: "Next in {time}",
    boostActive: "Active {time}",
    questsTitle: "Daily Quests",
    questsSubtitle: "Complete and claim rewards",
    questTap: "Tap {count} times",
    questBuy: "Buy {count} item",
    questClaim: "Claim",
    questClaimed: "Claimed",
    questReward: "+{reward} taps",
    rankLabel: "Rank: {name}",
    rank_bronze: "Bronze",
    rank_silver: "Silver",
    rank_gold: "Gold",
    rank_platinum: "Platinum",
    rank_diamond: "Diamond",
    rank_master: "Master",
    buy: "Buy",
    equip: "Equip",
    equipped: "Equipped",
    owned: "Owned",
    level: "Level {level}/{max}",
    priceTaps: "taps",
    shopCategory_power: "Power",
    shopCategory_energy: "Energy",
    shopCategory_cosmetic: "Cosmetics",
    shopCategory_special: "Special",
    glovesName: "Power Gloves",
    glovesDesc: "+{bonus} tap power",
    energyName: "Energy Drink",
    energyDesc: "+{bonus} tap power",
    turboName: "Turbo Core",
    turboDesc: "+{bonus} tap power",
    capName: "Energy Tank",
    capDesc: "+{bonus} max energy",
    rechargeName: "Recharge Chip",
    rechargeDesc: "+{bonus} energy/sec",
    boostName: "x2 Booster",
    boostDesc: "x2 taps for {seconds}s",
    crownName: "Golden Crown",
    crownDesc: "Royal tap button style",
    neonName: "Neon Pulse",
    neonDesc: "Neon glow for tap panel",
    sakuraName: "Sakura Bloom",
    sakuraDesc: "Soft pink petal vibe",
    player: "Player: {name}",
    niceTap: "Nice tap",
    energyLabel: "Energy",
    energyEmpty: "No energy",
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
    balanceLabel: "Баланс",
    shopTitle: "Магазин",
    shopSubtitle: "Собери лучший набор за тапы",
    tapValue: "+{value} / тап",
    tabTap: "Тап",
    tabShop: "Магазин",
    tabLeaderboard: "Рейтинг",
    leaderboardTitle: "Рейтинг",
    leaderboardSubtitle: "Лучшие игроки по тапам",
    leaderboardEmpty: "Рейтинг пока пуст",
    leaderboardYou: "Ты",
    dailyTitle: "Ежедневный бонус",
    dailySubtitle: "Заходи каждый день",
    dailyClaim: "Забрать",
    dailyReady: "Доступно",
    dailyNext: "Следующий через {time}",
    boostActive: "Активен {time}",
    questsTitle: "Квесты на день",
    questsSubtitle: "Выполняй и забирай награды",
    questTap: "Тапни {count} раз",
    questBuy: "Купи {count} предмет",
    questClaim: "Забрать",
    questClaimed: "Забрано",
    questReward: "+{reward} тапов",
    rankLabel: "Лига: {name}",
    rank_bronze: "Бронза",
    rank_silver: "Серебро",
    rank_gold: "Золото",
    rank_platinum: "Платина",
    rank_diamond: "Алмаз",
    rank_master: "Мастер",
    buy: "Купить",
    equip: "Надеть",
    equipped: "Надето",
    owned: "Куплено",
    level: "Уровень {level}/{max}",
    priceTaps: "тапов",
    shopCategory_power: "Сила тапа",
    shopCategory_energy: "Энергия",
    shopCategory_cosmetic: "Украшения",
    shopCategory_special: "Особое",
    glovesName: "Перчатки силы",
    glovesDesc: "+{bonus} к силе тапа",
    energyName: "Энергетик",
    energyDesc: "+{bonus} к силе тапа",
    turboName: "Турбо ядро",
    turboDesc: "+{bonus} к силе тапа",
    capName: "Энерго-резерв",
    capDesc: "+{bonus} к энергии",
    rechargeName: "Микро заряд",
    rechargeDesc: "+{bonus} энергии/с",
    boostName: "Бустер x2",
    boostDesc: "x2 тапы на {seconds}с",
    crownName: "Золотая корона",
    crownDesc: "Королевский стиль кнопки",
    neonName: "Неоновый импульс",
    neonDesc: "Яркое неоновое свечение",
    sakuraName: "Цветение сакуры",
    sakuraDesc: "Мягкий розовый стиль",
    player: "Игрок: {name}",
    niceTap: "Хороший тап",
    energyLabel: "Энергия",
    energyEmpty: "Нет энергии",
    authError: "Ошибка авторизации",
    failedLoad: "Не удалось загрузить",
    tryAgain: "Попробуй еще",
    network: "Ошибка сети",
    rateLimited: "Слишком быстро. Помедленнее."
  }
};

const LANGS = ["en", "ru", "es", "pt", "tr", "id", "de", "fr"];
const LANG_LABELS = {
  en: "EN",
  ru: "RU",
  es: "ES",
  pt: "PT",
  tr: "TR",
  id: "ID",
  de: "DE",
  fr: "FR"
};
const LANG_META = {
  en: { label: "English", flag: "🇬🇧" },
  ru: { label: "Русский", flag: "🇷🇺" },
  es: { label: "Español", flag: "🇪🇸" },
  pt: { label: "Português", flag: "🇧🇷" },
  tr: { label: "Türkçe", flag: "🇹🇷" },
  id: { label: "Bahasa", flag: "🇮🇩" },
  de: { label: "Deutsch", flag: "🇩🇪" },
  fr: { label: "Français", flag: "🇫🇷" }
};

function normalizeLang(code) {
  if (!code) return "en";
  const lower = String(code).toLowerCase();
  if (lower.startsWith("ru")) return "ru";
  if (lower.startsWith("es")) return "es";
  if (lower.startsWith("pt")) return "pt";
  if (lower.startsWith("tr")) return "tr";
  if (lower.startsWith("id")) return "id";
  if (lower.startsWith("de")) return "de";
  if (lower.startsWith("fr")) return "fr";
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

function setMeta(key, vars = {}) {
  metaState = { key, vars };
  if (!metaEl) return;
  metaEl.textContent = t(key, vars);
  metaEl.classList.toggle("error", key === "energyEmpty" || key === "authError");
}

function setMetaText(text) {
  metaState = { key: "custom", vars: {} };
  if (!metaEl) return;
  metaEl.textContent = text;
  metaEl.classList.add("error");
}

function applyCosmeticTheme() {
  if (!panelEl) return;
  PANEL_THEMES.forEach((theme) => panelEl.classList.remove(theme));
  if (equippedCosmetic === "crown") panelEl.classList.add("theme-crown");
  if (equippedCosmetic === "neon") panelEl.classList.add("theme-neon");
  if (equippedCosmetic === "sakura") panelEl.classList.add("theme-sakura");
}

function applyTexts() {
  if (titleEl) titleEl.textContent = t("title");
  if (subtitleEl) subtitleEl.textContent = t("subtitle");
  if (tapBtn) tapBtn.textContent = t("tap");
  if (balanceLabelEl) balanceLabelEl.textContent = t("balanceLabel");
  if (energyLabelEl) energyLabelEl.textContent = t("energyLabel");
  if (shopTitleEl) shopTitleEl.textContent = t("shopTitle");
  if (shopSubtitleEl) shopSubtitleEl.textContent = t("shopSubtitle");
  if (questsTitleEl) questsTitleEl.textContent = t("questsTitle");
  if (questsSubtitleEl) questsSubtitleEl.textContent = t("questsSubtitle");
  if (dailyTitleEl) dailyTitleEl.textContent = t("dailyTitle");
  if (dailySubtitleEl) dailySubtitleEl.textContent = t("dailySubtitle");
  if (dailyBtnEl) dailyBtnEl.textContent = t("dailyClaim");
  if (leaderboardTitleEl) leaderboardTitleEl.textContent = t("leaderboardTitle");
  if (leaderboardSubtitleEl) leaderboardSubtitleEl.textContent = t("leaderboardSubtitle");
  if (tabTapEl) tabTapEl.textContent = t("tabTap");
  if (tabShopEl) tabShopEl.textContent = t("tabShop");
  if (tabLeaderboardEl) tabLeaderboardEl.textContent = t("tabLeaderboard");
  if (langToggle && LANG_META[currentLang]) {
    langToggle.textContent = `${LANG_META[currentLang].flag} ${LANG_LABELS[currentLang]}`;
  }
  if (tapValueEl) tapValueEl.textContent = t("tapValue", { value: tapValue });
  setMeta(metaState.key, metaState.vars);
  updateRank();
  renderLangMenu();
  renderShop();
  renderQuests();
  renderLeaderboard();
  updateDailyStatus();
}

if (tg) {
  tg.ready();
  tg.expand();
  initData = tg.initData || "";
}

currentLang = normalizeLang(
  localStorage.getItem("lang") || tg?.initDataUnsafe?.user?.language_code || navigator.language
);
applyTexts();

if (demoMode) {
  demoUserId = localStorage.getItem("demoUserId");
  if (!demoUserId) {
    demoUserId = String(Math.floor(Math.random() * 1000000) + 1);
    localStorage.setItem("demoUserId", demoUserId);
  }
  setMeta("demo");
} else if (demoRequested && !isLocalHost) {
  setMeta("authError");
}

async function apiRequest(path, options = {}) {
  const latestInit = tg?.initData || initData || "";
  if (latestInit && latestInit !== initData) initData = latestInit;
  if (!demoMode && !initData) return { ok: false, error: "auth_required" };

  const headers = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  const opts = { ...options, headers: { ...headers, ...(options.headers || {}) } };

  if (demoMode) {
    const body = opts.body ? JSON.parse(opts.body) : {};
    body.demoUserId = demoUserId;
    opts.body = JSON.stringify(body);
  } else {
    const body = opts.body ? JSON.parse(opts.body) : {};
    body.initData = initData;
    opts.body = JSON.stringify(body);
    opts.headers["x-init-data"] = initData;
  }
  const res = await fetch(path, { ...opts, cache: "no-store" });
  return res.json();
}

async function loadProfile() {
  const latestInit = tg?.initData || initData || "";
  if (latestInit && latestInit !== initData) initData = latestInit;
  if (!demoMode && !initData) return { ok: false, error: "auth_required" };

  const headers = {};
  let url = "/api/me";
  if (demoMode) {
    url += `?demoUserId=${encodeURIComponent(demoUserId)}`;
  } else {
    headers["x-init-data"] = initData;
  }
  const res = await fetch(url, { headers, cache: "no-store" });
  return res.json();
}

function updateBalance(value, { bump = true } = {}) {
  if (balanceEl) balanceEl.textContent = String(value);
  if (shopBalanceEl) shopBalanceEl.textContent = String(value);
  if (!bump || !balanceEl) return;
  balanceEl.classList.remove("bump");
  requestAnimationFrame(() => balanceEl.classList.add("bump"));
}

function updateEnergy(value, max, regen) {
  if (typeof value === "number") energy = value;
  if (typeof max === "number") maxEnergy = max;
  if (typeof regen === "number") energyRegen = regen;
  energySyncedAt = Date.now();
  if (energyTextEl) energyTextEl.textContent = `${Math.round(energy)}/${Math.round(maxEnergy)}`;
  if (energyBarEl) {
    const pct = maxEnergy > 0 ? Math.min(100, (energy / maxEnergy) * 100) : 0;
    energyBarEl.style.width = `${pct}%`;
  }
}

function tickEnergy() {
  if (!maxEnergy || !energyRegen || energy >= maxEnergy) return;
  const elapsed = (Date.now() - energySyncedAt) / 1000;
  const regen = Math.floor(elapsed * energyRegen);
  if (regen <= 0) return;
  energy = Math.min(maxEnergy, energy + regen);
  energySyncedAt = Date.now();
  if (energyTextEl) energyTextEl.textContent = `${Math.round(energy)}/${Math.round(maxEnergy)}`;
  if (energyBarEl) energyBarEl.style.width = `${Math.min(100, (energy / maxEnergy) * 100)}%`;
}

function updateTapValue(value) {
  tapValue = value || 1;
  if (tapValueEl) tapValueEl.textContent = t("tapValue", { value: tapValue });
}

function updateRank() {
  if (!rankState || !rankEl || !rankBarEl) return;
  rankEl.textContent = t("rankLabel", { name: t(`rank_${rankState.id}`) });
  rankBarEl.style.width = `${Math.round((rankState.progress || 0) * 100)}%`;
}

function formatTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function updateDailyStatus() {
  if (!dailyStatusEl || !dailyBtnEl) return;
  const nextAt = (lastDailyTs || 0) + 24 * 60 * 60 * 1000;
  if (Date.now() >= nextAt) {
    dailyStatusEl.textContent = t("dailyReady");
    dailyBtnEl.disabled = false;
  } else {
    dailyStatusEl.textContent = t("dailyNext", { time: formatTime(nextAt - Date.now()) });
    dailyBtnEl.disabled = true;
  }
}

function setActiveTab(tab) {
  activeTab = tab;
  if (screenTapEl) screenTapEl.classList.toggle("active", tab === "tap");
  if (screenShopEl) screenShopEl.classList.toggle("active", tab === "shop");
  if (screenLeaderboardEl) screenLeaderboardEl.classList.toggle("active", tab === "leaderboard");
  if (tabTapEl) tabTapEl.classList.toggle("active", tab === "tap");
  if (tabShopEl) tabShopEl.classList.toggle("active", tab === "shop");
  if (tabLeaderboardEl) tabLeaderboardEl.classList.toggle("active", tab === "leaderboard");
  if (tab === "leaderboard") loadLeaderboard({ force: true, silent: true });
}

function renderSkeletons() {
  const skeleton = '<div class="skeleton-card"></div>';
  if (shopListEl) shopListEl.innerHTML = skeleton.repeat(4);
  if (questsListEl) questsListEl.innerHTML = skeleton.repeat(2);
  if (leaderboardListEl) leaderboardListEl.innerHTML = skeleton.repeat(4);
}

function setLoadingState(isLoading) {
  document.body.classList.toggle("loading", isLoading);
  if (isLoading) renderSkeletons();
}

function renderShop() {
  if (!shopListEl || !shopState.length) return;
  shopListEl.innerHTML = "";
  const grouped = new Map();
  SHOP_CATEGORY_ORDER.forEach((category) => grouped.set(category, []));
  shopState.forEach((item) => {
    const category = item.category || "power";
    if (!grouped.has(category)) grouped.set(category, []);
    grouped.get(category).push(item);
  });

  grouped.forEach((items, category) => {
    if (!items.length) return;
    const section = document.createElement("section");
    section.className = "shop-section";

    const head = document.createElement("div");
    head.className = "shop-section-head";
    const headTitle = document.createElement("h3");
    headTitle.textContent = t(`shopCategory_${category}`);
    head.appendChild(headTitle);

    const grid = document.createElement("div");
    grid.className = "shop-grid";

    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = `shop-item category-${item.category || "power"}`;
      if (item.type === "cosmetic" && equippedCosmetic === item.id) card.classList.add("equipped");

      const top = document.createElement("div");
      top.className = "shop-item-top";
      const itemTitle = document.createElement("h4");
      itemTitle.textContent = t(`${item.id}Name`);
      const desc = document.createElement("p");
      if (item.type === "boost") {
        desc.textContent = t("boostDesc", { seconds: Math.floor((item.durationMs || 10000) / 1000) });
      } else if (item.type === "cosmetic") {
        desc.textContent = t(`${item.id}Desc`);
      } else {
        const bonus =
          item.type === "energy_cap"
            ? item.energyBonus
            : item.type === "energy_regen"
            ? item.regenBonus
            : item.tapBonus;
        desc.textContent = t(`${item.id}Desc`, { bonus });
      }
      top.append(itemTitle, desc);

      const meta = document.createElement("div");
      meta.className = "shop-meta";
      const leftMeta = document.createElement("span");
      const rightMeta = document.createElement("span");

      const btn = document.createElement("button");
      btn.className = "shop-buy";

      if (item.type === "boost") {
        const active = boostUntil && Date.now() < boostUntil;
        leftMeta.textContent = t("boostName");
        rightMeta.textContent = active
          ? t("boostActive", { time: formatTime(boostUntil - Date.now()) })
          : `${item.price} ${t("priceTaps")}`;
        btn.textContent = active ? t("boostActive", { time: formatTime(boostUntil - Date.now()) }) : t("buy");
        btn.disabled = active;
      } else if (item.type === "cosmetic") {
        const owned = Number(item.level || 0) >= 1;
        const isEquipped = owned && item.id === equippedCosmetic;
        leftMeta.textContent = owned ? t("owned") : t("level", { level: 0, max: 1 });
        rightMeta.textContent = owned
          ? isEquipped
            ? t("equipped")
            : t("equip")
          : `${item.price} ${t("priceTaps")}`;
        btn.textContent = owned ? (isEquipped ? t("equipped") : t("equip")) : t("buy");
        btn.disabled = isEquipped;
      } else {
        leftMeta.textContent = t("level", { level: item.level, max: item.maxLevel });
        rightMeta.textContent = item.level >= item.maxLevel ? t("owned") : `${item.price} ${t("priceTaps")}`;
        btn.textContent = item.level >= item.maxLevel ? t("owned") : t("buy");
        btn.disabled = item.level >= item.maxLevel;
      }
      meta.append(leftMeta, rightMeta);

      btn.addEventListener("click", async () => {
        btn.disabled = true;
        try {
          const data = await apiRequest("/api/buy", {
            method: "POST",
            body: JSON.stringify({ itemId: item.id })
          });
          if (!data.ok) {
            if (["auth_required", "initData missing", "initData invalid", "user missing"].includes(data.error)) {
              setMeta("authError");
            } else if (data.error === "cosmetic_already_equipped") {
              setMeta("equipped");
            } else {
              setMetaText(data.error || t("tryAgain"));
            }
            return;
          }
          updateBalance(data.balance);
          updateTapValue(data.tapValue);
          if (typeof data.boostUntil === "number") boostUntil = data.boostUntil;
          if (typeof data.equippedCosmetic === "string") {
            equippedCosmetic = data.equippedCosmetic;
            applyCosmeticTheme();
          }
          await loadShop();
          if (activeTab === "leaderboard") loadLeaderboard({ force: true, silent: true });
        } catch {
          setMeta("network");
        } finally {
          btn.disabled = false;
        }
      });

      card.append(top, meta, btn);
      grid.appendChild(card);
    });

    section.append(head, grid);
    shopListEl.appendChild(section);
  });
}

function renderQuests() {
  if (!questsListEl || !questsState.length) return;
  questsListEl.innerHTML = "";
  questsState.forEach((quest) => {
    const row = document.createElement("div");
    row.className = "quest-item";

    const left = document.createElement("div");
    const title = document.createElement("h4");
    title.textContent = quest.type === "tap" ? t("questTap", { count: quest.target }) : t("questBuy", { count: quest.target });
    const desc = document.createElement("p");
    desc.textContent = t("questReward", { reward: quest.reward });
    const meta = document.createElement("div");
    meta.className = "quest-meta";
    const progress = document.createElement("span");
    progress.textContent = `${quest.progress}/${quest.target}`;
    meta.appendChild(progress);
    left.append(title, desc, meta);

    const btn = document.createElement("button");
    btn.className = "quest-claim";
    btn.textContent = quest.claimed ? t("questClaimed") : t("questClaim");
    btn.disabled = quest.claimed || quest.progress < quest.target;
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      try {
        const data = await apiRequest("/api/quest", {
          method: "POST",
          body: JSON.stringify({ questId: quest.id })
        });
        if (!data.ok) {
          if (["auth_required", "initData missing", "initData invalid", "user missing"].includes(data.error)) {
            setMeta("authError");
          } else {
            setMetaText(data.error || t("tryAgain"));
          }
          return;
        }
        updateBalance(data.balance);
        if (typeof data.energy === "number") updateEnergy(data.energy, data.maxEnergy, data.energyRegen);
        rankState = data.rank || rankState;
        questsState = data.quests || questsState;
        updateRank();
        renderQuests();
      } catch {
        setMeta("network");
      } finally {
        btn.disabled = false;
      }
    });

    row.append(left, btn);
    questsListEl.appendChild(row);
  });
}

function renderLeaderboard() {
  if (!leaderboardListEl) return;
  if (!leaderboardState.length) {
    leaderboardListEl.innerHTML = `<div class="leaderboard-empty">${t("leaderboardEmpty")}</div>`;
    return;
  }
  leaderboardListEl.innerHTML = "";
  leaderboardState.forEach((player) => {
    const row = document.createElement("div");
    row.className = "leader-row";
    if (String(player.id) === String(currentUserId)) row.classList.add("is-you");

    const rank = document.createElement("div");
    rank.className = "leader-rank";
    rank.textContent = `#${player.rank}`;

    const info = document.createElement("div");
    info.className = "leader-info";
    const name = document.createElement("div");
    name.className = "leader-name";
    const label = player.username ? `@${player.username}` : player.name || `ID ${player.id}`;
    name.textContent = String(player.id) === String(currentUserId) ? `${label} (${t("leaderboardYou")})` : label;
    const sub = document.createElement("div");
    sub.className = "leader-sub";
    sub.textContent = `ID ${player.id} • +${player.tapValue || 1}/tap`;
    info.append(name, sub);

    const value = document.createElement("div");
    value.className = "leader-value";
    value.textContent = String(player.balance || 0);

    row.append(rank, info, value);
    leaderboardListEl.appendChild(row);
  });
}

async function loadShop() {
  const latestInit = tg?.initData || initData || "";
  if (latestInit && latestInit !== initData) initData = latestInit;
  if (!demoMode && !initData) return;

  const headers = {};
  let url = "/api/shop";
  if (demoMode) {
    url += `?demoUserId=${encodeURIComponent(demoUserId)}`;
  } else {
    headers["x-init-data"] = initData;
  }
  const res = await fetch(url, { headers, cache: "no-store" });
  const data = await res.json();
  if (!data.ok) return;
  shopState = data.items || [];
  updateTapValue(data.tapValue || 1);
  if (typeof data.energy === "number") updateEnergy(data.energy, data.maxEnergy, data.energyRegen);
  if (typeof data.equippedCosmetic === "string") {
    equippedCosmetic = data.equippedCosmetic;
    applyCosmeticTheme();
  }
  boostUntil = data.boostUntil || 0;
  renderShop();
}

async function loadQuests({ silent = false } = {}) {
  const latestInit = tg?.initData || initData || "";
  if (latestInit && latestInit !== initData) initData = latestInit;
  if (!demoMode && !initData) return;

  const headers = {};
  let url = "/api/quests";
  if (demoMode) {
    url += `?demoUserId=${encodeURIComponent(demoUserId)}`;
  } else {
    headers["x-init-data"] = initData;
  }
  try {
    const res = await fetch(url, { headers, cache: "no-store" });
    const data = await res.json();
    if (!data.ok) return;
    questsState = data.quests || [];
    if (data.rank) rankState = data.rank;
    updateRank();
    renderQuests();
  } catch {
    if (!silent) setMeta("network");
  }
}

async function loadLeaderboard({ force = false, silent = false } = {}) {
  if (!force && Date.now() - lastLeaderboardSyncAt < 7000) return;
  if (isLeaderboardSyncing) return;
  const latestInit = tg?.initData || initData || "";
  if (latestInit && latestInit !== initData) initData = latestInit;
  if (!demoMode && !initData) return;

  isLeaderboardSyncing = true;
  const headers = {};
  let url = "/api/leaderboard?limit=50";
  if (demoMode) {
    url += `&demoUserId=${encodeURIComponent(demoUserId)}`;
  } else {
    headers["x-init-data"] = initData;
  }
  try {
    const res = await fetch(url, { headers, cache: "no-store" });
    const data = await res.json();
    if (!data.ok) return;
    leaderboardState = data.players || [];
    if (data.currentUserId) currentUserId = String(data.currentUserId);
    renderLeaderboard();
    lastLeaderboardSyncAt = Date.now();
  } catch {
    if (!silent) setMeta("network");
  } finally {
    isLeaderboardSyncing = false;
  }
}

async function init() {
  setLoadingState(true);
  try {
    const profile = await loadProfile();
    if (!profile.ok) {
      if (["auth_required", "initData missing", "initData invalid", "user missing"].includes(profile.error)) {
        if (tapBtn) tapBtn.disabled = true;
        setMeta("authError");
      } else {
        setMetaText(profile.error || t("authError"));
      }
      return;
    }

    setMeta("player", { name: profile.user.name });
    currentUserId = String(profile.user.id || "");
    updateBalance(profile.user.balance);
    updateTapValue(profile.user.tapValue || 1);
    if (playerIdEl) {
      const username = profile.user.username ? `@${profile.user.username}` : "";
      playerIdEl.textContent = username ? `${username} · ID ${profile.user.id}` : `ID ${profile.user.id}`;
    }
    lastDailyTs = profile.user.lastDailyTs || 0;
    boostUntil = profile.user.boostUntil || 0;
    rankState = profile.user.rank || null;
    if (typeof profile.user.equippedCosmetic === "string") {
      equippedCosmetic = profile.user.equippedCosmetic;
      applyCosmeticTheme();
    }
    updateEnergy(profile.user.energy, profile.user.maxEnergy, profile.user.energyRegen);
    updateDailyStatus();
    await loadShop();
    await loadQuests();
    await loadLeaderboard({ force: true, silent: true });
  } catch {
    setMeta("failedLoad");
  } finally {
    setLoadingState(false);
  }
}

async function syncProfileSilently({ force = false } = {}) {
  const now = Date.now();
  if (!force && document.visibilityState === "hidden") return;
  if (!force && now - lastProfileSyncAt < 1000) return;
  if (isProfileSyncing) return;
  isProfileSyncing = true;
  try {
    const profile = await loadProfile();
    if (!profile?.ok || !profile.user) return;
    updateBalance(profile.user.balance, { bump: false });
    updateTapValue(profile.user.tapValue || 1);
    rankState = profile.user.rank || rankState;
    updateRank();
    if (typeof profile.user.energy === "number") {
      updateEnergy(profile.user.energy, profile.user.maxEnergy, profile.user.energyRegen);
    }
    if (typeof profile.user.equippedCosmetic === "string") {
      equippedCosmetic = profile.user.equippedCosmetic;
      applyCosmeticTheme();
    }
    lastDailyTs = profile.user.lastDailyTs || lastDailyTs || 0;
    boostUntil = profile.user.boostUntil || 0;
    updateDailyStatus();
    lastProfileSyncAt = now;
  } catch {
    // silent
  } finally {
    isProfileSyncing = false;
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    syncProfileSilently({ force: true });
    loadLeaderboard({ force: true, silent: true });
  }
});

window.addEventListener("focus", () => {
  syncProfileSilently({ force: true });
  loadLeaderboard({ force: true, silent: true });
});

if (tapBtn) {
  tapBtn.addEventListener("click", async () => {
    const now = Date.now();
    if (now - lastTouchAt < 300) return;
    if (now - lastPointerDownAt < 300) return;
    await sendTap(1, lastTapPoint);
  });
  tapBtn.addEventListener(
    "touchstart",
    async (event) => {
      lastTouchAt = Date.now();
      const count = Math.max(1, event.touches?.length || 1);
      if (event.touches && event.touches[0]) {
        lastTapPoint = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      }
      event.preventDefault();
      await sendTap(count, lastTapPoint);
    },
    { passive: false }
  );
  tapBtn.addEventListener("pointerdown", async (event) => {
    if (event.pointerType === "touch") return;
    lastPointerDownAt = Date.now();
    lastTapPoint = { x: event.clientX, y: event.clientY };
    await sendTap(1, lastTapPoint);
  });
}

if (langToggle) {
  langToggle.addEventListener("click", () => {
    if (!langMenuEl) return;
    const open = langMenuEl.classList.toggle("open");
    langToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

if (tabTapEl) tabTapEl.addEventListener("click", () => setActiveTab("tap"));
if (tabShopEl) tabShopEl.addEventListener("click", () => setActiveTab("shop"));
if (tabLeaderboardEl) tabLeaderboardEl.addEventListener("click", () => setActiveTab("leaderboard"));
setActiveTab("tap");

document.addEventListener("click", (event) => {
  if (!langMenuEl) return;
  if (langMenuEl.contains(event.target)) return;
  langMenuEl.classList.remove("open");
  if (langToggle) langToggle.setAttribute("aria-expanded", "false");
});

if (dailyBtnEl) {
  dailyBtnEl.addEventListener("click", async () => {
    dailyBtnEl.disabled = true;
    try {
      const data = await apiRequest("/api/daily", { method: "POST", body: "{}" });
      if (!data.ok) {
        if (["auth_required", "initData missing", "initData invalid", "user missing"].includes(data.error)) {
          setMeta("authError");
          return;
        }
        if (data.error === "daily_not_ready" && data.nextAt) {
          lastDailyTs = data.nextAt - 24 * 60 * 60 * 1000;
          updateDailyStatus();
        }
        return;
      }
      updateBalance(data.balance);
      if (typeof data.energy === "number") updateEnergy(data.energy, data.maxEnergy, data.energyRegen);
      lastDailyTs = Date.now();
      updateDailyStatus();
    } catch {
      setMeta("network");
    } finally {
      updateDailyStatus();
    }
  });
}

async function sendTap(count = 1, point = null) {
  if (!demoMode && !initData) {
    setMeta("authError");
    return;
  }
  if (!demoMode && energy <= 0) {
    setMeta("energyEmpty");
    return;
  }
  try {
    const data = await apiRequest("/api/tap", {
      method: "POST",
      body: JSON.stringify({ count })
    });
    if (!data.ok) {
      if (data.error === "rate_limited") {
        setMeta("rateLimited");
      } else if (data.error === "no_energy") {
        setMeta("energyEmpty");
      } else if (["auth_required", "initData missing", "initData invalid", "user missing"].includes(data.error)) {
        setMeta("authError");
      } else if (data.error) {
        setMetaText(data.error);
      } else {
        setMeta("tryAgain");
      }
      return;
    }
    updateBalance(data.balance);
    if (data.tapValue) updateTapValue(data.tapValue);
    if (typeof data.energy === "number") updateEnergy(data.energy, data.maxEnergy, data.energyRegen);
    if (typeof data.boostUntil === "number") boostUntil = data.boostUntil;
    setMeta("niceTap");
    const mult = data.multiplier || 1;
    showSpark(`+${(data.tapValue || 1) * count * mult}`, point);
    if (tg?.HapticFeedback?.impactOccurred) {
      tg.HapticFeedback.impactOccurred("light");
    } else if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    if (Date.now() - lastQuestSyncAt > 1000) {
      lastQuestSyncAt = Date.now();
      loadQuests({ silent: true });
    }
    if (activeTab === "leaderboard") loadLeaderboard({ force: true, silent: true });
  } catch {
    setMeta("network");
  }
}

function showSpark(text, point = null) {
  if (!panelEl) return;
  const spark = document.createElement("div");
  spark.className = "spark";
  spark.textContent = text;
  const rect = panelEl.getBoundingClientRect();
  if (point && point.x && point.y) {
    const x = Math.min(Math.max(point.x - rect.left, 20), rect.width - 20);
    const y = Math.min(Math.max(point.y - rect.top, 30), rect.height - 80);
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
  } else {
    spark.style.left = `${40 + Math.random() * (panelEl.clientWidth - 80)}px`;
    spark.style.top = `${40 + Math.random() * 60}px`;
  }
  panelEl.appendChild(spark);
  setTimeout(() => spark.remove(), 800);
}

function renderLangMenu() {
  if (!langDropdownEl) return;
  langDropdownEl.innerHTML = "";
  LANGS.forEach((code) => {
    const option = document.createElement("div");
    option.className = "lang-option";
    if (code === currentLang) option.classList.add("active");
    const flag = document.createElement("span");
    flag.className = "lang-flag";
    flag.textContent = LANG_META[code].flag;
    const label = document.createElement("span");
    label.textContent = LANG_META[code].label;
    option.append(flag, label);
    option.addEventListener("click", () => {
      currentLang = code;
      localStorage.setItem("lang", currentLang);
      if (langMenuEl) langMenuEl.classList.remove("open");
      if (langToggle) langToggle.setAttribute("aria-expanded", "false");
      applyTexts();
    });
    langDropdownEl.appendChild(option);
  });
}

init();

setInterval(() => {
  updateDailyStatus();
  tickEnergy();
  if (boostUntil && Date.now() < boostUntil) renderShop();
  syncProfileSilently();
  if (activeTab === "leaderboard") loadLeaderboard({ silent: true });
}, 1000);
