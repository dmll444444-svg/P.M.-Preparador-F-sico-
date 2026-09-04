# FASE 3.3.2 · SESSION LIFECYCLE INTEGRITY

## Objetivo
Eliminar definitivamente las sesiones desde Sesiones PRO o Agenda PRO sin que Supabase pueda reintroducirlas después.

## Causa corregida
La sincronización de `sessions` usaba un merge por ID. Al borrar localmente una sesión, la copia que aún existía en Supabase volvía a entrar en el siguiente merge. Por eso aparecían sesiones fantasma en Agenda PRO y Date Planner detectaba fechas ocupadas.

## Solución
- Motor único de borrado para Sesiones PRO y Agenda PRO.
- `deletedSessionIds` pasa a formar parte de la sincronización multidispositivo.
- Los tombstones se cargan antes que las sesiones, independientemente del orden de respuesta de Supabase.
- Todo merge de sesiones excluye IDs eliminados.
- El borrado realiza reemplazo exacto de `sessions` en Supabase, no merge.
- Se eliminan referencias asociadas de `completedSessions` y `notifications`.
- Se reconstruye la cronología del deportista tras el borrado.

## Pruebas de aceptación
1. Borrar una sesión desde Sesiones PRO -> desaparece también de Agenda PRO tras recargar/sincronizar.
2. Borrar una sesión desde Agenda PRO -> desaparece también de Sesiones PRO.
3. Borrar 8.1, 8.2 y 8.3 -> Micro 8 deja de existir y la cronología se reconstruye.
4. Date Planner no debe detectar como ocupada la fecha de una sesión eliminada.
5. Cerrar/abrir la aplicación o sincronizar otro dispositivo no debe resucitar sesiones eliminadas.
