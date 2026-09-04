# PPF CORE v1.2.3 · Chronological Sort + Global Renumber

## Corrección raíz

El motor anterior calculaba el plan con una copia independiente de `sessions` obtenida al volver a parsear `localStorage`. Aunque la ordenación por fecha era correcta, la renumeración se aplicaba a objetos distintos de los que después se persistían.

Esta versión:

- inyecta al CORE el mismo array de sesiones que será guardado;
- calcula `weekStart` real en ISO;
- ordena exclusivamente por fecha ascendente;
- ignora por completo los números antiguos;
- asigna M1, M2, M3... sin saltos;
- ejecuta NCI después para obtener X.1, X.2, X.3...;
- audita micros y sesiones antes de persistir.
