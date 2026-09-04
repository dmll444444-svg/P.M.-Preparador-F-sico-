# Gráfica PRO v3.0.3 · Detección automática de patrones de entrenamiento

## Objetivo

Convertir la comparación entre dos microciclos en una lectura de orientación deportiva. El sistema clasifica tanto el micro base como el micro comparado y explica si el patrón se mantiene o evoluciona.

## Patrones detectables

- Acumulación.
- Descarga.
- Regenerativo.
- Competitivo.
- Transformación.
- Específico por categoría dominante.
- Multilateral equilibrado.
- Mixto.

## Criterios

La clasificación es determinista y utiliza únicamente datos registrados en PPF:

- variación global de carga;
- número de categorías que aumentan o disminuyen;
- distribución de series por categoría;
- concentración del estímulo dominante;
- equilibrio entre categorías;
- número de sesiones.

No utiliza servicios externos ni modifica los datos del deportista. La lectura se presenta como una clasificación orientativa y muestra una confianza específica para cada micro.

## Interfaz

Se añade el bloque **Patrones de entrenamiento detectados** entre el Insight prioritario y **Qué explica el cambio**. Incluye:

- patrón del micro base;
- patrón del micro comparado;
- explicación breve de cada clasificación;
- confianza porcentual;
- lectura de continuidad o transición entre patrones.

## API

`PPFGraphAutomaticInsights` expone:

- `build(currentStats, previousStats, context)`;
- `detectPattern(stats, comparison)`;
- `percent(current, previous)`;
- `version: "3.0.3"`.
