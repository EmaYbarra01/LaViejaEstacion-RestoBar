# Plan de Tareas Secuenciales - Backend
## Sistema de Gestión Integral — "La Vieja Estación RestoBar"

Basado en el Acta de Constitución del Proyecto y el estado actual del backend.

---

## 📊 ESTADO ACTUAL DEL BACKEND

### ✅ Ya Implementado (Archivos Creados)
- ✅ Modelos (schemas): Usuario, Producto, Pedido, Mesa, CierreCaja, Compra, PasswordReset, Sales
- ✅ Controladores: auth, usuarios, productos, pedidos, mesas, ventas, compras, cierreCaja, reportes
- ✅ Rutas: auth, usuarios, productos, pedidos, mesas, sales, compras, cierreCaja, reportes
- ✅ Helpers: validarProducto, validarUsuario, resultadoValidacion
- ✅ Auth: token-sign, token-verify, verificar-rol
- ✅ Configuración: nodemailer, database connection

### ❌ Pendiente (No Integrado al servidor principal)
- ❌ Las nuevas rutas NO están registradas en `backend/index.js`
- ❌ El servidor sigue usando solo: users.routes, products.routes, sales.routes (antiguas)
- ❌ Falta testing de las nuevas funcionalidades
- ❌ Falta script de inicialización de BD con datos semilla (seed)
- ❌ Falta documentación actualizada de las rutas API
- ❌ Faltan validaciones con express-validator en algunos controladores
- ❌ Falta manejo de errores centralizado (middleware)
- ❌ Falta paginación en listados

---

## 🎯 TAREAS SECUENCIALES PASO A PASO

### **FASE 1: INTEGRACIÓN Y CONFIGURACIÓN BASE** ⚡ (PRIORIDAD ALTA)

#### **Tarea 1: Registrar las nuevas rutas en el servidor principal**
**Archivo:** `backend/index.js`
**Objetivo:** Integrar todos los módulos creados al servidor Express
**Acción:**
1. Importar todas las rutas nuevas (auth, usuarios, productos, pedidos, mesas, compras, cierreCaja, reportes)
2. Registrarlas con `app.use('/api', ...)` 
3. Eliminar las importaciones antiguas (users.routes, products.routes)
4. Probar que el servidor arranque sin errores

**HU relacionadas:** Todas
**Archivos afectados:** `backend/index.js`
**Dependencias:** Ninguna
**Estimación:** 15-20 minutos

---

#### **Tarea 2: Crear archivo .env.example con todas las variables**
**Archivo:** `backend/.env.example`
**Objetivo:** Documentar todas las variables de entorno necesarias
**Acción:**
1. Crear archivo `.env.example` con todas las variables documentadas:
   - PORT
   - MONGODB_URI
   - JWT_SECRET
   - EMAIL_USER, EMAIL_PASS, EMAIL_FROM
   - FRONTEND_URL
2. Verificar que `.env` está en `.gitignore`

**HU relacionadas:** Configuración del sistema
**Archivos afectados:** `backend/.env.example`, `backend/.gitignore`
**Dependencias:** Ninguna
**Estimación:** 10 minutos

---

#### **Tarea 3: Crear script de inicialización de base de datos (seed)**
**Archivo:** `backend/scripts/initDB.js` (ya existe, verificar/completar)
**Objetivo:** Poblar la BD con datos iniciales para pruebas
**Acción:**
1. Verificar el contenido del archivo `backend/scripts/initDB.js`
2. Crear datos semilla para:
   - 1 Usuario Administrador (admin@restobar.com / Admin123!)
   - 2 Mozos (mozo1, mozo2)
   - 1 Cajero
   - 1 Cocinero
   - 10-15 Productos (menú) con categorías (Bebidas, Comidas, Postres)
   - 5-8 Mesas con diferentes capacidades y ubicaciones
   - 1-2 Proveedores
3. Documentar cómo ejecutar el script: `npm run seed` o `node scripts/initDB.js`

