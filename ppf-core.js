/* PPF PRO · CORE v1
   Núcleo único para normalizar sesiones, estados, agenda, NCI y estadísticas.
   Las vistas consumen este servicio; no vuelven a interpretar datos por separado. */
(function () {
  "use strict";

  const COMPLETED = new Set(["completed", "complete", "finished", "done", "terminada", "terminado", "finalizada", "finalizado"]);
  const CANCELLED = new Set(["cancelled", "canceled", "cancelada", "cancelado"]);

  function read(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value == null ? fallback : value;
    } catch (_) { return fallback; }
  }
  function array(key) { const value = read(key, []); return Array.isArray(value) ? value : []; }
  function identity(value) { return String(value || "").trim().replace(/^@+/, "").toLowerCase(); }
  function id(session) { return String(session?.id || session?.sessionId || "").trim(); }
  function patient(session) {
    return identity(session?.patientNickname || session?.nickname || session?.patient || session?.patientId || session?.cliente || session?.clientNickname || "");
  }
  function statusValue(session) {
    return String(session?.agendaStatus ?? session?.status ?? session?.estado ?? session?.sessionStatus ?? "").trim().toLowerCase();
  }
  function date(session) { return String(session?.fecha || session?.date || "").trim(); }
  function time(session) { return String(session?.scheduledTime || session?.time || "").trim(); }
  function micro(session) { return Number(session?.microciclo || session?.micro || session?.microcycle || session?.sessionBaseNumber || 0); }
  function sequence(session) { return Number(session?.microSequenceOrder || session?.subsessionOrder || session?.dayOrder || session?.displayOrder || 1); }
  function displayNumber(session) {
    if (session?.displaySessionNumber) return String(session.displaySessionNumber);
    const m = micro(session);
    return m ? `${m}.${Math.max(1, Math.round(sequence(session)))}` : String(session?.numeroSesion || session?.sessionNumber || session?.numero || "-");
  }
  function scheduleMode(session) {
    const value = String(session?.scheduleMode || session?.agendaScheduleMode || "").toLowerCase();
    if (value === "flexible" || session?.flexibleSchedule === true) return "flexible";
    return "scheduled";
  }
  function completedIds(records) {
    return new Set((records || []).map(item => String(item?.sessionId || item?.id || "").trim()).filter(Boolean));
  }
  function completed(session, records) {
    if (session?.completed === true || session?.terminada === true || session?.isCompleted === true || COMPLETED.has(statusValue(session))) return true;
    const sid = id(session);
    const rows = records || array("completedSessions");
    if (sid && completedIds(rows).has(sid)) return true;
    if (sid) return false;
    const p = patient(session), n = Number(session?.numero || session?.numeroSesion || session?.sessionNumber || 0);
    if (!p || !n) return false;
    return rows.some(item => !String(item?.sessionId || item?.id || "").trim() && identity(item?.patientNickname || item?.nickname || item?.patient) === p && Number(item?.numero || item?.numeroSesion || item?.sessionNumber || 0) === n);
  }
  function cancelled(session) { return session?.cancelled === true || session?.cancelada === true || CANCELLED.has(statusValue(session)); }
  function lifecycle(session, records) {
    if (cancelled(session)) return "cancelled";
    if (completed(session, records)) return "completed";
    return "pending";
  }
  function flexible(session, records) {
    if (scheduleMode(session) === "flexible") return true;
    const state = lifecycle(session, records);
    return !time(session) && (state === "completed" || state === "cancelled");
  }
  function needsTime(session, records) { return lifecycle(session, records) === "pending" && !flexible(session, records); }
  function isOverdue(session, records, now = new Date()) {
    if (lifecycle(session, records) !== "pending") return false;
    const value = date(session);
    if (!value) return false;
    const today = now.toISOString().slice(0, 10);
    return value < today;
  }
  function stableKey(session, index) {
    const sid = id(session);
    return sid ? `id:${sid}` : ["legacy", patient(session), micro(session), sequence(session), date(session), Number(session?.numero || 0), index].join(":");
  }
  function normalizedContext() {
    const completedRecords = array("completedSessions");
    const source = array("sessions");
    const seen = new Set();
    const sessions = source.filter((session, index) => {
      const key = stableKey(session, index);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return { sessions, completedRecords };
  }
  function chronological(a, b) {
    const da = date(a), db = date(b);
    if (da !== db) return da.localeCompare(db);
    const ta = time(a) || "99:99", tb = time(b) || "99:99";
    if (ta !== tb) return ta.localeCompare(tb);
    const ma = micro(a) - micro(b); if (ma) return ma;
    return sequence(a) - sequence(b);
  }
  function adminDescending(a, b) {
    const da = date(a), db = date(b);
    if (da !== db) return db.localeCompare(da);
    const ma = micro(b) - micro(a); if (ma) return ma;
    return sequence(b) - sequence(a);
  }
  function forPatient(identityValue, ctx) {
    const key = identity(identityValue);
    const context = ctx || normalizedContext();
    return context.sessions.filter(session => patient(session) === key);
  }
  function summary(identityValue, ctx) {
    const context = ctx || normalizedContext();
    const owned = forPatient(identityValue, context);
    const groups = { completed: [], pending: [], cancelled: [] };
    owned.forEach(session => groups[lifecycle(session, context.completedRecords)].push(session));
    const denominator = groups.completed.length + groups.pending.length;
    const pending = groups.pending.slice().sort(chronological);
    const completedList = groups.completed.slice().sort(adminDescending);
    const currentMicro = owned.reduce((max, session) => Math.max(max, micro(session)), 0);
    return {
      total: owned.length,
      completed: groups.completed.length,
      pending: groups.pending.length,
      cancelled: groups.cancelled.length,
      overdue: groups.pending.filter(session => isOverdue(session, context.completedRecords)).length,
      withoutTime: groups.pending.filter(session => needsTime(session, context.completedRecords) && !time(session)).length,
      flexible: owned.filter(session => flexible(session, context.completedRecords)).length,
      compliance: denominator ? Math.round(groups.completed.length / denominator * 100) : 0,
      currentMicro,
      nextSession: pending[0] || null,
      sessions: owned,
      pendingSessions: pending,
      completedSessions: completedList,
      cancelledSessions: groups.cancelled.slice().sort(adminDescending)
    };
  }
  function agenda(ctx) {
    const context = ctx || normalizedContext();
    const byState = { pending: [], completed: [], cancelled: [] };
    context.sessions.forEach(session => byState[lifecycle(session, context.completedRecords)].push(session));
    return {
      pending: byState.pending.slice().sort(adminDescending),
      done: byState.completed.slice().sort(adminDescending),
      cancelled: byState.cancelled.slice().sort(adminDescending),
      overdue: byState.pending.filter(session => isOverdue(session, context.completedRecords)).sort(chronological),
      withoutTime: byState.pending.filter(session => needsTime(session, context.completedRecords) && !time(session)).sort(chronological),
      flexible: context.sessions.filter(session => flexible(session, context.completedRecords)).sort(chronological),
      sessions: context.sessions
    };
  }
  function conflict(session, ctx) {
    const context = ctx || normalizedContext();
    if (!date(session) || !time(session) || flexible(session, context.completedRecords) || lifecycle(session, context.completedRecords) !== "pending") return false;
    return context.sessions.some(other => id(other) !== id(session) && patient(other) === patient(session) && date(other) === date(session) && time(other) === time(session) && lifecycle(other, context.completedRecords) === "pending" && !flexible(other, context.completedRecords));
  }
  function snapshot() {
    const ctx = normalizedContext();
    const summaries = {};
    ctx.sessions.forEach(session => { const key = patient(session); if (key && !summaries[key]) summaries[key] = summary(key, ctx); });
    return { ...ctx, agenda: agenda(ctx), summaries };
  }
  function emit(reason = "update") {
    window.dispatchEvent(new CustomEvent("ppf:core-updated", { detail: { reason, snapshot: snapshot() } }));
  }

  const CORE = Object.freeze({
    version: "1.0.0", read, array, identity, id, patient, statusValue, date, time, micro, sequence, displayNumber,
    scheduleMode, completed, cancelled, lifecycle, flexible, needsTime, isOverdue, normalizedContext,
    chronological, adminDescending, forPatient, summary, agenda, conflict, snapshot, emit
  });
  window.PPF_CORE = CORE;
})();
