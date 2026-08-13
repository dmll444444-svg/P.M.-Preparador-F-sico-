# PPF v3.4.1 · Session Lifecycle Sync

## Objetivo
Cerrar el ciclo de vida de CLONACIÓN sincronizando el borrado de sesiones con las notificaciones.

## Cambios
- El borrado elimina avisos `prepared_session` vinculados por `sessionId`.
- El borrado elimina avisos agrupados `microcycle_plan` cuando contienen una sesión eliminada en `sessionIds`.
- La eliminación de notificaciones se sincroniza con `replaceValue`, no con merge aditivo.
- Los `deletedSessionIds` actúan como tombstones también para notificaciones durante cada pull de Supabase.
- El cliente reconcilia el ciclo de vida y purga avisos individuales o agrupados asociados a sesiones borradas.
- La identidad se resuelve exclusivamente por ID estable; nunca por número visible de sesión.

## Criterio de aceptación
Tras eliminar una sesión clonada/preparada, su aviso no puede reaparecer después de refrescar, cambiar de dispositivo o recibir un nuevo pull de Supabase.
