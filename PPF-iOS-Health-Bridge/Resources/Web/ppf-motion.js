/* PPF PRO v2.5.0.2.3 · Motion Engine */
(() => {
  "use strict";

  const SPEED = Object.freeze({ FAST: 120, NORMAL: 180, SMOOTH: 250, SLOW: 350 });
  const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
  const visible = (el) => !!(el && !el.hidden && el.getAttribute("aria-hidden") !== "true" && getComputedStyle(el).display !== "none");

  function restart(el, className, duration = SPEED.SMOOTH) {
    if (!(el instanceof Element) || reduced()) return el;
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
    window.setTimeout(() => el.classList.remove(className), duration + 60);
    return el;
  }

  function enter(el) { return restart(el, "ppf-motion-enter", SPEED.SMOOTH); }
  function refresh(el) { return restart(el, "ppf-motion-refresh", SPEED.NORMAL); }

  function reveal(container, selector) {
    if (!(container instanceof Element)) return [];
    const query = selector || ":scope > *";
    const items = [...container.querySelectorAll(query)].filter(visible).slice(0, 18);
    items.forEach((item, index) => {
      item.classList.add("ppf-motion-reveal");
      item.style.setProperty("--ppf-motion-delay", `${Math.min(index * 28, 224)}ms`);
      requestAnimationFrame(() => item.classList.add("is-visible"));
    });
    window.setTimeout(() => items.forEach((item) => {
      item.classList.remove("ppf-motion-reveal", "is-visible");
      item.style.removeProperty("--ppf-motion-delay");
    }), SPEED.SLOW + 300);
    return items;
  }

  function setSkeleton(target, state = true) {
    const elements = typeof target === "string" ? [...document.querySelectorAll(target)] :
      target instanceof Element ? [target] : Array.from(target || []).filter((item) => item instanceof Element);
    elements.forEach((el) => {
      el.classList.toggle("ppf-skeleton", !!state);
      el.setAttribute("aria-busy", state ? "true" : "false");
      if (!state) refresh(el);
    });
    return elements;
  }

  function animate(el, keyframes, options = {}) {
    if (!(el instanceof Element) || reduced() || typeof el.animate !== "function") return null;
    return el.animate(keyframes, { duration: SPEED.NORMAL, easing: "cubic-bezier(.2,.75,.25,1)", fill: "both", ...options });
  }

  function detectActiveViews() {
    const candidates = document.querySelectorAll("main section, main [data-section], .section, [id^='section-'], [id$='Section']");
    candidates.forEach((section) => {
      section.dataset.ppfWasVisible = visible(section) ? "1" : "0";
    });
    const observer = new MutationObserver((records) => {
      const touched = new Set(records.map((record) => record.target).filter((node) => node instanceof Element));
      touched.forEach((el) => {
        const section = el.matches("section,[data-section],.section,[id^='section-'],[id$='Section']") ? el : el.closest("section,[data-section],.section,[id^='section-'],[id$='Section']");
        if (!section) return;
        const now = visible(section);
        const was = section.dataset.ppfWasVisible === "1";
        section.dataset.ppfWasVisible = now ? "1" : "0";
        if (now && !was) {
          enter(section);
          const grid = section.querySelector(".kpi-grid,.cards-grid,.dashboard-grid,.grid");
          if (grid) reveal(grid, ":scope > *");
        }
      });
    });
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class", "style", "hidden", "aria-hidden"] });
  }

  function init() {
    document.documentElement.classList.add("ppf-motion-ready");
    detectActiveViews();
    document.dispatchEvent(new CustomEvent("ppf:motion-ready", { detail: { reduced: reduced(), speed: SPEED } }));
  }

  globalThis.PPF_MOTION = Object.freeze({ SPEED, reduced, enter, refresh, reveal, setSkeleton, animate });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
