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
    balance: 0,
    lastTapTs: 0,
    windowStartTs: 0,
    windowCount: 0
  };
}

export async function getUser(userId, name) {
  const db = await loadDb();
  let user = db.users[userId];
  if (!user) {
    user = createUser(userId, name);
    db.users[userId] = user;
    await saveDb(db);
  } else if (name && user.name !== name) {
    user.name = name;
    await saveDb(db);
  }
  return user;
}

export async function updateUser(userId, name, updater) {
  const db = await loadDb();
  let user = db.users[userId];
  if (!user) {
    user = createUser(userId, name);
    db.users[userId] = user;
  } else if (name && user.name !== name) {
    user.name = name;
  }
  await Promise.resolve(updater(user));
  await saveDb(db);
  return user;
}
