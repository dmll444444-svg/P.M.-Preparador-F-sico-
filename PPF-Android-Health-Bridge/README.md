# P.P.F. v3.6.0-alpha.2 · Android Health Connect Bridge

Prueba de concepto nativa Android para ejecutar la web P.P.F. dentro de un WebView y exponer `window.AndroidHealthBridge` a `cliente.js`.

## Objetivo

Health Connect → permisos oficiales → lectura real → payload normalizado → `PPF_HEALTH_BRIDGE.ingest()` → pantalla Salud del CLIENTE/ADMIN local.

## Datos de Alpha 2

- Solo lectura: pasos, frecuencia cardiaca, sueño y sesiones de ejercicio.
- Sin escritura en Health Connect.
- Sin subida cloud de datos de salud.
- Los datos quedan en el almacenamiento local del WebView P.P.F. de este dispositivo.
- El usuario puede revocar permisos en Health Connect.

## URL de P.P.F.

La URL está en `gradle.properties` como `PPF_URL`. Si GitHub Pages usa una URL distinta, modifica únicamente esa línea antes de compilar.

## Compilar en Android Studio

1. Abrir la carpeta `PPF-Android-Health-Bridge` con Android Studio.
2. Esperar a que Gradle sincronice y descargue dependencias.
3. Conectar el Android por USB con depuración USB, o usar un emulador/dispositivo físico compatible.
4. Ejecutar `app` (Run ▶).
5. Iniciar sesión en P.P.F. con el deportista de prueba.
6. Entrar en `Salud` → `Conectar Health Connect`.
7. Conceder las categorías deseadas.
8. Pulsar `Sincronizar ahora` y comparar los valores contra Health Connect.

## Condición de éxito Alpha 2

El valor de pasos mostrado por P.P.F. debe coincidir con el total agregado de Health Connect para el día actual. Después se valida FC, sueño y entrenamientos.
