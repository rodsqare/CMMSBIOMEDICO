# Railway Deployment - Quick Start

## 🚀 Inicio Rápido (5 minutos)

### 1. Conectar a Railway

```bash
# Opción A: Via CLI
npm install -g railway
railway login
railway init
railway up
```

**Opción B: Via Dashboard (Recomendado)**
1. Ve a https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Selecciona `Gueryo/cmms`

### 2. Configurar Variables de Entorno

Añade estas en Railway Dashboard → Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_role_key
NODE_ENV=production
```

### 3. ¡Listo!

Railway automáticamente:
- ✅ Detecta que es Next.js
- ✅ Instala dependencias
- ✅ Construye la aplicación
- ✅ Inicia el servicio
- ✅ Te da un URL público

## 📊 Monitoreo

```bash
railway logs          # Ver logs en tiempo real
railway ps           # Ver estado de procesos
railway down         # Parar servicio
```

## 🔗 Tu Aplicación

Una vez desplegada, Railway te proporciona:
- URL pública: `https://<tu-proyecto>-production.up.railway.app`
- O dominio personalizado (configurable en Settings)

## 🆘 Errores Comunes

| Error | Solución |
|-------|----------|
| Build Failed | Verifica `npm run build` localmente |
| Port Error | Railway usa puerto 3000 automáticamente |
| Memory Exceeded | Optimiza assets o upgrade plan |
| Env vars missing | Revisa que todas estén en Railway |

## 📚 Más Información

- [railway.app/docs](https://docs.railway.app)
- [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) - Guía completa

---

**Status**: ✅ Proyecto configurado para Railway
