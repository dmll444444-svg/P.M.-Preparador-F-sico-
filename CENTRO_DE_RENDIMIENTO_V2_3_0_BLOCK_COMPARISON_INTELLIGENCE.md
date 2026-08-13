# Centro de Rendimiento v2.3.0 · Block Comparison Intelligence

## Implementación

- Nuevo selector de nivel de análisis: Microciclos / Bloques.
- Constructor libre de Bloque A y Bloque B.
- Selección múltiple de microciclos.
- Exclusividad automática: un micro no puede pertenecer a ambos bloques.
- Nombres editables para cada bloque.
- Intercambio completo A ↔ B.
- Limpieza independiente de cada bloque.
- Comparación normalizada mediante medias por micro.
- Totales secundarios para sesiones, series y tonelaje.
- Métricas de densidad, kg por sesión y variabilidad interna.
- Integración del modo bloques con Executive Header, Dashboard, Radar, KPIs, Timeline e Intelligence.
- Timeline marcada visualmente según pertenencia al Bloque A o Bloque B.
- Se conserva la comparación clásica Micro vs Micro.
- Estado de selección conservado por deportista durante la sesión de uso.

## Reglas de cálculo

La lectura principal utiliza medias por micro para comparar correctamente bloques con diferente número de microciclos. Los totales se muestran como contexto secundario.

No se han modificado APIs internas, sesiones, almacenamiento persistente ni esquema de datos.
