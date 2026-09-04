/* Compatibilidad PPF SESSION TRUTH -> PPF CORE v1 */
(function () {
  "use strict";
  const core = window.PPF_CORE;
  if (!core) { console.error("PPF CORE debe cargarse antes de session-truth.js"); return; }
  window.PPF_SESSION_TRUTH = Object.freeze({
    readArray: core.array,
    normalizeIdentity: core.identity,
    sessionId: core.id,
    patientKey: core.patient,
    directStatus: core.statusValue,
    isCancelled: core.cancelled,
    isCompleted: core.completed,
    lifecycleStatus: core.lifecycle,
    sessions: () => core.normalizedContext().sessions,
    context: core.normalizedContext,
    statsForPatient: core.summary
  });
})();
