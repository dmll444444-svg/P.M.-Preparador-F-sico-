# PPF PRO v2.5.0.3.1.B.1.1 · Smart Daily Card & Navigation Fix

## Objetivo
Convertir la primera tarjeta funcional de la Home en un bloque diario contextual y reparar la navegación interna de sus CTA.

## Cambios
- "Tu día en PPF / Lo importante, nada más entrar" pasa a "Tu entrenamiento / Esto es lo que necesitas saber hoy".
- La tarjeta diaria adapta su mensaje a cinco estados: todo al día, sesión pendiente, entrenas hoy, entrenamiento mañana y próxima sesión futura.
- Los CTA de la Home usan navegación interna delegada (`data-client-nav-action`) y ya no dependen de funciones inline fuera de alcance.
- Reparados "Ver mis sesiones" y los CTA de próxima sesión/continuar.
- Se mantiene intacta la lógica de negocio y las APIs de inteligencia existentes.

## Arquitectura
`PPF_CLIENT_NAVIGATE` centraliza la navegación desde las Smart Cards y sincroniza el estado del menú mediante la navegación cliente ya existente.
