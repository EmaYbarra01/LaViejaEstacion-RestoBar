# IMPLEMENTACIÓN HU5 y HU6 — Cocina y Notificaciones en Tiempo Real

## Resumen
Este documento describe la implementación y pruebas de las Historias de Usuario:

- HU5: Como cocinero, quiero ver en una pantalla los pedidos pendientes ordenados por hora.
- HU6: Como cocinero, quiero poder marcar un pedido como “Listo” y notificar al mozo.

Se implementó soporte en backend y frontend para mostrar pedidos, cambiar estados y notificaciones en tiempo real usando Socket.io.

---

## Contrato (HU5)
- Ruta principal: GET /api/pedidos/cocina/pendientes
- Roles: Cocina, Administrador
- Respuesta (200): Lista de pedidos ordenados por `fechaCreacion` ascendente. Cada pedido contiene:
  - _id, numeroPedido, mesa { numero }, mozo { nombre, apellido }, productos[], estado, fechaCreacion, observacionesGenerales
- Errores: 401 sin token, 403 sin rol, 500 error servidor

Criterios de aceptación:
- Los pedidos aparecen en orden de llegada (más antiguo primero).
- Estado inicial al crear pedido: `Pendiente`.
- El cocinero puede marcar `En preparación` y `Listo`.
- Los cambios se reflejan en tiempo real al resto de módulos (mozo, caja).

Edge cases:
- Pedidos `Cancelado` o `Cobrado` no se muestran.
- Si Socket.io no está disponible, el frontend usa polling cada 30s como fallback.

---

## Contrato (HU6)
- Acción: PATCH /api/pedidos/:id/estado
- Body: { estado: 'Listo', observacion: '...' }
- Roles: Cocina (o cualquier rol autorizado)
- Resultado: pedido.estado -> 'Listo', historial actualizado, fechaListo registrada
- Eventos Socket.io emitidos:
  - `pedido-listo` a salas: `cocina`, `mozos`, `caja`.
  - `notificacion-mozo` al mozo específico: sala `mozo-<id>`.

Criterios de aceptación:
- Al marcar `Listo`, el pedido desaparece de la lista de cocina (cliente de cocina recibe evento o al refrescar la lista ya no aparece).
- El mozo recibe notificación visual/sonora.
- El estado persiste en la base de datos y se registra en el historial.

---

## Componentes modificados / añadidos
- Backend:
  - `backend/index.js`: Inicializa Socket.io y lo expone en `app.set('io', io)`.
  - `src/controllers/pedidos.controllers.js` (HU3-HU4 controller): Emite `nuevo-pedido-cocina` y `mesa-actualizada` usando `req.app.get('io')`.
  - No se tocaron endpoints HU7/HU8 (evitar cambios en áreas de otros compañeros).

- Frontend:
  - `frontend/src/pages/Cocina.jsx`: Integración `socket.io-client`, escucha `nuevo-pedido-cocina`, `pedido-actualizado`, `pedido-listo`; emite `actualizar-estado-pedido` y `marcar-pedido-listo`. Polling cada 30s como fallback.
  - `frontend/package.json`: `socket.io-client` añadido.

- Scripts de prueba:
  - `scripts/simulate-hu5-hu6.cjs`: servidor Socket.io local + clientes simulados (Cocina y Mozo) para demostrar HU5/HU6 sin necesidad de iniciar todo el backend.

---

## Cómo probar manualmente (demo integrada)
Requisitos: MongoDB local corriendo (o URI en `process.env.MONGODB_URI`), Node.js instalado.

1) Levantar backend (desde `backend/`):

```powershell
cd backend
npm install
npm run dev
```

Deberías ver en logs algo como:
```
✅ Servidor activo en el puerto 4000
📡 Socket.io: inicializado y disponible en app.get("io")
```

2) Levantar frontend (desde `frontend/`):

```powershell
cd frontend
npm install
npm run dev
```

3) Crear un usuario Mozo y un pedido desde el frontend (o usando cURL/Postman):
- Registrar usuario: POST /api/auth/registro (nombre, apellido, email, password, dni). El campo `rol` por defecto es `Mozo`.
- Hacer login en `/api/auth/login` (esto crea cookie `jwt` necesaria para operar como Mozo).
- Crear pedido: POST /api/pedidos con body { mesa, mozo, productos }.

4) Ver en Cocina (frontend):
- Abrir la vista Cocina. Si estás autenticado como `Cocina` u `Administrador`, verás los pedidos en orden de llegada.
- Pulsa `Comenzar` para pasar a `En preparación`.
- Pulsa `Marcar Listo` para marcarlo `Listo`.

Comprobaciones:
- El mozo (si está conectado) recibirá una notificación en tiempo real.
- El pedido desaparecerá de la lista de cocina.

---

## Comandos de verificación rápida (cURL)
Crear usuario (registro):
```bash
curl -X POST http://localhost:4000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","apellido":"Mozo","email":"mozo@test.com","password":"password","dni":"12345678"}'
```

Login (guarda cookie):
```bash
curl -i -c cookies.txt -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mozo@test.com","password":"password"}'
```

Crear pedido (usar cookie guardada):
```bash
curl -b cookies.txt -X POST http://localhost:4000/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{"mesa":"<MESA_ID>","mozo":"<MOZO_ID>","productos":[{"producto":"<PRODUCTO_ID>","cantidad":1}]}'
```

---

## Tests automáticos (sugerencia)
Se recomiendan pruebas de integración con Jest + Supertest para:
- POST /api/pedidos crea pedido y emite `nuevo-pedido-cocina` cuando `app.get('io')` está disponible (mockear `io.emit`).
- PATCH /api/pedidos/:id/estado cambia estados y registra `fechaListo`.

Si querés, puedo crear esos tests ahora.

---

## Notas finales
- Implementé HU5 y HU6 sin tocar la lógica de HU7/HU8.
- Si el backend no tiene a Socket.io inicializado en tu entorno, lo habilité en `backend/index.js` de forma segura usando `initializeSocket`.
- Si querés, hago la demo integrada completa creando la mesa/producto/mozo en la BD automáticamente y generando un pedido de prueba; necesito permiso para ejecutar scripts que puedan insertar datos en la base de datos.

---

Fecha: 2025-11-11
Autor: Equipo La Vieja Estación — Implementación HU5/HU6
