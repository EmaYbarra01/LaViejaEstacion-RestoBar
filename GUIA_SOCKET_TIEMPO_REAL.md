# Guía de Prueba - Actualizaciones en Tiempo Real

## ✅ Implementación Completada

### Backend
- ✅ Socket.io configurado con sala 'mozos'
- ✅ Eventos emitidos cuando se crea un pedido:
  - `mesa-actualizada`: Notifica cambio de estado de mesa
  - `productos-actualizados`: Notifica descuento de stock
  - `nuevo-pedido-cocina`: Notifica nuevo pedido

### Frontend
- ✅ Hook personalizado `useSocket` creado
- ✅ Componente Mozo conectado a Socket.io
- ✅ Componente CrearPedidoModal conectado a Socket.io
- ✅ Notificaciones visuales implementadas
- ✅ Actualización automática de:
  - Estado de mesas
  - Stock de productos
  - Lista de pedidos

## 🧪 Cómo Probar

### Opción 1: Dos ventanas del navegador
1. Abre `http://localhost:5173/mozo` en dos pestañas diferentes
2. Inicia sesión como Mozo en ambas
3. En la primera ventana, crea un pedido
4. Observa cómo la segunda ventana se actualiza automáticamente:
   - La mesa cambia a "Ocupada"
   - El stock de productos se descuenta
   - Aparece una notificación

### Opción 2: Dos dispositivos
1. En el dispositivo 1: `http://localhost:5173/mozo`
2. En el dispositivo 2: `http://localhost:5173/mozo`
3. Crea un pedido en uno
4. Observa la actualización automática en el otro

### Opción 3: Mozo + Modal abierto
1. Abre el módulo Mozo
2. Haz clic en "Crear Pedido"
3. En otra pestaña, crea otro pedido desde otra sesión
4. El modal debería mostrar el stock actualizado sin recargar

## 📊 Verificar en Consola del Navegador

Abre DevTools (F12) y busca estos logs:
```
✅ Socket conectado: [socket-id]
📡 Uniéndose a la sala: mozos
🔄 Mesa actualizada: { mesaId: ..., estado: 'Ocupada' }
🔄 Productos actualizados: { productos: [...] }
```

## 🔍 Verificar en Backend

En la terminal del backend deberías ver:
```
[Socket.io] ✓ Cliente conectado: [socket-id]
[Socket.io] Usuario se unió a sala: mozos
[Socket.io] Evento 'mesa-actualizada' emitido para mesa X
[Socket.io] Evento 'productos-actualizados' emitido
[Socket.io] Evento 'nuevo-pedido-cocina' emitido para pedido #X
```

## 🎯 Comportamiento Esperado

### Al crear un pedido:
1. **Instantáneamente** (sin recargar):
   - Mesa cambia a "Ocupada" en todas las ventanas abiertas
   - Stock se descuenta en el modal si está abierto
   - Aparece notificación verde: "Nuevo pedido creado"
   - Lista de pedidos se actualiza

2. **Notificaciones visuales**:
   - Aparecen en la esquina superior derecha
   - Duran 3 segundos
   - Se pueden cerrar manualmente

3. **No se requiere**:
   - ❌ Recargar la página
   - ❌ Refrescar manualmente
   - ❌ Cerrar y abrir el modal

## 🐛 Resolución de Problemas

### Las actualizaciones no funcionan:
1. Verifica que el backend esté corriendo
2. Abre la consola del navegador y busca errores
3. Verifica que Socket.io esté conectado (busca "✅ Socket conectado")
4. Prueba refrescando la página

### Socket no se conecta:
1. Verifica que `VITE_API_BASE` en `.env` sea `http://localhost:4000`
2. Verifica CORS en el backend
3. Prueba con otro navegador

### Notificaciones no aparecen:
1. Verifica que el hook `useSocket` esté importado correctamente
2. Busca errores en la consola
3. Verifica que el componente `SocketNotification` esté importado

## 📝 Logs Útiles

```bash
# Ver logs del backend
# La terminal donde corre npm run dev

# Ver estado de stock actual
cd backend
node scripts/verStock.js
```

## ✨ Características Adicionales

- **Reconexión automática**: Si se pierde la conexión, Socket.io intenta reconectar
- **Salas separadas**: Cada módulo (mozo, cocina, caja) tiene su propia sala
- **Broadcast eficiente**: Solo se envía a quienes necesitan la información
- **Feedback visual**: Notificaciones discretas pero visibles
