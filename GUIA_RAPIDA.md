# 🔑 GUÍA RÁPIDA - La Vieja Estación RestoBar

## 🚀 INICIO RÁPIDO

### Iniciar Servidores

**Backend:**
```powershell
cd C:\Users\PATRICIA\Desktop\TFI-RESTOBAR\LaViejaEstacion-RestoBar\backend
node index.js
```

**Frontend:**
```powershell
cd C:\Users\PATRICIA\Desktop\TFI-RESTOBAR\LaViejaEstacion-RestoBar\frontend
npm run dev
```

**MongoDB:**
```powershell
# MongoDB debe estar corriendo en localhost:27017
# Verificar: mongosh
```

---

## 👤 CREDENCIALES DE PRUEBA

| Rol | Email | Password | Descripción |
|-----|-------|----------|-------------|
| **SuperAdministrador** | admin@restobar.com | SA007 | Acceso total al sistema |
| **Gerente** | carlos@restobar.com | GER123 | Gestión de productos y reportes |
| **Mozo 1** | maria@restobar.com | MOZ123 | Registrar y gestionar pedidos |
| **Mozo 2** | mario@restobar.com | MOZ124 | Registrar y gestionar pedidos |
| **Cajero** | miguel@restobar.com | CAJ123 | Procesar pagos |
| **Cocina** | ana@restobar.com | COC123 | Ver y gestionar pedidos |

---

## 🌐 ENDPOINTS PRINCIPALES

### Públicos (sin autenticación)

**Menú Digital:**
```bash
GET http://localhost:4000/api/menu
```

**Productos por Categoría:**
```bash
GET http://localhost:4000/api/productos/menu/categoria/:categoria
# Ejemplo: /api/productos/menu/categoria/Bebidas
```

### Autenticación

**Login:**
```bash
POST http://localhost:4000/api/login
Content-Type: application/json

{
  "email": "maria@restobar.com",
  "password": "MOZ123"
}
```

**Respuesta:**
```json
{
  "mensaje": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "nombre": "María",
    "apellido": "López",
    "rol": "Mozo1"
  }
}
```

### Pedidos (requieren autenticación)

**Crear Pedido:**
```bash
POST http://localhost:4000/api/pedidos
Authorization: Bearer <token>
Content-Type: application/json

{
  "mesa": "ID_MESA",
  "productos": [
    {
      "producto": "ID_PRODUCTO",
      "cantidad": 1,
      "precioUnitario": 5500
    }
  ]
}
```

**Obtener Pedidos:**
```bash
GET http://localhost:4000/api/pedidos
Authorization: Bearer <token>
```

**Pedidos Pendientes (Cocina):**
```bash
GET http://localhost:4000/api/pedidos/cocina/pendientes
Authorization: Bearer <token>
```

**Pedidos para Cobrar (Caja):**
```bash
GET http://localhost:4000/api/pedidos/caja/pendientes
Authorization: Bearer <token>
```

**Cambiar Estado de Pedido:**
```bash
PATCH http://localhost:4000/api/pedidos/:id/estado
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "En preparación"
}
```

### Mesas (requieren autenticación)

**Obtener Todas las Mesas:**
```bash
GET http://localhost:4000/api/mesas
Authorization: Bearer <token>
```

**Mesas Disponibles:**
```bash
GET http://localhost:4000/api/mesas/disponibles
Authorization: Bearer <token>
```

### Productos (algunos requieren autenticación)

**Obtener Productos (protegido):**
```bash
GET http://localhost:4000/api/productos
Authorization: Bearer <token>
```

**Crear Producto (Administrador/Gerente):**
```bash
POST http://localhost:4000/api/productos
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Producto Nuevo",
  "descripcion": "Descripción del producto",
  "categoria": "Comidas",
  "precio": 5000,
  "costo": 2500,
  "disponible": true
}
```

---

## 🗄️ COMANDOS MONGODB

### Verificar Datos

**Contar Productos:**
```bash
mongosh "mongodb://localhost:27017/restobar_db" --eval "db.productos.countDocuments()"
```

**Listar Productos:**
```bash
mongosh "mongodb://localhost:27017/restobar_db" --eval "db.productos.find().pretty()"
```

