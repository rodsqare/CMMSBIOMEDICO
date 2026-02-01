# Cambios Realizados para MySQL en Railway

## Resumen

Se ha configurado el proyecto para auto-inicializar una base de datos MySQL en Railway durante el proceso de build. Los cambios incluyen scripts de inicialización, archivos de configuración y documentación.

## Archivos Nuevos Creados

### 1. `/scripts/init-mysql.sql` (244 líneas)

Script SQL que define:

- Base de datos `cmms_biomedico`
- 8 tablas principales con relaciones
- Índices para optimización
- Datos de ejemplo (usuarios, permisos)

**Tablas:**
- usuarios
- equipos
- mantenimientos
- ordenes_trabajo
- documentos
- logs_actividad
- notificaciones
- permisos_usuarios

### 2. `/scripts/init-db.js` (175 líneas)

Script Node.js que:

- Se conecta a MySQL usando `DATABASE_URL`
- Ejecuta el SQL de inicialización
- Maneja reintentos de conexión (útil en Railway)
- Ignora errores de "ya existe"
- Muestra logs detallados

**Features:**
- Auto-retry (hasta 30 intentos)
- Parseo de DATABASE_URL
- Logs informativos
- Manejo de errores robusto

## Archivos Modificados

### 1. `railway.json`

**Antes:**
```json
{
  "deploy": {
    "startCommand": "npm run start"
  }
}
```

**Después:**
```json
{
  "build": {
    "buildCommand": "npm install && npm run build && npm run init-db"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthchecks": {
      "http": { "path": "/", "port": 3000 }
    }
  }
}
```

**Cambios:**
- Agregado `npm run init-db` al buildCommand
- Agregado healthcheck HTTP

### 2. `package.json`

**Scripts agregados:**
```json
"init-db": "node scripts/init-db.js"
```

**Dependencias agregadas:**
```json
"mysql2": "^3.9.1"
```

### 3. `env.example`

**Variables agregadas:**
```env
# MySQL Database Configuration
DATABASE_URL=mysql://user:password@localhost:3306/cmms_biomedico
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cmms_biomedico
BACKEND_URL=http://localhost:8000/api
```

### 4. `.gitignore`

Se agregaron exclusiones para Railway:
```
# IDE
.idea/
.vscode/
*.swp
*.swo

# Railway logs
.railway_logs/
```

## Archivos de Documentación Creados

### 1. `/RAILWAY_MYSQL_SETUP.md` (273 líneas)

Guía completa que incluye:
- Descripción de arquitectura
- Pasos de despliegue (GitHub + CLI)
- Configuración de variables
- Troubleshooting
- Setup local
- Información de BD

### 2. `/MYSQL_CHANGES.md` (Este archivo)

Resumen de todos los cambios realizados.

## Flujo de Inicialización

```
1. Push a GitHub
          ↓
2. Railway detecta push
          ↓
3. Build iniciado
          ↓
4. npm install
          ↓
5. npm run build (compila Next.js)
          ↓
6. npm run init-db ← NUEVO
   ├─ Conecta a MySQL
   ├─ Lee init-mysql.sql
   ├─ Crea cmms_biomedico
   ├─ Crea tablas
   └─ Inserta datos de ejemplo
          ↓
7. npm run start (inicia servidor)
          ↓
8. App disponible
```

## Cómo Funciona en Railway

1. **MySQL Plugin se agrega automáticamente**
   - Railway genera `DATABASE_URL` con credenciales
   - La BD está lista en ~30 segundos

2. **El script init-db.js ejecuta:**
   - Espera disponibilidad de BD (retry loop)
   - Ejecuta todas las sentencias SQL
   - Ignora errores de "ya existe"
   - Reporta éxito/error

3. **Resultado:**
   - BD completamente inicializada
   - Tablas con relaciones funcionales
   - Usuarios de ejemplo listos
   - App lista para usar

## Variables de Entorno Importantes

### En Railway (Automáticas)
```
DATABASE_URL=mysql://prod_user:prod_pass@gateway.railway.app:3306/cmms_biomedico
```

### En Desarrollo Local
```
DATABASE_URL=mysql://root:@localhost:3306/cmms_biomedico
```

### Configuración Opcional
```
BACKEND_URL=http://localhost:8000/api
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Cómo Usar

### Opción 1: GitHub (Recomendado)

```bash
# 1. Haz push a GitHub
git add .
git commit -m "Add MySQL auto-init for Railway"
git push origin main

# 2. En Railway Dashboard:
#    - Click "New" → "GitHub Repo"
#    - Selecciona Gueryo/cmms
#    - Railway automáticamente:
#      a. Instala dependencias
#      b. Compila Next.js
#      c. Inicializa BD
#      d. Inicia servidor
```

### Opción 2: Railway CLI

```bash
# Instalar CLI
npm install -g @railway/cli

# Desplegar
railway login
railway init
railway up

# Ver logs
railway logs

# Ver variables
railway variables
```

### Opción 3: Local

```bash
# 1. Instalar MySQL
brew install mysql  # macOS
# o en Linux/Windows

# 2. Iniciar servicio
mysql.server start

# 3. Inicializar BD
npm run init-db

# 4. Iniciar dev server
npm run dev
```

## Validación

Después del despliegue, verifica que todo funcione:

```sql
-- Conectarse a MySQL en Railway
mysql -u [user] -p [password] -h [host] -P 3306

-- Ver bases de datos
SHOW DATABASES;

-- Usar la BD del proyecto
USE cmms_biomedico;

-- Ver tablas creadas
SHOW TABLES;

-- Contar usuarios
SELECT COUNT(*) FROM usuarios;
```

## Soporte

Para problemas:

1. Revisa los logs en Railway: `railway logs`
2. Verifica variables en Railway Dashboard
3. Mira `/RAILWAY_MYSQL_SETUP.md` sección "Troubleshooting"
4. Revisa `/scripts/init-db.js` para detalles técnicos

## Seguridad

**⚠️ Importante para Producción:**

1. Cambia las contraseñas de usuarios de ejemplo
2. Usa variables de entorno seguros en Railway
3. Habilita encriptación de BD
4. Configura backups automáticos
5. Revisa logs regularmente

## Próximas Mejoras

- [ ] Script de backup automático
- [ ] Datos de ejemplo más realistas
- [ ] Migración desde Supabase (si aplica)
- [ ] Health check endpoint
- [ ] Métricas de base de datos

## Changelog

### v1.0 (Current)
- ✅ Auto-creación de BD MySQL
- ✅ 8 tablas pre-configuradas
- ✅ Datos de ejemplo
- ✅ Script de inicialización robusto
- ✅ Documentación completa
- ✅ Soporte Railway + Local
