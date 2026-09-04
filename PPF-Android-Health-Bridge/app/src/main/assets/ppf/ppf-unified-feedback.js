/* PPF PRO v2.5.0.2.2 · Unified Buttons & Feedback */
(() => {
  "use strict";

  const ICONS = Object.freeze({ success: "✓", info: "i", warning: "!", error: "×" });
  let region;

  function getRegion() {
    if (region?.isConnected) return region;
    region = document.createElement("section");
    region.className = "ppf-feedback-region";
    region.setAttribute("aria-label", "Mensajes de la aplicación");
    document.body.appendChild(region);
    return region;
  }

  function dismiss(toast) {
    if (!toast?.isConnected || toast.classList.contains("is-leaving")) return;
    toast.classList.add("is-leaving");
    window.setTimeout(() => toast.remove(), 190);
  }

  function notify(options = {}) {
    const type = ["success", "info", "warning", "error"].includes(options.type) ? options.type : "info";
    const duration = Math.max(1400, Number(options.duration) || 4200);
    const title = String(options.title || ({ success: "Acción completada", info: "Información", warning: "Atención", error: "No se pudo completar" })[type]);
    const message = String(options.message || "");
    const toast = document.createElement("article");
    toast.className = "ppf-feedback-toast";
    toast.dataset.type = type;
    toast.style.setProperty("--ppf-feedback-duration", `${duration}ms`);
    toast.setAttribute("role", type === "error" || type === "warning" ? "alert" : "status");
    toast.setAttribute("aria-live", type === "error" ? "assertive" : "polite");

    const icon = document.createElement("span");
    icon.className = "ppf-feedback-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = ICONS[type];

    const copy = document.createElement("span");
    copy.className = "ppf-feedback-copy";
    const strong = document.createElement("strong");
    strong.textContent = title;
    copy.appendChild(strong);
    if (message) {
      const small = document.createElement("small");
      small.textContent = message;
      copy.appendChild(small);
    }

    const close = document.createElement("button");
    close.type = "button";
    close.className = "ppf-feedback-close";
    close.setAttribute("aria-label", "Cerrar mensaje");
    close.textContent = "✕";
    close.addEventListener("click", () => dismiss(toast));

    const progress = document.createElement("span");
    progress.className = "ppf-feedback-progress";
    progress.setAttribute("aria-hidden", "true");

    toast.append(icon, copy, close, progress);
    getRegion().appendChild(toast);

    const active = [...getRegion().children];
    if (active.length > 4) dismiss(active[0]);
    const timer = window.setTimeout(() => dismiss(toast), duration);
    toast.addEventListener("mouseenter", () => { progress.style.animationPlayState = "paused"; });
    toast.addEventListener("mouseleave", () => { progress.style.animationPlayState = "running"; });
    toast.addEventListener("remove", () => window.clearTimeout(timer), { once: true });
    return toast;
  }

  function setBusy(element, busy = true, label = "Procesando") {
    if (!(element instanceof HTMLElement)) return;
    if (busy) {
      if (!element.dataset.ppfOriginalAriaLabel && element.getAttribute("aria-label")) {
        element.dataset.ppfOriginalAriaLabel = element.getAttribute("aria-label");
      }
      element.setAttribute("aria-busy", "true");
      element.setAttribute("aria-label", label);
      if ("disabled" in element) element.disabled = true;
    } else {
      element.removeAttribute("aria-busy");
      if (element.dataset.ppfOriginalAriaLabel) {
        element.setAttribute("aria-label", element.dataset.ppfOriginalAriaLabel);
        delete element.dataset.ppfOriginalAriaLabel;
      }
      if ("disabled" in element) element.disabled = false;
    }
  }

  const api = Object.freeze({ notify, success: (message, title) => notify({ type: "success", message, title }), info: (message, title) => notify({ type: "info", message, title }), warning: (message, title) => notify({ type: "warning", message, title }), error: (message, title) => notify({ type: "error", message, title }), setBusy, dismiss });
  globalThis.PPF_FEEDBACK = api;
  globalThis.dispatchEvent(new CustomEvent("PPF_FEEDBACK_READY", { detail: api }));
})();
