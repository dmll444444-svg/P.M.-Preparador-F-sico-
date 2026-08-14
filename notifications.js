/* PPF PRO · Notificaciones de nuevas sesiones preparadas */
(function PPFNotificationsEngine() {
  "use strict";

  const STORAGE_KEY = "notifications";
  const CLEANUP_MIGRATION_KEY = "ppf_notification_cleanup_b2142_done";
  const TRUTH_RECONCILIATION_KEY = "ppf_notification_truth_b2143_done";
  const LIFECYCLE_VERSION = "3.4.2.2";
  const POLL_MS = 15000;
  let currentNickname = "";
  let initialized = false;
  let subscription = null;
  let pollTimer = null;
  let knownIds = new Set();

  function normalize(value) {
    return String(value || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/^@+/, "").replace(/\s+/g, "");
  }

  function readCurrentUser() {
    try { return JSON.parse(localStorage.getItem("currentUser") || "null"); } catch (_) { return null; }
  }

  function readNotifications() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  }

  function writeLocalOnly(value) {
    const raw = JSON.stringify(Array.isArray(value) ? value : []);
    try {
      const setter = window.__PPF_NATIVE_SETITEM__ || localStorage.setItem.bind(localStorage);
      setter(STORAGE_KEY, raw);
    } catch (_) {}
  }

  function readSessions() {
    try {
      const value = JSON.parse(localStorage.getItem("sessions") || "[]");
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  }

  function repairRecentMissingNotifications() {
    const items = readNotifications();
    const existing = new Set(items
      .filter(item => item?.type === "prepared_session")
      .map(item => String(item.sessionId || "")));
    const now = Date.now();
    let changed = false;

    readSessions().forEach(session => {
      if (normalize(session?.patientNickname) !== currentNickname || !session?.id) return;
      if (existing.has(String(session.id))) return;
      const updatedMs = new Date(session.updatedAt || session.createdAt || 0).getTime();
      if (!Number.isFinite(updatedMs) || now - updatedMs > 30 * 60 * 1000) return;

      items.push({
        id: `recovered-${session.id}`,
        type: "prepared_session",
        recipient: currentNickname,
        title: "Nueva sesión preparada",
        body: `Tu sesión nº ${session.numero || "-"} ya está disponible.`,
        sessionId: session.id,
        sessionNumber: session.numero || null,
        sessionDate: session.fecha || "",
        createdAt: session.updatedAt || session.createdAt || new Date().toISOString(),
        createdBy: "admin",
        recovered: true,
        readBy: []
      });
      existing.add(String(session.id));
      changed = true;
    });

    if (changed) writeLocalOnly(items);
    return items;
  }


  function cleanupRecoveredHistoricalNotificationsOnce() {
    try {
      if (localStorage.getItem(CLEANUP_MIGRATION_KEY) === "1") return false;

      const items = readNotifications();
      const cleaned = items.filter(item => {
        if (!item) return false;

        // Retiramos únicamente avisos artificiales creados por el
        // antiguo mecanismo de recuperación histórica.
        if (item.recovered === true) return false;
        if (String(item.id || "").startsWith("recovered-")) return false;

        return true;
      });

      if (cleaned.length !== items.length) writeLocalOnly(cleaned);
      localStorage.setItem(CLEANUP_MIGRATION_KEY, "1");
      return cleaned.length !== items.length;
    } catch (_) {
      return false;
    }
  }


  async function reconcileNotificationTruthOnce() {
    try {
      if (localStorage.getItem(TRUTH_RECONCILIATION_KEY) === "1") return false;

      // B.2.1.4.3:
      // El historial prepared_session quedó contaminado por el antiguo recovery.
      // Las notificaciones son avisos efímeros, no Session Truth.
      // Hacemos un reset controlado de ese tipo, preservando cualquier otro aviso.
      const current = readNotifications();
      const cleaned = current.filter(item => item?.type !== "prepared_session");

      writeLocalOnly(cleaned);

      // Fundamental: sustituimos el valor remoto de forma EXACTA.
      // Un merge aditivo volvería a resucitar las notificaciones eliminadas.
      let cloudConfirmed = true;
      if (window.PPF_SUPABASE?.replaceValue) {
        cloudConfirmed = await window.PPF_SUPABASE.replaceValue(STORAGE_KEY, cleaned);
      }

      if (!cloudConfirmed) {
        console.warn("PPF Notification Truth: Supabase no confirmó la reconciliación.");
        return false;
      }

      localStorage.setItem(TRUTH_RECONCILIATION_KEY, "1");
      knownIds = new Set(cleaned.map(item => String(item?.id || "")).filter(Boolean));
      renderUI();
      return true;
    } catch (error) {
      console.warn("PPF Notification Truth reconciliation error:", error);
      return false;
    }
  }

  function readCompletedSessions() {
    try {
      const value = JSON.parse(localStorage.getItem("completedSessions") || "[]");
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  }

  function notificationSession(item, sessions = readSessions()) {
    const sid = String(item?.sessionId || "").trim();
    if (!sid) return null;
    return sessions.find(session => String(session?.id || session?.sessionId || "").trim() === sid) || null;
  }

  function readDeletedSessionIds() {
    try {
      const value = JSON.parse(localStorage.getItem("deletedSessionIds") || "[]");
      return new Set((Array.isArray(value) ? value : []).map(v => String(v || "").trim()).filter(Boolean));
    } catch (_) { return new Set(); }
  }

  function isNotificationExpired(item, sessions, completed, deletedIds = readDeletedSessionIds()) {
    const sid = String(item?.sessionId || "").trim();
    const groupedIds = Array.isArray(item?.sessionIds)
      ? item.sessionIds.map(v => String(v || "").trim()).filter(Boolean)
      : [];

    // v3.4.1: los tombstones mandan. Sirve tanto para prepared_session como
    // para la notificación agrupada microcycle_plan del Deep Clone Engine.
    if (sid && deletedIds.has(sid)) return true;
    if (groupedIds.some(id => deletedIds.has(id))) return true;

    if (item?.type !== "prepared_session" || !sid) return false;
    const session = notificationSession(item, sessions);
    if (session && window.PPF_SESSION_TRUTH?.isCompleted) {
      try { return Boolean(window.PPF_SESSION_TRUTH.isCompleted(session, completed)); } catch (_) {}
    }

    // Fallback estricto por ID estable: nunca inferimos por número de sesión.
    return completed.some(row => String(row?.sessionId || row?.id || "").trim() === sid);
  }

  async function reconcileNotificationLifecycle(options = {}) {
    const { syncCloud = true, forceCloud = false } = options;
    const current = readNotifications();
    const sessions = readSessions();
    const completed = readCompletedSessions();
    const deletedIds = readDeletedSessionIds();
    const cleaned = current.filter(item => !isNotificationExpired(item, sessions, completed, deletedIds));
    if (cleaned.length === current.length) {
      renderUI();
      // B.2.1.4.5: si el cliente ya hizo la baja optimista local, todavía
      // debemos confirmar la sustitución exacta en nube para que el aviso no
      // reaparezca en el siguiente pull.
      if (syncCloud && forceCloud && window.PPF_SUPABASE?.replaceValue) {
        try { await window.PPF_SUPABASE.replaceValue(STORAGE_KEY, cleaned); } catch (error) {
          console.warn(`PPF ${LIFECYCLE_VERSION}: no se pudo confirmar la baja optimista:`, error);
        }
      }
      return false;
    }

    writeLocalOnly(cleaned);
    knownIds = new Set(cleaned.map(item => String(item?.id || "")).filter(Boolean));
    renderUI();

    // B.2.1.4.4: la baja de una notificación es destructiva; pushKey hace merge
    // y podría resucitarla. Por eso sustituimos exactamente el valor remoto.
    if (syncCloud && window.PPF_SUPABASE?.replaceValue) {
      try {
        const confirmed = await window.PPF_SUPABASE.replaceValue(STORAGE_KEY, cleaned);
        if (!confirmed) console.warn(`PPF ${LIFECYCLE_VERSION}: Supabase no confirmó la limpieza de ciclo de vida.`);
      } catch (error) {
        console.warn(`PPF ${LIFECYCLE_VERSION}: error reconciliando ciclo de vida de notificaciones:`, error);
      }
    }
    return true;
  }

  function mine(items = readNotifications()) {
    return items
      .filter(item => normalize(item?.recipient) === currentNickname)
      .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));
  }

  function isRead(item) {
    return Array.isArray(item?.readBy) && item.readBy.map(normalize).includes(currentNickname);
  }

  function unread(items = readNotifications()) {
    return mine(items).filter(item => !isRead(item));
  }

  function ensureUI() {
    if (document.getElementById("ppfNotificationBell")) return;
    const header = document.querySelector(".client-header-user") || document.querySelector(".admin-user");
    if (!header) return;

    const wrap = document.createElement("div");
    wrap.className = "ppf-notification-wrap";
    wrap.innerHTML = `
      <button id="ppfNotificationBell" class="ppf-notification-bell" type="button" aria-label="Notificaciones" title="Notificaciones">
        <span aria-hidden="true">🔔</span><strong id="ppfNotificationBadge" hidden>0</strong>
      </button>
      <section id="ppfNotificationPanel" class="ppf-notification-panel" hidden>
        <div class="ppf-notification-panel-head">
          <strong>Notificaciones</strong>
          <button id="ppfNotificationReadAll" type="button">Marcar leídas</button>
        </div>
        <div id="ppfNotificationList"></div>
      </section>`;
    header.insertBefore(wrap, header.firstChild);

    document.getElementById("ppfNotificationBell")?.addEventListener("click", async event => {
      event.stopPropagation();
      const panel = document.getElementById("ppfNotificationPanel");
      if (panel) panel.hidden = !panel.hidden;
      // Abrir la campana solo abre el centro interno de PPF.
      // El permiso del navegador no forma parte de esta interacción.
      renderUI();
    });
    document.getElementById("ppfNotificationReadAll")?.addEventListener("click", markAllRead);
    document.addEventListener("click", event => {
      if (!event.target.closest(".ppf-notification-wrap")) {
        const panel = document.getElementById("ppfNotificationPanel");
        if (panel) panel.hidden = true;
      }
    });
    document.getElementById("ppfNotificationList")?.addEventListener("click", event => {
      const card = event.target.closest("[data-notification-id]");
      if (!card) return;
      markRead(card.dataset.notificationId);
      openSession();
    });
  }

  // v3.4.2.2 · Canonical Microcycle Notification Labels
  // La notificación puede haber sido persistida por un build anterior con
  // IDs/contadores legacy (24, 25, 26...). Para microcycle_plan reconstruimos
  // SIEMPRE la numeración visible desde microcycle + sessionCount.
  function notificationBody(item) {
    if (item?.type !== "microcycle_plan") return item?.body || "Ya tienes una nueva sesión disponible.";
    const micro = Number(item.microcycle || 0);
    const count = Math.max(0, Number(item.sessionCount || (Array.isArray(item.sessionIds) ? item.sessionIds.length : 0)));
    if (!micro || !count) return item?.body || "Ya tienes una nueva sesión disponible.";
    const canonical = Array.from({ length: count }, (_, index) => `${micro}.${index + 1}`);
    let body = String(item.body || "");
    const suffix = `Sesiones ${canonical.join(", ")}`;
    if (/\bSesiones\s+[^·]+$/i.test(body)) body = body.replace(/\bSesiones\s+[^·]+$/i, suffix);
    else body = `${body}${body ? " · " : ""}${suffix}`;
    return body;
  }

  function renderUI() {
    ensureUI();
    const items = mine();
    const pending = items.filter(item => !isRead(item));
    const badge = document.getElementById("ppfNotificationBadge");
    if (badge) {
      badge.textContent = pending.length > 99 ? "99+" : String(pending.length);
      badge.hidden = pending.length === 0;
    }
    const list = document.getElementById("ppfNotificationList");
    if (!list) return;
    list.innerHTML = items.length ? items.slice(0, 20).map(item => `
      <button type="button" class="ppf-notification-item ${isRead(item) ? "is-read" : "is-unread"}" data-notification-id="${escapeHtml(item.id)}">
        <span class="ppf-notification-icon">${item.type === "microcycle_plan" ? "📅" : "🏋️"}</span>
        <span><strong>${escapeHtml(item.title || "Nueva sesión preparada")}</strong><small>${escapeHtml(notificationBody(item))}</small><time>${formatDate(item.createdAt)}</time></span>
      </button>`).join("") : `<p class="ppf-notification-empty">No tienes notificaciones.</p>`;
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
  }

  function formatDate(value) {
    const date = new Date(value || 0);
    if (!Number.isFinite(date.getTime())) return "";
    return new Intl.DateTimeFormat("es-ES", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" }).format(date);
  }

  async function requestPermissionFromGesture() {
    if (!("Notification" in window) || Notification.permission !== "default") return;
    try { await Notification.requestPermission(); } catch (_) {}
  }

  async function showSystemNotification(item) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const options = {
      body: item.body || "Tu preparador ha publicado una nueva sesión.",
      icon: "./icons/icon-192.png",
      badge: "./icons/icon-96.png",
      tag: `ppf-session-${item.sessionId || item.id}`,
      renotify: false,
      data: { url: "./cliente.html", section: "proxima", notificationId: item.id }
    };
    try {
      const registration = await navigator.serviceWorker?.ready;
      if (registration?.showNotification) await registration.showNotification(item.title || "Nueva sesión preparada", options);
      else new Notification(item.title || "Nueva sesión preparada", options);
    } catch (_) {
      try { new Notification(item.title || "Nueva sesión preparada", options); } catch (_) {}
    }
  }

  function showToast(item) {
    document.querySelector(".ppf-notification-toast")?.remove();
    const toast = document.createElement("button");
    toast.type = "button";
    toast.className = "ppf-notification-toast";
    toast.innerHTML = `<span>🔔</span><span><strong>${escapeHtml(item.title || "Nueva sesión preparada")}</strong><small>${escapeHtml(item.body || "Ya está disponible.")}</small></span>`;
    toast.addEventListener("click", () => { markRead(item.id); toast.remove(); openSession(); });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 8000);
  }

  function openSession() {
    try {
      if (typeof window.PM_FINAL_CLIENT_SECTION === "function") window.PM_FINAL_CLIENT_SECTION("proxima");
      else if (typeof window.renderClientSection === "function") window.renderClientSection("proxima");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (_) {}
  }

  function markRead(id) {
    const items = readNotifications();
    let changed = false;
    const next = items.map(item => {
      if (String(item?.id) !== String(id)) return item;
      const readBy = Array.isArray(item.readBy) ? item.readBy.slice() : [];
      if (!readBy.map(normalize).includes(currentNickname)) { readBy.push(currentNickname); changed = true; }
      return { ...item, readBy };
    });
    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.PPF_SUPABASE?.pushKey?.(STORAGE_KEY).catch(() => {});
    }
    renderUI();
  }

  function markAllRead() {
    const ids = unread().map(item => item.id);
    if (!ids.length) return;
    const idSet = new Set(ids.map(String));
    const items = readNotifications().map(item => {
      if (!idSet.has(String(item?.id))) return item;
      const readBy = Array.isArray(item.readBy) ? item.readBy.slice() : [];
      if (!readBy.map(normalize).includes(currentNickname)) readBy.push(currentNickname);
      return { ...item, readBy };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.PPF_SUPABASE?.pushKey?.(STORAGE_KEY).catch(() => {});
    renderUI();
  }

  async function refreshSessionData() {
    await new Promise(resolve => setTimeout(resolve, 450));
    try { await window.PPF_SUPABASE?.pull?.(); } catch (_) {}
    try { window.dispatchEvent(new CustomEvent("PPF_APP_DATA_REFRESH", { detail: { key: "sessions", source: "notification" } })); } catch (_) {}
  }

  function process(items, allowAlerts = true) {
    const myItems = mine(items);
    const newItems = myItems.filter(item => !knownIds.has(String(item.id)));
    myItems.forEach(item => knownIds.add(String(item.id)));
    renderUI();
    if (!allowAlerts || !newItems.length) return;
    const latest = newItems[0];
    showToast(latest);
    showSystemNotification(latest);
    refreshSessionData();
  }

  async function pullAndProcess() {
    const before = new Set(mine().map(item => String(item.id)));
    try { await window.PPF_SUPABASE?.pull?.(); } catch (_) {}
    await reconcileNotificationLifecycle({ syncCloud: true });
    const items = readNotifications();
    const hasNew = mine(items).some(item => !before.has(String(item.id)));
    process(items, hasNew);
  }

  function subscribe() {
    subscription?.unsubscribe?.();
    subscription = window.PPF_SUPABASE?.subscribeKey?.(STORAGE_KEY, payload => {
      const cloudItems = payload?.new?.value;
      if (!Array.isArray(cloudItems)) return;
      writeLocalOnly(cloudItems);
      reconcileNotificationLifecycle({ syncCloud: true }).then(() => process(readNotifications(), true));
    }) || null;
  }

  function purgePreparedSessionLocal(sessionId) {
    const sid = String(sessionId || "").trim();
    if (!sid) return false;
    const current = readNotifications();
    const cleaned = current.filter(item => !(item?.type === "prepared_session" && String(item?.sessionId || "").trim() === sid));
    if (cleaned.length === current.length) return false;
    writeLocalOnly(cleaned);
    knownIds = new Set(cleaned.map(item => String(item?.id || "")).filter(Boolean));
    renderUI();
    return true;
  }

  async function init() {
    if (initialized) return;
    const user = readCurrentUser();
    if (!user || user.role !== "client") return;
    currentNickname = normalize(user.nickname);
    if (!currentNickname) return;
    initialized = true;
    ensureUI();

    // B.2.1.4.2 · migración única:
    // limpia los avisos artificiales creados por el antiguo recovery.
    cleanupRecoveredHistoricalNotificationsOnce();

    const initial = readNotifications();
    mine(initial).forEach(item => knownIds.add(String(item.id)));
    renderUI();
    try { if (window.PPF_SUPABASE_READY) await window.PPF_SUPABASE_READY; } catch (_) {}

    // B.2.1.4.3 · Notification Truth Reconciliation:
    // primero recibimos la verdad remota y después eliminamos de local + nube
    // el histórico prepared_session contaminado.
    await reconcileNotificationTruthOnce();
    await reconcileNotificationLifecycle({ syncCloud: true });

    // Integridad: iniciar sesión nunca debe fabricar notificaciones
    // recorriendo sesiones ya existentes. Solo procesamos las notificaciones
    // que realmente existen en el almacenamiento/sincronización.
    const cloudReadyItems = readNotifications();
    renderUI();
    process(cloudReadyItems, false);
    subscribe();
    clearInterval(pollTimer);
    pollTimer = setInterval(pullAndProcess, POLL_MS);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) pullAndProcess(); });
    window.addEventListener("storage", event => {
      if (event.key === STORAGE_KEY) process(readNotifications(), true);
      if (event.key === "completedSessions" || event.key === "sessions") reconcileNotificationLifecycle({ syncCloud: false });
    });
    window.addEventListener("PPF_NOTIFICATION_LIFECYCLE_RECONCILE", () => reconcileNotificationLifecycle({ syncCloud: true, forceCloud: true }));
    navigator.serviceWorker?.addEventListener?.("message", event => {
      if (event.data?.type === "PPF_OPEN_SESSION") openSession();
    });
  }

  window.PPF_NOTIFICATIONS = { init, render: renderUI, markRead, markAllRead, requestSystemPermission: requestPermissionFromGesture, reconcileTruth: reconcileNotificationTruthOnce, reconcileLifecycle: reconcileNotificationLifecycle, purgePreparedSessionLocal };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
