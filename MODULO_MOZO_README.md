# 📱 Módulo del Mozo - Sistema de Comandas Digitales

## La Vieja Estación RestoBar

---

## 🎯 Descripción General

Sistema completo de gestión de pedidos para mozos del restaurant, que permite tomar comandas digitalmente, enviarlas automáticamente a cocina y caja, facilitando todo el flujo operativo del restaurant.

---

## ✨ Características Principales

### 1. **Vista de Pedidos Abiertos** (`Mozo.jsx`)
- ✅ Grid visual de todos los pedidos activos
- ✅ Visualización por mesa con código de colores según estado
- ✅ Información en tiempo real (actualización cada 30 segundos)
- ✅ Filtros por estado: Todos, Pendientes, En Cocina, Listos
- ✅ Búsqueda por mesa, número de pedido o mozo
- ✅ Indicadores visuales de tipo de servicio (Local, Delivery, Retirada)

**Estados de pedido con código de colores:**
- 🟡 **Pendiente** - Amarillo
- 🔵 **En Preparación** - Azul (en cocina)
- 🟢 **Listo** - Verde (para servir)
- 🟣 **Entregado** - Morado

### 2. **Detalle de Pedido** (`PedidoDetalle.jsx`)
- ✅ Vista completa del pedido seleccionado
- ✅ Lista de productos con precios y cantidades
- ✅ Modificar cantidad de productos en tiempo real
- ✅ Eliminar productos del pedido
- ✅ Agregar observaciones especiales a cada producto
- ✅ Ver información del mozo y fecha/hora
- ✅ Cambiar estado del pedido
- ✅ Enviar a cocina
- ✅ Marcar como entregado
- ✅ Imprimir comanda

**Controles disponibles:**
- ➖ **-1** / ➕ **+1** - Ajustar cantidades
- 🖨️ **Imprimir** - Imprimir producto individual
- 🗑️ **Eliminar** - Quitar producto del pedido
- 📄 **Duplicar** - Copiar producto
- ✏️ **Editar** - Modificar observaciones

### 3. **Crear Nuevo Pedido** (`CrearPedidoModal.jsx`)

#### **Paso 1: Seleccionar Mesa**
- ✅ Grid visual de todas las mesas del restaurant
- ✅ Indicador de estado (Libre/Ocupada/Reservada)
- ✅ Información de capacidad y ubicación
- ✅ Validación automática de disponibilidad

#### **Paso 2: Seleccionar Productos**
- ✅ Catálogo completo de productos disponibles
- ✅ Filtros por categoría:
  - 🍕 Comidas
  - 🍺 Bebidas
  - 🍰 Postres
  - Y más...
- ✅ Búsqueda por nombre
- ✅ Visualización de stock disponible
- ✅ Precios actualizados
- ✅ Carrito flotante en tiempo real

#### **Paso 3: Confirmación y Envío**
- ✅ Resumen completo del pedido
- ✅ Cálculo automático de totales
- ✅ Envío simultáneo a:
  - 👨‍🍳 **Cocina** - Para preparación
  - 💰 **Caja** - Para posterior cobro
- ✅ Actualización automática del estado de la mesa a "Ocupada"

---

## 🎨 Diseño de Interfaz

### Colores Principales
- 🔵 **Primario**: `#667eea` (Azul violeta)
- 🟣 **Secundario**: `#764ba2` (Púrpura)
- ⚫ **Header**: `#1e3a8a` (Azul oscuro)
- ⚪ **Fondo**: Degradado de azul violeta a púrpura

### Componentes Visuales
- **Cards de pedido**: Diseño tipo material con sombras
- **Botón FAB**: Botón flotante circular para acción rápida
- **Bottom Navigation**: Navegación inferior estilo móvil
- **Modals**: Pantalla completa responsive

