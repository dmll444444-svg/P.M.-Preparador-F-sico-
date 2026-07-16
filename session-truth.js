/* PPF PRO · Fuente central de verdad para el estado de las sesiones.
   Todos los módulos deben consultar este servicio para evitar contadores distintos. */
(function () {
  "use strict";

  function readArray(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (_) {
      return [];
    }
  }

  function normalizeIdentity(value) {
    return String(value || "").trim().replace(/^@+/, "").toLowerCase();
  }

  function sessionId(session) {
    return String(session?.id || session?.sessionId || "").trim();
  }

  function patientKey(session) {
    return normalizeIdentity(
      session?.patientNickname || session?.nickname || session?.patient ||
      session?.patientId || session?.cliente || session?.clientNickname || ""
    );
  }

  function directStatus(session) {
    return String(
      session?.agendaStatus ?? session?.status ?? session?.estado ?? session?.sessionStatus ?? ""
    ).trim().toLowerCase();
  }

  function isCancelled(session) {
    const status = directStatus(session);
    return session?.cancelled === true || session?.cancelada === true ||
      ["cancelled", "canceled", "cancelada", "cancelado"].includes(status);
  }

  function completedIdSet(completedRecords) {
    return new Set((Array.isArray(completedRecords) ? completedRecords : [])
      .map(item => String(item?.sessionId || item?.id || "").trim())
      .filter(Boolean));
  }

  function isCompleted(session, completedRecords) {
    const status = directStatus(session);
    if (session?.completed === true || session?.terminada === true || session?.isCompleted === true ||
      ["completed", "complete", "finished", "done", "terminada", "terminado", "finalizada", "finalizado"].includes(status)) {
      return true;
    }

    const id = sessionId(session);
    if (id && completedIdSet(completedRecords).has(id)) return true;

    // Compatibilidad con históricos muy antiguos sin ID estable.
    const patient = patientKey(session);
    const number = Number(session?.numero || session?.numeroSesion || session?.sessionNumber || 0);
    if (!patient || !number) return false;
    return (Array.isArray(completedRecords) ? completedRecords : []).some(item => {
      const itemId = String(item?.sessionId || item?.id || "").trim();
      if (itemId) return false;
      const itemPatient = normalizeIdentity(item?.patientNickname || item?.nickname || item?.patient || "");
      const itemNumber = Number(item?.numero || item?.numeroSesion || item?.sessionNumber || 0);
      return itemPatient === patient && itemNumber === number;
    });
  }

  function lifecycleStatus(session, completedRecords) {
    if (isCancelled(session)) return "cancelled";
    if (isCompleted(session, completedRecords)) return "completed";
    return "pending";
  }

  function stableKey(session, index) {
    const id = sessionId(session);
    if (id) return `id:${id}`;
    return [
      "legacy", patientKey(session),
      Number(session?.microciclo || session?.micro || session?.microcycle || 0),
      Number(session?.subsessionOrder || session?.microSequenceOrder || session?.dayOrder || 0),
      String(session?.fecha || session?.date || ""),
      Number(session?.numero || session?.numeroSesion || session?.sessionNumber || 0),
      index
    ].join(":");
  }

  function sessions() {
    const rows = readArray("sessions");
    const seen = new Set();
    return rows.filter((session, index) => {
      const key = stableKey(session, index);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function context() {
    return {
      sessions: sessions(),
      completedRecords: readArray("completedSessions")
    };
  }

  function statsForPatient(identity, suppliedContext) {
    const key = normalizeIdentity(identity);
    const ctx = suppliedContext || context();
    const owned = ctx.sessions.filter(session => patientKey(session) === key);
    const completed = owned.filter(session => lifecycleStatus(session, ctx.completedRecords) === "completed");
    const cancelled = owned.filter(session => lifecycleStatus(session, ctx.completedRecords) === "cancelled");
    const pending = owned.filter(session => lifecycleStatus(session, ctx.completedRecords) === "pending");
    const denominator = completed.length + pending.length;
    return {
      total: owned.length,
      completed: completed.length,
      pending: pending.length,
      cancelled: cancelled.length,
      compliance: denominator ? Math.round((completed.length / denominator) * 100) : 0,
      sessions: owned
    };
  }

  window.PPF_SESSION_TRUTH = Object.freeze({
    readArray,
    normalizeIdentity,
    sessionId,
    patientKey,
    directStatus,
    isCancelled,
    isCompleted,
    lifecycleStatus,
    sessions,
    context,
    statsForPatient
  });
})();
