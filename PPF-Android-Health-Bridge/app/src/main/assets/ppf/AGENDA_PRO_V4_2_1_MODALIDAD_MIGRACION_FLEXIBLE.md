# Agenda PRO v4.2.1 · Modalidad visible + Migración flexible

- El Inspector MASTER muestra la modalidad de agenda:
  - Con hora.
  - Online · horario flexible.
- Al seleccionar horario flexible, la hora se vacía y queda desactivada.
- Las sesiones terminadas o canceladas existentes que no tienen hora se migran automáticamente a horario flexible.
- Las sesiones preparadas sin hora continúan como incidencias hasta asignarles hora o marcarlas como flexibles.
- Los KPI, avisos y la bandeja “Sesiones sin hora” se recalculan tras la migración.
- La migración se ejecuta después de sincronizar con Supabase y guarda los cambios en remoto.
