const balanceEl = document.getElementById("balance");
const balanceLabelEl = document.getElementById("balanceLabel");
const playerIdEl = document.getElementById("playerId");
const tapBtn = document.getElementById("tap");
const rankEl = document.getElementById("rank");
const rankBarEl = document.getElementById("rankBar");
const energyLabelEl = document.getElementById("energyLabel");
const energyTextEl = document.getElementById("energyText");
const energyBarEl = document.getElementById("energyBar");
const comboBadgeEl = document.getElementById("comboBadge");
const goldenBadgeEl = document.getElementById("goldenBadge");
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
const screenProfileEl = document.getElementById("screenProfile");
const screenGiftsEl = document.getElementById("screenGifts");
const tabTapEl = document.getElementById("tabTap");
const tabShopEl = document.getElementById("tabShop");
const tabLeaderboardEl = document.getElementById("tabLeaderboard");
const tabProfileEl = document.getElementById("tabProfile");
const tabGiftsEl = document.getElementById("tabGifts");
const leaderboardTitleEl = document.getElementById("leaderboardTitle");
const leaderboardSubtitleEl = document.getElementById("leaderboardSubtitle");
const leaderboardSeasonInfoEl = document.getElementById("leaderboardSeasonInfo");
const leaderboardModeSeasonEl = document.getElementById("leaderboardModeSeason");
const leaderboardModeAllTimeEl = document.getElementById("leaderboardModeAllTime");
const leaderboardListEl = document.getElementById("leaderboardList");
const profileTitleEl = document.getElementById("profileTitle");
const profileSubtitleEl = document.getElementById("profileSubtitle");
const profileNicknameLabelEl = document.getElementById("profileNicknameLabel");
const profileAvatarFileLabelEl = document.getElementById("profileAvatarFileLabel");
const profileNicknameEl = document.getElementById("profileNickname");
const profileAvatarFileEl = document.getElementById("profileAvatarFile");
const profileAvatarHintEl = document.getElementById("profileAvatarHint");
const profileRefTitleEl = document.getElementById("profileRefTitle");
const profileRefLinkEl = document.getElementById("profileRefLink");
const profileRefCopyBtnEl = document.getElementById("profileRefCopyBtn");
const profileRefStatsEl = document.getElementById("profileRefStats");
const profileSaveBtnEl = document.getElementById("profileSaveBtn");
const profileResetBtnEl = document.getElementById("profileResetBtn");
const profileStatusEl = document.getElementById("profileStatus");
const donateTitleEl = document.getElementById("donateTitle");
const donateSubtitleEl = document.getElementById("donateSubtitle");
const donateListEl = document.getElementById("donateList");
const donateStatusEl = document.getElementById("donateStatus");
const profileAvatarPreviewEl = document.getElementById("profileAvatarPreview");
const profileNamePreviewEl = document.getElementById("profileNamePreview");
const profileIdPreviewEl = document.getElementById("profileIdPreview");
const profileGiftsTitleEl = document.getElementById("profileGiftsTitle");
const profileGiftsCountEl = document.getElementById("profileGiftsCount");
const profileGiftsListEl = document.getElementById("profileGiftsList");
const giftsPageSubtitleEl = document.getElementById("giftsPageSubtitle");
const giftsFilterAllEl = document.getElementById("giftsFilterAll");
const giftsFilterRareEl = document.getElementById("giftsFilterRare");
const giftsFilterEpicEl = document.getElementById("giftsFilterEpic");
const giftsFilterMythicEl = document.getElementById("giftsFilterMythic");
const userModalEl = document.getElementById("userModal");
const userModalCloseEl = document.getElementById("userModalClose");
const userModalTitleEl = document.getElementById("userModalTitle");
const userModalBodyEl = document.getElementById("userModalBody");
const caseAnimEl = document.getElementById("caseAnim");
const caseAnimTitleEl = document.getElementById("caseAnimTitle");
const caseAnimStatusEl = document.getElementById("caseAnimStatus");
const caseSlot1El = document.getElementById("caseSlot1");
const caseSlot2El = document.getElementById("caseSlot2");
const caseSlot3El = document.getElementById("caseSlot3");
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
let leaderboardMode = localStorage.getItem("leaderboardMode") === "alltime" ? "alltime" : "season";
let leaderboardSeason = null;
let activeTab = "tap";
let currentUserId = "";
let equippedCosmetic = "";
let equippedFrame = "";
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
let comboCount = 0;
let comboMultiplier = 1;
let goldenUntil = 0;
let nextGoldenAt = 0;
let profileUser = null;
let profileAvatarFileData = "";
let donatePackages = [];
let launchReferralCode = "";
const BOT_USERNAME = "Nleo2bot";
const REFERRAL_BONUS_YOU = 1200;
const REFERRAL_BONUS_FRIEND = 2200;
let giftsFilter = ["all", "rare", "epic", "mythic"].includes(localStorage.getItem("giftsFilter"))
  ? localStorage.getItem("giftsFilter")
  : "all";
let caseAnimationActive = false;
const CASE_SLOT_POOL = ["🎁", "💎", "👑", "🔥", "⚡", "🍀", "🔮", "🌟", "🧸", "💖", "🐉", "🐋"];

const SHOP_CATEGORY_ORDER = ["power", "energy", "cosmetic", "frame", "special"];
const PANEL_THEMES = ["theme-crown", "theme-neon", "theme-sakura", "theme-void", "theme-aurora"];
const TAP_THEMES = ["style-crown", "style-neon", "style-sakura", "style-void", "style-aurora"];

function normalizeReferralCode(value) {
  const text = String(value || "").trim();
  return /^ref_\d{3,20}$/.test(text) ? text : "";
}

