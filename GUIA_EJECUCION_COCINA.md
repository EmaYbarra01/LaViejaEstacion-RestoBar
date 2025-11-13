# 🚀 GUÍA DE EJECUCIÓN PASO A PASO
## Implementación Interfaz EncargadoCocina

Esta guía te llevará paso a paso para probar la implementación completa de la interfaz de EncargadoCocina.

---

## 📋 ARCHIVOS CREADOS

### Backend:
✅ `backend/src/middlewares/requireRole.middleware.js` - Middleware de roles
✅ `backend/src/controllers/cocina.controllers.js` - Controlador de cocina
✅ `backend/src/routes/cocina.routes.js` - Rutas API cocina
✅ `backend/index.js` - MODIFICADO (registradas rutas cocina)

### Frontend:
✅ `frontend/src/api/cocinaAPI.js` - Cliente API
✅ `frontend/src/hooks/usePedidosCocina.js` - Hook personalizado
✅ `frontend/src/components/cocina/PedidoCard.jsx` - Componente tarjeta
✅ `frontend/src/components/cocina/PedidoCard.css` - Estilos tarjeta
✅ `frontend/src/pages/CocinaView.jsx` - Vista principal
✅ `frontend/src/pages/CocinaView.css` - Estilos vista

---

## 🔧 PASO 1: Verificar instalación de dependencias

### Backend:
```powershell
cd backend
npm install
```

### Frontend:
```powershell
cd frontend
npm install socket.io-client react-toastify
```

---

## 🗄️ PASO 2: Crear usuario de prueba con rol EncargadoCocina

Opción A - Usar MongoDB Compass o Mongosh:

