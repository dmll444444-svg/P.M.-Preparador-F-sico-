# NCI Subsesiones v1.3 — Controles de orden

- Sustituye «Antes/Después» por «Subir/Bajar».
- Deshabilita Subir cuando la sesión ya ocupa la posición superior del grupo.
- Deshabilita Bajar cuando ya ocupa la posición inferior.
- Mantiene el historial descendente: .3, .2, .1.
- El Cliente conserva el orden de ejecución ascendente: .1, .2, .3.
- Guarda `displayOrder` como dato derivado del orden oficial.
