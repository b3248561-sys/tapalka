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
const screenSquadsEl = document.getElementById("screenSquads");
const screenProfileEl = document.getElementById("screenProfile");
const screenSupportEl = document.getElementById("screenSupport");
const screenGiftsEl = document.getElementById("screenGifts");
const tabsEl = document.getElementById("tabs");
const tabTapEl = document.getElementById("tabTap");
const tabShopEl = document.getElementById("tabShop");
const tabLeaderboardEl = document.getElementById("tabLeaderboard");
const tabSquadsEl = document.getElementById("tabSquads");
const tabProfileEl = document.getElementById("tabProfile");
const tabSupportEl = document.getElementById("tabSupport");
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
const caseAnimConfirmEl = document.getElementById("caseAnimConfirm");
const caseAnimCloseEl = document.getElementById("caseAnimClose");
const dailyTitleEl = document.getElementById("dailyTitle");
const dailySubtitleEl = document.getElementById("dailySubtitle");
const dailyBtnEl = document.getElementById("dailyBtn");
const dailyStatusEl = document.getElementById("dailyStatus");
const dailyStreakEl = document.getElementById("dailyStreak");
const miningTitleEl = document.getElementById("miningTitle");
const miningSubtitleEl = document.getElementById("miningSubtitle");
const miningBtnEl = document.getElementById("miningBtn");
const miningStatusEl = document.getElementById("miningStatus");
const squadsTitleEl = document.getElementById("squadsTitle");
const squadsSubtitleEl = document.getElementById("squadsSubtitle");
const squadNameInputEl = document.getElementById("squadNameInput");
const squadPrivateInputEl = document.getElementById("squadPrivateInput");
const squadPrivateLabelEl = document.getElementById("squadPrivateLabel");
const squadIdInputEl = document.getElementById("squadIdInput");
const squadCreateBtnEl = document.getElementById("squadCreateBtn");
const squadJoinBtnEl = document.getElementById("squadJoinBtn");
const squadLeaveBtnEl = document.getElementById("squadLeaveBtn");
const squadRefreshBtnEl = document.getElementById("squadRefreshBtn");
const squadStatusEl = document.getElementById("squadStatus");
const squadCurrentEl = document.getElementById("squadCurrent");
const squadCreateFeeEl = document.getElementById("squadCreateFee");
const squadBonusEl = document.getElementById("squadBonus");
const squadPendingTitleEl = document.getElementById("squadPendingTitle");
const squadPendingListEl = document.getElementById("squadPendingList");
const squadMembersTitleEl = document.getElementById("squadMembersTitle");
const squadMembersEl = document.getElementById("squadMembers");
const squadListTitleEl = document.getElementById("squadListTitle");
const squadListEl = document.getElementById("squadList");
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
let dailyStreakState = { count: 0, best: 0, max: 7, bonusPct: 0, milestoneBonus: 0 };
let miningState = null;
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
let displayedBalance = 0;
let lastTapPoint = null;
let comboCount = 0;
let comboMultiplier = 1;
let goldenUntil = 0;
let nextGoldenAt = 0;
let profileUser = null;
let profileAvatarFileData = "";
let donatePackages = [];
let starsEnabled = true;
let squadCreateCost = 250000;
let squadsState = [];
let currentSquadState = null;
let launchReferralCode = "";
const BOT_USERNAME = "Nleo2bot";
const REFERRAL_BONUS_YOU = 1200;
const REFERRAL_BONUS_FRIEND = 2200;
const REFERRAL_BONUS_LEVEL2 = 450;
let giftsFilter = ["all", "rare", "epic", "mythic"].includes(localStorage.getItem("giftsFilter"))
  ? localStorage.getItem("giftsFilter")
  : "all";
let caseAnimationActive = false;
const CASE_SLOT_POOL = ["◈", "✦", "◆", "◎", "✶", "⬢", "▣", "⬥", "◇", "✧", "◉", "○"];
let caseSpinSession = null;
let isSquadsSyncing = false;
let lastSquadsSyncAt = 0;
let isMiningSyncing = false;
let lastMiningSyncAt = 0;
let lastSparkAt = 0;
let activeSparks = 0;
let lastShopRenderAt = 0;
let dockTabsRaf = 0;
let dockStylesApplied = false;
let lastDockBottomPx = -1;
let tapQueueCount = 0;
let tapFlushTimer = 0;
let isTapRequestInFlight = false;
let queuedTapPoint = null;
let lastHapticAt = 0;

const UI_TICK_MS = 1000;
const PROFILE_SYNC_INTERVAL_MS = 8000;
const LEADERBOARD_SYNC_INTERVAL_MS = 10000;
const SQUADS_SYNC_INTERVAL_MS = 12000;
const MINING_SYNC_INTERVAL_MS = 12000;
const SHOP_BOOST_RERENDER_MS = 3000;
const SPARK_MIN_INTERVAL_MS = 70;
const SPARK_MAX_ACTIVE = 10;
const TAP_BATCH_WINDOW_MS = 150;
const TAP_BATCH_MAX_COUNT = 8;
const HAPTIC_MIN_INTERVAL_MS = 120;

const isMobileViewport = window.matchMedia?.("(max-width: 720px)")?.matches || false;
const isLowPerfDevice =
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ||
  isMobileViewport ||
  (typeof navigator !== "undefined" && Number(navigator.hardwareConcurrency || 8) <= 4) ||
  (typeof navigator !== "undefined" && Number(navigator.deviceMemory || 8) <= 4);
if (isLowPerfDevice) {
  document.documentElement.classList.add("low-perf");
}

