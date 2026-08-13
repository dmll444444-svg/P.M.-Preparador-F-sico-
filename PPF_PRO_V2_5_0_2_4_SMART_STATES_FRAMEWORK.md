# PPF PRO v2.5.0.2.4 · Smart States Framework

## Objetivo
Cerrar la línea Microinteractions & Smart States con un sistema reutilizable para estados vacíos, carga, éxito, advertencia y error.

## Implementación
- Nuevo motor global `PPF_SMART_STATES`.
- Estados disponibles: `empty`, `loading`, `success`, `warning` y `error`.
- Mensajes, iconos, títulos y acciones configurables.
- Preservación y restauración segura del contenido original.
- `bindCollection()` para activar automáticamente el estado vacío de listados dinámicos.
- API declarativa mediante atributos `data-ppf-state`.
- Mejora visual no invasiva de estados vacíos históricos (`.empty-state`, `.no-data`, `[data-empty-state]`).
- Integración con `PPF_MOTION` para entradas y refrescos.
- Roles ARIA, regiones vivas y `aria-busy` para accesibilidad.
- Diseño responsive y soporte de `prefers-reduced-motion`.
- Recursos integrados en la caché PWA.

## API
```javascript
PPF_SMART_STATES.empty(contenedor, {
  title: "Todavía no existen comparaciones",
  message: "Selecciona dos micros para comenzar el análisis."
});

PPF_SMART_STATES.loading(contenedor);
PPF_SMART_STATES.success(contenedor, { title: "Sesión guardada" });
PPF_SMART_STATES.warning(contenedor, { message: "Revisa los datos." });
PPF_SMART_STATES.error(contenedor, { message: "No se pudo cargar." });
PPF_SMART_STATES.clear(contenedor);

const unbind = PPF_SMART_STATES.bindCollection(lista, {
  itemSelector: ":scope > .item",
  empty: {
    title: "No hay elementos",
    message: "Crea el primero para empezar."
  }
});
```

## Garantías
No se modifican cálculos, datos, almacenamiento ni las APIs `PPFCoachIntelligence`, `PPFPredictiveIntelligence` y `PPFPerformanceIntelligence`.