### Responsive Design
- ✅ Adaptado para tablets (768px)
- ✅ Optimizado para móviles (480px)
- ✅ Grid flexible que se ajusta automáticamente
- ✅ Touch-friendly con botones grandes

---

## 🔧 Funcionalidades Técnicas

### Integración con Backend

**Endpoints utilizados:**

```javascript
GET    /api/pedidos              // Obtener todos los pedidos
GET    /api/pedidos/:id          // Obtener pedido específico
POST   /api/pedidos              // Crear nuevo pedido
PUT    /api/pedidos/:id          // Actualizar pedido
PATCH  /api/pedidos/:id/estado   // Cambiar estado
DELETE /api/pedidos/:id          // Cancelar pedido

GET    /api/mesas                // Obtener mesas disponibles
GET    /api/productos            // Obtener catálogo de productos
```

### Estados del Pedido

```
┌─────────────┐
│  Pendiente  │ ← Mozo crea el pedido
└──────┬──────┘
       │
       ↓
┌─────────────────┐
│ En Preparación  │ ← Cocina recibe y comienza
└────────┬────────┘
         │
         ↓
    ┌────────┐
    │  Listo │ ← Cocina termina preparación
    └────┬───┘
         │
         ↓
   ┌───────────┐
   │ Entregado │ ← Mozo sirve al cliente
   └─────┬─────┘
         │
         ↓
    ┌────────┐
    │ Cobrado│ ← Cajero procesa el pago
    └────────┘
```

### Actualización en Tiempo Real
- **Polling cada 30 segundos** - Actualización automática de pedidos
- **Estado sincronizado** - Cambios reflejados inmediatamente
- **Notificaciones visuales** - Alertas de cambios importantes

---

## 📦 Estructura de Archivos

```
frontend/src/
├── pages/
│   ├── Mozo.jsx                    # Página principal
│   └── Mozo.css                    # Estilos página principal
├── components/mozo/
│   ├── PedidoDetalle.jsx           # Modal detalle pedido
│   ├── PedidoDetalle.css           # Estilos modal detalle
│   ├── CrearPedidoModal.jsx        # Modal crear pedido
│   └── CrearPedidoModal.css        # Estilos modal crear
└── App.jsx                          # Routing configurado
```

---

## 🚀 Cómo Usar el Módulo

### Para Mozos:

#### 1. **Ver Pedidos Activos**
```
1. Acceder a /mozo en el navegador
2. Ver todos los pedidos abiertos en el grid
3. Usar filtros para encontrar pedidos específicos
4. Click en una card para ver detalle completo
```

#### 2. **Crear Nuevo Pedido**
```
1. Click en el botón flotante "+" (esquina inferior derecha)
2. Seleccionar la mesa del cliente
3. Buscar y agregar productos:
   - Usar categorías para filtrar
   - Click en producto para agregarlo
   - Ver carrito flotante con resumen
4. Ajustar cantidades si es necesario
5. Click en "Crear Pedido y Enviar a Cocina"
6. ✅ El pedido se envía automáticamente a cocina y caja
```

#### 3. **Modificar Pedido Existente**
```
1. Click en el pedido a modificar
2. Usar botones -1 / +1 para cambiar cantidades
3. Click en 🗑️ para eliminar productos
4. Click en "Add Item" para agregar más productos
5. Los cambios se guardan automáticamente
```

#### 4. **Marcar Pedido como Entregado**
```
1. Abrir detalle del pedido
2. Verificar que el estado sea "Listo"
3. Click en botón "Entrega" en el footer
4. El estado cambia a "Entregado"
5. El pedido pasa automáticamente a Caja
```

#### 5. **Imprimir Comanda**
```
1. Abrir detalle del pedido
2. Click en botón "Imprimir" 🖨️
3. Se genera la comanda para impresora
```

---

## 🔐 Control de Acceso

**Roles autorizados:**
- ✅ Mozo
- ✅ Mozo1
- ✅ Mozo2
- ✅ Administrador
- ✅ SuperAdministrador