const SHOP_CATEGORY_ORDER = ["power", "energy", "cosmetic", "frame", "special"];
const PANEL_THEMES = ["theme-crown", "theme-neon", "theme-sakura", "theme-void", "theme-aurora"];
const TAP_THEMES = ["style-crown", "style-neon", "style-sakura", "style-void", "style-aurora"];
const GIFT_ICON_MARK_BY_ID = {
  gift_lucky_clover: "✿",
  gift_prism_orb: "◉",
  gift_neon_phoenix: "✧",
  gift_cyber_crown: "♔",
  gift_star_whale: "✶",
  gift_solar_dragon: "⬥"
};
const GIFT_CASE_SYMBOL_BY_ID = {
  gift_lucky_clover: "◎",
  gift_prism_orb: "◉",
  gift_neon_phoenix: "✶",
  gift_cyber_crown: "◆",
  gift_star_whale: "⬢",
  gift_solar_dragon: "✦"
};

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
    tabSquads: "Squads",
    tabProfile: "Profile",
    tabSupport: "Support",
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
    dailyStreak: "Streak {count}/{max} • +{bonus}%",
    dailyStreakReady: "Streak {count}/{max} • milestone reward ready",
    dailyClaimed: "Daily reward +{amount} NF",
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
    case_luckyDesc: "Risky case with random reward",
    case_royalName: "Royal Case",
    case_royalDesc: "Premium risky case with rare drops",
    openCase: "Open",
    caseOpened: "{rarity} • +{reward} NF",
    caseOpenedWithItem: "{rarity} • +{reward} NF + {item}",
    caseOpenedWithGift: "{rarity} • +{reward} NF + gift {gift}",
    caseOpenedFull: "{rarity} • +{reward} NF + {item} + gift {gift}",
    caseAnimOpening: "Opening {name}",
    caseAnimReady: "Press Open to spin",
    caseAnimSpinning: "Slots spinning...",
    caseAnimFailed: "Could not open case",
    caseAnimClose: "Close",
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
    profileRefStats: "You: +{you} NF • Friend: +{friend} NF • L2: +{level2} NF • Invited: {count}",
    miningTitle: "Mining",
    miningSubtitle: "Passive income while you are away",
    miningClaim: "Claim Mining",
    miningReady: "Stored: {stored}/{capacity} NF • {rate}/h",
    miningWait: "Stored: {stored}/{capacity} NF • full in {time}",
    miningCollected: "Mining +{amount} NF",
    miningNotReady: "Mining is empty",
    squadsTitle: "Squads",
    squadsSubtitle: "Create or join a squad",
    squadCreateFee: "Create cost: {cost} NF",
    squadPrivateLabel: "Private squad (join by approval)",
    squadMembersTitle: "Your members",
    squadPendingTitle: "Join requests",
    squadListTitle: "Top squads",
    squadBonusNone: "Bonus: not active. Join a squad to unlock boost",
    squadBonusValue: "Squad bonus: +{percent}% to passive mining",
    squadNoMembers: "No members yet",
    squadNoPending: "No pending requests",
    squadCreate: "Create",
    squadJoin: "Join",
    squadJoinRequest: "Request",
    squadJoinRequested: "Requested",
    squadLeave: "Leave",
    squadRefresh: "Refresh list",
    squadJoinLocked: "Locked",
    squadApprove: "Approve",
    squadReject: "Reject",
    squadYou: "Your squad",
    squadTypePrivate: "private",
    squadTypePublic: "public",
    squadMembers: "{count} members",
    squadNamePlaceholder: "Squad name",
    squadIdPlaceholder: "sq_xxxxxx",
    squadsEmpty: "No squads yet",
    squadCurrent: "Your squad: {name} ({id}) • {privacy} • members {count}",
    squadCreated: "Squad created",
    squadJoined: "Joined squad",
    squadJoinRequestSent: "Request sent. Wait for owner approval",
    squadLeft: "Left squad",
    squadRequestApproved: "Request approved",
    squadRequestRejected: "Request rejected",
    squadErrorAlreadyIn: "You are already in a squad",
    squadErrorNotFound: "Squad not found",
    squadErrorFull: "Squad is full",
    squadErrorInvalidId: "Invalid squad ID",
    squadErrorNameShort: "Name is too short (min 3)",
    squadErrorNameLong: "Name is too long (max 24)",
    squadErrorNameInvalid: "Use letters and numbers only",
    squadErrorNotInSquad: "You are not in a squad",
    squadErrorInsufficient: "Need at least {cost} NF to create a squad",
    squadErrorRequestExists: "Request already sent",
    squadErrorNotOwner: "Only squad owner can manage requests",
    squadErrorRequestNotFound: "Request not found",
    squadErrorUserInvalid: "Invalid user in request",
    squadErrorUserNotFound: "User not found",
    squadErrorTargetBusy: "User is already in another squad",
    donateTitle: "Support project",
    donateSubtitle: "Telegram Stars packs (non pay-to-win)",
    support_sName: "Starter Support",
    support_mName: "Creator Support",
    support_lName: "Legend Support",
    donateBuy: "Support for {stars} Stars",
    donateBonus: "Bonus +{bonus} NF",
    donateGift: "Gift: {name}",
    donatePaid: "Thanks for support",
    donateCanceled: "Payment canceled",
    donateFailed: "Payment failed",
    donateNotReady: "Stars unavailable",
    donateDisabled: "Payments are temporarily disabled by admin",
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
    tabSquads: "Сквады",
    tabProfile: "Профиль",
    tabSupport: "Поддержать",
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
    dailyStreak: "Серия {count}/{max} • +{bonus}%",
    dailyStreakReady: "Серия {count}/{max} • готова награда этапа",
    dailyClaimed: "Ежедневная награда +{amount} NF",
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
    case_luckyDesc: "Рисковый кейс со случайной наградой",
    case_royalName: "Королевский кейс",
    case_royalDesc: "Премиум рисковый кейс с редкими дропами",
    openCase: "Открыть",
    caseOpened: "{rarity} • +{reward} NF",
    caseOpenedWithItem: "{rarity} • +{reward} NF + {item}",
    caseOpenedWithGift: "{rarity} • +{reward} NF + подарок {gift}",
    caseOpenedFull: "{rarity} • +{reward} NF + {item} + подарок {gift}",
    caseAnimOpening: "Открываем {name}",
    caseAnimReady: "Нажми «Открыть», чтобы крутить",
    caseAnimSpinning: "Слоты крутятся...",
    caseAnimFailed: "Не удалось открыть кейс",
    caseAnimClose: "Закрыть",
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
    profileRefStats: "Тебе: +{you} NF • Другу: +{friend} NF • L2: +{level2} NF • Приглашено: {count}",
    miningTitle: "Майнинг",
    miningSubtitle: "Пассивный доход, пока тебя нет",
    miningClaim: "Забрать майнинг",
    miningReady: "Накоплено: {stored}/{capacity} NF • {rate}/ч",
    miningWait: "Накоплено: {stored}/{capacity} NF • до фула {time}",
    miningCollected: "Майнинг +{amount} NF",
    miningNotReady: "Майнинг пуст",
    squadsTitle: "Сквады",
    squadsSubtitle: "Создай или вступи в сквад",
    squadCreateFee: "Создание: {cost} NF",
    squadPrivateLabel: "Приватный сквад (вход по одобрению)",
    squadMembersTitle: "Участники твоего сквада",
    squadPendingTitle: "Заявки на вступление",
    squadListTitle: "Топ сквадов",
    squadBonusNone: "Бонус не активен. Вступи в сквад для буста",
    squadBonusValue: "Бонус сквада: +{percent}% к пассивному майнингу",
    squadNoMembers: "Пока нет участников",
    squadNoPending: "Нет активных заявок",
    squadCreate: "Создать",
    squadJoin: "Вступить",
    squadJoinRequest: "Запрос",
    squadJoinRequested: "Заявка отправлена",
    squadLeave: "Выйти",
    squadRefresh: "Обновить список",
    squadJoinLocked: "Недоступно",
    squadApprove: "Принять",
    squadReject: "Отклонить",
    squadYou: "Твой сквад",
    squadTypePrivate: "приватный",
    squadTypePublic: "открытый",
    squadMembers: "{count} участников",
    squadNamePlaceholder: "Название сквада",
    squadIdPlaceholder: "sq_xxxxxx",
    squadsEmpty: "Пока нет сквадов",
    squadCurrent: "Твой сквад: {name} ({id}) • {privacy} • участников {count}",
    squadCreated: "Сквад создан",
    squadJoined: "Вступление успешно",
    squadJoinRequestSent: "Заявка отправлена. Жди одобрения владельца",
    squadLeft: "Ты вышел из сквада",
    squadRequestApproved: "Заявка одобрена",
    squadRequestRejected: "Заявка отклонена",
    squadErrorAlreadyIn: "Ты уже в скваде",
    squadErrorNotFound: "Сквад не найден",
    squadErrorFull: "Сквад заполнен",
    squadErrorInvalidId: "Некорректный ID сквада",
    squadErrorNameShort: "Название слишком короткое (минимум 3)",
    squadErrorNameLong: "Название слишком длинное (максимум 24)",
    squadErrorNameInvalid: "Только буквы, цифры и пробелы",
    squadErrorNotInSquad: "Ты сейчас не в скваде",
    squadErrorInsufficient: "Нужно минимум {cost} NF для создания сквада",
    squadErrorRequestExists: "Заявка уже отправлена",
    squadErrorNotOwner: "Только владелец сквада может управлять заявками",
    squadErrorRequestNotFound: "Заявка не найдена",
    squadErrorUserInvalid: "Некорректный пользователь в заявке",
    squadErrorUserNotFound: "Пользователь не найден",
    squadErrorTargetBusy: "Пользователь уже в другом скваде",
    donateTitle: "Поддержка проекта",
    donateSubtitle: "Пакеты Telegram Stars (без pay-to-win)",
    support_sName: "Стартовая поддержка",
    support_mName: "Поддержка создателя",
    support_lName: "Легендарная поддержка",
    donateBuy: "Поддержать за {stars} Stars",
    donateBonus: "Бонус +{bonus} NF",
    donateGift: "Подарок: {name}",
    donatePaid: "Спасибо за поддержку",
    donateCanceled: "Оплата отменена",
    donateFailed: "Оплата не прошла",
    donateNotReady: "Stars пока недоступны",
    donateDisabled: "Платежи временно отключены админом",
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

