/* PPF PRO · versión única de despliegue.
   Cambiar VERSION en cada publicación fuerza la actualización de la PWA. */
(() => {
  "use strict";

  const VERSION = "2026.08.13-session-lifecycle-sync-v3-4-1";
  const BUILD = "PPF_V3_4_1_SESSION_LIFECYCLE_SYNC";

  globalThis.PPF_APP_VERSION = VERSION;
  globalThis.PPF_BUILD_ID = BUILD;
  globalThis.PPF_VERSION_INFO = Object.freeze({ version: VERSION, build: BUILD });
})();
