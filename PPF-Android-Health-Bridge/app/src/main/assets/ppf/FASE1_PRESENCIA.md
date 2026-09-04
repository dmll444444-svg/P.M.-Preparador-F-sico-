# FASE 1 · Motor único de presencia

- Nuevo `presence.js`, cargado antes de `app.js`, `admin.js` y `cliente.js`.
- `app.js` registra el acceso mediante `PPF_PRESENCE.update`.
- `cliente.js` usa `PPF_PRESENCE.startClient` y `PPF_PRESENCE.logout`.
- `admin.js` calcula online/última actividad con el mismo motor.
- Fuente única: `localStorage.userStats`, sincronizada mediante Supabase.
