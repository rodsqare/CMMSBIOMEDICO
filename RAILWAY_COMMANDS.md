# Comandos Rápidos - Railway + MySQL

## Instalación Railway CLI

```bash
npm install -g @railway/cli
```

## Login

```bash
railway login
```

## Inicializar Proyecto

```bash
railway init
```

## Desplegar

```bash
railway up
```

## Ver Logs

```bash
# Logs en tiempo real
railway logs -f

# Últimos 100 logs
railway logs --tail 100

# Logs con filtro
railway logs | grep "INIT-DB"
```

## Variables de Entorno

```bash
# Ver todas las variables
railway variables

# Agregar variable
railway variables set DATABASE_URL "mysql://..."

# Eliminar variable
railway variables unset DATABASE_URL
```

## Información del Proyecto

```bash
# Ver status
railway status

# Ver detalles del servicio
railway service details

# Listar servicios
railway service list
```

## Consola Remota

```bash
# Entrar a consola interactiva
railway shell

# Ejecutar comando
railway shell -- node --version

# Ejecutar script
railway shell -- npm run init-db
```

## Conectar a MySQL Remoto

```bash
# Obtener credenciales
railway variables | grep DATABASE_URL

# Conectar (reemplaza con tus valores)
mysql -u user -p -h gateway.railway.app -P 3306 cmms_biomedico

# O usar directamente DATABASE_URL parseada
# Formato: mysql://user:password@host:port/database
```

## Base de Datos Local

```bash
# Iniciar servicio MySQL (macOS)
mysql.server start

# Iniciar servicio MySQL (Linux)
sudo systemctl start mysql

# Crear base de datos local
npm run init-db

# Conectar a BD local
mysql -u root cmms_biomedico
```

## Desarrollo

```bash
# Instalar dependencias
npm install

# Inicializar BD
npm run init-db

# Desarrollo local
npm run dev

# Build de producción
npm run build

# Producción local
npm run start
```

## GitHub

```bash
# Ver estado
git status

# Preparar cambios
git add .

# Commit
git commit -m "Mensaje descriptivo"

# Push
git push origin main

# Railway detectará cambios automáticamente y desplegará
```

## Monitoreo

```bash
# Ver métricas
railway logs --grep "memory"

# Ver errores
railway logs --grep "error"

# Ver eventos de deployment
railway logs --service cmms_biomedico
```

## Rollback

```bash
# Revertir último commit
git revert HEAD

# Push cambios revertidos
git push origin main

# Railway re-desplegará automáticamente
```

## Mantenimiento

```bash
# Ejecutar init-db manualmente
railway shell -- npm run init-db

# Limpiar logs
# (Railway los mantiene automáticamente)

# Ver uso de disk
railway shell -- du -sh /app
```

## Información Útil

```bash
# Ver variables que Railway genera automáticamente
railway variables | grep DATABASE

# Ver versión de Node.js
railway shell -- node --version

# Ver versión de npm
railway shell -- npm --version

# Ver versión de Next.js
railway shell -- npm list next
```

## URLs Importantes

```bash
# Tu aplicación
https://tu-proyecto.railway.app

# Railway Dashboard
https://railway.app/dashboard

# Railway Logs
https://railway.app/project/[PROJECT_ID]/deployments

# Railway Docs
https://docs.railway.app
```

## Troubleshooting Rápido

```bash
# Redeployar
railway up

# Ver último error
railway logs | tail -20

# Reconectar a BD
railway shell -- node << 'EOF'
const mysql = require('mysql2/promise');
mysql.createConnection(process.env.DATABASE_URL)
  .then(() => console.log('✅ Connected'))
  .catch(e => console.error('❌', e.message));
EOF

# Reiniciar servicio
railway service restart

# Ver health check
curl https://tu-proyecto.railway.app/
```

## Limpieza

```bash
# Eliminar servicio (¡CUIDADO!)
railway service delete cmms_biomedico

# Eliminar todo el proyecto (¡CUIDADO!)
railway project delete
```

## Shortcuts

```bash
# Alias para logs en tiempo real
alias rlogs='railway logs -f'

# Alias para shell
alias rsh='railway shell'

# Alias para status
alias rstat='railway status'

# Agregar a ~/.bashrc o ~/.zshrc para persistencia
```

## Verificación de Deployment

```bash
# 1. Verificar que está corriendo
railway status

# 2. Verificar logs
railway logs | grep "INIT-DB"

# 3. Verificar variables
railway variables | grep DATABASE_URL

# 4. Conectar a BD
# (Ver sección "Conectar a MySQL Remoto")

# 5. Test de aplicación
curl https://tu-proyecto.railway.app
```

## Scripts Personalizados

Agregados a `package.json`:

```bash
npm run build          # Build Next.js
npm run dev            # Desarrollo local
npm run init-db        # Inicializar BD MySQL
npm run start          # Producción
npm run lint           # Verificar código
```

## Flujo Completo de Despliegue

```bash
# 1. Preparar cambios
git add .
git commit -m "Add MySQL configuration"

# 2. Enviar a GitHub
git push origin main

# 3. En Railway Dashboard, o:
railway up

# 4. Verificar deployment
railway logs -f

# 5. Verificar BD
railway shell -- npm run init-db

# 6. Verificar aplicación
curl https://tu-proyecto.railway.app
```

## Debugging

```bash
# Ver variables de entorno
railway shell -- env | sort

# Ver estructura de directorios
railway shell -- ls -la /app

# Ver contenido de .env
railway shell -- cat .env

# Ejecutar comando personalizado
railway shell -- [TU_COMANDO]
```

## Performance

```bash
# Ver tamaño de aplicación
railway shell -- du -sh /app/*

# Ver memoria disponible
railway shell -- free -h

# Ver procesos corriendo
railway shell -- ps aux
```

---

**Tip:** Usa `railway shell --` para ejecutar cualquier comando en el ambiente remoto.

**Documentación completa:** https://docs.railway.app

**Soporte:** Para más info, revisa los archivos `*.md` en la raíz del proyecto.
