(async function PPF_APP_BOOTSTRAP() {
  try {
    if (window.PPF_SUPABASE_READY) {
      await window.PPF_SUPABASE_READY;
    }
  } catch (error) {
    console.warn("Supabase bootstrap error:", error);
  }

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

/* PPF PRO · cliente conectado al motor único de presencia */
window.PPF_LOGOUT_AND_SYNC = async function PPF_LOGOUT_AND_SYNC() {
  if (window.__ppfLogoutInProgress) return window.__ppfLogoutInProgress;
  window.__ppfLogoutInProgress = (async () => {
    try {
      const user = JSON.parse(localStorage.getItem("currentUser") || "null") || currentUser;
      await window.PPF_PRESENCE?.logout?.(user);
    } catch (_) {}
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  })();
  return window.__ppfLogoutInProgress;
};

try {
  if (currentUser?.role === "client") {
    window.PPF_PRESENCE?.start?.(currentUser);
  }
} catch (error) {
  console.warn("No se pudo iniciar la presencia del cliente:", error);
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
window.currentPatient = currentPatient;

if (currentPatient) {
  window.PPF_CLIENT_HERO?.render?.({ patient: currentPatient });
}

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
            <span class="session-badge">${getClientSessionKind(session).icon} Sesión ${getClientSessionDisplayNumber(session)}</span>
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

  ordered.forEach(item => {
    item.sessions = item.sessionsInMicro;
    item.dateLabel = [...item.dates].join(", ");
    item.dates = [...item.dates];
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

function isClientPlyometricExercise(item) {
  const type = String(item?.tipo || item?.type || "").toLowerCase();
  return type.includes("plyo") || type.includes("plio") || type.includes("pliometr");
}

function getClientPlyometricData() {
  const weeklyBase = getClientWeeklyData();
  const grouped = {};

  weeklyBase.forEach(item => {
    grouped[item.label] = {
      micro: item.micro,
      label: item.label,
      series: 0,
      exercises: 0,
      sessionsInMicro: item.sessionsInMicro || 0,
      sessions: item.sessions || 0,
      tonnage: 0,
      dates: item.dates || []
    };
  });

  sortSessionsOldestFirst(getClientCompletedSessions())
    .filter(session => session.microciclo)
    .forEach(session => {
      const micro = getClientComputedMicro(session);
      const key = `M${micro}`;
      if (!grouped[key]) {
        grouped[key] = { micro: Number(micro), label: key, series: 0, exercises: 0, sessionsInMicro: 0, sessions: 0, tonnage: 0, dates: [] };
      }

      getClientSessionExercises(session).forEach(item => {
        if (!isClientPlyometricExercise(item)) return;
        const series = Number(item.series);
        if (Number.isNaN(series)) return;
        grouped[key].series += series;
        grouped[key].exercises += 1;
      });
    });

  return Object.values(grouped).sort((a, b) => a.micro - b.micro);
}

function getClientPeriodicityStats() {
  const weekly = getClientWeeklyData();
  const plyo = getClientPlyometricData();
  const latest = weekly[weekly.length - 1] || { label: "-" };

  return {
    sessions: weekly.reduce((sum, item) => sum + Number(item.sessionsInMicro || item.sessions || 0), 0),
    micro: latest.label,
    series: weekly.reduce((sum, item) => sum + Number(item.series || 0), 0),
    exercises: weekly.reduce((sum, item) => sum + Number(item.exercises || 0), 0),
    plyoSeries: plyo.reduce((sum, item) => sum + Number(item.series || 0), 0),
    plyoExercises: plyo.reduce((sum, item) => sum + Number(item.exercises || 0), 0),
    tonnage: Math.round(weekly.reduce((sum, item) => sum + Number(item.tonnage || 0), 0)),
    history: histories.filter(item => item.patientNickname === currentPatient.nickname).length,
    files: patientFiles.filter(file => file.patientNickname === currentPatient.nickname).length
  };
}

function escapeClientTooltip(value = "") {
  return String(value || "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function renderClientVolumeBarChart(data, tableTitle = "Datos", emptyMessage = "Sin datos todavía.", options = {}) {
  if (data.length === 0) {
    return `<p class="empty-chart-message">${emptyMessage}</p>`;
  }

  const valueKey = options.valueKey || "series";
  const maxValue = Math.max(...data.map(item => Number(item[valueKey] || 0)), 1);
  const currentMicroNumber = Math.max(...data.map(item => Number(item.micro) || 0));

  const bars = data.map(item => {
    const rawValue = Number(item[valueKey] || 0);
    const shownValue = options.format ? options.format(rawValue) : Math.round(rawValue);
    const height = Math.max((rawValue / maxValue) * 100, 6);
    const realSessions = Number(item.sessionsInMicro || item.sessions || 0);
    const isCurrentMicro = currentMicroNumber > 0 && Number(item.micro) === currentMicroNumber;
    const dates = Array.isArray(item.dates) ? item.dates.filter(Boolean) : [];
    const tooltip = [
      item.label,
      `Sesiones: ${realSessions}`,
      `Series: ${item.series || 0}`,
      `Ejercicios: ${item.exercises || 0}`,
      Number(item.tonnage || 0) ? `Tonelaje: ${Math.round(item.tonnage)} kg` : "",
      dates.length ? `Fechas: ${dates.join(" · ")}` : "",
      isCurrentMicro ? "🟢 Micro actual" : ""
    ].filter(Boolean).join("\n");
    const valueClass = String(shownValue).length >= 5 ? "bar-value-compact" : "";

    return `
      <div class="volume-bar-item periodicity-tooltip-source ${isCurrentMicro ? "current-micro" : ""}" title="${escapeClientTooltip(tooltip)}">
        <div class="volume-bar-wrap">
          ${isCurrentMicro ? `<span class="current-micro-badge">Actual</span>` : ""}
          <div class="volume-bar" style="height:${height}%"><span class="${valueClass}">${shownValue}</span></div>
        </div>
        <strong>${isCurrentMicro ? "● " : ""}${item.label}</strong>
        <small>${realSessions} sesión${realSessions === 1 ? "" : "es"}</small>
      </div>
    `;
  }).join("");

  const rows = data.map(item => `
    <tr>
      <td>${item.label}</td>
      <td>${item.sessionsInMicro || item.sessions || 0}</td>
      <td>${item.exercises || 0}</td>
      <td>${options.format ? options.format(item[valueKey] || 0) : Math.round(item[valueKey] || 0)}</td>
    </tr>
  `).join("");

  return `
    <div class="volume-chart client-periodicity-chart">${bars}</div>
    <div class="volume-table-wrap client-periodicity-table-wrap">
      <table class="volume-table">
        <thead><tr><th>Micro</th><th>Sesiones</th><th>Ejercicios</th><th>${tableTitle}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
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
    <div class="distribution-chart" id="clientDistributionChart">
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
          <span class="session-badge">${getClientSessionKind(session).icon} Sesión ${getClientSessionDisplayNumber(session)}</span>
          <strong>${getClientMicroLabel(session)}</strong>
          <p>${getClientSessionSeries(session)} series · ${getClientSessionExercises(session).length} ejercicios · ${Math.round(getClientSessionTonnage(session))} Kg</p>
        </article>
      `).join("")}
    </div>
  `;
}

function animateClientPeriodicityCharts() {
  const charts = document.querySelectorAll(".client-periodicity-chart");
  charts.forEach(chart => {
    chart.classList.remove("ppf-chart-animated");
    chart.querySelectorAll(".volume-bar").forEach(bar => {
      bar.classList.remove("ppf-bar-animate");
      bar.style.animationDelay = "0ms";
    });
  });

  if (window.ppfClientPeriodicityObserver) window.ppfClientPeriodicityObserver.disconnect();

  window.ppfClientPeriodicityObserver = new IntersectionObserver(entries => {
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
  }, { threshold: 0.24 });

  charts.forEach(chart => window.ppfClientPeriodicityObserver.observe(chart));

  document.querySelectorAll("#clientDistributionChart .distribution-fill").forEach((fill, index) => {
    fill.classList.remove("ppf-distribution-animate");
    fill.style.animationDelay = `${index * 90}ms`;
    void fill.offsetWidth;
    fill.classList.add("ppf-distribution-animate");
  });
}

function getClientDashboardStats() {
  return getClientPeriodicityStats();
}

function getClientHomeDateLabel(session) {
  if (!session?.fecha) return "Próximamente";
  const value = String(session.fecha).slice(0, 10);
  const sessionDate = new Date(`${value}T12:00:00`);
  if (Number.isNaN(sessionDate.getTime())) return session.fecha;

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowKey = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

  if (value === todayKey) return "Hoy";
  if (value === tomorrowKey) return "Mañana";
  return sessionDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
}

function getClientHomeDateKey(session) {
  return String(session?.fecha || "").slice(0, 10);
}

function getClientHomeTodayKey(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getClientHomeDailyState(session) {
  if (!session) {
    return {
      eyebrow: "✓ Todo al día",
      title: "No tienes entrenamientos pendientes.",
      copy: "Tu planificación está al día. Disfruta del descanso y prepárate para lo siguiente.",
      action: null
    };
  }

  const dateKey = getClientHomeDateKey(session);
  const todayKey = getClientHomeTodayKey(0);
  const tomorrowKey = getClientHomeTodayKey(1);

  if (dateKey && dateKey < todayKey) {
    return {
      eyebrow: "Sesión pendiente",
      title: "Tu entrenamiento te está esperando",
      copy: "Tienes una sesión pendiente por completar. Puedes retomarla cuando estés preparado.",
      action: "Ver mi entrenamiento"
    };
  }

  if (dateKey === todayKey) {
    return {
      eyebrow: "Entrenas hoy",
      title: "Tu sesión de hoy está preparada",
      copy: "Todo está listo para que continúes con tu planificación.",
      action: "Ver mi entrenamiento"
    };
  }

  if (dateKey === tomorrowKey) {
    return {
      eyebrow: "Próximo entrenamiento",
      title: "Mañana continúa tu planificación",
      copy: "Tu siguiente sesión ya está preparada para que sepas qué viene después.",
      action: "Ver mi entrenamiento"
    };
  }

  return {
    eyebrow: "Próxima sesión",
    title: "Tu siguiente entrenamiento ya está programado",
    copy: "Consulta la sesión cuando quieras y llega con todo claro al próximo entrenamiento.",
    action: "Ver mi entrenamiento"
  };
}

function renderClientHomeNextSession() {
  const pendingSessions = getClientPendingSessions().slice().sort((a, b) => {
    const dateA = getClientHomeDateKey(a) || "9999-12-31";
    const dateB = getClientHomeDateKey(b) || "9999-12-31";
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return Number(a.numero || 0) - Number(b.numero || 0);
  });
  const nextSession = pendingSessions[0];
  const state = getClientHomeDailyState(nextSession);

  if (!nextSession) {
    return `
      <article class="ppf-home-empty-next ppf-daily-smart-card" data-daily-state="all-clear">
        <p class="ppf-next-smart-card__eyebrow">${escapeHTML(state.eyebrow)}</p>
        <h3>${escapeHTML(state.title)}</h3>
        <p>${escapeHTML(state.copy)}</p>
      </article>
    `;
  }

  const kind = getClientSessionKind(nextSession);
  const series = getClientSessionSeries(nextSession);
  const exercises = getClientSessionExercises(nextSession).length;
  const tonnage = Math.round(getClientSessionTonnage(nextSession));
  const when = getClientHomeDateLabel(nextSession);

  return `
    <article class="ppf-next-smart-card ppf-daily-smart-card" data-daily-state="session">
      <div>
        <p class="ppf-next-smart-card__eyebrow">${escapeHTML(state.eyebrow)} · ${escapeHTML(when)}</p>
        <h3>${escapeHTML(state.title)}</h3>
        <p class="ppf-next-smart-card__copy">${escapeHTML(state.copy)}</p>
        <div class="ppf-next-smart-card__meta" aria-label="Resumen del entrenamiento">
          <span>${kind.icon} ${escapeHTML(kind.label)}</span>
          <span>Sesión ${escapeHTML(getClientSessionDisplayNumber(nextSession))}</span>
          <span>${series} series</span>
          <span>${exercises} ejercicios</span>
          ${tonnage > 0 ? `<span>${tonnage} Kg programados</span>` : ""}
        </div>
      </div>
      <button class="ppf-home-primary-action" type="button" data-client-nav-action="proxima">${escapeHTML(state.action || "Ver mi entrenamiento")}</button>
    </article>
  `;
}

function getClientHomeConsistency() {
  const clientSessions = sortSessionsNewestFirst(
    sessions.filter(session => sessionBelongsToCurrentClient(session))
  ).slice(0, 6);

  if (!clientSessions.length) return { value: null, completed: 0, total: 0 };
  const completed = clientSessions.filter(session => isSessionCompleted(session.id || session.sessionId)).length;
  return {
    value: Math.round((completed / clientSessions.length) * 100),
    completed,
    total: clientSessions.length
  };
}

function renderClientHomeSmartCards(stats) {
  const completedCount = getClientCompletedSessions().length;
  const microLabel = stats.micro || "-";
  const consistency = getClientHomeConsistency();
  const consistencyValue = consistency.value === null ? "—" : `${consistency.value}%`;
  const consistencyCopy = consistency.value === null
    ? "aún sin historial suficiente"
    : `${consistency.completed} de tus últimas ${consistency.total} sesiones`;

  return `
    <section class="ppf-home-smart-grid" aria-label="Resumen de tu proceso">
      <article class="ppf-home-smart-kpi">
        <span>Entrenamientos</span>
        <strong>${completedCount}</strong>
        <small>${completedCount === 1 ? "sesión completada" : "sesiones completadas"}</small>
      </article>
      <article class="ppf-home-smart-kpi">
        <span>Momento actual</span>
        <strong>${escapeHTML(microLabel)}</strong>
        <small>de tu planificación</small>
      </article>
      <article class="ppf-home-smart-kpi">
        <span>Constancia</span>
        <strong>${consistencyValue}</strong>
        <small>${escapeHTML(consistencyCopy)}</small>
      </article>
    </section>
  `;
}

function getClientHomeProgressMessage(completedCount, consistency) {
  if (completedCount === 0) return {
    title: "Empezamos a construir tu historial",
    copy: "Cuando completes tus primeras sesiones, aquí podrás seguir tu evolución con datos reales.",
    tone: "building"
  };
  if (completedCount < 4) return {
    title: "Tu proceso ya está en marcha",
    copy: `Ya has completado ${completedCount} ${completedCount === 1 ? "entrenamiento" : "entrenamientos"}. Necesitamos algo más de historial antes de valorar tendencias con rigor.`,
    tone: "building"
  };
  if (consistency.value !== null && consistency.total >= 4 && consistency.value >= 80) return {
    title: "Estás manteniendo una buena continuidad",
    copy: `Has completado ${consistency.completed} de tus últimas ${consistency.total} sesiones. Seguimos acumulando información para interpretar tu progreso con rigor.`,
    tone: "positive"
  };
  return {
    title: "Seguimos construyendo tu progreso",
    copy: `Tienes ${completedCount} entrenamientos completados. PPF seguirá utilizando tu historial para mostrarte cambios cuando existan datos suficientes.`,
    tone: "neutral"
  };
}

function renderClientHomeProgress(stats) {
  const completedCount = getClientCompletedSessions().length;
  const consistency = getClientHomeConsistency();
  const progress = getClientHomeProgressMessage(completedCount, consistency);

  return `
    <article class="ppf-home-progress-card ppf-home-progress-card--${progress.tone}">
      <div>
        <p class="eyebrow">Tu evolución</p>
        <h3>${escapeHTML(progress.title)}</h3>
        <p class="ppf-home-progress-copy">${escapeHTML(progress.copy)}</p>
      </div>
      <button class="ppf-home-secondary-action" type="button" data-client-progress-sessions>Ver mis entrenamientos</button>
    </article>
  `;
}

function renderClientDetailedPerformance(stats, weekly, plyo) {
  return `
    <details class="ppf-home-detail">
      <summary>Ver rendimiento detallado</summary>
      <div class="ppf-home-detail__body">
        <section class="periodicity-kpi-grid client-periodicity-kpis">
          <article class="periodicity-kpi"><span>Micro actual</span><strong>${stats.micro}</strong></article>
          <article class="periodicity-kpi"><span>Sesiones acumuladas</span><strong>${stats.sessions}</strong></article>
          <article class="periodicity-kpi"><span>Series acumuladas</span><strong>${stats.series}</strong></article>
          <article class="periodicity-kpi"><span>Ejercicios programados</span><strong>${stats.exercises}</strong></article>
          <article class="periodicity-kpi plyo"><span>Series pliometría</span><strong>${stats.plyoSeries}</strong></article>
          <article class="periodicity-kpi plyo"><span>Ejercicios pliometría</span><strong>${stats.plyoExercises}</strong></article>
          <article class="periodicity-kpi"><span>Tonelaje Kg</span><strong>${stats.tonnage}</strong></article>
        </section>

        <section class="periodicity-dashboard client-periodicity-dashboard">
          <article class="periodicity-card client-periodicity-card">
            <div class="module-panel-header"><div><p class="eyebrow">Volumen</p><h3>Series por microciclo</h3></div></div>
            ${renderClientVolumeBarChart(weekly, "Series", "Sin series registradas todavía.")}
          </article>
          <article class="periodicity-card client-periodicity-card">
            <div class="module-panel-header"><div><p class="eyebrow">Pliometría</p><h3>Volumen pliometría</h3></div></div>
            ${renderClientVolumeBarChart(plyo, "Series", "Sin volumen de pliometría registrado todavía.")}
          </article>
        </section>

        <section class="periodicity-dashboard client-periodicity-dashboard client-periodicity-bottom">
          <article class="periodicity-card client-periodicity-card client-tonnage-card">
            <div class="module-panel-header"><div><p class="eyebrow">Carga externa</p><h3>Kg totales por microciclo</h3></div></div>
            ${renderClientVolumeBarChart(weekly, "Tonelaje Kg", "Sin tonelaje registrado todavía.", { valueKey: "tonnage", format: value => Math.round(value) })}
          </article>
          <article class="periodicity-card client-periodicity-card client-distribution-card">
            <div class="module-panel-header"><div><p class="eyebrow">Distribución</p><h3>TS · TI · Core · Plyo</h3></div></div>
            ${renderClientDistribution()}
          </article>
        </section>
      </div>
    </details>
  `;
}

function renderClientDashboard() {
  refreshCompletedSessions();
  const stats = getClientDashboardStats();
  const weekly = getClientWeeklyData();
  const plyo = getClientPlyometricData();

  const html = `
    <div class="ppf-client-home">
      <div class="ppf-home-section-head">
        <div>
          <p>Tu entrenamiento</p>
          <h2>Esto es lo que necesitas saber hoy</h2>
        </div>
      </div>

      ${renderClientHomeNextSession()}
      ${renderClientHomeSmartCards(stats)}
      ${renderClientHomeProgress(stats)}
      ${renderClientDetailedPerformance(stats, weekly, plyo)}
    </div>
  `;

  setTimeout(animateClientPeriodicityCharts, 80);
  return html;
}


function refreshCompletedSessions() {
  completedSessions = JSON.parse(localStorage.getItem("completedSessions")) || [];
}


function getClientSortedSessionDates() {
  return [...new Set(
    sessions
      .filter(session => sessionBelongsToCurrentClient(session) && session.fecha)
      .map(session => session.fecha)
  )].sort();
}

function getClientComputedMicro(session) {
  const savedMicro = Number(session?.microciclo);
  if (Number.isFinite(savedMicro) && savedMicro > 0) return savedMicro;
  if (!session?.fecha) return "-";
  const dates = getClientSortedSessionDates();
  return dates.indexOf(session.fecha) + 1;
}

function getClientSessionDisplayNumber(session = {}) {
  const explicit = String(session.displaySessionNumber || "").trim();
  if (explicit) return explicit;
  const base = Number(session.sessionBaseNumber || session.microciclo || session.numero || 0);
  const order = Number(session.subsessionOrder || session.dayOrder || 1);
  return base > 0 ? `${base}.${Math.max(1, order)}` : String(session.numero || "-");
}

function getClientSessionKind(session = {}) {
  const kinds = {
    gym: { icon: "🏋️", label: "Gimnasio" }, field: { icon: "🏟️", label: "Campo" },
    recovery: { icon: "🧘", label: "Recuperación" }, testing: { icon: "📊", label: "Test / Valoración" },
    competition: { icon: "🏆", label: "Competición" }, other: { icon: "🎯", label: "Otra" }
  };
  return kinds[String(session.sessionKind || session.sessionType || "gym").toLowerCase()] || kinds.other;
}

function getClientMicroLabel(session) {
  const micro = getClientComputedMicro(session);
  return `Micro ${micro} · ${session.fecha || ""}`;
}


function normalizeClientIdentity(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^@+/, "")
    .replace(/\s+/g, "");
}

function sessionBelongsToCurrentClient(session = {}) {
  const owner = session.patientNickname || session.nickname || session.patient || session.patientId || session.cliente || session.clientNickname || "";
  const identities = [currentPatient?.nickname, currentUser?.nickname, currentUser?.username, currentUser?.user]
    .map(normalizeClientIdentity)
    .filter(Boolean);
  return identities.includes(normalizeClientIdentity(owner));
}

function isSessionCompleted(sessionId) {
  const session = sessions.find(item => String(item.id || item.sessionId || "") === String(sessionId || ""));
  if (window.PPF_SESSION_TRUTH && session) {
    return window.PPF_SESSION_TRUTH.isCompleted(session, completedSessions);
  }
  const sid = String(sessionId || "");
  return completedSessions.some(item => String(item.sessionId || item.id || "") === sid);
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
  const summary = window.PPF_CORE?.summary?.(currentPatient.nickname);
  return summary ? summary.completedSessions : [];
}

function getClientPendingSessions() {
  refreshCompletedSessions();
  const summary = window.PPF_CORE?.summary?.(currentPatient.nickname);
  return summary ? summary.pendingSessions : [];
}

function completeClientSession(sessionId) {
  const session = sessions.find(item => item.id === sessionId);
  if (!session) return;

  if (isSessionCompleted(sessionId)) return;

  const confirmed = confirm(`¿Marcar la sesión ${getClientSessionDisplayNumber(session)} como terminada?`);
  if (!confirmed) return;

  completedSessions.push({
  sessionId,
  numero: session.numero,
  microciclo: session.microciclo,
  patientNickname: currentPatient.nickname,
  completedAt: new Date().toISOString()
});

  localStorage.setItem("completedSessions", JSON.stringify(completedSessions));
  window.PPF_CORE?.emit?.("completedSessions");
  // B.2.1.4.5 · Instant Refresh: retiramos el aviso de esta sesión en el mismo
  // tick visual. Después el reconciliador confirma la sustitución exacta en
  // Supabase, evitando tanto el parpadeo como una posible resurrección.
  try { window.PPF_NOTIFICATIONS?.purgePreparedSessionLocal?.(sessionId); } catch (_) {}
  try { window.dispatchEvent(new CustomEvent("PPF_NOTIFICATION_LIFECYCLE_RECONCILE", { detail: { sessionId } })); } catch (_) {}

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
  if (window.PPF_SESSION_TRUTH) return window.PPF_SESSION_TRUTH.isCompleted(session, completedSessions);
  const sessionNumber = normalizeSessionNumber(session);
  const patientNickname = session?.patientNickname || currentClient?.nickname || currentClient?.id || "";
  return completedSessions.some(item => {
    const sameId = item.sessionId && session.id && String(item.sessionId) === String(session.id);
    const samePatient = String(item.patientNickname || "") === String(patientNickname || "");
    const completedNumber = Number(item.numero || item.numeroSesion || item.sessionNumber || 0);
    return sameId || (samePatient && completedNumber && sessionNumber && completedNumber === sessionNumber);
  });
}

function persistCompletedSessionsAndCloud() {
  localStorage.setItem("completedSessions", JSON.stringify(completedSessions));
  window.PPF_CORE?.emit?.("completedSessions");

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
          <h3>Foco de la sesión ${getClientSessionDisplayNumber(session)}</h3>
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
        <span class="session-badge">${getClientSessionKind(nextSession).icon} Sesión ${getClientSessionDisplayNumber(nextSession)}</span>
        <span class="session-date">${getClientMicroLabel(nextSession)}</span>
      </div>

      <h2>Sesión próxima</h2>
      <p class="client-session-kind">${getClientSessionKind(nextSession).icon} ${getClientSessionKind(nextSession).label}</p>
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




/* P.P.F. v3.6.0-alpha.2 · Android Health Connect Bridge */
function ppfClientHealthSnapshot() {
  try { return window.PPF_HEALTH_BRIDGE?.snapshot?.(currentPatient?.nickname || currentUser?.nickname) || {}; } catch (_) { return {}; }
}

function ppfClientHealthPermissionSet(snapshot) {
  const scope = snapshot?.meta?.permission_scope;
  return new Set(Array.isArray(scope) ? scope.map(v => String(v).toLowerCase()) : []);
}

function ppfClientHealthPanelHTML() {
  const athlete = currentPatient?.nickname || currentUser?.nickname || "-";
  const snap = ppfClientHealthSnapshot();
  const perms = ppfClientHealthPermissionSet(snap);
  const nativeReady = !!(window.PPF_NATIVE_HEALTH || window.AndroidHealthBridge || window.webkit?.messageHandlers?.ppfHealth);
  const lastSync = snap?.meta?.last_sync ? new Date(snap.meta.last_sync).toLocaleString("es-ES") : "Sin sincronización";
  const source = snap?.meta?.source || "Sin origen todavía";
  const safeNum = value => Number.isFinite(Number(value)) ? Number(value) : null;
  const formatMinutes = value => {
    const minutes = safeNum(value);
    if (minutes === null) return "Sin datos";
    const h = Math.floor(minutes / 60), m = Math.round(minutes % 60);
    return h ? `${h} h ${String(m).padStart(2,"0")} min` : `${m} min`;
  };
  const formatTime = iso => {
    if (!iso) return "";
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("es-ES", { hour:"2-digit", minute:"2-digit" });
  };
  const healthValue = {
    sleep: snap?.sleep ? formatMinutes(snap.sleep.value) : "Sin datos",
    heart_rate: snap?.heartRate ? `${Math.round(Number(snap.heartRate.value))} ppm` : "Sin datos",
    steps: Number.isFinite(Number(snap?.stepsToday)) && Number(snap.stepsToday) > 0 ? `${Number(snap.stepsToday).toLocaleString("es-ES")} pasos` : "Sin datos",
    workout: Array.isArray(snap?.workoutsToday) && snap.workoutsToday.length ? `${snap.workoutsToday.length} actividad${snap.workoutsToday.length === 1 ? "" : "es"}` : "Sin datos"
  };
  const healthDetail = {
    sleep: snap?.sleep ? `Último registro · ${new Date(snap.sleep.end_time || snap.sleep.start_time).toLocaleDateString("es-ES")}` : "Health Connect aún no ha entregado sueño.",
    heart_rate: snap?.heartRate ? `Última lectura${formatTime(snap.heartRate.start_time) ? ` · ${formatTime(snap.heartRate.start_time)}` : ""}${snap?.heart24Range ? ` · 24 h ${Math.round(snap.heart24Range.min)}–${Math.round(snap.heart24Range.max)} ppm` : ""}` : "Health Connect aún no ha entregado frecuencia cardíaca.",
    steps: Number(snap?.stepsToday) > 0 ? "Total agregado de hoy en Health Connect." : "Health Connect aún no ha entregado pasos de hoy.",
    workout: Array.isArray(snap?.workoutsToday) && snap.workoutsToday.length ? "Entrenamientos externos registrados hoy." : "Health Connect aún no ha entregado entrenamientos de hoy."
  };
  const cards = [
    ["sleep","😴","Sueño","Duración y registros de sueño disponibles en Health Connect."],
    ["heart_rate","❤️","Frecuencia cardíaca","Lecturas de frecuencia cardíaca registradas por fuentes compatibles."],
    ["steps","🚶","Actividad / pasos","Pasos y actividad diaria registrada en el dispositivo."],
    ["workout","🏃","Entrenamientos","Sesiones de ejercicio registradas fuera de P.P.F."]
  ];
  return `
    <section class="ppf-client-health-shell">
      <section class="ppf-client-health-hero">
        <div><p class="eyebrow">P.P.F. HEALTH BRIDGE · ALPHA 2</p><h2>Datos de salud</h2><p>Conecta Health Connect para que P.P.F. lea únicamente las categorías que autorices. Los valores mostrados proceden del dispositivo; P.P.F. no completa datos ausentes.</p></div>
        <div class="ppf-client-health-state"><b>${nativeReady ? "Bridge Android disponible" : "Bridge móvil pendiente"}</b><span>${source}</span></div>
      </section>
      <section class="ppf-client-health-consent"><strong>🔐 TU PERMISO MANDA</strong><span>Acceso de solo lectura y por categorías. Puedes rechazar o revocar permisos desde Health Connect. En esta Alpha los datos permanecen en el dispositivo de prueba.</span></section>
      <div class="ppf-client-health-grid">${cards.map(([key,icon,title,desc])=>`<article class="ppf-health-data-card"><div class="ppf-health-card-top"><span class="ppf-health-icon">${icon}</span><span class="ppf-health-permission ${perms.has(key)?"ok":""}">${perms.has(key)?"PERMITIDO":"SIN PERMISO"}</span></div><h3>${title}</h3><div class="ppf-health-live-value ${healthValue[key] === "Sin datos" ? "empty" : ""}">${healthValue[key]}</div><p class="ppf-health-live-detail">${healthDetail[key]}</p><p class="ppf-health-card-desc">${desc}</p></article>`).join("")}</div>
      <section class="ppf-client-health-actions">
        <button type="button" class="primary-btn" data-ppf-health-connect>Conectar Health Connect</button>
        <button type="button" class="secondary-btn" data-ppf-health-sync>Sincronizar ahora</button>
        <button type="button" class="secondary-btn" data-ppf-health-permissions>Gestionar permisos</button>
        <p>${nativeReady ? "Bridge Android detectado. Puedes conceder permisos y sincronizar datos reales." : "Esta PWA no puede leer Health Connect por sí sola. Para permisos y lecturas reales abre P.P.F. desde el bridge Android nativo."}</p>
      </section>
      <div class="ppf-client-health-meta"><article><small>ÚLTIMA SINCRONIZACIÓN</small><strong>${lastSync}</strong></article><article><small>ORIGEN</small><strong>${source}</strong></article><article><small>DEPORTISTA</small><strong>@${athlete}</strong></article></div>
      <p class="ppf-client-health-truth">Health Truth: P.P.F. muestra únicamente registros entregados por una fuente autorizada; no estima sueño, pulsaciones, pasos ni entrenamientos cuando el dispositivo no los proporciona.</p>
    </section>`;
}

function ppfClientHealthNativeAction(action) {
  const athlete = currentPatient?.nickname || currentUser?.nickname || "";
  const bridge = window.PPF_NATIVE_HEALTH;
  try {
    if (bridge && typeof bridge[action] === "function") return bridge[action]({ athlete_id: athlete, metrics:["sleep","heart_rate","steps","workout"] });
    if (window.AndroidHealthBridge && typeof window.AndroidHealthBridge[action] === "function") return window.AndroidHealthBridge[action](athlete);
    if (window.webkit?.messageHandlers?.ppfHealth) return window.webkit.messageHandlers.ppfHealth.postMessage({ action, athlete_id: athlete, metrics:["sleep","heart_rate","steps","workout"] });
  } catch (error) { console.warn("P.P.F. Health Bridge action failed", error); }
  const msg = "Health Connect todavía no puede abrirse desde la PWA. El acceso móvil ya está preparado; falta instalar/conectar el bridge Android nativo para lanzar los permisos reales.";
  if (window.PPF_FEEDBACK?.show) window.PPF_FEEDBACK.show({ message: msg, type: "info" }); else alert(msg);
}

document.addEventListener("click", event => {
  if (event.target.closest("[data-ppf-health-connect]")) { event.preventDefault(); ppfClientHealthNativeAction("requestPermissions"); }
  if (event.target.closest("[data-ppf-health-sync]")) { event.preventDefault(); ppfClientHealthNativeAction("sync"); }
  if (event.target.closest("[data-ppf-health-permissions]")) { event.preventDefault(); ppfClientHealthNativeAction("openPermissions"); }
});

window.addEventListener("ppf:health-updated", () => {
  const active = document.querySelector('.client-nav-item.active')?.dataset.clientSection;
  if (active === "salud" && typeof renderClientSection === "function") renderClientSection("salud");
});

const clientSections = {
  inicio: {
    title: "Inicio",
    html: () => renderClientDashboard()
  },
  dashboard: {
    title: "Inicio",
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
    title: "Mis Valoraciones",
    html: () => `${clientValuationChartsHTML()}`
  },
  salud: {
    title: "Datos de salud",
    html: () => ppfClientHealthPanelHTML()
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
  const nickSet = new Set([
    nickname,
    currentUser?.nickname,
    currentPatient?.nickname,
    currentPatient?.nombre,
    currentUser?.username,
    currentUser?.user,
    currentUser?.name,
    currentUser?.nombre
  ].map(clientNormalize).filter(Boolean));

  const groups = {};

  (Array.isArray(all) ? all : [])
    .filter(v =>
      nickSet.has(clientNormalize(v.patientNickname)) ||
      nickSet.has(clientNormalize(v.patientName)) ||
      nickSet.has(clientNormalize(v.nombrePaciente))
    )
    .slice()
    .sort((a, b) => clientValuationDateOrder(a.fecha) - clientValuationDateOrder(b.fecha) || String(a.createdAt || "").localeCompare(String(b.createdAt || "")))
    .forEach(v => {
      (v.tests || []).forEach(test => {
        const testName = String(test.nombre || "").trim();
        const unit = String(test.unidad || test.unidad1 || test.unidad2 || test.unidad3 || "").trim();
        const attempts = [test.intento1, test.intento2, test.intento3]
          .map(parseClientValuationNumber)
          .filter(value => value !== null);

        if (!testName || !attempts.length) return;

        const key = `${testName.toLowerCase()}__${unit}`;
        if (!groups[key]) {
          groups[key] = { testName, name: testName, unit, patientName: currentPatient?.nombre || currentUser?.nombre || "Paciente", days: {} };
        }

        const fecha = v.fecha || "-";
        if (!groups[key].days[fecha]) groups[key].days[fecha] = { fecha, attempts: [] };
        groups[key].days[fecha].attempts.push(...attempts);
      });
    });

  return Object.values(groups)
    .map(group => ({
      ...group,
      days: Object.values(group.days)
        .sort((a, b) => clientValuationDateOrder(a.fecha) - clientValuationDateOrder(b.fecha) || String(a.fecha).localeCompare(String(b.fecha)))
        .map(day => {
          const mean = day.attempts.reduce((acc, value) => acc + value, 0) / day.attempts.length;
          return { ...day, mean: Number(mean.toFixed(2)) };
        })
    }))
    .filter(group => group.days.length)
    .sort((a, b) => a.testName.localeCompare(b.testName, "es"));
}

function formatClientValuationChartNumber(value, decimals = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return Number.isInteger(number) ? String(number) : number.toFixed(decimals).replace(/\.00$/, "");
}

function clientValuationChartSVG(group) {
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
  const trendPct = first.mean ? Number(((trend / first.mean) * 100).toFixed(2)) : 0;
  const trendPctLabel = trendPct > 0 ? `+${trendPct}%` : `${trendPct}%`;
  const yTicks = [(maxRaw + minRaw) / 2].map(value => Number(value.toFixed(2)));
  const trendText = formatClientValuationChartNumber(trend, 2).replace(/^([^\-])/, trend > 0 ? "+$1" : "$1");

  return `
    <article class="valuation-chart-card valuation-chart-pro-card client-valuation-chart-card">
      <div class="valuation-chart-head pro-chart-head">
        <div>
          <span>${escapeHTML(group.patientName || currentPatient?.nombre || "Paciente")}</span>
          <h4>${escapeHTML(group.testName || group.name)}${group.unit ? ` (${escapeHTML(group.unit)})` : ""}</h4>
          <p>Barras verdes = datos individuales · Línea azul = media diaria</p>
        </div>
        <strong>${escapeHTML(String(last.mean))}${group.unit ? ` ${escapeHTML(group.unit)}` : ""}</strong>
      </div>

      <svg class="valuation-line-chart valuation-pro-chart client-valuation-chart-svg" viewBox="0 0 ${width} ${height}" role="img">
        ${yTicks.map(tick => {
          const y = yForValue(tick);
          return `<line x1="${padX}" y1="${y}" x2="${width - padX}" y2="${y}" class="valuation-grid-line" />`;
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
                 data-date="${escapeHTML(day.fecha)}"
                 data-label="Intento ${attemptIndex + 1}"
                 data-value="${escapeHTML(String(value))}"
                 data-unit="${escapeHTML(group.unit || "")}">
                <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="6"></rect>
              </g>`;
          }).join("");
        }).join("")}

        <polyline points="${meanPolyline}" class="valuation-chart-line valuation-mean-line" fill="none" />

        ${meanPoints.map(point => `
          <g class="valuation-chart-point valuation-mean-point valuation-tooltip-source"
             data-date="${escapeHTML(point.fecha)}"
             data-label="Media diaria"
             data-value="${escapeHTML(String(point.mean))}"
             data-unit="${escapeHTML(group.unit || "") }"
             data-attempts="${escapeHTML(point.attempts.join(" · "))}">
            <circle cx="${point.x}" cy="${point.y}" r="6.5"></circle>
          </g>`).join("")}

        ${meanPoints.map((point, index) => {
          if (days.length > 8 && index !== 0 && index !== days.length - 1) return "";
          return `<text x="${point.x}" y="${height - 10}" text-anchor="middle" class="valuation-chart-date">${escapeHTML(point.fecha)}</text>`;
        }).join("")}
      </svg>

      <div class="valuation-chart-summary client-valuation-summary">
        <div><span>Inicial</span><strong>${escapeHTML(String(first.mean))}${group.unit ? ` ${escapeHTML(group.unit)}` : ""}</strong><small>${escapeHTML(first.fecha)}</small></div>
        <div><span>Actual</span><strong>${escapeHTML(String(last.mean))}${group.unit ? ` ${escapeHTML(group.unit)}` : ""}</strong><small>${escapeHTML(last.fecha)}</small></div>
        <div class="valuation-trend-kpi ${trend > 0 ? "trend-up" : trend < 0 ? "trend-down" : "trend-flat"}">
          <span>Tendencia</span>
          <b class="valuation-trend-arrow" title="${trend > 0 ? "Ascendente" : trend < 0 ? "Descendente" : "Estable"}">${trend > 0 ? "↑" : trend < 0 ? "↓" : "→"}</b>
          <strong>${escapeHTML(trendText)}${group.unit ? ` ${escapeHTML(group.unit)}` : ""}</strong>
          <small>${escapeHTML(trendPctLabel)}</small>
        </div>
      </div>

      <p class="valuation-chart-note">Las barras verdes representan los intentos individuales de cada día. La línea azul representa la media diaria.</p>
    </article>`;
}

function clientValuationChartsHTML() {
  const groups = clientValuationGroups();
  if (!groups.length) {
    return `<section class="content-card client-valuations-pro"><p class="eyebrow">Mis Valoraciones</p><h2>Gráficas de evolución</h2><p>No hay tests numéricos registrados todavía.</p></section>`;
  }

  return `
    <section class="content-card client-valuations-pro">
      <p class="eyebrow">Mis Valoraciones</p>
      <h2>Gráficas de evolución</h2>
      <p>Formato PRO sincronizado con el panel Admin.</p>
      <div class="valuation-charts-grid valuation-charts-grid-pro client-valuation-grid">
        ${groups.map(clientValuationChartSVG).join("")}
      </div>
    </section>`;
}

function ensureClientValuationTooltip() {
  if (document.getElementById("valuationChartTooltip")) return;

  const tooltip = document.createElement("div");
  tooltip.id = "valuationChartTooltip";
  tooltip.className = "valuation-chart-tooltip";
  tooltip.innerHTML = `<strong></strong><div class="tooltip-line tooltip-main"></div><div class="tooltip-line tooltip-extra"></div>`;
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
    if (left + rect.width > window.scrollX + window.innerWidth - 12) left = event.pageX - rect.width - offset;
    if (top + rect.height > window.scrollY + window.innerHeight - 12) top = event.pageY - rect.height - offset;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  });

  document.addEventListener("pointerout", event => {
    if (!event.target.closest(".valuation-tooltip-source")) return;
    tooltip.classList.remove("show");
  });
}

function renderClientSection(key) {
  const sectionKey = clientSections[key] ? key : "inicio";
  const section = clientSections[sectionKey];
  if (!section || !clientSectionTitle || !clientContentArea) return;
  clientSectionTitle.textContent = section.title;
  const isHome = sectionKey === "inicio" || sectionKey === "dashboard";
  document.body.classList.toggle("client-home-active", isHome);
  clientContentArea.classList.toggle("client-home-surface", isHome);
  clientContentArea.innerHTML = typeof section.html === "function" ? section.html() : section.html;
  window.PPF_CLIENT_HERO?.setSection?.(sectionKey);
  if (sectionKey === "historial") { pmClientCleanFakeValuations(true); if (typeof ensureClientValuationTooltip === "function") ensureClientValuationTooltip(); }

  document.querySelectorAll(".client-mobile-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.clientSection === sectionKey || (sectionKey === "dashboard" && tab.dataset.clientSection === "inicio"));
  });
}


function navigateClientHome(targetSection) {
  const key = clientSections[targetSection] ? targetSection : "inicio";
  if (typeof window.PM_FINAL_CLIENT_SECTION === "function") {
    window.PM_FINAL_CLIENT_SECTION(key);
  } else {
    document.querySelectorAll(".client-nav-item").forEach(item => {
      item.classList.toggle("active", item.dataset.clientSection === key || (key === "dashboard" && item.dataset.clientSection === "inicio"));
    });
    renderClientSection(key);
  }
  try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (_) {}
}

document.addEventListener("click", event => {
  const progressDetail = event.target.closest("[data-client-progress-sessions]");
  if (progressDetail) {
    event.preventDefault();
    const detail = document.querySelector(".ppf-home-detail");
    if (detail) {
      detail.open = true;
      try { detail.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (_) {}
    }
    return;
  }

  const action = event.target.closest("[data-client-nav-action]");
  if (!action) return;
  event.preventDefault();
  navigateClientHome(action.dataset.clientNavAction || "inicio");
});

window.PPF_CLIENT_NAVIGATE = navigateClientHome;

clientNavItems.forEach(item => {
  item.addEventListener("click", () => {
    const key = item.dataset.clientSection || "inicio";
    clientNavItems.forEach(nav => nav.classList.remove("active"));
    item.classList.add("active");
    renderClientSection(key);
  });
});

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




/* PM FIX 2026-08-07 · Navegación móvil heredada eliminada.
   La única barra inferior cliente es .client-mobile-bottom-nav de cliente.html. */

async function pmClientRefreshCloudData() {
  try {
    if (window.PPF_SUPABASE?.pull) await window.PPF_SUPABASE.pull();
    pmClientCleanFakeValuations(true);
    const active = document.querySelector(".client-nav-item.active")?.dataset.clientSection || "dashboard";
    if (typeof renderClientSection === "function") renderClientSection(active);
  } catch (error) {
    console.warn("No se pudo refrescar datos cliente:", error);
  }
}

document.addEventListener("visibilitychange", () => { if (!document.hidden) pmClientRefreshCloudData(); });
window.addEventListener("storage", event => { if (["valoraciones","patients","histories"].includes(event.key)) pmClientRefreshCloudData(); });
setTimeout(pmClientRefreshCloudData, 900);



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
    document.querySelectorAll(".client-mobile-tab").forEach(btn => {
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
    const tab = event.target.closest(".client-mobile-tab");
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
  window.currentPatient = currentPatient;
  if (currentPatient) {
    const name = document.getElementById("clientHeaderName");
    const avatar = document.getElementById("clientAvatar");
    if (name) name.textContent = currentPatient.nombre || currentUser.nickname;
    if (avatar) avatar.textContent = String(currentPatient.nombre || currentUser.nickname || "?").charAt(0).toUpperCase();
    window.PPF_CLIENT_HERO?.render?.({ patient: currentPatient });
  }
}

function pmClientRefreshVisibleSectionAfterSync() {
  pmClientReloadRuntimeFromStorage();
  if (typeof pmClientCleanFakeValuations === "function") pmClientCleanFakeValuations(false);
  const active = document.querySelector(".client-nav-item.active")?.dataset.clientSection || "dashboard";
  if (typeof renderClientSection === "function") renderClientSection(active);
}

window.addEventListener("PPF_APP_DATA_REFRESH", pmClientRefreshVisibleSectionAfterSync);
window.addEventListener("PPF_SUPABASE_SYNCED", function(event){
  if (event.detail && event.detail.direction === "pull") pmClientRefreshVisibleSectionAfterSync();
});
setTimeout(function(){ if (window.PPF_SYNC_ON_OPEN) window.PPF_SYNC_ON_OPEN("client-start"); }, 500);


  // B.2.1.1 · Progress Navigation Polish:
  // "Ver mis entrenamientos" has a distinct responsibility from "Ver rendimiento detallado".
  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-client-progress-sessions]");
    if (!btn) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    if (typeof window.PPF_CLIENT_NAVIGATE === "function") {
      window.PPF_CLIENT_NAVIGATE("sesiones");
    } else if (typeof window.PM_FINAL_CLIENT_SECTION === "function") {
      window.PM_FINAL_CLIENT_SECTION("sesiones");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.querySelector('.client-nav-item[data-client-section="sesiones"]')?.click();
    }
  }, true);

})();



/* PPF PRO · FASE 2 · sincronización automática Cliente/PWA */
try {
  window.PPF_PRESENCE?.startAutoSync?.({ intervalMs: 10000 });

  window.addEventListener("ppf:presence-cloud-change", () => {
    try {
      const user = JSON.parse(localStorage.getItem("currentUser") || "null") || currentUser;
      if (user?.role === "client") {
        window.PPF_PRESENCE?.update?.(user, true, {
          sync: true,
          pushCloud: false
        });
      }
    } catch (_) {}
  });
} catch (error) {
  console.warn("No se pudo iniciar la sincronización de presencia del cliente:", error);
}
