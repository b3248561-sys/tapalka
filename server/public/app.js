const balanceEl = document.getElementById("balance");
const balanceLabelEl = document.getElementById("balanceLabel");
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
const tabTapEl = document.getElementById("tabTap");
const tabShopEl = document.getElementById("tabShop");
const dailyTitleEl = document.getElementById("dailyTitle");
const dailySubtitleEl = document.getElementById("dailySubtitle");
const dailyBtnEl = document.getElementById("dailyBtn");
const dailyStatusEl = document.getElementById("dailyStatus");
const questsTitleEl = document.getElementById("questsTitle");
const questsSubtitleEl = document.getElementById("questsSubtitle");
const questsListEl = document.getElementById("questsList");

const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
const params = new URLSearchParams(window.location.search);
const demoMode = params.get("demo") === "1";

let initData = "";
let demoUserId = null;
let currentLang = "en";
let metaState = { key: "loading", vars: {} };
let shopState = [];
let tapValue = 1;
let lastTouchAt = 0;
let lastPointerDownAt = 0;
let lastDailyTs = 0;
let boostUntil = 0;
let questsState = [];
let rankState = null;
let lastQuestSyncAt = 0;
let energy = 0;
let maxEnergy = 0;
let energyRegen = 1;
let energySyncedAt = Date.now();
let lastTapPoint = null;

