# PPF CORE v1

Núcleo central para sesiones, estados, estadísticas, NCI y Agenda.

## Fuente única

`ppf-core.js` normaliza `sessions` y `completedSessions`, deduplica registros y expone una única interpretación para:

- terminadas, pendientes y canceladas;
- sesiones flexibles, sin hora y retrasadas;
- cumplimiento, micro actual y próxima sesión;
- orden cronológico y orden descendente del Admin;
- conflictos de Agenda.

## Consumidores iniciales

- Dashboard y KPI de sesiones.
- Pacientes PRO.
- Agenda PRO.
- Client Workspace.
- Cliente Web/PWA.

`session-truth.js` se mantiene como capa de compatibilidad y delega en PPF CORE.
