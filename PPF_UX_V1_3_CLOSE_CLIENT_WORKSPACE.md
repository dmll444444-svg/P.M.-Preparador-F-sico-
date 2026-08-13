# PPF UX v1.3 · Close Client Workspace

## Objetivo
Convertir el cierre de la ficha activa en una acción visualmente integrada, clara y profesional.

## Implementación
- Botón compacto de icono junto al selector de cliente.
- Icono SVG de trazo fino inspirado en interfaces Fluent/Windows.
- Tooltip visual y accesible: **Cerrar cliente**.
- Soporte de teclado mediante `aria-label` y estado `focus-visible`.
- Diseño responsive: selector e icono permanecen juntos; Nueva sesión ocupa una fila completa en móvil estrecho.
- Al cerrar se limpia el cliente activo y Client Workspace vuelve al estado inicial.

## Integración
Esta entrega conserva **PPF UX v1.1 · KPI Semantic Labels** y **PPF UX v1.2 · Close Client Workspace**, refinando únicamente la presentación del control de cierre.
