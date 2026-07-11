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

  return `<option value="">Selecciona paciente</option>` + sortedPatients.map(patient => `
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

function renderPatientList() {
  const list = document.getElementById("patientList");
  if (!list) return;

  if (patients.length === 0) {
    list.innerHTML = `<p>No hay pacientes creados todavía.</p>`;
    return;
  }

  list.innerHTML = patients.map(patient => `
    <div class="patient-row">
      ${(getPatientPhotoSafe(patient) ? `<img class="patient-thumb" src="${getPatientPhotoSafe(patient)}" alt="${patient.nombre}">` : `<div class="patient-thumb">${patient.nombre.charAt(0).toUpperCase()}</div>`)
      }
      <div>
        <strong>${patient.nombre}</strong>
        <p>${patient.email || "Sin email"} · ${patient.telefono || "Sin teléfono"} · @${patient.nickname || "sin-nickname"}</p>
        <p><strong>Acceso cliente:</strong> Usuario: ${patient.nickname || "-"} · Contraseña: ${patient.accessPassword || "-"}</p>
        <div class="patient-tags">
          <span>${patient.edad} años</span>
          <span>${patient.peso} kg</span>
          <span>${patient.altura} cm</span>
          <span>IMC ${patient.imc}</span>
          <span>% graso ${patient.grasa || "-"}</span>
          <span>${patient.contenido}</span>
          <span>Alta: ${patient.fechaAlta || "-"}</span>
        </div>

        <div class="patient-card-actions">
          <button class="edit-btn" type="button" onclick="editPatient('${patient.nickname}')">Editar</button>
          <button class="delete-btn" type="button" onclick="deletePatient('${patient.nickname}')">Eliminar</button>
        </div>
      </div>
    </div>
  `).join("");
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

      while (safePrincipal.blocks[blockKey].exercises.length < 4) {
        safePrincipal.blocks[blockKey].exercises.push(defaultExercise("F. ppal. TS"));
      }
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

    const exercises = Array.from({ length: 4 }, (_, index) => {
      const num = index + 1;
      const existingItem = currentBlock.exercises?.[index] || defaultExercise("F. ppal. TS");

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

      while (merged.blocks[blockKey].exercises.length < 4) {
        merged.blocks[blockKey].exercises.push(defaultExercise("F. ppal. TS"));
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

  <div class="patient-list" id="patientList"></div>
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
}

function getSelectedPatientBySearch(value) {
  const target = String(value || "").toLowerCase();
  return patients.find(patient =>
    String(patient.nombre || "").toLowerCase() === target ||
    String(patient.nickname || "").toLowerCase() === target
  );
}


function getNextSessionNumber(patientNickname) {
  if (!patientNickname) return "-";
  const patientSessions = sessions.filter(session => session.patientNickname === patientNickname);
  return patientSessions.length + 1;
}

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


function sortSessionsByNumber(list = []) {
  return [...list].sort((a, b) => {
    const numA = Number(a.numero) || 0;
    const numB = Number(b.numero) || 0;

    if (numA !== numB) return numB - numA;

    const microA = Number(a.microciclo) || 0;
    const microB = Number(b.microciclo) || 0;

    if (microA !== microB) return microB - microA;

    return String(b.fecha || "").localeCompare(String(a.fecha || ""));
  });
}

function renderSessionList(filterNickname = "") {
  normalizeSessionMicrocycles(filterNickname);
  const list = document.getElementById("sessionsList");
  if (!list) return;

  const visible = sortSessionsByNumber(filterNickname ? sessions.filter(session => session.patientNickname === filterNickname) : sessions);

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

    return `
      <article class="session-card">
        <div class="session-card-header">
          <label class="session-check">
            <input class="session-select" type="checkbox" value="${session.id}" />
            <span class="session-badge">Sesión nº ${session.numero}</span>
          </label>
          <span class="session-date">Sesión nº ${session.numero} · ${session.microcicloLabel || (`Micro ${session.microciclo} · ${session.fecha}`)}</span>
        </div>
        <h3>${patient ? patient.nombre : session.patientNickname}</h3>
        <p>@${session.patientNickname}</p>
        <div class="session-card-actions">
          <button class="edit-btn" type="button" onclick="editSession('${session.id}')">✏️ Editar sesión</button>
          <button class="secondary-btn copy-session-btn" type="button" onclick="copySessionToClipboard('${session.id}')">📋 Copiar sesión</button>
          <button class="delete-btn" type="button" onclick="deleteSession('${session.id}')">🗑️ Eliminar</button>
        </div>
        <div class="session-summary session-summary-3">
          ${simpleModuleSummary(session, "movilidad", "Movilidad")}
          ${simpleModuleSummary(session, "activacion", "Activación")}
          ${principalSummary(session)}
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

  alert(`Sesión copiada: ${patient ? patient.nombre : session.patientNickname} · Sesión nº ${session.numero || "-"}. Ahora puedes seleccionar otro paciente y pulsar "Pegar sesión copiada".`);
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
  const filter = document.getElementById("sessionsFilter");
  const kpiClientName = document.getElementById("kpiClientName");
  const kpiClientNickname = document.getElementById("kpiClientNickname");
  const moduleButtons = document.querySelectorAll(".session-module-btn");
  const activeModuleTitle = document.getElementById("activeModuleTitle");
  const activeModuleCount = document.getElementById("activeModuleCount");
  const moduleExercises = document.getElementById("moduleExercises");
  const saveSessionBtn = document.getElementById("saveSessionBtn");
  const rpeHead = document.getElementById("rpeHead");
  const loadHead = document.getElementById("loadHead");
  const unitHead = document.getElementById("unitHead");
  const principalBlocksNav = document.getElementById("principalBlocksNav");
  const principalBlockNotesWrap = document.getElementById("principalBlockNotesWrap");
  const principalBlockNotes = document.getElementById("principalBlockNotes");
  const principalBlockNotesLabel = document.getElementById("principalBlockNotesLabel");
  const saveCurrentBlockBtn = document.getElementById("saveCurrentBlockBtn");
  const pasteCopiedSessionBtn = document.getElementById("pasteCopiedSessionBtn");
  const loadLastSessionBtn = document.getElementById("loadLastSessionBtn");

  
  if (!form) return;

  
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



  const principalTypes = ["F. ppal. TS", "F. ppal. TI", "Core", "Plyo Extensiva", "Plyo Intensiva", "Lanzamientos", "Mov. Olímpicos"];
  const activationTypes = ["T. Superior", "T. Inferior", "Core", "Pliometría"];
  const mobilityTypes = ["Movilidad", "Est. Estático", "Fascias"];

  const defaultExercise = (tipo = "Movilidad") => ({ nombre: "", series: "", repeticiones: "", carga: "", unidad: "Kg", rpe: "", tipo, url: "", deleted: false });
  const defaultPrincipalBlock = () => ({ notes: "", exercises: Array.from({ length: 4 }, () => defaultExercise("F. ppal. TS")) });

  const moduleData = {
    movilidad: Array.from({ length: 10 }, () => defaultExercise("Movilidad")),
    activacion: Array.from({ length: 10 }, () => defaultExercise("T. Superior")),
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
            <select id="${prefix}_unidad_${number}">
              <option value="Kg" ${(item.unidad || "Kg") === "Kg" ? "selected" : ""}>Kg</option>
              <option value="%" ${item.unidad === "%" ? "selected" : ""}>%</option>
              <option value="m/s" ${item.unidad === "m/s" ? "selected" : ""}>m/s</option>
              <option value="BW" ${item.unidad === "BW" ? "selected" : ""}>BW</option>
            </select>
          </div>
        ` : ""}
        ${showRpe ? `<div><label>RPE</label><input id="${prefix}_rpe_${number}" type="number" min="0" max="10" step="0.5" placeholder="Ej: 8" value="${escapeHtml(item.rpe || "")}" /></div>` : ""}
        <div><label>Tipo</label><select id="${prefix}_tipo_${number}">${typeSelect}</select></div>
        <div>
          <label>URL</label>
          <div class="url-field">
            <input id="${prefix}_url_${number}" type="url" placeholder="https://..." value="${escapeHtml(item.url)}" />
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
        currentExerciseList()[index].deleted = true;
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
          if (option) typeSelect.value = libraryExercise.type;
        }
      });
    });
  }

  function renderModule(module) {
    activeModule = module;

    const isPrincipal = module === "principal";
    if (principalBlocksNav) principalBlocksNav.style.display = isPrincipal ? "grid" : "none";
    if (principalBlockNotesWrap) principalBlockNotesWrap.style.display = isPrincipal ? "grid" : "none";
    if (loadHead) loadHead.style.display = isPrincipal ? "block" : "none";
    if (unitHead) unitHead.style.display = isPrincipal ? "block" : "none";
    if (rpeHead) rpeHead.style.display = (module === "activacion" || isPrincipal) ? "block" : "none";

    const title = isPrincipal ? `Sesión Principal · ${activePrincipalBlock.replace("bloque", "Bloque ")}` : (module === "activacion" ? "Activación" : "Movilidad");
    activeModuleTitle.textContent = title;

    if (isPrincipal) {
      principalBlockNotesLabel.textContent = `Objetivo / Observaciones · ${activePrincipalBlock.replace("bloque", "Bloque ")}`;
      principalBlockNotes.value = moduleData.principal.blocks[activePrincipalBlock].notes || "";
    }

    const prefix = isPrincipal ? `principal_${activePrincipalBlock}` : module;
    const list = currentExerciseList();

    activeModuleCount.textContent = `${list.filter(item => !item.deleted).length} ejercicios`;

    moduleExercises.innerHTML = list.map((item, index) => exerciseRow(module, index + 1, item, prefix)).join("");

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
    sessionNumber.textContent = editingSessionId ? (sessions.find(item => item.id === editingSessionId)?.numero || "-") : getNextSessionNumber(patientNickname);

    const microInfo = editingSessionId ? { number: sessions.find(item => item.id === editingSessionId)?.microciclo || "-" } : getMicrocycleInfo(patientNickname, date.value);

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
    form.reset();
    moduleData.movilidad = Array.from({ length: 10 }, () => defaultExercise("Movilidad"));
    moduleData.activacion = Array.from({ length: 10 }, () => defaultExercise("T. Superior"));
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
  renderModule("movilidad");
  refreshSessionInfo();
  renderSessionList();

  moduleButtons.forEach(button => button.addEventListener("click", () => {
    saveActiveModuleToMemory();
    renderModule(button.dataset.module);
  }));

  document.querySelectorAll(".principal-block-btn").forEach(button => button.addEventListener("click", () => {
    saveActiveModuleToMemory();
    activePrincipalBlock = button.dataset.principalBlock;
    renderModule("principal");
  }));

  if (saveCurrentBlockBtn) {
    saveCurrentBlockBtn.addEventListener("click", () => {
      saveActiveModuleToMemory();
      alert("Bloque guardado en memoria. Recuerda pulsar Guardar sesión para guardar la sesión completa.");
    });
  }

  date.addEventListener("change", refreshSessionInfo);
  filter.addEventListener("change", () => renderSessionList(filter.value));

  patientSearch.addEventListener("change", () => {
    const patient = patients.find(item => item.nickname === patientSearch.value) || getSelectedPatientBySearch(patientSearch.value.trim());
    patientHidden.value = patient ? patient.nickname : "";
    refreshSessionInfo();
  });

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

      while (principal.blocks[blockKey].exercises.length < 4) {
        principal.blocks[blockKey].exercises.push(defaultExercise("F. ppal. TS"));
      }
    });

    return {
      movilidad: (moduleData.movilidad || []).map(item => cloneExerciseForStorage(item, "Movilidad")),
      activacion: (moduleData.activacion || []).map(item => cloneExerciseForStorage(item, "T. Superior")),
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

  function applySessionModulesToForm(modules = {}, sourceLabel = "sesión copiada") {
    const movilidad = Array.isArray(modules.movilidad) ? modules.movilidad : [];
    const activacion = Array.isArray(modules.activacion) ? modules.activacion : [];
    const principalSource = modules.principal || { blocks: {} };

    moduleData.movilidad = movilidad.map(item => normalizeImportedExercise(item, "Movilidad"));
    while (moduleData.movilidad.length < 10) moduleData.movilidad.push(defaultExercise("Movilidad"));

    moduleData.activacion = activacion.map(item => normalizeImportedExercise(item, "T. Superior"));
    while (moduleData.activacion.length < 10) moduleData.activacion.push(defaultExercise("T. Superior"));

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
        exercises: (block.exercises || []).map(item => normalizeImportedExercise(item, "F. ppal. TS"))
      };

      while (moduleData.principal.blocks[blockKey].exercises.length < 4) {
        moduleData.principal.blocks[blockKey].exercises.push(defaultExercise("F. ppal. TS"));
      }
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

    window.sessions = sessions;
    localStorage.setItem("sessions", JSON.stringify(sessions));

    let cloudConfirmed = false;
    if (window.PPF_SUPABASE?.pushValue) {
      cloudConfirmed = await window.PPF_SUPABASE.pushValue("sessions", sessions);
    } else if (window.PPF_SUPABASE?.pushKey) {
      cloudConfirmed = await window.PPF_SUPABASE.pushKey("sessions");
    }

    if (typeof syncRuntimeToDB === "function") {
      try { await syncRuntimeToDB(); }
      catch (error) { console.warn("No se pudo sincronizar IndexedDB:", error); }
    }

    return { created, payload: storedPayload, cloudConfirmed };
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
      body: `Tu sesión nº ${session.numero || "-"} ya está disponible.`,
      sessionId: session.id,
      sessionNumber: session.numero || null,
      sessionDate: session.fecha || "",
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.nickname || "admin",
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
  numero: existing ? existing.numero : getNextSessionNumber(patientNickname),
  fecha: date.value,
  microciclo: selectedMicro,
  microManual: microManualActive,
  microcicloManual: microManualActive,
  microcicloLabel: `Micro ${selectedMicro} · ${date.value}${microManualActive ? " · Manual" : ""}`,
      modules: modulesForSave,
      movilidad: modulesForSave.movilidad.filter(item => !item.deleted && item.nombre).map(item => item.nombre),
      activacion: modulesForSave.activacion.filter(item => !item.deleted && item.nombre).map(item => item.nombre),
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

    moduleData.movilidad = (session.modules?.movilidad || []).map(item => ({ nombre: item.nombre || "", series: item.series || "", repeticiones: item.repeticiones || "", carga: item.carga || "", unidad: item.unidad || "Kg", rpe: item.rpe || "", tipo: item.tipo || "Movilidad", url: item.url || "", deleted: Boolean(item.deleted) }));
    while (moduleData.movilidad.length < 10) moduleData.movilidad.push(defaultExercise("Movilidad"));

    moduleData.activacion = (session.modules?.activacion || []).map(item => ({ nombre: item.nombre || "", series: item.series || "", repeticiones: item.repeticiones || "", carga: item.carga || "", unidad: item.unidad || "Kg", rpe: item.rpe || "", tipo: item.tipo || "T. Superior", url: item.url || "", deleted: Boolean(item.deleted) }));
    while (moduleData.activacion.length < 10) moduleData.activacion.push(defaultExercise("T. Superior"));

    const p = session.modules?.principal || session.principal;
    moduleData.principal.blocks = { bloque1: defaultPrincipalBlock(), bloque2: defaultPrincipalBlock(), bloque3: defaultPrincipalBlock(), bloque4: defaultPrincipalBlock() };

    if (p?.blocks) {
      ["bloque1", "bloque2", "bloque3", "bloque4"].forEach(key => {
        const block = p.blocks[key] || defaultPrincipalBlock();
        moduleData.principal.blocks[key] = {
          notes: block.notes || "",
          exercises: (block.exercises || []).map(item => ({ nombre: item.nombre || "", series: item.series || "", repeticiones: item.repeticiones || "", carga: item.carga || "", unidad: item.unidad || "Kg", rpe: item.rpe || "", tipo: item.tipo || "F. ppal. TS", url: item.url || "", deleted: Boolean(item.deleted) }))
        };
        while (moduleData.principal.blocks[key].exercises.length < 4) moduleData.principal.blocks[key].exercises.push(defaultExercise("F. ppal. TS"));
      });
    }

    saveSessionBtn.textContent = "Actualizar sesión";
    saveSessionBtn.dataset.editing = sessionId;
    activePrincipalBlock = "bloque1";
    renderModule("movilidad");
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
  const allSessions = pmReadJson("sessions", []);
  const completed = pmReadJson("completedSessions", []);
  const notifications = pmReadJson("notifications", []);
  const patientByNickname = new Map(
    patients.map(patient => [pmNormalizeNickname(patient.nickname), patient])
  );

  // Cada sesión es una unidad independiente. Nunca se agrupa por paciente ni
  // se conserva únicamente la última: un cliente puede tener varias pendientes.
  const seen = new Set();
  const rows = (Array.isArray(allSessions) ? allSessions : [])
    .map((session, index) => ({ session, index }))
    .filter(({ session, index }) => {
      const key = pmSessionStableKey(session, index);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(({ session }) => {
      const nickname = pmSessionPatientKey(session);
      const patient = patientByNickname.get(pmNormalizeNickname(nickname));
      return {
        patient: patient || { nombre: session.patientName || session.nombrePaciente || nickname || "Paciente", nickname },
        session
      };
    });

  const sortRowsLatest = list => list.slice().sort((a, b) => {
    const fa = String(a.session?.fecha || "");
    const fb = String(b.session?.fecha || "");
    if (fa !== fb) return fb.localeCompare(fa);
    return pmSessionNumber(b.session) - pmSessionNumber(a.session);
  });

  const pending = sortRowsLatest(
    rows.filter(item => !pmIsSessionCompleted(item.session, completed, notifications))
  );
  const done = sortRowsLatest(
    rows.filter(item => pmIsSessionCompleted(item.session, completed, notifications))
  );

  return { pending, done };
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
    setCard(0, "Pacientes activos", patients.length);
    setCard(1, "Ejercicios biblioteca", exerciseLibrary.length, [
      `Movilidad: ${movilidad}`,
      `Activación: ${activacion}`,
      `Sesión Principal: ${principal}`
    ]);
    setCard(2, "Archivos guardados", patientFiles.length);
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

const bibliotecaHTML = `
  <h2>Biblioteca de ejercicios</h2>
  <p>Guarda ejercicios con categoría, tipo, descripción y URL. Luego se conectan con Movilidad, Activación y Sesión Principal.</p>

  <form class="patient-form" id="libraryForm">
    <input id="libraryEditingId" type="hidden" />

    <div class="form-grid-2">
      <div>
        <label for="libraryName">Nombre del ejercicio</label>
        <input id="libraryName" type="text" placeholder="Ej: Cat Camel, Sentadilla, Drop Jump..." required />
      </div>

      <div class="field-full">
        <label>Categorías del ejercicio</label>
        <div class="library-category-checks" id="libraryCategoryChecks">
          <label><input type="checkbox" name="libraryCategories" value="Movilidad" /> <span>Movilidad</span></label>
          <label><input type="checkbox" name="libraryCategories" value="Activación" /> <span>Activación</span></label>
          <label><input type="checkbox" name="libraryCategories" value="Sesión Principal" /> <span>Sesión Principal</span></label>
        </div>
        <small class="form-hint">Puedes marcar varias. El ejercicio aparecerá en creación de sesiones en todas las categorías marcadas.</small>
      </div>

      <div>
        <label for="libraryType">Tipo</label>
        <input id="libraryType" type="text" placeholder="Ej: Core, F. ppal. TI, Fascias..." />
      </div>

      <div>
        <label for="libraryUrl">URL vídeo/enlace</label>
        <input id="libraryUrl" type="url" placeholder="https://..." />
      </div>

      <div class="field-full">
        <label for="libraryDescription">Descripción técnica</label>
        <textarea id="libraryDescription" placeholder="Indicaciones, errores comunes, objetivo del ejercicio..."></textarea>
      </div>
    </div>

    <div class="form-actions">
      <button class="primary-btn" id="librarySubmitBtn" type="submit">Guardar ejercicio</button>
      <button class="secondary-btn" type="button" id="seedLibraryBtn">Cargar biblioteca inicial</button>
    </div>
  </form>

  <div class="patient-form" style="margin-top:26px;">
    <label for="libraryFilter">Filtrar biblioteca</label>
    <select id="libraryFilter">
      <option value="">Todas las categorías</option>
      <option value="Movilidad">Movilidad</option>
      <option value="Activación">Activación</option>
      <option value="Sesión Principal">Sesión Principal</option>
    </select>
  </div>

  <div class="library-list" id="libraryList"></div>
`;

function renderLibraryList() {
  const list = document.getElementById("libraryList");
  const filter = document.getElementById("libraryFilter");
  if (!list) return;

  const visible = exerciseLibrary.filter(item => libraryHasCategory(item, filter?.value || ""));

  if (visible.length === 0) {
    list.innerHTML = `<p>No hay ejercicios en la biblioteca todavía.</p>`;
    return;
  }

  list.innerHTML = visible.map(item => `
    <article class="library-card">
      <div class="library-card-header">
        <span class="file-type">${getLibraryCategories(item).join(" · ") || "Sin categoría"}</span>
        <span class="history-date">${item.type || "-"}</span>
      </div>
      <h3>${item.name}</h3>
      <p>${item.description || "Sin descripción."}</p>
      <div class="patient-tags">
        ${renderLibraryCategoryBadges(item)}
        ${item.url ? `<span>URL guardada</span>` : `<span>Sin URL</span>`}
      </div>
      <div class="file-actions">
        ${item.url ? `<a class="secondary-btn" href="${item.url}" target="_blank">▶ Ver</a>` : ""}
        <button class="edit-btn" type="button" onclick="editLibraryExercise('${item.id}')">Editar</button>
        <button class="danger-btn" type="button" onclick="deleteLibraryExercise('${item.id}')">Eliminar</button>
      </div>
    </article>
  `).join("");
}

function bindLibraryForm() {
  const form = document.getElementById("libraryForm");
  const filter = document.getElementById("libraryFilter");
  if (!form) return;

  filter.addEventListener("change", renderLibraryList);

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
    form.reset();
    document.querySelectorAll('input[name="libraryCategories"]').forEach(input => input.checked = false);
    document.getElementById("libraryEditingId").value = "";
    document.getElementById("librarySubmitBtn").textContent = "Guardar ejercicio";
    renderLibraryList();
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
    document.getElementById("libraryType").value = item.type || "";
    document.getElementById("libraryUrl").value = item.url || "";
    document.getElementById("libraryDescription").value = item.description || "";
    document.getElementById("librarySubmitBtn").textContent = "Actualizar ejercicio";
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      dates: []
    };
  }

    grouped[key].series += getSessionTotalSeries(session);
    grouped[key].exercises += getSessionExercises(session).length;
    grouped[key].sessionsInMicro += 1;
    if (session.fecha && !grouped[key].dates.includes(session.fecha)) {
      grouped[key].dates.push(session.fecha);
    }
    grouped[key].tonnage += getSessionTonnage(session);
  });

  const ordered = Object.values(grouped).sort((a, b) => a.micro - b.micro);
  ordered.forEach(item => {
  item.sessions = item.sessionsInMicro;
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
      dates: item.dates || []
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
          dates: []
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
    const sessionDates = (item.dates || []).filter(Boolean);
    const sessionDatesLabel = sessionDates.length ? sessionDates.join(" · ") : "Sin fechas registradas";

    const tooltipLines = [
      item.label,
      `Sesiones: ${realSessions}`,
      `Ejercicios: ${item.exercises ?? 0}`,
      `Series: ${item.series ?? 0}`,
      Number(item.tonnage || 0) ? `Tonelaje: ${Math.round(item.tonnage)} kg` : "",
      sessionDates.length ? `Fechas: ${sessionDates.join(" · ")}` : ""
    ].filter(Boolean);

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
        <strong>${currentLabel}${item.label}</strong>
        <small>
          ${isCurrentMicro ? " · " : ""}${realSessions} sesión${realSessions === 1 ? "" : "es"}
        </small>
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

function bindPeriodicityPanel() {
  const filter = document.getElementById("periodicityPatientFilter");
  if (!filter) return;

  const getPeriodicityNickname = () => {
    const value = String(filter.value || "").trim();
    const selectedText = String(filter.options?.[filter.selectedIndex]?.textContent || "").trim();

    const patient =
      patients.find(p => String(p.nickname || "") === value) ||
      patients.find(p => String(p.nombre || "") === value) ||
      patients.find(p => String(p.nickname || "") === selectedText) ||
      patients.find(p => String(p.nombre || "") === selectedText);

    return patient ? patient.nickname : value;
  };

  const clearPeriodicity = () => {
    ["weeklyVolumeChart", "plyometricVolumeChart", "tonnageChart", "distributionChart"].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.innerHTML = `<p class="empty-chart-message">Selecciona un paciente para ver las gráficas.</p>`;
    });

    ["weeklyVolumeTableBody", "plyometricVolumeTableBody", "tonnageTableBody"].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.innerHTML = `<tr><td colspan="4">Selecciona un paciente para ver datos.</td></tr>`;
    });
  };

  const run = () => {
    const nickname = getPeriodicityNickname();

    if (typeof renderPeriodicityPatientCard === "function") {
      renderPeriodicityPatientCard(nickname);
    }

    if (!nickname) {
      clearPeriodicity();
      return;
    }

    renderWeeklyVolumeChart(nickname);

    if (typeof updatePeriodicityDistributionChart === "function") {
      updatePeriodicityDistributionChart(nickname);
    }
  };

  filter.addEventListener("change", run);
  run();
}




function deleteSession(sessionId) {
  const session = sessions.find(item => item.id === sessionId);
  if (!session) return;

  const confirmed = confirm(`¿Eliminar la sesión nº ${session.numero}?`);
  if (!confirmed) return;

  sessions = sessions.filter(item => item.id !== sessionId);
  localStorage.setItem("sessions", JSON.stringify(sessions));
  renderSection("sesiones");
}

function deleteSelectedSessions() {
  const selected = [...document.querySelectorAll(".session-select:checked")].map(input => input.value);

  if (selected.length === 0) {
    alert("Selecciona al menos una sesión.");
    return;
  }

  const confirmed = confirm(`¿Eliminar ${selected.length} sesión${selected.length === 1 ? "" : "es"} seleccionada${selected.length === 1 ? "" : "s"}?`);
  if (!confirmed) return;

  sessions = sessions.filter(item => !selected.includes(item.id));
  localStorage.setItem("sessions", JSON.stringify(sessions));
  renderSection("sesiones");
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

function getComputedMicrocycleNumber(patientNickname, date) {
  if (!patientNickname || !date) return "-";

  const dates = getPatientSortedSessionDates(patientNickname);
  if (!dates.includes(date)) dates.push(date);
  dates.sort();

  return dates.indexOf(date) + 1;
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

function radarSvg(items) {
  const safeItems = (items || []).map(item => ({
    label: item.label,
    v: Number(item.v ?? item.value ?? 0) || 0
  }));

  const total = safeItems.reduce((sum, item) => sum + item.v, 0);
  const maxValue = Math.max(...safeItems.map(item => item.v), 1);

  const cx = 200;
  const cy = 200;
  const radius = 118;

  function axisPoint(index, customRadius = radius) {
    const angle = (-90 + (360 / safeItems.length) * index) * Math.PI / 180;
    return {
      x: cx + Math.cos(angle) * customRadius,
      y: cy + Math.sin(angle) * customRadius,
      angle
    };
  }

  const dataPoints = safeItems.map((item, index) => {
    const axis = axisPoint(index, radius);
    const labelPoint = axisPoint(index, radius + 38);
    const normalized = Math.max(0, Math.min(1, item.v / maxValue));
    const angle = axis.angle;
    const percent = total ? safeDistributionPercent(item.v, total) : 0;

    return {
      ...item,
      percent,
      x: cx + Math.cos(angle) * radius * normalized,
      y: cy + Math.sin(angle) * radius * normalized,
      labelX: labelPoint.x,
      labelY: labelPoint.y
    };
  });

  const polygon = dataPoints.map(point => `${point.x},${point.y}`).join(" ");

  const grid = [0.25, 0.5, 0.75, 1].map(scale => {
    const gridPoints = safeItems.map((_, index) => {
      const point = axisPoint(index, radius * scale);
      return `${point.x},${point.y}`;
    }).join(" ");

    return `<polygon points="${gridPoints}" class="radar-grid-line" />`;
  }).join("");

  const axisLines = safeItems.map((_, index) => {
    const point = axisPoint(index, radius);
    return `<line x1="${cx}" y1="${cy}" x2="${point.x}" y2="${point.y}" class="radar-axis-line" />`;
  }).join("");

  const strongest = safeItems.reduce((best, item) => item.v > best.v ? item : best, { label: "-", v: -1 });

  return `
    <div class="radar-pro2-wrap">
      <svg class="radar-pro2-svg" viewBox="0 0 400 400" role="img">
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#22c55e" stop-opacity="0.42"/>
            <stop offset="100%" stop-color="#14b8a6" stop-opacity="0.05"/>
          </radialGradient>
          <filter id="radarShadow">
            <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#22c55e" flood-opacity="0.22"/>
          </filter>
        </defs>

        ${grid}
        ${axisLines}

        <polygon points="${polygon}" class="radar-data-area" filter="url(#radarShadow)" />
        <polygon points="${polygon}" class="radar-data-line" />

        ${dataPoints.map(point => `
          <g class="radar-pro2-point"
             data-label="${point.label}"
             data-value="${point.v}"
             data-percent="${point.percent}">
            <circle cx="${point.x}" cy="${point.y}" r="13" class="radar-point-hit" />
            <circle cx="${point.x}" cy="${point.y}" r="6" class="radar-point-core" />
          </g>
        `).join("")}

        ${dataPoints.map(point => `
          <text x="${point.labelX}" y="${point.labelY}" text-anchor="middle" dominant-baseline="middle" class="radar-pro2-label">
            ${point.label}
          </text>
        `).join("")}
      </svg>

      <div class="radar-pro2-focus-card">
        <span>Mayor foco</span>
        <strong>${strongest.label}</strong>
        <small>${strongest.v < 0 ? 0 : strongest.v} series</small>
      </div>

      <div class="radar-pro2-tooltip" id="radarTooltip">
        <span>Categoría</span>
        <strong>-</strong>
        <p>- series · -%</p>
      </div>
    </div>
  `;
}


function renderGraphProDashboard(patientNickname = "") {
  const patient = patients.find(item => item.nickname === patientNickname);
  const totals = getPatientAnalytics(patientNickname);

  const radarValues = [
    { label: "TS", v: Number(totals.ts) || 0 },
    { label: "TI", v: Number(totals.ti) || 0 },
    { label: "Core", v: Number(totals.core) || 0 },
    { label: "Plyo", v: Number(totals.plyo) || 0 },
    { label: "Mov.", v: Number(totals.movilidad) || 0 },
    { label: "Act.", v: Number(totals.activacion) || 0 }
  ];

  return `
    <section class="graph-pro-hero">
      <div>
        <p class="eyebrow">Radar integral</p>
        <h2>${patient ? patient.nombre : "Todos los pacientes"}</h2>
        <p>Vista global de distribución, volumen, ejercicios y carga externa.</p>
      </div>
      ${getPatientPhotoSafe(patient) ? `<img src="${getPatientPhotoSafe(patient)}" alt="${patient.nombre}">` : `<div class="graph-pro-avatar">${patient ? patient.nombre.charAt(0).toUpperCase() : "PRO"}</div>`}
    </section>

    <section class="periodicity-kpi-grid graph-pro-kpis">
      <article class="periodicity-kpi"><span>Sesiones</span><strong>${totals.sessions}</strong></article>
      <article class="periodicity-kpi"><span>Series</span><strong>${totals.series}</strong></article>
      <article class="periodicity-kpi"><span>Ejercicios</span><strong>${totals.exercises}</strong></article>
      <article class="periodicity-kpi"><span>Tonelaje Kg</span><strong>${Math.round(totals.tonnage)}</strong></article>
      <article class="periodicity-kpi plyo"><span>Plyo</span><strong>${totals.plyo}</strong></article>
      <article class="periodicity-kpi"><span>Core</span><strong>${totals.core}</strong></article>
    </section>

    <section class="graph-pro-grid">
      <article class="graph-pro-card">
        <div class="module-panel-header">
          <div>
            <p class="eyebrow">Radar PRO</p>
            <h3>TS · TI · Core · Plyo · Movilidad · Activación</h3>
          </div>
        </div>
        ${radarSvg(radarValues)}
      </article>

      <article class="graph-pro-card">
        <div class="module-panel-header">
          <div>
            <p class="eyebrow">Detalle</p>
            <h3>Series por categoría</h3>
          </div>
        </div>

        <div class="distribution-chart">
          ${radarValues.map(item => {
            const max = Math.max(...radarValues.map(v => Number(v.v ?? v.value ?? 0)), 1);
            const percent = Math.round(((Number(item.v ?? item.value ?? 0)) / max) * 100);
            return `
              <div class="distribution-row">
                <span>${item.label}</span>
                <div class="distribution-track"><div class="distribution-fill" style="width:${Number.isFinite(percent) ? percent : 0}%"></div></div>
                <strong>${Number(item.v ?? item.value ?? 0)}</strong>
              </div>
            `;
          }).join("")}
        </div>
      </article>
    </section>
  `;
}


function bindRadarTooltips() {
  const tooltip = document.getElementById("radarTooltip");
  const wrap = document.querySelector(".radar-pro2-wrap") || document.querySelector(".radar-tooltip-wrap");
  if (!tooltip || !wrap) return;

  document.querySelectorAll(".radar-pro2-point, .radar-point").forEach(point => {
    point.addEventListener("mouseenter", () => {
      tooltip.querySelector("span").textContent = point.dataset.label;
      tooltip.querySelector("strong").textContent = `${point.dataset.value} series`;
      tooltip.querySelector("p").textContent = `${point.dataset.percent}% del trabajo registrado`;

      const target = point.querySelector(".radar-point-core") || point;
      const wrapRect = wrap.getBoundingClientRect();
      const pointRect = target.getBoundingClientRect();

      let left = pointRect.left - wrapRect.left + 24;
      let top = pointRect.top - wrapRect.top - 54;

      const maxLeft = wrapRect.width - 230;
      if (left > maxLeft) left = pointRect.left - wrapRect.left - 230;
      if (left < 8) left = 8;
      if (top < 8) top = pointRect.top - wrapRect.top + 24;

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;

      tooltip.classList.add("show");
      point.classList.add("active");
    });

    point.addEventListener("mouseleave", () => {
      tooltip.classList.remove("show");
      point.classList.remove("active");
    });
  });
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

  const rows = [
    ["Sesiones", "sessions"],
    ["Series", "series"],
    ["Ejercicios", "exercises"],
    ["Tonelaje Kg", "tonnage"],
    ["TS", "ts"],
    ["TI", "ti"],
    ["Core", "core"],
    ["Plyo", "plyo"],
    ["Movilidad", "mov"],
    ["Activación", "act"]
  ];

  const max = Math.max(...rows.map(row => Math.max(aStats[row[1]] || 0, bStats[row[1]] || 0)), 1);

  return `
    <section class="graph-pro-card micro-compare-card">
      <div class="module-panel-header">
        <div>
          <p class="eyebrow">Comparativa microciclos</p>
          <h3>M${aStats.micro} vs M${bStats.micro}</h3>
        </div>
        <span>Por defecto: último micro vs anterior</span>
      </div>

      <div class="micro-compare-selectors">
        <div>
          <label for="microCompareA">Micro base</label>
          <select id="microCompareA">${renderMicroOptions(micros, aStats.micro)}</select>
        </div>
        <div>
          <label for="microCompareB">Micro comparado</label>
          <select id="microCompareB">${renderMicroOptions(micros, bStats.micro)}</select>
        </div>
      </div>

      <div class="micro-compare-table">
        ${rows.map(([label, key]) => {
          const a = Math.round(aStats[key] || 0);
          const b = Math.round(bStats[key] || 0);
          const diff = b - a;
          const widthA = Math.max((a / max) * 100, a ? 6 : 0);
          const widthB = Math.max((b / max) * 100, b ? 6 : 0);
          return `
            <div class="micro-compare-row">
              <strong>${label}</strong>
              <div class="micro-compare-bars">
                <div class="micro-bar-line"><span>M${aStats.micro}</span><div><i style="width:${widthA}%"></i></div><b>${a}</b></div>
                <div class="micro-bar-line active"><span>M${bStats.micro}</span><div><i style="width:${widthB}%"></i></div><b>${b}</b></div>
              </div>
              <em class="${diff >= 0 ? "positive" : "negative"}">${diff >= 0 ? "+" : ""}${diff}</em>
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function bindGraphPro() {
  const filter = document.getElementById("graphProPatientFilter");
  const area = document.getElementById("graphProArea");
  if (!filter || !area) return;

  function bindMicroCompareSelectors() {
    const microA = document.getElementById("microCompareA");
    const microB = document.getElementById("microCompareB");

    if (!microA || !microB) return;

    const rerenderCompare = () => {
      const compareArea = document.getElementById("microCompareArea");
      if (!compareArea || !filter.value) return;
      compareArea.innerHTML = renderMicroComparison(filter.value, microA.value, microB.value);
      bindMicroCompareSelectors();
    };

    microA.addEventListener("change", rerenderCompare);
    microB.addEventListener("change", rerenderCompare);
  }

  function emptyGraphPro() {
    area.innerHTML = `
      <section class="graph-pro-card empty-graph-pro">
        <p class="eyebrow">Gráfica PRO</p>
        <h3>Selecciona un paciente</h3>
        <p>Elige un paciente en el buscador para cargar radar, KPIs y comparativa entre microciclos.</p>
      </section>
    `;

    const compareArea = document.getElementById("microCompareArea");
    if (compareArea) compareArea.innerHTML = "";
  }

  function run() {
    if (!filter.value) {
      emptyGraphPro();
      return;
    }

    if (typeof renderGraphPro === "function") {
      area.innerHTML = renderGraphPro(filter.value);
    } else {
      area.innerHTML = renderGraphProDashboard(filter.value);
    }

    if (typeof bindRadarTooltips === "function") bindRadarTooltips();

    const compareArea = document.getElementById("microCompareArea");
    if (compareArea) {
      compareArea.innerHTML = renderMicroComparison(filter.value);
      bindMicroCompareSelectors();
    }
  }

  filter.addEventListener("change", run);
  run();
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
          <p class="admin-home-date">${todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1)}</p>
          <p class="admin-home-subtitle">Tu equipo, tus sesiones y la actividad de hoy, en un solo vistazo.</p>
        </div>
        <div class="admin-home-hero-side">
          <div class="admin-home-today-summary">
            <span>HOY</span>
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
            <button type="button" data-home-section="graficaPro"><span>🕸️</span><b>Gráfica PRO</b><small>Analizar distribución</small><i>›</i></button>
            <button type="button" data-home-section="periodicidad"><span>📅</span><b>Periodicidad</b><small>Planificación anual</small><i>›</i></button>
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
  sesiones: {
    title: "Creación sesiones",
    html: `
      <h2>Creación de sesiones</h2>
      <p>Busca un cliente, crea la sesión automática y trabaja por bloques: Movilidad, Activación y Sesión Principal.</p>

      <form class="patient-form" id="sessionsForm">
        <div class="session-search-clean">
          <div>
            <label for="sessionPatientSearch">Selecciona cliente</label>
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

        <section class="session-module-kpis">
          <button class="session-module-btn active" type="button" data-module="movilidad">
            <span class="action-icon">🧘</span><strong>Movilidad</strong><small>10 ejercicios</small>
          </button>
          <button class="session-module-btn" type="button" data-module="activacion">
            <span class="action-icon">⚡</span><strong>Activación</strong><small>10 ejercicios + RPE</small>
          </button>
          <button class="session-module-btn" type="button" data-module="principal">
            <span class="action-icon">🏋️</span><strong>Sesión Principal</strong><small>4 bloques x 4 ejercicios</small>
          </button>
        </section>

        <section class="session-module-panel">
          <div class="module-panel-header">
            <div>
              <p class="eyebrow">Bloque de trabajo</p>
              <h3 id="activeModuleTitle">Movilidad</h3>
            </div>
            <span id="activeModuleCount">10 ejercicios</span>
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
          <div id="moduleExercises"></div>
        </section>

        <button class="primary-btn" type="submit" id="saveSessionBtn">Guardar sesión</button>
      </form>

      <div class="patient-form" style="margin-top:26px;">
        <label for="sessionsFilter">Filtrar sesiones por paciente</label>
        <select id="sessionsFilter">
          <option value="" selected disabled>Selecciona paciente</option>
          ${patientOptions().replace('<option value="">Selecciona paciente</option>', '')}
        </select>
      </div>

      <div class="sessions-list" id="sessionsList"></div>
    `,
    afterRender: bindSessionsForm
  },
  periodicidad: {
    title: "Periodicidad",
    html: `
      <h2>Periodicidad PRO</h2>
      <p>Control de volumen, ejercicios, pliometría, distribución y tonelaje por microciclo.</p>

      <div class="patient-form" style="margin-top:24px;">
        <label for="periodicityPatientFilter">Filtrar por paciente</label>
        <select id="periodicityPatientFilter">
          <option value="" selected disabled>Selecciona paciente</option>
          ${patientOptions().replace('<option value="">Selecciona paciente</option>', '')}
        </select>
      </div>

      <div id="periodicityPatientCard"></div>

      <section class="periodicity-kpi-grid" id="periodicityKpis"></section>

      <section class="periodicity-dashboard">
        <article class="periodicity-card">
          <div class="module-panel-header">
            <div>
              <p class="eyebrow">Volumen semanal</p>
              <h3>Series por microciclo</h3>
            </div>
            <span>M1 · M2 · M3...</span>
          </div>
          <div class="volume-chart" id="weeklyVolumeChart"></div>
        </article>

        <article class="periodicity-card">
          <div class="module-panel-header">
            <div>
              <p class="eyebrow">Resumen total</p>
              <h3>Detalle por microciclo</h3>
            </div>
          </div>
          <div class="volume-table-wrap">
            <table class="volume-table">
              <thead><tr><th>Microciclo</th><th>Sesiones</th><th>Ejercicios</th><th>Series</th></tr></thead>
              <tbody id="weeklyVolumeTableBody"></tbody>
            </table>
          </div>
        </article>
      </section>

      <section class="periodicity-dashboard">
        <article class="periodicity-card">
          <div class="module-panel-header">
            <div>
              <p class="eyebrow">Volumen pliometría</p>
              <h3>Series de pliometría por microciclo</h3>
            </div>
            <span>Plyo Extensiva · Plyo Intensiva · Pliometría</span>
          </div>
          <div class="volume-chart plyo-chart" id="plyometricVolumeChart"></div>
        </article>

        <article class="periodicity-card">
          <div class="module-panel-header">
            <div>
              <p class="eyebrow">Resumen pliometría</p>
              <h3>Detalle pliométrico anual</h3>
            </div>
          </div>
          <div class="volume-table-wrap">
            <table class="volume-table">
              <thead><tr><th>Microciclo</th><th>Sesiones</th><th>Ejercicios Plyo</th><th>Series Plyo</th></tr></thead>
              <tbody id="plyometricVolumeTableBody"></tbody>
            </table>
          </div>
        </article>
      </section>

      <section class="periodicity-dashboard kg-dashboard-row">
        <article class="periodicity-card">
          <div class="module-panel-header">
            <div>
              <p class="eyebrow">Tonelaje</p>
              <h3>Kg totales por microciclo</h3>
            </div>
            <span>Series × Reps × Kg</span>
          </div>
          <div class="volume-chart tonnage-chart" id="tonnageChart"></div>
        </article>

        <article class="periodicity-card">
          <div class="module-panel-header">
            <div>
              <p class="eyebrow">Resumen tonelaje</p>
              <h3>Detalle de carga externa</h3>
            </div>
          </div>
          <div class="volume-table-wrap">
            <table class="volume-table">
              <thead><tr><th>Microciclo</th><th>Sesiones</th><th>Ejercicios</th><th>Tonelaje Kg</th></tr></thead>
              <tbody id="tonnageTableBody"></tbody>
            </table>
          </div>
        </article>
      </section>

      <section class="periodicity-dashboard distribution-dashboard-row">
        <article class="periodicity-card distribution-wide-card">
          <div class="module-panel-header">
            <div>
              <p class="eyebrow">Distribución</p>
              <h3>TS · TI · Core · Plyo</h3>
            </div>
          </div>
          <div class="distribution-chart" id="distributionChart"></div>
        </article>
      </section>
    `,
    afterRender: bindPeriodicityPanel
  },
  graficaPro: {
    title: "Gráfica PRO",
    html: `
      <h2>Gráfica PRO</h2>
      <p>Radar completo por cliente para ver distribución, volumen y carga de un vistazo.</p>

      <div class="patient-form" style="margin-top:24px;">
        <label for="graphProPatientFilter">Filtrar por paciente</label>
        <select id="graphProPatientFilter">
          <option value="" selected disabled>Selecciona paciente</option>
          ${patientOptions().replace('<option value="">Selecciona paciente</option>', '')}
        </select>
      </div>

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
  document.body.classList.toggle("admin-home-active", isHome);
  sectionTitle.textContent = section.title;
  contentArea.innerHTML = typeof section.html === "function" ? section.html() : section.html;
  if (!isHome) pmSetDashboardKpis(key);
  if (section.afterRender) section.afterRender();
  if (!isHome) pmSetDashboardKpis(key);
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
document.addEventListener("keydown", event => { if (event.key === "Escape") pmCloseAdminMoreSheet(); });

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
    const active = document.querySelector('.nav-item.active')?.dataset.section || "paciente";
    pmSetDashboardKpis(active === "usuarios" ? "usuarios" : "paciente");
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
