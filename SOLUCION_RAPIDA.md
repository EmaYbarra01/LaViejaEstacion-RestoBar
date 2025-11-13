# 🚨 SOLUCIÓN RÁPIDA - Interfaz Cocina

## ✅ RESUMEN DE LO IMPLEMENTADO

Se crearon 11 archivos para la funcionalidad de gestión de pedidos de cocina:

### Backend (4 archivos):
1. `backend/src/middlewares/requireRole.middleware.js` - Middleware de roles
2. `backend/src/controllers/cocina.controllers.js` - Controlador con 4 endpoints
3. `backend/src/routes/cocina.routes.js` - Rutas protegidas
4. `backend/index.js` - MODIFICADO (línea 44: `app.use('/api/auth', authRoutes)`)

### Frontend (7 archivos):
1. `frontend/src/api/cocinaAPI.js` - Cliente API
2. `frontend/src/hooks/usePedidosCocina.js` - Hook personalizado
3. `frontend/src/components/cocina/PedidoCard.jsx` - Componente tarjeta
4. `frontend/src/components/cocina/PedidoCard.css` - Estilos
5. `frontend/src/pages/CocinaView.jsx` - Vista principal
6. `frontend/src/pages/CocinaView.css` - Estilos vista
7. `frontend/src/App.jsx` - MODIFICADO (ruta /cocina agregada línea 96-103)

### Archivos de configuración:
- `backend/.env` - Variables de entorno backend
- `frontend/.env` - Variables de entorno frontend

---

## 🔧 PASOS PARA EJECUTAR AHORA MISMO

### 1️⃣ Abrir 3 terminales PowerShell separadas

**Terminal 1 - Backend:**
```powershell
cd C:\Users\PATRICIA\LaViejaEstacion-RestoBar\backend
node index.js
```
Espera hasta ver: `✅ Servidor activo en el puerto 4000`

**Terminal 2 - Frontend:**
```powershell
cd C:\Users\PATRICIA\LaViejaEstacion-RestoBar\frontend
npm run dev
```
Espera hasta ver: `➜  Local:   http://localhost:5173/`

**Terminal 3 - MongoDB (si no está corriendo):**
```powershell
# Si usas MongoDB local
mongod
```

---

### 2️⃣ Verificar que TODO esté corriendo

En una terminal nueva:
```powershell
netstat -ano | Select-String ":4000|:5173|:27017"
```

Deberías ver:
- Puerto 4000 (backend)
- Puerto 5173 (frontend)
- Puerto 27017 (MongoDB)

---

### 3️⃣ Probar el Login

1. Abre navegador en: `http://localhost:5173/login`
2. Credenciales:
   - Email: `ana@restobar.com`
   - Password: `COC123`
3. Click "Ingresar"
4. Deberías ir a: `http://localhost:5173/cocina`

---

## 🐛 SI NO FUNCIONA:

### Problema: Página en blanco
**Solución:**
1. Cierra TODOS los navegadores
2. Mata TODOS los procesos de Node:
```powershell
Get-Process -Name node | Stop-Process -Force
```
3. Reinicia backend y frontend (pasos 1️⃣)

### Problema: ERR_CONNECTION_REFUSED
**Causa:** Backend no está corriendo
**Solución:** Ejecuta Terminal 1 de nuevo

### Problema: 404 Not Found en /api/auth/login
**Causa:** Backend no tiene las rutas registradas correctamente
**Verificar:** 
```powershell
curl http://localhost:4000/api/auth/login -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"test","password":"test"}' -UseBasicParsing
```
Debería devolver error de credenciales, NO 404

### Problema: Login no redirige
**Verificar en DevTools (F12) → Console:**
- Busca: "Rol del usuario:"
- Busca: "Redirigiendo a /cocina"
Si no aparecen, el login falló

---

## 📋 ENDPOINTS DISPONIBLES

### GET /api/cocina/pedidos
Lista pedidos para cocina (requiere token)

### GET /api/cocina/pedidos/:id
Detalle de un pedido

### PATCH /api/cocina/pedidos/:id/estado
Actualizar estado del pedido

### GET /api/cocina/estadisticas
Estadísticas de cocina

---

## 🔑 CREDENCIALES DE PRUEBA

Usuarios en la base de datos `restobar_db`:

| Email | Password | Rol |
|-------|----------|-----|
| ana@restobar.com | COC123 | EncargadoCocina |
| juan@restobar.com | SA007 | SuperAdministrador |
| maria@restobar.com | MOZ123 | Mozo |
| miguel@restobar.com | CAJ123 | Cajero |

---

## ✅ CHECKLIST FINAL

- [ ] MongoDB corriendo (puerto 27017)
- [ ] Backend corriendo (puerto 4000)
- [ ] Frontend corriendo (puerto 5173)
- [ ] Base de datos `restobar_db` con usuarios
- [ ] Usuario EncargadoCocina existe en BD
- [ ] Login funciona
- [ ] Redirección a /cocina funciona
- [ ] Vista de cocina se muestra

---

## 🚀 SI TODO LO ANTERIOR FALLA

Ejecuta este comando para reiniciar TODO desde cero:

```powershell
# Matar todos los procesos Node
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Esperar 2 segundos
Start-Sleep -Seconds 2

# Iniciar backend en segundo plano
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\PATRICIA\LaViejaEstacion-RestoBar\backend; node index.js"

# Esperar 3 segundos
Start-Sleep -Seconds 3

# Iniciar frontend en segundo plano
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\PATRICIA\LaViejaEstacion-RestoBar\frontend; npm run dev"

# Mensaje
Write-Host "✅ Backend y Frontend iniciados en ventanas separadas"
Write-Host "🌐 Abre http://localhost:5173/login en tu navegador"
```

---

## 📞 ÚLTIMA OPCIÓN

Si NADA funciona, el problema puede ser:
1. **MongoDB no está corriendo** → Inicia MongoDB
2. **Puertos ocupados** → Cambia los puertos en .env
3. **Caché del navegador** → Limpia caché (Ctrl+Shift+Del)
4. **Antivirus bloqueando** → Desactiva temporalmente

