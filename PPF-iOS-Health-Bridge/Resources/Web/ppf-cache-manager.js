/* PPF CORE Cache Manager v2
   Módulo independiente: no depende de admin.js, cliente.js ni ppf-core.js. */
(() => {
  "use strict";

  const VERSION = globalThis.PPF_APP_VERSION || "unknown";
  const CACHE_PREFIXES = ["pm-online-", "ppf-pro-"];
  const CURRENT_CACHE = `ppf-pro-${VERSION}`;
  const LAST_VERSION_KEY = "ppf:last-app-version";
  const RELOAD_KEY = `ppf:sw-reload:${VERSION}`;
  let reloading = false;

  async function clearObsoleteCaches({ includeCurrent = false } = {}) {
    if (!("caches" in globalThis)) return [];
    const keys = await caches.keys();
    const removable = keys.filter((key) => {
      const isPpfCache = CACHE_PREFIXES.some((prefix) => key.startsWith(prefix));
      return isPpfCache && (includeCurrent || key !== CURRENT_CACHE);
    });
    await Promise.all(removable.map((key) => caches.delete(key)));
    return removable;
  }

  function activateWaitingWorker(registration) {
    registration?.waiting?.postMessage({ type: "PPF_SKIP_WAITING", version: VERSION });
  }

  function watchInstallingWorker(registration) {
    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          worker.postMessage({ type: "PPF_SKIP_WAITING", version: VERSION });
        }
      });
    });
  }

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return null;

    await clearObsoleteCaches().catch(console.warn);

    const registration = await navigator.serviceWorker.register(
      `./sw.js?v=${encodeURIComponent(VERSION)}`,
      { scope: "./", updateViaCache: "none" }
    );

    watchInstallingWorker(registration);
    activateWaitingWorker(registration);

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return;
      reloading = true;
      if (sessionStorage.getItem(RELOAD_KEY) !== "1") {
        sessionStorage.setItem(RELOAD_KEY, "1");
        location.reload();
      }
    });

    navigator.serviceWorker.addEventListener("message", (event) => {
      const data = event.data || {};
      if (data.type === "PPF_VERSION" && data.version && data.version !== VERSION) {
        registration.update().catch(console.warn);
      }
      if (data.type === "PPF_RELOAD" && !reloading) {
        reloading = true;
        location.reload();
      }
    });

    const previousVersion = localStorage.getItem(LAST_VERSION_KEY);
    localStorage.setItem(LAST_VERSION_KEY, VERSION);
    if (previousVersion && previousVersion !== VERSION) {
      await clearObsoleteCaches().catch(console.warn);
    }

    await registration.update().catch(() => {});
    registration.active?.postMessage({ type: "PPF_GET_VERSION" });
    return registration;
  }

  async function hardRefresh() {
    const registration = await navigator.serviceWorker.getRegistration("./");
    await clearObsoleteCaches({ includeCurrent: true });
    if (registration) {
      await registration.unregister();
    }
    location.reload();
  }

  globalThis.PPF_CACHE_MANAGER = Object.freeze({
    version: VERSION,
    currentCache: CURRENT_CACHE,
    checkForUpdates: async () => {
      const registration = await navigator.serviceWorker.getRegistration("./");
      if (registration) await registration.update();
    },
    clearOldCaches: clearObsoleteCaches,
    hardRefresh
  });

  window.addEventListener("load", () => registerServiceWorker().catch(console.error), { once: true });
})();
