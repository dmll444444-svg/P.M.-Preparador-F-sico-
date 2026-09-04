# PPF · Master PM Brand Integration

## Objetivo
Integración de la identidad oficial **PM · Pablo Marín** dentro de PPF sin modificar la lógica funcional.

## Integración
- Login: marca principal PM.
- Sidebars Admin/Cliente: marca simplificada PM.
- Menús flotantes: marca simplificada PM.
- Cabeceras: firma `PM · Programa Preparador Físico`.
- Favicon: ICO + PNG 32/16.
- Apple Touch Icon: 180×180.
- PWA: iconos 72/96/128/144/152/192/384/512.
- Manifest: nombre `PM · Programa Preparador Físico`, `short_name` `PM PPF`.
- Service Worker: precache de la nueva identidad.
- Cache/versionado: `2026.08.07-ppf-master-pm-brand-integration`.

## Compatibilidad
No modifica sesiones, notificaciones, Session Truth, Supabase, Centro de Rendimiento ni navegación.
