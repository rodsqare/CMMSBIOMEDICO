# Despliegue en Railway

Guía para desplegar el CMMS Biomédico en Railway.

## Requisitos Previos

- Cuenta en [Railway.app](https://railway.app)
- Repositorio en GitHub conectado a Railway
- Variables de entorno configuradas

## Pasos de Despliegue

### 1. Conectar Repositorio a Railway

1. Accede a [Railway.app](https://railway.app)
2. Haz clic en "New Project" → "Deploy from GitHub"
3. Selecciona el repositorio `Gueryo/cmms`
4. Autoriza el acceso a tu repositorio

### 2. Configurar Variables de Entorno

En Railway, dirígete a la sección de "Variables" y configura:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=<tu_url_supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<tu_service_role_key>

# Backend API (si aplica)
NEXT_PUBLIC_API_URL=https://<tu-dominio>
API_SECRET_KEY=<tu_api_secret>

# Entorno
NODE_ENV=production
```

### 3. Configurar el Servicio

Railway debería detectar automáticamente que es un proyecto Next.js:

- **Builder**: Nixpacks (automático)
- **Start Command**: `npm run start`
- **Build Command**: `npm run build`

### 4. Agregar Dominio Personalizado (Opcional)

1. En Railway, ve a "Settings"
2. En "Domains", haz clic en "Generate Domain" o "Add Custom Domain"
3. Configura tu dominio personalizado

### 5. Configurar Base de Datos (Si necesaria)

Si necesitas PostgreSQL:

1. En Railway, crea un nuevo servicio "PostgreSQL"
2. Conecta al proyecto
3. Las credenciales se agregarán automáticamente

## Monitoreo y Logs

### Ver Logs en Tiempo Real

```bash
# Via Railway CLI
railway logs
```

O desde el dashboard:
1. Ve a "Deployments"
2. Haz clic en el despliegue actual
3. Ver "Logs"

### Métricas Disponibles

- CPU Usage
- Memory Usage
- Network I/O
- HTTP Request Count

## Troubleshooting

### Error: Build Failed

- Verifica que `npm install` y `npm run build` funcionan localmente
- Revisa los logs de build en Railway
- Asegúrate de que todas las variables de entorno están configuradas

### Error: Port Binding

Railway usa automáticamente el puerto 3000. Verifica que tu aplicación escucha en:

```javascript
// app/api/route.ts o similar
const port = process.env.PORT || 3000;
```

### Error: Memory Limit Exceeded

Railway tiene límites de memoria según el plan:
- **Free**: 512 MB
- **Pro**: Variable según necesidad

Si necesitas más memoria, considera:
1. Optimizar imágenes y assets
2. Implementar caching
3. Actualizar a un plan superior

## Variables de Producción Recomendadas

```env
# Seguridad
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://<tu-dominio>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=<producción>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<producción>

# Analytics
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Otros
LOG_LEVEL=info
```

## Redeploy Automático

Railway redeploya automáticamente cuando:
1. Haces push a la rama conectada
2. Cambias variables de entorno
3. Realizas cambios manuales en el servicio

## Rollback

Para volver a una versión anterior:

1. Ve a "Deployments"
2. Selecciona el despliegue anterior
3. Haz clic en "Redeploy"

## Contacto y Soporte

- Documentación: https://docs.railway.app
- Status: https://status.railway.app
- Community: Discord de Railway

---

**Última actualización**: 2026-01-31
