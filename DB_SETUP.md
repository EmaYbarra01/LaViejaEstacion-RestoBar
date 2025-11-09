# 🍽️ La Vieja Estación - RestoBar - Backend

Sistema de gestión integral para RestoBar desarrollado con Node.js, Express y MongoDB.

## 📋 Requisitos

- Node.js v18 o superior
- MongoDB v6 o superior
- npm o yarn

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-repositorio>
cd RESTOBAR-Backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto (puedes copiar `.env.example`):

```env
MONGODB_URI=mongodb://localhost:27017/restobar_db
PORT=3000
JWT_SECRET=tu_secret_key_super_segura
NODE_ENV=development
```

### 4. Inicializar la base de datos

```bash
npm run init-db
```

Este script creará:
- ✅ 5 usuarios con diferentes roles
- ✅ 8 mesas
- ✅ 11 productos del menú
- ✅ 1 pedido de ejemplo
- ✅ 1 compra de ejemplo

### 5. Iniciar el servidor

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 📊 Base de Datos

### Colecciones creadas:

1. **usuarios** - Gestión de empleados y roles
2. **mesas** - Control de mesas del establecimiento
3. **productos** - Menú de productos
4. **pedidos** - Comandas y pedidos
5. **compras** - Compras a proveedores

### Usuarios de prueba:

| Email | Rol | Contraseña (hash) |
|-------|-----|------------------|
| admin@restobar.com | Administrador | admin123 |
| carlos@restobar.com | Gerente | admin123 |
| maria@restobar.com | Mozo | admin123 |
| juan@restobar.com | Cajero | admin123 |
| ana@restobar.com | Cocina | admin123 |

**⚠️ IMPORTANTE:** Las contraseñas están hasheadas. Deberás implementar el sistema de autenticación para usarlas.

## 🔧 Comandos útiles

### MongoDB Shell

Conectar a la base de datos:
```bash
mongosh restobar_db
```

Ver todas las colecciones:
```bash
show collections
```

Ver usuarios:
```bash
db.usuarios.find().pretty()
```

Ver productos:
```bash
db.productos.find().pretty()
```

Ver mesas:
```bash
db.mesas.find().pretty()
```

Ver pedidos:
```bash
db.pedidos.find().pretty()
```

## 📁 Estructura del Proyecto

```
RESTOBAR-Backend/
├── src/
│   ├── models/          # Esquemas de MongoDB
│   │   ├── usuarioSchema.js
│   │   ├── mesaSchema.js
│   │   ├── productoSchema.js
│   │   ├── pedidoSchema.js
│   │   └── compraSchema.js
│   ├── controllers/     # Controladores
│   ├── routes/          # Rutas de la API
│   ├── auth/            # Autenticación y autorización
│   └── database/        # Configuración de BD
├── scripts/
│   └── initDB.js        # Script de inicialización
├── .env                 # Variables de entorno
└── index.js             # Punto de entrada
```

## 🔑 Características Implementadas

### Modelos de Datos

#### 1. Usuario (usuarioSchema.js)
- ✅ Gestión de roles (Administrador, Gerente, Mozo, Cajero, Cocina)
- ✅ Autenticación y control de acceso
- ✅ Información de empleados

#### 2. Mesa (mesaSchema.js)
- ✅ Estados: Libre, Ocupada, Reservada
- ✅ Capacidad y ubicación
- ✅ Código QR para menú digital

#### 3. Producto (productoSchema.js)
- ✅ Categorías (Bebidas, Comidas, Postres, etc.)
- ✅ Control de stock
- ✅ Precios y costos
- ✅ Disponibilidad en tiempo real

#### 4. Pedido (pedidoSchema.js)
- ✅ Flujo completo: Pendiente → En preparación → Listo → Servido → Cobrado
- ✅ Descuento automático del 10% en efectivo
- ✅ Historial de estados
- ✅ Asociación con mesa y mozo
- ✅ Cálculo automático de totales

#### 5. Compra (compraSchema.js)
- ✅ Registro de proveedores
- ✅ Control de recepción de mercadería
- ✅ Cálculo automático de IVA
- ✅ Estados de pago

## 🛠️ Reglas de Negocio Implementadas

- **RN2**: Descuento automático del 10% en pagos con efectivo
- **RN3**: Métodos de pago: Efectivo y Transferencia
- **RN4**: Validación de estados de mesas
- **RN5**: Control de permisos por rol

## 📝 Próximos Pasos

1. Implementar autenticación con JWT
2. Crear controladores para cada modelo
3. Desarrollar las rutas de la API REST
4. Implementar middleware de autorización
5. Crear sistema de reportes
6. Desarrollar frontend con React

## 🐛 Solución de Problemas

### MongoDB no se conecta

Verifica que MongoDB esté corriendo:
```bash
mongosh --eval "db.version()"
```

Si no está corriendo, inícialo como servicio de Windows o ejecuta `mongod`.

### Error de módulos

Si ves errores de módulos no encontrados:
```bash
npm install
```

### Reiniciar la base de datos

Para limpiar y reinicializar:
```bash
npm run init-db
```

## 📚 Documentación de Referencia

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Express Documentation](https://expressjs.com/)

## 👥 Contribuidores

Proyecto desarrollado para **Programación 4 - UTN**

---

**Última actualización:** Noviembre 2025
