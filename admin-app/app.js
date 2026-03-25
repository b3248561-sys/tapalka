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
  adminMergeDemo: document.getElementById("adminMergeDemo"),
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

function escapeHtml(value) {
  const text = String(value ?? "");
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
  const normalized = String(value).trim().replace(/\s+/g, "").replace(",", ".");
  if (!normalized) return null;
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
  const safeBalance = escapeHtml(user.balance);
  const safeTapValue = escapeHtml(user.tapValue);
  const safeTotalTaps = escapeHtml(user.totalTaps || 0);
  const safeTotalEarned = escapeHtml(user.totalEarned || 0);
  const safeBoostUntil = escapeHtml(
    user.boostUntil ? new Date(user.boostUntil).toLocaleString() : "нет"
  );
  const safeBannedUntil = escapeHtml(bannedUntil);
  elements.adminUserCard.innerHTML = `
    <div><strong>ID:</strong> ${safeIdValue}</div>
    <div><strong>Ник:</strong> ${safeNick}</div>
    <div><strong>Баланс:</strong> ${safeBalance}</div>
    <div><strong>Сила тапа:</strong> ${safeTapValue}</div>
    <div><strong>Всего тапов:</strong> ${safeTotalTaps}</div>
    <div><strong>Заработано:</strong> ${safeTotalEarned}</div>
    <div><strong>Буст до:</strong> ${safeBoostUntil}</div>
    <div><strong>Бан до:</strong> ${safeBannedUntil}</div>
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
  const data = await adminFetch("/api/admin/adjust", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  if (!data) return;
  if (!data.ok) {
    setStatus(elements.adminStatus, data.error || "Ошибка изменения.", true);
    return;
  }
  const verify = await fetchAdminUser(userId);
  if (!verify?.ok || !verify.user) {
    renderAdminUser(data.user);
    setStatus(elements.adminStatus, "Изменения применены (без верификации).");
    return;
  }
  renderAdminUser(verify.user);
  if (payload.deltaBalance !== undefined) elements.adminDeltaBalance.value = "";
  if (payload.setBalance !== undefined) elements.adminSetBalance.value = "";
  setStatus(
    elements.adminStatus,
    `Изменения применены. ID ${verify.user.id}, баланс ${verify.user.balance}.`
  );
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
    `Переношу ${sourceBalance} с ${sourceUserId} на ${targetUserId}...`
  );

  const addToTarget = await adminFetch("/api/admin/adjust", {
    method: "POST",
    body: JSON.stringify({ userId: targetUserId, deltaBalance: sourceBalance })
  });
  if (!addToTarget?.ok) {
    setStatus(
      elements.adminStatus,
      `Ошибка начисления в ${targetUserId}: ${addToTarget?.error || "unknown"}`,
      true
    );
    return;
  }

  const clearSource = await adminFetch("/api/admin/adjust", {
    method: "POST",
    body: JSON.stringify({ userId: sourceUserId, setBalance: 0 })
  });
  if (!clearSource?.ok) {
    setStatus(
      elements.adminStatus,
      `Начислил в ${targetUserId}, но не обнулил ${sourceUserId}: ${clearSource?.error || "unknown"}`,
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
    `Миграция завершена: ${sourceUserId} -> ${targetUserId}. Новый баланс ${newBalance}.`
  );
}

elements.enrollBtn.addEventListener("click", enrollDevice);
elements.loadLogs.addEventListener("click", loadLogs);
elements.clearLocal.addEventListener("click", clearLocal);
elements.openAdmin?.addEventListener("click", () => {
  window.location.hash = "#admin";
  setActiveView("admin");
});
elements.tabLogs?.addEventListener("click", () => setActiveView("logs"));
elements.tabAdmin?.addEventListener("click", () => setActiveView("admin"));
elements.adminLoadUser?.addEventListener("click", loadAdminUser);
elements.adminApply?.addEventListener("click", () => applyAdminChanges());
elements.adminMergeDemo?.addEventListener("click", mergeDemoUsers);
elements.adminUnban?.addEventListener("click", unbanUser);
elements.adminResetDaily?.addEventListener("click", resetDaily);
elements.adminClearBoost?.addEventListener("click", clearBoost);

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
