/*
  Programa Preparador Físico · Supabase Sync v1

  Estrategia:
  - La app sigue funcionando con localStorage.
  - Al abrir la app, descarga el estado cloud desde Supabase y lo mete en localStorage.
  - Cada vez que la app guarda pacientes/sesiones/etc., se sube automáticamente a Supabase.
*/

const PPF_SYNC_KEYS = [
  "patients",
  "sessions",
  "histories",
  "patientFiles",
  "valoraciones",
  "exerciseLibrary",
  "completedSessions"
];

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

function ppfReadLocalJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function ppfWriteLocalJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value || []));
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
    if (PPF_SYNC_KEYS.includes(row.key)) {
      ppfWriteLocalJson(row.key, row.value || []);
    }
  });

  localStorage.setItem("ppfSupabaseLastPull", new Date().toISOString());
  try {
    window.dispatchEvent(new CustomEvent("PPF_SUPABASE_SYNCED", { detail: { direction: "pull", at: new Date().toISOString() } }));
  } catch (_) {}
  return true;
}

async function ppfPushKeyToCloud(key) {
  const client = ppfCreateClient();
  if (!client || !PPF_SYNC_KEYS.includes(key)) return false;

  const value = ppfReadLocalJson(key);

  const { error } = await client
    .from("app_state")
    .upsert({
      key,
      value,
      updated_at: new Date().toISOString()
    }, { onConflict: "key" });

  if (error) {
    console.warn("Supabase push error:", key, error.message);
    return false;
  }

  localStorage.setItem("ppfSupabaseLastPush", new Date().toISOString());
  return true;
}

async function ppfPushAllToCloud() {
  const client = ppfCreateClient();
  if (!client) return false;

  for (const key of PPF_SYNC_KEYS) {
    await ppfPushKeyToCloud(key);
  }

  try {
    window.dispatchEvent(new CustomEvent("PPF_SUPABASE_SYNCED", { detail: { direction: "push", at: new Date().toISOString() } }));
  } catch (_) {}
  return true;
}

function ppfPatchLocalStorageForSync() {
  if (window.__PPF_LOCALSTORAGE_PATCHED__) return;
  window.__PPF_LOCALSTORAGE_PATCHED__ = true;

  const originalSetItem = localStorage.setItem.bind(localStorage);

  localStorage.setItem = function patchedSetItem(key, value) {
    originalSetItem(key, value);

    if (PPF_SYNC_KEYS.includes(key) && ppfSupabaseIsConfigured()) {
      clearTimeout(window.__PPF_SYNC_TIMER__);
      window.__PPF_SYNC_TIMER__ = setTimeout(() => {
        ppfPushKeyToCloud(key);
      }, 350);
    }
  };
}

async function ppfSupabaseBootstrap() {
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
  status: () => window.PPF_SUPABASE_STATUS || "disabled",
  keys: PPF_SYNC_KEYS
};


/* PM SYNC PRO · refresco cloud al abrir app y cierre de sesión sincronizado */
(function ppfSupabaseOpenAndLogoutSync(){
  if (window.__PPF_SUPABASE_OPEN_LOGOUT_SYNC__) return;
  window.__PPF_SUPABASE_OPEN_LOGOUT_SYNC__ = true;

  let lastOpenPull = 0;
  let realtimeReady = false;

  async function waitReady(){
    try {
      if (window.PPF_SUPABASE_READY && typeof window.PPF_SUPABASE_READY.then === "function") {
        await window.PPF_SUPABASE_READY;
      }
    } catch (_) {}
    return Boolean(window.PPF_SUPABASE && typeof window.PPF_SUPABASE.pull === "function");
  }

  async function syncOnOpen(reason){
    const now = Date.now();
    if (now - lastOpenPull < 1200) return false;
    lastOpenPull = now;

    if (!(await waitReady())) return false;
    try {
      window.PPF_SUPABASE_STATUS = "loading";
      const ok = await window.PPF_SUPABASE.pull();
      window.PPF_SUPABASE_STATUS = ok ? "connected" : "error";
      try { window.dispatchEvent(new CustomEvent("PPF_APP_DATA_REFRESH", { detail: { reason: reason || "open" } })); } catch (_) {}
      return ok;
    } catch (error) {
      console.warn("No se pudo actualizar desde Supabase:", error);
      window.PPF_SUPABASE_STATUS = "error";
      return false;
    }
  }

  async function syncBeforeLogout(){
    if (!(await waitReady())) return false;
    try {
      window.PPF_SUPABASE_STATUS = "saving";
      await window.PPF_SUPABASE.push();
      window.PPF_SUPABASE_STATUS = "connected";
      return true;
    } catch (error) {
      console.warn("No se pudo sincronizar antes de cerrar sesión:", error);
      window.PPF_SUPABASE_STATUS = "error";
      return false;
    }
  }

  window.PPF_SYNC_ON_OPEN = syncOnOpen;
  window.PPF_SYNC_BEFORE_LOGOUT = syncBeforeLogout;
  window.PPF_LOGOUT_AND_SYNC = async function PPF_LOGOUT_AND_SYNC(){
    await syncBeforeLogout();
    try { localStorage.removeItem("currentUser"); } catch (_) {}
    window.location.href = "index.html";
  };

  // Abrir, volver desde segundo plano o recuperar pestaña: siempre intenta bajar la versión cloud.
  window.addEventListener("pageshow", () => syncOnOpen("pageshow"));
  window.addEventListener("focus", () => syncOnOpen("focus"));
  document.addEventListener("visibilitychange", () => { if (!document.hidden) syncOnOpen("visible"); });

  // Intercepta todos los cierres de sesión de admin/cliente antes de que otros listeners redirijan.
  document.addEventListener("click", function(event){
    const btn = event.target && event.target.closest && event.target.closest(
      "#logoutBtn, #adminHeaderLogoutBtn, #clientLogoutBtn, #clientHeaderLogoutBtn, [data-client-logout], [data-admin-logout]"
    );
    if (!btn) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    btn.disabled = true;
    const oldText = btn.textContent;
    if (oldText) btn.textContent = "Sincronizando...";
    window.PPF_LOGOUT_AND_SYNC();
  }, true);

  // En segundo plano, cuando Supabase avisa cambios, refresca localStorage y pantalla.
  async function setupRealtime(){
    if (realtimeReady || !(await waitReady())) return;
    const client = window.ppfSupabaseClient;
    if (!client || typeof client.channel !== "function") return;
    realtimeReady = true;
    try {
      client
        .channel("ppf_app_state_live")
        .on("postgres_changes", { event: "*", schema: "public", table: "app_state" }, () => syncOnOpen("realtime"))
        .subscribe();
    } catch (error) {
      console.warn("Realtime Supabase no disponible:", error);
    }
  }

  setTimeout(() => syncOnOpen("startup"), 250);
  setTimeout(setupRealtime, 1200);
})();