const STRINGS = {
  en: {
    title: "Tapalka",
    subtitle: "Tap to earn points",
    tap: "Tap",
    loading: "Loading...",
    demo: "Demo mode",
    balanceLabel: "Balance",
    shopTitle: "Shop",
    shopSubtitle: "Spend taps to upgrade",
    tapValue: "+{value} / tap",
    tabTap: "Tap",
    tabShop: "Shop",
    dailyTitle: "Daily Bonus",
    dailySubtitle: "Come back every day",
    dailyClaim: "Claim",
    dailyReady: "Ready",
    dailyNext: "Next in {time}",
    boostActive: "Active {time}",
    boostReady: "Ready",
    questsTitle: "Daily Quests",
    questsSubtitle: "Complete and claim rewards",
    questTap: "Tap {count} times",
    questBuy: "Buy {count} item",
    questClaim: "Claim",
    questClaimed: "Claimed",
    rankLabel: "Rank: {name}",
    rank_bronze: "Bronze",
    rank_silver: "Silver",
    rank_gold: "Gold",
    rank_platinum: "Platinum",
    rank_diamond: "Diamond",
    rank_master: "Master",
    buy: "Buy",
    owned: "Owned",
    level: "Level {level}/{max}",
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
    shopSubtitle: "Трать тапы на апгрейды",
    tapValue: "+{value} / тап",
    tabTap: "Тап",
    tabShop: "Магазин",
    dailyTitle: "Ежедневный бонус",
    dailySubtitle: "Заходи каждый день",
    dailyClaim: "Забрать",
    dailyReady: "Доступно",
    dailyNext: "Следующий через {time}",
    boostActive: "Активен {time}",
    boostReady: "Готово",
    questsTitle: "Квесты на день",
    questsSubtitle: "Выполняй и забирай награды",
    questTap: "Тапни {count} раз",
    questBuy: "Купи {count} предмет",
    questClaim: "Забрать",
    questClaimed: "Забрано",
    rankLabel: "Лига: {name}",
    rank_bronze: "Бронза",
    rank_silver: "Серебро",
    rank_gold: "Золото",
    rank_platinum: "Платина",
    rank_diamond: "Алмаз",
    rank_master: "Мастер",
    buy: "Купить",
    owned: "Куплено",
    level: "Уровень {level}/{max}",
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
    player: "Игрок: {name}",
    niceTap: "Хороший тап",
    energyLabel: "Энергия",
    energyEmpty: "Нет энергии",
    authError: "Ошибка авторизации",
    failedLoad: "Не удалось загрузить",
    tryAgain: "Попробуй еще",
    network: "Ошибка сети",
    rateLimited: "Слишком быстро. Помедленнее."
  },
  es: {
    title: "Tapalka",
    subtitle: "Toca y gana puntos",
    tap: "Tocar",
    loading: "Cargando...",
    demo: "Modo demo",
    balanceLabel: "Saldo",
    shopTitle: "Tienda",
    shopSubtitle: "Gasta taps en mejoras",
    tapValue: "+{value} / toque",
    buy: "Comprar",
    owned: "Comprado",
    level: "Nivel {level}/{max}",
    glovesName: "Guantes de poder",
    glovesDesc: "+{bonus} fuerza de toque",
    energyName: "Bebida energética",
    energyDesc: "+{bonus} fuerza de toque",
    turboName: "Núcleo turbo",
    turboDesc: "+{bonus} fuerza de toque",
    capName: "Tanque de energía",
    capDesc: "+{bonus} energía máxima",
    rechargeName: "Chip de recarga",
    rechargeDesc: "+{bonus} energía/seg",
    player: "Jugador: {name}",
    niceTap: "Buen toque",
    energyLabel: "Energia",
    energyEmpty: "Sin energia",
    authError: "Error de autorización",
    failedLoad: "No se pudo cargar",
    tryAgain: "Inténtalo de nuevo",
    network: "Error de red",
    rateLimited: "Demasiado rápido. Más lento."
  },
  pt: {
    title: "Tapalka",
    subtitle: "Toque e ganhe pontos",
    tap: "Toque",
    loading: "Carregando...",
    demo: "Modo demo",
    balanceLabel: "Saldo",
    shopTitle: "Loja",
    shopSubtitle: "Gaste taps em upgrades",
    tapValue: "+{value} / toque",
    buy: "Comprar",
    owned: "Comprado",
    level: "Nível {level}/{max}",
    glovesName: "Luvas de força",
    glovesDesc: "+{bonus} força de toque",
    energyName: "Bebida energética",
    energyDesc: "+{bonus} força de toque",
    turboName: "Núcleo turbo",
    turboDesc: "+{bonus} força de toque",
    capName: "Tanque de energia",
    capDesc: "+{bonus} energia máxima",
    rechargeName: "Chip de recarga",
    rechargeDesc: "+{bonus} energia/seg",
    player: "Jogador: {name}",
    niceTap: "Bom toque",
    energyLabel: "Energia",
    energyEmpty: "Sem energia",
    authError: "Erro de autorização",
    failedLoad: "Falha ao carregar",
    tryAgain: "Tente novamente",
    network: "Erro de rede",
    rateLimited: "Rápido demais. Mais devagar."
  },
  tr: {
    title: "Tapalka",
    subtitle: "Dokun ve puan kazan",
    tap: "Dokun",
    loading: "Yükleniyor...",
    demo: "Demo modu",
    balanceLabel: "Bakiye",
    shopTitle: "Mağaza",
    shopSubtitle: "Tap ile yükselt",
    tapValue: "+{value} / dokunuş",
    buy: "Satın al",
    owned: "Satın alındı",
    level: "Seviye {level}/{max}",
    glovesName: "Güç eldivenleri",
    glovesDesc: "+{bonus} dokunuş gücü",
    energyName: "Enerji içeceği",
    energyDesc: "+{bonus} dokunuş gücü",
    turboName: "Turbo çekirdek",
    turboDesc: "+{bonus} dokunuş gücü",
    capName: "Enerji tankı",
    capDesc: "+{bonus} maksimum enerji",
    rechargeName: "Şarj çipi",
    rechargeDesc: "+{bonus} enerji/sn",
    player: "Oyuncu: {name}",
    niceTap: "Güzel dokunuş",
    energyLabel: "Enerji",
    energyEmpty: "Enerji yok",
    authError: "Yetkilendirme hatası",
    failedLoad: "Yüklenemedi",
    tryAgain: "Tekrar dene",
    network: "Ağ hatası",
    rateLimited: "Çok hızlı. Yavaşla."
  },
  id: {
    title: "Tapalka",
    subtitle: "Ketuk untuk dapat poin",
    tap: "Ketuk",
    loading: "Memuat...",
    demo: "Mode demo",
    balanceLabel: "Saldo",
    shopTitle: "Toko",
    shopSubtitle: "Pakai taps untuk upgrade",
    tapValue: "+{value} / ketuk",
    buy: "Beli",
    owned: "Dimiliki",
    level: "Level {level}/{max}",
    glovesName: "Sarung tangan power",
    glovesDesc: "+{bonus} kekuatan tap",
    energyName: "Minuman energi",
    energyDesc: "+{bonus} kekuatan tap",
    turboName: "Inti turbo",
    turboDesc: "+{bonus} kekuatan tap",
    capName: "Tangki energi",
    capDesc: "+{bonus} energi maksimum",
    rechargeName: "Chip isi ulang",
    rechargeDesc: "+{bonus} energi/dtk",
    player: "Pemain: {name}",
    niceTap: "Ketukan bagus",
    energyLabel: "Energi",
    energyEmpty: "Energi habis",
    authError: "Kesalahan otorisasi",
    failedLoad: "Gagal memuat",
    tryAgain: "Coba lagi",
    network: "Kesalahan jaringan",
    rateLimited: "Terlalu cepat. Pelan dulu."
  },
  de: {
    title: "Tapalka",
    subtitle: "Tippe und sammle Punkte",
    tap: "Tippen",
    loading: "Lädt...",
    demo: "Demo-Modus",
    balanceLabel: "Kontostand",
    shopTitle: "Shop",
    shopSubtitle: "Nutze taps für Upgrades",
    tapValue: "+{value} / Tipp",
    buy: "Kaufen",
    owned: "Gekauft",
    level: "Level {level}/{max}",
    glovesName: "Power-Handschuhe",
    glovesDesc: "+{bonus} Tipp-Kraft",
    energyName: "Energiegetränk",
    energyDesc: "+{bonus} Tipp-Kraft",
    turboName: "Turbo-Kern",
    turboDesc: "+{bonus} Tipp-Kraft",
    capName: "Energie-Tank",
    capDesc: "+{bonus} max Energie",
    rechargeName: "Ladechip",
    rechargeDesc: "+{bonus} Energie/s",
    player: "Spieler: {name}",
    niceTap: "Guter Tipp",
    energyLabel: "Energie",
    energyEmpty: "Keine Energie",
    authError: "Autorisierungsfehler",
    failedLoad: "Laden fehlgeschlagen",
    tryAgain: "Erneut versuchen",
    network: "Netzwerkfehler",
    rateLimited: "Zu schnell. Langsamer."
  },
  fr: {
    title: "Tapalka",
    subtitle: "Tape pour gagner des points",
    tap: "Taper",
    loading: "Chargement...",
    demo: "Mode démo",
    balanceLabel: "Solde",
    shopTitle: "Boutique",
    shopSubtitle: "Dépense tes taps",
    tapValue: "+{value} / tap",
    buy: "Acheter",
    owned: "Acheté",
    level: "Niveau {level}/{max}",
    glovesName: "Gants de puissance",
    glovesDesc: "+{bonus} puissance de tap",
    energyName: "Boisson énergisante",
    energyDesc: "+{bonus} puissance de tap",
    turboName: "Noyau turbo",
    turboDesc: "+{bonus} puissance de tap",
    capName: "Réservoir d'énergie",
    capDesc: "+{bonus} énergie max",
    rechargeName: "Puce de recharge",
    rechargeDesc: "+{bonus} énergie/s",
    player: "Joueur : {name}",
    niceTap: "Bon tap",
    energyLabel: "Énergie",
    energyEmpty: "Plus d'énergie",
    authError: "Erreur d'autorisation",
    failedLoad: "Échec du chargement",
    tryAgain: "Réessayer",
    network: "Erreur réseau",
    rateLimited: "Trop rapide. Ralentis."
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
  if (tabTapEl) tabTapEl.textContent = t("tabTap");
  if (tabShopEl) tabShopEl.textContent = t("tabShop");
  if (dailyTitleEl) dailyTitleEl.textContent = t("dailyTitle");
  if (dailySubtitleEl) dailySubtitleEl.textContent = t("dailySubtitle");
  if (dailyBtnEl) dailyBtnEl.textContent = t("dailyClaim");
  if (langToggle) langToggle.textContent = LANG_LABELS[currentLang] || currentLang.toUpperCase();
  if (langToggle && LANG_META[currentLang]) {
    langToggle.textContent = `${LANG_META[currentLang].flag} ${LANG_LABELS[currentLang] || currentLang.toUpperCase()}`;
  }
  if (tapValueEl) tapValueEl.textContent = t("tapValue", { value: tapValue });
  setMeta(metaState.key, metaState.vars);
  updateRank();
  renderLangMenu();
  renderQuests();
  renderShop();
}

function setMeta(key, vars = {}) {
  metaState = { key, vars };
  metaEl.textContent = t(key, vars);
  if (metaEl) metaEl.classList.toggle("error", key === "noEnergy" || key === "energyEmpty" || key === "authError");
}

function setMetaText(text) {
  metaState = { key: "custom", vars: {} };
  metaEl.textContent = text;
  if (metaEl) metaEl.classList.add("error");
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
setActiveTab("tap");

if (demoMode) {
  demoUserId = localStorage.getItem("demoUserId");
  if (!demoUserId) {
    demoUserId = String(Math.floor(Math.random() * 1000000) + 1);
    localStorage.setItem("demoUserId", demoUserId);
  }
  setMeta("demo");
}

async function apiRequest(path, options = {}) {
  const init = tg?.initData || initData || "";
  if (init && init !== initData) initData = init;
  const opts = {
    ...options,
    headers: { "Content-Type": "application/json" }
  };
  let url = path;

  if (demoMode) {
    const body = opts.body ? JSON.parse(opts.body) : {};
    body.demoUserId = demoUserId;
    opts.body = JSON.stringify(body);
  } else if (initData) {
    const body = opts.body ? JSON.parse(opts.body) : {};
    body.initData = initData;
    opts.body = JSON.stringify(body);
    opts.headers["x-init-data"] = initData;
  } else if (init) {
    opts.headers["x-init-data"] = init;
  }

  const res = await fetch(url, { ...opts, cache: "no-store" });
  return res.json();
}

async function loadProfile() {
  const init = tg?.initData || initData || "";
  if (init && init !== initData) initData = init;
  const headers = {};
  let url = "/api/me";
  if (demoMode) {
    url += `?demoUserId=${encodeURIComponent(demoUserId)}`;
  } else if (initData) {
    headers["x-init-data"] = initData;
  }
  const res = await fetch(url, { headers, cache: "no-store" });
  return res.json();
}

function updateBalance(value) {
  balanceEl.textContent = String(value);
  if (shopBalanceEl) shopBalanceEl.textContent = String(value);
  balanceEl.classList.remove("bump");
  requestAnimationFrame(() => {
    balanceEl.classList.add("bump");
  });
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
  if (!maxEnergy || !energyRegen) return;
  if (energy >= maxEnergy) return;
  const now = Date.now();
  const elapsed = (now - energySyncedAt) / 1000;
  if (elapsed <= 0) return;
  const regen = Math.floor(elapsed * energyRegen);
  if (regen <= 0) return;
  energy = Math.min(maxEnergy, energy + regen);
  energySyncedAt = now;
  if (energyTextEl) energyTextEl.textContent = `${Math.round(energy)}/${Math.round(maxEnergy)}`;
  if (energyBarEl) {
    const pct = maxEnergy > 0 ? Math.min(100, (energy / maxEnergy) * 100) : 0;
    energyBarEl.style.width = `${pct}%`;
  }
}

function updateTapValue(value) {
  tapValue = value || 1;
  if (tapValueEl) tapValueEl.textContent = t("tapValue", { value: tapValue });
}

function updateRank() {
  if (!rankEl || !rankBarEl || !rankState) return;
  const nameKey = `rank_${rankState.id}`;
  const name = t(nameKey);
  rankEl.textContent = t("rankLabel", { name });
  rankBarEl.style.width = `${Math.round((rankState.progress || 0) * 100)}%`;
}

function setActiveTab(tab) {
  const isTap = tab === "tap";
  if (screenTapEl && screenShopEl) {
    const current = isTap ? screenShopEl : screenTapEl;
    current.classList.add("leaving");
    setTimeout(() => {
      current.classList.remove("leaving");
    }, 200);
  }
  if (screenTapEl) screenTapEl.classList.toggle("active", isTap);
  if (screenShopEl) screenShopEl.classList.toggle("active", !isTap);
  if (tabTapEl) tabTapEl.classList.toggle("active", isTap);
  if (tabShopEl) tabShopEl.classList.toggle("active", !isTap);
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
  const now = Date.now();
  const nextAt = (lastDailyTs || 0) + 24 * 60 * 60 * 1000;
  if (now >= nextAt) {
    dailyStatusEl.textContent = t("dailyReady");
    dailyBtnEl.disabled = false;
  } else {
    dailyStatusEl.textContent = t("dailyNext", { time: formatTime(nextAt - now) });
    dailyBtnEl.disabled = true;
  }
}

function updateBoostStatus() {
  if (!shopState || shopState.length === 0) return;
  renderShop();
}

function renderSkeletons() {
  const skeletonItem = '<div class="skeleton-card"></div>';
  if (shopListEl) shopListEl.innerHTML = skeletonItem.repeat(3);
  if (questsListEl) questsListEl.innerHTML = skeletonItem.repeat(2);
}

function setLoadingState(isLoading) {
  document.body.classList.toggle("loading", isLoading);
  if (isLoading) renderSkeletons();
}

function renderShop() {
  if (!shopListEl || !Array.isArray(shopState) || shopState.length === 0) return;
  shopListEl.innerHTML = "";
  const now = Date.now();
  shopState.forEach((item) => {
    const row = document.createElement("div");
    row.className = "shop-item";

    const left = document.createElement("div");
    const title = document.createElement("h4");
    const desc = document.createElement("p");
    const meta = document.createElement("div");
    meta.className = "shop-meta";

    title.textContent = t(`${item.id}Name`);
    const bonusValue =
      item.type === "energy_cap"
        ? item.energyBonus
        : item.type === "energy_regen"
        ? item.regenBonus
        : item.tapBonus;
    desc.textContent = t(`${item.id}Desc`, { bonus: bonusValue });
    const levelText = document.createElement("span");
    const priceText = document.createElement("span");
    if (item.type === "boost") {
      const active = boostUntil && now < boostUntil;
      const remainingMs = active ? boostUntil - now : 0;
      levelText.textContent = t("boostDesc", { seconds: Math.floor((item.durationMs || 10000) / 1000) });
      if (active) {
        priceText.textContent = t("boostActive", { time: formatTime(remainingMs) });
      } else {
        priceText.textContent = `${item.price} taps`;
      }
    } else {
      levelText.textContent = t("level", { level: item.level, max: item.maxLevel });
      priceText.textContent = item.level >= item.maxLevel ? t("owned") : `${item.price} taps`;
    }
    meta.append(levelText, priceText);

    left.append(title, desc, meta);

    const btn = document.createElement("button");
    btn.className = "shop-buy";
    if (item.type === "boost") {
      const active = boostUntil && now < boostUntil;
      const remainingMs = active ? boostUntil - now : 0;
      btn.textContent = active ? t("boostActive", { time: formatTime(remainingMs) }) : t("buy");
      btn.disabled = active;
    } else {
      btn.textContent = item.level >= item.maxLevel ? t("owned") : t("buy");
      btn.disabled = item.level >= item.maxLevel;
    }
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      try {
        const data = await apiRequest("/api/buy", {
          method: "POST",
          body: JSON.stringify({ itemId: item.id })
        });
        if (!data.ok) {
          setMetaText(data.error || t("tryAgain"));
          return;
        }
        updateBalance(data.balance);
        updateTapValue(data.tapValue);
        if (data.boostUntil) boostUntil = data.boostUntil;
        await loadShop();
      } catch {
        setMeta("network");
      } finally {
        btn.disabled = false;
      }
    });

    row.append(left, btn);
    shopListEl.append(row);
  });
}

