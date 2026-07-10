/* PPF PRO · Notificaciones de nuevas sesiones preparadas */
(function PPFNotificationsEngine() {
  "use strict";

  const STORAGE_KEY = "notifications";
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
      await requestPermissionFromGesture();
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
        <span class="ppf-notification-icon">🏋️</span>
        <span><strong>${escapeHtml(item.title || "Nueva sesión preparada")}</strong><small>${escapeHtml(item.body || "Ya tienes una nueva sesión disponible.")}</small><time>${formatDate(item.createdAt)}</time></span>
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
    const items = repairRecentMissingNotifications();
    const hasNew = mine(items).some(item => !before.has(String(item.id)));
    process(items, hasNew);
  }

  function subscribe() {
    subscription?.unsubscribe?.();
    subscription = window.PPF_SUPABASE?.subscribeKey?.(STORAGE_KEY, payload => {
      const cloudItems = payload?.new?.value;
      if (!Array.isArray(cloudItems)) return;
      writeLocalOnly(cloudItems);
      process(cloudItems, true);
    }) || null;
  }

  async function init() {
    if (initialized) return;
    const user = readCurrentUser();
    if (!user || user.role !== "client") return;
    currentNickname = normalize(user.nickname);
    if (!currentNickname) return;
    initialized = true;
    ensureUI();
    const initial = readNotifications();
    mine(initial).forEach(item => knownIds.add(String(item.id)));
    renderUI();
    try { if (window.PPF_SUPABASE_READY) await window.PPF_SUPABASE_READY; } catch (_) {}
    const cloudReadyItems = repairRecentMissingNotifications();
    renderUI();
    process(cloudReadyItems, true);
    subscribe();
    clearInterval(pollTimer);
    pollTimer = setInterval(pullAndProcess, POLL_MS);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) pullAndProcess(); });
    window.addEventListener("storage", event => { if (event.key === STORAGE_KEY) process(readNotifications(), true); });
    navigator.serviceWorker?.addEventListener?.("message", event => {
      if (event.data?.type === "PPF_OPEN_SESSION") openSession();
    });
  }

  window.PPF_NOTIFICATIONS = { init, render: renderUI, markRead, markAllRead };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
