# 🚀 Guía de Despliegue a Producción - HU1

## Preparación para Producción

Esta guía cubre el despliegue completo del Menú Digital QR en un entorno de producción.

---

## 📋 Pre-requisitos

- [ ] Cuenta en MongoDB Atlas (base de datos)
- [ ] Cuenta en Railway/Render/Heroku (backend)
- [ ] Cuenta en Vercel/Netlify (frontend)
- [ ] Dominio configurado (opcional)
- [ ] Impresora para QR codes

---

## 🗄️ Paso 1: Base de Datos (MongoDB Atlas)

### 1.1 Crear Cluster

1. Ir a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear cuenta o iniciar sesión
3. Crear nuevo cluster (Free tier M0 es suficiente)
4. Esperar ~5 minutos hasta que esté listo

### 1.2 Configurar Acceso

```bash
# En MongoDB Atlas:
1. Database Access → Add New Database User
   Username: laviejaestacion
   Password: [generar contraseña segura]
   
2. Network Access → Add IP Address
   → Allow Access from Anywhere (0.0.0.0/0)
   
3. Databases → Connect → Connect your application
   → Copiar connection string
```

**Connection String:**
```
mongodb+srv://laviejaestacion:<password>@cluster0.xxxxx.mongodb.net/laviejaestacion?retryWrites=true&w=majority
```

### 1.3 Poblar Base de Datos

```bash
# En local
export MONGODB_URI="mongodb+srv://..."
node backend/scripts/seedMenuData.js
```

---

## 🖥️ Paso 2: Backend (Railway - Recomendado)

### 2.1 Crear Proyecto en Railway

1. Ir a [Railway.app](https://railway.app)
2. Conectar con GitHub
3. New Project → Deploy from GitHub repo
4. Seleccionar repositorio `LaViejaEstacion-RestoBar`

### 2.2 Configurar Variables de Entorno

```env
# En Railway Dashboard → Variables
MONGODB_URI=mongodb+srv://laviejaestacion:PASSWORD@cluster0.xxxxx.mongodb.net/laviejaestacion
PORT=4000
NODE_ENV=production
JWT_SECRET=tu_secret_key_super_seguro
CORS_ORIGIN=https://laviejaestacion.vercel.app
```

### 2.3 Configurar Start Command

```json
// En package.json (backend)
{
  "scripts": {
    "start": "node index.js",
    "build": "babel src -d dist"
  }
}
```

### 2.4 Deploy

```bash
# Railway auto-deploya al hacer push a main
git push origin main
```

**URL generada:** `https://laviejaestacion-production.up.railway.app`

---

## 🌐 Paso 3: Frontend (Vercel - Recomendado)

### 3.1 Preparar Build

```bash
cd frontend

# Actualizar API URL en config
# frontend/src/config.js
export const API_URL = 'https://laviejaestacion-production.up.railway.app/api';
```

### 3.2 Deploy en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**O desde Dashboard:**

1. Ir a [Vercel](https://vercel.com)
2. Import Git Repository
3. Seleccionar repo
4. Framework: Vite
5. Root Directory: `frontend`
6. Deploy

### 3.3 Variables de Entorno

```env
# En Vercel Dashboard → Settings → Environment Variables
VITE_API_URL=https://laviejaestacion-production.up.railway.app/api
```

**URL generada:** `https://laviejaestacion.vercel.app`

---

## 🔗 Paso 4: Configurar Dominio Personalizado (Opcional)

### 4.1 Comprar Dominio

- Namecheap
- GoDaddy
- Google Domains

Ejemplo: `laviejaestacion.com`

### 4.2 Configurar DNS

**En Vercel (Frontend):**
```
A Record:
  @ → 76.76.21.21

CNAME:
  www → cname.vercel-dns.com
```

**En Railway (Backend):**
```
CNAME:
  api → laviejaestacion-production.up.railway.app
```

**URLs finales:**
- Frontend: `https://laviejaestacion.com`
- Backend: `https://api.laviejaestacion.com`

---

## 📱 Paso 5: Regenerar Códigos QR

### 5.1 Actualizar URL

```bash
# En local
cd backend

# Editar scripts/generarQR.js
const config = {
  menuUrl: 'https://laviejaestacion.com/menu-digital'
};
```

### 5.2 Generar QR de Producción

```bash
node scripts/generarQR.js
```

### 5.3 Verificar QR

```bash
# Los QR están en:
backend/public/qr/menu-qr.png
backend/public/qr/menu-qr-completo.png
backend/public/qr/menu-qr.svg
```

---

## 🖨️ Paso 6: Imprimir y Colocar QR

### 6.1 Preparar para Impresión

**Especificaciones:**
- Formato: PNG o SVG
- Tamaño: Mínimo 5x5 cm
- Resolución: 300 DPI
- Papel: Resistente o laminado

### 6.2 Diseño de Mesa

Opciones:

**A) Porta-QR Acrílico**
```
┌────────────────────┐
│   🍴 MENÚ DIGITAL  │
│                    │
│   [QR CODE]        │
│                    │
│ Escaneá para ver   │
│ nuestro menú       │
└────────────────────┘
```

**B) Tarjeta de Mesa**
```
┌────────────────────┐
│ La Vieja Estación  │
│                    │
│    [QR CODE]       │
│                    │
│ 📱 Menú Digital    │
│ Mesa N° [__]       │
└────────────────────┘
```

### 6.3 Distribución

1. Imprimir QR para cada mesa
2. Laminar o proteger
3. Colocar en soporte visible
4. Agregar instrucciones simples

