# Corrección de notificaciones de sesión

## Problema localizado

`notifications` se sincronizaba como un array completo. Una pestaña con una copia vacía o antigua podía reemplazar la notificación recién creada en Supabase.

## Correcciones

- Fusión de notificaciones por `id` antes de guardar o subir.
- Conservación conjunta de `readBy` al fusionar.
- El Admin espera confirmación de Supabase antes de informar que la notificación fue enviada.
- El Cliente repara notificaciones perdidas de sesiones creadas durante los últimos 30 minutos.
- El pull inicial, Realtime y el polling usan la misma reconciliación.
- Nueva versión de caché del Service Worker.
