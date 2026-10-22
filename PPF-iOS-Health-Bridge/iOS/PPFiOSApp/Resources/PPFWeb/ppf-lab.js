"use strict";

(function () {
    const status = document.getElementById("ppf-lab-status");
    const button = document.getElementById("ppf-lab-button");

    if (!status || !button) {
        return;
    }

    button.addEventListener("click", function () {
        status.textContent = "Interacción local verificada.";
        status.setAttribute("data-state", "ok");
    });
})();