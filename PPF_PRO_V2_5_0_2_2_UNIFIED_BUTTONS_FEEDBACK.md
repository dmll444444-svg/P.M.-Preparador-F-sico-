# PPF PRO v2.5.0.2.2 · Unified Buttons & Feedback

## Implementación
- Respuesta visual común para botones: hover heredado, pulsación, foco accesible y estado deshabilitado.
- Estado `aria-busy` reutilizable con indicador de proceso.
- API global `PPF_FEEDBACK` para mensajes de éxito, información, aviso y error.
- Región accesible de notificaciones con cola, cierre manual y duración configurable.
- Integración visual del toast histórico de sesiones con el nuevo lenguaje de feedback.
- Adaptación móvil y soporte de `prefers-reduced-motion`.
- Sin modificaciones en cálculos, almacenamiento ni APIs de inteligencia.

## API
```js
PPF_FEEDBACK.success("Sesión guardada correctamente");
PPF_FEEDBACK.error("Revisa los campos obligatorios");
PPF_FEEDBACK.setBusy(boton, true, "Guardando");
PPF_FEEDBACK.setBusy(boton, false);
```
