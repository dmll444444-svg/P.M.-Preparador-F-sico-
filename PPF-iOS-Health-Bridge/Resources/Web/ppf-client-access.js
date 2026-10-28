/* PPF PRO v2.5.0.3.1.B.1.2 · Client Layout & Access Polish */
(() => {
  "use strict";

  const button = document.getElementById("ppfClientFloatingMenuBtn");
  const drawer = document.getElementById("ppfClientFloatingMenuDrawer");
  const backdrop = document.getElementById("ppfClientFloatingMenuBackdrop");
  const closeButton = document.getElementById("ppfClientFloatingMenuClose");

  if (!button || !drawer || !backdrop) return;

  const desktop = () => window.matchMedia("(min-width: 1001px)").matches;

  function activeSection() {
    return document.querySelector(".client-nav-item.active")?.dataset.clientSection || "dashboard";
  }

  function syncActive() {
    const key = activeSection();
    drawer.querySelectorAll("[data-client-floating-section]").forEach(item => {
      item.classList.toggle("active", item.dataset.clientFloatingSection === key);
    });
  }

  function setVisibleFromScroll() {
    if (!desktop()) {
      button.classList.remove("is-visible");
      return;
    }
    const shouldShow = window.scrollY > 180 || drawer.classList.contains("open");
    button.classList.toggle("is-visible", shouldShow);
  }

  function openMenu() {
    if (!desktop()) return;
    syncActive();
    backdrop.hidden = false;
    drawer.hidden = false;
    drawer.removeAttribute("inert");
    drawer.setAttribute("aria-hidden", "false");
    button.setAttribute("aria-expanded", "true");
    button.classList.add("is-open", "is-visible");
    document.body.classList.add("ppf-client-menu-open");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        backdrop.classList.add("open");
        drawer.classList.add("open");
      });
    });

    setTimeout(() => closeButton?.focus(), 80);
  }

  function closeMenu({ restoreFocus = true } = {}) {
    backdrop.classList.remove("open");
    drawer.classList.remove("open");
    button.classList.remove("is-open");
    button.setAttribute("aria-expanded", "false");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("ppf-client-menu-open");

    setTimeout(() => {
      if (!drawer.classList.contains("open")) {
        drawer.hidden = true;
        drawer.setAttribute("inert", "");
      }
      if (!backdrop.classList.contains("open")) backdrop.hidden = true;
      setVisibleFromScroll();
    }, 270);

    if (restoreFocus) button.focus();
  }

  function navigate(section) {
    const key = section || "dashboard";
    if (typeof window.PPF_CLIENT_NAVIGATE === "function") {
      window.PPF_CLIENT_NAVIGATE(key);
    } else if (typeof window.PM_FINAL_CLIENT_SECTION === "function") {
      window.PM_FINAL_CLIENT_SECTION(key);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.querySelector(`.client-nav-item[data-client-section="${CSS.escape(key)}"]`)?.click();
    }
    closeMenu({ restoreFocus: false });
  }

  button.addEventListener("click", () => {
    drawer.classList.contains("open") ? closeMenu() : openMenu();
  });

  closeButton?.addEventListener("click", () => closeMenu());
  backdrop.addEventListener("click", () => closeMenu());

  drawer.addEventListener("click", event => {
    const nav = event.target.closest("[data-client-floating-section]");
    if (nav) {
      event.preventDefault();
      navigate(nav.dataset.clientFloatingSection);
      return;
    }

    const logout = event.target.closest("[data-client-floating-logout]");
    if (logout) {
      event.preventDefault();
      if (window.PPF_LOGOUT_AND_SYNC) {
        window.PPF_LOGOUT_AND_SYNC();
      } else {
        try { localStorage.removeItem("currentUser"); } catch (_) {}
        window.location.href = "index.html";
      }
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && drawer.classList.contains("open")) closeMenu();
  });

  window.addEventListener("scroll", setVisibleFromScroll, { passive: true });
  window.addEventListener("resize", () => {
    if (!desktop() && drawer.classList.contains("open")) closeMenu({ restoreFocus: false });
    setVisibleFromScroll();
  }, { passive: true });

  document.addEventListener("click", event => {
    if (event.target.closest(".client-nav-item, .client-mobile-tab, [data-client-nav-action]")) {
      setTimeout(syncActive, 0);
    }
  });

  setVisibleFromScroll();

  window.PPF_CLIENT_ACCESS = Object.freeze({
    open: openMenu,
    close: closeMenu,
    sync: syncActive
  });
})();
