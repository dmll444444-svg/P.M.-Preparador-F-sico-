# Corrección de sesión reutilizada como terminada

- Las sesiones nuevas ya no se fusionan por paciente y número; solo por ID.
- Una notificación `prepared_session` posterior a `completedAt` vuelve a considerar la sesión pendiente.
- La compatibilidad legacy por paciente+número solo se usa cuando falta algún ID.
- Se renueva la caché de la PWA.
