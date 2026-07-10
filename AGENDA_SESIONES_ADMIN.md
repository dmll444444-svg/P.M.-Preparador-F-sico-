# Agenda de sesiones del Admin

## Regla definitiva

- **Pendientes**: todas las sesiones preparadas que no tengan una finalización vigente.
- **Terminadas**: todas las sesiones marcadas como terminadas por el cliente.
- Un paciente puede tener varias sesiones pendientes simultáneamente.
- Las tarjetas cuentan sesiones individuales, nunca pacientes únicos.
- Una sesión no se descarta si el paciente no se encuentra temporalmente en el índice local.
- Los duplicados técnicos con el mismo `id` se cuentan una sola vez.
- Si una sesión fue preparada de nuevo después de una finalización antigua, vuelve a pendiente.

Esto permite preparar con antelación las siguientes sesiones sin ocultar las anteriores.
