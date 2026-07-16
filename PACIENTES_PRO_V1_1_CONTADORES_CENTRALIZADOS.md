# Pacientes PRO v1.1 · Contadores centralizados

- Nueva fuente compartida `session-truth.js`.
- Pacientes, Agenda, Dashboard, Client Workspace y Cliente consultan la misma regla de estado.
- Terminadas se reconocen por estado directo o registro en `completedSessions`.
- Canceladas quedan fuera de pendientes.
- Pendientes = sesiones activas no terminadas y no canceladas.
- Deduplicación por ID estable.
- Caché PWA renovada.
