# Arquitectura de Despliegue - CMMS Biomédico

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────┐
│                      USUARIO FINAL (HTTPS)                          │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────┐
│                   RAILWAY (Contenedor Principal)                    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │           Next.js Frontend + API Routes                   │    │
│  │                  Port 3000 (HTTPS)                        │    │
│  │                                                            │    │
│  │  ┌──────────────────────────────────────────────────┐    │    │
│  │  │  app/page.tsx - Dashboard                        │    │    │
│  │  │  app/auth/login - Autenticación                  │    │    │
│  │  │  app/api/proxy - Proxy a Backend Laravel         │    │    │
│  │  └──────────────────────────────────────────────────┘    │    │
│  │                                                            │    │
│  │  npm run init-db (durante build) ← INICIA BD AQUÍ        │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                   │                                 │
│                                   ▼                                 │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │          MySQL Database Container                         │    │
│  │                  Port 3306                                │    │
│  │                                                            │    │
│  │  Database: cmms_biomedico                                │    │
│  │  ├─ usuarios (5 registros)                              │    │
│  │  ├─ equipos                                              │    │
│  │  ├─ mantenimientos                                       │    │
│  │  ├─ ordenes_trabajo                                      │    │
│  │  ├─ documentos                                           │    │
│  │  ├─ logs_actividad                                       │    │
│  │  ├─ notificaciones                                       │    │
│  │  └─ permisos_usuarios                                    │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  BACKEND Laravel (Externo - Opcional)               │
│                        Port 8000                                    │
│                                                                      │
│  API Endpoints:                                                     │
│  /api/usuarios                                                      │
│  /api/equipos                                                       │
│  /api/mantenimientos                                                │
│  /api/ordenes-trabajo                                               │
│  etc...                                                              │
└─────────────────────────────────────────────────────────────────────┘
```

## Flujo de Inicialización

```
┌──────────────────────────────────────────────────────────────┐
│  1. GitHub Push                                              │
│     git push origin main                                     │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌─────────────────────────▼─────────────────────────────────────┐
│  2. Railway detecta cambios                                  │
│     Crea nuevo deployment                                    │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌─────────────────────────▼─────────────────────────────────────┐
│  3. Build Stage                                              │
│     ┌──────────────────────────────────────────────────┐    │
│     │ npm install                                      │    │
│     │ ├─ Instala todas las dependencias              │    │
│     │ └─ Incluye mysql2 para conexión               │    │
│     └──────────────────────────────────────────────────┘    │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌─────────────────────────▼─────────────────────────────────────┐
│  4. Compile Stage                                            │
│     ┌──────────────────────────────────────────────────┐    │
│     │ npm run build                                    │    │
│     │ ├─ Compila Next.js                             │    │
│     │ ├─ Genera archivos de producción               │    │
│     │ └─ Optimiza bundle                             │    │
│     └──────────────────────────────────────────────────┘    │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌─────────────────────────▼─────────────────────────────────────┐
│  5. Database Init Stage ⭐ NUEVO                              │
│     ┌──────────────────────────────────────────────────┐    │
│     │ npm run init-db                                  │    │
│     │ ├─ Conecta a MySQL plugin de Railway           │    │
│     │ ├─ Lee /scripts/init-mysql.sql                 │    │
│     │ ├─ Crea database: cmms_biomedico               │    │
│     │ ├─ Crea 8 tablas con relaciones                │    │
│     │ ├─ Inserta datos de ejemplo                    │    │
│     │ ├─ Crea 5 usuarios de prueba                   │    │
│     │ └─ Asigna permisos                             │    │
│     └──────────────────────────────────────────────────┘    │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌─────────────────────────▼─────────────────────────────────────┐
│  6. Deploy Stage                                             │
│     ┌──────────────────────────────────────────────────┐    │
│     │ npm run start                                    │    │
│     │ ├─ Inicia servidor Next.js                     │    │
│     │ ├─ Escucha en puerto 3000                      │    │
│     │ ├─ Activa healthcheck HTTP                     │    │
│     │ └─ App lista en HTTPS                          │    │
│     └──────────────────────────────────────────────────┘    │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌─────────────────────────▼─────────────────────────────────────┐
│  7. Ready ✅                                                 │
│     https://tu-proyecto.railway.app                         │
│     ├─ Frontend está corriendo                              │
│     ├─ API está disponible                                  │
│     └─ Base de datos está inicializada                      │
└──────────────────────────────────────────────────────────────┘
```

## Estructura de Archivos Críticos

```
proyecto/
├── package.json                    ← Scripts "init-db" agregado
├── railway.json                    ← buildCommand con "npm run init-db"
│
├── scripts/
│   ├── init-mysql.sql              ← Define BD + tablas + datos
│   └── init-db.js                  ← Ejecuta SQL en MySQL
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
│       ├── proxy/[...path]/        ← Proxy a Laravel backend
│       └── ...
│
├── lib/
│   ├── api/
│   │   ├── usuarios.ts             ← API calls
│   │   ├── equipos.ts
│   │   ├── mantenimientos.ts
│   │   └── ...
│   └── supabase/ (legacy)
│
└── Documentación/
    ├── SETUP_COMPLETE.md           ← Resumen final
    ├── RAILWAY_MYSQL_INDEX.md      ← Índice maestro
    ├── RAILWAY_MYSQL_SUMMARY.md    ← Resumen ejecutivo
    ├── RAILWAY_MYSQL_SETUP.md      ← Guía completa
    ├── VERIFY_DEPLOYMENT.md        ← Checklist
    └── ...
