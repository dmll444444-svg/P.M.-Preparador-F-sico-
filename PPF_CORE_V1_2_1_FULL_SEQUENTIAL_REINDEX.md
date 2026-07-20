# PPF CORE v1.2.1 · Full Sequential Reindex Engine

- La fecha de inicio determina el orden de todos los microciclos.
- La numeración antigua se descarta.
- Cada temporada se reconstruye como M1, M2, M3... sin saltos.
- Después se ejecuta NCI para obtener X.1, X.2, X.3...
- Los metadatos se remapean sin colisiones y se eliminan claves antiguas.
- Una auditoría impide guardar micros o sesiones con huecos.
- Agenda, Workspace, Periodicidad, tablas y gráficas reciben la misma cronología desde PPF CORE.
