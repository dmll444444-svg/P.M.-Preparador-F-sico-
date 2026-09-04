# FASE 2.3 · Smart Edit Entry

Mejora de entrada inteligente al editar sesiones.

Prioridad automática:
1. Movilidad, si contiene ejercicios.
2. Activación, si Movilidad está vacía y contiene ejercicios.
3. Sesión Principal, si los anteriores están vacíos y existe contenido en alguno de sus bloques. Se abre además el primer bloque principal con contenido.
4. Sesiones Carrera, cuando es el primer/único contenido real de la sesión.
5. Movilidad permanece como fallback seguro para sesiones completamente vacías o datos antiguos no reconocidos.

La modificación afecta únicamente a la navegación inicial del editor. No altera guardado, sincronización, NCI, orden de sesiones, KPIs ni estructura de datos.
