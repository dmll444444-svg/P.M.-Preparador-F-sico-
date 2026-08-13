# PPF CORE Cache Manager v2

## Objetivo
Actualizar GitHub Pages/PWA sin mezclar el sistema de caché con la lógica de Admin, Cliente o PPF CORE.

## Arquitectura independiente
Solo interviene en:
- `app-version.js`
- `ppf-cache-manager.js`
- `sw.js`
- registro de scripts en `index.html`, `admin.html` y `cliente.html`
- `pwa-register.js` deja de registrar el Service Worker para evitar registros duplicados

No modifica:
- `admin.js`
- `cliente.js`
- `ppf-core.js`
- lógica de sesiones, NCI, Periodicidad o Supabase

## Publicación
1. Cambiar `VERSION` en `app-version.js`.
2. Subir todos los archivos.
3. El nuevo Service Worker se registra con `updateViaCache: none`.
4. La PWA activa la versión nueva, borra cachés antiguas y hace una sola recarga controlada.

## Estrategias
- HTML, JS, CSS y manifiesto: `network-first`.
- Imágenes e iconos: caché rápida con actualización en segundo plano.
- Navegación sin conexión: fallback a `index.html`.

## Recuperación manual
En consola del navegador:

```js
PPF_CACHE_MANAGER.hardRefresh()
```

Esto borra cachés PPF, desregistra el Service Worker y recarga la aplicación.
