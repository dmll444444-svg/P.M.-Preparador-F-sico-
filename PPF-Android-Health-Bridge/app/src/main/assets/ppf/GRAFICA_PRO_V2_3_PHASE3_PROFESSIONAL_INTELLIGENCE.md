# GRAFICA PRO v2.3 · Automatic Insights — Fase 3

## Professional Intelligence

Cierre funcional y visual de Automatic Insights. Esta fase refina la interpretación sin añadir nuevas fuentes de datos ni servicios externos.

## Mejoras

- Clasificación contextual del micro: acumulación, descarga, progresión, reducción, transición, equilibrado o específico.
- Insight prioritario que destaca la noticia principal del micro.
- Lenguaje deportivo más directo y natural.
- Lectura técnica contextual, evitando repetir literalmente la tarjeta de evolución.
- Detección de incrementos o reducciones homogéneas.
- Detección de concentración elevada en una categoría.
- Indicador de impacto: bajo, moderado, alto o muy alto.
- Confianza cualitativa: muy alta, alta, media o baja, conservando el porcentaje como dato secundario.
- Mayor jerarquía visual de la Lectura técnica y énfasis animado discreto.
- Nota de transparencia sobre el origen determinista del análisis.
- Responsive y compatibilidad con `prefers-reduced-motion`.

## Integración

La API permanece estable:

```js
PPFGraphAutomaticInsights.build(currentStats, previousStats, context)
```

Nuevas propiedades del informe: `microType`, `priority` e `impact`.

## Versión

- Motor/UI: `2.3-phase3`
- Build: `GRAFICA_PRO_AUTOMATIC_INSIGHTS_V2_3_PHASE3`
