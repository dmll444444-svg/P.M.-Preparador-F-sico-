# PPF PRO · Notificaciones de sesión preparada

## Flujo
1. El Admin guarda una sesión nueva.
2. `admin.js` crea un evento `prepared_session` dirigido al nickname del cliente.
3. El evento se guarda en `notifications` y se sincroniza con Supabase.
4. Cliente Web/PWA escucha `notifications` mediante Supabase Realtime.
5. El cliente recibe badge, aviso interno y notificación del sistema si concedió permiso.
6. Al pulsar el aviso se abre “Sesión próxima”.

## Seguridad funcional
- Editar una sesión existente no genera una notificación nueva.
- Cada sesión solo puede generar un evento gracias a `sessionId`.
- Las notificaciones leídas se registran por nickname en `readBy`.
- Hay sondeo de respaldo cada 15 segundos si Realtime no entrega el cambio.

## Alcance
Las notificaciones del sistema funcionan mientras la web/PWA está abierta o permanece activa en segundo plano. Para recibirlas con la PWA completamente cerrada hace falta una fase posterior de Web Push con suscripciones y un emisor backend/Edge Function.
