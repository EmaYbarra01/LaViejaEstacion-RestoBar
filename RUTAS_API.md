# 📋 RUTAS API - RestoBar Backend

## Resumen de Rutas Implementadas

### 🔐 Autenticación (`/api/auth`)

| Método | Ruta | Descripción | Público | Roles |
|--------|------|-------------|---------|-------|
| POST | `/login` | Iniciar sesión | ✅ | - |
| POST | `/logout` | Cerrar sesión | ❌ | Todos |
| POST | `/registro` | Registrar cliente | ✅ | - |
| GET | `/verify` | Verificar token | ❌ | Todos |
| POST | `/forgot-password` | Solicitar recuperación de contraseña | ✅ | - |
| POST | `/reset-password` | Restablecer contraseña | ✅ | - |
| GET | `/verify-reset-token/:token` | Verificar token de reset | ✅ | - |

---

### 🍔 Productos (`/api/productos`)

| Método | Ruta | Descripción | Público | Roles |
|--------|------|-------------|---------|-------|
| GET | `/productos/menu` | Menú digital (HU1, HU2) | ✅ | - |
| GET | `/productos/menu/categoria/:categoria` | Productos por categoría | ✅ | - |
| GET | `/productos` | Listar productos | ❌ | Todos |
| GET | `/productos/buscar?q=` | Buscar productos | ❌ | Todos |
| GET | `/productos/bajo-stock` | Productos con stock bajo | ❌ | Admin, Gerente |
| GET | `/productos/:id` | Obtener un producto | ❌ | Todos |
| POST | `/productos` | Crear producto (RF4) | ❌ | Admin, Gerente |
| PUT | `/productos/:id` | Actualizar producto | ❌ | Admin, Gerente |
| DELETE | `/productos/:id` | Eliminar producto | ❌ | Admin, Gerente |
| PATCH | `/productos/:id/disponibilidad` | Activar/desactivar (HU10) | ❌ | Admin, Gerente |
| PATCH | `/productos/:id/stock` | Actualizar stock | ❌ | Admin, Gerente |

---

### 📋 Pedidos (`/api/pedidos`)

| Método | Ruta | Descripción | Público | Roles |
|--------|------|-------------|---------|-------|
| GET | `/pedidos` | Listar pedidos | ❌ | Todos |
| GET | `/pedidos/:id` | Obtener un pedido | ❌ | Todos |
| GET | `/pedidos/estado/:estado` | Pedidos por estado | ❌ | Todos |
| GET | `/pedidos/mesa/:mesaId` | Pedidos de una mesa | ❌ | Todos |
| GET | `/pedidos/mozo/:mozoId` | Pedidos de un mozo | ❌ | Todos |
| GET | `/pedidos/cocina/pendientes` | Vista cocina (HU5) | ❌ | Cocina, Admin |
| GET | `/pedidos/caja/pendientes` | Vista caja (HU8) | ❌ | Cajero, Admin |
| POST | `/pedidos` | Crear pedido (HU3, RF1) | ❌ | Mozo, Admin |
| PUT | `/pedidos/:id` | Actualizar pedido | ❌ | Mozo, Admin |
| PATCH | `/pedidos/:id/estado` | Cambiar estado (HU5, HU6) | ❌ | Todos |
| PATCH | `/pedidos/:id/pagar` | Registrar pago (HU8, RF2) | ❌ | Cajero, Admin |
| DELETE | `/pedidos/:id` | Cancelar pedido | ❌ | Mozo, Admin |

---

### 🪑 Mesas (`/api/mesas`)

| Método | Ruta | Descripción | Público | Roles |
|--------|------|-------------|---------|-------|
| GET | `/mesas` | Listar mesas | ❌ | Todos |
| GET | `/mesas/disponibles` | Mesas disponibles | ❌ | Todos |
| GET | `/mesas/estado/:estado` | Mesas por estado | ❌ | Todos |
| GET | `/mesas/ubicacion/:ubicacion` | Mesas por ubicación | ❌ | Todos |
| GET | `/mesas/:id` | Obtener una mesa | ❌ | Todos |
| POST | `/mesas` | Crear mesa | ❌ | Admin, Gerente |
| PUT | `/mesas/:id` | Actualizar mesa | ❌ | Admin, Gerente |
| DELETE | `/mesas/:id` | Eliminar mesa | ❌ | Admin, Gerente |
| PATCH | `/mesas/:id/estado` | Cambiar estado (HU11, RN4, RF3) | ❌ | Mozo, Admin, Gerente |

---

### 🛒 Compras (`/api/compras`)

| Método | Ruta | Descripción | Público | Roles |
|--------|------|-------------|---------|-------|
| GET | `/compras` | Listar compras | ❌ | Admin, Gerente |
| GET | `/compras/pendientes-pago` | Compras pendientes de pago | ❌ | Admin, Gerente |
| GET | `/compras/proveedor/:proveedor` | Compras por proveedor | ❌ | Admin, Gerente |
| GET | `/compras/:id` | Obtener una compra | ❌ | Admin, Gerente |
| POST | `/compras` | Registrar compra (HU13, RF5) | ❌ | Admin, Gerente |
| PUT | `/compras/:id` | Actualizar compra | ❌ | Admin, Gerente |
| DELETE | `/compras/:id` | Eliminar compra | ❌ | Admin, Gerente |
| PATCH | `/compras/:id/estado` | Cambiar estado | ❌ | Admin, Gerente |
| PATCH | `/compras/:id/recepcion` | Registrar recepción | ❌ | Admin, Gerente |
| PATCH | `/compras/:id/pago` | Registrar pago | ❌ | Admin, Gerente |

