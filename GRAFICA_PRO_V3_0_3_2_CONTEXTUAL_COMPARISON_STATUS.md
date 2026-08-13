# Gráfica PRO v3.0.3.2 · Contextual Comparison Status

## Mejora implementada

La confirmación flotante exterior se integra ahora en el KPI superior del deportista, junto a la fotografía, el nombre y la comparación activa.

### Estados del KPI

- **Comparación activa:** muestra `M7 ↔ M6`.
- **Sentido del análisis cambiado:** al pulsar `⇄`, muestra temporalmente `Ahora se analiza M6 → M7`.
- **Comparación no válida:** al intentar seleccionar el mismo micro en ambos lados, solicita elegir un micro diferente.

El estado de intercambio vuelve automáticamente a **Comparación activa** tras 1,5 segundos. La última comparación válida se conserva cuando la selección es incorrecta.

## UX y accesibilidad

- Mensajes dentro del contexto visual del comparador, sin toast externo.
- Región `aria-live` para anunciar los cambios.
- Colores diferenciados para estado activo, intercambio y error.
- Transiciones reducidas cuando el sistema solicita menos movimiento.
