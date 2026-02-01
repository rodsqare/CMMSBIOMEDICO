# Configuración MySQL + Next.js en Railway

## Descripción General

Este proyecto está configurado para desplegar automáticamente en Railway con una base de datos MySQL que se inicializa automáticamente durante el build.

## Características

- ✅ Auto-creación de base de datos MySQL
- ✅ Tablas pre-configuradas con relaciones
- ✅ Datos de ejemplo (usuarios, permisos)
- ✅ Migración automática en cada deploy
- ✅ Compatible con Railway MySQL plugin
- ✅ Configuración simplificada con variables de entorno

## Arquitetura

```
Next.js Frontend (Railway)
        ↓
   API Routes
        ↓
  Laravel Backend (Externo o Railway)
        ↓
   MySQL Database (Railway MySQL Plugin)
```

## Pasos de Despliegue

### 1. Configurar Railway

```bash
# Instalar CLI de Railway (opcional)
npm install -g @railway/cli

# Iniciar sesión
railway login

# Crear nuevo proyecto
railway init
```

### 2. Agregar MySQL Plugin

En el dashboard de Railway:

1. Ve a tu proyecto
2. Click en "New" o "+"
3. Selecciona "MySQL"
4. Railway generará automáticamente `DATABASE_URL`

### 3. Configurar Variables de Entorno

Las siguientes variables se configuran automáticamente en Railway:

- `DATABASE_URL` - Generada automáticamente por Railway MySQL
- `BACKEND_URL` - URL de tu backend Laravel (ej: https://tu-backend.railway.app/api)
- `NODE_ENV` - production

Puedes agregar variables adicionales en la sección "Variables" del proyecto:

```
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url (opcional)
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key (opcional)
API_SECRET_KEY=tu_secret_key
```

### 4. Desplegar

#### Opción A: Desde GitHub (Recomendado)

1. Push tu código a GitHub
2. En Railway: Click "New" → "GitHub Repo"
3. Selecciona el repositorio `Gueryo/cmms`
4. Railway ejecutará automáticamente:
   - `npm install`
   - `npm run build`
   - `npm run init-db` ← Inicializa MySQL
   - `npm run start` ← Inicia el servidor

#### Opción B: Railway CLI

```bash
# Desplegar usando CLI
railway up

# Ver logs
railway logs

# Ver variables de entorno
railway variables
```

## Inicialización Automática de Base de Datos

### ¿Cómo funciona?

Durante el build en Railway se ejecuta automáticamente:

```bash
npm run init-db
```

Este comando ejecuta el script `/scripts/init-db.js` que:

1. Se conecta a MySQL usando `DATABASE_URL`
2. Lee el archivo `/scripts/init-mysql.sql`
3. Crea la base de datos `cmms_biomedico`
4. Crea todas las tablas necesarias
5. Inserta datos de ejemplo

### Archivo de Inicialización SQL

**Ubicación:** `/scripts/init-mysql.sql`

**Tablas creadas:**

- `usuarios` - Sistema de usuarios con roles y permisos
- `equipos` - Equipos biomédicos
- `mantenimientos` - Registros de mantenimiento
- `ordenes_trabajo` - Órdenes de trabajo
- `documentos` - Documentos asociados a equipos
- `logs_actividad` - Audit logs
- `notificaciones` - Sistema de notificaciones
- `permisos_usuarios` - Permisos granulares por usuario

### Usuarios de Ejemplo

Se crean automáticamente:

| Email | Rol | Contraseña |
|-------|-----|-----------|
| admin@cmms.local | Administrador | (ver SQL) |
| supervisor@cmms.local | Supervisor | (ver SQL) |
| juan@cmms.local | Técnico | (ver SQL) |
| maria@cmms.local | Técnico | (ver SQL) |
| carlos@cmms.local | Técnico | (ver SQL) |

**Nota:** Las contraseñas en el SQL de ejemplo son hashes bcrypt. Para cambiarlas, actualiza directamente en la base de datos después del despliegue.

## Troubleshooting

### Error: "Failed to connect to database"

**Solución:**
1. Verifica que MySQL plugin está agregado en Railway
2. Espera 1-2 minutos a que Railway inicialice MySQL
3. Verifica la variable `DATABASE_URL` en el dashboard

### Error: "database already exists"

**Solución:**
Es normal en redeployments. El script ignora este error automáticamente.

### Error: "Permission denied" al ejecutar init-db

**Solución:**
```bash
chmod +x scripts/init-db.js
```

### La base de datos no se inicializa

**Solución:**
1. Verifica los logs: `railway logs`
2. Asegúrate que `DATABASE_URL` está seteada
3. Ejecuta manualmente: `npm run init-db`
4. Revisa `/scripts/init-mysql.sql` para errores de sintaxis

## Desarrollo Local

### Setup

1. Instalar MySQL localmente

```bash
# macOS
brew install mysql

# Windows
# Descargar desde https://dev.mysql.com/downloads/mysql/

# Linux
sudo apt-get install mysql-server
```

2. Iniciar MySQL

```bash
# macOS
mysql.server start

# Linux
sudo systemctl start mysql
```

3. Crear base de datos

```bash
mysql -u root -p < scripts/init-mysql.sql
```

4. Configurar `.env.local`

```env
DATABASE_URL=mysql://root:@localhost:3306/cmms_biomedico
BACKEND_URL=http://localhost:8000/api
NODE_ENV=development
```

5. Iniciar proyecto

```bash
npm install
npm run init-db
npm run dev
```

## Estructura de Archivos

```
proyecto/
├── scripts/
│   ├── init-mysql.sql      # Definición de BD y tablas
│   └── init-db.js          # Script de inicialización
├── env.example             # Variables de entorno
├── railway.json            # Configuración de Railway
├── railway.toml            # Config alternativa
├── package.json            # Scripts incluyen init-db
└── RAILWAY_MYSQL_SETUP.md  # Este archivo
```

## Variables de Entorno

### Requeridas en Railway

```
DATABASE_URL=mysql://[user]:[password]@[host]:3306/cmms_biomedico
BACKEND_URL=https://tu-backend.railway.app/api
```

### Opcionales

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
API_SECRET_KEY=
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## Información de Contacto BD

**Nombre:** cmms_biomedico
**Usuario por defecto:** root
**Puerto:** 3306

En Railway se configura automáticamente en la variable `DATABASE_URL`.

## Próximos Pasos

1. Desplegar en Railway siguiendo pasos arriba
2. Verificar logs en Railway dashboard
3. Conectar el backend Laravel (si es externo)
4. Actualizar credenciales de usuarios en producción
5. Configurar backups automáticos en Railway

## Más Información

- [Railway Docs](https://docs.railway.app)
- [MySQL Plugin](https://docs.railway.app/plugins/mysql)
- [Environment Variables](https://docs.railway.app/reference/environment-variables)
