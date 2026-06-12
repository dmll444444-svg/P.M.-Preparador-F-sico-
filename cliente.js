(async function PPF_APP_BOOTSTRAP() {
  try {
    if (window.PPF_SUPABASE_READY) {
      await window.PPF_SUPABASE_READY;
    }
  } catch (error) {
    console.warn("Supabase bootstrap error:", error);
  }

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser || currentUser.role !== "client") {
  window.location.href = "index.html";
}

const patients = JSON.parse(localStorage.getItem("patients")) || [];
const sessions = JSON.parse(localStorage.getItem("sessions")) || [];
const histories = JSON.parse(localStorage.getItem("histories")) || [];
const patientFiles = JSON.parse(localStorage.getItem("patientFiles")) || [];
let completedSessions = JSON.parse(localStorage.getItem("completedSessions")) || [];

const currentPatient = patients.find(patient => patient.nickname === currentUser.nickname);
const currentClient = currentPatient;

if (!currentPatient) {
  alert("No se han encontrado tus datos de cliente.");
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
    title: "Mi historial",
    html: () => `<h2>Mi historial</h2><p>Registros y evolución guardados por tu preparador.</p>${renderClientHistory()}`
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

function clientValuationGroups() {
  let all = [];
  try { all = JSON.parse(localStorage.getItem("valoraciones") || "[]"); } catch (_) {}
  const nickname = currentUser?.nickname || currentUser?.user || currentUser?.username || "";
  const groups = {};

  all.filter(v => v.patientNickname === nickname).forEach(v => {
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
    days: Object.values(g.days).sort((a,b)=>String(a.fecha).localeCompare(String(b.fecha))).map(d => ({
      ...d,
      mean: Number((d.attempts.reduce((a,v)=>a+v,0)/d.attempts.length).toFixed(2))
    }))
  })).filter(g => g.days.length);
}

function clientValuationChartSVG(group) {
  const days = group.days;
  const values = days.flatMap(d => [...d.attempts, d.mean]);
  const minRaw = Math.min(...values), maxRaw = Math.max(...values);
  const rangeRaw = maxRaw - minRaw || 1;
  const min = minRaw - rangeRaw * .1, max = maxRaw + rangeRaw * .16, range = max - min || 1;
  const width = 520, height = 230, padX = 36, padY = 28;
  const chartW = width - padX*2, chartH = height - padY*2;
  const xFor = i => days.length === 1 ? width/2 : padX + i*(chartW/(days.length-1));
  const yFor = v => height - padY - (((v-min)/range)*chartH);
  const maxAttempts = Math.max(...days.map(d=>d.attempts.length),1);
  const barW = Math.max(7, Math.min(14, (Math.min(70, chartW/Math.max(days.length,1)) - (maxAttempts-1)*4)/maxAttempts));
  const mean = days.map((d,i)=>({...d,x:xFor(i),y:yFor(d.mean)}));
  return `
    <article class="client-valuation-chart-card">
      <div class="client-valuation-chart-head"><h3>${escapeHTML(group.name)}${group.unit ? ` (${escapeHTML(group.unit)})` : ""}</h3><strong>${escapeHTML(String(mean[mean.length-1].mean))}${group.unit ? ` ${escapeHTML(group.unit)}` : ""}</strong></div>
      <svg viewBox="0 0 ${width} ${height}" class="client-valuation-chart-svg">
        <line x1="${padX}" y1="${height-padY}" x2="${width-padX}" y2="${height-padY}" class="client-chart-axis"/>
        ${days.map((day,di)=>{
          const cx=xFor(di); const total=day.attempts.length*barW+(day.attempts.length-1)*4; const start=cx-total/2;
          return day.attempts.map((v,ai)=>{
            const x=start+ai*(barW+4), y=yFor(v), h=Math.max(2,height-padY-y);
            return `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="4" class="client-chart-bar"><title>${escapeHTML(day.fecha)} · Intento ${ai+1}: ${escapeHTML(String(v))}${group.unit ? ` ${escapeHTML(group.unit)}` : ""}</title></rect>`;
          }).join("");
        }).join("")}
        <polyline points="${mean.map(p=>`${p.x},${p.y}`).join(" ")}" class="client-chart-line" fill="none"/>
        ${mean.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="5" class="client-chart-point"><title>${escapeHTML(p.fecha)} · Media: ${escapeHTML(String(p.mean))}${group.unit ? ` ${escapeHTML(group.unit)}` : ""}</title></circle>`).join("")}
        ${mean.map((p,i)=> days.length>5 && i!==0 && i!==days.length-1 ? "" : `<text x="${p.x}" y="${height-6}" text-anchor="middle" class="client-chart-date">${escapeHTML(p.fecha)}</text>`).join("")}
      </svg>
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
  if (key === "historial" && typeof clientValuationChartsHTML === "function") {
    clientContentArea.insertAdjacentHTML("beforeend", clientValuationChartsHTML());
  }

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
      <button type="button" data-client-section="dashboard"><span>📊</span><small>Dashboard</small></button>
      <button type="button" data-client-section="archivos"><span>📁</span><small>Archivos</small></button>
      <button type="button" data-client-section="historial"><span>👤</span><small>Perfil</small></button>
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

document.addEventListener("DOMContentLoaded", pmEnsureClientMobileNav);
setTimeout(pmEnsureClientMobileNav, 0);
setTimeout(pmEnsureClientMobileNav, 700);

})();

})();