---

### 👥 Usuarios (`/api/usuarios`)

| Método | Ruta | Descripción | Público | Roles |
|--------|------|-------------|---------|-------|
| GET | `/usuarios` | Listar usuarios | ❌ | Admin, Gerente |
| GET | `/usuarios/rol/:rol` | Usuarios por rol | ❌ | Admin, Gerente |
| GET | `/usuarios/perfil` | Obtener perfil propio | ❌ | Todos |
| GET | `/usuarios/:id` | Obtener un usuario | ❌ | Todos |
| POST | `/usuarios` | Crear usuario (HU12) | ❌ | Admin, Gerente |
| PUT | `/usuarios/:id` | Actualizar usuario (HU12) | ❌ | Admin, Gerente |
| DELETE | `/usuarios/:id` | Eliminar usuario | ❌ | Admin |
| PATCH | `/usuarios/:id/estado` | Activar/desactivar (HU12) | ❌ | Admin, Gerente |
| PATCH | `/usuarios/:id/password` | Cambiar contraseña | ❌ | Propietario, Admin |

---

### 💰 Cierre de Caja (`/api/cierres-caja`)

| Método | Ruta | Descripción | Público | Roles |
|--------|------|-------------|---------|-------|
| GET | `/cierres-caja` | Listar cierres | ❌ | Cajero, Admin, Gerente |
| GET | `/cierres-caja/activo` | Obtener cierre activo | ❌ | Cajero, Admin, Gerente |
| GET | `/cierres-caja/fecha` | Cierres por fecha | ❌ | Cajero, Admin, Gerente |
| GET | `/cierres-caja/turno/:turno` | Cierres por turno | ❌ | Cajero, Admin, Gerente |
| GET | `/cierres-caja/:id` | Obtener un cierre | ❌ | Cajero, Admin, Gerente |
| POST | `/cierres-caja` | Realizar cierre (HU14, RN6) | ❌ | Cajero, Admin |
| PUT | `/cierres-caja/:id` | Actualizar cierre | ❌ | Cajero, Admin |
| PATCH | `/cierres-caja/:id/revisar` | Revisar/auditar cierre | ❌ | Admin, Gerente |

---

### 📊 Reportes (`/api/reportes`)

| Método | Ruta | Descripción | Público | Roles |
|--------|------|-------------|---------|-------|
| GET | `/reportes/ventas/fecha` | Reporte ventas por fecha | ❌ | Admin, Gerente |
| GET | `/reportes/ventas/producto` | Ventas por producto | ❌ | Admin, Gerente |
| GET | `/reportes/ventas/mozo` | Ventas por mozo (HU9) | ❌ | Admin, Gerente |
| GET | `/reportes/ventas/metodo-pago` | Ventas por método pago | ❌ | Admin, Gerente |
| GET | `/reportes/ventas/diario` | Reporte diario | ❌ | Admin, Gerente |
| GET | `/reportes/ventas/mensual` | Reporte mensual (HU15, RF7) | ❌ | Admin, Gerente |
| GET | `/reportes/compras` | Reporte de compras (HU13) | ❌ | Admin, Gerente |
| GET | `/reportes/productos/mas-vendidos` | Productos más vendidos | ❌ | Admin, Gerente |
| GET | `/reportes/productos/bajo-stock` | Productos bajo stock | ❌ | Admin, Gerente |
| GET | `/reportes/cierres-caja` | Reporte cierres caja (HU14) | ❌ | Admin, Gerente |
| GET | `/reportes/resumen-diario` | Resumen completo diario | ❌ | Admin, Gerente |

---

## 🎯 Historias de Usuario Implementadas

- ✅ **HU1**: QR para acceder al menú digital
- ✅ **HU2**: Ver productos con fotos, descripción y precio
- ✅ **HU3**: Mozo registra pedidos
- ✅ **HU5**: Cocina ve pedidos pendientes
- ✅ **HU6**: Marcar pedido como "Listo"
- ✅ **HU8**: Cajero cobra y emite ticket
- ✅ **HU9**: Historial de pedidos
- ✅ **HU10**: Activar/desactivar productos
- ✅ **HU11**: Gestión de estados de mesas
- ✅ **HU12**: Gestión de usuarios y roles
- ✅ **HU13**: Registro de compras a proveedores
- ✅ **HU14**: Cierre de caja al finalizar turno
- ✅ **HU15**: Reportes de ventas

## 🔑 Roles del Sistema

- **Administrador**: Acceso completo
- **Gerente**: Acceso a reportes y gestión (excepto eliminar usuarios)
- **Mozo**: Crear y gestionar pedidos, cambiar estado de mesas
- **Cajero**: Cobrar pedidos, realizar cierres de caja
- **Cocina**: Ver y actualizar estado de pedidos

## 📝 Notas Importantes

1. Todas las rutas protegidas requieren token JWT válido en header `Authorization: Bearer <token>`
2. Los roles se verifican con el middleware `verificarRol(['rol1', 'rol2'])`
3. El descuento del 10% en efectivo se aplica automáticamente (RN2)
4. Los estados de mesa se validan según RN4
5. Las rutas públicas son accesibles para el menú digital QR

---

**Fecha de creación:** 4 de noviembre de 2025  
**Proyecto:** La Vieja Estación - RestoBar  
**Branch:** dev
