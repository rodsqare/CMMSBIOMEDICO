# Notification System Setup

## IMPORTANTE: El sistema de notificaciones ahora usa un proxy

Todos los requests al backend de Laravel ahora pasan por un proxy de Next.js para evitar problemas de CORS.

## Pasos para solucionar el error CORS:

1. **DETENER el servidor de desarrollo**
   \`\`\`bash
   # Presiona Ctrl+C en la terminal donde corre Next.js
   \`\`\`

2. **LIMPIAR el caché de Next.js**
   \`\`\`bash
   rm -rf .next
   # En Windows: rmdir /s /q .next
   \`\`\`

3. **REINICIAR el servidor**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **LIMPIAR el caché del navegador**
   - Abre las DevTools (F12)
   - Click derecho en el botón de refrescar
   - Selecciona "Vaciar caché y recargar forzadamente" o "Empty Cache and Hard Reload"
   
   O simplemente presiona: `Ctrl + Shift + R` (Windows/Linux) o `Cmd + Shift + R` (Mac)

## Verificación

Una vez reiniciado, deberías ver en la consola del navegador:

\`\`\`
[v0] ApiClient initialized - using proxy at: /api/proxy
\`\`\`

Y los requests deberían ir a:
\`\`\`
http://localhost:3000/api/proxy/notificaciones?usuario_id=1
\`\`\`

En lugar de:
\`\`\`
http://localhost:8000/api/notificaciones?usuario_id=1  ❌ (viejo)
\`\`\`

## Configuración actual

- **Frontend (Next.js)**: Puerto 3000
- **Backend (Laravel)**: Puerto 8000
- **Proxy**: `/api/proxy` → redirige a `http://localhost:8000/api`

## Si el problema persiste

1. Verifica que el servidor Laravel esté corriendo en el puerto 8000
2. Verifica que no tengas una variable de entorno `NEXT_PUBLIC_API_URL` configurada
3. Revisa la consola del servidor Next.js para ver los logs del proxy
4. Intenta en una ventana de incógnito del navegador

## Archivo de configuración

El cliente API está configurado en `lib/api/client.ts`:
\`\`\`typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/proxy"
\`\`\`

Si tienes un archivo `.env.local`, asegúrate de que NO tenga:
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:8000/api  ❌ Eliminar esta línea
