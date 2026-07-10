# Fase 4 · Panel Usuarios del Admin

## Resultado

- La lista de usuarios se actualiza sin recargar la página ni reconstruir toda la sección.
- Los cambios locales, entre pestañas y procedentes de Supabase disparan el mismo refresco dirigido.
- Supabase Realtime escucha cambios de `app_state.userStats` cuando la tabla está publicada en Realtime.
- Se mantiene un pull de respaldo cada 10 segundos para instalaciones sin Realtime o ante cortes de conexión.
- El texto relativo (`Ahora`, `Hace 12 s`, etc.) se actualiza cada segundo localmente, sin tráfico de red.
- El estado pasa automáticamente a `Desconectado` al superar los 90 segundos de actividad.
- El dispositivo mostrado corresponde a la sesión más reciente.
- El estado se calcula con `PPF_PRESENCE.isOnline()` y no con el booleano persistido.

## Flujo

Cliente/PWA -> actualiza `userStats` -> Supabase -> evento Realtime/pull de respaldo -> evento del Presence Engine -> reemplazo exclusivo de `.users-access-list`.

La actualización visual de segundos y caducidad online se realiza localmente en el Admin.
