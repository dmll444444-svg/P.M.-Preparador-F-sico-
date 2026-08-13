# PPF PRO v2.5.0.3.1.B.2.1.4.3 · Notification Truth Reconciliation

## Problema raíz
Supabase usaba un merge aditivo para `notifications`. Una notificación falsa
eliminada en local volvía a aparecer en el siguiente pull porque seguía viva
en la nube.

## Corrección
- Se añade `PPF_SUPABASE.replaceValue(key, value)` para reemplazos exactos y controlados.
- Se ejecuta una migración única de reconciliación después del pull inicial.
- La migración elimina el histórico `prepared_session` contaminado tanto local como remotamente.
- Se preservan otros tipos de notificación.
- Las nuevas notificaciones legítimas creadas desde Admin llevan:
  - `origin: "admin_session_create"`
  - `integrityVersion: 1`
- El cliente no reconstruye notificaciones leyendo sesiones históricas.
- La campana sigue desacoplada del permiso de notificaciones del navegador.

## Resultado esperado
1. David: desaparecen las 15 notificaciones fantasma.
2. Hugo: desaparece la notificación fantasma.
3. Recargar/entrar/salir no crea nuevas notificaciones.
4. Crear una sesión nueva desde Admin genera exactamente una nueva notificación.
5. Esa notificación persiste sin duplicarse.
