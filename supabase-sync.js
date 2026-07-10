/*
  Programa Preparador Físico · Supabase Sync SAFE

  Correcciones:
  - Evita que ppfLocalSnapshots llene localStorage y bloquee el guardado.
  - Si localStorage está lleno, no rompe la app: guarda el valor en memoria y lo sube a Supabase.
  - Incluye valoraciones en la sincronización.
  - Evita sobrescribir Supabase con arrays vacíos cuando ya hay datos en nube.
*/

const PPF_SYNC_KEYS = [
  "patients",
  "sessions",
  "histories",
  "patientFiles",
  "exerciseLibrary",
  "completedSessions",
  "valoraciones",
  "notifications",
  "userStats"
];

window.__PPF_VOLATILE_STORAGE__ = window.__PPF_VOLATILE_STORAGE__ || {};

function ppfSupabaseIsConfigured() {
  const cfg = window.PPF_SUPABASE_CONFIG || {};
  return Boolean(
    cfg.enabled &&
    cfg.url &&
    cfg.anonKey &&
    !cfg.url.includes("PEGA_AQUI") &&
    !cfg.anonKey.includes("PEGA_AQUI") &&
    window.supabase
  );
}

function ppfSafeJsonParse(raw, fallback = []) {
  try {
    if (raw === undefined || raw === null || raw === "") return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function ppfReadLocalJson(key) {
  if (Object.prototype.hasOwnProperty.call(window.__PPF_VOLATILE_STORAGE__, key)) {
    return ppfSafeJsonParse(window.__PPF_VOLATILE_STORAGE__[key], []);
  }
  return ppfSafeJsonParse(localStorage.getItem(key), []);
}

function ppfTryNativeSetItem(key, value) {
  const nativeSetItem = window.__PPF_NATIVE_SETITEM__ || localStorage.setItem.bind(localStorage);
  nativeSetItem(key, value);
}

function ppfWriteLocalJson(key, value) {
  const raw = JSON.stringify(value || []);
  ppfSafeSetItem(key, raw);
}

function ppfIsQuotaError(error) {
  return error && (
    error.name === "QuotaExceededError" ||
    error.code === 22 ||
    String(error.message || "").toLowerCase().includes("quota")
  );
}

function ppfClearHeavyLocalKeys() {
  try { localStorage.removeItem("ppfLocalSnapshots"); } catch {}
  try { localStorage.removeItem("ppfSnapshotLocalState"); } catch {}
  try { localStorage.removeItem("ppfSnapshots"); } catch {}
}

function ppfSafeSetItem(key, value) {
  // Los snapshots locales estaban guardando fotos base64 y llenaban el navegador.
  // Los desactivamos: Supabase + el backup SQL/CSV son la copia fiable.
  if (key === "ppfLocalSnapshots" || key === "ppfSnapshotLocalState" || key === "ppfSnapshots") {
    ppfClearHeavyLocalKeys();
    return true;
  }

  try {
    ppfTryNativeSetItem(key, value);
    if (Object.prototype.hasOwnProperty.call(window.__PPF_VOLATILE_STORAGE__, key)) {
      delete window.__PPF_VOLATILE_STORAGE__[key];
    }
    return true;
  } catch (error) {
    if (!ppfIsQuotaError(error)) throw error;

    console.warn("localStorage lleno. Limpiando snapshots pesados y reintentando:", key);
    ppfClearHeavyLocalKeys();

    try {
      ppfTryNativeSetItem(key, value);
      if (Object.prototype.hasOwnProperty.call(window.__PPF_VOLATILE_STORAGE__, key)) {
        delete window.__PPF_VOLATILE_STORAGE__[key];
      }
      return true;
    } catch (secondError) {
      if (!ppfIsQuotaError(secondError)) throw secondError;

      // Último recurso: no abortar el guardado. Conservamos el valor en memoria
      // para poder subirlo a Supabase en esta misma sesión.
      console.warn("localStorage sigue lleno. Se usa almacenamiento temporal en memoria para:", key);
      window.__PPF_VOLATILE_STORAGE__[key] = value;
      return false;
    }
  }
}

async function ppfWaitForSupabaseLibrary(timeoutMs = 3500) {
  const start = Date.now();
  while (!window.supabase && Date.now() - start < timeoutMs) {
    await new Promise(resolve => setTimeout(resolve, 80));
  }
  return Boolean(window.supabase);
}

function ppfCreateClient() {
  if (!ppfSupabaseIsConfigured()) return null;
  if (!window.ppfSupabaseClient) {
    window.ppfSupabaseClient = window.supabase.createClient(
      window.PPF_SUPABASE_CONFIG.url,
      window.PPF_SUPABASE_CONFIG.anonKey
    );
  }
  return window.ppfSupabaseClient;
}

async function ppfGetCloudKey(key) {
  const client = ppfCreateClient();
  if (!client || !PPF_SYNC_KEYS.includes(key)) return null;
  const { data, error } = await client
    .from("app_state")
    .select("value,updated_at")
    .eq("key", key)
    .maybeSingle();
  if (error) return null;
  return data || null;
}

function ppfShouldBlockDangerousOverwrite(key, localValue, cloudValue) {
  if (!Array.isArray(localValue) || !Array.isArray(cloudValue)) return false;
  if (cloudValue.length === 0) return false;

  // Nunca vaciar en nube con un array vacío local.
  if (localValue.length === 0) return true;

  // Protección especial de pacientes: no subir menos pacientes que nube.
  if (key === "patients" && localValue.length < cloudValue.length) return true;

  return false;
}


function ppfNormalizePresenceKey(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^@+/, "")
    .replace(/\s+/g, "");
}

function ppfPresenceLatestIso(...values) {
  let best = "";
  let bestMs = 0;

  values.forEach(value => {
    if (!value) return;
    const ms = new Date(value).getTime();
    if (Number.isFinite(ms) && ms > bestMs) {
      bestMs = ms;
      best = value;
    }
  });

  return best;
}

function ppfMergePresenceRecord(target = {}, source = {}) {
  if (window.PPF_PRESENCE?.mergeRecord) {
    return window.PPF_PRESENCE.mergeRecord(target, source);
  }

  const targetEvents = target.loginEvents && typeof target.loginEvents === "object"
    ? target.loginEvents
    : {};

  const sourceEvents = source.loginEvents && typeof source.loginEvents === "object"
    ? source.loginEvents
    : {};

  const loginEvents = { ...targetEvents, ...sourceEvents };
  const sessions = { ...(target.sessions && typeof target.sessions === "object" ? target.sessions : {}) };
  Object.entries(source.sessions && typeof source.sessions === "object" ? source.sessions : {}).forEach(([id, incoming]) => {
    const current = sessions[id];
    const currentIso = ppfPresenceLatestIso(current?.lastActivity, current?.lastHeartbeat, current?.lastSeen, current?.lastLogout);
    const incomingIso = ppfPresenceLatestIso(incoming?.lastActivity, incoming?.lastHeartbeat, incoming?.lastSeen, incoming?.lastLogout);
    if (!current || new Date(incomingIso || 0).getTime() >= new Date(currentIso || 0).getTime()) sessions[id] = incoming;
  });

  const legacyCount = Math.max(
    Number(target.count ?? target.accessCount ?? target.accesos ?? 0),
    Number(source.count ?? source.accessCount ?? source.accesos ?? 0)
  );

  const baseCount = Math.max(
    Number(target.baseCount ?? 0),
    Number(source.baseCount ?? 0),
    legacyCount - Object.keys(loginEvents).length,
    0
  );

  return {
    ...target,
    ...source,
    baseCount,
    loginEvents,
    sessions,
    count: Math.max(legacyCount, baseCount + Object.keys(loginEvents).length),
    online: Boolean(target.online || source.online),
    lastLogin: ppfPresenceLatestIso(target.lastLogin, source.lastLogin),
    lastSeen: ppfPresenceLatestIso(target.lastSeen, source.lastSeen),
    lastHeartbeat: ppfPresenceLatestIso(target.lastHeartbeat, source.lastHeartbeat),
    lastActivity: ppfPresenceLatestIso(target.lastActivity, source.lastActivity),
    lastSync: ppfPresenceLatestIso(target.lastSync, source.lastSync),
    lastLogout: ppfPresenceLatestIso(target.lastLogout, source.lastLogout),
    device: source.device || target.device || "",
    version: 3,
    presenceVersion: "PPF-PRO-3"
  };
}

function ppfMergeUserStats(left = {}, right = {}) {
  const merged = {};

  [left, right].forEach(source => {
    Object.entries(source || {}).forEach(([rawKey, record]) => {
      if (!record || typeof record !== "object") return;

      const key = ppfNormalizePresenceKey(
        record.nickname ||
        record.username ||
        record.patientNickname ||
        rawKey
      );

      if (!key) return;
      merged[key] = ppfMergePresenceRecord(merged[key] || {}, record);
    });
  });

  return merged;
}

async function ppfPullCloudToLocal() {
  const client = ppfCreateClient();
  if (!client) return false;

  const { data, error } = await client
    .from("app_state")
    .select("key,value,updated_at")
    .in("key", PPF_SYNC_KEYS);

  if (error) {
    console.warn("Supabase pull error:", error.message);
    return false;
  }

  (data || []).forEach(row => {
    if (!PPF_SYNC_KEYS.includes(row.key)) return;

    if (row.key === "userStats") {
      const localStats = ppfReadLocalJson("userStats") || {};
      const cloudStats = row.value || {};
      const mergedStats = ppfMergeUserStats(localStats, cloudStats);
      ppfWriteLocalJson("userStats", mergedStats);
      return;
    }

    if (row.key === "sessions") {
      const mergedSessions = ppfMergeSessions(
        ppfReadLocalJson("sessions"),
        row.value || []
      );
      ppfWriteLocalJson("sessions", mergedSessions);
      window.sessions = mergedSessions;
      return;
    }

    if (row.key === "notifications") {
      const mergedNotifications = ppfMergeNotifications(
        ppfReadLocalJson("notifications"),
        row.value || []
      );
      ppfWriteLocalJson("notifications", mergedNotifications);
      return;
    }

    ppfWriteLocalJson(row.key, row.value || []);
  });

  ppfSafeSetItem("ppfSupabaseLastPull", new Date().toISOString());
  return true;
}




function ppfMergeSessions(left = [], right = []) {
  const byId = new Map();

  [...(Array.isArray(left) ? left : []), ...(Array.isArray(right) ? right : [])].forEach(item => {
    if (!item || typeof item !== "object") return;

    const fallbackId = `${item.patientNickname || item.nickname || ""}:${item.numero || item.sessionNumber || ""}`;
    const id = String(item.id || item.sessionId || fallbackId).trim();
    if (!id) return;

    const previous = byId.get(id);
    if (!previous) {
      byId.set(id, { ...item, id: item.id || id });
      return;
    }

    const previousTime = new Date(previous.updatedAt || previous.createdAt || previous.fecha || 0).getTime() || 0;
    const incomingTime = new Date(item.updatedAt || item.createdAt || item.fecha || 0).getTime() || 0;
    byId.set(id, incomingTime >= previousTime ? { ...previous, ...item, id: item.id || previous.id || id } : previous);
  });

  return Array.from(byId.values()).sort((a, b) => {
    const patientCompare = String(a.patientNickname || "").localeCompare(String(b.patientNickname || ""));
    if (patientCompare !== 0) return patientCompare;
    return Number(a.numero || 0) - Number(b.numero || 0);
  });
}

function ppfMergeNotifications(left = [], right = []) {
  const byId = new Map();

  [...(Array.isArray(left) ? left : []), ...(Array.isArray(right) ? right : [])].forEach(item => {
    if (!item || typeof item !== "object") return;
    const id = String(item.id || `${item.type || "notification"}:${item.sessionId || ""}:${item.recipient || ""}`).trim();
    if (!id) return;

    const previous = byId.get(id) || {};
    const readBy = Array.from(new Set([
      ...(Array.isArray(previous.readBy) ? previous.readBy : []),
      ...(Array.isArray(item.readBy) ? item.readBy : [])
    ].map(value => String(value || "").trim()).filter(Boolean)));

    const previousTime = new Date(previous.updatedAt || previous.createdAt || 0).getTime() || 0;
    const incomingTime = new Date(item.updatedAt || item.createdAt || 0).getTime() || 0;
    const newest = incomingTime >= previousTime ? item : previous;

    byId.set(id, { ...previous, ...newest, id, readBy });
  });

  return Array.from(byId.values())
    .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
    .slice(-1000);
}

function ppfSanitizePatientsForCloud(value) {
  if (!Array.isArray(value)) return value || [];
  const heavyPhotoKeys = [
    "foto", "photo", "imagen", "image", "avatar",
    "profileImage", "profilePhoto", "fotoBase64", "photoBase64", "imageBase64"
  ];
  return value.map(patient => {
    if (!patient || typeof patient !== "object") return patient;
    const clean = { ...patient };
    heavyPhotoKeys.forEach(key => {
      if (typeof clean[key] === "string" && clean[key].startsWith("data:image/")) {
        clean[key] = "";
      }
    });
    return clean;
  });
}

function ppfSanitizeValueForCloud(key, value) {
  if (key === "patients") return ppfSanitizePatientsForCloud(value);
  if (key === "userStats") return value || {};
  return value || [];
}

async function ppfPushValueToCloud(key, value) {
  const client = ppfCreateClient();
  if (!client || !PPF_SYNC_KEYS.includes(key)) return false;

  value = ppfSanitizeValueForCloud(key, value);

  const cloud = await ppfGetCloudKey(key);
  const cloudValue = cloud?.value || [];

  if (key === "userStats") {
    value = ppfMergeUserStats(cloudValue || {}, value || {});
    ppfWriteLocalJson("userStats", value);
  }

  if (key === "sessions") {
    value = ppfMergeSessions(cloudValue || [], value || []);
    ppfWriteLocalJson("sessions", value);
    window.sessions = value;
  }

  if (key === "notifications") {
    value = ppfMergeNotifications(cloudValue || [], value || []);
    ppfWriteLocalJson("notifications", value);
  }

  if (ppfShouldBlockDangerousOverwrite(key, value, cloudValue)) {
    console.warn("Subida bloqueada para evitar sobrescritura peligrosa:", key, {
      localLength: Array.isArray(value) ? value.length : null,
      cloudLength: Array.isArray(cloudValue) ? cloudValue.length : null
    });
    return false;
  }

  const { error } = await client
    .from("app_state")
    .upsert({
      key,
      value: value || [],
      updated_at: new Date().toISOString()
    }, { onConflict: "key" });

  if (error) {
    console.warn("Supabase push error:", key, error.message);
    return false;
  }

  ppfSafeSetItem("ppfSupabaseLastPush", new Date().toISOString());
  return true;
}

async function ppfPushKeyToCloud(key) {
  return ppfPushValueToCloud(key, ppfReadLocalJson(key));
}

async function ppfPushAllToCloud() {
  const client = ppfCreateClient();
  if (!client) return false;
  for (const key of PPF_SYNC_KEYS) {
    await ppfPushKeyToCloud(key);
  }
  return true;
}

function ppfPatchLocalStorageForSync() {
  if (window.__PPF_LOCALSTORAGE_PATCHED__) return;
  window.__PPF_LOCALSTORAGE_PATCHED__ = true;

  window.__PPF_NATIVE_SETITEM__ = localStorage.setItem.bind(localStorage);
  const originalRemoveItem = localStorage.removeItem.bind(localStorage);

  localStorage.setItem = function patchedSetItem(key, value) {
    const stored = ppfSafeSetItem(key, value);

    if (PPF_SYNC_KEYS.includes(key) && ppfSupabaseIsConfigured()) {
      const parsedValue = ppfSafeJsonParse(value, []);
      clearTimeout(window.__PPF_SYNC_TIMER__);
      window.__PPF_SYNC_TIMER__ = setTimeout(() => {
        ppfPushValueToCloud(key, parsedValue);
      }, 250);
    }

    return stored;
  };

  localStorage.removeItem = function patchedRemoveItem(key) {
    try { delete window.__PPF_VOLATILE_STORAGE__[key]; } catch {}
    return originalRemoveItem(key);
  };
}


function ppfSubscribeKey(key, callback) {
  const client = ppfCreateClient();
  if (!client || !key || typeof callback !== "function" || typeof client.channel !== "function") return null;

  const channelName = `ppf-app-state-${String(key).replace(/[^a-z0-9_-]/gi, "-")}-${Math.random().toString(36).slice(2, 8)}`;
  const channel = client
    .channel(channelName)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "app_state",
      filter: `key=eq.${key}`
    }, payload => callback(payload))
    .subscribe();

  return {
    channel,
    unsubscribe() {
      try { client.removeChannel(channel); } catch (_) {}
    }
  };
}

async function ppfSupabaseBootstrap() {
  ppfClearHeavyLocalKeys();
  ppfPatchLocalStorageForSync();

  await ppfWaitForSupabaseLibrary();

  if (!ppfSupabaseIsConfigured()) {
    window.PPF_SUPABASE_STATUS = "disabled";
    return false;
  }

  window.PPF_SUPABASE_STATUS = "loading";
  const ok = await ppfPullCloudToLocal();
  window.PPF_SUPABASE_STATUS = ok ? "connected" : "error";
  return ok;
}

window.PPF_SUPABASE_READY = ppfSupabaseBootstrap();

window.PPF_SUPABASE = {
  pull: ppfPullCloudToLocal,
  push: ppfPushAllToCloud,
  pushKey: ppfPushKeyToCloud,
  pushValue: ppfPushValueToCloud,
  subscribeKey: ppfSubscribeKey,
  status: () => window.PPF_SUPABASE_STATUS || "disabled",
  keys: PPF_SYNC_KEYS
};
