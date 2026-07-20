/* PPF PRO · versión única de despliegue.
   Cambiar VERSION en cada publicación fuerza la actualización de la PWA. */
(() => {
  "use strict";

  const VERSION = "2026.07.20-cache-manager-v2";
  const BUILD = "PPF_CORE_CACHE_MANAGER_V2";

  globalThis.PPF_APP_VERSION = VERSION;
  globalThis.PPF_BUILD_ID = BUILD;
  globalThis.PPF_VERSION_INFO = Object.freeze({ version: VERSION, build: BUILD });
})();