**HU relacionadas:** HU1, HU2, HU10, HU12
**Archivos afectados:** `backend/scripts/initDB.js`, `backend/package.json` (agregar script)
**Dependencias:** Tarea 1 (BD conectada)
**Estimación:** 45-60 minutos

---

### **FASE 2: VALIDACIONES Y SEGURIDAD** 🔒 (PRIORIDAD ALTA)

#### **Tarea 4: Agregar validaciones con express-validator en controladores**
**Archivos:** Varios controladores
**Objetivo:** Validar datos de entrada en todas las rutas POST/PUT
**Acción:**
1. Crear helpers de validación:
   - `helpers/validarPedido.js`
   - `helpers/validarMesa.js`
   - `helpers/validarCompra.js`
   - `helpers/validarCierreCaja.js`
2. Agregar validaciones a las rutas en:
   - `routes/pedidos.routes.js`
   - `routes/mesas.routes.js`
   - `routes/compras.routes.js`
   - `routes/cierreCaja.routes.js`
3. Usar `resultadoValidacion.js` para manejar errores

**HU relacionadas:** Todas (mejora calidad)
**Archivos afectados:** `helpers/*.js`, `routes/*.routes.js`
**Dependencias:** Tarea 1
**Estimación:** 60-90 minutos

---

#### **Tarea 5: Crear middleware de manejo de errores centralizado**
**Archivo:** `backend/src/middlewares/errorHandler.js` (crear)
**Objetivo:** Centralizar el manejo de errores en un solo lugar
**Acción:**
1. Crear carpeta `backend/src/middlewares/`
2. Crear `errorHandler.js` con middleware para errores 404 y 500
3. Registrarlo en `backend/index.js` DESPUÉS de todas las rutas
4. Reemplazar `try/catch` repetitivos en controladores por `next(error)`

**HU relacionadas:** RNF4 (seguridad)
**Archivos afectados:** `middlewares/errorHandler.js`, `index.js`, varios controladores
**Dependencias:** Tarea 1
**Estimación:** 30-45 minutos

---

#### **Tarea 6: Implementar límite de rate limiting (protección contra ataques)**
**Archivo:** `backend/index.js`
**Objetivo:** Limitar cantidad de requests por IP
**Acción:**
1. Instalar `express-rate-limit`: `npm install express-rate-limit`
2. Configurar rate limiter (100 requests / 15 minutos por IP)
3. Aplicar a todas las rutas de API

**HU relacionadas:** RNF4 (seguridad)
**Archivos afectados:** `index.js`, `package.json`
**Dependencias:** Tarea 1
**Estimación:** 15-20 minutos

---

### **FASE 3: FUNCIONALIDADES CORE** 🚀 (PRIORIDAD ALTA)

#### **Tarea 7: Implementar lógica de QR para mesas (HU1)**
**Archivos:** `controllers/mesas.controllers.js`, modelo `mesaSchema.js`
**Objetivo:** Generar códigos QR únicos para cada mesa
**Acción:**
1. Instalar librería QR: `npm install qrcode`
2. Agregar función en `mesas.controllers.js`:
   - `generarQRMesa(idMesa)` → genera QR con URL: `${FRONTEND_URL}/menu?mesa=${idMesa}`
3. Al crear/editar mesa, generar QR automáticamente
4. Agregar ruta GET `/api/mesas/:id/qr` que devuelva la imagen QR

**HU relacionadas:** HU1
**Archivos afectados:** `mesas.controllers.js`, `mesas.routes.js`, `mesaSchema.js`
**Dependencias:** Tarea 1, 3
**Estimación:** 45-60 minutos

---

#### **Tarea 8: Implementar lógica de descuento automático del 10% en efectivo (RN2, RF2)**
**Archivos:** `controllers/pedidos.controllers.js`
**Objetivo:** Aplicar descuento automático cuando método de pago es "Efectivo"
**Acción:**
1. En el método `cobrarPedido` del controlador de pedidos:
   - Si `pago.metodoPago === 'Efectivo'`, calcular descuento del 10%
   - Actualizar `pago.descuento = total * 0.10`
   - Actualizar `pago.totalFinal = total - descuento`