```javascript
// Conectar a tu base de datos
use laViejaEstacion

// Crear usuario EncargadoCocina
db.usuarios.insertOne({
  nombre: "Juan",
  apellido: "Pérez",
  email: "encargado@cocina.com",
  password: "$2a$10$YOUR_HASHED_PASSWORD_HERE", // Usar bcrypt para hashear
  rol: "EncargadoCocina",
  dni: "12345678",
  activo: true,
  fechaIngreso: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Opción B - Usar endpoint de registro (si está disponible):

```powershell
# Desde PowerShell o usar Postman
$body = @{
    nombre = "Juan"
    apellido = "Pérez"
    email = "encargado@cocina.com"
    password = "cocina123"
    dni = "12345678"
    rol = "EncargadoCocina"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/registro" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

---

## 🚀 PASO 3: Iniciar el backend

```powershell
cd backend
npm run dev
```

Deberías ver:
```
✅ Servidor activo en el puerto 3000
📡 Socket.io: inicializado
🗄️ MongoDB conectado
```

---

## 🎨 PASO 4: Registrar la ruta en el frontend

Edita `frontend/src/App.jsx` o tu archivo de rutas principal y agrega:

```jsx
import CocinaView from './pages/CocinaView';
import ProtectedRoute from './components/ProtectedRoute';

// Dentro de tus rutas:
<Route 
  path="/cocina" 
  element={
    <ProtectedRoute requiredRole="EncargadoCocina">
      <CocinaView />
    </ProtectedRoute>
  } 
/>
```

---

## 🌐 PASO 5: Iniciar el frontend

```powershell
cd frontend
npm run dev
```

Deberías ver:
```
  VITE v6.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🧪 PASO 6: Probar el flujo completo

### 1. Login como EncargadoCocina:

Ir a: `http://localhost:5173/login`

Credenciales:
- Email: `encargado@cocina.com`
- Password: `cocina123` (o la que hayas usado)

### 2. Navegar a la vista de cocina:

Ir a: `http://localhost:5173/cocina`

Deberías ver:
- Header con título "🍳 Cocina - Gestión de Pedidos"
- Barra de estadísticas (si hay pedidos)
- Filtros por estado (Todos, Pendientes, En Preparación, Listos)
- Lista vacía o pedidos existentes

### 3. Crear un pedido de prueba (como Mozo):

**Opción A - Usar Postman:**

POST `http://localhost:3000/api/pedidos`
```json
{
  "mesa": "MONGO_OBJECT_ID_DE_MESA",
  "mozo": "MONGO_OBJECT_ID_DE_MOZO",
  "productos": [
    {
      "producto": "MONGO_OBJECT_ID_DE_PRODUCTO",
      "cantidad": 2,
      "observaciones": "Sin cebolla"
    }
  ],
  "observacionesGenerales": "Pedido de prueba"
}
```

**Opción B - Desde la interfaz web (si tienes rol Mozo):**

1. Logout del EncargadoCocina
2. Login como Mozo
3. Crear un pedido desde la interfaz
4. Logout y login nuevamente como EncargadoCocina

### 4. Verificar actualización en tiempo real:

- El pedido debería aparecer automáticamente en la vista de cocina
- Sin necesidad de refrescar la página
- Con indicador de tiempo transcurrido

### 5. Probar cambios de estado:

#### A. Pedido Pendiente → En Preparación:
- Click en botón "🔥 Comenzar Preparación"
- Verificar que cambia de color
- Verificar notificación toast de éxito

#### B. En Preparación → Listo:
- Click en botón "✅ Marcar Listo"
- Verificar que el pedido se mueve/desaparece según el filtro activo
- Verificar notificación

#### C. Probar filtros:
- Click en "Pendientes" → ver solo pendientes
- Click en "En Preparación" → ver solo en preparación
- Click en "Listos" → ver solo listos
- Click en "Todos" → ver todos menos cancelados/cobrados

### 6. Probar indicadores visuales:

- **Color normal** (verde): Pedido < 15 minutos
- **Color advertencia** (amarillo): Pedido 15-30 minutos
- **Color urgente** (rojo con animación): Pedido > 30 minutos

---

## 🔍 PASO 7: Verificar conexión Socket.IO

Abrir DevTools del navegador (F12) y en la consola deberías ver:

```
[Socket Cocina] Conectado: XXXXXX
[Socket] Nuevo pedido recibido: PED-20251112-0001
[Socket] Pedido actualizado: 64abcd...
```

---

## 📊 PASO 8: Verificar endpoints API

### Listar pedidos de cocina:
```powershell
# Obtener token JWT primero (del login)
$token = "TU_TOKEN_JWT_AQUI"

# Listar todos los pedidos de cocina
Invoke-RestMethod -Uri "http://localhost:3000/api/cocina/pedidos" `
    -Headers @{
        "Authorization"="Bearer $token"
        "Content-Type"="application/json"
    }

# Filtrar por estado
Invoke-RestMethod -Uri "http://localhost:3000/api/cocina/pedidos?estado=Pendiente" `
    -Headers @{
        "Authorization"="Bearer $token"
        "Content-Type"="application/json"
    }
```

### Actualizar estado de un pedido:
```powershell
$pedidoId = "ID_DEL_PEDIDO"
$body = @{
    estado = "En Preparación"
    observacion = "Comenzando preparación"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/cocina/pedidos/$pedidoId/estado" `
    -Method PATCH `
    -Headers @{
        "Authorization"="Bearer $token"
        "Content-Type"="application/json"
    } `
    -Body $body
```

### Obtener estadísticas:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/cocina/estadisticas" `
    -Headers @{
        "Authorization"="Bearer $token"
        "Content-Type"="application/json"
    }
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Backend arranca sin errores
- [ ] Frontend arranca sin errores
- [ ] Usuario EncargadoCocina creado en BD
- [ ] Login exitoso como EncargadoCocina
- [ ] Vista /cocina accesible
- [ ] Pedidos se visualizan correctamente
- [ ] Botón "Comenzar Preparación" funciona
- [ ] Botón "Marcar Listo" funciona
- [ ] Filtros por estado funcionan
- [ ] Actualización en tiempo real (sockets) funciona
- [ ] Indicadores de tiempo se actualizan
- [ ] Colores de urgencia se muestran correctamente
- [ ] Notificaciones toast aparecen
- [ ] Estadísticas se cargan (si hay datos)
- [ ] Responsive funciona en móvil

---

## 🐛 SOLUCIÓN DE PROBLEMAS COMUNES

### Error 401 (No autorizado):
```
Solución: Verificar que el token JWT esté presente en localStorage
Revisar: DevTools → Application → Local Storage → accessToken o token
```

### Error 403 (Acceso denegado):
```
Solución: Verificar que el usuario tenga rol "EncargadoCocina"
Revisar en MongoDB: db.usuarios.findOne({ email: "encargado@cocina.com" })
```

### Socket no conecta:
```
Solución: Verificar que el backend tenga Socket.io configurado
Revisar: backend/src/config/socket.config.js existe e está importado en index.js
```

### Pedidos no aparecen:
```
Solución 1: Verificar que hay pedidos en estado válido (no Cancelado/Cobrado)
Solución 2: Revisar filtro activo en la UI
Solución 3: Verificar endpoint GET /api/cocina/pedidos en Postman
```

### Error al cambiar estado:
```
Solución: Verificar que el pedido no esté en estado final (Cobrado/Cancelado)
Revisar: Consola del navegador y respuesta del servidor
```

### Estilos no se cargan:
```
Solución: Verificar que los archivos CSS existan:
- frontend/src/components/cocina/PedidoCard.css
- frontend/src/pages/CocinaView.css

Reiniciar servidor de desarrollo de Vite
```

---

## 📝 NOTAS FINALES

1. **Configuración de CORS**: Asegúrate de que el backend permite el origen del frontend en `cors()`.

2. **Variables de entorno**: 
   - Backend: `PORT=3000` (default)
   - Frontend: `VITE_API_URL=http://localhost:3000` en `.env`

3. **Base de datos**: 
   - Necesitas tener al menos una mesa, un producto y un mozo creados para probar pedidos.

4. **Sockets**: 
   - El backend debe tener Socket.io configurado.
   - Verificar que `io` esté disponible en `req.app.get('io')`.

5. **Roles válidos**: 
   - EncargadoCocina, Cocina, Administrador pueden acceder a estas rutas.

---

## 🎯 PRÓXIMOS PASOS

Después de verificar que todo funciona:

1. Agregar tests unitarios para controladores
2. Agregar tests e2e con Cypress o Playwright
3. Implementar notificaciones push
4. Agregar filtro por mesa
5. Implementar búsqueda de pedidos
6. Agregar impresión de tickets de cocina
7. Dashboard con métricas avanzadas

---

## 📞 SOPORTE

Si encuentras algún problema:

1. Revisar logs del backend (terminal donde corre `npm run dev`)
2. Revisar consola del navegador (DevTools → Console)
3. Revisar Network tab para ver requests fallidas
4. Verificar que MongoDB esté corriendo

---

¡Todo listo! Ahora puedes ejecutar cada paso en orden y verificar la implementación completa. 🚀
