# 🎯 CHECKLIST DE DESPLIEGUE - Márquelos cuando los completes

## ANTES DE EMPEZAR
- [ ] Tienes cuenta de GitHub activa
- [ ] Tu código está en GitHub
- [ ] Tienes acceso a PowerShell/Terminal

---

## PASO 1: SUBIR CÓDIGO 📤
```powershell
cd "D:\ARCHIVOS DE USUARIO\Desktop\LaViejaEstacion-RestoBar"
git add .
git commit -m "feat: Deploy configuration"
git push origin dev
```
- [ ] ✅ Código subido a GitHub

---

## PASO 2: CREAR CUENTA MONGODB ATLAS 🗄️

### Ir a: https://www.mongodb.com/cloud/atlas/register

1. - [ ] Cuenta creada en MongoDB Atlas
2. - [ ] Cluster M0 Free creado
3. - [ ] Usuario de base de datos creado
4. - [ ] Network Access configurado (0.0.0.0/0)
5. - [ ] Connection string copiado

**Tu URI (guárdala):**
```
mongodb+srv://username:password@cluster.xxxxx.mongodb.net/restobar_db
```

---

## PASO 3: DESPLEGAR BACKEND EN RENDER 🔧

### Ir a: https://render.com

1. - [ ] Cuenta creada con GitHub
2. - [ ] "New +" → "Web Service"
3. - [ ] Repositorio seleccionado
4. - [ ] Configuración completada:
   - Name: `restobar-backend`
   - Branch: `dev`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node index.js`

5. - [ ] Variables de entorno agregadas:
```
NODE_ENV = production
PORT = 4000
JWT_SECRET_KEY = miClaveSecreta2024
MONGODB_URI = (tu URI de MongoDB Atlas)
FRONTEND_URL = https://tu-app.netlify.app
```

6. - [ ] Deploy exitoso (tarda 5-10 min)
7. - [ ] URL del backend copiada

**Tu Backend URL:**
```
https://restobar-backend-xxxx.onrender.com
```

---

## PASO 4: DESPLEGAR FRONTEND EN NETLIFY 🌐

### Ir a: https://app.netlify.com

1. - [ ] Cuenta creada con GitHub
2. - [ ] "Add new site" → "Import project"
3. - [ ] Repositorio seleccionado
4. - [ ] Configuración build:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

5. - [ ] Variable de entorno agregada:
```
VITE_API_URL = https://tu-backend.onrender.com/api
```
   ⚠️ **IMPORTANTE:** Debe terminar en `/api`

6. - [ ] Deploy exitoso (tarda 3-5 min)
7. - [ ] Site name personalizado
8. - [ ] URL final copiada

**Tu Frontend URL:**
```
https://restobar-laviejaestacion.netlify.app
```

---

## PASO 5: ACTUALIZAR CORS EN BACKEND 🔐

### En Render:
1. - [ ] Ir a tu servicio backend
2. - [ ] Environment → Editar `FRONTEND_URL`
3. - [ ] Poner tu URL de Netlify
4. - [ ] Guardar y re-deploy

---

## PASO 6: INICIALIZAR BASE DE DATOS 📊

### Opción A: Desde Render Shell
1. - [ ] Backend → Shell
2. - [ ] Ejecutar: `cd scripts && node initDB.js`
3. - [ ] Verificar usuarios creados

### Opción B: MongoDB Compass
1. - [ ] Descargar Compass
2. - [ ] Conectar con URI
3. - [ ] Crear colección `users`
4. - [ ] Insertar documento de usuario mozo

---

## PASO 7: PROBAR EN CELULAR 📱

1. - [ ] Abrir navegador en celular
2. - [ ] Ir a: `tu-url.netlify.app`
3. - [ ] Iniciar sesión con:
   - Usuario: `maria@restobar.com`
   - Password: `password123`
4. - [ ] Ver 3 pestañas: Pedidos, Menú, Cuenta
5. - [ ] Crear un pedido de prueba
6. - [ ] Verificar que se guarda en MongoDB

---

## PASO 8: INSTALAR COMO APP (OPCIONAL) 📲

### Android:
1. - [ ] Chrome → ⋮ (menú)
2. - [ ] "Agregar a pantalla de inicio"
3. - [ ] Confirmar nombre
4. - [ ] Ícono aparece en home

### iOS:
1. - [ ] Safari → botón compartir (⬆️)
2. - [ ] "Agregar a pantalla de inicio"
3. - [ ] Confirmar nombre
4. - [ ] Ícono aparece en home

---

## ✅ VERIFICACIÓN FINAL

- [ ] Backend responde: `https://tu-backend.onrender.com/api`
- [ ] Frontend carga: `https://tu-app.netlify.app`
- [ ] Login funciona desde PC
- [ ] Login funciona desde celular
- [ ] Se pueden crear pedidos
- [ ] Pedidos se guardan en MongoDB
- [ ] Socket.io funciona en tiempo real
- [ ] App instalada en pantalla de inicio

---

## 🎉 COMPLETADO

**Fecha de deploy:** _______________

**URLs finales:**
- Frontend: _______________________________________________
- Backend: _______________________________________________

**Credenciales de prueba:**
- Usuario mozo: maria@restobar.com
- Password: _______________

---

## 📞 CONTACTO PARA SOPORTE

Si tienes problemas:
1. Revisa logs en Render → Logs
2. Revisa console del navegador (F12)
3. Verifica variables de entorno
4. Consulta documentación oficial:
   - Render: https://render.com/docs
   - Netlify: https://docs.netlify.com
   - MongoDB Atlas: https://docs.atlas.mongodb.com

---

## 💰 COSTOS MENSUALES

- MongoDB Atlas (M0): **$0** ✅
- Render (Free tier): **$0** ✅
- Netlify (Starter): **$0** ✅

**TOTAL: $0/mes** 🎉

---

## 🚀 MEJORAS FUTURAS

- [ ] Dominio personalizado (.com)
- [ ] SSL certificado automático
- [ ] Backups automáticos
- [ ] CDN global
- [ ] Upgrade a plan pago (sin sleep)

---

**¡Felicitaciones! Tu app está en producción** 🎊