function renderQuests() {
  if (!questsListEl || !Array.isArray(questsState) || questsState.length === 0) return;
  questsListEl.innerHTML = "";
  questsState.forEach((quest) => {
    const row = document.createElement("div");
    row.className = "quest-item";

    const left = document.createElement("div");
    const title = document.createElement("h4");
    const desc = document.createElement("p");
    const meta = document.createElement("div");
    meta.className = "quest-meta";

    if (quest.type === "tap") {
      title.textContent = t("questTap", { count: quest.target });
    } else {
      title.textContent = t("questBuy", { count: quest.target });
    }
    desc.textContent = `+${quest.reward} taps`;
    const progressText = document.createElement("span");
    progressText.textContent = `${quest.progress}/${quest.target}`;
    meta.append(progressText);

    left.append(title, desc, meta);

    const btn = document.createElement("button");
    btn.className = "quest-claim";
    btn.textContent = quest.claimed ? t("questClaimed") : t("questClaim");
    btn.disabled = quest.claimed || quest.progress < quest.target;
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      btn.classList.add("loading");
      try {
        const data = await apiRequest("/api/quest", {
          method: "POST",
          body: JSON.stringify({ questId: quest.id })
        });
        if (!data.ok) {
          setMetaText(data.error || t("tryAgain"));
          return;
        }
        updateBalance(data.balance);
        if (typeof data.energy === "number") {
          updateEnergy(data.energy, data.maxEnergy, data.energyRegen);
        }
        rankState = data.rank || rankState;
        questsState = data.quests || questsState;
        updateRank();
        renderQuests();
      } catch {
        setMeta("network");
      } finally {
        btn.disabled = false;
        btn.classList.remove("loading");
      }
    });

    row.append(left, btn);
    questsListEl.append(row);
  });
}