**Restricciones:**
- ❌ Clientes no pueden acceder
- ❌ Cocina tiene su propia vista
- ❌ Cajeros tienen su propia vista

---

## 🎯 Flujo Operativo Completo

### Escenario: Cliente llega al restaurant

```
1. 🚶 CLIENTE LLEGA
   └─ Mozo asigna mesa y abre app

2. 📱 MOZO TOMA PEDIDO
   └─ Selecciona mesa → Agrega productos → Envía pedido
   
3. 👨‍🍳 COCINA RECIBE
   └─ Aparece automáticamente en pantalla de cocina
   └─ Cocina marca "En Preparación"
   
4. ⏳ PREPARACIÓN
   └─ Cocina prepara los platos
   └─ Marca como "Listo"
   
5. 🔔 MOZO NOTIFICADO
   └─ Ve que el pedido está "Listo"
   └─ Retira los platos
   └─ Marca como "Entregado"
   
6. 🍽️ CLIENTE CONSUME
   └─ Mozo entrega al cliente
   
7. 💰 CAJERO COBRA
   └─ Cliente solicita cuenta
   └─ Cajero procesa pago
   └─ Marca como "Cobrado"
   
8. ✅ PEDIDO COMPLETADO
   └─ Mesa queda libre
   └─ Registro en historial
```

---

## 📊 Información Mostrada en Cards

### Card de Pedido
```
┌─────────────────────────────┐
│ 🛵 Delivery          ⋮      │ ← Tipo servicio + Opciones
├─────────────────────────────┤
│                             │
│   Mesa 2                    │ ← Identificador
│                             │
│   R$ 94,59                  │ ← Total a pagar
│                             │
│   25/08 23:06               │ ← Fecha/hora
│                             │
├─────────────────────────────┤
│ 🍽️ Local            ⋮      │ ← Estado del pedido
└─────────────────────────────┘
```

### Detalle de Producto
```
┌─────────────────────────────┐
│ Pizza 8 fatias    R$ 48,90  │
├─────────────────────────────┤
│ Variações:                  │
│ 1 Pizza de calabresa        │
│ 1 Pizza de 4 queijos        │
├─────────────────────────────┤
│ [-1]  1  [+1]  🖨️ 🗑️ 📄 ✏️ │
├─────────────────────────────┤
│ 👤 Gabriel Ricci            │
│           25/08 23:08       │
└─────────────────────────────┘
```

---

## 🛠️ Configuración

### Variables de Entorno

```env
# .env
VITE_API_URL=http://localhost:4000/api
```

### Instalación

```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

### Iniciar Aplicación

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Acceder al Módulo

```
http://localhost:5173/mozo
```

---

## 📱 Navegación Bottom Bar

```
┌─────────┬──────────┬────────────┬──────┐
│ 📋      │ ✓        │ 📁         │ ☰    │
│ Abiertos│ Fechados │ Archivados │ Menu │
└─────────┴──────────┴────────────┴──────┘
```

**Secciones:**
- **Abiertos**: Pedidos en curso (activa)
- **Fechados**: Pedidos finalizados del día
- **Archivados**: Historial completo
- **Menu**: Opciones adicionales

---

## 🎨 Paleta de Colores por Estado

```css
/* Pendiente */
background: #fef3c7;  /* Amarillo claro */
border: #fde68a;

/* En Preparación */
background: #dbeafe;  /* Azul claro */
border: #bfdbfe;

/* Listo */
background: #d1fae5;  /* Verde claro */
border: #a7f3d0;

