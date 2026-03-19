const balanceEl = document.getElementById("balance");
const balanceLabelEl = document.getElementById("balanceLabel");
const tapBtn = document.getElementById("tap");
const metaEl = document.getElementById("meta");
const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");
const langToggle = document.getElementById("langToggle");
const shopTitleEl = document.getElementById("shopTitle");
const shopSubtitleEl = document.getElementById("shopSubtitle");
const shopListEl = document.getElementById("shopList");
const tapValueEl = document.getElementById("tapValue");

const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
const params = new URLSearchParams(window.location.search);
const demoMode = params.get("demo") === "1";

let initData = "";
let demoUserId = null;
let currentLang = "en";
let metaState = { key: "loading", vars: {} };
let shopState = [];
let tapValue = 1;

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
    buy: "Buy",
    owned: "Owned",
    level: "Level {level}/{max}",
    glovesName: "Power Gloves",
    glovesDesc: "+{bonus} tap power",
    energyName: "Energy Drink",
    energyDesc: "+{bonus} tap power",
    turboName: "Turbo Core",
    turboDesc: "+{bonus} tap power",
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
    balanceLabel: "Баланс",
    shopTitle: "Магазин",
    shopSubtitle: "Трать тапы на апгрейды",
    tapValue: "+{value} / тап",
    buy: "Купить",
    owned: "Куплено",
    level: "Уровень {level}/{max}",
    glovesName: "Перчатки силы",
    glovesDesc: "+{bonus} к силе тапа",
    energyName: "Энергетик",
    energyDesc: "+{bonus} к силе тапа",
    turboName: "Турбо ядро",
    turboDesc: "+{bonus} к силе тапа",
    player: "Игрок: {name}",
    niceTap: "Хороший тап",
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
    player: "Jugador: {name}",
    niceTap: "Buen toque",
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
    player: "Jogador: {name}",
    niceTap: "Bom toque",
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
    player: "Oyuncu: {name}",
    niceTap: "Güzel dokunuş",
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
    player: "Pemain: {name}",
    niceTap: "Ketukan bagus",
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
    player: "Spieler: {name}",
    niceTap: "Guter Tipp",
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
    player: "Joueur : {name}",
    niceTap: "Bon tap",
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
  if (shopTitleEl) shopTitleEl.textContent = t("shopTitle");
  if (shopSubtitleEl) shopSubtitleEl.textContent = t("shopSubtitle");
  if (langToggle) langToggle.textContent = LANG_LABELS[currentLang] || currentLang.toUpperCase();
  if (tapValueEl) tapValueEl.textContent = t("tapValue", { value: tapValue });
  setMeta(metaState.key, metaState.vars);
  renderShop();
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

function updateTapValue(value) {
  tapValue = value || 1;
  if (tapValueEl) tapValueEl.textContent = t("tapValue", { value: tapValue });
}

function renderShop() {
  if (!shopListEl || !Array.isArray(shopState) || shopState.length === 0) return;
  shopListEl.innerHTML = "";
  shopState.forEach((item) => {
    const row = document.createElement("div");
    row.className = "shop-item";

    const left = document.createElement("div");
    const title = document.createElement("h4");
    const desc = document.createElement("p");
    const meta = document.createElement("div");
    meta.className = "shop-meta";

    title.textContent = t(`${item.id}Name`);
    desc.textContent = t(`${item.id}Desc`, { bonus: item.tapBonus });
    const levelText = document.createElement("span");
    levelText.textContent = t("level", { level: item.level, max: item.maxLevel });
    const priceText = document.createElement("span");
    priceText.textContent = item.level >= item.maxLevel ? t("owned") : `${item.price} taps`;
    meta.append(levelText, priceText);

    left.append(title, desc, meta);

    const btn = document.createElement("button");
    btn.className = "shop-buy";
    btn.textContent = item.level >= item.maxLevel ? t("owned") : t("buy");
    btn.disabled = item.level >= item.maxLevel;
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

async function loadShop() {
  const query = demoMode
    ? `demoUserId=${encodeURIComponent(demoUserId)}`
    : `initData=${encodeURIComponent(initData)}`;
  const res = await fetch(`/api/shop?${query}`);
  const data = await res.json();
  if (!data.ok) {
    return;
  }
  shopState = data.items || [];
  updateTapValue(data.tapValue || 1);
  renderShop();
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
    updateTapValue(profile.user.tapValue || 1);
    await loadShop();
  } catch (err) {
    setMeta("failedLoad");
  }
}

tapBtn.addEventListener("click", async () => {
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
    if (data.tapValue) updateTapValue(data.tapValue);
    setMeta("niceTap");
  } catch (err) {
    setMeta("network");
  }
});

langToggle.addEventListener("click", () => {
  const idx = LANGS.indexOf(currentLang);
  currentLang = LANGS[(idx + 1) % LANGS.length];
  localStorage.setItem("lang", currentLang);
  applyTexts();
});

init();
