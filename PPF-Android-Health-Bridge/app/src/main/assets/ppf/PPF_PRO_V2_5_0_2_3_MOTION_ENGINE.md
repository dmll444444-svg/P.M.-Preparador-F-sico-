# PPF PRO v2.5.0.2.3 · Motion Engine

## Implementación
- Motor global `PPF_MOTION` con velocidades FAST, NORMAL, SMOOTH y SLOW.
- Entrada suave automática al activar vistas y secciones.
- Revelado escalonado opcional para rejillas de KPIs y tarjetas.
- API de actualización visual y animaciones Web Animations.
- Estado skeleton reutilizable mediante `PPF_MOTION.setSkeleton()`.
- Detección automática de vistas dinámicas mediante MutationObserver.
- Compatibilidad integral con `prefers-reduced-motion`.
- Nuevos recursos `ppf-motion.css` y `ppf-motion.js` precargados por la PWA.

## API
```js
PPF_MOTION.enter(elemento);
PPF_MOTION.refresh(elemento);
PPF_MOTION.reveal(contenedor, ":scope > *");
PPF_MOTION.setSkeleton(elemento, true);
PPF_MOTION.setSkeleton(elemento, false);
PPF_MOTION.animate(elemento, keyframes, opciones);
```

No se modifican cálculos, almacenamiento ni contratos de las APIs de Inteligencia.
