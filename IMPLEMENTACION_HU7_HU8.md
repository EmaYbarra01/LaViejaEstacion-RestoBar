# Implementación HU7 y HU8 - Flujo de Pedidos a Caja

## 📋 Resumen de Implementación

Se han implementado completamente las historias de usuario HU7 y HU8 para el flujo automático de pedidos desde cocina hacia caja y el proceso de cobro con descuentos automáticos.

## ✅ Historias de Usuario Implementadas

### HU7: Sistema de envío automático de pedidos a caja

**Descripción:** Como sistema, quiero que los pedidos finalizados se envíen automáticamente a la sección de caja, para que el cajero tenga el detalle completo al momento de cobrar.

**Criterios de aceptación implementados:**
- ✅ Al marcar un pedido como "Listo", el sistema lo envía automáticamente a caja
- ✅ El pedido incluye el detalle de productos, precios y número de mesa
- ✅ Caja puede ver el estado "Pendiente de cobro" (estados "Listo" o "Servido")

### HU8: Vista de cajero para cobro de pedidos

**Descripción:** Como cajero, quiero visualizar los pedidos terminados con el detalle de productos y precios, para realizar el cobro y emitir el ticket correspondiente de forma rápida y precisa.

**Criterios de aceptación implementados:**
- ✅ Caja puede ver los pedidos pendientes de cobro
- ✅ Puede marcar un pedido como "Cobrado"
- ✅ Se genera un ticket o comprobante con los datos del pedido
- ✅ Los totales y precios coinciden con los del menú
- ✅ Si el pago es en efectivo, el sistema aplica un descuento del 10%

## 🗂️ Archivos Creados/Modificados

### Backend

1. **`backend/src/controllers/pedidos.controllers.js`**
   - ✅ `marcarPedidoListo()` - HU7: Marca pedido como listo y lo envía a caja
   - ✅ `obtenerPedidosCaja()` - HU8: Obtiene pedidos pendientes de cobro (Listo/Servido)
   - ✅ `cobrarPedido()` - HU8: Registra cobro, aplica descuento, genera ticket

2. **`backend/src/routes/pedidos.routes.js`**
   - ✅ `PUT /api/pedidos/:id/marcar-listo` - Marca pedido listo
   - ✅ `GET /api/pedidos/caja/pendientes` - Lista pedidos para caja
   - ✅ `POST /api/pedidos/:id/cobrar` - Cobra pedido

3. **`backend/FLUJO_CAJA_API.md`**
   - ✅ Documentación completa de API con ejemplos
   - ✅ Reglas de negocio
   - ✅ Casos de uso y testing

### Frontend

4. **`frontend/src/pages/Caja.jsx`**
   - ✅ Vista completa de caja
   - ✅ Lista de pedidos pendientes
   - ✅ Formulario de cobro con métodos de pago
   - ✅ Cálculo automático de descuento (10% efectivo)
   - ✅ Generación y visualización de ticket
   - ✅ Funcionalidad de impresión

5. **`frontend/src/pages/Caja.css`**
   - ✅ Estilos completos para vista de caja
   - ✅ Diseño responsive
   - ✅ Modal de ticket
   - ✅ Estilos de impresión

6. **`frontend/src/pages/Cocina.jsx`**
   - ✅ Vista de cocina mejorada
   - ✅ Botón "Marcar Listo" (HU7)
   - ✅ Indicadores de tiempo de espera
   - ✅ Estados visuales (normal, warning, urgent)

7. **`frontend/src/pages/Cocina.css`**
   - ✅ Estilos completos para vista de cocina
   - ✅ Animaciones y alertas visuales
   - ✅ Diseño responsive

## 🚀 Cómo Probar

### 1. Levantar el Backend

```bash
cd backend
npm install
npm run dev
```

El backend debe estar corriendo en `http://localhost:3000`

### 2. Levantar el Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend debe estar corriendo en `http://localhost:5173`

### 3. Flujo Completo de Prueba

#### Paso 1: Crear un Pedido (como Mozo)

```bash
curl -X POST http://localhost:3000/api/pedidos \
  -H "Authorization: Bearer TOKEN_MOZO" \
  -H "Content-Type: application/json" \
  -d '{
    "mesa": "ID_MESA",
    "mozo": "ID_MOZO",
    "productos": [
      {
        "producto": "ID_PRODUCTO_1",
        "cantidad": 2,
        "observaciones": "Sin cebolla"
      },
      {
        "producto": "ID_PRODUCTO_2",
        "cantidad": 1
      }
    ],
    "observacionesGenerales": "Para llevar"
  }'
```

