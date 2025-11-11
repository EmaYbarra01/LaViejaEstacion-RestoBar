# API - Flujo de Pedidos a Caja (HU7 y HU8)

## Descripción General

Implementación de las historias de usuario HU7 y HU8 que gestionan el flujo automático de pedidos desde cocina hacia caja y el proceso de cobro.

## Flujo Completo

```
1. Mozo crea pedido → Estado: "Pendiente"
2. Cocina toma pedido → Estado: "En preparación"
3. Cocina termina → Estado: "Listo" (HU7: automáticamente visible en caja)
4. Mozo sirve (opcional) → Estado: "Servido"
5. Cajero cobra → Estado: "Cobrado" (HU8: genera ticket)
```

## Endpoints Implementados

### HU7: Marcar Pedido como Listo

**Endpoint:** `PUT /api/pedidos/:id/marcar-listo`

**Descripción:** Cuando cocina termina de preparar un pedido, lo marca como "Listo" y automáticamente queda disponible en la vista de caja para cobro.

**Autenticación:** Token JWT requerido

**Roles permitidos:** Cocina, Administrador

**Parámetros de ruta:**
- `id` (string): ID del pedido a marcar como listo

**Body (opcional):**
```json
{
  "observacion": "Pedido completo, empaquetado para llevar"
}
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Pedido marcado como listo y enviado a caja",
  "pedido": {
    "_id": "64abc123...",
    "numeroPedido": 42,
    "estado": "Listo",
    "mesa": {
      "numero": 5,
      "ubicacion": "Salón principal"
    },
    "mozo": {
      "nombre": "Juan",
      "apellido": "Pérez"
    },
    "productos": [
      {
        "nombre": "Milanesa con papas",
        "cantidad": 2,
        "precioUnitario": 3500,
        "subtotal": 7000
      }
    ],
    "subtotal": 7000,
    "total": 7000,
    "fechaListo": "2025-11-11T15:30:00.000Z",
    "historialEstados": [...]
  }
}
```

**Errores:**
- `400`: Solo se pueden marcar como listos los pedidos en preparación
- `404`: Pedido no encontrado
- `401`: No autenticado
- `403`: No tiene permisos (no es Cocina ni Admin)

---

### HU8: Obtener Pedidos Pendientes de Cobro

**Endpoint:** `GET /api/pedidos/caja/pendientes`

**Descripción:** Obtiene todos los pedidos que están listos para cobrar (estados "Listo" o "Servido"). Esta es la vista principal del cajero.

**Autenticación:** Token JWT requerido

**Roles permitidos:** Cajero, Administrador

**Query params:** Ninguno

**Respuesta exitosa (200):**
```json
[
  {
    "_id": "64abc123...",
    "numeroPedido": 42,
    "estado": "Listo",
    "mesa": {
      "numero": 5,
      "ubicacion": "Salón principal"
    },
    "mozo": {
      "nombre": "Juan",
      "apellido": "Pérez"
    },
    "productos": [
      {
        "producto": {
          "nombre": "Milanesa con papas",
          "precio": 3500,
          "categoria": "Platos principales"
        },
        "cantidad": 2,
        "precioUnitario": 3500,
        "subtotal": 7000
      },
      {
        "producto": {
          "nombre": "Coca Cola 1.5L",
          "precio": 1200,
          "categoria": "Bebidas"
        },
        "cantidad": 1,
        "precioUnitario": 1200,
        "subtotal": 1200
      }
    ],
    "subtotal": 8200,
    "total": 8200,
    "metodoPago": "Pendiente",
    "fechaListo": "2025-11-11T15:30:00.000Z",
    "fechaCreacion": "2025-11-11T15:00:00.000Z"
  }
]
```

---

### HU8: Cobrar Pedido

**Endpoint:** `POST /api/pedidos/:id/cobrar`

**Descripción:** Registra el cobro de un pedido. Aplica automáticamente el descuento del 10% si el pago es en efectivo. Genera los datos del ticket/comprobante.

**Autenticación:** Token JWT requerido

**Roles permitidos:** Cajero, Administrador

