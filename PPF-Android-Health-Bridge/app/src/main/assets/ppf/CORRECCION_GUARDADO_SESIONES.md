# Corrección de guardado de sesiones

- El guardado del Admin espera confirmación de Supabase.
- Las sesiones se fusionan por ID al subir y bajar.
- Una copia antigua ya no puede borrar una sesión reciente.
- La notificación solo se crea después de confirmar la sesión.
- Si Supabase falla, el formulario no se limpia.