#### Paso 2: Cocina Comienza a Preparar

```bash
curl -X PATCH http://localhost:3000/api/pedidos/PEDIDO_ID/estado \
  -H "Authorization: Bearer TOKEN_COCINA" \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "En preparación",
    "observacion": "Comenzando preparación"
  }'
```

#### Paso 3: Cocina Marca como Listo (HU7)

```bash
curl -X PUT http://localhost:3000/api/pedidos/PEDIDO_ID/marcar-listo \
  -H "Authorization: Bearer TOKEN_COCINA" \
  -H "Content-Type: application/json" \
  -d '{
    "observacion": "Pedido completo y listo para servir"
  }'
```

**Resultado:** El pedido automáticamente aparece en la vista de caja

#### Paso 4: Cajero Ve Pedidos Pendientes (HU8)

```bash
curl -X GET http://localhost:3000/api/pedidos/caja/pendientes \
  -H "Authorization: Bearer TOKEN_CAJERO"
```

**Resultado:** Lista de pedidos con estado "Listo" o "Servido"

#### Paso 5: Cajero Cobra el Pedido (HU8)

**Opción A: Pago en Efectivo (con descuento 10%)**

```bash
curl -X POST http://localhost:3000/api/pedidos/PEDIDO_ID/cobrar \
  -H "Authorization: Bearer TOKEN_CAJERO" \
  -H "Content-Type: application/json" \
  -d '{
    "metodoPago": "Efectivo",
    "montoPagado": 10000
  }'
```

**Opción B: Pago por Transferencia (sin descuento)**

```bash
curl -X POST http://localhost:3000/api/pedidos/PEDIDO_ID/cobrar \
  -H "Authorization: Bearer TOKEN_CAJERO" \
  -H "Content-Type: application/json" \
  -d '{
    "metodoPago": "Transferencia",
    "montoPagado": 8200
  }'
```

**Resultado:** 
- Pedido marcado como "Cobrado"
- Ticket generado con todos los detalles
- Mesa liberada automáticamente
- Descuento aplicado si es efectivo

### 4. Prueba desde Frontend

#### Vista de Cocina

1. Inicia sesión como usuario con rol "Cocina"
2. Navega a `/cocina`
3. Verás los pedidos pendientes y en preparación
4. Haz clic en "Marcar Listo" para enviar un pedido a caja
5. El pedido desaparecerá de la vista de cocina

#### Vista de Caja

1. Inicia sesión como usuario con rol "Cajero"
2. Navega a `/caja`
3. Verás los pedidos listos para cobrar
4. Selecciona un pedido de la lista
5. Elige el método de pago (Efectivo/Transferencia)
6. Ingresa el monto pagado
7. El sistema calcula automáticamente:
   - Descuento del 10% si es efectivo
   - Total a pagar
   - Cambio a devolver
8. Haz clic en "Cobrar Pedido"
9. Se mostrará el ticket con opción de imprimir

## 🧪 Testing Manual - Casos de Prueba

### Caso 1: Flujo Normal - Pago en Efectivo

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Cocina marca pedido como "Listo" | Pedido estado = "Listo", fechaListo registrada |
| 2 | GET /caja/pendientes | Pedido aparece en lista |
| 3 | POST /cobrar con metodoPago="Efectivo" | Descuento 10% aplicado automáticamente |
| 4 | Verificar respuesta | ticket.descuento.porcentaje = 10 |
| 5 | Verificar estado | Pedido estado = "Cobrado" |
| 6 | Verificar mesa | Mesa estado = "Libre" |

### Caso 2: Flujo Normal - Pago por Transferencia

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Cocina marca pedido como "Listo" | Pedido estado = "Listo" |
| 2 | POST /cobrar con metodoPago="Transferencia" | Sin descuento |
| 3 | Verificar respuesta | ticket.descuento.monto = 0 |
| 4 | Verificar total | total = subtotal (sin descuento) |

### Caso 3: Validación - Monto Insuficiente

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | POST /cobrar con montoPagado < total | Error 400 |
| 2 | Verificar mensaje | "El monto pagado es insuficiente" |
| 3 | Verificar detalles | Incluye totalAPagar, descuentoAplicado |

