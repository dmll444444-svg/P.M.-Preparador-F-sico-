# PPF v3.4.2.4 · Notification Lifecycle Truth

- La notificación agrupada de un micro permanece solo mientras exista alguna sesión pendiente vinculada.
- Al completar o eliminar todas las sesiones del micro, la notificación desaparece de local y Supabase.
- La tarjeta del cliente se reconstruye desde Session Truth, no desde texto legacy persistido.
- Las sesiones ya completadas dejan de figurar en el resumen de la notificación.
- Si quedan dos sesiones pendientes el mismo día, se muestra el día exacto y sus números canónicos: `Doble sesión: <día> (M.x + M.y)`.
- Se incrementa versión/cache-buster a v3.4.2.4 para forzar la actualización PWA/GitHub Pages.
