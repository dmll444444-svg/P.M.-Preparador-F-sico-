# FASE 3.3 · CLONE PREVIEW / DESTINATION PLAN

Estado: simulación segura. No clona ni escribe sesiones.

Incluye:
- Deportista destino leído del selector habitual de Creación de sesiones.
- Micro destino independiente (1–52) y sugerencia del siguiente micro libre.
- Fecha inicial destino y conservación del espaciado relativo de fechas del micro origen.
- Aplicación en vivo del Block Mapper 3.2 sobre la vista final.
- Renumeración prevista Mx.1, Mx.2, Mx.3...
- Resumen de sesiones, ejercicios, series de carrera, exclusiones y conflictos.
- Detección de micro destino ocupado.
- Protección contra origen=destino en el mismo micro.
- Detección de conversiones incompatibles Carrera ↔ bloques de ejercicios.
- Sesiones completamente excluidas quedan omitidas del plan.
- Botón de clonación bloqueado hasta FASE 3.4.

No se modifica localStorage, Supabase, sesiones existentes, Biblioteca ni el micro origen.
