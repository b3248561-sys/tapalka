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
  clearLocal: document.getElementById("clearLocal")
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
  const resp = await fetch(`${serverUrl}/api/admin/logs?limit=100`, {
    headers: {
      "x-device-id": state.deviceId,
      "x-device-token": state.deviceToken
    }
  });
  let data;
  try {
    data = await resp.json();
  } catch {
    setStatus(elements.logsStatus, "Ошибка чтения ответа сервера.", true);
    return;
  }
  if (!data.ok) {
    setStatus(elements.logsStatus, data.error || "Ошибка загрузки", true);
    return;
  }
  const privateKey = await getPrivateKey();
  const rows = [];
  for (const log of data.logs) {
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

elements.enrollBtn.addEventListener("click", enrollDevice);
elements.loadLogs.addEventListener("click", loadLogs);
elements.clearLocal.addEventListener("click", clearLocal);

const state = getState();
elements.serverUrl.value = state.serverUrl || DEFAULT_SERVER;
elements.deviceName.value = state.deviceName || "My Device";
renderDeviceInfo();
