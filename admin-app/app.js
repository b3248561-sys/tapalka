const DEFAULT_SERVER = "https://tapalka-bot.pages.dev";

const elements = {
  serverUrl: document.getElementById("serverUrl"),
  deviceName: document.getElementById("deviceName"),
  enrollToken: document.getElementById("enrollToken"),
  enrollBtn: document.getElementById("enrollBtn"),
  enrollStatus: document.getElementById("enrollStatus"),
  deviceInfo: document.getElementById("deviceInfo"),
  loadLogs: document.getElementById("loadLogs"),
  logsStatus: document.getElementById("logsStatus"),
  logsBody: document.getElementById("logsBody"),
  filterInput: document.getElementById("filterInput"),
  clearLocal: document.getElementById("clearLocal"),
  openAdmin: document.getElementById("openAdmin"),
  tabLogs: document.getElementById("tabLogs"),
  tabAdmin: document.getElementById("tabAdmin"),
  adminView: document.querySelector('[data-view="admin"]'),
  logsView: document.querySelector('[data-view="logs"]'),
  adminUserId: document.getElementById("adminUserId"),
  adminDeltaBalance: document.getElementById("adminDeltaBalance"),
  adminSetBalance: document.getElementById("adminSetBalance"),
  adminSetTapValue: document.getElementById("adminSetTapValue"),
  adminBanMinutes: document.getElementById("adminBanMinutes"),
  adminLoadUser: document.getElementById("adminLoadUser"),
  adminApply: document.getElementById("adminApply"),
  adminUnban: document.getElementById("adminUnban"),
  adminResetDaily: document.getElementById("adminResetDaily"),
  adminClearBoost: document.getElementById("adminClearBoost"),
  adminStatus: document.getElementById("adminStatus"),
  adminUserCard: document.getElementById("adminUserCard")
};

function saveState(state) {
  localStorage.setItem("adminState", JSON.stringify(state));
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem("adminState")) || {};
  } catch {
    return {};
  }
}

function getState() {
  return loadState();
}

function setStatus(el, text, isError = false) {
  el.textContent = text;
  el.style.color = isError ? "#ff6b6b" : "#a7b0bb";
}

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function base64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

async function generateKeyPair() {
  return crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["encrypt", "decrypt"]
  );
}

async function enrollDevice() {
  const serverUrl = elements.serverUrl.value.trim() || DEFAULT_SERVER;
  const deviceName = elements.deviceName.value.trim() || "My Device";
  const enrollToken = elements.enrollToken.value.trim();
  if (!enrollToken) {
    setStatus(elements.enrollStatus, "Введите токен регистрации.", true);
    return;
  }

  setStatus(elements.enrollStatus, "Генерирую ключи...");
  const keyPair = await generateKeyPair();
  const publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

  setStatus(elements.enrollStatus, "Регистрирую устройство...");
  let resp;
  let data;
  try {
    resp = await fetch(`${serverUrl}/api/admin/enroll`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        token: enrollToken,
        deviceName,
        publicKeyJwk
      })
    });
    data = await resp.json();
  } catch (err) {
    setStatus(
      elements.enrollStatus,
      "Ошибка сети или доступа к серверу.",
      true
    );
    return;
  }
  if (!data.ok) {
    setStatus(elements.enrollStatus, data.error || "Ошибка регистрации", true);
    return;
  }

  const prev = getState();
  const state = {
    serverUrl,
    deviceId: data.deviceId,
    deviceToken: data.deviceToken || prev.deviceToken || null,
    publicKeyJwk,
    privateKeyJwk,
    fingerprint: data.fingerprint
  };
  saveState(state);
  setStatus(
    elements.enrollStatus,
    data.deviceToken
      ? "Устройство зарегистрировано."
      : "Устройство уже было зарегистрировано."
  );
  renderDeviceInfo();
}

async function getPrivateKey() {
  const state = getState();
  if (!state.privateKeyJwk) return null;
  return crypto.subtle.importKey(
    "jwk",
    state.privateKeyJwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["decrypt"]
  );
}

