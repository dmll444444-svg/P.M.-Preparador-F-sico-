(async function PPF_APP_BOOTSTRAP() {
  try {
    if (window.PPF_SUPABASE_READY) {
      await window.PPF_SUPABASE_READY;
    }
  } catch (error) {
    console.warn("Supabase bootstrap error:", error);
  }

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser || currentUser.role !== "admin") {
  window.location.href = "index.html";
}

document.getElementById("adminName").textContent = currentUser.nickname;

try { window.PPF_PRESENCE?.start?.(currentUser); } catch (error) { console.warn("No se pudo iniciar Presencia PRO en Admin:", error); }

window.PM_ADMIN_LOGOUT = async function PM_ADMIN_LOGOUT() {
  if (window.__ppfAdminLogoutInProgress) return window.__ppfAdminLogoutInProgress;
  window.__ppfAdminLogoutInProgress = (async () => {
    try { await window.PPF_PRESENCE?.logout?.(currentUser); } catch (_) {}
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  })();
  return window.__ppfAdminLogoutInProgress;
};

const sectionTitle = document.getElementById("sectionTitle");
const contentArea = document.getElementById("contentArea");
const navItems = document.querySelectorAll(".nav-item");
const patientCounter = document.getElementById("patientCounter");
const historyCounter = document.getElementById("historyCounter");
const fileCounter = document.getElementById("fileCounter");

let patients = JSON.parse(localStorage.getItem("patients")) || [];
let histories = JSON.parse(localStorage.getItem("histories")) || [];
let patientFiles = JSON.parse(localStorage.getItem("patientFiles")) || [];
let valoraciones = JSON.parse(localStorage.getItem("valoraciones")) || [];
let sessions = JSON.parse(localStorage.getItem("sessions")) || [];
let editingSessionId = null;
let editingValuationId = null;
let exerciseLibrary = JSON.parse(localStorage.getItem("exerciseLibrary")) || [];

const defaultExerciseLibrary = [
  {
    "id": "seed_1",
    "name": "Cat Camel",
    "category": "Movilidad",
    "type": "Movilidad",
    "description": "Movilidad columna. Realizar de forma lenta y controlada.",
    "url": "https://www.youtube.com/results?search_query=cat+camel+exercise"
  },
  {
    "id": "seed_2",
    "name": "90/90 Hip Switch",
    "category": "Movilidad",
    "type": "Movilidad",
    "description": "Movilidad de cadera en rotación interna y externa.",
    "url": "https://www.youtube.com/results?search_query=90+90+hip+switch+exercise"
  },
  {
    "id": "seed_3",
    "name": "World Greatest Stretch",
    "category": "Movilidad",
    "type": "Movilidad",
    "description": "Movilidad global de cadera, columna torácica y hombro.",
    "url": "https://www.youtube.com/results?search_query=world%27s+greatest+stretch"
  },
  {
    "id": "seed_4",
    "name": "Ankle Rocks",
    "category": "Movilidad",
    "type": "Movilidad",
    "description": "Movilidad de tobillo en dorsiflexión.",
    "url": "https://www.youtube.com/results?search_query=ankle+rocks+mobility"
  },
  {
    "id": "seed_5",
    "name": "Open Book",
    "category": "Movilidad",
    "type": "Movilidad",
    "description": "Movilidad torácica en rotación.",
    "url": "https://www.youtube.com/results?search_query=open+book+thoracic+mobility"
  },
  {
    "id": "seed_6",
    "name": "Shoulder CARs",
    "category": "Movilidad",
    "type": "Movilidad",
    "description": "Control articular de hombro.",
    "url": "https://www.youtube.com/results?search_query=shoulder+cars+exercise"
  },
  {
    "id": "seed_7",
    "name": "Hip CARs",
    "category": "Movilidad",
    "type": "Movilidad",
    "description": "Control articular de cadera.",
    "url": "https://www.youtube.com/results?search_query=hip+cars+exercise"
  },
  {
    "id": "seed_8",
    "name": "Couch Stretch",
    "category": "Movilidad",
    "type": "Est. Estático",
    "description": "Estiramiento de flexores de cadera.",
    "url": "https://www.youtube.com/results?search_query=couch+stretch"
  },
  {
    "id": "seed_9",
    "name": "Pigeon Stretch",
    "category": "Movilidad",
    "type": "Est. Estático",
    "description": "Estiramiento glúteo/piriforme.",
    "url": "https://www.youtube.com/results?search_query=pigeon+stretch"
  },
  {
    "id": "seed_10",
    "name": "Foam Roller Fascia Plantar",
    "category": "Movilidad",
    "type": "Fascias",
    "description": "Trabajo fascial de planta del pie.",
    "url": "https://www.youtube.com/results?search_query=plantar+fascia+foam+roller"
  },
  {
    "id": "seed_11",
    "name": "Dead Bug",
    "category": "Activación",
    "type": "Core",
    "description": "Activación lumbo-pélvica y control del core.",
    "url": "https://www.youtube.com/results?search_query=dead+bug+exercise"
  },
  {
    "id": "seed_12",
    "name": "Bird Dog",
    "category": "Activación",
    "type": "Core",
    "description": "Control lumbo-pélvico en patrón contralateral.",
    "url": "https://www.youtube.com/results?search_query=bird+dog+exercise"
  },
  {
    "id": "seed_13",
    "name": "Glute Bridge",
    "category": "Activación",
    "type": "T. Inferior",
    "description": "Activación de glúteo mayor.",
    "url": "https://www.youtube.com/results?search_query=glute+bridge+exercise"
  },
  {
    "id": "seed_14",
    "name": "Mini Band Lateral Walk",
    "category": "Activación",
    "type": "T. Inferior",
    "description": "Activación glúteo medio.",
    "url": "https://www.youtube.com/results?search_query=mini+band+lateral+walk"
  },
  {
    "id": "seed_15",
    "name": "Scapular Push Up",
    "category": "Activación",
    "type": "T. Superior",
    "description": "Activación serrato anterior y control escapular.",
    "url": "https://www.youtube.com/results?search_query=scapular+push+up"
  },
  {
    "id": "seed_16",
    "name": "Wall Slides",
    "category": "Activación",
    "type": "T. Superior",
    "description": "Activación escapular y movilidad hombro.",
    "url": "https://www.youtube.com/results?search_query=wall+slides+exercise"
  },
  {
    "id": "seed_17",
    "name": "Pogo Jumps",
    "category": "Activación",
    "type": "Pliometría",
    "description": "Pliometría baja intensidad tobillo-pie.",
    "url": "https://www.youtube.com/results?search_query=pogo+jumps+exercise"
  },
  {
    "id": "seed_18",
    "name": "A Skips",
    "category": "Activación",
    "type": "Pliometría",
    "description": "Drill técnico de carrera y reactividad.",
    "url": "https://www.youtube.com/results?search_query=a+skips+running+drill"
  },
  {
    "id": "seed_19",
    "name": "Plank Shoulder Tap",
    "category": "Activación",
    "type": "Core",
    "description": "Anti-rotación y estabilidad de core.",
    "url": "https://www.youtube.com/results?search_query=plank+shoulder+tap"
  },
  {
    "id": "seed_20",
    "name": "Monster Walk",
    "category": "Activación",
    "type": "T. Inferior",
    "description": "Activación de cadera con miniband.",
    "url": "https://www.youtube.com/results?search_query=monster+walk+miniband"
  },
  {
    "id": "seed_21",
    "name": "Sentadilla Trasera",
    "category": "Sesión Principal",
    "type": "F. ppal. TI",
    "description": "Ejercicio principal de fuerza tren inferior.",
    "url": "https://www.youtube.com/results?search_query=back+squat+technique"
  },
  {
    "id": "seed_22",
    "name": "Peso Muerto",
    "category": "Sesión Principal",
    "type": "F. ppal. TI",
    "description": "Bisagra de cadera para fuerza posterior.",
    "url": "https://www.youtube.com/results?search_query=deadlift+technique"
  },
  {
    "id": "seed_23",
    "name": "Hip Thrust",
    "category": "Sesión Principal",
    "type": "F. ppal. TI",
    "description": "Fuerza de extensión de cadera.",
    "url": "https://www.youtube.com/results?search_query=hip+thrust+technique"
  },
  {
    "id": "seed_24",
    "name": "Press Banca",
    "category": "Sesión Principal",
    "type": "F. ppal. TS",
    "description": "Ejercicio principal de empuje horizontal.",
    "url": "https://www.youtube.com/results?search_query=bench+press+technique"
  },
  {
    "id": "seed_25",
    "name": "Dominadas",
    "category": "Sesión Principal",
    "type": "F. ppal. TS",
    "description": "Tracción vertical de tren superior.",
    "url": "https://www.youtube.com/results?search_query=pull+up+technique"
  },
  {
    "id": "seed_26",
    "name": "Remo con Barra",
    "category": "Sesión Principal",
    "type": "F. ppal. TS",
    "description": "Tracción horizontal de tren superior.",
    "url": "https://www.youtube.com/results?search_query=barbell+row+technique"
  },
  {
    "id": "seed_27",
    "name": "Pallof Press",
    "category": "Sesión Principal",
    "type": "Core",
    "description": "Trabajo anti-rotación de core.",
    "url": "https://www.youtube.com/results?search_query=pallof+press"
  },
  {
    "id": "seed_28",
    "name": "Box Jump",
    "category": "Sesión Principal",
    "type": "Plyo Extensiva",
    "description": "Pliometría extensiva de salto vertical.",
    "url": "https://www.youtube.com/results?search_query=box+jump+technique"
  },
  {
    "id": "seed_29",
    "name": "Depth Jump",
    "category": "Sesión Principal",
    "type": "Plyo Intensiva",
    "description": "Pliometría intensiva con caída y salto.",
    "url": "https://www.youtube.com/results?search_query=depth+jump+technique"
  },
  {
    "id": "seed_30",
    "name": "Lanzamiento Balón Medicinal",
    "category": "Sesión Principal",
    "type": "Lanzamientos",
    "description": "Potencia de tren superior con balón medicinal.",
    "url": "https://www.youtube.com/results?search_query=medicine+ball+throw+exercise"
  },
  {
    "id": "seed_31",
    "name": "Power Clean",
    "category": "Sesión Principal",
    "type": "Mov. Olímpicos",
    "description": "Movimiento olímpico orientado a potencia.",
    "url": "https://www.youtube.com/results?search_query=power+clean+technique"
  },
  {
    "id": "seed_32",
    "name": "Split Squat",
    "category": "Sesión Principal",
    "type": "F. ppal. TI",
    "description": "Fuerza unilateral de tren inferior.",
    "url": "https://www.youtube.com/results?search_query=split+squat+technique"
  }
];

function seedExerciseLibrary(force = false) {
  if (!force && exerciseLibrary.length > 0) return;

  const existingKeys = new Set(exerciseLibrary.map(item => `${item.category}__${item.name}`.toLowerCase()));

  defaultExerciseLibrary.forEach(item => {
    const key = `${item.category}__${item.name}`.toLowerCase();
    if (!existingKeys.has(key)) {
      exerciseLibrary.push({ ...item, id: item.id + "_" + Date.now() });
    }
  });

  localStorage.setItem("exerciseLibrary", JSON.stringify(exerciseLibrary));
}

seedExerciseLibrary(false);
let currentPhoto = "";
let editingPatientNickname = null;
let currentUploadFile = null;


function setTodayIfEmpty(id) {
  const input = document.getElementById(id);
  if (!input || input.value) return;
  input.value = new Date().toISOString().split("T")[0];
}


function persistAppData() {
  localStorage.setItem("patients", JSON.stringify(patients));
  localStorage.setItem("sessions", JSON.stringify(sessions));
  window.PPF_CORE?.emit?.("sessions");
  localStorage.setItem("histories", JSON.stringify(histories));
  localStorage.setItem("patientFiles", JSON.stringify(patientFiles));
  localStorage.setItem("valoraciones", JSON.stringify(valoraciones));
  localStorage.setItem("exerciseLibrary", JSON.stringify(exerciseLibrary));
}

function pmPushPatientsToCloud() {
  try {
    if (window.PPF_SUPABASE && typeof window.PPF_SUPABASE.pushKey === "function") {
      window.PPF_SUPABASE.pushKey("patients").catch(error => console.warn("No se pudo sincronizar patients:", error));
    }
  } catch (error) {
    console.warn("No se pudo sincronizar patients:", error);
  }
}

function updateCounters() {
  const active = document.querySelector('.nav-item.active')?.dataset.section || "paciente";
  if (typeof pmSetDashboardKpis === "function") {
    pmSetDashboardKpis(active);
    return;
  }
  patientCounter.textContent = patients.length;
  historyCounter.textContent = histories.length;
  fileCounter.textContent = patientFiles.length;
}


function getPatientPhoto(patient) {
  return getPatientPhotoSafe(patient);
}

function normalizePatientPhotoPath(value = "") {
  let raw = String(value || "").trim().replace(/^\/+/, "");
  if (!raw) return "";
  if (raw.startsWith("data:image") || raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  raw = raw.replace(/^fotos[\\/]/i, "");
  return `fotos/${raw}`;
}

function patientPhotoFileName(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("data:image") || raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return raw.replace(/^fotos[\\/]/i, "");
}

function getPatientPhotoSafe(patient) {
  if (!patient) return "";
  return normalizePatientPhotoPath(patient.foto || patient.photo || patient.imagen || patient.image || patient.avatar || "");
}

function ppfSanitizeFilePart(value = "") {
  return String(value || "paciente")
    .trim()
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "paciente";
}

async function ppfUploadPatientPhotoToStorage(file, nickname = "") {
  if (!file) return currentPhoto || "";

  if (window.PPF_SUPABASE_READY) {
    try { await window.PPF_SUPABASE_READY; } catch {}
  }

  const client = window.ppfSupabaseClient || (window.supabase && window.PPF_SUPABASE_CONFIG
    ? window.supabase.createClient(window.PPF_SUPABASE_CONFIG.url, window.PPF_SUPABASE_CONFIG.anonKey)
    : null);

  if (!client || !client.storage) {
    throw new Error("Supabase Storage no está disponible.");
  }

  window.ppfSupabaseClient = client;

  const safeNick = ppfSanitizeFilePart(nickname || document.getElementById("nickname")?.value || document.getElementById("nombre")?.value || "paciente");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${safeNick}/${safeNick}-${Date.now()}.${ext}`;

  const { error } = await client.storage
    .from("patient-photos")
    .upload(path, file, { cacheControl: "3600", upsert: true, contentType: file.type || `image/${ext}` });

  if (error) throw error;

  const { data } = client.storage.from("patient-photos").getPublicUrl(path);
  return data?.publicUrl || "";
}

async function ppfUploadSelectedPatientPhoto() {
  const input = document.getElementById("patientPhotoFile");
  const btn = document.getElementById("uploadPatientPhotoBtn");
  if (!input || !input.files || !input.files[0]) return currentPhoto || "";

  try {
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Subiendo...";
    }
    const nickname = document.getElementById("nickname")?.value?.trim() || editingPatientNickname || "paciente";
    const url = await ppfUploadPatientPhotoToStorage(input.files[0], nickname);
    currentPhoto = url;
    const hidden = document.getElementById("foto");
    if (hidden) hidden.value = url;
    setPatientPhotoVisual(url);
    return url;
  } catch (error) {
    console.error("Error subiendo foto:", error);
    alert("No se pudo subir la foto a Supabase Storage: " + (error.message || error));
    return currentPhoto || "";
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "⬆ Subir foto";
    }
  }
}

async function ppfSyncPatientsNow() {
  localStorage.setItem("patients", JSON.stringify(patients));
  if (window.PPF_SUPABASE && typeof window.PPF_SUPABASE.pushKey === "function") {
    await window.PPF_SUPABASE.pushKey("patients");
  }
}

function patientOptions() {
  if (patients.length === 0) {
    return `<option value="">Primero crea un paciente</option>`;
  }

  const sortedPatients = [...patients].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  return `<option value="">Selecciona deportista destino</option>` + sortedPatients.map(patient => `
    <option value="${patient.nickname}">${patient.nombre}</option>
  `).join("");
}

function calculateIMC() {
  const peso = Number(document.getElementById("peso")?.value);
  const alturaCm = Number(document.getElementById("altura")?.value);
  const imcValue = document.getElementById("imcValue");

  if (!peso || !alturaCm || !imcValue) return;

  const alturaM = alturaCm / 100;
  const imc = peso / (alturaM * alturaM);
  imcValue.textContent = imc.toFixed(1);
}

let ppfPatientListQuery = "";
let ppfPatientListFilter = "all";

function ppfPatientPresence(patient = {}) {
  const stats = pmReadJson("userStats", {});
  const key = pmNormalizeNickname(patient.nickname);
  const stat = Object.entries(stats || {}).find(([nickname]) => pmNormalizeNickname(nickname) === key)?.[1] || {};
  const online = window.PPF_PRESENCE?.isOnline ? window.PPF_PRESENCE.isOnline(stat) : Boolean(stat.online);
  return { online, stat };
}

function ppfPatientSessionSummary(patient = {}) {
  const stats = window.PPF_CORE?.summary?.(patient.nickname);
  if (stats) return { pending: stats.pending, done: stats.completed, cancelled: stats.cancelled, compliance: stats.compliance };
  return { pending: 0, done: 0, cancelled: 0, compliance: 0 };
}

function ppfPatientInitials(name = "") {
  return String(name || "P").trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join("") || "P";
}

function renderPatientList() {
  const list = document.getElementById("patientList");
  if (!list) return;

  const query = ppfPatientListQuery.trim().toLowerCase();
  const rows = patients
    .map(patient => {
      const presence = ppfPatientPresence(patient);
      const sessionSummary = ppfPatientSessionSummary(patient);
      return { patient, presence, sessionSummary };
    })
    .filter(({ patient, presence, sessionSummary }) => {
      const haystack = [patient.nombre, patient.nickname, patient.email, patient.telefono, patient.contenido]
        .map(value => String(value || "").toLowerCase()).join(" ");
      if (query && !haystack.includes(query)) return false;
      if (ppfPatientListFilter === "online" && !presence.online) return false;
      if (ppfPatientListFilter === "pending" && sessionSummary.pending < 1) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.presence.online !== b.presence.online) return a.presence.online ? -1 : 1;
      return String(a.patient.nombre || "").localeCompare(String(b.patient.nombre || ""), "es");
    });

  const count = document.getElementById("patientListResultCount");
  if (count) count.textContent = `${rows.length} ${rows.length === 1 ? "paciente" : "pacientes"}`;

  if (patients.length === 0) {
    list.innerHTML = `<div class="patients-pro-empty"><span>👤</span><b>Aún no hay pacientes</b><small>Crea la primera ficha para empezar.</small></div>`;
    return;
  }

  if (rows.length === 0) {
    list.innerHTML = `<div class="patients-pro-empty"><span>⌕</span><b>Sin resultados</b><small>Prueba con otro nombre, nickname o filtro.</small></div>`;
    return;
  }

  list.innerHTML = rows.map(({ patient, presence, sessionSummary }) => {
    const nickname = encodeURIComponent(patient.nickname || "");
    const photo = getPatientPhotoSafe(patient);
    const lastActivity = presence.stat?.lastActivity || presence.stat?.lastHeartbeat || presence.stat?.lastSeen || "";
    const lastText = presence.online ? "En línea ahora" : (lastActivity ? `Última actividad ${new Date(lastActivity).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}` : "Sin actividad reciente");
    return `
      <article class="patient-row patient-pro-card" data-patient-nickname="${nickname}">
        <div class="patient-pro-avatar-wrap">
          ${photo ? `<img class="patient-thumb" src="${photo}" alt="${patient.nombre}">` : `<div class="patient-thumb">${ppfPatientInitials(patient.nombre)}</div>`}
          <span class="patient-pro-presence ${presence.online ? "is-online" : ""}" title="${presence.online ? "En línea" : "Desconectado"}"></span>
        </div>
        <div class="patient-pro-main">
          <div class="patient-pro-head">
            <div>
              <strong>${patient.nombre || "Paciente"}</strong>
              <p>@${patient.nickname || "sin-nickname"} · ${patient.contenido || "Sin programa"}</p>
            </div>
            <span class="patient-pro-status ${presence.online ? "is-online" : ""}">${presence.online ? "En línea" : "Desconectado"}</span>
          </div>

          <div class="patient-pro-meta">
            <span>🏋️ <b>${sessionSummary.pending}</b> pendientes</span>
            <span>✅ <b>${sessionSummary.done}</b> terminadas</span>
            <span>📅 Alta ${patient.fechaAlta || "-"}</span>
          </div>

          <p class="patient-pro-contact">${patient.email || "Sin email"} · ${patient.telefono || "Sin teléfono"}</p>
          <small class="patient-pro-last">${lastText}</small>

          <div class="patient-card-actions patient-pro-actions">
            <button class="primary-btn patient-pro-session-btn" type="button" data-patient-action="session" data-nickname="${nickname}">🏋️ Nueva sesión</button>
            <button class="edit-btn" type="button" data-patient-action="edit" data-nickname="${nickname}">Editar ficha</button>
            <button class="patient-pro-more-btn" type="button" data-patient-action="history" data-nickname="${nickname}">Historial</button>
            <button class="delete-btn patient-pro-delete" type="button" data-patient-action="delete" data-nickname="${nickname}" aria-label="Eliminar paciente">Eliminar</button>
          </div>
        </div>
      </article>`;
  }).join("");
}

function bindPatientsProList() {
  const search = document.getElementById("patientListSearch");
  if (search) {
    search.value = ppfPatientListQuery;
    search.addEventListener("input", () => {
      ppfPatientListQuery = search.value;
      renderPatientList();
    });
  }

  document.querySelectorAll("[data-patient-filter]").forEach(button => {
    button.classList.toggle("active", button.dataset.patientFilter === ppfPatientListFilter);
    button.addEventListener("click", () => {
      ppfPatientListFilter = button.dataset.patientFilter || "all";
      document.querySelectorAll("[data-patient-filter]").forEach(item => item.classList.toggle("active", item === button));
      renderPatientList();
    });
  });

  document.getElementById("patientList")?.addEventListener("click", event => {
    const button = event.target.closest("[data-patient-action]");
    if (!button) return;
    const nickname = decodeURIComponent(button.dataset.nickname || "");
    const action = button.dataset.patientAction;
    if (action === "edit") return editPatient(nickname);
    if (action === "delete") return deletePatient(nickname);
    if (action === "history") {
      renderSection("historial");
      setTimeout(() => {
        const select = document.getElementById("historyFilter");
        if (select) { select.value = nickname; select.dispatchEvent(new Event("change")); }
      }, 0);
      return;
    }
    if (action === "session") {
      pmNavigateAdmin("sesiones");
      setTimeout(() => {
        const select = document.getElementById("sessionPatientSearch");
        if (select) { select.value = nickname; select.dispatchEvent(new Event("change", { bubbles: true })); }
      }, 0);
    }
  });
}

function renderHistoryList(filterNickname = "") {
  const list = document.getElementById("historyList");
  if (!list) return;

  const visible = filterNickname 
    ? histories.filter(item => item.patientNickname === filterNickname)
    : histories;

  if (visible.length === 0) {
    list.innerHTML = `<p>No hay registros de historial todavía.</p>`;
    return;
  }

  list.innerHTML = visible.slice().reverse().map(item => {
    const patient = patients.find(p => p.nickname === item.patientNickname);
    return `
      <article class="history-card">
        <div class="history-card-header">
          <span class="history-type">${item.tipo}</span>
          <span class="history-date">${item.fecha}</span>
        </div>
        <h3>${patient ? patient.nombre : item.patientNickname}</h3>
        <p>${item.descripcion}</p>
        <div class="history-meta">
          <span>Peso: ${item.peso || "-"} kg</span>
          <span>% graso: ${item.grasa || "-"}</span>
          <span>Dolor/fatiga: ${item.estado || "-"}</span>
        </div>
      </article>
    `;
  }).join("");
}

function renderFilesList(filterNickname = "") {
  const list = document.getElementById("filesList");
  if (!list) return;

  const visible = filterNickname 
    ? patientFiles.filter(item => item.patientNickname === filterNickname)
    : patientFiles;

  if (visible.length === 0) {
    list.innerHTML = `<p>No hay archivos guardados todavía.</p>`;
    return;
  }

  list.innerHTML = visible.slice().reverse().map(item => {
    const patient = patients.find(p => p.nickname === item.patientNickname);
    const isImage = item.mimeType && item.mimeType.startsWith("image/");
    const icon = item.mimeType === "application/pdf" ? "📄" : "📝";

    return `
      <article class="file-card">
        <div class="file-visual">
          ${isImage ? `<img src="${item.data}" alt="${item.title}">` : `<span>${icon}</span>`}
        </div>

        <div>
          <div class="file-card-header">
            <span class="file-type">${getLibraryCategories(item).join(" · ") || "Sin categoría"}</span>
            <span class="file-date">${item.date}</span>
          </div>

          <h3>${item.title}</h3>
          <p><strong>Paciente:</strong> ${patient ? patient.nombre : item.patientNickname}</p>
          <p>${item.notes || "Sin observaciones."}</p>

          <div class="patient-tags">
            <span>${item.fileName}</span>
            <span>${item.mimeType || "archivo"}</span>
          </div>

          <div class="file-actions">
            <a class="secondary-btn" href="${item.data}" download="${item.fileName}">Descargar</a>
            <a class="secondary-btn" href="${item.data}" target="_blank">Abrir</a>
            <button class="danger-btn" onclick="deleteFile('${item.id}')">Eliminar</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function deleteFile(id) {
  patientFiles = patientFiles.filter(file => file.id !== id);
  localStorage.setItem("patientFiles", JSON.stringify(patientFiles));
  updateCounters();

  const filter = document.getElementById("filesFilter");
  renderFilesList(filter ? filter.value : "");
}


function editPatient(nickname) {
  const patient = patients.find(item => item.nickname === nickname);
  if (!patient) return;

  editingPatientNickname = nickname;
  renderSection("paciente");

  const values = {
    nombre: patient.nombre,
    nickname: patient.nickname,
    accessPassword: patient.accessPassword || patient.password || patient.contrasena || "",
    email: patient.email,
    telefono: patient.telefono,
    fechaNacimiento: patient.fechaNacimiento,
    fechaAlta: patient.fechaAlta,
    edad: patient.edad,
    peso: patient.peso,
    altura: patient.altura,
    grasa: patient.grasa,
    pliegues: patient.pliegues,
    notas: patient.notas
  };

  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.value = value || "";
  });

  const contentInput = document.querySelector(`input[name='contenido'][value="${patient.contenido}"]`);
  if (contentInput) contentInput.checked = true;

  currentPhoto = getPatientPhotoSafe(patient);
  const fotoInputEdit = document.getElementById("foto");
  if (fotoInputEdit) fotoInputEdit.value = patientPhotoFileName(currentPhoto);
  paintPatientPhotoPreview(currentPhoto);
  setPatientPreviewPhoto(currentPhoto);

  calculateIMC();
  updateAccessPreview();

  document.getElementById("patientSubmitBtn").textContent = "Actualizar paciente";
  document.getElementById("cancelEditBtn").style.display = "block";
  const photoUpdateButton = document.getElementById("updatePatientPhotoBtn");
  if (photoUpdateButton) photoUpdateButton.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deletePatient(nickname) {
  const patient = patients.find(item => item.nickname === nickname);
  if (!patient) return;

  const confirmed = confirm(`¿Seguro que quieres eliminar a ${patient.nombre}? También se eliminarán sus sesiones, historial y archivos.`);
  if (!confirmed) return;

  patients = patients.filter(item => item.nickname !== nickname);
  histories = histories.filter(item => item.patientNickname !== nickname);
  patientFiles = patientFiles.filter(item => item.patientNickname !== nickname);
  sessions = sessions.filter(item => item.patientNickname !== nickname);

  localStorage.setItem("patients", JSON.stringify(patients));
  localStorage.setItem("histories", JSON.stringify(histories));
  localStorage.setItem("patientFiles", JSON.stringify(patientFiles));
  localStorage.setItem("sessions", JSON.stringify(sessions));
  window.PPF_CORE?.emit?.("sessions");

  updateCounters();
  renderPatientList();
}



function getCurrentPatientPhotoForSave() {
  return normalizePatientPhotoPath(document.getElementById("foto")?.value || currentPhoto || "");
}

function updateRemovePhotoButton() {
  const btn = document.getElementById("removePatientPhotoBtn");
  if (!btn) return;
  btn.style.display = currentPhoto ? "grid" : "none";
}

function clearPatientPhoto() {
  const input = document.getElementById("foto");
  if (input) input.value = "";
  setPatientPhotoVisual("");
}

function resetPatientFormState() {
  const form = document.getElementById("patientForm");
  if (!form) return;

  form.reset();
  editingPatientNickname = null;
  currentPhoto = "";

  const photoInput = document.getElementById("foto");
  if (photoInput) photoInput.value = "";
  const photoFileInput = document.getElementById("patientPhotoFile");
  if (photoFileInput) photoFileInput.value = "";

  document.querySelector("input[name='contenido']").checked = true;
  document.getElementById("imcValue").textContent = "-";
  setPatientPreviewPhoto("");
  document.getElementById("patientSubmitBtn").textContent = "Guardar paciente";
  document.getElementById("cancelEditBtn").style.display = "none";
  const photoUpdateButtonReset = document.getElementById("updatePatientPhotoBtn");
  if (photoUpdateButtonReset) photoUpdateButtonReset.style.display = "none";
  setTodayIfEmpty("fechaAlta");
  updateAccessPreview();
}

function updateAccessPreview() {
  const nickname = document.getElementById("nickname");
  const password = document.getElementById("accessPassword");
  const previewUser = document.getElementById("previewUser");
  const previewPassword = document.getElementById("previewPassword");

  if (previewUser) previewUser.textContent = nickname?.value.trim() || "-";
  if (previewPassword) previewPassword.textContent = password?.value.trim() || "-";
}

function copyClientAccess() {
  const nickname = document.getElementById("nickname")?.value.trim();
  const password = document.getElementById("accessPassword")?.value.trim();

  if (!nickname || !password) {
    alert("Rellena nickname y contraseña antes de copiar.");
    return;
  }

  const text = `Acceso cliente\nUsuario: ${nickname}\nContraseña: ${password}`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(() => alert("Acceso copiado al portapapeles."))
      .catch(() => alert(text));
  } else {
    alert(text);
  }
}


function resolvePatientPhotoFromPreview() {
  const preview = document.getElementById("photoPreview");

  if (preview && preview.style.display !== "none" && preview.getAttribute("src")) {
    return preview.getAttribute("src");
  }

  return currentPhoto || "";
}


function readPatientPhotoBeforeSave() {
  return Promise.resolve(normalizePatientPhotoPath(document.getElementById("foto")?.value || currentPhoto || ""));
}

function setPatientPreviewPhoto(photo = "") {
  const preview = document.getElementById("photoPreview");
  const placeholder = document.getElementById("photoPlaceholder");

  currentPhoto = normalizePatientPhotoPath(photo || "");

  if (!preview || !placeholder) return;

  if (currentPhoto) {
    preview.src = currentPhoto;
    preview.style.display = "block";
    placeholder.style.display = "none";
  } else {
    preview.removeAttribute("src");
    preview.style.display = "none";
    placeholder.style.display = "grid";
  }

  if (typeof updateRemovePhotoButton === "function") updateRemovePhotoButton();
}


function readPatientPhotoFileForButton() {
  return Promise.resolve(normalizePatientPhotoPath(document.getElementById("foto")?.value || currentPhoto || ""));
}

function setPatientPhotoVisual(photo = "") {
  const preview = document.getElementById("photoPreview");
  const placeholder = document.getElementById("photoPlaceholder");

  currentPhoto = normalizePatientPhotoPath(photo || "");

  if (!preview || !placeholder) return;

  if (currentPhoto) {
    preview.src = currentPhoto;
    preview.style.display = "block";
    placeholder.style.display = "none";
  } else {
    preview.removeAttribute("src");
    preview.style.display = "none";
    placeholder.style.display = "grid";
  }

  if (typeof updateRemovePhotoButton === "function") updateRemovePhotoButton();
}

async function updateOnlyPatientPhoto() {
  if (!editingPatientNickname) {
    alert("Primero pulsa Editar en un paciente.");
    return;
  }

  const photo = await readPatientPhotoFileForButton();
  const index = patients.findIndex(patient => patient.nickname === editingPatientNickname);

  if (index === -1) {
    alert("No encuentro el paciente editado.");
    return;
  }

  patients[index] = {
    ...patients[index],
    foto: photo,
    photo,
    imagen: photo
  };

  await ppfSyncPatientsNow();
  setPatientPhotoVisual(photo);
  renderPatientList();

  alert(photo ? "Foto actualizada correctamente." : "Foto eliminada correctamente.");
}


async function readPatientPhotoForSubmit() {
  const fileInput = document.getElementById("patientPhotoFile");
  if (fileInput && fileInput.files && fileInput.files[0]) {
    const uploaded = await ppfUploadSelectedPatientPhoto();
    if (uploaded) return uploaded;
  }
  return normalizePatientPhotoPath(document.getElementById("foto")?.value || currentPhoto || "");
}

function paintPatientPhotoPreview(photo = "") {
  const preview = document.getElementById("photoPreview");
  const placeholder = document.getElementById("photoPlaceholder");

  currentPhoto = normalizePatientPhotoPath(photo || "");

  if (!preview || !placeholder) return;

  if (currentPhoto) {
    preview.src = currentPhoto;
    preview.style.display = "block";
    placeholder.style.display = "none";
  } else {
    preview.removeAttribute("src");
    preview.style.display = "none";
    placeholder.style.display = "grid";
  }

  if (typeof updateRemovePhotoButton === "function") updateRemovePhotoButton();
}

function bindPatientForm() {
  const form = document.getElementById("patientForm");
  const photoInput = document.getElementById("foto");
  const photoFileInput = document.getElementById("patientPhotoFile");
  const choosePhotoBtn = document.getElementById("choosePatientPhotoBtn");
  const uploadPhotoBtn = document.getElementById("uploadPatientPhotoBtn");

  if (!form) return;

  const submitBtn = document.getElementById("patientSubmitBtn");
  const cancelBtn = document.getElementById("cancelEditBtn");
  const removePhotoBtn = document.getElementById("removePatientPhotoBtn");

  setTodayIfEmpty("fechaAlta");
  renderPatientList();
  bindPatientsProList();
  document.getElementById("patientsProAddBtn")?.addEventListener("click", () => {
    resetPatientFormState();
    document.getElementById("nombre")?.focus({ preventScroll: true });
    document.getElementById("patientForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  if (typeof updateRemovePhotoButton === "function") updateRemovePhotoButton();

  if (cancelBtn) cancelBtn.addEventListener("click", resetPatientFormState);

  if (choosePhotoBtn && photoFileInput) {
    choosePhotoBtn.addEventListener("click", () => photoFileInput.click());
  }

  if (photoFileInput) {
    photoFileInput.addEventListener("change", () => {
      const file = photoFileInput.files && photoFileInput.files[0];
      if (!file) return;
      const localUrl = URL.createObjectURL(file);
      const preview = document.getElementById("photoPreview");
      const placeholder = document.getElementById("photoPlaceholder");
      if (preview && placeholder) {
        preview.src = localUrl;
        preview.style.display = "block";
        placeholder.style.display = "none";
      }
    });
  }

  if (uploadPhotoBtn) {
    uploadPhotoBtn.addEventListener("click", ppfUploadSelectedPatientPhoto);
  }

  if (removePhotoBtn) {
    removePhotoBtn.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      currentPhoto = "";
      if (photoInput) photoInput.value = "";
      if (photoFileInput) photoFileInput.value = "";
      paintPatientPhotoPreview("");
    });
  }

  document.querySelectorAll("[data-open-section]").forEach(button => {
    button.addEventListener("click", () => renderSection(button.dataset.openSection));
  });

  document.getElementById("peso")?.addEventListener("input", calculateIMC);
  document.getElementById("altura")?.addEventListener("input", calculateIMC);
  document.getElementById("nickname")?.addEventListener("input", updateAccessPreview);
  document.getElementById("accessPassword")?.addEventListener("input", updateAccessPreview);
  document.getElementById("copyAccessBtn")?.addEventListener("click", copyClientAccess);
  updateAccessPreview();

  const savePatient = async event => {
    if (event) event.preventDefault();

    const photoToSave = await readPatientPhotoForSubmit();

    const peso = Number(document.getElementById("peso")?.value || 0);
    const alturaCm = Number(document.getElementById("altura")?.value || 0);
    const alturaM = alturaCm / 100;
    const imc = peso && alturaM ? (peso / (alturaM * alturaM)).toFixed(1) : "-";

    const nombre = document.getElementById("nombre")?.value.trim() || "";
    const nickname = document.getElementById("nickname")?.value.trim() || "";
    const passwordValue = document.getElementById("accessPassword")?.value.trim() || "";

    if (!nombre || !nickname) {
      alert("Nombre y nickname son obligatorios.");
      return;
    }

    const duplicatedNickname = patients.some(patient =>
      patient.nickname === nickname && patient.nickname !== editingPatientNickname
    );

    if (duplicatedNickname) {
      alert("Ese nickname ya existe. Elige otro.");
      return;
    }

    const previousPatient = editingPatientNickname
      ? (patients.find(patient => patient.nickname === editingPatientNickname) || {})
      : {};

    const finalPhoto = photoToSave || getPatientPhotoSafe(previousPatient) || "";

    const newPatient = {
      ...previousPatient,
      foto: finalPhoto,
      photo: finalPhoto,
      imagen: finalPhoto,
      image: finalPhoto,
      avatar: finalPhoto,
      nombre,
      nickname,
      accessPassword: passwordValue,
      password: passwordValue,
      contrasena: passwordValue,
      email: document.getElementById("email")?.value.trim() || "",
      telefono: document.getElementById("telefono")?.value.trim() || "",
      fechaNacimiento: document.getElementById("fechaNacimiento")?.value || "",
      fechaAlta: document.getElementById("fechaAlta")?.value || "",
      edad: document.getElementById("edad")?.value.trim() || "",
      peso: document.getElementById("peso")?.value.trim() || "",
      altura: document.getElementById("altura")?.value.trim() || "",
      imc,
      grasa: document.getElementById("grasa")?.value.trim() || "",
      pliegues: document.getElementById("pliegues")?.value.trim() || "",
      contenido: document.querySelector("input[name='contenido']:checked")?.value || "Op. Física",
      notas: document.getElementById("notas")?.value.trim() || ""
    };

    if (editingPatientNickname) {
      const previousNickname = editingPatientNickname;
      const index = patients.findIndex(patient => patient.nickname === previousNickname);

      if (index !== -1) {
        patients[index] = newPatient;
      } else {
        patients.push(newPatient);
      }

      if (previousNickname !== newPatient.nickname) {
        histories = histories.map(item => item.patientNickname === previousNickname ? { ...item, patientNickname: newPatient.nickname } : item);
        patientFiles = patientFiles.map(item => item.patientNickname === previousNickname ? { ...item, patientNickname: newPatient.nickname } : item);
        sessions = sessions.map(item => item.patientNickname === previousNickname ? { ...item, patientNickname: newPatient.nickname } : item);

        const completedSessions = JSON.parse(localStorage.getItem("completedSessions")) || [];
        localStorage.setItem("completedSessions", JSON.stringify(
          completedSessions.map(item => item.patientNickname === previousNickname ? { ...item, patientNickname: newPatient.nickname } : item)
        ));
      }

      // mensaje después de sincronizar
    } else {
      patients.push(newPatient);
    }

    await ppfSyncPatientsNow();
    alert(editingPatientNickname ? "Paciente actualizado y sincronizado correctamente." : "Paciente guardado y sincronizado correctamente.");
    localStorage.setItem("histories", JSON.stringify(histories));
    localStorage.setItem("patientFiles", JSON.stringify(patientFiles));
    localStorage.setItem("sessions", JSON.stringify(sessions));
  window.PPF_CORE?.emit?.("sessions");

    currentPhoto = "";
    resetPatientFormState();
    updateCounters();
    renderPatientList();
  };

  form.onsubmit = savePatient;
  if (submitBtn) {
    submitBtn.onclick = savePatient;
  }
}

function bindHistoryForm() {
  const form = document.getElementById("historyForm");
  const filter = document.getElementById("historyFilter");

  if (!form) return;

  setTodayIfEmpty("historyDate");
  renderHistoryList();

  filter.addEventListener("change", () => {
    renderHistoryList(filter.value);
  });


  function cloneSessionModulesForSave() {
    // Clonado profundo para evitar que resetSessionForm vacíe la Sesión Principal guardada.
    return {
      movilidad: JSON.parse(JSON.stringify(moduleData.movilidad || [])),
      activacion: JSON.parse(JSON.stringify(moduleData.activacion || [])),
      principal: JSON.parse(JSON.stringify(moduleData.principal || {
        blocks: {
          bloque1: defaultPrincipalBlock(),
          bloque2: defaultPrincipalBlock(),
          bloque3: defaultPrincipalBlock(),
          bloque4: defaultPrincipalBlock()
        }
      }))
    };
  }

  function normalizePrincipalBlocksForSave(principal) {
    const safePrincipal = principal || { blocks: {} };
    safePrincipal.blocks = safePrincipal.blocks || {};

    ["bloque1", "bloque2", "bloque3", "bloque4"].forEach(blockKey => {
      const block = safePrincipal.blocks[blockKey] || defaultPrincipalBlock();

      safePrincipal.blocks[blockKey] = {
        notes: block.notes || "",
        exercises: (block.exercises || []).map(item => ({
          nombre: item.nombre || "",
          series: item.series || "",
          repeticiones: item.repeticiones || "",
          carga: item.carga || "",
          unidad: item.unidad || "Kg",
          rpe: item.rpe || "",
          tipo: item.tipo || "F. ppal. TS",
          url: item.url || "",
          deleted: Boolean(item.deleted)
        }))
      };

    });

    return safePrincipal;
  }


  if (saveSessionBtn) {
    saveSessionBtn.addEventListener("click", event => {
      if (saveSessionBtn.type !== "submit") {
        event.preventDefault();
        form.requestSubmit();
      }
    });
  }


  function collectPrincipalBlockFromDomForce(blockKey) {
    const prefix = `principal_${blockKey}`;
    const currentBlock = moduleData.principal.blocks[blockKey] || defaultPrincipalBlock();
    const notesValue = activePrincipalBlock === blockKey && principalBlockNotes ? principalBlockNotes.value.trim() : (currentBlock.notes || "");

    const sourceExercises = (currentBlock.exercises?.length ? currentBlock.exercises : [defaultExercise("F. ppal. TS")]);
    const exercises = sourceExercises.map((existingItem, index) => {
      const num = index + 1;

      const nameInput = document.getElementById(`${prefix}_nombre_${num}`);
      const seriesInput = document.getElementById(`${prefix}_series_${num}`);
      const repsInput = document.getElementById(`${prefix}_reps_${num}`);
      const cargaInput = document.getElementById(`${prefix}_carga_${num}`);
      const unidadInput = document.getElementById(`${prefix}_unidad_${num}`);
      const rpeInput = document.getElementById(`${prefix}_rpe_${num}`);
      const tipoInput = document.getElementById(`${prefix}_tipo_${num}`);
      const urlInput = document.getElementById(`${prefix}_url_${num}`);

      const isRendered = nameInput || seriesInput || repsInput || cargaInput || unidadInput || rpeInput || tipoInput || urlInput;

      if (!isRendered) {
        return {
          nombre: existingItem.nombre || "",
          series: existingItem.series || "",
          repeticiones: existingItem.repeticiones || "",
          carga: existingItem.carga || "",
          unidad: existingItem.unidad || "Kg",
          rpe: existingItem.rpe || "",
          tipo: existingItem.tipo || "F. ppal. TS",
          url: existingItem.url || "",
          deleted: Boolean(existingItem.deleted)
        };
      }

      return {
        nombre: nameInput?.value.trim() || "",
        series: seriesInput?.value.trim() || "",
        repeticiones: repsInput?.value.trim() || "",
        carga: cargaInput?.value.trim() || "",
        unidad: unidadInput?.value || "Kg",
        rpe: rpeInput?.value.trim() || "",
        tipo: tipoInput?.value || "F. ppal. TS",
        url: urlInput?.value.trim() || "",
        deleted: Boolean(existingItem.deleted)
      };
    });

    return { notes: notesValue, exercises };
  }

  function forcePrincipalDomIntoModuleData() {
    moduleData.principal.blocks = moduleData.principal.blocks || {
      bloque1: defaultPrincipalBlock(),
      bloque2: defaultPrincipalBlock(),
      bloque3: defaultPrincipalBlock(),
      bloque4: defaultPrincipalBlock()
    };

    ["bloque1", "bloque2", "bloque3", "bloque4"].forEach(blockKey => {
      moduleData.principal.blocks[blockKey] = collectPrincipalBlockFromDomForce(blockKey);
    });
  }

  function mergePrincipalWithExistingForSave(existingSession, principalToSave) {
    const merged = JSON.parse(JSON.stringify(principalToSave || { blocks: {} }));
    merged.blocks = merged.blocks || {};

    const existingPrincipal = existingSession?.modules?.principal || existingSession?.principal || { blocks: {} };
    const existingBlocks = existingPrincipal.blocks || {};

    ["bloque1", "bloque2", "bloque3", "bloque4"].forEach(blockKey => {
      const newBlock = merged.blocks[blockKey] || defaultPrincipalBlock();
      const existingBlock = existingBlocks[blockKey];

      const newHasContent =
        (newBlock.notes || "").trim() ||
        (newBlock.exercises || []).some(item => !item.deleted && (item.nombre || item.series || item.repeticiones || item.carga || item.rpe || item.url));

      if (!newHasContent && existingBlock) {
        merged.blocks[blockKey] = JSON.parse(JSON.stringify(existingBlock));
      } else {
        merged.blocks[blockKey] = {
          notes: newBlock.notes || "",
          exercises: (newBlock.exercises || []).map(item => ({
            nombre: item.nombre || "",
            series: item.series || "",
            repeticiones: item.repeticiones || "",
            carga: item.carga || "",
            unidad: item.unidad || "Kg",
            rpe: item.rpe || "",
            tipo: item.tipo || "F. ppal. TS",
            url: item.url || "",
            deleted: Boolean(item.deleted)
          }))
        };
      }

    });

    return merged;
  }

  form.addEventListener("submit", event => {
    event.preventDefault();

    const newHistory = {
      patientNickname: document.getElementById("historyPatient").value,
      fecha: document.getElementById("historyDate").value,
      tipo: document.getElementById("historyType").value,
      peso: document.getElementById("historyWeight").value.trim(),
      grasa: document.getElementById("historyFat").value.trim(),
      estado: document.getElementById("historyStatus").value.trim(),
      descripcion: document.getElementById("historyDescription").value.trim()
    };

    histories.push(newHistory);
    localStorage.setItem("histories", JSON.stringify(histories));

    form.reset();
    updateCounters();
    renderHistoryList(filter.value);
  });
}

function bindFilesForm() {
  const form = document.getElementById("filesForm");
  const filter = document.getElementById("filesFilter");
  const fileInput = document.getElementById("patientFile");
  const filePreview = document.getElementById("filePreview");

  if (!form) return;

  setTodayIfEmpty("fileDate");
  renderFilesList();

  filter.addEventListener("change", () => {
    renderFilesList(filter.value);
  });

  fileInput.addEventListener("change", event => {
    const file = event.target.files[0];
    currentUploadFile = file || null;

    if (!file) {
      filePreview.textContent = "Ningún archivo seleccionado.";
      return;
    }

    filePreview.textContent = `Archivo seleccionado: ${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`;
  });

  form.addEventListener("submit", event => {
    event.preventDefault();

    if (!currentUploadFile) {
      alert("Selecciona un archivo antes de guardar.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const newFile = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        patientNickname: document.getElementById("filePatient").value,
        date: document.getElementById("fileDate").value,
        category: document.getElementById("fileCategory").value,
        title: document.getElementById("fileTitle").value.trim(),
        notes: document.getElementById("fileNotes").value.trim(),
        fileName: currentUploadFile.name,
        mimeType: currentUploadFile.type,
        data: reader.result
      };

      patientFiles.push(newFile);

      try {
        localStorage.setItem("patientFiles", JSON.stringify(patientFiles));
      } catch (error) {
        alert("El archivo es demasiado grande para guardarse en esta versión de prueba. Más adelante lo pasaremos a base de datos/servidor.");
        patientFiles.pop();
        return;
      }

      form.reset();
      currentUploadFile = null;
      filePreview.textContent = "Ningún archivo seleccionado.";

      updateCounters();
      renderFilesList(filter.value);
    };

    reader.readAsDataURL(currentUploadFile);
  });
}

const patientHTML = `
  <h2>Ficha del paciente</h2>
  <p>Datos personales, antropométricos, foto, contenido de trabajo e historial inicial.</p>

  <form class="patient-form" id="patientForm">
    <div class="patient-top">
      <div class="patient-data-area">
        <div class="form-grid-3 access-row">
          <div>
            <label for="nombre">Nombre</label>
            <input id="nombre" type="text" placeholder="Nombre completo" required />
          </div>

          <div>
            <label for="nickname">Nickname / Usuario cliente</label>
            <input id="nickname" type="text" placeholder="Ej: juan23" required />
          </div>

          <div>
            <label for="accessPassword">Contraseña cliente</label>
            <input id="accessPassword" type="text" placeholder="Contraseña de acceso" required />
          </div>
        </div>

        <div class="access-preview">
          <div>
            <h3>Acceso cliente</h3>
            <p>Usuario: <strong id="previewUser">-</strong> · Contraseña: <strong id="previewPassword">-</strong></p>
          </div>
          <button class="copy-access-btn" type="button" id="copyAccessBtn">📋 Copiar acceso</button>
        </div>

        <div class="form-grid-2">
          <div>
            <label for="email">Email</label>
            <input id="email" type="email" placeholder="correo@email.com" />
          </div>

          <div>
            <label for="telefono">Teléfono</label>
            <input id="telefono" type="tel" placeholder="+34 600 000 000" />
          </div>

          <div>
            <label for="fechaNacimiento">Fecha de nacimiento</label>
            <input id="fechaNacimiento" type="date" />
          </div>

          <div>
            <label for="fechaAlta">Fecha de alta</label>
            <input id="fechaAlta" type="date" />
          </div>

          <div>
            <label for="edad">Edad</label>
            <input id="edad" type="number" placeholder="Ej: 32" required />
          </div>

          <div>
            <label for="peso">Peso</label>
            <input id="peso" type="number" step="0.1" placeholder="Ej: 78.5 kg" required />
          </div>

          <div>
            <label for="altura">Altura</label>
            <input id="altura" type="number" placeholder="Ej: 178 cm" required />
          </div>

          <div>
            <label for="grasa">% graso</label>
            <input id="grasa" type="number" step="0.1" placeholder="Ej: 14.5" />
          </div>
        </div>
      </div>

      <div>
        <label>Foto del paciente</label>
        <div class="photo-box photo-box-storage">
          <button class="photo-remove-btn" type="button" id="removePatientPhotoBtn" title="Eliminar foto">✕</button>
          <div class="photo-label photo-storage-preview">
            <div class="photo-placeholder" id="photoPlaceholder">
              <strong>Foto del paciente</strong>
              <span>Selecciona y sube una imagen</span>
            </div>
            <img id="photoPreview" class="photo-preview" alt="Vista previa" />
          </div>
        </div>
        <input id="foto" type="hidden" />
        <input id="patientPhotoFile" type="file" accept="image/*" style="display:none" />
        <div class="storage-photo-actions">
          <button class="update-photo-btn" type="button" id="choosePatientPhotoBtn">📷 Elegir foto</button>
          <button class="update-photo-btn" type="button" id="uploadPatientPhotoBtn">⬆ Subir foto</button>
        </div><div class="imc-panel">
          <span>IMC automático</span>
          <strong id="imcValue">-</strong>
        </div>
      </div>
    </div>

    <div class="field-full">
      <label for="pliegues">Pliegues</label>
      <textarea id="pliegues" placeholder="Anota pliegues, perímetros o mediciones relevantes"></textarea>
    </div>

    <div class="field-full">
      <label>Contenido</label>
      <div class="content-options">
        <label class="option-card"><input type="radio" name="contenido" value="Op. Física" checked /><span>Op. Física</span></label>
        <label class="option-card"><input type="radio" name="contenido" value="Op. Deportiva" /><span>Op. Deportiva</span></label>
        <label class="option-card"><input type="radio" name="contenido" value="Readaptación" /><span>Readaptación</span></label>
      </div>
    </div>

    <div class="field-full">
      <label for="notas">Historial / notas iniciales</label>
      <textarea id="notas" placeholder="Lesiones, objetivos, observaciones, historial deportivo..."></textarea>
    </div>

    <div class="form-actions">
      <button class="primary-btn" id="patientSubmitBtn" type="submit">Guardar paciente</button>
      <button class="cancel-btn" id="cancelEditBtn" type="button" style="display:none;">Cancelar edición</button>
    </div>
  </form>

  <div class="patient-actions">
    <button class="patient-action-btn" type="button" data-open-section="historial">
      <span class="action-icon">📁</span>
      <strong>Historial</strong>
      <span>Accede a sesiones, valoraciones, evolución, lesiones, molestias y notas del paciente.</span>
    </button>

    <button class="patient-action-btn" type="button" data-open-section="archivos">
      <span class="action-icon">🗂️</span>
      <strong>Archivos</strong>
      <span>Consulta radiografías, analíticas, expedientes médicos, informes, textos o imágenes.</span>
    </button>
  </div>

  <section class="patients-pro-directory">
    <div class="patients-pro-directory-head">
      <div>
        <p class="eyebrow">DIRECTORIO</p>
        <h2>Mis pacientes</h2>
        <span id="patientListResultCount">0 pacientes</span>
      </div>
      <button class="primary-btn patients-pro-add" type="button" id="patientsProAddBtn">＋ Nuevo paciente</button>
    </div>

    <div class="patients-pro-toolbar">
      <label class="patients-pro-search">
        <span>⌕</span>
        <input id="patientListSearch" type="search" placeholder="Buscar por nombre, usuario, email o teléfono…" autocomplete="off" />
      </label>
      <div class="patients-pro-filters" aria-label="Filtros de pacientes">
        <button type="button" data-patient-filter="all" class="active">Todos</button>
        <button type="button" data-patient-filter="online">En línea</button>
        <button type="button" data-patient-filter="pending">Con pendientes</button>
      </div>
    </div>

    <div class="patient-list patients-pro-list" id="patientList"></div>
  </section>
`;

const historialHTML = `
  <button class="back-btn" type="button" onclick="renderSection('paciente')">← Volver a Paciente</button>
  <h2>Historial del paciente</h2>
  <p>Registra sesiones realizadas, valoraciones, evolución, molestias, fatiga y notas importantes.</p>

  <form class="patient-form" id="historyForm">
    <div class="form-grid-2">
      <div><label for="historyPatient">Paciente</label><select id="historyPatient" required>${patientOptions()}</select></div>
      <div><label for="historyDate">Fecha</label><input id="historyDate" type="date" required /></div>
      <div>
        <label for="historyType">Tipo de registro</label>
        <select id="historyType" required>
          <option value="Sesión">Sesión</option>
          <option value="Valoración">Valoración</option>
          <option value="Evolución">Evolución</option>
          <option value="Lesión / molestia">Lesión / molestia</option>
          <option value="Nota">Nota</option>
        </select>
      </div>
      <div><label for="historyStatus">Estado / dolor / fatiga</label><input id="historyStatus" type="text" placeholder="Ej: fatiga 6/10, dolor rodilla..." /></div>
      <div><label for="historyWeight">Peso</label><input id="historyWeight" type="number" step="0.1" placeholder="Ej: 78.2 kg" /></div>
      <div><label for="historyFat">% graso</label><input id="historyFat" type="number" step="0.1" placeholder="Ej: 14.1" /></div>
      <div class="field-full"><label for="historyDescription">Descripción</label><textarea id="historyDescription" placeholder="Resumen de la sesión, evolución, cargas, observaciones, sensaciones..." required></textarea></div>
    </div>
    <button class="primary-btn" type="submit">Guardar registro</button>
  </form>

  <div class="patient-form" style="margin-top:26px;">
    <label for="historyFilter">Filtrar historial por paciente</label>
    <select id="historyFilter">
      <option value="" selected disabled>Selecciona paciente</option>
      ${patientOptions().replace('<option value="">Selecciona paciente</option>', '')}
    </select>
  </div>

  <div class="history-list" id="historyList"></div>
`;

const archivosHTML = `
  <button class="back-btn" type="button" onclick="renderSection('paciente')">← Volver a Paciente</button>
  <h2>Archivos del paciente</h2>
  <p>Sube radiografías, expedientes médicos, analíticas, informes, textos o imágenes y déjalos vinculados al paciente.</p>

  <div class="notice">
    Versión de prueba: los archivos se guardan en este navegador mediante localStorage. Para uso real con datos médicos, lo correcto será base de datos/servidor seguro, permisos y copias de seguridad.
  </div>

  <form class="patient-form" id="filesForm" style="margin-top:24px;">
    <div class="form-grid-2">
      <div>
        <label for="filePatient">Paciente</label>
        <select id="filePatient" required>${patientOptions()}</select>
      </div>

      <div>
        <label for="fileDate">Fecha</label>
        <input id="fileDate" type="date" required />
      </div>

      <div>
        <label for="fileCategory">Tipo de archivo</label>
        <select id="fileCategory" required>
          <option value="Radiografía">Radiografía</option>
          <option value="Expediente médico">Expediente médico</option>
          <option value="Analítica">Analítica</option>
          <option value="Informe">Informe</option>
          <option value="Imagen">Imagen</option>
          <option value="Texto">Texto</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      <div>
        <label for="fileTitle">Título</label>
        <input id="fileTitle" type="text" placeholder="Ej: Analítica marzo, RX rodilla..." required />
      </div>

      <div class="field-full">
        <label>Archivo</label>
        <div class="upload-box">
          <label class="upload-label">
            <input id="patientFile" type="file" accept="image/*,.pdf,.txt,.doc,.docx,.rtf" required />
            <div class="upload-placeholder">
              <strong>Subir archivo</strong>
              <span>Imagen, PDF, texto, Word o informe médico</span>
            </div>
          </label>
        </div>
        <div class="file-preview" id="filePreview">Ningún archivo seleccionado.</div>
      </div>

      <div class="field-full">
        <label for="fileNotes">Observaciones</label>
        <textarea id="fileNotes" placeholder="Notas importantes sobre este archivo..."></textarea>
      </div>
    </div>

    <button class="primary-btn" type="submit">Guardar archivo en paciente</button>
  </form>

  <div class="patient-form" style="margin-top:26px;">
    <label for="filesFilter">Filtrar archivos por paciente</label>
    <select id="filesFilter">
      <option value="" selected disabled>Selecciona paciente</option>
      ${patientOptions().replace('<option value="">Selecciona paciente</option>', '')}
    </select>
  </div>

  <div class="files-list" id="filesList"></div>
`;



function persistSessionsOnly() {
  localStorage.setItem("sessions", JSON.stringify(sessions));
  window.PPF_CORE?.emit?.("sessions");
}

function getSelectedPatientBySearch(value) {
  const target = String(value || "").toLowerCase();
  return patients.find(patient =>
    String(patient.nombre || "").toLowerCase() === target ||
    String(patient.nickname || "").toLowerCase() === target
  );
}


const PPF_NCI_VERSION = 6;

const PPF_SESSION_KINDS = {
  gym: { icon: "🏋️", label: "Gimnasio" },
  field: { icon: "🏟️", label: "Campo" },
  recovery: { icon: "🧘", label: "Recuperación" },
  testing: { icon: "📊", label: "Test / Valoración" },
  competition: { icon: "🏆", label: "Competición" },
  running: { icon: "🏃", label: "Carrera" },
  other: { icon: "🎯", label: "Otra" }
};

function nciSessionKind(session = {}) {
  const runningSeries = (session.modules?.carrera || session.carrera || [])
    .filter(item => item && !item.deleted && (item.nombre || item.series || item.cantidad || item.ritmo || item.rpe || item.fc));

  // FASE 2.2 · Running Session Identity Polish
  // Si la sesión contiene trabajo de carrera, su identidad visual debe ser Carrera
  // incluso en sesiones antiguas que quedaron guardadas como "Otra".
  if (runningSeries.length) return "running";

  const key = String(session.sessionKind || session.sessionType || "gym").trim().toLowerCase();
  return PPF_SESSION_KINDS[key] ? key : "other";
}

function nciSessionKindMeta(session = {}) {
  return PPF_SESSION_KINDS[nciSessionKind(session)];
}

function nciDisplayNumber(session = {}) {
  const explicit = String(session.displaySessionNumber || "").trim();
  if (explicit) return explicit;
  const base = Number(session.sessionBaseNumber || session.microciclo || session.micro || session.microcycle || session.numero || 0);
  const order = Number(session.subsessionOrder || session.dayOrder || 1);
  return base > 0 ? `${base}.${Math.max(1, order)}` : String(session.numero || "-");
}

function nciNickname(value = "") {
  return String(value || "").trim().replace(/^@+/, "").toLowerCase();
}

function nciSessionPatient(session = {}) {
  return nciNickname(session.patientNickname || session.nickname || session.patient || session.clientNickname || "");
}

function nciSessionDate(session = {}) {
  return String(session.fecha || session.date || "9999-12-31");
}

function nciSessionMicro(session = {}) {
  return Number(session.microciclo || session.micro || session.microcycle || 0);
}

function nciSessionCreatedAt(session = {}) {
  return Date.parse(session.createdAt || session.updatedAt || "") || 0;
}

function nciSessionTime(session = {}) {
  const value = String(session.scheduledTime || session.time || "").trim();
  return /^\d{2}:\d{2}$/.test(value) ? value : "23:59";
}

function nciMicroSequenceOrder(session = {}) {
  return Number(session.microSequenceOrder || session.subsessionOrder || session.dayOrder || 0);
}

function nciCompletedSessionIds() {
  let completed = [];
  try { completed = JSON.parse(localStorage.getItem("completedSessions") || "[]"); } catch (_) {}
  if (!Array.isArray(completed)) completed = [];
  return new Set(completed.map(item => String(item?.sessionId || item?.id || "").trim()).filter(Boolean));
}

function nciIsCompleted(session = {}, completedIds = nciCompletedSessionIds()) {
  const id = String(session.id || session.sessionId || "").trim();
  return Boolean(id && completedIds.has(id));
}

function nciChronologicalCompare(a = {}, b = {}) {
  const dateCompare = nciSessionDate(a).localeCompare(nciSessionDate(b));
  if (dateCompare !== 0) return dateCompare;

  const timeCompare = nciSessionTime(a).localeCompare(nciSessionTime(b));
  if (timeCompare !== 0) return timeCompare;

  const agendaCompare = Number(a.agendaOrder || 0) - Number(b.agendaOrder || 0);
  if (agendaCompare !== 0) return agendaCompare;

  const currentOrderCompare = nciMicroSequenceOrder(a) - nciMicroSequenceOrder(b);
  if (currentOrderCompare !== 0) return currentOrderCompare;

  const createdCompare = nciSessionCreatedAt(a) - nciSessionCreatedAt(b);
  if (createdCompare !== 0) return createdCompare;

  return String(a.id || "").localeCompare(String(b.id || ""));
}

function nciUpdateNotificationNumbers(changedSessions = []) {
  if (!changedSessions.length) return false;
  let notifications = [];
  try { notifications = JSON.parse(localStorage.getItem("notifications") || "[]"); } catch (_) {}
  if (!Array.isArray(notifications) || !notifications.length) return false;

  const byId = new Map(changedSessions.map(session => [String(session.id || ""), session]));
  let changed = false;
  notifications = notifications.map(item => {
    const session = byId.get(String(item?.sessionId || ""));
    if (!session) return item;
    const displayNumber = nciDisplayNumber(session);
    const nextBody = item?.type === "prepared_session" ? `Tu sesión nº ${displayNumber} ya está disponible.` : item.body;
    if (String(item.displaySessionNumber || item.sessionNumber || "") === displayNumber && item.body === nextBody) return item;
    changed = true;
    return {
      ...item,
      sessionNumber: session.numero || item.sessionNumber || null,
      displaySessionNumber: displayNumber,
      body: nextBody,
      updatedAt: new Date().toISOString()
    };
  });
  if (changed) localStorage.setItem("notifications", JSON.stringify(notifications));
  return changed;
}

function nciRenumberPatientSessions(patientNickname, { touchUpdatedAt = true, rebuildOrder = false } = {}) {
  const patientKey = nciNickname(patientNickname);
  if (!patientKey) return { changed: false, notificationsChanged: false, sessions: [] };

  const patientSessions = sessions.filter(session => nciSessionPatient(session) === patientKey);

  // NCI v2: cada microciclo tiene una única secuencia continua, aunque sus
  // sesiones estén repartidas en varios días. Ejemplo: 15.1, 15.2, 15.3...
  const groups = new Map();
  patientSessions.forEach(session => {
    const micro = nciSessionMicro(session) || Number(session.sessionBaseNumber || session.numero || 0) || 1;
    const key = String(micro);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(session);
  });

  const changedSessions = [];
  const nowIso = new Date().toISOString();
  groups.forEach((group, microKey) => {
    const mustRebuild = rebuildOrder || group.some(session =>
      Number(session.numberingVersion || 0) < PPF_NCI_VERSION ||
      !Number.isFinite(Number(session.microSequenceOrder)) ||
      Number(session.microSequenceOrder) <= 0
    );

    group.sort(mustRebuild
      ? nciChronologicalCompare
      : (a, b) => nciMicroSequenceOrder(a) - nciMicroSequenceOrder(b) || nciChronologicalCompare(a, b));

    group.forEach((session, index) => {
      const base = Number(microKey) || 1;
      const order = index + 1;
      const display = `${base}.${order}`;
      const didChange = Number(session.sessionBaseNumber || 0) !== base ||
        Number(session.subsessionOrder || session.dayOrder || 0) !== order ||
        Number(session.microSequenceOrder || 0) !== order ||
        String(session.displaySessionNumber || "") !== display ||
        Number(session.numberingVersion || 0) !== PPF_NCI_VERSION;
      if (!didChange) return;
      session.sessionBaseNumber = base;
      session.subsessionOrder = order;
      session.dayOrder = order;
      session.microSequenceOrder = order;
      session.displaySessionNumber = display;
      session.displayOrder = order;
      session.numberingVersion = PPF_NCI_VERSION;
      if (touchUpdatedAt) session.updatedAt = nowIso;
      changedSessions.push(session);
    });
  });

  const notificationsChanged = nciUpdateNotificationNumbers(changedSessions);
  return { changed: changedSessions.length > 0, notificationsChanged, sessions: changedSessions };
}

function nciRenumberAllSessions(options = {}) {
  const patientKeys = Array.from(new Set(sessions.map(nciSessionPatient).filter(Boolean)));
  let changed = false;
  let notificationsChanged = false;
  patientKeys.forEach(key => {
    const result = nciRenumberPatientSessions(key, options);
    changed = changed || result.changed;
    notificationsChanged = notificationsChanged || result.notificationsChanged;
  });
  if (changed) {
    window.sessions = sessions;
    localStorage.setItem("sessions", JSON.stringify(sessions));
  window.PPF_CORE?.emit?.("sessions");
  }
  return { changed, notificationsChanged };
}

async function nciRunHistoricalMigrationV21() {
  const migrationKey = "ppfNciHistoricalMigrationVersion";
  const targetVersion = 21;

  try {
    if (window.PPF_SUPABASE_READY && typeof window.PPF_SUPABASE_READY.then === "function") {
      try { await window.PPF_SUPABASE_READY; } catch (_) {}
    }

    // IMPORTANTE: admin.js se evalúa antes de que termine el pull inicial de
    // Supabase. Recargamos el array local después del pull para migrar los
    // registros reales de nube, no la instantánea previa del navegador.
    let loaded = [];
    try { loaded = JSON.parse(localStorage.getItem("sessions") || "[]"); } catch (_) {}
    if (!Array.isArray(loaded)) loaded = [];
    sessions = loaded;
    window.sessions = sessions;

    const alreadyMigrated = Number(localStorage.getItem(migrationKey) || 0) >= targetVersion;
    const hasBrokenSequence = (() => {
      const seen = new Map();
      return sessions.some(session => {
        const patient = nciSessionPatient(session);
        const micro = nciSessionMicro(session);
        if (!patient || !micro) return false;
        const display = String(session.displaySessionNumber || nciDisplayNumber(session));
        const key = `${patient}::${micro}::${display}`;
        const duplicate = seen.has(key);
        seen.set(key, true);
        return duplicate || Number(session.numberingVersion || 0) < PPF_NCI_VERSION;
      });
    })();

    if (alreadyMigrated && !hasBrokenSequence) return false;

    const result = nciRenumberAllSessions({ touchUpdatedAt: true, rebuildOrder: true });
    localStorage.setItem(migrationKey, String(targetVersion));
    localStorage.setItem("ppfNciVersion", String(PPF_NCI_VERSION));

    if (result.changed) {
      if (window.PPF_SUPABASE?.pushValue) {
        await window.PPF_SUPABASE.pushValue("sessions", sessions);
      } else if (window.PPF_SUPABASE?.pushKey) {
        await window.PPF_SUPABASE.pushKey("sessions");
      }
    }
    if (result.notificationsChanged && window.PPF_SUPABASE?.pushKey) {
      await window.PPF_SUPABASE.pushKey("notifications");
    }

    // Refresca la vista activa para que la renumeración se vea sin F5.
    try {
      const activeSection = document.querySelector(".nav-item.active")?.dataset?.section;
      if (activeSection && typeof renderSection === "function") renderSection(activeSection);
      else if (typeof renderSessionList === "function") renderSessionList();
    } catch (_) {}

    window.dispatchEvent(new CustomEvent("ppf:nci-v21-migrated", {
      detail: { changed: result.changed, sessions: sessions.length }
    }));
    return result.changed;
  } catch (error) {
    console.warn("No se pudo completar la migración histórica NCI v2.1:", error);
    return false;
  }
}

// Ejecutar siempre después del pull inicial de Supabase. El marcador evita
// escrituras repetidas, pero la detección de duplicados repara datos antiguos
// aunque el navegador conserve un marcador previo incorrecto.
if (window.PPF_SUPABASE_READY && typeof window.PPF_SUPABASE_READY.then === "function") {
  window.PPF_SUPABASE_READY.then(() => nciRunHistoricalMigrationV21()).catch(() => nciRunHistoricalMigrationV21());
} else {
  setTimeout(nciRunHistoricalMigrationV21, 900);
}

function nciPreviewSessionNumber(patientNickname, dateValue, microValue, editingId = null) {
  const patientKey = nciNickname(patientNickname);
  const base = Number(microValue || 0);
  if (!patientKey || !dateValue || !base) return "-";
  const sameMicro = sessions
    .filter(session => nciSessionPatient(session) === patientKey)
    .filter(session => String(session.id) !== String(editingId || ""))
    .filter(session => nciSessionMicro(session) === base)
    .slice()
    .sort((a, b) => nciMicroSequenceOrder(a) - nciMicroSequenceOrder(b) || nciChronologicalCompare(a, b));

  if (editingId) {
    const current = sessions.find(item => String(item.id) === String(editingId));
    if (current && nciSessionMicro(current) === base) {
      return `${base}.${Number(current.subsessionOrder || current.dayOrder || 1)}`;
    }
  }

  const virtual = { fecha: dateValue, scheduledTime: "23:59", createdAt: new Date().toISOString() };
  const position = sameMicro.filter(item => nciChronologicalCompare(item, virtual) <= 0).length + 1;
  return `${base}.${position}`;
}

function getNextSessionNumber(patientNickname, dateValue = "", microValue = 0) {
  return nciPreviewSessionNumber(patientNickname, dateValue, microValue, null);
}

window.PPF_NCI = {
  version: PPF_NCI_VERSION,
  renumberPatient: nciRenumberPatientSessions,
  renumberAll: nciRenumberAllSessions,
  preview: nciPreviewSessionNumber,
  display: nciDisplayNumber,
  kind: nciSessionKindMeta
};

function getMicrocycleInfo(patientNickname, date, manualNumber = "") {
  if (!patientNickname || !date) {
    return { number: "-", label: "Selecciona paciente y fecha", manual: false };
  }

  if (manualNumber) {
    return {
      number: Number(manualNumber),
      label: `Micro ${manualNumber} · ${date} · Manual`,
      manual: true
    };
  }

  const microNumber = getComputedMicrocycleNumber(patientNickname, date);

  return {
    number: microNumber,
    label: `Micro ${microNumber} · ${date}`,
    manual: false
  };
}


function sortSessionsByOfficialOrder(list = []) {
  return [...list].sort((a, b) => {
    // En el historial se muestran primero los días más recientes.
    const dateCompare = nciSessionDate(b).localeCompare(nciSessionDate(a));
    if (dateCompare !== 0) return dateCompare;

    // Para un mismo día, cada cliente mantiene su bloque unido.
    const patientCompare = nciSessionPatient(a).localeCompare(nciSessionPatient(b));
    if (patientCompare !== 0) return patientCompare;

    // Historial descendente: el micro y la subsesión más recientes aparecen arriba.
    // Ejemplo visual: 16.1, 15.2, 15.1, 14.1.
    const microCompare = nciSessionMicro(b) - nciSessionMicro(a);
    if (microCompare !== 0) return microCompare;

    const orderA = Number(a.subsessionOrder || a.dayOrder || 1);
    const orderB = Number(b.subsessionOrder || b.dayOrder || 1);
    if (orderA !== orderB) return orderB - orderA;

    const createdCompare = nciSessionCreatedAt(a) - nciSessionCreatedAt(b);
    if (createdCompare !== 0) return createdCompare;

    return String(a.id || "").localeCompare(String(b.id || ""));
  });
}

async function moveSessionWithinSubsessions(sessionId, direction) {
  const session = sessions.find(item => String(item.id) === String(sessionId));
  if (!session || nciIsCompleted(session)) return;
  const group = sessions
    .filter(item => nciSessionPatient(item) === nciSessionPatient(session))
    .filter(item => nciSessionMicro(item) === nciSessionMicro(session))
    .sort((a, b) => nciMicroSequenceOrder(a) - nciMicroSequenceOrder(b) || nciChronologicalCompare(a, b));
  const index = group.findIndex(item => String(item.id) === String(sessionId));
  // El historial es descendente (.3, .2, .1): subir visualmente aumenta la
  // posición oficial; bajar la reduce.
  const target = index - Number(direction || 0);
  if (index < 0 || target < 0 || target >= group.length) return;
  group.forEach((item, idx) => {
    item.microSequenceOrder = idx + 1;
    item.dayOrder = idx + 1;
    item.subsessionOrder = idx + 1;
  });
  const sourceOrder = group[index].microSequenceOrder;
  group[index].microSequenceOrder = group[target].microSequenceOrder;
  group[index].dayOrder = group[index].microSequenceOrder;
  group[index].subsessionOrder = group[index].microSequenceOrder;
  group[target].microSequenceOrder = sourceOrder;
  group[target].dayOrder = sourceOrder;
  group[target].subsessionOrder = sourceOrder;
  const result = nciRenumberPatientSessions(session.patientNickname, { touchUpdatedAt: true, rebuildOrder: false });
  localStorage.setItem("sessions", JSON.stringify(sessions));
  window.PPF_CORE?.emit?.("sessions");
  if (window.PPF_SUPABASE?.pushKey) {
    await window.PPF_SUPABASE.pushKey("sessions");
    if (result.notificationsChanged) await window.PPF_SUPABASE.pushKey("notifications");
  }
  const activeFilter = document.getElementById("sessionsFilter")?.value || "";
  renderSessionList(activeFilter);
  requestAnimationFrame(() => {
    const movedCard = document.querySelector(`[data-session-id="${CSS.escape(String(sessionId))}"]`);
    const swappedCard = document.querySelector(`[data-session-id="${CSS.escape(String(group[target]?.id || ""))}"]`);
    [movedCard, swappedCard].filter(Boolean).forEach(card => {
      card.classList.remove("session-card-reordered");
      void card.offsetWidth;
      card.classList.add("session-card-reordered");
    });
  });
  window.dispatchEvent(new CustomEvent("ppf:sessions-reordered", {
    detail: {
      patientNickname: session.patientNickname,
      microcycle: nciSessionMicro(session)
    }
  }));
}

window.moveSessionWithinSubsessions = moveSessionWithinSubsessions;

function nciSessionMoveState(session = {}) {
  if (!session || nciIsCompleted(session)) return { canMoveUp: false, canMoveDown: false, position: 1, total: 1 };
  const group = sessions
    .filter(item => nciSessionPatient(item) === nciSessionPatient(session))
    .filter(item => nciSessionMicro(item) === nciSessionMicro(session));
  const position = Math.max(1, Number(session.subsessionOrder || session.dayOrder || 1));
  const total = Math.max(1, group.length);
  // El historial es descendente: la subsesión más alta está arriba.
  return {
    canMoveUp: position < total,
    canMoveDown: position > 1,
    position,
    total
  };
}

function renderSessionList(filterNickname = "") {
  normalizeSessionMicrocycles(filterNickname);
  nciRenumberAllSessions({ touchUpdatedAt: true });
  const list = document.getElementById("sessionsList");
  if (!list) return;

  const filterKey = nciNickname(filterNickname);
  const filteredSessions = filterKey
    ? sessions.filter(session => nciSessionPatient(session) === filterKey)
    : sessions;
  const visible = sortSessionsByOfficialOrder(filteredSessions);

  if (visible.length === 0) {
    list.innerHTML = `<p>No hay sesiones creadas todavía.</p>`;
    return;
  }

  function simpleModuleSummary(session, key, title) {
    const exercises = (session.modules?.[key] || [])
      .filter(item => !item.deleted && (item.nombre || item.series || item.repeticiones || item.url));

    return `
      <div class="session-summary-box">
        <strong>${title}</strong>
        <ul>
          ${exercises.length ? exercises.map(item => `
            <li>${item.nombre || "Ejercicio"} · ${item.series || "-"} series · ${item.repeticiones || "-"} reps${key === "activacion" && item.rpe ? ` · RPE ${item.rpe}` : ""}${item.url ? ` · <a href="${item.url}" target="_blank">▶ Ver</a>` : ""}</li>
          `).join("") : "<li>Sin ejercicios escritos</li>"}
        </ul>
      </div>
    `;
  }

  function carreraSummary(session) {
    const series = (session.modules?.carrera || session.carrera || [])
      .filter(item => !item.deleted && (item.nombre || item.series || item.cantidad || item.ritmo || item.rpe || item.fc));

    return `
      <div class="session-summary-box session-running-summary">
        <strong>🏃 Sesiones Carrera</strong>
        <ul>
          ${series.length ? series.map(item => {
            const unitLabel = item.unidad === "min" ? "min" : "m";
            const details = [
              item.series ? `${item.series} series` : "",
              item.cantidad ? `${item.cantidad} ${unitLabel}` : "",
              item.ritmo ? `${item.ritmo} min/km` : "",
              item.rpe ? `RPE ${item.rpe}` : "",
              item.fc ? `FC ${item.fc} ppm` : ""
            ].filter(Boolean).join(" · ");
            return `<li>${item.nombre || "Serie de carrera"}${details ? ` · ${details}` : ""}</li>`;
          }).join("") : "<li>Sin series de carrera escritas</li>"}
        </ul>
      </div>
    `;
  }

  function principalSummary(session) {
    const principal = session.modules?.principal || session.principal;

    if (!principal?.blocks) {
      return `<div class="session-summary-box"><strong>Sesión Principal</strong><ul><li>Sin ejercicios escritos</li></ul></div>`;
    }

    const blocksHtml = ["bloque1", "bloque2", "bloque3", "bloque4"].map((blockKey, index) => {
      const block = principal.blocks[blockKey];
      const exercises = (block?.exercises || []).filter(item => !item.deleted && (item.nombre || item.series || item.repeticiones || item.url));

      if (!block?.notes && exercises.length === 0) return "";

      return `
        <div class="principal-summary-block">
          <strong>Bloque ${index + 1}</strong>
          ${block?.notes ? `<p>${block.notes}</p>` : ""}
          <ul>
            ${exercises.map(item => `
              <li>${item.nombre || "Ejercicio"} · ${item.series || "-"} series · ${item.repeticiones || "-"} reps${item.carga ? ` · ${item.carga} ${item.unidad || "Kg"}` : ""}${item.rpe ? ` · RPE ${item.rpe}` : ""}${item.url ? ` · <a href="${item.url}" target="_blank">▶ Ver</a>` : ""}</li>
            `).join("")}
          </ul>
        </div>
      `;
    }).join("");

    return `<div class="session-summary-box session-principal-summary"><strong>Sesión Principal</strong>${blocksHtml || "<ul><li>Sin ejercicios escritos</li></ul>"}</div>`;
  }

  list.innerHTML = `
    <div class="sessions-bulk-actions">
      <label class="select-all-sessions">
        <input type="checkbox" onchange="toggleAllSessionsSelection(this.checked)" />
        Seleccionar todas
      </label>
      <button class="delete-selected-sessions-btn" type="button" onclick="deleteSelectedSessions()">Eliminar seleccionadas</button>
    </div>
  ` + visible.map(session => {
    const patient = patients.find(p => p.nickname === session.patientNickname);
    const moveState = nciSessionMoveState(session);

    return `
      <article class="session-card session-pro-card" data-session-id="${session.id}">
        <div class="session-card-header">
          <label class="session-check">
            <input class="session-select" type="checkbox" value="${session.id}" />
            <span class="session-badge">${nciSessionKindMeta(session).icon} Sesión ${nciDisplayNumber(session)}</span>
          </label>
          <span class="session-date">${nciSessionKindMeta(session).label} · ${session.microcicloLabel || (`Micro ${session.microciclo} · ${session.fecha}`)}</span>
        </div>
        <div class="session-pro-person session-pro-person-clean">
          <div><h3>${patient ? patient.nombre : session.patientNickname}</h3><p>@${session.patientNickname}</p></div>
          <span class="session-pro-status">${nciSessionKindMeta(session).icon} ${nciSessionKindMeta(session).label}</span>
        </div>
        <div class="session-card-actions">
          <button class="edit-btn" type="button" onclick="editSession('${session.id}')">✏️ Editar sesión</button>
          <div class="session-order-control" role="group" aria-label="Orden de la subsesión">
            <span class="session-order-label">Orden</span>
            <button class="secondary-btn session-order-btn" type="button" onclick="moveSessionWithinSubsessions('${session.id}', -1)" title="Subir sesión en el listado" aria-label="Subir sesión" ${moveState.canMoveUp ? "" : "disabled"}>⬆️ Subir</button>
            <button class="secondary-btn session-order-btn" type="button" onclick="moveSessionWithinSubsessions('${session.id}', 1)" title="Bajar sesión en el listado" aria-label="Bajar sesión" ${moveState.canMoveDown ? "" : "disabled"}>⬇️ Bajar</button>
          </div>
          <button class="secondary-btn copy-session-btn" type="button" onclick="copySessionToClipboard('${session.id}')">📋 Copiar sesión</button>
          <button class="delete-btn" type="button" onclick="deleteSession('${session.id}')">🗑️ Eliminar</button>
        </div>
        <div class="session-summary session-summary-4">
          ${simpleModuleSummary(session, "movilidad", "Movilidad")}
          ${simpleModuleSummary(session, "activacion", "Activación")}
          ${principalSummary(session)}
          ${carreraSummary(session)}
        </div>
      </article>
    `;
  }).join("");
}


function copySessionToClipboard(sessionId) {
  const session = sessions.find(item => String(item.id) === String(sessionId));
  if (!session) {
    alert("No se ha encontrado la sesión para copiar.");
    return;
  }

  const patient = patients.find(item => item.nickname === session.patientNickname);
  const modules = session.modules || {
    movilidad: session.movilidad || [],
    activacion: session.activacion || [],
    principal: session.principal || { blocks: {} }
  };

  const clipboardPayload = {
    sourceId: session.id,
    sourcePatientNickname: session.patientNickname || "",
    sourcePatientName: patient ? patient.nombre : (session.patientNickname || ""),
    sourceNumber: session.numero || "",
    sourceDate: session.fecha || "",
    copiedAt: new Date().toISOString(),
    modules: JSON.parse(JSON.stringify(modules))
  };

  localStorage.setItem("ppfSessionClipboard", JSON.stringify(clipboardPayload));

  alert(`Sesión copiada: ${patient ? patient.nombre : session.patientNickname} · Sesión ${nciDisplayNumber(session)}. Ahora puedes seleccionar otro paciente y pulsar "Pegar sesión copiada".`);
}

window.copySessionToClipboard = copySessionToClipboard;


function bindSessionsForm() {
  const form = document.getElementById("sessionsForm");
  const patientSearch = document.getElementById("sessionPatientSearch");
  const patientHidden = document.getElementById("sessionPatient");
  const sessionNumber = document.getElementById("sessionNumber");
  const microciclo = document.getElementById("sessionMicrocycle");
  const microcicloDate = document.getElementById("sessionMicrocycleDate");
  const microcicloNumber = document.getElementById("sessionMicrocycleNumber");
  const microManualCheck = document.getElementById("sessionMicroManualCheck");
  const microManualSelect = document.getElementById("sessionMicroManualSelect");
  const date = document.getElementById("sessionDate");
  const sessionKind = document.getElementById("sessionKind");
  const filter = document.getElementById("sessionsFilter");
  const kpiClientName = document.getElementById("kpiClientName");
  const kpiClientNickname = document.getElementById("kpiClientNickname");
  const moduleButtons = document.querySelectorAll(".session-module-btn");
  const activeModuleTitle = document.getElementById("activeModuleTitle");
  const activeModuleCount = document.getElementById("activeModuleCount");
  const moduleExercises = document.getElementById("moduleExercises");
  const exerciseTableHead = document.getElementById("exerciseTableHead");
  const saveSessionBtn = document.getElementById("saveSessionBtn");
  const rpeHead = document.getElementById("rpeHead");
  const loadHead = document.getElementById("loadHead");
  const unitHead = document.getElementById("unitHead");
  const principalBlocksNav = document.getElementById("principalBlocksNav");
  const principalBlockNotesWrap = document.getElementById("principalBlockNotesWrap");
  const principalBlockNotes = document.getElementById("principalBlockNotes");
  const principalBlockNotesLabel = document.getElementById("principalBlockNotesLabel");
  const saveCurrentBlockBtn = document.getElementById("saveCurrentBlockBtn");
  const addExerciseBtn = document.getElementById("addExerciseBtn");
  const dynamicExerciseHint = document.getElementById("dynamicExerciseHint");
  const pasteCopiedSessionBtn = document.getElementById("pasteCopiedSessionBtn");
  const loadLastSessionBtn = document.getElementById("loadLastSessionBtn");
  const phase3PreviewBtn = document.getElementById("phase3PreviewBtn");
  const phase3SourcePatient = document.getElementById("phase3SourcePatient");
  const phase3SourceMicro = document.getElementById("phase3SourceMicro");
  const phase3Preview = document.getElementById("phase3Preview");
  const phase3Mapper = document.getElementById("phase3Mapper");
  const phase3ApplyMapBtn = document.getElementById("phase3ApplyMapBtn");
  const phase3DestinationPatient = document.getElementById("phase3DestinationPatient");
  const phase3TargetMicro = document.getElementById("phase3TargetMicro");
  const phase3TargetStartDate = document.getElementById("phase3TargetStartDate");
  const phase3ClonePreview = document.getElementById("phase3ClonePreview");
  const phase3CloneLockedBtn = document.getElementById("phase3CloneLockedBtn");
  const phase3ResetDatesBtn = document.getElementById("phase3ResetDatesBtn");
  const phase3SessionDates = Object.create(null);

  
  if (!form) return;

  // FASE 2.4.2b · Running Library Autocomplete Safe Wiring
  // Refresca únicamente los datalist del Session Builder desde la biblioteca
  // local ya existente. No modifica guardado, Supabase ni la biblioteca.
  function refreshSessionLibraryDatalists() {
    try {
      const storedLibrary = JSON.parse(localStorage.getItem("exerciseLibrary") || "[]");
      if (Array.isArray(storedLibrary) && storedLibrary.length) {
        exerciseLibrary = storedLibrary;
      }
    } catch (_) {}

    const targets = [
      ["libraryMovilidadList", "Movilidad"],
      ["libraryActivacionList", "Activación"],
      ["libraryPrincipalList", "Sesión Principal"],
      ["libraryCarreraList", "Sesiones Carrera"]
    ];

    targets.forEach(([id, category]) => {
      const list = document.getElementById(id);
      if (list) list.innerHTML = libraryOptions(category);
    });
  }

  refreshSessionLibraryDatalists();

  let activeModule = "movilidad";
  let activePrincipalBlock = "bloque1";

  const getMicroManualControls = () => ({
    check: document.getElementById("sessionMicroManualCheck"),
    select: document.getElementById("sessionMicroManualSelect")
  });

  setTimeout(() => {
    const { check, select } = getMicroManualControls();

    if (!check || !select) return;

    select.style.display = check.checked ? "block" : "none";

    check.addEventListener("change", () => {
      select.style.display = check.checked ? "block" : "none";
    });
  }, 0);



  const principalTypes = ["F. ppal. TS", "F. ppal. TI", "Core", "Plyo Extensiva", "Plyo Intensiva", "Lanzamientos", "Mov. Olímpicos", "Tarea de Campo"];

  const principalUnitGroups = [
    { label: "Carga", options: [["Kg", "Kg"], ["%", "%"], ["BW", "BW · Peso corporal"]] },
    { label: "Distancia", options: [["m", "m · Metros"]] },
    { label: "Tiempo", options: [["s", "s · Segundos"], ["min", "min · Minutos"]] },
    { label: "Otras", options: [["rep", "rep · Repeticiones"], ["cal", "cal · Calorías"]] },
    { label: "Velocidad", options: [["m/s", "m/s"]] }
  ];

  function getSuggestedPrincipalUnit(type = "") {
    const normalized = String(type || "").trim();
    if (["F. ppal. TS", "F. ppal. TI", "Mov. Olímpicos"].includes(normalized)) return "Kg";
    if (["Core", "Plyo Extensiva", "Plyo Intensiva", "Lanzamientos"].includes(normalized)) return "rep";
    if (normalized === "Tarea de Campo") return "m";
    return "Kg";
  }

  function renderPrincipalUnitOptions(selected = "Kg") {
    const current = String(selected || "Kg");
    const known = principalUnitGroups.some(group => group.options.some(([value]) => value === current));
    const legacyOption = known ? "" : `<optgroup label="Unidad existente"><option value="${escapeHtml(current)}" selected>${escapeHtml(current)}</option></optgroup>`;
    return legacyOption + principalUnitGroups.map(group => `
      <optgroup label="${group.label}">
        ${group.options.map(([value, label]) => `<option value="${value}" ${current === value ? "selected" : ""}>${label}</option>`).join("")}
      </optgroup>
    `).join("");
  }
  const activationTypes = ["T. Superior", "T. Inferior", "Core", "Pliometría"];
  const mobilityTypes = ["Movilidad", "Est. Estático", "Fascias"];

  const defaultExercise = (tipo = "Movilidad") => ({ nombre: "", series: "", repeticiones: "", carga: "", unidad: "Kg", rpe: "", tipo, url: "", deleted: false });
  const defaultRunSeries = () => ({ nombre: "", series: "", cantidad: "", unidad: "m", ritmo: "", rpe: "", fc: "", deleted: false });
  const DYNAMIC_EXERCISE_LIMIT = 10;
  const defaultPrincipalBlock = () => ({ notes: "", exercises: [defaultExercise("F. ppal. TS")] });

  function hasExerciseContent(item = {}) {
    return !item.deleted && Boolean(
      String(item.nombre || "").trim() ||
      String(item.series || "").trim() ||
      String(item.repeticiones || "").trim() ||
      String(item.carga || "").trim() ||
      String(item.rpe || "").trim() ||
      String(item.url || "").trim()
    );
  }

  function compactExerciseList(list = [], fallbackType = "") {
    const normalized = (Array.isArray(list) ? list : [])
      .filter(item => item && !item.deleted)
      .map(item => normalizeImportedExercise(item, fallbackType));

    let lastContentIndex = -1;
    normalized.forEach((item, index) => {
      if (hasExerciseContent(item)) lastContentIndex = index;
    });

    const compacted = lastContentIndex >= 0 ? normalized.slice(0, lastContentIndex + 1) : [];
    return (compacted.length ? compacted : [defaultExercise(fallbackType)]).slice(0, DYNAMIC_EXERCISE_LIMIT);
  }

  const moduleData = {
    movilidad: [defaultExercise("Movilidad")],
    activacion: [defaultExercise("T. Superior")],
    carrera: [defaultRunSeries()],
    principal: { blocks: { bloque1: defaultPrincipalBlock(), bloque2: defaultPrincipalBlock(), bloque3: defaultPrincipalBlock(), bloque4: defaultPrincipalBlock() } }
  };

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  }

  function getTypeOptions(module) {
    if (module === "principal") return principalTypes;
    if (module === "activacion") return activationTypes;
    return mobilityTypes;
  }

  function currentExerciseList() {
    if (activeModule === "principal") return moduleData.principal.blocks[activePrincipalBlock].exercises;
    return moduleData[activeModule];
  }

  function hasRunSeriesContent(item = {}) {
    return !item.deleted && Boolean(String(item.nombre || "").trim() || String(item.series || "").trim() || String(item.cantidad || "").trim() || String(item.ritmo || "").trim() || String(item.rpe || "").trim() || String(item.fc || "").trim());
  }

  function compactRunSeriesList(list = []) {
    const normalized = (Array.isArray(list) ? list : []).filter(item => item && !item.deleted).map(normalizeImportedRunSeries);
    let lastContentIndex = -1;
    normalized.forEach((item, index) => { if (hasRunSeriesContent(item)) lastContentIndex = index; });
    const compacted = lastContentIndex >= 0 ? normalized.slice(0, lastContentIndex + 1) : [];
    return (compacted.length ? compacted : [defaultRunSeries()]).slice(0, DYNAMIC_EXERCISE_LIMIT);
  }


  function savePrincipalBlockFromDom(blockKey) {
    const prefix = `principal_${blockKey}`;
    const block = moduleData.principal.blocks[blockKey];

    if (!block) return;

    if (activeModule === "principal" && activePrincipalBlock === blockKey && principalBlockNotes) {
      block.notes = principalBlockNotes.value.trim();
    }

    block.exercises = block.exercises.map((item, index) => {
      const num = index + 1;

      if (item.deleted) return item;

      const nameInput = document.getElementById(`${prefix}_nombre_${num}`);
      const seriesInput = document.getElementById(`${prefix}_series_${num}`);
      const repsInput = document.getElementById(`${prefix}_reps_${num}`);
      const cargaInput = document.getElementById(`${prefix}_carga_${num}`);
      const unidadInput = document.getElementById(`${prefix}_unidad_${num}`);
      const rpeInput = document.getElementById(`${prefix}_rpe_${num}`);
      const tipoInput = document.getElementById(`${prefix}_tipo_${num}`);
      const urlInput = document.getElementById(`${prefix}_url_${num}`);

      // Si el bloque no está renderizado en pantalla, conservamos lo que ya había en memoria.
      if (!nameInput && !seriesInput && !repsInput && !urlInput) {
        return item;
      }

      return {
        nombre: nameInput?.value.trim() || "",
        series: seriesInput?.value.trim() || "",
        repeticiones: repsInput?.value.trim() || "",
        carga: cargaInput?.value.trim() || "",
        unidad: unidadInput?.value || "Kg",
        rpe: rpeInput?.value.trim() || "",
        tipo: tipoInput?.value || "F. ppal. TS",
        url: urlInput?.value.trim() || "",
        deleted: false
      };
    });
  }

  function saveAllVisiblePrincipalBlocksToMemory() {
    ["bloque1", "bloque2", "bloque3", "bloque4"].forEach(savePrincipalBlockFromDom);
  }

  function saveActiveModuleToMemory() {
    if (activeModule === "principal") {
      savePrincipalBlockFromDom(activePrincipalBlock);
      return;
    }

    const prefix = activeModule;
    const list = currentExerciseList();

    if (activeModule === "carrera") {
      list.forEach((item, index) => {
        const num = index + 1;
        if (item.deleted) return;
        const nombre = document.getElementById(`carrera_nombre_${num}`);
        if (!nombre) return;
        list[index] = {
          nombre: nombre.value.trim(),
          series: document.getElementById(`carrera_series_${num}`)?.value.trim() || "",
          cantidad: document.getElementById(`carrera_cantidad_${num}`)?.value.trim() || "",
          unidad: document.getElementById(`carrera_unidad_${num}`)?.value || "m",
          ritmo: document.getElementById(`carrera_ritmo_${num}`)?.value.trim() || "",
          rpe: document.getElementById(`carrera_rpe_${num}`)?.value.trim() || "",
          fc: document.getElementById(`carrera_fc_${num}`)?.value.trim() || "",
          deleted: false
        };
      });
      return;
    }

    list.forEach((item, index) => {
      const num = index + 1;
      if (item.deleted) return;

      const nameInput = document.getElementById(`${prefix}_nombre_${num}`);
      const seriesInput = document.getElementById(`${prefix}_series_${num}`);
      const repsInput = document.getElementById(`${prefix}_reps_${num}`);
      const cargaInput = document.getElementById(`${prefix}_carga_${num}`);
      const unidadInput = document.getElementById(`${prefix}_unidad_${num}`);
      const rpeInput = document.getElementById(`${prefix}_rpe_${num}`);
      const tipoInput = document.getElementById(`${prefix}_tipo_${num}`);
      const urlInput = document.getElementById(`${prefix}_url_${num}`);

      const isRendered = nameInput || seriesInput || repsInput || cargaInput || unidadInput || rpeInput || tipoInput || urlInput;

      if (!isRendered) {
        list[index] = { ...item };
        return;
      }

      list[index] = {
        nombre: nameInput?.value.trim() || "",
        series: seriesInput?.value.trim() || "",
        repeticiones: repsInput?.value.trim() || "",
        carga: cargaInput?.value.trim() || "",
        unidad: unidadInput?.value || item.unidad || "Kg",
        rpe: rpeInput?.value.trim() || "",
        tipo: tipoInput?.value || getTypeOptions(activeModule)[0],
        url: urlInput?.value.trim() || "",
        deleted: false
      };
    });
  }

  function runSeriesRow(number, item) {
    if (item.deleted) return "";
    return `
      <div class="exercise-row running-series-row">
        <button class="remove-exercise-btn" type="button" data-remove-number="${number}">✕ Eliminar</button>
        <div><label>Serie ${number} · Ejercicio</label><input id="carrera_nombre_${number}" type="text" list="libraryCarreraList" autocomplete="off" placeholder="Ej: Intervalo / Rodaje / Recuperación" value="${escapeHtml(item.nombre || "")}" data-running-exercise-name="carrera_${number}" /></div>
        <div><label>Nº series</label><input id="carrera_series_${number}" type="number" min="1" placeholder="Ej: 4" value="${escapeHtml(item.series || "")}" /></div>
        <div><label>Cantidad</label><input id="carrera_cantidad_${number}" type="number" min="0" step="0.01" placeholder="Ej: 1000" value="${escapeHtml(item.cantidad || "")}" /></div>
        <div><label>Unidad</label><select id="carrera_unidad_${number}"><option value="m" ${item.unidad === "m" ? "selected" : ""}>m · Metros</option><option value="min" ${item.unidad === "min" ? "selected" : ""}>min · Minutos</option></select></div>
        <div><label>min/km</label><input id="carrera_ritmo_${number}" type="text" inputmode="numeric" placeholder="Ej: 4:15" value="${escapeHtml(item.ritmo || "")}" /></div>
        <div><label>RPE</label><input id="carrera_rpe_${number}" type="number" min="0" max="10" step="0.5" placeholder="Ej: 7" value="${escapeHtml(item.rpe || "")}" /></div>
        <div><label>FC</label><input id="carrera_fc_${number}" type="number" min="0" max="250" placeholder="ppm" value="${escapeHtml(item.fc || "")}" /></div>
      </div>`;
  }

  function exerciseRow(module, number, item, prefix) {
    if (item.deleted) return "";

    const showRpe = module === "activacion" || module === "principal";
    const typeSelect = getTypeOptions(module).map(option => `<option value="${option}" ${item.tipo === option ? "selected" : ""}>${option}</option>`).join("");

    return `
      <div class="exercise-row ${showRpe ? "exercise-row-rpe" : ""}">
        <button class="remove-exercise-btn" type="button" data-remove-number="${number}">✕ Eliminar</button>
        <div><label>Ejercicio ${number}</label><input id="${prefix}_nombre_${number}" type="text" list="${module === "principal" ? "libraryPrincipalList" : module === "activacion" ? "libraryActivacionList" : "libraryMovilidadList"}" placeholder="Ejercicio ${number}" value="${escapeHtml(item.nombre)}" data-exercise-name="${prefix}_${number}" /></div>
        <div><label>Nº series</label><input id="${prefix}_series_${number}" type="number" min="0" placeholder="Ej: 3" value="${escapeHtml(item.series)}" /></div>
        <div><label>Repeticiones</label><input id="${prefix}_reps_${number}" type="text" placeholder="Ej: 10 / 30''" value="${escapeHtml(item.repeticiones)}" /></div>
        ${module === "principal" ? `
          <div><label>Carga</label><input id="${prefix}_carga_${number}" type="number" step="0.01" placeholder="Ej: 120" value="${escapeHtml(item.carga || "")}" /></div>
          <div>
            <label>Unidad</label>
            <select id="${prefix}_unidad_${number}" data-principal-unit>
              ${renderPrincipalUnitOptions(item.unidad || "Kg")}
            </select>
          </div>
        ` : ""}
        ${showRpe ? `<div><label>RPE</label><input id="${prefix}_rpe_${number}" type="number" min="0" max="10" step="0.5" placeholder="Ej: 8" value="${escapeHtml(item.rpe || "")}" /></div>` : ""}
        <div><label>Tipo</label><select id="${prefix}_tipo_${number}">${typeSelect}</select></div>
        <div>
          <label>URL</label>
          <div class="url-field">
            <input id="${prefix}_url_${number}" type="url" placeholder="https://..." value="${libraryEscapeHtml(item.url)}" />
            <button class="url-search-btn" type="button" data-url-search="${prefix}_nombre_${number}">Buscar</button>
            <button class="url-play-btn" type="button" data-url-play="${prefix}_url_${number}">▶</button>
          </div>
        </div>
      </div>
    `;
  }

  function bindPanelButtons() {
    document.querySelectorAll("[data-remove-number]").forEach(button => {
      button.addEventListener("click", () => {
        saveActiveModuleToMemory();
        const index = Number(button.dataset.removeNumber) - 1;
        const list = currentExerciseList();
        if (list.length <= 1) {
          const fallback = activeModule === "principal" ? "F. ppal. TS" : activeModule === "activacion" ? "T. Superior" : "Movilidad";
          list[0] = defaultExercise(fallback);
        } else {
          list.splice(index, 1);
        }
        renderModule(activeModule);
      });
    });

    document.querySelectorAll("[data-url-search]").forEach(button => {
      button.addEventListener("click", () => {
        const exerciseInput = document.getElementById(button.dataset.urlSearch);
        const query = exerciseInput?.value.trim() || "ejercicio técnica";
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query + " ejercicio técnica vídeo")}`, "_blank");
      });
    });

    document.querySelectorAll("[data-url-play]").forEach(button => {
      button.addEventListener("click", () => {
        const urlInput = document.getElementById(button.dataset.urlPlay);
        const url = urlInput?.value.trim();
        if (!url) return alert("Pega primero una URL para poder abrir el vídeo.");
        window.open(url, "_blank");
      });
    });

    document.querySelectorAll("[data-exercise-name]").forEach(input => {
      input.addEventListener("change", () => {
        const category = activeModule === "principal" ? "Sesión Principal" : activeModule === "activacion" ? "Activación" : "Movilidad";
        const libraryExercise = findLibraryExercise(input.value.trim(), category);
        if (!libraryExercise) return;

        const parts = input.dataset.exerciseName.split("_");
        const number = parts[parts.length - 1];
        const prefix = parts.slice(0, -1).join("_");

        const urlInput = document.getElementById(`${prefix}_url_${number}`);
        const typeSelect = document.getElementById(`${prefix}_tipo_${number}`);

        if (urlInput && libraryExercise.url && !urlInput.value.trim()) {
          urlInput.value = libraryExercise.url;
        }

        if (typeSelect && libraryExercise.type) {
          const option = [...typeSelect.options].find(opt => opt.value === libraryExercise.type);
          if (option) {
            typeSelect.value = libraryExercise.type;
            typeSelect.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }
      });
    });

    document.querySelectorAll('select[id*="_tipo_"]').forEach(typeSelect => {
      if (!typeSelect.id.startsWith("principal_")) return;
      typeSelect.addEventListener("change", () => {
        const unitSelect = document.getElementById(typeSelect.id.replace("_tipo_", "_unidad_"));
        if (!unitSelect) return;
        unitSelect.value = getSuggestedPrincipalUnit(typeSelect.value);
      });
    });
  }

  function renderModule(module) {
    refreshSessionLibraryDatalists();
    activeModule = module;

    const isPrincipal = module === "principal";
    const isRunning = module === "carrera";
    if (principalBlocksNav) principalBlocksNav.style.display = isPrincipal ? "grid" : "none";
    if (principalBlockNotesWrap) principalBlockNotesWrap.style.display = isPrincipal ? "grid" : "none";
    if (loadHead) loadHead.style.display = isPrincipal ? "block" : "none";
    if (unitHead) unitHead.style.display = isPrincipal ? "block" : "none";
    if (rpeHead) rpeHead.style.display = (module === "activacion" || isPrincipal) ? "block" : "none";
    if (exerciseTableHead) exerciseTableHead.style.display = isRunning ? "none" : "grid";

    const title = isPrincipal ? `Sesión Principal · ${activePrincipalBlock.replace("bloque", "Bloque ")}` : (module === "activacion" ? "Activación" : module === "carrera" ? "Sesiones Carrera" : "Movilidad");
    activeModuleTitle.textContent = title;

    if (isPrincipal) {
      principalBlockNotesLabel.textContent = `Objetivo / Observaciones · ${activePrincipalBlock.replace("bloque", "Bloque ")}`;
      principalBlockNotes.value = moduleData.principal.blocks[activePrincipalBlock].notes || "";
    }

    const prefix = isPrincipal ? `principal_${activePrincipalBlock}` : module;
    const list = currentExerciseList();

    const visibleCount = list.filter(item => !item.deleted).length;
    activeModuleCount.textContent = `${visibleCount} ${isRunning ? (visibleCount === 1 ? "serie" : "series") : (visibleCount === 1 ? "ejercicio" : "ejercicios")}`;

    moduleExercises.innerHTML = list.map((item, index) => isRunning ? runSeriesRow(index + 1, item) : exerciseRow(module, index + 1, item, prefix)).join("");
    if (addExerciseBtn) {
      addExerciseBtn.disabled = visibleCount >= DYNAMIC_EXERCISE_LIMIT;
      addExerciseBtn.textContent = visibleCount >= DYNAMIC_EXERCISE_LIMIT ? (isRunning ? "Máximo de 10 series alcanzado" : "Máximo de 10 ejercicios alcanzado") : (isRunning ? "＋ Añadir serie" : "＋ Añadir ejercicio");
    }
    if (dynamicExerciseHint) {
      dynamicExerciseHint.textContent = `${visibleCount}/${DYNAMIC_EXERCISE_LIMIT} · ${isRunning ? "Añade solo las series que necesitas." : "Solo se muestran los ejercicios que necesitas."}`;
    }

    moduleButtons.forEach(button => button.classList.toggle("active", button.dataset.module === module));
    document.querySelectorAll(".principal-block-btn").forEach(button => button.classList.toggle("active", button.dataset.principalBlock === activePrincipalBlock));

    bindPanelButtons();
  }

  function refreshSessionInfo() {
    const patientNickname = patientHidden.value;
    const patient = patients.find(item => item.nickname === patientNickname);

    updateSelectedSessionPatientCard();
    kpiClientName.textContent = patient ? patient.nombre : "-";
    kpiClientNickname.textContent = patient ? `@${patient.nickname}` : "-";
    const existingSession = editingSessionId ? sessions.find(item => String(item.id) === String(editingSessionId)) : null;
    const microManualActive = Boolean(microManualCheck && microManualCheck.checked);
    const manualMicro = Number(String(microManualSelect?.value || "").replace(/\D/g, ""));
    const microInfo = existingSession
      ? { number: microManualActive && manualMicro ? manualMicro : (existingSession.microciclo || "-") }
      : getMicrocycleInfo(patientNickname, date.value, microManualActive && manualMicro ? manualMicro : "");
    sessionNumber.textContent = nciPreviewSessionNumber(patientNickname, date.value, microInfo.number, editingSessionId);

    if (microInfo.number === "-") {
      microciclo.textContent = "-";
      microcicloDate.textContent = "Selecciona cliente y fecha";
      microcicloNumber.value = "";
    } else {
      microciclo.textContent = `Micro ${microInfo.number}`;
      microcicloDate.textContent = date.value;
      microcicloNumber.value = microInfo.number;
    }
  }


  function updateSelectedSessionPatientCard() {
    const card = document.getElementById("selectedSessionPatientCard");
    if (!card) return;

    const patient = patients.find(item => item.nickname === patientHidden.value);

    if (!patient) {
      card.innerHTML = `
        <div class="session-selected-avatar">?</div>
        <div>
          <strong>Selecciona cliente</strong>
          <span>Foto del paciente</span>
        </div>
      `;
      return;
    }

    card.innerHTML = `
      ${getPatientPhotoSafe(patient) ? `<img src="${getPatientPhotoSafe(patient)}" alt="${patient.nombre}">` : `<div class="session-selected-avatar">${patient.nombre.charAt(0).toUpperCase()}</div>`}
      <div>
        <strong>${patient.nombre}</strong>
        <span>@${patient.nickname}</span>
      </div>
    `;
  }

  function resetSessionForm() {
    if (sessionKind) sessionKind.value = "gym";
    form.reset();
    moduleData.movilidad = [defaultExercise("Movilidad")];
    moduleData.activacion = [defaultExercise("T. Superior")];
    moduleData.carrera = [defaultRunSeries()];
    moduleData.principal.blocks = { bloque1: defaultPrincipalBlock(), bloque2: defaultPrincipalBlock(), bloque3: defaultPrincipalBlock(), bloque4: defaultPrincipalBlock() };
    editingSessionId = null;
    saveSessionBtn.textContent = "Guardar sesión";
    delete saveSessionBtn.dataset.editing;
    setTodayIfEmpty("sessionDate");
    patientHidden.value = "";
    activePrincipalBlock = "bloque1";
    renderModule("movilidad");
    refreshSessionInfo();
  }

  setTodayIfEmpty("sessionDate");
  if (Number(localStorage.getItem("ppfNciVersion") || 0) < PPF_NCI_VERSION) {
    const migration = nciRenumberAllSessions({ touchUpdatedAt: true, rebuildOrder: true });
    localStorage.setItem("ppfNciVersion", String(PPF_NCI_VERSION));
    if (migration.changed && window.PPF_SUPABASE?.pushKey) {
      window.PPF_SUPABASE.pushKey("sessions").catch(error => console.warn("No se pudo sincronizar la migración NCI:", error));
    }
    if (migration.notificationsChanged && window.PPF_SUPABASE?.pushKey) {
      window.PPF_SUPABASE.pushKey("notifications").catch(error => console.warn("No se pudieron sincronizar las notificaciones NCI:", error));
    }
  }
  renderModule("movilidad");
  refreshSessionInfo();
  renderSessionList();

  moduleButtons.forEach(button => button.addEventListener("click", () => {
    saveActiveModuleToMemory();
    const nextModule = button.dataset.module;
    if (sessionKind && nextModule === "carrera") sessionKind.value = "running";
    renderModule(nextModule);
  }));

  document.querySelectorAll(".principal-block-btn").forEach(button => button.addEventListener("click", () => {
    saveActiveModuleToMemory();
    activePrincipalBlock = button.dataset.principalBlock;
    renderModule("principal");
  }));

  if (addExerciseBtn) {
    addExerciseBtn.addEventListener("click", () => {
      saveActiveModuleToMemory();
      const list = currentExerciseList();
      if (list.filter(item => !item.deleted).length >= DYNAMIC_EXERCISE_LIMIT) return;
      const fallback = activeModule === "principal" ? "F. ppal. TS" : activeModule === "activacion" ? "T. Superior" : "Movilidad";
      list.push(activeModule === "carrera" ? defaultRunSeries() : defaultExercise(fallback));
      renderModule(activeModule);
      requestAnimationFrame(() => {
        const prefix = activeModule === "principal" ? `principal_${activePrincipalBlock}` : activeModule;
        document.getElementById(`${prefix}_nombre_${list.length}`)?.focus();
      });
    });
  }

  if (saveCurrentBlockBtn) {
    saveCurrentBlockBtn.addEventListener("click", () => {
      saveActiveModuleToMemory();
      alert("Bloque guardado en memoria. Recuerda pulsar Guardar sesión para guardar la sesión completa.");
    });
  }

  date.addEventListener("change", refreshSessionInfo);
  if (microManualCheck) microManualCheck.addEventListener("change", refreshSessionInfo);
  if (microManualSelect) microManualSelect.addEventListener("change", refreshSessionInfo);
  filter.addEventListener("change", () => renderSessionList(filter.value));

  patientSearch.addEventListener("change", () => {
    const patient = patients.find(item => item.nickname === patientSearch.value) || getSelectedPatientBySearch(patientSearch.value.trim());
    patientHidden.value = patient ? patient.nickname : "";
    refreshSessionInfo();
    if (phase3SourcePatient && !phase3SourcePatient.value && patientHidden.value) {
      phase3SourcePatient.value = patientHidden.value;
      phase3RefreshMicroOptions({ preserve: false });
    }
    phase3ResetSessionDates();
    phase3RefreshDestinationPlanDefaults();
    phase3RenderClonePreview();
  });

  // FASE 3.1.1 · Origin/Destination UX + Real Content Counter (READ ONLY)
  // El origen del micro es independiente del deportista destino del formulario habitual.
  // Solo inspecciona sesiones guardadas: no escribe, copia ni transforma datos todavía.
  function phase3SessionModules(session = {}) {
    return session.modules || {
      movilidad: session.movilidad || [],
      activacion: session.activacion || [],
      principal: session.principal || { blocks: {} },
      carrera: session.carrera || session.running || []
    };
  }

  function phase3CountExerciseList(list = []) {
    return (Array.isArray(list) ? list : []).filter(item => item && hasExerciseContent(item)).length;
  }

  function phase3CountRunningList(list = []) {
    return (Array.isArray(list) ? list : []).filter(item => item && hasRunSeriesContent(item)).length;
  }

  function phase3CountPrincipal(value = {}) {
    if (!value) return 0;
    if (Array.isArray(value)) return phase3CountExerciseList(value);
    if (Array.isArray(value.exercises)) return phase3CountExerciseList(value.exercises);
    const blocks = value.blocks && typeof value.blocks === "object" ? value.blocks : value;
    return Object.values(blocks || {}).reduce((sum, block) => {
      if (!block) return sum;
      if (Array.isArray(block)) return sum + phase3CountExerciseList(block);
      if (Array.isArray(block.exercises)) return sum + phase3CountExerciseList(block.exercises);
      return sum;
    }, 0);
  }

  function phase3SourceNickname() {
    return phase3SourcePatient?.value || "";
  }

  function phase3RefreshSourcePatients() {
    if (!phase3SourcePatient) return;
    const current = phase3SourcePatient.value;
    phase3SourcePatient.innerHTML = `<option value="">Selecciona deportista origen</option>${patients.map(patient => `<option value="${escapeHtml(patient.nickname)}">${escapeHtml(patient.nombre || patient.nickname)}</option>`).join("")}`;
    if (patients.some(patient => patient.nickname === current)) {
      phase3SourcePatient.value = current;
    } else if (!current && patientHidden?.value && patients.some(patient => patient.nickname === patientHidden.value)) {
      // Comodidad inicial: si ya hay destino seleccionado, lo proponemos también como origen,
      // pero desde aquí ambos selectores quedan completamente independientes.
      phase3SourcePatient.value = patientHidden.value;
    }
  }

  function phase3MicrosForSource() {
    const nickname = phase3SourceNickname();
    if (!nickname) return [];
    return [...new Set(sessions
      .filter(item => item.patientNickname === nickname)
      .map(item => nciSessionMicro(item))
      .filter(Boolean))].sort((a,b) => b-a);
  }

  function phase3RefreshMicroOptions({ preserve = true } = {}) {
    if (!phase3SourceMicro) return;
    const micros = phase3MicrosForSource();
    const current = preserve ? phase3SourceMicro.value : "";
    phase3SourceMicro.innerHTML = `<option value="">Selecciona micro origen</option>${micros.map(m => `<option value="${m}">Micro ${m}</option>`).join("")}`;
    if (micros.map(String).includes(String(current))) phase3SourceMicro.value = current;
  }

  const PHASE3_BLOCKS = [
    { key: "movilidad", icon: "🧘", label: "Movilidad" },
    { key: "activacion", icon: "⚡", label: "Activación" },
    { key: "principal", icon: "🏋️", label: "Sesión Principal" },
    { key: "carrera", icon: "🏃", label: "Sesiones Carrera" }
  ];
  const phase3GlobalMap = { movilidad:"movilidad", activacion:"activacion", principal:"principal", carrera:"carrera" };
  let phase3SessionMaps = {};

  function phase3SourceSessions() {
    const nickname = phase3SourceNickname();
    const micro = Number(phase3SourceMicro?.value || 0);
    if (!nickname || !micro) return [];
    return sessions.filter(item => item.patientNickname === nickname && nciSessionMicro(item) === micro)
      .sort((a,b) => nciMicroSequenceOrder(a)-nciMicroSequenceOrder(b) || nciChronologicalCompare(a,b));
  }

  function phase3BlockCount(session, key) {
    const mods = phase3SessionModules(session);
    if (key === "principal") return phase3CountPrincipal(mods.principal);
    if (key === "carrera") return phase3CountRunningList(mods.carrera);
    return phase3CountExerciseList(mods[key]);
  }

  function phase3MapOptions(selected) {
    const opts = PHASE3_BLOCKS.map(block => `<option value="${block.key}" ${selected===block.key?'selected':''}>${block.icon} ${block.label}</option>`).join("");
    return `${opts}<option value="skip" ${selected==='skip'?'selected':''}>🚫 No copiar</option>`;
  }

  function phase3SessionMapKey(session, index) {
    return String(session.id || session.sessionId || `${nciDisplayNumber(session)}_${session.fecha || index}`);
  }

  function phase3RenderMapper() {
    if (!phase3Mapper) return;
    const source = phase3SourceSessions();
    if (!source.length) {
      phase3Mapper.innerHTML = `<div class="phase3-empty">Selecciona un micro origen para activar el Block Mapper.</div>`;
      return;
    }
    const rows = source.map((session, index) => {
      const skey = phase3SessionMapKey(session,index);
      if (!phase3SessionMaps[skey]) phase3SessionMaps[skey] = {...phase3GlobalMap};
      const present = PHASE3_BLOCKS.filter(block => phase3BlockCount(session, block.key) > 0);
      return `<article class="phase3-map-session" data-map-session="${escapeHtml(skey)}">
        <div class="phase3-map-session-head"><strong>Sesión ${nciDisplayNumber(session)}</strong><small>${session.fecha || 'Sin fecha'}</small></div>
        <div class="phase3-map-lines">${present.length ? present.map(block => {
          const count=phase3BlockCount(session,block.key), selected=phase3SessionMaps[skey][block.key] || block.key;
          return `<label class="phase3-map-line"><span>${block.icon} ${block.label} <b>${count}</b></span><i>→</i><select data-map-source="${block.key}">${phase3MapOptions(selected)}</select></label>`;
        }).join('') : '<span class="phase3-map-empty">Sin bloques con contenido real</span>'}</div>
      </article>`;
    }).join('');
    phase3Mapper.innerHTML = `<div class="phase3-map-summary"><span>🧭 <b>Mapa preparado</b> · ${source.length} ${source.length===1?'sesión':'sesiones'}</span><small>Cada sesión puede ajustarse de forma independiente. 🚫 excluye el bloque de la futura copia.</small></div>${rows}<div class="phase3-readonly">🛡️ Simulación segura · El Block Mapper todavía no guarda ni clona sesiones.</div>`;
    phase3Mapper.querySelectorAll('[data-map-session]').forEach(card => {
      const skey=card.dataset.mapSession;
      card.querySelectorAll('select[data-map-source]').forEach(select => select.addEventListener('change',()=>{
        phase3SessionMaps[skey] = phase3SessionMaps[skey] || {...phase3GlobalMap};
        phase3SessionMaps[skey][select.dataset.mapSource]=select.value;
        phase3RenderClonePreview();
      }));
    });
  }

  function phase3ApplyGlobalMap() {
    const source=phase3SourceSessions();
    source.forEach((session,index)=>{ phase3SessionMaps[phase3SessionMapKey(session,index)]={...phase3GlobalMap}; });
    phase3RenderMapper();
    phase3RenderClonePreview();
  }

  function phase3RenderPreview() {
    if (!phase3Preview) return;
    phase3SessionMaps = {};
    const nickname = phase3SourceNickname();
    const micro = Number(phase3SourceMicro?.value || 0);
    if (!nickname || !micro) {
      phase3Preview.innerHTML = `<div class="phase3-empty">Selecciona deportista origen y microciclo para preparar la vista previa.</div>`;
      phase3RenderMapper();
      return;
    }
    const source = sessions.filter(item => item.patientNickname === nickname && nciSessionMicro(item) === micro)
      .sort((a,b) => nciMicroSequenceOrder(a)-nciMicroSequenceOrder(b) || nciChronologicalCompare(a,b));
    if (!source.length) {
      phase3Preview.innerHTML = `<div class="phase3-empty">No hay sesiones guardadas en el Micro ${micro}.</div>`;
      phase3RenderMapper();
      return;
    }
    const patient = patients.find(item => item.nickname === nickname);
    const cards = source.map(session => {
      const mods = phase3SessionModules(session);
      const counts = [
        ["🧘","Movilidad",phase3CountExerciseList(mods.movilidad)],
        ["⚡","Activación",phase3CountExerciseList(mods.activacion)],
        ["🏋️","Principal",phase3CountPrincipal(mods.principal)],
        ["🏃","Carrera",phase3CountRunningList(mods.carrera)]
      ].filter(x => x[2] > 0);
      return `<article class="phase3-session-card">
        <div><strong>Sesión ${nciDisplayNumber(session)}</strong><small>${session.fecha || "Sin fecha"} · ${nciSessionKindMeta(session).label}</small></div>
        <div class="phase3-blocks">${counts.length ? counts.map(([i,l,c]) => `<span>${i} ${l} <b>${c}</b></span>`).join("") : `<span>Sin bloques con contenido real</span>`}</div>
      </article>`;
    }).join("");
    phase3Preview.innerHTML = `<div class="phase3-preview-head"><div><small>MICRO ORIGEN</small><strong>${patient?.nombre || nickname} · Micro ${micro}</strong></div><b>${source.length} ${source.length===1?'sesión':'sesiones'}</b></div>${cards}<div class="phase3-readonly">🔒 Vista previa de solo lectura · Los contadores muestran únicamente ejercicios/series realmente escritos.</div>`;
    phase3RenderMapper();
  }


  // FASE 3.3 · CLONE PREVIEW / DESTINATION PLAN
  // Esta capa transforma el mapa en un PLAN VISUAL. No persiste ni modifica sesiones.
  function phase3RealExercises(list = []) {
    return (Array.isArray(list) ? list : []).filter(item => item && hasExerciseContent(item));
  }

  function phase3RealRunning(list = []) {
    return (Array.isArray(list) ? list : []).filter(item => item && hasRunSeriesContent(item));
  }

  function phase3PrincipalExercises(value = {}) {
    if (!value) return [];
    if (Array.isArray(value)) return phase3RealExercises(value);
    if (Array.isArray(value.exercises)) return phase3RealExercises(value.exercises);
    const blocks = value.blocks && typeof value.blocks === "object" ? value.blocks : value;
    const result = [];
    Object.entries(blocks || {}).forEach(([blockKey, block]) => {
      if (!block) return;
      const exercises = Array.isArray(block) ? block : (Array.isArray(block.exercises) ? block.exercises : []);
      phase3RealExercises(exercises).forEach(item => result.push({ ...item, __phase3PrincipalBlock: blockKey }));
    });
    return result;
  }

  function phase3SourceBlockItems(session, key) {
    const mods = phase3SessionModules(session);
    if (key === "principal") return phase3PrincipalExercises(mods.principal);
    if (key === "carrera") return phase3RealRunning(mods.carrera);
    return phase3RealExercises(mods[key]);
  }

  function phase3TargetPatient() {
    const nickname = patientHidden?.value || "";
    return patients.find(item => item.nickname === nickname) || null;
  }

  function phase3TargetExistingMicros() {
    const nickname = patientHidden?.value || "";
    if (!nickname) return [];
    return [...new Set(sessions
      .filter(item => item.patientNickname === nickname)
      .map(item => nciSessionMicro(item))
      .filter(Boolean))].sort((a,b)=>a-b);
  }

  function phase3SuggestTargetMicro() {
    const used = phase3TargetExistingMicros();
    if (!used.length) return 1;
    for (let candidate = Math.max(...used) + 1; candidate <= 52; candidate++) {
      if (!used.includes(candidate)) return candidate;
    }
    for (let candidate = 1; candidate <= 52; candidate++) {
      if (!used.includes(candidate)) return candidate;
    }
    return "";
  }

  function phase3RefreshDestinationPlanDefaults({ forceMicro = false } = {}) {
    if (phase3DestinationPatient) {
      const patient = phase3TargetPatient();
      phase3DestinationPatient.innerHTML = patient
        ? `<strong>${escapeHtml(patient.nombre || patient.nickname)}</strong><small>@${escapeHtml(patient.nickname)}</small>`
        : `Selecciona el deportista destino arriba.`;
      phase3DestinationPatient.classList.toggle("has-patient", Boolean(patient));
    }

    if (phase3TargetMicro && (forceMicro || !phase3TargetMicro.value)) {
      const suggested = phase3SuggestTargetMicro();
      if (suggested) phase3TargetMicro.value = String(suggested);
    }

    if (phase3TargetStartDate && !phase3TargetStartDate.value) {
      phase3TargetStartDate.value = phase3MondayOfWeek(date?.value || "") || "";
    } else {
      phase3NormalizeWeekBase();
    }
  }

  function phase3ParseDate(value) {
    const text = String(value || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
    const parsed = new Date(`${text}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function phase3FormatDate(parsed) {
    if (!parsed || Number.isNaN(parsed.getTime())) return "";
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth()+1).padStart(2,"0");
    const d = String(parsed.getDate()).padStart(2,"0");
    return `${y}-${m}-${d}`;
  }

  function phase3DateAddDays(value, days) {
    const parsed = phase3ParseDate(value);
    if (!parsed) return "";
    parsed.setDate(parsed.getDate() + Number(days || 0));
    return phase3FormatDate(parsed);
  }

  function phase3MondayOfWeek(value) {
    const parsed = phase3ParseDate(value);
    if (!parsed) return "";
    const day = parsed.getDay(); // 0 domingo, 1 lunes...
    const diff = day === 0 ? -6 : 1 - day;
    parsed.setDate(parsed.getDate() + diff);
    return phase3FormatDate(parsed);
  }

  function phase3SundayOfWeek(value) {
    const monday = phase3MondayOfWeek(value);
    return monday ? phase3DateAddDays(monday, 6) : "";
  }

  function phase3SourceWeekdayOffset(session) {
    const parsed = phase3ParseDate(session?.fecha);
    if (!parsed) return 0;
    const day = parsed.getDay();
    return day === 0 ? 6 : day - 1;
  }

  function phase3AutoTargetDate(session) {
    const monday = phase3MondayOfWeek(phase3TargetStartDate?.value || "");
    if (!monday) return "";
    return phase3DateAddDays(monday, phase3SourceWeekdayOffset(session));
  }

  function phase3ResetSessionDates() {
    Object.keys(phase3SessionDates).forEach(key => delete phase3SessionDates[key]);
  }

  function phase3NormalizeWeekBase() {
    if (!phase3TargetStartDate?.value) return;
    const monday = phase3MondayOfWeek(phase3TargetStartDate.value);
    if (monday && monday !== phase3TargetStartDate.value) {
      phase3TargetStartDate.value = monday;
    }
  }

  function phase3ExistingSessionsOnDate(targetPatient, targetDate, sourceMicro, sourcePatient) {
    if (!targetPatient || !targetDate) return [];
    return sessions.filter(item => {
      if (item.patientNickname !== targetPatient.nickname) return false;
      if (String(item.fecha || "") !== String(targetDate)) return false;
      // Si estamos previsualizando sobre el mismo deportista, ignoramos el propio micro origen
      // porque esta fase nunca lo modifica.
      if (sourcePatient && targetPatient.nickname === sourcePatient.nickname && nciSessionMicro(item) === sourceMicro) return false;
      return true;
    });
  }

  function phase3ItemLabel(item, isRunning = false) {
    const name = String(item?.nombre || "").trim() || (isRunning ? "Serie de carrera" : "Ejercicio");
    if (isRunning) {
      const detail = [
        item?.series ? `${item.series} series` : "",
        item?.cantidad ? `${item.cantidad} ${item.unidad || ""}`.trim() : "",
        item?.ritmo ? `${item.ritmo} min/km` : "",
        item?.rpe ? `RPE ${item.rpe}` : "",
        item?.fc ? `FC ${item.fc}` : ""
      ].filter(Boolean).join(" · ");
      return detail ? `${name} · ${detail}` : name;
    }
    const detail = [
      item?.series ? `${item.series} series` : "",
      item?.repeticiones ? `${item.repeticiones} reps` : "",
      item?.carga ? `${item.carga} ${item.unidad || ""}`.trim() : "",
      item?.rpe ? `RPE ${item.rpe}` : ""
    ].filter(Boolean).join(" · ");
    return detail ? `${name} · ${detail}` : name;
  }

  function phase3BuildDestinationSession(sourceSession, index, sourceSessions) {
    const skey = phase3SessionMapKey(sourceSession,index);
    const mapping = phase3SessionMaps[skey] || {...phase3GlobalMap};
    const buckets = { movilidad: [], activacion: [], principal: [], carrera: [] };
    const provenance = { movilidad: [], activacion: [], principal: [], carrera: [] };
    const excluded = [];
    const conflicts = [];

    PHASE3_BLOCKS.forEach(sourceBlock => {
      const items = phase3SourceBlockItems(sourceSession, sourceBlock.key);
      if (!items.length) return;
      const target = mapping[sourceBlock.key] || sourceBlock.key;

      if (target === "skip") {
        excluded.push({ source: sourceBlock, count: items.length });
        return;
      }

      const runningMismatch = (sourceBlock.key === "carrera") !== (target === "carrera");
      if (runningMismatch) {
        const targetMeta = PHASE3_BLOCKS.find(block => block.key === target);
        conflicts.push(`No se puede convertir automáticamente ${sourceBlock.label} → ${targetMeta?.label || target}.`);
        return;
      }

      buckets[target].push(...items);
      provenance[target].push({ source: sourceBlock, count: items.length });
    });

    const capacityRules = { movilidad: 10, activacion: 10, principal: 40, carrera: 10 };
    Object.entries(capacityRules).forEach(([targetKey, max]) => {
      const count = buckets[targetKey]?.length || 0;
      if (count > max) {
        const meta = PHASE3_BLOCKS.find(block => block.key === targetKey);
        conflicts.push(`${meta?.label || targetKey} recibiría ${count} contenidos y admite un máximo de ${max}. Reparte o excluye bloques antes de clonar.`);
      }
    });

    const autoTargetDate = phase3AutoTargetDate(sourceSession);
    const targetDate = phase3SessionDates[skey] || autoTargetDate;
    const hasContent = PHASE3_BLOCKS.some(block => buckets[block.key].length > 0);

    return { sourceSession, skey, index, mapping, buckets, provenance, excluded, conflicts, targetDate, autoTargetDate, hasContent };
  }

  function phase3RenderTargetBlock(block, plan) {
    const items = plan.buckets[block.key] || [];
    if (!items.length) return "";
    const sources = (plan.provenance[block.key] || []).map(entry => `${entry.source.icon} ${entry.source.label} ${entry.count}`).join(" + ");
    return `<div class="phase3-target-block">
      <div class="phase3-target-block-head">
        <strong>${block.icon} ${block.label} <b>${items.length}</b></strong>
        <small>Origen: ${escapeHtml(sources)}</small>
      </div>
      <div class="phase3-target-items">${items.map(item => `<span>${escapeHtml(phase3ItemLabel(item, block.key === "carrera"))}</span>`).join("")}</div>
    </div>`;
  }

  function phase3RenderClonePreview() {
    if (!phase3ClonePreview) return;
    phase3RefreshDestinationPlanDefaults();

    const source = phase3SourceSessions();
    const sourcePatient = patients.find(item => item.nickname === phase3SourceNickname());
    const targetPatient = phase3TargetPatient();
    const targetMicro = Number(phase3TargetMicro?.value || 0);
    const targetStart = phase3MondayOfWeek(phase3TargetStartDate?.value || "");
    const targetSunday = phase3SundayOfWeek(targetStart);

    const topConflicts = [];
    const warnings = [];
    if (!source.length) topConflicts.push("Selecciona un micro origen con sesiones.");
    if (!targetPatient) topConflicts.push("Selecciona el deportista destino en Creación de sesiones.");
    if (!targetMicro) topConflicts.push("Selecciona un micro destino.");
    if (!targetStart) topConflicts.push("Selecciona la semana base del micro destino.");

    const targetExisting = targetPatient && targetMicro
      ? sessions.filter(item => item.patientNickname === targetPatient.nickname && nciSessionMicro(item) === targetMicro)
      : [];
    if (targetExisting.length) {
      topConflicts.push(`Micro ${targetMicro} del deportista destino ya contiene ${targetExisting.length} ${targetExisting.length===1?"sesión":"sesiones"}.`);
    }

    if (targetPatient && sourcePatient && targetPatient.nickname === sourcePatient.nickname && targetMicro === Number(phase3SourceMicro?.value || 0)) {
      topConflicts.push("Origen y destino apuntan al mismo deportista y al mismo micro. El micro origen debe permanecer intacto.");
    }

    const plans = source.map((session,index) => phase3BuildDestinationSession(session,index,source));
    const conversionConflicts = plans.flatMap(plan => plan.conflicts);

    // DATE PLANNER: avisos de calendario (no bloqueantes).
    const activePlans = plans.filter(plan => plan.hasContent && !plan.conflicts.length);
    const usedDates = new Map();
    activePlans.forEach(plan => {
      if (!plan.targetDate) return;
      const occupied = phase3ExistingSessionsOnDate(targetPatient, plan.targetDate, Number(phase3SourceMicro?.value || 0), sourcePatient);
      if (occupied.length) {
        warnings.push(`La fecha ${plan.targetDate} ya contiene ${occupied.length} ${occupied.length===1?"sesión preparada":"sesiones preparadas"} para ${targetPatient?.nombre || targetPatient?.nickname || "el destino"}.`);
      }
      if (targetStart && targetSunday && (plan.targetDate < targetStart || plan.targetDate > targetSunday)) {
        warnings.push(`La sesión ${nciDisplayNumber(plan.sourceSession)} está fuera de la semana ${targetStart} → ${targetSunday}.`);
      }
      if (!usedDates.has(plan.targetDate)) usedDates.set(plan.targetDate, []);
      usedDates.get(plan.targetDate).push(plan);
    });
    usedDates.forEach((sameDatePlans, day) => {
      if (sameDatePlans.length > 1) {
        warnings.push(`${sameDatePlans.length} sesiones del nuevo micro están programadas el mismo día (${day}).`);
      }
    });

    const conflicts = [...topConflicts, ...conversionConflicts];

    const sessionsToCreate = activePlans;
    const exerciseCount = sessionsToCreate.reduce((sum,plan) =>
      sum + plan.buckets.movilidad.length + plan.buckets.activacion.length + plan.buckets.principal.length, 0);
    const runningCount = sessionsToCreate.reduce((sum,plan) => sum + plan.buckets.carrera.length, 0);
    const excludedCount = plans.reduce((sum,plan) => sum + plan.excluded.reduce((s,e)=>s+e.count,0), 0);
    const omittedSessions = plans.filter(plan => !plan.hasContent && !plan.conflicts.length).length;
    const valid = Boolean(source.length && targetPatient && targetMicro && targetStart && !conflicts.length);

    const sourceMicro = Number(phase3SourceMicro?.value || 0);
    const header = `<div class="phase3-plan-route">
      <article><small>ORIGEN</small><strong>${escapeHtml(sourcePatient?.nombre || phase3SourceNickname() || "—")}</strong><span>Micro ${sourceMicro || "—"} · ${source.length} ${source.length===1?"sesión":"sesiones"}</span></article>
      <i>→</i>
      <article><small>DESTINO</small><strong>${escapeHtml(targetPatient?.nombre || "Sin seleccionar")}</strong><span>${targetMicro ? `Micro ${targetMicro}` : "Micro pendiente"} · ${targetStart || "Fecha pendiente"}</span></article>
    </div>`;

    const summary = `<div class="phase3-plan-kpis">
      <span><small>SESIONES A CREAR</small><b>${sessionsToCreate.length}</b></span>
      <span><small>EJERCICIOS</small><b>${exerciseCount}</b></span>
      <span><small>SERIES CARRERA</small><b>${runningCount}</b></span>
      <span><small>EXCLUIDOS</small><b>${excludedCount}</b></span>
      <span class="${warnings.length ? "is-warning" : "is-ok"}"><small>AVISOS FECHA</small><b>${warnings.length}</b></span>
      <span class="${conflicts.length ? "is-conflict" : "is-ok"}"><small>CONFLICTOS</small><b>${conflicts.length}</b></span>
    </div>`;

    const cards = plans.map((plan,index) => {
      const targetNumber = targetMicro ? `${targetMicro}.${index+1}` : `—.${index+1}`;
      const blocksHtml = PHASE3_BLOCKS.map(block => phase3RenderTargetBlock(block,plan)).join("");
      const excludedHtml = plan.excluded.length
        ? `<div class="phase3-plan-excluded">🚫 Excluidos: ${plan.excluded.map(e=>`${e.source.label} ${e.count}`).join(" · ")}</div>` : "";
      const conflictHtml = plan.conflicts.length
        ? `<div class="phase3-plan-conflict">⚠️ ${plan.conflicts.map(escapeHtml).join("<br>")}</div>` : "";
      const omitted = !plan.hasContent && !plan.conflicts.length;
      return `<article class="phase3-plan-session ${omitted ? "is-omitted" : ""}">
        <div class="phase3-plan-session-head">
          <div><small>Sesión ${nciDisplayNumber(plan.sourceSession)} →</small><strong>Sesión ${targetNumber}</strong></div>
          <div class="phase3-session-date-wrap">
            <label>
              <span>📅 Fecha destino</span>
              <input type="date" data-phase3-session-date="${escapeHtml(plan.skey)}" value="${escapeHtml(plan.targetDate || "")}" ${omitted ? "disabled" : ""} />
            </label>
            ${!omitted && plan.targetDate === plan.autoTargetDate ? `<small>AUTO · ${escapeHtml(plan.autoTargetDate || "")}</small>` : (!omitted ? `<small>AJUSTADA</small>` : `<small>OMITIDA</small>`)}
          </div>
        </div>
        ${blocksHtml || (omitted ? `<div class="phase3-plan-empty">Todos los contenidos fueron excluidos. Esta sesión no se crearía.</div>` : "")}
        ${excludedHtml}${conflictHtml}
      </article>`;
    }).join("");

    const conflictPanel = conflicts.length
      ? `<div class="phase3-plan-validation is-conflict"><strong>🟠 REVISAR PLAN · ${conflicts.length} ${conflicts.length===1?"conflicto detectado":"conflictos detectados"}</strong>${conflicts.map(item=>`<span>• ${escapeHtml(item)}</span>`).join("")}</div>`
      : `<div class="phase3-plan-validation is-valid"><strong>🟢 PLAN VÁLIDO · Preparado para clonación real</strong><span>FASE 3.4 escribirá exactamente este plan: contenido mapeado + fechas individuales del Date Planner.</span></div>`;

    const warningPanel = warnings.length
      ? `<div class="phase3-plan-validation is-warning"><strong>🟡 AVISOS DE CALENDARIO · ${warnings.length}</strong>${warnings.map(item=>`<span>• ${escapeHtml(item)}</span>`).join("")}<small>Los avisos informan, pero no bloquean la futura clonación.</small></div>`
      : `<div class="phase3-plan-validation is-date-ok"><strong>📅 CALENDARIO OK</strong><span>Las fechas propuestas no chocan con sesiones existentes y están dentro de la semana base.</span></div>`;

    phase3ClonePreview.innerHTML = `${header}${summary}${conflictPanel}${warningPanel}${cards}${omittedSessions ? `<div class="phase3-plan-note">ℹ️ ${omittedSessions} ${omittedSessions===1?"sesión quedaría omitida":"sesiones quedarían omitidas"} por no contener ningún bloque después del mapeo.</div>` : ""}`;

    phase3ClonePreview.querySelectorAll("[data-phase3-session-date]").forEach(input => input.addEventListener("change", () => {
      const key = input.dataset.phase3SessionDate;
      if (!key) return;
      if (input.value) phase3SessionDates[key] = input.value;
      else delete phase3SessionDates[key];
      phase3RenderClonePreview();
    }));
    if (phase3CloneLockedBtn) {
      phase3CloneLockedBtn.disabled = !valid || sessionsToCreate.length === 0;
      phase3CloneLockedBtn.textContent = valid && sessionsToCreate.length
        ? `💣 Clonar microciclo · ${sessionsToCreate.length} ${sessionsToCreate.length===1?"sesión":"sesiones"}`
        : "🔒 Clonar microciclo · revisa el plan";
      phase3CloneLockedBtn.dataset.planWarnings = String(warnings.length);
    }
  }

  // FASE 3.4 · DEEP CLONE ENGINE
  // Congela el plan 3.3.1, crea identidades nuevas, escribe todas las sesiones
  // en una única operación lógica y emite una sola notificación de microciclo.
  function phase34Uuid(prefix = "id") {
    return crypto.randomUUID ? crypto.randomUUID() : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
  }

  function phase34DeepCopy(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function phase34EmptyPrincipalBlock() {
    return { notes: "", exercises: [] };
  }

  function phase34BuildPrincipal(plan) {
    const blocks = {
      bloque1: phase34EmptyPrincipalBlock(),
      bloque2: phase34EmptyPrincipalBlock(),
      bloque3: phase34EmptyPrincipalBlock(),
      bloque4: phase34EmptyPrincipalBlock()
    };
    const sourcePrincipal = phase3SessionModules(plan.sourceSession)?.principal;
    const sourceBlocks = sourcePrincipal?.blocks && typeof sourcePrincipal.blocks === "object" ? sourcePrincipal.blocks : {};
    const generic = [];

    (plan.buckets.principal || []).forEach(raw => {
      const item = phase34DeepCopy(raw);
      const originalBlock = String(item.__phase3PrincipalBlock || "");
      delete item.__phase3PrincipalBlock;
      const clean = cloneExerciseForStorage(item, item.tipo || "F. ppal. TS");
      if (!hasExerciseContent(clean)) return;
      if (blocks[originalBlock] && blocks[originalBlock].exercises.length < 10) {
        blocks[originalBlock].exercises.push(clean);
      } else {
        generic.push(clean);
      }
    });

    // Conservamos notas únicamente cuando el bloque Principal original sigue
    // llegando a Principal; las notas no se fuerzan sobre conversiones ajenas.
    if (plan.mapping?.principal === "principal") {
      Object.keys(blocks).forEach(key => {
        blocks[key].notes = String(sourceBlocks?.[key]?.notes || "");
      });
    }

    generic.forEach(item => {
      const targetKey = Object.keys(blocks).find(key => blocks[key].exercises.length < 10);
      if (targetKey) blocks[targetKey].exercises.push(item);
    });
    return { blocks };
  }

  function phase34ModulesFromPlan(plan) {
    return {
      movilidad: (plan.buckets.movilidad || []).map(item => cloneExerciseForStorage(phase34DeepCopy(item), "Movilidad")).filter(hasExerciseContent),
      activacion: (plan.buckets.activacion || []).map(item => cloneExerciseForStorage(phase34DeepCopy(item), "T. Superior")).filter(hasExerciseContent),
      carrera: (plan.buckets.carrera || []).map(item => cloneRunSeriesForStorage(phase34DeepCopy(item))).filter(hasRunSeriesContent),
      principal: phase34BuildPrincipal(plan)
    };
  }

  function phase34PreparedPlan() {
    phase3RefreshDestinationPlanDefaults();
    const source = phase3SourceSessions();
    const sourcePatient = patients.find(item => item.nickname === phase3SourceNickname());
    const targetPatient = phase3TargetPatient();
    const sourceMicro = Number(phase3SourceMicro?.value || 0);
    const targetMicro = Number(phase3TargetMicro?.value || 0);
    const targetStart = phase3MondayOfWeek(phase3TargetStartDate?.value || "");
    const targetSunday = phase3SundayOfWeek(targetStart);
    const conflicts = [];
    const warnings = [];

    if (!source.length) conflicts.push("No hay sesiones en el micro origen.");
    if (!sourcePatient) conflicts.push("No se encuentra el deportista origen.");
    if (!targetPatient) conflicts.push("No se encuentra el deportista destino.");
    if (!targetMicro) conflicts.push("No hay micro destino válido.");
    if (!targetStart) conflicts.push("No hay semana base destino válida.");
    if (targetPatient && sourcePatient && targetPatient.nickname === sourcePatient.nickname && targetMicro === sourceMicro) conflicts.push("Origen y destino son el mismo micro.");

    const existingTarget = targetPatient && targetMicro ? sessions.filter(item => item.patientNickname === targetPatient.nickname && nciSessionMicro(item) === targetMicro) : [];
    if (existingTarget.length) conflicts.push(`El Micro ${targetMicro} destino ya contiene ${existingTarget.length} ${existingTarget.length===1?"sesión":"sesiones"}.`);

    const plans = source.map((session,index) => phase3BuildDestinationSession(session,index,source));
    plans.forEach(plan => conflicts.push(...plan.conflicts));
    const active = plans.filter(plan => plan.hasContent && !plan.conflicts.length);
    const usedDates = new Map();
    active.forEach(plan => {
      if (!plan.targetDate) { conflicts.push(`La sesión ${nciDisplayNumber(plan.sourceSession)} no tiene fecha destino.`); return; }
      const occupied = phase3ExistingSessionsOnDate(targetPatient, plan.targetDate, sourceMicro, sourcePatient);
      if (occupied.length) warnings.push(`${plan.targetDate}: ya existen ${occupied.length} ${occupied.length===1?"sesión":"sesiones"} del deportista destino.`);
      if (targetStart && targetSunday && (plan.targetDate < targetStart || plan.targetDate > targetSunday)) warnings.push(`${nciDisplayNumber(plan.sourceSession)} queda fuera de la semana base (${plan.targetDate}).`);
      if (!usedDates.has(plan.targetDate)) usedDates.set(plan.targetDate, 0);
      usedDates.set(plan.targetDate, usedDates.get(plan.targetDate)+1);
    });
    usedDates.forEach((count, day) => { if (count > 1) warnings.push(`${count} sesiones clonadas compartirán la fecha ${day}.`); });

    return { source, sourcePatient, targetPatient, sourceMicro, targetMicro, targetStart, plans, active, conflicts: Array.from(new Set(conflicts)), warnings: Array.from(new Set(warnings)) };
  }

  function phase34BuildSessionRecord(plan, operation, legacyNumber, order) {
    const modules = phase34ModulesFromPlan(plan);
    const nowIso = operation.createdAt;
    const sourceKind = nciSessionKind(plan.sourceSession);
    const exerciseTotal = modules.movilidad.length + modules.activacion.length + Object.values(modules.principal.blocks).reduce((sum,b)=>sum+b.exercises.length,0);
    const sessionKindValue = modules.carrera.length && exerciseTotal === 0 ? "running" : (sourceKind || "gym");
    return {
      id: phase34Uuid("session"),
      patientNickname: operation.targetPatient.nickname,
      numero: legacyNumber,
      fecha: plan.targetDate,
      microciclo: operation.targetMicro,
      sessionBaseNumber: operation.targetMicro,
      sessionKind: sessionKindValue,
      microManual: true,
      microcicloManual: true,
      microcicloLabel: `Micro ${operation.targetMicro} · ${plan.targetDate} · Clonado`,
      modules,
      movilidad: modules.movilidad.filter(item => item.nombre).map(item => item.nombre),
      activacion: modules.activacion.filter(item => item.nombre).map(item => item.nombre),
      carrera: modules.carrera.filter(hasRunSeriesContent),
      principal: modules.principal,
      sessionBaseNumber: operation.targetMicro,
      subsessionOrder: order,
      dayOrder: order,
      microSequenceOrder: order,
      displayOrder: order,
      displaySessionNumber: `${operation.targetMicro}.${order}`,
      numberingVersion: PPF_NCI_VERSION,
      agendaStatus: "scheduled",
      terminada: false,
      completed: false,
      isCompleted: false,
      completedAt: null,
      finishedAt: null,
      lastCompletedAt: null,
      cloneOperationId: operation.id,
      clonedFromSessionId: plan.sourceSession.id || null,
      clonedFromMicro: operation.sourceMicro,
      clonedFromPatient: operation.sourcePatient.nickname,
      cloneEngineVersion: "3.4",
      createdAt: nowIso,
      updatedAt: nowIso,
      agendaHistory: [{ type: "created", label: `Clonada desde Micro ${operation.sourceMicro}`, at: nowIso, by: currentUser?.nickname || "admin" }]
    };
  }

  function phase34VerifyCreated(created = [], operation) {
    let stored = [];
    try { stored = JSON.parse(localStorage.getItem("sessions") || "[]"); } catch (_) {}
    if (!Array.isArray(stored)) return false;
    return created.every(expected => {
      const actual = stored.find(item => String(item.id) === String(expected.id));
      if (!actual) return false;
      if (actual.patientNickname !== operation.targetPatient.nickname || nciSessionMicro(actual) !== operation.targetMicro || String(actual.fecha) !== String(expected.fecha)) return false;
      const a = phase3SessionModules(actual);
      const e = phase3SessionModules(expected);
      return phase3CountExerciseList(a.movilidad) === phase3CountExerciseList(e.movilidad)
        && phase3CountExerciseList(a.activacion) === phase3CountExerciseList(e.activacion)
        && phase3CountPrincipal(a.principal) === phase3CountPrincipal(e.principal)
        && phase3CountRunningList(a.carrera) === phase3CountRunningList(e.carrera);
    });
  }

  async function phase34CreateGroupedNotification(operation, created) {
    let list = [];
    try { list = JSON.parse(localStorage.getItem("notifications") || "[]"); } catch (_) {}
    if (!Array.isArray(list)) list = [];
    const dates = created.map(item => item.fecha).filter(Boolean).sort();
    const uniqueDates = [...new Set(dates)];
    const firstDate = uniqueDates[0] || "";
    const lastDate = uniqueDates[uniqueDates.length-1] || firstDate;
    const sessionsByDate = dates.reduce((acc, date) => { acc[date] = (acc[date] || 0) + 1; return acc; }, {});
    const doubleSessionDates = Object.entries(sessionsByDate).filter(([, count]) => count > 1).map(([date]) => date);
    // v3.4.2.1 · Micro Notification Session Labels
    // La UX nunca expone el contador/ID legacy (numero). Mostramos la
    // numeración funcional del micro destino: 8.1, 8.2, 8.3...
    const sessionNumbers = created
      .slice()
      .sort((a, b) => Number(a.subsessionOrder || a.microSequenceOrder || 0) - Number(b.subsessionOrder || b.microSequenceOrder || 0))
      .map((item, index) => {
        const explicit = String(item.displaySessionNumber || "").trim();
        if (explicit) return explicit;
        const order = Number(item.subsessionOrder || item.microSequenceOrder || item.displayOrder || (index + 1));
        return `${operation.targetMicro}.${order}`;
      })
      .filter(Boolean);
    const sessionText = `${created.length} ${created.length === 1 ? "sesión" : "sesiones"}`;
    const dayText = `${uniqueDates.length} ${uniqueDates.length === 1 ? "día" : "días"}`;
    const rangeText = firstDate && lastDate && firstDate !== lastDate ? ` · ${firstDate} → ${lastDate}` : (firstDate ? ` · ${firstDate}` : "");
    const doubleText = doubleSessionDates.length ? ` · ${doubleSessionDates.length === 1 ? "doble sesión" : `${doubleSessionDates.length} días con doble sesión`}` : "";
    const numbersText = sessionNumbers.length ? ` · Sesiones ${sessionNumbers.join(", ")}` : "";
    const notification = {
      id: phase34Uuid("micro-notification"),
      type: "microcycle_plan",
      recipient: String(operation.targetPatient.nickname || "").trim().toLowerCase(),
      recipientName: operation.targetPatient.nombre || operation.targetPatient.nickname,
      title: `Nuevo microciclo · M${operation.targetMicro}`,
      body: `${sessionText} · ${dayText}${rangeText}${doubleText}${numbersText}`,
      microcycle: operation.targetMicro,
      sessionCount: created.length,
      trainingDayCount: uniqueDates.length,
      sessionNumbers,
      doubleSessionDates,
      sessionIds: created.map(item => item.id),
      sessionDates: dates,
      cloneOperationId: operation.id,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.nickname || "admin",
      origin: "admin_microcycle_clone",
      integrityVersion: 1,
      readBy: []
    };
    list.push(notification);
    if (list.length > 500) list = list.slice(-500);
    localStorage.setItem("notifications", JSON.stringify(list));
    let synced = true;
    if (window.PPF_SUPABASE?.pushValue) synced = await window.PPF_SUPABASE.pushValue("notifications", list);
    else if (window.PPF_SUPABASE?.pushKey) synced = await window.PPF_SUPABASE.pushKey("notifications");
    if (!synced) throw new Error("Supabase no confirmó la notificación agrupada");
    return notification;
  }

  async function phase34ExecuteClone() {
    if (phase3CloneLockedBtn?.dataset.busy === "1") return;
    const prepared = phase34PreparedPlan();
    if (prepared.conflicts.length || !prepared.active.length) {
      phase3RenderClonePreview();
      alert(`No se puede clonar todavía.\n\n${prepared.conflicts.join("\n") || "El plan no contiene sesiones a crear."}`);
      return;
    }

    const dateLines = prepared.active.map((plan,i) => `• ${prepared.targetMicro}.${i+1} · ${plan.targetDate}`).join("\n");
    const warningText = prepared.warnings.length ? `\n\n⚠️ Avisos:\n${prepared.warnings.map(x=>`• ${x}`).join("\n")}` : "";
    const confirmed = confirm(`💣 CLONAR MICROCICLO\n\nOrigen: ${prepared.sourcePatient.nombre || prepared.sourcePatient.nickname} · Micro ${prepared.sourceMicro}\nDestino: ${prepared.targetPatient.nombre || prepared.targetPatient.nickname} · Micro ${prepared.targetMicro}\nSesiones nuevas: ${prepared.active.length}\n\n${dateLines}${warningText}\n\nSe crearán sesiones independientes y el deportista recibirá UNA sola notificación. ¿Continuar?`);
    if (!confirmed) return;

    const beforeSessions = phase34DeepCopy(sessions);
    let beforeNotifications = [];
    try { beforeNotifications = JSON.parse(localStorage.getItem("notifications") || "[]"); } catch (_) {}
    if (!Array.isArray(beforeNotifications)) beforeNotifications = [];

    const operation = {
      id: phase34Uuid("clone"),
      createdAt: new Date().toISOString(),
      sourcePatient: prepared.sourcePatient,
      targetPatient: prepared.targetPatient,
      sourceMicro: prepared.sourceMicro,
      targetMicro: prepared.targetMicro
    };

    const baseLegacyNumber = sessions.filter(item => nciSessionPatient(item) === nciNickname(prepared.targetPatient.nickname)).reduce((max,item)=>Math.max(max,Number(item.numero||0)),0);
    const created = prepared.active.map((plan,index) => phase34BuildSessionRecord(plan, operation, baseLegacyNumber + index + 1, index + 1));

    phase3CloneLockedBtn.dataset.busy = "1";
    phase3CloneLockedBtn.disabled = true;
    phase3CloneLockedBtn.textContent = "⏳ Clonando microciclo...";

    try {
      sessions.push(...created);
      nciRenumberPatientSessions(prepared.targetPatient.nickname, { touchUpdatedAt: false, rebuildOrder: false });
      window.sessions = sessions;
      localStorage.setItem("sessions", JSON.stringify(sessions));
      window.PPF_CORE?.emit?.("sessions");

      let cloudConfirmed = true;
      if (window.PPF_SUPABASE?.pushValue) cloudConfirmed = await window.PPF_SUPABASE.pushValue("sessions", sessions);
      else if (window.PPF_SUPABASE?.pushKey) cloudConfirmed = await window.PPF_SUPABASE.pushKey("sessions");
      if (!cloudConfirmed) throw new Error("Supabase no confirmó la escritura de las sesiones clonadas");

      // pushValue puede fusionar datos remotos y actualizar window.sessions.
      // Adoptamos esa verdad antes de verificar.
      try {
        const synced = JSON.parse(localStorage.getItem("sessions") || "[]");
        if (Array.isArray(synced)) { sessions = synced; window.sessions = sessions; }
      } catch (_) {}
      if (!phase34VerifyCreated(created, operation)) throw new Error("La verificación posterior no encontró una copia idéntica al plan aprobado");

      let notificationOk = true;
      try { await phase34CreateGroupedNotification(operation, created); }
      catch (notifyError) { notificationOk = false; console.error("Deep Clone: notificación agrupada no confirmada:", notifyError); }

      if (typeof syncRuntimeToDB === "function") { try { await syncRuntimeToDB(); } catch (error) { console.warn("Deep Clone: IndexedDB no confirmó sincronización:", error); } }
      if (typeof pmSetDashboardKpis === "function") { try { pmSetDashboardKpis("sesiones"); } catch (_) {} }

      // Evita una segunda clonación accidental sobre el mismo micro recién creado.
      phase3RenderClonePreview();
      if (filter) { filter.value = prepared.targetPatient.nickname; renderSessionList(prepared.targetPatient.nickname); }

      const resultText = `🎉 MICRO CLONADO CON ÉXITO\n\nMicro ${prepared.sourceMicro} → Micro ${prepared.targetMicro}\n${created.length} ${created.length===1?"sesión creada":"sesiones creadas"}\nAgenda PRO sincronizada\n${notificationOk ? "🔔 1 notificación agrupada enviada al deportista" : "⚠️ Sesiones correctas, pero la notificación agrupada no pudo confirmarse"}`;
      alert(resultText);
    } catch (error) {
      console.error("FASE 3.4 Deep Clone rollback:", error);
      sessions = phase34DeepCopy(beforeSessions);
      window.sessions = sessions;
      localStorage.setItem("sessions", JSON.stringify(sessions));
      localStorage.setItem("notifications", JSON.stringify(beforeNotifications));
      window.PPF_CORE?.emit?.("sessions");
      // Rollback remoto best-effort. Usamos replaceValue si está disponible para
      // retirar también IDs que pudieran haberse subido antes del fallo.
      try {
        if (window.PPF_SUPABASE?.replaceValue) await window.PPF_SUPABASE.replaceValue("sessions", sessions);
        else if (window.PPF_SUPABASE?.pushValue) await window.PPF_SUPABASE.pushValue("sessions", sessions);
      } catch (rollbackError) { console.error("Deep Clone: rollback remoto no confirmado:", rollbackError); }
      alert(`La clonación se ha cancelado y PPF ha restaurado el estado anterior.\n\nMotivo: ${error?.message || error}`);
    } finally {
      delete phase3CloneLockedBtn.dataset.busy;
      phase3RenderClonePreview();
    }
  }

  function phase3PreviewLatestMicro() {
    const micros = phase3MicrosForSource();
    if (!phase3SourceNickname()) {
      phase3Preview.innerHTML = `<div class="phase3-empty">Selecciona primero el deportista origen.</div>`;
      return;
    }
    if (!micros.length) {
      phase3Preview.innerHTML = `<div class="phase3-empty">El deportista origen no tiene microciclos guardados.</div>`;
      return;
    }
    if (phase3SourceMicro) phase3SourceMicro.value = String(micros[0]);
    phase3ResetSessionDates();
    phase3RenderPreview();
    phase3RenderClonePreview();
  }

  if (phase3SourcePatient) phase3SourcePatient.addEventListener("change", () => {
    phase3ResetSessionDates();
    phase3RefreshMicroOptions({ preserve: false });
    phase3RenderPreview();
    phase3RenderClonePreview();
  });
  if (phase3PreviewBtn) phase3PreviewBtn.addEventListener("click", phase3PreviewLatestMicro);
  if (phase3ApplyMapBtn) phase3ApplyMapBtn.addEventListener("click", phase3ApplyGlobalMap);
  if (phase3SourceMicro) phase3SourceMicro.addEventListener("change", () => {
    phase3ResetSessionDates();
    phase3RenderPreview();
    phase3RenderClonePreview();
  });
  if (phase3TargetMicro) phase3TargetMicro.addEventListener("change", phase3RenderClonePreview);
  if (phase3TargetStartDate) phase3TargetStartDate.addEventListener("change", () => {
    phase3NormalizeWeekBase();
    phase3ResetSessionDates();
    phase3RenderClonePreview();
  });
  if (phase3ResetDatesBtn) phase3ResetDatesBtn.addEventListener("click", () => {
    phase3ResetSessionDates();
    phase3RenderClonePreview();
  });
  if (phase3CloneLockedBtn) phase3CloneLockedBtn.addEventListener("click", phase34ExecuteClone);
  phase3RefreshSourcePatients();
  phase3RefreshMicroOptions();
  phase3RefreshDestinationPlanDefaults({ forceMicro: true });
  phase3RenderClonePreview();
  if (pasteCopiedSessionBtn) pasteCopiedSessionBtn.addEventListener("click", pasteCopiedSessionIntoForm);
  if (loadLastSessionBtn) loadLastSessionBtn.addEventListener("click", loadLastSessionForSelectedPatient);
  refreshSessionClipboardStatus();


  function cloneExerciseForStorage(item, fallbackType = "") {
    return {
      nombre: item?.nombre || "",
      series: item?.series || "",
      repeticiones: item?.repeticiones || "",
      carga: item?.carga || "",
      unidad: item?.unidad || "Kg",
      rpe: item?.rpe || "",
      tipo: item?.tipo || fallbackType || "",
      url: item?.url || "",
      deleted: Boolean(item?.deleted)
    };
  }

  function cloneAllModulesForStorage(existingSession = null) {
    saveActiveModuleToMemory();

    const principal = { blocks: {} };

    ["bloque1", "bloque2", "bloque3", "bloque4"].forEach(blockKey => {
      const block = moduleData.principal.blocks[blockKey] || defaultPrincipalBlock();

      principal.blocks[blockKey] = {
        notes: block.notes || "",
        exercises: (block.exercises || []).map(item => cloneExerciseForStorage(item, "F. ppal. TS"))
      };

    });

    return {
      movilidad: (moduleData.movilidad || []).map(item => cloneExerciseForStorage(item, "Movilidad")),
      activacion: (moduleData.activacion || []).map(item => cloneExerciseForStorage(item, "T. Superior")),
      carrera: (moduleData.carrera || []).map(item => cloneRunSeriesForStorage(item)),
      principal
    };
  }

  function normalizeImportedExercise(item = {}, fallbackType = "") {
    return {
      nombre: item.nombre || "",
      series: item.series || "",
      repeticiones: item.repeticiones || "",
      carga: item.carga || "",
      unidad: item.unidad || "Kg",
      rpe: item.rpe || "",
      tipo: item.tipo || fallbackType || "",
      url: item.url || "",
      deleted: Boolean(item.deleted)
    };
  }

  function cloneRunSeriesForStorage(item = {}) {
    return { nombre: item?.nombre || "", series: item?.series || "", cantidad: item?.cantidad || "", unidad: item?.unidad || "m", ritmo: item?.ritmo || "", rpe: item?.rpe || "", fc: item?.fc || "", deleted: Boolean(item?.deleted) };
  }

  function normalizeImportedRunSeries(item = {}) {
    return cloneRunSeriesForStorage(item);
  }

  function applySessionModulesToForm(modules = {}, sourceLabel = "sesión copiada") {
    const movilidad = Array.isArray(modules.movilidad) ? modules.movilidad : [];
    const activacion = Array.isArray(modules.activacion) ? modules.activacion : [];
    const principalSource = modules.principal || { blocks: {} };

    moduleData.movilidad = compactExerciseList(movilidad, "Movilidad");

    moduleData.activacion = compactExerciseList(activacion, "T. Superior");
    moduleData.carrera = compactRunSeriesList(modules.carrera || []);

    moduleData.principal.blocks = {
      bloque1: defaultPrincipalBlock(),
      bloque2: defaultPrincipalBlock(),
      bloque3: defaultPrincipalBlock(),
      bloque4: defaultPrincipalBlock()
    };

    ["bloque1", "bloque2", "bloque3", "bloque4"].forEach(blockKey => {
      const block = principalSource.blocks?.[blockKey] || defaultPrincipalBlock();
      moduleData.principal.blocks[blockKey] = {
        notes: block.notes || "",
        exercises: compactExerciseList(block.exercises || [], "F. ppal. TS")
      };
    });

    editingSessionId = null;
    saveSessionBtn.textContent = "Guardar sesión";
    delete saveSessionBtn.dataset.editing;
    activePrincipalBlock = "bloque1";
    renderModule("movilidad");
    refreshSessionInfo();

    if (sessionClipboardStatus) {
      sessionClipboardStatus.textContent = `✅ ${sourceLabel} cargada. Revisa paciente, fecha y pulsa Guardar sesión.`;
    }
  }

  function getSessionClipboardPayload() {
    try {
      return JSON.parse(localStorage.getItem("ppfSessionClipboard") || "null");
    } catch (_) {
      return null;
    }
  }

  function refreshSessionClipboardStatus() {
    if (!sessionClipboardStatus) return;
    const clip = getSessionClipboardPayload();
    if (!clip) {
      sessionClipboardStatus.textContent = "Copia una sesión creada desde el listado inferior y pégala aquí.";
      return;
    }
    sessionClipboardStatus.textContent = `📋 Copiada: ${clip.sourcePatientName || clip.sourcePatientNickname || "paciente"} · Sesión nº ${clip.sourceNumber || "-"} · ${clip.sourceDate || "-"}`;
  }

  function pasteCopiedSessionIntoForm() {
    const clip = getSessionClipboardPayload();
    if (!clip || !clip.modules) {
      alert("Primero copia una sesión desde el listado inferior.");
      return;
    }

    if (!patientHidden.value) {
      alert("Selecciona primero el paciente al que quieres pegar la sesión.");
      return;
    }

    applySessionModulesToForm(clip.modules, `Sesión copiada de ${clip.sourcePatientName || clip.sourcePatientNickname || "otro paciente"}`);
  }

  function loadLastSessionForSelectedPatient() {
    const patientNickname = patientHidden.value;
    if (!patientNickname) {
      alert("Selecciona primero un paciente.");
      return;
    }

    const available = sessions
      .filter(item => item.patientNickname === patientNickname)
      .slice()
      .sort((a, b) => {
        const dateA = String(a.fecha || "");
        const dateB = String(b.fecha || "");
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        return (Number(b.numero) || 0) - (Number(a.numero) || 0);
      });

    const lastSession = available[0];

    if (!lastSession) {
      alert("Este paciente todavía no tiene sesiones creadas para cargar.");
      return;
    }

    applySessionModulesToForm(lastSession.modules || {
      movilidad: lastSession.movilidad || [],
      activacion: lastSession.activacion || [],
      carrera: lastSession.carrera || [],
      principal: lastSession.principal || { blocks: {} }
    }, `Última sesión del cliente cargada: sesión nº ${lastSession.numero || "-"}`);
  }


  async function commitSessionToStorageStable(payload) {
    const storedPayload = JSON.parse(JSON.stringify(payload));
    const nowIso = new Date().toISOString();
    storedPayload.updatedAt = nowIso;

    // Una sesión solo se actualiza por su ID real. Nunca por paciente+número:
    // ese fallback podía reutilizar el ID de una sesión ya terminada.
    const index = sessions.findIndex(item => String(item.id) === String(storedPayload.id));

    const created = index === -1;
    if (created) storedPayload.createdAt = storedPayload.createdAt || nowIso;

    if (!created) {
      storedPayload.id = sessions[index].id || storedPayload.id;
      storedPayload.createdAt = sessions[index].createdAt || storedPayload.createdAt || nowIso;
      sessions.splice(index, 1, storedPayload);
    } else {
      sessions.push(storedPayload);
    }

    const renumberResult = nciRenumberPatientSessions(storedPayload.patientNickname, { touchUpdatedAt: true, rebuildOrder: true });
    const finalPayload = sessions.find(item => String(item.id) === String(storedPayload.id)) || storedPayload;

    window.sessions = sessions;
    localStorage.setItem("sessions", JSON.stringify(sessions));
  window.PPF_CORE?.emit?.("sessions");

    let cloudConfirmed = false;
    if (window.PPF_SUPABASE?.pushValue) {
      cloudConfirmed = await window.PPF_SUPABASE.pushValue("sessions", sessions);
    } else if (window.PPF_SUPABASE?.pushKey) {
      cloudConfirmed = await window.PPF_SUPABASE.pushKey("sessions");
    }

    if (renumberResult.notificationsChanged && window.PPF_SUPABASE?.pushKey) {
      try { await window.PPF_SUPABASE.pushKey("notifications"); }
      catch (error) { console.warn("No se pudieron actualizar los números de las notificaciones:", error); }
    }

    if (typeof syncRuntimeToDB === "function") {
      try { await syncRuntimeToDB(); }
      catch (error) { console.warn("No se pudo sincronizar IndexedDB:", error); }
    }

    return { created, payload: finalPayload, cloudConfirmed };
  }

  async function createPreparedSessionNotification(session) {
    if (!session?.patientNickname || !session?.id) return;

    let notifications = [];
    try { notifications = JSON.parse(localStorage.getItem("notifications") || "[]"); } catch (_) {}
    if (!Array.isArray(notifications)) notifications = [];

    const duplicate = notifications.some(item =>
      item?.type === "prepared_session" && String(item?.sessionId) === String(session.id)
    );
    if (duplicate) return;

    const patient = patients.find(item => item.nickname === session.patientNickname);
    const notification = {
      id: crypto.randomUUID ? crypto.randomUUID() : `notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "prepared_session",
      recipient: String(session.patientNickname || "").trim().toLowerCase(),
      recipientName: patient?.nombre || session.patientNickname,
      title: "Nueva sesión preparada",
      body: `Tu sesión nº ${nciDisplayNumber(session)} ya está disponible.`,
      sessionId: session.id,
      sessionNumber: session.numero || null,
      displaySessionNumber: nciDisplayNumber(session),
      sessionDate: session.fecha || "",
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.nickname || "admin",
      origin: "admin_session_create",
      integrityVersion: 1,
      readBy: []
    };

    notifications.push(notification);
    if (notifications.length > 500) notifications = notifications.slice(-500);
    localStorage.setItem("notifications", JSON.stringify(notifications));

    if (window.PPF_SUPABASE?.pushValue) {
      const synced = await window.PPF_SUPABASE.pushValue("notifications", notifications);
      if (!synced) throw new Error("Supabase no confirmó la notificación");
    } else if (window.PPF_SUPABASE?.pushKey) {
      const synced = await window.PPF_SUPABASE.pushKey("notifications");
      if (!synced) throw new Error("Supabase no confirmó la notificación");
    }

    return notification;
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();

    saveActiveModuleToMemory();

    const patientNickname = patientHidden.value;
    if (!patientNickname) return alert("Selecciona un paciente válido del buscador.");

    const existing = editingSessionId ? sessions.find(item => item.id === editingSessionId) : null;
    const modulesForSave = cloneAllModulesForStorage(existing);
    const computedMicro = Number(getComputedMicrocycleNumber(patientNickname, date.value));

    const microManualCheck = document.getElementById("sessionMicroManualCheck");
    const microManualSelect = document.getElementById("sessionMicroManualSelect");

    const microManualActive = Boolean(microManualCheck && microManualCheck.checked);

    const rawManualMicro = String(microManualSelect?.value || "").trim();
    const manualMicroNumber = Number(rawManualMicro.replace(/\D/g, ""));

    const selectedMicro = microManualActive && manualMicroNumber
      ? manualMicroNumber
      : computedMicro;

  const payload = {
  id: existing?.id || editingSessionId || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
  patientNickname,
  numero: existing ? existing.numero : (sessions.filter(item => nciSessionPatient(item) === nciNickname(patientNickname)).reduce((max, item) => Math.max(max, Number(item.numero || 0)), 0) + 1),
  fecha: date.value,
  microciclo: selectedMicro,
  sessionBaseNumber: selectedMicro,
  sessionKind: sessionKind?.value || existing?.sessionKind || "gym",
  microManual: microManualActive,
  microcicloManual: microManualActive,
  microcicloLabel: `Micro ${selectedMicro} · ${date.value}${microManualActive ? " · Manual" : ""}`,
      modules: modulesForSave,
      movilidad: modulesForSave.movilidad.filter(item => !item.deleted && item.nombre).map(item => item.nombre),
      activacion: modulesForSave.activacion.filter(item => !item.deleted && item.nombre).map(item => item.nombre),
      carrera: modulesForSave.carrera.filter(item => !item.deleted && hasRunSeriesContent(item)),
      principal: modulesForSave.principal
    };

    let commitResult;
    try {
      commitResult = await commitSessionToStorageStable(payload);
    } catch (error) {
      console.error("No se pudo guardar la sesión:", error);
      alert("No se pudo guardar la sesión. Revisa la conexión con Supabase y vuelve a intentarlo.");
      return;
    }

    // B.2.1.4.6 · Instant Pending KPI Sync
    // La sesión ya está confirmada en el almacenamiento antes de continuar con
    // la notificación. Repintamos ahora los KPI de Creación sesiones usando el
    // mismo PPF_CORE que alimenta Agenda, evitando depender de F5.
    if (typeof pmSetDashboardKpis === "function") {
      const activeSection = document.querySelector(".nav-item.active")?.dataset?.section;
      if (activeSection === "sesiones") pmSetDashboardKpis("sesiones");
    }

    let notificationConfirmed = true;
    if (commitResult?.created) {
      try {
        await createPreparedSessionNotification(commitResult.payload);
      } catch (error) {
        notificationConfirmed = false;
        console.error("La sesión se guardó, pero la notificación no pudo confirmarse:", error);
      }
    }

    if (!commitResult.cloudConfirmed) {
      alert("La sesión quedó guardada en este dispositivo, pero Supabase no confirmó la sincronización. No se limpiará el formulario para evitar perder el trabajo.");
      renderSessionList(patientNickname);
      return;
    }

    if (editingSessionId) {
      alert("Sesión actualizada y sincronizada correctamente.");
    } else if (notificationConfirmed) {
      alert("Sesión guardada, sincronizada y notificación enviada correctamente.");
    } else {
      alert("La sesión se guardó y sincronizó, pero no se pudo confirmar la notificación.");
    }

    const savedPatientNickname = patientNickname;

    resetSessionForm();

    if (filter) filter.value = savedPatientNickname;

    renderSessionList(savedPatientNickname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.loadSessionIntoForm = function(sessionId) {
    const session = sessions.find(item => String(item.id) === String(sessionId));
    if (!session) return;

    const patient = patients.find(item => item.nickname === session.patientNickname);
    editingSessionId = sessionId;

    patientSearch.value = session.patientNickname;
    patientHidden.value = session.patientNickname;
    date.value = session.fecha;
    if (sessionKind) sessionKind.value = nciSessionKind(session);

    moduleData.movilidad = compactExerciseList(session.modules?.movilidad || session.movilidad || [], "Movilidad");

    moduleData.activacion = compactExerciseList(session.modules?.activacion || session.activacion || [], "T. Superior");
    moduleData.carrera = compactRunSeriesList(session.modules?.carrera || session.carrera || []);

    const p = session.modules?.principal || session.principal;
    moduleData.principal.blocks = { bloque1: defaultPrincipalBlock(), bloque2: defaultPrincipalBlock(), bloque3: defaultPrincipalBlock(), bloque4: defaultPrincipalBlock() };

    if (p?.blocks) {
      ["bloque1", "bloque2", "bloque3", "bloque4"].forEach(key => {
        const block = p.blocks[key] || defaultPrincipalBlock();
        moduleData.principal.blocks[key] = {
          notes: block.notes || "",
          exercises: compactExerciseList(block.exercises || [], "F. ppal. TS")
        };
      });
    }

    saveSessionBtn.textContent = "Actualizar sesión";
    saveSessionBtn.dataset.editing = sessionId;
    activePrincipalBlock = "bloque1";

    // FASE 2.3 · Smart Edit Entry
    // Al editar, abrir el primer bloque real de la sesión siguiendo el orden natural:
    // Movilidad → Activación → Principal → Carrera. El fallback sigue siendo Movilidad.
    const hasVisibleItems = list => Array.isArray(list) && list.some(item => item && !item.deleted && String(item.nombre || "").trim());
    const firstPrincipalBlockWithContent = ["bloque1", "bloque2", "bloque3", "bloque4"].find(key => {
      const block = moduleData.principal.blocks[key];
      return hasVisibleItems(block?.exercises) || String(block?.notes || "").trim();
    });

    let editEntryModule = "movilidad";
    if (hasVisibleItems(moduleData.movilidad)) {
      editEntryModule = "movilidad";
    } else if (hasVisibleItems(moduleData.activacion)) {
      editEntryModule = "activacion";
    } else if (firstPrincipalBlockWithContent) {
      activePrincipalBlock = firstPrincipalBlockWithContent;
      editEntryModule = "principal";
    } else if (hasVisibleItems(moduleData.carrera)) {
      editEntryModule = "carrera";
    }

    renderModule(editEntryModule);
    const { check: editMicroManualCheck, select: editMicroManualSelect } = getMicroManualControls();

    if (editMicroManualCheck && editMicroManualSelect) {
      const isManual = Boolean(session.microManual || session.microcicloManual);

      editMicroManualCheck.checked = isManual;
      editMicroManualSelect.style.display = isManual ? "block" : "none";
      editMicroManualSelect.value = String(session.microciclo || 1);
    }


    refreshSessionInfo();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
}



function pmReadJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch (_) {
    return fallback;
  }
}

function pmNormalizeNickname(value = "") {
  return String(value || "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();
}

function pmSessionPatientKey(session = {}) {
  return String(session.patientNickname || session.nickname || session.patient || session.patientId || session.cliente || session.clientNickname || "").trim();
}

function pmSessionNumber(session = {}) {
  return Number(session.numero || session.numeroSesion || session.sessionNumber || 0);
}

function pmSessionStableKey(session = {}, index = 0) {
  const id = String(session.id || session.sessionId || "").trim();
  if (id) return `id:${id}`;
  return [
    "legacy",
    pmNormalizeNickname(pmSessionPatientKey(session)),
    pmSessionNumber(session),
    String(session.fecha || ""),
    String(session.createdAt || session.updatedAt || ""),
    index
  ].join(":");
}

function pmLatestPreparedAt(session = {}, notifications = []) {
  const sid = String(session.id || session.sessionId || "").trim();
  const createdAt = Date.parse(session.createdAt || session.updatedAt || "") || 0;
  const notificationAt = (Array.isArray(notifications) ? notifications : [])
    .filter(item => item?.type === "prepared_session" && sid && String(item?.sessionId || "") === sid)
    .reduce((latest, item) => Math.max(latest, Date.parse(item?.createdAt || "") || 0), 0);
  return Math.max(createdAt, notificationAt);
}

function pmCompletionForSession(session = {}, completed = [], notifications = []) {
  const sid = String(session.id || session.sessionId || "").trim();
  const snum = pmSessionNumber(session);
  const spatient = pmNormalizeNickname(pmSessionPatientKey(session));
  const preparedAt = pmLatestPreparedAt(session, notifications);

  const matches = (Array.isArray(completed) ? completed : []).filter(item => {
    const cid = String(item.sessionId || item.id || "").trim();
    if (sid && cid) return sid === cid;
    if (!sid || !cid) {
      return spatient &&
        spatient === pmNormalizeNickname(item.patientNickname || item.nickname || item.patient || "") &&
        snum && snum === Number(item.numero || item.numeroSesion || item.sessionNumber || 0);
    }
    return false;
  });

  if (!matches.length) return null;
  const latest = matches.slice().sort((a, b) =>
    (Date.parse(b.completedAt || b.fechaCompletada || "") || 0) -
    (Date.parse(a.completedAt || a.fechaCompletada || "") || 0)
  )[0];
  const completedAt = Date.parse(latest.completedAt || latest.fechaCompletada || "") || 0;

  // Una preparación posterior vuelve a dejar esa sesión pendiente. Esto repara
  // los IDs reutilizados por versiones antiguas sin ocultar sesiones nuevas.
  if (preparedAt && completedAt && preparedAt > completedAt) return null;
  return latest;
}

function pmIsSessionCompleted(session = {}, completed = [], notifications = []) {
  if (window.PPF_SESSION_TRUTH) return window.PPF_SESSION_TRUTH.isCompleted(session, completed);
  return Boolean(pmCompletionForSession(session, completed, notifications));
}

function pmSortSessionsLatest(list = []) {
  return list.slice().sort((a, b) => {
    const fa = String(a.fecha || "");
    const fb = String(b.fecha || "");
    if (fa !== fb) return fb.localeCompare(fa);
    return pmSessionNumber(b) - pmSessionNumber(a);
  });
}

function pmSessionMicroLabel(session = {}) {
  const micro = session.microciclo || session.micro || session.microcycle || pmSessionNumber(session) || "-";
  return `Micro ${micro} · ${session.fecha || "-"}`;
}

function pmSessionAgenda() {
  const coreAgenda = window.PPF_CORE?.agenda?.();
  if (!coreAgenda) return { pending: [], done: [], cancelled: [], overdue: [], withoutTime: [] };
  const patientByNickname = new Map(patients.map(patient => [pmNormalizeNickname(patient.nickname), patient]));
  const wrap = session => {
    const nickname = window.PPF_CORE.patient(session);
    return {
      patient: patientByNickname.get(nickname) || { nombre: session.patientName || session.nombrePaciente || session.patientNickname || "Paciente", nickname },
      session
    };
  };
  return {
    pending: coreAgenda.pending.map(wrap),
    done: coreAgenda.done.map(wrap),
    cancelled: coreAgenda.cancelled.map(wrap),
    overdue: coreAgenda.overdue.map(wrap),
    withoutTime: coreAgenda.withoutTime.map(wrap)
  };
}

function pmUserStatKey(value = "") {
  return String(value || "").trim().toLowerCase();
}

function pmParseDateMs(value) {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}

function pmLatestIso(...values) {
  let best = "";
  let bestMs = 0;
  values.forEach(value => {
    const ms = pmParseDateMs(value);
    if (ms > bestMs) {
      bestMs = ms;
      best = value;
    }
  });
  return best;
}

function pmGetMergedUserStat(stats = {}, patient = {}) {
  const normalizePresenceKey = value => {
    if (window.PPF_PRESENCE?.normalizeKey) {
      return window.PPF_PRESENCE.normalizeKey(value);
    }

    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/^@+/, "")
      .replace(/\s+/g, "");
  };

  const candidateKeys = new Set([
    patient.nickname,
    patient.id,
    patient.nombre,
    patient.name,
    patient.username
  ].filter(Boolean).map(normalizePresenceKey));

  const merged = {
    count: 0,
    online: false,
    lastLogin: null,
    lastSeen: null,
    lastHeartbeat: null,
    lastActivity: null,
    lastSync: null,
    lastLogout: null,
    device: "",
    sessions: {}
  };

  Object.entries(stats || {}).forEach(([rawKey, item]) => {
    if (!item || typeof item !== "object") return;

    const itemKeys = [
      rawKey,
      item.nickname,
      item.username,
      item.patientNickname,
      item.patientId,
      item.nombre,
      item.name
    ].filter(Boolean).map(normalizePresenceKey);

    if (!itemKeys.some(key => candidateKeys.has(key))) return;

    const count = Number(item.count ?? item.accessCount ?? item.accesos ?? 0);
    merged.count = Math.max(merged.count, count);

    merged.lastLogin = pmLatestIso(
      merged.lastLogin,
      item.lastLogin,
      item.last_login,
      item.lastConnection,
      item.ultimaConexion
    );

    merged.lastSeen = pmLatestIso(
      merged.lastSeen,
      item.lastSeen,
      item.last_seen
    );

    merged.lastHeartbeat = pmLatestIso(
      merged.lastHeartbeat,
      item.lastHeartbeat,
      item.last_heartbeat
    );

    merged.lastActivity = pmLatestIso(
      merged.lastActivity,
      item.lastActivity,
      item.last_activity
    );

    merged.lastSync = pmLatestIso(
      merged.lastSync,
      item.lastSync,
      item.last_sync
    );

    merged.lastLogout = pmLatestIso(
      merged.lastLogout,
      item.lastLogout,
      item.last_logout
    );

    if (item.sessions && typeof item.sessions === "object") {
      Object.entries(item.sessions).forEach(([sessionId, incoming]) => {
        if (!incoming || typeof incoming !== "object") return;
        const current = merged.sessions[sessionId];
        const currentTime = pmParseDateMs(pmLatestIso(current?.lastActivity, current?.lastHeartbeat, current?.lastSeen, current?.lastLogout));
        const incomingTime = pmParseDateMs(pmLatestIso(incoming.lastActivity, incoming.lastHeartbeat, incoming.lastSeen, incoming.lastLogout));
        if (!current || incomingTime >= currentTime) merged.sessions[sessionId] = incoming;
      });
    }

    if (item.device && !merged.device) merged.device = item.device;
  });

  const latestActivity = window.PPF_PRESENCE?.activityIso
    ? window.PPF_PRESENCE.activityIso(merged)
    : pmLatestIso(
        merged.lastActivity,
        merged.lastHeartbeat,
        merged.lastSeen,
        merged.lastSync,
        merged.lastLogin
      );

  merged.lastActivity = latestActivity;

  const freshestSession = Object.values(merged.sessions || {}).sort((a, b) => {
    const aMs = pmParseDateMs(pmLatestIso(a?.lastActivity, a?.lastHeartbeat, a?.lastSeen, a?.lastLogout));
    const bMs = pmParseDateMs(pmLatestIso(b?.lastActivity, b?.lastHeartbeat, b?.lastSeen, b?.lastLogout));
    return bMs - aMs;
  })[0];
  if (freshestSession?.device) merged.device = freshestSession.device;

  merged.online = window.PPF_PRESENCE?.isOnline
    ? window.PPF_PRESENCE.isOnline(merged)
    : (() => {
        const activityMs = pmParseDateMs(latestActivity);
        const logoutMs = pmParseDateMs(merged.lastLogout);
        const fresh = activityMs && (Date.now() - activityMs) < 95000;
        const logoutDominates = logoutMs && (!activityMs || logoutMs >= activityMs);
        return Boolean(fresh && !logoutDominates);
      })();

  return merged;
}

function pmFormatLastLogin(value) {
  if (!value) return "Nunca";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Nunca";
  return date.toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
}


function pmFormatRelativeActivity(value) {
  if (!value) return "Sin actividad";
  const ms = pmParseDateMs(value);
  if (!ms) return "Sin actividad";
  const diff = Math.max(0, Date.now() - ms);
  const sec = Math.round(diff / 1000);
  if (sec < 10) return "Ahora";
  if (sec < 60) return `Hace ${sec} s`;
  const min = Math.round(sec / 60);
  if (min < 60) return `Hace ${min} min`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.round(hours / 24);
  return `Hace ${days} d`;
}

function pmSetDashboardKpis(mode = "paciente") {
  const cards = document.querySelectorAll(".dashboard-grid .stat-card");
  if (cards.length < 3) return;

  const setCard = (index, label, main, items = []) => {
    const card = cards[index];
    const span = card.querySelector("span");
    const strong = card.querySelector("strong");
    const oldList = card.querySelector(".kpi-mini-list");
    if (oldList) oldList.remove();
    if (span) span.textContent = label;
    if (strong) strong.textContent = main;
    if (items.length) {
      const list = document.createElement("div");
      list.className = "kpi-mini-list";
      // La lista usa exactamente el mismo array que alimenta el contador.
      // No limitar a cuatro elementos: el contenedor ya dispone de scroll.
      list.innerHTML = items.map(item => `<div title="${String(item).replace(/"/g, '&quot;')}">${item}</div>`).join("");
      card.appendChild(list);
    }
  };

  const renderNormalKpis = () => {
  setCard(0, "Pacientes activos", patients.length);

  if (mode === "valoraciones") {
    const ultimas = [...valoraciones]
      .sort((a, b) =>
        String(b.fecha || "").localeCompare(String(a.fecha || "")) ||
        String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
      )
      .slice(0, 4)
      .map(item => {
        const patient = patients.find(p => p.nickname === item.patientNickname);
        const nombre = patient ? patient.nombre : (item.patientNickname || "Paciente");
        const test = (item.tests || []).map(t => t.nombre).filter(Boolean).join(", ") || "Valoración";
        return `${nombre} · ${item.fecha || "-"} · ${test}`;
      });

    setCard(1, "Valoraciones generadas", valoraciones.length);
    setCard(2, "Últimas valoraciones", ultimas.length || "-", ultimas);
    return;
  }

  setCard(1, "Registros historial", histories.length);
  setCard(2, "Archivos guardados", patientFiles.length);
};

  const renderAgendaKpis = () => {
    const agenda = pmSessionAgenda();
    setCard(0, "Pacientes activos", patients.length);
    setCard(1, "Sesiones pendientes", agenda.pending.length, agenda.pending.map(item => `${item.patient.nombre} ${pmSessionMicroLabel(item.session)}`));
    setCard(2, "Sesiones terminadas", agenda.done.length, agenda.done.map(item => `${item.patient.nombre} ${pmSessionMicroLabel(item.session)}`));
  };

  const renderBibliotecaKpis = () => {
    const movilidad = exerciseLibrary.filter(e => libraryHasCategory(e, "Movilidad")).length;
    const activacion = exerciseLibrary.filter(e => libraryHasCategory(e, "Activación")).length;
    const principal = exerciseLibrary.filter(e => libraryHasCategory(e, "Sesión Principal")).length;
    const carrera = exerciseLibrary.filter(e => libraryHasCategory(e, "Sesiones Carrera")).length;
    setCard(0, "Pacientes activos", patients.length);
    setCard(1, "Ejercicios biblioteca", exerciseLibrary.length, [
      `Movilidad: ${movilidad}`,
      `Activación: ${activacion}`,
      `Sesión Principal: ${principal}`,
      `Sesiones Carrera: ${carrera}`
    ]);

    const withVideo = exerciseLibrary.filter(item => {
      const normalized = normalizeLibraryItem(item);
      return Boolean(normalized.url);
    }).length;
    const withoutVideo = Math.max(0, exerciseLibrary.length - withVideo);
    const videoCoverage = exerciseLibrary.length
      ? Math.round((withVideo / exerciseLibrary.length) * 100)
      : 0;

    setCard(2, "Cobertura de vídeo", `${videoCoverage}%`, [
      `Con vídeo: ${withVideo}`,
      `Sin vídeo: ${withoutVideo}`
    ]);
  };

  if (mode === "usuarios" || mode === "sesiones") {
    renderAgendaKpis();
    return;
  }

  if (mode === "biblioteca") {
    renderBibliotecaKpis();
    return;
  }

  renderNormalKpis();
}

function renderUsersPage() {
  if (patients.length === 0) {
    return `<p>No hay pacientes creados todavía.</p>`;
  }

  const stats = pmReadJson("userStats", {});

  return `
    <div class="users-test-list users-access-list">
      ${patients.map(patient => {
        const st = pmGetMergedUserStat(stats, patient);
        const online = Boolean(st.online);
        const activitySource = st.lastActivity || st.lastHeartbeat || st.lastSeen || st.lastSync || st.lastLogin;
        const lastLogin = pmFormatLastLogin(activitySource);
        const activityLabel = pmFormatRelativeActivity(activitySource);
        const deviceLabel = st.device ? ` · ${st.device}` : "";
        return `
          <div class="user-test-card user-access-card">
            ${(getPatientPhotoSafe(patient) ? `<img class="patient-thumb" src="${getPatientPhotoSafe(patient)}" alt="${patient.nombre}">` : `<div class="patient-thumb">${patient.nombre.charAt(0).toUpperCase()}</div>`)}
            <div class="user-access-main">
              <strong>${patient.nombre}</strong>
              <p>Accesos: ${st.count || 0} · <span class="status-dot ${online ? "online" : "offline"}"></span> ${online ? "En línea" : "Desconectado"} · ${activityLabel}${deviceLabel}</p>
            </div>
            <div class="user-last-login">
              <span>Última actividad</span>
              <strong>${lastLogin}</strong>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function editSession(sessionId) {
  renderSection("sesiones");
  setTimeout(() => {
    if (typeof window.loadSessionIntoForm === "function") {
      window.loadSessionIntoForm(sessionId);
    }
  }, 50);
}




function libraryEscapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

function getLibraryCategories(item = {}) {
  if (Array.isArray(item.categories) && item.categories.length) {
    return item.categories;
  }
  if (item.category) return [item.category];
  return [];
}

function libraryHasCategory(item = {}, category = "") {
  if (!category) return true;
  return getLibraryCategories(item).includes(category);
}

function getSelectedLibraryCategories() {
  return Array.from(document.querySelectorAll('input[name="libraryCategories"]:checked'))
    .map(input => input.value);
}

function renderLibraryCategoryBadges(item = {}) {
  const categories = getLibraryCategories(item);
  if (!categories.length) return `<span>Sin categoría</span>`;
  return categories.map(category => `<span>${category}</span>`).join("");
}

function libraryOptions(category = "") {
  return exerciseLibrary
    .filter(item => libraryHasCategory(item, category))
    .map(item => `<option value="${item.name}"></option>`)
    .join("");
}

function findLibraryExercise(name, category = "") {
  const normalizedName = String(name || "").toLowerCase();
  return exerciseLibrary.find(item =>
    String(item.name || "").toLowerCase() === normalizedName &&
    libraryHasCategory(item, category)
  );
}


const LIBRARY_TYPE_OPTIONS = Object.freeze({
  "Movilidad": ["Movilidad", "Est. Estático", "Fascias"],
  "Activación": ["T. Superior", "T. Inferior", "Core", "Pliometría", "Tarea de Campo"],
  "Sesión Principal": ["F. ppal. TS", "F. ppal. TI", "Core", "Plyo Extensiva", "Plyo Intensiva", "Lanzamientos", "Mov. Olímpicos", "Tarea de Campo"],
  "Sesiones Carrera": ["Carrera continua", "Intervalos", "Sprint", "Recuperación", "Técnica de carrera", "Cuestas", "Fartlek"]
});

function getLibraryTypeOptions() {
  const selected = Array.from(document.querySelectorAll('input[name="libraryCategories"]:checked'))
    .map(input => input.value);
  const categories = selected.length ? selected : Object.keys(LIBRARY_TYPE_OPTIONS);
  return Array.from(new Set(categories.flatMap(category => LIBRARY_TYPE_OPTIONS[category] || [])));
}

function updateLibraryTypeOptions() {
  const list = document.getElementById("libraryTypeOptions");
  if (!list) return;
  const current = String(document.getElementById("libraryType")?.value || "").trim();
  const options = getLibraryTypeOptions();
  if (current && !options.includes(current)) options.push(current);
  list.innerHTML = options
    .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))
    .map(value => `<option value="${libraryEscapeHtml(value)}"></option>`)
    .join("");
}

const bibliotecaHTML = `
  <section class="library-pro-hero">
    <div>
      <p class="eyebrow">BIBLIOTECA INTELIGENTE</p>
      <h2>Biblioteca PRO</h2>
      <p>Organiza, consulta y mantiene todos tus ejercicios sin alterar sus categorías, vídeos ni conexión con Sesiones PRO.</p>
      <div class="library-pro-distribution" aria-label="Distribución por categoría">
        <span>🤸 Movilidad <b id="libraryMobilityStat">0</b></span>
        <span>🔥 Activación <b id="libraryActivationStat">0</b></span>
        <span>🏋️ Principal <b id="libraryMainStat">0</b></span>
        <span>🏃 Carrera <b id="libraryRunningStat">0</b></span>
      </div>
    </div>
    <div class="library-pro-hero-stats" aria-label="Resumen de biblioteca">
      <div><span id="libraryTotalStat">0</span><small>Ejercicios</small></div>
      <div><span id="libraryTypeStat">0</span><small>Tipos registrados</small></div>
      <div><span id="libraryCategoryStat">0</span><small>Categorías</small></div>
    </div>
  </section>

  <section class="library-pro-workspace">
    <aside class="library-pro-editor">
      <div class="library-pro-section-head">
        <div>
          <p class="eyebrow">EDITOR</p>
          <h3 id="libraryEditorTitle">Nuevo ejercicio</h3>
          <p>Crea o edita ejercicios manteniendo intactos sus datos y asignaciones.</p>
        </div>
        <span class="library-pro-editor-icon">＋</span>
      </div>

      <form id="libraryForm">
        <input id="libraryEditingId" type="hidden" />

        <label for="libraryName">Nombre del ejercicio</label>
        <input id="libraryName" type="text" placeholder="Ej: Cat Camel, Sentadilla, Drop Jump..." required />

        <label>Categorías del ejercicio</label>
        <div class="library-pro-category-grid" id="libraryCategoryChecks">
          <label><input type="checkbox" name="libraryCategories" value="Movilidad" /><span>🤸 Movilidad</span></label>
          <label><input type="checkbox" name="libraryCategories" value="Activación" /><span>🔥 Activación</span></label>
          <label><input type="checkbox" name="libraryCategories" value="Sesión Principal" /><span>🏋️ Sesión Principal</span></label>
          <label><input type="checkbox" name="libraryCategories" value="Sesiones Carrera" /><span>🏃 Sesiones Carrera</span></label>
        </div>
        <small class="form-hint">Puedes marcar varias. El ejercicio seguirá apareciendo en todas las categorías seleccionadas.</small>

        <div class="library-pro-fields-2">
          <div>
            <label for="libraryType">Tipo</label>
            <input id="libraryType" type="search" list="libraryTypeOptions" placeholder="Escribe para buscar un tipo..." autocomplete="off" />
            <datalist id="libraryTypeOptions"></datalist>
            <small class="form-hint library-type-hint">Las opciones se adaptan a las categorías marcadas.</small>
          </div>
          <div>
            <label for="libraryUrl">URL vídeo/enlace</label>
            <input id="libraryUrl" type="url" placeholder="https://..." />
          </div>
        </div>

        <label for="libraryDescription">Descripción técnica</label>
        <textarea id="libraryDescription" rows="5" placeholder="Indicaciones, errores comunes, objetivo del ejercicio..."></textarea>

        <div class="library-pro-form-actions">
          <button class="primary-btn" id="librarySubmitBtn" type="submit">Guardar ejercicio</button>
          <button class="secondary-btn" type="button" id="libraryResetBtn">Limpiar</button>
          <button class="secondary-btn" type="button" id="seedLibraryBtn">Biblioteca inicial</button>
        </div>
      </form>
    </aside>

    <div class="library-pro-catalogue">
      <div class="library-pro-catalogue-head">
        <div>
          <p class="eyebrow">CATÁLOGO</p>
          <h3>Ejercicios guardados</h3>
          <p><span id="libraryVisibleCount">0</span> resultados visibles</p>
        </div>
        <div class="library-pro-search">
          <span>⌕</span>
          <input id="librarySearch" type="search" placeholder="Buscar por nombre, tipo o descripción..." autocomplete="off" />
        </div>
      </div>

      <div class="library-pro-filter-pills" role="group" aria-label="Filtrar biblioteca">
        <button class="is-active" type="button" data-library-filter="">Todos</button>
        <button type="button" data-library-filter="Movilidad">Movilidad</button>
        <button type="button" data-library-filter="Activación">Activación</button>
        <button type="button" data-library-filter="Sesión Principal">Principal</button>
        <button type="button" data-library-filter="Sesiones Carrera">Carrera</button>
        <button type="button" data-library-video="true">Con vídeo</button>
      </div>
      <input id="libraryFilter" type="hidden" value="" />
      <div class="library-list library-pro-grid" id="libraryList"></div>
    </div>
  </section>
`;

function normalizeLibraryItem(item = {}, index = 0) {
  const safe = item && typeof item === "object" ? item : {};
  const categories = getLibraryCategories(safe)
    .map(value => String(value || "").trim())
    .filter(Boolean);

  return {
    raw: safe,
    id: String(safe.id ?? safe.exerciseId ?? `library-${index}`),
    name: String(safe.name ?? safe.nombre ?? "Ejercicio").trim() || "Ejercicio",
    type: String(safe.type ?? safe.tipo ?? "").trim(),
    description: String(safe.description ?? safe.descripcion ?? "").trim(),
    url: String(safe.url ?? safe.videoUrl ?? safe.video ?? safe.enlace ?? "").trim(),
    categories
  };
}

function renderLibraryCard(item, index) {
  try {
    const exercise = normalizeLibraryItem(item, index);
    const categoryIconMap = {
      "Movilidad": "🤸",
      "Activación": "🔥",
      "Sesión Principal": "🏋️",
      "Sesiones Carrera": "🏃"
    };
    const categoryOrder = ["Movilidad", "Activación", "Sesión Principal", "Sesiones Carrera"];
    const orderedCategories = categoryOrder.filter(category => exercise.categories.includes(category));
    const extraCategories = exercise.categories.filter(category => !categoryOrder.includes(category));
    const visibleCategories = [...orderedCategories, ...extraCategories];
    const icons = visibleCategories.length
      ? visibleCategories.map(category => `<span title="${libraryEscapeHtml(category)}">${categoryIconMap[category] || "📌"}</span>`).join("")
      : `<span title="Sin categoría">📌</span>`;
    const encodedId = encodeURIComponent(exercise.id);
    const badges = exercise.categories.length
      ? exercise.categories.map(category => `<span>${libraryEscapeHtml(category)}</span>`).join("")
      : `<span>Sin categoría</span>`;

    return `
      <article class="library-card library-pro-card" data-library-card-id="${libraryEscapeHtml(exercise.id)}">
        <div class="library-pro-card-top">
          <div class="library-pro-card-icons" aria-label="Categorías del ejercicio">${icons}</div>
          <div class="library-pro-card-title">
            <h3>${libraryEscapeHtml(exercise.name)}</h3>
            <p>${libraryEscapeHtml(exercise.type || "Tipo sin especificar")}</p>
          </div>
          <span class="library-pro-video-state ${exercise.url ? "has-video" : ""}">${exercise.url ? "▶ Vídeo" : "Sin vídeo"}</span>
        </div>
        <p class="library-pro-description">${libraryEscapeHtml(exercise.description || "Sin descripción técnica.")}</p>
        <div class="library-pro-badges">${badges}</div>
        <div class="library-pro-card-actions">
          ${exercise.url ? `<a class="secondary-btn" href="${libraryEscapeHtml(exercise.url)}" target="_blank" rel="noopener">▶ Ver vídeo</a>` : `<button class="secondary-btn" type="button" disabled>Sin enlace</button>`}
          <button class="edit-btn" type="button" data-library-action="edit" data-library-id="${encodedId}">✎ Editar</button>
          <button class="danger-btn" type="button" data-library-action="delete" data-library-id="${encodedId}">Eliminar</button>
        </div>
      </article>
    `;
  } catch (error) {
    console.error("[Biblioteca PRO] No se pudo renderizar un ejercicio", { index, item, error });
    return `
      <article class="library-card library-pro-card library-pro-card-error">
        <div class="library-pro-card-top">
          <div class="library-pro-card-icon">⚠️</div>
          <div class="library-pro-card-title">
            <h3>Ejercicio con datos incompatibles</h3>
            <p>El resto del catálogo continúa disponible.</p>
          </div>
        </div>
      </article>
    `;
  }
}

function renderLibraryList() {
  const list = document.getElementById("libraryList");
  const filter = document.getElementById("libraryFilter");
  const search = document.getElementById("librarySearch");
  if (!list) return;

  const category = filter?.value || "";
  const query = String(search?.value || "").trim().toLowerCase();
  const videoOnly = filter?.dataset.videoOnly === "true";
  const normalizedLibrary = (Array.isArray(exerciseLibrary) ? exerciseLibrary : [])
    .map((item, index) => normalizeLibraryItem(item, index));

  const visible = normalizedLibrary
    .filter(item => !category || item.categories.includes(category))
    .filter(item => !videoOnly || Boolean(item.url))
    .filter(item => {
      if (!query) return true;
      const haystack = [item.name, item.type, item.description, ...item.categories]
        .filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));

  const categories = new Set(normalizedLibrary.flatMap(item => item.categories).filter(Boolean));
  const uniqueTypes = new Set(normalizedLibrary.map(item => item.type.trim().toLocaleLowerCase("es")).filter(Boolean));
  const categoryCount = categoryName => normalizedLibrary.filter(item => item.categories.includes(categoryName)).length;
  const statTotal = document.getElementById("libraryTotalStat");
  const statTypes = document.getElementById("libraryTypeStat");
  const statCategories = document.getElementById("libraryCategoryStat");
  const statMobility = document.getElementById("libraryMobilityStat");
  const statActivation = document.getElementById("libraryActivationStat");
  const statMain = document.getElementById("libraryMainStat");
  const statRunning = document.getElementById("libraryRunningStat");
  const visibleCount = document.getElementById("libraryVisibleCount");
  if (statTotal) statTotal.textContent = normalizedLibrary.length;
  if (statTypes) statTypes.textContent = uniqueTypes.size;
  if (statCategories) statCategories.textContent = Object.keys(LIBRARY_TYPE_OPTIONS).length;
  if (statMobility) statMobility.textContent = categoryCount("Movilidad");
  if (statActivation) statActivation.textContent = categoryCount("Activación");
  if (statMain) statMain.textContent = categoryCount("Sesión Principal");
  if (statRunning) statRunning.textContent = categoryCount("Sesiones Carrera");
  if (visibleCount) visibleCount.textContent = visible.length;

  // El contador y el catálogo se actualizan en la misma operación para evitar estados contradictorios.
  list.replaceChildren();

  if (visible.length === 0) {
    list.innerHTML = `<div class="library-pro-empty"><span>⌕</span><strong>No hay ejercicios que coincidan</strong><small>Prueba con otra búsqueda o cambia el filtro.</small></div>`;
    return;
  }

  list.innerHTML = visible.map((item, index) => renderLibraryCard(item.raw, index)).join("");
}

function bindLibraryForm() {
  const form = document.getElementById("libraryForm");
  const filter = document.getElementById("libraryFilter");
  const search = document.getElementById("librarySearch");
  if (!form) return;

  document.querySelectorAll('input[name="libraryCategories"]').forEach(input => {
    input.addEventListener("change", updateLibraryTypeOptions);
  });
  updateLibraryTypeOptions();

  const list = document.getElementById("libraryList");
  if (list && !list.dataset.actionsBound) {
    list.dataset.actionsBound = "true";
    list.addEventListener("click", event => {
      const trigger = event.target.closest("[data-library-action]");
      if (!trigger) return;
      const id = decodeURIComponent(trigger.dataset.libraryId || "");
      if (trigger.dataset.libraryAction === "edit") editLibraryExercise(id);
      if (trigger.dataset.libraryAction === "delete") deleteLibraryExercise(id);
    });
  }

  if (search) search.addEventListener("input", renderLibraryList);
  document.querySelectorAll("[data-library-filter]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".library-pro-filter-pills button").forEach(item => item.classList.remove("is-active"));
      button.classList.add("is-active");
      if (filter) {
        filter.value = button.dataset.libraryFilter || "";
        filter.dataset.videoOnly = "false";
      }
      renderLibraryList();
    });
  });
  const videoFilter = document.querySelector("[data-library-video]");
  if (videoFilter) videoFilter.addEventListener("click", () => {
    document.querySelectorAll(".library-pro-filter-pills button").forEach(item => item.classList.remove("is-active"));
    videoFilter.classList.add("is-active");
    if (filter) {
      filter.value = "";
      filter.dataset.videoOnly = "true";
    }
    renderLibraryList();
  });

  const resetForm = () => {
    form.reset();
    document.querySelectorAll('input[name="libraryCategories"]').forEach(input => input.checked = false);
    document.getElementById("libraryEditingId").value = "";
    document.getElementById("librarySubmitBtn").textContent = "Guardar ejercicio";
    const title = document.getElementById("libraryEditorTitle");
    if (title) title.textContent = "Nuevo ejercicio";
    updateLibraryTypeOptions();
  };
  document.getElementById("libraryResetBtn")?.addEventListener("click", resetForm);

  const seedBtn = document.getElementById("seedLibraryBtn");
  if (seedBtn) {
    seedBtn.addEventListener("click", () => {
      seedExerciseLibrary(true);
      renderLibraryList();
      alert("Biblioteca inicial cargada.");
    });
  }

  form.addEventListener("submit", event => {
    event.preventDefault();

    const editingId = document.getElementById("libraryEditingId").value;
    const selectedCategories = getSelectedLibraryCategories();

    if (selectedCategories.length === 0) {
      alert("Marca al menos una categoría.");
      return;
    }

    const payload = {
      id: editingId || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      name: document.getElementById("libraryName").value.trim(),
      category: selectedCategories[0],
      categories: selectedCategories,
      type: document.getElementById("libraryType").value.trim(),
      url: document.getElementById("libraryUrl").value.trim(),
      description: document.getElementById("libraryDescription").value.trim()
    };

    const duplicated = exerciseLibrary.some(item =>
      item.name.toLowerCase() === payload.name.toLowerCase() &&
      item.id !== editingId &&
      getLibraryCategories(item).some(category => selectedCategories.includes(category))
    );

    if (duplicated) {
      alert("Ese ejercicio ya existe en esa categoría.");
      return;
    }

    if (editingId) {
      exerciseLibrary = exerciseLibrary.map(item => item.id === editingId ? payload : item);
    } else {
      exerciseLibrary.push(payload);
    }

    localStorage.setItem("exerciseLibrary", JSON.stringify(exerciseLibrary));
    resetForm();
    renderLibraryList();
    updateKpis("biblioteca");
  });

  renderLibraryList();
}

function editLibraryExercise(id) {
  const item = exerciseLibrary.find(exercise => exercise.id === id);
  if (!item) return;

  renderSection("biblioteca");
  setTimeout(() => {
    document.getElementById("libraryEditingId").value = item.id;
    document.getElementById("libraryName").value = item.name;
    const itemCategories = getLibraryCategories(item);
    document.querySelectorAll('input[name="libraryCategories"]').forEach(input => {
      input.checked = itemCategories.includes(input.value);
    });
    updateLibraryTypeOptions();
    document.getElementById("libraryType").value = item.type || "";
    updateLibraryTypeOptions();
    document.getElementById("libraryUrl").value = item.url || "";
    document.getElementById("libraryDescription").value = item.description || "";
    document.getElementById("librarySubmitBtn").textContent = "Actualizar ejercicio";
    const title = document.getElementById("libraryEditorTitle");
    if (title) title.textContent = "Editar ejercicio";
    document.querySelector(".library-pro-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 0);
}

window.editLibraryExercise = editLibraryExercise;
window.deleteLibraryExercise = deleteLibraryExercise;

function deleteLibraryExercise(id) {
  const item = exerciseLibrary.find(exercise => exercise.id === id);
  if (!item) return;
  if (!confirm(`¿Eliminar ${item.name} de la biblioteca?`)) return;

  exerciseLibrary = exerciseLibrary.filter(exercise => exercise.id !== id);
  localStorage.setItem("exerciseLibrary", JSON.stringify(exerciseLibrary));
  renderSection("biblioteca");
}

function getSessionExercises(session) {
  const exercises = [];

  function add(exerciseList = [], moduleName = "") {
    exerciseList.forEach(item => {
      if (!item || item.deleted) return;
      if (item.nombre || item.series || item.repeticiones || item.url) {
        exercises.push({ ...item, moduleName });
      }
    });
  }

  add(session.modules?.movilidad || [], "Movilidad");
  add(session.modules?.activacion || [], "Activación");

  const blocks = session.modules?.principal?.blocks;
  if (blocks) {
    ["bloque1", "bloque2", "bloque3", "bloque4"].forEach(blockKey => {
      add(blocks[blockKey]?.exercises || [], "Sesión Principal");
    });
  }

  return exercises;
}

function getSessionTotalSeries(session) {
  return getSessionExercises(session).reduce((total, item) => {
    const series = Number(item.series);
    return total + (Number.isNaN(series) ? 0 : series);
  }, 0);
}

function getSessionTonnage(session) {
  return getSessionExercises(session).reduce((total, item) => {
    if ((item.unidad || "Kg") !== "Kg") return total;

    const series = Number(item.series);
    const reps = Number(String(item.repeticiones || "").replace(",", "."));
    const carga = Number(String(item.carga || "").replace(",", "."));

    if (Number.isNaN(series) || Number.isNaN(reps) || Number.isNaN(carga)) return total;

    return total + (series * reps * carga);
  }, 0);
}


function safeDistributionPercent(value, total) {
  const numericValue = Number(value) || 0;
  const numericTotal = Number(total) || 0;

  if (!numericTotal) return 0;

  return Math.round((numericValue / numericTotal) * 100);
}

function safeDistributionWidth(value, total) {
  return safeDistributionPercent(value, total);
}

function getWeeklyVolumeData(patientNickname = "") {
  normalizeSessionMicrocycles(patientNickname);
  const filtered = sessions
    .filter(session => (!patientNickname || session.patientNickname === patientNickname) && session.microciclo)
    .sort((a, b) => Number(a.microciclo) - Number(b.microciclo));

  const grouped = {};

 filtered.forEach(session => {

  const micro = Number(session.microciclo || 1);
  const key = `M${micro}`;

  if (!grouped[key]) {
    grouped[key] = {
      micro,
      label: key,
      series: 0,
      exercises: 0,
      sessionsInMicro: 0,
      sessions: 0,
      tonnage: 0,
      dates: [],
      sessionDetails: []
    };
  }

    grouped[key].series += getSessionTotalSeries(session);
    grouped[key].exercises += getSessionExercises(session).length;
    grouped[key].sessionsInMicro += 1;
    if (session.fecha && !grouped[key].dates.includes(session.fecha)) {
      grouped[key].dates.push(session.fecha);
    }
    grouped[key].sessionDetails.push({
      date: session.fecha || "",
      time: session.scheduledTime || session.hora || "",
      order: Number(session.microSequenceOrder || session.subsessionOrder || session.dayOrder || 0),
      number: (typeof nciDisplayNumber === "function" ? nciDisplayNumber(session) : (session.displaySessionNumber || session.numero || ""))
    });
    grouped[key].tonnage += getSessionTonnage(session);
  });

  const ordered = Object.values(grouped).sort((a, b) => a.micro - b.micro);
  ordered.forEach(item => {
    item.sessions = item.sessionsInMicro;
    item.dates = [...(item.dates || [])].sort((a, b) => String(a).localeCompare(String(b)));
    item.sessionDetails = [...(item.sessionDetails || [])].sort((a, b) => {
      const dateCompare = String(a.date || "").localeCompare(String(b.date || ""));
      if (dateCompare !== 0) return dateCompare;
      const timeCompare = String(a.time || "23:59").localeCompare(String(b.time || "23:59"));
      if (timeCompare !== 0) return timeCompare;
      return Number(a.order || 0) - Number(b.order || 0);
    });
  });


  return ordered;
}

function isPlyometricExercise(item) {
  const type = (item?.tipo || "").toLowerCase();
  return type.includes("plyo") || type.includes("pliometr");
}

function getPlyometricVolumeData(patientNickname = "") {
  const weeklyBase = typeof getWeeklyVolumeData === "function" ? getWeeklyVolumeData(patientNickname) : [];
  const grouped = {};

  weeklyBase.forEach(item => {
    grouped[item.label] = {
      micro: item.micro,
      label: item.label,
      series: 0,
      exercises: 0,
      sessionsInMicro: item.sessionsInMicro || 0,
      sessions: item.sessions || 0,
      dates: item.dates || [],
      sessionDetails: item.sessionDetails || []
    };
  });

  const filtered = sessions.filter(session =>
    (!patientNickname || session.patientNickname === patientNickname) &&
    session.microciclo
  );

  function addPlyoExercises(session, exercises = []) {
    exercises.forEach(item => {
      if (!item || item.deleted || !isPlyometricExercise(item)) return;

      const series = Number(item.series);
      if (Number.isNaN(series)) return;

      const key = `M${session.microciclo}`;

      if (!grouped[key]) {
        grouped[key] = {
          micro: Number(session.microciclo),
          label: key,
          series: 0,
          exercises: 0,
          sessionsInMicro: 0,
          sessions: 0,
          dates: [],
          sessionDetails: []
        };
      }

      grouped[key].series += series;
      grouped[key].exercises += 1;
    });
  }

  filtered.forEach(session => {
    addPlyoExercises(session, session.modules?.activacion || []);

    const blocks = session.modules?.principal?.blocks;
    if (blocks) {
      ["bloque1", "bloque2", "bloque3", "bloque4"].forEach(blockKey => {
        addPlyoExercises(session, blocks[blockKey]?.exercises || []);
      });
    }
  });

  return Object.values(grouped).sort((a, b) => a.micro - b.micro);
}

function getTrainingDistribution(patientNickname = "") {
  const filtered = sessions.filter(session => !patientNickname || session.patientNickname === patientNickname);
  const buckets = {
    "T. Superior": 0,
    "T. Inferior": 0,
    "Core": 0,
    "Plyo": 0,
    "Otros": 0
  };

  filtered.forEach(session => {
    getSessionExercises(session).forEach(item => {
      const series = Number(item.series);
      const value = Number.isNaN(series) ? 1 : series;
      const type = (item.tipo || "").toLowerCase();

      if (type.includes("superior") || type.includes("ts")) buckets["T. Superior"] += value;
      else if (type.includes("inferior") || type.includes("ti")) buckets["T. Inferior"] += value;
      else if (type.includes("core")) buckets["Core"] += value;
      else if (type.includes("plyo") || type.includes("pliometr")) buckets["Plyo"] += value;
      else buckets["Otros"] += value;
    });
  });

  return Object.entries(buckets).map(([label, value]) => ({ label, value }));
}

function getKpis(patientNickname = "") {
  const weekly = getWeeklyVolumeData(patientNickname);
  const plyo = getPlyometricVolumeData(patientNickname);

  const latest = weekly[weekly.length - 1] || { label: "-", sessions: 0, series: 0, exercises: 0 };
  const totalSeries = weekly.reduce((sum, item) => sum + item.series, 0);
  const totalExercises = weekly.reduce((sum, item) => sum + item.exercises, 0);
  const totalTonnage = weekly.reduce((sum, item) => sum + item.tonnage, 0);
  const totalPlyoSeries = plyo.reduce((sum, item) => sum + item.series, 0);
  const totalPlyoExercises = plyo.reduce((sum, item) => sum + item.exercises, 0);

  return {
    currentMicro: latest.label,
    sessions: weekly.reduce((sum, item) => sum + Number(item.sessionsInMicro || item.sessions || 0), 0),
    series: totalSeries,
    exercises: totalExercises,
    plyoSeries: totalPlyoSeries,
    plyoExercises: totalPlyoExercises,
    tonnage: totalTonnage
  };
}

function escapePeriodicityTooltipAttr(value = "") {
  return String(value || "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function ensurePeriodicityVolumeTooltip() {
  if (document.getElementById("periodicityVolumeTooltip")) return;

  const tooltip = document.createElement("div");
  tooltip.id = "periodicityVolumeTooltip";
  tooltip.style.position = "absolute";
  tooltip.style.zIndex = "99999";
  tooltip.style.pointerEvents = "none";
  tooltip.style.display = "none";
  tooltip.style.maxWidth = "280px";
  tooltip.style.padding = "12px 14px";
  tooltip.style.borderRadius = "14px";
  tooltip.style.background = "rgba(2, 6, 23, 0.96)";
  tooltip.style.border = "1px solid rgba(34, 197, 94, 0.45)";
  tooltip.style.boxShadow = "0 18px 45px rgba(0,0,0,.38)";
  tooltip.style.color = "#e5fcef";
  tooltip.style.fontSize = "12px";
  tooltip.style.lineHeight = "1.45";
  tooltip.style.whiteSpace = "pre-line";
  document.body.appendChild(tooltip);

  document.addEventListener("pointermove", event => {
    const target = event.target.closest(".periodicity-tooltip-source");
    if (!target) {
      tooltip.style.display = "none";
      return;
    }

    tooltip.textContent = target.dataset.tooltip || "";
    tooltip.style.display = "block";

    const offset = 16;
    let left = event.pageX + offset;
    let top = event.pageY + offset;

    const rect = tooltip.getBoundingClientRect();

    if (left + rect.width > window.scrollX + window.innerWidth - 14) {
      left = event.pageX - rect.width - offset;
    }

    if (top + rect.height > window.scrollY + window.innerHeight - 14) {
      top = event.pageY - rect.height - offset;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  });

  document.addEventListener("pointerout", event => {
    if (!event.target.closest(".periodicity-tooltip-source")) return;
    tooltip.style.display = "none";
  });
}

function renderVolumeBarChart(data, chartId, tableBodyId, emptyMessage = "No hay datos registrados todavía.", options = {}) {
  const chart = document.getElementById(chartId);
  const tbody = document.getElementById(tableBodyId);
  if (!chart || !tbody) return;

  ensurePeriodicityVolumeTooltip();

  if (data.length === 0) {
    chart.innerHTML = `<p>${emptyMessage}</p>`;
    tbody.innerHTML = "";
    return;
  }

  const valueKey = options.valueKey || "series";
  const maxValue = Math.max(...data.map(item => item[valueKey] || 0), 1);
  const currentMicroNumber = Math.max(...data.map(item => Number(item.micro) || 0));

  chart.innerHTML = data.map(item => {
    const value = item[valueKey] || 0;
    const height = Math.max((value / maxValue) * 100, 6);
    const realSessions = Number(item.sessionsInMicro || item.sessions || 0);
    const sessionDates = [...(item.dates || [])].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b)));
    const sessionDatesLabel = sessionDates.length ? sessionDates.join(" · ") : "Sin fechas registradas";
    const orderedSessionDetails = [...(item.sessionDetails || [])].sort((a, b) => {
      const dateCompare = String(a.date || "").localeCompare(String(b.date || ""));
      if (dateCompare !== 0) return dateCompare;
      const timeCompare = String(a.time || "23:59").localeCompare(String(b.time || "23:59"));
      if (timeCompare !== 0) return timeCompare;
      return Number(a.order || 0) - Number(b.order || 0);
    });
    const formatTooltipDate = (value) => {
      if (!value) return "Sin fecha";
      const [year, month, day] = String(value).split("-").map(Number);
      if (!year || !month || !day) return String(value);
      return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short" }).format(new Date(year, month - 1, day));
    };
    const sessionTimeline = orderedSessionDetails.map((detail, index) => {
      const sessionNumber = detail.number || `${item.micro}.${index + 1}`;
      return `• ${formatTooltipDate(detail.date)} · Sesión ${sessionNumber}`;
    });

    const tooltipLines = [
      item.label,
      `Sesiones: ${realSessions}`,
      `Ejercicios: ${item.exercises ?? 0}`,
      `Series: ${item.series ?? 0}`,
      Number(item.tonnage || 0) ? `Tonelaje: ${Math.round(item.tonnage)} kg` : "",
      sessionTimeline.length ? "" : (sessionDates.length ? `Fechas: ${sessionDates.map(formatTooltipDate).join(" · ")}` : ""),
      ...sessionTimeline
    ].filter(line => line !== undefined && line !== null);

    const tooltipText = tooltipLines.join("\n");
    const tooltipTitle = tooltipLines.join(" | ");
    const safeTooltip = escapePeriodicityTooltipAttr(tooltipText);
    const safeTitle = escapePeriodicityTooltipAttr(tooltipTitle);
    const safeDates = escapePeriodicityTooltipAttr(sessionDatesLabel);
    const shownValue = options.format ? options.format(value) : value;
    const valueClass = String(shownValue).length >= 5 ? "bar-value-compact" : "";
    const isCurrentMicro = currentMicroNumber > 0 && Number(item.micro) === currentMicroNumber;
    const finalTooltip = isCurrentMicro ? `${tooltipText}\n\n🟢 ` : tooltipText;
    const safeFinalTooltip = escapePeriodicityTooltipAttr(finalTooltip);
    const currentLabel = isCurrentMicro ? "● " : "";
    
    return `
      <div class="volume-bar-item periodicity-tooltip-source ${isCurrentMicro ? "current-micro" : ""}" data-tooltip="${safeFinalTooltip}">
        <div class="volume-bar-wrap">
          ${isCurrentMicro ? `<span class="current-micro-badge">Actual</span>` : ""}
          <div class="volume-bar" style="height:${height}%">
            <span class="${valueClass}">${shownValue}</span>
          </div>
        </div>
        <strong class="periodicity-micro-summary" aria-label="${item.label}, ${realSessions} sesión${realSessions === 1 ? "" : "es"}">${currentLabel}${item.label}<span aria-hidden="true">×${realSessions}</span></strong>
      </div>
    `;
  }).join("");

  tbody.innerHTML = data.map(item => `
    <tr>
      <td>${item.label}</td>
      <td>${item.sessionsInMicro || item.sessions || 0}</td>
      <td>${item.exercises ?? "-"}</td>
      <td>${options.format ? options.format(item[valueKey] || 0) : (item[valueKey] || 0)}</td>
    </tr>
  `).join("");
}



function getSessionExercisesForDistribution(session) {
  const exercises = [];

  const add = (list = [], fallbackModule = "") => {
    if (!Array.isArray(list)) return;

    list.forEach(item => {
      if (!item || item.deleted) return;

      if (item.nombre || item.name || item.ejercicio || item.series || item.tipo || item.type || item.url) {
        exercises.push({
          ...item,
          moduleName: item.moduleName || fallbackModule
        });
      }
    });
  };

  add(session.modules?.movilidad, "Movilidad");
  add(session.modules?.activacion, "Activación");
  add(session.movilidad, "Movilidad");
  add(session.activacion, "Activación");

  const principal = session.modules?.principal;
  const blocks = principal?.blocks || session.principal?.blocks || session.sessionPrincipal?.blocks;

  if (blocks) {
    ["bloque1", "bloque2", "bloque3", "bloque4", "block1", "block2", "block3", "block4"].forEach(key => {
      add(blocks[key]?.exercises || blocks[key]?.ejercicios || blocks[key], "Sesión Principal");
    });
  }

  add(session.modules?.principal?.exercises, "Sesión Principal");
  add(session.principal, "Sesión Principal");
  add(session.exercises, "Sesión Principal");
  add(session.ejercicios, "Sesión Principal");

  return exercises;
}

function classifyDistributionExercise(item) {
  const type = String(item.tipo || item.type || item.categoria || item.category || "").toLowerCase();
  const moduleName = String(item.moduleName || "").toLowerCase();

  if (type.includes("superior") || type === "ts" || type.includes("f.ppal. ts")) return "T. Superior";
  if (type.includes("inferior") || type === "ti" || type.includes("f. ppal. ti")) return "T. Inferior";
  if (type.includes("core")) return "Core";
  if (type.includes("plyo") || type.includes("plio") || type.includes("pliometr")) return "Plyo";

  if (moduleName.includes("movilidad")) return "Otros";
  if (moduleName.includes("activ")) return "Otros";

  return "Otros";
}

function getDistributionSeriesValue(item) {
  const series = Number(String(item.series || item.serie || item.numSeries || "").replace(",", "."));
  return Number.isFinite(series) && series > 0 ? series : 1;
}

function buildDistributionData(patientNickname = "") {
  const distribution = {
    "T. Superior": 0,
    "T. Inferior": 0,
    "Core": 0,
    "Plyo": 0,
    "Otros": 0
  };

  sessions
    .filter(session => !patientNickname || session.patientNickname === patientNickname)
    .forEach(session => {
      getSessionExercisesForDistribution(session).forEach(item => {
        const category = classifyDistributionExercise(item);
        distribution[category] += getDistributionSeriesValue(item);
      });
    });

  return distribution;
}

// Compatibilidad Periodicidad PRO: algunas partes del panel llaman a estos nombres.
// Si no existen, el render se corta y las gráficas quedan vacías.
function buildPeriodicityDistributionData(patientNickname = "") {
  return buildDistributionData(patientNickname);
}

function renderPeriodicityDistributionRows(patientNickname = "") {
  const distribution = buildPeriodicityDistributionData(patientNickname);
  const total = Object.values(distribution).reduce((sum, value) => sum + (Number(value) || 0), 0);

  return Object.entries(distribution).map(([label, value]) => {
    const percent = total ? Math.round(((Number(value) || 0) / total) * 100) : 0;
    return `
      <div class="distribution-row">
        <span>${label}</span>
        <div class="distribution-track">
          <div class="distribution-fill" style="width:${percent}%"></div>
        </div>
        <strong>${percent}%</strong>
      </div>
    `;
  }).join("");
}

function getPeriodicityKpis(patientNickname = "") {
  return getKpis(patientNickname);
}


function updatePeriodicityDistributionChart(patientNickname = "") {
  const target = document.getElementById("distributionChart");
  if (target) {
    target.innerHTML = renderPeriodicityDistributionRows(patientNickname);
    return;
  }

  const distributionCard = [...document.querySelectorAll(".periodicity-card")]
    .find(card => card.textContent.includes("TS") && card.textContent.includes("TI") && card.textContent.includes("Core") && card.textContent.includes("Plyo"));

  if (!distributionCard) return;

  let chart = distributionCard.querySelector(".distribution-chart");
  if (!chart) {
    chart = document.createElement("div");
    chart.className = "distribution-chart";
    chart.id = "distributionChart";
    distributionCard.appendChild(chart);
  }

  chart.innerHTML = renderPeriodicityDistributionRows(patientNickname);
}

function renderDistributionRows(patientNickname = "") {
  const distribution = buildPeriodicityDistributionData(patientNickname);
  const total = Object.values(distribution).reduce((sum, value) => sum + (Number(value) || 0), 0);

  return Object.entries(distribution).map(([label, value]) => {
    const percent = total ? Math.round(((Number(value) || 0) / total) * 100) : 0;
    return `
      <div class="distribution-row">
        <span>${label}</span>
        <div class="distribution-track">
          <div class="distribution-fill" style="width:${percent}%"></div>
        </div>
        <strong>${percent}%</strong>
      </div>
    `;
  }).join("");
}

function renderPeriodicityDistributionFixed(patientNickname = "") {
  return `
    <div class="distribution-chart" id="distributionChart">
      ${renderPeriodicityDistributionRows(patientNickname)}
    </div>
  `;
}

function renderTrainingDistribution(patientNickname = "") {
  return renderPeriodicityDistributionFixed(patientNickname);
}

function renderPeriodicityKpis(patientNickname = "") {
  const kpis = getPeriodicityKpis(patientNickname);
  const area = document.getElementById("periodicityKpis");
  if (!area) return;

  area.innerHTML = `
    <article class="periodicity-kpi"><span></span><strong>${kpis.currentMicro}</strong></article>
    <article class="periodicity-kpi"><span>Sesiones acumuladas</span><strong>${kpis.sessions}</strong></article>
    <article class="periodicity-kpi"><span>Series acumuladas</span><strong>${kpis.series}</strong></article>
    <article class="periodicity-kpi"><span>Ejercicios programados</span><strong>${kpis.exercises}</strong></article>
    <article class="periodicity-kpi plyo"><span>Series pliometría</span><strong>${kpis.plyoSeries}</strong></article>
    <article class="periodicity-kpi plyo"><span>Ejercicios pliometría</span><strong>${kpis.plyoExercises}</strong></article>
    <article class="periodicity-kpi"><span>Tonelaje Kg</span><strong>${Math.round(kpis.tonnage)}</strong></article>
  `;
}


function animatePeriodicityBars() {
  const charts = document.querySelectorAll(".volume-chart");

  charts.forEach(chart => {
    chart.classList.remove("ppf-chart-animated");

    const bars = chart.querySelectorAll(".volume-bar");
    bars.forEach(bar => {
      bar.classList.remove("ppf-bar-animate");
      bar.style.animationDelay = "0ms";
    });
  });

  if (window.ppfPeriodicityObserver) {
    window.ppfPeriodicityObserver.disconnect();
  }

  window.ppfPeriodicityObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const chart = entry.target;
      if (chart.classList.contains("ppf-chart-animated")) return;

      chart.classList.add("ppf-chart-animated");

      chart.querySelectorAll(".volume-bar").forEach((bar, index) => {
        bar.classList.remove("ppf-bar-animate");
        bar.style.animationDelay = `${index * 45}ms`;

        void bar.offsetWidth;

        bar.classList.add("ppf-bar-animate");
      });
    });
  }, {
    threshold: 0.28
  });

  charts.forEach(chart => window.ppfPeriodicityObserver.observe(chart));
}


function animatePeriodicityDistribution() {
  const chart = document.getElementById("distributionChart");
  if (!chart) return;

  chart.classList.remove("ppf-distribution-chart-animated");

  chart.querySelectorAll(".distribution-fill").forEach(fill => {
    fill.classList.remove("ppf-distribution-animate");
    fill.style.animationDelay = "0ms";
  });

  if (window.ppfPeriodicityDistributionObserver) {
    window.ppfPeriodicityDistributionObserver.disconnect();
  }

  window.ppfPeriodicityDistributionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const targetChart = entry.target;
      if (targetChart.classList.contains("ppf-distribution-chart-animated")) return;

      targetChart.classList.add("ppf-distribution-chart-animated");

      targetChart.querySelectorAll(".distribution-fill").forEach((fill, index) => {
        fill.classList.remove("ppf-distribution-animate");
        fill.style.animationDelay = `${index * 90}ms`;

        void fill.offsetWidth;

        fill.classList.add("ppf-distribution-animate");
      });
    });
  }, {
    threshold: 0.28
  });

  window.ppfPeriodicityDistributionObserver.observe(chart);
}

function renderWeeklyVolumeChart(patientNickname = "") {
  const weeklyData = getWeeklyVolumeData(patientNickname);
  const plyoData = getPlyometricVolumeData(patientNickname);

  renderPeriodicityKpis(patientNickname);

  renderVolumeBarChart(
    weeklyData,
    "weeklyVolumeChart",
    "weeklyVolumeTableBody",
    "No hay sesiones con series registradas todavía."
  );

  renderVolumeBarChart(
    plyoData,
    "plyometricVolumeChart",
    "plyometricVolumeTableBody",
    "No hay volumen de pliometría registrado todavía."
  );

  renderVolumeBarChart(
    weeklyData,
    "tonnageChart",
    "tonnageTableBody",
    "No hay tonelaje registrado todavía.",
    { valueKey: "tonnage", format: value => Math.round(value) }
  );
  updatePeriodicityDistributionChart(patientNickname);

  if (typeof animatePeriodicityBars === "function") {
    setTimeout(animatePeriodicityBars, 40);
  }

  if (typeof animatePeriodicityDistribution === "function") {
    setTimeout(animatePeriodicityDistribution, 120);
  }

}


function refreshDistributionFixed() {
  const filter =
    document.getElementById("periodicityPatientFilter") ||
    document.getElementById("periodicityFilter") ||
    document.getElementById("periodicityPatient");

  const nickname = filter?.value || "";
  const cards = [...document.querySelectorAll(".periodicity-card, .graph-pro-card, article")];

  const distributionCard = cards.find(card =>
    card.textContent.includes("TS") &&
    card.textContent.includes("TI") &&
    card.textContent.includes("Core") &&
    card.textContent.includes("Plyo")
  );

  if (!distributionCard) return;

  const chart = distributionCard.querySelector(".distribution-chart");
  if (chart) {
    chart.outerHTML = renderPeriodicityDistributionFixed(nickname);
  }
}


function renderPeriodicityPatientCard(patientNickname = "") {
  const area = document.getElementById("periodicityPatientCard");
  if (!area) return;

  const patient = patients.find(item => item.nickname === patientNickname);

  if (!patient) {
    area.innerHTML = `
      <div class="periodicity-patient-card empty">
        <div class="periodicity-patient-avatar">?</div>
        <div>
          <span>Paciente seleccionado</span>
          <strong>Selecciona un paciente</strong>
          <p>Las gráficas se cargarán cuando elijas cliente.</p>
        </div>
      </div>
    `;
    return;
  }

  const photo = getPatientPhoto(patient);

  area.innerHTML = `
    <div class="periodicity-patient-card">
      ${photo ? `<img src="${photo}" alt="${patient.nombre || "Paciente"}">` : `<div class="periodicity-patient-avatar">${(patient.nombre || "?").charAt(0).toUpperCase()}</div>`}
      <div>
        <span>Paciente seleccionado</span>
        <strong>${patient.nombre || "Sin nombre"}</strong>
        <p>@${patient.nickname || "-"} · ${patient.edad || "-"} años · ${patient.peso || "-"} kg · ${patient.altura || "-"} cm</p>
      </div>
    </div>
  `;
}


const PPF_PERIODICITY_META_KEY = "periodicityPlans";
let periodicitySelectedMicro = null;

function periodicityReadPlans() {
  try { const value = JSON.parse(localStorage.getItem(PPF_PERIODICITY_META_KEY) || "{}"); return value && typeof value === "object" ? value : {}; }
  catch (_) { return {}; }
}
function periodicityPlanKey(nickname, year, micro) { return `${nciNickname(nickname)}::${year}::${micro}`; }
function periodicityMeta(nickname, year, micro) { return periodicityReadPlans()[periodicityPlanKey(nickname, year, micro)] || {}; }
async function periodicitySaveMeta(nickname, year, micro, patch) {
  const plans = periodicityReadPlans();
  const key = periodicityPlanKey(nickname, year, micro);
  plans[key] = { ...(plans[key] || {}), ...patch, updatedAt: new Date().toISOString() };
  localStorage.setItem(PPF_PERIODICITY_META_KEY, JSON.stringify(plans));
  if (window.PPF_SUPABASE?.pushKey) { try { await window.PPF_SUPABASE.pushKey(PPF_PERIODICITY_META_KEY); } catch (error) { console.warn(error); } }
}
function periodicityEsc(value) { return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch])); }
function periodicityDateLabel(value) {
  if (!value) return "Sin fecha";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("es-ES", { day:"numeric", month:"short", year:"numeric" }).format(date);
}
function periodicityPatientMicroGroups(nickname, year) {
  const core = window.PPF_CORE;
  if (!core || !nickname) return [];
  const summary = core.summary(nickname);
  const groups = new Map();
  summary.sessions.forEach(session => {
    const date = core.date(session);
    if (year && date && Number(date.slice(0,4)) !== Number(year)) return;
    const micro = core.micro(session);
    if (!micro) return;
    if (!groups.has(micro)) groups.set(micro, []);
    groups.get(micro).push(session);
  });
  const today = new Date().toISOString().slice(0,10);
  return [...groups.entries()].sort((a,b)=>a[0]-b[0]).map(([micro, list]) => {
    const ordered = list.slice().sort(core.chronological);
    const dates = ordered.map(core.date).filter(Boolean).sort();
    const completed = ordered.filter(item => core.lifecycle(item) === "completed").length;
    const pending = ordered.filter(item => core.lifecycle(item) === "pending").length;
    const cancelled = ordered.filter(item => core.lifecycle(item) === "cancelled").length;
    const start = dates[0] || ""; const end = dates[dates.length-1] || start;
    let state = "future";
    if (pending === 0 && completed > 0) state = "completed";
    else if (start && end && start <= today && end >= today) state = "active";
    else if (end && end < today && pending > 0) state = "incomplete";
    const kinds = {};
    ordered.forEach(item => { const meta=nciSessionKindMeta(item); kinds[meta.icon+" "+meta.label]=(kinds[meta.icon+" "+meta.label]||0)+1; });
    return { micro, sessions: ordered, start, end, completed, pending, cancelled, total: ordered.length, compliance: (completed+pending) ? Math.round(completed/(completed+pending)*100) : 0, state, kinds };
  });
}
function periodicityWeeklyRange(group, meta = {}) {
  const mode = meta.scheduleMode === "manual" ? "manual" : "weekly";
  if (mode === "manual") {
    return { mode, start: meta.startDate || group.start, end: meta.endDate || group.end };
  }
  return { mode, start: ppfWeekStartIso(group.start), end: ppfWeekEndIso(group.start) };
}

const PPF_CHRONOLOGY_REBUILD_VERSION = 123;
const PPF_CHRONOLOGY_REBUILD_KEY = "ppfChronologicalRebuildVersion";
let ppfChronologyRebuildRunning = false;
let ppfChronologyRebuildTimer = null;

function periodicityPlanEntriesFor(nickname, year, plans = periodicityReadPlans()) {
  const key = nciNickname(nickname);
  const prefix = `${key}::${Number(year)}::`;
  return Object.entries(plans).filter(([planKey]) => String(planKey).startsWith(prefix));
}

function periodicityResetManualSeason(nickname, year) {
  const patientKey = nciNickname(nickname);
  const seasonYear = Number(year);
  if (!patientKey || !seasonYear) return false;

  const plans = periodicityReadPlans();
  let plansChanged = false;
  periodicityPlanEntriesFor(patientKey, seasonYear, plans).forEach(([planKey, meta]) => {
    if (meta?.scheduleMode === "manual" || meta?.startDate || meta?.endDate) {
      plans[planKey] = {
        ...(meta || {}),
        scheduleMode: "weekly",
        startDate: "",
        endDate: "",
        updatedAt: new Date().toISOString()
      };
      plansChanged = true;
    }
  });

  let sessionsChanged = false;
  sessions.forEach(session => {
    if (nciSessionPatient(session) !== patientKey) return;
    const value = nciSessionDate(session);
    if (!value || Number(value.slice(0, 4)) !== seasonYear) return;
    if (session.microManual || session.microcicloManual) {
      session.microManual = false;
      session.microcicloManual = false;
      session.updatedAt = new Date().toISOString();
      sessionsChanged = true;
    }
  });

  if (plansChanged) localStorage.setItem(PPF_PERIODICITY_META_KEY, JSON.stringify(plans));
  if (sessionsChanged) {
    window.sessions = sessions;
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }
  return plansChanged || sessionsChanged;
}

function periodicityChronologyNeedsRebuild(nickname, year, plans = periodicityReadPlans()) {
  const core = window.PPF_CORE;
  if (!core?.chronologicalSeasonPlan) return false;
  const plan = core.chronologicalSeasonPlan(nickname, { year, plans });
  return plan.blocks.some(block =>
    block.sessions.some(session => nciSessionMicro(session) !== block.targetMicro) ||
    block.sessions.some((session, index) => Number(session.microSequenceOrder || 0) !== index + 1)
  );
}

async function periodicityChronologicalRebuildV12({
  force = false,
  patientNickname = "",
  year = 0,
  reason = "manual"
} = {}) {
  if (ppfChronologyRebuildRunning || !window.PPF_CORE?.chronologicalSeasonPlan) {
    return { changed: false, patients: 0 };
  }

  if (window.PPF_SUPABASE_READY?.then) {
    try { await window.PPF_SUPABASE_READY; } catch (_) {}
  }

  let loaded = [];
  try { loaded = JSON.parse(localStorage.getItem("sessions") || "[]"); } catch (_) {}
  if (Array.isArray(loaded)) {
    sessions = loaded;
    window.sessions = sessions;
  }
  if (!Array.isArray(sessions) || !sessions.length) return { changed: false, patients: 0 };

  ppfChronologyRebuildRunning = true;
  try {
    const plans = periodicityReadPlans();
    const requestedPatient = nciNickname(patientNickname);
    const patientKeys = requestedPatient
      ? [requestedPatient]
      : [...new Set(sessions.map(nciSessionPatient).filter(Boolean))];

    let changed = false;
    let notificationsChanged = false;
    let affectedPatients = 0;
    const nextPlans = { ...plans };
    const nowIso = new Date().toISOString();

    for (const patientKey of patientKeys) {
      const years = year
        ? [Number(year)]
        : [...new Set(
            sessions
              .filter(item => nciSessionPatient(item) === patientKey)
              .map(item => Number(nciSessionDate(item).slice(0, 4)))
              .filter(Boolean)
          )].sort((a, b) => a - b);

      let patientChanged = false;

      for (const seasonYear of years) {
        // IMPORTANTE: el plan debe trabajar sobre las MISMAS referencias de
        // `sessions` que después persistimos. Antes PPF CORE volvía a leer y
        // parsear localStorage, creando objetos distintos: el orden calculado
        // era correcto, pero las mutaciones se aplicaban sobre copias y nunca
        // llegaban al array real. Chronological Sort + Global Renumber usa un
        // contexto explícito para que fecha, reindexado y persistencia actúen
        // sobre una única colección.
        const seasonContext = {
          sessions,
          completedRecords: (() => {
            try {
              const rows = JSON.parse(localStorage.getItem("completedSessions") || "[]");
              return Array.isArray(rows) ? rows : [];
            } catch (_) { return []; }
          })()
        };
        const seasonPlan = window.PPF_CORE.chronologicalSeasonPlan(patientKey, {
          year: seasonYear,
          plans,
          context: seasonContext
        });
        if (!seasonPlan.blocks.length) continue;

        // Auditoría previa: el CORE debe entregar una secuencia 1..N exacta.
        const validSequence = seasonPlan.blocks.every((block, index) => block.targetMicro === index + 1);
        if (!validSequence) throw new Error(`Secuencia no válida para ${patientKey} ${seasonYear}`);

        // Capturamos primero todos los metadatos de origen. Después eliminamos
        // las claves antiguas y finalmente escribimos las nuevas. Así evitamos
        // colisiones como M13 -> M2 mientras todavía existe un M2 antiguo.
        const sourcePlanKeys = new Set();
        const rebuiltPlanEntries = [];

        seasonPlan.blocks.forEach((block, index) => {
          const target = index + 1;
          const sourceMetas = block.oldMicros
            .map(oldMicro => {
              const sourceKey = periodicityPlanKey(patientKey, seasonYear, oldMicro);
              sourcePlanKeys.add(sourceKey);
              return plans[sourceKey];
            })
            .filter(Boolean);

          const preferredMeta = sourceMetas.find(meta => meta?.scheduleMode === "manual")
            || sourceMetas.find(meta => meta && Object.values(meta).some(Boolean))
            || {};

          rebuiltPlanEntries.push({
            key: periodicityPlanKey(patientKey, seasonYear, target),
            value: {
              ...preferredMeta,
              scheduleMode: block.mode,
              startDate: block.mode === "manual" ? (preferredMeta.startDate || block.start) : "",
              endDate: block.mode === "manual" ? (preferredMeta.endDate || block.end) : "",
              updatedAt: nowIso
            }
          });

          block.sessions.forEach(session => {
            const targetLabel = block.mode === "manual"
              ? `Micro ${target} · ${block.start} — ${block.end} · Manual`
              : `Micro ${target} · ${block.start} — ${block.end}`;

            const needsUpdate =
              nciSessionMicro(session) !== target ||
              Number(session.sessionBaseNumber || 0) !== target ||
              session.microcicloLabel !== targetLabel ||
              Boolean(session.microManual || session.microcicloManual) !== (block.mode === "manual");

            if (needsUpdate || force) {
              session.microciclo = target;
              session.micro = target;
              session.microcycle = target;
              session.sessionBaseNumber = target;
              session.microcicloLabel = targetLabel;
              session.microManual = block.mode === "manual";
              session.microcicloManual = block.mode === "manual";
              session.updatedAt = nowIso;
              patientChanged = patientChanged || needsUpdate;
            }
          });
        });

        // Limpiamos TODAS las claves del paciente/año para impedir restos como
        // M13, M14... y escribimos exclusivamente M1..MN.
        periodicityPlanEntriesFor(patientKey, seasonYear, nextPlans)
          .forEach(([planKey]) => delete nextPlans[planKey]);
        sourcePlanKeys.forEach(planKey => delete nextPlans[planKey]);
        rebuiltPlanEntries.forEach(({ key, value }) => { nextPlans[key] = value; });
      }

      // NCI se ejecuta después del reindexado completo, nunca bloque a bloque.
      const result = nciRenumberPatientSessions(patientKey, {
        touchUpdatedAt: true,
        rebuildOrder: true
      });
      notificationsChanged = notificationsChanged || Boolean(result?.notificationsChanged);
      if (patientChanged || result?.changed) {
        changed = true;
        affectedPatients += 1;
      }
    }

    // Auditoría final: por paciente/año, los micros deben ser exactamente 1..N
    // y las sesiones de cada micro deben ser X.1, X.2, X.3... sin huecos.
    for (const patientKey of patientKeys) {
      const patientSessions = sessions.filter(item => nciSessionPatient(item) === patientKey && nciSessionDate(item));
      const patientYears = [...new Set(patientSessions.map(item => Number(nciSessionDate(item).slice(0, 4))).filter(Boolean))];
      for (const seasonYear of patientYears) {
        const yearSessions = patientSessions.filter(item => Number(nciSessionDate(item).slice(0, 4)) === seasonYear);
        const micros = [...new Set(yearSessions.map(nciSessionMicro).filter(Boolean))].sort((a, b) => a - b);
        if (!micros.every((value, index) => value === index + 1)) {
          throw new Error(`Auditoría fallida: micros no secuenciales en ${patientKey} ${seasonYear}: ${micros.join(",")}`);
        }
        for (const microNumber of micros) {
          const ordered = yearSessions.filter(item => nciSessionMicro(item) === microNumber).sort(window.PPF_CORE.chronological);
          const valid = ordered.every((item, index) =>
            Number(item.microSequenceOrder || 0) === index + 1 &&
            String(nciDisplayNumber(item)) === `${microNumber}.${index + 1}`
          );
          if (!valid) throw new Error(`Auditoría NCI fallida en ${patientKey} M${microNumber}`);
        }
      }
    }

    const plansChanged = JSON.stringify(nextPlans) !== JSON.stringify(plans);
    if (plansChanged) localStorage.setItem(PPF_PERIODICITY_META_KEY, JSON.stringify(nextPlans));
    if (changed || force) {
      window.sessions = sessions;
      localStorage.setItem("sessions", JSON.stringify(sessions));
    }

    if (changed || plansChanged || force) {
      if (window.PPF_SUPABASE?.pushValue) {
        await window.PPF_SUPABASE.pushValue("sessions", sessions);
        if (plansChanged) await window.PPF_SUPABASE.pushValue(PPF_PERIODICITY_META_KEY, nextPlans);
      } else if (window.PPF_SUPABASE?.pushKey) {
        await window.PPF_SUPABASE.pushKey("sessions");
        if (plansChanged) await window.PPF_SUPABASE.pushKey(PPF_PERIODICITY_META_KEY);
      }
      if (notificationsChanged && window.PPF_SUPABASE?.pushKey) {
        await window.PPF_SUPABASE.pushKey("notifications");
      }

      localStorage.setItem(PPF_CHRONOLOGY_REBUILD_KEY, String(PPF_CHRONOLOGY_REBUILD_VERSION));
      window.PPF_CORE.emit("chronological-sort-global-renumber");
      window.dispatchEvent(new CustomEvent("ppf:chronology-rebuilt", {
        detail: { reason, patients: affectedPatients, engine: "chronological-sort-global-renumber" }
      }));
    }

    return { changed: changed || plansChanged || force, patients: affectedPatients };
  } catch (error) {
    console.warn("Chronological Sort + Global Renumber no pudo completar la reconstrucción:", error);
    return { changed: false, patients: 0, error };
  } finally {
    ppfChronologyRebuildRunning = false;
  }
}

function periodicityScheduleChronologicalRebuild(reason = "sessions") {
  if (ppfChronologyRebuildRunning) return;
  clearTimeout(ppfChronologyRebuildTimer);
  ppfChronologyRebuildTimer = setTimeout(() => {
    periodicityChronologicalRebuildV12({ reason }).catch(error => console.warn(error));
  }, 260);
}

window.PPF_CHRONOLOGY = {
  version: PPF_CHRONOLOGY_REBUILD_VERSION,
  rebuild: periodicityChronologicalRebuildV12,
  schedule: periodicityScheduleChronologicalRebuild,
  needsRebuild: periodicityChronologyNeedsRebuild
};

window.addEventListener("ppf:core-updated", event => {
  if (event?.detail?.reason === "sessions") periodicityScheduleChronologicalRebuild("sessions-updated");
});

function periodicityStateMeta(state) {
  return ({ active:{label:"Activo",icon:"●"}, completed:{label:"Completado",icon:"✓"}, incomplete:{label:"Incompleto",icon:"!"}, future:{label:"Futuro",icon:"○"} })[state] || {label:state,icon:"○"};
}
function periodicityRenderV1(nickname, year) {
  const overview=document.getElementById("periodicitySeasonOverview");
  const timeline=document.getElementById("periodicityMicroTimeline");
  const detail=document.getElementById("periodicityMicroDetail");
  if (!overview || !timeline || !detail) return;
  if (!nickname) {
    overview.innerHTML=`<div class="periodicity-pro-empty"><span>📆</span><h3>Selecciona un cliente</h3><p>Construiremos su temporada a partir de los microciclos reales ya existentes.</p></div>`;
    timeline.innerHTML=""; detail.innerHTML=""; return;
  }
  const patient=patients.find(item=>nciNickname(item.nickname)===nciNickname(nickname)) || {nombre:nickname,nickname};
  const groups=periodicityPatientMicroGroups(nickname, year);
  const all=groups.flatMap(group=>group.sessions);
  const completed=groups.reduce((sum,g)=>sum+g.completed,0), pending=groups.reduce((sum,g)=>sum+g.pending,0);
  const seasonStart=groups.map(g=>g.start).filter(Boolean).sort()[0] || `${year}-01-01`;
  const seasonEnd=groups.map(g=>g.end).filter(Boolean).sort().at(-1) || `${year}-12-31`;
  const current=groups.find(g=>g.state==="active") || groups.filter(g=>g.state==="incomplete").at(-1) || groups.at(-1);
  if (periodicitySelectedMicro == null || !groups.some(g=>g.micro===periodicitySelectedMicro)) periodicitySelectedMicro=current?.micro ?? groups[0]?.micro ?? null;
  overview.innerHTML=`<div class="periodicity-season-card">
    <div class="periodicity-season-person"><span>${periodicityEsc((patient.nombre||"?").charAt(0).toUpperCase())}</span><div><p class="eyebrow">TEMPORADA ${periodicityEsc(year)}</p><h3>${periodicityEsc(patient.nombre||nickname)}</h3><small>@${periodicityEsc(patient.nickname||nickname)} · ${periodicityDateLabel(seasonStart)} — ${periodicityDateLabel(seasonEnd)}</small></div></div>
    <div class="periodicity-season-kpis"><article><small>Microciclos</small><strong>${groups.length}</strong></article><article><small>Sesiones</small><strong>${all.length}</strong></article><article><small>Terminadas</small><strong>${completed}</strong></article><article><small>Pendientes</small><strong>${pending}</strong></article></div>
  </div>`;
  timeline.innerHTML=groups.length ? `<div class="periodicity-timeline-head"><div><p class="eyebrow">MAPA DE TEMPORADA</p><h3>Microciclos semanales</h3></div><span>${groups.length} bloques</span></div><div class="periodicity-timeline-track">${groups.map(group=>{const meta=periodicityMeta(nickname,year,group.micro), state=periodicityStateMeta(group.state), range=periodicityWeeklyRange(group,meta); return `<button type="button" class="periodicity-micro-block state-${group.state} ${group.micro===periodicitySelectedMicro?"is-selected":""}" data-periodicity-micro="${group.micro}"><span class="periodicity-micro-number">M${group.micro}</span><strong>${periodicityEsc(meta.name||`Micro ${group.micro}`)}</strong><small>${periodicityDateLabel(range.start)} — ${periodicityDateLabel(range.end)}</small><div class="periodicity-micro-progress"><i style="width:${group.compliance}%"></i></div><footer><span>${range.mode==="manual"?"✍️ Manual":state.icon+" "+state.label}</span><b>${group.completed}/${group.total}</b></footer></button>`}).join("")}</div>` : `<div class="periodicity-pro-empty"><span>🧭</span><h3>Sin microciclos en ${year}</h3><p>Las sesiones que crees para este cliente aparecerán aquí automáticamente.</p></div>`;
  timeline.querySelectorAll("[data-periodicity-micro]").forEach(button=>button.addEventListener("click",()=>{periodicitySelectedMicro=Number(button.dataset.periodicityMicro); periodicityRenderV1(nickname,year);}));
  const selected=groups.find(g=>g.micro===periodicitySelectedMicro);
  if (!selected) { detail.innerHTML=""; return; }
  const meta=periodicityMeta(nickname,year,selected.micro), state=periodicityStateMeta(selected.state), range=periodicityWeeklyRange(selected,meta);
  const kinds=Object.entries(selected.kinds).map(([label,count])=>`<span>${periodicityEsc(label)} ×${count}</span>`).join("");
  detail.innerHTML=`<article class="periodicity-micro-inspector">
    <header><div><p class="eyebrow">MICRO ${selected.micro}</p><h3>${periodicityEsc(meta.name||`Micro ${selected.micro}`)}</h3><small>${periodicityDateLabel(range.start)} — ${periodicityDateLabel(range.end)} · Semana ${window.PPF_CORE?.isoWeekNumber?.(range.start) || "-"}</small></div><span class="periodicity-state state-${selected.state}">${range.mode==="manual"?"✍️ Manual":state.icon+" "+state.label}</span></header>
    <section class="periodicity-micro-metrics"><article><small>Sesiones</small><strong>${selected.total}</strong></article><article><small>Terminadas</small><strong>${selected.completed}</strong></article><article><small>Pendientes</small><strong>${selected.pending}</strong></article><article><small>Cumplimiento</small><strong>${selected.compliance}%</strong></article></section>
    <div class="periodicity-micro-kinds">${kinds || "<span>Sin actividad registrada</span>"}</div>
    <div class="periodicity-micro-form">
      <label>Modo del micro<select id="periodicityMicroMode"><option value="weekly" ${range.mode==="weekly"?"selected":""}>📅 Semanal automático · lunes a domingo</option><option value="manual" ${range.mode==="manual"?"selected":""}>✍️ Rango manual</option></select></label>
      <div class="periodicity-range-fields"><label>Inicio<input type="date" id="periodicityMicroStart" value="${periodicityEsc(range.start)}" ${range.mode==="weekly"?"disabled":""}></label><label>Fin<input type="date" id="periodicityMicroEnd" value="${periodicityEsc(range.end)}" ${range.mode==="weekly"?"disabled":""}></label></div>
      <label>Nombre del micro<input id="periodicityMicroName" value="${periodicityEsc(meta.name||"")}" placeholder="Ej. Fuerza máxima"></label><label>Objetivo<textarea id="periodicityMicroObjective" placeholder="Objetivo principal del microciclo">${periodicityEsc(meta.objective||"")}</textarea></label><label>Observaciones<textarea id="periodicityMicroNotes" placeholder="Notas estratégicas">${periodicityEsc(meta.notes||"")}</textarea></label></div>
    <footer class="periodicity-action-row"><button type="button" class="primary-btn periodicity-action-save" id="periodicitySaveMicro">💾 Guardar planificación</button><button type="button" class="periodicity-action-btn periodicity-action-agenda" id="periodicityOpenAgenda"><span>📅</span><strong>Abrir Agenda</strong></button><button type="button" class="periodicity-action-btn periodicity-action-workspace" id="periodicityOpenWorkspace"><span>👤</span><strong>Abrir Workspace</strong></button></footer>
  </article>`;
  const modeSelect=document.getElementById("periodicityMicroMode");
  modeSelect?.addEventListener("change",()=>{const manual=modeSelect.value==="manual"; document.getElementById("periodicityMicroStart").disabled=!manual; document.getElementById("periodicityMicroEnd").disabled=!manual;});
  document.getElementById("periodicitySaveMicro")?.addEventListener("click", async()=>{
    const mode=modeSelect?.value||"weekly";
    await periodicitySaveMeta(nickname,year,selected.micro,{scheduleMode:mode,startDate:mode==="manual"?(document.getElementById("periodicityMicroStart")?.value||selected.start):"",endDate:mode==="manual"?(document.getElementById("periodicityMicroEnd")?.value||selected.end):"",name:document.getElementById("periodicityMicroName")?.value.trim()||"",objective:document.getElementById("periodicityMicroObjective")?.value.trim()||"",notes:document.getElementById("periodicityMicroNotes")?.value.trim()||""});

    // Manual Reset Engine: cuando todos los micros activos de la temporada
    // están en automático, eliminamos cualquier resto manual histórico antes
    // de reconstruir. Así un paciente de pruebas no continúa en M19, M20...
    if (mode === "weekly") {
      const activeGroups = periodicityPatientMicroGroups(nickname, year);
      const latestPlans = periodicityReadPlans();
      const hasActiveManual = activeGroups.some(group =>
        latestPlans[periodicityPlanKey(nickname, year, group.micro)]?.scheduleMode === "manual"
      );
      if (!hasActiveManual) periodicityResetManualSeason(nickname, year);
    }

    await periodicityChronologicalRebuildV12({force:true,patientNickname:nickname,year,reason:"periodicity-save"});
    periodicitySelectedMicro=null;
    periodicityRenderV1(nickname,year);
  });
  document.getElementById("periodicityOpenAgenda")?.addEventListener("click",()=>{agendaProWorkspacePatient=nickname; agendaProViewMode="calendar"; pmNavigateAdmin("agenda"); setTimeout(()=>{const filter=document.getElementById("agendaProPatientFilter"); if(filter){filter.value=nickname; filter.dispatchEvent(new Event("change",{bubbles:true}));}},0);});
  document.getElementById("periodicityOpenWorkspace")?.addEventListener("click",()=>{agendaProWorkspacePatient=nickname; agendaProViewMode="client"; pmNavigateAdmin("agenda");});
}

function bindPeriodicityPanel() {
  const filter=document.getElementById("periodicityPatientFilter");
  const season=document.getElementById("periodicitySeasonYear");
  if (!filter || !season) return;
  const years=new Set([new Date().getFullYear()]);
  window.PPF_CORE?.normalizedContext?.().sessions.forEach(session=>{const d=window.PPF_CORE.date(session); if(d) years.add(Number(d.slice(0,4)));});
  season.innerHTML=[...years].filter(Boolean).sort((a,b)=>b-a).map(year=>`<option value="${year}">${year}</option>`).join("");

  // Periodicidad es estratégica: siempre entra limpia y exige selección explícita.
  filter.value="";
  periodicitySelectedMicro=null;

  const run=()=>{
    const nickname=filter.value||"";
    const year=Number(season.value)||new Date().getFullYear();
    periodicityRenderV1(nickname,year);
    renderPeriodicityPatientCard(nickname);
    if(nickname) renderWeeklyVolumeChart(nickname);
  };
  filter.addEventListener("change",()=>{periodicitySelectedMicro=null;run();});
  season.addEventListener("change",()=>{periodicitySelectedMicro=null;run();});
  document.querySelector(".periodicity-analysis-details")?.addEventListener("toggle",event=>{if(event.currentTarget.open) setTimeout(run,20);});

  const normalizeAndRender=async()=>{
    await periodicityChronologicalRebuildV12({ reason: "periodicity-open" });
    // La migración puede introducir años nuevos; reconstruimos el selector.
    const refreshedYears=new Set([new Date().getFullYear()]);
    window.PPF_CORE?.normalizedContext?.().sessions.forEach(session=>{const d=window.PPF_CORE.date(session); if(d) refreshedYears.add(Number(d.slice(0,4)));});
    const selectedYear=Number(season.value)||new Date().getFullYear();
    season.innerHTML=[...refreshedYears].filter(Boolean).sort((a,b)=>b-a).map(year=>`<option value="${year}" ${year===selectedYear?"selected":""}>${year}</option>`).join("");
    filter.value="";
    run();
  };
  if (window.PPF_SUPABASE_READY?.then) window.PPF_SUPABASE_READY.then(normalizeAndRender).catch(normalizeAndRender);
  else setTimeout(normalizeAndRender, 250);
}


function ppfSessionStableId(item = {}) {
  return String(item?.id ?? item?.sessionId ?? "").trim();
}

function ppfRemoveSessionReferences(sessionIds = []) {
  const ids = new Set(sessionIds.map(value => String(value ?? "").trim()).filter(Boolean));
  if (!ids.size) return { completedChanged: false, notificationsChanged: false };

  let completed = [];
  try { completed = JSON.parse(localStorage.getItem("completedSessions") || "[]"); } catch (_) {}
  const nextCompleted = Array.isArray(completed)
    ? completed.filter(item => !ids.has(ppfSessionStableId(item)))
    : [];
  const completedChanged = nextCompleted.length !== (Array.isArray(completed) ? completed.length : 0);
  if (completedChanged) localStorage.setItem("completedSessions", JSON.stringify(nextCompleted));

  let notifications = [];
  try { notifications = JSON.parse(localStorage.getItem("notifications") || "[]"); } catch (_) {}
  // v3.4.1 · Session Lifecycle Sync:
  // una notificación puede apuntar a una sesión individual (sessionId) o a
  // todo un micro clonado (sessionIds). Si cualquiera de esas sesiones se
  // elimina, el aviso deja de representar la verdad actual y se retira.
  const nextNotifications = Array.isArray(notifications)
    ? notifications.filter(item => {
        const directId = String(item?.sessionId ?? "").trim();
        if (directId && ids.has(directId)) return false;
        const groupedIds = Array.isArray(item?.sessionIds)
          ? item.sessionIds.map(value => String(value ?? "").trim()).filter(Boolean)
          : [];
        if (groupedIds.some(id => ids.has(id))) return false;
        return true;
      })
    : [];
  const notificationsChanged = nextNotifications.length !== (Array.isArray(notifications) ? notifications.length : 0);
  if (notificationsChanged) localStorage.setItem("notifications", JSON.stringify(nextNotifications));

  // Tombstones locales: impiden que una sincronización posterior vuelva a
  // introducir una sesión eliminada antes de que Supabase reciba el cambio.
  let deletedIds = [];
  try { deletedIds = JSON.parse(localStorage.getItem("deletedSessionIds") || "[]"); } catch (_) {}
  const mergedDeleted = [...new Set([...(Array.isArray(deletedIds) ? deletedIds : []), ...ids])];
  localStorage.setItem("deletedSessionIds", JSON.stringify(mergedDeleted));

  return { completedChanged, notificationsChanged, deletedIds: mergedDeleted };
}

async function ppfDeleteSessionsByIds(sessionIds = [], { confirmation = true } = {}) {
  const ids = new Set(sessionIds.map(value => String(value ?? "").trim()).filter(Boolean));
  if (!ids.size) return { deleted: 0 };

  const targets = sessions.filter(item => ids.has(ppfSessionStableId(item)));
  if (!targets.length) return { deleted: 0 };

  if (confirmation) {
    const label = targets.length === 1
      ? `la sesión ${nciDisplayNumber(targets[0])}`
      : `${targets.length} sesiones seleccionadas`;
    if (!confirm(`¿Eliminar definitivamente ${label}?\n\nEsta acción no se puede deshacer.`)) return { deleted: 0 };
  }

  const affectedPatients = [...new Set(targets.map(nciSessionPatient).filter(Boolean))];
  sessions = sessions.filter(item => !ids.has(ppfSessionStableId(item)));
  const refs = ppfRemoveSessionReferences([...ids]);

  let notificationsChanged = refs.notificationsChanged;
  affectedPatients.forEach(patientKey => {
    const result = nciRenumberPatientSessions(patientKey, { touchUpdatedAt: true, rebuildOrder: true });
    notificationsChanged = notificationsChanged || Boolean(result?.notificationsChanged);
  });

  window.sessions = sessions;
  localStorage.setItem("sessions", JSON.stringify(sessions));
  window.PPF_CORE?.emit?.("sessions");

  // Reconstruimos la cronología después del borrado para compactar M1..Mn y
  // X.1..X.n sin referencias fantasma.
  if (window.PPF_CHRONOLOGY?.rebuild) {
    for (const patientKey of affectedPatients) {
      try { await window.PPF_CHRONOLOGY.rebuild({ force: true, patientNickname: patientKey, reason: "delete-engine" }); }
      catch (error) { console.warn("No se pudo reconstruir tras eliminar:", error); }
    }
  }

  if (window.PPF_SUPABASE?.replaceValue) {
    try {
      // Un borrado necesita reemplazo exacto: un merge conservaría en nube la
      // sesión que acabamos de quitar y podría resucitarla en Agenda PRO.
      await window.PPF_SUPABASE.replaceValue("deletedSessionIds", refs.deletedIds || [...ids]);
      await window.PPF_SUPABASE.replaceValue("sessions", sessions);
      if (refs.completedChanged) {
        const completed = JSON.parse(localStorage.getItem("completedSessions") || "[]");
        await window.PPF_SUPABASE.pushValue("completedSessions", completed);
      }
      if (notificationsChanged) {
        const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
        // Borrado destructivo: reemplazo exacto para impedir que el merge
        // aditivo vuelva a resucitar avisos de sesiones eliminadas.
        await window.PPF_SUPABASE.replaceValue("notifications", notifications);
      }
    } catch (error) { console.warn("Supabase no confirmó toda la eliminación:", error); }
  } else if (window.PPF_SUPABASE?.pushKey) {
    try {
      await window.PPF_SUPABASE.pushKey("deletedSessionIds");
      await window.PPF_SUPABASE.pushKey("sessions");
      if (refs.completedChanged) await window.PPF_SUPABASE.pushKey("completedSessions");
      if (notificationsChanged) await window.PPF_SUPABASE.pushKey("notifications");
    } catch (error) { console.warn("Supabase no confirmó toda la eliminación:", error); }
  }

  return { deleted: targets.length, affectedPatients };
}

async function deleteSession(sessionId) {
  const result = await ppfDeleteSessionsByIds([sessionId]);
  if (result.deleted) renderSection("sesiones");
}

async function deleteSelectedSessions() {
  const selected = [...document.querySelectorAll(".session-select:checked")]
    .map(input => String(input.value ?? "").trim())
    .filter(Boolean);

  if (!selected.length) {
    alert("Selecciona al menos una sesión.");
    return;
  }

  const result = await ppfDeleteSessionsByIds(selected);
  if (result.deleted) renderSection("sesiones");
}

function toggleAllSessionsSelection(checked) {
  document.querySelectorAll(".session-select").forEach(input => {
    input.checked = checked;
  });
}


function getPatientSortedSessionDates(patientNickname) {
  return [...new Set(
    sessions
      .filter(session => session.patientNickname === patientNickname && session.fecha)
      .map(session => session.fecha)
  )].sort();
}

function ppfWeekStartIso(value) {
  return window.PPF_CORE?.weekStartIso?.(value) || "";
}

function ppfWeekEndIso(value) {
  return window.PPF_CORE?.weekEndIso?.(value) || "";
}

function getComputedMicrocycleNumber(patientNickname, date) {
  if (!patientNickname || !date) return "-";
  const weekStart = ppfWeekStartIso(date);
  const patientSessions = sessions.filter(session => session.patientNickname === patientNickname);

  // Regla Periodicidad PRO v1.2: si ya existe un micro automático en esa
  // semana (lunes-domingo), cualquier sesión nueva reutiliza su número X.
  const sameWeek = patientSessions.find(session => {
    const manual = Boolean(session.microManual || session.microcicloManual || String(session.microcicloLabel || "").toLowerCase().includes("manual"));
    return !manual && Number(session.microciclo) > 0 && ppfWeekStartIso(session.fecha) === weekStart;
  });
  if (sameWeek) return Number(sameWeek.microciclo);

  const maxMicro = patientSessions.reduce((max, session) => Math.max(max, Number(session.microciclo) || 0), 0);
  return maxMicro + 1 || 1;
}

function normalizeSessionMicrocycles(patientNickname = "") {
  const nicknames = patientNickname
    ? [patientNickname]
    : [...new Set(sessions.map(session => session.patientNickname).filter(Boolean))];

  let changed = false;

  nicknames.forEach(nickname => {
    const dates = getPatientSortedSessionDates(nickname);

    sessions = sessions.map(session => {
      if (session.patientNickname !== nickname || !session.fecha) return session;

      const existingMicro = Number(session.microciclo);
      const labelSaysManual = String(session.microcicloLabel || "").toLowerCase().includes("manual");
      const isManual = Boolean(session.microManual || session.microcicloManual || labelSaysManual);

      /*
        FIX PPF PRO:
        - Si la sesión ya trae un micro guardado, NUNCA se recalcula.
        - Esto protege los micros manuales al cerrar/abrir y también cuando entra Supabase/IndexedDB.
        - Solo se calcula micro automático para sesiones antiguas que no tengan microciclo válido.
      */
      if (Number.isFinite(existingMicro) && existingMicro > 0) {
        const nextLabel = `Micro ${existingMicro} · ${session.fecha}${isManual ? " · Manual" : ""}`;

        if (
          session.microciclo !== existingMicro ||
          session.microcicloLabel !== nextLabel ||
          (isManual && (!session.microManual || !session.microcicloManual))
        ) {
          changed = true;
        }

        return {
          ...session,
          microciclo: existingMicro,
          microManual: isManual ? true : Boolean(session.microManual),
          microcicloManual: isManual ? true : Boolean(session.microcicloManual),
          microcicloLabel: nextLabel
        };
      }

      const micro = dates.indexOf(session.fecha) + 1;
      changed = true;

      return {
        ...session,
        microciclo: micro,
        microManual: false,
        microcicloManual: false,
        microcicloLabel: `Micro ${micro} · ${session.fecha}`
      };
    });
  });

  if (changed) {
    window.sessions = sessions;
    localStorage.setItem("sessions", JSON.stringify(sessions));
  window.PPF_CORE?.emit?.("sessions");

    if (window.PPF_SUPABASE && typeof window.PPF_SUPABASE.pushKey === "function") {
      window.PPF_SUPABASE.pushKey("sessions").catch(error =>
        console.warn("No se pudo sincronizar sessions:", error)
      );
    }
  }
}


function getAllSessionExercisesForAdmin(session) {
  const exercises = [];

  function add(list = [], moduleName = "") {
    list.forEach(item => {
      if (!item || item.deleted) return;
      if (item.nombre || item.series || item.repeticiones || item.url) {
        exercises.push({ ...item, moduleName });
      }
    });
  }

  add(session.modules?.movilidad || [], "Movilidad");
  add(session.modules?.activacion || [], "Activación");

  const blocks = session.modules?.principal?.blocks;
  if (blocks) {
    ["bloque1", "bloque2", "bloque3", "bloque4"].forEach(blockKey => {
      add(blocks[blockKey]?.exercises || [], "Sesión Principal");
    });
  }

  return exercises;
}

function getAdminExerciseSeries(item) {
  const series = Number(item?.series);
  return Number.isNaN(series) ? 0 : series;
}

function getAdminSessionTonnage(session) {
  return getAllSessionExercisesForAdmin(session).reduce((total, item) => {
    if ((item.unidad || "Kg") !== "Kg") return total;

    const series = Number(item.series);
    const reps = Number(String(item.repeticiones || "").replace(",", "."));
    const carga = Number(String(item.carga || "").replace(",", "."));

    if (Number.isNaN(series) || Number.isNaN(reps) || Number.isNaN(carga)) return total;

    return total + (series * reps * carga);
  }, 0);
}

function getPatientAnalytics(patientNickname = "") {
  const patientSessions = sessions.filter(session => !patientNickname || session.patientNickname === patientNickname);
  const totals = {
    sessions: patientSessions.length,
    series: 0,
    exercises: 0,
    tonnage: 0,
    ts: 0,
    ti: 0,
    core: 0,
    plyo: 0,
    movilidad: 0,
    activacion: 0
  };

  patientSessions.forEach(session => {
    totals.tonnage += getAdminSessionTonnage(session);

    getAllSessionExercisesForAdmin(session).forEach(item => {
      const series = getAdminExerciseSeries(item) || 1;
      totals.series += getAdminExerciseSeries(item);
      totals.exercises += 1;

      const type = (item.tipo || "").toLowerCase();
      const moduleName = (item.moduleName || "").toLowerCase();

      if (moduleName.includes("movilidad")) totals.movilidad += series;
      if (moduleName.includes("activación") || moduleName.includes("activacion")) totals.activacion += series;

      if (type.includes("superior") || type.includes("ts")) totals.ts += series;
      else if (type.includes("inferior") || type.includes("ti")) totals.ti += series;
      else if (type.includes("core")) totals.core += series;
      else if (type.includes("plyo") || type.includes("pliometr")) totals.plyo += series;
    });
  });

  return totals;
}

function buildRadarPoints(values, cx = 160, cy = 160, radius = 118) {
  const max = Math.max(...values.map(item => item.v), 1);

  return values.map((item, index) => {
    const angle = (-90 + (360 / values.length) * index) * Math.PI / 180;
    const r = (item.v / max) * radius;
    return {
      ...item,
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      labelX: cx + (radius + 25) * Math.cos(angle),
      labelY: cy + (radius + 25) * Math.sin(angle)
    };
  });
}

function renderRadarChart(values) {
  const points = buildRadarPoints(values);
  const polygon = points.map(point => `${point.x},${point.y}`).join(" ");

  const grid = [0.25, 0.5, 0.75, 1].map(scale => {
    const gridPoints = buildRadarPoints(values.map(item => ({...item, value: 1})), 160, 160, 118 * scale)
      .map(point => `${point.x},${point.y}`).join(" ");
    return `<polygon points="${gridPoints}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="1" />`;
  }).join("");

  return `
    <svg class="radar-svg" viewBox="0 0 320 320">
      ${grid}
      ${points.map(point => `<line x1="160" y1="160" x2="${point.labelX}" y2="${point.labelY}" stroke="rgba(255,255,255,.08)" />`).join("")}
      <polygon points="${polygon}" fill="rgba(34,197,94,.28)" stroke="#22c55e" stroke-width="3" />
      ${points.map(point => `<circle cx="${point.x}" cy="${point.y}" r="5" fill="#86efac" />`).join("")}
      ${points.map(point => `<text x="${point.labelX}" y="${point.labelY}" text-anchor="middle" dominant-baseline="middle">${point.label}</text>`).join("")}
    </svg>
  `;
}

function radarSvg(items, previousItems = [], currentMicro = "—", previousMicro = "—") {
  const safeItems = (items || []).map(item => ({ label: item.label, v: Number(item.v ?? item.value ?? 0) || 0 }));
  const previousMap = Object.fromEntries((previousItems || []).map(item => [item.label, Number(item.v ?? item.value ?? 0) || 0]));
  const total = safeItems.reduce((sum, item) => sum + item.v, 0);
  const previousTotal = Object.values(previousMap).reduce((sum, value) => sum + value, 0);
  const sharedMax = Math.max(...safeItems.map(item => item.v), ...Object.values(previousMap), 1);
  const cx = 200, cy = 200, radius = 118;
  const axisPoint = (index, customRadius = radius) => {
    const angle = (-90 + (360 / safeItems.length) * index) * Math.PI / 180;
    return { x: cx + Math.cos(angle) * customRadius, y: cy + Math.sin(angle) * customRadius, angle };
  };
  const dataPoints = safeItems.map((item, index) => {
    const axis = axisPoint(index), labelPoint = axisPoint(index, radius + 38);
    const previous = previousMap[item.label] || 0;
    const delta = item.v - previous;
    return { ...item, previous, delta,
      deltaPercent: previous ? Math.round((delta / previous) * 100) : (item.v ? 100 : 0),
      percent: total ? safeDistributionPercent(item.v, total) : 0,
      previousPercent: previousTotal ? safeDistributionPercent(previous, previousTotal) : 0,
      x: cx + Math.cos(axis.angle) * radius * Math.max(0, Math.min(1, item.v / sharedMax)),
      y: cy + Math.sin(axis.angle) * radius * Math.max(0, Math.min(1, item.v / sharedMax)),
      previousX: cx + Math.cos(axis.angle) * radius * Math.max(0, Math.min(1, previous / sharedMax)),
      previousY: cy + Math.sin(axis.angle) * radius * Math.max(0, Math.min(1, previous / sharedMax)),
      labelX: labelPoint.x, labelY: labelPoint.y };
  });
  const currentPolygon = dataPoints.map(point => `${point.x},${point.y}`).join(" ");
  const previousPolygon = dataPoints.map(point => `${point.previousX},${point.previousY}`).join(" ");
  const grid = [0.25, 0.5, 0.75, 1].map(scale => `<polygon points="${safeItems.map((_, i) => { const p = axisPoint(i, radius * scale); return `${p.x},${p.y}`; }).join(" ")}" class="radar-grid-line" />`).join("");
  const axisLines = safeItems.map((_, i) => { const p = axisPoint(i); return `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" class="radar-axis-line" data-category="${safeItems[i].label}" />`; }).join("");
  const ordered = [...safeItems].sort((a,b) => b.v-a.v);
  const strongest = ordered[0] || {label:"—",v:0};
  const weakest = [...safeItems].filter(item => item.v > 0).sort((a,b) => a.v-b.v)[0] || {label:"—",v:0};
  const minimum = Math.min(...safeItems.map(item => item.v));
  const currentMax = Math.max(...safeItems.map(item => item.v), 1);
  const balance = currentMax ? Math.max(0, Math.round(100 - ((currentMax - minimum) / currentMax) * 100)) : 0;
  const pointMarkup = (point, index, series) => {
    const isCurrent = series === "current";
    const value = isCurrent ? point.v : point.previous;
    const percent = isCurrent ? point.percent : point.previousPercent;
    const x = isCurrent ? point.x : point.previousX;
    const y = isCurrent ? point.y : point.previousY;
    const micro = isCurrent ? currentMicro : previousMicro;
    return `<g class="radar-pro2-point radar-pro2-point-${series}" tabindex="0" role="button" aria-label="${micro}, ${point.label}: ${value} series" style="--radar-delay:${index * 55}ms" data-label="${point.label}" data-value="${value}" data-percent="${percent}" data-previous="${point.previous}" data-delta="${point.delta}" data-delta-percent="${point.deltaPercent}" data-current-micro="${currentMicro}" data-previous-micro="${previousMicro}" data-series="${series}" data-micro="${micro}" data-category="${point.label}"><circle cx="${x}" cy="${y}" r="13" class="radar-point-hit" /><circle cx="${x}" cy="${y}" r="6" class="radar-point-core" /></g>`;
  };
  return `
    <div class="radar-pro2-wrap radar-comparison-wrap is-animated">
      <div class="radar-comparison-legend" aria-label="Leyenda del radar comparativo">
        <span class="radar-legend-base"><i></i>${previousMicro} · base</span>
        <span class="radar-legend-current"><i></i>${currentMicro} · comparado</span>
      </div>
      <svg class="radar-pro2-svg" viewBox="0 0 400 400" role="img" aria-label="Radar comparativo de ${previousMicro} y ${currentMicro}">
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#22c55e" stop-opacity="0.36"/><stop offset="100%" stop-color="#14b8a6" stop-opacity="0.04"/></radialGradient>
          <radialGradient id="radarBaseGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#60a5fa" stop-opacity="0.28"/><stop offset="100%" stop-color="#2563eb" stop-opacity="0.03"/></radialGradient>
          <filter id="radarShadow"><feDropShadow dx="0" dy="10" stdDeviation="11" flood-color="#22c55e" flood-opacity="0.2"/></filter>
        </defs>
        <g class="radar-grid-group">${grid}${axisLines}</g>
        <polygon points="${previousPolygon}" class="radar-data-area radar-data-area-base" />
        <polygon points="${previousPolygon}" class="radar-data-line radar-data-line-base" />
        <polygon points="${currentPolygon}" class="radar-data-area radar-data-area-current" filter="url(#radarShadow)" />
        <polygon points="${currentPolygon}" class="radar-data-line radar-data-line-current" />
        ${dataPoints.map((point,index) => pointMarkup(point,index,"base")).join("")}
        ${dataPoints.map((point,index) => pointMarkup(point,index,"current")).join("")}
        ${dataPoints.map(point => `<text x="${point.labelX}" y="${point.labelY}" text-anchor="middle" dominant-baseline="middle" class="radar-pro2-label" data-category="${point.label}">${point.label}</text>`).join("")}
      </svg>
      <div class="radar-pro2-focus-card"><span>Mayor foco · ${currentMicro}</span><strong>${strongest.label}</strong><small>${graphProFormatNumber(strongest.v)} series · ${total ? safeDistributionPercent(strongest.v,total) : 0}%</small></div>
      <div class="radar-pro2-insight-strip" aria-label="Lectura rápida del radar"><article><span>Equilibrio · ${currentMicro}</span><strong>${balance}%</strong><small>Distribución global</small></article><article><span>Menor estímulo · ${currentMicro}</span><strong>${weakest.label}</strong><small>${graphProFormatNumber(weakest.v)} series</small></article></div>
      <div class="radar-pro2-tooltip" id="radarTooltip" role="tooltip"><span>Categoría</span><strong>-</strong><p>- series · -%</p><small>-</small></div>
    </div>`;
}


function graphProFormatNumber(value = 0, maximumFractionDigits = 2) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0";
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits
  }).format(numeric);
}

function graphProFormatKilograms(value = 0) {
  return graphProFormatNumber(value, 2);
}

function graphProDominantCategory(items = []) {
  const labels = {
    TS: "Tren superior",
    TI: "Tren inferior",
    Core: "Core",
    Plyo: "Pliometría",
    "Mov.": "Movilidad",
    "Act.": "Activación"
  };
  const strongest = [...items].sort((a, b) => Number(b.v || 0) - Number(a.v || 0))[0];
  return strongest && Number(strongest.v) > 0 ? (labels[strongest.label] || strongest.label) : "Sin datos";
}


const graphProKpiFocusByAthlete = new Map();

function graphProInspectorPayload(metric = "", categories = [], currentStats = {}, previousStats = {}, currentLabel = "—", previousLabel = "—") {
  const category = categories.find(item => item.short === metric || item.key === metric);
  const totalCurrent = categories.reduce((sum, item) => sum + item.current, 0);
  const totalPrevious = categories.reduce((sum, item) => sum + item.previous, 0);
  const interpretation = (item) => {
    if (item.state === "up") return `El estímulo de ${item.label.toLowerCase()} aumenta en ${item.delta} series. El cambio describe una mayor presencia de esta capacidad, no una mejora automática del rendimiento.`;
    if (item.state === "down") return `El estímulo de ${item.label.toLowerCase()} disminuye en ${Math.abs(item.delta)} series. Puede responder a descarga, redistribución o cambio de prioridad y debe contrastarse con la planificación.`;
    return `La exposición de ${item.label.toLowerCase()} permanece estable entre ambos microciclos.`;
  };
  if (category) {
    const shareCurrent = totalCurrent ? Math.round((category.current / totalCurrent) * 100) : 0;
    const sharePrevious = totalPrevious ? Math.round((category.previous / totalPrevious) * 100) : 0;
    return { key: category.short, title: category.label, current: `${graphProFormatNumber(category.current)} series`, previous: `${graphProFormatNumber(category.previous)} series`, delta: `${category.delta > 0 ? "+" : ""}${graphProFormatNumber(category.delta)} · ${category.percent > 0 ? "+" : ""}${category.percent}%`, share: `${shareCurrent}% en ${currentLabel} · ${sharePrevious}% en ${previousLabel}`, tone: category.state, text: interpretation(category), recommendation: category.state === "up" ? "Comprueba que el aumento estaba previsto y que recuperación y calidad técnica lo sostienen." : category.state === "down" ? "Confirma si la reducción es intencionada y si otra capacidad ha absorbido el estímulo." : "Mantén el seguimiento y valora calidad, intensidad y respuesta del deportista." };
  }
  const workloadDelta = (Number(currentStats.tonnage) || 0) - (Number(previousStats.tonnage) || 0);
  const totalDelta = totalCurrent - totalPrevious;
  const generic = {
    global: { title: "Cambio global de estímulo", current: `${graphProFormatNumber(totalCurrent)} series`, previous: `${graphProFormatNumber(totalPrevious)} series`, delta: `${totalDelta > 0 ? "+" : ""}${graphProFormatNumber(totalDelta)} · ${graphProInsightPercent(totalCurrent,totalPrevious)}%`, share: "Suma de las seis categorías", tone: totalDelta > 0 ? "up" : totalDelta < 0 ? "down" : "stable", text: "Resume el cambio total de exposición entre los microciclos seleccionados.", recommendation: "Interprétalo junto con intensidad, recuperación, objetivo del micro y respuesta del deportista." },
    balance: { title: "Balance de categorías", current: `${categories.filter(x=>x.state==='up').length} aumentan`, previous: `${categories.filter(x=>x.state==='down').length} disminuyen`, delta: `${categories.filter(x=>x.state==='stable').length} estables`, share: `${categories.length} áreas analizadas`, tone: "stable", text: "Muestra cómo se reparte la dirección del cambio entre las capacidades analizadas.", recommendation: "Revisa si la distribución coincide con las prioridades definidas para el microciclo." },
    consistency: { title: "Consistencia del cambio", current: "Dirección dominante", previous: `${currentLabel} vs ${previousLabel}`, delta: "Lectura estructural", share: "No mide rendimiento", tone: "stable", text: "Indica si las áreas modificadas se desplazan mayoritariamente en la misma dirección.", recommendation: "Una consistencia alta puede ser coherente con carga o descarga; valida siempre el objetivo planificado." },
    tonnage: { title: "Tonelaje", current: `${graphProFormatKilograms(currentStats.tonnage)} kg`, previous: `${graphProFormatKilograms(previousStats.tonnage)} kg`, delta: `${workloadDelta > 0 ? "+" : ""}${graphProFormatKilograms(workloadDelta)} kg · ${graphProInsightPercent(currentStats.tonnage,previousStats.tonnage)}%`, share: "Carga externa registrada", tone: workloadDelta > 0 ? "up" : workloadDelta < 0 ? "down" : "stable", text: "Compara la carga externa acumulada registrada en ambos microciclos.", recommendation: "Contrasta el tonelaje con repeticiones, intensidad relativa, RPE y tolerancia individual." }
  };
  return { key: metric, ...(generic[metric] || generic.global) };
}

function graphProBuildIntelligencePanel(currentStats = {}, previousStats = {}, currentLabel = "—", previousLabel = "—", patientNickname = "") {
  const categories = graphProInsightCategoryMeta().map(item => {
    const current = Number(currentStats[item.key]) || 0;
    const previous = Number(previousStats[item.key]) || 0;
    const delta = current - previous;
    const percent = graphProInsightPercent(current, previous);
    const state = Math.abs(percent) < 5 || delta === 0 ? "stable" : (delta > 0 ? "up" : "down");
    return { ...item, current, previous, delta, percent, state };
  });
  const totalCurrent = categories.reduce((sum, item) => sum + item.current, 0);
  const totalPrevious = categories.reduce((sum, item) => sum + item.previous, 0);
  const totalDelta = totalCurrent - totalPrevious;
  const totalPercent = graphProInsightPercent(totalCurrent, totalPrevious);
  const increases = categories.filter(item => item.state === "up").sort((a, b) => b.percent - a.percent);
  const decreases = categories.filter(item => item.state === "down").sort((a, b) => a.percent - b.percent);
  const stable = categories.filter(item => item.state === "stable");
  const changed = increases.length + decreases.length;
  const consistency = changed ? Math.round((Math.max(increases.length, decreases.length) / changed) * 100) : 100;
  const direction = increases.length > decreases.length ? "Expansión del estímulo" : decreases.length > increases.length ? "Reducción del estímulo" : "Estructura estable";
  const directionTone = increases.length > decreases.length ? "positive" : decreases.length > increases.length ? "attention" : "stable";
  const mainIncrease = increases[0] || null;
  const mainDecrease = decreases[0] || null;
  const workloadDelta = (Number(currentStats.tonnage) || 0) - (Number(previousStats.tonnage) || 0);
  const workloadPercent = graphProInsightPercent(currentStats.tonnage, previousStats.tonnage);
  const initialMetric = graphProKpiFocusByAthlete.get(patientNickname) || "";
  return `
    <div class="graph-pro-intelligence-panel" aria-label="Panel de inteligencia comparativa" data-patient="${patientNickname}" data-current-label="${currentLabel}" data-previous-label="${previousLabel}">
      <div class="graph-pro-intelligence-panel-head"><div><p class="eyebrow">KPI Inspector · v3.0.4</p><h3>Lectura rápida del proceso</h3></div><span class="graph-pro-intelligence-direction tone-${directionTone}">${direction}</span></div>
      <div class="graph-pro-inspector-help"><span aria-hidden="true">◎</span><p>Pasa el cursor para enfocar el radar. Pulsa un KPI para fijar el análisis.</p></div>
      <div class="graph-pro-intelligence-primary">
        <button type="button" class="graph-pro-kpi-button graph-pro-process-index tone-${directionTone}" data-kpi="global"><span>Cambio global de estímulo</span><strong>${totalPercent > 0 ? "+" : ""}${totalPercent}%</strong><small>${totalDelta > 0 ? "+" : ""}${graphProFormatNumber(totalDelta)} series · ${currentLabel} vs ${previousLabel}</small></button>
        <button type="button" class="graph-pro-kpi-button" data-kpi="balance"><span>Balance de categorías</span><strong>${increases.length} ↑ · ${stable.length} = · ${decreases.length} ↓</strong><small>${categories.length} áreas analizadas</small></button>
        <button type="button" class="graph-pro-kpi-button" data-kpi="consistency"><span>Consistencia del cambio</span><strong>${consistency}%</strong><small>${changed ? "Dirección dominante entre áreas modificadas" : "Sin cambios relevantes"}</small></button>
        <button type="button" class="graph-pro-kpi-button" data-kpi="tonnage"><span>Tonelaje</span><strong>${workloadPercent > 0 ? "+" : ""}${workloadPercent}%</strong><small>${workloadDelta > 0 ? "+" : ""}${graphProFormatKilograms(workloadDelta)} kg</small></button>
      </div>
      <div class="graph-pro-intelligence-highlights">
        <button type="button" class="graph-pro-kpi-button is-rise" data-kpi="${mainIncrease ? mainIncrease.short : 'global'}"><span>Mayor aumento</span><strong>${mainIncrease ? mainIncrease.label : "Sin aumentos"}</strong><small>${mainIncrease ? `${mainIncrease.delta > 0 ? "+" : ""}${graphProFormatNumber(mainIncrease.delta)} series · ${mainIncrease.percent > 0 ? "+" : ""}${mainIncrease.percent}%` : "No hay categorías al alza"}</small></button>
        <button type="button" class="graph-pro-kpi-button is-drop" data-kpi="${mainDecrease ? mainDecrease.short : 'global'}"><span>Mayor reducción</span><strong>${mainDecrease ? mainDecrease.label : "Sin reducciones"}</strong><small>${mainDecrease ? `${graphProFormatNumber(mainDecrease.delta)} series · ${mainDecrease.percent}%` : "No hay categorías a la baja"}</small></button>
      </div>
      <div class="graph-pro-intelligence-list" role="list" aria-label="Cambios por categoría">
        ${categories.map(item => `<button type="button" role="listitem" class="graph-pro-intelligence-row graph-pro-kpi-button is-${item.state}" data-kpi="${item.short}"><span>${item.short}</span><strong>${graphProFormatNumber(item.current)}</strong><small>${item.delta > 0 ? "+" : ""}${graphProFormatNumber(item.delta)} · ${item.percent > 0 ? "+" : ""}${item.percent}%</small></button>`).join("")}
      </div>
      <section class="graph-pro-kpi-inspector" id="graphProKpiInspector" aria-live="polite" ${initialMetric ? '' : 'hidden'}>
        <div class="graph-pro-kpi-inspector-head"><div><span>Análisis específico</span><h4 id="graphProInspectorTitle">Selecciona un KPI</h4></div><button type="button" id="graphProInspectorClose" aria-label="Cerrar modo foco">×</button></div>
        <div class="graph-pro-kpi-inspector-values"><article><span>${previousLabel}</span><strong id="graphProInspectorPrevious">—</strong></article><article><span>${currentLabel}</span><strong id="graphProInspectorCurrent">—</strong></article><article><span>Cambio</span><strong id="graphProInspectorDelta">—</strong></article></div>
        <p class="graph-pro-kpi-inspector-share" id="graphProInspectorShare">—</p><p id="graphProInspectorText">Pulsa un indicador para abrir su lectura contextual.</p><div class="graph-pro-kpi-recommendation"><span>Decisión práctica</span><p id="graphProInspectorRecommendation">—</p></div>
      </section>
      <p class="graph-pro-intelligence-note">Estos indicadores describen cambios de carga y distribución. No equivalen por sí solos a una mejora del rendimiento.</p>
      <script type="application/json" class="graph-pro-inspector-data">${JSON.stringify({categories,currentStats,previousStats,currentLabel,previousLabel,initialMetric})}</script>
    </div>`;
}


function graphProBuildDecisionWorkspace(currentStats = {}, previousStats = {}, context = {}) {
  const { currentLabel = "—", previousLabel = "—", coach = {}, healthScore = 0, healthMeta = {} } = context;
  const pct = (current, previous) => graphProInsightPercent(Number(current) || 0, Number(previous) || 0);
  const currentHasActivity = Number(currentStats.sessions) > 0 || Number(currentStats.series) > 0;
  const previousHasActivity = Number(previousStats.sessions) > 0 || Number(previousStats.series) > 0;
  const incompleteTonnage = (currentHasActivity && Number(currentStats.tonnage) === 0 && Number(previousStats.tonnage) > 0) ||
    (previousHasActivity && Number(previousStats.tonnage) === 0 && Number(currentStats.tonnage) > 0);
  const seriesPercent = pct(currentStats.series, previousStats.series);
  const categoryDefs = [["ts","Tren superior"],["ti","Tren inferior"],["core","Core"],["plyo","Plyo"],["mov","Movilidad"],["act","Activación"]];
  const categoryChanges = categoryDefs.map(([key,label]) => {
    const current = Number(currentStats[key]) || 0;
    const previous = Number(previousStats[key]) || 0;
    return { key, label, delta: current - previous, percent: pct(current, previous) };
  });
  const mainDecrease = categoryChanges.filter(item => item.delta < 0).sort((a,b) => a.delta - b.delta)[0];
  const priority = coach.alerts?.[0] || coach.opportunities?.[0] || null;

  let priorityTitle = priority?.title || healthMeta.label || "Confirmar continuidad del proceso";
  let priorityText = priority?.text || "No hay una incoherencia prioritaria. Contrasta la señal principal con el objetivo del bloque antes de intervenir.";
  let actionTitle = "Contrastar con la planificación";
  let actionText = healthMeta.action || `Revisa si la evolución ${previousLabel} → ${currentLabel} responde al objetivo previsto antes de modificar el siguiente micro.`;
  let nextTitle = mainDecrease ? `Después: revisar ${mainDecrease.label}` : "Después: confirmar la respuesta del bloque";
  let nextText = mainDecrease ? `${mainDecrease.label} presenta la reducción más clara (${mainDecrease.percent}%). Comprueba si es deliberada antes de corregirla.` : "Si la señal principal es coherente, conserva la estructura y continúa el seguimiento.";
  let primaryLabel = "Abrir inteligencia";
  let primaryTarget = ".graph-pro-v4-hub";
  let secondaryLabel = `Comparar ${previousLabel} ↔ ${currentLabel}`;
  let secondaryTarget = ".graph-pro-comparison-workspace";
  let confidence = Number(healthScore) >= 70 ? "Alta" : Number(healthScore) >= 45 ? "Media" : "Condicionada";
  let tone = Number(healthScore) < 58 ? "review" : Number(healthScore) < 78 ? "attention" : "positive";

  if (incompleteTonnage) {
    priorityTitle = `Validar el tonelaje de ${currentLabel}`;
    priorityText = `${currentLabel} tiene actividad registrada, pero el tonelaje no es homogéneo entre los micros. No conviene interpretar todavía el cambio como progresión o descarga.`;
    actionTitle = "Corregir o confirmar el dato antes de decidir";
    actionText = `Comprueba primero los kg registrados en ${currentLabel}. Después valida si el cambio de ${seriesPercent > 0 ? "+" : ""}${seriesPercent}% en series responde realmente al objetivo del bloque.`;
    nextTitle = mainDecrease ? `Siguiente revisión: ${mainDecrease.label}` : "Siguiente revisión: estructura del bloque";
    nextText = mainDecrease ? `Una vez validado el tonelaje, comprueba si la reducción de ${mainDecrease.label} (${mainDecrease.percent}%) es intencionada.` : "Una vez validado el tonelaje, vuelve a la comparación para interpretar la estructura completa.";
    primaryLabel = `Revisar ${currentLabel}`;
    primaryTarget = ".graph-pro-comparison-workspace";
    secondaryLabel = "Ver causa en Timeline";
    secondaryTarget = ".performance-timeline-intelligence";
    confidence = "Alta";
    tone = "review";
  }

  return `<section class="performance-decision-workspace tone-${tone}" aria-labelledby="performanceDecisionTitle">
    <div class="performance-decision-head">
      <div><p class="eyebrow">DECISION WORKSPACE · v2.5.0.1</p><h3 id="performanceDecisionTitle">Qué hacer ahora</h3><p>Convierte las señales del Centro de Rendimiento en una secuencia concreta de actuación.</p></div>
      <div class="performance-decision-meta"><span>Confianza</span><strong>${confidence}</strong><small>${previousLabel} ↔ ${currentLabel}</small></div>
    </div>
    <div class="performance-decision-focus">
      <article class="performance-decision-main"><span>Prioridad #1</span><h4>${priorityTitle}</h4><p>${priorityText}</p></article>
      <article class="performance-decision-step"><span>Qué hacer</span><h4>${actionTitle}</h4><p>${actionText}</p></article>
      <article class="performance-decision-next"><span>Qué revisar después</span><h4>${nextTitle}</h4><p>${nextText}</p></article>
    </div>
    <div class="performance-decision-cta">
      <div><span>Decisión guiada</span><p>El Dashboard informa; este espacio te lleva directamente al siguiente punto de revisión.</p></div>
      <div class="performance-decision-buttons">
        <button type="button" class="is-primary" data-performance-scroll="${primaryTarget}">${primaryLabel}</button>
        <button type="button" data-performance-scroll="${secondaryTarget}">${secondaryLabel}</button>
      </div>
    </div>
  </section>`;
}

function graphProBuildExecutiveDashboard(currentStats = {}, previousStats = {}, context = {}) {
  const { currentLabel = "—", previousLabel = "—", coach = {}, predictive = {}, healthScore = 0 } = context;
  const pct = (current, previous) => graphProInsightPercent(Number(current) || 0, Number(previous) || 0);
  const changeMeta = (label, current, previous, unit = "") => {
    const delta = (Number(current) || 0) - (Number(previous) || 0);
    const percent = pct(current, previous);
    const tone = Math.abs(percent) < 5 || delta === 0 ? "stable" : delta > 0 ? "up" : "down";
    return { label, current: Number(current) || 0, previous: Number(previous) || 0, delta, percent, unit, tone };
  };

  const changes = [
    changeMeta("Sesiones", currentStats.sessions, previousStats.sessions),
    changeMeta("Series", currentStats.series, previousStats.series),
    changeMeta("Tonelaje", currentStats.tonnage, previousStats.tonnage, "kg")
  ];

  const categories = ["ts", "ti", "core", "plyo", "mov", "act"].map(key => Number(currentStats[key]) || 0);
  const activeCategories = categories.filter(value => value > 0);
  const categoryTotal = categories.reduce((sum, value) => sum + value, 0);
  const categoryPeak = Math.max(...categories, 0);
  const concentration = categoryTotal ? Math.round((categoryPeak / categoryTotal) * 100) : 0;
  const balanceScore = activeCategories.length < 2 ? 0 : Math.max(0, Math.min(100, 100 - Math.max(0, concentration - 25) * 1.65));

  const currentHasActivity = Number(currentStats.sessions) > 0 || Number(currentStats.series) > 0;
  const previousHasActivity = Number(previousStats.sessions) > 0 || Number(previousStats.series) > 0;
  const incompleteTonnage = (currentHasActivity && Number(currentStats.tonnage) === 0 && Number(previousStats.tonnage) > 0) ||
    (previousHasActivity && Number(previousStats.tonnage) === 0 && Number(currentStats.tonnage) > 0);
  const loadPercent = pct(currentStats.series, previousStats.series);

  const areaStates = [
    { label: "Carga", value: incompleteTonnage ? "Revisar datos" : Math.abs(loadPercent) < 10 ? "Estable" : Math.abs(loadPercent) < 25 ? "Atención" : "Prioritario", tone: incompleteTonnage ? "info" : Math.abs(loadPercent) < 10 ? "positive" : Math.abs(loadPercent) < 25 ? "attention" : "review" },
    { label: "Distribución", value: balanceScore >= 75 ? "Equilibrada" : balanceScore >= 50 ? "Concentrada" : "Muy concentrada", tone: balanceScore >= 75 ? "positive" : balanceScore >= 50 ? "attention" : "review" },
    { label: "Estabilidad", value: predictive.stabilityMeta?.label || "Sin datos", tone: Number(predictive.stability) >= 75 ? "positive" : Number(predictive.stability) >= 55 ? "attention" : "review" },
    { label: "Coherencia", value: coach.scoreMeta?.label || "Sin datos", tone: Number(coach.score) >= 75 ? "positive" : Number(coach.score) >= 55 ? "attention" : "review" }
  ];

  const alerts = [];
  if (incompleteTonnage) alerts.push({ tone: "info", title: "Tonelaje incompleto", text: "Uno de los micros tiene actividad, pero no carga externa computable." });
  if (Math.abs(loadPercent) >= 25) alerts.push({ tone: loadPercent > 0 ? "attention" : "review", title: "Cambio brusco de series", text: `${currentLabel} varía un ${loadPercent > 0 ? "+" : ""}${loadPercent}% frente a ${previousLabel}.` });
  if (balanceScore < 50 && categoryTotal > 0) alerts.push({ tone: "attention", title: "Distribución concentrada", text: `La categoría principal reúne aproximadamente el ${concentration}% del trabajo.` });
  (coach.alerts || []).slice(0, 2).forEach(item => alerts.push({ tone: "review", title: item.title || "Alerta del entrenador", text: item.text || "Revisa la señal detectada." }));
  if (!alerts.length) alerts.push({ tone: "positive", title: "Sin alertas prioritarias", text: "No se detectan señales críticas en la comparación activa." });

  const riskLabel = alerts.some(item => item.tone === "review") ? "Alto" : alerts.some(item => item.tone === "attention") ? "Moderado" : "Bajo";
  const riskTone = riskLabel === "Alto" ? "review" : riskLabel === "Moderado" ? "attention" : "positive";

  return `
    <section class="performance-executive-dashboard" aria-labelledby="performanceDashboardTitle">
      <div class="performance-dashboard-head">
        <div><p class="eyebrow">EXECUTIVE DASHBOARD · v2.1</p><h3 id="performanceDashboardTitle">Panel de mando</h3><p>Estado, cambios y alertas de la comparación activa.</p></div>
        <span class="performance-dashboard-risk tone-${riskTone}">Riesgo ${riskLabel}</span>
      </div>

      <div class="performance-dashboard-kpis">
        <article><span>Performance</span><strong>${healthScore}<small>/100</small></strong><em>Índice global</em></article>
        <article><span>Coach Score</span><strong>${coach.score || 0}<small>%</small></strong><em>${coach.scoreMeta?.label || "Sin datos"}</em></article>
        <article><span>Stability</span><strong>${predictive.stability || 0}<small>%</small></strong><em>${predictive.stabilityMeta?.label || "Sin datos"}</em></article>
        <article><span>Nivel de atención</span><strong class="is-text tone-${riskTone}">${riskLabel}</strong><em>${alerts.length} señal${alerts.length === 1 ? "" : "es"}</em></article>
      </div>

      <div class="performance-dashboard-main">
        <div class="performance-dashboard-column">
          <div class="performance-dashboard-section-title"><span>Cambios relevantes</span><small>${previousLabel} → ${currentLabel}</small></div>
          <div class="performance-change-list">
            ${changes.map(item => `<article class="tone-${item.tone}"><div><span>${item.label}</span><small>${graphProFormatNumber(item.previous)}${item.unit ? ` ${item.unit}` : ""} → ${graphProFormatNumber(item.current)}${item.unit ? ` ${item.unit}` : ""}</small></div><strong>${item.percent > 0 ? "+" : ""}${item.percent}%</strong></article>`).join("")}
          </div>
        </div>

        <div class="performance-dashboard-column">
          <div class="performance-dashboard-section-title"><span>Estado por áreas</span><small>Lectura ejecutiva</small></div>
          <div class="performance-area-grid">
            ${areaStates.map(item => `<article class="tone-${item.tone}"><span>${item.label}</span><strong>${item.value}</strong><i></i></article>`).join("")}
          </div>
        </div>

        <div class="performance-dashboard-column">
          <div class="performance-dashboard-section-title"><span>Alertas ejecutivas</span><small>Máximo 3</small></div>
          <div class="performance-alert-list">
            ${alerts.slice(0, 3).map(item => `<article class="tone-${item.tone}"><i></i><div><strong>${item.title}</strong><p>${item.text}</p></div></article>`).join("")}
          </div>
        </div>
      </div>

      <nav class="performance-dashboard-nav" aria-label="Accesos rápidos del Centro de Rendimiento">
        <span>Ir a</span>
        <button type="button" data-performance-scroll=".performance-timeline-intelligence">Timeline</button>
        <button type="button" data-performance-scroll=".graph-pro-comparison-workspace">Comparación</button>
        <button type="button" data-performance-scroll=".graph-pro-grid">Radar</button>
        <button type="button" data-performance-scroll=".graph-pro-intelligence-panel">KPIs</button>
        <button type="button" data-performance-scroll=".graph-pro-v4-hub">Inteligencia</button>
        <button type="button" data-performance-scroll=".graph-pro-briefing">Insights</button>
      </nav>
    </section>`;
}





const PPF_GRAPH_PRO_BLOCK_LIBRARY_KEY = "ppfGraphProBlockLibraryV231";

function graphProReadBlockLibrary() {
  try {
    const value = JSON.parse(localStorage.getItem(PPF_GRAPH_PRO_BLOCK_LIBRARY_KEY) || "{}");
    return value && typeof value === "object" ? value : {};
  } catch (_) { return {}; }
}

function graphProWriteBlockLibrary(library = {}) {
  try { localStorage.setItem(PPF_GRAPH_PRO_BLOCK_LIBRARY_KEY, JSON.stringify(library)); } catch (_) {}
}

function graphProGetAthleteBlockLibrary(patientNickname = "") {
  const library = graphProReadBlockLibrary();
  const list = Array.isArray(library[patientNickname]) ? library[patientNickname] : [];
  return list.map(item => ({
    id: String(item.id || ""),
    name: String(item.name || "Bloque guardado"),
    micros: [...new Set((item.micros || []).map(Number).filter(Boolean))].sort((a,b)=>a-b),
    favorite: Boolean(item.favorite),
    createdAt: Number(item.createdAt) || Date.now(),
    updatedAt: Number(item.updatedAt) || Number(item.createdAt) || Date.now()
  })).sort((a,b) => Number(b.favorite)-Number(a.favorite) || b.updatedAt-a.updatedAt);
}

function graphProSaveAthleteBlockLibrary(patientNickname = "", list = []) {
  const library = graphProReadBlockLibrary();
  library[patientNickname] = list;
  graphProWriteBlockLibrary(library);
}

function graphProCreateLibraryBlock(block = {}) {
  return {
    id: `ppf-block-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    name: graphProBlockLabel(block, "Bloque guardado"),
    micros: [...new Set((block.micros || []).map(Number).filter(Boolean))].sort((a,b)=>a-b),
    favorite: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

function graphProRenderBlockLibrary(blockState = {}) {
  const list = Array.isArray(blockState.library) ? blockState.library : [];
  const escape = value => typeof graphProEscape === "function" ? graphProEscape(String(value || "")) : String(value || "");
  const cards = list.length ? list.map(item => `<article class="graph-pro-library-card ${item.favorite ? "is-favorite" : ""}" data-library-id="${escape(item.id)}">
    <button type="button" class="graph-pro-library-favorite" data-library-action="favorite" title="${item.favorite ? "Quitar de favoritos" : "Marcar como favorito"}" aria-label="${item.favorite ? "Quitar de favoritos" : "Marcar como favorito"}">${item.favorite ? "★" : "☆"}</button>
    <div class="graph-pro-library-card-copy"><strong>${escape(item.name)}</strong><span>${item.micros.length} micro${item.micros.length === 1 ? "" : "s"} · ${item.micros.map(m=>`M${m}`).join(" · ")}</span></div>
    <div class="graph-pro-library-load"><button type="button" data-library-action="load-a">Cargar en A</button><button type="button" data-library-action="load-b">Cargar en B</button></div>
    <div class="graph-pro-library-menu"><button type="button" data-library-action="rename" title="Renombrar">✎</button><button type="button" data-library-action="duplicate" title="Duplicar">⧉</button><button type="button" data-library-action="delete" title="Eliminar">×</button></div>
  </article>`).join("") : `<div class="graph-pro-library-empty"><strong>Tu biblioteca está vacía</strong><span>Guarda el Bloque A o B para reutilizarlo en futuras comparaciones.</span></div>`;
  return `<section class="graph-pro-block-library" aria-labelledby="graphProBlockLibraryTitle">
    <div class="graph-pro-library-head"><div><p class="eyebrow">BIBLIOTECA DE BLOQUES · v2.3.1</p><h4 id="graphProBlockLibraryTitle">Bloques guardados</h4><p>Recupera, organiza y reutiliza estructuras de entrenamiento por deportista.</p></div><span>${list.length} guardado${list.length === 1 ? "" : "s"}</span></div>
    <div class="graph-pro-library-list">${cards}</div>
  </section>`;
}

function graphProAverageBlockStats(patientNickname = "", selectedMicros = []) {
  const micros = [...new Set((selectedMicros || []).map(Number).filter(Boolean))].sort((a,b) => a-b);
  const keys = ["sessions","series","exercises","tonnage","ts","ti","core","plyo","mov","act"];
  const totals = { micro: 0, sessions: 0, series: 0, exercises: 0, tonnage: 0, ts: 0, ti: 0, core: 0, plyo: 0, mov: 0, act: 0 };
  const history = micros.map(micro => getMicroStatsForGraphPro(patientNickname, micro));
  history.forEach(stats => keys.forEach(key => { totals[key] += Number(stats[key]) || 0; }));
  const divisor = Math.max(micros.length, 1);
  const averages = { ...totals };
  keys.forEach(key => { averages[key] = totals[key] / divisor; });
  const seriesValues = history.map(item => Number(item.series) || 0);
  const meanSeries = averages.series || 0;
  const variance = seriesValues.length > 1 ? seriesValues.reduce((sum,value)=>sum + Math.pow(value-meanSeries,2),0) / seriesValues.length : 0;
  const variability = meanSeries ? Math.round((Math.sqrt(variance) / meanSeries) * 100) : 0;
  const density = totals.sessions ? totals.series / totals.sessions : 0;
  const kgPerSession = totals.sessions ? totals.tonnage / totals.sessions : 0;
  return { micros, count: micros.length, totals, averages, history, variability, density, kgPerSession };
}

function graphProBlockLabel(block = {}, fallback = "Bloque") {
  const name = String(block.name || "").trim();
  return name || fallback;
}


function graphProBuildSmartComparisons(patientNickname = "", micros = []) {
  const ordered = [...new Set((micros || []).map(Number).filter(Boolean))].sort((a,b)=>a-b);
  if (ordered.length < 4) return [];
  const stats = ordered.map(micro => ({ micro, ...getMicroStatsForGraphPro(patientNickname, micro) }));
  const scoreLoad = item => (Number(item.series)||0) + ((Number(item.tonnage)||0) / 500) + ((Number(item.sessions)||0) * 2);
  const chunk = Math.max(2, Math.min(4, Math.floor(ordered.length / 2)));
  const previous = ordered.slice(Math.max(0, ordered.length - chunk * 2), ordered.length - chunk);
  const latest = ordered.slice(-chunk);
  const first = ordered.slice(0, chunk);
  const last = ordered.slice(-chunk);
  const rankedLoad = [...stats].sort((a,b)=>scoreLoad(b)-scoreLoad(a));
  const highLoad = rankedLoad.slice(0, chunk).map(x=>x.micro).sort((a,b)=>a-b);
  const remaining = stats.filter(x=>!highLoad.includes(x.micro));
  const meanSeries = remaining.reduce((a,x)=>a+(Number(x.series)||0),0)/Math.max(remaining.length,1);
  const stable = [...remaining].sort((a,b)=>Math.abs((Number(a.series)||0)-meanSeries)-Math.abs((Number(b.series)||0)-meanSeries)).slice(0,chunk).map(x=>x.micro).sort((a,b)=>a-b);
  const dense = [...stats].sort((a,b)=>((Number(b.sessions)||0)?(Number(b.series)||0)/Number(b.sessions):0)-((Number(a.sessions)||0)?(Number(a.series)||0)/Number(a.sessions):0)).slice(0,chunk).map(x=>x.micro).sort((a,b)=>a-b);
  const lowDensity = [...stats].filter(x=>!dense.includes(x.micro)).sort((a,b)=>((Number(a.sessions)||0)?(Number(a.series)||0)/Number(a.sessions):0)-((Number(b.sessions)||0)?(Number(b.series)||0)/Number(b.sessions):0)).slice(0,chunk).map(x=>x.micro).sort((a,b)=>a-b);
  const items = [
    { id:'recent', icon:'↗', title:'Evolución reciente', subtitle:`Últimos ${latest.length} micros vs ${previous.length} anteriores`, aName:'Periodo anterior', bName:'Periodo reciente', a:previous, b:latest, reason:'Detecta el cambio más reciente de carga, frecuencia y densidad.' },
    { id:'progression', icon:'⏱', title:'Inicio vs actualidad', subtitle:'Primer bloque disponible vs último bloque', aName:'Inicio del periodo', bName:'Situación actual', a:first, b:last, reason:'Mide la evolución acumulada dentro del historial disponible.' },
    { id:'load-stability', icon:'⚖', title:'Carga vs estabilidad', subtitle:'Micros de mayor carga vs patrón más estable', aName:'Mayor estabilidad', bName:'Mayor carga', a:stable, b:highLoad, reason:'Contrasta exigencia máxima con regularidad interna.' },
    { id:'density', icon:'⚡', title:'Contraste de densidad', subtitle:'Menor densidad vs mayor densidad', aName:'Densidad contenida', bName:'Alta densidad', a:lowDensity, b:dense, reason:'Aísla el efecto de concentrar más series por sesión.' }
  ];
  return items.filter(item=>item.a.length && item.b.length && !item.a.some(m=>item.b.includes(m))).slice(0,4);
}

function graphProRenderSmartComparisons(patientNickname = "", micros = []) {
  const items = graphProBuildSmartComparisons(patientNickname, micros);
  if (!items.length) return `<section class="graph-pro-smart-blocks is-empty"><div><p class="eyebrow">SMART BLOCKS · v2.4.0</p><h4>Comparaciones inteligentes</h4><p>Se necesitan al menos cuatro microciclos para generar propuestas automáticas.</p></div></section>`;
  return `<section class="graph-pro-smart-blocks" aria-labelledby="graphProSmartBlocksTitle">
    <div class="graph-pro-smart-head"><div><p class="eyebrow">SMART BLOCKS · v2.4.0</p><h4 id="graphProSmartBlocksTitle">Comparaciones inteligentes</h4><p>PPF PRO detecta estructuras útiles y prepara ambos bloques automáticamente.</p></div><span>${items.length} sugerencias</span></div>
    <div class="graph-pro-smart-grid">${items.map(item=>`<button type="button" class="graph-pro-smart-card" data-smart-comparison="${item.id}"><span class="graph-pro-smart-icon">${item.icon}</span><strong>${item.title}</strong><small>${item.subtitle}</small><em>${item.reason}</em><b>${item.a.map(m=>`M${m}`).join(' · ')} <i>vs</i> ${item.b.map(m=>`M${m}`).join(' · ')}</b></button>`).join('')}</div>
  </section>`;
}

function graphProRenderBlockBuilder(micros = [], blockState = {}) {
  const blockA = blockState.blockA || { name: "Bloque A", micros: [] };
  const blockB = blockState.blockB || { name: "Bloque B", micros: [] };
  const renderChoices = (side, block, other) => micros.map(micro => {
    const checked = (block.micros || []).includes(micro);
    const locked = (other.micros || []).includes(micro);
    return `<label class="graph-pro-block-micro ${checked ? "is-selected" : ""} ${locked ? "is-locked" : ""}">
      <input type="checkbox" data-block-side="${side}" value="${micro}" ${checked ? "checked" : ""} ${locked ? "disabled" : ""}>
      <span>M${micro}</span>${locked ? `<small>En ${side === "A" ? "B" : "A"}</small>` : ""}
    </label>`;
  }).join("");
  return `<section class="graph-pro-block-builder" aria-labelledby="graphProBlockBuilderTitle">
    <div class="graph-pro-block-head">
      <div><p class="eyebrow">BLOCK COMPARISON INTELLIGENCE · v2.4.0</p><h3 id="graphProBlockBuilderTitle">Construye dos bloques de entrenamiento</h3><p>Selecciona libremente los micros. La lectura principal compara medias por micro para igualar bloques de distinta duración.</p></div>
      <div class="graph-pro-analysis-mode" role="group" aria-label="Nivel de comparación">
        <button type="button" data-analysis-mode="micro" class="${blockState.mode !== "block" ? "is-active" : ""}">Microciclos</button>
        <button type="button" data-analysis-mode="block" class="${blockState.mode === "block" ? "is-active" : ""}">Bloques</button>
      </div>
    </div>
    <div class="graph-pro-block-grid">
      <article class="graph-pro-block-panel is-a">
        <header><div><span>Bloque A · base</span><strong>${(blockA.micros || []).length} micros</strong></div><button type="button" data-block-clear="A">Limpiar</button></header>
        <label class="graph-pro-block-name"><span>Nombre</span><input id="graphProBlockNameA" value="${typeof graphProEscape === "function" ? graphProEscape(blockA.name || "Bloque A") : (blockA.name || "Bloque A")}" maxlength="36"></label>
        <div class="graph-pro-block-micros">${renderChoices("A", blockA, blockB)}</div><button type="button" class="graph-pro-block-save" data-block-save="A" ${(blockA.micros || []).length ? "" : "disabled"}>Guardar en biblioteca</button>
      </article>
      <button type="button" class="graph-pro-block-swap" id="graphProSwapBlocks" aria-label="Intercambiar Bloque A y Bloque B" title="Intercambiar bloques">⇄</button>
      <article class="graph-pro-block-panel is-b">
        <header><div><span>Bloque B · comparado</span><strong>${(blockB.micros || []).length} micros</strong></div><button type="button" data-block-clear="B">Limpiar</button></header>
        <label class="graph-pro-block-name"><span>Nombre</span><input id="graphProBlockNameB" value="${typeof graphProEscape === "function" ? graphProEscape(blockB.name || "Bloque B") : (blockB.name || "Bloque B")}" maxlength="36"></label>
        <div class="graph-pro-block-micros">${renderChoices("B", blockB, blockA)}</div><button type="button" class="graph-pro-block-save" data-block-save="B" ${(blockB.micros || []).length ? "" : "disabled"}>Guardar en biblioteca</button>
      </article>
    </div>
    ${graphProRenderSmartComparisons(blockState.patientNickname || "", micros)}
    ${graphProRenderBlockLibrary(blockState)}
    <div class="graph-pro-block-actions">
      <p id="graphProBlockMessage" role="status">${blockState.mode === "block" ? "Modo bloques activo: selecciona al menos un micro en cada bloque." : "Modo microciclos activo. Tus selecciones de bloques se conservan."}</p>
      <button type="button" id="graphProApplyBlocks" ${!(blockA.micros?.length && blockB.micros?.length) ? "disabled" : ""}>Analizar bloques</button>
    </div>
  </section>`;
}

function graphProBuildBlockComparisonSummary(blockAData, blockBData, labelA, labelB) {
  const pct = (b,a) => graphProInsightPercent(b,a);
  const rows = [
    ["Sesiones / micro", blockAData.averages.sessions, blockBData.averages.sessions, ""],
    ["Series / micro", blockAData.averages.series, blockBData.averages.series, ""],
    ["Tonelaje / micro", blockAData.averages.tonnage, blockBData.averages.tonnage, "kg"],
    ["Series / sesión", blockAData.density, blockBData.density, ""],
    ["Kg / sesión", blockAData.kgPerSession, blockBData.kgPerSession, "kg"],
    ["Variabilidad", blockAData.variability, blockBData.variability, "%"]
  ];
  return `<section class="graph-pro-block-results" aria-label="Comparación normalizada de bloques">
    <div class="graph-pro-block-results-head"><div><p class="eyebrow">COMPARACIÓN NORMALIZADA</p><h3>${labelA} frente a ${labelB}</h3></div><span>Medias por micro</span></div>
    <div class="graph-pro-block-result-grid">${rows.map(([name,a,b,unit])=>{const delta=pct(b,a); const tone=delta>5?"up":delta<-5?"down":"stable"; const fmt=v=>unit==="kg"?graphProFormatKilograms(v):Number(v).toFixed(name.includes("Variabilidad")?0:1).replace(".0",""); return `<article class="tone-${tone}"><span>${name}</span><div><small>${labelA}</small><strong>${fmt(a)}${unit?` <em>${unit}</em>`:""}</strong></div><div><small>${labelB}</small><strong>${fmt(b)}${unit?` <em>${unit}</em>`:""}</strong></div><b>${delta>0?"+":""}${delta}%</b></article>`}).join("")}</div>
    <div class="graph-pro-block-totals"><article><span>Totales · ${labelA}</span><strong>${graphProFormatNumber(blockAData.totals.sessions)} ses. · ${graphProFormatNumber(blockAData.totals.series)} series · ${graphProFormatKilograms(blockAData.totals.tonnage)} kg</strong></article><article><span>Totales · ${labelB}</span><strong>${graphProFormatNumber(blockBData.totals.sessions)} ses. · ${graphProFormatNumber(blockBData.totals.series)} series · ${graphProFormatKilograms(blockBData.totals.tonnage)} kg</strong></article></div>
  </section>`;
}

function graphProBuildTimelineIntelligence(patientNickname = "", micros = [], selectedA = 0, selectedB = 0, blockA = [], blockB = []) {
  const history = micros.map(micro => ({ micro, ...getMicroStatsForGraphPro(patientNickname, micro) }));
  if (!history.length) return `<section class="performance-timeline-intelligence" aria-labelledby="performanceTimelineTitle"><div class="performance-timeline-head"><div><p class="eyebrow">TIMELINE INTELLIGENCE · v2.2</p><h3 id="performanceTimelineTitle">Evolución del bloque</h3><p>No hay microciclos suficientes para construir la lectura histórica.</p></div></div></section>`;

  const maxSeries = Math.max(...history.map(item => Number(item.series) || 0), 1);
  const maxTonnage = Math.max(...history.map(item => Number(item.tonnage) || 0), 1);
  const peakSeries = history.reduce((best, item) => Number(item.series) > Number(best.series) ? item : best, history[0]);
  const peakTonnage = history.reduce((best, item) => Number(item.tonnage) > Number(best.tonnage) ? item : best, history[0]);

  const enriched = history.map((item, index) => {
    const previous = history[index - 1];
    const seriesDelta = previous ? graphProInsightPercent(item.series, previous.series) : 0;
    const tonnageDelta = previous ? graphProInsightPercent(item.tonnage, previous.tonnage) : 0;
    const hasActivity = Number(item.sessions) > 0 || Number(item.series) > 0;
    const missingLoad = hasActivity && Number(item.tonnage) === 0;
    let state = "base", label = "Base", tone = "neutral";
    if (missingLoad) { state = "incomplete"; label = "Carga sin registrar"; tone = "info"; }
    else if (item.micro === peakTonnage.micro && Number(item.tonnage) > 0) { state = "peak"; label = "Pico de carga"; tone = "positive"; }
    else if (previous && seriesDelta <= -20) { state = "download"; label = "Reducción"; tone = "attention"; }
    else if (previous && seriesDelta >= 20) { state = "progression"; label = "Progresión"; tone = "positive"; }
    else if (previous && Math.abs(seriesDelta) <= 8) { state = "stable"; label = "Estable"; tone = "neutral"; }
    else if (previous) { state = "adjustment"; label = "Ajuste"; tone = "attention"; }
    return { ...item, previousMicro: previous?.micro || 0, seriesDelta, tonnageDelta, state, label, tone };
  });

  const recent = enriched.slice(-4);
  const start = recent[0], end = recent[recent.length - 1];
  const overallSeries = start && end ? graphProInsightPercent(end.series, start.series) : 0;
  const variability = recent.length > 1 ? Math.round(recent.slice(1).reduce((sum, item) => sum + Math.abs(item.seriesDelta), 0) / (recent.length - 1)) : 0;
  const trendText = overallSeries > 12 ? `La actividad crece un ${overallSeries}% en la ventana reciente.` : overallSeries < -12 ? `La actividad desciende un ${Math.abs(overallSeries)}% en la ventana reciente.` : "La actividad se mantiene dentro de un rango relativamente estable.";
  const stabilityText = variability >= 30 ? "La variabilidad entre micros es alta; conviene revisar la continuidad del bloque." : variability >= 15 ? "La planificación presenta ajustes moderados entre semanas." : "La secuencia reciente mantiene una continuidad elevada.";
  const dataText = enriched.some(item => item.state === "incomplete") ? " Hay micros con actividad pero sin tonelaje registrado." : "";

  const nodes = enriched.map(item => {
    const seriesHeight = Math.max(8, Math.round((Number(item.series) / maxSeries) * 100));
    const tonnageHeight = Number(item.tonnage) > 0 ? Math.max(6, Math.round((Number(item.tonnage) / maxTonnage) * 100)) : 0;
    const inBlockA = blockA.includes(item.micro);
    const inBlockB = blockB.includes(item.micro);
    const active = item.micro === Number(selectedA) || item.micro === Number(selectedB) || inBlockA || inBlockB;
    const role = inBlockA ? "Bloque A" : inBlockB ? "Bloque B" : item.micro === Number(selectedA) ? "Base" : item.micro === Number(selectedB) ? "Comparado" : "";
    const fallbackBase = item.previousMicro || enriched.find(candidate => candidate.micro !== item.micro)?.micro || 0;
    return `<button type="button" class="performance-timeline-node tone-${item.tone} ${active ? "is-active" : ""} ${inBlockA ? "is-block-a" : ""} ${inBlockB ? "is-block-b" : ""}" data-timeline-micro="${item.micro}" data-timeline-base="${fallbackBase}" aria-label="Micro ${item.micro}. ${item.label}. ${item.sessions} sesiones, ${item.series} series, ${graphProFormatKilograms(item.tonnage)} kilogramos.${role ? ` Selección actual: ${role}.` : ""}">
      <span class="performance-timeline-micro">M${item.micro}</span>
      <div class="performance-timeline-bars" aria-hidden="true"><i class="is-series" style="height:${seriesHeight}%"></i><i class="is-tonnage" style="height:${tonnageHeight}%"></i></div>
      <strong>${item.label}</strong>
      <small>${item.sessions} ses. · ${item.series} series</small>
      <em>${item.previousMicro ? `${item.seriesDelta > 0 ? "+" : ""}${item.seriesDelta}%` : "Inicio"}</em>
      ${role ? `<b>${role}</b>` : ""}
    </button>`;
  }).join("");

  return `<section class="performance-timeline-intelligence" aria-labelledby="performanceTimelineTitle">
    <div class="performance-timeline-head"><div><p class="eyebrow">TIMELINE INTELLIGENCE · v2.2</p><h3 id="performanceTimelineTitle">Evolución del bloque</h3><p>Lectura cronológica de sesiones, series, tonelaje e hitos automáticos.</p></div><div class="performance-timeline-legend"><span><i class="is-series"></i>Series</span><span><i class="is-tonnage"></i>Tonelaje</span></div></div>
    <div class="performance-timeline-track" role="list">${nodes}</div>
    <div class="performance-timeline-summary">
      <article><span>Lectura histórica</span><p>${trendText} ${stabilityText}${dataText}</p></article>
      <article><span>Hitos del bloque</span><p>Pico de series en M${peakSeries.micro} (${peakSeries.series}); pico de tonelaje en M${peakTonnage.micro} (${graphProFormatKilograms(peakTonnage.tonnage)} kg).</p></article>
      <aside><strong>Pulsa un micro</strong><p>Se convertirá en el micro comparado y el anterior disponible actuará como base.</p></aside>
    </div>
  </section>`;
}

function bindPerformanceExecutiveDashboard() {
  document.querySelectorAll("[data-performance-scroll]").forEach(button => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.performanceScroll || "");
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      window.setTimeout(() => target.removeAttribute("tabindex"), 900);
    });
  });
  document.querySelectorAll("[data-timeline-micro]").forEach(button => {
    button.addEventListener("click", () => {
      const microB = Number(button.dataset.timelineMicro || 0);
      let microA = Number(button.dataset.timelineBase || 0);
      const selectA = document.getElementById("graphProMicroA");
      const selectB = document.getElementById("graphProMicroB");
      if (!selectA || !selectB || !microB) return;
      if (!microA || microA === microB) microA = [...selectA.options].map(option => Number(option.value)).find(value => value && value !== microB) || 0;
      if (!microA) return;
      selectA.value = String(microA);
      selectB.value = String(microB);
      selectB.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
}

function renderGraphProDashboard(patientNickname = "", microA = "", microB = "", blockState = {}) {
  const patient = patients.find(item => item.nickname === patientNickname);
  const totals = getPatientAnalytics(patientNickname);
  const micros = getAvailableMicrosForGraphPro(patientNickname);
  const lastMicro = micros.length ? micros[micros.length - 1] : 0;
  const previousMicro = micros.length > 1 ? micros[micros.length - 2] : lastMicro;
  const selectedA = micros.includes(Number(microA)) ? Number(microA) : previousMicro;
  const selectedB = micros.includes(Number(microB)) ? Number(microB) : lastMicro;
  const microStatsA = selectedA ? getMicroStatsForGraphPro(patientNickname, selectedA) : {};
  const microStatsB = selectedB ? getMicroStatsForGraphPro(patientNickname, selectedB) : {};
  const blockMode = blockState.mode === "block" && blockState.blockA?.micros?.length && blockState.blockB?.micros?.length;
  const blockAData = graphProAverageBlockStats(patientNickname, blockState.blockA?.micros || []);
  const blockBData = graphProAverageBlockStats(patientNickname, blockState.blockB?.micros || []);
  const statsA = blockMode ? blockAData.averages : microStatsA;
  const statsB = blockMode ? blockBData.averages : microStatsB;

  const radarValues = [
    { label: "TS", v: Number(statsB.ts) || 0 },
    { label: "TI", v: Number(statsB.ti) || 0 },
    { label: "Core", v: Number(statsB.core) || 0 },
    { label: "Plyo", v: Number(statsB.plyo) || 0 },
    { label: "Mov.", v: Number(statsB.mov) || 0 },
    { label: "Act.", v: Number(statsB.act) || 0 }
  ];
  const previousRadarValues = [
    { label: "TS", v: Number(statsA.ts) || 0 },
    { label: "TI", v: Number(statsA.ti) || 0 },
    { label: "Core", v: Number(statsA.core) || 0 },
    { label: "Plyo", v: Number(statsA.plyo) || 0 },
    { label: "Mov.", v: Number(statsA.mov) || 0 },
    { label: "Act.", v: Number(statsA.act) || 0 }
  ];

  const labelA = blockMode ? graphProBlockLabel(blockState.blockA, "Bloque A") : (selectedA ? `M${selectedA}` : "—");
  const labelB = blockMode ? graphProBlockLabel(blockState.blockB, "Bloque B") : (selectedB ? `M${selectedB}` : "—");
  const dominant = graphProDominantCategory(radarValues);
  const patientName = patient ? patient.nombre : "Deportista";
  const summary = `${graphProFormatNumber(totals.sessions)} sesiones · ${graphProFormatNumber(totals.series)} series · ${graphProFormatKilograms(totals.tonnage)} kg`;
  const coach = buildCoachIntelligenceEngine(statsB, statsA, { patientNickname, currentMicro: selectedB });
  const predictive = buildPredictiveIntelligenceEngine(statsB, { patientNickname, currentMicro: selectedB });
  const loadDelta = graphProInsightPercent(statsB.series || 0, statsA.series || 0);
  const healthScore = Math.max(0, Math.min(100, Math.round((coach.score * 0.62) + (predictive.stability * 0.38))));
  const healthMeta = healthScore >= 78
    ? { tone: "positive", label: "Rendimiento estable", action: "Mantener la dirección actual y observar la evolución." }
    : healthScore >= 58
      ? { tone: "attention", label: "Atención recomendada", action: "Revisar los cambios principales antes de progresar la carga." }
      : { tone: "review", label: "Intervención prioritaria", action: "Validar la estructura del micro y sus cambios de carga." };
  const priority = coach.alerts?.[0] || coach.opportunities?.[0] || { title: "Proceso estable", text: "No se detectan señales prioritarias en la ventana analizada." };
  const trendLabel = loadDelta > 8 ? `Carga +${loadDelta}%` : loadDelta < -8 ? `Carga ${loadDelta}%` : "Carga estable";

  return `
    <section class="performance-executive-header tone-${healthMeta.tone}" aria-labelledby="performanceExecutiveTitle">
      <div class="performance-executive-main">
        <div class="performance-executive-identity">
          ${getPatientPhotoSafe(patient) ? `<img src="${getPatientPhotoSafe(patient)}" alt="${patientName}">` : `<div class="performance-executive-avatar">${patientName.charAt(0).toUpperCase()}</div>`}
          <div>
            <p class="eyebrow">CENTRO DE RENDIMIENTO · EXECUTIVE VIEW</p>
            <h2 id="performanceExecutiveTitle">${patientName}</h2>
            <p>${summary}</p>
          </div>
        </div>
        <div class="performance-health-score" aria-label="Índice global ${healthScore} de 100">
          <span>Performance Score</span>
          <strong>${healthScore}<small>/100</small></strong>
          <em>${healthMeta.label}</em>
          <div><i style="width:${healthScore}%"></i></div>
        </div>
      </div>

      <div class="performance-context-grid">
        <article class="performance-comparison-context"><span class="graph-pro-micro-chip graph-pro-comparison-status is-active" id="graphProComparisonStatus" role="status" aria-live="polite" aria-atomic="true"><span class="graph-pro-status-label">Comparación activa</span><strong class="graph-pro-status-value">${labelA} ↔ ${labelB}</strong></span><small>${blockMode ? `Medias de ${blockAData.count} vs ${blockBData.count} micros` : "Comparación de microciclos"}</small></article>
        <article><span>Coach Score</span><strong>${coach.score}<small>%</small></strong><small>${coach.scoreMeta.label}</small></article>
        <article><span>Stability Index</span><strong>${predictive.stability}<small>%</small></strong><small>${predictive.stabilityMeta.label}</small></article>
        <article><span>Tendencia</span><strong class="is-text">${trendLabel}</strong><small>${graphProFormatNumber(statsB.series || 0)} series${blockMode ? " / micro" : ` en ${labelB}`}</small></article>
      </div>

      <div class="performance-status-banner">
        <div><span>Diagnóstico prioritario</span><strong>${priority.title}</strong><p><b>Por qué:</b> ${priority.text}</p></div>
        <aside><span>Acción recomendada</span><p>${healthMeta.action}</p></aside>
      </div>
    </section>

    ${graphProBuildDecisionWorkspace(statsB, statsA, { currentLabel: labelB, previousLabel: labelA, coach, predictive, healthScore, healthMeta })}

    ${graphProBuildExecutiveDashboard(statsB, statsA, { currentLabel: labelB, previousLabel: labelA, coach, predictive, healthScore })}

    ${graphProRenderBlockBuilder(micros, blockState)}

    ${blockMode ? graphProBuildBlockComparisonSummary(blockAData, blockBData, labelA, labelB) : ""}

    ${graphProBuildTimelineIntelligence(patientNickname, micros, selectedA, selectedB, blockState.blockA?.micros || [], blockState.blockB?.micros || [])}

    <section class="graph-pro-comparison-workspace ${blockMode ? "is-block-mode" : ""}" aria-labelledby="graphProComparisonTitle">
      <div class="graph-pro-comparison-copy">
        <p class="eyebrow">COMPARATIVE WORKSPACE · v3.0</p>
        <h3 id="graphProComparisonTitle">${blockMode ? "Comparación de bloques activa" : "Selecciona dos microciclos terminados"}</h3>
        <p>${blockMode ? "El radar, los KPIs y la inteligencia utilizan medias normalizadas de los micros seleccionados." : "El radar, el briefing y la comparativa se recalculan sobre la selección activa."}</p>
      </div>
      <div class="graph-pro-global-selectors" ${blockMode ? `aria-hidden="true"` : ""}>
        <label>
          <span>Micro base</span>
          <select id="graphProMicroA" aria-label="Seleccionar micro base">${renderMicroOptions(micros, selectedA)}</select>
        </label>
        <button type="button" class="graph-pro-swap" id="graphProSwapMicros"
          aria-label="Intercambiar micro base y micro comparado"
          title="Intercambiar la dirección del análisis">
          <span aria-hidden="true">⇄</span>
        </button>
        <label>
          <span>Micro comparado</span>
          <select id="graphProMicroB" aria-label="Seleccionar micro comparado">${renderMicroOptions(micros, selectedB)}</select>
        </label>
      </div>
      <div class="graph-pro-comparison-feedback" id="graphProComparisonFeedback" role="tooltip" hidden>
        <strong>Comparación no válida</strong>
        <span>Estás comparando el mismo micro. Cambia uno de ellos para realizar el análisis.</span>
      </div>
      <div class="graph-pro-selection-status" role="status">
        <span>${blockMode ? "Bloques activos" : "Lectura activa"}</span>
        <strong>${labelA} frente a ${labelB}</strong>
      </div>
    </section>

    <section class="graph-pro-intelligence-kpis" aria-label="Resumen de la comparación">
      <article><span>${blockMode ? "Bloque base" : "Micro base"}</span><strong>${labelA}</strong><small>${graphProFormatNumber(statsA.sessions || 0)} ${blockMode ? "sesiones / micro" : "sesiones registradas"}</small></article>
      <article><span>${blockMode ? "Bloque comparado" : "Micro comparado"}</span><strong>${labelB}</strong><small>${graphProFormatNumber(statsB.sessions || 0)} ${blockMode ? "sesiones / micro" : "sesiones registradas"}</small></article>
      <article><span>Tonelaje comparado</span><strong>${graphProFormatKilograms(statsB.tonnage || 0)} <em>kg</em></strong><small>${blockMode ? "Media por micro" : `Carga externa de ${labelB}`}</small></article>
      <article><span>Categoría dominante</span><strong class="is-text">${dominant}</strong><small>Mayor volumen en ${labelB}</small></article>
    </section>

    <section class="graph-pro-grid">
      <article class="graph-pro-card">
        <div class="module-panel-header">
          <div>
            <p class="eyebrow">Radar PRO</p>
            <h3>${labelB} analizado frente a ${labelA}</h3>
          </div>
        </div>
        ${radarSvg(radarValues, previousRadarValues, labelB, labelA)}
      </article>

      <article class="graph-pro-card graph-pro-intelligence-card">
        ${graphProBuildIntelligencePanel(statsB, statsA, labelB, labelA, patientNickname)}
      </article>
    </section>

    ${renderGraphProAutomaticInsights(statsB, statsA, {
      currentMicro: selectedB,
      previousMicro: selectedA,
      patientNickname
    })}
  `;
}

function bindRadarTooltips() {
  const tooltip = document.getElementById("radarTooltip");
  const wrap = document.querySelector(".radar-pro2-wrap");
  if (!tooltip || !wrap) return;
  let hideTimer;
  const show = point => {
    clearTimeout(hideTimer);
    const value = Number(point.dataset.value || 0);
    const delta = Number(point.dataset.delta || 0);
    const deltaPercent = Number(point.dataset.deltaPercent || 0);
    const trend = delta > 0 ? "▲" : delta < 0 ? "▼" : "=";
    const detail = tooltip.querySelector("small");
    const isBase = point.dataset.series === "base";
    tooltip.querySelector("span").textContent = `${point.dataset.label} · ${point.dataset.micro || ""}`;
    tooltip.querySelector("strong").textContent = `${graphProFormatNumber(value)} series`;
    tooltip.querySelector("p").textContent = `${point.dataset.percent}% del volumen de ${point.dataset.micro || "este micro"}`;
    detail.className = delta > 0 ? "positive" : delta < 0 ? "negative" : "neutral";
    detail.textContent = isBase
      ? `Micro base para la comparación con ${point.dataset.currentMicro}`
      : `${trend} ${delta > 0 ? "+" : ""}${graphProFormatNumber(delta)} series (${deltaPercent > 0 ? "+" : ""}${deltaPercent}%) · ${point.dataset.currentMicro} vs ${point.dataset.previousMicro}`;
    const target = point.querySelector(".radar-point-core") || point;
    const wrapRect = wrap.getBoundingClientRect(), pointRect = target.getBoundingClientRect();
    let left = pointRect.left - wrapRect.left + 24, top = pointRect.top - wrapRect.top - 92;
    if (left > wrapRect.width - 260) left = pointRect.left - wrapRect.left - 252;
    if (left < 8) left = 8;
    if (top < 8) top = pointRect.top - wrapRect.top + 24;
    tooltip.style.left = `${left}px`; tooltip.style.top = `${top}px`;
    tooltip.classList.add("show"); point.classList.add("active");
  };
  const hide = point => { hideTimer = setTimeout(() => { tooltip.classList.remove("show"); point.classList.remove("active"); }, 80); };
  document.querySelectorAll(".radar-pro2-point").forEach(point => {
    point.addEventListener("mouseenter", () => show(point));
    point.addEventListener("mouseleave", () => hide(point));
    point.addEventListener("focus", () => show(point));
    point.addEventListener("blur", () => hide(point));
  });
}


function bindGraphProKpiInspector() {
  const panel = document.querySelector(".graph-pro-intelligence-panel");
  const inspector = document.getElementById("graphProKpiInspector");
  const dataNode = panel?.querySelector(".graph-pro-inspector-data");
  if (!panel || !inspector || !dataNode) return;
  let data;
  try { data = JSON.parse(dataNode.textContent || "{}"); } catch { return; }
  const patient = panel.dataset.patient || "";
  const buttons = [...panel.querySelectorAll(".graph-pro-kpi-button")];
  const setRadarFocus = (key = "", fixed = false) => {
    const radar = document.querySelector(".radar-pro2-wrap");
    if (!radar) return;
    radar.classList.toggle("has-kpi-focus", Boolean(key && ["TS","TI","Core","Plyo","Mov.","Act."].includes(key)));
    radar.dataset.focusCategory = key;
    radar.querySelectorAll("[data-category]").forEach(node => node.classList.toggle("is-kpi-focused", node.dataset.category === key));
    radar.classList.toggle("is-kpi-fixed", fixed);
  };
  const render = (key, fixed = true) => {
    const payload = graphProInspectorPayload(key, data.categories || [], data.currentStats || {}, data.previousStats || {}, data.currentLabel, data.previousLabel);
    inspector.hidden = false;
    inspector.className = `graph-pro-kpi-inspector tone-${payload.tone}`;
    document.getElementById("graphProInspectorTitle").textContent = payload.title;
    document.getElementById("graphProInspectorPrevious").textContent = payload.previous;
    document.getElementById("graphProInspectorCurrent").textContent = payload.current;
    document.getElementById("graphProInspectorDelta").textContent = payload.delta;
    document.getElementById("graphProInspectorShare").textContent = payload.share;
    document.getElementById("graphProInspectorText").textContent = payload.text;
    document.getElementById("graphProInspectorRecommendation").textContent = payload.recommendation;
    buttons.forEach(button => button.classList.toggle("is-selected", button.dataset.kpi === key));
    setRadarFocus(key, fixed);
    if (fixed) graphProKpiFocusByAthlete.set(patient, key);
  };
  const clear = () => {
    inspector.hidden = true;
    buttons.forEach(button => button.classList.remove("is-selected"));
    setRadarFocus("", false);
    graphProKpiFocusByAthlete.delete(patient);
  };
  buttons.forEach(button => {
    button.addEventListener("mouseenter", () => { if (!graphProKpiFocusByAthlete.get(patient)) setRadarFocus(button.dataset.kpi, false); });
    button.addEventListener("mouseleave", () => { const fixed = graphProKpiFocusByAthlete.get(patient); setRadarFocus(fixed || "", Boolean(fixed)); });
    button.addEventListener("focus", () => { if (!graphProKpiFocusByAthlete.get(patient)) setRadarFocus(button.dataset.kpi, false); });
    button.addEventListener("click", () => render(button.dataset.kpi, true));
  });
  document.getElementById("graphProInspectorClose")?.addEventListener("click", clear);
  const initial = graphProKpiFocusByAthlete.get(patient) || data.initialMetric;
  if (initial) render(initial, true);
}


function getMicroNumberForSessionAdmin(session) {
  if (typeof getComputedMicrocycleNumber === "function") {
    return Number(getComputedMicrocycleNumber(session.patientNickname, session.fecha));
  }
  return Number(session.microciclo || 0);
}

function getAvailableMicrosForGraphPro(patientNickname = "") {
  return [...new Set(
    sessions
      .filter(session => (!patientNickname || session.patientNickname === patientNickname) && session.fecha)
      .map(getMicroNumberForSessionAdmin)
      .filter(Boolean)
  )].sort((a, b) => a - b);
}

function getMicroStatsForGraphPro(patientNickname = "", microNumber = 0) {
  const stats = { micro: Number(microNumber), sessions: 0, series: 0, exercises: 0, tonnage: 0, ts: 0, ti: 0, core: 0, plyo: 0, mov: 0, act: 0 };

  sessions
    .filter(session => (!patientNickname || session.patientNickname === patientNickname) && getMicroNumberForSessionAdmin(session) === Number(microNumber))
    .forEach(session => {
      stats.sessions += 1;

      if (typeof getAdminSessionTonnage === "function") {
        stats.tonnage += getAdminSessionTonnage(session);
      }

      const exercises = typeof graphProExercises === "function"
        ? graphProExercises(session)
        : (typeof getAllSessionExercisesForAdmin === "function" ? getAllSessionExercisesForAdmin(session) : []);

      exercises.forEach(item => {
        const series = Number(item.series) || 0;
        const value = series || 1;
        stats.series += series;
        stats.exercises += 1;

        const type = (item.tipo || "").toLowerCase();

        if (type.includes("superior") || type.includes("ts")) stats.ts += value;
        else if (type.includes("inferior") || type.includes("ti")) stats.ti += value;
        else if (type.includes("core")) stats.core += value;
        else if (type.includes("plyo") || type.includes("pliometr")) stats.plyo += value;
        else if (type.includes("movilidad") || type.includes("est.") || type.includes("fascias")) stats.mov += value;
        else stats.act += value;
      });
    });

  return stats;
}

function renderMicroOptions(micros, selected = "") {
  return micros.map(micro => `<option value="${micro}" ${Number(selected) === micro ? "selected" : ""}>M${micro}</option>`).join("");
}

function graphProCompareMetricMeta(key = "") {
  const meta = {
    sessions: { label: "Sesiones", unit: "sesiones", decimals: 0 },
    series: { label: "Series", unit: "series", decimals: 0 },
    exercises: { label: "Ejercicios", unit: "ejercicios", decimals: 0 },
    tonnage: { label: "Tonelaje total", unit: "kg", decimals: 0 },
    ts: { label: "TS", unit: "series", decimals: 0 },
    ti: { label: "TI", unit: "series", decimals: 0 },
    core: { label: "Core", unit: "series", decimals: 0 },
    plyo: { label: "Plyo", unit: "series", decimals: 0 },
    mov: { label: "Movilidad", unit: "series", decimals: 0 },
    act: { label: "Activación", unit: "series", decimals: 0 }
  };
  return meta[key] || { label: key, unit: "", decimals: 0 };
}

function graphProCompareTrend(diff = 0, percent = 0) {
  const absolutePercent = Math.abs(Number(percent) || 0);
  if (diff === 0 || absolutePercent < 5) {
    return { tone: "stable", icon: "=", label: "Estable", message: "Nivel muy similar al micro base" };
  }
  if (diff > 0) {
    return {
      tone: "positive",
      icon: "▲",
      label: absolutePercent >= 25 ? "Aumento notable" : "Aumento",
      message: absolutePercent >= 25 ? "Carga claramente superior al micro base" : "Carga superior al micro base"
    };
  }
  return {
    tone: "negative",
    icon: "▼",
    label: absolutePercent >= 25 ? "Descenso notable" : "Descenso",
    message: absolutePercent >= 25 ? "Carga claramente inferior al micro base" : "Carga inferior al micro base"
  };
}


/**
 * GRAFICA PRO v3.0.3 · Training Pattern Detection
 * Motor determinista de interpretación deportiva.
 *
 * No modifica datos ni utiliza servicios externos. Recibe dos resúmenes de
 * microciclo y devuelve conclusiones explicables listas para la futura capa UI.
 */
function graphProInsightPercent(current = 0, previous = 0) {
  const a = Number(previous) || 0;
  const b = Number(current) || 0;
  if (a === 0) return b === 0 ? 0 : 100;
  return Math.round(((b - a) / Math.abs(a)) * 100);
}

function graphProInsightCategoryMeta() {
  return [
    { key: "ts", label: "Tren superior", short: "TS" },
    { key: "ti", label: "Tren inferior", short: "TI" },
    { key: "core", label: "Core", short: "Core" },
    { key: "plyo", label: "Pliometría", short: "Plyo" },
    { key: "mov", label: "Movilidad", short: "Mov." },
    { key: "act", label: "Activación", short: "Act." }
  ];
}

function graphProInsightBalance(categoryValues = []) {
  const active = categoryValues.filter(item => item.current > 0);
  if (!active.length) return { score: 0, level: "Sin datos", tone: "info", concentration: 0 };
  const total = active.reduce((sum, item) => sum + item.current, 0);
  const strongest = Math.max(...active.map(item => item.current), 0);
  const concentration = total ? Math.round((strongest / total) * 100) : 0;
  const mean = total / active.length;
  const variance = active.reduce((sum, item) => sum + Math.pow(item.current - mean, 2), 0) / active.length;
  const cv = mean ? Math.sqrt(variance) / mean : 0;
  const score = Math.max(0, Math.min(100, Math.round(100 - cv * 55)));
  if (score >= 78) return { score, level: "Equilibrio alto", tone: "positive", concentration };
  if (score >= 55) return { score, level: "Equilibrio moderado", tone: "attention", concentration };
  return { score, level: "Distribución concentrada", tone: "review", concentration };
}

function graphProDetectTrainingPattern(stats = {}, comparison = {}) {
  const meta = graphProInsightCategoryMeta();
  const values = Object.fromEntries(meta.map(item => [item.key, Math.max(0, Number(stats[item.key]) || 0)]));
  const total = meta.reduce((sum, item) => sum + values[item.key], 0);
  const share = key => total ? Math.round((values[key] / total) * 100) : 0;
  const combinedShare = keys => total ? Math.round((keys.reduce((sum, key) => sum + values[key], 0) / total) * 100) : 0;
  const ordered = meta.map(item => ({ ...item, value: values[item.key], share: share(item.key) })).sort((a, b) => b.value - a.value);
  const dominant = ordered[0] || null;
  const sessions = Math.max(0, Number(stats.sessions) || 0);
  const loadPercent = Number(comparison.loadPercent) || 0;
  const comparable = Boolean(comparison.comparable);
  const increases = Number(comparison.increases) || 0;
  const decreases = Number(comparison.decreases) || 0;
  const balanceScore = Number(comparison.balanceScore) || graphProInsightBalance(meta.map(item => ({ current: values[item.key] }))).score;
  const recoveryShare = combinedShare(["mov", "act"]);
  const strengthShare = combinedShare(["ts", "ti", "core"]);
  const competitiveShare = combinedShare(["plyo", "act"]);

  let result;
  if (!total) {
    result = { id: "insufficient", label: "Patrón sin definir", tone: "info", confidence: 20, reason: "No hay series categorizadas suficientes." };
  } else if (comparable && loadPercent <= -18 && decreases >= 3) {
    result = { id: "deload", label: "Descarga", tone: "attention", confidence: 88, reason: `Reducción global del ${Math.abs(loadPercent)}% y descenso en ${decreases} categorías.` };
  } else if (recoveryShare >= 48 && competitiveShare <= 35) {
    result = { id: "regenerative", label: "Regenerativo", tone: "positive", confidence: Math.min(96, 62 + recoveryShare / 2), reason: `Movilidad y activación concentran el ${recoveryShare}% del trabajo.` };
  } else if (comparable && loadPercent >= 18 && increases >= 4) {
    result = { id: "accumulation", label: "Acumulación", tone: "positive", confidence: 90, reason: `Aumento global del ${loadPercent}% con progresión en ${increases} categorías.` };
  } else if (competitiveShare >= 36 && sessions > 0 && sessions <= 4 && share("plyo") >= 14) {
    result = { id: "competitive", label: "Competitivo", tone: "review", confidence: 78, reason: `Pliometría y activación representan el ${competitiveShare}% con una estructura compacta de ${sessions} sesiones.` };
  } else if (strengthShare >= 62 && balanceScore >= 50 && (share("ts") >= 15 && share("ti") >= 15)) {
    result = { id: "transformation", label: "Transformación", tone: "info", confidence: 80, reason: `Fuerza y core reúnen el ${strengthShare}% con participación de tren superior e inferior.` };
  } else if (dominant && dominant.share >= 45) {
    result = { id: "specific", label: `Específico · ${dominant.short}`, tone: dominant.share >= 60 ? "attention" : "info", confidence: Math.min(94, 55 + dominant.share / 2), reason: `${dominant.label} concentra el ${dominant.share}% del trabajo categorizado.` };
  } else if (balanceScore >= 76) {
    result = { id: "balanced", label: "Multilateral equilibrado", tone: "positive", confidence: 82, reason: `Distribución variada con un índice de equilibrio del ${balanceScore}%.` };
  } else {
    result = { id: "mixed", label: "Mixto", tone: "stable", confidence: 65, reason: "Combina estímulos sin una orientación única claramente dominante." };
  }

  return Object.freeze({
    ...result,
    confidence: Math.round(result.confidence),
    metrics: Object.freeze({ total, sessions, recoveryShare, strengthShare, competitiveShare, balanceScore }),
    dominant: dominant ? Object.freeze(dominant) : null
  });
}

function graphProBuildAutomaticInsights(currentStats = {}, previousStats = {}, context = {}) {
  const currentMicro = Number(currentStats.micro) || Number(context.currentMicro) || 0;
  const previousMicro = Number(previousStats.micro) || Number(context.previousMicro) || 0;
  const categories = graphProInsightCategoryMeta().map(meta => {
    const current = Number(currentStats[meta.key]) || 0;
    const previous = Number(previousStats[meta.key]) || 0;
    return {
      ...meta,
      current,
      previous,
      delta: current - previous,
      percent: graphProInsightPercent(current, previous)
    };
  });

  const currentTonnage = Number(currentStats.tonnage) || 0;
  const previousTonnage = Number(previousStats.tonnage) || 0;
  const currentSeries = Number(currentStats.series) || 0;
  const previousSeries = Number(previousStats.series) || 0;
  const currentHasActivity = currentSeries > 0 || Number(currentStats.sessions) > 0;
  const previousHasActivity = previousSeries > 0 || Number(previousStats.sessions) > 0;
  const tonnageComparable = currentTonnage > 0 && previousTonnage > 0;
  const tonnageIncomplete = (currentTonnage === 0 && currentHasActivity && previousTonnage > 0) || (previousTonnage === 0 && previousHasActivity && currentTonnage > 0);
  const usesTonnage = tonnageComparable;
  const loadCurrent = usesTonnage ? currentTonnage : currentSeries;
  const loadPrevious = usesTonnage ? previousTonnage : previousSeries;
  const loadDelta = loadCurrent - loadPrevious;
  const loadPercent = graphProInsightPercent(loadCurrent, loadPrevious);
  const loadUnit = usesTonnage ? "kg" : "series";
  const loadMetricLabel = usesTonnage ? "tonelaje" : "número de series";
  const comparable = Boolean(previousMicro && currentMicro && previousMicro !== currentMicro);

  const orderedCurrent = [...categories].sort((a, b) => b.current - a.current);
  const dominant = orderedCurrent[0] || null;
  const activeCurrent = categories.filter(item => item.current > 0);
  const weakest = [...activeCurrent].sort((a, b) => a.current - b.current)[0] || null;
  const strongestGrowth = [...categories].sort((a, b) => b.delta - a.delta)[0] || null;
  const strongestDrop = [...categories].sort((a, b) => a.delta - b.delta)[0] || null;
  const balance = graphProInsightBalance(categories);
  const totalCategories = categories.reduce((sum, item) => sum + item.current, 0);
  const dominantShare = dominant && totalCategories ? Math.round((dominant.current / totalCategories) * 100) : 0;
  const weakShare = weakest && totalCategories ? Math.round((weakest.current / totalCategories) * 100) : 0;
  const increases = categories.filter(item => item.delta > 0).length;
  const decreases = categories.filter(item => item.delta < 0).length;
  const stable = categories.length - increases - decreases;
  const activeCount = activeCurrent.length;
  const allRise = activeCount >= 3 && activeCurrent.every(item => item.delta > 0);
  const allFall = activeCount >= 3 && activeCurrent.every(item => item.delta < 0);
  const largeShift = Math.max(...categories.map(item => Math.abs(item.percent || 0)), 0);
  const totalAbsoluteSeriesShift = categories.reduce((sum, item) => sum + Math.abs(item.delta), 0);
  const positiveSeriesShift = categories.reduce((sum, item) => sum + Math.max(0, item.delta), 0);
  const negativeSeriesShift = categories.reduce((sum, item) => sum + Math.abs(Math.min(0, item.delta)), 0);
  const stableCategories = categories
    .filter(item => Math.abs(item.delta) <= Math.max(2, Math.round(Math.max(item.current, item.previous) * 0.08)))
    .sort((a, b) => Math.max(b.current, b.previous) - Math.max(a.current, a.previous));
  const mainIncrease = categories.filter(item => item.delta > 0).sort((a, b) => b.delta - a.delta)[0] || null;
  const mainReduction = categories.filter(item => item.delta < 0).sort((a, b) => a.delta - b.delta)[0] || null;
  const increaseContribution = mainIncrease && positiveSeriesShift ? Math.round((mainIncrease.delta / positiveSeriesShift) * 100) : 0;
  const reductionContribution = mainReduction && negativeSeriesShift ? Math.round((Math.abs(mainReduction.delta) / negativeSeriesShift) * 100) : 0;
  const previousDominant = [...categories].sort((a, b) => b.previous - a.previous)[0] || null;
  const orientationChanged = Boolean(previousDominant && dominant && previousDominant.previous > 0 && dominant.current > 0 && previousDominant.key !== dominant.key);
  const basePattern = graphProDetectTrainingPattern(previousStats, { balanceScore: graphProInsightBalance(categories.map(item => ({ current: item.previous }))).score });
  const comparedPattern = graphProDetectTrainingPattern(currentStats, {
    comparable,
    loadPercent,
    increases,
    decreases,
    balanceScore: balance.score
  });
  const patternChanged = basePattern.id !== comparedPattern.id;
  const patternTransition = patternChanged
    ? `La orientación evoluciona de ${basePattern.label.toLowerCase()} a ${comparedPattern.label.toLowerCase()}.`
    : `Ambos micros mantienen un patrón ${comparedPattern.label.toLowerCase()}.`;

  let microType = { id: "transition", label: "Micro de transición", tone: "stable" };
  if (!comparable) microType = { id: "insufficient", label: "Micro pendiente de comparación", tone: "info" };
  else if (tonnageIncomplete) microType = { id: "data-review", label: "Datos de tonelaje incompletos", tone: "info" };
  else if (loadPercent <= -18) microType = { id: "deload", label: "Micro de descarga", tone: "attention" };
  else if (loadPercent >= 18 && allRise) microType = { id: "accumulation", label: "Micro de acumulación", tone: "positive" };
  else if (dominantShare >= 45) microType = { id: "specific", label: `Micro específico de ${dominant ? dominant.label.toLowerCase() : "una categoría"}`, tone: dominantShare >= 60 ? "attention" : "info" };
  else if (Math.abs(loadPercent) < 8 && balance.score >= 75) microType = { id: "balanced", label: "Micro equilibrado", tone: "positive" };
  else if (loadPercent >= 8) microType = { id: "progression", label: "Micro de progresión", tone: "positive" };
  else if (loadPercent <= -8) microType = { id: "reduction", label: "Micro de reducción", tone: "attention" };

  let evolution;
  if (!comparable) {
    evolution = { id: "evolution", tone: "info", title: "Evolución global", text: "Se necesita un micro anterior distinto para interpretar la evolución de la carga." };
  } else if (tonnageIncomplete) {
    evolution = { id: "evolution", tone: "info", title: "Registro de carga externa", text: `Uno de los micros contiene sesiones o series, pero no tonelaje computable. La tendencia se calcula temporalmente con el número de series (${loadPercent > 0 ? "+" : ""}${loadPercent}% frente a M${previousMicro}).` };
  } else if (Math.abs(loadPercent) < 5) {
    evolution = { id: "evolution", tone: "stable", title: "Evolución global", text: `${loadMetricLabel.charAt(0).toUpperCase() + loadMetricLabel.slice(1)} estable frente a M${previousMicro} (${Math.round(loadCurrent)} ${loadUnit}).` };
  } else if (loadDelta > 0) {
    const adjective = Math.abs(loadPercent) >= 30 ? "Incremento muy notable" : Math.abs(loadPercent) >= 15 ? "Incremento notable" : "Incremento moderado";
    evolution = { id: "evolution", tone: "positive", title: "Evolución global", text: `${adjective} del ${loadMetricLabel}: +${Math.abs(loadPercent)}% (+${Math.round(loadDelta)} ${loadUnit}) frente a M${previousMicro}.` };
  } else {
    const adjective = Math.abs(loadPercent) >= 30 ? "Reducción muy marcada" : Math.abs(loadPercent) >= 15 ? "Reducción notable" : "Reducción moderada";
    evolution = { id: "evolution", tone: "attention", title: "Evolución global", text: `${adjective} del ${loadMetricLabel}: -${Math.abs(loadPercent)}% (${Math.round(loadDelta)} ${loadUnit}) frente a M${previousMicro}.` };
  }

  const dominantInsight = dominant && dominant.current > 0
    ? {
        id: "dominant",
        tone: dominantShare >= 60 ? "attention" : "info",
        title: "Mayor estímulo",
        text: `${dominant.label} concentra el ${dominantShare}% del trabajo categorizado${dominant.delta ? ` (${dominant.delta > 0 ? "+" : ""}${dominant.delta} series frente a M${previousMicro})` : ""}.`
      }
    : { id: "dominant", tone: "info", title: "Mayor estímulo", text: "No hay series categorizadas suficientes para identificar el estímulo dominante." };

  let attention;
  if (!weakest) {
    attention = { id: "attention", tone: "info", title: "Punto de atención", text: "No hay datos suficientes para detectar áreas infrarepresentadas." };
  } else if (dominantShare >= 60) {
    attention = { id: "attention", tone: "review", title: "Punto de atención", text: `${dominant.label} concentra el ${dominantShare}% del trabajo; conviene revisar si esta especialización es intencionada.` };
  } else if (strongestDrop && strongestDrop.delta < 0 && Math.abs(strongestDrop.percent) >= 25) {
    attention = { id: "attention", tone: "attention", title: "Punto de atención", text: `${strongestDrop.label} registra el descenso más acusado (-${Math.abs(strongestDrop.percent)}%) frente a M${previousMicro}.` };
  } else if (weakShare <= 8 && activeCount >= 4) {
    attention = { id: "attention", tone: "attention", title: "Punto de atención", text: `${weakest.label} representa solo el ${weakShare}% del trabajo categorizado.` };
  } else {
    attention = { id: "attention", tone: "positive", title: "Punto de atención", text: "No se detectan desequilibrios relevantes ni descensos críticos entre categorías." };
  }

  let distributionText;
  if (allRise) distributionText = `Incremento homogéneo: aumentan las ${increases} categorías activas del micro.`;
  else if (allFall) distributionText = `Reducción homogénea: descienden las ${decreases} categorías activas del micro.`;
  else if (balance.score >= 78) distributionText = `Reparto equilibrado de estímulos (${balance.score}% de equilibrio).`;
  else if (balance.score >= 55) distributionText = `Reparto moderadamente concentrado; la categoría principal reúne el ${dominantShare}% del trabajo.`;
  else distributionText = `Distribución concentrada: la categoría principal reúne el ${dominantShare}% del trabajo.`;
  const distribution = { id: "distribution", tone: balance.tone, title: "Distribución", text: distributionText };

  const impactRaw = Math.round(
    Math.min(Math.abs(loadPercent), 60) * 0.9 +
    Math.min(largeShift, 100) * 0.18 +
    Math.max(0, dominantShare - 35) * 0.65 +
    Math.max(0, 65 - balance.score) * 0.35
  );
  const impactScore = Math.max(0, Math.min(100, impactRaw));
  const impact = impactScore >= 75
    ? { level: "Muy alto", tone: "review", score: impactScore }
    : impactScore >= 50
      ? { level: "Alto", tone: "attention", score: impactScore }
      : impactScore >= 25
        ? { level: "Moderado", tone: "stable", score: impactScore }
        : { level: "Bajo", tone: "positive", score: impactScore };

  let priority;
  if (!comparable) priority = { tone: "info", label: "Comparación pendiente", text: "Selecciona o registra un micro anterior para activar la lectura contextual." };
  else if (tonnageIncomplete) priority = { tone: "info", label: "Tonelaje no registrado", text: `Hay sesiones o series en ambos micros, pero uno de ellos no presenta carga externa computable. Revisa los kg antes de interpretar el cambio como una descarga completa.` };
  else if (dominantShare >= 60) priority = { tone: "review", label: "Concentración elevada", text: `${dominant.label} reúne el ${dominantShare}% del trabajo categorizado.` };
  else if (loadPercent <= -18) priority = { tone: "attention", label: usesTonnage ? "Reducción del tonelaje" : "Reducción de series", text: `El ${loadMetricLabel} desciende un ${Math.abs(loadPercent)}% frente a M${previousMicro}.` };
  else if (loadPercent >= 18) priority = { tone: "positive", label: usesTonnage ? "Progresión de tonelaje" : "Progresión de series", text: `El ${loadMetricLabel} aumenta un ${Math.abs(loadPercent)}% frente a M${previousMicro}.` };
  else if (balance.score >= 78) priority = { tone: "positive", label: "Equilibrio consolidado", text: "El micro mantiene un reparto variado y sin concentraciones relevantes." };
  else priority = { tone: "stable", label: "Cambio controlado", text: "La estructura del micro evoluciona sin alteraciones críticas." };

  let causalSummary = "No hay datos suficientes para explicar el origen de las diferencias.";
  if (comparable) {
    const causes = [];
    if (mainIncrease && mainIncrease.delta > 0) {
      causes.push(`${mainIncrease.label} aporta el principal incremento (+${graphProFormatNumber(mainIncrease.delta)} series${increaseContribution >= 35 ? `; ${increaseContribution}% del aumento categorizado` : ""})`);
    }
    if (mainReduction && mainReduction.delta < 0) {
      causes.push(`${mainReduction.label} concentra la mayor reducción (${mainReduction.delta} series${reductionContribution >= 35 ? `; ${reductionContribution}% del descenso categorizado` : ""})`);
    }
    if (orientationChanged) {
      causes.push(`el foco principal cambia de ${previousDominant.label.toLowerCase()} a ${dominant.label.toLowerCase()}`);
    } else if (dominant && dominant.current > 0 && previousDominant && previousDominant.previous > 0) {
      causes.push(`${dominant.label} se mantiene como orientación dominante`);
    }
    if (stableCategories.length) {
      const names = stableCategories.slice(0, 2).map(item => item.label).join(" y ");
      causes.push(`${names} ${stableCategories.length === 1 ? "permanece" : "permanecen"} estable${stableCategories.length === 1 ? "" : "s"}`);
    }
    if (causes.length) causalSummary = causes.join("; ") + ".";
  }

  const drivers = {
    mainIncrease: mainIncrease ? { ...mainIncrease, contribution: increaseContribution } : null,
    mainReduction: mainReduction ? { ...mainReduction, contribution: reductionContribution } : null,
    stable: stableCategories.slice(0, 3).map(item => ({ ...item })),
    orientationChanged,
    previousDominant: previousDominant ? { ...previousDominant } : null,
    currentDominant: dominant ? { ...dominant } : null,
    totalAbsoluteSeriesShift,
    explanation: causalSummary
  };

  let conclusionText = "Micro pendiente de datos suficientes para generar una lectura técnica representativa.";
  if (comparable && dominant && dominant.current > 0) {
    if (microType.id === "data-review") {
      conclusionText = "La comparación muestra actividad registrada, pero el tonelaje no es homogéneo entre micros. Conviene validar los kg antes de clasificar la semana como descarga o progresión.";
    } else if (microType.id === "deload") {
      conclusionText = balance.score >= 70
        ? "Micro de descarga con reducción global y conservación de un reparto equilibrado de estímulos."
        : `Micro de descarga con una orientación más marcada hacia ${dominant.label.toLowerCase()}.`;
    } else if (microType.id === "accumulation") {
      conclusionText = `Micro de acumulación con progresión homogénea y predominio de ${dominant.label.toLowerCase()}.`;
    } else if (microType.id === "specific") {
      conclusionText = `Micro específico orientado a ${dominant.label.toLowerCase()}, con el resto de estímulos en función complementaria.`;
    } else if (microType.id === "balanced") {
      conclusionText = "Micro equilibrado, estable en carga y con buena variedad de estímulos.";
    } else if (microType.id === "progression") {
      conclusionText = balance.score >= 70
        ? "Micro de progresión con incremento de carga y distribución equilibrada."
        : `Micro de progresión con mayor orientación hacia ${dominant.label.toLowerCase()}.`;
    } else if (microType.id === "reduction") {
      conclusionText = `Micro de reducción controlada, manteniendo ${dominant.label.toLowerCase()} como estímulo principal.`;
    } else {
      conclusionText = balance.score >= 70
        ? "Micro de transición con carga estable y distribución equilibrada."
        : `Micro de transición con predominio de ${dominant.label.toLowerCase()}.`;
    }
  }
  if (comparable && causalSummary) {
    const causalLead = causalSummary.charAt(0).toUpperCase() + causalSummary.slice(1);
    conclusionText = `${conclusionText} ${causalLead}`;
  }
  if (comparable && comparedPattern.id !== "insufficient") {
    conclusionText = `${conclusionText} ${patternTransition}`;
  }
  const conclusion = { id: "conclusion", tone: comparedPattern.tone || microType.tone, title: "Lectura técnica", text: conclusionText };

  const dataPoints = Number(currentStats.sessions || 0) + Number(previousStats.sessions || 0);
  const activeCategoryCount = categories.filter(item => item.current > 0 || item.previous > 0).length;
  const confidenceScore = Math.max(0, Math.min(100, Math.round((comparable ? 35 : 0) + Math.min(dataPoints, 6) * 7 + activeCategoryCount * 4)));
  const confidence = confidenceScore >= 90 ? "Muy alta" : confidenceScore >= 75 ? "Alta" : confidenceScore >= 50 ? "Media" : "Baja";

  return Object.freeze({
    version: "3.1.0",
    comparable,
    currentMicro,
    previousMicro,
    load: Object.freeze({ current: loadCurrent, previous: loadPrevious, delta: loadDelta, percent: loadPercent, unit: loadUnit, metric: loadMetricLabel, tonnageIncomplete }),
    categories: Object.freeze(categories.map(item => Object.freeze(item))),
    balance: Object.freeze(balance),
    trendSummary: Object.freeze({ increases, decreases, stable }),
    confidence: Object.freeze({ score: confidenceScore, level: confidence }),
    impact: Object.freeze(impact),
    priority: Object.freeze(priority),
    microType: Object.freeze(microType),
    patterns: Object.freeze({
      base: basePattern,
      compared: comparedPattern,
      changed: patternChanged,
      transition: patternTransition
    }),
    drivers: Object.freeze({
      ...drivers,
      mainIncrease: drivers.mainIncrease ? Object.freeze(drivers.mainIncrease) : null,
      mainReduction: drivers.mainReduction ? Object.freeze(drivers.mainReduction) : null,
      stable: Object.freeze(drivers.stable.map(item => Object.freeze(item))),
      previousDominant: drivers.previousDominant ? Object.freeze(drivers.previousDominant) : null,
      currentDominant: drivers.currentDominant ? Object.freeze(drivers.currentDominant) : null
    }),
    insights: Object.freeze([evolution, dominantInsight, attention, distribution, conclusion].map(item => Object.freeze(item)))
  });
}

function graphProInsightIcon(id = "") {
  const icons = {
    evolution: "↗",
    dominant: "◆",
    attention: "!",
    distribution: "◎",
    conclusion: "🎯"
  };
  return icons[id] || "•";
}

function graphProInsightToneLabel(tone = "info") {
  const labels = {
    positive: "Situación favorable",
    stable: "Situación estable",
    attention: "Aspecto a vigilar",
    review: "Revisión recomendada",
    info: "Información contextual"
  };
  return labels[tone] || labels.info;
}

function renderGraphProComparisonDrivers(report = {}) {
  const drivers = report.drivers || {};
  const increase = drivers.mainIncrease;
  const reduction = drivers.mainReduction;
  const stable = Array.isArray(drivers.stable) ? drivers.stable : [];
  const orientation = drivers.orientationChanged && drivers.previousDominant && drivers.currentDominant
    ? `${drivers.previousDominant.label} → ${drivers.currentDominant.label}`
    : drivers.currentDominant && drivers.currentDominant.current > 0
      ? `${drivers.currentDominant.label} se mantiene`
      : "Sin orientación definida";

  return `
    <section class="graph-pro-change-drivers" aria-labelledby="graphProDriversTitle">
      <div class="graph-pro-change-drivers-head">
        <div>
          <p class="eyebrow">Comparative Intelligence · v3.0.3</p>
          <h4 id="graphProDriversTitle">Qué explica el cambio</h4>
        </div>
        <p>${drivers.explanation || "Análisis causal pendiente de datos suficientes."}</p>
      </div>
      <div class="graph-pro-driver-grid">
        <article class="driver-rise">
          <span>↑ Principal impulsor</span>
          <strong>${increase ? increase.label : "Sin incremento"}</strong>
          <small>${increase ? `+${increase.delta} series${increase.contribution >= 20 ? ` · ${increase.contribution}% del aumento` : ""}` : "No aumentan categorías"}</small>
        </article>
        <article class="driver-drop">
          <span>↓ Principal reducción</span>
          <strong>${reduction ? reduction.label : "Sin reducción"}</strong>
          <small>${reduction ? `${reduction.delta} series${reduction.contribution >= 20 ? ` · ${reduction.contribution}% del descenso` : ""}` : "No disminuyen categorías"}</small>
        </article>
        <article class="driver-orientation">
          <span>◆ Orientación</span>
          <strong>${orientation}</strong>
          <small>${drivers.orientationChanged ? "Cambio del estímulo dominante" : "Continuidad del foco principal"}</small>
        </article>
        <article class="driver-stable">
          <span>≈ Estructura conservada</span>
          <strong>${stable.length ? stable.map(item => item.short || item.label).join(" · ") : "Sin categorías estables"}</strong>
          <small>${stable.length ? "Variación mínima entre micros" : "La estructura cambia de forma general"}</small>
        </article>
      </div>
    </section>`;
}

function renderGraphProTrainingPatterns(report = {}) {
  const patterns = report.patterns || {};
  const base = patterns.base || {};
  const compared = patterns.compared || {};
  return `
    <section class="graph-pro-patterns" aria-labelledby="graphProPatternsTitle">
      <div class="graph-pro-patterns-head">
        <div>
          <p class="eyebrow">Pattern Intelligence · v3.0.3</p>
          <h4 id="graphProPatternsTitle">Patrones de entrenamiento detectados</h4>
        </div>
        <span class="graph-pro-pattern-transition ${patterns.changed ? "is-change" : "is-stable"}">${patterns.transition || "Patrón pendiente de datos."}</span>
      </div>
      <div class="graph-pro-pattern-grid">
        <article class="tone-${base.tone || "info"}">
          <small>Micro base · M${report.previousMicro || "—"}</small>
          <strong>${base.label || "Sin definir"}</strong>
          <p>${base.reason || "No hay datos suficientes."}</p>
          <span>Confianza ${base.confidence || 0}%</span>
        </article>
        <div class="graph-pro-pattern-arrow" aria-hidden="true">→</div>
        <article class="tone-${compared.tone || "info"}">
          <small>Micro comparado · M${report.currentMicro || "—"}</small>
          <strong>${compared.label || "Sin definir"}</strong>
          <p>${compared.reason || "No hay datos suficientes."}</p>
          <span>Confianza ${compared.confidence || 0}%</span>
        </article>
      </div>
      <p class="graph-pro-pattern-method">Clasificación orientativa mediante volumen, distribución por categorías, número de sesiones y cambio respecto al micro base.</p>
    </section>`;
}


/**
 * GRAFICA PRO v3.2 · Predictive Intelligence
 * Motor determinista y explicable. Proyecta la dirección estructural observada,
 * expresa su confianza y evita presentar estimaciones como certezas.
 */
function coachIntelligenceLinearTrend(points = []) {
  const values = points.map(Number).filter(Number.isFinite);
  const n = values.length;
  if (n < 3) return { direction:"insufficient", slope:0, strength:0, r2:0, label:"Histórico insuficiente" };
  const meanX=(n-1)/2, meanY=values.reduce((a,b)=>a+b,0)/n;
  let num=0, den=0;
  values.forEach((y,x)=>{ num+=(x-meanX)*(y-meanY); den+=Math.pow(x-meanX,2); });
  const slope=den?num/den:0;
  const predicted=values.map((_,x)=>meanY+slope*(x-meanX));
  const ssTot=values.reduce((sum,y)=>sum+Math.pow(y-meanY,2),0);
  const ssRes=values.reduce((sum,y,i)=>sum+Math.pow(y-predicted[i],2),0);
  const r2=ssTot?Math.max(0,Math.min(1,1-ssRes/ssTot)):1;
  const normalized=slope/Math.max(1,meanY);
  const strength=Math.min(100,Math.round(Math.abs(normalized)*500));
  if(Math.abs(normalized)<.035) return {direction:"stable",slope,strength,r2,label:"Tendencia estable"};
  return normalized>0?{direction:"up",slope,strength,r2,label:"Tendencia creciente"}:{direction:"down",slope,strength,r2,label:"Tendencia descendente"};
}
function coachIntelligenceScoreLabel(score=0){
  if(score>=88)return{label:"Coherencia excelente",tone:"positive"};
  if(score>=74)return{label:"Coherencia alta",tone:"positive"};
  if(score>=58)return{label:"Coherencia moderada",tone:"stable"};
  if(score>=42)return{label:"Coherencia irregular",tone:"attention"};
  return{label:"Revisión prioritaria",tone:"review"};
}
function predictiveConfidence(trend={}, points=[]){
  const n=points.length, active=points.filter(v=>Number(v)>0).length;
  let score=Math.round((Math.min(8,n)/8)*42+(trend.r2||0)*43+(active/Math.max(1,n))*15);
  if(n<4)score=Math.min(score,44);
  score=Math.max(0,Math.min(100,score));
  const level=score>=76?"Alta":score>=52?"Media":score>=30?"Baja":"Insuficiente";
  return{score,level,tone:score>=76?"positive":score>=52?"stable":"attention"};
}
function predictivePriority(item={}){
  const magnitude=Math.abs(Number(item.projectedChangePercent)||0);
  const confidence=Number(item.confidence?.score)||0;
  const score=Math.round(magnitude*.65+confidence*.35+(item.current===0?12:0));
  if(score>=62)return{level:"Revisar",tone:"review",score};
  if(score>=38)return{level:"Vigilar",tone:"attention",score};
  return{level:"Correcto",tone:"positive",score};
}
function buildPredictiveIntelligenceEngine(currentStats={}, context={}){
  const patientNickname=String(context.patientNickname||"");
  const currentMicro=Number(currentStats.micro||context.currentMicro)||0;
  const micros=getAvailableMicrosForGraphPro(patientNickname).filter(m=>m<=currentMicro).slice(-8);
  const history=micros.map(micro=>getMicroStatsForGraphPro(patientNickname,micro));
  const categories=graphProInsightCategoryMeta();
  const projections=categories.map(meta=>{
    const points=history.map(stats=>Number(stats[meta.key])||0);
    const trend=coachIntelligenceLinearTrend(points);
    const current=points.at(-1)||0;
    const projected=Math.max(0,Math.round((current+trend.slope)*10)/10);
    const projectedChangePercent=current?Math.round((projected-current)/current*100):(projected>0?100:0);
    const confidence=predictiveConfidence(trend,points);
    const base={...meta,points,current,projected,projectedChangePercent,...trend,confidence};
    return{...base,priority:predictivePriority(base)};
  });
  const totals=history.map(stats=>categories.reduce((sum,m)=>sum+(Number(stats[m.key])||0),0));
  const changes=totals.slice(1).map((v,i)=>Math.abs(graphProInsightPercent(v,totals[i])));
  const avgChange=changes.length?changes.reduce((a,b)=>a+b,0)/changes.length:0;
  const variance=changes.length?changes.reduce((s,v)=>s+Math.pow(v-avgChange,2),0)/changes.length:0;
  const stability=Math.max(0,Math.min(100,Math.round(100-avgChange*.8-Math.sqrt(variance)*.9)));
  const stabilityMeta=stability>=78?{label:"Proceso estable",tone:"positive"}:stability>=55?{label:"Estabilidad moderada",tone:"stable"}:{label:"Proceso variable",tone:"attention"};
  const ranked=[...projections].sort((a,b)=>b.priority.score-a.priority.score);
  const focus=ranked[0];
  const narrative=micros.length<4
    ? "El histórico todavía es corto. Las proyecciones se muestran con prudencia y ganarán fiabilidad al incorporar nuevos microciclos."
    : `${focus.label} concentra la mayor prioridad de revisión. Si la dinámica reciente continúa, pasaría de ${focus.current} a aproximadamente ${focus.projected} unidades en el próximo micro, con confianza ${focus.confidence.level.toLowerCase()}.`;
  const timeline=history.map((stats,i)=>{
    const total=totals[i]||0, prev=i?totals[i-1]:total;
    const delta=i?graphProInsightPercent(total,prev):0;
    const tag=!i?"Base":delta>=18?"Progresión":delta<=-18?"Reducción":"Estable";
    const tone=!i?"stable":delta>=18?"positive":delta<=-18?"attention":"stable";
    return{micro:micros[i],total,delta,tag,tone};
  });
  return Object.freeze({version:"3.2.0",currentMicro,historyMicros:micros,projections,stability,stabilityMeta,focus,narrative,timeline});
}
function buildCoachIntelligenceEngine(currentStats={}, previousStats={}, context={}){
  const patientNickname=String(context.patientNickname||"");
  const currentMicro=Number(currentStats.micro||context.currentMicro)||0;
  const micros=getAvailableMicrosForGraphPro(patientNickname).filter(m=>m<=currentMicro).slice(-5);
  const history=micros.map(micro=>getMicroStatsForGraphPro(patientNickname,micro));
  const categories=graphProInsightCategoryMeta();
  const currentTotal=categories.reduce((sum,item)=>sum+(Number(currentStats[item.key])||0),0);
  const loadPercent=graphProInsightPercent(currentStats.series,previousStats.series);
  const tonnagePercent=graphProInsightPercent(currentStats.tonnage,previousStats.tonnage);
  const balance=graphProInsightBalance(categories.map(item=>({current:Number(currentStats[item.key])||0})));
  const trends=categories.map(meta=>{const points=history.map(stats=>Number(stats[meta.key])||0);return{...meta,points,...coachIntelligenceLinearTrend(points),current:Number(currentStats[meta.key])||0};});
  const downward=trends.filter(t=>t.direction==="down").sort((a,b)=>b.strength-a.strength);
  const upward=trends.filter(t=>t.direction==="up").sort((a,b)=>b.strength-a.strength);
  const absent=trends.filter(t=>t.current===0&&t.points.slice(-2).every(v=>v===0));
  const dominant=[...categories].map(meta=>({...meta,value:Number(currentStats[meta.key])||0})).sort((a,b)=>b.value-a.value)[0];
  const dominantShare=dominant&&currentTotal?Math.round(dominant.value/currentTotal*100):0;
  const recovery=(Number(currentStats.mov)||0)+(Number(currentStats.act)||0);
  const recoveryShare=currentTotal?Math.round(recovery/currentTotal*100):0;
  const alerts=[];
  if(tonnagePercent>=25&&graphProInsightPercent(currentStats.act,previousStats.act)<=-15)alerts.push({tone:"review",title:"Carga externa y activación divergen",text:`El tonelaje aumenta un ${tonnagePercent}% mientras la activación disminuye. Conviene comprobar si la preparación previa acompaña el incremento de carga.`});
  if(dominantShare>=58)alerts.push({tone:"attention",title:"Concentración elevada",text:`${dominant.label} reúne el ${dominantShare}% del trabajo categorizado. La especialización puede ser correcta, pero debería responder a una intención planificada.`});
  if(Math.abs(loadPercent)>=35)alerts.push({tone:"attention",title:"Cambio brusco de volumen",text:`Las series cambian un ${Math.abs(loadPercent)}% frente al micro base. Conviene validar que el salto forma parte de la estrategia del bloque.`});
  if(recoveryShare<10&&currentTotal>20)alerts.push({tone:"attention",title:"Trabajo preparatorio reducido",text:`Movilidad y activación representan el ${recoveryShare}% del volumen categorizado. Revisa su adecuación al contenido principal del micro.`});
  const opportunities=[];
  downward.slice(0,2).forEach(t=>opportunities.push({tone:"info",title:`${t.label}: tendencia descendente`,text:`Desciende de forma sostenida en los últimos ${t.points.length} micros analizados. Es una oportunidad de revisión, no necesariamente un déficit.`}));
  absent.slice(0,1).forEach(t=>opportunities.push({tone:"review",title:`${t.label} sin presencia reciente`,text:"No registra estímulo en los dos últimos micros disponibles. Comprueba si la ausencia es deliberada."}));
  if(upward[0])opportunities.push({tone:"positive",title:`Continuidad en ${upward[0].label}`,text:"Mantiene una tendencia creciente durante la ventana histórica disponible, con una progresión relativamente consistente."});
  if(!opportunities.length)opportunities.push({tone:"positive",title:"Estructura sin señales persistentes",text:"No se detectan tendencias históricas suficientemente claras que requieran revisión inmediata."});
  let score=100;score-=Math.max(0,65-balance.score)*.45;score-=Math.max(0,Math.abs(loadPercent)-18)*.45;score-=Math.max(0,dominantShare-45)*.7;score-=alerts.length*6;score-=absent.length*3;score=Math.max(0,Math.min(100,Math.round(score)));
  const scoreMeta=coachIntelligenceScoreLabel(score);
  const analysis=[`M${currentMicro} ${loadPercent>8?"incrementa":loadPercent<-8?"reduce":"mantiene"} el volumen de series ${Math.abs(loadPercent)}% respecto al micro base.`,`La distribución presenta un equilibrio del ${balance.score}% y ${dominant?dominant.label.toLowerCase():"ninguna categoría"} actúa como foco principal${dominantShare?` con el ${dominantShare}%`:""}.`,downward[0]?`${downward[0].label} muestra la tendencia descendente más clara de la ventana histórica.`:upward[0]?`${upward[0].label} presenta la tendencia creciente más definida.`:""] .filter(Boolean).join(" ");
  const recommendations=[];if(alerts.length)recommendations.push("Revisar primero las alertas objetivas y confirmar si los cambios responden al objetivo del bloque.");if(dominantShare>=58)recommendations.push("Contrastar la concentración del estímulo con la prioridad técnica prevista para el micro.");if(downward[0])recommendations.push(`Valorar la continuidad de ${downward[0].label.toLowerCase()} dentro de la planificación, sin asumir que su descenso sea negativo por sí solo.`);if(!recommendations.length)recommendations.push("Mantener el criterio actual y observar la evolución en los próximos micros antes de introducir cambios.");
  return Object.freeze({version:"3.2.0",currentMicro,historyMicros:micros,history,trends,score,scoreMeta,alerts:alerts.slice(0,3),opportunities:opportunities.slice(0,3),analysis,recommendations:recommendations.slice(0,3),metrics:{balanceScore:balance.score,dominantShare,recoveryShare,loadPercent,tonnagePercent}});
}
function renderPredictiveIntelligenceEngine(currentStats={},context={}){
  const predictive=buildPredictiveIntelligenceEngine(currentStats,context);
  const directionIcon=d=>d==="up"?"↗":d==="down"?"↘":d==="stable"?"→":"·";
  const cards=predictive.projections.map(item=>`<article class="predictive-card tone-${item.priority.tone}"><div class="predictive-card-head"><span>${item.short}</span><b>${item.priority.level}</b></div><strong>${directionIcon(item.direction)} ${item.label}</strong><div class="predictive-values"><span>${item.current}</span><i>→</i><span>${item.projected}</span></div><div class="predictive-confidence"><small>Confianza ${item.confidence.level}</small><div><i style="width:${item.confidence.score}%"></i></div><em>${item.confidence.score}%</em></div></article>`).join("");
  const timeline=predictive.timeline.map(item=>`<article class="predictive-timeline-node tone-${item.tone}"><span>M${item.micro}</span><i></i><strong>${item.tag}</strong><small>${item.delta>0?"+":""}${item.delta}%</small></article>`).join("");
  return `<section class="predictive-intelligence" aria-labelledby="predictiveTitle"><div class="predictive-head"><div><p class="eyebrow">Predictive Intelligence · v3.2</p><h3 id="predictiveTitle">Dirección probable de la planificación</h3><p>Proyección estructural basada en hasta ocho micros. No anticipa rendimiento ni fatiga fisiológica.</p></div><div class="predictive-stability tone-${predictive.stabilityMeta.tone}"><span>Stability Index</span><strong>${predictive.stability}<small>%</small></strong><em>${predictive.stabilityMeta.label}</em></div></div><article class="predictive-reading"><span>Si el patrón continúa…</span><p>${predictive.narrative}</p></article><div class="predictive-grid">${cards}</div><section class="predictive-timeline"><div><h4>Coach Timeline</h4><span>${predictive.historyMicros.length} micros analizados</span></div><div class="predictive-timeline-track">${timeline}</div></section><p class="predictive-method">Estimación lineal explicable. La confianza combina longitud del histórico, continuidad de datos y ajuste de tendencia. Una prioridad indica dónde mirar primero, no que exista un error.</p></section>`;
}

function renderGraphProV4IntelligenceHub(currentStats={},previousStats={},context={}){
  const coach=buildCoachIntelligenceEngine(currentStats,previousStats,context);
  const predictive=buildPredictiveIntelligenceEngine(currentStats,context);
  const urgent=coach.alerts[0] || coach.opportunities[0] || {title:"Proceso estable",text:"No se detectan señales prioritarias en la ventana histórica disponible."};
  const topProjection=[...predictive.projections].sort((a,b)=>b.priority.weight-a.priority.weight || b.confidence.score-a.confidence.score)[0];
  const priorityLabel=coach.alerts.length?"Revisar":coach.opportunities.length?"Vigilar":"Correcto";
  const priorityTone=coach.alerts.length?"review":coach.opportunities.length?"attention":"positive";
  const projectionText=topProjection && topProjection.direction!=="insufficient" ? `${topProjection.label}: ${topProjection.direction==="up"?"dirección creciente":topProjection.direction==="down"?"dirección descendente":"estructura estable"}, con ${topProjection.confidence.score}% de confianza.` : "Se necesita más histórico para consolidar una proyección prioritaria.";
  return `<section class="graph-pro-v4-hub" aria-labelledby="graphProV4Title">
    <header class="graph-pro-v4-head"><div><p class="eyebrow">Performance Intelligence · v4</p><h3 id="graphProV4Title">Lectura ejecutiva del proceso</h3><p>Primero la decisión; después, el detalle técnico bajo demanda.</p></div><span class="graph-pro-v4-status tone-${priorityTone}">${priorityLabel}</span></header>
    <div class="graph-pro-v4-scoreboard">
      <article><span>Coach Score</span><strong>${coach.score}<small>/100</small></strong><em>${coach.scoreMeta.label}</em></article>
      <article><span>Stability Index</span><strong>${predictive.stability}<small>%</small></strong><em>${predictive.stabilityMeta.label}</em></article>
      <article><span>Histórico útil</span><strong>${predictive.historyMicros.length}<small> micros</small></strong><em>M${predictive.historyMicros[0]||"—"} → M${predictive.historyMicros.at(-1)||"—"}</em></article>
    </div>
    <article class="graph-pro-v4-decision tone-${priorityTone}"><span>Qué revisar primero</span><strong>${urgent.title}</strong><p>${urgent.text}</p></article>
    <div class="graph-pro-v4-quick-grid"><article><span>Lectura actual</span><p>${coach.analysis}</p></article><article><span>Dirección probable</span><p>${projectionText}</p></article></div>
    <div class="graph-pro-v4-actions"><strong>Decisiones a considerar</strong>${coach.recommendations.slice(0,3).map((x,i)=>`<p><b>${i+1}</b>${x}</p>`).join("")}</div>
    <p class="graph-pro-v4-method">Síntesis determinista y explicable. No diagnostica rendimiento, fatiga, lesión ni sustituye el criterio profesional.</p>
  </section>`;
}

function renderCoachIntelligenceEngine(currentStats={},previousStats={},context={}){
  const coach=buildCoachIntelligenceEngine(currentStats,previousStats,context);
  const trendCards=coach.trends.map(trend=>{const arrow=trend.direction==="up"?"↗":trend.direction==="down"?"↘":trend.direction==="stable"?"→":"·";const tone=trend.direction==="up"?"positive":trend.direction==="down"?"attention":"stable";const max=Math.max(...trend.points,1);const points=trend.points.map((value,i)=>`<i style="--v:${Math.max(5,Math.min(100,value?value/max*100:5))}%" title="M${coach.historyMicros[i]}: ${value}"></i>`).join("");return`<article class="coach-trend tone-${tone}"><div><span>${trend.short}</span><strong>${arrow} ${trend.label}</strong></div><div class="coach-spark" aria-label="${trend.label}: ${trend.points.join(', ')}">${points}</div><small>${trend.label}</small></article>`;}).join("");
  const cards=(items,empty)=>items.length?items.map(item=>`<article class="coach-signal tone-${item.tone}"><span></span><div><strong>${item.title}</strong><p>${item.text}</p></div></article>`).join(""):`<p class="coach-empty">${empty}</p>`;
  return `<details class="graph-pro-v4-detail"><summary><span>Coach Intelligence</span><small>Alertas, oportunidades y tendencias</small></summary><section class="coach-intelligence" aria-labelledby="coachIntelligenceTitle"><div class="coach-head"><div><p class="eyebrow">Coach Intelligence Engine · v3.2</p><h3 id="coachIntelligenceTitle">Cabeza pensante del análisis</h3><p>Lectura histórica explicable para orientar la revisión del entrenador, sin sustituir su criterio profesional.</p></div><div class="coach-score tone-${coach.scoreMeta.tone}"><span>Coach Score</span><strong>${coach.score}<small>/100</small></strong><em>${coach.scoreMeta.label}</em></div></div><article class="coach-analysis"><span>Análisis del entrenador</span><p>${coach.analysis}</p></article><div class="coach-columns"><section><h4>⚠ Alertas inteligentes</h4>${cards(coach.alerts,"No se detectan alertas objetivas en esta comparación.")}</section><section><h4>◎ Oportunidades de revisión</h4>${cards(coach.opportunities,"No se detectan oportunidades persistentes.")}</section></div><section class="coach-trends"><div class="coach-section-head"><h4>Tendencias · últimos ${coach.historyMicros.length} micros</h4><span>${coach.historyMicros.map(m=>`M${m}`).join(" · ")}</span></div><div class="coach-trend-grid">${trendCards}</div></section><section class="coach-recommendations"><h4>Decisiones a considerar</h4>${coach.recommendations.map((text,i)=>`<p><span>${i+1}</span>${text}</p>`).join("")}</section><p class="coach-method">Motor determinista basado en volumen, tonelaje, distribución y continuidad histórica. No diagnostica rendimiento ni prescribe entrenamiento.</p></section></details>`;
}
globalThis.PPFPredictiveIntelligence=Object.freeze({build:buildPredictiveIntelligenceEngine,confidence:predictiveConfidence,version:"4.0.1"});
globalThis.PPFCoachIntelligence=Object.freeze({build:buildCoachIntelligenceEngine,trend:coachIntelligenceLinearTrend,version:"4.0.1"});
globalThis.PPFPerformanceIntelligence=Object.freeze({render:renderGraphProV4IntelligenceHub,version:"4.0.1"});

function renderGraphProAutomaticInsights(currentStats = {}, previousStats = {}, context = {}) {
  const report = graphProBuildAutomaticInsights(currentStats, previousStats, context);
  const regular = report.insights.filter(item => item.id !== "conclusion");
  const conclusion = report.insights.find(item => item.id === "conclusion");

  return `
    ${renderGraphProV4IntelligenceHub(currentStats, previousStats, context)}
    ${renderPredictiveIntelligenceEngine(currentStats, context)}
    ${renderCoachIntelligenceEngine(currentStats, previousStats, context)}
    <section class="graph-pro-briefing" aria-labelledby="graphProBriefingTitle" aria-describedby="graphProBriefingDescription">
      <div class="graph-pro-briefing-header">
        <div>
          <p class="eyebrow">Automatic Insights</p>
          <h3 id="graphProBriefingTitle"><span aria-hidden="true">🧠</span> Briefing comparativo</h3>
          <p id="graphProBriefingDescription">Interpretación automática de los dos microciclos seleccionados mediante reglas deportivas.</p>
        </div>
        <div class="graph-pro-briefing-meta">
          <div class="graph-pro-briefing-confidence" aria-label="Confianza del análisis: ${report.confidence.level}, ${report.confidence.score} por ciento">
            <span>Confianza</span>
            <strong>${report.confidence.level}</strong>
            <small>${report.confidence.score}%</small>
          </div>
          <div class="graph-pro-impact tone-${report.impact.tone}" aria-label="Impacto del cambio: ${report.impact.level}, ${report.impact.score} sobre 100">
            <span>Impacto</span>
            <strong>${report.impact.level}</strong>
            <div class="graph-pro-impact-track" aria-hidden="true"><i style="width:${report.impact.score}%"></i></div>
          </div>
        </div>
      </div>

      <article class="graph-pro-priority tone-${report.priority.tone}" aria-label="Insight prioritario. ${report.priority.label}. ${report.priority.text}">
        <span class="graph-pro-insight-status" aria-hidden="true"></span>
        <div>
          <small>Insight prioritario · ${report.microType.label}</small>
          <strong>${report.priority.label}</strong>
          <p>${report.priority.text}</p>
        </div>
      </article>

      ${renderGraphProTrainingPatterns(report)}

      ${renderGraphProComparisonDrivers(report)}

      <div class="graph-pro-insights-grid" role="list" aria-label="Insights automáticos de la comparación">
        ${regular.map((item, index) => `
          <article class="graph-pro-insight-card tone-${item.tone}" role="listitem" style="--insight-delay:${index * 70}ms" aria-label="${item.title}. ${graphProInsightToneLabel(item.tone)}. ${item.text}">
            <span class="graph-pro-insight-status" aria-hidden="true"></span>
            <div class="graph-pro-insight-icon" aria-hidden="true">${graphProInsightIcon(item.id)}</div>
            <div>
              <div class="graph-pro-insight-title-row">
                <h4>${item.title}</h4>
                <span>${graphProInsightToneLabel(item.tone)}</span>
              </div>
              <p>${item.text}</p>
            </div>
          </article>
        `).join("")}
      </div>

      ${conclusion ? `
        <article class="graph-pro-technical-reading tone-${conclusion.tone}" style="--insight-delay:${regular.length * 70}ms" aria-label="Lectura técnica. ${conclusion.text}">
          <span class="graph-pro-insight-status" aria-hidden="true"></span>
          <div class="graph-pro-technical-reading-icon" aria-hidden="true">🎯</div>
          <div>
            <span>Lectura técnica</span>
            <p>${conclusion.text}</p>
          </div>
        </article>
      ` : ""}

      <div class="graph-pro-briefing-footer">
        <span>${report.trendSummary.increases} categorías aumentan</span>
        <span>${report.trendSummary.decreases} disminuyen</span>
        <span>${report.trendSummary.stable} estables</span>
        <span>${report.balance.level}</span>
      </div>
      <p class="graph-pro-briefing-method">Interpretación automática basada en los microciclos seleccionados mediante reglas deportivas.</p>
    </section>
  `;
}

globalThis.PPFGraphAutomaticInsights = Object.freeze({
  build: graphProBuildAutomaticInsights,
  percent: graphProInsightPercent,
  detectPattern: graphProDetectTrainingPattern,
  version: "3.0.4"
});

function renderMicroComparison(patientNickname = "", microA = "", microB = "") {
  const micros = getAvailableMicrosForGraphPro(patientNickname);

  if (micros.length === 0) {
    return `<section class="graph-pro-card micro-compare-card"><h3>Comparativa microciclos</h3><p>No hay microciclos suficientes para comparar.</p></section>`;
  }

  const last = micros[micros.length - 1];
  const previous = micros.length > 1 ? micros[micros.length - 2] : last;
  const selectedA = microA ? Number(microA) : previous;
  const selectedB = microB ? Number(microB) : last;

  const aStats = getMicroStatsForGraphPro(patientNickname, selectedA);
  const bStats = getMicroStatsForGraphPro(patientNickname, selectedB);
  // Las sesiones describen el contexto del micro, pero no su carga.
  // Por eso quedan fuera de las barras y de los contadores de tendencia.
  const keys = ["series", "exercises", "tonnage", "ts", "ti", "core", "plyo", "mov", "act"];

  const comparisons = keys.map(key => {
    const meta = graphProCompareMetricMeta(key);
    const a = Math.round(Number(aStats[key]) || 0);
    const b = Math.round(Number(bStats[key]) || 0);
    const diff = b - a;
    const percent = a === 0 ? (b === 0 ? 0 : 100) : Math.round((diff / Math.abs(a)) * 100);
    const trend = graphProCompareTrend(diff, percent);
    const rowMax = Math.max(a, b, 1);
    return {
      key, meta, a, b, diff, percent, trend,
      widthA: a ? Math.max((a / rowMax) * 100, 5) : 0,
      widthB: b ? Math.max((b / rowMax) * 100, 5) : 0
    };
  });

  const increased = comparisons.filter(item => item.trend.tone === "positive").length;
  const decreased = comparisons.filter(item => item.trend.tone === "negative").length;
  const stable = comparisons.filter(item => item.trend.tone === "stable").length;
  const mainChange = [...comparisons].sort((x, y) => Math.abs(y.percent) - Math.abs(x.percent))[0];

  return `
    <section class="graph-pro-card micro-compare-card">
      <div class="module-panel-header micro-compare-heading">
        <div>
          <p class="eyebrow">Comparative Intelligence</p>
          <h3>M${aStats.micro} vs M${bStats.micro}</h3>
          <p>Compara volumen, estructura y distribución del trabajo sin hacer cálculos mentales.</p>
        </div>
        <span class="micro-compare-default">Selección activa · M${aStats.micro} ↔ M${bStats.micro}</span>
      </div>

      <div class="micro-compare-session-context" aria-label="Contexto de sesiones">
        <div>
          <span class="micro-session-icon">📅</span>
          <div>
            <small>Sesiones planificadas</small>
            <strong>M${aStats.micro}: ${aStats.sessions} <span>→</span> M${bStats.micro}: ${bStats.sessions}</strong>
          </div>
        </div>
        <em class="${bStats.sessions > aStats.sessions ? "positive" : bStats.sessions < aStats.sessions ? "negative" : "stable"}">
          ${bStats.sessions === aStats.sessions ? "Sin cambio" : `${bStats.sessions > aStats.sessions ? "+" : ""}${bStats.sessions - aStats.sessions} ${Math.abs(bStats.sessions - aStats.sessions) === 1 ? "sesión" : "sesiones"}`}
        </em>
      </div>

      <div class="micro-compare-summary" aria-label="Resumen de métricas de carga y distribución">
        <article class="positive"><span>▲</span><div><strong>${increased}</strong><small>Aumentan</small></div></article>
        <article class="negative"><span>▼</span><div><strong>${decreased}</strong><small>Disminuyen</small></div></article>
        <article class="stable"><span>=</span><div><strong>${stable}</strong><small>Estables</small></div></article>
        <article class="main"><span>◎</span><div><strong>${mainChange ? mainChange.meta.label : "—"}</strong><small>Mayor variación ${mainChange ? `${mainChange.percent > 0 ? "+" : ""}${mainChange.percent}%` : ""}</small></div></article>
      </div>

      <div class="micro-compare-table">
        ${comparisons.map(item => `
          <article class="micro-compare-row ${item.trend.tone}">
            <div class="micro-compare-metric">
              <strong>${item.meta.label}</strong>
              <small>${item.trend.message}</small>
            </div>
            <div class="micro-compare-bars">
              <div class="micro-bar-line base">
                <span>M${aStats.micro}</span>
                <div><i style="width:${item.widthA}%"></i></div>
                <b>${item.a}${item.meta.unit === "kg" ? " kg" : ""}</b>
              </div>
              <div class="micro-bar-line active">
                <span>M${bStats.micro}</span>
                <div><i style="width:${item.widthB}%"></i></div>
                <b>${item.b}${item.meta.unit === "kg" ? " kg" : ""}</b>
              </div>
            </div>
            <div class="micro-compare-delta ${item.trend.tone}">
              <strong>${item.trend.icon} ${item.diff > 0 ? "+" : ""}${item.diff}${item.meta.unit === "kg" ? " kg" : ""}</strong>
              <span>${item.percent > 0 ? "+" : ""}${item.percent}%</span>
              <small>${item.trend.label}</small>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function bindGraphPro() {
  const filter = document.getElementById("graphProPatientFilter");
  const clearButton = document.getElementById("graphProPatientClear");
  const area = document.getElementById("graphProArea");
  const compareArea = document.getElementById("microCompareArea");
  if (!filter || !area) return;

  const comparisonByAthlete = new Map();
  const blockComparisonByAthlete = new Map();

  function getBlockState(patientNickname) {
    const micros = getAvailableMicrosForGraphPro(patientNickname);
    const saved = blockComparisonByAthlete.get(patientNickname);
    if (saved) {
      saved.patientNickname = patientNickname;
      saved.blockA.micros = saved.blockA.micros.filter(m => micros.includes(m));
      saved.blockB.micros = saved.blockB.micros.filter(m => micros.includes(m) && !saved.blockA.micros.includes(m));
      saved.library = graphProGetAthleteBlockLibrary(patientNickname).map(item => ({ ...item, micros: item.micros.filter(m => micros.includes(m)) }));
      return saved;
    }
    const half = Math.max(1, Math.floor(micros.length / 2));
    const state = { mode: "micro", patientNickname, blockA: { name: "Bloque A", micros: micros.slice(0, half) }, blockB: { name: "Bloque B", micros: micros.slice(half) }, library: graphProGetAthleteBlockLibrary(patientNickname) };
    blockComparisonByAthlete.set(patientNickname, state);
    return state;
  }

  function getDefaultComparison(patientNickname) {
    const micros = getAvailableMicrosForGraphPro(patientNickname);
    const last = micros.length ? micros[micros.length - 1] : 0;
    const previous = micros.length > 1 ? micros[micros.length - 2] : last;
    return { microA: previous, microB: last };
  }

  function getComparison(patientNickname) {
    const saved = comparisonByAthlete.get(patientNickname);
    const micros = getAvailableMicrosForGraphPro(patientNickname);
    if (saved && micros.includes(saved.microA) && micros.includes(saved.microB)) return saved;
    const defaults = getDefaultComparison(patientNickname);
    comparisonByAthlete.set(patientNickname, defaults);
    return defaults;
  }

  function emptyGraphPro() {
    area.innerHTML = `
      <section class="graph-pro-empty-state">
        <div class="graph-pro-empty-icon" aria-hidden="true">⌁</div>
        <p class="eyebrow">CENTRO DE RENDIMIENTO v2.0.1</p>
        <h3>Selecciona un deportista</h3>
        <p>Elige un deportista y compara libremente dos microciclos terminados.</p>
      </section>
    `;
    if (compareArea) compareArea.innerHTML = "";
  }

  function updateGraphProSelectorState() {
    if (clearButton) clearButton.hidden = !filter.value;
  }

  function bindBlockBuilder() {
    if (!filter.value) return;
    const state = getBlockState(filter.value);
    const rerender = () => { blockComparisonByAthlete.set(filter.value, state); renderActiveComparison(); };
    document.querySelectorAll("[data-analysis-mode]").forEach(button => button.addEventListener("click", () => {
      const next = button.dataset.analysisMode;
      if (next === "block" && (!state.blockA.micros.length || !state.blockB.micros.length)) {
        const msg = document.getElementById("graphProBlockMessage");
        if (msg) msg.textContent = "Selecciona al menos un micro en cada bloque antes de activar el análisis.";
        return;
      }
      state.mode = next;
      rerender();
    }));
    document.querySelectorAll("[data-block-side]").forEach(input => input.addEventListener("change", () => {
      const side = input.dataset.blockSide;
      const own = side === "A" ? state.blockA : state.blockB;
      const other = side === "A" ? state.blockB : state.blockA;
      const micro = Number(input.value);
      own.micros = input.checked ? [...new Set([...own.micros, micro])].sort((a,b)=>a-b) : own.micros.filter(item => item !== micro);
      other.micros = other.micros.filter(item => item !== micro);
      rerender();
    }));
    document.querySelectorAll("[data-block-clear]").forEach(button => button.addEventListener("click", () => {
      const block = button.dataset.blockClear === "A" ? state.blockA : state.blockB;
      block.micros = [];
      if (state.mode === "block") state.mode = "micro";
      rerender();
    }));
    const nameA = document.getElementById("graphProBlockNameA");
    const nameB = document.getElementById("graphProBlockNameB");
    const saveNames = () => { state.blockA.name = nameA?.value.trim() || "Bloque A"; state.blockB.name = nameB?.value.trim() || "Bloque B"; blockComparisonByAthlete.set(filter.value, state); };
    nameA?.addEventListener("change", () => { saveNames(); renderActiveComparison(); });
    nameB?.addEventListener("change", () => { saveNames(); renderActiveComparison(); });

    document.querySelectorAll("[data-block-save]").forEach(button => button.addEventListener("click", () => {
      saveNames();
      const block = button.dataset.blockSave === "A" ? state.blockA : state.blockB;
      if (!block.micros.length) return;
      const list = graphProGetAthleteBlockLibrary(filter.value);
      list.push(graphProCreateLibraryBlock(block));
      graphProSaveAthleteBlockLibrary(filter.value, list);
      state.library = graphProGetAthleteBlockLibrary(filter.value);
      rerender();
    }));

    document.querySelectorAll("[data-library-action]").forEach(button => button.addEventListener("click", () => {
      const card = button.closest("[data-library-id]");
      const id = card?.dataset.libraryId;
      const action = button.dataset.libraryAction;
      let list = graphProGetAthleteBlockLibrary(filter.value);
      const index = list.findIndex(item => item.id === id);
      if (index < 0) return;
      const item = list[index];
      if (action === "load-a" || action === "load-b") {
        const target = action === "load-a" ? state.blockA : state.blockB;
        const other = action === "load-a" ? state.blockB : state.blockA;
        target.name = item.name;
        target.micros = item.micros.filter(m => !other.micros.includes(m));
        if (!target.micros.length && item.micros.length) {
          const msg = document.getElementById("graphProBlockMessage");
          if (msg) msg.textContent = "Todos los micros de ese bloque ya están ocupados en el bloque contrario.";
          return;
        }
      } else if (action === "favorite") {
        item.favorite = !item.favorite; item.updatedAt = Date.now();
        graphProSaveAthleteBlockLibrary(filter.value, list);
      } else if (action === "duplicate") {
        list.push({ ...graphProCreateLibraryBlock(item), name: `${item.name} · copia`, favorite: false });
        graphProSaveAthleteBlockLibrary(filter.value, list);
      } else if (action === "rename") {
        const nextName = window.prompt("Nuevo nombre del bloque", item.name);
        if (nextName === null) return;
        const clean = nextName.trim().slice(0,36);
        if (!clean) return;
        item.name = clean; item.updatedAt = Date.now();
        graphProSaveAthleteBlockLibrary(filter.value, list);
      } else if (action === "delete") {
        if (!window.confirm(`¿Eliminar “${item.name}” de la biblioteca?`)) return;
        list = list.filter(entry => entry.id !== id);
        graphProSaveAthleteBlockLibrary(filter.value, list);
      }
      state.library = graphProGetAthleteBlockLibrary(filter.value);
      rerender();
    }));

    document.querySelectorAll("[data-smart-comparison]").forEach(button => button.addEventListener("click", () => {
      const proposals = graphProBuildSmartComparisons(filter.value, getAvailableMicrosForGraphPro(filter.value));
      const proposal = proposals.find(item => item.id === button.dataset.smartComparison);
      if (!proposal) return;
      state.blockA = { name: proposal.aName, micros: [...proposal.a] };
      state.blockB = { name: proposal.bName, micros: [...proposal.b] };
      state.mode = "block";
      rerender();
    }));

    document.getElementById("graphProSwapBlocks")?.addEventListener("click", () => {
      const oldA = state.blockA; state.blockA = state.blockB; state.blockB = oldA; rerender();
    });
    document.getElementById("graphProApplyBlocks")?.addEventListener("click", () => {
      saveNames();
      if (!state.blockA.micros.length || !state.blockB.micros.length) return;
      state.mode = "block";
      rerender();
    });
  }

  function bindComparisonSelectors() {
    const microASelect = document.getElementById("graphProMicroA");
    const microBSelect = document.getElementById("graphProMicroB");
    const swapButton = document.getElementById("graphProSwapMicros");
    const feedback = document.getElementById("graphProComparisonFeedback");
    if (!microASelect || !microBSelect || !filter.value) return;

    const current = getComparison(filter.value);
    let lastValid = { microA: current.microA, microB: current.microB };
    let feedbackTimer = 0;
    let statusTimer = 0;

    const setComparisonStatus = (state = "active", comparison = lastValid) => {
      const status = document.getElementById("graphProComparisonStatus");
      if (!status) return;
      window.clearTimeout(statusTimer);
      const label = status.querySelector(".graph-pro-status-label");
      const value = status.querySelector(".graph-pro-status-value");
      status.classList.remove("is-active", "is-swapped", "is-invalid", "is-changing");
      status.classList.add(`is-${state}`, "is-changing");

      if (state === "swapped") {
        label.textContent = "↻ Sentido del análisis cambiado";
        value.textContent = `Ahora se analiza M${comparison.microA} → M${comparison.microB}`;
        statusTimer = window.setTimeout(() => setComparisonStatus("active", comparison), 1500);
      } else if (state === "invalid") {
        label.textContent = "⚠ Comparación no válida";
        value.textContent = "Selecciona un micro diferente";
      } else {
        label.textContent = "Comparación activa";
        value.textContent = `M${comparison.microA} ↔ M${comparison.microB}`;
      }

      requestAnimationFrame(() => status.classList.remove("is-changing"));
    };

    const syncDisabledOptions = () => {
      [...microASelect.options].forEach(option => {
        option.disabled = Number(option.value) === Number(microBSelect.value);
      });
      [...microBSelect.options].forEach(option => {
        option.disabled = Number(option.value) === Number(microASelect.value);
      });
    };

    const hideInvalidFeedback = () => {
      window.clearTimeout(feedbackTimer);
      if (!feedback) return;
      feedback.hidden = true;
      feedback.classList.remove("is-visible");
      microASelect.removeAttribute("aria-invalid");
      microBSelect.removeAttribute("aria-invalid");
    };

    const showInvalidFeedback = changedSelect => {
      window.clearTimeout(feedbackTimer);
      if (feedback) {
        feedback.hidden = false;
        requestAnimationFrame(() => feedback.classList.add("is-visible"));
      }
      changedSelect.setAttribute("aria-invalid", "true");
      changedSelect.setAttribute("aria-describedby", "graphProComparisonFeedback");
      setComparisonStatus("invalid", lastValid);
      feedbackTimer = window.setTimeout(() => {
        changedSelect.value = changedSelect.id === "graphProMicroA" ? String(lastValid.microA) : String(lastValid.microB);
        hideInvalidFeedback();
        syncDisabledOptions();
        setComparisonStatus("active", lastValid);
        changedSelect.focus({ preventScroll: true });
      }, 1700);
    };

    const commitComparison = (next, changedLabel, statusState = "active") => {
      hideInvalidFeedback();
      lastValid = { ...next };
      comparisonByAthlete.set(filter.value, next);
      renderActiveComparison();
      requestAnimationFrame(() => {
        const selectionStatus = document.querySelector(".graph-pro-selection-status");
        if (selectionStatus) selectionStatus.setAttribute("aria-label", `${changedLabel}. M${next.microA} frente a M${next.microB}`);
        const refreshedStatus = document.getElementById("graphProComparisonStatus");
        if (refreshedStatus) {
          const label = refreshedStatus.querySelector(".graph-pro-status-label");
          const value = refreshedStatus.querySelector(".graph-pro-status-value");
          refreshedStatus.classList.remove("is-active", "is-swapped", "is-invalid");
          refreshedStatus.classList.add(`is-${statusState}`);
          if (statusState === "swapped") {
            label.textContent = "↻ Sentido del análisis cambiado";
            value.textContent = `Ahora se analiza M${next.microA} → M${next.microB}`;
            window.setTimeout(() => {
              const activeStatus = document.getElementById("graphProComparisonStatus");
              if (!activeStatus) return;
              activeStatus.classList.remove("is-swapped");
              activeStatus.classList.add("is-active", "is-changing");
              activeStatus.querySelector(".graph-pro-status-label").textContent = "Comparación activa";
              activeStatus.querySelector(".graph-pro-status-value").textContent = `M${next.microA} ↔ M${next.microB}`;
              requestAnimationFrame(() => activeStatus.classList.remove("is-changing"));
            }, 1500);
          }
        }
      });
    };

    const updateComparison = event => {
      const next = {
        microA: Number(microASelect.value),
        microB: Number(microBSelect.value)
      };
      if (next.microA === next.microB) {
        showInvalidFeedback(event.currentTarget);
        return;
      }
      const changed = event.currentTarget.id === "graphProMicroA" ? "Micro base actualizado" : "Micro comparado actualizado";
      commitComparison(next, changed);
    };

    microASelect.addEventListener("change", updateComparison);
    microBSelect.addEventListener("change", updateComparison);

    if (swapButton) {
      swapButton.addEventListener("click", () => {
        const next = { microA: Number(microBSelect.value), microB: Number(microASelect.value) };
        if (!next.microA || !next.microB || next.microA === next.microB) return;
        swapButton.classList.add("is-swapping");
        window.setTimeout(() => commitComparison(next, "Dirección de comparación invertida", "swapped"), 160);
      });
    }

    syncDisabledOptions();
  }

  function renderActiveComparison() {
    updateGraphProSelectorState();
    if (!filter.value) {
      emptyGraphPro();
      return;
    }

    const { microA, microB } = getComparison(filter.value);
    area.innerHTML = renderGraphProDashboard(filter.value, microA, microB, getBlockState(filter.value));
    if (compareArea) compareArea.innerHTML = renderMicroComparison(filter.value, microA, microB);
    bindBlockBuilder();
    bindComparisonSelectors();
    if (typeof bindRadarTooltips === "function") bindRadarTooltips();
    if (typeof bindGraphProKpiInspector === "function") bindGraphProKpiInspector();
    if (typeof bindPerformanceExecutiveDashboard === "function") bindPerformanceExecutiveDashboard();
  }

  filter.addEventListener("change", renderActiveComparison);
  clearButton?.addEventListener("click", () => {
    filter.value = "";
    renderActiveComparison();
    filter.focus();
  });

  renderActiveComparison();
}

function downloadJsonFile(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function getLocalBackupData() {
  return {
    app: "Programa Preparador Físico",
    version: "localStorage-estable",
    exportedAt: new Date().toISOString(),
    data: {
      patients,
      sessions,
      histories,
      patientFiles,
      exerciseLibrary,
      completedSessions: JSON.parse(localStorage.getItem("completedSessions")) || []
    }
  };
}

function applyLocalBackupData(backup) {
  const data = backup.data || backup.stores || {};

  patients = data.patients || [];
  sessions = data.sessions || [];
  histories = data.histories || [];
  patientFiles = data.patientFiles || [];
  exerciseLibrary = data.exerciseLibrary || [];

  localStorage.setItem("patients", JSON.stringify(patients));
  localStorage.setItem("sessions", JSON.stringify(sessions));
  window.PPF_CORE?.emit?.("sessions");
  localStorage.setItem("histories", JSON.stringify(histories));
  localStorage.setItem("patientFiles", JSON.stringify(patientFiles));
  localStorage.setItem("valoraciones", JSON.stringify(valoraciones));
  localStorage.setItem("exerciseLibrary", JSON.stringify(exerciseLibrary));
  localStorage.setItem("completedSessions", JSON.stringify(data.completedSessions || []));

  updateCounters();
}

function renderSystemStats() {
  const area = document.getElementById("systemStats");
  if (!area) return;

  const completedSessions = JSON.parse(localStorage.getItem("completedSessions")) || [];

  area.innerHTML = `
    <article><span>Pacientes</span><strong>${patients.length}</strong></article>
    <article><span>Sesiones</span><strong>${sessions.length}</strong></article>
    <article><span>Historial</span><strong>${histories.length}</strong></article>
    <article><span>Archivos</span><strong>${patientFiles.length}</strong></article>
    <article><span>Biblioteca</span><strong>${exerciseLibrary.length}</strong></article>
    <article><span>Terminadas</span><strong>${completedSessions.length}</strong></article>
  `;
}


function manualSupabaseSyncFromSystem() {
  if (!window.PPF_SUPABASE || typeof window.PPF_SUPABASE.push !== "function") {
    alert("Supabase no está cargado o no está configurado.");
    return;
  }

  const btn = document.getElementById("syncSupabaseBtn");
  const previousText = btn ? btn.textContent : "";

  if (btn) {
    btn.disabled = true;
    btn.textContent = "Sincronizando...";
  }

  window.PPF_SUPABASE.push()
    .then(() => {
      alert("Supabase actualizado correctamente.");
      if (typeof renderSystemStats === "function") renderSystemStats();

  document.getElementById("syncSupabaseBtn")?.addEventListener("click", event => {
    event.preventDefault();
    manualSupabaseSyncFromSystem();
  });

    })
    .catch(error => {
      console.error("Error sincronizando Supabase:", error);
      alert("Error sincronizando Supabase. Revisa la consola.");
    })
    .finally(() => {
      if (btn) {
        btn.disabled = false;
        btn.textContent = previousText || "Actualizar Supabase";
      }
    });
}

function bindSystemPanel() {
  renderSystemStats();
  const syncSupabaseBtn = document.getElementById("syncSupabaseBtn");
  if (syncSupabaseBtn) {
    syncSupabaseBtn.addEventListener("click", async () => {
      if (!window.PPF_SUPABASE) {
        alert("Supabase no está cargado.");
        return;
      }
      await window.PPF_SUPABASE.push();
      alert("Datos sincronizados con Supabase.");
    });
  }

  document.getElementById("backupBtn")?.addEventListener("click", () => {
    downloadJsonFile(`ppf-backup-${new Date().toISOString().slice(0,10)}.json`, getLocalBackupData());
  });

  document.getElementById("restoreInput")?.addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const backup = JSON.parse(text);

    applyLocalBackupData(backup);

    alert("Backup cargado correctamente.");
    renderSystemStats();
    renderSection("paciente");
  });

  document.getElementById("clearIndexedFlagBtn")?.addEventListener("click", () => {
    localStorage.removeItem("ppfIndexedDBEnabled");
    localStorage.removeItem("ppfLastMigration");
    alert("Flags de BD limpiados. La app queda usando localStorage.");
    renderSystemStats();
  });
}


function escapeValuationHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function valuationUnitOptions(selected = "") {
  return ["", "cm", "mm", "m", "km", "s", "segundos", "ms", "min", "m/s", "km/h", "kg", "N", "N/kg", "N/Kg peso", "W", "W/kg", "%", "ppm", "puntos", "repeticiones", "saltos", "contactos", "RPE"]
    .map(unit => `<option value="${unit}" ${unit === selected ? "selected" : ""}>${unit || "Unidad"}</option>`)
    .join("");
}

function valuationTestRow(number = 1) {
  return `
    <div class="valuation-test-row valuation-test-row-pro-v2" data-valuation-row>
      <div class="valuation-test-name-wrap">
        <label>TEST ${number}</label>
        <input class="valuation-test-name" type="text" placeholder="Ej: CMJ, Sprint 10 m, IMTP..." required />
      </div>

      <div class="valuation-attempts valuation-attempts-pro-v2">
        <div class="valuation-attempt-unit-grid">
          <input class="valuation-attempt-1" type="text" placeholder="Intento 1" />
          <select class="valuation-attempt-unit-1">${valuationUnitOptions()}</select>
          <input class="valuation-attempt-2" type="text" placeholder="Intento 2" />
          <select class="valuation-attempt-unit-2">${valuationUnitOptions()}</select>
          <input class="valuation-attempt-3" type="text" placeholder="Intento 3" />
          <select class="valuation-attempt-unit-3">${valuationUnitOptions()}</select>
        </div>
      </div>

      <div class="valuation-observations-wrap">
        <textarea class="valuation-observations" placeholder="Observaciones cualitativas"></textarea>
      </div>

      <button class="valuation-remove-btn" type="button" title="Eliminar test">✕</button>
    </div>
  `;
}

function refreshValuationNumbers() {
  document.querySelectorAll("[data-valuation-row]").forEach((row, index) => {
    const label = row.querySelector("label");
    if (label) label.textContent = `TEST ${index + 1}`;
  });
}




function parseValuationNumber(value = "") {
  const raw = String(value || "").trim().replace(",", ".");
  if (!raw) return null;
  const match = raw.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const number = Number(match[0]);
  return Number.isFinite(number) ? number : null;
}

function formatValuationChartNumber(value, decimals = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value || "");
  return number.toFixed(decimals);
}

function valuationDateSortValue(value = "") {
  const raw = String(value || "").trim();
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const es = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (es) return `${es[3]}-${String(es[2]).padStart(2, "0")}-${String(es[1]).padStart(2, "0")}`;
  return raw;
}

function compareValuationDates(a = {}, b = {}) {
  return valuationDateSortValue(a.fecha).localeCompare(valuationDateSortValue(b.fecha)) || String(a.createdAt || "").localeCompare(String(b.createdAt || ""));
}

function getValuationAttempts(test = {}) {
  return [test.intento1, test.intento2, test.intento3]
    .map(parseValuationNumber)
    .filter(value => value !== null);
}

function getValuationAttemptUnit(test = {}, attemptIndex = 1) {
  return test[`unidad${attemptIndex}`] || test.unidad || "";
}

function getValuationPrimaryUnit(test = {}) {
  return test.unidad1 || test.unidad2 || test.unidad3 || test.unidad || "";
}

function formatValuationAttempt(value = "", unit = "") {
  const raw = String(value || "").trim();
  if (!raw) return "-";
  return `${raw}${unit ? ` ${unit}` : ""}`;
}

function getPatientByNicknameSafe(nickname = "") {
  return patients.find(p => String(p.nickname || "") === String(nickname || ""));
}

function valuationPatientInfoHTML(nickname = "") {
  const patient = getPatientByNicknameSafe(nickname);
  if (!patient) return `<div class="valuation-selected-patient-card empty">Selecciona un paciente para ver su foto.</div>`;
  const photo = getPatientPhotoSafe(patient);
  const avatar = photo
    ? `<img class="valuation-selected-photo" src="${escapeValuationHtml(photo)}" alt="${escapeValuationHtml(patient.nombre || patient.nickname || "Paciente")}" />`
    : `<div class="valuation-selected-photo valuation-selected-initial">${escapeValuationHtml((patient.nombre || patient.nickname || "P").charAt(0).toUpperCase())}</div>`;
  return `
    <div class="valuation-selected-patient-card">
      ${avatar}
      <strong>${escapeValuationHtml(patient.nombre || patient.nickname || "Paciente")}</strong>
      <span>@${escapeValuationHtml(patient.nickname || "-")}</span>
    </div>
  `;
}

function updateValuationSelectedPatientInfo() {
  const box = document.getElementById("valuationSelectedPatientInfo");
  if (!box) return;
  const nickname = document.getElementById("valuationPatient")?.value || "";
  box.innerHTML = valuationPatientInfoHTML(nickname);
}

function normalizeValuationTestName(value = "") {
  return String(value || "").trim();
}

function getValuationTestNames(patientNickname = "") {
  const names = new Set();
  valoraciones
    .filter(item => !patientNickname || item.patientNickname === patientNickname)
    .forEach(item => (item.tests || []).forEach(test => {
      const name = normalizeValuationTestName(test.nombre);
      if (name) names.add(name);
    }));
  return [...names].sort((a, b) => a.localeCompare(b, "es"));
}

function updateValuationPdfTestOptions() {
  const patientSelect = document.getElementById("valuationPdfPatient");
  const testSelect = document.getElementById("valuationPdfTest");
  if (!patientSelect || !testSelect) return;
  const names = getValuationTestNames(patientSelect.value || "");
  testSelect.innerHTML = `<option value="">Todos los TEST</option>` + names.map(name => `<option value="${escapeValuationHtml(name)}">${escapeValuationHtml(name)}</option>`).join("");
}

function getSelectedValuationIds() {
  return [...document.querySelectorAll(".valuation-select-check:checked")].map(input => input.value).filter(Boolean);
}

function setAllValuationChecks(checked) {
  document.querySelectorAll(".valuation-select-check").forEach(input => { input.checked = checked; });
}

function buildValuationRowsForReport(items = [], testFilter = "") {
  return items.flatMap(valuation =>
    (valuation.tests || [])
      .filter(valuationHasRegisteredData)
      .filter(test => !testFilter || normalizeValuationTestName(test.nombre).toLowerCase() === normalizeValuationTestName(testFilter).toLowerCase())
      .map((test, index) => `
        <tr>
          <td>${escapeValuationHtml(valuation.fecha || "-")}</td>
          <td>${index + 1}</td>
          <td>${escapeValuationHtml(test.nombre || "-")}</td>
          <td>${escapeValuationHtml(formatValuationAttempt(test.intento1, getValuationAttemptUnit(test, 1)))}</td>
          <td>${escapeValuationHtml(formatValuationAttempt(test.intento2, getValuationAttemptUnit(test, 2)))}</td>
          <td>${escapeValuationHtml(formatValuationAttempt(test.intento3, getValuationAttemptUnit(test, 3)))}</td>
          <td>${escapeValuationHtml(getValuationPrimaryUnit(test))}</td>
          <td>${escapeValuationHtml(test.observaciones || "-")}</td>
        </tr>
      `)
  ).join("");
}


function buildValuationChartGroupsFromItems(items = [], patientNickname = "") {
  const groups = {};

  (items || [])
    .filter(item => !patientNickname || item.patientNickname === patientNickname)
    .slice()
    .sort(compareValuationDates)
    .forEach(item => {
      const patient = patients.find(p => p.nickname === item.patientNickname);
      const patientName = patient ? patient.nombre : item.patientNickname;

      (item.tests || []).forEach(test => {
        const testName = String(test.nombre || "").trim();
        const unit = String(getValuationPrimaryUnit(test) || "").trim();
        const attempts = getValuationAttempts(test);
        if (!testName || !attempts.length) return;

        const key = `${item.patientNickname}__${testName.toLowerCase()}__${unit}`;
        if (!groups[key]) {
          groups[key] = {
            patientNickname: item.patientNickname,
            patientName,
            testName,
            unit,
            days: {}
          };
        }

        const fecha = item.fecha || "-";
        if (!groups[key].days[fecha]) groups[key].days[fecha] = { fecha, attempts: [] };
        groups[key].days[fecha].attempts.push(...attempts);
      });
    });

  return Object.values(groups)
    .map(group => ({
      ...group,
      days: Object.values(group.days)
        .sort((a, b) => valuationDateSortValue(a.fecha).localeCompare(valuationDateSortValue(b.fecha)))
        .map(day => {
          const mean = day.attempts.reduce((acc, value) => acc + value, 0) / day.attempts.length;
          return { ...day, mean: Number(mean.toFixed(2)) };
        })
    }))
    .filter(group => group.days.length)
    .sort((a, b) => a.patientName.localeCompare(b.patientName, "es") || a.testName.localeCompare(b.testName, "es"));
}

function openValuationPdfWindow({ title, subtitle, patient, items, testFilter = "", includeAllPatientCharts = false }) {
  const reportItems = (items || []).slice().sort(compareValuationDates);
  const rows = buildValuationRowsForReport(reportItems, testFilter);
  if (!rows) {
    alert("No hay datos registrados para generar este PDF.");
    return;
  }

  const patientPhoto = patient ? getPatientPhotoSafe(patient) : "";
  const photoHtml = patientPhoto ? `<img class="pdf-patient-photo" src="${escapeValuationHtml(patientPhoto)}" alt="${escapeValuationHtml(patient.nombre || patient.nickname || "Paciente")}">` : "";

  let chartGroups = [];
  if (includeAllPatientCharts && patient) {
    chartGroups = getValuationPdfChartGroupsForPatient(patient.nickname)
      .filter(group => !testFilter || normalizeValuationTestName(group.testName).toLowerCase() === normalizeValuationTestName(testFilter).toLowerCase());
  } else {
    chartGroups = buildValuationChartGroupsFromItems(reportItems, patient?.nickname || "")
      .filter(group => !testFilter || normalizeValuationTestName(group.testName).toLowerCase() === normalizeValuationTestName(testFilter).toLowerCase());
  }
  const chartsHtml = chartGroups.length
    ? `<div class="pdf-section-break"></div><h1 class="pdf-section-title">Gráficas de evolución</h1>${chartGroups.map(renderValuationPdfChart).join("")}`
    : "";

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>${escapeValuationHtml(title)}</title>
      <style>
        @page { size: A4 portrait; margin: 10mm; }
        body { font-family: Arial, sans-serif; padding: 16px; color: #0f172a; background:#ffffff; }
        .header { display:flex; justify-content:space-between; gap:18px; border-bottom: 3px solid #22c55e; padding-bottom: 14px; margin-bottom: 22px; align-items:flex-start; }
        .brand { color: #16a34a; font-weight: 800; font-size: 14px; text-transform: uppercase; }
        h1 { margin: 8px 0 4px; font-size: 26px; }
        .meta { color: #475569; font-size: 14px; line-height:1.45; }
        .pdf-patient-photo { width:84px; height:84px; border-radius:18px; object-fit:cover; border:2px solid #22c55e; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
        th { background: #0f172a; color: #fff; text-align: left; padding: 9px; }
        td { border: 1px solid #cbd5e1; padding: 8px; vertical-align: top; }
        tr:nth-child(even) td { background: #f8fafc; }
        .footer { margin-top: 24px; color: #64748b; font-size: 12px; }
        .pdf-section-break { page-break-before: always; }
        .pdf-section-title { margin-top: 0; color:#0f172a; }
        .pdf-chart-card { page-break-inside: avoid; margin: 10px 0; padding: 10px; border: 1px solid #dbeafe; border-radius: 14px; background: #f8fafc; }
        .pdf-chart-title { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; margin-bottom: 6px; }
        .pdf-chart-title h2 { margin:0 0 3px; color:#0f172a; font-size:16px; }
        .pdf-chart-title p { margin:0; color:#64748b; font-size:9px; font-weight:700; }
        .pdf-chart-title strong { color:#15803d; font-size:14px; white-space:nowrap; }
        .pdf-chart { width:100%; height:auto; display:block; background:#fff; border-radius:14px; border:1px solid #e2e8f0; }
        .pdf-grid { stroke:#cbd5e1; stroke-width:1; stroke-dasharray:4 5; }
        .pdf-axis { stroke:#94a3b8; stroke-width:1; }
        .pdf-scale { display:none; }
        .pdf-date { fill:#475569; font-size:9px; font-weight:700; }
        .pdf-bar-value { fill:#ffffff; font-size:3.8px; font-weight:950; paint-order:stroke; stroke:#0f172a; stroke-width:.9px; }
        .pdf-mean-value { fill:#1d4ed8; font-size:7px; font-weight:900; paint-order:stroke; stroke:#ffffff; stroke-width:2px; }
        .pdf-trend-kpi { position:relative; padding-right:34px !important; }
        .pdf-trend-arrow { position:absolute; top:9px; right:9px; width:24px; height:24px; display:grid; place-items:center; border-radius:999px; font-size:18px; font-weight:950; }
        .pdf-trend-kpi.trend-up .pdf-trend-arrow { color:#16a34a; background:#dcfce7; }
        .pdf-trend-kpi.trend-down .pdf-trend-arrow { color:#dc2626; background:#fee2e2; }
        .pdf-trend-kpi.trend-flat .pdf-trend-arrow { color:#475569; background:#e2e8f0; }
        .pdf-chart-subtitle { color:#64748b; font-size:12px; font-weight:700; }
        .pdf-bar { fill:#22c55e; stroke:#16a34a; stroke-width:1; }
        .pdf-mean-line { stroke:#2563eb; stroke-width:3; stroke-linecap:round; stroke-linejoin:round; }
        .pdf-mean-point { fill:#3b82f6; stroke:#eff6ff; stroke-width:1.5; }
        .pdf-chart-summary { display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-top:7px; }
        .pdf-chart-summary div { padding:7px; border:1px solid #e2e8f0; border-radius:10px; background:#fff; }
        .pdf-chart-summary span { display:block; color:#64748b; font-size:8px; font-weight:800; text-transform:uppercase; margin-bottom:3px; }
        .pdf-chart-summary b { display:block; color:#0f172a; font-size:11px; }
        .pdf-chart-summary small { color:#64748b; font-weight:700; font-size:8px; }
        @media print { body { padding: 0; } .pdf-section-break { page-break-before: always; } .pdf-chart-card { break-inside: avoid; page-break-inside: avoid; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">P.M Preparador Físico Online</div>
          <h1>${escapeValuationHtml(title)}</h1>
          <div class="meta">${escapeValuationHtml(subtitle || "")}<br>${testFilter ? `<strong>TEST:</strong> ${escapeValuationHtml(testFilter)}` : ""}</div>
        </div>
        ${photoHtml}
      </div>
      <table>
        <thead>
          <tr>
            <th>Fecha</th><th>#</th><th>Test</th><th>Intento 1</th><th>Intento 2</th><th>Intento 3</th><th>Registro</th><th>Observaciones cualitativas</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      ${chartsHtml}
      <div class="footer">Documento generado automáticamente desde Valoraciones PRO.</div>
    </body>
    </html>
  `;

  const win = window.open("", "_blank");
  if (!win) {
    alert("Permite ventanas emergentes para generar el PDF.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 700);
}

function generateSelectedValuationsPDF() {
  const ids = getSelectedValuationIds();
  if (!ids.length) {
    alert("Selecciona una o varias valoraciones.");
    return;
  }
  const items = valoraciones.filter(item => ids.includes(item.id));
  const firstPatient = items.length ? getPatientByNicknameSafe(items[0].patientNickname) : null;
  openValuationPdfWindow({
    title: "Valoraciones seleccionadas",
    subtitle: `${items.length} valoración/es seleccionada/s`,
    patient: firstPatient,
    items,
    includeAllPatientCharts: false
  });
}

function generatePatientTestValuationsPDF() {
  const patientNickname = document.getElementById("valuationPdfPatient")?.value || document.getElementById("valuationsFilter")?.value || "";
  if (!patientNickname) {
    alert("Selecciona un paciente para generar el PDF por paciente/TEST.");
    return;
  }
  const testFilter = document.getElementById("valuationPdfTest")?.value || "";
  const patient = getPatientByNicknameSafe(patientNickname);
  const items = valoraciones.filter(item => item.patientNickname === patientNickname);
  openValuationPdfWindow({
    title: testFilter ? `Informe ${testFilter}` : "Informe completo de valoraciones",
    subtitle: patient ? `${patient.nombre} · @${patient.nickname}` : patientNickname,
    patient,
    items,
    testFilter,
    includeAllPatientCharts: true
  });
}

function getValuationChartGroups(filterNickname = "") {
  const groups = {};

  valoraciones
    .filter(item => !filterNickname || item.patientNickname === filterNickname)
    .slice()
    .sort(compareValuationDates)
    .forEach(item => {
      const patient = patients.find(p => p.nickname === item.patientNickname);
      const patientName = patient ? patient.nombre : item.patientNickname;

      (item.tests || []).forEach(test => {
        const testName = String(test.nombre || "").trim();
        const unit = String(getValuationPrimaryUnit(test) || "").trim();
        const attempts = getValuationAttempts(test);
        if (!testName || !attempts.length) return;

        const key = `${item.patientNickname}__${testName.toLowerCase()}__${unit}`;
        if (!groups[key]) {
          groups[key] = {
            patientNickname: item.patientNickname,
            patientName,
            testName,
            unit,
            days: {}
          };
        }

        const fecha = item.fecha || "-";
        if (!groups[key].days[fecha]) groups[key].days[fecha] = { fecha, attempts: [] };
        groups[key].days[fecha].attempts.push(...attempts);
      });
    });

  return Object.values(groups)
    .map(group => ({
      ...group,
      days: Object.values(group.days)
        .sort((a, b) => valuationDateSortValue(a.fecha).localeCompare(valuationDateSortValue(b.fecha)))
        .map(day => {
          const mean = day.attempts.reduce((acc, value) => acc + value, 0) / day.attempts.length;
          return { ...day, mean: Number(mean.toFixed(2)) };
        })
    }))
    .filter(group => group.days.length)
    .sort((a, b) => a.patientName.localeCompare(b.patientName, "es") || a.testName.localeCompare(b.testName, "es"));
}

function renderValuationMiniChart(group) {
  const days = group.days;
  const allValues = days.flatMap(day => [...day.attempts, day.mean]);
  const minRaw = Math.min(...allValues);
  const maxRaw = Math.max(...allValues);
  const rangeRaw = maxRaw - minRaw || 1;
  const min = minRaw - rangeRaw * 0.10;
  const max = maxRaw + rangeRaw * 0.16;
  const range = max - min || 1;

  const width = 760;
  const height = 360;
  const padX = 68;
  const padY = 46;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const xForDay = index => days.length === 1 ? width / 2 : padX + (index * (chartW / (days.length - 1)));
  const yForValue = value => height - padY - (((value - min) / range) * chartH);

  const maxAttempts = Math.max(...days.map(day => day.attempts.length), 1);
  const daySlot = days.length === 1 ? chartW * 0.44 : Math.min(84, chartW / Math.max(days.length, 1));
  const barGap = 6;
  const barWidth = Math.max(8, Math.min(15, (daySlot - (maxAttempts - 1) * barGap) / maxAttempts));

  const meanPoints = days.map((day, index) => ({ ...day, x: xForDay(index), y: yForValue(day.mean) }));
  const meanPolyline = meanPoints.map(point => `${point.x},${point.y}`).join(" ");

  const first = meanPoints[0];
  const last = meanPoints[meanPoints.length - 1];
  const trend = Number((last.mean - first.mean).toFixed(2));
  const trendLabel = trend > 0 ? `+${trend}` : String(trend);
  const trendPct = first.mean ? Number(((trend / first.mean) * 100).toFixed(2)) : 0;
  const trendPctLabel = trendPct > 0 ? `+${trendPct}%` : `${trendPct}%`;

  const yTicks = [(maxRaw + minRaw) / 2].map(value => Number(value.toFixed(2)));
  const trendClass = trend > 0 ? "trend-up" : trend < 0 ? "trend-down" : "trend-flat";
  const trendArrow = trend > 0 ? "↑" : trend < 0 ? "↓" : "→";

  return `
    <article class="valuation-chart-card valuation-chart-pro-card">
      <div class="valuation-chart-head pro-chart-head">
        <div>
          <span>${escapeValuationHtml(group.patientName)}</span>
          <h4>${escapeValuationHtml(group.testName)}${group.unit ? ` (${escapeValuationHtml(group.unit)})` : ""}</h4>
          <p>Barras verdes = datos individuales · Línea azul = media diaria</p>
        </div>
        <strong>${escapeValuationHtml(String(last.mean))}${group.unit ? ` ${escapeValuationHtml(group.unit)}` : ""}</strong>
      </div>

      <svg class="valuation-line-chart valuation-pro-chart" viewBox="0 0 ${width} ${height}" role="img">
        <defs>
          <linearGradient id="barGradient-${escapeValuationHtml(group.patientNickname)}-${escapeValuationHtml(group.testName).replace(/\s+/g, "-")}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#86efac"></stop>
            <stop offset="100%" stop-color="#16a34a"></stop>
          </linearGradient>
        </defs>

        ${yTicks.map(tick => {
          const y = yForValue(tick);
          return `
            <line x1="${padX}" y1="${y}" x2="${width - padX}" y2="${y}" class="valuation-grid-line" />
          `;
        }).join("")}

        <line x1="${padX}" y1="${height - padY}" x2="${width - padX}" y2="${height - padY}" class="valuation-chart-axis" />

        ${days.map((day, dayIndex) => {
          const centerX = xForDay(dayIndex);
          const totalBarsW = day.attempts.length * barWidth + (day.attempts.length - 1) * barGap;
          const startX = centerX - totalBarsW / 2;

          return day.attempts.map((value, attemptIndex) => {
            const x = startX + attemptIndex * (barWidth + barGap);
            const y = yForValue(value);
            const h = Math.max(2, height - padY - y);
            return `
              <g class="valuation-bar-group valuation-tooltip-source"
                 data-date="${escapeValuationHtml(day.fecha)}"
                 data-label="Intento ${attemptIndex + 1}"
                 data-value="${escapeValuationHtml(String(value))}"
                 data-unit="${escapeValuationHtml(group.unit || "")}">
                <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="6"></rect>
              </g>
            `;
          }).join("");
        }).join("")}

        <polyline points="${meanPolyline}" class="valuation-chart-line valuation-mean-line" fill="none" />

        ${meanPoints.map(point => `
          <g class="valuation-chart-point valuation-mean-point valuation-tooltip-source"
             data-date="${escapeValuationHtml(point.fecha)}"
             data-label="Media diaria"
             data-value="${escapeValuationHtml(String(point.mean))}"
             data-unit="${escapeValuationHtml(group.unit || "")}"
             data-attempts="${escapeValuationHtml(point.attempts.join(" · "))}">
            <circle cx="${point.x}" cy="${point.y}" r="6.5"></circle>
          </g>
        `).join("")}

        ${meanPoints.map((point, index) => {
          if (days.length > 8 && index !== 0 && index !== days.length - 1) return "";
          return `<text x="${point.x}" y="${height - 10}" text-anchor="middle" class="valuation-chart-date">${escapeValuationHtml(point.fecha)}</text>`;
        }).join("")}
      </svg>

      <div class="valuation-chart-summary">
        <div>
          <span>Inicial</span>
          <strong>${escapeValuationHtml(String(first.mean))}${group.unit ? ` ${escapeValuationHtml(group.unit)}` : ""}</strong>
          <small>${escapeValuationHtml(first.fecha)}</small>
        </div>
        <div>
          <span>Actual</span>
          <strong>${escapeValuationHtml(String(last.mean))}${group.unit ? ` ${escapeValuationHtml(group.unit)}` : ""}</strong>
          <small>${escapeValuationHtml(last.fecha)}</small>
        </div>
        <div class="valuation-trend-kpi ${trend > 0 ? "trend-up" : trend < 0 ? "trend-down" : "trend-flat"}">
          <span>Tendencia</span>
          <b class="valuation-trend-arrow" title="${trend > 0 ? "Ascendente" : trend < 0 ? "Descendente" : "Estable"}">${trend > 0 ? "↑" : trend < 0 ? "↓" : "→"}</b>
          <strong>${escapeValuationHtml(formatValuationChartNumber(trend, 2).replace(/^([^\-])/, trend > 0 ? "+$1" : "$1"))}${group.unit ? ` ${escapeValuationHtml(group.unit)}` : ""}</strong>
          <small>${escapeValuationHtml(trendPctLabel)}</small>
        </div>
      </div>

      <p class="valuation-chart-note">Las barras verdes representan los intentos individuales de cada día. La línea azul representa la media diaria.</p>
    </article>
  `;
}

function renderValuationCharts(filterNickname = "") {
  const area = document.getElementById("valuationChartsArea");
  if (!area) return;

  if (!filterNickname) {
    area.innerHTML = "";
    return;
  }

  const groups = getValuationChartGroups(filterNickname);

  if (!groups.length) {
    area.innerHTML = `<p class="valuation-chart-empty">No hay todavía tests con datos numéricos para generar gráficas.</p>`;
    return;
  }

  area.innerHTML = `<div class="valuation-charts-grid valuation-charts-grid-pro">${groups.map(renderValuationMiniChart).join("")}</div>`;
}

function ensureValuationChartTooltip() {
  if (document.getElementById("valuationChartTooltip")) return;

  const tooltip = document.createElement("div");
  tooltip.id = "valuationChartTooltip";
  tooltip.className = "valuation-chart-tooltip";
  tooltip.innerHTML = `
    <strong></strong>
    <div class="tooltip-line tooltip-main"></div>
    <div class="tooltip-line tooltip-extra"></div>
  `;
  document.body.appendChild(tooltip);

  document.addEventListener("pointermove", event => {
    const target = event.target.closest(".valuation-tooltip-source");
    if (!target) return;

    const date = target.dataset.date || "";
    const label = target.dataset.label || "";
    const value = target.dataset.value || "";
    const unit = target.dataset.unit || "";
    const attempts = target.dataset.attempts || "";

    tooltip.querySelector("strong").textContent = date;
    tooltip.querySelector(".tooltip-main").textContent = `${label}: ${value}${unit ? ` ${unit}` : ""}`;
    tooltip.querySelector(".tooltip-extra").textContent = attempts ? `Intentos: ${attempts}${unit ? ` ${unit}` : ""}` : "";

    tooltip.classList.add("show");

    const offset = 18;
    let left = event.pageX + offset;
    let top = event.pageY + offset;

    const rect = tooltip.getBoundingClientRect();
    if (left + rect.width > window.scrollX + window.innerWidth - 12) {
      left = event.pageX - rect.width - offset;
    }
    if (top + rect.height > window.scrollY + window.innerHeight - 12) {
      top = event.pageY - rect.height - offset;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  });

  document.addEventListener("pointerout", event => {
    if (!event.target.closest(".valuation-tooltip-source")) return;
    tooltip.classList.remove("show");
  });
}


function renderValuationsList(filterNickname = "") {
  const list = document.getElementById("valuationsList");
  if (!list) return;

  const visible = valoraciones
    .filter(item => !filterNickname || item.patientNickname === filterNickname)
    .slice()
    .sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")) || String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  if (visible.length === 0) {
    list.innerHTML = `<p>No hay valoraciones guardadas todavía.</p>`;
    return;
  }

  list.innerHTML = visible.map(item => {
    const patient = patients.find(p => p.nickname === item.patientNickname);
    const photo = getPatientPhotoSafe(patient);
    return `
      <article class="valuation-card valuation-card-selectable">
        <div class="history-card-header">
          <label class="valuation-select-row">
            <input class="valuation-select-check" type="checkbox" value="${escapeValuationHtml(item.id)}" />
            <span class="history-type">Valoración</span>
          </label>
          <span class="history-date">${escapeValuationHtml(item.fecha || "-")}</span>
        </div>
        <div class="valuation-card-patient-line">
          ${photo ? `<img class="valuation-card-photo" src="${escapeValuationHtml(photo)}" alt="${escapeValuationHtml(patient?.nombre || item.patientNickname || "Paciente")}">` : ""}
          <div>
            <h3>${escapeValuationHtml(patient ? patient.nombre : item.patientNickname)}</h3>
            <small>@${escapeValuationHtml(item.patientNickname || "-")}</small>
          </div>
        </div>
        <div class="valuation-card-tests">
          ${(item.tests || []).map((test, index) => `
            <div class="valuation-card-test">
              <strong>TEST ${index + 1}: ${escapeValuationHtml(test.nombre || "-")}</strong>
              <p><b>Datos:</b> ${escapeValuationHtml(formatValuationAttempt(test.intento1, getValuationAttemptUnit(test, 1)))} · ${escapeValuationHtml(formatValuationAttempt(test.intento2, getValuationAttemptUnit(test, 2)))} · ${escapeValuationHtml(formatValuationAttempt(test.intento3, getValuationAttemptUnit(test, 3)))}</p>
              <p><b>Observaciones:</b> ${escapeValuationHtml(test.observaciones || "-")}</p>
            </div>
          `).join("")}
        </div>
        <div class="file-actions">
          <button class="secondary-btn" type="button" onclick="editValuation('${item.id}')">Editar</button>
          <button class="secondary-btn" type="button" onclick="generateValuationPDF('${item.id}')">Generar PDF</button>
          <button class="danger-btn" type="button" onclick="deleteValuation('${item.id}')">Eliminar</button>
        </div>
      </article>
    `;
  }).join("");
}

async function pmRefreshValoracionesFromSupabase() {
  try {
    if (window.PPF_SUPABASE && typeof window.PPF_SUPABASE.pull === "function") {
      await window.PPF_SUPABASE.pull();
      try { valoraciones = JSON.parse(localStorage.getItem("valoraciones") || "[]"); } catch (_) {}
      const filter = document.getElementById("valuationsFilter")?.value || "";
      if (typeof renderValuationsList === "function") renderValuationsList(filter);
      if (typeof renderValuationCharts === "function") renderValuationCharts(filter);
      if (typeof ensureValuationChartTooltip === "function") ensureValuationChartTooltip();
    }
  } catch (error) {
    console.warn("No se pudo actualizar valoraciones desde Supabase:", error);
  }
}

function applyValuationUnitAutofill(row) {
  if (!row) return;
  const attempt1 = row.querySelector(".valuation-attempt-1");
  const attempt2 = row.querySelector(".valuation-attempt-2");
  const attempt3 = row.querySelector(".valuation-attempt-3");
  const unit1 = row.querySelector(".valuation-attempt-unit-1");
  const unit2 = row.querySelector(".valuation-attempt-unit-2");
  const unit3 = row.querySelector(".valuation-attempt-unit-3");
  const primaryUnit = unit1?.value || unit2?.value || unit3?.value || "";
  if (!primaryUnit) return;

  // Intento 1 manda: si el intento 2/3 tiene dato, hereda automáticamente la unidad del intento 1.
  if (unit1 && !unit1.value && String(attempt1?.value || "").trim()) unit1.value = primaryUnit;
  if (unit2 && String(attempt2?.value || "").trim()) unit2.value = primaryUnit;
  if (unit3 && String(attempt3?.value || "").trim()) unit3.value = primaryUnit;
}

function bindValoracionesForm() {
  const form = document.getElementById("valuationsForm");
  const testsArea = document.getElementById("valuationTestsArea");
  const addBtn = document.getElementById("addValuationTestBtn");
  const filter = document.getElementById("valuationsFilter");

  if (!form || !testsArea) return;

  setTodayIfEmpty("valuationDate");
  if (window.PPF_SUPABASE && typeof window.PPF_SUPABASE.pull === "function") {
    window.PPF_SUPABASE.pull().then(() => {
      try { valoraciones = JSON.parse(localStorage.getItem("valoraciones") || "[]"); } catch (_) {}
      renderValuationsList(filter?.value || "");
      renderValuationCharts(filter?.value || "");
    }).catch(error => console.warn("No se pudo sincronizar valoraciones:", error));
  }
  renderValuationsList();
  renderValuationCharts("");
  ensureValuationChartTooltip();
  pmRefreshValoracionesFromSupabase();

  addBtn?.addEventListener("click", () => {
    testsArea.insertAdjacentHTML("beforeend", valuationTestRow(testsArea.querySelectorAll("[data-valuation-row]").length + 1));
    refreshValuationNumbers();
  });

  testsArea.addEventListener("click", event => {
    const btn = event.target.closest(".valuation-remove-btn");
    if (!btn) return;

    const rows = testsArea.querySelectorAll("[data-valuation-row]");
    if (rows.length <= 1) {
      alert("Debe quedar al menos un test.");
      return;
    }

    btn.closest("[data-valuation-row]")?.remove();
    refreshValuationNumbers();
  });

  testsArea.addEventListener("input", event => {
    if (!event.target.closest(".valuation-attempt-1, .valuation-attempt-2, .valuation-attempt-3")) return;
    applyValuationUnitAutofill(event.target.closest("[data-valuation-row]"));
  });

  testsArea.addEventListener("change", event => {
    if (!event.target.closest(".valuation-attempt-unit-1, .valuation-attempt-unit-2, .valuation-attempt-unit-3")) return;
    applyValuationUnitAutofill(event.target.closest("[data-valuation-row]"));
  });

  filter?.addEventListener("change", () => {
    renderValuationsList(filter.value);
    if (!filter.value) {
      const area = document.getElementById("valuationChartsArea");
      if (area) area.innerHTML = "";
      return;
    }
    renderValuationCharts(filter.value);
  });

  document.getElementById("valuationPatient")?.addEventListener("change", updateValuationSelectedPatientInfo);
  updateValuationSelectedPatientInfo();

  const pdfPatient = document.getElementById("valuationPdfPatient");
  if (pdfPatient) {
    pdfPatient.addEventListener("change", updateValuationPdfTestOptions);
    updateValuationPdfTestOptions();
  }

  document.getElementById("valuationSelectAllBtn")?.addEventListener("click", () => setAllValuationChecks(true));
  document.getElementById("valuationClearSelectionBtn")?.addEventListener("click", () => setAllValuationChecks(false));
  document.getElementById("valuationPdfSelectedBtn")?.addEventListener("click", generateSelectedValuationsPDF);
  document.getElementById("valuationPdfPatientTestBtn")?.addEventListener("click", generatePatientTestValuationsPDF);

  form.addEventListener("submit", event => {
    event.preventDefault();

    const patientNickname = document.getElementById("valuationPatient")?.value || "";
    const fecha = document.getElementById("valuationDate")?.value || "";

    if (!patientNickname || !fecha) {
      alert("Selecciona paciente y fecha.");
      return;
    }

    const tests = [...testsArea.querySelectorAll("[data-valuation-row]")].map(row => ({
      nombre: row.querySelector(".valuation-test-name")?.value.trim() || "",
      intento1: row.querySelector(".valuation-attempt-1")?.value.trim() || "",
      intento2: row.querySelector(".valuation-attempt-2")?.value.trim() || "",
      intento3: row.querySelector(".valuation-attempt-3")?.value.trim() || "",
      unidad1: row.querySelector(".valuation-attempt-unit-1")?.value || "",
      unidad2: row.querySelector(".valuation-attempt-unit-2")?.value || (row.querySelector(".valuation-attempt-2")?.value.trim() ? (row.querySelector(".valuation-attempt-unit-1")?.value || "") : ""),
      unidad3: row.querySelector(".valuation-attempt-unit-3")?.value || (row.querySelector(".valuation-attempt-3")?.value.trim() ? (row.querySelector(".valuation-attempt-unit-1")?.value || "") : ""),
      unidad: row.querySelector(".valuation-attempt-unit-1")?.value || row.querySelector(".valuation-attempt-unit-2")?.value || row.querySelector(".valuation-attempt-unit-3")?.value || "",
      observaciones: row.querySelector(".valuation-observations")?.value.trim() || ""
    })).filter(test => test.nombre || test.intento1 || test.intento2 || test.intento3 || test.observaciones);

    if (tests.length === 0) {
      alert("Rellena al menos un test.");
      return;
    }

    const existing = editingValuationId ? valoraciones.find(item => item.id === editingValuationId) : null;
    const payload = {
      id: editingValuationId || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      patientNickname,
      fecha,
      tests,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingValuationId) {
      valoraciones = valoraciones.map(item => item.id === editingValuationId ? payload : item);
    } else {
      valoraciones.push(payload);
    }

    localStorage.setItem("valoraciones", JSON.stringify(valoraciones));

    if (window.PPF_SUPABASE && typeof window.PPF_SUPABASE.pushKey === "function") {
      window.PPF_SUPABASE.pushKey("valoraciones").catch(error => console.warn("No se pudo sincronizar valoraciones:", error));
    }

    form.reset();
    editingValuationId = null;
    testsArea.innerHTML = valuationTestRow(1);
    setTodayIfEmpty("valuationDate");
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = "Guardar valoración";
    renderValuationsList(filter?.value || "");
    renderValuationCharts(filter?.value || "");
    alert("Valoración guardada correctamente.");
  });
}


function editValuation(id) {
  const item = valoraciones.find(value => value.id === id);
  if (!item) return;

  editingValuationId = id;
  renderSection("valoraciones");

  const patientInput = document.getElementById("valuationPatient");
  const dateInput = document.getElementById("valuationDate");
  const testsArea = document.getElementById("valuationTestsArea");
  const form = document.getElementById("valuationsForm");

  if (patientInput) patientInput.value = item.patientNickname || "";
  if (dateInput) dateInput.value = item.fecha || "";

  if (testsArea) {
    const tests = item.tests && item.tests.length ? item.tests : [{}];
    testsArea.innerHTML = tests.map((test, index) => valuationTestRow(index + 1)).join("");

    testsArea.querySelectorAll("[data-valuation-row]").forEach((row, index) => {
      const test = tests[index] || {};
      const name = row.querySelector(".valuation-test-name");
      const attempt1 = row.querySelector(".valuation-attempt-1");
      const attempt2 = row.querySelector(".valuation-attempt-2");
      const attempt3 = row.querySelector(".valuation-attempt-3");
      const unit1 = row.querySelector(".valuation-attempt-unit-1");
      const unit2 = row.querySelector(".valuation-attempt-unit-2");
      const unit3 = row.querySelector(".valuation-attempt-unit-3");
      const observations = row.querySelector(".valuation-observations");

      if (name) name.value = test.nombre || "";
      if (attempt1) attempt1.value = test.intento1 || "";
      if (attempt2) attempt2.value = test.intento2 || "";
      if (attempt3) attempt3.value = test.intento3 || "";
      if (unit1) unit1.value = test.unidad1 || test.unidad || "";
      if (unit2) unit2.value = test.unidad2 || test.unidad || "";
      if (unit3) unit3.value = test.unidad3 || test.unidad || "";
      if (observations) observations.value = test.observaciones || "";
    });

    refreshValuationNumbers();
  }

  const submitBtn = form?.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = "Actualizar valoración";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function valuationHasRegisteredData(test = {}) {
  return Boolean(
    String(test.intento1 || "").trim() ||
    String(test.intento2 || "").trim() ||
    String(test.intento3 || "").trim() ||
    String(test.observaciones || "").trim()
  );
}



function getValuationPdfChartGroupsForPatient(patientNickname) {
  return getValuationChartGroups(patientNickname)
    .map(group => ({
      ...group,
      days: [...(group.days || [])].sort((a, b) => valuationDateSortValue(a.fecha).localeCompare(valuationDateSortValue(b.fecha)))
    }))
    .filter(group => group.days.length);
}

function renderValuationPdfChart(group) {
  const days = group.days || [];
  if (!days.length) return "";

  const allValues = days.flatMap(day => [...day.attempts, day.mean]);
  const minRaw = Math.min(...allValues);
  const maxRaw = Math.max(...allValues);
  const rangeRaw = maxRaw - minRaw || 1;
  const min = minRaw - rangeRaw * 0.10;
  const max = maxRaw + rangeRaw * 0.16;
  const range = max - min || 1;

  const width = 720;
  const height = 235;
  const padX = 34;
  const padY = 38;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const yForValue = value => height - padY - (((value - min) / range) * chartH);

  const maxAttempts = Math.max(...days.map(day => day.attempts.length), 1);
  const daySlot = days.length === 1 ? chartW * 0.42 : Math.min(72, chartW / Math.max(days.length, 1));
  const barGap = 5;
  const barWidth = Math.max(8, Math.min(15, (daySlot - (maxAttempts - 1) * barGap) / maxAttempts));
  const maxGroupW = maxAttempts * barWidth + (maxAttempts - 1) * barGap;
  const groupHalf = (maxGroupW / 2) + 5;
  const leftCenter = padX + groupHalf;
  const rightCenter = width - padX - groupHalf;
  const usableCenterW = Math.max(1, rightCenter - leftCenter);
  const xForDay = index => days.length === 1 ? width / 2 : leftCenter + (index * (usableCenterW / (days.length - 1)));

  const meanPoints = days.map((day, index) => ({ ...day, x: xForDay(index), y: yForValue(day.mean) }));
  const meanPolyline = meanPoints.map(point => `${point.x},${point.y}`).join(" ");
  const oldest = meanPoints[0];
  const newest = meanPoints[meanPoints.length - 1];
  const trend = Number((newest.mean - oldest.mean).toFixed(2));
  const trendLabel = trend > 0 ? `+${trend}` : String(trend);
  const trendPct = oldest.mean ? Number(((trend / oldest.mean) * 100).toFixed(2)) : 0;
  const trendPctLabel = trendPct > 0 ? `+${trendPct}%` : `${trendPct}%`;
  const yTicks = [(maxRaw + minRaw) / 2].map(value => Number(value.toFixed(2)));
  const trendClass = trend > 0 ? "trend-up" : trend < 0 ? "trend-down" : "trend-flat";
  const trendArrow = trend > 0 ? "↑" : trend < 0 ? "↓" : "→";

  return `
    <section class="pdf-chart-card">
      <div class="pdf-chart-title">
        <div>
          <h2>${escapeValuationHtml(group.testName)}${group.unit ? ` (${escapeValuationHtml(group.unit)})` : ""}</h2>
          <p>Fechas ordenadas de más antigua a más reciente · barras: intentos individuales · línea: media diaria</p>
        </div>
        <strong>${escapeValuationHtml(formatValuationChartNumber(newest.mean, 2))}${group.unit ? ` ${escapeValuationHtml(group.unit)}` : ""}</strong>
      </div>

      <svg class="pdf-chart" viewBox="0 0 ${width} ${height}">
        ${yTicks.map(tick => {
          const y = yForValue(tick);
          return `<line x1="${padX}" y1="${y}" x2="${width - padX}" y2="${y}" class="pdf-grid" />`;
        }).join("")}

        <line x1="${padX}" y1="${height - padY}" x2="${width - padX}" y2="${height - padY}" class="pdf-axis" />

        ${days.map((day, dayIndex) => {
          const centerX = xForDay(dayIndex);
          const totalBarsW = day.attempts.length * barWidth + (day.attempts.length - 1) * barGap;
          const startX = centerX - totalBarsW / 2;

          return day.attempts.map((value, attemptIndex) => {
            const x = startX + attemptIndex * (barWidth + barGap);
            const y = yForValue(value);
            const h = Math.max(2, height - padY - y);
            return `
              <rect class="pdf-bar" x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="4">
                <title>${escapeValuationHtml(day.fecha)} · Intento ${attemptIndex + 1}: ${escapeValuationHtml(String(value))}${group.unit ? ` ${escapeValuationHtml(group.unit)}` : ""}</title>
              </rect>
              <text x="${x + (barWidth / 2)}" y="${height - padY - 5}" text-anchor="middle" class="pdf-bar-value" textLength="${Math.max(6, barWidth - 3)}" lengthAdjust="spacingAndGlyphs">${escapeValuationHtml(formatValuationChartNumber(value, 2))}</text>
            `;
          }).join("");
        }).join("")}

        <polyline points="${meanPolyline}" class="pdf-mean-line" fill="none" />

        ${meanPoints.map(point => `
          <circle class="pdf-mean-point" cx="${point.x}" cy="${point.y}" r="5.5"></circle>
          <text class="pdf-mean-value" x="${Math.max(padX + 4, point.x - 10)}" y="${Math.max(14, point.y - 10)}" text-anchor="end">${escapeValuationHtml(formatValuationChartNumber(point.mean, 2))}</text>
        `).join("")}

        ${meanPoints.map((point, index) => {
          if (days.length > 8 && index !== 0 && index !== days.length - 1) return "";
          return `<text x="${point.x}" y="${height - 8}" text-anchor="middle" class="pdf-date">${escapeValuationHtml(point.fecha)}</text>`;
        }).join("")}
      </svg>

      <div class="pdf-chart-summary">
        <div><span>Inicial</span><b>${escapeValuationHtml(formatValuationChartNumber(oldest.mean, 2))}${group.unit ? ` ${escapeValuationHtml(group.unit)}` : ""}</b><small>${escapeValuationHtml(oldest.fecha)}</small></div>
        <div><span>Actual</span><b>${escapeValuationHtml(formatValuationChartNumber(newest.mean, 2))}${group.unit ? ` ${escapeValuationHtml(group.unit)}` : ""}</b><small>${escapeValuationHtml(newest.fecha)}</small></div>
        <div class="pdf-trend-kpi ${trendClass}"><span>Tendencia</span><i class="pdf-trend-arrow">${trendArrow}</i><b>${escapeValuationHtml(formatValuationChartNumber(trend, 2).replace(/^([^\-])/, trend > 0 ? "+$1" : "$1"))}${group.unit ? ` ${escapeValuationHtml(group.unit)}` : ""}</b><small>${escapeValuationHtml(trendPctLabel)}</small></div>
      </div>
    </section>
  `;
}

function generateValuationPDF(id) {
  const item = valoraciones.find(value => value.id === id);
  if (!item) return;
  const tests = (item.tests || []).filter(valuationHasRegisteredData);
  if (!tests.length) {
    alert("Esta valoración no tiene datos registrados para generar PDF.");
    return;
  }
  const patient = patients.find(p => p.nickname === item.patientNickname);
  openValuationPdfWindow({
    title: "Informe de valoración",
    subtitle: `${patient ? `${patient.nombre} · @${patient.nickname}` : item.patientNickname} · ${item.fecha || "-"}`,
    patient,
    items: [item],
    includeAllPatientCharts: false
  });
}


function deleteValuation(id) {
  if (!confirm("¿Eliminar esta valoración?")) return;
  valoraciones = valoraciones.filter(item => item.id !== id);
  if (editingValuationId === id) editingValuationId = null;
  localStorage.setItem("valoraciones", JSON.stringify(valoraciones));

  if (window.PPF_SUPABASE && typeof window.PPF_SUPABASE.pushKey === "function") {
    window.PPF_SUPABASE.pushKey("valoraciones").catch(error => console.warn("No se pudo sincronizar valoraciones:", error));
  }

  renderValuationsList(document.getElementById("valuationsFilter")?.value || "");
  renderValuationCharts(document.getElementById("valuationsFilter")?.value || "");
}



/* =========================================================
   PPF PRO · DASHBOARD ADMIN COMERCIAL
   ========================================================= */
function pmDashboardOnlineUsers() {
  let stats = {};
  try { stats = JSON.parse(localStorage.getItem("userStats") || "{}"); } catch (_) {}
  return patients.filter(patient => {
    const stat = typeof pmGetMergedUserStat === "function" ? pmGetMergedUserStat(stats, patient) : stats[patient.nickname];
    return window.PPF_PRESENCE?.isOnline ? window.PPF_PRESENCE.isOnline(stat || {}) : Boolean(stat?.online);
  }).length;
}

function pmDashboardGreeting() {
  const hour = new Date().getHours();
  if (hour < 13) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

function pmAdminDashboardHTML() {
  const agenda = typeof pmSessionAgenda === "function" ? pmSessionAgenda() : { pending: [], done: [] };
  const online = pmDashboardOnlineUsers();
  const latestPending = agenda.pending.slice(0, 5);
  const adminLabel = currentUser?.nombre || currentUser?.name || currentUser?.nickname || "Preparador";
  const todayLabel = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const completedToday = agenda.done.filter(item => {
    const stamp = item.session?.completedAt || item.session?.finishedAt || item.session?.updatedAt;
    if (!stamp) return false;
    const date = new Date(stamp);
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  }).length;
  const safeDate = raw => {
    if (!raw) return "Sin fecha";
    const d = new Date(`${raw}T12:00:00`);
    return Number.isNaN(d.getTime()) ? raw : new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short" }).format(d);
  };
  const initials = name => String(name || "P").trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase();
  return `
    <div class="admin-home-dashboard admin-home-pro">
      <section class="admin-home-hero admin-home-hero-pro">
        <div class="admin-home-hero-copy">
          <div class="admin-home-kicker-row">
            <span class="admin-home-live-dot"></span>
            <p class="admin-home-kicker">CENTRO DE CONTROL</p>
          </div>
          <h2>${pmDashboardGreeting()}, <span>${adminLabel}</span></h2>
          <p class="admin-home-date" id="pmDashboardDateTime">
            <span aria-hidden="true">📅</span>
            <span>${todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1)}</span>
            <span class="admin-home-date-separator" aria-hidden="true">·</span>
            <span aria-hidden="true">🕒</span>
            <time id="pmDashboardClock" datetime="">--:--</time>
          </p>
          <p class="admin-home-subtitle">Tu equipo, tus sesiones y la actividad de hoy, en un solo vistazo.</p>
        </div>
        <div class="admin-home-hero-side">
          <div class="admin-home-today-summary">
            <span style="font-size:.82em">📅 A DÍA DE HOY</span>
            <strong>${completedToday}</strong>
            <small>sesiones terminadas</small>
          </div>
          <button type="button" class="admin-home-primary" data-home-section="sesiones">
            <span>＋</span><b>Nueva sesión</b>
          </button>
        </div>
      </section>

      <section class="admin-home-stats" aria-label="Resumen del preparador">
        <button type="button" class="admin-home-stat admin-home-stat-patients" data-home-section="paciente">
          <span class="admin-home-stat-icon">👥</span>
          <span class="admin-home-stat-copy"><small>Pacientes activos</small><strong>${patients.length}</strong><em>Gestionar pacientes</em></span>
          <span class="admin-home-stat-arrow">↗</span>
        </button>
        <button type="button" class="admin-home-stat admin-home-stat-sessions" data-home-section="sesiones">
          <span class="admin-home-stat-icon">🏋️</span>
          <span class="admin-home-stat-copy"><small>Sesiones pendientes</small><strong>${agenda.pending.length}</strong><em>Ver agenda activa</em></span>
          <span class="admin-home-stat-arrow">↗</span>
        </button>
        <button type="button" class="admin-home-stat admin-home-stat-valuations" data-home-section="valoraciones">
          <span class="admin-home-stat-icon">📊</span>
          <span class="admin-home-stat-copy"><small>Valoraciones</small><strong>${valoraciones.length}</strong><em>Revisar evolución</em></span>
          <span class="admin-home-stat-arrow">↗</span>
        </button>
        <button type="button" class="admin-home-stat admin-home-stat-online" data-home-section="usuarios">
          <span class="admin-home-stat-icon">●</span>
          <span class="admin-home-stat-copy"><small>Conectados ahora</small><strong>${online}</strong><em>Presencia en tiempo real</em></span>
          <span class="admin-home-stat-arrow">↗</span>
        </button>
      </section>

      <section class="admin-home-layout">
        <article class="admin-home-panel admin-home-actions-panel">
          <div class="admin-home-panel-head">
            <div><small>ACCIONES RÁPIDAS</small><h3>¿Qué quieres hacer?</h3></div>
            <span class="admin-home-panel-badge">6 accesos</span>
          </div>
          <div class="admin-home-actions">
            <button type="button" data-home-section="sesiones"><span>🏋️</span><b>Crear sesión</b><small>Preparar entrenamiento</small><i>›</i></button>
            <button type="button" data-home-section="paciente"><span>👤</span><b>Nuevo paciente</b><small>Alta y ficha personal</small><i>›</i></button>
            <button type="button" data-home-section="valoraciones"><span>📈</span><b>Nueva valoración</b><small>Registrar pruebas</small><i>›</i></button>
            <button type="button" data-home-section="biblioteca"><span>📚</span><b>Biblioteca</b><small>Ejercicios y recursos</small><i>›</i></button>
            <button type="button" data-home-section="graficaPro"><span>🏆</span><b>Centro de Rendimiento</b><small>Analizar planificación</small><i>›</i></button>
            <button type="button" data-home-section="agenda"><span>📅</span><b>Agenda PRO</b><small>Semana y horarios</small><i>›</i></button>
            <button type="button" data-home-section="periodicidad"><span>📆</span><b>Periodicidad</b><small>Planificación anual</small><i>›</i></button>
          </div>
        </article>

        <article class="admin-home-panel admin-home-pending">
          <div class="admin-home-panel-head">
            <div><small>AGENDA ACTIVA</small><h3>Próximas sesiones</h3></div>
            <button type="button" data-home-section="sesiones">Ver todas <span>→</span></button>
          </div>
          <div class="admin-home-session-list">
            ${latestPending.length ? latestPending.map((item, index) => {
              const name = item.patient?.nombre || item.session?.patientName || item.session?.patientNickname || "Paciente";
              const sessionNumber = item.session?.numero || item.session?.number || item.session?.sessionNumber;
              return `
              <button type="button" data-home-section="sesiones" class="admin-home-session-item">
                <span class="admin-home-avatar">${initials(name)}</span>
                <span class="admin-home-session-copy">
                  <b>${name}</b>
                  <small>${sessionNumber ? `Sesión ${sessionNumber} · ` : ""}${pmSessionMicroLabel(item.session)}</small>
                </span>
                <span class="admin-home-session-date"><b>${safeDate(item.session?.fecha || item.session?.date)}</b><small>${index === 0 ? "Próxima" : "Pendiente"}</small></span>
                <i>›</i>
              </button>`;
            }).join("") : `<div class="admin-home-empty"><span>✓</span><b>Agenda al día</b><small>No hay sesiones pendientes.</small></div>`}
          </div>
          ${agenda.pending.length > latestPending.length ? `<button type="button" class="admin-home-more-sessions" data-home-section="sesiones">+${agenda.pending.length - latestPending.length} sesiones pendientes</button>` : ""}
        </article>
      </section>
    </div>`;
}

function pmBindAdminDashboard() {
  contentArea.querySelectorAll("[data-home-section]").forEach(button => {
    button.addEventListener("click", () => {
      const key = button.dataset.homeSection;
      pmNavigateAdmin(key);
    });
  });

  const updateDashboardClock = () => {
    const clock = document.getElementById("pmDashboardClock");
    if (!clock) return false;
    const now = new Date();
    clock.textContent = new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(now);
    clock.dateTime = now.toISOString();
    return true;
  };

  updateDashboardClock();
  const delayToNextMinute = 60000 - (Date.now() % 60000) + 80;
  const minuteTimeout = window.setTimeout(() => {
    if (!updateDashboardClock()) return;
    const minuteInterval = window.setInterval(() => {
      if (!updateDashboardClock()) window.clearInterval(minuteInterval);
    }, 60000);
  }, delayToNextMinute);

  window.addEventListener("pagehide", () => window.clearTimeout(minuteTimeout), { once: true });
}



/* =========================================================
   AGENDA PRO MASTER v1 · vista semanal sobre sessions
   Una sola fuente de verdad: las sesiones existentes.
   ========================================================= */
let agendaProWeekAnchor = agendaProStartOfWeek(new Date());
let agendaProSelectedSessionId = null;
let agendaProDraggedSessionId = null;
let agendaProTouchDrag = null;
let agendaProSuppressClickUntil = 0;
let agendaProViewMode = "calendar";
let agendaProWorkspacePatient = "";

function agendaProEscape(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function agendaProStartOfWeek(value) {
  const date = value instanceof Date ? new Date(value) : new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return agendaProStartOfWeek(new Date());
  date.setHours(12, 0, 0, 0);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date;
}

function agendaProIsoDate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function agendaProAddDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function agendaProWeekDays() {
  return Array.from({ length: 7 }, (_, index) => agendaProAddDays(agendaProWeekAnchor, index));
}

function agendaProSessionDateTime(session = {}) {
  const date = String(session.fecha || session.date || "");
  const time = String(session.scheduledTime || "").trim();
  if (!date) return 0;
  const stamp = new Date(`${date}T${time || "23:59"}:00`).getTime();
  return Number.isFinite(stamp) ? stamp : 0;
}

function agendaProRawStatus(session = {}) {
  return String(session.agendaStatus || session.status || session.estado || "").trim().toLowerCase();
}

function agendaProIsClosedWithoutTime(session = {}) {
  const hasTime = Boolean(String(session.scheduledTime || session.time || "").trim());
  if (hasTime) return false;
  const status = agendaProRawStatus(session);
  const cancelled = ["cancelled", "cancelada", "cancelado"].includes(status);
  const completed = nciIsCompleted(session) || ["completed", "terminada", "terminado"].includes(status) || session.completed === true || session.terminada === true;
  return cancelled || completed;
}

function agendaProScheduleMode(session = {}) {
  return window.PPF_CORE?.flexible?.(session, window.PPF_CORE.array("completedSessions")) ? "flexible" : "scheduled";
}

function agendaProIsFlexible(session = {}) {
  return agendaProScheduleMode(session) === "flexible";
}

function agendaProNeedsTime(session = {}) {
  return window.PPF_CORE?.needsTime?.(session, window.PPF_CORE.array("completedSessions")) ?? true;
}

function agendaProStatus(session = {}) {
  const core = window.PPF_CORE;
  if (core) {
    const state = core.lifecycle(session, core.array("completedSessions"));
    if (state === "cancelled" || state === "completed") return state;
    if (core.isOverdue(session, core.array("completedSessions"))) return "late";
    return "scheduled";
  }
  return "scheduled";
}

function agendaProStatusMeta(status) {
  return {
    scheduled: { label: "Preparada", icon: "●" },
    completed: { label: "Terminada", icon: "✓" },
    cancelled: { label: "Cancelada", icon: "×" },
    late: { label: "Atrasada", icon: "!" }
  }[status] || { label: "Preparada", icon: "●" };
}

function agendaProPatient(session = {}) {
  const key = nciSessionPatient(session);
  return patients.find(patient => nciNickname(patient.nickname) === key) || {
    nombre: session.patientName || session.nombrePaciente || session.patientNickname || "Paciente",
    nickname: session.patientNickname || ""
  };
}

function agendaProSort(a = {}, b = {}) {
  const timeA = String(a.scheduledTime || "99:99");
  const timeB = String(b.scheduledTime || "99:99");
  if (timeA !== timeB) return timeA.localeCompare(timeB);
  const micro = nciSessionMicro(a) - nciSessionMicro(b);
  if (micro !== 0) return micro;
  return Number(a.subsessionOrder || a.dayOrder || 1) - Number(b.subsessionOrder || b.dayOrder || 1);
}

function agendaProFilteredSessions() {
  const patient = document.getElementById("agendaProPatientFilter")?.value || "";
  const kind = document.getElementById("agendaProKindFilter")?.value || "";
  const status = document.getElementById("agendaProStatusFilter")?.value || "";
  const query = String(document.getElementById("agendaProSearch")?.value || "").trim().toLowerCase();
  const source = window.PPF_CORE?.normalizedContext?.().sessions || sessions;
  return source.filter(session => {
    if (patient && nciSessionPatient(session) !== nciNickname(patient)) return false;
    if (kind && nciSessionKind(session) !== kind) return false;
    if (status && agendaProStatus(session) !== status) return false;
    if (query) {
      const person = agendaProPatient(session);
      const haystack = `${person.nombre || ""} ${person.nickname || ""} ${nciDisplayNumber(session)} ${nciSessionMicro(session)}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}


function agendaProTimeToMinutes(value = "") {
  const match = String(value || "").match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return Math.max(0, Math.min(1439, Number(match[1]) * 60 + Number(match[2])));
}

function agendaProMinutesToTime(value) {
  const minutes = Math.max(0, Math.min(1439, Math.round(Number(value || 0) / 5) * 5));
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function agendaProDropTime(daySessions = [], index = 0) {
  const timed = daySessions.map(session => agendaProTimeToMinutes(session.scheduledTime)).filter(value => value !== null);
  if (!timed.length) return "09:00";
  if (index <= 0) return agendaProMinutesToTime(Math.max(360, timed[0] - 30));
  if (index >= timed.length) return agendaProMinutesToTime(Math.min(1320, timed[timed.length - 1] + 60));
  return agendaProMinutesToTime((timed[index - 1] + timed[index]) / 2);
}

function agendaProDropZone(date, time, index, label = "Soltar aquí") {
  return `<div class="agenda-pro-drop-slot" data-agenda-drop-date="${agendaProEscape(date)}" data-agenda-drop-time="${agendaProEscape(time)}" data-agenda-drop-index="${index}"><span>${agendaProEscape(time)}</span><i>${agendaProEscape(label)}</i></div>`;
}

function agendaProDayList(date, daySessions = []) {
  if (!daySessions.length) return `${agendaProDropZone(date, "09:00", 0, "Programar a las 09:00")}<div class="agenda-pro-day-empty"><span>＋</span><small>Sin sesiones</small></div>`;
  const parts = [];
  daySessions.forEach((session, index) => {
    parts.push(agendaProDropZone(date, agendaProDropTime(daySessions, index), index));
    parts.push(agendaProCard(session));
  });
  parts.push(agendaProDropZone(date, agendaProDropTime(daySessions, daySessions.length), daySessions.length));
  return parts.join("");
}

async function agendaProMoveSession(sessionId, targetDate, targetTime = "", targetIndex = null) {
  const session = sessions.find(item => String(item.id) === String(sessionId));
  if (!session || !targetDate) return false;
  const previousPatient = session.patientNickname;
  const previousDate = String(session.fecha || "");
  const previousTime = String(session.scheduledTime || "");
  session.fecha = targetDate;
  if (targetTime) session.scheduledTime = targetTime;
  if (targetIndex !== null && Number.isFinite(Number(targetIndex))) session.agendaOrder = Number(targetIndex);
  session.reprogrammedAt = new Date().toISOString();
  session.updatedAt = session.reprogrammedAt;
  nciRenumberPatientSessions(previousPatient, { touchUpdatedAt: true, rebuildOrder: true });
  persistSessionsOnly();
  let synced = true;
  try {
    if (window.PPF_SUPABASE?.pushValue) synced = await window.PPF_SUPABASE.pushValue("sessions", sessions);
    else if (window.PPF_SUPABASE?.pushKey) synced = await window.PPF_SUPABASE.pushKey("sessions");
  } catch (error) {
    synced = false;
    console.error("Agenda PRO no pudo sincronizar la reprogramación:", error);
  }
  agendaProRenderWeek();
  const moved = document.querySelector(`[data-agenda-session-id="${CSS.escape(String(sessionId))}"]`);
  moved?.classList.add("agenda-pro-just-moved");
  window.setTimeout(() => moved?.classList.remove("agenda-pro-just-moved"), 650);
  if (!synced) alert("La sesión se reprogramó en este dispositivo, pero Supabase no confirmó la sincronización.");
  return previousDate !== targetDate || previousTime !== String(session.scheduledTime || "");
}

function agendaProClearDropTargets() {
  document.querySelectorAll(".agenda-pro-day.is-drop-target,.agenda-pro-drop-slot.is-drop-target").forEach(element => element.classList.remove("is-drop-target"));
}

function agendaProTargetFromPoint(x, y) {
  const element = document.elementFromPoint(x, y);
  return element?.closest?.("[data-agenda-drop-time],[data-agenda-drop-date]") || null;
}

function agendaProConflict(session = {}) {
  return window.PPF_CORE?.conflict?.(session) || false;
}


function agendaProPriority(session = {}) {
  const value = String(session.agendaPriority || "medium").toLowerCase();
  return ["high", "medium", "low"].includes(value) ? value : "medium";
}

function agendaProPriorityMeta(priority) {
  return {
    high: { label: "Alta", icon: "🔴", rank: 3 },
    medium: { label: "Media", icon: "🟡", rank: 2 },
    low: { label: "Baja", icon: "⚪", rank: 1 }
  }[priority] || { label: "Media", icon: "🟡", rank: 2 };
}

function agendaProDayIntelligence(date, daySessions = []) {
  const active = daySessions.filter(session => agendaProStatus(session) !== "cancelled");
  const kinds = {};
  active.forEach(session => {
    const meta = nciSessionKindMeta(session);
    const key = nciSessionKind(session);
    if (!kinds[key]) kinds[key] = { icon: meta.icon, count: 0 };
    kinds[key].count += 1;
  });
  const conflicts = active.filter(agendaProConflict).length;
  const withoutTime = active.filter(session => agendaProNeedsTime(session) && !String(session.scheduledTime || "").trim()).length;
  const high = active.filter(session => agendaProPriority(session) === "high").length;
  const loadLevel = active.length >= 8 ? "high" : active.length >= 5 ? "medium" : "light";
  return { total: active.length, conflicts, withoutTime, high, kinds, loadLevel, date };
}

function agendaProIntelligence(visibleSessions = []) {
  const weekStart = agendaProIsoDate(agendaProWeekDays()[0]);
  const weekEnd = agendaProIsoDate(agendaProWeekDays()[6]);
  const weekSessions = visibleSessions.filter(session => String(session.fecha || "") >= weekStart && String(session.fecha || "") <= weekEnd);
  const days = agendaProWeekDays().map(day => {
    const date = agendaProIsoDate(day);
    return agendaProDayIntelligence(date, weekSessions.filter(session => String(session.fecha || "") === date));
  });
  const warnings = [];
  const noTime = weekSessions.filter(session => session.fecha && agendaProNeedsTime(session) && !String(session.scheduledTime || "").trim() && agendaProStatus(session) !== "cancelled");
  const conflicts = weekSessions.filter(agendaProConflict);
  const late = weekSessions.filter(session => agendaProStatus(session) === "late");
  const highPriority = weekSessions.filter(session => agendaProPriority(session) === "high" && agendaProStatus(session) !== "completed" && agendaProStatus(session) !== "cancelled");
  const overloaded = days.filter(day => day.total >= 8);
  if (conflicts.length) warnings.push({ type: "conflict", icon: "⚠️", title: `${conflicts.length} conflicto${conflicts.length === 1 ? "" : "s"} horario${conflicts.length === 1 ? "" : "s"}`, detail: "Mismo cliente, fecha y hora", filter: "conflict" });
  if (noTime.length) warnings.push({ type: "time", icon: "⏱️", title: `${noTime.length} sesión${noTime.length === 1 ? "" : "es"} sin hora`, detail: "Asigna una franja para completar la agenda", filter: "without-time" });
  if (late.length) warnings.push({ type: "late", icon: "🔴", title: `${late.length} sesión${late.length === 1 ? "" : "es"} atrasada${late.length === 1 ? "" : "s"}`, detail: "Revisa o reprograma estas sesiones", filter: "late" });
  if (overloaded.length) warnings.push({ type: "load", icon: "📊", title: `${overloaded.length} día${overloaded.length === 1 ? "" : "s"} con carga alta`, detail: "8 o más sesiones programadas", filter: "overload" });
  if (highPriority.length) warnings.push({ type: "priority", icon: "⭐", title: `${highPriority.length} sesión${highPriority.length === 1 ? "" : "es"} de prioridad alta`, detail: "Revisión recomendada", filter: "priority" });
  return { weekSessions, days, warnings, noTime, conflicts, late, highPriority, overloaded };
}

function agendaProIntelligenceHTML(data) {
  const warnings = data.warnings || [];
  return `<section class="agenda-pro-intelligence ${warnings.length ? "has-warnings" : "is-clear"}" id="agendaProIntelligence">
    <div class="agenda-pro-intelligence-head">
      <div><p class="eyebrow">ATENCIÓN DE LA SEMANA</p><h3>${warnings.length ? "Agenda que requiere revisión" : "Todo bajo control"}</h3></div>
      <span>${warnings.length ? `${warnings.length} aviso${warnings.length === 1 ? "" : "s"}` : "✓ Sin incidencias"}</span>
    </div>
    <div class="agenda-pro-intelligence-grid">
      ${warnings.length ? warnings.map(item => `<button type="button" class="agenda-pro-alert agenda-pro-alert-${item.type}" data-agenda-intel-filter="${item.filter}"><i>${item.icon}</i><span><strong>${agendaProEscape(item.title)}</strong><small>${agendaProEscape(item.detail)}</small></span><b>›</b></button>`).join("") : `<div class="agenda-pro-intelligence-clear"><i>✅</i><span><strong>Semana organizada</strong><small>No hay conflictos, atrasos ni sesiones sin hora.</small></span></div>`}
    </div>
  </section>`;
}

function agendaProCard(session) {
  const patient = agendaProPatient(session);
  const kind = nciSessionKindMeta(session);
  const status = agendaProStatus(session);
  const statusMeta = agendaProStatusMeta(status);
  const duration = Math.max(0, Number(session.durationMinutes || 0));
  const conflict = agendaProConflict(session);
  const priority = agendaProPriority(session);
  const priorityMeta = agendaProPriorityMeta(priority);
  const flexible = agendaProIsFlexible(session);
  return `
    <article class="agenda-pro-session agenda-pro-status-${status} agenda-pro-priority-${priority} ${flexible ? "is-flexible" : ""} ${conflict ? "has-conflict" : ""}" draggable="true" tabindex="0" data-agenda-session-id="${agendaProEscape(session.id)}">
      <div class="agenda-pro-session-time">
        <strong>${agendaProEscape(flexible ? "Horario flexible" : (session.scheduledTime || "Sin hora"))}</strong>
        ${duration ? `<small>${duration} min</small>` : `<small>Duración pendiente</small>`}
      </div>
      <div class="agenda-pro-session-main">
        <div class="agenda-pro-session-title">
          <span class="agenda-pro-kind-icon">${kind.icon}</span>
          <div><strong>${agendaProEscape(patient.nombre)}</strong><small>@${agendaProEscape(patient.nickname || session.patientNickname || "")}</small></div>
        </div>
        <div class="agenda-pro-session-meta">
          <span>Sesión ${agendaProEscape(nciDisplayNumber(session))}</span>
          <span>Micro ${agendaProEscape(nciSessionMicro(session) || "-")}</span>
          <span class="agenda-pro-state"><i>${statusMeta.icon}</i>${statusMeta.label}</span>
          <span class="agenda-pro-priority"><i>${priorityMeta.icon}</i>${priorityMeta.label}</span>
          ${flexible ? `<span class="agenda-pro-flexible">🌐 Online · flexible</span>` : ""}
          ${conflict ? `<span class="agenda-pro-conflict">⚠ Conflicto</span>` : ""}
        </div>
      </div>
      <button type="button" class="agenda-pro-edit-btn" data-agenda-edit="${agendaProEscape(session.id)}">Editar</button>
    </article>`;
}

function agendaProWeekNumber(date = new Date()) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
}


function agendaProDelayedSessions() {
  return sessions
    .filter(session => agendaProStatus(session) === "late")
    .sort((a, b) => {
      const stamp = agendaProSessionDateTime(a) - agendaProSessionDateTime(b);
      if (stamp !== 0) return stamp;
      return String(agendaProPatient(a).nombre || "").localeCompare(String(agendaProPatient(b).nombre || ""), "es");
    });
}

function agendaProDelayedKpiHTML(delayed = []) {
  const count = delayed.length;
  const visible = delayed.slice(0, 8);
  const tone = count === 0 ? "is-clear" : count <= 3 ? "is-warning" : "is-danger";
  const list = count
    ? visible.map(session => {
        const patient = agendaProPatient(session);
        const date = session.fecha
          ? new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${session.fecha}T12:00:00`))
          : "Sin fecha";
        return `<button type="button" class="agenda-pro-delayed-item" data-agenda-delayed-session="${agendaProEscape(session.id)}"><span><strong>${agendaProEscape(patient.nombre || "Paciente")}</strong><small>Sesión ${agendaProEscape(nciDisplayNumber(session))} · ${agendaProEscape(date)}</small></span><b>›</b></button>`;
      }).join("") + (count > visible.length ? `<p class="agenda-pro-delayed-more">＋ ${count - visible.length} más</p>` : "")
    : `<div class="agenda-pro-delayed-empty"><span>✅</span><strong>Todo al día</strong><small>No hay sesiones retrasadas.</small></div>`;

  return `<article class="agenda-pro-delayed-kpi ${tone}" id="agendaProDelayedKpi" role="button" tabindex="0" aria-haspopup="dialog" aria-expanded="false">
    <span>⏰</span><div><small>Retrasadas</small><strong>${count}</strong></div>
    <div class="agenda-pro-delayed-tooltip" role="dialog" aria-label="Listado de sesiones retrasadas">
      <header><div><small>REVISIÓN RÁPIDA</small><strong>Sesiones retrasadas</strong></div><em>${count}</em></header>
      <div class="agenda-pro-delayed-list">${list}</div>
      ${count ? `<footer>Selecciona una sesión para abrir el Inspector MASTER.</footer>` : ""}
    </div>
  </article>`;
}

function agendaProHTML() {
  const weekDays = agendaProWeekDays();
  const weekStart = agendaProIsoDate(weekDays[0]);
  const weekEnd = agendaProIsoDate(weekDays[6]);
  const all = sessions.slice();
  const weekSessions = all.filter(session => String(session.fecha || "") >= weekStart && String(session.fecha || "") <= weekEnd);
  const clientKeys = new Set(weekSessions.map(session => pmNormalizeNickname(session.patientNickname || session.nickname || session.patient || session.cliente || "")).filter(Boolean));
  const doubleGroups = new Map();
  weekSessions.forEach(session => {
    const key = `${pmNormalizeNickname(session.patientNickname || session.nickname || session.patient || session.cliente || "")}|${String(session.fecha || "")}|${String(nciSessionMicro(session) || "")}`;
    doubleGroups.set(key, (doubleGroups.get(key) || 0) + 1);
  });
  const doubleCount = [...doubleGroups.values()].filter(count => count > 1).length;
  const withoutTime = weekSessions.filter(session => session.fecha && agendaProNeedsTime(session) && !String(session.scheduledTime || "").trim()).length;
  const delayedSessions = agendaProDelayedSessions();
  const monthLabel = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(weekDays[0]);
  const endLabel = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" }).format(weekDays[6]);
  const weekNumber = agendaProWeekNumber(weekDays[0]);
  return `
    <div class="agenda-pro agenda-pro-v2 agenda-pro-v3" id="agendaProRoot">
      <section class="agenda-pro-hero agenda-pro-hero-compact">
        <div class="agenda-pro-title-block"><p class="eyebrow">CENTRO DE PLANIFICACIÓN</p><h2>📅 Agenda PRO</h2></div>
        <div class="agenda-pro-hero-range"><small>SEMANA ${weekNumber}</small><strong>${monthLabel} — ${endLabel}</strong></div>
      </section>

      <section class="agenda-pro-kpis agenda-pro-kpis-compact">
        <article><span>📅</span><div><small>Sesiones</small><strong>${weekSessions.length}</strong></div></article>
        <article><span>👥</span><div><small>Clientes</small><strong>${clientKeys.size}</strong></div></article>
        <article><span>⇄</span><div><small>Dobles</small><strong>${doubleCount}</strong></div></article>
        <article><span>⏱️</span><div><small>Sin hora</small><strong>${withoutTime}</strong></div></article>
        ${agendaProDelayedKpiHTML(delayedSessions)}
      </section>

      <section class="agenda-pro-view-switch" aria-label="Modo de Agenda PRO">
        <button type="button" id="agendaProCalendarMode" class="${agendaProViewMode === "calendar" ? "is-active" : ""}"><span>📅</span> Calendario</button>
        <button type="button" id="agendaProClientMode" class="${agendaProViewMode === "client" ? "is-active" : ""}"><span>👤</span> Cliente</button>
      </section>

      <section class="agenda-pro-toolbar" id="agendaProCalendarToolbar">
        <div class="agenda-pro-week-nav">
          <button type="button" id="agendaProPrevWeek" aria-label="Semana anterior">←</button>
          <button type="button" id="agendaProToday">Hoy</button>
          <button type="button" id="agendaProNextWeek" aria-label="Semana siguiente">→</button>
          <input type="date" id="agendaProAnchorDate" value="${agendaProIsoDate(agendaProWeekAnchor)}" aria-label="Seleccionar semana">
        </div>
        <div class="agenda-pro-filters">
          <input type="search" id="agendaProSearch" placeholder="Buscar cliente o sesión..." aria-label="Buscar en agenda">
          <select id="agendaProPatientFilter"><option value="">Todos los clientes</option>${patients.map(p => `<option value="${agendaProEscape(p.nickname)}">${agendaProEscape(p.nombre)}</option>`).join("")}</select>
          <select id="agendaProKindFilter"><option value="">Todas las actividades</option>${Object.entries(PPF_SESSION_KINDS).map(([key, meta]) => `<option value="${key}">${meta.icon} ${meta.label}</option>`).join("")}</select>
          <select id="agendaProStatusFilter"><option value="">Todos los estados</option><option value="scheduled">Preparadas</option><option value="completed">Terminadas</option><option value="late">Atrasadas</option><option value="cancelled">Canceladas</option></select>
        </div>
      </section>

      <section class="agenda-client-workspace" id="agendaClientWorkspace" hidden></section>
      <section id="agendaProIntelligenceMount"></section>
      <section class="agenda-pro-today" id="agendaProTodayProgress"></section>
      <section class="agenda-pro-week" id="agendaProWeek"></section>
      <section class="agenda-pro-unassigned" id="agendaProUnassigned"></section>
      <aside class="agenda-pro-editor agenda-pro-inspector" id="agendaProEditor" hidden></aside>
      <div class="agenda-pro-inspector-backdrop" id="agendaProInspectorBackdrop" hidden></div>
    </div>`;
}


function agendaWorkspacePatientKey() {
  return agendaProWorkspacePatient ? nciNickname(agendaProWorkspacePatient) : "";
}

function agendaWorkspaceSessions(patientKey) {
  const core = window.PPF_CORE;
  return core ? core.forPatient(patientKey).sort(core.chronological) : [];
}

function agendaWorkspaceSessionCard(session) {
  const kind = nciSessionKindMeta(session);
  const status = agendaProStatus(session);
  const meta = agendaProStatusMeta(status);
  const priority = agendaProPriorityMeta(agendaProPriority(session));
  const date = session.fecha ? new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${session.fecha}T12:00:00`)) : "Sin fecha";
  return `<button type="button" class="agenda-workspace-session agenda-workspace-status-${status}" data-agenda-workspace-session="${agendaProEscape(session.id)}">
    <span class="agenda-workspace-node">${kind.icon}</span>
    <span class="agenda-workspace-copy"><strong>Sesión ${agendaProEscape(nciDisplayNumber(session))}</strong><small>${agendaProEscape(kind.label)} · Micro ${agendaProEscape(nciSessionMicro(session) || "-")}</small><em>${agendaProEscape(date)}${agendaProIsFlexible(session) ? " · Horario flexible" : (session.scheduledTime ? ` · ${agendaProEscape(session.scheduledTime)}` : " · Sin hora")}</em></span>
    <span class="agenda-workspace-state"><i>${meta.icon}</i>${agendaProEscape(meta.label)}<small>${priority.icon} ${agendaProEscape(priority.label)}</small></span>
    <b>›</b>
  </button>`;
}

function agendaWorkspaceRender() {
  const mount = document.getElementById("agendaClientWorkspace");
  if (!mount) return;
  const key = agendaWorkspacePatientKey();
  const patientOptions = patients.map(item => `<option value="${agendaProEscape(item.nickname)}">${agendaProEscape(item.nombre)}</option>`).join("");

  if (!key) {
    mount.innerHTML = `<div class="agenda-workspace-head agenda-workspace-head-empty">
      <div class="agenda-workspace-person"><span>👤</span><div><p class="eyebrow">CLIENT WORKSPACE</p><h2>Selecciona un cliente</h2><small>Elige un cliente para consultar su planificación completa.</small></div></div>
      <div class="agenda-workspace-selector"><label>Cliente<div class="agenda-workspace-select-shell"><select id="agendaWorkspacePatient"><option value="" selected disabled>Selecciona un cliente</option>${patientOptions}</select></div></label><button type="button" id="agendaWorkspaceNewSession" disabled>＋ Nueva sesión</button></div>
    </div>
    <section class="agenda-workspace-body agenda-workspace-welcome">
      <div class="agenda-workspace-empty"><span>👤</span><h3>Elige un cliente</h3><p>Al seleccionarlo aparecerán sus sesiones, próxima planificación, cumplimiento y línea temporal.</p></div>
    </section>`;
    document.getElementById("agendaWorkspacePatient")?.addEventListener("change", event => {
      agendaProWorkspacePatient = event.target.value;
      agendaWorkspaceRender();
    });
    return;
  }

  agendaProWorkspacePatient = key;
  const patient = patients.find(item => nciNickname(item.nickname) === key);
  if (!patient) {
    agendaProWorkspacePatient = "";
    agendaWorkspaceRender();
    return;
  }
  const coreSummary = window.PPF_CORE?.summary?.(key) || { sessions: [], completedSessions: [], pendingSessions: [], cancelledSessions: [], withoutTime: 0, compliance: 0, nextSession: null, currentMicro: 0 };
  const all = coreSummary.sessions;
  const completed = coreSummary.completedSessions;
  const pending = coreSummary.pendingSessions;
  const cancelled = coreSummary.cancelledSessions;
  const noTime = coreSummary.withoutTime;
  const compliance = coreSummary.compliance;
  const next = coreSummary.nextSession;
  const currentMicro = coreSummary.currentMicro;
  const grouped = new Map();
  all.forEach(session => {
    const micro = nciSessionMicro(session) || 0;
    if (!grouped.has(micro)) grouped.set(micro, []);
    grouped.get(micro).push(session);
  });
  const timeline = [...grouped.entries()].sort((a,b)=>b[0]-a[0]).map(([micro, list]) => `<section class="agenda-workspace-micro"><header class="agenda-workspace-micro-badge" aria-label="Micro ${agendaProEscape(micro || "-")}, ${list.length} sesión${list.length===1?"":"es"}"><span>M${agendaProEscape(micro || "-")}</span><small>×${list.length}</small></header><div>${list.slice().sort((a,b)=>agendaProSessionDateTime(b)-agendaProSessionDateTime(a) || Number(b.subsessionOrder||1)-Number(a.subsessionOrder||1)).map(agendaWorkspaceSessionCard).join("")}</div></section>`).join("");
  mount.innerHTML = `<div class="agenda-workspace-head">
      <div class="agenda-workspace-person"><span>${agendaProEscape((patient.nombre || patient.nickname || "?").trim().charAt(0).toUpperCase())}</span><div><p class="eyebrow">CLIENT WORKSPACE</p><h2>${agendaProEscape(patient.nombre)}</h2><small>@${agendaProEscape(patient.nickname || "")} · Micro actual ${agendaProEscape(currentMicro || "-")}</small></div></div>
      <div class="agenda-workspace-selector"><label>Cliente<div class="agenda-workspace-select-shell has-close"><select id="agendaWorkspacePatient"><option value="" disabled>Selecciona un cliente</option>${patients.map(item=>`<option value="${agendaProEscape(item.nickname)}" ${nciNickname(item.nickname)===key?"selected":""}>${agendaProEscape(item.nombre)}</option>`).join("")}</select><button type="button" id="agendaWorkspaceClear" class="agenda-workspace-close" aria-label="Cerrar cliente" data-tooltip="Cerrar cliente"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div></label><button type="button" id="agendaWorkspaceNewSession">＋ Nueva sesión</button></div>
    </div>
    <section class="agenda-workspace-summary">
      <article><span>📅</span><div><small>Sesiones</small><strong>${all.length}</strong></div></article>
      <article><span>✅</span><div><small>Terminadas</small><strong>${completed.length}</strong></div></article>
      <article><span>⏳</span><div><small>Pendientes</small><strong>${pending.length}</strong></div></article>
      <article><span>📈</span><div><small>Cumplimiento</small><strong>${compliance}%</strong></div></article>
    </section>
    <section class="agenda-workspace-focus">
      <div class="agenda-workspace-next-copy"><p class="eyebrow">PRÓXIMA SESIÓN</p>${next?`<h3>${nciSessionKindMeta(next).icon} Sesión ${agendaProEscape(nciDisplayNumber(next))}</h3><p>${agendaProEscape(next.fecha || "Sin fecha")} · ${agendaProEscape(agendaProIsFlexible(next) ? "Horario flexible" : (next.scheduledTime || "Sin hora"))} · Micro ${agendaProEscape(nciSessionMicro(next)||"-")}</p><button class="agenda-workspace-open-next" type="button" data-agenda-workspace-session="${agendaProEscape(next.id)}"><span>↗</span> Abrir sesión</button>`:`<h3>Sin sesiones pendientes</h3><p>El cliente no tiene una próxima sesión programada.</p>`}</div>
      <div class="agenda-workspace-flags"><span>${cancelled.length} canceladas</span><span>${noTime} sin hora</span></div>
    </section>
    <section class="agenda-workspace-body"><div class="agenda-workspace-title"><div><p class="eyebrow">LÍNEA TEMPORAL</p><h3>Plan completo del cliente</h3></div><span>${all.length} registros</span></div>${timeline || `<div class="agenda-workspace-empty"><span>📭</span><h3>Sin sesiones</h3><p>Crea la primera sesión para este cliente.</p></div>`}</section>`;
  document.getElementById("agendaWorkspacePatient")?.addEventListener("change", event => { agendaProWorkspacePatient = event.target.value; agendaWorkspaceRender(); });
  document.getElementById("agendaWorkspaceClear")?.addEventListener("click",()=>{agendaProWorkspacePatient="";agendaWorkspaceRender();});
  document.getElementById("agendaWorkspaceNewSession")?.addEventListener("click", () => {
    const nickname = patient.nickname || "";
    renderSection("sesiones");
    setTimeout(() => { const select=document.getElementById("sessionPatientSearch"); if(select){select.value=nickname; select.dispatchEvent(new Event("change",{bubbles:true}));} }, 0);
  });
  mount.querySelectorAll("[data-agenda-workspace-session]").forEach(button => button.addEventListener("click", () => agendaProOpenEditor(button.dataset.agendaWorkspaceSession)));
}

function agendaProApplyViewMode() {
  const clientMode = agendaProViewMode === "client";
  const ids = ["agendaProCalendarToolbar","agendaProIntelligenceMount","agendaProTodayProgress","agendaProWeek","agendaProUnassigned"];
  ids.forEach(id => { const element=document.getElementById(id); if(element) element.hidden=clientMode; });
  const workspace=document.getElementById("agendaClientWorkspace");
  if(workspace) workspace.hidden=!clientMode;
  document.getElementById("agendaProCalendarMode")?.classList.toggle("is-active", !clientMode);
  document.getElementById("agendaProClientMode")?.classList.toggle("is-active", clientMode);
  if(clientMode) agendaWorkspaceRender();
}

function agendaProRenderWeek() {
  agendaProApplyViewMode();
  if (agendaProViewMode === "client") return;
  const week = document.getElementById("agendaProWeek");
  const unassigned = document.getElementById("agendaProUnassigned");
  if (!week || !unassigned) return;
  const filtered = agendaProFilteredSessions();
  const todayIso = agendaProIsoDate(new Date());
  const dailyCounts = agendaProWeekDays().map(day => filtered.filter(session => String(session.fecha || "") === agendaProIsoDate(day)).length);
  const maxDaily = Math.max(1, ...dailyCounts);
  const intelligence = agendaProIntelligence(filtered);
  const intelligenceMount = document.getElementById("agendaProIntelligenceMount");
  if (intelligenceMount) intelligenceMount.innerHTML = agendaProIntelligenceHTML(intelligence);
  week.innerHTML = agendaProWeekDays().map((day, dayIndex) => {
    const iso = agendaProIsoDate(day);
    const daySessions = filtered.filter(session => String(session.fecha || "") === iso).sort(agendaProSort);
    const label = new Intl.DateTimeFormat("es-ES", { weekday: "short" }).format(day).replace(".", "");
    const load = Math.round((daySessions.length / maxDaily) * 100);
    const dayIntel = agendaProDayIntelligence(iso, daySessions);
    const kindSummary = Object.values(dayIntel.kinds).slice(0, 4).map(item => `<span>${item.icon} ${item.count}</span>`).join("");
    return `<article class="agenda-pro-day agenda-pro-load-${dayIntel.loadLevel} ${iso === todayIso ? "is-today" : ""}" data-agenda-drop-date="${iso}">
      <header><span>${label}</span><strong>${day.getDate()}</strong><small>${daySessions.length} sesión${daySessions.length === 1 ? "" : "es"}</small><div class="agenda-pro-day-intel">${kindSummary}${dayIntel.conflicts ? `<em>⚠ ${dayIntel.conflicts}</em>` : ""}${dayIntel.high ? `<em>⭐ ${dayIntel.high}</em>` : ""}</div><div class="agenda-pro-load"><i style="width:${load}%"></i></div></header>
      <div class="agenda-pro-day-list">${agendaProDayList(iso, daySessions)}</div>
    </article>`;
  }).join("");

  // El resumen corresponde al día visible: hoy si pertenece a la semana abierta;
  // en semanas pasadas/futuras utiliza el día seleccionado como ancla.
  const visibleDays = agendaProWeekDays();
  const focusIso = visibleDays.some(day => agendaProIsoDate(day) === todayIso)
    ? todayIso
    : agendaProIsoDate(agendaProWeekAnchor);
  const focusSessions = filtered.filter(session => String(session.fecha || "") === focusIso);
  const completedFocus = focusSessions.filter(session => agendaProStatus(session) === "completed").length;
  const progress = focusSessions.length ? Math.round((completedFocus / focusSessions.length) * 100) : 0;
  const todayBox = document.getElementById("agendaProTodayProgress");
  if (todayBox) {
    if (!focusSessions.length) {
      todayBox.classList.add("is-empty");
      todayBox.innerHTML = `<div><small>OBJETIVO DEL DÍA</small><strong>Agenda libre</strong><span>No hay sesiones programadas para este día.</span></div>`;
    } else {
      todayBox.classList.remove("is-empty");
      const scheduledFocus = focusSessions.filter(session => agendaProStatus(session) === "scheduled").length;
      const cancelledFocus = focusSessions.filter(session => agendaProStatus(session) === "cancelled").length;
      const noTimeFocus = focusSessions.filter(session => agendaProNeedsTime(session) && !String(session.scheduledTime || "").trim()).length;
      todayBox.innerHTML = `<div><small>OBJETIVO DEL DÍA</small><strong>${completedFocus} de ${focusSessions.length} sesiones completadas</strong><span>${scheduledFocus} preparadas · ${cancelledFocus} canceladas · ${noTimeFocus} sin hora</span></div><div class="agenda-pro-progress"><i style="width:${progress}%"></i></div><b>${progress}%</b>`;
    }
  }

  const withoutTime = filtered.filter(session => session.fecha && agendaProNeedsTime(session) && !String(session.scheduledTime || "").trim()).sort((a, b) => String(a.fecha || "").localeCompare(String(b.fecha || "")) || agendaProSort(a, b));
  unassigned.innerHTML = `<div class="agenda-pro-section-head"><div><p class="eyebrow">BANDEJA DE PROGRAMACIÓN</p><h3>Sesiones sin hora</h3><p>Asigna hora y duración para completar la agenda.</p></div><strong>${withoutTime.length}</strong></div>
    <div class="agenda-pro-unassigned-grid">${withoutTime.length ? withoutTime.map(agendaProCard).join("") : `<div class="agenda-pro-all-scheduled">✓ Todas las sesiones tienen hora asignada.</div>`}</div>`;
}

function agendaProDateLabel(value, includeTime = false) {
  if (!value) return "Sin registro";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("es-ES", includeTime
    ? { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "short", year: "numeric" }
  ).format(date);
}

function agendaProPatientTimeline(session = {}) {
  const key = nciSessionPatient(session);
  const ordered = sessions.filter(item => nciSessionPatient(item) === key).slice().sort((a, b) => {
    const date = String(a.fecha || "").localeCompare(String(b.fecha || ""));
    if (date) return date;
    const micro = Number(nciSessionMicro(a) || 0) - Number(nciSessionMicro(b) || 0);
    if (micro) return micro;
    return Number(a.subsessionOrder || a.dayOrder || 1) - Number(b.subsessionOrder || b.dayOrder || 1);
  });
  const index = ordered.findIndex(item => String(item.id) === String(session.id));
  return { previous: index > 0 ? ordered[index - 1] : null, next: index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null };
}

function agendaProHistory(session = {}) {
  const list = Array.isArray(session.agendaHistory) ? session.agendaHistory.slice(-8).reverse() : [];
  if (!list.length) {
    if (session.updatedAt) list.push({ type: "updated", at: session.updatedAt, label: "Última modificación" });
    if (session.createdAt) list.push({ type: "created", at: session.createdAt, label: "Sesión creada" });
  }
  return list;
}

function agendaProAddHistory(session, type, label) {
  if (!session) return;
  const history = Array.isArray(session.agendaHistory) ? session.agendaHistory : [];
  history.push({ type, label, at: new Date().toISOString(), by: currentUser?.nickname || "admin" });
  session.agendaHistory = history.slice(-30);
}

async function agendaProNotifyClient(sessionId) {
  const session = sessions.find(item => String(item.id) === String(sessionId));
  if (!session) return;
  try {
    await agendaProCreateDuplicateNotification(session);
    agendaProAddHistory(session, "notification", "Notificación enviada al cliente");
    session.updatedAt = new Date().toISOString();
    persistSessionsOnly();
    if (window.PPF_SUPABASE?.pushValue) await window.PPF_SUPABASE.pushValue("sessions", sessions);
    alert("Notificación enviada al cliente.");
    agendaProOpenEditor(session.id);
  } catch (error) {
    console.error("Agenda PRO no pudo enviar la notificación:", error);
    alert("No se pudo confirmar el envío de la notificación.");
  }
}

function agendaProOpenEditor(sessionId) {
  const session = sessions.find(item => String(item.id) === String(sessionId));
  const editor = document.getElementById("agendaProEditor");
  if (!session || !editor) return;
  agendaProSelectedSessionId = session.id;
  const patient = agendaProPatient(session);
  const kindMeta = nciSessionKindMeta(session);
  const priorityMeta = agendaProPriorityMeta(agendaProPriority(session));
  const statusMeta = agendaProStatusMeta(agendaProStatus(session));
  const timeline = agendaProPatientTimeline(session);
  const history = agendaProHistory(session);
  editor.hidden = false;
  document.getElementById("agendaProInspectorBackdrop")?.removeAttribute("hidden");
  editor.innerHTML = `
    <div class="agenda-master-head">
      <div class="agenda-master-identity">
        <span class="agenda-master-kind">${kindMeta.icon}</span>
        <div><p class="eyebrow">INSPECTOR MASTER</p><h3>${agendaProEscape(patient.nombre)}</h3><span>@${agendaProEscape(patient.nickname || session.patientNickname || "")} · Sesión ${agendaProEscape(nciDisplayNumber(session))} · Micro ${agendaProEscape(nciSessionMicro(session) || "-")}</span></div>
      </div>
      <button type="button" id="agendaProCloseEditor" aria-label="Cerrar inspector">✕</button>
    </div>

    <div class="agenda-master-badges">
      <span>${kindMeta.icon} ${agendaProEscape(kindMeta.label)}</span>
      <span>${statusMeta.icon} ${agendaProEscape(statusMeta.label)}</span>
      <span>${priorityMeta.icon} Prioridad ${agendaProEscape(priorityMeta.label.toLowerCase())}</span>
    </div>

    <section class="agenda-master-quick">
      <article><small>Sesión anterior</small>${timeline.previous ? `<strong>${agendaProEscape(nciDisplayNumber(timeline.previous))}</strong><span>${agendaProEscape(timeline.previous.fecha || "Sin fecha")}</span>` : `<strong>—</strong><span>Sin sesión anterior</span>`}</article>
      <article><small>Sesión siguiente</small>${timeline.next ? `<strong>${agendaProEscape(nciDisplayNumber(timeline.next))}</strong><span>${agendaProEscape(timeline.next.fecha || "Sin fecha")}</span>` : `<strong>—</strong><span>Sin sesión siguiente</span>`}</article>
      <article><small>Programación</small><strong>${agendaProEscape(agendaProIsFlexible(session) ? "Horario flexible" : (session.scheduledTime || "Sin hora"))}</strong><span>${Math.max(0, Number(session.durationMinutes || 0)) || "—"} min</span></article>
    </section>

    <form id="agendaProForm" class="agenda-master-form">
      <div class="agenda-master-section-head"><div><small>PLANIFICACIÓN</small><h4>Datos de agenda</h4></div></div>
      <div class="agenda-master-fields">
        <label>Fecha<input type="date" id="agendaProDate" required value="${agendaProEscape(session.fecha || "")}"></label>
        <label>Modalidad de agenda<select id="agendaProScheduleMode"><option value="scheduled" ${agendaProScheduleMode(session) === "scheduled" ? "selected" : ""}>🕒 Con hora</option><option value="flexible" ${agendaProScheduleMode(session) === "flexible" ? "selected" : ""}>🌐 Online · horario flexible</option></select></label>
        <label id="agendaProTimeLabel">Hora<input type="time" id="agendaProTime" value="${agendaProEscape(session.scheduledTime || "")}"></label>
        <label>Duración (min)<input type="number" id="agendaProDuration" min="0" step="5" value="${agendaProEscape(session.durationMinutes || 60)}"></label>
        <label>Actividad<select id="agendaProKind">${Object.entries(PPF_SESSION_KINDS).map(([key, meta]) => `<option value="${key}" ${nciSessionKind(session) === key ? "selected" : ""}>${meta.icon} ${meta.label}</option>`).join("")}</select></label>
        <label>Estado<select id="agendaProAgendaStatus"><option value="scheduled" ${String(session.agendaStatus || "scheduled") === "scheduled" ? "selected" : ""}>Preparada</option><option value="cancelled" ${String(session.agendaStatus || "") === "cancelled" ? "selected" : ""}>Cancelada</option></select></label>
        <label>Prioridad<select id="agendaProPriority"><option value="high" ${agendaProPriority(session) === "high" ? "selected" : ""}>🔴 Alta</option><option value="medium" ${agendaProPriority(session) === "medium" ? "selected" : ""}>🟡 Media</option><option value="low" ${agendaProPriority(session) === "low" ? "selected" : ""}>⚪ Baja</option></select></label>
      </div>

      <div class="agenda-master-section-head"><div><small>SEGUIMIENTO</small><h4>Observaciones</h4></div></div>
      <label class="agenda-pro-notes"><textarea id="agendaProNotes" rows="5" placeholder="Notas visibles para el preparador...">${agendaProEscape(session.agendaNotes || "")}</textarea></label>

      <div class="agenda-master-actions-primary">
        <button type="submit" class="primary-btn">💾 Guardar cambios</button>
        <button type="button" class="secondary-btn" id="agendaProOpenSession">Abrir sesión completa</button>
      </div>

      <div class="agenda-master-section-head"><div><small>ACCIONES RÁPIDAS</small><h4>Operaciones</h4></div></div>
      <div class="agenda-master-actions-grid">
        <button type="button" class="secondary-btn" id="agendaProDuplicateSession">📋 Duplicar sesión</button>
        <button type="button" class="secondary-btn" id="agendaProNotifyClient">🔔 Notificar cliente</button>
        <button type="button" class="delete-btn" id="agendaProDeleteSession">🗑️ Eliminar sesión</button>
      </div>

      <div class="agenda-master-section-head"><div><small>TRAZABILIDAD</small><h4>Historial reciente</h4></div></div>
      <div class="agenda-master-history">
        ${history.length ? history.map(item => `<div><i>${item.type === "created" ? "＋" : item.type === "notification" ? "🔔" : "↻"}</i><span><strong>${agendaProEscape(item.label || "Actualización")}</strong><small>${agendaProEscape(agendaProDateLabel(item.at, true))}${item.by ? ` · ${agendaProEscape(item.by)}` : ""}</small></span></div>`).join("") : `<p>Sin actividad registrada.</p>`}
      </div>
    </form>`;
  editor.scrollTop = 0;
  const closeInspector = () => { editor.hidden = true; document.getElementById("agendaProInspectorBackdrop")?.setAttribute("hidden", ""); agendaProSelectedSessionId = null; };
  document.getElementById("agendaProCloseEditor")?.addEventListener("click", closeInspector);
  document.getElementById("agendaProInspectorBackdrop")?.addEventListener("click", closeInspector, { once: true });
  document.getElementById("agendaProOpenSession")?.addEventListener("click", () => { editSession(session.id); });
  document.getElementById("agendaProDuplicateSession")?.addEventListener("click", () => agendaProDuplicateSession(session.id));
  document.getElementById("agendaProNotifyClient")?.addEventListener("click", () => agendaProNotifyClient(session.id));
  document.getElementById("agendaProDeleteSession")?.addEventListener("click", () => agendaProDeleteSession(session.id));
  document.getElementById("agendaProForm")?.addEventListener("submit", agendaProSaveEditor);
  const scheduleModeSelect = document.getElementById("agendaProScheduleMode");
  const timeInput = document.getElementById("agendaProTime");
  const syncScheduleModeUI = () => { const flexible = scheduleModeSelect?.value === "flexible"; if (timeInput) { timeInput.disabled = flexible; if (flexible) timeInput.value = ""; } document.getElementById("agendaProTimeLabel")?.classList.toggle("is-disabled", flexible); };
  scheduleModeSelect?.addEventListener("change", syncScheduleModeUI);
  syncScheduleModeUI();
}

async function agendaProCreateDuplicateNotification(session) {
  if (!session?.patientNickname || !session?.id) return;
  let list = [];
  try { list = JSON.parse(localStorage.getItem("notifications") || "[]"); } catch (_) {}
  if (!Array.isArray(list)) list = [];
  const patient = agendaProPatient(session);
  list.push({
    id: crypto.randomUUID ? crypto.randomUUID() : `notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: "prepared_session",
    recipient: String(session.patientNickname || "").trim().toLowerCase(),
    recipientName: patient.nombre || session.patientNickname,
    title: "Nueva sesión preparada",
    body: `Tu sesión nº ${nciDisplayNumber(session)} ya está disponible.`,
    sessionId: session.id,
    sessionNumber: session.numero || null,
    displaySessionNumber: nciDisplayNumber(session),
    sessionDate: session.fecha || "",
    createdAt: new Date().toISOString(),
    createdBy: currentUser?.nickname || "admin",
    readBy: []
  });
  if (list.length > 500) list = list.slice(-500);
  localStorage.setItem("notifications", JSON.stringify(list));
  if (window.PPF_SUPABASE?.pushValue) await window.PPF_SUPABASE.pushValue("notifications", list);
  else if (window.PPF_SUPABASE?.pushKey) await window.PPF_SUPABASE.pushKey("notifications");
}

async function agendaProDuplicateSession(sessionId) {
  const source = sessions.find(item => String(item.id) === String(sessionId));
  if (!source) return alert("No se ha encontrado la sesión para duplicar.");
  const patient = agendaProPatient(source);
  const confirmed = confirm(`¿Duplicar la sesión ${nciDisplayNumber(source)} de ${patient.nombre}?\n\nSe creará una sesión nueva independiente con el mismo contenido.`);
  if (!confirmed) return;

  const now = new Date().toISOString();
  const clone = JSON.parse(JSON.stringify(source));
  clone.id = crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  clone.createdAt = now;
  clone.updatedAt = now;
  clone.numero = sessions.filter(item => nciSessionPatient(item) === nciSessionPatient(source)).reduce((max, item) => Math.max(max, Number(item.numero || 0)), 0) + 1;
  clone.agendaStatus = "scheduled";
  clone.terminada = false;
  clone.completed = false;
  clone.isCompleted = false;
  clone.completedAt = null;
  clone.finishedAt = null;
  clone.lastCompletedAt = null;
  clone.microSequenceOrder = Number(source.microSequenceOrder || source.subsessionOrder || source.dayOrder || 1) + 0.5;
  clone.subsessionOrder = clone.microSequenceOrder;
  clone.dayOrder = clone.microSequenceOrder;
  clone.displayOrder = clone.microSequenceOrder;
  clone.agendaHistory = [{ type: "created", label: "Sesión duplicada desde Agenda", at: now, by: currentUser?.nickname || "admin" }];

  sessions.push(clone);
  const renumberResult = nciRenumberPatientSessions(clone.patientNickname, { touchUpdatedAt: true });
  const created = sessions.find(item => String(item.id) === String(clone.id)) || clone;
  window.sessions = sessions;
  localStorage.setItem("sessions", JSON.stringify(sessions));
  window.PPF_CORE?.emit?.("sessions");

  try {
    if (window.PPF_SUPABASE?.pushValue) await window.PPF_SUPABASE.pushValue("sessions", sessions);
    else if (window.PPF_SUPABASE?.pushKey) await window.PPF_SUPABASE.pushKey("sessions");
    if (renumberResult.notificationsChanged && window.PPF_SUPABASE?.pushKey) await window.PPF_SUPABASE.pushKey("notifications");
    await agendaProCreateDuplicateNotification(created);
  } catch (error) {
    console.error("Agenda PRO no pudo confirmar la duplicación en Supabase:", error);
    alert("La sesión se ha duplicado en este dispositivo, pero Supabase no confirmó toda la sincronización.");
  }

  renderSection("agenda");
  setTimeout(() => agendaProOpenEditor(created.id), 0);
}

async function agendaProDeleteSession(sessionId) {
  const result = await ppfDeleteSessionsByIds([sessionId]);
  if (result.deleted) renderSection("agenda");
}

async function agendaProSaveEditor(event) {
  event.preventDefault();
  const session = sessions.find(item => String(item.id) === String(agendaProSelectedSessionId));
  if (!session) return;
  const oldPatient = session.patientNickname;
  session.fecha = document.getElementById("agendaProDate")?.value || session.fecha;
  session.scheduleMode = document.getElementById("agendaProScheduleMode")?.value || "scheduled";
  session.flexibleSchedule = session.scheduleMode === "flexible";
  session.scheduledTime = session.flexibleSchedule ? "" : (document.getElementById("agendaProTime")?.value || "");
  session.durationMinutes = Math.max(0, Number(document.getElementById("agendaProDuration")?.value || 0));
  session.sessionKind = document.getElementById("agendaProKind")?.value || session.sessionKind || "gym";
  session.agendaStatus = document.getElementById("agendaProAgendaStatus")?.value || "scheduled";
  session.agendaPriority = document.getElementById("agendaProPriority")?.value || "medium";
  session.agendaNotes = document.getElementById("agendaProNotes")?.value?.trim() || "";
  agendaProAddHistory(session, "updated", "Agenda actualizada");
  session.updatedAt = new Date().toISOString();
  nciRenumberPatientSessions(oldPatient, { touchUpdatedAt: true, rebuildOrder: true });
  persistSessionsOnly();
  let synced = true;
  try {
    if (window.PPF_SUPABASE?.pushValue) synced = await window.PPF_SUPABASE.pushValue("sessions", sessions);
    else if (window.PPF_SUPABASE?.pushKey) synced = await window.PPF_SUPABASE.pushKey("sessions");
  } catch (error) { synced = false; console.error("Agenda PRO no pudo sincronizar:", error); }
  renderSection("agenda");
  if (!synced) alert("La agenda se guardó en este dispositivo, pero Supabase no confirmó la sincronización.");
}

async function agendaProMoveSessionToDate(sessionId, targetDate) {
  return agendaProMoveSession(sessionId, targetDate);
}

function bindAgendaPro() {
  document.getElementById("agendaProCalendarMode")?.addEventListener("click", () => { agendaProViewMode = "calendar"; agendaProApplyViewMode(); agendaProRenderWeek(); });
  document.getElementById("agendaProClientMode")?.addEventListener("click", () => { agendaProWorkspacePatient = ""; agendaProViewMode = "client"; agendaProApplyViewMode(); });
  agendaProApplyViewMode();
  agendaProRenderWeek();
  document.getElementById("agendaProPrevWeek")?.addEventListener("click", () => { agendaProWeekAnchor = agendaProAddDays(agendaProWeekAnchor, -7); renderSection("agenda"); });
  document.getElementById("agendaProNextWeek")?.addEventListener("click", () => { agendaProWeekAnchor = agendaProAddDays(agendaProWeekAnchor, 7); renderSection("agenda"); });
  document.getElementById("agendaProToday")?.addEventListener("click", () => { agendaProWeekAnchor = agendaProStartOfWeek(new Date()); renderSection("agenda"); });
  document.getElementById("agendaProAnchorDate")?.addEventListener("change", event => { agendaProWeekAnchor = agendaProStartOfWeek(event.target.value); renderSection("agenda"); });
  ["agendaProPatientFilter", "agendaProKindFilter", "agendaProStatusFilter"].forEach(id => document.getElementById(id)?.addEventListener("change", agendaProRenderWeek));
  document.getElementById("agendaProSearch")?.addEventListener("input", agendaProRenderWeek);
  document.getElementById("agendaProIntelligenceMount")?.addEventListener("click", event => {
    const button = event.target.closest("[data-agenda-intel-filter]");
    if (!button) return;
    const filter = button.dataset.agendaIntelFilter;
    if (filter === "without-time") document.getElementById("agendaProUnassigned")?.scrollIntoView({ behavior: "smooth", block: "start" });
    else if (filter === "late") { const status = document.getElementById("agendaProStatusFilter"); if (status) status.value = "late"; agendaProRenderWeek(); }
    else {
      const selector = filter === "conflict" ? ".agenda-pro-session.has-conflict" : filter === "priority" ? ".agenda-pro-session.agenda-pro-priority-high" : ".agenda-pro-day.agenda-pro-load-high";
      const target = document.querySelector(selector);
      target?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      target?.classList.add("agenda-pro-intel-focus");
      window.setTimeout(() => target?.classList.remove("agenda-pro-intel-focus"), 1200);
    }
  });
  const root = document.getElementById("agendaProRoot");

  root?.addEventListener("click", event => {
    if (Date.now() < agendaProSuppressClickUntil) return;
    const delayedItem = event.target.closest("[data-agenda-delayed-session]");
    if (delayedItem) {
      event.preventDefault();
      event.stopPropagation();
      document.getElementById("agendaProDelayedKpi")?.classList.remove("is-open");
      agendaProOpenEditor(delayedItem.dataset.agendaDelayedSession);
      return;
    }
    const delayedKpi = event.target.closest("#agendaProDelayedKpi");
    if (delayedKpi) {
      event.preventDefault();
      const open = delayedKpi.classList.toggle("is-open");
      delayedKpi.setAttribute("aria-expanded", String(open));
      return;
    }
    const openDelayed = document.getElementById("agendaProDelayedKpi.is-open");
    if (openDelayed) {
      openDelayed.classList.remove("is-open");
      openDelayed.setAttribute("aria-expanded", "false");
    }
    const button = event.target.closest("[data-agenda-edit]");
    if (button) { agendaProOpenEditor(button.dataset.agendaEdit); return; }
    const card = event.target.closest("[data-agenda-session-id]");
    if (card) agendaProOpenEditor(card.dataset.agendaSessionId);
  });

  root?.addEventListener("keydown", event => {
    const kpi = event.target.closest?.("#agendaProDelayedKpi");
    if (!kpi || !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    const open = kpi.classList.toggle("is-open");
    kpi.setAttribute("aria-expanded", String(open));
  });

  root?.addEventListener("dragstart", event => {
    const card = event.target.closest("[data-agenda-session-id]");
    if (!card) return;
    agendaProDraggedSessionId = card.dataset.agendaSessionId;
    card.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer?.setData("text/plain", agendaProDraggedSessionId);
  });
  root?.addEventListener("dragend", event => {
    event.target.closest("[data-agenda-session-id]")?.classList.remove("is-dragging");
    agendaProDraggedSessionId = null;
    agendaProClearDropTargets();
  });
  root?.addEventListener("dragover", event => {
    const target = event.target.closest("[data-agenda-drop-time],[data-agenda-drop-date]");
    if (!target) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    agendaProClearDropTargets();
    target.classList.add("is-drop-target");
    target.closest(".agenda-pro-day")?.classList.add("is-drop-target");
  });
  root?.addEventListener("dragleave", event => {
    const target = event.target.closest("[data-agenda-drop-time],[data-agenda-drop-date]");
    if (target && !target.contains(event.relatedTarget)) target.classList.remove("is-drop-target");
  });
  root?.addEventListener("drop", event => {
    const target = event.target.closest("[data-agenda-drop-time],[data-agenda-drop-date]");
    if (!target) return;
    event.preventDefault();
    const id = agendaProDraggedSessionId || event.dataTransfer?.getData("text/plain");
    const date = target.dataset.agendaDropDate || target.closest("[data-agenda-drop-date]")?.dataset.agendaDropDate;
    const time = target.dataset.agendaDropTime || "";
    const index = target.dataset.agendaDropIndex ?? null;
    agendaProClearDropTargets();
    agendaProMoveSession(id, date, time, index);
  });

  // PWA/móvil: pulsación larga y arrastre táctil.
  root?.addEventListener("pointerdown", event => {
    if (event.pointerType === "mouse" || event.target.closest("button,input,select,textarea,a")) return;
    const card = event.target.closest("[data-agenda-session-id]");
    if (!card) return;
    const state = { id: card.dataset.agendaSessionId, card, pointerId: event.pointerId, x: event.clientX, y: event.clientY, active: false, target: null };
    state.timer = window.setTimeout(() => {
      state.active = true;
      agendaProTouchDrag = state;
      card.classList.add("is-dragging", "is-touch-dragging");
      navigator.vibrate?.(18);
      try { card.setPointerCapture(event.pointerId); } catch (_) {}
    }, 420);
    agendaProTouchDrag = state;
  });
  root?.addEventListener("pointermove", event => {
    const state = agendaProTouchDrag;
    if (!state || state.pointerId !== event.pointerId) return;
    if (!state.active) {
      if (Math.hypot(event.clientX - state.x, event.clientY - state.y) > 10) {
        window.clearTimeout(state.timer);
        agendaProTouchDrag = null;
      }
      return;
    }
    event.preventDefault();
    const target = agendaProTargetFromPoint(event.clientX, event.clientY);
    agendaProClearDropTargets();
    if (target) {
      target.classList.add("is-drop-target");
      target.closest(".agenda-pro-day")?.classList.add("is-drop-target");
    }
    state.target = target;
  }, { passive: false });
  const finishTouchDrag = event => {
    const state = agendaProTouchDrag;
    if (!state || state.pointerId !== event.pointerId) return;
    window.clearTimeout(state.timer);
    agendaProTouchDrag = null;
    state.card?.classList.remove("is-dragging", "is-touch-dragging");
    if (!state.active) return;
    agendaProSuppressClickUntil = Date.now() + 500;
    const target = state.target || agendaProTargetFromPoint(event.clientX, event.clientY);
    agendaProClearDropTargets();
    if (!target) return;
    const date = target.dataset.agendaDropDate || target.closest("[data-agenda-drop-date]")?.dataset.agendaDropDate;
    const time = target.dataset.agendaDropTime || "";
    const index = target.dataset.agendaDropIndex ?? null;
    agendaProMoveSession(state.id, date, time, index);
  };
  root?.addEventListener("pointerup", finishTouchDrag);
  root?.addEventListener("pointercancel", finishTouchDrag);
}

const sections = {
  inicio: { title: "Inicio", html: () => pmAdminDashboardHTML(), afterRender: pmBindAdminDashboard },
  paciente: { title: "Paciente", html: patientHTML, afterRender: bindPatientForm },
  biblioteca: {
    title: "Biblioteca",
    html: bibliotecaHTML,
    afterRender: bindLibraryForm
  },
  usuarios: {
    title: "Usuarios",
    html: `
      <h2>Usuarios</h2>
      <p>Control de accesos y estado de conexión de clientes.</p>
      ${renderUsersPage()}
    `
  },
  historial: { title: "Historial", html: historialHTML, afterRender: bindHistoryForm },
  archivos: { title: "Archivos", html: archivosHTML, afterRender: bindFilesForm },
  agenda: { title: "Agenda PRO", html: () => agendaProHTML(), afterRender: bindAgendaPro },
  sesiones: {
    title: "Creación sesiones",
    html: `
      <section class="sessions-pro-hero">
        <div class="sessions-pro-hero-copy">
          <p class="eyebrow">CENTRO DE PROGRAMACIÓN</p>
          <h2>Sesiones PRO</h2>
          <p class="sessions-pro-lead">Prepara, copia y organiza entrenamientos completos desde un único flujo de trabajo.</p>
          <div class="sessions-pro-flow" aria-label="Flujo de creación">
            <span><b>1</b> Cliente</span><i aria-hidden="true">→</i><span><b>2</b> Programación</span><i aria-hidden="true">→</i><span><b>3</b> Guardar</span>
          </div>
        </div>
        <div class="sessions-pro-hero-badge">
          <span class="sessions-pro-plan-icon">🏋️</span>
          <strong>Planificación activa</strong>
          <div class="sessions-pro-plan-chips" aria-label="Módulos de la sesión">
            <small>Movilidad</small><small>Activación</small><small>Principal</small><small>Carrera</small>
          </div>
        </div>
      </section>

      <form class="patient-form sessions-pro-form" id="sessionsForm">
        <div class="session-search-clean">
          <div>
            <label for="sessionPatientSearch">Deportista destino</label>
            <select id="sessionPatientSearch" required>
              <option value="">Selecciona paciente</option>
              ${patients.map(patient => `<option value="${patient.nickname}">${patient.nombre}</option>`).join("")}
            </select>
            <input id="sessionPatient" type="hidden" />
          </div>

          <div>
            <div class="session-selected-patient" id="selectedSessionPatientCard">
              <div class="session-selected-avatar">?</div>
              <div>
                <strong>Selecciona cliente</strong>
                <span>Foto del paciente</span>
              </div>
            </div>
            <label for="sessionDate">Fecha</label>
            <input id="sessionDate" type="date" required />
            <label for="sessionKind">Tipo de sesión</label>
            <select id="sessionKind" class="session-kind-select">
              <option value="gym">🏋️ Gimnasio</option>
              <option value="field">🏟️ Campo</option>
              <option value="running">🏃 Carrera</option>
              <option value="recovery">🧘 Recuperación</option>
              <option value="testing">📊 Test / Valoración</option>
              <option value="competition">🏆 Competición</option>
              <option value="other">🎯 Otra</option>
            </select>
          </div>
        </div>

        <section class="session-kpi-top">
          <article class="session-kpi-card"><span>Cliente</span><strong id="kpiClientName">-</strong></article>
          <article class="session-kpi-card"><span>Nickname</span><strong id="kpiClientNickname">-</strong></article>
          <article class="session-kpi-card"><span>Sesión</span><strong>Nº <b id="sessionNumber">-</b></strong></article>

          <article class="session-kpi-card">
            <span>Microciclo</span>

            <strong id="sessionMicrocycle">-</strong>
            <small id="sessionMicrocycleDate">Selecciona fecha</small>

            <label style="display:flex;align-items:center;gap:6px;margin-top:8px;font-size:.82rem;">
              <div class="micro-manual-wrap">
                <label class="micro-manual-label">
                  <input
                    type="checkbox"
                    id="sessionMicroManualCheck"
                    class="micro-manual-check"
                  >
                  <span>Micro Manual</span>
                </label>
              </div>
            </label>

            <select id="sessionMicroManualSelect" style="margin-top:6px;display:none;">
              ${Array.from({length:52},(_,i)=>
                `<option value="${i+1}">Micro ${i+1}</option>`
              ).join("")}
            </select>

            <input id="sessionMicrocycleNumber" type="hidden" />
          </article>
          
        </section>

        <section class="session-pro-actions" aria-label="Herramientas de copia de sesiones">
          <button class="secondary-btn" type="button" id="pasteCopiedSessionBtn">📥 Pegar sesión copiada</button>
          <button class="secondary-btn" type="button" id="loadLastSessionBtn">📚 Cargar última sesión del cliente</button>
          <small id="sessionClipboardStatus">Copia una sesión creada desde el listado inferior y pégala aquí.</small>
        </section>

        <section class="phase3-micro-preview-shell" aria-label="FASE 3 Microcycle Clone Preview">
          <div class="phase3-title-row">
            <div><p class="eyebrow">FASE 3 · MICROCYCLE CLONE</p><h3>Copiar microciclo completo</h3><small>3.2 · Block Mapper seguro. Origen independiente, contenido real y distribución previa por sesión.</small></div>
            <span class="phase3-badge">MODO SIMULACIÓN</span>
          </div>
          <div class="phase3-origin-destination-note"><span>📤 <b>Origen</b>: se elige aquí</span><span>📥 <b>Destino</b>: selector habitual de Creación sesiones</span></div>
          <div class="phase3-controls phase3-controls-origin">
            <label><span>Deportista origen</span><select id="phase3SourcePatient"><option value="">Selecciona deportista origen</option></select></label>
            <label><span>Micro origen</span><select id="phase3SourceMicro"><option value="">Selecciona micro origen</option></select></label>
            <button class="secondary-btn" type="button" id="phase3PreviewBtn" title="Selecciona automáticamente el último micro del deportista origen">👁️ Vista previa · último micro</button>
          </div>
          <div id="phase3Preview" class="phase3-preview"><div class="phase3-empty">Selecciona deportista origen y microciclo para preparar la vista previa.</div></div>
          <div class="phase3-mapper-head">
            <div><p class="eyebrow">FASE 3.2 · BLOCK MAPPER</p><h4>Distribución de bloques</h4><small>Decide a qué bloque llegará cada contenido antes de clonar el micro.</small></div>
            <button class="secondary-btn" type="button" id="phase3ApplyMapBtn">↻ Restablecer mapa 1:1</button>
          </div>
          <div id="phase3Mapper" class="phase3-mapper"><div class="phase3-empty">Selecciona un micro origen para activar el Block Mapper.</div></div>

          <div class="phase3-clone-head">
            <div>
              <p class="eyebrow">FASE 3.3.1 · DATE PLANNER</p>
              <h4>Plan final de destino + calendario</h4>
              <small>Reconstruye la futura copia aplicando el Block Mapper y permite ajustar la fecha de cada sesión antes de clonar.</small>
            </div>
            <span class="phase3-badge">SOLO PREVISUALIZACIÓN</span>
          </div>

          <div class="phase3-destination-controls">
            <label>
              <span>Deportista destino</span>
              <div id="phase3DestinationPatient" class="phase3-destination-readonly">Selecciona el deportista destino arriba.</div>
            </label>
            <label>
              <span>Micro destino</span>
              <select id="phase3TargetMicro">
                <option value="">Selecciona micro destino</option>
                ${Array.from({length:52},(_,i)=>`<option value="${i+1}">Micro ${i+1}</option>`).join("")}
              </select>
            </label>
            <label>
              <span>Semana base destino · lunes</span>
              <input id="phase3TargetStartDate" type="date" />
            </label>
          </div>

          <div class="phase3-date-planner-toolbar">
            <div>
              <strong>📅 DATE PLANNER</strong>
              <small>PPF propone las fechas según el día de la semana del micro origen. Puedes modificar cada sesión individualmente.</small>
            </div>
            <button type="button" class="secondary-btn" id="phase3ResetDatesBtn">↻ Restaurar fechas automáticas</button>
          </div>

          <div id="phase3ClonePreview" class="phase3-clone-preview">
            <div class="phase3-empty">Selecciona origen, destino, micro destino y semana base para construir el plan final.</div>
          </div>

          <div class="phase3-clone-lock">
            <button class="primary-btn" type="button" id="phase3CloneLockedBtn" disabled>🔒 Clonar microciclo · revisa el plan</button>
            <small>FASE 3.4 · Deep Clone Engine: escribe únicamente el plan validado, genera IDs nuevos y envía una sola notificación agrupada.</small>
          </div>
        </section>

        <section class="session-module-kpis">
          <button class="session-module-btn active" type="button" data-module="movilidad">
            <span class="action-icon">🧘</span><strong>Movilidad</strong><small>Dinámico · añade solo los necesarios</small>
          </button>
          <button class="session-module-btn" type="button" data-module="activacion">
            <span class="action-icon">⚡</span><strong>Activación</strong><small>Dinámico · ejercicios + RPE</small>
          </button>
          <button class="session-module-btn" type="button" data-module="principal">
            <span class="action-icon">🏋️</span><strong>Sesión Principal</strong><small>4 bloques · ejercicios dinámicos</small>
          </button>
          <button class="session-module-btn" type="button" data-module="carrera">
            <span class="action-icon">🏃</span><strong>Sesiones Carrera</strong><small>Series dinámicas · distancia/tiempo + ritmo + RPE + FC</small>
          </button>
        </section>

        <section class="session-module-panel">
          <div class="module-panel-header">
            <div>
              <p class="eyebrow">Bloque de trabajo</p>
              <h3 id="activeModuleTitle">Movilidad</h3>
            </div>
            <span id="activeModuleCount">1 ejercicio</span>
          </div>

          <div id="principalBlocksNav" class="principal-blocks-nav" style="display:none;">
            <button type="button" class="principal-block-btn active" data-principal-block="bloque1">Bloque 1</button>
            <button type="button" class="principal-block-btn" data-principal-block="bloque2">Bloque 2</button>
            <button type="button" class="principal-block-btn" data-principal-block="bloque3">Bloque 3</button>
            <button type="button" class="principal-block-btn" data-principal-block="bloque4">Bloque 4</button>
          </div>

          <div id="principalBlockNotesWrap" class="principal-block-notes" style="">
            <label id="principalBlockNotesLabel">Objetivo / Observaciones del bloque</label>
            <textarea id="principalBlockNotes" placeholder="Ej: Fuerza máxima, potencia horizontal, hipertrofia tren inferior..."></textarea>
</div>

          <div class="exercise-table-head" id="exerciseTableHead">
            <span>Ejercicio</span>
            <span>Nº series</span>
            <span>Repeticiones</span>
            <span id="loadHead" style="display:none;">Carga</span>
            <span id="unitHead" style="display:none;">Unidad</span>
            <span id="rpeHead" style="display:none;">RPE</span>
            <span>Tipo</span>
            <span>URL / acciones</span>
          </div>

          <datalist id="libraryMovilidadList">${libraryOptions("Movilidad")}</datalist>
          <datalist id="libraryActivacionList">${libraryOptions("Activación")}</datalist>
          <datalist id="libraryPrincipalList">${libraryOptions("Sesión Principal")}</datalist>
          <datalist id="libraryCarreraList">${libraryOptions("Sesiones Carrera")}</datalist>
          <div id="moduleExercises"></div>
          <div class="dynamic-exercise-actions">
            <button class="secondary-btn add-exercise-btn" type="button" id="addExerciseBtn">＋ Añadir ejercicio</button>
            <small id="dynamicExerciseHint">Solo se muestran los ejercicios que necesitas · máximo 10 por bloque.</small>
          </div>
        </section>

        <button class="primary-btn" type="submit" id="saveSessionBtn">Guardar sesión</button>
      </form>

      <section class="sessions-pro-library">
        <div class="sessions-pro-library-head">
          <div>
            <p class="eyebrow">HISTORIAL DE PROGRAMACIÓN</p>
            <h2>Sesiones preparadas</h2>
            <span>Consulta, reutiliza o edita cualquier sesión guardada.</span>
          </div>
          <label class="sessions-pro-filter" for="sessionsFilter">
            <span>Filtrar por paciente</span>
            <select id="sessionsFilter">
              <option value="" selected disabled>Selecciona paciente</option>
              ${patientOptions().replace('<option value="">Selecciona paciente</option>', '')}
            </select>
          </label>
        </div>
        <div class="sessions-list sessions-pro-list" id="sessionsList"></div>
      </section>
    `,
    afterRender: bindSessionsForm
  },
  periodicidad: {
    title: "Periodicidad PRO",
    html: `
      <div class="periodicity-pro-v1" id="periodicityProRoot">
        <section class="periodicity-pro-hero">
          <div>
            <p class="eyebrow">PLANIFICACIÓN ESTRATÉGICA</p>
            <h2>📆 Periodicidad PRO</h2>
            <p>Lee la temporada real del deportista a partir de sus microciclos y sesiones existentes.</p>
          </div>
          <div class="periodicity-pro-controls">
            <label>Cliente
              <select id="periodicityPatientFilter">
                <option value="" selected>Selecciona paciente</option>
                ${patientOptions().replace('<option value="">Selecciona paciente</option>', '')}
              </select>
            </label>
            <label>Temporada
              <select id="periodicitySeasonYear"></select>
            </label>
          </div>
        </section>

        <section id="periodicitySeasonOverview" class="periodicity-season-overview"></section>
        <section id="periodicityMicroTimeline" class="periodicity-micro-timeline"></section>
        <section id="periodicityMicroDetail" class="periodicity-micro-detail"></section>

        <details class="periodicity-analysis-details">
          <summary><span>📊</span><div><strong>Análisis avanzado del entrenamiento</strong><small>Volumen, pliometría, tonelaje y distribución</small></div><b>⌄</b></summary>
          <div class="periodicity-analysis-content">
            <div id="periodicityPatientCard"></div>
            <section class="periodicity-kpi-grid" id="periodicityKpis"></section>

            <section class="periodicity-dashboard">
              <article class="periodicity-card">
                <div class="module-panel-header"><div><p class="eyebrow">Volumen semanal</p><h3>Series por microciclo</h3></div><span>M1 · M2 · M3...</span></div>
                <div class="volume-chart" id="weeklyVolumeChart"></div>
              </article>
              <article class="periodicity-card">
                <div class="module-panel-header"><div><p class="eyebrow">Resumen total</p><h3>Detalle por microciclo</h3></div></div>
                <div class="volume-table-wrap"><table class="volume-table"><thead><tr><th>Microciclo</th><th>Sesiones</th><th>Ejercicios</th><th>Series</th></tr></thead><tbody id="weeklyVolumeTableBody"></tbody></table></div>
              </article>
            </section>

            <section class="periodicity-dashboard">
              <article class="periodicity-card">
                <div class="module-panel-header"><div><p class="eyebrow">Volumen pliometría</p><h3>Series de pliometría por microciclo</h3></div><span>Plyo Extensiva · Plyo Intensiva · Pliometría</span></div>
                <div class="volume-chart plyo-chart" id="plyometricVolumeChart"></div>
              </article>
              <article class="periodicity-card">
                <div class="module-panel-header"><div><p class="eyebrow">Resumen pliometría</p><h3>Detalle pliométrico anual</h3></div></div>
                <div class="volume-table-wrap"><table class="volume-table"><thead><tr><th>Microciclo</th><th>Sesiones</th><th>Ejercicios Plyo</th><th>Series Plyo</th></tr></thead><tbody id="plyometricVolumeTableBody"></tbody></table></div>
              </article>
            </section>

            <section class="periodicity-dashboard kg-dashboard-row">
              <article class="periodicity-card"><div class="module-panel-header"><div><p class="eyebrow">Tonelaje</p><h3>Kg totales por microciclo</h3></div><span>Series × Reps × Kg</span></div><div class="volume-chart tonnage-chart" id="tonnageChart"></div></article>
              <article class="periodicity-card"><div class="module-panel-header"><div><p class="eyebrow">Resumen tonelaje</p><h3>Detalle de carga externa</h3></div></div><div class="volume-table-wrap"><table class="volume-table"><thead><tr><th>Microciclo</th><th>Sesiones</th><th>Ejercicios</th><th>Tonelaje Kg</th></tr></thead><tbody id="tonnageTableBody"></tbody></table></div></article>
            </section>

            <section class="periodicity-dashboard distribution-dashboard-row"><article class="periodicity-card distribution-wide-card"><div class="module-panel-header"><div><p class="eyebrow">Distribución</p><h3>TS · TI · Core · Plyo</h3></div></div><div class="distribution-chart" id="distributionChart"></div></article></section>
          </div>
        </details>
      </div>
    `,
    afterRender: bindPeriodicityPanel
  },
  graficaPro: {
    title: "Centro de Rendimiento",
    html: `
      <section class="graph-pro-page-intro">
        <div>
          <p class="eyebrow">INTELIGENCIA DEL ENTRENAMIENTO</p>
          <h2>Centro de Rendimiento</h2>
          <p>Compara libremente dos microciclos y analiza sus diferencias con inteligencia deportiva.</p>
        </div>
        <span class="graph-pro-version-chip">Centro de Rendimiento · v2.5.0</span>
      </section>

      <section class="graph-pro-selector-panel">
        <label for="graphProPatientFilter">Deportista</label>
        <div class="graph-pro-select-wrap">
          <select id="graphProPatientFilter">
            <option value="" selected disabled>Selecciona un deportista</option>
            ${patientOptions().replace('<option value="">Selecciona paciente</option>', '')}
          </select>
          <button type="button" id="graphProPatientClear" class="graph-pro-select-clear" aria-label="Cerrar deportista" data-tooltip="Cerrar deportista" hidden>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
          <span class="graph-pro-select-arrow" aria-hidden="true">⌄</span>
        </div>
      </section>

      <div id="graphProArea"></div><div id="microCompareArea"></div>
    `,
    afterRender: bindGraphPro
  },

  sistema: {
    title: "Sistema",
    html: `
      <h2>Sistema</h2>
      <p>Copias de seguridad y restauración estable de datos.</p>

      <section class="system-panel">
        <div class="module-panel-header">
          <div>
            <p class="eyebrow">Sistema</p>
            <h3>Backup local estable</h3>
          </div>
        </div>

        <div class="system-actions">
          <button class="primary-btn" id="backupBtn" type="button">Crear backup</button>
          <button class="primary-btn" id="syncSupabaseBtn" type="button">Sincronizar Supabase</button>
          <label class="primary-btn restore-label">
            Cargar backup
            <input id="restoreInput" type="file" accept="application/json" hidden />
          </label>
          <button class="danger-btn" id="clearIndexedFlagBtn" type="button">Limpiar modo BD</button>
        </div>

        <div class="system-note">
          <strong>Modo estable:</strong> la app usa localStorage. IndexedDB queda desactivado para no pisar sesiones, bloques ni gráficas.
        </div>

        <div class="system-stats" id="systemStats"></div>
      </section>
    `,
    afterRender: bindSystemPanel
  },

  valoraciones: {
    title: "Valoraciones",
    html: `
      <h2>Valoraciones</h2>
      <p>Registra pruebas físicas con intentos, unidad de registro y observaciones cualitativas por test.</p>

      <form class="patient-form valuation-form" id="valuationsForm">
        <div class="valuation-top-row">
          <div>
            <label for="valuationPatient">Selecciona paciente</label>
            <select id="valuationPatient" required>${patientOptions()}</select>
          </div>

          <div class="valuation-date-field">
            <label for="valuationDate">Fecha</label>
            <input id="valuationDate" type="date" required />
          </div>
        </div>

        <div id="valuationSelectedPatientInfo" class="valuation-selected-patient-wrap"></div>

        <div class="valuation-tests-area" id="valuationTestsArea">
          ${valuationTestRow(1)}
        </div>

        <div class="form-actions valuation-actions">
          <button class="secondary-btn" id="addValuationTestBtn" type="button">+ Añadir test</button>
          <button class="primary-btn" type="submit">Guardar valoración</button>
        </div>
      </form>

      <div class="patient-form" style="margin-top:26px;">
        <label for="valuationsFilter">Filtrar valoraciones por paciente</label>
        <select id="valuationsFilter">
          <option value="">Elegir Paciente</option>
          ${patientOptions().replace('<option value="">Selecciona paciente</option>', '')}
        </select>
      </div>

      <section class="valuation-pdf-toolbar patient-form">
        <div>
          <h3>PDF Valoraciones PRO</h3>
          <p>Genera informes individuales, seleccionados o por paciente y TEST.</p>
        </div>
        <div class="valuation-pdf-actions">
          <button class="secondary-btn" id="valuationSelectAllBtn" type="button">Seleccionar visibles</button>
          <button class="secondary-btn" id="valuationClearSelectionBtn" type="button">Limpiar selección</button>
          <button class="primary-btn" id="valuationPdfSelectedBtn" type="button">PDF seleccionadas</button>
        </div>
        <div class="valuation-pdf-filters">
          <select id="valuationPdfPatient">
            <option value="">Paciente para PDF</option>
            ${patientOptions().replace('<option value="">Selecciona paciente</option>', '')}
          </select>
          <select id="valuationPdfTest">
            <option value="">Todos los TEST</option>
          </select>
          <button class="primary-btn" id="valuationPdfPatientTestBtn" type="button">PDF paciente / TEST</button>
        </div>
      </section>

      <section class="valuation-charts-panel">
        <div class="module-panel-header">
          <div>
            <p class="eyebrow">Evolución de tests</p>
            <h3>Gráficas automáticas por test numérico</h3>
          </div>
        </div>
        <div id="valuationChartsArea"></div>
      </section>

      <div class="history-list" id="valuationsList"></div>
    `,
    afterRender: bindValoracionesForm
  }
};

function pmApplyAdminMobileMode() {
  const standalone = window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
  const viewportWidth = Math.min(window.innerWidth || 9999, document.documentElement.clientWidth || 9999);
  const compactViewport = viewportWidth <= 1024;
  const compactStandalone = standalone && viewportWidth <= 1180;

  // La navegación móvil solo debe activarse en teléfono/tablet.
  // Un PC táctil no debe recibir la barra inferior móvil por tener pointer:coarse.
  document.body.classList.toggle("admin-mobile-ui", Boolean(compactViewport || compactStandalone));
}

pmApplyAdminMobileMode();
window.addEventListener("resize", pmApplyAdminMobileMode, { passive: true });
window.addEventListener("orientationchange", () => setTimeout(pmApplyAdminMobileMode, 80), { passive: true });
document.addEventListener("DOMContentLoaded", pmApplyAdminMobileMode);

function pmSyncAdminNavigation(key) {
  navItems.forEach(nav => nav.classList.toggle("active", nav.dataset.section === key));
  document.querySelectorAll("[data-mobile-section]").forEach(nav => {
    nav.classList.toggle("active", nav.dataset.mobileSection === key);
  });
  document.querySelectorAll("[data-floating-section]").forEach(nav => {
    nav.classList.toggle("active", nav.dataset.floatingSection === key);
  });
  ppfUpdateFloatingNavigator(key);
}

function pmCloseAdminMoreSheet() {
  const sheet = document.getElementById("adminMobileMoreSheet");
  const backdrop = document.getElementById("adminMobileMoreBackdrop");
  const moreBtn = document.getElementById("adminMobileMoreBtn");

  if (sheet) {
    sheet.classList.remove("open");
    sheet.setAttribute("aria-hidden", "true");
    sheet.setAttribute("inert", "");
  }
  if (backdrop) backdrop.classList.remove("open");
  if (moreBtn) moreBtn.setAttribute("aria-expanded", "false");
  document.body.classList.remove("admin-more-open");

  window.setTimeout(() => {
    if (sheet && !sheet.classList.contains("open")) sheet.hidden = true;
    if (backdrop && !backdrop.classList.contains("open")) backdrop.hidden = true;
  }, 260);
}

function pmOpenAdminMoreSheet() {
  const sheet = document.getElementById("adminMobileMoreSheet");
  const backdrop = document.getElementById("adminMobileMoreBackdrop");
  const moreBtn = document.getElementById("adminMobileMoreBtn");

  if (backdrop) backdrop.hidden = false;
  if (sheet) {
    sheet.hidden = false;
    sheet.removeAttribute("inert");
    sheet.setAttribute("aria-hidden", "false");
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      backdrop?.classList.add("open");
      sheet?.classList.add("open");
    });
  });

  if (moreBtn) moreBtn.setAttribute("aria-expanded", "true");
  document.body.classList.add("admin-more-open");
  if (navigator.vibrate) navigator.vibrate(10);
}

function pmNavigateAdmin(key, options = {}) {
  const target = sections[key] ? key : "inicio";
  pmSyncAdminNavigation(target);
  renderSection(target);
  pmCloseAdminMoreSheet();
  if (options.scroll !== false) window.scrollTo({ top: 0, behavior: options.smooth === false ? "auto" : "smooth" });
  if (options.vibrate !== false && navigator.vibrate) navigator.vibrate(10);
}

function renderSection(key) {
  const section = sections[key] || sections.inicio;
  const isHome = key === "inicio";
  const isAgenda = key === "agenda";
  const isPeriodicity = key === "periodicidad";
  const isGraphPro = key === "graficaPro";
  document.body.classList.toggle("admin-home-active", isHome);
  document.body.classList.toggle("admin-agenda-active", isAgenda);
  document.body.classList.toggle("admin-periodicity-active", isPeriodicity);
  document.body.classList.toggle("admin-graph-pro-active", isGraphPro);
  sectionTitle.textContent = section.title;
  contentArea.innerHTML = typeof section.html === "function" ? section.html() : section.html;
  if (!isHome && !isPeriodicity && !isGraphPro) pmSetDashboardKpis(key);
  if (section.afterRender) section.afterRender();
  if (!isHome && !isPeriodicity && !isGraphPro) pmSetDashboardKpis(key);
}

navItems.forEach(item => {
  item.addEventListener("click", () => pmNavigateAdmin(item.dataset.section));
});

document.querySelectorAll("[data-mobile-section]").forEach(item => {
  item.addEventListener("click", () => pmNavigateAdmin(item.dataset.mobileSection));
});

document.getElementById("adminMobileMoreBtn")?.addEventListener("click", () => {
  const sheet = document.getElementById("adminMobileMoreSheet");
  if (sheet?.classList.contains("open")) pmCloseAdminMoreSheet();
  else pmOpenAdminMoreSheet();
});
document.getElementById("adminMobileMoreClose")?.addEventListener("click", pmCloseAdminMoreSheet);
document.getElementById("adminMobileMoreBackdrop")?.addEventListener("click", pmCloseAdminMoreSheet);
document.getElementById("adminMobileLogout")?.addEventListener("click", () => window.PM_ADMIN_LOGOUT());

// PPF PRO v2.5.0.1.2 · PPF Workspace Navigator
const PPF_FLOATING_SECTION_LABELS = Object.freeze({
  inicio: "Inicio",
  paciente: "Paciente",
  usuarios: "Usuarios",
  biblioteca: "Biblioteca",
  sesiones: "Creación sesiones",
  agenda: "Agenda PRO",
  periodicidad: "Periodicidad",
  graficaPro: "Centro de Rendimiento",
  valoraciones: "Valoraciones",
  sistema: "Sistema"
});
let ppfFloatingNavigatorSection = "inicio";
function ppfUpdateFloatingNavigator(key) {
  const trigger = document.getElementById("ppfFloatingMenuBtn");
  const context = trigger?.querySelector(".ppf-floating-menu-context");
  const sectionName = PPF_FLOATING_SECTION_LABELS[key] || "Inicio";
  ppfFloatingNavigatorSection = key in PPF_FLOATING_SECTION_LABELS ? key : "inicio";
  if (context) {
    context.classList.add("is-changing");
    window.setTimeout(() => {
      context.textContent = ` · ${sectionName}`;
      context.classList.remove("is-changing");
    }, 90);
  }
  trigger?.setAttribute("data-section", ppfFloatingNavigatorSection);
  if (!trigger?.classList.contains("is-open")) {
    trigger?.setAttribute("aria-label", `Abrir menú lateral. Sección actual: ${sectionName}`);
    trigger?.setAttribute("title", `Menú · ${sectionName}`);
  }
}

// PPF PRO v2.5.0.1 · Floating Navigation Access
let ppfFloatingMenuLastFocus = null;
function ppfCloseFloatingMenu(options = {}) {
  const drawer = document.getElementById("ppfFloatingMenuDrawer");
  const backdrop = document.getElementById("ppfFloatingMenuBackdrop");
  const trigger = document.getElementById("ppfFloatingMenuBtn");
  drawer?.classList.remove("open");
  backdrop?.classList.remove("open");
  trigger?.classList.remove("is-open");
  trigger?.setAttribute("aria-expanded", "false");
  trigger?.setAttribute("aria-label", `Abrir menú lateral. Sección actual: ${PPF_FLOATING_SECTION_LABELS[ppfFloatingNavigatorSection] || "Inicio"}`);
  trigger?.setAttribute("title", `Menú · ${PPF_FLOATING_SECTION_LABELS[ppfFloatingNavigatorSection] || "Inicio"}`);
  const icon = trigger?.querySelector(".ppf-floating-menu-icon");
  if (icon) icon.textContent = "☰";
  const action = trigger?.querySelector(".ppf-floating-menu-action");
  if (action) action.textContent = "Menú";
  drawer?.setAttribute("aria-hidden", "true");
  drawer?.setAttribute("inert", "");
  document.body.classList.remove("ppf-floating-menu-open");
  window.setTimeout(() => {
    if (drawer && !drawer.classList.contains("open")) drawer.hidden = true;
    if (backdrop && !backdrop.classList.contains("open")) backdrop.hidden = true;
  }, 290);
  if (options.restoreFocus !== false) (ppfFloatingMenuLastFocus || trigger)?.focus?.();
}
function ppfOpenFloatingMenu() {
  const drawer = document.getElementById("ppfFloatingMenuDrawer");
  const backdrop = document.getElementById("ppfFloatingMenuBackdrop");
  const trigger = document.getElementById("ppfFloatingMenuBtn");
  ppfFloatingMenuLastFocus = document.activeElement;
  if (drawer) { drawer.hidden = false; drawer.removeAttribute("inert"); drawer.setAttribute("aria-hidden", "false"); }
  if (backdrop) backdrop.hidden = false;
  trigger?.classList.add("is-open");
  trigger?.setAttribute("aria-expanded", "true");
  trigger?.setAttribute("aria-label", "Cerrar menú lateral");
  trigger?.setAttribute("title", "Cerrar menú");
  const icon = trigger?.querySelector(".ppf-floating-menu-icon");
  if (icon) icon.textContent = "✕";
  const action = trigger?.querySelector(".ppf-floating-menu-action");
  if (action) action.textContent = "Cerrar";
  document.body.classList.add("ppf-floating-menu-open");
  requestAnimationFrame(() => requestAnimationFrame(() => { backdrop?.classList.add("open"); drawer?.classList.add("open"); }));
  window.setTimeout(() => drawer?.querySelector("button")?.focus(), 120);
  if (navigator.vibrate) navigator.vibrate(10);
}
function ppfToggleFloatingMenu() {
  const drawer = document.getElementById("ppfFloatingMenuDrawer");
  if (drawer?.classList.contains("open")) ppfCloseFloatingMenu(); else ppfOpenFloatingMenu();
}
document.getElementById("ppfFloatingMenuBtn")?.addEventListener("click", ppfToggleFloatingMenu);
document.getElementById("ppfFloatingMenuClose")?.addEventListener("click", ppfCloseFloatingMenu);
document.getElementById("ppfFloatingMenuBackdrop")?.addEventListener("click", ppfCloseFloatingMenu);
document.querySelectorAll("[data-floating-section]").forEach(item => {
  item.addEventListener("click", () => {
    ppfCloseFloatingMenu({ restoreFocus: false });
    pmNavigateAdmin(item.dataset.floatingSection);
  });
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") { pmCloseAdminMoreSheet(); ppfCloseFloatingMenu(); }
});

const sidebarLogoutBtn = document.getElementById("logoutBtn");
if (sidebarLogoutBtn) {
  sidebarLogoutBtn.addEventListener("click", () => {
    window.PM_ADMIN_LOGOUT();
  });
}

updateCounters();
pmSyncAdminNavigation("inicio");
renderSection("inicio");




/* FIX GitHub Pages: exponer funciones usadas por botones inline */
window.editSession = editSession;
window.deleteSession = deleteSession;
window.deleteSelectedSessions = deleteSelectedSessions;
window.toggleAllSessionsSelection = toggleAllSessionsSelection;
window.editPatient = editPatient;
window.deletePatient = deletePatient;
window.renderSection = renderSection;
window.deleteValuation = deleteValuation;
window.editValuation = editValuation;
window.generateValuationPDF = generateValuationPDF;
window.renderValuationCharts = renderValuationCharts;
window.pmRefreshValoracionesFromSupabase = pmRefreshValoracionesFromSupabase;



/* FIX extra: edición de sesiones por delegación */
document.addEventListener("click", function(event) {
  const btn = event.target.closest(".edit-btn");
  if (!btn || !btn.textContent.includes("Editar sesión")) return;

  const onclick = btn.getAttribute("onclick") || "";
  const match = onclick.match(/editSession\('([^']+)'\)/);
  if (!match) return;

  event.preventDefault();
  event.stopPropagation();

  window.editSession(match[1]);
}, true);



function ensureSupabaseButtonInSystem() {
  const systemPanel = document.querySelector(".system-panel");
  if (!systemPanel || document.getElementById("syncSupabaseBtn")) return;

  const actions = systemPanel.querySelector(".system-actions") || document.createElement("div");
  actions.className = "system-actions";

  const btn = document.createElement("button");
  btn.className = "primary-btn";
  btn.id = "syncSupabaseBtn";
  btn.type = "button";
  btn.textContent = "Actualizar Supabase";
  btn.addEventListener("click", manualSupabaseSyncFromSystem);

  actions.appendChild(btn);

  if (!actions.parentElement) {
    systemPanel.insertBefore(actions, systemPanel.firstChild);
  }
}

document.addEventListener("click", () => {
  setTimeout(ensureSupabaseButtonInSystem, 100);
});
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(ensureSupabaseButtonInSystem, 300);
});


window.manualSupabaseSyncFromSystem = manualSupabaseSyncFromSystem;




// PM FIX DEFINITIVO: insertar botón cerrar sesión bajo Administrador en cabecera
function ensureAdminHeaderLogoutButton() {
  const adminUser = document.querySelector(".admin-user");
  if (!adminUser) return;

  const avatar = adminUser.querySelector(".avatar");

  let wrapper = adminUser.querySelector(".admin-header-user-text");
  if (!wrapper) {
    const oldName = adminUser.querySelector("#adminHeaderName, .admin-header-name, span");
    const labelText = oldName ? oldName.textContent.trim() : "Administrador";
    if (oldName) oldName.remove();

    wrapper = document.createElement("div");
    wrapper.className = "header-user-text admin-header-user-text";

    const label = document.createElement("span");
    label.className = "admin-header-name";
    label.id = "adminHeaderName";
    label.textContent = labelText || "Administrador";

    wrapper.appendChild(label);

    if (avatar) adminUser.insertBefore(wrapper, avatar);
    else adminUser.appendChild(wrapper);
  }

  let btn = document.getElementById("adminHeaderLogoutBtn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "adminHeaderLogoutBtn";
    btn.className = "header-logout-pill admin-logout-pill";
    btn.type = "button";
    btn.textContent = "Cerrar sesión";
    wrapper.appendChild(btn);
  }

  btn.onclick = function () {
    window.PM_ADMIN_LOGOUT();
  };
}


document.addEventListener("DOMContentLoaded", ensureAdminHeaderLogoutButton);
setTimeout(ensureAdminHeaderLogoutButton, 0);
setTimeout(ensureAdminHeaderLogoutButton, 250);
document.addEventListener("click", function(event) {
  const btn = event.target.closest("#adminHeaderLogoutBtn");
  if (!btn) return;
  event.preventDefault();
  window.PM_ADMIN_LOGOUT();
});



// PM FIX FINAL: botón logout admin + KPIs activos robustos
function pmRefreshAdminRuntimeData() {
  try { patients = JSON.parse(localStorage.getItem("patients") || "[]"); } catch (_) { patients = []; }
  try { histories = JSON.parse(localStorage.getItem("histories") || "[]"); } catch (_) { histories = []; }
  try { patientFiles = JSON.parse(localStorage.getItem("patientFiles") || "[]"); } catch (_) { patientFiles = []; }

  const p = document.getElementById("patientCounter");
  const h = document.getElementById("historyCounter");
  const f = document.getElementById("fileCounter");

  if (p) p.textContent = patients.length;
  if (h) h.textContent = histories.length;
  if (f) f.textContent = patientFiles.length;
}

function pmBindAdminHeaderLogout() {
  const btn = document.getElementById("adminHeaderLogoutBtn");
  if (btn) {
    btn.onclick = function () {
      window.PM_ADMIN_LOGOUT();
    };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  pmBindAdminHeaderLogout();
  pmRefreshAdminRuntimeData();
  setTimeout(pmRefreshAdminRuntimeData, 250);
  setTimeout(pmRefreshAdminRuntimeData, 900);
});

setTimeout(() => {
  pmBindAdminHeaderLogout();
  pmRefreshAdminRuntimeData();
}, 0);

if (window.PPF_SUPABASE_READY && typeof window.PPF_SUPABASE_READY.then === "function") {
  window.PPF_SUPABASE_READY.then(() => {
    pmRefreshAdminRuntimeData();
    if (typeof renderPatientList === "function") renderPatientList();
  }).catch(() => {});
}



// PM FIX: KPI pacientes y arranque directo en pestaña Paciente
async function pmRefreshPatientsKpiAndPage() {
  try {
    if (window.PPF_SUPABASE && typeof window.PPF_SUPABASE.pull === "function") {
      await window.PPF_SUPABASE.pull();
    }
  } catch (error) {
    console.warn("No se pudo refrescar Supabase para KPI pacientes:", error);
  }

  try { patients = JSON.parse(localStorage.getItem("patients") || "[]"); } catch (_) { patients = []; }
  try { histories = JSON.parse(localStorage.getItem("histories") || "[]"); } catch (_) { histories = []; }
  try { patientFiles = JSON.parse(localStorage.getItem("patientFiles") || "[]"); } catch (_) { patientFiles = []; }

  if (typeof pmSetDashboardKpis === "function") {
    // B.2.1.4.5 · Sync Hydration: tras un pull conservamos el contexto visual
    // activo. Antes este refresco forzaba siempre el modo "paciente" y podía
    // sobrescribir temporalmente los KPI de Creación sesiones hasta volver a
    // pulsar la sección.
    const active = document.querySelector('.nav-item.active')?.dataset.section || "inicio";
    pmSetDashboardKpis(active);
  } else {
    if (patientCounter) patientCounter.textContent = patients.length;
    if (historyCounter) historyCounter.textContent = histories.length;
    if (fileCounter) fileCounter.textContent = patientFiles.length;
  }

  if (document.querySelector('.nav-item.active')?.dataset.section === "paciente") {
    if (typeof renderPatientList === "function") renderPatientList();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  navItems.forEach(nav => nav.classList.toggle("active", nav.dataset.section === "inicio"));
  if (typeof renderSection === "function") renderSection("inicio");
  pmRefreshPatientsKpiAndPage();
});

setTimeout(pmRefreshPatientsKpiAndPage, 250);
setTimeout(pmRefreshPatientsKpiAndPage, 1000);
setTimeout(pmRefreshPatientsKpiAndPage, 2500);

if (window.PPF_SUPABASE_READY && typeof window.PPF_SUPABASE_READY.then === "function") {
  window.PPF_SUPABASE_READY.then(pmRefreshPatientsKpiAndPage).catch(() => {});
}


function pmRefreshUsersPresencePanelSafe() {
  try {
    const active = document.querySelector(".nav-item.active");
    if (!active || active.dataset.section !== "usuarios") return;
    const current = document.querySelector(".users-access-list");
    if (!current) return;
    const wrap = document.createElement("div");
    wrap.innerHTML = renderUsersPage();
    const fresh = wrap.querySelector(".users-access-list");
    if (fresh) current.replaceWith(fresh);
  } catch (_) {}
}
// Presencia PRO v3: refresco gestionado por eventos y auto-sync único.
window.addEventListener("storage", event => {
  if (event.key === "userStats") pmRefreshUsersPresencePanelSafe();
  if (["patients", "sessions", "valoraciones", "userStats"].includes(event.key) && document.querySelector('.nav-item.active')?.dataset.section === "inicio") {
    try {
      patients = JSON.parse(localStorage.getItem("patients") || "[]");
      sessions = JSON.parse(localStorage.getItem("sessions") || "[]");
      valoraciones = JSON.parse(localStorage.getItem("valoraciones") || "[]");
      renderSection("inicio");
    } catch (_) {}
  }
});

})();


// Presencia PRO v3 elimina el pull paralelo de 30 s del panel Usuarios.


/* =========================================================
   PPF PRO · FASE 2 · SINCRONIZACIÓN AUTOMÁTICA DE PRESENCIA
   ========================================================= */
(function initAdminPresenceAutoSync() {
  if (window.__ppfAdminPresencePhase2) return;
  window.__ppfAdminPresencePhase2 = true;

  function usersSectionIsVisible() {
    const active = document.querySelector(".nav-item.active");
    return active?.dataset?.section === "usuarios" ||
           active?.getAttribute("data-section") === "usuarios" ||
           Boolean(document.querySelector(".users-access-list"));
  }

  function refreshUsersPresence() {
    if (!usersSectionIsVisible()) return;

    try {
      const currentList = document.querySelector(".users-access-list");
      if (!currentList || typeof renderUsersPage !== "function") return;

      const temporary = document.createElement("div");
      temporary.innerHTML = renderUsersPage();
      const freshList = temporary.querySelector(".users-access-list");
      if (freshList) currentList.replaceWith(freshList);
    } catch (error) {
      console.warn("No se pudo refrescar la presencia de usuarios:", error);
    }
  }

  const scheduleRefresh = (() => {
    let timer = null;

    return () => {
      clearTimeout(timer);
      timer = setTimeout(refreshUsersPresence, 120);
    };
  })();

  [
    "ppf:presence-local-change",
    "ppf:presence-cloud-change",
    "ppf:presence-storage-change"
  ].forEach(eventName => {
    window.addEventListener(eventName, scheduleRefresh);
  });

  window.addEventListener("storage", event => {
    if (event.key === "userStats") scheduleRefresh();
  });

  window.PPF_PRESENCE?.startAutoSync?.({ intervalMs: 10000 });

  // Reloj visual local: actualiza "Hace X s" y permite que el estado caduque
  // exactamente a los 90 s, sin hacer peticiones de red ni recargar la sección.
  let visualClock = null;
  const syncVisualClock = () => {
    clearInterval(visualClock);
    visualClock = null;
    if (!usersSectionIsVisible()) return;
    visualClock = setInterval(refreshUsersPresence, 1000);
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      scheduleRefresh();
      syncVisualClock();
    } else {
      clearInterval(visualClock);
      visualClock = null;
    }
  });
  document.addEventListener("click", event => {
    if (event.target.closest('[data-section="usuarios"]')) setTimeout(syncVisualClock, 0);
  });
  syncVisualClock();
})();

/* Agenda PRO v4.2.3 · Cierre definitivo de sesiones sin hora */
const PPF_FLEXIBLE_MIGRATION_VERSION = "agenda-flexible-v4.2.3";

function agendaProSessionIsCompletedForMigration(session = {}, completedIds = nciCompletedSessionIds()) {
  if (!session || typeof session !== "object") return false;
  const status = String(session.agendaStatus || session.status || session.estado || "").toLowerCase();
  return nciIsCompleted(session, completedIds) || status === "completed" || status === "terminada" || status === "terminado" || session.completed === true || session.terminada === true;
}

function agendaProShouldAutoMigrateFlexible(session = {}, completedIds = nciCompletedSessionIds()) {
  if (!session || typeof session !== "object") return false;
  const explicit = String(session.scheduleMode || session.agendaScheduleMode || "").toLowerCase();
  if (explicit === "flexible" || session.flexibleSchedule === true) return false;
  if (String(session.scheduledTime || session.time || "").trim()) return false;
  const status = agendaProRawStatus(session);
  const cancelled = ["cancelled", "cancelada", "cancelado"].includes(status);
  return cancelled || agendaProSessionIsCompletedForMigration(session, completedIds);
}

function agendaProReadSyncedSessions() {
  let stored = [];
  try {
    const parsed = JSON.parse(localStorage.getItem("sessions") || "[]");
    if (Array.isArray(parsed)) stored = parsed;
  } catch (_) {}
  const live = Array.isArray(window.sessions) ? window.sessions : (Array.isArray(sessions) ? sessions : []);
  const merged = new Map();
  [...stored, ...live].forEach((session, index) => {
    if (!session || typeof session !== "object") return;
    const key = String(session.id || session.sessionId || `${nciSessionPatient(session)}|${session.fecha || ""}|${nciSessionMicro(session)}|${index}`);
    const previous = merged.get(key);
    const previousStamp = Date.parse(previous?.updatedAt || previous?.createdAt || "") || 0;
    const currentStamp = Date.parse(session.updatedAt || session.createdAt || "") || 0;
    if (!previous || currentStamp >= previousStamp) merged.set(key, session);
  });
  return Array.from(merged.values());
}

async function agendaProMigrateHistoricalFlexibleSessions(options = {}) {
  const force = options.force === true;
  const source = agendaProReadSyncedSessions();
  if (!Array.isArray(source) || !source.length) return { changed: 0, total: 0 };

  sessions = source;
  window.sessions = sessions;

  const completedIds = nciCompletedSessionIds();
  let changed = 0;
  const now = new Date().toISOString();

  sessions.forEach(session => {
    if (!agendaProShouldAutoMigrateFlexible(session, completedIds)) return;
    session.scheduleMode = "flexible";
    session.agendaScheduleMode = "flexible";
    session.flexibleSchedule = true;
    session.scheduledTime = "";
    session.updatedAt = now;
    if (typeof agendaProAddHistory === "function") {
      agendaProAddHistory(session, "updated", "Migración automática: sesión finalizada sin hora convertida a horario flexible");
    }
    changed += 1;
  });

  const marker = localStorage.getItem(PPF_FLEXIBLE_MIGRATION_VERSION);
  if (!changed && marker && !force) return { changed: 0, total: sessions.length };

  localStorage.setItem("sessions", JSON.stringify(sessions));
  window.PPF_CORE?.emit?.("sessions");
  // Algunas instalaciones antiguas conservan objetos completos también en
  // completedSessions. Si existen, se normalizan para que ningún consumidor
  // secundario vuelva a presentar "Sin hora" como incidencia.
  try {
    const completedRecords = JSON.parse(localStorage.getItem("completedSessions") || "[]");
    if (Array.isArray(completedRecords)) {
      const byId = new Map(sessions.map(item => [String(item.id || item.sessionId || ""), item]));
      let completedChanged = false;
      const normalizedCompleted = completedRecords.map(item => {
        if (!item || typeof item !== "object") return item;
        const id = String(item.sessionId || item.id || "");
        const sourceSession = byId.get(id);
        const hasTime = Boolean(String(item.scheduledTime || sourceSession?.scheduledTime || "").trim());
        if (!hasTime) {
          const next = { ...item, scheduleMode: "flexible", agendaScheduleMode: "flexible", flexibleSchedule: true, updatedAt: now };
          completedChanged = completedChanged || JSON.stringify(next) !== JSON.stringify(item);
          return next;
        }
        return item;
      });
      if (completedChanged) localStorage.setItem("completedSessions", JSON.stringify(normalizedCompleted));
    }
  } catch (_) {}
  localStorage.setItem(PPF_FLEXIBLE_MIGRATION_VERSION, now);

  if (changed) {
    try {
      if (window.PPF_SUPABASE?.pushValue) {
        const pushed = await window.PPF_SUPABASE.pushValue("sessions", sessions);
        if (pushed === false) throw new Error("Supabase rechazó la actualización de sessions");
      } else if (window.PPF_SUPABASE?.pushKey) {
        const pushed = await window.PPF_SUPABASE.pushKey("sessions");
        if (pushed === false) throw new Error("Supabase rechazó la actualización de sessions");
      }
    } catch (error) {
      console.warn("Agenda PRO no pudo confirmar la migración flexible en Supabase:", error);
    }
  }

  const activeSection = document.querySelector(".nav-item.active")?.dataset.section;
  if (activeSection === "agenda" && typeof renderSection === "function") {
    renderSection("agenda");
  }

  window.dispatchEvent(new CustomEvent("ppf:agenda-flexible-migrated", { detail: { changed, total: sessions.length } }));
  return { changed, total: sessions.length };
}

window.agendaProMigrateHistoricalFlexibleSessions = agendaProMigrateHistoricalFlexibleSessions;

async function agendaProRunFlexibleMigrationAfterSync() {
  try {
    if (window.PPF_SUPABASE_READY && typeof window.PPF_SUPABASE_READY.then === "function") {
      await window.PPF_SUPABASE_READY;
    } else if (window.PPF_SUPABASE?.pull) {
      await window.PPF_SUPABASE.pull();
    }
  } catch (error) {
    console.warn("Agenda PRO: la migración flexible continuará con los datos locales:", error);
  }
  return agendaProMigrateHistoricalFlexibleSessions({ force: true });
}

function agendaProScheduleForcedFlexibleMigration() {
  [400, 1200, 3000, 6000, 10000].forEach((delay, index) => {
    setTimeout(() => {
      (index === 0 ? agendaProRunFlexibleMigrationAfterSync() : agendaProMigrateHistoricalFlexibleSessions({ force: true }))
        .catch(error => console.warn("Agenda PRO: reintento de migración flexible fallido:", error));
    }, delay);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", agendaProScheduleForcedFlexibleMigration, { once: true });
} else {
  agendaProScheduleForcedFlexibleMigration();
}

window.addEventListener("storage", event => {
  if (event.key === "completedSessions" || event.key === "sessions") {
    setTimeout(() => agendaProMigrateHistoricalFlexibleSessions({ force: true }), 250);
  }
});
