# PPF CORE v1.2.2 · Manual Reset + Delete Engine Fix

- Reinicio completo de restos manuales cuando todos los micros activos pasan a semanal automático.
- Reconstrucción cronológica M1..Mn después del cambio y del borrado.
- Eliminación por ID normalizado desde `sessions`, `completedSessions` y `notifications`.
- Tombstones locales `deletedSessionIds` para evitar resurrecciones durante sincronizaciones pendientes.
- Un único Delete Engine compartido por Creación de sesiones y Agenda PRO.
- NCI y Chronological Rebuild se ejecutan tras borrar una o varias sesiones.