function giftIconClassFromId(giftId) {
  const normalized = String(giftId || "")
    .trim()
    .replace(/^gift_/, "")
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]/gi, "");
  return normalized ? `gift-icon-${normalized}` : "gift-icon-default";
}

function giftIconMarkFromId(giftId) {
  return GIFT_ICON_MARK_BY_ID[String(giftId || "").trim()] || "◈";
}

function createGiftIconElement(giftId, size = "sm") {
  const icon = document.createElement("span");
  icon.className = `gift-icon gift-icon-${size} ${giftIconClassFromId(giftId)}`;
  const mark = document.createElement("span");
  mark.className = "gift-icon-mark";
  mark.textContent = giftIconMarkFromId(giftId);
  icon.appendChild(mark);
  return icon;
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
    const main = document.createElement("span");
    main.className = "gift-chip-main";
    main.appendChild(createGiftIconElement(gift.id, "xs"));
    const name = document.createElement("span");
    name.className = "gift-chip-name";
    name.textContent = giftName;
    main.appendChild(name);
    const count = document.createElement("span");
    count.className = "gift-count";
    count.textContent = t("giftCount", { count: formatNumberDots(gift.count || 0) });
    chip.append(main, count);
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
    icon.appendChild(createGiftIconElement(gift.id, "lg"));

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
  return CASE_SLOT_POOL[Math.floor(Math.random() * CASE_SLOT_POOL.length)] || "◈";
}

function resolveCaseFinalSymbol(caseReward = {}) {
  if (caseReward?.gift?.id) {
    return GIFT_CASE_SYMBOL_BY_ID[caseReward.gift.id] || "◉";
  }
  if (caseReward?.unlockedItem?.type === "frame") return "▣";
  if (caseReward?.unlockedItem?.type === "cosmetic") return "◆";
  const rarity = String(caseReward?.rarity || "common").toLowerCase();
  if (rarity === "mythic") return "✦";
  if (rarity === "epic") return "✶";
  if (rarity === "rare") return "◈";
  return "○";
}

function resolveCaseFinalSymbols(caseReward = {}) {
  const main = resolveCaseFinalSymbol(caseReward);
  const pickOther = () => {
    let value = randomSlotSymbol();
    if (value === main) {
      value = CASE_SLOT_POOL.find((candidate) => candidate !== main) || "◈";
    }
    return value;
  };
  const rarity = String(caseReward?.rarity || "common").toLowerCase();
  if (rarity === "mythic") return [main, main, main];
  if (rarity === "epic") return [main, main, pickOther()];
  if (rarity === "rare") return [pickOther(), main, main];
  return [pickOther(), main, pickOther()];
}