**Parámetros de ruta:**
- `id` (string): ID del pedido a cobrar

**Body:**
```json
{
  "metodoPago": "Efectivo",
  "montoPagado": 10000
}
```

**Campos:**
- `metodoPago` (string, requerido): "Efectivo" o "Transferencia"
- `montoPagado` (number, requerido): Monto que pagó el cliente

**Respuesta exitosa (200) - Pago en Efectivo (con descuento 10%):**
```json
{
  "mensaje": "Pago registrado exitosamente",
  "pedido": {
    "_id": "64abc123...",
    "numeroPedido": 42,
    "estado": "Cobrado",
    "mesa": {
      "numero": 5,
      "ubicacion": "Salón principal"
    },
    "mozo": {
      "nombre": "Juan",
      "apellido": "Pérez"
    },
    "productos": [...],
    "subtotal": 8200,
    "descuento": {
      "porcentaje": 10,
      "monto": 820,
      "motivo": "Descuento por pago en efectivo"
    },
    "total": 7380,
    "metodoPago": "Efectivo",
    "pago": {
      "fecha": "2025-11-11T16:00:00.000Z",
      "cajero": {
        "nombre": "María",
        "apellido": "González"
      },
      "montoPagado": 10000,
      "cambio": 2620
    },
    "fechaCobrado": "2025-11-11T16:00:00.000Z"
  },
  "ticket": {
    "numeroPedido": 42,
    "fecha": "2025-11-11T16:00:00.000Z",
    "mesa": 5,
    "mozo": "Juan Pérez",
    "cajero": "María González",
    "productos": [
      {
        "nombre": "Milanesa con papas",
        "cantidad": 2,
        "precioUnitario": 3500,
        "subtotal": 7000,
        "observaciones": ""
      },
      {
        "nombre": "Coca Cola 1.5L",
        "cantidad": 1,
        "precioUnitario": 1200,
        "subtotal": 1200,
        "observaciones": ""
      }
    ],
    "subtotal": 8200,
    "descuento": {
      "porcentaje": 10,
      "monto": 820,
      "motivo": "Descuento por pago en efectivo"
    },
    "total": 7380,
    "metodoPago": "Efectivo",
    "montoPagado": 10000,
    "cambio": 2620
  }
}
```

**Respuesta exitosa (200) - Pago por Transferencia (sin descuento):**
```json
{
  "mensaje": "Pago registrado exitosamente",
  "pedido": {
    ...
    "subtotal": 8200,
    "descuento": {
      "porcentaje": 0,
      "monto": 0,
      "motivo": ""
    },
    "total": 8200,
    "metodoPago": "Transferencia",
    "pago": {
      "fecha": "2025-11-11T16:00:00.000Z",
      "cajero": {...},
      "montoPagado": 8200,
      "cambio": 0
    }
  },
  "ticket": {...}
}
```

**Errores:**
- `400`: Método de pago y monto pagado son requeridos
- `400`: Método de pago no válido (solo Efectivo o Transferencia)
- `400`: Solo se pueden cobrar pedidos en estado Listo o Servido
- `400`: Este pedido ya fue cobrado
- `400`: El monto pagado es insuficiente
- `404`: Pedido no encontrado
- `401`: No autenticado
- `403`: No tiene permisos

---

## Reglas de Negocio Implementadas

### RN2: Descuento del 10% en Efectivo

- ✅ Se aplica **automáticamente** cuando `metodoPago === "Efectivo"`
- ✅ Se calcula sobre el **subtotal** de productos
- ✅ Se registra el motivo: "Descuento por pago en efectivo"
- ✅ El total final es: `total = subtotal - descuento.monto`

### RN3: Métodos de Pago Aceptados

- ✅ Solo se aceptan: "Efectivo" o "Transferencia"
- ✅ Cualquier otro método es rechazado con error 400

### Liberación de Mesa

- ✅ Cuando un pedido es cobrado, la mesa se marca automáticamente como "Libre"

---

## Ejemplos de Uso

### Ejemplo 1: Cocina marca pedido listo

