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
  copyDiag: document.getElementById("copyDiag"),
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
  adminCheckConsistency: document.getElementById("adminCheckConsistency"),
  adminMergeDemo: document.getElementById("adminMergeDemo"),
  adminUnban: document.getElementById("adminUnban"),
  adminHideFromLeaderboard: document.getElementById("adminHideFromLeaderboard"),
  adminShowInLeaderboard: document.getElementById("adminShowInLeaderboard"),
  adminResetDaily: document.getElementById("adminResetDaily"),
  adminClearBoost: document.getElementById("adminClearBoost"),
  adminLoadAnticheat: document.getElementById("adminLoadAnticheat"),
  adminStatus: document.getElementById("adminStatus"),
  adminUserCard: document.getElementById("adminUserCard"),
  anticheatStatus: document.getElementById("anticheatStatus"),
  anticheatBody: document.getElementById("anticheatBody"),
  buildVersion: document.getElementById("buildVersion")
};

const diagnostics = {
  endpoint: "-",
  errorCode: "-",
  store: "-",
  verifiedBalance: "-",
  serverUrl: DEFAULT_SERVER,
  build: "-",
  deviceIdPrefix: "-"
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

function getServerUrl() {
  const state = getState();
  return state.serverUrl || DEFAULT_SERVER;
}

function getDeviceIdPrefix() {
  const state = getState();
  const id = String(state.deviceId || "");
  if (!id) return "-";
  return id.length <= 10 ? id : `${id.slice(0, 10)}...`;
}

function updateDiagnostics(partial = {}) {
  Object.assign(diagnostics, partial);
}

function getErrorCode(data) {
  return (
    data?.authErrorCode ||
    data?.error ||
    "unknown_error"
  );
}

function formatApiError(endpoint, data) {
  const code = getErrorCode(data);
  return `Ошибка ${endpoint}: ${code} • server=${getServerUrl()}`;
}

function setStatus(el, text, isError = false) {
  el.textContent = text;
  el.style.color = isError ? "#ff6b6b" : "#a7b0bb";
}

function escapeHtml(value) {
  const text = String(value ?? "");
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatNumberDots(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value ?? "-");
  const sign = num < 0 ? "-" : "";
  const abs = Math.abs(num);
  const [intPart, fracPart] = String(abs).split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return fracPart ? `${sign}${grouped},${fracPart}` : `${sign}${grouped}`;
}

function formatMaybeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? formatNumberDots(num) : String(value ?? "-");
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
    deviceName,
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
    updateDiagnostics({ deviceIdPrefix: "-", serverUrl: getServerUrl() });
    return;
  }
  elements.deviceInfo.textContent = `Device ID: ${state.deviceId} • fingerprint: ${state.fingerprint || "n/a"}`;
  updateDiagnostics({
    deviceIdPrefix: getDeviceIdPrefix(),
    serverUrl: getServerUrl()
  });
}

