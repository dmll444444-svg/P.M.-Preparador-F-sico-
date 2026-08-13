# PPF CORE v1.2 · Chronological Rebuild Engine

## Objetivo

Centralizar la cronología completa de cada temporada para que Periodicidad PRO, Agenda PRO, Client Workspace, NCI, tablas y gráficas utilicen la misma numeración.

## Regla de reconstrucción

1. Se leen todas las sesiones de un deportista y temporada.
2. Los micros semanales se agrupan por semana natural, de lunes a domingo.
3. Los micros con rango manual conservan sus fechas personalizadas, pero participan en el orden cronológico general.
4. Todos los bloques se ordenan por su fecha efectiva de inicio.
5. La numeración visible se reconstruye de forma consecutiva desde el primer número existente: M1, M2, M3… o MX, MX+1…
6. Las sesiones de cada micro se renumeran mediante NCI: X.1, X.2, X.3…
7. Los metadatos de Periodicidad se trasladan al nuevo número de micro.
8. Se sincronizan sesiones, notificaciones y periodicityPlans con Supabase.

## Activadores

La reconstrucción se ejecuta al:

- abrir Periodicidad PRO;
- guardar la planificación de un micro;
- crear o editar sesiones;
- mover sesiones en Agenda;
- duplicar o eliminar sesiones;
- recibir una actualización central de sesiones desde PPF CORE.

## Garantías

- No existen saltos como M1, M2, M3, M7, M10 cuando los bloques son cronológicamente consecutivos.
- Dos micros automáticos de la misma semana se fusionan en un único micro.
- Los rangos manuales no pierden sus fechas personalizadas.
- Todas las pantallas reciben la misma cronología desde PPF CORE.
