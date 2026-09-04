# Agenda PRO v4.2.3 · Cierre definitivo de sesiones sin hora

- Regla central `agendaProNeedsTime()` para que solo las sesiones activas y no flexibles requieran hora.
- Las sesiones terminadas o canceladas sin hora nunca cuentan como incidencia, aunque un registro histórico no se haya migrado aún.
- Modalidad efectiva flexible visible en Inspector, tarjetas, Client Workspace, KPI, avisos y bandeja.
- Migración reforzada de `sessions` y compatibilidad con registros históricos de `completedSessions`.
- Reintentos posteriores a la sincronización de Supabase.
- Caché PWA renovada.
