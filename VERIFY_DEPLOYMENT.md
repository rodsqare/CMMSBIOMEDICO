# Checklist de Verificación - Despliegue en Railway

## Antes de Desplegar

- [ ] Todos los cambios están en Git
- [ ] README.md actualizado
- [ ] Variables de entorno configuradas
- [ ] Dependencias actualizadas (`npm install`)

## Durante el Despliegue

- [ ] Railway muestra "Building..."
- [ ] Se ejecuta `npm run init-db` (visible en logs)
- [ ] No hay errores en los logs de build
- [ ] Base de datos se crea sin errores

## Después del Despliegue

### 1. Verificar Base de Datos

```bash
# Conectarse a la BD en Railway
mysql -u $DB_USER -p$DB_PASSWORD -h $DB_HOST -P $DB_PORT

# O si tienes DATABASE_URL:
# Parsea la URL: mysql://user:pass@host:port/db
```

**Comandos de verificación:**

```sql
-- Ver bases de datos
SHOW DATABASES;
-- Debe aparecer: cmms_biomedico

-- Seleccionar BD
USE cmms_biomedico;

-- Ver tablas
SHOW TABLES;
-- Debe mostrar 8 tablas:
-- - usuarios
-- - equipos
-- - mantenimientos
-- - ordenes_trabajo
-- - documentos
-- - logs_actividad
-- - notificaciones
-- - permisos_usuarios

-- Contar registros de ejemplo
SELECT COUNT(*) as total_usuarios FROM usuarios;
-- Debe mostrar: 5 (admin + supervisor + 3 técnicos)

-- Ver usuarios creados
SELECT id, nombre, correo, rol FROM usuarios;

-- Verificar estructura de tabla equipos
DESCRIBE equipos;
-- Debe mostrar 28+ columnas
```

### 2. Verificar Aplicación

```bash
# Acceder a tu aplicación
https://tu-proyecto.railway.app

# Verificar logs
railway logs -f

# Verificar variables de entorno
railway variables
```

**En la aplicación:**

- [ ] Página carga sin errores
- [ ] No hay errores en la consola del navegador
- [ ] La API puede conectarse a MySQL
- [ ] Las tablas de datos se cargan correctamente

### 3. Verificar Conectividad

**Test desde Railway Console:**

```bash
# Entrar a la consola de Railway
railway shell

# Verificar conexión a MySQL
node << 'EOF'
const mysql = require('mysql2/promise');

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: 'cmms_biomedico'
    });
    
    const [rows] = await connection.query('SELECT COUNT(*) as tables FROM information_schema.tables WHERE table_schema = "cmms_biomedico"');
    console.log('Tables found:', rows[0].tables);
    
    const [users] = await connection.query('SELECT COUNT(*) as usuarios FROM usuarios');
    console.log('Users found:', users[0].usuarios);
    
    await connection.end();
    console.log('✅ Connection successful!');
  } catch(err) {
    console.error('❌ Error:', err.message);
  }
})();
EOF
```

### 4. Verificar Logs

**Buscar en logs:**

```bash
# Ver logs del build (init-db)
railway logs --service cmms_biomedico | grep -i "init-db"

# Salida esperada:
# [INIT-DB] Inicializando base de datos...
# [INIT-DB] Conectando a MySQL
# [INIT-DB] Ejecutando X sentencias SQL
# [INIT-DB] ✅ Inicialización completada
```

### 5. Verificar Permisos

```sql
-- Verificar permisos creados
SELECT 
    u.nombre,
    u.rol,
    COUNT(p.id) as permisos_asignados
FROM usuarios u
LEFT JOIN permisos_usuarios p ON u.id = p.id_usuario
GROUP BY u.id;
```

### 6. Test de Backend (si aplica)

```bash
# Si el backend Laravel está en la misma Railway:
curl https://tu-backend.railway.app/api/usuarios

# Debe retornar: lista de usuarios o error de auth
# NO debe retornar: connection refused
```

## Troubleshooting

