/* PPF PRO v2.5.0.2.4 · Smart States Framework */
(() => {
  "use strict";

  const TYPES = Object.freeze(["empty", "loading", "success", "warning", "error"]);
  const DEFAULTS = Object.freeze({
    empty: { icon: "○", title: "Todavía no hay contenido", message: "Cuando existan datos, aparecerán aquí." },
    loading: { icon: "", title: "Cargando", message: "Estamos preparando la información." },
    success: { icon: "✓", title: "Todo listo", message: "La operación se completó correctamente." },
    warning: { icon: "!", title: "Revisa esta información", message: "Hay datos que requieren tu atención." },
    error: { icon: "×", title: "No se pudo completar", message: "Inténtalo de nuevo o revisa los datos." }
  });
  const stateStore = new WeakMap();

  const asElement = (target) => typeof target === "string" ? document.querySelector(target) : target;
  const validType = (type) => TYPES.includes(type) ? type : "empty";

  function createAction(action) {
    if (!action || !action.label) return null;
    const button = document.createElement(action.href ? "a" : "button");
    button.className = action.className || "btn secondary";
    button.textContent = action.label;
    if (action.href) button.href = action.href;
    else button.type = "button";
    if (typeof action.onClick === "function") button.addEventListener("click", action.onClick);
    if (action.ariaLabel) button.setAttribute("aria-label", action.ariaLabel);
    return button;
  }

  function build(type, options = {}) {
    const kind = validType(type);
    const preset = DEFAULTS[kind];
    const root = document.createElement("div");
    root.className = `ppf-smart-state ppf-smart-state--${kind}${options.compact ? " ppf-smart-state--compact" : ""}`;
    root.dataset.ppfSmartState = kind;
    root.setAttribute("role", kind === "error" || kind === "warning" ? "alert" : "status");
    root.setAttribute("aria-live", kind === "error" ? "assertive" : "polite");

    const icon = document.createElement("div");
    icon.className = "ppf-smart-state__icon";
    icon.setAttribute("aria-hidden", "true");
    if (kind === "loading") {
      const spinner = document.createElement("span");
      spinner.className = "ppf-smart-state__spinner";
      icon.appendChild(spinner);
    } else icon.textContent = options.icon ?? preset.icon;

    const title = document.createElement("h3");
    title.className = "ppf-smart-state__title";
    title.textContent = options.title ?? preset.title;

    const message = document.createElement("p");
    message.className = "ppf-smart-state__message";
    message.textContent = options.message ?? preset.message;

    root.append(icon, title, message);
    const actions = (options.actions || (options.action ? [options.action] : [])).map(createAction).filter(Boolean);
    if (actions.length) {
      const wrap = document.createElement("div");
      wrap.className = "ppf-smart-state__actions";
      wrap.append(...actions);
      root.appendChild(wrap);
    }
    return root;
  }

  function show(target, type = "empty", options = {}) {
    const host = asElement(target);
    if (!(host instanceof Element)) return null;
    clear(host, { restore: false });
    const snapshot = options.preserveContent === false ? null : [...host.childNodes];
    const state = build(type, options);
    stateStore.set(host, { snapshot, state });
    host.classList.add("ppf-smart-state-host");
    host.setAttribute("data-ppf-current-state", validType(type));
    host.setAttribute("aria-busy", type === "loading" ? "true" : "false");
    if (snapshot) snapshot.forEach((node) => { if (node instanceof Element) node.hidden = true; else if (node.nodeType === Node.TEXT_NODE) node.__ppfText = node.textContent, node.textContent = ""; });
    else host.replaceChildren();
    host.appendChild(state);
    globalThis.PPF_MOTION?.enter?.(state);
    host.dispatchEvent(new CustomEvent("ppf:state-change", { bubbles: true, detail: { type: validType(type), options } }));
    return state;
  }

  function clear(target, options = {}) {
    const host = asElement(target);
    if (!(host instanceof Element)) return false;
    const saved = stateStore.get(host);
    const state = saved?.state || host.querySelector(":scope > .ppf-smart-state");
    if (state) state.remove();
    if (options.restore !== false && saved?.snapshot) saved.snapshot.forEach((node) => {
      if (node instanceof Element) node.hidden = false;
      else if (node.nodeType === Node.TEXT_NODE && Object.hasOwn(node, "__ppfText")) node.textContent = node.__ppfText;
    });
    stateStore.delete(host);
    host.classList.remove("ppf-smart-state-host");
    host.removeAttribute("data-ppf-current-state");
    host.removeAttribute("aria-busy");
    if (options.refresh !== false) globalThis.PPF_MOTION?.refresh?.(host);
    return !!state;
  }

  function bindCollection(target, options = {}) {
    const host = asElement(target);
    if (!(host instanceof Element)) return () => {};
    const selector = options.itemSelector || ":scope > *:not(.ppf-smart-state)";
    const evaluate = () => {
      const count = [...host.querySelectorAll(selector)].filter((el) => !el.hidden && getComputedStyle(el).display !== "none").length;
      if (count === 0) show(host, "empty", options.empty || options);
      else if (host.dataset.ppfCurrentState === "empty") clear(host);
      return count;
    };
    evaluate();
    const observer = new MutationObserver(evaluate);
    observer.observe(host, { childList: true, subtree: options.subtree === true, attributes: true, attributeFilter: ["hidden", "class", "style"] });
    return () => observer.disconnect();
  }

  function enhanceNative(root = document) {
    const candidates = root.querySelectorAll?.(".empty-state,.no-data,[data-empty-state],[data-ppf-empty]") || [];
    candidates.forEach((el) => {
      if (!(el instanceof Element) || el.classList.contains("ppf-smart-state") || el.dataset.ppfStateEnhanced === "1") return;
      const text = (el.textContent || "").trim();
      if (!text) return;
      el.dataset.ppfStateEnhanced = "1";
      el.classList.add("ppf-smart-state-native");
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
    });
  }

  function initDeclarative(root = document) {
    root.querySelectorAll?.("[data-ppf-state]").forEach((host) => {
      if (host.dataset.ppfStateReady === "1") return;
      host.dataset.ppfStateReady = "1";
      show(host, host.dataset.ppfState, {
        title: host.dataset.ppfStateTitle,
        message: host.dataset.ppfStateMessage,
        icon: host.dataset.ppfStateIcon,
        compact: host.hasAttribute("data-ppf-state-compact")
      });
    });
    enhanceNative(root);
  }

  function init() {
    document.documentElement.classList.add("ppf-smart-states-ready");
    initDeclarative();
    const observer = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
      if (!(node instanceof Element)) return;
      if (node.matches("[data-ppf-state]")) initDeclarative(node.parentElement || document);
      else initDeclarative(node);
    })));
    observer.observe(document.body, { childList: true, subtree: true });
    document.dispatchEvent(new CustomEvent("ppf:smart-states-ready", { detail: { types: TYPES } }));
  }

  globalThis.PPF_SMART_STATES = Object.freeze({
    TYPES, DEFAULTS, build, show, clear, bindCollection, enhanceNative, initDeclarative,
    empty: (target, options) => show(target, "empty", options),
    loading: (target, options) => show(target, "loading", options),
    success: (target, options) => show(target, "success", options),
    warning: (target, options) => show(target, "warning", options),
    error: (target, options) => show(target, "error", options)
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