2. Validar que no se puedan aplicar otros descuentos adicionales manualmente
3. Agregar campo `descuentoAplicado` en el modelo de pedido (si no existe)

**HU relacionadas:** HU8, RN2, RF2
**Archivos afectados:** `pedidos.controllers.js`, `pedidoSchema.js`
**Dependencias:** Tarea 1
**Estimación:** 30-45 minutos

---

#### **Tarea 9: Implementar actualización de estado de mesa automática (RN4)**
**Archivos:** `controllers/pedidos.controllers.js`, `controllers/mesas.controllers.js`
**Objetivo:** Cambiar estado de mesa según el flujo de pedidos
**Acción:**
1. Al crear un pedido:
   - Cambiar estado de mesa a "Ocupada" automáticamente
2. Al cobrar/cancelar el último pedido de una mesa:
   - Cambiar estado de mesa a "Libre" automáticamente
3. Validar que no se puedan crear pedidos en mesas con estado "Reservada" (solo admin/gerente puede)

**HU relacionadas:** HU3, HU11, RN4
**Archivos afectados:** `pedidos.controllers.js`, `mesas.controllers.js`
**Dependencias:** Tarea 1
**Estimación:** 45-60 minutos

---

#### **Tarea 10: Implementar notificaciones en tiempo real (opcional con Socket.io)**
**Archivos:** `backend/index.js`, varios controladores
**Objetivo:** Notificar a cocina/mozo cuando cambia el estado de un pedido (HU6)
**Acción:**
1. Instalar Socket.io: `npm install socket.io`
2. Configurar Socket.io en `index.js`
3. Emitir eventos:
   - `nuevoPedido` → cuando mozo crea pedido (a cocina)
   - `pedidoListo` → cuando cocina marca pedido listo (a mozo)
   - `mesaActualizada` → cuando cambia estado de mesa
4. Documentar eventos de Socket.io

**HU relacionadas:** HU4, HU6
**Archivos afectados:** `index.js`, `pedidos.controllers.js`, `mesas.controllers.js`
**Dependencias:** Tarea 1, 9
**Estimación:** 60-90 minutos (OPCIONAL para MVP)

---

### **FASE 4: REPORTES Y ANÁLISIS** 📊 (PRIORIDAD MEDIA)

#### **Tarea 11: Completar implementación de reportes en reportes.controllers.js**
**Archivo:** `controllers/reportes.controllers.js`
**Objetivo:** Implementar todos los reportes del acta (HU9, HU15, RF7)
**Acción:**
1. Verificar que todos los métodos exportados estén implementados:
   - ✅ `reporteVentasPorFecha`
   - ✅ `reporteVentasPorProducto`
   - ✅ `reporteVentasPorMozo`
   - ✅ `reporteVentasPorMetodoPago`
   - ✅ `reporteVentasDiario`
   - ✅ `reporteVentasMensual`
   - ✅ `reporteCompras`
   - ✅ `reporteProductosMasVendidos`
   - ✅ `reporteProductosBajoStock`
   - ✅ `reporteResumenDiario`
   - ✅ `reporteCierresCaja`
2. Agregar paginación a los reportes grandes
3. Agregar filtros opcionales (fecha inicio/fin, mozo, categoría)
4. Verificar performance (< 2 segundos según RNF2)

**HU relacionadas:** HU9, HU15, RF7
**Archivos afectados:** `reportes.controllers.js`
**Dependencias:** Tarea 1, 3 (datos de prueba)
**Estimación:** 90-120 minutos

---

#### **Tarea 12: Implementar exportación de reportes a PDF/Excel**
**Archivos:** `controllers/reportes.controllers.js`
**Objetivo:** Permitir descargar reportes en formato PDF o Excel (HU9)
**Acción:**
1. Instalar librerías:
   - `npm install pdfkit` (para PDF)
   - `npm install xlsx` (para Excel)