### Caso 4: Validación - Método de Pago Inválido

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | POST /cobrar con metodoPago="Tarjeta" | Error 400 |
| 2 | Verificar mensaje | "Método de pago no válido" |

### Caso 5: Validación - Pedido Ya Cobrado

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | POST /cobrar en pedido ya cobrado | Error 400 |
| 2 | Verificar mensaje | "Este pedido ya fue cobrado" |

## 📊 Reglas de Negocio Implementadas

### RN2: Descuento del 10% en Efectivo

- ✅ Se aplica automáticamente en el middleware `pre-save` del modelo
- ✅ Solo cuando `metodoPago === "Efectivo"`
- ✅ Se calcula sobre el subtotal
- ✅ Fórmula: `descuento.monto = subtotal * 0.10`
- ✅ Total final: `total = subtotal - descuento.monto`

### RN3: Métodos de Pago Válidos

- ✅ Solo se aceptan: "Efectivo" o "Transferencia"
- ✅ Cualquier otro método retorna error 400

### Liberación Automática de Mesa

- ✅ Al cobrar un pedido, la mesa se marca como "Libre"
- ✅ Permite que nuevos clientes ocupen la mesa

## 🎯 Estados del Pedido

```
Pendiente → En preparación → Listo → [Servido] → Cobrado
                              ↓
                          Vista Caja
```

| Estado | Descripción | Visible en |
|--------|-------------|------------|
| Pendiente | Recién creado | Cocina |
| En preparación | Cocina trabajando | Cocina |
| **Listo** | **Terminado, esperando cobro** | **Caja** |
| Servido | Entregado al cliente | Caja |
| Cobrado | Pagado | Reportes |

## 📝 Notas Importantes

1. **Automatización Total:** No se requiere intervención manual para enviar pedidos a caja. Cuando cocina marca "Listo", automáticamente aparece en la vista del cajero.

2. **Descuento Automático:** El sistema calcula el descuento del 10% automáticamente sin necesidad de que el cajero lo ingrese manualmente.

3. **Ticket Completo:** El endpoint de cobro devuelve un objeto `ticket` con todos los datos formateados, listo para mostrar o imprimir.

4. **Historial Completo:** Cada cambio de estado se registra en `historialEstados` con usuario, fecha y observación.

5. **Validaciones Robustas:** El sistema valida:
   - Estado del pedido antes de cobrar
   - Método de pago válido
   - Monto suficiente
   - Pedido no cobrado previamente

## 🐛 Troubleshooting

### Problema: Pedidos no aparecen en caja

**Solución:** Verificar que el estado del pedido sea "Listo" o "Servido"

```bash
# Verificar estado del pedido
curl -X GET http://localhost:3000/api/pedidos/PEDIDO_ID \
  -H "Authorization: Bearer TOKEN"
```

### Problema: Descuento no se aplica

**Solución:** Verificar que el método de pago sea exactamente "Efectivo" (con mayúscula)

```bash
# Método correcto
{"metodoPago": "Efectivo"}  ✅

# Métodos incorrectos
{"metodoPago": "efectivo"}  ❌
{"metodoPago": "EFECTIVO"}  ❌
```

### Problema: Error 403 al marcar listo

**Solución:** Verificar que el usuario tenga rol "Cocina" o "Administrador"

### Problema: Error 403 al cobrar

**Solución:** Verificar que el usuario tenga rol "Cajero" o "Administrador"

## 📚 Documentación Adicional

- **API Completa:** Ver `backend/FLUJO_CAJA_API.md`
- **Modelo de Datos:** Ver `backend/src/models/pedidoSchema.js`
- **Rutas:** Ver `backend/src/routes/pedidos.routes.js`

## ✨ Mejoras Futuras Sugeridas

1. **WebSockets:** Notificaciones en tiempo real cuando llegan nuevos pedidos a caja
2. **Impresora Térmica:** Integración directa con impresoras de tickets
3. **Historial de Tickets:** Vista para reimprimir tickets anteriores
4. **Reportes de Caja:** Dashboard con totales por método de pago
5. **Propinas:** Campo opcional para registrar propinas en el ticket

---

## 🎉 ¡Implementación Completa!

Las historias de usuario HU7 y HU8 están completamente implementadas y listas para usar. El flujo de pedidos desde cocina a caja es totalmente automático y funcional.
