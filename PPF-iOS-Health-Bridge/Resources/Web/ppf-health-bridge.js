/* P.P.F. v3.6.0-alpha.2.1 · Health Local-Day Truth
   Read-only normalization layer for health data supplied by an authorized native bridge.
   SECURITY: health data is kept local in this alpha. Cloud upload is intentionally disabled
   until authenticated per-athlete RLS / secure ingestion is deployed. */
(() => {
  "use strict";

  const STORAGE_KEY = "ppfHealthRecordsV1";
  const META_KEY = "ppfHealthBridgeMetaV1";
  const TYPES = new Set(["sleep", "heart_rate", "resting_heart_rate", "steps", "workout"]);
  const identity = value => String(value || "").trim().toLowerCase();
  const nowIso = () => new Date().toISOString();
  const asIso = value => {
    if (!value) return "";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString();
  };
  const readJson = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch (_) { return fallback; }
  };
  const writeJson = (key, value) => {
    if (typeof window.ppfSafeSetItem === "function") return window.ppfSafeSetItem(key, JSON.stringify(value));
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  };
  const hashish = value => {
    const str = String(value || "");
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  };
  const recordId = r => r.external_id || `health:${hashish([r.athlete_id,r.metric_type,r.start_time,r.end_time,r.value,r.unit,r.source,r.device_source].join("|"))}`;

  function normalizeRecord(raw = {}, context = {}) {
    const athlete = identity(raw.athlete_id || raw.athlete || raw.patientNickname || context.athlete_id);
    const metric = String(raw.metric_type || raw.metric || raw.type || "").trim().toLowerCase();
    if (!athlete) throw new Error("Health Bridge: athlete_id obligatorio.");
    if (!TYPES.has(metric)) throw new Error(`Health Bridge: métrica no soportada (${metric || "vacía"}).`);

    const start = asIso(raw.start_time || raw.start || raw.date || raw.timestamp);
    const end = asIso(raw.end_time || raw.end) || start;
    if (!start) throw new Error("Health Bridge: start_time inválido.");

    let value = raw.value;
    if (metric !== "workout") {
      value = Number(value);
      if (!Number.isFinite(value)) throw new Error("Health Bridge: value numérico obligatorio.");
    }

    const source = String(raw.source || context.source || "unknown").trim().toLowerCase();
    const unit = String(raw.unit || "").trim();
    const normalized = {
      id: "",
      athlete_id: athlete,
      metric_type: metric,
      start_time: start,
      end_time: end,
      value,
      unit,
      source,
      device_source: String(raw.device_source || raw.device || context.device_source || "").trim(),
      external_id: String(raw.external_id || raw.externalId || "").trim(),
      metadata: raw.metadata && typeof raw.metadata === "object" ? raw.metadata : {},
      recorded_at: asIso(raw.recorded_at) || end || start,
      synced_at: nowIso(),
      schema_version: 1
    };
    normalized.id = recordId(normalized);
    return normalized;
  }

  function getAll() {
    const records = readJson(STORAGE_KEY, []);
    return Array.isArray(records) ? records : [];
  }

  function getForAthlete(athleteId) {
    const id = identity(athleteId);
    return getAll().filter(r => identity(r.athlete_id) === id).sort((a,b) => String(a.start_time).localeCompare(String(b.start_time)));
  }

  function getMeta() { return readJson(META_KEY, {}); }

  function ingest(payload = {}) {
    const records = Array.isArray(payload) ? payload : (Array.isArray(payload.records) ? payload.records : []);
    const context = Array.isArray(payload) ? {} : payload;

    // Alpha 2: native bridge can report permissions/source even when Health Connect has no records yet.
    const meta = getMeta();
    const contextAthlete = identity(context.athlete_id || records[0]?.athlete_id || records[0]?.athlete || "");
    if (contextAthlete) {
      meta[contextAthlete] = {
        last_sync: nowIso(),
        source: String(context.source || records[0]?.source || "health_connect"),
        device_source: String(context.device_source || records[0]?.device_source || "Android Health Connect"),
        permission_scope: Array.isArray(context.permission_scope) ? context.permission_scope : [],
        transport: String(context.transport || "android-native-bridge"),
        cloud_status: "local_only"
      };
      writeJson(META_KEY, meta);
    }

    if (!records.length) {
      window.dispatchEvent(new CustomEvent("ppf:health-updated", { detail: { athlete_id: contextAthlete, inserted: 0, updated: 0, rejected: 0 } }));
      return { inserted: 0, updated: 0, rejected: 0, total: getAll().length };
    }

    const current = getAll();
    const byId = new Map(current.map(r => [r.id, r]));
    let inserted = 0, updated = 0, rejected = 0;
    records.forEach(raw => {
      try {
        const record = normalizeRecord(raw, context);
        if (byId.has(record.id)) updated += 1; else inserted += 1;
        byId.set(record.id, record);
      } catch (error) {
        rejected += 1;
        console.warn(error?.message || error, raw);
      }
    });
    const merged = [...byId.values()].sort((a,b) => String(a.start_time).localeCompare(String(b.start_time)));
    writeJson(STORAGE_KEY, merged);
    const athlete = contextAthlete || identity(records[0]?.athlete_id || records[0]?.athlete || "");
    window.dispatchEvent(new CustomEvent("ppf:health-updated", { detail: { athlete_id: athlete, inserted, updated, rejected } }));
    return { inserted, updated, rejected, total: merged.length };
  }

  function latest(athleteId, type) {
    return getForAthlete(athleteId).filter(r => r.metric_type === type).at(-1) || null;
  }

  function snapshot(athleteId) {
    const records = getForAthlete(athleteId);
    const meta = getMeta()[identity(athleteId)] || null;
    const latestBy = type => records.filter(r => r.metric_type === type).at(-1) || null;
    const heart24 = records.filter(r => r.metric_type === "heart_rate" && Date.now() - new Date(r.start_time).getTime() <= 86400000 && Number.isFinite(Number(r.value)));
    const heartVals = heart24.map(r => Number(r.value));
    const today = new Date();
    const localDayKey = value => {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return "";
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    };
    const todayKey = localDayKey(today);
    // Health Connect supplies Instants in UTC. A local midnight in UTC+02 is serialized
    // as the previous UTC date (for example 2026-09-01T22:00:00Z for 02/09 local).
    // Compare by LOCAL calendar date, never by slicing the ISO/UTC string.
    const stepRecords = records.filter(r => r.metric_type === "steps" && localDayKey(r.start_time) === todayKey);
    const stepsToday = stepRecords.reduce((sum,r) => sum + (Number(r.value)||0), 0);
    const workoutsToday = records.filter(r => r.metric_type === "workout" && localDayKey(r.start_time) === todayKey);
    return {
      records,
      meta,
      sleep: latestBy("sleep"),
      heartRate: latestBy("heart_rate"),
      restingHeartRate: latestBy("resting_heart_rate"),
      stepsToday,
      workoutsToday,
      heart24Range: heartVals.length ? { min: Math.min(...heartVals), max: Math.max(...heartVals) } : null
    };
  }

  function clearAthlete(athleteId) {
    const id = identity(athleteId);
    writeJson(STORAGE_KEY, getAll().filter(r => identity(r.athlete_id) !== id));
    const meta = getMeta(); delete meta[id]; writeJson(META_KEY, meta);
    window.dispatchEvent(new CustomEvent("ppf:health-updated", { detail: { athlete_id: id, cleared: true } }));
  }

  // Native wrappers can call: window.PPF_HEALTH_BRIDGE.ingest(payload)
  // or dispatch a CustomEvent("ppf:health-native-payload", {detail: payload}).
  window.addEventListener("ppf:health-native-payload", event => {
    try { ingest(event.detail || {}); } catch (error) { console.error("P.P.F. Health Bridge ingest failed", error); }
  });

  window.PPF_HEALTH_BRIDGE = Object.freeze({
    version: "3.6.0-alpha.2.1",
    schemaVersion: 1,
    supportedMetrics: Object.freeze([...TYPES]),
    normalizeRecord,
    ingest,
    getAll,
    getForAthlete,
    getMeta,
    latest,
    snapshot,
    clearAthlete
  });
})();