const STRINGS = {
  en: {
    title: "Tapalka",
    subtitle: "Tap to earn points",
    tap: "Tap",
    loading: "Loading...",
    demo: "Demo mode",
    balanceLabel: "NeoFlux",
    shopTitle: "Shop",
    shopSubtitle: "Build your setup with NeoFlux",
    tapValue: "+{value} NF / tap",
    tabTap: "Tap",
    tabShop: "Shop",
    tabLeaderboard: "Leaderboard",
    tabProfile: "Profile",
    tabGifts: "Gifts",
    leaderboardTitle: "Leaderboard",
    leaderboardSubtitle: "Top players by balance",
    leaderboardModeSeason: "Season",
    leaderboardModeAllTime: "All time",
    leaderboardSeasonInfo: "Season {key} • ends in {time}",
    leaderboardSeasonValue: "{value} NF",
    leaderboardAllTimeValue: "{value}",
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
    questReward: "+{reward} NF",
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
    priceTaps: "NF",
    shopCategory_power: "Power",
    shopCategory_energy: "Energy",
    shopCategory_cosmetic: "Cosmetics",
    shopCategory_frame: "Frames",
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
    voidName: "Void Surge",
    voidDesc: "Dark cosmic tap style",
    auroraName: "Aurora Wave",
    auroraDesc: "Polar glow button style",
    frame_goldName: "Golden Frame",
    frame_goldDesc: "Luxury avatar frame in rating",
    frame_neonName: "Neon Frame",
    frame_neonDesc: "Bright cyber frame in rating",
    frame_fireName: "Fire Frame",
    frame_fireDesc: "Hot flame frame in rating",
    frame_prismName: "Prism Frame",
    frame_prismDesc: "Rainbow refraction frame",
    frame_obsidianName: "Obsidian Frame",
    frame_obsidianDesc: "Dark premium crystal frame",
    case_luckyName: "Lucky Case",
    case_luckyDesc: "No-loss case with random reward",
    case_royalName: "Royal Case",
    case_royalDesc: "High-tier case with rare drops",
    openCase: "Open",
    caseOpened: "{rarity} • +{reward} NF",
    caseOpenedWithItem: "{rarity} • +{reward} NF + {item}",
    caseOpenedWithGift: "{rarity} • +{reward} NF + gift {gift}",
    caseOpenedFull: "{rarity} • +{reward} NF + {item} + gift {gift}",
    caseAnimOpening: "Opening {name}",
    caseAnimSpinning: "Slots spinning...",
    caseAnimFailed: "Could not open case",
    rarity_common: "Common",
    rarity_rare: "Rare",
    rarity_epic: "Epic",
    rarity_mythic: "Mythic",
    profileTitle: "Profile",
    profileSubtitle: "Set your in-game nickname and avatar",
    profileGiftsTitle: "Gifts",
    profileGiftsEmpty: "No gifts yet",
    profileGiftsCount: "{total} gifts • {types} types",
    giftsPageSubtitle: "Telegram-style collection",
    giftsFilterAll: "All",
    giftsFilterRare: "Rare+",
    giftsFilterEpic: "Epic+",
    giftsFilterMythic: "Mythic",
    profileNicknameLabel: "Nickname",
    profileAvatarFileLabel: "Upload from device",
    profileNicknamePlaceholder: "Your nickname",
    profileAvatarHint: "Upload your avatar directly from phone.",
    profileRefTitle: "Invite friends and get bonuses",
    profileRefCopy: "Copy",
    profileRefCopied: "Referral link copied",
    profileRefStats: "You: +{you} NF • Friend: +{friend} NF • Invited: {count}",
    donateTitle: "Support project",
    donateSubtitle: "Telegram Stars packs (non pay-to-win)",
    support_sName: "Starter Support",
    support_mName: "Creator Support",
    support_lName: "Legend Support",
    donateBuy: "Support for {stars} Stars",
    donateBonus: "Bonus +{bonus} NF",
    donateGift: "Gift {emoji} {name}",
    donatePaid: "Thanks for support",
    donateCanceled: "Payment canceled",
    donateFailed: "Payment failed",
    donateNotReady: "Stars unavailable",
    profileSave: "Save",
    profileReset: "Reset",
    profileSaved: "Profile updated",
    profileResetDone: "Profile reset to Telegram",
    profileNoChanges: "No changes",
    profileNickInvalid: "Nickname must be 2-24 chars",
    profileAvatarInvalid: "Invalid avatar URL",
    profileAvatarFileError: "Could not process image",
    profileAvatarTooLarge: "Image is too large, try another one",
    profileAvatarReady: "Image selected from device",
    profileAvatarProcessing: "Processing image...",
    welcomeBonus: "Welcome bonus +{amount} NF",
    referralApplied: "Referral bonus +{amount} NF",
    profileSaveError: "Could not save profile",
    playerProfileTitle: "Player profile",
    playerProfileLoading: "Loading player profile...",
    playerProfileFailed: "Could not load player profile",
    playerProfileClose: "Close",
    playerProfileYou: "You",
    playerProfileRank: "League",
    playerProfileBalance: "Balance",
    playerProfileTapValue: "Tap power",
    playerProfileSeason: "Season NF",
    playerProfileGifts: "Gifts",
    playerProfileGiftCount: "{total} gifts • {types} types",
    giftCount: "x{count}",
    gift_lucky_cloverName: "Lucky Clover",
    gift_prism_orbName: "Prism Orb",
    gift_neon_phoenixName: "Neon Phoenix",
    gift_cyber_crownName: "Cyber Crown",
    gift_star_whaleName: "Star Whale",
    gift_solar_dragonName: "Solar Dragon",
    comboLabel: "Combo x{mult}",
    goldenNow: "Golden x4 {time}",
    goldenSoon: "Golden in {time}",
    critTap: "CRIT x{mult}",
    goldenTap: "Golden tap!",
    player: "Player: {name}",
    niceTap: "Nice tap",
    energyLabel: "Energy",
    energyEmpty: "No energy",
    authError: "Auth error",
    failedLoad: "Failed to load",
    tryAgain: "Try again",
    network: "Network error",
    rateLimited: "Too fast. Slow down.",
    antiCheatBlocked: "Autoclick blocked. Wait {time}"
  },
  ru: {
    title: "Tapalka",
    subtitle: "Тапай и зарабатывай",
    tap: "Тап",
    loading: "Загрузка...",
    demo: "Демо режим",
    balanceLabel: "NeoFlux",
    shopTitle: "Магазин",
    shopSubtitle: "Собери лучший набор за NeoFlux",
    tapValue: "+{value} NF / тап",
    tabTap: "Тап",
    tabShop: "Магазин",
    tabLeaderboard: "Рейтинг",
    tabProfile: "Профиль",
    tabGifts: "Подарки",
    leaderboardTitle: "Рейтинг",
    leaderboardSubtitle: "Лучшие игроки по балансу",
    leaderboardModeSeason: "Сезон",
    leaderboardModeAllTime: "Все время",
    leaderboardSeasonInfo: "Сезон {key} • до конца {time}",
    leaderboardSeasonValue: "{value} NF",
    leaderboardAllTimeValue: "{value}",
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
    questReward: "+{reward} NF",
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
    priceTaps: "NF",
    shopCategory_power: "Сила тапа",
    shopCategory_energy: "Энергия",
    shopCategory_cosmetic: "Украшения",
    shopCategory_frame: "Рамки",
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
    voidName: "Пульс Бездны",
    voidDesc: "Темный космический стиль",
    auroraName: "Северное сияние",
    auroraDesc: "Полярное свечение кнопки",
    frame_goldName: "Золотая рамка",
    frame_goldDesc: "Премиум-рамка аватарки в рейтинге",
    frame_neonName: "Неоновая рамка",
    frame_neonDesc: "Яркая кибер-рамка в рейтинге",
    frame_fireName: "Огненная рамка",
    frame_fireDesc: "Пламенная рамка аватарки",
    frame_prismName: "Призматическая рамка",
    frame_prismDesc: "Радужное преломление в рейтинге",
    frame_obsidianName: "Обсидиановая рамка",
    frame_obsidianDesc: "Темная кристальная рамка",
    case_luckyName: "Кейс удачи",
    case_luckyDesc: "Кейс без проигрыша с рандомной наградой",
    case_royalName: "Королевский кейс",
    case_royalDesc: "Кейс с редкими дропами",
    openCase: "Открыть",
    caseOpened: "{rarity} • +{reward} NF",
    caseOpenedWithItem: "{rarity} • +{reward} NF + {item}",
    caseOpenedWithGift: "{rarity} • +{reward} NF + подарок {gift}",
    caseOpenedFull: "{rarity} • +{reward} NF + {item} + подарок {gift}",
    caseAnimOpening: "Открываем {name}",
    caseAnimSpinning: "Слоты крутятся...",
    caseAnimFailed: "Не удалось открыть кейс",
    rarity_common: "Обычная",
    rarity_rare: "Редкая",
    rarity_epic: "Эпическая",
    rarity_mythic: "Мифическая",
    profileTitle: "Профиль",
    profileSubtitle: "Настрой ник и аватар в игре",
    profileGiftsTitle: "Подарки",
    profileGiftsEmpty: "Пока без подарков",
    profileGiftsCount: "{total} подарков • {types} видов",
    giftsPageSubtitle: "Коллекция в стиле Telegram",
    giftsFilterAll: "Все",
    giftsFilterRare: "Редкие+",
    giftsFilterEpic: "Эпик+",
    giftsFilterMythic: "Мифик",
    profileNicknameLabel: "Ник",
    profileAvatarFileLabel: "Загрузить с устройства",
    profileNicknamePlaceholder: "Твой ник",
    profileAvatarHint: "Загрузи аватар прямо с телефона.",
    profileRefTitle: "Приглашай друзей и получай бонус",
    profileRefCopy: "Копировать",
    profileRefCopied: "Реферальная ссылка скопирована",
    profileRefStats: "Тебе: +{you} NF • Другу: +{friend} NF • Приглашено: {count}",
    donateTitle: "Поддержка проекта",
    donateSubtitle: "Пакеты Telegram Stars (без pay-to-win)",
    support_sName: "Стартовая поддержка",
    support_mName: "Поддержка создателя",
    support_lName: "Легендарная поддержка",
    donateBuy: "Поддержать за {stars} Stars",
    donateBonus: "Бонус +{bonus} NF",
    donateGift: "Подарок {emoji} {name}",
    donatePaid: "Спасибо за поддержку",
    donateCanceled: "Оплата отменена",
    donateFailed: "Оплата не прошла",
    donateNotReady: "Stars пока недоступны",
    profileSave: "Сохранить",
    profileReset: "Сбросить",
    profileSaved: "Профиль обновлен",
    profileResetDone: "Профиль сброшен на Telegram",
    profileNoChanges: "Изменений нет",
    profileNickInvalid: "Ник должен быть 2-24 символа",
    profileAvatarInvalid: "Неверная ссылка аватара",
    profileAvatarFileError: "Не удалось обработать изображение",
    profileAvatarTooLarge: "Картинка слишком большая, выбери другую",
    profileAvatarReady: "Фото выбрано с устройства",
    profileAvatarProcessing: "Обрабатываю изображение...",
    welcomeBonus: "Стартовый бонус +{amount} NF",
    referralApplied: "Реферальный бонус +{amount} NF",
    profileSaveError: "Не удалось сохранить профиль",
    playerProfileTitle: "Профиль игрока",
    playerProfileLoading: "Загружаю профиль игрока...",
    playerProfileFailed: "Не удалось загрузить профиль игрока",
    playerProfileClose: "Закрыть",
    playerProfileYou: "Ты",
    playerProfileRank: "Лига",
    playerProfileBalance: "Баланс",
    playerProfileTapValue: "Сила тапа",
    playerProfileSeason: "NF сезона",
    playerProfileGifts: "Подарки",
    playerProfileGiftCount: "{total} подарков • {types} видов",
    giftCount: "x{count}",
    gift_lucky_cloverName: "Клевер удачи",
    gift_prism_orbName: "Призматическая сфера",
    gift_neon_phoenixName: "Неоновый феникс",
    gift_cyber_crownName: "Кибер-корона",
    gift_star_whaleName: "Звездный кит",
    gift_solar_dragonName: "Солнечный дракон",
    comboLabel: "Комбо x{mult}",
    goldenNow: "Золото x4 {time}",
    goldenSoon: "Золото через {time}",
    critTap: "КРИТ x{mult}",
    goldenTap: "Золотой тап!",
    player: "Игрок: {name}",
    niceTap: "Хороший тап",
    energyLabel: "Энергия",
    energyEmpty: "Нет энергии",
    authError: "Ошибка авторизации",
    failedLoad: "Не удалось загрузить",
    tryAgain: "Попробуй еще",
    network: "Ошибка сети",
    rateLimited: "Слишком быстро. Помедленнее.",
    antiCheatBlocked: "Античит: автоклик. Подожди {time}"
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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatNumberDots(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value ?? "0");
  const sign = num < 0 ? "-" : "";
  const abs = Math.trunc(Math.abs(num));
  return `${sign}${abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

function formatMultiplier(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 1) return "1";
  return num.toFixed(2).replace(/\.?0+$/, "");
}

function setMeta(key, vars = {}) {
  metaState = { key, vars };
  if (!metaEl) return;
  metaEl.textContent = t(key, vars);
  metaEl.classList.toggle(
    "error",
    key === "energyEmpty" || key === "authError" || key === "antiCheatBlocked"
  );
}

function setMetaText(text) {
  metaState = { key: "custom", vars: {} };
  if (!metaEl) return;
  metaEl.textContent = text;
  metaEl.classList.add("error");
}

function updateTapBuffs() {
  const now = Date.now();
  if (comboBadgeEl) {
    if (comboMultiplier > 1.01 && comboCount > 1) {
      comboBadgeEl.classList.add("show");
      comboBadgeEl.textContent = t("comboLabel", { mult: formatMultiplier(comboMultiplier) });
    } else {
      comboBadgeEl.classList.remove("show");
      comboBadgeEl.textContent = "";
    }
  }

  if (goldenBadgeEl) {
    if (goldenUntil && now < goldenUntil) {
      goldenBadgeEl.classList.add("show", "gold");
      goldenBadgeEl.textContent = t("goldenNow", { time: formatTime(goldenUntil - now) });
      return;
    }
    if (nextGoldenAt && now < nextGoldenAt) {
      goldenBadgeEl.classList.add("show");
      goldenBadgeEl.classList.remove("gold");
      goldenBadgeEl.textContent = t("goldenSoon", { time: formatTime(nextGoldenAt - now) });
      return;
    }
    goldenBadgeEl.classList.remove("show", "gold");
    goldenBadgeEl.textContent = "";
  }
}

function applyCosmeticTheme() {
  if (!panelEl) return;
  PANEL_THEMES.forEach((theme) => panelEl.classList.remove(theme));
  if (tapBtn) TAP_THEMES.forEach((theme) => tapBtn.classList.remove(theme));
  if (equippedCosmetic === "crown") panelEl.classList.add("theme-crown");
  if (equippedCosmetic === "neon") panelEl.classList.add("theme-neon");
  if (equippedCosmetic === "sakura") panelEl.classList.add("theme-sakura");
  if (equippedCosmetic === "void") panelEl.classList.add("theme-void");
  if (equippedCosmetic === "aurora") panelEl.classList.add("theme-aurora");
  if (tapBtn && equippedCosmetic === "crown") tapBtn.classList.add("style-crown");
  if (tapBtn && equippedCosmetic === "neon") tapBtn.classList.add("style-neon");
  if (tapBtn && equippedCosmetic === "sakura") tapBtn.classList.add("style-sakura");
  if (tapBtn && equippedCosmetic === "void") tapBtn.classList.add("style-void");
  if (tapBtn && equippedCosmetic === "aurora") tapBtn.classList.add("style-aurora");
}

function frameClassFromId(frameId) {
  if (!frameId) return "";
  const normalized = String(frameId).replace(/^frame_/, "");
  if (!normalized) return "";
  return `frame-${normalized}`;
}

function avatarInitials(player) {
  const source =
    (player?.name && String(player.name).trim()) ||
    (player?.username && String(player.username).trim()) ||
    "P";
  return source.charAt(0).toUpperCase();
}

function giftRarityClass(rarity) {
  const value = String(rarity || "").toLowerCase();
  if (value === "mythic" || value === "epic" || value === "rare") {
    return `rarity-${value}`;
  }
  return "rarity-common";
}

function renderGiftChips(container, gifts = [], emptyKey = "profileGiftsEmpty", limit = 10) {
  if (!container) return;
  container.innerHTML = "";
  const safeGifts = Array.isArray(gifts) ? gifts.slice(0, limit) : [];
  if (!safeGifts.length) {
    const empty = document.createElement("div");
    empty.className = "gift-chip empty";
    empty.textContent = t(emptyKey);
    container.appendChild(empty);
    return;
  }
  safeGifts.forEach((gift) => {
    const chip = document.createElement("div");
    chip.className = `gift-chip ${giftRarityClass(gift.rarity)}`;
    const titleKey = `${gift.id}Name`;
    const giftName =
      STRINGS[currentLang]?.[titleKey] || STRINGS.en?.[titleKey] || gift.id || "Gift";
    const safeEmoji = escapeHtml(gift.emoji || "🎁");
    const safeGiftName = escapeHtml(giftName);
    chip.innerHTML = `${safeEmoji} ${safeGiftName} <span class="gift-count">${t("giftCount", {
      count: formatNumberDots(gift.count || 0)
    })}</span>`;
    container.appendChild(chip);
  });
}

function updateGiftsFilterButtons() {
  if (giftsFilterAllEl) giftsFilterAllEl.classList.toggle("active", giftsFilter === "all");
  if (giftsFilterRareEl) giftsFilterRareEl.classList.toggle("active", giftsFilter === "rare");
  if (giftsFilterEpicEl) giftsFilterEpicEl.classList.toggle("active", giftsFilter === "epic");
  if (giftsFilterMythicEl) giftsFilterMythicEl.classList.toggle("active", giftsFilter === "mythic");
}

function passesGiftsFilter(gift) {
  const rarity = String(gift?.rarity || "common").toLowerCase();
  if (giftsFilter === "all") return true;
  if (giftsFilter === "rare") return ["rare", "epic", "mythic"].includes(rarity);
  if (giftsFilter === "epic") return ["epic", "mythic"].includes(rarity);
  if (giftsFilter === "mythic") return rarity === "mythic";
  return true;
}

function renderGiftCollection(gifts = []) {
  if (!profileGiftsListEl) return;
  profileGiftsListEl.innerHTML = "";
  const safeGifts = Array.isArray(gifts) ? gifts.filter(passesGiftsFilter) : [];
  if (!safeGifts.length) {
    const empty = document.createElement("div");
    empty.className = "gift-tile-empty";
    empty.textContent = t("profileGiftsEmpty");
    profileGiftsListEl.appendChild(empty);
    return;
  }
  safeGifts.forEach((gift) => {
    const card = document.createElement("article");
    card.className = `gift-tile ${giftRarityClass(gift.rarity)}`;

    const icon = document.createElement("div");
    icon.className = "gift-tile-icon";
    icon.textContent = gift.emoji || "🎁";

    const title = document.createElement("div");
    title.className = "gift-tile-title";
    const titleKey = `${gift.id}Name`;
    title.textContent =
      STRINGS[currentLang]?.[titleKey] || STRINGS.en?.[titleKey] || gift.id || "Gift";

    const count = document.createElement("div");
    count.className = "gift-tile-count";
    count.textContent = t("giftCount", { count: formatNumberDots(gift.count || 0) });

    card.append(icon, title, count);
    profileGiftsListEl.appendChild(card);
  });
}

function setGiftsFilter(nextFilter) {
  const safe = ["all", "rare", "epic", "mythic"].includes(nextFilter) ? nextFilter : "all";
  giftsFilter = safe;
  localStorage.setItem("giftsFilter", giftsFilter);
  updateGiftsFilterButtons();
  renderGiftCollection(profileUser?.gifts || []);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomSlotSymbol() {
  return CASE_SLOT_POOL[Math.floor(Math.random() * CASE_SLOT_POOL.length)] || "🎁";
}

function resolveCaseFinalSymbol(caseReward = {}) {
  if (caseReward?.gift?.emoji) return caseReward.gift.emoji;
  if (caseReward?.unlockedItem?.type === "frame") return "🖼️";
  if (caseReward?.unlockedItem?.type === "cosmetic") return "✨";
  const rarity = String(caseReward?.rarity || "common").toLowerCase();
  if (rarity === "mythic") return "🌈";
  if (rarity === "epic") return "💜";
  if (rarity === "rare") return "💙";
  return "⭐";
}

function buildCaseResultMeta(caseReward = {}) {
  const rarityLabel = t(`rarity_${String(caseReward.rarity || "common").toLowerCase()}`);
  const giftLabel = caseReward.gift?.id
    ? `${caseReward.gift.emoji || "🎁"} ${
        STRINGS[currentLang]?.[`${caseReward.gift.id}Name`] ||
        STRINGS.en?.[`${caseReward.gift.id}Name`] ||
        caseReward.gift.id
      }`
    : "";
  if (caseReward.unlockedItem?.id) {
    const itemTitle = t(`${caseReward.unlockedItem.id}Name`);
    if (giftLabel) {
      return {
        key: "caseOpenedFull",
        vars: {
          rarity: rarityLabel,
          reward: formatNumberDots(caseReward.nfReward || 0),
          item: itemTitle,
          gift: giftLabel
        }
      };
    }
    return {
      key: "caseOpenedWithItem",
      vars: {
        rarity: rarityLabel,
        reward: formatNumberDots(caseReward.nfReward || 0),
        item: itemTitle
      }
    };
  }
  if (giftLabel) {
    return {
      key: "caseOpenedWithGift",
      vars: {
        rarity: rarityLabel,
        reward: formatNumberDots(caseReward.nfReward || 0),
        gift: giftLabel
      }
    };
  }
  return {
    key: "caseOpened",
    vars: {
      rarity: rarityLabel,
      reward: formatNumberDots(caseReward.nfReward || 0)
    }
  };
}

function startCaseAnimation(caseId) {
  if (!caseAnimEl || !caseAnimTitleEl || !caseAnimStatusEl) return null;
  if (!caseSlot1El || !caseSlot2El || !caseSlot3El) return null;
  if (caseAnimationActive) return null;
  caseAnimationActive = true;
  const caseName = t(`${caseId}Name`);
  caseAnimTitleEl.textContent = t("caseAnimOpening", {
    name: caseName === `${caseId}Name` ? caseId : caseName
  });
  caseAnimStatusEl.textContent = t("caseAnimSpinning");
  const slots = [caseSlot1El, caseSlot2El, caseSlot3El];
  slots.forEach((slot) => {
    slot.classList.add("spinning");
    slot.textContent = randomSlotSymbol();
  });
  caseAnimEl.classList.add("open");
  const intervals = slots.map((slot, index) =>
    setInterval(() => {
      slot.textContent = randomSlotSymbol();
    }, 70 + index * 24)
  );
  return {
    startedAt: Date.now(),
    slots,
    intervals
  };
}

async function finishCaseAnimation(
  session,
  { finalSymbol = "🎁", statusText = "", failed = false } = {}
) {
  if (!session) return;
  const minSpinMs = 1200;
  const elapsed = Date.now() - Number(session.startedAt || Date.now());
  if (elapsed < minSpinMs) {
    await sleep(minSpinMs - elapsed);
  }
  const [slot1, slot2, slot3] = session.slots || [];
  const intervals = session.intervals || [];
  if (intervals[0]) clearInterval(intervals[0]);
  if (slot1) {
    slot1.classList.remove("spinning");
    slot1.textContent = randomSlotSymbol();
  }
  await sleep(150);
  if (intervals[1]) clearInterval(intervals[1]);
  if (slot2) {
    slot2.classList.remove("spinning");
    slot2.textContent = randomSlotSymbol();
  }
  await sleep(180);
  if (intervals[2]) clearInterval(intervals[2]);
  if (slot3) {
    slot3.classList.remove("spinning");
    slot3.textContent = finalSymbol;
    slot3.classList.add("hit");
    setTimeout(() => slot3.classList.remove("hit"), 520);
  }
  if (caseAnimStatusEl) {
    caseAnimStatusEl.textContent = statusText;
    caseAnimStatusEl.classList.toggle("error", Boolean(failed));
  }
  await sleep(950);
  if (caseAnimEl) {
    caseAnimEl.classList.remove("open");
  }
  if (caseAnimStatusEl) {
    caseAnimStatusEl.classList.remove("error");
  }
  caseAnimationActive = false;
}

function setUserModalOpen(open) {
  if (!userModalEl) return;
  userModalEl.classList.toggle("open", Boolean(open));
}

function renderUserModalBody(profile) {
  if (!userModalBodyEl) return;
  if (!profile) {
    userModalBodyEl.textContent = t("playerProfileFailed");
    return;
  }
  const frameClass = frameClassFromId(profile.equippedFrame || "");
  const label = profile.name || (profile.username ? `@${profile.username}` : `ID ${profile.id}`);
  const safeLabel = escapeHtml(label);
  const safeId = escapeHtml(profile.id);
  const safeUsername = profile.username ? ` • @${escapeHtml(profile.username)}` : "";
  const tagYou = profile.isYou ? ` (${t("playerProfileYou")})` : "";
  const rankLabel = profile.rank?.id ? t(`rank_${profile.rank.id}`) : "-";
  userModalBodyEl.innerHTML = `
    <div class="user-modal-user">
      <div class="user-modal-avatar ${frameClass}"></div>
      <div>
        <div class="user-modal-name">${safeLabel}${escapeHtml(tagYou)}</div>
        <div class="user-modal-sub">ID ${safeId}${safeUsername}</div>
      </div>
    </div>
    <div class="user-modal-stats">
      <div class="user-modal-stat">
        <div class="user-modal-stat-label">${t("playerProfileRank")}</div>
        <div class="user-modal-stat-value">${rankLabel}</div>
      </div>
      <div class="user-modal-stat">
        <div class="user-modal-stat-label">${t("playerProfileBalance")}</div>
        <div class="user-modal-stat-value">${formatNumberDots(profile.balance || 0)} NF</div>
      </div>
      <div class="user-modal-stat">
        <div class="user-modal-stat-label">${t("playerProfileTapValue")}</div>
        <div class="user-modal-stat-value">+${formatNumberDots(profile.tapValue || 1)}/tap</div>
      </div>
      <div class="user-modal-stat">
        <div class="user-modal-stat-label">${t("playerProfileSeason")}</div>
        <div class="user-modal-stat-value">${formatNumberDots(profile.seasonPoints || 0)}</div>
      </div>
    </div>
    <div class="user-modal-gifts">
      <div class="user-modal-gifts-head">
        <div class="user-modal-gifts-title">${t("playerProfileGifts")}</div>
        <div class="user-modal-gifts-count">${t("playerProfileGiftCount", {
          total: formatNumberDots(profile.giftStats?.total || 0),
          types: formatNumberDots(profile.giftStats?.types || 0)
        })}</div>
      </div>
      <div class="user-modal-gifts-list" id="userModalGifts"></div>
    </div>
  `;
  const avatarEl = userModalBodyEl.querySelector(".user-modal-avatar");
  if (avatarEl) {
    if (profile.avatarUrl) {
      const img = document.createElement("img");
      img.src = profile.avatarUrl;
      img.alt = profile.name || profile.username || "avatar";
      img.referrerPolicy = "no-referrer";
      img.addEventListener("error", () => {
        img.remove();
        avatarEl.textContent = avatarInitials(profile);
      });
      avatarEl.appendChild(img);
    } else {
      avatarEl.textContent = avatarInitials(profile);
    }
  }
  const giftsEl = userModalBodyEl.querySelector("#userModalGifts");
  renderGiftChips(giftsEl, profile.gifts || [], "profileGiftsEmpty", 16);
}

async function openUserProfile(userId) {
  if (!userModalBodyEl || !userModalTitleEl) return;
  const safeUserId = String(userId || "").trim();
  if (!/^\d{3,20}$/.test(safeUserId)) return;
  userModalTitleEl.textContent = t("playerProfileTitle");
  userModalBodyEl.textContent = t("playerProfileLoading");
  setUserModalOpen(true);
  const latestInit = tg?.initData || initData || "";
  if (latestInit && latestInit !== initData) initData = latestInit;
  const headers = {};
  let url = `/api/public-user?userId=${encodeURIComponent(safeUserId)}`;
  if (demoMode) {
    url += `&demoUserId=${encodeURIComponent(demoUserId)}`;
  } else {
    if (!initData) {
      userModalBodyEl.textContent = t("authError");
      return;
    }
    headers["x-init-data"] = initData;
  }
  try {
    const res = await fetch(url, { headers, cache: "no-store" });
    const data = await res.json();
    if (!data?.ok || !data.user) {
      userModalBodyEl.textContent = data?.error || t("playerProfileFailed");
      return;
    }
    renderUserModalBody({ ...data.user, isYou: Boolean(data.isYou) });
  } catch {
    userModalBodyEl.textContent = t("playerProfileFailed");
  }
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
  if (leaderboardModeSeasonEl) leaderboardModeSeasonEl.textContent = t("leaderboardModeSeason");
  if (leaderboardModeAllTimeEl) leaderboardModeAllTimeEl.textContent = t("leaderboardModeAllTime");
  if (profileTitleEl) profileTitleEl.textContent = t("profileTitle");
  if (profileSubtitleEl) profileSubtitleEl.textContent = t("profileSubtitle");
  if (profileGiftsTitleEl) profileGiftsTitleEl.textContent = t("profileGiftsTitle");
  if (giftsPageSubtitleEl) giftsPageSubtitleEl.textContent = t("giftsPageSubtitle");
  if (profileNicknameLabelEl) profileNicknameLabelEl.textContent = t("profileNicknameLabel");
  if (profileAvatarFileLabelEl) profileAvatarFileLabelEl.textContent = t("profileAvatarFileLabel");
  if (profileRefTitleEl) profileRefTitleEl.textContent = t("profileRefTitle");
  if (profileNicknameEl) profileNicknameEl.placeholder = t("profileNicknamePlaceholder");
  if (profileAvatarHintEl) profileAvatarHintEl.textContent = t("profileAvatarHint");
  if (profileRefCopyBtnEl) profileRefCopyBtnEl.textContent = t("profileRefCopy");
  if (donateTitleEl) donateTitleEl.textContent = t("donateTitle");
  if (donateSubtitleEl) donateSubtitleEl.textContent = t("donateSubtitle");
  if (profileSaveBtnEl) profileSaveBtnEl.textContent = t("profileSave");
  if (profileResetBtnEl) profileResetBtnEl.textContent = t("profileReset");
  if (tabTapEl) tabTapEl.textContent = t("tabTap");
  if (tabShopEl) tabShopEl.textContent = t("tabShop");
  if (tabLeaderboardEl) tabLeaderboardEl.textContent = t("tabLeaderboard");
  if (tabProfileEl) tabProfileEl.textContent = t("tabProfile");
  if (tabGiftsEl) tabGiftsEl.textContent = t("tabGifts");
  if (giftsFilterAllEl) giftsFilterAllEl.textContent = t("giftsFilterAll");
  if (giftsFilterRareEl) giftsFilterRareEl.textContent = t("giftsFilterRare");
  if (giftsFilterEpicEl) giftsFilterEpicEl.textContent = t("giftsFilterEpic");
  if (giftsFilterMythicEl) giftsFilterMythicEl.textContent = t("giftsFilterMythic");
  if (userModalTitleEl) userModalTitleEl.textContent = t("playerProfileTitle");
  if (userModalCloseEl) userModalCloseEl.setAttribute("aria-label", t("playerProfileClose"));
  if (langToggle && LANG_META[currentLang]) {
    langToggle.textContent = `${LANG_META[currentLang].flag} ${LANG_LABELS[currentLang]}`;
  }
  if (tapValueEl) tapValueEl.textContent = t("tapValue", { value: formatNumberDots(tapValue) });
  setMeta(metaState.key, metaState.vars);
  updateRank();
  renderLangMenu();
  renderShop();
  renderQuests();
  renderLeaderboardTools();
  renderLeaderboard();
  renderDonatePackages();
  updateGiftsFilterButtons();
  renderProfilePanel(profileUser || { id: currentUserId || "-", name: "", username: "", avatarUrl: "" });
  updateTapBuffs();
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

const storedReferralCode = normalizeReferralCode(localStorage.getItem("launchReferralCode") || "");
const queryReferralCode = normalizeReferralCode(params.get("ref") || params.get("startapp"));
launchReferralCode = queryReferralCode || storedReferralCode || "";
if (queryReferralCode) {
  localStorage.setItem("launchReferralCode", queryReferralCode);
}

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
    if (launchReferralCode) {
      url += `?ref=${encodeURIComponent(launchReferralCode)}`;
    }
    headers["x-init-data"] = initData;
  }
  const res = await fetch(url, { headers, cache: "no-store" });
  return res.json();
}

function updateBalance(value, { bump = true } = {}) {
  const pretty = formatNumberDots(value);
  if (balanceEl) balanceEl.textContent = pretty;
  if (shopBalanceEl) shopBalanceEl.textContent = pretty;
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
  if (tapValueEl) tapValueEl.textContent = t("tapValue", { value: formatNumberDots(tapValue) });
}

function updatePlayerIdentity(user) {
  if (!playerIdEl || !user) return;
  const baseName = user.name || user.username || "Player";
  const base = `${baseName} · ID ${user.id}`;
  const badges = [];
  if (user.equippedCosmetic) badges.push(t(`${user.equippedCosmetic}Name`));
  if (user.equippedFrame) badges.push(t(`${user.equippedFrame}Name`));
  playerIdEl.textContent = badges.length ? `${base} · ${badges.join(" + ")}` : base;
}

function applyTapEffectsState(data = {}) {
  if (typeof data.comboCount === "number") comboCount = data.comboCount;
  if (typeof data.comboMultiplier === "number") comboMultiplier = data.comboMultiplier;
  if (typeof data.goldenUntil === "number") goldenUntil = data.goldenUntil;
  if (typeof data.nextGoldenAt === "number") nextGoldenAt = data.nextGoldenAt;
  updateTapBuffs();
}

function setProfileStatus(keyOrText, isError = false) {
  if (!profileStatusEl) return;
  const isLangKey =
    typeof keyOrText === "string" &&
    (STRINGS[currentLang]?.[keyOrText] || STRINGS.en?.[keyOrText]);
  const text = isLangKey ? t(keyOrText) : String(keyOrText || "");
  profileStatusEl.textContent = text;
  profileStatusEl.classList.toggle("error", isError);
}

function setDonateStatus(keyOrText = "", isError = false) {
  if (!donateStatusEl) return;
  const isLangKey =
    typeof keyOrText === "string" &&
    (STRINGS[currentLang]?.[keyOrText] || STRINGS.en?.[keyOrText]);
  const text = isLangKey ? t(keyOrText) : String(keyOrText || "");
  donateStatusEl.textContent = text;
  donateStatusEl.classList.toggle("error", isError);
}

function clearProfileAvatarFileSelection() {
  profileAvatarFileData = "";
  if (profileAvatarFileEl) profileAvatarFileEl.value = "";
}

function getReferralLink(userId) {
  const id = String(userId || "").trim();
  if (!/^\d{3,20}$/.test(id)) return "";
  const code = `ref_${id}`;
  return `https://t.me/${BOT_USERNAME}?start=${encodeURIComponent(code)}`;
}

function renderDonatePackages() {
  if (!donateListEl) return;
  donateListEl.innerHTML = "";
  if (!donatePackages.length) {
    const empty = document.createElement("div");
    empty.className = "donate-empty";
    empty.textContent = t("donateNotReady");
    donateListEl.appendChild(empty);
    return;
  }

  donatePackages.forEach((pkg) => {
    const card = document.createElement("div");
    card.className = "donate-item";
    const title = document.createElement("div");
    title.className = "donate-item-title";
    const titleKey = `${pkg.id}Name`;
    const localizedTitle = t(titleKey);
    title.textContent =
      localizedTitle === titleKey ? pkg.title || pkg.id : localizedTitle;
    const bonus = document.createElement("div");
    bonus.className = "donate-item-bonus";
    bonus.textContent = t("donateBonus", { bonus: formatNumberDots(pkg.bonusNF || 0) });
    let gift = null;
    if (pkg.giftId) {
      gift = document.createElement("div");
      gift.className = "donate-item-bonus";
      const giftKey = `${pkg.giftId}Name`;
      const giftName =
        STRINGS[currentLang]?.[giftKey] || STRINGS.en?.[giftKey] || pkg.giftId;
      gift.textContent = t("donateGift", {
        emoji: pkg.emoji || "🎁",
        name: giftName
      });
    }
    const btn = document.createElement("button");
    btn.className = "donate-buy";
    btn.type = "button";
    btn.textContent = t("donateBuy", { stars: formatNumberDots(pkg.stars || 0) });
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      try {
        const data = await apiRequest("/api/donate", {
          method: "POST",
          body: JSON.stringify({ packageId: pkg.id })
        });
        if (!data?.ok || !data.invoiceLink) {
          setDonateStatus(data?.error || "donateNotReady", true);
          return;
        }
        if (tg?.openInvoice) {
          tg.openInvoice(data.invoiceLink, (status) => {
            if (status === "paid") {
              setDonateStatus("donatePaid");
              syncProfileSilently({ force: true });
              loadLeaderboard({ force: true, silent: true });
            } else if (status === "cancelled") {
              setDonateStatus("donateCanceled", true);
            } else if (status === "failed") {
              setDonateStatus("donateFailed", true);
            }
          });
        } else {
          window.open(data.invoiceLink, "_blank", "noopener");
        }
      } catch {
        setDonateStatus("network", true);
      } finally {
        btn.disabled = false;
      }
    });
    if (gift) {
      card.append(title, bonus, gift, btn);
    } else {
      card.append(title, bonus, btn);
    }
    donateListEl.appendChild(card);
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(file);
  });
}

function loadImageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode_failed"));
    img.src = dataUrl;
  });
}

async function compressAvatarFile(file) {
  if (!file || !String(file.type || "").startsWith("image/")) {
    throw new Error("avatar_invalid");
  }
  const originalData = await fileToDataUrl(file);
  if (originalData.length <= 160000) return originalData;

  const image = await loadImageFromDataUrl(originalData);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("avatar_invalid");

  const maxSides = [320, 280, 240, 200, 160];
  const qualities = [0.9, 0.82, 0.75, 0.68, 0.6, 0.52];
  for (const maxSide of maxSides) {
    const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * ratio));
    const height = Math.max(1, Math.round(image.height * ratio));
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);
    for (const quality of qualities) {
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (dataUrl.length <= 160000) return dataUrl;
    }
  }
  throw new Error("avatar_too_large");
}

async function handleProfileAvatarFileChange(event) {
  const file = event?.target?.files?.[0];
  if (!file) {
    clearProfileAvatarFileSelection();
    return;
  }
  setProfileStatus("profileAvatarProcessing");
  try {
    const compressed = await compressAvatarFile(file);
    profileAvatarFileData = compressed;
    const preview = {
      ...(profileUser || {}),
      name: String(profileNicknameEl?.value || "").trim() || profileUser?.name || "Player",
      avatarUrl: compressed
    };
    setProfilePreviewAvatar(preview);
    setProfileStatus("profileAvatarReady");
  } catch (error) {
    clearProfileAvatarFileSelection();
    if (String(error?.message || "").includes("too_large")) {
      setProfileStatus("profileAvatarTooLarge", true);
    } else {
      setProfileStatus("profileAvatarFileError", true);
    }
  }
}