/* Entregado */
background: #e0e7ff;  /* Morado claro */
border: #c7d2fe;
```

---

## 🔄 Actualizaciones Automáticas

El sistema actualiza automáticamente:
- ✅ **Lista de pedidos** cada 30 segundos
- ✅ **Estados de pedidos** al cambiar cocina
- ✅ **Totales y cálculos** al modificar cantidades
- ✅ **Disponibilidad de mesas** al crear pedidos

---

## 📄 Formato de Datos

### Estructura de Pedido

```javascript
{
  _id: "67123abc...",
  numeroPedido: "PED-20251112-0001",
  mesa: "67123def...",
  numeroMesa: 2,
  mozo: "67123ghi...",
  nombreMozo: "Gabriel Ricci",
  estado: "Pendiente",
  estadoCocina: "Pendiente",
  estadoCaja: "Pendiente",
  productos: [
    {
      producto: "67123jkl...",
      nombre: "Pizza 8 fatias",
      cantidad: 1,
      precioUnitario: 48.90,
      subtotal: 48.90,
      observaciones: "Sin cebolla"
    }
  ],
  subtotal: 48.90,
  descuento: {
    porcentaje: 10,
    monto: 4.89,
    motivo: "Pago en efectivo"
  },
  total: 44.01,
  metodoPago: "Efectivo",
  fechaCreacion: "2025-11-12T23:06:00Z"
}
```

---

## 🚨 Validaciones Implementadas

### Al Crear Pedido:
- ✅ Mesa debe estar disponible (no ocupada)
- ✅ Debe haber al menos un producto
- ✅ Productos deben tener stock disponible
- ✅ Cantidades deben ser mayores a 0
- ✅ Usuario debe estar autenticado como mozo

### Al Modificar Pedido:
- ✅ Solo se puede modificar si está "Pendiente" o "En Preparación"
- ✅ No se puede eliminar el último producto (debe cancelar el pedido completo)
- ✅ Cantidades deben ser válidas

### Al Cambiar Estado:
- ✅ Transiciones de estado deben ser válidas
- ✅ Solo roles autorizados pueden cambiar estados específicos

---

## ⚡ Optimizaciones

- **Lazy Loading** de imágenes de productos
- **Caché** de productos en memoria
- **Debounce** en búsqueda (500ms)
- **Virtualización** de listas largas
- **Optimistic UI** en actualizaciones de cantidad

---

## 🎯 Próximas Mejoras (Opcional)

- [ ] WebSocket para actualizaciones en tiempo real
- [ ] Notificaciones push cuando pedido está listo
- [ ] Historial de pedidos por mozo
- [ ] Estadísticas de ventas por mozo
- [ ] Propinas integradas
- [ ] Modo offline con sincronización
- [ ] Scanner de QR para mesa
- [ ] Firma digital del cliente

---

## 📞 Soporte

Para problemas o consultas sobre el módulo del mozo:
1. Verificar que el backend esté corriendo
2. Verificar autenticación (token válido)
3. Revisar consola del navegador para errores
4. Consultar logs del servidor

---

## ✅ Checklist de Funcionalidades

### Implementado ✅
- [x] Vista grid de pedidos abiertos
- [x] Filtros por estado
- [x] Búsqueda de pedidos
- [x] Detalle completo de pedido
- [x] Modificar cantidades
- [x] Eliminar productos
- [x] Crear nuevo pedido
- [x] Seleccionar mesa
- [x] Seleccionar productos por categoría
- [x] Carrito flotante
- [x] Envío automático a cocina
- [x] Envío automático a caja
- [x] Cambiar estado a "Entregado"
- [x] Imprimir comanda
- [x] Diseño responsive
- [x] Control de acceso por roles
- [x] Actualización automática cada 30s

### Funcionamiento Backend ✅
- [x] Endpoints de pedidos implementados
- [x] Validaciones de negocio
- [x] Cálculo automático de totales
- [x] Historial de cambios de estado
- [x] Middleware de autenticación
- [x] Control de roles

---

**Creado por:** GitHub Copilot  
**Fecha:** 12 de Noviembre de 2025  
**Proyecto:** La Vieja Estación RestoBar  
**Estado:** ✅ Módulo Completo y Funcional
