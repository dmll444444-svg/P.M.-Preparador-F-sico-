# PPF PRO v2.5.0.3.1.B.1.2 · Client Layout & Access Polish

## Objetivo
Pulir la experiencia de navegación del cliente sin alterar la lógica de entrenamiento.

## Cambios
- Avatar del Hero ampliado manteniendo proporción cuadrada.
- Sidebar de escritorio estabilizada a 290 px para impedir que las vistas anchas la compriman.
- `client-main` y contenidos dinámicos configurados con `min-width: 0` para adaptarse al espacio restante.
- Eliminado el botón inferior antiguo `Cerrar sesión` de la sidebar.
- Nuevo botón flotante `Menú`, visible al hacer scroll en escritorio.
- Drawer de acceso rápido con Inicio, Sesión próxima, Mis sesiones, Mis valoraciones y Mis archivos.
- Cierre de sesión disponible dentro del menú flotante.
- En móvil se mantiene la navegación inferior existente, evitando controles duplicados.
- Nueva capa aislada `ppf-client-layout.css`.
- Nueva lógica aislada `ppf-client-access.js`.
- Actualización de versión y caché PWA.

## Compatibilidad
No se modifica la lógica de sesiones, PPF_CORE, Session Truth ni las APIs de inteligencia.
