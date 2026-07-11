# Corrección de interacción · Barra inferior Admin móvil

## Problema
El fondo modal de «Más opciones» permanecía renderizado a pantalla completa aunque estuviera cerrado. Al tener un z-index superior, interceptaba todos los toques de la aplicación: navegación inferior, Nueva sesión, Pacientes y Cerrar sesión.

## Corrección
- El backdrop con atributo `hidden` queda realmente fuera del layout.
- El backdrop cerrado usa `pointer-events: none`.
- Solo el backdrop abierto recibe pulsaciones.
- La hoja «Más» cerrada no recibe eventos y permanece oculta.
- La barra inferior conserva interacción explícita.
- Nueva versión de caché del service worker.
