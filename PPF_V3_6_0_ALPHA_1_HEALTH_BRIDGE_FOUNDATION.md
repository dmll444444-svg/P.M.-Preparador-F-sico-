# P.P.F. v3.6.0-alpha.1 · Health Bridge Foundation

Objetivo: preparar el extremo P.P.F. del circuito `dispositivo → permiso → lectura → normalización → P.P.F. → ADMIN` sin tocar Session Truth, Microcycle Truth, notificaciones ni motores GOLD.

## Incluido
- Nuevo `ppf-health-bridge.js`: contrato de ingestión y normalización de datos reales.
- Métricas aceptadas: `sleep`, `heart_rate`, `resting_heart_rate`, `steps`, `workout`.
- Trazabilidad obligatoria: atleta, origen, dispositivo/fuente, instante, unidad y `external_id` cuando exista.
- Deduplicación estable de registros.
- Nueva pestaña `Salud BETA` dentro de Control del Deportista.
- Health Truth: no estima, no rellena huecos y muestra explícitamente cuando un dato no existe.
- Estado de sincronización y procedencia visibles en ADMIN.

## Seguridad deliberada de esta Alpha
Los datos de salud se guardan **solo en localStorage del dispositivo de prueba**. La sincronización cloud queda bloqueada en esta fase porque el esquema actual de `app_state` usa políticas anónimas de pruebas y no es apropiado para datos de salud. Antes de nube se debe implantar autenticación real + RLS por deportista o un endpoint seguro equivalente.

## Contrato del bridge nativo
El wrapper Android/iOS puede llamar:

```js
window.PPF_HEALTH_BRIDGE.ingest({
  athlete_id: "nickname",
  source: "health_connect", // o healthkit
  device_source: "Pixel Watch / Apple Watch / Samsung Health...",
  permission_scope: ["sleep", "heart_rate", "steps", "workout"],
  records: [ ... ]
});
```

También admite el evento `ppf:health-native-payload`.
