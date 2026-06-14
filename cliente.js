(async function PPF_APP_BOOTSTRAP() {
  try {
    if (window.PPF_SUPABASE_READY) {
      await window.PPF_SUPABASE_READY;
    }
  } catch (error) {
    console.warn("Supabase bootstrap error:", error);
  }

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

function pmClientUserStatKey(value = "") {
  return String(value || "").trim().toLowerCase();
}

function pmClientUpdateOnlineState(online, options = {}) {
  const pushCloud = options.pushCloud !== false;
  try {
    const user = JSON.parse(localStorage.getItem("currentUser") || "null") || currentUser;
    if (!user) return;

    const stats = JSON.parse(localStorage.getItem("userStats") || "{}");
    const key = pmClientUserStatKey(user.nickname || user.username);
    if (!key) return;

    stats[key] = stats[key] || { count: 0, online: false, lastLogin: null, lastSeen: null };
    const now = new Date().toISOString();
    stats[key].online = Boolean(online);
    if (online) {
      if (!Number(stats[key].count || 0) && !stats[key].lastLogin) {
        stats[key].count = 1;
        stats[key].lastLogin = now;
      }
      stats[key].lastSeen = now;
      delete stats[key].lastLogout;
    } else {
      stats[key].lastLogout = now;
      stats[key].online = false;
      // Hacemos que el último logout domine sobre lastSeen para que admin lo pinte offline al instante.
      stats[key].lastSeen = now;
    }

    localStorage.setItem("userStats", JSON.stringify(stats));

    if (pushCloud && window.PPF_SUPABASE && typeof window.PPF_SUPABASE.pushKey === "function") {
      window.PPF_SUPABASE.pushKey("userStats").catch(() => {});
    }
  } catch (error) {
    console.warn("No se pudo actualizar estado online:", error);
  }
}

window.PPF_LOGOUT_AND_SYNC = async function PPF_LOGOUT_AND_SYNC() {
  pmClientUpdateOnlineState(false, { pushCloud: false });
  try {
    if (window.PPF_SUPABASE && typeof window.PPF_SUPABASE.pushKey === "function") {
      await window.PPF_SUPABASE.pushKey("userStats");
    }
  } catch (_) {}

  // Pequeño margen para que el navegador termine la subida antes de cambiar de página.
  await new Promise(resolve => setTimeout(resolve, 120));
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
};

if (currentUser && currentUser.role === "client") {
  pmClientUpdateOnlineState(true);
  setInterval(() => pmClientUpdateOnlineState(true), 60000);
  window.addEventListener("pagehide", () => {
    pmClientUpdateOnlineState(false);
  });
}

if (!currentUser || currentUser.role !== "client") {
  window.location.href = "index.html";
}

let patients = JSON.parse(localStorage.getItem("patients")) || [];
let sessions = JSON.parse(localStorage.getItem("sessions")) || [];
let histories = JSON.parse(localStorage.getItem("histories")) || [];
let patientFiles = JSON.parse(localStorage.getItem("patientFiles")) || [];
let completedSessions = JSON.parse(localStorage.getItem("completedSessions")) || [];

let currentPatient = patients.find(patient => patient.nickname === currentUser.nickname);
let currentClient = currentPatient;

if (!currentPatient) {
  alert("No se han encontrado tus datos de cliente.");
  if (window.PPF_LOGOUT_AND_SYNC) { window.PPF_LOGOUT_AND_SYNC(); return; }
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

const clientSectionTitle = document.getElementById("clientSectionTitle");
const clientContentArea = document.getElementById("clientContentArea");
const clientHeaderName = document.getElementById("clientHeaderName");
const clientAvatar = document.getElementById("clientAvatar");
const clientNavItems = document.querySelectorAll(".client-nav-item");

clientHeaderName.textContent = currentPatient.nombre;
clientAvatar.textContent = currentPatient.nombre.charAt(0).toUpperCase();

function fileVisual(file) {
  const isImage = file.mimeType && file.mimeType.startsWith("image/");
  if (isImage) {
    return `<img src="${file.data}" alt="${file.title}">`;
  }

  if (file.mimeType === "application/pdf") {
    return `<span>📄</span>`;
  }

  return `<span>📝</span>`;
}

function renderClientSessions() {
  const mySessions = getClientCompletedSessions();

  if (mySessions.length === 0) {
    return `<p>De momento no tienes sesiones terminadas.</p>`;
  }

  function simpleModule(session, key, title) {
    const exercises = (session.modules?.[key] || []).filter(item => !item.deleted && (item.nombre || item.series || item.repeticiones || item.url));

    return `
      <div class="session-summary-box">
        <strong>${title}</strong>
        <ul>
          ${exercises.length ? exercises.map(item => `
            <li>${item.nombre || "Ejercicio"} · ${item.series || "-"} series · ${item.repeticiones || "-"} reps${key === "activacion" && item.rpe ? ` · RPE ${item.rpe}` : ""}${item.url ? ` · <a href="${item.url}" target="_blank">▶ Ver vídeo</a>` : ""}</li>
          `).join("") : "<li>Sin ejercicios asignados</li>"}
        </ul>
      </div>
    `;
  }

  function principalModule(session) {
    const principal = session.modules?.principal;

    if (!principal?.blocks) {
      return `<div class="session-summary-box"><strong>Sesión Principal</strong><ul><li>Sin ejercicios asignados</li></ul></div>`;
    }

    const blocks = ["bloque1", "bloque2", "bloque3", "bloque4"].map((key, index) => {
      const block = principal.blocks[key];
      const exercises = (block?.exercises || []).filter(item => !item.deleted && (item.nombre || item.series || item.repeticiones || item.url));

      if (!block?.notes && exercises.length === 0) return "";

      return `
        <div class="client-principal-block">
          <strong>Bloque ${index + 1}</strong>
          ${block?.notes ? `<p>${block.notes}</p>` : ""}
          <ul>
            ${exercises.map(item => `
              <li>${item.nombre || "Ejercicio"} · ${item.series || "-"} series · ${item.repeticiones || "-"} reps${item.carga ? ` · ${item.carga} ${item.unidad || "Kg"}` : ""}${item.rpe ? ` · RPE ${item.rpe}` : ""}${item.url ? ` · <a href="${item.url}" target="_blank">▶ Ver vídeo</a>` : ""}</li>
            `).join("")}
          </ul>
        </div>
      `;
    }).join("");

    return `<div class="session-summary-box session-principal-summary"><strong>Sesión Principal</strong>${blocks || "<ul><li>Sin ejercicios asignados</li></ul>"}</div>`;
  }

  return `
    <div class="sessions-list">
      ${mySessions.map(session => `
        <article class="session-card">
          <div class="session-card-header">
            <span class="session-badge">Sesión nº ${session.numero}</span>
            <span class="session-date">${getClientMicroLabel(session)}</span>
          </div>

          <div class="session-summary session-summary-3">
            ${simpleModule(session, "movilidad", "Movilidad")}
            ${simpleModule(session, "activacion", "Activación")}
            ${principalModule(session)}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderClientHistory() {
  const myHistory = histories.filter(item => item.patientNickname === currentPatient.nickname);

  if (myHistory.length === 0) {
    return `<p>De momento no tienes registros en el historial.</p>`;
  }

  return `
    <div class="history-list">
      ${myHistory.slice().reverse().map(item => `
        <article class="history-card">
          <div class="history-card-header">
            <span class="history-type">${item.tipo}</span>
            <span class="history-date">${item.fecha}</span>
          </div>

          <h3>${item.tipo}</h3>
          <p>${item.descripcion}</p>

          <div class="history-meta">
            <span>Peso: ${item.peso || "-"} kg</span>
            <span>% graso: ${item.grasa || "-"}</span>
            <span>Estado: ${item.estado || "-"}</span>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderClientFiles() {
  const myFiles = patientFiles.filter(file => file.patientNickname === currentPatient.nickname);

  if (myFiles.length === 0) {
    return `<p>De momento no tienes archivos disponibles.</p>`;
  }

  return `
    <div class="files-list">
      ${myFiles.slice().reverse().map(file => `
        <article class="file-card">
          <div class="file-visual">${fileVisual(file)}</div>

          <div>
            <div class="file-card-header">
              <span class="file-type">${file.category}</span>
              <span class="file-date">${file.date}</span>
            </div>

            <h3>${file.title}</h3>
            <p>${file.notes || "Sin observaciones."}</p>

            <div class="patient-tags">
              <span>${file.fileName}</span>
              <span>${file.mimeType || "archivo"}</span>
            </div>

            <div class="file-actions">
              <a class="secondary-btn" href="${file.data}" download="${file.fileName}">Descargar</a>
              <a class="secondary-btn" href="${file.data}" target="_blank">Abrir</a>
            </div>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}


function getClientSessionExercises(session) {
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

function getClientSessionSeries(session) {
  return getClientSessionExercises(session).reduce((total, item) => {
    const series = Number(item.series);
    return total + (Number.isNaN(series) ? 0 : series);
  }, 0);
}

function getClientSessionTonnage(session) {
  return getClientSessionExercises(session).reduce((total, item) => {
    if ((item.unidad || "Kg") !== "Kg") return total;

    const series = Number(item.series);
    const reps = Number(String(item.repeticiones || "").replace(",", "."));
    const carga = Number(String(item.carga || "").replace(",", "."));

    if (Number.isNaN(series) || Number.isNaN(reps) || Number.isNaN(carga)) return total;

    return total + (series * reps * carga);
  }, 0);
}

function getClientWeeklyData() {
  refreshCompletedSessions();
  const mySessions = sortSessionsOldestFirst(getClientCompletedSessions())
    .filter(session => session.microciclo)
    .sort((a, b) => Number(a.microciclo) - Number(b.microciclo));

  const grouped = {};

  mySessions.forEach(session => {
    const computedMicro = getClientComputedMicro(session);
    const key = `M${computedMicro}`;

    if (!grouped[key]) {
      grouped[key] = {
        micro: Number(computedMicro),
        label: key,
        series: 0,
        exercises: 0,
        sessions: 0,
        sessionsInMicro: 0,
        tonnage: 0,
        dates: new Set()
      };
    }

    grouped[key].series += getClientSessionSeries(session);
    grouped[key].exercises += getClientSessionExercises(session).length;
    grouped[key].sessionsInMicro += 1;
    grouped[key].tonnage += getClientSessionTonnage(session);
    if (session.fecha) grouped[key].dates.add(session.fecha);
  });

  const ordered = Object.values(grouped).sort((a, b) => a.micro - b.micro);
  let cumulativeSessions = 0;

  ordered.forEach(item => {
    cumulativeSessions += item.sessionsInMicro;
    item.sessions = cumulativeSessions;
    item.dateLabel = [...item.dates].join(", ");
  });

  return ordered;
}

function getClientDistribution() {
  const mySessions = getClientCompletedSessions();
  const buckets = {
    "T. Superior": 0,
    "T. Inferior": 0,
    "Core": 0,
    "Plyo": 0,
    "Otros": 0
  };

  mySessions.forEach(session => {
    getClientSessionExercises(session).forEach(item => {
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

function renderClientMiniBars(data, valueKey = "series", emptyMessage = "Sin datos todavía.") {
  if (data.length === 0) {
    return `<p>${emptyMessage}</p>`;
  }

  const maxValue = Math.max(...data.map(item => item[valueKey] || 0), 1);

  return `
    <div class="client-mini-bars clean-chart-bars">
      ${data.map(item => {
        const value = Math.round(item[valueKey] || 0);
        const height = Math.max((value / maxValue) * 100, 6);
        return `
          <div class="client-mini-bar-item">
            <div class="client-mini-bar-wrap" title="${item.sessionsInMicro || 0} sesión/es en ${item.label}${item.dateLabel ? " · " + item.dateLabel : ""}">
              <div class="client-mini-bar" style="height:${height}%"><span>${value}</span></div>
            </div>
            <strong>${item.label}</strong>
            <em>${item.exercises || 0} ej.</em>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderClientDistribution() {
  const data = getClientDistribution();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return `<p>Sin distribución de entrenamiento todavía.</p>`;
  }

  return `
    <div class="distribution-chart">
      ${data.map(item => {
        const percent = Math.round((item.value / total) * 100);
        return `
          <div class="distribution-row">
            <span>${item.label}</span>
            <div class="distribution-track"><div class="distribution-fill" style="width:${percent}%"></div></div>
            <strong>${percent}%</strong>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function getClientDashboardStats() {
  refreshCompletedSessions();
  const mySessions = getClientCompletedSessions();
  const weekly = getClientWeeklyData();
  const latest = weekly[weekly.length - 1];

  const series = mySessions.reduce((sum, session) => sum + getClientSessionSeries(session), 0);
  const exercises = mySessions.reduce((sum, session) => sum + getClientSessionExercises(session).length, 0);
  const tonnage = mySessions.reduce((sum, session) => sum + getClientSessionTonnage(session), 0);

  return {
    sessions: mySessions.length,
    micro: latest ? latest.label : "-",
    series,
    exercises,
    tonnage: Math.round(tonnage),
    history: histories.filter(item => item.patientNickname === currentPatient.nickname).length,
    files: patientFiles.filter(file => file.patientNickname === currentPatient.nickname).length
  };
}

function renderClientLatestSessions() {
  const mySessions = getClientCompletedSessions()
    .slice(0, 4);

  if (mySessions.length === 0) {
    return `<p>No tienes sesiones terminadas todavía.</p>`;
  }

  return `
    <div class="client-latest-list">
      ${mySessions.map(session => `
        <article class="client-latest-card">
          <span class="session-badge">Sesión nº ${session.numero}</span>
          <strong>${getClientMicroLabel(session)}</strong>
          <p>${getClientSessionSeries(session)} series · ${getClientSessionExercises(session).length} ejercicios · ${Math.round(getClientSessionTonnage(session))} Kg</p>
        </article>
      `).join("")}
    </div>
  `;
}

function renderClientDashboard() {
  refreshCompletedSessions();
  const stats = getClientDashboardStats();
  const weekly = getClientWeeklyData();

  return `
    <div class="client-profile-card client-pro-hero">
      ${currentPatient.foto 
        ? `<img class="client-profile-photo" src="${currentPatient.foto}" alt="${currentPatient.nombre}">`
        : `<div class="client-profile-photo fallback">${currentPatient.nombre.charAt(0).toUpperCase()}</div>`
      }

      <div>
        <p class="eyebrow">Dashboard Cliente PRO</p>
        <h2>${currentPatient.nombre}</h2>
        <p>Resumen individual de sesiones, microciclos, carga y evolución del entrenamiento.</p>

        <div class="patient-tags">
          <span>@${currentPatient.nickname}</span>
          <span>${currentPatient.edad || "-"} años</span>
          <span>${currentPatient.peso || "-"} kg</span>
          <span>${currentPatient.altura || "-"} cm</span>
          <span>IMC ${currentPatient.imc || "-"}</span>
          <span>${currentPatient.contenido || "-"}</span>
        </div>
      </div>
    </div>

    <section class="client-pro-kpis">
      <article><span>Sesiones</span><strong>${stats.sessions}</strong></article>
      <article><span>Micro actual</span><strong>${stats.micro}</strong></article>
      <article><span>Series</span><strong>${stats.series}</strong></article>
      <article><span>Ejercicios</span><strong>${stats.exercises}</strong></article>
      <article><span>Tonelaje Kg</span><strong>${stats.tonnage}</strong></article>
      <article><span>Historial</span><strong>${stats.history}</strong></article>
      <article><span>Archivos</span><strong>${stats.files}</strong></article>
    </section>

    <section class="client-pro-grid">
      <article class="client-pro-card">
        <div class="module-panel-header">
          <div>
            <p class="eyebrow">Volumen</p>
            <h3>Series por microciclo</h3>
          </div>
        </div>
        ${renderClientMiniBars(weekly, "series", "Sin series registradas todavía.")}
      </article>

      <article class="client-pro-card">
        <div class="module-panel-header">
          <div>
            <p class="eyebrow">Carga externa</p>
            <h3>Tonelaje por microciclo</h3>
          </div>
        </div>
        ${renderClientMiniBars(weekly, "tonnage", "Sin tonelaje registrado todavía.")}
      </article>

      <article class="client-pro-card">
        <div class="module-panel-header">
          <div>
            <p class="eyebrow">Distribución</p>
            <h3>TS · TI · Core · Plyo</h3>
          </div>
        </div>
        ${renderClientDistribution()}
      </article>

      <article class="client-pro-card">
        <div class="module-panel-header">
          <div>
            <p class="eyebrow">Últimas sesiones</p>
            <h3>Resumen reciente</h3>
          </div>
        </div>
        ${renderClientLatestSessions()}
      </article>
    </section>
  `;
}


function refreshCompletedSessions() {
  completedSessions = JSON.parse(localStorage.getItem("completedSessions")) || [];
}


function getClientSortedSessionDates() {
  return [...new Set(
    sessions
      .filter(session => session.patientNickname === currentPatient.nickname && session.fecha)
      .map(session => session.fecha)
  )].sort();
}

function getClientComputedMicro(session) {
  if (!session?.fecha) return session?.microciclo || "-";
  const dates = getClientSortedSessionDates();
  return dates.indexOf(session.fecha) + 1;
}

function getClientMicroLabel(session) {
  const micro = getClientComputedMicro(session);
  return `Micro ${micro} · ${session.fecha || ""}`;
}


function isSessionCompleted(sessionId) {
  return completedSessions.some(item =>
    item.sessionId === sessionId &&
    item.patientNickname === currentPatient.nickname
  );
}

function sortSessionsNewestFirst(list = []) {
  return list.slice().sort((a, b) => {
    const dateA = a.fecha || "";
    const dateB = b.fecha || "";
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    return Number(b.numero || 0) - Number(a.numero || 0);
  });
}

function sortSessionsOldestFirst(list = []) {
  return list.slice().sort((a, b) => {
    const dateA = a.fecha || "";
    const dateB = b.fecha || "";
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return Number(a.numero || 0) - Number(b.numero || 0);
  });
}

function getClientCompletedSessions() {
  refreshCompletedSessions();
  return sortSessionsNewestFirst(
    sessions.filter(session =>
      session.patientNickname === currentPatient.nickname &&
      isSessionCompleted(session.id)
    )
  );
}

function getClientPendingSessions() {
  refreshCompletedSessions();
  return sessions
    .filter(session =>
      session.patientNickname === currentPatient.nickname &&
      !isSessionCompleted(session.id)
    )
    .sort((a, b) => {
      const dateA = a.fecha || "";
      const dateB = b.fecha || "";
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return Number(a.numero || 0) - Number(b.numero || 0);
    });
}

function completeClientSession(sessionId) {
  const session = sessions.find(item => item.id === sessionId);
  if (!session) return;

  if (isSessionCompleted(sessionId)) return;

  const confirmed = confirm(`¿Marcar la sesión nº ${session.numero} como terminada?`);
  if (!confirmed) return;

  completedSessions.push({
  sessionId,
  numero: session.numero,
  microciclo: session.microciclo,
  patientNickname: currentPatient.nickname,
  completedAt: new Date().toISOString()
});

  localStorage.setItem("completedSessions", JSON.stringify(completedSessions));

  if (window.PPF_SUPABASE && typeof window.PPF_SUPABASE.pushKey === "function") {
  window.PPF_SUPABASE.pushKey("completedSessions");
}

  alert("Sesión marcada como terminada. Ya cuenta en tu Dashboard y en Mis sesiones.");
  renderClientSection("proxima");
}

function renderSessionExerciseList(session) {
  function simpleModule(key, title) {
    const exercises = (session.modules?.[key] || [])
      .filter(item => !item.deleted && (item.nombre || item.series || item.repeticiones || item.url));

    if (exercises.length === 0) return "";

    return `
      <div class="client-next-module">
        <strong>${title}</strong>
        <ul>
          ${exercises.map(item => `
            <li>
              ${item.nombre || "Ejercicio"} · ${item.series || "-"} series · ${item.repeticiones || "-"} reps${key === "activacion" && item.rpe ? ` · RPE ${item.rpe}` : ""}
              ${item.url ? ` · <a href="${item.url}" target="_blank">▶ Ver vídeo</a>` : ""}
            </li>
          `).join("")}
        </ul>
      </div>
    `;
  }

  function principalModule() {
    const principal = session.modules?.principal;
    if (!principal?.blocks) return "";

    return ["bloque1", "bloque2", "bloque3", "bloque4"].map((blockKey, index) => {
      const block = principal.blocks[blockKey];
      const exercises = (block?.exercises || [])
        .filter(item => !item.deleted && (item.nombre || item.series || item.repeticiones || item.url));

      if (!block?.notes && exercises.length === 0) return "";

      return `
        <div class="client-next-module">
          <strong>Sesión Principal · Bloque ${index + 1}</strong>
          ${block?.notes ? `<p>${block.notes}</p>` : ""}
          <ul>
            ${exercises.map(item => `
              <li>
                ${item.nombre || "Ejercicio"} · ${item.series || "-"} series · ${item.repeticiones || "-"} reps${item.carga ? ` · ${item.carga} ${item.unidad || "Kg"}` : ""}${item.rpe ? ` · RPE ${item.rpe}` : ""}
                ${item.url ? ` · <a href="${item.url}" target="_blank">▶ Ver vídeo</a>` : ""}
              </li>
            `).join("")}
          </ul>
        </div>
      `;
    }).join("");
  }

  return `
    ${simpleModule("movilidad", "Movilidad")}
    ${simpleModule("activacion", "Activación")}
    ${principalModule()}
  `;
}


function normalizeSessionNumber(session) {
  return Number(session?.numero || session?.numeroSesion || session?.sessionNumber || 0);
}

function isSessionCompletedForClient(session) {
  const sessionNumber = normalizeSessionNumber(session);
  const patientNickname = session?.patientNickname || currentClient?.nickname || currentClient?.id || "";

  return completedSessions.some(item => {
    const sameId = item.sessionId && session.id && String(item.sessionId) === String(session.id);
    const samePatient = String(item.patientNickname || "") === String(patientNickname || "");
    const completedNumber = Number(item.numero || item.numeroSesion || item.sessionNumber || 0);
    const sameNumber = samePatient && completedNumber && sessionNumber && completedNumber === sessionNumber;
    return sameId || sameNumber;
  });
}

function persistCompletedSessionsAndCloud() {
  localStorage.setItem("completedSessions", JSON.stringify(completedSessions));

  if (window.PPF_SUPABASE && typeof window.PPF_SUPABASE.pushKey === "function") {
    window.PPF_SUPABASE.pushKey("completedSessions").catch(error => {
      console.warn("No se pudo sincronizar completedSessions con Supabase:", error);
    });
  } else if (window.PPF_SUPABASE && typeof window.PPF_SUPABASE.push === "function") {
    window.PPF_SUPABASE.push().catch(error => {
      console.warn("No se pudo sincronizar Supabase:", error);
    });
  }
}


function getClientSessionRadarValues(session) {
  const buckets = {
    "TS": 0,
    "TI": 0,
    "Core": 0,
    "Plyo": 0,
    "Mov.": 0,
    "Act.": 0
  };

  function addExercises(list = [], fallbackKey = "") {
    list.forEach(item => {
      if (!item || item.deleted) return;
      if (!(item.nombre || item.series || item.repeticiones || item.url)) return;

      const seriesNumber = Number(item.series);
      const value = Number.isNaN(seriesNumber) || seriesNumber <= 0 ? 1 : seriesNumber;
      const type = String(item.tipo || item.categoria || fallbackKey || "").toLowerCase();

      if (fallbackKey === "Mov.") buckets["Mov."] += value;
      else if (fallbackKey === "Act.") buckets["Act."] += value;
      else if (type.includes("superior") || type === "ts" || type.includes("t. superior")) buckets["TS"] += value;
      else if (type.includes("inferior") || type === "ti" || type.includes("t. inferior")) buckets["TI"] += value;
      else if (type.includes("core")) buckets["Core"] += value;
      else if (type.includes("plyo") || type.includes("plio")) buckets["Plyo"] += value;
      else buckets["TS"] += value;
    });
  }

  addExercises(session.modules?.movilidad || [], "Mov.");
  addExercises(session.modules?.activacion || [], "Act.");

  const blocks = session.modules?.principal?.blocks;
  if (blocks) {
    ["bloque1", "bloque2", "bloque3", "bloque4"].forEach(blockKey => {
      addExercises(blocks[blockKey]?.exercises || [], "");
    });
  }

  return Object.entries(buckets).map(([label, v]) => ({ label, v }));
}

function renderClientRadarProForSession(session) {
  const items = getClientSessionRadarValues(session);
  const total = items.reduce((sum, item) => sum + item.v, 0);

  if (!session || total === 0) {
    return "";
  }

  const maxValue = Math.max(...items.map(item => item.v), 1);
  const cx = 200;
  const cy = 200;
  const radius = 118;

  function axisPoint(index, customRadius = radius) {
    const angle = (-90 + (360 / items.length) * index) * Math.PI / 180;
    return {
      x: cx + Math.cos(angle) * customRadius,
      y: cy + Math.sin(angle) * customRadius,
      angle
    };
  }

  const dataPoints = items.map((item, index) => {
    const labelPoint = axisPoint(index, radius + 38);
    const normalized = Math.max(0, Math.min(1, item.v / maxValue));
    const angle = axisPoint(index).angle;

    return {
      ...item,
      x: cx + Math.cos(angle) * radius * normalized,
      y: cy + Math.sin(angle) * radius * normalized,
      labelX: labelPoint.x,
      labelY: labelPoint.y
    };
  });

  const polygon = dataPoints.map(point => `${point.x},${point.y}`).join(" ");

  const grid = [0.25, 0.5, 0.75, 1].map(scale => {
    const points = items.map((_, index) => {
      const point = axisPoint(index, radius * scale);
      return `${point.x},${point.y}`;
    }).join(" ");

    return `<polygon points="${points}" class="radar-grid-line" />`;
  }).join("");

  const axisLines = items.map((_, index) => {
    const point = axisPoint(index, radius);
    return `<line x1="${cx}" y1="${cy}" x2="${point.x}" y2="${point.y}" class="radar-axis-line" />`;
  }).join("");

  const strongest = items.reduce((best, item) => item.v > best.v ? item : best, { label: "-", v: -1 });

  return `
    <article class="client-pro-card client-next-radar-card">
      <div class="module-panel-header">
        <div>
          <p class="eyebrow">Radar PRO</p>
          <h3>Foco de la sesión nº ${session.numero}</h3>
        </div>
      </div>

      <div class="radar-pro2-wrap client-radar-pro-wrap">
        <svg class="radar-pro2-svg" viewBox="0 0 400 400" role="img" aria-label="Radar PRO sesión próxima">
          <defs>
            <radialGradient id="clientRadarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#22c55e" stop-opacity="0.42"/>
              <stop offset="100%" stop-color="#14b8a6" stop-opacity="0.05"/>
            </radialGradient>
            <filter id="clientRadarShadow">
              <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#22c55e" flood-opacity="0.22"/>
            </filter>
          </defs>

          ${grid}
          ${axisLines}

          <polygon points="${polygon}" class="radar-data-area client-radar-data-area" filter="url(#clientRadarShadow)" />
          <polygon points="${polygon}" class="radar-data-line" />

          ${dataPoints.map(point => `
            <g class="radar-pro2-point client-radar-tooltip-point"
               data-label="${point.label}"
               data-value="${point.v}"
               data-percent="${total ? Math.round((point.v / total) * 100) : 0}">
<circle cx="${point.x}" cy="${point.y}" r="15" class="radar-point-hit" />
              <circle cx="${point.x}" cy="${point.y}" r="7" class="radar-point-core" />
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
</div>

      <div class="client-next-radar-summary">
        ${items.map(item => `<span>${item.label}: <strong>${item.v}</strong></span>`).join("")}
      </div>
    </article>
  `;
}


function renderNextSession() {
  const nextSession = getClientPendingSessions()[0];

  if (!nextSession) {
    return `
      <div class="client-empty-next">
        <h2>No tienes sesiones próximas pendientes.</h2>
        <p>Cuando tu preparador cree una nueva sesión, aparecerá aquí.</p>
      </div>
    `;
  }

  return `
    ${renderClientRadarProForSession(nextSession)}
    <article class="client-next-session-card">
      <div class="session-card-header">
        <span class="session-badge">Sesión nº ${nextSession.numero}</span>
        <span class="session-date">${getClientMicroLabel(nextSession)}</span>
      </div>

      <h2>Sesión próxima</h2>
      <p>Realiza esta sesión y al terminar pulsa el botón para guardarla en Mis sesiones y actualizar tus gráficas.</p>

      <div class="client-next-summary">
        <span>${getClientSessionSeries(nextSession)} series</span>
        <span>${getClientSessionExercises(nextSession).length} ejercicios</span>
        <span>${Math.round(getClientSessionTonnage(nextSession))} Kg</span>
      </div>

      <div class="client-next-content">
        ${renderSessionExerciseList(nextSession)}
      </div>

      <button class="primary-btn finish-session-btn" type="button" onclick="completeClientSession('${nextSession.id}')">
        ✅ Sesión terminada
      </button>
    </article>
  `;
}


const clientSections = {
  inicio: {
    title: "Dashboard Cliente PRO",
    html: () => renderClientDashboard()
  },
  dashboard: {
    title: "Dashboard Cliente PRO",
    html: () => renderClientDashboard()
  },
  proxima: {
    title: "Sesión próxima",
    html: () => renderNextSession()
  },
  sesiones: {
    title: "Mis sesiones",
    html: () => `<h2>Mis sesiones</h2><p>Sesiones terminadas y acumuladas en tus gráficas.</p>${renderClientSessions()}`
  },
  historial: {
    title: "Valoraciones",
    html: () => `<h2>Valoraciones</h2><p>Gráficas de evolución y tendencia con los mismos datos que ve tu preparador.</p>${clientValuationChartsHTML()}${renderClientHistory()}`
  },
  archivos: {
    title: "Mis archivos",
    html: () => `<h2>Mis archivos</h2><p>Documentos, imágenes e informes disponibles.</p>${renderClientFiles()}`
  },
  perfil: {
    title: "Perfil",
    html: () => `
      <section class="client-profile-card mobile-profile-card">
        <div class="client-profile-photo fallback">${currentPatient?.nombre ? currentPatient.nombre.charAt(0).toUpperCase() : "P"}</div>
        <div>
          <p class="eyebrow">Perfil Cliente</p>
          <h2>${currentPatient?.nombre || "Cliente"}</h2>
          <p>Resumen personal y datos principales.</p>
          <div class="patient-tags">
            <span>@${currentPatient?.nickname || "-"}</span>
            <span>${currentPatient?.edad || "-"} años</span>
            <span>${currentPatient?.peso || "-"} kg</span>
            <span>${currentPatient?.altura || "-"} cm</span>
            <span>IMC ${currentPatient?.imc || "-"}</span>
          </div>
        </div>
      </section>
    `
  }
};

function escapeHTML(value=''){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}


function parseClientValuationNumber(value = "") {
  const raw = String(value || "").trim().replace(",", ".");
  const match = raw.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : null;
}


function clientValuationDateOrder(value = "") {
  const raw = String(value || "").trim();
  const time = Date.parse(raw);
  if (Number.isFinite(time)) return time;
  const parts = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (parts) {
    const year = parts[3].length === 2 ? `20${parts[3]}` : parts[3];
    return Date.parse(`${year}-${parts[2].padStart(2, "0")}-${parts[1].padStart(2, "0")}`);
  }
  return 0;
}

function clientNormalize(value = "") {
  return String(value || "").trim().toLowerCase();
}

function pmClientIsFakeValuationRecord(item) {
  const fecha = String(item?.fecha || "");
  const patient = clientNormalize(item?.patientNickname || item?.patientName || item?.nombrePaciente || "");
  return fecha === "2026-06-10" && patient.includes("david") && (item.tests || []).some(test => {
    const name = clientNormalize(test?.nombre || "");
    const values = [test?.intento1, test?.intento2, test?.intento3].map(v => String(v ?? "").replace(",", ".").trim());
    return name.includes("cmj") && values.join("|") === "50|50|50.5";
  });
}

function pmClientCleanFakeValuations(pushCloud = false) {
  let all = [];
  try { all = JSON.parse(localStorage.getItem("valoraciones") || "[]"); } catch (_) { all = []; }
  const clean = (Array.isArray(all) ? all : []).filter(item => !pmClientIsFakeValuationRecord(item));
  if (clean.length !== all.length) {
    localStorage.setItem("valoraciones", JSON.stringify(clean));
    if (pushCloud && window.PPF_SUPABASE?.pushKey) window.PPF_SUPABASE.pushKey("valoraciones").catch(()=>{});
  }
  return clean;
}

pmClientCleanFakeValuations(false);

function clientValuationGroups() {
  let all = [];
  try { all = JSON.parse(localStorage.getItem("valoraciones") || "[]"); } catch (_) {}
  const nickname = currentPatient?.nickname || currentUser?.nickname || currentUser?.user || currentUser?.username || "";
  const nickSet = new Set([nickname, currentUser?.nickname, currentPatient?.nickname, currentPatient?.nombre, currentUser?.username, currentUser?.user, currentUser?.name, currentUser?.nombre].map(clientNormalize).filter(Boolean));
  const groups = {};

  all.filter(v => nickSet.has(clientNormalize(v.patientNickname)) || nickSet.has(clientNormalize(v.patientName)) || nickSet.has(clientNormalize(v.nombrePaciente))).forEach(v => {
    (v.tests || []).forEach(test => {
      const name = String(test.nombre || "").trim();
      const unit = String(test.unidad || "").trim();
      const attempts = [test.intento1, test.intento2, test.intento3].map(parseClientValuationNumber).filter(v => v !== null);
      if (!name || !attempts.length) return;
      const key = `${name.toLowerCase()}__${unit}`;
      if (!groups[key]) groups[key] = { name, unit, days: {} };
      const fecha = v.fecha || "-";
      if (!groups[key].days[fecha]) groups[key].days[fecha] = { fecha, attempts: [] };
      groups[key].days[fecha].attempts.push(...attempts);
    });
  });

  return Object.values(groups).map(g => ({
    ...g,
    days: Object.values(g.days).sort((a,b)=>clientValuationDateOrder(a.fecha) - clientValuationDateOrder(b.fecha) || String(a.fecha).localeCompare(String(b.fecha))).map(d => ({
      ...d,
      mean: Number((d.attempts.reduce((a,v)=>a+v,0)/d.attempts.length).toFixed(2))
    }))
  })).filter(g => g.days.length);
}

function clientValuationChartSVG(group) {
  const days = group.days;
  const values = days.flatMap(d => [...d.attempts, d.mean]);
  const minRaw = Math.min(...values), maxRaw = Math.max(...values);
  const scaleMin = minRaw >= 0 ? 0 : minRaw;
  const rangeRaw = maxRaw - scaleMin || Math.max(Math.abs(maxRaw), 1);
  const min = scaleMin, max = maxRaw + rangeRaw * .18, range = max - min || 1;
  const width = 760, height = 360, padX = 58, padY = 46;
  const chartW = width - padX*2, chartH = height - padY*2;
  const xFor = i => days.length === 1 ? width/2 : padX + i*(chartW/(days.length-1));
  const yFor = v => height - padY - (((v-min)/range)*chartH);
  const maxAttempts = Math.max(...days.map(d=>d.attempts.length),1);
  const daySlot = days.length === 1 ? chartW * 0.44 : Math.min(84, chartW / Math.max(days.length,1));
  const barGap = 6;
  const barW = Math.max(9, Math.min(18, (daySlot - (maxAttempts-1)*barGap)/maxAttempts));
  const mean = days.map((d,i)=>({...d,x:xFor(i),y:yFor(d.mean)}));
  const first = mean[0];
  const last = mean[mean.length - 1];
  const trend = Number((last.mean - first.mean).toFixed(2));
  const trendLabel = trend > 0 ? `+${trend}` : String(trend);
  const trendPct = first.mean ? Number(((trend / first.mean) * 100).toFixed(2)) : 0;
  const trendPctLabel = trendPct > 0 ? `+${trendPct}%` : `${trendPct}%`;
  const directionLabel = trend > 0 ? "↗ Ascendente" : trend < 0 ? "↘ Descendente" : "→ Estable";
  const directionText = trend > 0 ? "Progresión positiva" : trend < 0 ? "Revisar evolución" : "Sin cambios relevantes";
  return `
    <article class="client-valuation-chart-card valuation-chart-card valuation-chart-pro-card">
      <div class="client-valuation-chart-head pro-chart-head">
        <div>
          <h3>${escapeHTML(group.name)}${group.unit ? ` (${escapeHTML(group.unit)})` : ""}</h3>
          <p>Barras verdes = datos individuales · Línea azul = media diaria</p>
        </div>
        <strong>${escapeHTML(String(last.mean))}${group.unit ? ` ${escapeHTML(group.unit)}` : ""}</strong>
      </div>
      <svg viewBox="0 0 ${width} ${height}" class="client-valuation-chart-svg valuation-line-chart valuation-pro-chart" role="img">
        <line x1="${padX}" y1="${height-padY}" x2="${width-padX}" y2="${height-padY}" class="client-chart-axis valuation-chart-axis"/>
        ${days.map((day,di)=>{
          const cx=xFor(di); const total=day.attempts.length*barW+(day.attempts.length-1)*barGap; const start=cx-total/2;
          return day.attempts.map((v,ai)=>{
            const x=start+ai*(barW+barGap), y=yFor(v), h=Math.max(2,height-padY-y);
            return `<g><rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="6" class="client-chart-bar"><title>${escapeHTML(day.fecha)} · Intento ${ai+1}: ${escapeHTML(String(v))}${group.unit ? ` ${escapeHTML(group.unit)}` : ""}</title></rect><text x="${x + barW/2}" y="${height-padY-10}" text-anchor="middle" class="client-chart-bar-value valuation-bar-value-bottom">${escapeHTML(String(v))}</text></g>`;
          }).join("");
        }).join("")}
        <polyline points="${mean.map(p=>`${p.x},${p.y}`).join(" ")}" class="client-chart-line valuation-chart-line valuation-mean-line" fill="none"/>
        ${mean.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="6.5" class="client-chart-point"><title>${escapeHTML(p.fecha)} · Media: ${escapeHTML(String(p.mean))}${group.unit ? ` ${escapeHTML(group.unit)}` : ""}</title></circle>`).join("")}
        ${mean.map((p,i)=> days.length>8 && i!==0 && i!==days.length-1 ? "" : `<text x="${p.x}" y="${height-10}" text-anchor="middle" class="client-chart-date valuation-chart-date">${escapeHTML(p.fecha)}</text>`).join("")}
      </svg>
      <div class="valuation-chart-summary client-valuation-summary">
        <div><span>Inicial</span><strong>${escapeHTML(String(first.mean))}${group.unit ? ` ${escapeHTML(group.unit)}` : ""}</strong><small>${escapeHTML(first.fecha)}</small></div>
        <div><span>Actual</span><strong>${escapeHTML(String(last.mean))}${group.unit ? ` ${escapeHTML(group.unit)}` : ""}</strong><small>${escapeHTML(last.fecha)}</small></div>
        <div><span>Mejora</span><strong>${escapeHTML(trendLabel)}${group.unit ? ` ${escapeHTML(group.unit)}` : ""}</strong><small>${escapeHTML(trendPctLabel)}</small></div>
        <div><span>Tendencia</span><strong>${escapeHTML(directionLabel)}</strong><small>${escapeHTML(directionText)}</small></div>
      </div>
      <p class="valuation-chart-note">Las gráficas usan el mismo motor de valoraciones que el panel admin para evitar diferencias de sincronización.</p>
    </article>`;
}

function clientValuationChartsHTML() {
  const groups = clientValuationGroups();
  if (!groups.length) return `<section class="content-card"><h2>Valoraciones</h2><p>No hay tests numéricos registrados todavía.</p></section>`;
  return `<section class="content-card client-valuations-pro"><p class="eyebrow">Valoraciones</p><h2>Gráficas de evolución</h2><div class="client-valuation-grid">${groups.map(clientValuationChartSVG).join("")}</div></section>`;
}

function renderClientSection(key) {
  const sectionKey = clientSections[key] ? key : "inicio";
  const section = clientSections[sectionKey];
  if (!section || !clientSectionTitle || !clientContentArea) return;
  clientSectionTitle.textContent = section.title;
  clientContentArea.innerHTML = typeof section.html === "function" ? section.html() : section.html;
  if (sectionKey === "historial") { pmClientCleanFakeValuations(true); }

  document.querySelectorAll(".client-mobile-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.clientSection === sectionKey || (sectionKey === "dashboard" && tab.dataset.clientSection === "inicio"));
  });
}

clientNavItems.forEach(item => {
  item.addEventListener("click", () => {
    const key = item.dataset.clientSection || "inicio";
    clientNavItems.forEach(nav => nav.classList.remove("active"));
    item.classList.add("active");
    renderClientSection(key);
  });
});

const logoutBtn = document.getElementById("clientLogoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    if (window.PPF_LOGOUT_AND_SYNC) { window.PPF_LOGOUT_AND_SYNC(); return; }
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  });
}

const clientHeaderLogoutBtn = document.getElementById("clientHeaderLogoutBtn");
if (clientHeaderLogoutBtn) {
  clientHeaderLogoutBtn.addEventListener("click", () => {
    if (window.PPF_LOGOUT_AND_SYNC) { window.PPF_LOGOUT_AND_SYNC(); return; }
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  });
}

window.PM_MOBILE_NAV = function PM_MOBILE_NAV(sectionKey, clickedTab) {
  const key = sectionKey || "inicio";

  document.querySelectorAll(".client-mobile-tab").forEach((tab) => {
    tab.classList.toggle("active", clickedTab ? tab === clickedTab : tab.dataset.clientSection === key);
  });

  document.querySelectorAll(".client-nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.clientSection === key || (key === "dashboard" && item.dataset.clientSection === "inicio"));
  });

  renderClientSection(key);
  try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (_) {}
};

document.addEventListener("click", function(event) {
  const tab = event.target.closest(".client-mobile-tab");
  if (!tab) return;
  event.preventDefault();
  window.PM_MOBILE_NAV(tab.dataset.clientSection || "inicio", tab);
});
renderClientSection("inicio");

if (typeof isSessionCompletedForClient === "function") {
  window.isSessionCompletedForClient = isSessionCompletedForClient;
}

window.completeClientSession = completeClientSession;


// Radar PRO: tooltip flotante estilo tarjeta PM siguiendo el cursor
(function setupClientRadarMouseTooltip() {
  if (window.__PM_RADAR_MOUSE_TOOLTIP_READY__) return;
  window.__PM_RADAR_MOUSE_TOOLTIP_READY__ = true;

  const tooltip = document.createElement("div");
  tooltip.className = "radar-mouse-tooltip radar-mouse-tooltip-pro";
  tooltip.innerHTML = `
    <span>Categoría</span>
    <strong>-</strong>
    <p>- series · -%</p>
  `;
  document.body.appendChild(tooltip);

  function moveTooltip(event) {
    const offsetX = 18;
    const offsetY = 18;
    const tooltipWidth = tooltip.offsetWidth || 170;
    const tooltipHeight = tooltip.offsetHeight || 92;

    let left = event.pageX + offsetX;
    let top = event.pageY + offsetY;

    const maxLeft = window.scrollX + window.innerWidth - tooltipWidth - 12;
    const maxTop = window.scrollY + window.innerHeight - tooltipHeight - 12;

    if (left > maxLeft) left = event.pageX - tooltipWidth - offsetX;
    if (top > maxTop) top = event.pageY - tooltipHeight - offsetY;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function showTooltip(event, point) {
    const label = point.dataset.label || "-";
    const value = point.dataset.value || "0";
    const percent = point.dataset.percent || "0";

    tooltip.querySelector("span").textContent = "Categoría";
    tooltip.querySelector("strong").textContent = label;
    tooltip.querySelector("p").textContent = `${value} series · ${percent}%`;

    document.querySelectorAll(".client-radar-tooltip-point").forEach(item => item.classList.remove("active"));
    point.classList.add("active");

    moveTooltip(event);
    tooltip.classList.add("show");
  }

  document.addEventListener("pointermove", (event) => {
    const point = event.target.closest(".client-radar-tooltip-point");
    if (!point) return;
    moveTooltip(event);
  });

  document.addEventListener("pointerover", (event) => {
    const point = event.target.closest(".client-radar-tooltip-point");
    if (!point) return;
    showTooltip(event, point);
  });

  document.addEventListener("click", (event) => {
    const point = event.target.closest(".client-radar-tooltip-point");
    if (!point) return;
    showTooltip(event, point);
  });

  document.addEventListener("pointerout", (event) => {
    const point = event.target.closest(".client-radar-tooltip-point");
    if (!point) return;

    point.classList.remove("active");
    tooltip.classList.remove("show");
  });


// PM FIX: cerrar sesión cliente cabecera
function pmClientLogout() {
  if (window.PPF_LOGOUT_AND_SYNC) { window.PPF_LOGOUT_AND_SYNC(); return; }
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

document.addEventListener("click", function(event) {
  const btn = event.target.closest("#clientHeaderLogoutBtn");
  if (!btn) return;
  event.preventDefault();
  pmClientLogout();
});



/* PM FIX · Navegación inferior móvil cliente funcional */
function pmEnsureClientMobileNav() {
  const isClientPage = document.body && document.querySelector(".client-layout");
  if (!isClientPage) return;

  let nav = document.getElementById("pmClientBottomNav");
  if (!nav) {
    nav = document.createElement("nav");
    nav.id = "pmClientBottomNav";
    nav.className = "pm-client-bottom-nav";
    nav.innerHTML = `
      <button type="button" data-client-section="dashboard"><span>🏠</span><small>Inicio</small></button>
      <button type="button" data-client-section="proxima"><span>📅</span><small>Sesión</small></button>
      <button type="button" data-client-section="historial"><span>📊</span><small>Valoraciones</small></button>
      <button type="button" data-client-section="archivos"><span>📁</span><small>Archivos</small></button>
      <button type="button" data-client-section="perfil"><span>👤</span><small>Perfil</small></button>
    `;
    document.body.appendChild(nav);
  }

  nav.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => {
      const section = btn.dataset.clientSection || "dashboard";
      document.querySelectorAll(".client-nav-item").forEach(item => {
        item.classList.toggle("active", item.dataset.clientSection === section);
      });
      nav.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));
      if (typeof renderClientSection === "function") renderClientSection(section);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  });

  const activeSection = document.querySelector(".client-nav-item.active")?.dataset.clientSection || "dashboard";
  nav.querySelectorAll("button").forEach(btn => btn.classList.toggle("active", btn.dataset.clientSection === activeSection));
}

async function pmClientRefreshCloudData() {
  try {
    if (window.PPF_SUPABASE?.pull) await window.PPF_SUPABASE.pull();
    pmClientCleanFakeValuations(true);
    const active = document.querySelector(".client-nav-item.active")?.dataset.clientSection || document.querySelector("#pmClientBottomNav button.active")?.dataset.clientSection || "dashboard";
    if (typeof renderClientSection === "function") renderClientSection(active);
  } catch (error) {
    console.warn("No se pudo refrescar datos cliente:", error);
  }
}

document.addEventListener("visibilitychange", () => { if (!document.hidden) pmClientRefreshCloudData(); });
window.addEventListener("storage", event => { if (["valoraciones","patients","histories"].includes(event.key)) pmClientRefreshCloudData(); });
setTimeout(pmClientRefreshCloudData, 900);

document.addEventListener("DOMContentLoaded", pmEnsureClientMobileNav);
setTimeout(pmEnsureClientMobileNav, 0);
setTimeout(pmEnsureClientMobileNav, 700);



/* PM FINAL FIX · Cliente móvil completo + cierre de sesión + refresco de datos */
(function pmFinalClientMobileFix(){
  function logoutClient(){
    if (window.PPF_LOGOUT_AND_SYNC) { window.PPF_LOGOUT_AND_SYNC(); return; }
    try { localStorage.removeItem("currentUser"); } catch (_) {}
    window.location.href = "index.html";
  }

  function activateClientSection(section){
    const key = section || "dashboard";
    if (typeof renderClientSection === "function") renderClientSection(key);
    document.querySelectorAll(".client-nav-item").forEach(item => {
      item.classList.toggle("active", item.dataset.clientSection === key || (key === "dashboard" && item.dataset.clientSection === "inicio"));
    });
    document.querySelectorAll(".client-mobile-tab, #pmClientBottomNav button").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.clientSection === key || (key === "dashboard" && btn.dataset.clientSection === "inicio"));
    });
  }

  document.addEventListener("click", function(event){
    const logout = event.target.closest("#clientLogoutBtn, #clientHeaderLogoutBtn, [data-client-logout]");
    if (logout) {
      event.preventDefault();
      logoutClient();
      return;
    }
    const tab = event.target.closest(".client-mobile-tab, #pmClientBottomNav button");
    if (tab) {
      event.preventDefault();
      activateClientSection(tab.dataset.clientSection || "dashboard");
      try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (_) {}
    }
  }, true);

  function ensureVisibleClientContent(){
    const area = document.getElementById("clientContentArea");
    if (area && !String(area.innerHTML || "").trim()) activateClientSection("dashboard");
    const main = document.querySelector(".client-main");
    if (main) main.style.display = "block";
  }

  window.PM_FINAL_CLIENT_SECTION = activateClientSection;
  setTimeout(ensureVisibleClientContent, 50);
  setTimeout(ensureVisibleClientContent, 600);
  setTimeout(function(){ if (typeof pmClientRefreshCloudData === "function") pmClientRefreshCloudData(); }, 1200);
})();
})();



/* PM SYNC PRO · refrescar cliente cuando Supabase actualiza localStorage */
function pmClientReloadRuntimeFromStorage() {
  try { patients = JSON.parse(localStorage.getItem("patients") || "[]"); } catch (_) { patients = []; }
  try { sessions = JSON.parse(localStorage.getItem("sessions") || "[]"); } catch (_) { sessions = []; }
  try { histories = JSON.parse(localStorage.getItem("histories") || "[]"); } catch (_) { histories = []; }
  try { patientFiles = JSON.parse(localStorage.getItem("patientFiles") || "[]"); } catch (_) { patientFiles = []; }
  try { completedSessions = JSON.parse(localStorage.getItem("completedSessions") || "[]"); } catch (_) { completedSessions = []; }
  currentPatient = patients.find(patient => patient.nickname === currentUser.nickname) || currentPatient;
  currentClient = currentPatient;
  if (currentPatient) {
    const name = document.getElementById("clientHeaderName");
    const avatar = document.getElementById("clientAvatar");
    if (name) name.textContent = currentPatient.nombre || currentUser.nickname;
    if (avatar) avatar.textContent = String(currentPatient.nombre || currentUser.nickname || "?").charAt(0).toUpperCase();
  }
}

function pmClientRefreshVisibleSectionAfterSync() {
  pmClientReloadRuntimeFromStorage();
  if (typeof pmClientCleanFakeValuations === "function") pmClientCleanFakeValuations(false);
  const active = document.querySelector(".client-nav-item.active")?.dataset.clientSection || document.querySelector("#pmClientBottomNav button.active")?.dataset.clientSection || "dashboard";
  if (typeof renderClientSection === "function") renderClientSection(active);
}

window.addEventListener("PPF_APP_DATA_REFRESH", pmClientRefreshVisibleSectionAfterSync);
window.addEventListener("PPF_SUPABASE_SYNCED", function(event){
  if (event.detail && event.detail.direction === "pull") pmClientRefreshVisibleSectionAfterSync();
});
setTimeout(function(){ if (window.PPF_SYNC_ON_OPEN) window.PPF_SYNC_ON_OPEN("client-start"); }, 500);

})();