function safeId(value) {
  return String(value || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_");
}

function pickNickname(user) {
  if (!user) return "-";
  if (user.username) return `@${user.username}`;
  if (user.name) return user.name;
  if (user.id) return `User ${user.id}`;
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
  const safeNickname = escapeHtml(group.nickname);
  const safeUserId = escapeHtml(group.userId || "-");
  const safeTs = escapeHtml(formatTs(latest.ts));
  const safeAction = escapeHtml(latest.action);
  const safeRawIp = escapeHtml(latest.rawIp);
  const safeIpHash = escapeHtml(latest.ipHash);
  const safeCountry = escapeHtml(latest.country);
  const safePath = escapeHtml(latest.path);
  return `
    <tr class="summary-row" data-details="${detailId}">
      <td>${safeNickname}</td>
      <td>${safeTs}</td>
      <td>${safeUserId}</td>
      <td>${safeAction}</td>
      <td>${safeRawIp}</td>
      <td>${safeIpHash}</td>
      <td>${safeCountry}</td>
      <td>${safePath}</td>
    </tr>
    <tr id="${detailId}" class="detail-row" style="display:none" data-open="0">
      <td colspan="${columnCount}">
        <div class="detail-panel">
          <div class="detail-header">
            <span>История пользователя: ${safeNickname} (${safeUserId})</span>
            <span>Событий: ${Number(group.events.length) || 0}</span>
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
                    const eventTs = escapeHtml(formatTs(info.ts));
                    const eventAction = escapeHtml(info.action);
                    const eventRawIp = escapeHtml(info.rawIp);
                    const eventIpHash = escapeHtml(info.ipHash);
                    const eventCountry = escapeHtml(info.country);
                    const eventPath = escapeHtml(info.path);
                    return `
                      <tr>
                        <td>${eventTs}</td>
                        <td>${eventAction}</td>
                        <td>${eventRawIp}</td>
                        <td>${eventIpHash}</td>
                        <td>${eventCountry}</td>
                        <td>${eventPath}</td>
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
  setStatus(elements.logsStatus, "Загружаю логи...");
  let cursor;
  const allLogs = [];
  while (true) {
    const query = new URLSearchParams({ limit: "200" });
    if (cursor) query.set("cursor", cursor);
    const endpoint = `/api/admin/logs?${query.toString()}`;
    const data = await adminFetch(endpoint, {}, { statusEl: elements.logsStatus });
    if (!data) return;
    if (!data.ok) {
      const code = getErrorCode(data);
      updateDiagnostics({
        endpoint,
        errorCode: code,
        store: data.store || "-",
        serverUrl: getServerUrl(),
        deviceIdPrefix: getDeviceIdPrefix()
      });
      setStatus(elements.logsStatus, formatApiError(endpoint, data), true);
      return;
    }
    allLogs.push(...(data.logs || []));
    updateDiagnostics({
      endpoint,
      errorCode: "-",
      store: data.store || diagnostics.store || "-",
      serverUrl: getServerUrl(),
      deviceIdPrefix: getDeviceIdPrefix()
    });
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
    const userInfo =
      payload?.user ||
      (log.userId
        ? {
            id: log.userId,
            name: log.userName || "",
            username: log.userUsername || ""
          }
        : null);
    const extra = payload?.extra || {};
    const deviceId = extra.deviceId ? `device:${extra.deviceId}` : null;
    const userId = userInfo?.id || log.userId || deviceId || "system";
    const entry = {
      ts: log.ts,
      action: log.action,
      path: log.path,
      ipHash: log.ipHash,
      rawIp: payload?.rawIp || "-",
      country: payload?.country || log.country || "-",
      user: userInfo,
      extra
    };
    if (!grouped.has(userId)) {
      const nick =
        pickNickname(userInfo) ||
        (extra.deviceName ? `Device: ${extra.deviceName}` : "System");
      grouped.set(userId, {
        userId,
        nickname: nick === "-" ? "System" : nick,
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
  elements.serverUrl.value = DEFAULT_SERVER;
  elements.deviceName.value = "My Device";
  updateDiagnostics({
    endpoint: "-",
    errorCode: "-",
    store: "-",
    verifiedBalance: "-",
    serverUrl: DEFAULT_SERVER,
    deviceIdPrefix: "-"
  });
  renderDeviceInfo();
  setStatus(elements.enrollStatus, "Ключи удалены.");
  elements.logsBody.innerHTML = "";
}

function setActiveView(view) {
  const target = view === "admin" ? "admin" : "logs";
  const views = document.querySelectorAll(".view");
  views.forEach((el) => {
    el.style.display = el.dataset.view === target ? "" : "none";
  });
  if (elements.tabLogs) elements.tabLogs.classList.toggle("is-active", target === "logs");
  if (elements.tabAdmin) elements.tabAdmin.classList.toggle("is-active", target === "admin");
  if (target === "admin") {
    setStatus(elements.adminStatus, "Админ режим активен.");
  }
}

function toNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  let normalized = String(value).trim().replace(/\s+/g, "");
  if (!normalized) return null;
  if (/^[+-]?\d{1,3}(?:[.,]\d{3})+$/.test(normalized)) {
    normalized = normalized.replace(/[.,]/g, "");
  } else {
    normalized = normalized.replace(",", ".");
  }
  const num = Number(normalized);
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
  const safeIdValue = escapeHtml(user.id);
  const safeNick = escapeHtml(
    user.username ? `@${user.username}` : user.name || "-"
  );
  const safeBalance = escapeHtml(formatMaybeNumber(user.balance));
  const safeTapValue = escapeHtml(formatMaybeNumber(user.tapValue));
  const safeTotalTaps = escapeHtml(formatMaybeNumber(user.totalTaps || 0));
  const safeTotalEarned = escapeHtml(formatMaybeNumber(user.totalEarned || 0));
  const safeBoostUntil = escapeHtml(
    user.boostUntil ? new Date(user.boostUntil).toLocaleString() : "нет"
  );
  const safeBannedUntil = escapeHtml(bannedUntil);
  const safeLeaderboardStatus = escapeHtml(
    user.leaderboardHidden ? "скрыт" : "виден"
  );
  elements.adminUserCard.innerHTML = `
    <div><strong>ID:</strong> ${safeIdValue}</div>
    <div><strong>Ник:</strong> ${safeNick}</div>
    <div><strong>Баланс:</strong> ${safeBalance}</div>
    <div><strong>Сила тапа:</strong> ${safeTapValue}</div>
    <div><strong>Всего тапов:</strong> ${safeTotalTaps}</div>
    <div><strong>Заработано:</strong> ${safeTotalEarned}</div>
    <div><strong>Буст до:</strong> ${safeBoostUntil}</div>
    <div><strong>Бан до:</strong> ${safeBannedUntil}</div>
    <div><strong>Рейтинг:</strong> ${safeLeaderboardStatus}</div>
  `;
}

async function adminFetch(path, options = {}, meta = {}) {
  const state = getState();
  if (!state.deviceId || !state.deviceToken) {
    const statusEl = meta.statusEl || elements.adminStatus;
    setStatus(statusEl, "Сначала зарегистрируйте устройство.", true);
    return null;
  }
  const serverUrl = state.serverUrl || DEFAULT_SERVER;
  const method = String(options.method || "GET").toUpperCase();
  const headers = {
    "x-device-id": state.deviceId,
    "x-device-token": state.deviceToken,
    ...(options.headers || {})
  };
  let body = options.body;
  if (method !== "GET" && method !== "HEAD") {
    let payload = {};
    if (body && typeof body === "string") {
      try {
        payload = JSON.parse(body);
      } catch {
        payload = {};
      }
    } else if (body && typeof body === "object") {
      payload = body;
    }
    payload.deviceId = state.deviceId;
    payload.deviceToken = state.deviceToken;
    body = JSON.stringify(payload);
    headers["content-type"] = "application/json";
  }

  try {
    const resp = await fetch(`${serverUrl}${path}`, {
      ...options,
      method,
      headers,
      body
    });
    let data = null;
    try {
      data = await resp.json();
    } catch {
      data = { ok: false, error: "invalid_json_response" };
    }
    updateDiagnostics({
      endpoint: path,
      errorCode: data?.ok ? "-" : getErrorCode(data),
      store: data?.store || "-",
      serverUrl,
      deviceIdPrefix: getDeviceIdPrefix()
    });
    return data;
  } catch {
    const statusEl = meta.statusEl || elements.adminStatus;
    updateDiagnostics({
      endpoint: path,
      errorCode: "network_error",
      serverUrl,
      deviceIdPrefix: getDeviceIdPrefix()
    });
    setStatus(statusEl, `Ошибка ${path}: network_error • server=${serverUrl}`, true);
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
  const endpoint = `/api/admin/user?userId=${encodeURIComponent(userId)}`;
  const data = await adminFetch(endpoint);
  if (!data) return;
  if (!data.ok) {
    setStatus(elements.adminStatus, formatApiError(endpoint, data), true);
    renderAdminUser(null);
    return;
  }
  renderAdminUser(data.user);
  const store = data.store || "unknown";
  updateDiagnostics({
    endpoint,
    errorCode: "-",
    store,
    verifiedBalance: data.user?.balance ?? "-",
    serverUrl: getServerUrl()
  });
  setStatus(
    elements.adminStatus,
    `OK ${endpoint} • store=${store} • server=${getServerUrl()}`
  );
}

async function fetchAdminUser(userId) {
  return adminFetch(`/api/admin/user?userId=${encodeURIComponent(userId)}`);
}

async function applyAdminChanges(extra = {}) {
  const userId = elements.adminUserId.value.trim();
  if (!userId) {
    setStatus(elements.adminStatus, "Введите User ID.", true);
    return;
  }
  const rawDelta = elements.adminDeltaBalance.value;
  const rawSet = elements.adminSetBalance.value;
  const rawTap = elements.adminSetTapValue.value;
  const rawBan = elements.adminBanMinutes.value;

  const hasRawDelta = String(rawDelta || "").trim() !== "";
  const hasRawSet = String(rawSet || "").trim() !== "";
  const hasRawTap = String(rawTap || "").trim() !== "";
  const hasRawBan = String(rawBan || "").trim() !== "";

  const deltaBalance = toNumber(rawDelta);
  const setBalance = toNumber(rawSet);
  const setTapValue = toNumber(rawTap);
  const banMinutes = toNumber(rawBan);

  if ((hasRawDelta && deltaBalance === null) || (hasRawSet && setBalance === null)) {
    setStatus(elements.adminStatus, "Некорректное число в поле баланса.", true);
    return;
  }
  if ((hasRawTap && setTapValue === null) || (hasRawBan && banMinutes === null)) {
    setStatus(elements.adminStatus, "Некорректное число в доп. полях.", true);
    return;
  }
  if (deltaBalance !== null && setBalance !== null) {
    setStatus(
      elements.adminStatus,
      "Заполни только одно поле: 'Баланс (±)' или 'Установить баланс'.",
      true
    );
    return;
  }

  const payload = {
    userId,
    deltaBalance,
    setBalance,
    setTapValue,
    banMinutes,
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
  const endpoint = "/api/admin/adjust";
  const data = await adminFetch(endpoint, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  if (!data) return;
  if (!data.ok) {
    setStatus(elements.adminStatus, formatApiError(endpoint, data), true);
    return;
  }
  renderAdminUser(data.user);
  if (payload.deltaBalance !== undefined) elements.adminDeltaBalance.value = "";
  if (payload.setBalance !== undefined) elements.adminSetBalance.value = "";
  const store = data.store || "unknown";
  const verifiedBalance =
    data.verifiedBalance !== undefined
      ? data.verifiedBalance
      : data.user?.balance ?? "-";
  updateDiagnostics({
    endpoint,
    errorCode: "-",
    store,
    verifiedBalance,
    serverUrl: getServerUrl()
  });
  setStatus(
    elements.adminStatus,
    `OK ${endpoint} • store=${store} • verifiedBalance=${formatMaybeNumber(verifiedBalance)} • server=${getServerUrl()}`
  );
}

async function checkConsistency() {
  const userId = elements.adminUserId.value.trim();
  if (!userId) {
    setStatus(elements.adminStatus, "Введите User ID.", true);
    return;
  }
  setStatus(elements.adminStatus, "Проверяю консистентность...");
  const userEndpoint = `/api/admin/user?userId=${encodeURIComponent(userId)}`;
  const checkEndpoint = `/api/admin/consistency?userId=${encodeURIComponent(userId)}`;
  const [userData, consistency] = await Promise.all([
    adminFetch(userEndpoint),
    adminFetch(checkEndpoint)
  ]);
  if (!userData || !consistency) return;
  if (!userData.ok) {
    setStatus(elements.adminStatus, formatApiError(userEndpoint, userData), true);
    return;
  }
  if (!consistency.ok) {
    setStatus(elements.adminStatus, formatApiError(checkEndpoint, consistency), true);
    return;
  }

  renderAdminUser(userData.user);
  const adminBalance = Number(userData.user?.balance || 0);
  const webappBalance = Number(consistency.webapp?.balance || 0);
  const ok = Boolean(consistency.consistent) && adminBalance === webappBalance;
  const store = consistency.store || userData.store || "unknown";
  updateDiagnostics({
    endpoint: checkEndpoint,
    errorCode: ok ? "-" : "consistency_mismatch",
    store,
    verifiedBalance: webappBalance,
    serverUrl: getServerUrl()
  });
  setStatus(
    elements.adminStatus,
    `${ok ? "OK" : "MISMATCH"} ${checkEndpoint} • store=${store} • admin=${formatMaybeNumber(adminBalance)} • webapp=${formatMaybeNumber(webappBalance)} • server=${getServerUrl()}`,
    !ok
  );
}

async function copyDiagnostics() {
  const lines = [
    `build=${diagnostics.build || "-"}`,
    `serverUrl=${diagnostics.serverUrl || getServerUrl()}`,
    `deviceIdPrefix=${diagnostics.deviceIdPrefix || getDeviceIdPrefix()}`,
    `endpoint=${diagnostics.endpoint || "-"}`,
    `errorCode=${diagnostics.errorCode || "-"}`,
    `store=${diagnostics.store || "-"}`,
    `verifiedBalance=${formatMaybeNumber(diagnostics.verifiedBalance || "-")}`
  ];
  const text = lines.join("\n");
  try {
    await navigator.clipboard.writeText(text);
    setStatus(elements.adminStatus, "Диагностика скопирована в буфер.");
  } catch {
    setStatus(elements.adminStatus, "Не удалось скопировать диагностику.", true);
  }
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

async function hideFromLeaderboard() {
  await applyAdminChanges({ removeFromLeaderboard: true });
}

async function showInLeaderboard() {
  await applyAdminChanges({ returnToLeaderboard: true });
}

async function mergeDemoUsers() {
  const sourceUserId = "502564";
  const targetUserId = "512889";
  setStatus(elements.adminStatus, "Миграция: загружаю пользователей...");

  const [source, target] = await Promise.all([
    fetchAdminUser(sourceUserId),
    fetchAdminUser(targetUserId)
  ]);

  if (!source?.ok || !source.user) {
    setStatus(elements.adminStatus, `Источник ${sourceUserId} не найден.`, true);
    return;
  }
  if (!target?.ok || !target.user) {
    setStatus(elements.adminStatus, `Целевой ${targetUserId} не найден.`, true);
    return;
  }

  const sourceBalance = Number(source.user.balance || 0);
  const targetBalance = Number(target.user.balance || 0);
  if (!Number.isFinite(sourceBalance) || sourceBalance <= 0) {
    setStatus(
      elements.adminStatus,
      `Миграция не нужна: у ${sourceUserId} баланс ${source.user.balance}.`
    );
    elements.adminUserId.value = targetUserId;
    await loadAdminUser();
    return;
  }

  setStatus(
    elements.adminStatus,
    `Переношу ${formatMaybeNumber(sourceBalance)} с ${sourceUserId} на ${targetUserId}...`
  );

  const adjustEndpoint = "/api/admin/adjust";
  const addToTarget = await adminFetch(adjustEndpoint, {
    method: "POST",
    body: JSON.stringify({ userId: targetUserId, deltaBalance: sourceBalance })
  });
  if (!addToTarget?.ok) {
    setStatus(
      elements.adminStatus,
      formatApiError(adjustEndpoint, addToTarget),
      true
    );
    return;
  }

  const clearSource = await adminFetch(adjustEndpoint, {
    method: "POST",
    body: JSON.stringify({ userId: sourceUserId, setBalance: 0 })
  });
  if (!clearSource?.ok) {
    setStatus(
      elements.adminStatus,
      formatApiError(adjustEndpoint, clearSource),
      true
    );
    return;
  }

  const verifiedTarget = await fetchAdminUser(targetUserId);
  const newBalance = verifiedTarget?.ok ? verifiedTarget.user.balance : targetBalance + sourceBalance;
  elements.adminUserId.value = targetUserId;
  if (verifiedTarget?.ok) {
    renderAdminUser(verifiedTarget.user);
  } else {
    await loadAdminUser();
  }
  setStatus(
    elements.adminStatus,
    `Миграция завершена: ${sourceUserId} -> ${targetUserId}. Новый баланс ${formatMaybeNumber(newBalance)}.`
  );
}

function normalizeReason(reason) {
  const text = String(reason || "").trim();
  if (!text) return "-";
  return text.replaceAll("_", " ");
}

function renderAnticheatRows(complaints) {
  const rows = Array.isArray(complaints) ? complaints : [];
  if (!rows.length) {
    elements.anticheatBody.innerHTML = `
      <tr>
        <td colspan="8">Жалоб нет.</td>
      </tr>
    `;
    return;
  }
  elements.anticheatBody.innerHTML = rows
    .map((item) => {
      const userId = escapeHtml(item.userId || "-");
      const nick = escapeHtml(
        item.userUsername ? `@${item.userUsername}` : item.userName || "-"
      );
      const reason = escapeHtml(normalizeReason(item.reason));
      const level = escapeHtml(item.level || "-");
      const score = escapeHtml(formatMaybeNumber(item.score || 0));
      const burst = escapeHtml(formatMaybeNumber(item.burstCount || 0));
      const interval = escapeHtml(`${formatMaybeNumber(item.intervalMs || 0)} мс`);
      const ts = escapeHtml(formatTs(item.ts));
      return `
        <tr>
          <td>${ts}</td>
          <td>${userId}</td>
          <td>${nick}</td>
          <td>${reason}</td>
          <td>${level}</td>
          <td>${score}</td>
          <td>${burst}</td>
          <td>${interval}</td>
        </tr>
      `;
    })
    .join("");
}

async function loadAnticheatComplaints() {
  if (!elements.anticheatStatus || !elements.anticheatBody) return;
  const userId = elements.adminUserId.value.trim();
  setStatus(elements.anticheatStatus, "Загружаю жалобы античита...");
  let cursor;
  const complaints = [];
  while (true) {
    const query = new URLSearchParams({ limit: "120" });
    if (userId) query.set("userId", userId);
    if (cursor) query.set("cursor", cursor);
    const endpoint = `/api/admin/anticheat?${query.toString()}`;
    const data = await adminFetch(endpoint, {}, { statusEl: elements.anticheatStatus });
    if (!data) return;
    if (!data.ok) {
      setStatus(elements.anticheatStatus, formatApiError(endpoint, data), true);
      return;
    }
    complaints.push(...(Array.isArray(data.complaints) ? data.complaints : []));
    cursor = data.cursor;
    if (!cursor) {
      const store = data.store || "unknown";
      updateDiagnostics({
        endpoint,
        errorCode: "-",
        store,
        serverUrl: getServerUrl()
      });
      break;
    }
  }
  renderAnticheatRows(complaints);
  setStatus(
    elements.anticheatStatus,
    `Жалобы загружены • записей=${complaints.length}${userId ? ` • userId=${userId}` : ""}`
  );
}

elements.enrollBtn.addEventListener("click", enrollDevice);
elements.loadLogs.addEventListener("click", loadLogs);
elements.clearLocal.addEventListener("click", clearLocal);
elements.copyDiag?.addEventListener("click", copyDiagnostics);
elements.openAdmin?.addEventListener("click", () => {
  window.location.hash = "#admin";
  setActiveView("admin");
});
elements.tabLogs?.addEventListener("click", () => setActiveView("logs"));
elements.tabAdmin?.addEventListener("click", () => setActiveView("admin"));
elements.adminLoadUser?.addEventListener("click", loadAdminUser);
elements.adminApply?.addEventListener("click", () => applyAdminChanges());
elements.adminCheckConsistency?.addEventListener("click", checkConsistency);
elements.adminMergeDemo?.addEventListener("click", mergeDemoUsers);
elements.adminUnban?.addEventListener("click", unbanUser);
elements.adminHideFromLeaderboard?.addEventListener("click", hideFromLeaderboard);
elements.adminShowInLeaderboard?.addEventListener("click", showInLeaderboard);
elements.adminResetDaily?.addEventListener("click", resetDaily);
elements.adminClearBoost?.addEventListener("click", clearBoost);
elements.adminLoadAnticheat?.addEventListener("click", loadAnticheatComplaints);

const state = getState();
elements.serverUrl.value = state.serverUrl || DEFAULT_SERVER;
elements.deviceName.value = state.deviceName || "My Device";
elements.serverUrl.addEventListener("change", () => {
  const current = getState();
  saveState({ ...current, serverUrl: elements.serverUrl.value.trim() || DEFAULT_SERVER });
});
elements.deviceName.addEventListener("change", () => {
  const current = getState();
  saveState({ ...current, deviceName: elements.deviceName.value.trim() || "My Device" });
});
renderDeviceInfo();
setActiveView(window.location.hash === "#admin" ? "admin" : "logs");
if (elements.buildVersion) {
  const build = window.__ADMIN_BUILD__ || "web";
  elements.buildVersion.textContent = build;
  updateDiagnostics({ build });
}