```

## Conexiones de Base de Datos

### Desarrollo Local

```
┌─────────────────┐
│  npm run dev    │
│  Port 3000      │
└────────┬────────┘
         │ DATABASE_URL
         │ mysql://root:@localhost:3306/cmms_biomedico
         │
┌────────▼────────────────┐
│  MySQL Local            │
│  Port 3306              │
│  cmms_biomedico         │
└─────────────────────────┘
```

### Railway Producción

```
┌─────────────────────────────────────┐
│  Next.js en Railway                 │
│  https://tu-proyecto.railway.app    │
└────────┬────────────────────────────┘
         │ DATABASE_URL
         │ mysql://user:pass@
         │ gateway.railway.app:3306/
         │ cmms_biomedico
         │
┌────────▼──────────────────────────┐
│  MySQL Plugin de Railway          │
│  Contenedor dedicado              │
│  cmms_biomedico (auto-creada)     │
└───────────────────────────────────┘
```

## Flujo de Datos - Usuarios

```
Usuarios                      Admin Dashboard
    │                              │
    │◄──────────────────────────────┤
    │  GET /api/usuarios            │
    │                               │
    ├─ Server Action ────────────────┤
    │  fetchUsuarios()              │
    │                               │
    ├─ API Proxy ─────────────────────┤
    │  /api/proxy/usuarios          │
    │                               │
    ├─ Laravel Backend ──────────────┤
    │  GET /api/usuarios            │
    │                               │
    ├─ MySQL Query ─────────────────┤
    │  SELECT * FROM usuarios       │
    │  WHERE estado = 'Activo'      │
    │                               │
    └──► Frontend Rendered ◄─────────┤
        ✅ Tabla de usuarios        │
```

## Tablas de Base de Datos y Relaciones

```
┌─────────────────────┐
│      usuarios       │
├─────────────────────┤
│ PK: id              │
│ - nombre            │
│ - correo (UNIQUE)   │
│ - rol               │
│ - estado            │
└──────────┬──────────┘
           │
           │ (1:N)
           │
    ┌──────▼──────────┐      ┌──────────────────┐
    │ permisos_usuarios   ◄──┤  ordenes_trabajo │
    └─────────────────┘      │ - id_usuario_...│
                             └──────────────────┘
           │
           │ (1:N)
           │
┌──────────▼─────────────────────┐
│         equipos                 │
├─────────────────────────────────┤
│ PK: id                          │
│ - numero_serie (UNIQUE)         │
│ - nombre_equipo                 │
│ - modelo, fabricante            │
│ - ubicacion                     │
│ - estado                        │
└──────────┬──────────────────────┘
           │
    ┌──────┴─────────────────┐
    │ (1:N)                  │ (1:N)
    │                        │
