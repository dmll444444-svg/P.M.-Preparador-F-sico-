# P.P.F. v3.6.0-alpha.2 · Android Health Connect Bridge

## Objetivo
Validar el primer circuito nativo real Health Connect → P.P.F. en Android.

## Web P.P.F.
- `PPF_HEALTH_BRIDGE` acepta estado de permisos incluso sin registros.
- Salud cliente muestra valores reales recibidos: sueño, FC, pasos y entrenamientos.
- Health Truth se mantiene: no se estiman datos ausentes.
- Datos de salud siguen `local_only`; cloud bloqueada por seguridad.

## Bridge Android
Proyecto Android Studio incluido en `PPF-Android-Health-Bridge/`.
- WebView de P.P.F.
- JavaScript interface `AndroidHealthBridge`
- permisos oficiales Health Connect de solo lectura
- lectura agregada de pasos de hoy
- FC últimas 24 h
- sueño últimas 48 h
- entrenamientos de hoy
- normalización al esquema P.P.F.

## Seguridad
No escribe en Health Connect. No envía datos de salud a Supabase. La visibilidad remota en ADMIN queda pendiente de autenticación + RLS segura por deportista.
