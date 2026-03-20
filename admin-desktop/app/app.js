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

  const state = {
    serverUrl,
    deviceId: data.deviceId,
    deviceToken: data.deviceToken,
    publicKeyJwk,
    privateKeyJwk,
    fingerprint: data.fingerprint
  };
  saveState(state);
  setStatus(elements.enrollStatus, "Устройство зарегистрировано.");
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

function rowHtml(log, payload) {
  const rawIp = payload?.rawIp || "-";
  return `
    <tr>
      <td>${new Date(log.ts).toLocaleString()}</td>
      <td>${log.userId || "-"}</td>
      <td>${log.action || "-"}</td>
      <td>${rawIp}</td>
      <td>${log.ipHash || "-"}</td>
      <td>${log.country || "-"}</td>
      <td>${log.path || "-"}</td>
    </tr>
  `;
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
  const filtered = filter
    ? rows.filter(({ log, payload }) => {
        const hay = [
          log.userId,
          log.ipHash,
          log.action,
          payload?.rawIp
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(filter);
      })
    : rows;

  elements.logsBody.innerHTML = filtered
    .map(({ log, payload }) => rowHtml(log, payload))
    .join("");
  setStatus(elements.logsStatus, `Логов: ${filtered.length}`);
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