function buildCaseResultMeta(caseReward = {}) {
  const rarityLabel = t(`rarity_${String(caseReward.rarity || "common").toLowerCase()}`);
  const giftLabel = caseReward.gift?.id
    ? `${
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

function closeCaseAnimation() {
  if (caseSpinSession?.intervals?.length) {
    caseSpinSession.intervals.forEach((id) => clearInterval(id));
  }
  caseSpinSession = null;
  if (caseAnimEl) caseAnimEl.classList.remove("open");
  if (caseAnimStatusEl) caseAnimStatusEl.classList.remove("error");
  caseAnimationActive = false;
}

async function askCaseOpenConfirmation(caseId) {
  if (!caseAnimEl || !caseAnimTitleEl || !caseAnimStatusEl) return false;
  if (!caseSlot1El || !caseSlot2El || !caseSlot3El) return false;
  if (!caseAnimConfirmEl || !caseAnimCloseEl) return false;
  if (caseAnimationActive) return false;
  caseAnimationActive = true;
  const caseName = t(`${caseId}Name`);
  caseAnimTitleEl.textContent = t("caseAnimOpening", {
    name: caseName === `${caseId}Name` ? caseId : caseName
  });
  caseAnimStatusEl.textContent = t("caseAnimReady");
  caseAnimStatusEl.classList.remove("error");
  const slots = [caseSlot1El, caseSlot2El, caseSlot3El];
  slots.forEach((slot) => {
    slot.classList.remove("spinning", "hit");
    slot.textContent = randomSlotSymbol();
  });
  caseAnimConfirmEl.textContent = t("openCase");
  caseAnimCloseEl.textContent = t("caseAnimClose");
  caseAnimConfirmEl.disabled = false;
  caseAnimCloseEl.disabled = false;
  caseAnimConfirmEl.style.display = "";
  caseAnimCloseEl.style.display = "";
  caseAnimEl.classList.add("open");
  return new Promise((resolve) => {
    const cleanup = () => {
      caseAnimConfirmEl.removeEventListener("click", onConfirm);
      caseAnimCloseEl.removeEventListener("click", onClose);
    };
    const onConfirm = () => {
      cleanup();
      resolve(true);
    };
    const onClose = () => {
      cleanup();
      closeCaseAnimation();
      resolve(false);
    };
    caseAnimConfirmEl.addEventListener("click", onConfirm);
    caseAnimCloseEl.addEventListener("click", onClose);
  });
}

function startCaseSpin() {
  if (!caseSlot1El || !caseSlot2El || !caseSlot3El) return null;
  const slots = [caseSlot1El, caseSlot2El, caseSlot3El];
  if (caseAnimStatusEl) {
    caseAnimStatusEl.textContent = t("caseAnimSpinning");
    caseAnimStatusEl.classList.remove("error");
  }
  if (caseAnimConfirmEl) caseAnimConfirmEl.style.display = "none";
  if (caseAnimCloseEl) caseAnimCloseEl.style.display = "none";
  slots.forEach((slot) => {
    slot.classList.remove("hit");
    slot.classList.add("spinning");
  });
  const intervals = slots.map((slot, index) =>
    setInterval(() => {
      slot.textContent = randomSlotSymbol();
    }, 70 + index * 24)
  );
  caseSpinSession = {
    startedAt: Date.now(),
    slots,
    intervals
  };
  return caseSpinSession;
}

async function finishCaseAnimation(
  session,
  { finalSymbols = ["◈", "◈", "◈"], statusText = "", failed = false } = {}
) {
  if (!session) return;
  const minSpinMs = 1500;
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
    slot3.textContent = finalSymbols[2] || "◈";
    slot3.classList.add("hit");
    setTimeout(() => slot3.classList.remove("hit"), 520);
  }
  if (slot1) slot1.textContent = finalSymbols[0] || slot1.textContent;
  if (slot2) slot2.textContent = finalSymbols[1] || slot2.textContent;
  if (caseAnimStatusEl) {
    caseAnimStatusEl.textContent = statusText;
    caseAnimStatusEl.classList.toggle("error", Boolean(failed));
  }
  if (caseAnimCloseEl) {
    caseAnimCloseEl.textContent = t("caseAnimClose");
    caseAnimCloseEl.disabled = false;
    caseAnimCloseEl.style.display = "";
  }
  await new Promise((resolve) => {
    if (!caseAnimCloseEl) {
      resolve();
      return;
    }
    const onClose = () => {
      caseAnimCloseEl.removeEventListener("click", onClose);
      resolve();
    };
    caseAnimCloseEl.addEventListener("click", onClose);
  });
  closeCaseAnimation();
}

function failCaseAnimationPreview(text = "") {
  if (!caseAnimStatusEl) return;
  caseAnimStatusEl.textContent = text || t("caseAnimFailed");
  caseAnimStatusEl.classList.add("error");
  if (caseAnimCloseEl) {
    caseAnimCloseEl.textContent = t("caseAnimClose");
    caseAnimCloseEl.style.display = "";
    caseAnimCloseEl.disabled = false;
    const onClose = () => {
      caseAnimCloseEl.removeEventListener("click", onClose);
      closeCaseAnimation();
    };
    caseAnimCloseEl.addEventListener("click", onClose);
  }
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
  if (miningTitleEl) miningTitleEl.textContent = t("miningTitle");
  if (miningSubtitleEl) miningSubtitleEl.textContent = t("miningSubtitle");
  if (miningBtnEl) miningBtnEl.textContent = t("miningClaim");
  if (squadsTitleEl) squadsTitleEl.textContent = t("squadsTitle");
  if (squadsSubtitleEl) squadsSubtitleEl.textContent = t("squadsSubtitle");
  if (squadCreateFeeEl) {
    squadCreateFeeEl.textContent = t("squadCreateFee", { cost: formatNumberDots(squadCreateCost) });
  }
  if (squadPrivateLabelEl) squadPrivateLabelEl.textContent = t("squadPrivateLabel");
  if (squadCreateBtnEl) squadCreateBtnEl.textContent = t("squadCreate");
  if (squadJoinBtnEl) squadJoinBtnEl.textContent = t("squadJoin");
  if (squadLeaveBtnEl) squadLeaveBtnEl.textContent = t("squadLeave");
  if (squadRefreshBtnEl) squadRefreshBtnEl.textContent = t("squadRefresh");
  if (squadPendingTitleEl) squadPendingTitleEl.textContent = t("squadPendingTitle");
  if (squadMembersTitleEl) squadMembersTitleEl.textContent = t("squadMembersTitle");
  if (squadListTitleEl) squadListTitleEl.textContent = t("squadListTitle");
  if (squadNameInputEl) squadNameInputEl.placeholder = t("squadNamePlaceholder");
  if (squadIdInputEl) squadIdInputEl.placeholder = t("squadIdPlaceholder");
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
  if (tabSquadsEl) tabSquadsEl.textContent = t("tabSquads");
  if (tabProfileEl) tabProfileEl.textContent = t("tabProfile");
  if (tabSupportEl) tabSupportEl.textContent = t("tabSupport");
  if (tabGiftsEl) tabGiftsEl.textContent = t("tabGifts");
  if (caseAnimConfirmEl) caseAnimConfirmEl.textContent = t("openCase");
  if (caseAnimCloseEl) caseAnimCloseEl.textContent = t("caseAnimClose");
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
  renderMining();
  renderSquads();
  updateGiftsFilterButtons();
  renderProfilePanel(profileUser || { id: currentUserId || "-", name: "", username: "", avatarUrl: "" });
  updateTapBuffs();
  updateDailyStatus();
  updateDailyStreakView();
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

  const headers = { ...(options.headers || {}) };
  if (options.body !== undefined && !headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/json";
  }
  const opts = { ...options, headers };

  if (demoMode) {
    if (opts.body !== undefined) {
      try {
        const body = JSON.parse(String(opts.body || "{}"));
        body.demoUserId = demoUserId;
        opts.body = JSON.stringify(body);
      } catch {
        opts.body = JSON.stringify({ demoUserId });
      }
    }
  } else {
    // Keep initData only in header for smaller payload and lower per-tap latency.
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
  displayedBalance = Math.max(0, Number(value || 0));
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

function mapDonateErrorKey(rawError) {
  const code = String(rawError || "").trim();
  const errorMap = {
    stars_disabled: "donateDisabled",
    invoice_create_failed: "donateNotReady",
    "initData missing": "authError",
    "initData invalid": "authError",
    "user missing": "authError"
  };
  return errorMap[code] || code || "donateNotReady";
}

function setSquadStatus(keyOrText = "", isError = false, vars = {}) {
  if (!squadStatusEl) return;
  const isLangKey =
    typeof keyOrText === "string" &&
    (STRINGS[currentLang]?.[keyOrText] || STRINGS.en?.[keyOrText]);
  const text = isLangKey ? t(keyOrText, vars || {}) : String(keyOrText || "");
  squadStatusEl.textContent = text;
  squadStatusEl.classList.toggle("error", isError);
}

function mapSquadErrorKey(rawError) {
  const code = String(rawError || "").trim();
  const errorMap = {
    already_in_squad: "squadErrorAlreadyIn",
    squad_not_found: "squadErrorNotFound",
    squad_full: "squadErrorFull",
    squad_id_invalid: "squadErrorInvalidId",
    squad_name_too_short: "squadErrorNameShort",
    squad_name_too_long: "squadErrorNameLong",
    squad_name_invalid: "squadErrorNameInvalid",
    not_in_squad: "squadErrorNotInSquad",
    squad_create_insufficient_balance: "squadErrorInsufficient",
    squad_join_request_exists: "squadErrorRequestExists",
    squad_not_owner: "squadErrorNotOwner",
    squad_join_request_not_found: "squadErrorRequestNotFound",
    squad_user_invalid: "squadErrorUserInvalid",
    squad_user_not_found: "squadErrorUserNotFound",
    squad_target_already_in_squad: "squadErrorTargetBusy"
  };
  return errorMap[code] || code || "tryAgain";
}

function updateDailyStreakView() {
  if (!dailyStreakEl) return;
  const count = Math.max(0, Number(dailyStreakState?.count || 0));
  const max = Math.max(1, Number(dailyStreakState?.max || 7));
  const bonus = Math.max(0, Number(dailyStreakState?.bonusPct || 0));
  const milestoneBonus = Math.max(0, Number(dailyStreakState?.milestoneBonus || 0));
  if (milestoneBonus > 0) {
    dailyStreakEl.textContent = t("dailyStreakReady", { count, max, bonus });
    return;
  }
  dailyStreakEl.textContent = t("dailyStreak", { count, max, bonus });
}

function renderMining() {
  if (!miningStatusEl || !miningBtnEl) return;
  if (miningTitleEl) miningTitleEl.textContent = t("miningTitle");
  if (miningSubtitleEl) miningSubtitleEl.textContent = t("miningSubtitle");
  miningBtnEl.textContent = t("miningClaim");
  if (!miningState) {
    miningStatusEl.textContent = t("loading");
    miningBtnEl.disabled = true;
    return;
  }
  const stored = Math.max(0, Number(miningState.stored || 0));
  const capacity = Math.max(1, Number(miningState.capacity || 1));
  const rate = Math.max(1, Number(miningState.ratePerHour || 1));
  const canClaim = Math.max(0, Number(miningState.canClaim || stored));
  miningBtnEl.disabled = canClaim <= 0;
  if (miningState.isFull) {
    miningStatusEl.textContent = t("miningReady", {
      stored: formatNumberDots(stored),
      capacity: formatNumberDots(capacity),
      rate: formatNumberDots(rate)
    });
    return;
  }
  const nextReadyAt = Number(miningState.nextReadyAt || 0);
  const remainMs = Math.max(0, nextReadyAt - Date.now());
  if (remainMs > 0) {
    miningStatusEl.textContent = t("miningWait", {
      stored: formatNumberDots(stored),
      capacity: formatNumberDots(capacity),
      rate: formatNumberDots(rate),
      time: formatTime(remainMs)
    });
  } else {
    miningStatusEl.textContent = t("miningReady", {
      stored: formatNumberDots(stored),
      capacity: formatNumberDots(capacity),
      rate: formatNumberDots(rate)
    });
  }
}

async function loadMiningStatus({ silent = false, force = false } = {}) {
  const now = Date.now();
  if (!force && now - lastMiningSyncAt < MINING_SYNC_INTERVAL_MS) return;
  if (isMiningSyncing) return;
  const latestInit = tg?.initData || initData || "";
  if (latestInit && latestInit !== initData) initData = latestInit;
  if (!demoMode && !initData) return;

  isMiningSyncing = true;
  const headers = {};
  let url = "/api/mining";
  if (demoMode) {
    url += `?demoUserId=${encodeURIComponent(demoUserId)}`;
  } else {
    headers["x-init-data"] = initData;
  }
  try {
    const res = await fetch(url, { headers, cache: "no-store" });
    const data = await res.json();
    if (!data?.ok) {
      if (!silent) setMetaText(data?.error || t("tryAgain"));
      return;
    }
    miningState = data.mining || miningState;
    lastMiningSyncAt = Date.now();
    if (data.dailyStreak) {
      dailyStreakState = {
        ...dailyStreakState,
        ...data.dailyStreak
      };
    }
    updateDailyStreakView();
    renderMining();
  } catch {
    if (!silent) setMeta("network");
  } finally {
    isMiningSyncing = false;
  }
}

function renderSquads() {
  if (!squadListEl || !squadCurrentEl) return;
  const hasSquad = Boolean(currentSquadState?.id);
  const createRowEl = squadCreateBtnEl?.closest(".squad-actions");
  const joinRowEl = squadJoinBtnEl?.closest(".squad-actions");
  const privateToggleEl = squadPrivateInputEl?.closest(".squad-private-toggle");
  if (squadsTitleEl) squadsTitleEl.textContent = t("squadsTitle");
  if (squadsSubtitleEl) squadsSubtitleEl.textContent = t("squadsSubtitle");
  if (squadCreateFeeEl) {
    squadCreateFeeEl.textContent = t("squadCreateFee", { cost: formatNumberDots(squadCreateCost) });
    squadCreateFeeEl.style.display = hasSquad ? "none" : "";
  }
  if (createRowEl) createRowEl.style.display = hasSquad ? "none" : "";
  if (privateToggleEl) privateToggleEl.style.display = hasSquad ? "none" : "";
  if (joinRowEl) joinRowEl.classList.toggle("manage-mode", hasSquad);
  if (squadIdInputEl) squadIdInputEl.style.display = hasSquad ? "none" : "";
  if (squadJoinBtnEl) squadJoinBtnEl.style.display = hasSquad ? "none" : "";
  if (squadPrivateLabelEl) squadPrivateLabelEl.textContent = t("squadPrivateLabel");
  if (squadCreateBtnEl) squadCreateBtnEl.textContent = t("squadCreate");
  if (squadJoinBtnEl) squadJoinBtnEl.textContent = t("squadJoin");
  if (squadLeaveBtnEl) squadLeaveBtnEl.textContent = t("squadLeave");
  if (squadRefreshBtnEl) squadRefreshBtnEl.textContent = t("squadRefresh");
  if (squadPendingTitleEl) squadPendingTitleEl.textContent = t("squadPendingTitle");
  if (squadMembersTitleEl) squadMembersTitleEl.textContent = t("squadMembersTitle");
  if (squadListTitleEl) squadListTitleEl.textContent = t("squadListTitle");
  if (squadNameInputEl) squadNameInputEl.placeholder = t("squadNamePlaceholder");
  if (squadIdInputEl) squadIdInputEl.placeholder = t("squadIdPlaceholder");
  if (squadLeaveBtnEl) squadLeaveBtnEl.disabled = !currentSquadState?.id;

  if (hasSquad) {
    const privacyKey = currentSquadState.isPrivate ? "squadTypePrivate" : "squadTypePublic";
    squadCurrentEl.textContent = t("squadCurrent", {
      name: currentSquadState.name || "-",
      id: currentSquadState.id || "-",
      privacy: t(privacyKey),
      count: formatNumberDots(currentSquadState.membersCount || 1)
    });
    if (squadBonusEl) {
      const members = Math.max(1, Number(currentSquadState.membersCount || 1));
      const bonusPct = Math.min(30, 5 + members * 2);
      squadBonusEl.textContent = t("squadBonusValue", { percent: formatNumberDots(bonusPct) });
    }
    if (squadMembersEl) {
      squadMembersEl.innerHTML = "";
      const members = Array.isArray(currentSquadState.topMembers)
        ? currentSquadState.topMembers
        : [];
      if (!members.length) {
        const empty = document.createElement("div");
        empty.className = "squad-member-empty";
        empty.textContent = t("squadNoMembers");
        squadMembersEl.appendChild(empty);
      } else {
        members.forEach((member) => {
          const chip = document.createElement("button");
          chip.type = "button";
          chip.className = "squad-member";
          chip.textContent = member.name || member.username || `ID ${member.id}`;
          chip.addEventListener("click", () => openUserProfile(member.id));
          squadMembersEl.appendChild(chip);
        });
      }
    }
  } else {
    squadCurrentEl.textContent = "";
    if (squadBonusEl) squadBonusEl.textContent = t("squadBonusNone");
    if (squadMembersEl) {
      squadMembersEl.innerHTML = `<div class="squad-member-empty">${t("squadNoMembers")}</div>`;
    }
  }
  const isOwner =
    Boolean(currentSquadState?.id) && Array.isArray(currentSquadState?.pendingRequests);
  if (squadPendingTitleEl) {
    squadPendingTitleEl.style.display = isOwner ? "" : "none";
  }
  if (squadPendingListEl) {
    squadPendingListEl.style.display = isOwner ? "grid" : "none";
    if (!isOwner) {
      squadPendingListEl.innerHTML = "";
    } else {
      squadPendingListEl.innerHTML = "";
      const pending = Array.isArray(currentSquadState?.pendingRequests)
        ? currentSquadState.pendingRequests
        : [];
      if (!pending.length) {
        squadPendingListEl.innerHTML = `<div class="squad-member-empty">${t("squadNoPending")}</div>`;
      } else {
        pending.forEach((entry) => {
          const row = document.createElement("div");
          row.className = "squad-pending-row";
          const meta = document.createElement("div");
          meta.className = "squad-pending-meta";
          const name = document.createElement("div");
          name.className = "squad-pending-name";
          name.textContent = entry.name || entry.username || `ID ${entry.id}`;
          const id = document.createElement("div");
          id.className = "squad-pending-id";
          id.textContent = `ID ${entry.id}`;
          meta.append(name, id);
          const actions = document.createElement("div");
          actions.className = "squad-pending-actions";
          const approve = document.createElement("button");
          approve.type = "button";
          approve.className = "squad-pending-btn";
          approve.textContent = t("squadApprove");
          approve.addEventListener("click", async () => {
            approve.disabled = true;
            reject.disabled = true;
            try {
              await handleSquadAction("approve_request", { targetUserId: entry.id });
            } finally {
              approve.disabled = false;
              reject.disabled = false;
            }
          });
          const reject = document.createElement("button");
          reject.type = "button";
          reject.className = "squad-pending-btn ghost";
          reject.textContent = t("squadReject");
          reject.addEventListener("click", async () => {
            approve.disabled = true;
            reject.disabled = true;
            try {
              await handleSquadAction("reject_request", { targetUserId: entry.id });
            } finally {
              approve.disabled = false;
              reject.disabled = false;
            }
          });
          actions.append(approve, reject);
          row.append(meta, actions);
          squadPendingListEl.appendChild(row);
        });
      }
    }
  }

  squadListEl.innerHTML = "";
  if (!Array.isArray(squadsState) || !squadsState.length) {
    const empty = document.createElement("div");
    empty.className = "leaderboard-empty";
    empty.textContent = t("squadsEmpty");
    squadListEl.appendChild(empty);
    return;
  }
  squadsState.forEach((squad) => {
    const row = document.createElement("div");
    row.className = "squad-row";
    const rank = document.createElement("div");
    rank.className = "squad-rank";
    rank.textContent = `#${squad.rank || "?"}`;
    const main = document.createElement("div");
    main.className = "squad-main";
    const name = document.createElement("div");
    name.className = "squad-name";
    name.textContent = `${squad.name || "Squad"} (${squad.id || "-"})`;
    const meta = document.createElement("div");
    meta.className = "squad-meta";
    const privacyText = squad.isPrivate ? t("squadTypePrivate") : t("squadTypePublic");
    meta.textContent = `${t("squadMembers", {
      count: formatNumberDots(squad.membersCount || 0)
    })} • ${privacyText}`;
    main.append(name, meta);
    const value = document.createElement("div");
    value.className = "squad-points";
    value.textContent = `${formatNumberDots(squad.seasonPoints || 0)} NF`;
    const action = document.createElement("div");
    action.className = "squad-action";
    const isCurrent = String(currentSquadState?.id || "") === String(squad.id || "");
    if (isCurrent) {
      const chip = document.createElement("span");
      chip.className = "squad-chip";
      chip.textContent = t("squadYou");
      action.append(chip);
    } else {
      const inlineJoin = document.createElement("button");
      inlineJoin.className = "squad-join-inline";
      inlineJoin.type = "button";
      const isRequested = Boolean(squad.requestedByMe);
      if (isRequested) {
        inlineJoin.textContent = t("squadJoinRequested");
        inlineJoin.disabled = true;
      } else {
        inlineJoin.textContent = squad.isPrivate ? t("squadJoinRequest") : t("squadJoin");
      }
      if (currentSquadState?.id) {
        inlineJoin.disabled = true;
        inlineJoin.textContent = t("squadJoinLocked");
      } else if (!isRequested) {
        inlineJoin.addEventListener("click", async () => {
          inlineJoin.disabled = true;
          if (squadIdInputEl) squadIdInputEl.value = String(squad.id || "");
          try {
            await handleSquadAction("join");
          } finally {
            inlineJoin.disabled = false;
          }
        });
      }
      action.append(inlineJoin);
    }
    row.append(rank, main, value, action);
    squadListEl.appendChild(row);
  });
}

