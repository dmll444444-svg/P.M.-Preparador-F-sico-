# Numeración Cronológica Inteligente de Sesiones

## Objetivo

El número visible de cada sesión pendiente deja de depender del orden en que fue creada. Se calcula por cliente según:

1. Fecha de la sesión.
2. Microciclo.
3. Orden dentro del mismo día (`dayOrder`).
4. Fecha de creación como desempate.

## Comportamiento

- Las sesiones terminadas conservan su número histórico.
- Las sesiones pendientes se numeran desde el último número terminado.
- Las dobles o triples sesiones del mismo día reciben `dayOrder` 1, 2, 3, etc.
- Crear una sesión atrasada reajusta automáticamente las pendientes posteriores.
- Editar fecha o microciclo vuelve a ordenar y numerar.
- Eliminar una sesión cierra el hueco y reajusta las pendientes.
- Las notificaciones existentes se actualizan con el nuevo número de sesión.

## Ejemplo

Con la sesión 14 ya terminada:

- 13/07/2026 · Micro 15 · Orden 1 → Sesión 15
- 13/07/2026 · Micro 15 · Orden 2 → Sesión 16
- 14/07/2026 · Micro 16 · Orden 1 → Sesión 17

Aunque la sesión del 14/07 se hubiera creado antes que la segunda del 13/07.

## Compatibilidad

No se modifican IDs, ejercicios, bloques, cargas, RPE, vídeos ni la estructura de Supabase. `id` sigue siendo la identidad estable y `numero` es el orden visible recalculable.
