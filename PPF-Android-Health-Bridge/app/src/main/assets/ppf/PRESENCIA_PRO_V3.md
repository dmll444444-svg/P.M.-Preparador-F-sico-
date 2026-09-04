# PPF PRO · Presencia PRO v3

## Fuente única

Toda la presencia se guarda en `localStorage.userStats` y se sincroniza con la clave `userStats` de Supabase.

Cada usuario conserva los campos públicos:

- `count`
- `online` (compatibilidad visual; se recalcula siempre)
- `device`
- `lastLogin`
- `lastHeartbeat`
- `lastSeen`
- `lastActivity`
- `lastLogout`
- `lastSync`
- `version: 3`

Además, `sessions` permite distinguir pestañas y dispositivos sin crear otra fuente de verdad.

## Reglas

- Heartbeat visible: 30 segundos.
- Online: alguna sesión con actividad en los últimos 90 segundos.
- Segundo plano: gracia de 12 segundos antes de cerrar esa sesión.
- Primer plano: heartbeat inmediato y pull de Supabase.
- Cierre de pestaña/PWA: envío `keepalive`.
- Logout: una única ruta por panel y protección contra ejecuciones duplicadas.
- Admin: pull único cada 10 segundos y actualización por eventos, sin intervalos paralelos.

## Archivos integrados

- `presence.js`: motor único v3.
- `app.js`: login delegado a `PPF_PRESENCE.login()`.
- `cliente.js`: arranque y logout delegados al motor.
- `admin.js`: arranque, logout y panel Usuarios delegados al motor.
- `supabase-sync.js`: fusión segura de sesiones y accesos.
- `sw.js`: nueva versión de caché para desplegar el motor actualizado.
