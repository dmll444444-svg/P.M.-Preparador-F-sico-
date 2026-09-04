# PPF PRO v2.5.0.3.1.B.2.1.4.1 · Notification Integrity Fix

## Correcciones

- El cliente ya no reconstruye notificaciones de `Nueva sesión preparada` recorriendo sesiones históricas al iniciar sesión.
- El refresco/polling ya no usa la rutina de recuperación histórica para fabricar notificaciones faltantes.
- Al iniciar sesión se consideran conocidas las notificaciones ya existentes y no se muestran como eventos nuevos.
- Pulsar la campana únicamente abre/cierra el centro interno de notificaciones de PPF.
- La campana deja de ejecutar `Notification.requestPermission()`.
- El permiso de notificaciones del navegador queda desacoplado y disponible únicamente mediante una API explícita:
  `PPF_NOTIFICATIONS.requestSystemPermission()`.

## Regla de integridad

Una sesión existente no equivale a una sesión recién preparada.
Las notificaciones nuevas deben originarse en el evento real de creación/asignación desde Admin.

## Compatibilidad

- No modifica sesiones.
- No modifica Session Truth.
- No modifica planificación.
- No modifica Client Progress Intelligence.
- Mantiene intacto Mobile Client Experience Polish.
