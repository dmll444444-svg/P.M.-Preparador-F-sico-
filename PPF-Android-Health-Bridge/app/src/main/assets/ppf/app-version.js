/* PPF PRO · versión única de despliegue.
   Cambiar VERSION en cada publicación fuerza la actualización de la PWA. */
(() => {
  "use strict";
  const VERSION = "2026.09.02-health-bridge-v3-6-0-alpha-2-1";
  const BUILD = "PPF_V3_6_0_ALPHA_2_1_HEALTH_LOCAL_DAY_TRUTH";
  globalThis.PPF_APP_VERSION = VERSION;
  globalThis.PPF_BUILD_ID = BUILD;
  globalThis.PPF_VERSION_INFO = Object.freeze({ version: VERSION, build: BUILD });
})();
