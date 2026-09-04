# GRAFICA PRO v2.3 · Automatic Insights — Fase 2

## Objetivo

Convertir el motor determinista de la Fase 1 en un briefing deportivo legible de un vistazo, sin modificar las fuentes de verdad de PPF ni utilizar servicios externos.

## Implementación

- Nuevo panel visible **Briefing del micro** entre el análisis Radar/Detalle y Comparative Intelligence.
- Cuatro tarjetas ejecutivas: evolución global, mayor estímulo, punto de atención y distribución.
- Tarjeta destacada **Lectura técnica** a ancho completo.
- Indicadores laterales semánticos: favorable, estable, atención, revisión e información.
- Indicador de confianza calculado por el motor.
- Resumen inferior de categorías que aumentan, disminuyen o permanecen estables.
- Diseño responsive: dos columnas en escritorio y una en móvil.
- Entrada escalonada de tarjetas y compatibilidad con `prefers-reduced-motion`.
- Etiquetas ARIA descriptivas; el significado no depende únicamente del color.

## Integración

La UI consume directamente:

```js
PPFGraphAutomaticInsights.build(currentStats, previousStats, context)
```

El micro actual y el anterior se obtienen con `getMicroStatsForGraphPro`, por lo que el briefing representa el último micro registrado y no los acumulados históricos del deportista.

## Versión

- Motor/UI: `2.3-phase2`
- Build: `GRAFICA_PRO_AUTOMATIC_INSIGHTS_V2_3_PHASE2`
