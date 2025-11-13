# 🚀 GUÍA COMPLETA: DESPLEGAR EN NETLIFY Y RENDER

## 📱 Objetivo: Usar la app desde cualquier celular/tablet

---

## PARTE 1: PREPARACIÓN DEL CÓDIGO

### ✅ Ya completado:
- ✓ Archivo `netlify.toml` creado
- ✓ Archivo `.env.production` creado
- ✓ Configuración responsive lista

---

## PARTE 2: SUBIR CÓDIGO A GITHUB

### Paso 1: Confirmar todos los cambios

```powershell
# En la raíz del proyecto
cd "D:\ARCHIVOS DE USUARIO\Desktop\LaViejaEstacion-RestoBar"

# Ver archivos modificados
git status

# Agregar todos los cambios
git add .

# Crear commit
git commit -m "feat: Módulo de mozo con pestañas y diseño responsive para móviles"

# Subir a GitHub
git push origin dev
```

---

## PARTE 3: DESPLEGAR BACKEND EN RENDER

### Paso 1: Crear cuenta en Render
1. Ve a: https://render.com
2. Haz clic en "Get Started"
3. Conecta con tu cuenta de GitHub
4. Autoriza el acceso

### Paso 2: Crear Web Service
1. En Render Dashboard, clic en "New +"
2. Selecciona "Web Service"
3. Conecta tu repositorio: `LaViejaEstacion-RestoBar`
4. Configura así:

```
Name: restobar-backend
Region: Oregon (US West)
Branch: dev
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: node index.js
```

### Paso 3: Configurar Variables de Entorno
En la sección "Environment":

```
NODE_ENV = production
PORT = 4000
MONGODB_URI = tu_conexion_mongodb_atlas
JWT_SECRET_KEY = tu_clave_secreta_jwt
FRONTEND_URL = https://tu-app.netlify.app
```

### Paso 4: Crear Base de Datos MongoDB Atlas
1. Ve a: https://www.mongodb.com/cloud/atlas
2. Crea cuenta gratis
3. Crea un cluster gratuito
4. En "Database Access", crea un usuario
5. En "Network Access", permite acceso desde "0.0.0.0/0"
6. Copia la cadena de conexión
7. Pégala en `MONGODB_URI` de Render

### Paso 5: Desplegar
- Clic en "Create Web Service"
- Espera 5-10 minutos
- Copia la URL generada (ejemplo: `https://restobar-backend.onrender.com`)

---

## PARTE 4: DESPLEGAR FRONTEND EN NETLIFY

### Paso 1: Acceder a Netlify
1. Ve a: https://app.netlify.com
2. Haz clic en "Add new site" → "Import an existing project"
3. Selecciona "Deploy with GitHub"
4. Autoriza Netlify en GitHub
5. Selecciona tu repositorio: `LaViejaEstacion-RestoBar`

### Paso 2: Configurar el Build
```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

### Paso 3: Variables de Entorno
Antes de desplegar, en "Site configuration" → "Environment variables", agrega:

```
VITE_API_URL = https://restobar-backend.onrender.com/api
```
*(Usa la URL de tu backend de Render)*

### Paso 4: Desplegar
- Clic en "Deploy site"
- Espera 2-5 minutos
- Netlify te dará una URL como: `https://random-name-123.netlify.app`

### Paso 5: Personalizar Dominio (Opcional)
1. En Netlify, ve a "Site configuration" → "Domain management"
2. Clic en "Options" → "Edit site name"
3. Cambia a algo como: `restobar-laviejaestacion`
4. Tu URL será: `https://restobar-laviejaestacion.netlify.app`

---

## PARTE 5: USAR DESDE EL CELULAR 📱

### Paso 1: Abrir en el Navegador
1. En tu celular/tablet, abre Chrome o Safari
2. Escribe la URL de Netlify: `https://restobar-laviejaestacion.netlify.app`
3. Verás la página de login

### Paso 2: Iniciar Sesión como Mozo
```
Usuario: maria@restobar.com
Contraseña: (la que hayas configurado)
```

### Paso 3: Usar la App
- ✅ Verás 3 pestañas: Pedidos | Menú | Cuenta
- ✅ Toca el botón + para crear pedidos
- ✅ Selecciona mesa y productos
- ✅ El pedido se envía a cocina en tiempo real

### Paso 4: Instalar como App (Opcional)
#### En Android:
1. En Chrome, toca los 3 puntos (⋮)
2. Selecciona "Agregar a pantalla de inicio"
3. Confirma
4. Ahora tienes un ícono de la app en tu celular

#### En iOS:
1. En Safari, toca el botón de compartir (□↑)
2. Selecciona "Agregar a pantalla de inicio"
3. Confirma
4. Ahora tienes un ícono de la app en tu iPhone

---

## PARTE 6: VERIFICAR QUE TODO FUNCIONA

### Checklist:
- [ ] Backend desplegado en Render (verde ✓)
- [ ] MongoDB Atlas conectado
- [ ] Frontend desplegado en Netlify
- [ ] Variables de entorno configuradas
- [ ] Login funciona desde el celular
- [ ] Se pueden crear pedidos
- [ ] Los pedidos llegan a la base de datos

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Problema: "Error de conexión al backend"
**Solución:**
1. Verifica que `VITE_API_URL` en Netlify tenga `/api` al final
2. Ejemplo correcto: `https://restobar-backend.onrender.com/api`

### Problema: "No puedo hacer login"
**Solución:**
1. Ve a MongoDB Atlas
2. Verifica que el usuario de BD exista
3. En Render, ve a "Logs" para ver errores
4. Ejecuta el script de inicialización de usuarios

### Problema: "El backend tarda en responder"
**Solución:**
- Render pone tu app en "sleep" después de 15 min sin uso
- La primera petición tarda ~30 segundos (gratis)
- Considera un plan pago para eliminar esto

---

## 💰 COSTOS

- **Netlify Frontend:** GRATIS (100 GB/mes)
- **Render Backend:** GRATIS (750 horas/mes, duerme después de 15 min)
- **MongoDB Atlas:** GRATIS (512 MB storage)

**Total: $0 USD/mes** ✅

---

## 🎯 SIGUIENTE PASO

Ejecuta estos comandos para subir todo a GitHub:

\`\`\`powershell
cd "D:\ARCHIVOS DE USUARIO\Desktop\LaViejaEstacion-RestoBar"
git add .
git commit -m "feat: Configuración para despliegue en Netlify y Render"
git push origin dev
\`\`\`

Luego continúa con PARTE 3 de esta guía.
