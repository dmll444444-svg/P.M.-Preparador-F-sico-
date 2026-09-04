# Corrección de visibilidad de la barra inferior del Admin

La barra se activa ahora cuando se cumple cualquiera de estas condiciones:

- viewport de hasta 1024 px;
- dispositivo con puntero táctil;
- aplicación instalada en modo standalone/PWA.

Además, usa prioridad visual alta, respeta el área segura inferior y actualiza la versión de caché del service worker.