async function decryptLog(enc, deviceId, privateKey) {
  const encryptedKey = enc.recipients?.[deviceId];
  if (!encryptedKey) return null;
  const rawKey = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    base64ToBytes(encryptedKey)
  );
  const aesKey = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(enc.iv) },
    aesKey,
    base64ToBytes(enc.ciphertext)
  );
  return JSON.parse(new TextDecoder().decode(plaintext));
}

function renderDeviceInfo() {
  const state = getState();
  if (!state.deviceId) {
    elements.deviceInfo.textContent = "Устройство не зарегистрировано.";
    return;
  }
  elements.deviceInfo.textContent = `Device ID: ${state.deviceId} • fingerprint: ${state.fingerprint || "n/a"}`;
}

function safeId(value) {
  return String(value || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_");
}

function pickNickname(user) {
  if (!user) return "-";
  if (user.username) return `@${user.username}`;
  if (user.name) return user.name;
  return "-";
}

function formatTs(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleString();
}

function summarizeEvent(event) {
  return {
    ts: event.ts,
    action: event.action || "-",
    path: event.path || "-",
    rawIp: event.rawIp || "-",
    ipHash: event.ipHash || "-",
    country: event.country || "-"
  };
}

function renderSummaryRow(group, columnCount) {
  const latest = summarizeEvent(group.latest);
  const detailId = `detail-${safeId(group.userId)}`;
  return `
    <tr class="summary-row" data-details="${detailId}">
      <td>${group.nickname}</td>
      <td>${formatTs(latest.ts)}</td>
      <td>${group.userId || "-"}</td>
      <td>${latest.action}</td>
      <td>${latest.rawIp}</td>
      <td>${latest.ipHash}</td>
      <td>${latest.country}</td>
      <td>${latest.path}</td>
    </tr>
    <tr id="${detailId}" class="detail-row" style="display:none" data-open="0">
      <td colspan="${columnCount}">
        <div class="detail-panel">
          <div class="detail-header">
            <span>История пользователя: ${group.nickname} (${group.userId})</span>
            <span>Событий: ${group.events.length}</span>
          </div>
          <div class="table-wrap">
            <table class="detail-table">
              <thead>
                <tr>
                  <th>Время</th>
                  <th>Действие</th>
                  <th>IP (сырой)</th>
                  <th>IP hash</th>
                  <th>Страна</th>
                  <th>Путь</th>
                </tr>
              </thead>
              <tbody>
                ${group.events
                  .map((event) => {
                    const info = summarizeEvent(event);
                    return `
                      <tr>
                        <td>${formatTs(info.ts)}</td>
                        <td>${info.action}</td>
                        <td>${info.rawIp}</td>
                        <td>${info.ipHash}</td>
                        <td>${info.country}</td>
                        <td>${info.path}</td>
                      </tr>
                    `;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      </td>
    </tr>
  `;
}

function attachRowToggles() {
  const rows = document.querySelectorAll(".summary-row");
  rows.forEach((row) => {
    row.addEventListener("click", () => {
      const detailId = row.dataset.details;
      const detail = document.getElementById(detailId);
      if (!detail) return;
      const open = detail.dataset.open === "1";
      detail.style.display = open ? "none" : "table-row";
      detail.dataset.open = open ? "0" : "1";
      row.classList.toggle("is-open", !open);
    });
  });
}

async function loadLogs() {
  const state = getState();
  if (!state.deviceId || !state.deviceToken) {
    setStatus(elements.logsStatus, "Сначала зарегистрируйте устройство.", true);
    return;
  }
  const serverUrl = state.serverUrl || DEFAULT_SERVER;
  setStatus(elements.logsStatus, "Загружаю логи...");
  let cursor;
  const allLogs = [];
  while (true) {
    const url = new URL(`${serverUrl}/api/admin/logs`);
    url.searchParams.set("limit", "200");
    if (cursor) url.searchParams.set("cursor", cursor);
    let resp;
    let data;
    try {
      resp = await fetch(url.toString(), {
        headers: {
          "x-device-id": state.deviceId,
          "x-device-token": state.deviceToken
        }
      });
      data = await resp.json();
    } catch {
      setStatus(elements.logsStatus, "Ошибка чтения ответа сервера.", true);
      return;
    }
    if (!data.ok) {
      setStatus(elements.logsStatus, data.error || "Ошибка загрузки", true);
      return;
    }
    allLogs.push(...(data.logs || []));
    cursor = data.cursor;
    if (!cursor) break;
  }
  const privateKey = await getPrivateKey();
  const rows = [];
  for (const log of allLogs) {
    let payload = null;
    try {
      payload = await decryptLog(log.enc, state.deviceId, privateKey);
    } catch {
      payload = null;
    }
    rows.push({ log, payload });
  }

  const filter = elements.filterInput.value.trim().toLowerCase();

  const grouped = new Map();
  rows.forEach(({ log, payload }) => {
    const userInfo = payload?.user || null;
    const userId = userInfo?.id || log.userId || "unknown";
    const entry = {
      ts: log.ts,
      action: log.action,
      path: log.path,
      ipHash: log.ipHash,
      rawIp: payload?.rawIp || "-",
      country: payload?.country || log.country || "-",
      user: userInfo
    };
    if (!grouped.has(userId)) {
      grouped.set(userId, {
        userId,
        nickname: pickNickname(userInfo),
        events: [entry]
      });
    } else {
      const group = grouped.get(userId);
      group.events.push(entry);
      if (userInfo?.username && group.nickname === "-") {
        group.nickname = pickNickname(userInfo);
      }
    }
  });

  const groupList = Array.from(grouped.values()).map((group) => {
    group.events.sort((a, b) => (a.ts < b.ts ? 1 : -1));
    group.latest = group.events[0];
    return group;
  });

  const filteredGroups = filter
    ? groupList.filter((group) => {
        return group.events.some((event) => {
          const hay = [
            group.userId,
            group.nickname,
            event.action,
            event.path,
            event.rawIp,
            event.ipHash,
            event.country
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return hay.includes(filter);
        });
      })
    : groupList;

  const columnCount = 8;
  elements.logsBody.innerHTML = filteredGroups
    .map((group) => renderSummaryRow(group, columnCount))
    .join("");
  attachRowToggles();
  setStatus(
    elements.logsStatus,
    `Пользователей: ${filteredGroups.length} • Событий: ${rows.length}`
  );
}

function clearLocal() {
  localStorage.removeItem("adminState");
  renderDeviceInfo();
  setStatus(elements.enrollStatus, "Ключи удалены.");
  elements.logsBody.innerHTML = "";
}

function setActiveView(view) {
  const isAdmin = view === "admin";
  if (elements.logsView) elements.logsView.style.display = isAdmin ? "none" : "";
  if (elements.adminView) elements.adminView.style.display = isAdmin ? "" : "none";
  if (elements.tabLogs) elements.tabLogs.classList.toggle("is-active", !isAdmin);
  if (elements.tabAdmin) elements.tabAdmin.classList.toggle("is-active", isAdmin);
}

function toNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function renderAdminUser(user) {
  if (!user) {
    elements.adminUserCard.textContent = "Пользователь не загружен.";
    return;
  }
  const bannedUntil = user.bannedUntil && Number(user.bannedUntil) > Date.now()
    ? new Date(user.bannedUntil).toLocaleString()
    : "нет";
  elements.adminUserCard.innerHTML = `
    <div><strong>ID:</strong> ${user.id}</div>
    <div><strong>Ник:</strong> ${user.username ? `@${user.username}` : user.name || "-"}</div>
    <div><strong>Баланс:</strong> ${user.balance}</div>
    <div><strong>Сила тапа:</strong> ${user.tapValue}</div>
    <div><strong>Всего тапов:</strong> ${user.totalTaps || 0}</div>
    <div><strong>Заработано:</strong> ${user.totalEarned || 0}</div>
    <div><strong>Буст до:</strong> ${user.boostUntil ? new Date(user.boostUntil).toLocaleString() : "нет"}</div>
    <div><strong>Бан до:</strong> ${bannedUntil}</div>
  `;
}

async function adminFetch(path, options = {}) {
  const state = getState();
  if (!state.deviceId || !state.deviceToken) {
    setStatus(elements.adminStatus, "Сначала зарегистрируйте устройство.", true);
    return null;
  }
  const serverUrl = state.serverUrl || DEFAULT_SERVER;
  try {
    const resp = await fetch(`${serverUrl}${path}`, {
      ...options,
      headers: {
        "content-type": "application/json",
        "x-device-id": state.deviceId,
        "x-device-token": state.deviceToken,
        ...(options.headers || {})
      }
    });
    return await resp.json();
  } catch {
    setStatus(elements.adminStatus, "Ошибка сети или доступа к серверу.", true);
    return null;
  }
}

async function loadAdminUser() {
  const userId = elements.adminUserId.value.trim();
  if (!userId) {
    setStatus(elements.adminStatus, "Введите User ID.", true);
    return;
  }
  setStatus(elements.adminStatus, "Загружаю пользователя...");
  const data = await adminFetch(`/api/admin/user?userId=${encodeURIComponent(userId)}`);
  if (!data) return;
  if (!data.ok) {
    setStatus(elements.adminStatus, data.error || "Пользователь не найден.", true);
    renderAdminUser(null);
    return;
  }
  renderAdminUser(data.user);
  setStatus(elements.adminStatus, "Пользователь загружен.");
}

async function applyAdminChanges(extra = {}) {
  const userId = elements.adminUserId.value.trim();
  if (!userId) {
    setStatus(elements.adminStatus, "Введите User ID.", true);
    return;
  }
  const payload = {
    userId,
    deltaBalance: toNumber(elements.adminDeltaBalance.value),
    setBalance: toNumber(elements.adminSetBalance.value),
    setTapValue: toNumber(elements.adminSetTapValue.value),
    banMinutes: toNumber(elements.adminBanMinutes.value),
    ...extra
  };
  Object.keys(payload).forEach((key) => {
    if (payload[key] === null || payload[key] === undefined || payload[key] === "") {
      delete payload[key];
    }
  });
  if (Object.keys(payload).length <= 1) {
    setStatus(elements.adminStatus, "Нет изменений для применения.", true);
    return;
  }
  setStatus(elements.adminStatus, "Применяю изменения...");
  const data = await adminFetch("/api/admin/adjust", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  if (!data) return;
  if (!data.ok) {
    setStatus(elements.adminStatus, data.error || "Ошибка изменения.", true);
    return;
  }
  renderAdminUser(data.user);
  setStatus(elements.adminStatus, "Изменения применены.");
}

async function unbanUser() {
  await applyAdminChanges({ banMinutes: 0 });
}

async function resetDaily() {
  await applyAdminChanges({ resetDaily: true });
}

async function clearBoost() {
  await applyAdminChanges({ clearBoost: true });
}

elements.enrollBtn.addEventListener("click", enrollDevice);
elements.loadLogs.addEventListener("click", loadLogs);
elements.clearLocal.addEventListener("click", clearLocal);
elements.openAdmin?.addEventListener("click", () => setActiveView("admin"));
elements.tabLogs?.addEventListener("click", () => setActiveView("logs"));
elements.tabAdmin?.addEventListener("click", () => setActiveView("admin"));
elements.adminLoadUser?.addEventListener("click", loadAdminUser);
elements.adminApply?.addEventListener("click", () => applyAdminChanges());
elements.adminUnban?.addEventListener("click", unbanUser);
elements.adminResetDaily?.addEventListener("click", resetDaily);
elements.adminClearBoost?.addEventListener("click", clearBoost);

const state = getState();
elements.serverUrl.value = state.serverUrl || DEFAULT_SERVER;
elements.deviceName.value = state.deviceName || "My Device";
renderDeviceInfo();
setActiveView("logs");
