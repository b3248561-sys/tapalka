import { promises as fs } from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "db.json");
let cache = null;
let isSaving = false;
let pendingSave = false;

async function ensureDbFile() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    const initial = { users: {} };
    await fs.writeFile(dbPath, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function loadDb() {
  if (cache) return cache;
  await ensureDbFile();
  const raw = await fs.readFile(dbPath, "utf8");
  cache = JSON.parse(raw);
  if (!cache.users) cache.users = {};
  return cache;
}

async function saveDb(db) {
  if (isSaving) {
    pendingSave = true;
    return;
  }
  isSaving = true;
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf8");
  isSaving = false;
  if (pendingSave) {
    pendingSave = false;
    await saveDb(db);
  }
}

function createUser(userId, name) {
  return {
    id: userId,
    name: name || "Player",
    username: "",
    balance: 0,
    tapValue: 1,
    items: {},
    boostUntil: 0,
    lastDailyTs: 0,
    totalEarned: 0,
    totalTaps: 0,
    dailyQuestDay: "",
    dailyTapCount: 0,
    dailyPurchaseCount: 0,
    dailyQuestClaims: {},
    lastTapTs: 0,
    windowStartTs: 0,
    windowCount: 0,
    bannedUntil: 0,
    maxEnergy: 50,
    energy: 50,
    energyRegen: 1,
    lastEnergyTs: Date.now()
  };
}

function normalizeUser(user) {
  if (!user || typeof user !== "object") return null;
  if (!user.name) user.name = "Player";
  if (typeof user.username !== "string") user.username = "";
  if (typeof user.balance !== "number" || user.balance < 0) user.balance = 0;
  if (typeof user.tapValue !== "number" || user.tapValue < 1) user.tapValue = 1;
  if (!user.items || typeof user.items !== "object") user.items = {};
  if (typeof user.boostUntil !== "number" || user.boostUntil < 0) user.boostUntil = 0;
  if (typeof user.lastDailyTs !== "number" || user.lastDailyTs < 0) user.lastDailyTs = 0;
  if (typeof user.totalEarned !== "number" || user.totalEarned < 0) user.totalEarned = 0;
  if (typeof user.totalTaps !== "number" || user.totalTaps < 0) user.totalTaps = 0;
  if (typeof user.dailyQuestDay !== "string") user.dailyQuestDay = "";
  if (typeof user.dailyTapCount !== "number" || user.dailyTapCount < 0) user.dailyTapCount = 0;
  if (typeof user.dailyPurchaseCount !== "number" || user.dailyPurchaseCount < 0) user.dailyPurchaseCount = 0;
  if (!user.dailyQuestClaims || typeof user.dailyQuestClaims !== "object") user.dailyQuestClaims = {};
  if (typeof user.lastTapTs !== "number" || user.lastTapTs < 0) user.lastTapTs = 0;
  if (typeof user.windowStartTs !== "number" || user.windowStartTs < 0) user.windowStartTs = 0;
  if (typeof user.windowCount !== "number" || user.windowCount < 0) user.windowCount = 0;
  if (typeof user.bannedUntil !== "number" || user.bannedUntil < 0) user.bannedUntil = 0;
  if (typeof user.maxEnergy !== "number" || user.maxEnergy < 10) user.maxEnergy = 50;
  if (typeof user.energyRegen !== "number" || user.energyRegen < 1) user.energyRegen = 1;
  if (typeof user.energy !== "number") user.energy = user.maxEnergy;
  if (user.energy > user.maxEnergy) user.energy = user.maxEnergy;
  if (typeof user.lastEnergyTs !== "number" || user.lastEnergyTs <= 0) {
    user.lastEnergyTs = Date.now();
  }
  return user;
}

export async function getUser(userId, name, username = "") {
  const db = await loadDb();
  let user = db.users[userId];
  if (!user) {
    user = createUser(userId, name);
    db.users[userId] = user;
    await saveDb(db);
  } else {
    let changed = false;
    if (name && user.name !== name) {
      user.name = name;
      changed = true;
    }
    if (typeof username === "string" && user.username !== username) {
      user.username = username;
      changed = true;
    }
    user = normalizeUser(user) || createUser(userId, name);
    db.users[userId] = user;
  }
  user = normalizeUser(user) || createUser(userId, name);
  db.users[userId] = user;
  await saveDb(db);
  return user;
}

export async function updateUser(userId, name, username, updater) {
  const db = await loadDb();
  let user = db.users[userId];
  if (!user) {
    user = createUser(userId, name);
    db.users[userId] = user;
  } else if (name && user.name !== name) {
    user.name = name;
  }
  if (typeof username === "string" && user.username !== username) {
    user.username = username;
  }
  user = normalizeUser(user) || createUser(userId, name);
  db.users[userId] = user;
  await Promise.resolve(updater(user));
  user = normalizeUser(user) || createUser(userId, name);
  db.users[userId] = user;
  await saveDb(db);
  return user;
}
