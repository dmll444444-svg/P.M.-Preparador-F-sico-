# P.P.F. v3.6.0-alpha.2.1 · Health Local-Day Truth

## Corrección
La lectura nativa de Health Connect ya devolvía pasos agregados del día, pero la capa web comparaba
`start_time` recortando la fecha ISO UTC. En zonas horarias positivas, el inicio del día local puede
serializarse con la fecha UTC del día anterior (por ejemplo, 00:00 CEST = 22:00Z del día anterior).

## Cambio
- `ppf-health-bridge.js`: `snapshot()` compara pasos y entrenamientos mediante fecha de calendario LOCAL.
- No se modifica el motor de sesiones, notificaciones, presencia ni sincronización GOLD.
- Se mantiene el almacenamiento de salud `local_only`.
- Se incrementa versión/caché a `v3.6.0-alpha.2.1`.

## Validación esperada
Si Android Health Connect entrega `HOY AGG 349`, la tarjeta `Actividad / pasos` debe mostrar `349 pasos`.
