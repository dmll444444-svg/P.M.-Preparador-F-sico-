# PPF PRO v2.5.0.3.1.B.2.1.4.6 · Instant Pending KPI Sync

## Objetivo
Actualizar al instante los KPI de **Creación sesiones** después de guardar una sesión, sin necesitar recargar la aplicación.

## Cambio
- Tras confirmar el guardado de la sesión, `admin.js` repinta los KPI del contexto `sesiones`.
- El cálculo sigue centralizado en `PPF_CORE.agenda()`: no se introduce un contador paralelo.
- No se modifica el ciclo de vida de notificaciones estabilizado en B.2.1.4.5.
- Cache-busting de `admin.js` actualizado a B.2.1.4.6.

## Resultado esperado
Si el KPI muestra 0 pendientes y se crea una sesión, pasa a 1 inmediatamente tras el guardado; una segunda sesión lo lleva a 2, sin F5.
