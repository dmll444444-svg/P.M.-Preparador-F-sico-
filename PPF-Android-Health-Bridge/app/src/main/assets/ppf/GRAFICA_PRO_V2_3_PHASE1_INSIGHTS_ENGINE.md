# GRAFICA PRO v2.3 · Automatic Insights — Fase 1

## Motor determinista de interpretación deportiva

Esta fase incorpora el motor lógico que utilizará la futura interfaz de **Automatic Insights**. No añade todavía las tarjetas visibles: primero consolida una fuente única, explicable y reutilizable para todas las conclusiones.

### Entrada

El motor recibe los resúmenes del micro actual y del micro anterior generados por `getMicroStatsForGraphPro()`.

### Salida

`graphProBuildAutomaticInsights(currentStats, previousStats)` devuelve:

- evolución de la carga global;
- categoría dominante;
- punto de atención;
- lectura de distribución y equilibrio;
- conclusión ejecutiva;
- resumen de categorías que aumentan, disminuyen o permanecen estables;
- nivel de confianza según disponibilidad de datos;
- datos intermedios explicables: diferencias absolutas, porcentajes y concentración.

### Reglas principales

- Usa tonelaje como referencia de carga cuando existe; en caso contrario utiliza series.
- No interpreta el número de sesiones como rendimiento, solo como señal de calidad de muestra.
- Una variación inferior al 5 % se considera estable.
- Las alertas solo aparecen cuando hay un descenso relevante o una categoría claramente infrarepresentada.
- Las conclusiones son breves, objetivas y no alarmistas.
- No utiliza IA ni servicios externos y nunca modifica la fuente de verdad de sesiones.

### API

Disponible en consola y para la siguiente fase visual mediante:

```js
PPFGraphAutomaticInsights.build(currentStats, previousStats)
```

Versión interna: `2.3-phase1`.