---

## ✅ Paso 7: Verificación Post-Despliegue

### 7.1 Tests de Endpoints

```bash
# Test API de producción
curl https://api.laviejaestacion.com/menu

# Esperado: 200 OK + JSON con menú
```

### 7.2 Test Frontend

```bash
# Abrir en navegador
https://laviejaestacion.com/menu-digital

# Verificar:
- ✅ Carga correctamente
- ✅ Muestra productos
- ✅ Responsive en móvil
- ✅ Sin errores en consola
```

### 7.3 Test QR

1. Escanear QR con smartphone
2. Verificar redirección correcta
3. Verificar carga del menú
4. Probar en diferentes dispositivos

### 7.4 Performance

```bash
# Lighthouse Audit
https://pagespeed.web.dev/

# Objetivo:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
```

---

## 🔒 Paso 8: Seguridad

### 8.1 Rate Limiting

Agregar en `backend/index.js`:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 requests
  message: 'Demasiadas solicitudes, intente más tarde'
});

app.use('/api/menu', limiter);
```

### 8.2 CORS

```javascript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://laviejaestacion.com',
    'https://www.laviejaestacion.com'
  ],
  credentials: true
}));
```

### 8.3 Headers de Seguridad

```javascript
import helmet from 'helmet';

app.use(helmet());
```

---

## 📊 Paso 9: Monitoreo

### 9.1 Logs

**Railway:**
- Dashboard → Deployments → View Logs
- Monitorear errores y accesos

**Vercel:**
- Dashboard → Deployments → Function Logs

### 9.2 Analytics (Opcional)

Agregar Google Analytics:

```html
<!-- En frontend/index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 9.3 Uptime Monitoring

Usar servicios gratuitos:
- [UptimeRobot](https://uptimerobot.com)
- [Pingdom](https://www.pingdom.com)

Configurar alertas para:
- `https://api.laviejaestacion.com/menu`
- `https://laviejaestacion.com/menu-digital`

---

## 🔄 Paso 10: CI/CD

### 10.1 GitHub Actions

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
  
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## 📝 Checklist Final de Producción

### Base de Datos
- [ ] MongoDB Atlas configurado
- [ ] Productos reales insertados
- [ ] Backup configurado
- [ ] Índices optimizados

### Backend
- [ ] Desplegado en Railway/Render
- [ ] Variables de entorno configuradas
- [ ] CORS configurado
- [ ] Rate limiting activo
- [ ] Logs monitoreados

### Frontend
- [ ] Desplegado en Vercel/Netlify
- [ ] API URL de producción configurada
- [ ] Build optimizado
- [ ] Performance > 90
- [ ] PWA configurado (opcional)

### QR Codes
- [ ] Generados con URL de producción
- [ ] Impresos en alta calidad
- [ ] Laminados/protegidos
- [ ] Colocados en mesas
- [ ] Probados con smartphones

### Seguridad
- [ ] HTTPS habilitado
- [ ] Headers de seguridad
- [ ] Rate limiting
- [ ] CORS restrictivo
- [ ] Secretos en variables de entorno

### Monitoreo
- [ ] Uptime monitoring activo
- [ ] Logs centralizados
- [ ] Analytics configurado
- [ ] Alertas configuradas

---

## 🚨 Troubleshooting Producción

### Error: CORS Policy

**Solución:**
```javascript
// backend/index.js
app.use(cors({
  origin: ['https://laviejaestacion.com'],
  credentials: true
}));
```

### Error: Cannot connect to MongoDB

**Solución:**
- Verificar IP whitelist en Atlas
- Verificar credenciales
- Verificar connection string

### QR no redirige correctamente

**Solución:**
- Regenerar QR con URL correcta
- Verificar que frontend esté desplegado
- Probar URL manualmente

### Menú tarda en cargar

**Solución:**
- Optimizar consultas de BD
- Agregar índices en MongoDB
- Implementar caché (Redis)

---

## 📈 Optimizaciones Post-Lanzamiento

### Performance
1. Implementar CDN (Cloudflare)
2. Comprimir imágenes
3. Lazy loading de productos
4. Service Worker para offline

### Funcionalidad
1. Búsqueda de productos
2. Filtros por categoría
3. Carrito de pedidos (HU2)
4. Notificaciones push

---

## 💰 Costos Estimados

| Servicio | Plan | Costo/Mes |
|----------|------|-----------|
| MongoDB Atlas | M0 (Free) | $0 |
| Railway | Hobby | $5 |
| Vercel | Hobby | $0 |
| Dominio | .com | $12/año |
| **Total** | | **~$6/mes** |

---

## 📞 Soporte Post-Despliegue

### Documentación
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)

### Comunidad
- GitHub Issues del proyecto
- Stack Overflow
- Discord de Railway/Vercel

---

## ✅ Resumen de URLs

| Servicio | URL de Producción |
|----------|-------------------|
| Frontend | `https://laviejaestacion.com` |
| Menú Digital | `https://laviejaestacion.com/menu-digital` |
| Backend API | `https://api.laviejaestacion.com` |
| Endpoint Menú | `https://api.laviejaestacion.com/menu` |
| MongoDB Atlas | Dashboard en Atlas |

---

**🎉 ¡DESPLIEGUE COMPLETO!**

El sistema está en producción y listo para ser usado por clientes reales.

---

**Guía de Despliegue - HU1**  
La Vieja Estación RestoBar  
Fecha: 11/11/2025  
Versión: 1.0.0
