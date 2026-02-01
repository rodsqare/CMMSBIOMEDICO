# Resumen: Configuración MySQL para Railway ✅

## Lo Que Se Hizo

Se ha configurado completamente tu proyecto CMMS Biomédico para desplegar en Railway con **auto-inicialización automática de MySQL**.

## Archivos Creados (4)

| Archivo | Descripción | Líneas |
|---------|-------------|--------|
| `/scripts/init-mysql.sql` | Definición de BD y tablas | 244 |
| `/scripts/init-db.js` | Script Node.js de inicialización | 175 |
| `/RAILWAY_MYSQL_SETUP.md` | Guía completa de configuración | 273 |
| `/VERIFY_DEPLOYMENT.md` | Checklist de verificación | 334 |

## Archivos Modificados (3)

| Archivo | Cambio | Impacto |
|---------|--------|--------|
| `railway.json` | Agregado `init-db` al build | BD se crea automáticamente |
| `package.json` | Script `init-db` + dependencia `mysql2` | Soporte MySQL en Node.js |
| `env.example` | Variables de BD | Documentación de configuración |

## Cómo Funciona

```
1. Push a GitHub
   ↓
2. Railway detecta cambios
   ↓
3. BUILD: npm install && npm run build && npm run init-db
   ├─ Conecta a MySQL
   ├─ Crea base de datos
   ├─ Crea 8 tablas
   └─ Inserta datos de ejemplo
   ↓
4. START: npm run start
   ↓
5. ✅ Aplicación lista para usar
```

## Tablas Creadas (8)

1. **usuarios** - Sistema de usuarios con roles
2. **equipos** - Equipos biomédicos
3. **mantenimientos** - Registros de mantenimiento
4. **ordenes_trabajo** - Órdenes de trabajo
5. **documentos** - Documentos de equipos
6. **logs_actividad** - Audit logs
7. **notificaciones** - Sistema de alertas
8. **permisos_usuarios** - Permisos granulares

## Usuarios Predeterminados

Se crean 5 usuarios de ejemplo automáticamente:

- **admin@cmms.local** - Administrador (todos los permisos)
- **supervisor@cmms.local** - Supervisor (gestión general)
- **juan@cmms.local** - Técnico (Electrónica)
- **maria@cmms.local** - Técnico (Mecánica)
- **carlos@cmms.local** - Técnico (Hidráulica)

## 3 Pasos para Desplegar

### Opción 1: GitHub (Recomendado) ⭐

```bash
# 1. Haz commit y push
git add .
git commit -m "Add MySQL auto-init for Railway"
git push origin main

# 2. En Railway Dashboard:
#    - Click "New" → "GitHub Repo"
#    - Selecciona Gueryo/cmms
#
# Railway automáticamente:
#    - Descarga código
#    - Instala dependencias
#    - Compila Next.js
#    - Inicializa BD
#    - Inicia servidor
```

### Opción 2: Railway CLI

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Opción 3: Local

```bash
npm run init-db
npm run dev
```

## Variables de Entorno

### En Railway (Se generan automáticamente)
```env
DATABASE_URL=mysql://user:pass@gateway.railway.app:3306/cmms_biomedico
```

### Personalizables
```env
BACKEND_URL=https://tu-backend.railway.app/api
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app/api
```

## Verificación Post-Deploy

Después de desplegar, verifica:

```bash
# Ver logs
railway logs

# Buscar éxito de inicialización
# Debe mostrar: [INIT-DB] ✅ Inicialización completada

# Conectar a MySQL y verificar
mysql -u root -p -h gateway.railway.app

# Ver tablas creadas
USE cmms_biomedico;
SHOW TABLES;  # Debe mostrar 8 tablas
SELECT COUNT(*) FROM usuarios;  # Debe mostrar 5
```

## Arquitectura Final

```
┌─────────────────────────────────────────┐
│         Tu Aplicación CMMS              │
└─────────────────────────────────────────┘
            ↓                    ↓
    ┌──────────────┐    ┌──────────────┐
    │ Next.js Front│    │   API Routes │
    │   (Railway)  │    │   (Railway)  │
    └──────────────┘    └──────────────┘
            ↓                    ↓
    ┌──────────────────────────────────┐
    │  Laravel Backend (Externo)       │
    │  http://localhost:8000/api       │
    └──────────────────────────────────┘
            ↓
    ┌──────────────────────────────────┐
    │    MySQL Database (Railway)      │
    │    cmms_biomedico                │
    │    8 Tablas + Datos              │
    └──────────────────────────────────┘
```

## Seguridad

⚠️ **Importante para Producción:**

1. **Cambia contraseñas de usuarios de ejemplo**
   ```sql
   UPDATE usuarios SET contrasena = SHA2('nueva_contrasena', 256) 
   WHERE correo = 'admin@cmms.local';
   ```

2. **Habilita encriptación en Railway**
   - Settings → Encryption

3. **Configura backups**
   - Railway → Backups

4. **Revisa permisos**
   - Solo admin con acceso a logs_actividad

## Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| BD no se crea | Espera 2 min, revisa logs: `railway logs` |
| mysql2 not found | `npm install` y redeploy |
| Connection refused | Verifica DATABASE_URL en variables |
| Tablas no existen | Ejecuta: `npm run init-db` |

## Documentación Completa

Para más información:

- **Setup completo:** Ver `/RAILWAY_MYSQL_SETUP.md`
- **Cambios técnicos:** Ver `/MYSQL_CHANGES.md`
- **Verificación:** Ver `/VERIFY_DEPLOYMENT.md`
- **Script SQL:** Ver `/scripts/init-mysql.sql`
- **Script Node:** Ver `/scripts/init-db.js`

## Próximo Paso

**Haz push de los cambios a GitHub:**

```bash
git add -A
git commit -m "Configure MySQL auto-init for Railway deployment"
git push origin main
```

Luego en Railway Dashboard:
1. Click "New" → "GitHub Repo"
2. Selecciona tu repositorio
3. Railway hará el resto automáticamente ✨

## Soporte

Cualquier pregunta sobre la configuración, revisa:

1. `/RAILWAY_MYSQL_SETUP.md` → Sección "Troubleshooting"
2. `/VERIFY_DEPLOYMENT.md` → Checklist y pruebas
3. Los scripts en `/scripts/` para entender cómo funciona
4. Logs de Railway: `railway logs -f`

---

**Estado:** ✅ Completado
**Versión:** 1.0
**Fecha:** Enero 2026
