# PPF · Client Mobile Navigation Dedup Fix · 2026-08-07

## Problema corregido
En móvil se mostraban simultáneamente dos barras inferiores de navegación del cliente.

## Causa
`cliente.html` ya incluía la barra oficial `.client-mobile-bottom-nav`, mientras que `cliente.js` generaba además una barra heredada `#pmClientBottomNav` / `.pm-client-bottom-nav`, visible únicamente por reglas responsive.

## Cambios
- Eliminada la creación dinámica de `#pmClientBottomNav`.
- Eliminadas sus llamadas de inicialización.
- Eliminadas referencias JS residuales a `#pmClientBottomNav`.
- Eliminado el bloque CSS `.pm-client-bottom-nav`.
- Conservada intacta la barra oficial de 4 accesos: Inicio · Sesión · Sesiones · Valoraciones.
- Actualizados los query strings de `style.css` y `cliente.js` en `cliente.html` para forzar actualización de caché/PWA.

## Alcance
Corrección localizada: no se modifica la lógica de sesiones, valoraciones, sincronización, presencia ni navegación de escritorio.
