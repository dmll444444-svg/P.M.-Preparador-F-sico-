# Gráfica PRO v3.0.2 · Comparative Intelligence

## Objetivo

La comparación deja de limitarse a indicar cuánto cambia cada microciclo y pasa a explicar qué categorías originan la diferencia observada.

## Implementación

- Identificación del principal impulsor del incremento.
- Identificación de la principal reducción.
- Cálculo de la contribución relativa de cada cambio categorizado.
- Detección de continuidad o cambio en la orientación dominante.
- Detección de categorías estructuralmente estables.
- Resumen causal integrado en la lectura técnica.
- Nuevo bloque visual **Qué explica el cambio**.
- Motor determinista y explicable, sin servicios externos ni modificación de datos.

## API

`PPFGraphAutomaticInsights.build(statsComparado, statsBase, contexto)` devuelve `version: "3.0.2"` e incorpora `drivers` con los factores explicativos de la comparación.
