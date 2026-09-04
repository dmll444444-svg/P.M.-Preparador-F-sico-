# FASE 3.3.1 · DATE PLANNER

Estado: simulación segura. No clona ni escribe sesiones.

Novedades:
- La fecha superior se interpreta como SEMANA BASE y se normaliza automáticamente al lunes.
- Las fechas automáticas conservan el día de la semana de cada sesión del micro origen.
- Cada futura sesión tiene un selector de fecha independiente.
- Botón “Restaurar fechas automáticas”.
- Detección de sesiones ya existentes en la misma fecha del deportista destino.
- Aviso si una sesión se mueve fuera del lunes-domingo de la semana base.
- Aviso si varias sesiones del nuevo micro comparten fecha.
- Los avisos de calendario NO bloquean; los conflictos estructurales sí.
- Sigue bloqueado el botón de clonación hasta FASE 3.4.
