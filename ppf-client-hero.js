/* PPF PRO v2.5.0.3.1.A.2 · Hero Premium Polish */
(() => {
  "use strict";

  const root = document.getElementById("clientSmartHero");
  if (!root) return;

  const firstName = (value) => {
    const clean = String(value || "Cliente").trim().replace(/\s+/g, " ");
    if (!clean) return "Cliente";
    const parts = clean.split(" ");
    const compounds = new Set(["José", "Jose", "María", "Maria"]);
    return compounds.has(parts[0]) && parts[1] ? `${parts[0]} ${parts[1]}` : parts[0];
  };

  const greetingFor = (date) => {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) return { text: "Buenos días", icon: "👋" };
    if (hour >= 12 && hour < 20) return { text: "Buenas tardes", icon: "☀️" };
    return { text: "Buenas noches", icon: "🌙" };
  };

  const naturalDate = (date) => {
    const formatted = new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long"
    }).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1).replace(",", " ·");
  };

  const safePhoto = (patient) => patient?.foto || patient?.photo || patient?.imagen || patient?.image || patient?.avatar || "";

  function render(options = {}) {
    const patient = options.patient || window.currentPatient || {};
    const now = options.now instanceof Date ? options.now : new Date();
    const displayName = firstName(options.name || patient.nombre || patient.name || "Cliente");
    const greeting = greetingFor(now);
    const photo = options.photo || safePhoto(patient);
    const status = options.status || "En progreso";
    const message = options.message || "Hoy tienes una nueva oportunidad para seguir mejorando.";

    root.innerHTML = `
      <div class="ppf-client-hero__top">
        <div class="ppf-client-hero__identity">
          <div class="ppf-client-hero__avatar" data-ppf-hero-reveal style="--ppf-hero-delay:0ms" aria-hidden="true">
            ${photo ? `<img src="${photo}" alt="">` : displayName.charAt(0).toUpperCase()}
          </div>
          <div class="ppf-client-hero__copy">
            <p class="ppf-client-hero__greeting" data-ppf-hero-reveal style="--ppf-hero-delay:65ms">${greeting.text} ${greeting.icon}</p>
            <h2 class="ppf-client-hero__name" data-ppf-hero-reveal style="--ppf-hero-delay:125ms">${displayName}</h2>
            <p class="ppf-client-hero__date" data-ppf-hero-reveal style="--ppf-hero-delay:185ms">${naturalDate(now)}</p>
          </div>
        </div>
        <div class="ppf-client-hero__status" data-ppf-hero-reveal style="--ppf-hero-delay:245ms">
          <span class="ppf-client-hero__status-dot" aria-hidden="true"></span>
          <span>${status}</span>
        </div>
      </div>
      <p class="ppf-client-hero__message" data-ppf-hero-reveal style="--ppf-hero-delay:305ms">${message}</p>`;

    root.setAttribute("aria-label", `${greeting.text}, ${displayName}. ${naturalDate(now)}. ${message}`);
    root.classList.remove("is-entering");
    void root.offsetWidth;
    root.classList.add("is-entering");
    if (window.PPF_MOTION?.enter) window.PPF_MOTION.enter(root);
  }

  function setSection(sectionKey) {
    const visible = sectionKey === "dashboard" || sectionKey === "inicio";
    root.hidden = !visible;
    if (visible && !root.dataset.rendered) {
      render({ patient: window.currentPatient });
      root.dataset.rendered = "true";
    }
  }

  window.PPF_CLIENT_HERO = Object.freeze({ render, setSection, firstName, greetingFor, naturalDate });
  setSection("dashboard");

  // cliente.js inicia tras una espera asíncrona de Supabase. Si todavía no ha
  // publicado al cliente, reintentamos brevemente y sustituimos el fallback.
  let identityAttempts = 0;
  const identityTimer = window.setInterval(() => {
    identityAttempts += 1;
    if (window.currentPatient) {
      render({ patient: window.currentPatient });
      root.dataset.rendered = "true";
      window.clearInterval(identityTimer);
    } else if (identityAttempts >= 40) {
      window.clearInterval(identityTimer);
    }
  }, 125);
})();