**Listar Usuarios:**
```bash
mongosh "mongodb://localhost:27017/restobar_db" --eval "db.usuarios.find({}, {nombre:1, email:1, rol:1})"
```

**Listar Mesas:**
```bash
mongosh "mongodb://localhost:27017/restobar_db" --eval "db.mesas.find().pretty()"
```

**Ver Pedidos:**
```bash
mongosh "mongodb://localhost:27017/restobar_db" --eval "db.pedidos.find().pretty()"
```

### Reiniciar Base de Datos

**Ejecutar Script de Inicialización:**
```bash
cd C:\Users\PATRICIA\Desktop\TFI-RESTOBAR\LaViejaEstacion-RestoBar\backend
node scripts/initDB.js
```

Este script:
- Limpia todas las colecciones
- Crea 6 usuarios con contraseñas hasheadas
- Crea 8 mesas
- Inserta 12 productos
- Crea 1 pedido de ejemplo
- Crea 1 compra de ejemplo

---

## 🧪 PRUEBAS CON POWERSHELL

### Login y Obtener Token

```powershell
$response = Invoke-RestMethod -Uri 'http://localhost:4000/api/login' -Method POST -Body (@{email='maria@restobar.com'; password='MOZ123'} | ConvertTo-Json) -ContentType 'application/json'
$token = $response.token
Write-Host "Token: $token"
```

### Crear Pedido

```powershell
$headers = @{
    Authorization = "Bearer $token"
    'Content-Type' = 'application/json'
}

$pedidoBody = @{
    mesa = "ID_MESA"
    productos = @(
        @{
            producto = "ID_PRODUCTO1"
            cantidad = 1
            precioUnitario = 5500
        },
        @{
            producto = "ID_PRODUCTO2"
            cantidad = 2
            precioUnitario = 1500
        }
    )
} | ConvertTo-Json -Depth 5

$pedido = Invoke-RestMethod -Uri 'http://localhost:4000/api/pedidos' -Method POST -Headers $headers -Body $pedidoBody
```

### Obtener Menú

```powershell
$menu = Invoke-RestMethod -Uri 'http://localhost:4000/api/menu'
$menu.menu | Format-Table
```

### Verificar Productos