2. Agregar rutas:
   - `/api/reportes/ventas/diario/pdf`
   - `/api/reportes/ventas/mensual/excel`
   - `/api/reportes/productos/mas-vendidos/pdf`
3. Generar documentos con formato profesional (logo, fecha, totales)

**HU relacionadas:** HU9, HU15
**Archivos afectados:** `reportes.controllers.js`, `reportes.routes.js`
**Dependencias:** Tarea 11
**Estimación:** 60-90 minutos (OPCIONAL para MVP)

---

### **FASE 5: OPTIMIZACIONES Y MEJORAS** ⚡ (PRIORIDAD MEDIA-BAJA)

#### **Tarea 13: Implementar paginación en listados grandes**
**Archivos:** Varios controladores
**Objetivo:** Mejorar performance en listados con muchos registros
**Acción:**
1. Agregar paginación a:
   - `obtenerPedidos` (pedidos.controllers.js)
   - `obtenerProductos` (productos.controllers.js)
   - `obtenerUsuarios` (usuarios.controllers.js)
   - `obtenerCompras` (compras.controllers.js)
2. Usar parámetros query: `?page=1&limit=20`
3. Devolver metadata: `{ data: [...], page, totalPages, totalItems }`

**HU relacionadas:** RNF2 (performance)
**Archivos afectados:** Varios controladores
**Dependencias:** Tarea 1
**Estimación:** 45-60 minutos

---

#### **Tarea 14: Agregar índices a la base de datos para optimización**
**Archivos:** Varios schemas
**Objetivo:** Mejorar performance de consultas frecuentes
**Acción:**
1. Agregar índices en los schemas:
   - `usuarioSchema`: índice único en `email`
   - `productoSchema`: índice en `categoria`, `disponible`
   - `pedidoSchema`: índice compuesto en `estado`, `fechaCreacion`
   - `mesaSchema`: índice único en `numero`
2. Documentar los índices en comentarios

**HU relacionadas:** RNF2 (performance < 2s), RNF7
**Archivos afectados:** Varios schemas
**Dependencias:** Tarea 1
**Estimación:** 20-30 minutos

---

#### **Tarea 15: Implementar logs de auditoría (opcional)**
**Archivo:** `backend/src/middlewares/auditLog.js` (crear)
**Objetivo:** Registrar acciones importantes del sistema
**Acción:**
1. Crear modelo `AuditLogSchema` con:
   - usuario (quien hizo la acción)
   - accion (qué hizo: "crear_pedido", "cobrar_pedido", etc.)
   - recurso (qué modificó: "Pedido #123")
   - fecha
   - ip
2. Crear middleware que registre en BD o archivo
3. Aplicar a rutas sensibles (crear/editar/eliminar)

**HU relacionadas:** HU9 (historial)
**Archivos afectados:** `middlewares/auditLog.js`, varios controladores
**Dependencias:** Tarea 1
**Estimación:** 45-60 minutos (OPCIONAL)

---

### **FASE 6: TESTING Y DOCUMENTACIÓN** 🧪📝 (PRIORIDAD ALTA)

#### **Tarea 16: Crear tests unitarios para controladores críticos**
**Archivos:** `backend/tests/` (crear)
**Objetivo:** Probar funcionalidades críticas con Jest/Supertest
**Acción:**
1. Instalar dependencias: `npm install --save-dev jest supertest mongodb-memory-server`
2. Configurar Jest en `package.json`
3. Crear tests para:
   - Auth (login, registro, recuperación de contraseña)
   - Pedidos (crear, cambiar estado, cobrar)
   - Mesas (crear, cambiar estado)
   - Productos (CRUD)
4. Agregar script: `npm test`

**HU relacionadas:** RNF3 (disponibilidad 95%)
**Archivos afectados:** `tests/*.test.js`, `package.json`, `jest.config.js`
**Dependencias:** Tarea 1, 3
**Estimación:** 120-180 minutos

---