async function loadSquads({ silent = false, force = false } = {}) {
  const now = Date.now();
  if (!force && now - lastSquadsSyncAt < SQUADS_SYNC_INTERVAL_MS) return;
  if (isSquadsSyncing) return;
  const latestInit = tg?.initData || initData || "";
  if (latestInit && latestInit !== initData) initData = latestInit;
  if (!demoMode && !initData) return;

  isSquadsSyncing = true;
  const headers = {};
  let url = "/api/squads";
  if (demoMode) {
    url += `?demoUserId=${encodeURIComponent(demoUserId)}`;
  } else {
    headers["x-init-data"] = initData;
  }
  try {
    const res = await fetch(url, { headers, cache: "no-store" });
    const data = await res.json();
    if (!data?.ok) {
      if (!silent) setSquadStatus(mapSquadErrorKey(data?.error), true);
      return;
    }
    if (typeof data.createCost === "number" && Number.isFinite(data.createCost)) {
      squadCreateCost = Math.max(0, Math.floor(data.createCost));
    }
    squadsState = Array.isArray(data.squads) ? data.squads : [];
    currentSquadState = data.currentSquad || null;
    lastSquadsSyncAt = Date.now();
    renderSquads();
    if (!silent) setSquadStatus("");
  } catch {
    if (!silent) setSquadStatus("network", true);
  } finally {
    isSquadsSyncing = false;
  }
}

