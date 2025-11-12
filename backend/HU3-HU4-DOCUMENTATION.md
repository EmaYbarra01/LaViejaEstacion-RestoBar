# 📝 Implementación de Historias de Usuario 3 y 4

## La Vieja Estación - RestoBar | Sistema POS

---

## 📚 Tabla de Contenidos

1. [Introducción](#introducción)
2. [HU3: Registro de Pedidos](#hu3-registro-de-pedidos)
3. [HU4: Envío Automático a Cocina](#hu4-envío-automático-a-cocina)
4. [Arquitectura](#arquitectura)
5. [Modelos de Datos](#modelos-de-datos)
6. [API Endpoints](#api-endpoints)
7. [Comunicación en Tiempo Real](#comunicación-en-tiempo-real)
8. [Flujo Completo](#flujo-completo)
9. [Reglas de Negocio](#reglas-de-negocio)
10. [Pruebas](#pruebas)
11. [Instalación](#instalación)

---

## 🎯 Introducción

Este documento detalla la implementación completa de las Historias de Usuario 3 y 4 del sistema POS de La Vieja Estación RestoBar.

### Historia de Usuario 3 (HU3)
> **Como mozo**, quiero poder registrar el pedido del cliente desde mi aplicación, para enviar la orden de manera rápida y precisa sin anotar en papel.

### Historia de Usuario 4 (HU4)
> **Como mozo**, quiero que el pedido que registro se envíe automáticamente a la pantalla de cocina, para que los cocineros comiencen a prepararlo sin demoras ni confusiones.

---

## 📋 HU3: Registro de Pedidos

### Criterios de Aceptación ✅

1. ✅ El mozo puede seleccionar productos del menú y agregarlos al pedido
2. ✅ Puede editar o eliminar ítems antes de enviar
3. ✅ El pedido muestra número de mesa y nombre del mozo
4. ✅ Al confirmar, el pedido se envía automáticamente a cocina y caja
5. ✅ El pedido asocia automáticamente la mesa con estado "ocupada"

### Funcionalidades Implementadas

#### 1. **Crear Pedido**
```javascript
POST /api/pedidos
```

**Características:**
- Validación de permisos (solo mozos y admins)
- Validación de disponibilidad de mesa
- Validación de productos disponibles
- Cálculo automático de subtotales y totales
- Generación automática de número de pedido
- Cambio automático de estado de mesa a "Ocupada"
- Envío automático a cocina vía Socket.io

**Ejemplo de Request:**
```json
{
  "mesaId": "507f1f77bcf86cd799439011",
  "productos": [
    {
      "productoId": "507f191e810c19729de860ea",
      "cantidad": 2,
      "observaciones": "Sin cebolla"
    },
    {
      "productoId": "507f191e810c19729de860eb",
      "cantidad": 1,
      "observaciones": "Punto medio"
    }
  ],
  "observacionesGenerales": "Cliente tiene prisa"
}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "mensaje": "Pedido creado exitosamente y enviado a cocina",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "numeroPedido": "PED-20251111-0001",
    "mesa": {
      "_id": "507f1f77bcf86cd799439011",
      "numero": 5,
      "estado": "Ocupada"
    },
    "mozo": {
      "_id": "507f1f77bcf86cd799439012",
      "nombre": "Juan",
      "apellido": "Pérez"
    },
    "productos": [
      {
        "producto": "507f191e810c19729de860ea",
        "nombre": "Pizza Napolitana",
        "cantidad": 2,
        "precioUnitario": 1500,
        "subtotal": 3000,
        "observaciones": "Sin cebolla"
      }
    ],
    "subtotal": 3000,
    "total": 3000,
    "estado": "Pendiente",
    "estadoCocina": "Pendiente",
    "fechaCreacion": "2025-11-11T10:30:00.000Z"
  },
  "meta": {
    "numeroPedido": "PED-20251111-0001",
    "mesa": 5,
    "mozo": "Juan Pérez",
    "subtotal": 3000,
    "cantidadProductos": 2,
    "estadoCocina": "Pendiente",
    "enviadoCocina": true
  }
}
```

#### 2. **Ver Mis Pedidos**
```javascript
GET /api/pedidos/mis-pedidos
GET /api/pedidos/mis-pedidos?estado=Pendiente
GET /api/pedidos/mis-pedidos?fecha=2025-11-11
```

El mozo puede ver todos sus pedidos activos, filtrados por estado o fecha.

#### 3. **Editar Pedido (Solo Pendientes)**
```javascript
PUT /api/pedidos/:id/items
```

Permite modificar los productos de un pedido que aún está en estado "Pendiente" (antes de que cocina comience a prepararlo).

#### 4. **Cancelar Pedido**
```javascript
DELETE /api/pedidos/:id
```

Cancela un pedido en estado "Pendiente" y libera la mesa automáticamente.

---

## 🍳 HU4: Envío Automático a Cocina

### Criterios de Aceptación ✅

1. ✅ El pedido aparece en la lista de pedidos pendientes en cocina
2. ✅ Se muestran los detalles (mesa, hora, productos, cantidad y observaciones)
3. ✅ Los pedidos se ordenan cronológicamente
4. ✅ No hay duplicación de pedidos
5. ✅ El pedido cambia el estado de la mesa a "ocupada"

### Funcionalidades Implementadas

#### 1. **Vista de Cocina**
```javascript
GET /api/pedidos/cocina
GET /api/pedidos/cocina?estadoCocina=Pendiente
```

**Características:**
- Obtiene pedidos ordenados cronológicamente (FIFO)
- Filtra por estado de cocina
- Muestra todos los detalles necesarios
- Actualización en tiempo real vía Socket.io

**Ejemplo de Response:**
```json
{
  "success": true,
  "data": [
    {
      "numeroPedido": "PED-20251111-0001",
      "mesa": {
        "numero": 5,
        "ubicacion": "Terraza"
      },
      "mozo": {
        "nombre": "Juan",
        "apellido": "Pérez"
      },
      "productos": [
        {
          "nombre": "Pizza Napolitana",
          "cantidad": 2,
          "observaciones": "Sin cebolla"
        }
      ],
      "estadoCocina": "Pendiente",
      "fechaCreacion": "2025-11-11T10:30:00.000Z",
      "observacionesGenerales": "Cliente tiene prisa"
    }
  ],
  "total": 5
}
```

#### 2. **Notificación en Tiempo Real**

Cuando se crea un pedido, automáticamente se emite un evento Socket.io:

```javascript
// Evento emitido desde el backend
socket.emit('nuevo-pedido-cocina', {
  pedido: pedidoCompleto,
  mensaje: "Nuevo pedido #PED-20251111-0001 - Mesa 5",
  timestamp: new Date()
});
```

Los clientes de cocina conectados reciben la notificación instantáneamente:

```javascript
// Cliente (Frontend de cocina)
socket.on('nuevo-pedido-cocina', (data) => {
  console.log('Nuevo pedido recibido:', data);
  // Mostrar notificación visual
  mostrarAlerta(data.mensaje);
  // Reproducir sonido
  reproducirSonido();
  // Actualizar lista de pedidos
  agregarPedidoALista(data.pedido);
});
```

---

## 🏗️ Arquitectura

### Stack Tecnológico

**Backend:**
- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.io (WebSockets)
- JWT (Autenticación)

**Frontend:**
- React
- Vite
- Tailwind CSS
- Socket.io Client
- Zustand (State Management)

### Estructura de Carpetas

```
backend/
├── src/
│   ├── models/
│   │   └── pedidoSchema.js                    # Modelo de datos
│   ├── controllers/
│   │   └── pedidos.controllers.HU3-HU4.js     # Lógica de negocio
│   ├── routes/
│   │   └── pedidos.routes.HU3-HU4.js          # Endpoints HTTP
│   ├── config/
│   │   └── socket.config.js                   # Configuración Socket.io
│   └── auth/
│       ├── token-verify.js                    # Middleware JWT
│       └── verificar-rol.js                   # Middleware de roles

frontend/
├── src/
│   ├── api/
│   │   └── pedidos.api.js                     # Cliente HTTP
│   ├── store/
│   │   └── usePedidoStore.js                  # Estado global
│   ├── pages/
│   │   ├── Mozo/
│   │   │   └── RegistroPedido.jsx             # Vista HU3
│   │   └── Cocina/
│   │       └── VistaCocina.jsx                # Vista HU4
│   └── hooks/
│       └── useSocket.js                       # Hook para Socket.io
```

---

## 📊 Modelos de Datos

### Schema de Pedido

```javascript
{
  // Identificación
  numeroPedido: String,           // "PED-20251111-0001"
  
  // Relaciones
  mesa: ObjectId,                 // Referencia a Mesa
  numeroMesa: Number,             // Desnormalizado para performance
  mozo: ObjectId,                 // Referencia a Usuario (Mozo)
  nombreMozo: String,             // Desnormalizado
  
  // Estados
  estado: String,                 // "Pendiente", "En Preparación", "Listo", etc.
  estadoCocina: String,           // "Pendiente", "En Preparación", "Listo"
  estadoCaja: String,             // "Pendiente", "Cobrado"
  
  // Productos
  productos: [
    {
      producto: ObjectId,
      nombre: String,
      cantidad: Number,
      precioUnitario: Number,
      subtotal: Number,
      observaciones: String
    }
  ],
  
  // Cálculos
  subtotal: Number,
  descuento: {
    porcentaje: Number,
    monto: Number,
    motivo: String
  },
  total: Number,
  
  // Pago
  metodoPago: String,             // "Efectivo", "Transferencia", "Pendiente"
  pago: {
    fecha: Date,
    cajero: ObjectId,
    montoPagado: Number,
    cambio: Number
  },
  
  // Trazabilidad
  historialEstados: [
    {
      estado: String,
      fecha: Date,
      usuario: ObjectId,
      observacion: String
    }
  ],
  
  // Observaciones
  observacionesGenerales: String,
  
  // Timestamps
  fechaCreacion: Date,
  fechaListo: Date,
  fechaServido: Date,
  fechaCobrado: Date,
  
  // Otros
  tiempoEstimado: Number,
  cancelado: {
    activo: Boolean,
    motivo: String,
    fecha: Date,
    usuario: ObjectId
  },
  activo: Boolean                 // Soft delete
}
```

### Métodos del Schema

#### Métodos de Instancia

```javascript
// Cambiar estado del pedido
await pedido.cambiarEstado('En Preparación', usuarioId, 'Iniciando cocción');

// Registrar pago
await pedido.registrarPago(cajeroId, 'Efectivo', 1500);
```

#### Métodos Estáticos

```javascript
// Generar número de pedido
const numeroPedido = await Pedido.generarNumeroPedido();
// Retorna: "PED-20251111-0001"

// Obtener pedidos por estado
const pedidosPendientes = await Pedido.obtenerPorEstado('Pendiente');

// Obtener pedidos para cocina
const pedidosCocina = await Pedido.obtenerParaCocina('Pendiente');

// Obtener pedidos para caja
const pedidosCaja = await Pedido.obtenerParaCaja();

// Reporte de ventas
const ventas = await Pedido.reporteVentas({
  fechaInicio: new Date('2025-11-01'),
  fechaFin: new Date('2025-11-30'),
  metodoPago: 'Efectivo'
});

// Estadísticas
const stats = await Pedido.calcularEstadisticas({
  fechaInicio: new Date('2025-11-01'),
  fechaFin: new Date('2025-11-30')
});
```

---

## 🌐 API Endpoints

### Autenticación Requerida

Todos los endpoints requieren un token JWT válido en el header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Endpoints HU3 (Mozo)

#### 1. Crear Pedido
```
POST /api/pedidos
Roles: Mozo, Administrador
```

#### 2. Ver Mis Pedidos
```
GET /api/pedidos/mis-pedidos
Roles: Mozo, Administrador
Query Params:
  - estado: String (opcional)
  - fecha: Date (opcional)
```

#### 3. Editar Pedido
```
PUT /api/pedidos/:id/items
Roles: Mozo (solo su pedido), Administrador
```

#### 4. Cancelar Pedido
```
DELETE /api/pedidos/:id
Roles: Mozo (solo su pedido), Administrador
```

### Endpoints HU4 (Cocina)

#### 1. Ver Pedidos de Cocina
```
GET /api/pedidos/cocina
Roles: Cocina, Administrador
Query Params:
  - estadoCocina: String (opcional)
    Valores: "Pendiente", "En Preparación", "Listo"
```

---

## 🔌 Comunicación en Tiempo Real

### Socket.io - Eventos

#### Eventos del Servidor → Cliente

| Evento | Descripción | Destinatarios |
|--------|-------------|---------------|
| `nuevo-pedido-cocina` | Notifica nuevo pedido | Sala: cocina |
| `pedido-actualizado` | Estado de pedido cambió | Sala: cocina, caja, mozos |
| `pedido-listo` | Pedido terminado | Sala: cocina, mozos, caja |
| `pedido-cancelado` | Pedido cancelado | Sala: cocina, caja |
| `mesa-actualizada` | Estado de mesa cambió | Todos |
| `notificacion-mozo` | Notificación personal | Mozo específico |

#### Eventos del Cliente → Servidor

| Evento | Descripción | Emisor |
|--------|-------------|---------|
| `solicitar-estado-inicial` | Pide estado actual | Cualquiera |
| `actualizar-estado-pedido` | Cambiar estado | Cocina |
| `marcar-pedido-listo` | Pedido terminado | Cocina |
| `cancelar-pedido-cocina` | Cancelar desde cocina | Cocina |
| `actualizar-mesa` | Cambiar estado de mesa | Mozo/Admin |

### Conexión desde el Frontend

```javascript
import { io } from 'socket.io-client';

// Conectar al servidor
const socket = io('http://localhost:3000', {
  auth: {
    usuarioId: usuario.id,
    rol: usuario.rol,
    modulo: 'cocina' // o 'mozo', 'caja', 'admin'
  }
});

// Escuchar eventos (HU4)
socket.on('nuevo-pedido-cocina', (data) => {
  console.log('Nuevo pedido:', data.pedido);
  // Mostrar notificación
  // Actualizar UI
  // Reproducir sonido
});

// Solicitar estado inicial
socket.on('connect', () => {
  socket.emit('solicitar-estado-inicial');
});
```

---

## 🔄 Flujo Completo

### Flujo HU3 + HU4: Crear Pedido

```
┌─────────────┐
│   MOZO      │
│  (Frontend) │
└──────┬──────┘
       │
       │ 1. Selecciona mesa
       │ 2. Agrega productos
       │ 3. Click "Confirmar Pedido"
       │
       ▼
┌─────────────────────────────────────────┐
│  POST /api/pedidos                      │
│  Authorization: Bearer <token>          │
│  {                                      │
│    mesaId: "...",                       │
│    productos: [...],                    │
│    observacionesGenerales: "..."        │
│  }                                      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  BACKEND - Controlador                   │
│  pedidos.controllers.HU3-HU4.js         │
│                                          │
│  1. Verificar JWT (middleware)           │
│  2. Verificar rol (middleware)           │
│  3. Validar datos de entrada             │
│  4. Verificar mesa existe y está libre   │
│  5. Validar productos disponibles        │
│  6. Calcular totales                     │
│  7. Generar número de pedido             │
│  8. Crear pedido en MongoDB              │
│  9. Cambiar mesa a "Ocupada"             │
│  10. Emitir evento Socket.io             │
└──────┬───────────────────────────────────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌─────────────┐  ┌──────────────┐
│   MOZO      │  │   COCINA     │
│  (Response) │  │  (Socket.io) │
└─────────────┘  └──────┬───────┘
                        │
                        ▼
               ┌────────────────────┐
               │ Nuevo Pedido       │
               │ Mesa: 5            │
               │ Mozo: Juan Pérez   │
               │ 2x Pizza Napolitana│
               │ Sin cebolla        │
               └────────────────────┘
                  🔔 Alerta sonora
                  📱 Notificación
```

### Estados del Pedido

```
Pendiente
    │
    │ (Cocina acepta)
    ▼
En Preparación
    │
    │ (Cocina termina)
    ▼
Listo ──────────► (Notificación al Mozo) 🔔
    │
    │ (Mozo entrega)
    ▼
Entregado
    │
    │ (Cliente paga)
    ▼
Cobrado ──────────► (Mesa queda Libre)
```

---

## 📜 Reglas de Negocio

### RN1: Registro de Pedidos
✅ **Solo los usuarios con rol Mozo pueden registrar pedidos**

Implementación:
```javascript
if (mozoRol !== 'Mozo' && mozoRol !== 'Administrador') {
  return res.status(403).json({
    mensaje: 'Solo los mozos pueden crear pedidos (RN1)'
  });
}
```

### RN4: Estados de las Mesas
✅ **Cada mesa puede tener únicamente uno de los siguientes estados: libre, ocupada o reservada**

Implementación:
```javascript
// Al crear pedido
if (mesa.estado === 'Ocupada') {
  return res.status(400).json({
    mensaje: 'La mesa ya está ocupada'
  });
}

// Cambiar automáticamente a Ocupada
mesa.estado = 'Ocupada';
mesa.pedidoActual = nuevoPedido._id;
await mesa.save();
```

### RN5: Roles y Permisos
✅ **Los usuarios solo podrán acceder a las funciones asignadas a su rol**

Implementación mediante middleware:
```javascript
router.post('/', 
  verificarToken,  // Verifica JWT
  verificarRol(['Mozo', 'Administrador']),  // Verifica rol
  crearPedido
);
```

### RN7: Registro de Productos y Menú
✅ **Solo el Administrador o Gerente pueden agregar, modificar o eliminar productos del menú**

Implementación:
```javascript
// Validar que el producto está disponible
if (!producto.disponible) {
  return res.status(400).json({
    mensaje: 'El producto no está disponible'
  });
}
```

---

## 🧪 Pruebas

### Casos de Prueba HU3

#### Caso 1: Crear Pedido Exitosamente
```bash
# Test con curl
curl -X POST http://localhost:3000/api/pedidos \
  -H "Authorization: Bearer TOKEN_MOZO" \
  -H "Content-Type: application/json" \
  -d '{
    "mesaId": "507f1f77bcf86cd799439011",
    "productos": [
      {
        "productoId": "507f191e810c19729de860ea",
        "cantidad": 2,
        "observaciones": "Sin cebolla"
      }
    ]
  }'

# Resultado esperado: 201 Created
```

#### Caso 2: Intentar Crear Pedido sin Ser Mozo
```bash
curl -X POST http://localhost:3000/api/pedidos \
  -H "Authorization: Bearer TOKEN_COCINA" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Resultado esperado: 403 Forbidden
```

#### Caso 3: Mesa Ocupada
```bash
# Primer pedido: OK
# Segundo pedido a la misma mesa: ERROR

# Resultado esperado: 400 Bad Request
# Mensaje: "La mesa ya está ocupada"
```

### Pruebas Automatizadas (Jest)

```javascript
// tests/pedidos.HU3.test.js
describe('HU3: Registro de Pedidos', () => {
  let tokenMozo;
  let mesaId;
  let productoId;

  beforeAll(async () => {
    // Setup: crear mesa, producto, autenticar mozo
  });

  test('Debe permitir crear un pedido con productos válidos', async () => {
    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${tokenMozo}`)
      .send({
        mesaId,
        productos: [
          { productoId, cantidad: 2, observaciones: 'Sin cebolla' }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.numeroPedido).toMatch(/^PED-\d{8}-\d{4}$/);
  });

  test('Debe cambiar el estado de la mesa a Ocupada', async () => {
    await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${tokenMozo}`)
      .send({
        mesaId,
        productos: [{ productoId, cantidad: 1 }]
      });

    const mesaRes = await request(app)
      .get(`/api/mesas/${mesaId}`)
      .set('Authorization', `Bearer ${tokenMozo}`);

    expect(mesaRes.body.data.estado).toBe('Ocupada');
  });

  test('Debe rechazar pedido sin productos', async () => {
    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${tokenMozo}`)
      .send({
        mesaId,
        productos: []
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
```

---

## 💻 Instalación

### Prerrequisitos

- Node.js v18+
- MongoDB v5+
- npm o yarn

### Instalación Backend

```bash
cd backend

# Instalar dependencias
npm install

# Variables de entorno (.env)
cat > .env << EOF
PORT=3000
MONGODB_URI=mongodb://localhost:27017/lavieja_estacion
JWT_SECRET=tu_secreto_super_seguro_aqui
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
EOF

# Iniciar servidor
npm run dev
```

### Instalación Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Variables de entorno (.env)
cat > .env << EOF
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
EOF

# Iniciar aplicación
npm run dev
```

### Inicializar Base de Datos

```bash
cd backend

# Ejecutar script de inicialización
node scripts/initDB.js
```

Este script creará:
- Usuarios de prueba (Mozo, Cocina, Cajero, Admin)
- Mesas
- Productos
- Categorías

### Credenciales de Prueba

```
Mozo:
  usuario: mozo1
  password: mozo123

Cocina:
  usuario: cocina1
  password: cocina123

Administrador:
  usuario: admin
  password: admin123
```

---

## 📱 Uso de la Aplicación

### 1. Login como Mozo

```
URL: http://localhost:5173/login
Usuario: mozo1
Password: mozo123
```

### 2. Crear un Pedido

1. Ir a "Registro de Pedidos"
2. Seleccionar una mesa libre
3. Agregar productos del menú
4. Especificar cantidad y observaciones
5. Click en "Confirmar Pedido"
6. ✅ Pedido creado y enviado a cocina

### 3. Ver en Cocina

```
URL: http://localhost:5173/login
Usuario: cocina1
Password: cocina123
```

1. Ir a "Vista de Cocina"
2. Ver el pedido recién creado
3. Recibir notificación en tiempo real
4. Marcar como "En Preparación"

---

## 📊 Monitoreo y Logs

### Logs del Sistema

Los logs se encuentran en la consola del servidor:

```
[HU3] Iniciando creación de pedido - Mozo ID: 507f...
[HU3] Validando 2 productos...
[HU3] ✓ Producto validado: Pizza Napolitana x2 = $3000
[HU3] Subtotal calculado: $3000
[HU3] Número de pedido generado: PED-20251111-0001
[HU3] ✓ Pedido guardado en BD con ID: 507f...
[HU3] ✓ Mesa 5 marcada como OCUPADA
[HU4] 📡 Enviando pedido a cocina vía Socket.io...
[HU4] ✓ Pedido enviado a cocina automáticamente
[Socket.io] Broadcasting evento: nuevo-pedido-cocina
```

### Monitorear WebSockets

```bash
# Ver usuarios conectados
curl http://localhost:3000/api/socket/status

# Response:
{
  "total": 3,
  "porModulo": {
    "cocina": 1,
    "mozo": 1,
    "caja": 1
  }
}
```

---

## 🐛 Troubleshooting

### Error: "Mesa ya está ocupada"

**Causa:** Intentar crear un pedido en una mesa que ya tiene un pedido activo.

**Solución:** Verificar el estado de la mesa antes de crear el pedido.

```bash
# Verificar estado de mesa
curl http://localhost:3000/api/mesas/507f... \
  -H "Authorization: Bearer TOKEN"
```

### Error: "Producto no disponible"

**Causa:** El producto está marcado como no disponible en el sistema.

**Solución:** 
1. Ir al módulo de administración
2. Marcar el producto como disponible
3. O elegir otro producto

### Socket.io no conecta

**Causa:** CORS o configuración incorrecta.

**Solución:**
```javascript
// Verificar en socket.config.js
cors: {
  origin: 'http://localhost:5173',  // Debe coincidir con frontend
  credentials: true
}
```

---

## 📚 Recursos Adicionales

- [Documentación de MongoDB](https://docs.mongodb.com/)
- [Socket.io Docs](https://socket.io/docs/v4/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)

---

## 👨‍💻 Autor

**Sistema POS - La Vieja Estación RestoBar**
Versión: 2.0
Fecha: 11 de noviembre de 2025

---

## 📄 Licencia

Este proyecto es propiedad de La Vieja Estación RestoBar.
Todos los derechos reservados © 2025
