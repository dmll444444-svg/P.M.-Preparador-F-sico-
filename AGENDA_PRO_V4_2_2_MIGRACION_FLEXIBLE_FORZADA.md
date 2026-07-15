# Agenda PRO v4.2.2 · Migración flexible forzada

- Espera a que Supabase termine de cargar `sessions` y `completedSessions`.
- Convierte sesiones terminadas o canceladas sin hora a modalidad flexible.
- Fuerza `updatedAt` para que la actualización local prevalezca en la fusión con Supabase.
- Persiste el array completo de sesiones y reintenta la migración tras la sincronización.
- Refresca Agenda, KPI, avisos y bandeja de programación automáticamente.
