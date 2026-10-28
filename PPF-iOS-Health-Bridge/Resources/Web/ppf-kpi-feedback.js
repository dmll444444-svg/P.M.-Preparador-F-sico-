/* PPF PRO v2.5.0.2.1 · KPI Update Feedback
   Capa visual no invasiva: observa cambios reales de valores y aplica feedback homogéneo. */
(() => {
  "use strict";

  const CARD_SELECTOR = [
    ".stat-card",
    ".admin-home-stat",
    ".session-kpi-card",
    ".periodicity-kpi",
    ".client-pro-kpis article",
    ".graph-pro-kpis article",
    ".system-stats article",
    ".kpi-module",
    ".valuation-trend-kpi",
    "[data-ppf-kpi]"
  ].join(",");

  const VALUE_SELECTOR = [
    "strong",
    ".kpi-value",
    "[data-kpi-value]",
    "[data-ppf-kpi-value]"
  ].join(",");

  const stateTimers = new WeakMap();
  const lastValues = new WeakMap();
  let observer = null;

  function normalizeValue(node) {
    return String(node?.textContent || "").replace(/\s+/g, " ").trim();
  }

  function findCard(node) {
    if (!(node instanceof Element)) return null;
    return node.matches(CARD_SELECTOR) ? node : node.closest(CARD_SELECTOR);
  }

  function isValueNode(node) {
    return node instanceof Element && node.matches(VALUE_SELECTOR) && Boolean(findCard(node));
  }

  function clearCardTimer(card) {
    const timer = stateTimers.get(card);
    if (timer) clearTimeout(timer);
  }

  function markUpdated(card, valueNode) {
    if (!card || !valueNode || card.classList.contains("ppf-kpi-skeleton")) return;

    clearCardTimer(card);
    card.classList.remove("ppf-kpi-updated");
    card.classList.add("ppf-kpi-updating");
    card.setAttribute("data-ppf-kpi-state", "updating");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.classList.remove("ppf-kpi-updating");
        card.classList.add("ppf-kpi-updated");
        card.setAttribute("data-ppf-kpi-state", "updated");

        const timer = setTimeout(() => {
          card.classList.remove("ppf-kpi-updated");
          card.setAttribute("data-ppf-kpi-state", "idle");
          stateTimers.delete(card);
        }, 720);
        stateTimers.set(card, timer);
      });
    });
  }

  function registerValueNode(node, animate = false) {
    if (!isValueNode(node)) return;
    const next = normalizeValue(node);
    const previous = lastValues.get(node);
    lastValues.set(node, next);

    if (animate && previous !== undefined && previous !== next) {
      markUpdated(findCard(node), node);
    }
  }

  function scan(root = document, animate = false) {
    if (root instanceof Element && isValueNode(root)) registerValueNode(root, animate);
    root.querySelectorAll?.(VALUE_SELECTOR).forEach(node => registerValueNode(node, animate));
  }

  function handleMutation(mutation) {
    if (mutation.type === "characterData") {
      const valueNode = mutation.target.parentElement?.closest(VALUE_SELECTOR);
      if (valueNode) registerValueNode(valueNode, true);
      return;
    }

    mutation.addedNodes.forEach(node => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      scan(node, false);
    });

    const target = mutation.target instanceof Element ? mutation.target : mutation.target.parentElement;
    const valueNode = target?.matches?.(VALUE_SELECTOR) ? target : target?.closest?.(VALUE_SELECTOR);
    if (valueNode) registerValueNode(valueNode, true);
  }

  function init() {
    scan(document, false);
    observer = new MutationObserver(mutations => mutations.forEach(handleMutation));
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    document.documentElement.classList.add("ppf-kpi-feedback-ready");
  }

  globalThis.PPFKPIFeedback = Object.freeze({
    version: "2.5.0.2.1",
    refresh(root = document) { scan(root, false); },
    mark(target) {
      const node = target instanceof Element ? target : document.querySelector(target);
      const valueNode = node?.matches?.(VALUE_SELECTOR) ? node : node?.querySelector?.(VALUE_SELECTOR);
      if (valueNode) markUpdated(findCard(valueNode), valueNode);
    },
    destroy() {
      observer?.disconnect();
      observer = null;
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
