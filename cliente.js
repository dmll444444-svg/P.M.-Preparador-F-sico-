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
  const mySessions = getClientCompletedSessions()
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

function getClientCompletedSessions() {
  refreshCompletedSessions();
  return sessions
    .filter(session =>
      session.patientNickname === currentPatient.nickname &&
      isSessionCompleted(session.id)
    )
    .sort((a, b) => {
      const numberDiff = Number(b.numero || 0) - Number(a.numero || 0);
      if (numberDiff !== 0) return numberDiff;
      return String(b.fecha || "").localeCompare(String(a.fecha || ""));
    });
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
    ts: 0,
    ti: 0,
    core: 0,
    plyo: 0,
    movilidad: 0,
    activacion: 0
  };

  getClientSessionExercises(session).forEach(item => {
    const seriesNumber = Number(item.series);
    const value = Number.isNaN(seriesNumber) || seriesNumber <= 0 ? 1 : seriesNumber;
    const type = String(item.tipo || item.type || "").toLowerCase();
    const moduleName = String(item.moduleName || "").toLowerCase();
    const name = String(item.nombre || "").toLowerCase();
    const text = `${type} ${moduleName} ${name}`;

    if (moduleName.includes("movilidad")) buckets.movilidad += value;
    else if (moduleName.includes("activación") || moduleName.includes("activacion")) buckets.activacion += value;
    else if (text.includes("core")) buckets.core += value;
    else if (text.includes("plyo") || text.includes("plio")) buckets.plyo += value;
    else if (text.includes("inferior") || text.includes("ti") || text.includes("tren inferior")) buckets.ti += value;
    else if (text.includes("superior") || text.includes("ts") || text.includes("tren superior")) buckets.ts += value;
    else buckets.ts += value;
  });

  return [
    { label: "TS", v: buckets.ts },
    { label: "TI", v: buckets.ti },
    { label: "Core", v: buckets.core },
    { label: "Plyo", v: buckets.plyo },
    { label: "Mov.", v: buckets.movilidad },
    { label: "Act.", v: buckets.activacion }
  ];
}

function clientRadarPercent(value, total) {
  if (!total) return 0;
  return Math.round((Number(value || 0) / total) * 100);
}

function renderClientRadarSvg(items) {
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
    const labelPoint = axisPoint(index, radius + 38);
    const normalized = Math.max(0, Math.min(1, item.v / maxValue));
    const angle = axisPoint(index).angle;

    return {
      ...item,
      percent: clientRadarPercent(item.v, total),
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
    <div class="radar-pro2-wrap client-next-radar-wrap">
      <svg class="radar-pro2-svg" viewBox="0 0 400 400" role="img" aria-label="Radar PRO de sesión próxima">
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
        <polygon points="${polygon}" class="radar-data-area" fill="url(#clientRadarGlow)" filter="url(#clientRadarShadow)" />
        <polygon points="${polygon}" class="radar-data-line" />

        ${dataPoints.map(point => `
          <g class="radar-pro2-point">
            <circle cx="${point.x}" cy="${point.y}" r="13" class="radar-point-hit" />
            <circle cx="${point.x}" cy="${point.y}" r="6" class="radar-point-core" />
          </g>
        `).join("")}

        ${dataPoints.map(point => `
          <text x="${point.labelX}" y="${point.labelY}" text-anchor="middle" dominant-baseline="middle" class="radar-pro2-label">${point.label}</text>
        `).join("")}
      </svg>

      <div class="radar-pro2-focus-card">
        <span>Mayor foco</span>
        <strong>${strongest.label}</strong>
        <small>${strongest.v < 0 ? 0 : strongest.v} series</small>
      </div>
    </div>
  `;
}

function renderClientNextRadar(session) {
  const radarValues = getClientSessionRadarValues(session);
  const max = Math.max(...radarValues.map(item => item.v), 1);

  return `
    <section class="client-next-radar-section">
      <article class="graph-pro-card client-next-radar-card">
        <div class="module-panel-header">
          <div>
            <p class="eyebrow">Radar PRO</p>
            <h3>Distribución de la sesión próxima</h3>
            <p>Vista rápida del foco de trabajo antes de realizar la sesión.</p>
          </div>
          <span class="session-badge">Sesión nº ${session.numero}</span>
        </div>
        ${renderClientRadarSvg(radarValues)}
      </article>

      <article class="graph-pro-card client-next-radar-detail">
        <div class="module-panel-header">
          <div>
            <p class="eyebrow">Detalle</p>
            <h3>Series por categoría</h3>
          </div>
        </div>
        <div class="distribution-chart">
          ${radarValues.map(item => {
            const percent = Math.round((item.v / max) * 100);
            return `
              <div class="distribution-row">
                <span>${item.label}</span>
                <div class="distribution-track"><div class="distribution-fill" style="width:${Number.isFinite(percent) ? percent : 0}%"></div></div>
                <strong>${item.v}</strong>
              </div>
            `;
          }).join("")}
        </div>
      </article>
    </section>
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
    ${renderClientNextRadar(nextSession)}

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
  dashboard: {
    title: "Dashboard Cliente PRO",
    html: () => renderClientDashboard()
  },
  inicio: {
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
  }
};

function renderClientSection(key) {
  const section = clientSections[key] || clientSections.dashboard;
  clientSectionTitle.textContent = section.title;
  clientContentArea.innerHTML = typeof section.html === "function" ? section.html() : section.html;
}

clientNavItems.forEach(item => {
  item.addEventListener("click", () => {
    clientNavItems.forEach(nav => nav.classList.remove("active"));
    item.classList.add("active");
    renderClientSection(item.dataset.clientSection);
  });
});

document.getElementById("clientLogoutBtn").addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
});

renderClientSection("dashboard");


if (typeof isSessionCompletedForClient === "function") {
  window.isSessionCompletedForClient = isSessionCompletedForClient;
}

window.completeClientSession = completeClientSession;

})();
