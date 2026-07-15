# NCI v2 — Secuencia continua por microciclo

- Cada cliente y microciclo mantiene una secuencia única: `15.1`, `15.2`, `15.3`...
- La secuencia continúa aunque las sesiones estén en días distintos.
- Admin muestra el historial descendente (`15.3`, `15.2`, `15.1`).
- Cliente ejecuta ascendente (`15.1` → `15.2` → `15.3`).
- Crear, editar fecha/hora/micro, duplicar, mover o eliminar normaliza la secuencia.
- El orden manual se conserva mediante `microSequenceOrder`.
- Las notificaciones se actualizan cuando cambia la referencia visible.
