/* =========================================================
   PPF PRO · PRESENCE ENGINE v3
   Única fuente de verdad: localStorage["userStats"]
   Estado online calculado; nunca depende del booleano guardado.
   ========================================================= */
(function () {
  "use strict";

  if (window.PPF_PRESENCE?.version === "3.0.0") return;

  const STORAGE_KEY = "userStats";
  const HEARTBEAT_MS = 30000;
  const ONLINE_TIMEOUT_MS = 90000;
  const HIDDEN_GRACE_MS = 12000;
  const AUTO_SYNC_MS = 10000;
  const SESSION_KEY = "ppfPresenceSessionId";

  let heartbeatTimer = null;
  let hiddenTimer = null;
  let autoSyncTimer = null;
  let realtimeSubscription = null;
  let autoSyncBusy = false;
  let activeUser = null;
  let listenersBound = false;

  function normalizeKey(value = "") {
    return String(value || "").trim().toLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").replace(/^@+/, "").replace(/\s+/g, "");
  }

  function userKey(user = {}) {
    return normalizeKey(user.nickname || user.username || user.patientNickname || user.id || "");
  }

  function nowIso() { return new Date().toISOString(); }
  function parseMs(value) {
    const ms = value ? new Date(value).getTime() : 0;
    return Number.isFinite(ms) ? ms : 0;
  }
  function latestIso(...values) {
    return values.reduce((best, value) => parseMs(value) > parseMs(best) ? value : best, "");
  }
  function createId(prefix = "presence") {
    return `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
  }
  function createLoginEventId(user = {}) { return createId(userKey(user) || "user"); }
  function getSessionId() {
    try {
      let id = sessionStorage.getItem(SESSION_KEY);
      if (!id) {
        id = createId("session");
        sessionStorage.setItem(SESSION_KEY, id);
      }
      return id;
    } catch (_) {
      if (!window.__ppfPresenceSessionId) window.__ppfPresenceSessionId = createId("session");
      return window.__ppfPresenceSessionId;
    }
  }

  function deviceLabel() {
    const ua = navigator.userAgent || "";
    let standalone = false;
    try {
      standalone = Boolean(window.matchMedia?.("(display-mode: standalone)")?.matches || navigator.standalone);
    } catch (_) {}
    if (/android/i.test(ua)) return standalone ? "Android PWA" : "Android Web";
    if (/iphone|ipad|ipod/i.test(ua)) return standalone ? "iOS PWA" : "iOS Web";
    return standalone ? "PWA" : "Web";
  }

  function normalizeSessions(value) {
    if (!value || typeof value !== "object") return {};
    const result = {};
    Object.entries(value).forEach(([id, session]) => {
      if (!session || typeof session !== "object") return;
      result[id] = {
        device: session.device || "",
        lastHeartbeat: session.lastHeartbeat || session.last_heartbeat || null,
        lastActivity: session.lastActivity || session.last_activity || null,
        lastSeen: session.lastSeen || session.last_seen || null,
        lastLogout: session.lastLogout || session.last_logout || null,
        closed: Boolean(session.closed)
      };
    });
    return result;
  }

  function mergeRecord(target = {}, source = {}) {
    const loginEvents = {
      ...(target.loginEvents && typeof target.loginEvents === "object" ? target.loginEvents : {}),
      ...(source.loginEvents && typeof source.loginEvents === "object" ? source.loginEvents : {})
    };
    const sessions = normalizeSessions(target.sessions);
    Object.entries(normalizeSessions(source.sessions)).forEach(([id, incoming]) => {
      const current = sessions[id];
      const currentMs = parseMs(latestIso(current?.lastActivity, current?.lastHeartbeat, current?.lastSeen, current?.lastLogout));
      const incomingMs = parseMs(latestIso(incoming.lastActivity, incoming.lastHeartbeat, incoming.lastSeen, incoming.lastLogout));
      if (!current || incomingMs >= currentMs) sessions[id] = incoming;
    });
    const legacyCount = Math.max(
      Number(target.count ?? target.accessCount ?? target.accesos ?? 0),
      Number(source.count ?? source.accessCount ?? source.accesos ?? 0)
    );
    const baseCount = Math.max(
      Number(target.baseCount ?? 0), Number(source.baseCount ?? 0),
      legacyCount - Object.keys(loginEvents).length, 0
    );
    const merged = {
      ...target, ...source,
      baseCount,
      loginEvents,
      sessions,
      count: Math.max(legacyCount, baseCount + Object.keys(loginEvents).length),
      lastLogin: latestIso(target.lastLogin, target.last_login, source.lastLogin, source.last_login),
      lastSeen: latestIso(target.lastSeen, target.last_seen, source.lastSeen, source.last_seen),
      lastHeartbeat: latestIso(target.lastHeartbeat, target.last_heartbeat, source.lastHeartbeat, source.last_heartbeat),
      lastActivity: latestIso(target.lastActivity, target.last_activity, source.lastActivity, source.last_activity),
      lastSync: latestIso(target.lastSync, target.last_sync, source.lastSync, source.last_sync),
      lastLogout: latestIso(target.lastLogout, target.last_logout, source.lastLogout, source.last_logout),
      device: source.device || target.device || "",
      version: 3,
      presenceVersion: "PPF-PRO-3"
    };
    merged.online = isOnline(merged);
    return merged;
  }

  function canonicalizeStats(stats = {}) {
    const result = {};
    Object.entries(stats || {}).forEach(([rawKey, value]) => {
      if (!value || typeof value !== "object") return;
      const key = normalizeKey(rawKey);
      if (key) result[key] = mergeRecord(result[key] || {}, value);
    });
    return result;
  }

  function readStats() {
    try {
      const original = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const stats = canonicalizeStats(original && typeof original === "object" ? original : {});
      if (JSON.stringify(stats) !== JSON.stringify(original)) localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
      return stats;
    } catch (_) { return {}; }
  }

  function writeStats(stats = {}) {
    try {
      const canonical = canonicalizeStats(stats);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(canonical));
      window.dispatchEvent(new CustomEvent("ppf:presence-local-change", { detail: { stats: canonical } }));
    } catch (_) {}
  }

  function ensureRecord(stats, key) {
    stats[key] = mergeRecord({
      count: 0, baseCount: 0, loginEvents: {}, sessions: {}, online: false,
      lastLogin: null, lastHeartbeat: null, lastSeen: null, lastActivity: null,
      lastLogout: null, lastSync: null, device: "", version: 3
    }, stats[key] || {});
    return stats[key];
  }

  function activityIso(record = {}) {
    return latestIso(record.lastActivity, record.lastHeartbeat, record.lastSeen, record.lastSync, record.lastLogin);
  }

  function sessionIsOnline(session = {}, timeoutMs = ONLINE_TIMEOUT_MS) {
    if (session.closed) return false;
    const activity = latestIso(session.lastActivity, session.lastHeartbeat, session.lastSeen);
    return Boolean(parseMs(activity) && Date.now() - parseMs(activity) < timeoutMs);
  }

  function isOnline(record = {}, timeoutMs = ONLINE_TIMEOUT_MS) {
    const sessions = normalizeSessions(record.sessions);
    if (Object.keys(sessions).length) return Object.values(sessions).some(session => sessionIsOnline(session, timeoutMs));
    const activityMs = parseMs(activityIso(record));
    const logoutMs = parseMs(record.lastLogout);
    return Boolean(activityMs && Date.now() - activityMs < timeoutMs && (!logoutMs || logoutMs < activityMs));
  }

  async function pushNormal() {
    try { return await window.PPF_SUPABASE?.pushKey?.(STORAGE_KEY); }
    catch (error) { console.warn("PPF Presence: error de sincronización.", error); return false; }
  }

  function pushKeepAlive(stats) {
    const cfg = window.PPF_SUPABASE_CONFIG || {};
    if (!cfg.enabled || !cfg.url || !cfg.anonKey) return;
    try {
      fetch(`${cfg.url}/rest/v1/app_state?key=eq.${encodeURIComponent(STORAGE_KEY)}`, {
        method: "PATCH", keepalive: true,
        headers: { apikey: cfg.anonKey, Authorization: `Bearer ${cfg.anonKey}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ value: stats, updated_at: nowIso() })
      }).catch(() => {});
    } catch (_) {}
  }

  function update(user, online, options = {}) {
    const key = userKey(user);
    if (!key) return null;
    const stats = readStats();
    const record = ensureRecord(stats, key);
    const now = nowIso();
    const sessionId = options.sessionId || getSessionId();
    const session = record.sessions[sessionId] || {};

    if (options.countLogin) {
      const eventId = options.loginEventId || createLoginEventId(user);
      record.loginEvents[eventId] = record.loginEvents[eventId] || now;
      record.count = Number(record.baseCount || 0) + Object.keys(record.loginEvents).length;
      record.lastLogin = latestIso(record.lastLogin, now);
    }

    const closing = online === false;
    session.device = deviceLabel();
    session.lastSeen = now;
    session.lastActivity = now;
    session.closed = closing;
    if (closing) session.lastLogout = now;
    else {
      session.lastHeartbeat = now;
      session.lastLogout = null;
    }
    record.sessions[sessionId] = session;
    record.lastSeen = latestIso(record.lastSeen, now);
    record.lastActivity = latestIso(record.lastActivity, now);
    record.device = session.device;
    record.nickname = user.nickname || record.nickname || "";
    record.username = user.username || record.username || "";
    record.patientId = user.patientId || user.id || record.patientId || "";
    record.patientName = user.patientName || user.nombre || user.name || record.patientName || "";
    record.version = 3;
    record.presenceVersion = "PPF-PRO-3";
    if (closing) record.lastLogout = latestIso(record.lastLogout, now);
    else {
      record.lastHeartbeat = latestIso(record.lastHeartbeat, now);
      record.lastSync = options.sync === false ? record.lastSync : latestIso(record.lastSync, now);
    }
    record.online = isOnline(record);

    writeStats(stats);
    if (options.keepalive) pushKeepAlive(readStats());
    else if (options.pushCloud !== false) pushNormal();
    return readStats()[key] || record;
  }

  function login(user, options = {}) {
    activeUser = user;
    return update(user, true, { ...options, countLogin: true, loginEventId: options.loginEventId || createLoginEventId(user) });
  }

  function heartbeat(user = activeUser) {
    if (!user || document.visibilityState === "hidden" || navigator.onLine === false) return null;
    return update(user, true, { sync: true });
  }

  function closeCurrentSession(user = activeUser, options = {}) {
    if (!user) return null;
    return update(user, false, { keepalive: Boolean(options.keepalive), pushCloud: options.pushCloud !== false });
  }

  async function logout(user = activeUser) {
    closeCurrentSession(user, { keepalive: true, pushCloud: false });
    try { await pushNormal(); } catch (_) {}
    stop();
  }

  function bindLifecycle() {
    if (listenersBound) return;
    listenersBound = true;
    document.addEventListener("visibilitychange", () => {
      clearTimeout(hiddenTimer);
      if (document.visibilityState === "hidden") {
        hiddenTimer = setTimeout(() => closeCurrentSession(activeUser, { keepalive: true, pushCloud: false }), HIDDEN_GRACE_MS);
      } else {
        heartbeat();
        pullCloud();
      }
    });
    window.addEventListener("pagehide", () => closeCurrentSession(activeUser, { keepalive: true, pushCloud: false }));
    window.addEventListener("beforeunload", () => closeCurrentSession(activeUser, { keepalive: true, pushCloud: false }));
    window.addEventListener("online", () => { heartbeat(); pullCloud(); });
    window.addEventListener("offline", () => closeCurrentSession(activeUser, { pushCloud: false }));
    window.addEventListener("storage", event => {
      if (event.key === STORAGE_KEY) window.dispatchEvent(new CustomEvent("ppf:presence-storage-change", { detail: { stats: readStats() } }));
    });
  }

  function start(user) {
    if (!user) return;
    activeUser = user;
    bindLifecycle();
    clearInterval(heartbeatTimer);
    heartbeat();
    heartbeatTimer = setInterval(heartbeat, HEARTBEAT_MS);
  }
  const startClient = start;

  function stop() {
    clearInterval(heartbeatTimer); heartbeatTimer = null;
    clearTimeout(hiddenTimer); hiddenTimer = null;
    activeUser = null;
  }

  async function pullCloud() {
    if (autoSyncBusy || document.visibilityState === "hidden" || navigator.onLine === false) return false;
    autoSyncBusy = true;
    try {
      const ok = await window.PPF_SUPABASE?.pull?.();
      window.dispatchEvent(new CustomEvent("ppf:presence-cloud-change", { detail: { stats: readStats() } }));
      return ok !== false;
    } catch (error) {
      console.warn("PPF Presence: no se pudo actualizar desde Supabase.", error);
      return false;
    } finally { autoSyncBusy = false; }
  }

  function startAutoSync(options = {}) {
    if (autoSyncTimer || realtimeSubscription) return realtimeSubscription || autoSyncTimer;
    const intervalMs = Math.max(5000, Number(options.intervalMs || AUTO_SYNC_MS));

    pullCloud();
    realtimeSubscription = window.PPF_SUPABASE?.subscribeKey?.(STORAGE_KEY, () => {
      pullCloud();
    }) || null;

    // Respaldo para instalaciones donde Realtime no esté publicado o pierda conexión.
    autoSyncTimer = setInterval(pullCloud, intervalMs);
    return realtimeSubscription || autoSyncTimer;
  }
  function stopAutoSync() {
    clearInterval(autoSyncTimer);
    autoSyncTimer = null;
    realtimeSubscription?.unsubscribe?.();
    realtimeSubscription = null;
  }

  window.PPF_PRESENCE = Object.freeze({
    version: "3.0.0", STORAGE_KEY, HEARTBEAT_MS, ONLINE_TIMEOUT_MS, HIDDEN_GRACE_MS,
    normalizeKey, userKey, createLoginEventId, deviceLabel, latestIso, activityIso,
    canonicalizeStats, mergeRecord, readStats, writeStats, isOnline, sessionIsOnline,
    update, login, heartbeat, start, startClient, stop, logout, closeCurrentSession,
    pushNormal, pullCloud, startAutoSync, stopAutoSync
  });
})();
