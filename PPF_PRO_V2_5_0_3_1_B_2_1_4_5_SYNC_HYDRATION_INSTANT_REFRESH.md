# PPF PRO v2.5.0.3.1.B.2.1.4.5 · Sync Hydration & Instant Refresh Polish

## Cambios
- Admin: el refresco posterior a Supabase conserva la sección activa al recalcular KPI. Ya no fuerza el modo `paciente` mientras se está en `Creación sesiones`.
- Cliente: al completar una sesión se elimina inmediatamente en local su notificación `prepared_session`.
- Notificaciones: la reconciliación puede forzar una sustitución exacta remota incluso cuando la baja ya se realizó de forma optimista en local.
- Cache bust actualizado a `.4.5` en los scripts modificados.

## Regresión esperada
1. Recargar directamente en Creación sesiones: KPI correctos sin volver a pulsar el menú.
2. Crear sesión: campana 1 y una notificación.
3. Completar sesión: campana 0 y panel vacío inmediatamente.
4. Recargar: campana 0 y la notificación no reaparece.