async function loadShop() {
  const init = tg?.initData || initData || "";
  if (init && init !== initData) initData = init;
  const headers = {};
  let url = "/api/shop";
  if (demoMode) {
    url += `?demoUserId=${encodeURIComponent(demoUserId)}`;
  } else if (initData) {
    headers["x-init-data"] = initData;
  }
  const res = await fetch(url, { headers, cache: "no-store" });
  const data = await res.json();
  if (!data.ok) {
    return;
  }
  shopState = data.items || [];
  updateTapValue(data.tapValue || 1);
  if (typeof data.energy === "number") {
    updateEnergy(data.energy, data.maxEnergy, data.energyRegen);
  }
  boostUntil = data.boostUntil || 0;
  renderShop();
}

async function loadQuests({ silent = false } = {}) {
  const init = tg?.initData || initData || "";
  if (init && init !== initData) initData = init;
  const headers = {};
  let url = "/api/quests";
  if (demoMode) {
    url += `?demoUserId=${encodeURIComponent(demoUserId)}`;
  } else if (initData) {
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

async function init() {
  setLoadingState(true);
  try {
    const profile = await loadProfile();
    if (!profile.ok) {
      setMetaText(profile.error || t("authError"));
      return;
    }
    setMeta("player", { name: profile.user.name });
    updateBalance(profile.user.balance);
    updateTapValue(profile.user.tapValue || 1);
    lastDailyTs = profile.user.lastDailyTs || 0;
    boostUntil = profile.user.boostUntil || 0;
    rankState = profile.user.rank || null;
    updateEnergy(profile.user.energy, profile.user.maxEnergy, profile.user.energyRegen);
    updateDailyStatus();
    await loadShop();
    await loadQuests();
  } catch (err) {
    setMeta("failedLoad");
  } finally {
    setLoadingState(false);
  }
}

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

langToggle.addEventListener("click", () => {
  if (!langMenuEl) return;
  const open = langMenuEl.classList.toggle("open");
  langToggle.setAttribute("aria-expanded", open ? "true" : "false");
});

if (tabTapEl) {
  tabTapEl.addEventListener("click", () => setActiveTab("tap"));
}
if (tabShopEl) {
  tabShopEl.addEventListener("click", () => setActiveTab("shop"));
}

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
      const data = await apiRequest("/api/daily", {
        method: "POST",
        body: "{}"
      });
      if (!data.ok) {
        if (data.error === "daily_not_ready" && data.nextAt) {
          lastDailyTs = data.nextAt - 24 * 60 * 60 * 1000;
          updateDailyStatus();
        }
        return;
      }
      updateBalance(data.balance);
      if (typeof data.energy === "number") {
        updateEnergy(data.energy, data.maxEnergy, data.energyRegen);
      }
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
      } else if (data.error) {
        setMetaText(data.error);
      } else {
        setMeta("tryAgain");
      }
      return;
    }
    updateBalance(data.balance);
    if (data.tapValue) updateTapValue(data.tapValue);
    if (typeof data.energy === "number") {
      updateEnergy(data.energy, data.maxEnergy, data.energyRegen);
    }
    if (data.boostUntil) boostUntil = data.boostUntil;
    setMeta("niceTap");
    const mult = data.multiplier || 1;
    showSpark(`+${(data.tapValue || 1) * count * mult}`, point);
    if (tg?.HapticFeedback?.impactOccurred) {
      tg.HapticFeedback.impactOccurred("light");
    } else if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    const now = Date.now();
    if (now - lastQuestSyncAt > 1000) {
      lastQuestSyncAt = now;
      loadQuests({ silent: true });
    }
  } catch (err) {
    setMeta("network");
  }
}

