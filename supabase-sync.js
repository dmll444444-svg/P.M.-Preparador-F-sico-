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
