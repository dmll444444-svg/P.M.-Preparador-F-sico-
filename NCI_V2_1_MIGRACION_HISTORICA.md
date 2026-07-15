# PPF PRO · NCI v2.1 · Migración histórica

- Ejecuta la normalización después de finalizar el pull inicial de Supabase.
- Recarga `sessions` desde la copia sincronizada antes de renumerar.
- Agrupa por cliente + microciclo y asigna una secuencia continua: `1.1`, `1.2`, `1.3`...
- Corrige duplicados existentes aunque exista un marcador de migración antiguo.
- Incluye sesiones terminadas para reparar referencias históricas duplicadas.
- Guarda los cambios en Supabase y actualiza notificaciones asociadas.
- Refresca la vista activa sin necesidad de pulsar F5.