```bash
curl -X PUT http://localhost:3000/api/pedidos/64abc123.../marcar-listo \
  -H "Authorization: Bearer TOKEN_COCINA" \
  -H "Content-Type: application/json" \
  -d '{"observacion": "Pedido completo"}'
```

### Ejemplo 2: Cajero consulta pedidos pendientes

```bash
curl -X GET http://localhost:3000/api/pedidos/caja/pendientes \
  -H "Authorization: Bearer TOKEN_CAJERO"
```

### Ejemplo 3: Cajero cobra en efectivo

```bash
curl -X POST http://localhost:3000/api/pedidos/64abc123.../cobrar \
  -H "Authorization: Bearer TOKEN_CAJERO" \
  -H "Content-Type: application/json" \
  -d '{
    "metodoPago": "Efectivo",
    "montoPagado": 10000
  }'
```

### Ejemplo 4: Cajero cobra por transferencia

```bash
curl -X POST http://localhost:3000/api/pedidos/64abc123.../cobrar \
  -H "Authorization: Bearer TOKEN_CAJERO" \
  -H "Content-Type: application/json" \
  -d '{
    "metodoPago": "Transferencia",
    "montoPagado": 8200
  }'
```

---

## Validaciones

### Validaciones de Estado

1. **marcar-listo**: Solo pedidos en "En preparación"
2. **cobrar**: Solo pedidos en "Listo" o "Servido"
3. No se puede cobrar dos veces el mismo pedido

### Validaciones de Monto

1. El monto pagado debe ser >= total a pagar
2. Si es insuficiente, se devuelve error con detalles del total

### Validaciones de Método de Pago

1. Solo "Efectivo" o "Transferencia"
2. Cualquier otro valor es rechazado

---

## Estados del Pedido

| Estado | Descripción | Visible en |
|--------|-------------|------------|
| Pendiente | Recién creado | Cocina |
| En preparación | Cocina trabajando | Cocina |
| **Listo** | **Terminado, listo para cobrar (HU7)** | **Caja** |
| Servido | Entregado al cliente | Caja |
| **Cobrado** | **Pagado (HU8)** | Reportes |
| Cancelado | Anulado | - |

---

## Notas de Implementación

1. **Automatización HU7**: Cuando cocina marca un pedido como "Listo", automáticamente aparece en la vista de caja sin intervención adicional.

2. **Descuento automático**: El descuento del 10% se calcula en el middleware `pre-save` del modelo, garantizando consistencia.

3. **Ticket generado**: El endpoint de cobro devuelve un objeto `ticket` con todos los datos formateados, listo para imprimir o mostrar en pantalla.

4. **Liberación de mesa**: Al cobrar, la mesa se libera automáticamente para nuevos clientes.

5. **Historial de estados**: Cada cambio de estado se registra en `historialEstados` con fecha, usuario y observación.

---

## Testing

### Prueba del flujo completo

```bash
# 1. Crear pedido (Mozo)
curl -X POST http://localhost:3000/api/pedidos ...

# 2. Cambiar a "En preparación" (Cocina)
curl -X PATCH http://localhost:3000/api/pedidos/ID/estado \
  -d '{"estado": "En preparación"}'

# 3. Marcar como listo (Cocina) - HU7
curl -X PUT http://localhost:3000/api/pedidos/ID/marcar-listo

# 4. Ver en caja (Cajero) - HU8
curl -X GET http://localhost:3000/api/pedidos/caja/pendientes

# 5. Cobrar (Cajero) - HU8
curl -X POST http://localhost:3000/api/pedidos/ID/cobrar \
  -d '{"metodoPago": "Efectivo", "montoPagado": 10000}'
```

---

## Integración con Frontend

El frontend debe:

1. **Vista Cocina**: Botón "Marcar Listo" que llama a `/marcar-listo`
2. **Vista Caja**: 
   - Lista de pedidos pendientes (GET `/caja/pendientes`)
   - Formulario de cobro con:
     - Radio buttons: Efectivo / Transferencia
     - Input: Monto pagado
     - Botón "Cobrar"
   - Mostrar ticket después del cobro

Ver componente de ejemplo en: `frontend/src/pages/Caja.jsx`