async function handleSquadAction(action, extra = {}) {
  const payload = { action };
  if (action === "create") payload.name = String(squadNameInputEl?.value || "").trim();
  if (action === "join") payload.squadId = String(squadIdInputEl?.value || "").trim().toLowerCase();
  if (action === "create") payload.isPrivate = Boolean(squadPrivateInputEl?.checked);
  if (action === "approve_request" || action === "reject_request") {
    payload.targetUserId = String(extra?.targetUserId || "").trim();
  }
  const data = await apiRequest("/api/squads", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  if (!data?.ok) {
    const mapped = mapSquadErrorKey(data?.error);
    if (mapped === "squadErrorInsufficient") {
      setSquadStatus(mapped, true, { cost: formatNumberDots(squadCreateCost) });
    } else {
      setSquadStatus(mapped, true);
    }
    if (["join", "approve_request", "reject_request"].includes(action)) {
      await loadSquads({ silent: true, force: true });
    }
    return;
  }
  if (typeof data.createCost === "number" && Number.isFinite(data.createCost)) {
    squadCreateCost = Math.max(0, Math.floor(data.createCost));
  }
  if (data.userSummary) {
    profileUser = data.userSummary;
    if (typeof data.userSummary.balance === "number") {
      updateBalance(data.userSummary.balance, { bump: false });
    }
    renderProfilePanel(profileUser);
  }
  squadsState = Array.isArray(data.squads) ? data.squads : squadsState;
  currentSquadState = data.currentSquad || null;
  renderSquads();
  if (action === "create") setSquadStatus("squadCreated");
  if (action === "join") {
    setSquadStatus(data.pending ? "squadJoinRequestSent" : "squadJoined");
  }
  if (action === "leave") setSquadStatus("squadLeft");
  if (action === "approve_request") setSquadStatus("squadRequestApproved");
  if (action === "reject_request") setSquadStatus("squadRequestRejected");
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
    empty.textContent = starsEnabled ? t("donateNotReady") : t("donateDisabled");
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
      gift.className = "donate-item-bonus donate-gift-row";
      const giftKey = `${pkg.giftId}Name`;
      const giftName =
        STRINGS[currentLang]?.[giftKey] || STRINGS.en?.[giftKey] || pkg.giftId;
      const giftText = document.createElement("span");
      giftText.textContent = t("donateGift", { name: giftName });
      gift.append(createGiftIconElement(pkg.giftId, "xs"), giftText);
    }
    const btn = document.createElement("button");
    btn.className = "donate-buy";
    btn.type = "button";
    btn.textContent = t("donateBuy", { stars: formatNumberDots(pkg.stars || 0) });
    if (!starsEnabled) {
      btn.disabled = true;
      btn.textContent = t("donateDisabled");
    }
    btn.addEventListener("click", async () => {
      if (!starsEnabled) return;
      btn.disabled = true;
      try {
        const data = await apiRequest("/api/donate", {
          method: "POST",
          body: JSON.stringify({ packageId: pkg.id })
        });
        if (!data?.ok || !data.invoiceLink) {
          setDonateStatus(mapDonateErrorKey(data?.error), true);
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
        btn.disabled = !starsEnabled;
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
      level2: formatNumberDots(REFERRAL_BONUS_LEVEL2),
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
  updateDailyStreakView();
}

function setActiveTab(tab) {
  activeTab = tab;
  setUserModalOpen(false);
  if (screenTapEl) screenTapEl.classList.toggle("active", tab === "tap");
  if (screenShopEl) screenShopEl.classList.toggle("active", tab === "shop");
  if (screenLeaderboardEl) screenLeaderboardEl.classList.toggle("active", tab === "leaderboard");
  if (screenSquadsEl) screenSquadsEl.classList.toggle("active", tab === "squads");
  if (screenProfileEl) screenProfileEl.classList.toggle("active", tab === "profile");
  if (screenSupportEl) screenSupportEl.classList.toggle("active", tab === "support");
  if (screenGiftsEl) screenGiftsEl.classList.toggle("active", tab === "gifts");
  if (tabTapEl) tabTapEl.classList.toggle("active", tab === "tap");
  if (tabShopEl) tabShopEl.classList.toggle("active", tab === "shop");
  if (tabLeaderboardEl) tabLeaderboardEl.classList.toggle("active", tab === "leaderboard");
  if (tabSquadsEl) tabSquadsEl.classList.toggle("active", tab === "squads");
  if (tabProfileEl) tabProfileEl.classList.toggle("active", tab === "profile");
  if (tabSupportEl) tabSupportEl.classList.toggle("active", tab === "support");
  if (tabGiftsEl) tabGiftsEl.classList.toggle("active", tab === "gifts");
  if (tab === "leaderboard") {
    loadLeaderboard({ force: true, silent: true });
  }
  if (tab === "squads") {
    loadSquads({ silent: true, force: true });
  }
  if (tab === "shop") loadMiningStatus({ silent: true, force: true });
  if (tab === "profile") renderProfilePanel(profileUser, { refillInputs: true });
  if (tab === "support") loadDonatePackages({ silent: true });
  if (tab === "gifts") renderProfilePanel(profileUser);
}

function renderSkeletons() {
  const skeleton = '<div class="skeleton-card"></div>';
  if (shopListEl) shopListEl.innerHTML = skeleton.repeat(4);
  if (questsListEl) questsListEl.innerHTML = skeleton.repeat(2);
  if (leaderboardListEl) leaderboardListEl.innerHTML = skeleton.repeat(4);
}

function forceDockTabs() {
  if (!tabsEl) return;
  const tgInset = Number(tg?.safeAreaInset?.bottom || tg?.contentSafeAreaInset?.bottom || 0);
  const clampedInset = Number.isFinite(tgInset) ? Math.max(0, Math.min(24, tgInset)) : 0;
  const bottomPx = 22 + clampedInset;
  if (!dockStylesApplied) {
    tabsEl.style.left = "50%";
    tabsEl.style.right = "auto";
    tabsEl.style.transform = "translateX(-50%) translateZ(0)";
    tabsEl.style.margin = "0";
    tabsEl.style.zIndex = "9999";
    tabsEl.style.setProperty("position", "fixed", "important");
    tabsEl.style.top = "auto";
    dockStylesApplied = true;
  }
  if (lastDockBottomPx !== bottomPx) {
    tabsEl.style.bottom = `${bottomPx}px`;
    lastDockBottomPx = bottomPx;
  }
}

function scheduleForceDockTabs() {
  if (dockTabsRaf) return;
  dockTabsRaf = requestAnimationFrame(() => {
    dockTabsRaf = 0;
    forceDockTabs();
  });
}

function setLoadingState(isLoading) {
  document.body.classList.toggle("loading", isLoading);
  if (isLoading) renderSkeletons();
}

function renderShop() {
  if (!shopListEl || !shopState.length) return;
  lastShopRenderAt = Date.now();
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
        let caseSession = null;
        try {
          if (isCasePurchase) {
            const confirmed = await askCaseOpenConfirmation(item.id);
            if (!confirmed) return;
            caseSession = startCaseSpin();
          }
          const data = await apiRequest("/api/buy", {
            method: "POST",
            body: JSON.stringify({ itemId: item.id })
          });
          if (!data.ok) {
            if (caseSession) {
              await finishCaseAnimation(caseSession, {
                finalSymbols: ["❌", "❌", "❌"],
                statusText: t("caseAnimFailed"),
                failed: true
              });
            } else if (isCasePurchase) {
              failCaseAnimationPreview(t("caseAnimFailed"));
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
              finalSymbols: resolveCaseFinalSymbols(data.caseReward),
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
              finalSymbols: ["❌", "❌", "❌"],
              statusText: t("caseAnimFailed"),
              failed: true
            });
          } else if (isCasePurchase) {
            failCaseAnimationPreview(t("caseAnimFailed"));
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
  if (!force && Date.now() - lastLeaderboardSyncAt < LEADERBOARD_SYNC_INTERVAL_MS) return;
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
      starsEnabled = false;
      donatePackages = [];
      renderDonatePackages();
      if (!silent) setDonateStatus(mapDonateErrorKey(data?.error), true);
      return;
    }
    starsEnabled = data.starsEnabled !== false;
    donatePackages = Array.isArray(data.packages) ? data.packages : [];
    renderDonatePackages();
    if (!silent) {
      if (!starsEnabled) setDonateStatus("donateDisabled", true);
      else setDonateStatus("");
    }
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
    const streakCount = Number(profile.user.dailyStreakCount || 0);
    dailyStreakState = {
      count: streakCount,
      best: Number(profile.user.dailyStreakBest || 0),
      max: 7,
      bonusPct: Math.max(0, Math.min(60, (streakCount - 1) * 10)),
      milestoneBonus: 0
    };
    miningState = profile.user.mining || miningState;
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
    renderMining();
    await loadShop();
    await loadQuests();
    await loadLeaderboard({ force: true, silent: true });
    await loadMiningStatus({ silent: true, force: true });
    await loadSquads({ silent: true, force: true });
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
  if (!force && now - lastProfileSyncAt < PROFILE_SYNC_INTERVAL_MS) return;
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
    if (activeTab === "profile" || activeTab === "gifts") {
      renderProfilePanel(profile.user);
    }
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
    const streakCount = Number(profile.user.dailyStreakCount || 0);
    dailyStreakState = {
      count: streakCount,
      best: Number(profile.user.dailyStreakBest || 0),
      max: 7,
      bonusPct: Math.max(0, Math.min(60, (streakCount - 1) * 10)),
      milestoneBonus: 0
    };
    miningState = profile.user.mining || miningState;
    boostUntil = profile.user.boostUntil || 0;
    updateDailyStatus();
    renderMining();
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
    loadMiningStatus({ silent: true, force: true });
    loadSquads({ silent: true, force: true });
    loadDonatePackages({ silent: true });
  } else {
    tapQueueCount = 0;
    queuedTapPoint = null;
    if (tapFlushTimer) {
      clearTimeout(tapFlushTimer);
      tapFlushTimer = 0;
    }
  }
});

window.addEventListener("focus", () => {
  syncProfileSilently({ force: true });
  loadLeaderboard({ force: true, silent: true });
  loadMiningStatus({ silent: true, force: true });
  loadSquads({ silent: true, force: true });
  loadDonatePackages({ silent: true });
});

if (tapBtn) {
  tapBtn.addEventListener("click", () => {
    const now = Date.now();
    if (now - lastTouchAt < 300) return;
    if (now - lastPointerDownAt < 300) return;
    enqueueTap(1, lastTapPoint);
  });
  tapBtn.addEventListener(
    "touchstart",
    (event) => {
      lastTouchAt = Date.now();
      const count = Math.max(1, event.touches?.length || 1);
      if (event.touches && event.touches[0]) {
        lastTapPoint = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      }
      event.preventDefault();
      enqueueTap(count, lastTapPoint);
    },
    { passive: false }
  );
  tapBtn.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") return;
    lastPointerDownAt = Date.now();
    lastTapPoint = { x: event.clientX, y: event.clientY };
    enqueueTap(1, lastTapPoint);
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
if (tabSquadsEl) tabSquadsEl.addEventListener("click", () => setActiveTab("squads"));
if (tabProfileEl) tabProfileEl.addEventListener("click", () => setActiveTab("profile"));
if (tabSupportEl) tabSupportEl.addEventListener("click", () => setActiveTab("support"));
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
  if (event.key !== "Escape") return;
  setUserModalOpen(false);
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
      if (data.dailyStreak) {
        dailyStreakState = {
          ...dailyStreakState,
          ...data.dailyStreak
        };
      }
      if (data.reward) {
        setMeta("dailyClaimed", { amount: formatNumberDots(data.reward) });
      }
      lastDailyTs = Date.now();
      updateDailyStatus();
      await loadMiningStatus({ silent: true, force: true });
    } catch {
      setMeta("network");
    } finally {
      updateDailyStatus();
    }
  });
}