function setProfilePreviewAvatar(user) {
  if (!profileAvatarPreviewEl) return;
  const nameBase = user?.name || user?.username || "P";
  const initial = String(nameBase).trim().charAt(0).toUpperCase() || "P";
  profileAvatarPreviewEl.classList.remove("fallback");
  profileAvatarPreviewEl.innerHTML = "";
  if (user?.avatarUrl) {
    const img = document.createElement("img");
    img.src = user.avatarUrl;
    img.alt = user.name || user.username || "avatar";
    img.referrerPolicy = "no-referrer";
    img.addEventListener("error", () => {
      profileAvatarPreviewEl.classList.add("fallback");
      profileAvatarPreviewEl.innerHTML = initial;
    });
    profileAvatarPreviewEl.appendChild(img);
  } else {
    profileAvatarPreviewEl.classList.add("fallback");
    profileAvatarPreviewEl.innerHTML = initial;
  }
}

function renderProfilePanel(user, { refillInputs = false } = {}) {
  if (!user) return;
  profileUser = user;
  if (profileNamePreviewEl) profileNamePreviewEl.textContent = user.name || user.username || "Player";
  if (profileIdPreviewEl) profileIdPreviewEl.textContent = `ID: ${user.id}`;
  setProfilePreviewAvatar(user);
  if (profileGiftsCountEl) {
    profileGiftsCountEl.textContent = t("profileGiftsCount", {
      total: formatNumberDots(user.giftStats?.total || 0),
      types: formatNumberDots(user.giftStats?.types || 0)
    });
  }
  renderGiftCollection(user.gifts || []);
  if (profileRefLinkEl) profileRefLinkEl.value = getReferralLink(user.id);
  if (profileRefStatsEl) {
    profileRefStatsEl.textContent = t("profileRefStats", {
      you: formatNumberDots(REFERRAL_BONUS_YOU),
      friend: formatNumberDots(REFERRAL_BONUS_FRIEND),
      count: formatNumberDots(user.referralsCount || 0)
    });
  }
  if (refillInputs) {
    if (profileNicknameEl) profileNicknameEl.value = user.name || "";
    clearProfileAvatarFileSelection();
  }
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
  setUserModalOpen(false);
  if (screenTapEl) screenTapEl.classList.toggle("active", tab === "tap");
  if (screenShopEl) screenShopEl.classList.toggle("active", tab === "shop");
  if (screenLeaderboardEl) screenLeaderboardEl.classList.toggle("active", tab === "leaderboard");
  if (screenProfileEl) screenProfileEl.classList.toggle("active", tab === "profile");
  if (screenGiftsEl) screenGiftsEl.classList.toggle("active", tab === "gifts");
  if (tabTapEl) tabTapEl.classList.toggle("active", tab === "tap");
  if (tabShopEl) tabShopEl.classList.toggle("active", tab === "shop");
  if (tabLeaderboardEl) tabLeaderboardEl.classList.toggle("active", tab === "leaderboard");
  if (tabProfileEl) tabProfileEl.classList.toggle("active", tab === "profile");
  if (tabGiftsEl) tabGiftsEl.classList.toggle("active", tab === "gifts");
  if (tab === "leaderboard") loadLeaderboard({ force: true, silent: true });
  if (tab === "profile") renderProfilePanel(profileUser, { refillInputs: true });
  if (tab === "gifts") renderProfilePanel(profileUser);
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
      if (item.type === "frame" && equippedFrame === item.id) card.classList.add("equipped");

      const top = document.createElement("div");
      top.className = "shop-item-top";
      const itemTitle = document.createElement("h4");
      itemTitle.textContent = t(`${item.id}Name`);
      const desc = document.createElement("p");
      if (item.type === "boost") {
        desc.textContent = t("boostDesc", { seconds: Math.floor((item.durationMs || 10000) / 1000) });
      } else if (item.type === "case") {
        desc.textContent = t(`${item.id}Desc`);
      } else if (item.type === "cosmetic" || item.type === "frame") {
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
          : `${formatNumberDots(item.price)} ${t("priceTaps")}`;
        btn.textContent = active ? t("boostActive", { time: formatTime(boostUntil - Date.now()) }) : t("buy");
        btn.disabled = active;
      } else if (item.type === "case") {
        leftMeta.textContent = t("openCase");
        rightMeta.textContent = `${formatNumberDots(item.price)} ${t("priceTaps")}`;
        btn.textContent = t("openCase");
        btn.disabled = false;
      } else if (item.type === "cosmetic" || item.type === "frame") {
        const equippedId = item.type === "frame" ? equippedFrame : equippedCosmetic;
        const owned = Number(item.level || 0) >= 1;
        const isEquipped = owned && item.id === equippedId;
        leftMeta.textContent = owned ? t("owned") : t("level", { level: 0, max: 1 });
        rightMeta.textContent = owned
          ? isEquipped
            ? t("equipped")
            : t("equip")
          : `${formatNumberDots(item.price)} ${t("priceTaps")}`;
        btn.textContent = owned ? (isEquipped ? t("equipped") : t("equip")) : t("buy");
        btn.disabled = isEquipped;
      } else {
        leftMeta.textContent = t("level", { level: item.level, max: item.maxLevel });
        rightMeta.textContent =
          item.level >= item.maxLevel
            ? t("owned")
            : `${formatNumberDots(item.price)} ${t("priceTaps")}`;
        btn.textContent = item.level >= item.maxLevel ? t("owned") : t("buy");
        btn.disabled = item.level >= item.maxLevel;
      }
      meta.append(leftMeta, rightMeta);

      btn.addEventListener("click", async () => {
        btn.disabled = true;
        const isCasePurchase = item.type === "case";
        const caseSession = isCasePurchase ? startCaseAnimation(item.id) : null;
        try {
          const data = await apiRequest("/api/buy", {
            method: "POST",
            body: JSON.stringify({ itemId: item.id })
          });
          if (!data.ok) {
            if (caseSession) {
              await finishCaseAnimation(caseSession, {
                finalSymbol: "❌",
                statusText: t("caseAnimFailed"),
                failed: true
              });
            }
            if (["auth_required", "initData missing", "initData invalid", "user missing"].includes(data.error)) {
              setMeta("authError");
            } else if (data.error === "cosmetic_already_equipped" || data.error === "frame_already_equipped") {
              setMeta("equipped");
            } else {
              setMetaText(data.error || t("tryAgain"));
            }
            return;
          }
          const caseMeta = data.caseReward ? buildCaseResultMeta(data.caseReward) : null;
          if (caseSession) {
            await finishCaseAnimation(caseSession, {
              finalSymbol: resolveCaseFinalSymbol(data.caseReward),
              statusText: caseMeta ? t(caseMeta.key, caseMeta.vars) : t("caseAnimFailed"),
              failed: !caseMeta
            });
          }
          updateBalance(data.balance);
          updateTapValue(data.tapValue);
          if (typeof data.boostUntil === "number") boostUntil = data.boostUntil;
          if (typeof data.equippedCosmetic === "string") {
            equippedCosmetic = data.equippedCosmetic;
            applyCosmeticTheme();
          }
          if (typeof data.equippedFrame === "string") {
            equippedFrame = data.equippedFrame;
          }
          await loadShop();
          syncProfileSilently({ force: true });
          if (caseMeta) {
            setMeta(caseMeta.key, caseMeta.vars);
          }
          if (activeTab === "leaderboard") loadLeaderboard({ force: true, silent: true });
        } catch {
          if (caseSession) {
            await finishCaseAnimation(caseSession, {
              finalSymbol: "❌",
              statusText: t("caseAnimFailed"),
              failed: true
            });
          }
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
    desc.textContent = t("questReward", { reward: formatNumberDots(quest.reward) });
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

function renderLeaderboardTools() {
  if (leaderboardModeSeasonEl) {
    leaderboardModeSeasonEl.classList.toggle("active", leaderboardMode === "season");
  }
  if (leaderboardModeAllTimeEl) {
    leaderboardModeAllTimeEl.classList.toggle("active", leaderboardMode === "alltime");
  }
  if (!leaderboardSeasonInfoEl) return;
  if (!leaderboardSeason || !leaderboardSeason.key) {
    leaderboardSeasonInfoEl.textContent = "";
    return;
  }
  const remainingMs = Math.max(
    0,
    Number(leaderboardSeason.endsAt || 0) - Date.now()
  );
  leaderboardSeasonInfoEl.textContent = t("leaderboardSeasonInfo", {
    key: leaderboardSeason.key,
    time: formatTime(remainingMs)
  });
}

function setLeaderboardMode(mode) {
  const nextMode = mode === "alltime" ? "alltime" : "season";
  if (nextMode === leaderboardMode) return;
  leaderboardMode = nextMode;
  localStorage.setItem("leaderboardMode", leaderboardMode);
  renderLeaderboardTools();
  loadLeaderboard({ force: true, silent: true });
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
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute("aria-label", `Open player ${player.id}`);
    if (String(player.id) === String(currentUserId)) row.classList.add("is-you");
    if (player.rank === 1) row.classList.add("top-1");
    if (player.rank === 2) row.classList.add("top-2");
    if (player.rank === 3) row.classList.add("top-3");

    const rank = document.createElement("div");
    rank.className = "leader-rank";
    rank.textContent = player.rank === 1 ? "🏆 #1" : `#${player.rank}`;

    const avatar = document.createElement("div");
    avatar.className = "leader-avatar";
    const frameClass = frameClassFromId(player.equippedFrame || "");
    if (frameClass) avatar.classList.add(frameClass);
    if (player.avatarUrl) {
      const img = document.createElement("img");
      img.src = player.avatarUrl;
      img.alt = player.name || player.username || "avatar";
      img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      img.addEventListener("error", () => {
        img.remove();
        avatar.classList.add("fallback");
        avatar.textContent = avatarInitials(player);
      });
      avatar.appendChild(img);
    } else {
      avatar.classList.add("fallback");
      avatar.textContent = avatarInitials(player);
    }

    const info = document.createElement("div");
    info.className = "leader-info";
    const name = document.createElement("div");
    name.className = "leader-name";
    const label = player.name || (player.username ? `@${player.username}` : `ID ${player.id}`);
    name.textContent = String(player.id) === String(currentUserId) ? `${label} (${t("leaderboardYou")})` : label;
    const sub = document.createElement("div");
    sub.className = "leader-sub";
    const seasonPart = leaderboardMode === "season"
      ? ` • ${formatNumberDots(player.balance || 0)} NF`
      : "";
    sub.textContent = `ID ${player.id} • +${formatNumberDots(player.tapValue || 1)}/tap${seasonPart}`;
    info.append(name, sub);

    const value = document.createElement("div");
    value.className = "leader-value";
    if (leaderboardMode === "season") {
      value.textContent = t("leaderboardSeasonValue", {
        value: formatNumberDots(player.seasonPoints || 0)
      });
    } else {
      value.textContent = t("leaderboardAllTimeValue", {
        value: formatNumberDots(player.balance || 0)
      });
    }

    row.append(rank, avatar, info, value);
    row.addEventListener("click", () => openUserProfile(player.id));
    row.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openUserProfile(player.id);
    });
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
  if (typeof data.equippedFrame === "string") {
    equippedFrame = data.equippedFrame;
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
  let url = `/api/leaderboard?limit=50&mode=${encodeURIComponent(leaderboardMode)}`;
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
    leaderboardSeason = data.season || leaderboardSeason;
    if (data.mode) {
      leaderboardMode = data.mode === "alltime" ? "alltime" : "season";
      localStorage.setItem("leaderboardMode", leaderboardMode);
    }
    renderLeaderboardTools();
    renderLeaderboard();
    lastLeaderboardSyncAt = Date.now();
  } catch {
    if (!silent) setMeta("network");
  } finally {
    isLeaderboardSyncing = false;
  }
}

async function loadDonatePackages({ silent = false } = {}) {
  if (!donateListEl) return;
  try {
    const data = await apiRequest("/api/donate", { method: "POST", body: "{}" });
    if (!data?.ok) {
      donatePackages = [];
      renderDonatePackages();
      if (!silent) setDonateStatus(data?.error || "donateNotReady", true);
      return;
    }
    donatePackages = Array.isArray(data.packages) ? data.packages : [];
    renderDonatePackages();
    if (!silent) setDonateStatus("");
  } catch {
    donatePackages = [];
    renderDonatePackages();
    if (!silent) setDonateStatus("network", true);
  }
}

async function saveProfileChanges({ reset = false } = {}) {
  if (!profileSaveBtnEl || !profileResetBtnEl) return;
  const nickname = String(profileNicknameEl?.value || "").trim();

  if (!reset && (!nickname || nickname.length < 2 || nickname.length > 24)) {
    setProfileStatus("profileNickInvalid", true);
    return;
  }

  profileSaveBtnEl.disabled = true;
  profileResetBtnEl.disabled = true;
  setProfileStatus(reset ? t("profileReset") : t("profileSave"));
  try {
    const payload = reset
      ? { resetNickname: true, resetAvatar: true }
      : { nickname };
    if (!reset && profileAvatarFileData) {
      payload.avatarUrl = profileAvatarFileData;
    }
    const data = await apiRequest("/api/profile", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    if (!data?.ok || !data.user) {
      if (data?.error === "no_changes") {
        setProfileStatus("profileNoChanges", true);
      } else if (data?.error && data.error.startsWith("nickname")) {
        setProfileStatus("profileNickInvalid", true);
      } else if (data?.error && data.error.startsWith("avatar")) {
        setProfileStatus("profileAvatarInvalid", true);
      } else {
        setProfileStatus(data?.error || t("profileSaveError"), true);
      }
      return;
    }

    renderProfilePanel(data.user, { refillInputs: true });
    updatePlayerIdentity(data.user);
    setMeta("player", { name: data.user.name });
    if (activeTab === "leaderboard") {
      loadLeaderboard({ force: true, silent: true });
    }
    clearProfileAvatarFileSelection();
    setProfileStatus(reset ? "profileResetDone" : "profileSaved");
  } catch {
    setProfileStatus("profileSaveError", true);
  } finally {
    profileSaveBtnEl.disabled = false;
    profileResetBtnEl.disabled = false;
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

    if (profile.welcomeBonus) {
      setMeta("welcomeBonus", { amount: formatNumberDots(profile.welcomeBonus) });
    } else if (profile.referral?.newUserBonus) {
      setMeta("referralApplied", { amount: formatNumberDots(profile.referral.newUserBonus) });
    } else {
      setMeta("player", { name: profile.user.name });
    }
    if (profile.referral?.newUserBonus) {
      launchReferralCode = "";
      localStorage.removeItem("launchReferralCode");
    }
    currentUserId = String(profile.user.id || "");
    profileUser = profile.user;
    updateBalance(profile.user.balance);
    updateTapValue(profile.user.tapValue || 1);
    updatePlayerIdentity(profile.user);
    applyTapEffectsState(profile.user);
    renderProfilePanel(profile.user, { refillInputs: true });
    lastDailyTs = profile.user.lastDailyTs || 0;
    boostUntil = profile.user.boostUntil || 0;
    rankState = profile.user.rank || null;
    if (typeof profile.user.equippedCosmetic === "string") {
      equippedCosmetic = profile.user.equippedCosmetic;
      applyCosmeticTheme();
    }
    if (typeof profile.user.equippedFrame === "string") {
      equippedFrame = profile.user.equippedFrame;
    }
    updateEnergy(profile.user.energy, profile.user.maxEnergy, profile.user.energyRegen);
    updateDailyStatus();
    await loadShop();
    await loadQuests();
    await loadLeaderboard({ force: true, silent: true });
    await loadDonatePackages({ silent: true });
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
    profileUser = profile.user;
    updateBalance(profile.user.balance, { bump: false });
    updateTapValue(profile.user.tapValue || 1);
    updatePlayerIdentity(profile.user);
    applyTapEffectsState(profile.user);
    renderProfilePanel(profile.user);
    rankState = profile.user.rank || rankState;
    updateRank();
    if (typeof profile.user.energy === "number") {
      updateEnergy(profile.user.energy, profile.user.maxEnergy, profile.user.energyRegen);
    }
    if (typeof profile.user.equippedCosmetic === "string") {
      equippedCosmetic = profile.user.equippedCosmetic;
      applyCosmeticTheme();
    }
    if (typeof profile.user.equippedFrame === "string") {
      equippedFrame = profile.user.equippedFrame;
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
    loadDonatePackages({ silent: true });
  }
});

window.addEventListener("focus", () => {
  syncProfileSilently({ force: true });
  loadLeaderboard({ force: true, silent: true });
  loadDonatePackages({ silent: true });
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
if (tabProfileEl) tabProfileEl.addEventListener("click", () => setActiveTab("profile"));
if (tabGiftsEl) tabGiftsEl.addEventListener("click", () => setActiveTab("gifts"));
if (leaderboardModeSeasonEl) leaderboardModeSeasonEl.addEventListener("click", () => setLeaderboardMode("season"));
if (leaderboardModeAllTimeEl) leaderboardModeAllTimeEl.addEventListener("click", () => setLeaderboardMode("alltime"));
if (giftsFilterAllEl) giftsFilterAllEl.addEventListener("click", () => setGiftsFilter("all"));
if (giftsFilterRareEl) giftsFilterRareEl.addEventListener("click", () => setGiftsFilter("rare"));
if (giftsFilterEpicEl) giftsFilterEpicEl.addEventListener("click", () => setGiftsFilter("epic"));
if (giftsFilterMythicEl) giftsFilterMythicEl.addEventListener("click", () => setGiftsFilter("mythic"));
setActiveTab("tap");

if (profileSaveBtnEl) {
  profileSaveBtnEl.addEventListener("click", () => saveProfileChanges({ reset: false }));
}
if (profileResetBtnEl) {
  profileResetBtnEl.addEventListener("click", () => saveProfileChanges({ reset: true }));
}
if (profileAvatarFileEl) {
  profileAvatarFileEl.addEventListener("change", handleProfileAvatarFileChange);
}
if (profileNicknameEl) {
  profileNicknameEl.addEventListener("input", () => {
    const candidateName = String(profileNicknameEl.value || "").trim();
    if (profileNamePreviewEl && candidateName) profileNamePreviewEl.textContent = candidateName;
    if (profileAvatarPreviewEl && profileAvatarPreviewEl.classList.contains("fallback")) {
      const initial = candidateName.charAt(0).toUpperCase() || "P";
      profileAvatarPreviewEl.textContent = initial;
    }
  });
}
if (profileRefCopyBtnEl) {
  profileRefCopyBtnEl.addEventListener("click", async () => {
    const value = String(profileRefLinkEl?.value || "").trim();
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setProfileStatus("profileRefCopied");
    } catch {
      setProfileStatus(value);
    }
  });
}
if (userModalCloseEl) {
  userModalCloseEl.addEventListener("click", () => setUserModalOpen(false));
}
if (userModalEl) {
  userModalEl.addEventListener("click", (event) => {
    if (event.target === userModalEl) {
      setUserModalOpen(false);
    }
  });
}

document.addEventListener("click", (event) => {
  if (!langMenuEl) return;
  if (langMenuEl.contains(event.target)) return;
  langMenuEl.classList.remove("open");
  if (langToggle) langToggle.setAttribute("aria-expanded", "false");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setUserModalOpen(false);
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
      } else if (data.error === "anticheat_blocked") {
        const remainMs = Math.max(
          1000,
          Number(data.blockedUntil || 0) - Date.now()
        );
        setMeta("antiCheatBlocked", { time: formatTime(remainMs) });
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
    applyTapEffectsState(data);
    if (typeof data.boostUntil === "number") boostUntil = data.boostUntil;
    if (data.critHit) {
      setMeta("critTap", { mult: formatMultiplier(data.critMultiplier || 1) });
    } else if (data.goldenActive) {
      setMeta("goldenTap");
    } else {
      setMeta("niceTap");
    }
    const mult = data.multiplier || 1;
    const prefix = data.critHit ? "CRIT " : data.goldenActive ? "GOLD " : "";
    showSpark(`${prefix}+${formatNumberDots((data.tapValue || 1) * count * mult)}`, point);
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
  updateTapBuffs();
  renderLeaderboardTools();
  if (boostUntil && Date.now() < boostUntil) renderShop();
  syncProfileSilently();
  if (activeTab === "leaderboard") loadLeaderboard({ silent: true });
}, 1000);
