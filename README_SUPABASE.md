# Migración Supabase · Programa Preparador Físico

## Qué hace esta versión

La app sigue usando `localStorage`, pero ahora sincroniza estos datos con Supabase:

- `patients`
- `sessions`
- `histories`
- `patientFiles`
- `exerciseLibrary`
- `completedSessions`

Al abrir la app, descarga los datos de Supabase.  
Al guardar pacientes, sesiones o biblioteca, sube los cambios automáticamente.

## Pasos

### 1. Crear proyecto en Supabase

Entra en Supabase y crea un proyecto nuevo.

### 2. Ejecutar SQL

Ve a:

Supabase → SQL Editor → New query

Pega el contenido de:

`supabase_schema.sql`

y ejecuta.

### 3. Poner claves

Abre:

`supabase-config.js`

Pega:

```js
url: "https://TU_PROYECTO.supabase.co",
anonKey: "TU_ANON_KEY",
enabled: true
```

### 4. Subir a GitHub Pages

Sube todos los archivos al repositorio.

### 5. Primera carga de datos

Abre `admin.html` desde tu ordenador con tus datos actuales y pulsa en la consola:

```js
PPF_SUPABASE.push()
```

O simplemente guarda/actualiza cualquier paciente o sesión para que empiece a sincronizar.

## Importante

Esta v1 usa políticas abiertas para pruebas. Para uso real con pacientes hay que hacer la v2:

- Supabase Auth
- roles admin/paciente
- RLS segura por paciente
- fotos en Supabase Storage
