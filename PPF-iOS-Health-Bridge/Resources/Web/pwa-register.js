(() => {
  let deferredInstallPrompt = null;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    document.body.classList.add("pwa-install-ready");
  });

  window.PM_PWA_INSTALL = async function PM_PWA_INSTALL() {
    if (!deferredInstallPrompt) {
      alert("Para instalarla: en Chrome pulsa ⋮ > Añadir a pantalla de inicio. En iPhone: Compartir > Añadir a pantalla de inicio.");
      return;
    }
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    document.body.classList.remove("pwa-install-ready");
  };
})();
