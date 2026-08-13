/* PPF PRO · versión única de despliegue.
   Cambiar VERSION en cada publicación fuerza la actualización de la PWA. */
(() => {
  "use strict";

  const VERSION = "2026.08.13-micro-notification-ux-v3-4-2";
  const BUILD = "PPF_V3_4_2_MICRO_NOTIFICATION_UX";

  globalThis.PPF_APP_VERSION = VERSION;
  globalThis.PPF_BUILD_ID = BUILD;
  globalThis.PPF_VERSION_INFO = Object.freeze({ version: VERSION, build: BUILD });
})();