function showSpark(text, point = null) {
  const panel = document.querySelector(".panel");
  if (!panel) return;
  const spark = document.createElement("div");
  spark.className = "spark";
  spark.textContent = text;
  const rect = panel.getBoundingClientRect();
  if (point && point.x && point.y) {
    const x = Math.min(Math.max(point.x - rect.left, 20), rect.width - 20);
    const y = Math.min(Math.max(point.y - rect.top, 30), rect.height - 80);
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
  } else {
    const x = 40 + Math.random() * (panel.clientWidth - 80);
    const y = 40 + Math.random() * 60;
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
  }
  panel.appendChild(spark);
  setTimeout(() => spark.remove(), 800);
}

init();

function renderLangMenu() {
  if (!langDropdownEl) return;
  langDropdownEl.innerHTML = "";
  LANGS.forEach((code) => {
    const option = document.createElement("div");
    option.className = "lang-option";
    if (code === currentLang) option.classList.add("active");

    const flag = document.createElement("span");
    flag.className = "lang-flag";
    flag.textContent = LANG_META[code]?.flag || "";

    const label = document.createElement("span");
    label.textContent = LANG_META[code]?.label || code.toUpperCase();

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

setInterval(() => {
  updateDailyStatus();
  tickEnergy();
  if (boostUntil && Date.now() < boostUntil) {
    renderShop();
  }
}, 1000);