if (miningBtnEl) {
  miningBtnEl.addEventListener("click", async () => {
    miningBtnEl.disabled = true;
    try {
      const data = await apiRequest("/api/mining", {
        method: "POST",
        body: "{}"
      });
      if (!data?.ok) {
        if (data?.error === "mining_not_ready") {
          setMeta("miningNotReady");
          if (data.mining) miningState = data.mining;
          renderMining();
        } else {
          setMetaText(data?.error || t("tryAgain"));
        }
        return;
      }
      if (typeof data.claimed === "number") {
        setMeta("miningCollected", { amount: formatNumberDots(data.claimed) });
      }
      if (typeof data.balance === "number") updateBalance(data.balance);
      if (data.mining) miningState = data.mining;
      if (data.dailyStreak) {
        dailyStreakState = { ...dailyStreakState, ...data.dailyStreak };
      }
      if (typeof data.energy === "number") updateEnergy(data.energy, data.maxEnergy, data.energyRegen);
      if (data.rank) {
        rankState = data.rank;
        updateRank();
      }
      updateDailyStatus();
      renderMining();
      if (activeTab === "leaderboard") loadLeaderboard({ force: true, silent: true });
    } catch {
      setMeta("network");
    } finally {
      if (miningBtnEl) miningBtnEl.disabled = false;
    }
  });
}

