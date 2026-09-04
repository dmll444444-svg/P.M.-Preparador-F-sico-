# PPF · Fase 1 · Dynamic Session Builder

## Objetivo
Sustituir los huecos fijos de ejercicios por un constructor dinámico y compacto.

## Cambios
- Movilidad inicia con 1 ejercicio visible.
- Activación inicia con 1 ejercicio visible.
- Cada bloque de Sesión Principal inicia con 1 ejercicio visible.
- Botón `＋ Añadir ejercicio` para crear filas bajo demanda.
- Máximo de 10 ejercicios por bloque/módulo como límite de seguridad.
- Eliminar ejercicio compacta y renumera las filas.
- Si solo queda una fila, Eliminar la limpia en vez de borrar el bloque.
- Sesiones antiguas con huecos vacíos se compactan visualmente al cargarlas.
- Copiar/pegar sesiones y cargar última sesión respetan el nuevo modelo dinámico.
- Los datos existentes siguen siendo compatibles con la estructura anterior.

## Alcance
No modifica notificaciones, Supabase, PWA, Centro de Rendimiento, Cliente ni lógica de sincronización.
