# PPF PRO v2.5.0.2.1 · KPI Update Feedback

## Implementación
- Motor visual global `PPFKPIFeedback` para panel administrador y cliente.
- Detección automática de cambios reales en valores KPI mediante `MutationObserver`.
- Estado breve `updating` seguido de confirmación `updated`.
- Animación contenida del valor y halo integrado con el lenguaje visual PPF PRO.
- Sin alteraciones en cálculos, almacenamiento ni APIs de inteligencia.
- Compatibilidad con contenido KPI generado dinámicamente.
- Respeto automático de `prefers-reduced-motion`.
- API pública opcional: `PPFKPIFeedback.refresh()` y `PPFKPIFeedback.mark(target)`.

## Base
PPF PRO v2.5.0.1.2 · Workspace Navigator.