#### **Tarea 17: Actualizar documentación de rutas API (RUTAS_API.md)**
**Archivo:** `backend/RUTAS_API.md` (actualizar)
**Objetivo:** Documentar todas las rutas con ejemplos de request/response
**Acción:**
1. Verificar el archivo `backend/RUTAS_API.md` existente
2. Documentar TODAS las rutas nuevas:
   - Auth: login, registro, recuperar contraseña
   - Usuarios: CRUD, cambiar rol
   - Productos: CRUD, disponibilidad
   - Pedidos: crear, listar, cambiar estado, cobrar
   - Mesas: CRUD, cambiar estado, QR
   - Compras: registrar, listar
   - Cierre de caja: crear, listar
   - Reportes: todos los endpoints
3. Incluir para cada ruta:
   - Método HTTP y endpoint
   - Roles requeridos
   - Parámetros (query, body, params)
   - Ejemplo de request (JSON)
   - Ejemplo de response (JSON)
   - Códigos de estado posibles

**HU relacionadas:** RNF8 (documentación)
**Archivos afectados:** `backend/RUTAS_API.md`
**Dependencias:** Todas las anteriores
**Estimación:** 60-90 minutos

---

#### **Tarea 18: Crear colección de Postman/Thunder Client para testing**
**Archivo:** `backend/postman_collection.json` (crear)
**Objetivo:** Facilitar testing manual de la API
**Acción:**
1. Crear colección completa en Postman o Thunder Client con:
   - Todas las rutas documentadas
   - Variables de entorno (baseUrl, token)
   - Pre-request scripts para autenticación
   - Tests básicos de status code
2. Exportar colección a JSON
3. Agregar instrucciones de importación en README

**HU relacionadas:** RNF8 (documentación)
**Archivos afectados:** `backend/postman_collection.json`, `backend/README.md`
**Dependencias:** Tarea 17
**Estimación:** 45-60 minutos

---

#### **Tarea 19: Actualizar README.md del backend**
**Archivo:** `backend/README.md`
**Objetivo:** Documentar cómo instalar, configurar y ejecutar el backend completo
**Acción:**
1. Actualizar secciones:
   - Estructura de carpetas (incluir nuevos módulos)
   - Scripts disponibles (`npm start`, `npm run seed`, `npm test`)
   - Variables de entorno (.env.example)
   - Guía de inicialización completa (paso a paso)
   - Troubleshooting común
2. Agregar sección de "Arquitectura" con diagrama ASCII
3. Agregar sección de "Contribución" y "Licencia"

**HU relacionadas:** RNF8 (documentación)
**Archivos afectados:** `backend/README.md`
**Dependencias:** Todas las anteriores
**Estimación:** 30-45 minutos

---

### **FASE 7: DESPLIEGUE** 🚀 (PRIORIDAD BAJA - POST-MVP)

#### **Tarea 20: Crear Dockerfile para el backend**
**Archivo:** `backend/Dockerfile` (crear)
**Objetivo:** Permitir despliegue con Docker (RNF5)
**Acción:**
1. Crear `Dockerfile` con Node.js 18+
2. Copiar archivos, instalar dependencias
3. Exponer puerto 4000
4. Comando de inicio: `npm start`

**HU relacionadas:** RNF5 (Docker)
**Archivos afectados:** `backend/Dockerfile`
**Dependencias:** Todas las fases anteriores
**Estimación:** 30 minutos

---

#### **Tarea 21: Crear docker-compose.yml completo**
**Archivo:** `docker-compose.yml` (raíz del proyecto)
**Objetivo:** Levantar backend + MongoDB + frontend con un solo comando
**Acción:**
1. Crear `docker-compose.yml` en la raíz con servicios:
   - `mongodb`: imagen oficial mongo:latest
   - `backend`: build desde `./backend`
   - `frontend`: build desde `./frontend` (si aplica)
2. Configurar volúmenes para persistencia de BD
3. Configurar redes entre contenedores
4. Documentar cómo ejecutar: `docker-compose up -d`

**HU relacionadas:** RNF5 (Docker)
**Archivos afectados:** `docker-compose.yml`, `README.md` (raíz)
**Dependencias:** Tarea 20
**Estimación:** 45-60 minutos

---

