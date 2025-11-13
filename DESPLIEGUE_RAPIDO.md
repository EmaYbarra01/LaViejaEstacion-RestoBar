# 📋 RESUMEN RÁPIDO - DESPLIEGUE PASO A PASO

## 🎯 EJECUTA ESTOS COMANDOS EN ORDEN:

### 1️⃣ Subir código a GitHub
```powershell
cd "D:\ARCHIVOS DE USUARIO\Desktop\LaViejaEstacion-RestoBar"
git status
git add .
git commit -m "feat: Módulo mozo responsive + configuración deployment"
git push origin dev
```

---

## 2️⃣ BACKEND - Render.com

### A. Crear cuenta y proyecto
1. 🌐 Abre: https://render.com
2. 🔗 "Sign up with GitHub"
3. ➕ "New +" → "Web Service"
4. 📁 Selecciona: `EmaYbarra01/LaViejaEstacion-RestoBar`

### B. Configuración Build
```
Name: restobar-backend
Branch: dev
Root Directory: backend
Build Command: npm install
Start Command: node index.js
Instance Type: Free
```

### C. Variables de Entorno
Clic en "Advanced" → "Add Environment Variable":

```
NODE_ENV = production
PORT = 4000
JWT_SECRET_KEY = miSuperClaveSecreta2024
FRONTEND_URL = https://restobar-laviejaestacion.netlify.app
MONGODB_URI = (obtener de MongoDB Atlas - ver abajo)
```

### D. MongoDB Atlas (Base de Datos)
1. 🌐 Abre: https://www.mongodb.com/cloud/atlas/register
2. ✅ Crear cuenta gratis
3. 🗂️ "Build a Database" → M0 FREE
4. 👤 Database Access → Add Database User:
   - Username: `restobar_admin`
   - Password: `GenerarPassword123` (guárdalo)
5. 🌍 Network Access → Add IP Address → "Allow access from anywhere"
6. 📝 Database → Connect → Drivers → Node.js
7. 📋 Copia la cadena de conexión:
```
mongodb+srv://restobar_admin:<password>@cluster0.xxxxx.mongodb.net/restobar_db?retryWrites=true&w=majority
```
8. ⚠️ Reemplaza `<password>` con tu contraseña real
9. 📌 Pega esta URL en `MONGODB_URI` de Render

### E. Deploy
- 🚀 Clic "Create Web Service"
- ⏳ Espera 5-10 minutos
- ✅ Copia la URL (ej: `https://restobar-backend.onrender.com`)

---

## 3️⃣ FRONTEND - Netlify

### A. Crear cuenta
1. 🌐 Abre: https://app.netlify.com
2. 🔗 "Sign up with GitHub"
3. ➕ "Add new site" → "Import an existing project"
4. 🔗 "Deploy with GitHub"
5. 📁 Selecciona: `EmaYbarra01/LaViejaEstacion-RestoBar`

### B. Configuración Build
```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

### C. Variables de Entorno
ANTES de hacer deploy, en "Site configuration":

```
VITE_API_URL = https://restobar-backend.onrender.com/api
```
*(Usa TU URL de Render del paso 2E)*

### D. Deploy
- 🚀 "Deploy site"
- ⏳ Espera 3-5 minutos
- 🎉 Te dan una URL: `https://random-name-123456.netlify.app`

### E. Personalizar dominio
1. Site settings → Domain management
2. Options → Edit site name
3. Cambia a: `restobar-laviejaestacion`
4. ✅ URL final: `https://restobar-laviejaestacion.netlify.app`

---

## 4️⃣ INICIALIZAR BASE DE DATOS

### Opción A: Desde Render Shell
1. En Render → tu servicio → "Shell"
2. Ejecuta:
```bash
cd scripts
node initDB.js
```

### Opción B: Crear usuario manualmente desde MongoDB Compass
1. Descarga: https://www.mongodb.com/products/compass
2. Conecta con tu URI de Atlas
3. Base de datos: `restobar_db`
4. Colección: `users`
5. Insert Document:
```json
{
  "nombre": "María",
  "apellido": "García",
  "email": "maria@restobar.com",
  "password": "$2a$10$hashed_password_here",
  "dni": "12345678",
  "telefono": "123456789",
  "role": "Mozo",
  "activo": true
}
```

---

## 5️⃣ USAR DESDE EL CELULAR 📱

### En tu smartphone/tablet:
1. 📱 Abre Chrome o Safari
2. 🌐 Escribe: `https://restobar-laviejaestacion.netlify.app`
3. 🔐 Login:
   - Usuario: `maria@restobar.com`
   - Password: (la que configuraste)
4. ✅ ¡Listo! Ya puedes tomar pedidos

### Instalar como App (PWA):
- **Android:** Chrome → ⋮ → "Agregar a pantalla de inicio"
- **iOS:** Safari → 🔗 → "Agregar a inicio"

---

## ✅ VERIFICACIÓN FINAL

- [ ] Backend en Render está ✅ (verde)
- [ ] Frontend en Netlify está publicado
- [ ] Abres la URL en el celular
- [ ] Puedes hacer login
- [ ] Puedes crear un pedido de prueba
- [ ] El pedido se guarda en MongoDB

---

## 🆘 AYUDA RÁPIDA

**Error al hacer login:**
- Verifica que MongoDB Atlas permita tu IP
- Revisa logs en Render → Logs

**Backend lento:**
- Normal en plan Free (30 seg primera carga)
- Considera upgrade a $7/mes para instant-on

**No carga la página:**
- Verifica `VITE_API_URL` en Netlify
- Debe terminar en `/api`

---

## 📞 SIGUIENTE PASO

**AHORA MISMO:**
1. Ejecuta los comandos del paso 1️⃣
2. Sigue paso 2️⃣ (Backend)
3. Sigue paso 3️⃣ (Frontend)
4. Prueba en tu celular 📱

**Tiempo estimado:** 30-45 minutos

¡Éxito! 🚀