```powershell
$menu = Invoke-RestMethod -Uri 'http://localhost:4000/api/menu'
$menu.menu.PSObject.Properties | ForEach-Object {
    Write-Host "`n[$($_.Name)]" -ForegroundColor Cyan
    $_.Value | ForEach-Object {
        Write-Host "  • $($_.nombre) - `$$($_.precio)" -ForegroundColor White
    }
}
```

---

## 🔧 TROUBLESHOOTING

### Backend no inicia

**Problema:** Error al iniciar el backend

**Solución 1 - Puerto ocupado:**
```powershell
# Matar proceso en puerto 4000
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
```

**Solución 2 - Verificar MongoDB:**
```powershell
# Verificar que MongoDB esté corriendo
mongosh --eval "db.version()"
```

**Solución 3 - Variables de entorno:**
```powershell
# Verificar que existe backend/.env
Test-Path C:\Users\PATRICIA\Desktop\TFI-RESTOBAR\LaViejaEstacion-RestoBar\backend\.env
```

### Frontend no carga

**Problema:** Página en blanco o error CORS

**Solución 1 - Reiniciar frontend:**
```powershell
cd C:\Users\PATRICIA\Desktop\TFI-RESTOBAR\LaViejaEstacion-RestoBar\frontend
npm run dev
```

**Solución 2 - Limpiar caché:**
```powershell
Remove-Item -Path "node_modules" -Recurse -Force
npm install
```

### Token no funciona

**Problema:** "No hay token en la peticion"

**Solución 1 - Verificar formato del header:**
```powershell
# Debe ser: Authorization: Bearer <token>
# NO: Authorization: <token>
```

**Solución 2 - Obtener nuevo token:**
```powershell
$response = Invoke-RestMethod -Uri 'http://localhost:4000/api/login' -Method POST -Body (@{email='maria@restobar.com'; password='MOZ123'} | ConvertTo-Json) -ContentType 'application/json'
$token = $response.token
```

### Base de datos vacía

**Problema:** No hay productos/usuarios en la BD

**Solución - Ejecutar script de inicialización:**
```powershell
cd C:\Users\PATRICIA\Desktop\TFI-RESTOBAR\LaViejaEstacion-RestoBar\backend
node scripts/initDB.js
```

---

## 📁 ESTRUCTURA DEL PROYECTO

```
LaViejaEstacion-RestoBar/
├── backend/
│   ├── index.js                    # Punto de entrada del servidor
│   ├── .env                        # Variables de entorno
│   ├── package.json
│   ├── scripts/
│   │   └── initDB.js              # Script de inicialización de BD
│   ├── src/
│   │   ├── auth/
│   │   │   ├── token-sign.js      # Generación de JWT
│   │   │   ├── token-verify.js    # Verificación de JWT
│   │   │   └── verificar-rol.js   # Middleware de roles
│   │   ├── config/
│   │   │   ├── socket.config.js   # Configuración Socket.io
│   │   │   └── nodemailer.config.js
│   │   ├── controllers/
│   │   │   ├── pedidos.controllers.js
│   │   │   ├── productos.controllers.js
│   │   │   ├── mesas.controllers.js
│   │   │   └── usuarios.controllers.js
│   │   ├── models/
│   │   │   ├── pedidoSchema.js
│   │   │   ├── productoSchema.js
│   │   │   ├── mesaSchema.js
│   │   │   └── usuarioSchema.js
│   │   └── routes/
│   │       ├── pedidos.routes.js
│   │       ├── productos.routes.js
│   │       ├── mesas.routes.js
│   │       └── usuarios.routes.js
│   └── public/
│       └── images/
│           └── productos/          # Imágenes de productos
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── pages/
│   │   │   └── MenuDigital.jsx    # HU1, HU2
│   │   ├── components/
│   │   │   └── menu/
│   │   │       └── ProductoCard.jsx
│   │   └── store/
│   │       └── menuStore.js       # Zustand store
│   └── package.json
└── REPORTE_PRUEBAS_HU.md          # Este documento
```

---

## 🎯 FLUJO DE TRABAJO RECOMENDADO

### 1. Iniciar Sesión de Desarrollo

```powershell
# Terminal 1 - Backend
cd C:\Users\PATRICIA\Desktop\TFI-RESTOBAR\LaViejaEstacion-RestoBar\backend
node index.js

# Terminal 2 - Frontend
cd C:\Users\PATRICIA\Desktop\TFI-RESTOBAR\LaViejaEstacion-RestoBar\frontend
npm run dev

# Terminal 3 - Comandos y pruebas
cd C:\Users\PATRICIA\Desktop\TFI-RESTOBAR\LaViejaEstacion-RestoBar
```

### 2. Probar HU3 - Registrar Pedido

```powershell
# 1. Login como mozo
$login = Invoke-RestMethod -Uri 'http://localhost:4000/api/login' -Method POST -Body (@{email='maria@restobar.com'; password='MOZ123'} | ConvertTo-Json) -ContentType 'application/json'
$token = $login.token

# 2. Obtener menú para IDs de productos
$menu = Invoke-RestMethod -Uri 'http://localhost:4000/api/menu'

# 3. Crear pedido
$headers = @{Authorization="Bearer $token"; 'Content-Type'='application/json'}
$pedido = @{
    mesa = "MESA_ID"
    productos = @(@{producto="PRODUCTO_ID"; cantidad=1; precioUnitario=5500})
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri 'http://localhost:4000/api/pedidos' -Method POST -Headers $headers -Body $pedido
```

### 3. Probar HU5 - Cocina Ver Pedidos

```powershell
# 1. Login como cocina
$login = Invoke-RestMethod -Uri 'http://localhost:4000/api/login' -Method POST -Body (@{email='ana@restobar.com'; password='COC123'} | ConvertTo-Json) -ContentType 'application/json'
$token = $login.token

# 2. Ver pedidos pendientes
$headers = @{Authorization="Bearer $token"}
Invoke-RestMethod -Uri 'http://localhost:4000/api/pedidos/cocina/pendientes' -Headers $headers
```

---

## 📞 SOPORTE

**Repositorio:** https://github.com/EmaYbarra01/LaViejaEstacion-RestoBar  
**Rama:** dev  
**Base de Datos:** restobar_db  

---

*Última actualización: 12 de Noviembre de 2025*
