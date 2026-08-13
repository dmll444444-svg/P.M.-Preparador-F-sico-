# PPF · FASE 3.4 · DEEP CLONE ENGINE

## Base
Integrado sobre **v3.3.2 · SESSION LIFECYCLE INTEGRITY** ya validada.

## Motor de clonación real
- El plan de FASE 3.3.1 se vuelve ejecutable únicamente cuando no existen conflictos bloqueantes.
- Respeta el deportista destino, micro destino, Block Mapper y **fecha individual** elegida en Date Planner.
- Omite las sesiones cuyos contenidos hayan quedado completamente excluidos.
- Genera IDs nuevos e independientes para cada sesión clonada.
- Conserva los datos reales de Movilidad, Activación, Sesión Principal y Carrera.
- Conserva los bloques originales de Principal cuando Principal → Principal; contenidos convertidos a Principal se distribuyen con capacidad máxima de 10 ejercicios por bloque.
- Añade validaciones de capacidad: 10 Movilidad, 10 Activación, 40 Principal y 10 Carrera por sesión.
- Mantiene trazabilidad mediante `cloneOperationId`, `clonedFromSessionId`, `clonedFromMicro` y `clonedFromPatient`.

## Seguridad
- El micro destino debe estar vacío.
- Origen y destino no pueden ser el mismo micro del mismo deportista.
- Las conversiones Carrera ↔ bloques de fuerza permanecen bloqueadas.
- Antes de escribir se muestra una confirmación con las fechas exactas.
- Las advertencias de calendario se muestran y requieren aceptación consciente, pero no alteran las fechas elegidas.
- La escritura de sesiones se realiza en lote y se verifica después de la confirmación de Supabase.
- Si falla una fase crítica, PPF restaura el estado local anterior y ejecuta rollback remoto best-effort.

## Notificación agrupada
La clonación de un micro **no** crea una notificación por sesión. Tras una clonación verificada se crea una sola notificación `microcycle_plan` con:
- micro destino,
- número de sesiones,
- rango de fechas,
- IDs de las sesiones creadas,
- `cloneOperationId`.

## Regla de fechas
La fecha superior del formulario normal de creación **no gobierna Deep Clone**. Cada sesión se escribe con la fecha individual congelada en Date Planner.

## Resultado esperado
`PLAN VALIDADO → CONFIRMACIÓN → ESCRITURA EN LOTE → SUPABASE → VERIFICACIÓN → 1 NOTIFICACIÓN AGRUPADA`