if (squadCreateBtnEl) {
  squadCreateBtnEl.addEventListener("click", async () => {
    squadCreateBtnEl.disabled = true;
    try {
      await handleSquadAction("create");
    } finally {
      squadCreateBtnEl.disabled = false;
    }
  });
}
if (squadJoinBtnEl) {
  squadJoinBtnEl.addEventListener("click", async () => {
    squadJoinBtnEl.disabled = true;
    try {
      await handleSquadAction("join");
    } finally {
      squadJoinBtnEl.disabled = false;
    }
  });
}
if (squadLeaveBtnEl) {
  squadLeaveBtnEl.addEventListener("click", async () => {
    squadLeaveBtnEl.disabled = true;
    try {
      await handleSquadAction("leave");
    } finally {
      squadLeaveBtnEl.disabled = false;
    }
  });
}
if (squadRefreshBtnEl) {
  squadRefreshBtnEl.addEventListener("click", async () => {
    squadRefreshBtnEl.disabled = true;
    try {
      await loadSquads({ silent: false, force: true });
      setSquadStatus("");
    } finally {
      squadRefreshBtnEl.disabled = false;
    }
  });
}

async function sendTap(count = 1, point = null) {
  if (!demoMode && !initData) {
    setMeta("authError");
    return false;
  }
  if (!demoMode && energy <= 0 && count <= 1) {
    setMeta("energyEmpty");
    return false;
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
      return false;
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
    if (Date.now() - lastHapticAt > HAPTIC_MIN_INTERVAL_MS) {
      lastHapticAt = Date.now();
      if (tg?.HapticFeedback?.impactOccurred) {
        tg.HapticFeedback.impactOccurred("light");
      } else if (navigator.vibrate) {
        navigator.vibrate(8);
      }
    }
    if (Date.now() - lastQuestSyncAt > 1000) {
      lastQuestSyncAt = Date.now();
      loadQuests({ silent: true });
    }
    if (activeTab === "leaderboard") loadLeaderboard({ force: true, silent: true });
    return true;
  } catch {
    setMeta("network");
    return false;
  }
}

function enqueueTap(count = 1, point = null) {
  const add = Math.max(1, Math.floor(Number(count) || 1));
  tapQueueCount = Math.min(200, tapQueueCount + add);
  if (point && Number.isFinite(point.x) && Number.isFinite(point.y)) {
    queuedTapPoint = point;
  }
  if (!tapFlushTimer) {
    tapFlushTimer = setTimeout(flushTapQueue, TAP_BATCH_WINDOW_MS);
  }
}

function applyOptimisticTap(count = 1, point = null) {
  const safeCount = Math.max(1, Math.floor(Number(count) || 1));
  const usableEnergy = Math.max(0, Math.floor(Number(energy || 0)));
  const allowed = Math.min(safeCount, usableEnergy);
  if (allowed <= 0) return 0;
  const predictedEarn = Math.max(1, Math.round((tapValue || 1) * allowed));
  updateBalance(displayedBalance + predictedEarn);
  updateEnergy(Math.max(0, usableEnergy - allowed), maxEnergy, energyRegen);
  showSpark(`+${formatNumberDots(predictedEarn)}`, point);
  return allowed;
}

async function flushTapQueue() {
  tapFlushTimer = 0;
  if (isTapRequestInFlight || tapQueueCount <= 0) return;
  isTapRequestInFlight = true;
  const requestedCount = Math.max(1, Math.min(TAP_BATCH_MAX_COUNT, tapQueueCount));
  tapQueueCount -= requestedCount;
  const snapshot = {
    balance: displayedBalance,
    energy,
    maxEnergy,
    energyRegen
  };
  const batchCount = applyOptimisticTap(requestedCount, queuedTapPoint);
  if (batchCount <= 0) {
    isTapRequestInFlight = false;
    if (!tapFlushTimer && tapQueueCount > 0) {
      tapFlushTimer = setTimeout(flushTapQueue, TAP_BATCH_WINDOW_MS);
    }
    return;
  }
  try {
    const ok = await sendTap(batchCount, queuedTapPoint);
    if (!ok) {
      updateBalance(snapshot.balance, { bump: false });
      updateEnergy(snapshot.energy, snapshot.maxEnergy, snapshot.energyRegen);
    }
  } catch {
    updateBalance(snapshot.balance, { bump: false });
    updateEnergy(snapshot.energy, snapshot.maxEnergy, snapshot.energyRegen);
  } finally {
    isTapRequestInFlight = false;
    if (tapQueueCount > 0) {
      tapFlushTimer = setTimeout(flushTapQueue, TAP_BATCH_WINDOW_MS);
    }
  }
}

function showSpark(text, point = null) {
  if (!panelEl) return;
  const now = Date.now();
  if (now - lastSparkAt < SPARK_MIN_INTERVAL_MS) return;
  if (activeSparks >= SPARK_MAX_ACTIVE) return;
  lastSparkAt = now;
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
  activeSparks += 1;
  panelEl.appendChild(spark);
  setTimeout(() => {
    spark.remove();
    activeSparks = Math.max(0, activeSparks - 1);
  }, 800);
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

forceDockTabs();
window.addEventListener("resize", scheduleForceDockTabs, { passive: true });
window.addEventListener("orientationchange", scheduleForceDockTabs);
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", scheduleForceDockTabs);
  window.visualViewport.addEventListener("scroll", scheduleForceDockTabs);
}
if (tg?.onEvent) {
  tg.onEvent("viewportChanged", scheduleForceDockTabs);
}

init();

setInterval(() => {
  tickEnergy();
  if (activeTab === "tap") updateTapBuffs();
  if (activeTab === "shop") {
    updateDailyStatus();
    renderMining();
    if (boostUntil && Date.now() < boostUntil && Date.now() - lastShopRenderAt > SHOP_BOOST_RERENDER_MS) {
      renderShop();
    }
  }
}, UI_TICK_MS);

setInterval(() => {
  if (document.visibilityState === "hidden") return;
  syncProfileSilently();
  if (activeTab === "leaderboard") {
    loadLeaderboard({ silent: true });
    loadSquads({ silent: true });
  } else if (activeTab === "squads") {
    loadSquads({ silent: true });
  } else if (activeTab === "shop") {
    loadMiningStatus({ silent: true });
  }
}, PROFILE_SYNC_INTERVAL_MS);