#### **Tarea 22: Preparar variables de entorno para producción**
**Archivos:** Varios
**Objetivo:** Configurar el backend para entorno de producción
**Acción:**
1. Crear `.env.production.example`
2. Configurar:
   - NODE_ENV=production
   - Desactivar CORS para dominios específicos
   - Configurar logs más restrictivos
   - Configurar conexión a MongoDB Atlas (cloud)
3. Agregar validación de variables de entorno al inicio del servidor

**HU relacionadas:** RNF3 (disponibilidad 95%)
**Archivos afectados:** `.env.production.example`, `index.js`
**Dependencias:** Todas las fases anteriores
**Estimación:** 20-30 minutos

---

## 📋 RESUMEN DE PRIORIDADES

### 🔴 **ALTA PRIORIDAD (MVP - Hacer PRIMERO)**
1. ✅ **Tarea 1**: Registrar rutas en index.js (CRÍTICO)
2. ✅ **Tarea 2**: Crear .env.example
3. ✅ **Tarea 3**: Script de inicialización de BD
4. ✅ **Tarea 4**: Validaciones express-validator
5. ✅ **Tarea 5**: Middleware de errores
6. ✅ **Tarea 7**: Lógica de QR para mesas
7. ✅ **Tarea 8**: Descuento automático 10% efectivo
8. ✅ **Tarea 9**: Estado de mesas automático
9. ✅ **Tarea 11**: Completar reportes
10. ✅ **Tarea 16**: Tests unitarios
11. ✅ **Tarea 17**: Documentación de rutas API

### 🟡 **MEDIA PRIORIDAD (Mejoras importantes)**
- Tarea 6: Rate limiting
- Tarea 13: Paginación
- Tarea 14: Índices BD
- Tarea 18: Colección Postman
- Tarea 19: Actualizar README

### 🟢 **BAJA PRIORIDAD (Opcionales/Post-MVP)**
- Tarea 10: Socket.io (tiempo real)
- Tarea 12: Exportar PDF/Excel
- Tarea 15: Logs de auditoría
- Tarea 20-22: Docker y despliegue

---

## 🎯 PRÓXIMOS 3 PASOS INMEDIATOS

### **PASO 1: Registrar las nuevas rutas** (15 min)
Editar `backend/index.js` e importar/registrar todas las rutas nuevas.

### **PASO 2: Crear script de seed** (60 min)
Completar/verificar `backend/scripts/initDB.js` con datos de prueba.

### **PASO 3: Probar endpoints manualmente** (30 min)
Usar Thunder Client o Postman para probar que las rutas responden correctamente.

---

## 📈 MÉTRICAS DE ÉXITO

- ✅ Servidor arranca sin errores
- ✅ Todas las rutas responden correctamente
- ✅ BD se inicializa con datos semilla
- ✅ Tests pasan al 100%
- ✅ Documentación completa
- ✅ Performance < 2 segundos por consulta
- ✅ Al menos 85% de funcionalidades implementadas (según acta)

---

## 📚 RECURSOS Y REFERENCIAS

- **Acta de Constitución**: `frontend/docs/acta_constitucion_proyecto.md`
- **Rutas API**: `backend/RUTAS_API.md`
- **DB Setup**: `backend/DB_SETUP.md`
- **Password Recovery**: `backend/PASSWORD_RECOVERY_API.md`

---

**Generado el:** 9 de noviembre de 2025
**Equipo:** Argüello, De la Crúz, Sanagua, Ybarra
**Proyecto:** La Vieja Estación RestoBar - TFI Programación 4

---

## 🚀 ¿POR DÓNDE EMPEZAR?

**Recomendación:** Comenzar con las tareas 1, 2 y 3 en orden.
Estas tareas son fundamentales y desbloquean el resto del desarrollo.

**Comando para arrancar:**
```bash
cd backend
npm install
# Editar backend/index.js (Tarea 1)
# Crear .env (Tarea 2)
# Ejecutar seed (Tarea 3)
npm start
```

¡Éxito con el desarrollo! 🎉
