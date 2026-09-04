# PPF PRO v2.5.0.3.1.B.2.1.4.2 · Historical Notification Cleanup

Migración de una sola ejecución para retirar avisos artificiales generados por
el antiguo mecanismo de recuperación histórica de sesiones.

Se eliminan exclusivamente:
- notificaciones con `recovered === true`
- notificaciones cuyo `id` empieza por `recovered-`

Se conserva cualquier otra notificación.

La migración queda registrada en localStorage con:
`ppf_notification_cleanup_b2142_done = 1`

No modifica sesiones, planificación ni Session Truth.
