# PPF MOBILE · M.1.2 · Bottom Navigation 4-Item Polish

## Objetivo
Reequilibrar la navegación inferior del cliente después de retirar **Mis archivos**.

## Cambios
- La barra inferior móvil usa **4 columnas iguales** en lugar de la configuración heredada de 5 columnas.
- Cada acceso ocupa exactamente su cuarto del ancho útil.
- Inicio, Sesión, Sesiones y Valoraciones quedan centrados y equidistantes.
- El estado activo conserva el mismo lenguaje visual y ahora se extiende dentro de su celda real.
- Se ajusta el tamaño del texto de forma fluida para proteger `Valoraciones` en anchos reducidos.
- Se mantiene intacta la navegación, las sesiones, las notificaciones y Supabase.

## Archivos
- `style.css`
- `cliente.html` (cache busting de CSS)
- `app-version.js` (identificador de build/cache)

## Compatibilidad
El cambio se limita al breakpoint móvil existente y no altera la experiencia de escritorio.