┌───▼──────────────┐  ┌──────▼──────────────┐
│ mantenimientos   │  │ documentos          │
├──────────────────┤  ├─────────────────────┤
│ - id_equipo      │  │ - id_equipo         │
│ - tipo           │  │ - nombre, tipo      │
│ - proxima_fecha  │  │ - url               │
│ - resultado      │  │ - subido_por (FK)   │
└─────────────────┘   └─────────────────────┘
```

## Variables de Entorno - Flujo

```
┌────────────────────────────────────────────────────────┐
│         railway.json - buildCommand                    │
│  npm install && npm run build && npm run init-db       │
└────────────────────────┬───────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────┐
│         scripts/init-db.js                             │
│  ├─ Lee process.env.DATABASE_URL                       │
│  ├─ Conecta a MySQL                                    │
│  └─ Ejecuta /scripts/init-mysql.sql                    │
└────────────────────────┬───────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────┐
│         lib/api/server-client.ts                       │
│  ├─ Lee process.env.BACKEND_URL                        │
│  ├─ Llama a Laravel API                                │
│  └─ Retorna datos                                      │
└────────────────────────┬───────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────┐
│         Frontend - Componentes React                   │
│  ├─ Renderiza datos                                    │
│ └─ Interactúa con usuarios                             │
└─────────────────────────────────────────────────────────┘
```

## Seguridad - Capas

```
┌─────────────────────────────────────────────┐
│  HTTPS (Encriptación en tránsito)           │
│  Railway auto-configura certificados SSL   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Authentication (Usuarios + Roles)          │
│  Supabase Auth o Custom Session            │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Authorization (Permisos por rol)           │
│  Tabla: permisos_usuarios                   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Database Security                          │
│  ├─ Contraseñas hasheadas (bcrypt)         │
│  ├─ Foreign Keys para integridad           │
│  ├─ Índices para performance               │
│  └─ Logs de auditoria                      │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  API Security                               │
│  ├─ Validación de entrada                  │
│  ├─ Sanitización de datos                  │
│  ├─ Rate limiting (si aplica)              │
│  └─ CORS configurado                       │
└─────────────────────────────────────────────┘
```

## Performance - Índices de Base de Datos

```
usuarios
├─ idx_correo              (búsquedas por email)
├─ idx_estado              (filtros por estado)
└─ idx_rol                 (filtros por rol)

equipos
├─ idx_numero_serie        (búsqueda principal)
├─ idx_estado              (filtros)
├─ idx_ubicacion           (filtros)
├─ idx_fabricante          (filtros)
└─ idx_proximo_mantenimiento (calendario)

mantenimientos
├─ idx_id_equipo           (relación)
├─ idx_responsable_id      (asignaciones)
├─ idx_proxima_fecha       (alertas)
├─ idx_resultado           (filtros)
└─ idx_tipo                (categorización)

logs_actividad
├─ idx_id_usuario          (auditoría)
├─ idx_timestamp           (búsqueda temporal)
├─ idx_modulo              (filtros)
└─ idx_tabla_afectada      (trazabilidad)
```

## Monitoreo - Puntos de Verificación

```
┌─────────────────────────────────────────┐
│  Verificación 1: Logs del Build          │
│  railway logs | grep "INIT-DB"           │
│  ✓ Debe mostrar: [INIT-DB] ✅ Completado│
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Verificación 2: Base de Datos           │
│  SELECT COUNT(*) FROM usuarios;         │
│  ✓ Debe mostrar: 5                       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Verificación 3: Tablas Creadas          │
│  SHOW TABLES;                            │
│  ✓ Debe mostrar: 8 tablas                │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Verificación 4: Aplicación              │
│  curl https://tu-proyecto.railway.app   │
│  ✓ Status 200 OK                         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Verificación 5: API Conectada           │
│  GET /api/proxy/usuarios                │
│  ✓ Retorna lista de usuarios             │
└──────────────────────────────────────────┘
```

---

**Arquitectura creada:** v0 Assistant
**Versión:** 1.0
**Fecha:** Enero 2026