### Problema: "Base de datos no se inicializa"

**Solución:**

```bash
# 1. Revisa logs
railway logs

# 2. Verifica DATABASE_URL
railway variables

# 3. Reconecta a MySQL manualmente
mysql -u root -p < scripts/init-mysql.sql

# 4. Re-deploy
railway up
```

### Problema: "mysql2 module not found"

**Solución:**

```bash
# 1. Reinstalar dependencias
npm install

# 2. Verificar package.json tiene mysql2
cat package.json | grep mysql2

# 3. Re-deploy
railway up
```

### Problema: "Connection refused"

**Solución:**

1. Espera 1-2 minutos a que MySQL inicie
2. Verifica que MySQL plugin está agregado en Railway
3. Verifica credenciales en DATABASE_URL
4. Intenta reconectar

### Problema: "Tablas no existen"

**Solución:**

```bash
# 1. Verifica que el script SQL es válido
cat scripts/init-mysql.sql | head -20

# 2. Ejecuta manualmente
mysql -u root -p cmms_biomedico < scripts/init-mysql.sql

# 3. Revisa errores de SQL
mysql -u root -p < scripts/init-mysql.sql 2>&1 | grep -i error
```

## Performance Check

```sql
-- Verificar índices
SHOW INDEX FROM equipos;

-- Verificar tamaño de BD
SELECT 
    SUM(data_length + index_length) / 1024 / 1024 as size_mb
FROM information_schema.tables
WHERE table_schema = 'cmms_biomedico';

-- Debe ser < 5 MB (sin datos)

-- Verificar relaciones (foreign keys)
SELECT CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = 'cmms_biomedico';
```

## Seguridad Check

```sql
-- Verificar usuarios de BD
SELECT user, host FROM mysql.user WHERE db = 'cmms_biomedico';

-- Verificar permisos de datos
SELECT * FROM permisos_usuarios LIMIT 1;

-- Verificar que no hay datos sensibles expuestos
SELECT * FROM usuarios LIMIT 1;
-- Verificar que contrasena está hasheada (comienza con $2y$ o $2a$)
```

## Rollback

Si algo sale mal:

```bash
# 1. Revert el código
git revert HEAD

# 2. Re-deploy
railway up

# 3. O elimina el servicio y crea uno nuevo
railway service delete cmms_biomedico
railway service create cmms_biomedico
```

## Métricas Post-Deploy

```bash
# Tamaño de aplicación
railway status

# Uso de memoria
railway logs | grep memory

# Tiempo de respuesta
time curl https://tu-proyecto.railway.app

# Debe ser < 1 segundo
```

## Checklist Final

- [ ] Base de datos creada (SHOW DATABASES)
- [ ] 8 tablas existen (SHOW TABLES)
- [ ] 5 usuarios de ejemplo insertados
- [ ] Permisos asignados correctamente
- [ ] Aplicación carga sin errores
- [ ] API conecta a base de datos
- [ ] Logs muestran [INIT-DB] ✅
- [ ] No hay errores en consola
- [ ] Variables de entorno correctas
- [ ] Backend conecta si aplica

## Contacto/Soporte

Si tienes problemas:

1. Revisa `/RAILWAY_MYSQL_SETUP.md` → Troubleshooting
2. Revisa `/MYSQL_CHANGES.md` → Estructura de cambios
3. Revisa logs: `railway logs -f`
4. Revisa script: `/scripts/init-db.js`
5. Revisa SQL: `/scripts/init-mysql.sql`

## Información Útil

**Railway Dashboard:**
- Logs: Sección "Deployment" → "Build Logs" y "Runtime Logs"
- Variables: Sección "Variables"
- MySQL Plugin: Sección "Plugins"

**Comandos Útiles:**

```bash
# Ver todas las variables
railway variables

# Ejecutar comando remoto
railway shell

# Ver logs en tiempo real
railway logs -f

# Listar servicios
railway service list

# Ver detalles del servicio
railway service details
```

---

**Última actualización:** 2024
**Versión:** 1.0
