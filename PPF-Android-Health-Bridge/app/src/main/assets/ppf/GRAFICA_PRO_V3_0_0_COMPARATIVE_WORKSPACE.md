# GRAFICA PRO v3.0.0 · Comparative Workspace

## Objetivo

Permitir que el entrenador seleccione libremente dos microciclos del deportista y que toda la pantalla trabaje con esa comparación, evitando interpretar automáticamente un micro todavía incompleto frente a otro finalizado.

## Implementación

- Nuevo selector global `Micro base` vs `Micro comparado`.
- Selección inicial compatible con el comportamiento anterior: penúltimo micro vs último micro.
- Persistencia de la selección durante la sesión para cada deportista.
- Recalculo coordinado de:
  - Radar PRO.
  - Detalle por categorías.
  - Automatic Insights.
  - Comparative Intelligence.
  - KPIs contextuales.
- Eliminación de los selectores duplicados dentro de la tabla comparativa.
- Mensajes, etiquetas y nota metodológica adaptados a una comparación libre.
- Diseño responsive y accesible.

## Alcance de v3.0.0

Esta fase crea el espacio de comparación y conecta toda la inteligencia con los dos micros seleccionados. El radar mantiene un polígono principal para el micro comparado; el doble polígono visual queda preparado para la fase v3.0.1.

## Versión

- Motor/UI: `3.0.0`
- Build: `GRAFICA_PRO_COMPARATIVE_WORKSPACE_V3_0_0`
