# 📋 Documentación de Requisitos - La Vieja Estación RestoBar

## Sistema de Gestión Integral para Restaurantes

**Versión:** 1.0.0  
**Fecha:** Noviembre 2025  
**Equipo:** Comisión 12 - UTN TUP  
**Cliente:** Jaqueline Valdivieso - La Vieja Estación RestoBar

---

## 📑 Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Objetivos del Sistema](#2-objetivos-del-sistema)
3. [Alcance](#3-alcance)
4. [Requisitos Funcionales](#4-requisitos-funcionales)
5. [Requisitos No Funcionales](#5-requisitos-no-funcionales)
6. [Casos de Uso](#6-casos-de-uso)
7. [Restricciones](#7-restricciones)
8. [Supuestos y Dependencias](#8-supuestos-y-dependencias)

---

## 1. Introducción

### 1.1 Propósito del Documento

Este documento describe los requisitos funcionales y no funcionales del Sistema de Gestión Integral para "La Vieja Estación RestoBar". Está dirigido a:

- Equipo de desarrollo
- Stakeholders del proyecto
- Evaluadores del TFI
- Usuarios finales del sistema

### 1.2 Contexto del Proyecto

**Cliente:** La Vieja Estación - RestoBar  
**Propietaria:** Jaqueline Valdivieso  
**Problema:** Procesos manuales que generan errores, pérdidas de tiempo y falta de control operativo

**Solución:** Sistema web integral que digitaliza y automatiza todos los procesos del negocio.

### 1.3 Referencias

- Acta de Constitución del Proyecto
- Manual de Usuario
- Documentación Técnica de API
- Plan de Tareas Backend

---

## 2. Objetivos del Sistema

### 2.1 Objetivo General

Desarrollar un sistema de gestión integral que permita optimizar los procesos operativos de "La Vieja Estación RestoBar", reduciendo errores, mejorando tiempos de respuesta y proporcionando información en tiempo real para la toma de decisiones.

### 2.2 Objetivos Específicos

1. **Digitalizar el menú** mediante códigos QR para acceso público
2. **Automatizar el sistema POS** para toma de pedidos y facturación
3. **Controlar inventario** con actualización automática de stock
4. **Gestionar mesas y reservas** con estados en tiempo real
5. **Administrar personal** con roles y permisos diferenciados
6. **Generar reportes** de ventas, productos y flujo de caja
7. **Optimizar cierres de caja** con cálculos automáticos

---

## 3. Alcance

### 3.1 Dentro del Alcance

#### Módulos Incluidos:

✅ **Autenticación y Seguridad**
- Login con email/usuario y contraseña
- Recuperación de contraseña por email
- Gestión de sesiones con JWT
- Roles y permisos diferenciados

✅ **Menú Digital con QR**
- Generación de códigos QR por mesa
- Vista pública optimizada para móviles
- Actualización automática de precios

✅ **Gestión de Productos**
- CRUD completo de productos
- Categorías y subcategorías
- Control de disponibilidad
- Imágenes de productos

✅ **Sistema POS / Pedidos**
- Toma de pedidos por mesa
- Asignación a cocina
- Estados de pedido en tiempo real
- Notificaciones push

✅ **Gestión de Mesas**
- CRUD de mesas
- Estados (libre, ocupada, reservada)
- Sistema de reservas
- Asignación de mozos

✅ **Inventario y Compras**
- Control de stock
- Gestión de proveedores
- Registro de compras
- Actualización automática

✅ **Reportes**
- Ventas por período
- Productos más vendidos
- Cierre de caja
- Flujo de efectivo
- Exportación a PDF/Excel

✅ **Gestión de Usuarios**
- CRUD de usuarios
- Asignación de roles
- Control de accesos

### 3.2 Fuera del Alcance

❌ **Funcionalidades NO incluidas:**

- Integración con AFIP (facturación electrónica)
- Sistema de delivery o pedidos online
- Integración con pasarelas de pago externas
- Aplicación móvil nativa
- Programa de fidelización de clientes
- Integración con redes sociales
- Sistema de turnos automático para empleados
- Contabilidad completa
- Gestión de nómina y sueldos

---

## 4. Requisitos Funcionales

### RF1 - Autenticación y Usuarios

#### RF1.1 - Inicio de Sesión
**Prioridad:** Alta  
**Descripción:** El sistema debe permitir a los usuarios autenticarse con email/usuario y contraseña.

**Criterios de Aceptación:**
- Usuario puede ingresar email o nombre de usuario
- Contraseña debe estar encriptada (bcrypt)
- Se genera token JWT con expiración de 24 horas
- Redirección según rol del usuario
- Mensaje de error claro si las credenciales son incorrectas

#### RF1.2 - Recuperación de Contraseña
**Prioridad:** Alta  
**Descripción:** Los usuarios deben poder recuperar su contraseña mediante email.

**Criterios de Aceptación:**
- Usuario ingresa su email registrado
- Sistema genera código de 6 dígitos
- Código se envía por email
- Código expira en 1 hora
- Usuario puede crear nueva contraseña con el código válido

#### RF1.3 - Gestión de Usuarios
**Prioridad:** Alta  
**Descripción:** Administradores pueden crear, editar y eliminar usuarios.

**Criterios de Aceptación:**
- Crear usuario con datos obligatorios: nombre, email, contraseña, rol
- Editar datos de usuario existente
- Eliminar usuario (soft delete)
- Listar todos los usuarios
- Filtrar usuarios por rol

#### RF1.4 - Roles y Permisos
**Prioridad:** Alta  
**Descripción:** El sistema debe soportar 5 roles con permisos diferenciados.

**Roles:**
1. **Administrador:** Acceso total
2. **Gerente:** Supervisión operativa
3. **Mozo:** Atención y pedidos
4. **Cajero:** Cobros y caja
5. **Cocina:** Preparación de pedidos

---

### RF2 - Menú Digital

#### RF2.1 - Vista Pública del Menú
**Prioridad:** Alta  
**Descripción:** Clientes pueden ver el menú completo sin autenticarse.

**Criterios de Aceptación:**
- Acceso público sin login
- Productos agrupados por categoría
- Mostrar: nombre, descripción, precio, imagen
- Solo productos marcados como "disponibles"
- Responsive para móviles

#### RF2.2 - Generación de Códigos QR
**Prioridad:** Media  
**Descripción:** Administradores pueden generar códigos QR para el menú.

**Criterios de Aceptación:**
- Generar QR general o por mesa
- Formatos: PNG (500x500), SVG (escalable)
- QR contiene URL del menú digital
- Opción de incluir número de mesa en URL

---

### RF3 - Gestión de Productos

#### RF3.1 - CRUD de Productos
**Prioridad:** Alta  
**Descripción:** Administradores y gerentes pueden gestionar productos.

**Criterios de Aceptación:**
- **Crear:** Nombre, descripción, categoría, precio, costo, stock, imagen
- **Leer:** Listar todos los productos con filtros
- **Actualizar:** Modificar cualquier campo del producto
- **Eliminar:** Borrado lógico (no físico)
- Validación de datos obligatorios

#### RF3.2 - Categorías
**Prioridad:** Media  
**Descripción:** Productos deben estar organizados en categorías.

**Categorías:**
- Comidas
- Bebidas
- Bebidas Alcohólicas
- Postres
- Entradas
- Otros

#### RF3.3 - Control de Disponibilidad
**Prioridad:** Alta  
**Descripción:** Productos pueden marcarse como disponibles o no disponibles.

**Criterios de Aceptación:**
- Campo booleano "disponible"
- Productos no disponibles no aparecen en menú digital
- Productos no disponibles no se pueden agregar a pedidos

---

### RF4 - Sistema POS / Pedidos

#### RF4.1 - Toma de Pedidos
**Prioridad:** Alta  
**Descripción:** Mozos pueden crear pedidos para las mesas.

**Criterios de Aceptación:**
- Seleccionar mesa ocupada
- Agregar múltiples productos con cantidades
- Agregar notas especiales por producto
- Calcular subtotal automáticamente
- Enviar pedido a cocina

#### RF4.2 - Estados de Pedido
**Prioridad:** Alta  
**Descripción:** Pedidos deben tener estados que reflejen su progreso.

**Estados:**
1. **Pendiente:** Recién creado
2. **En Preparación:** Cocina lo está preparando
3. **Listo:** Terminado, listo para servir
4. **Entregado:** Servido al cliente
5. **Cancelado:** Pedido cancelado

#### RF4.3 - Vista de Cocina
**Prioridad:** Alta  
**Descripción:** Personal de cocina puede ver y actualizar pedidos.

**Criterios de Aceptación:**
- Listar pedidos pendientes y en preparación
- Ver detalles completos de cada pedido
- Actualizar estado a "En Preparación" y "Listo"
- Notificación visual de nuevos pedidos
- Filtrar por estado y mesa

#### RF4.4 - Modificar/Cancelar Pedidos
**Prioridad:** Media  
**Descripción:** Gerentes pueden modificar o cancelar pedidos.

**Criterios de Aceptación:**
- Solo pedidos en estado "Pendiente" pueden modificarse
- Requerir motivo para cancelación
- Registrar usuario que cancela
- Notificar a cocina si estaba en preparación

---

### RF5 - Gestión de Mesas

#### RF5.1 - CRUD de Mesas
**Prioridad:** Alta  
**Descripción:** Administradores pueden gestionar mesas del local.

**Criterios de Aceptación:**
- Crear mesa con: número, capacidad, ubicación
- Editar datos de mesa
- Eliminar mesa (solo si no tiene pedidos)
- Listar todas las mesas

#### RF5.2 - Estados de Mesa
**Prioridad:** Alta  
**Descripción:** Mesas deben tener estados que reflejen su disponibilidad.

**Estados:**
- **Disponible:** Mesa libre
- **Ocupada:** Clientes en la mesa
- **Reservada:** Mesa reservada para horario específico

#### RF5.3 - Ocupar/Liberar Mesa
**Prioridad:** Alta  
**Descripción:** Mozos pueden cambiar el estado de las mesas.

**Criterios de Aceptación:**
- Ocupar mesa disponible indicando número de comensales
- Asignar mozo responsable
- Liberar mesa solo si la cuenta está pagada
- Registrar hora de ocupación y liberación

#### RF5.4 - Sistema de Reservas
**Prioridad:** Media  
**Descripción:** Permitir crear y gestionar reservas de mesas.

**Criterios de Aceptación:**
- Crear reserva con: cliente, fecha, hora, comensales, mesa
- Validar disponibilidad de mesa en fecha/hora
- Enviar confirmación por email
- Cancelar reserva
- Confirmar llegada de cliente (ocupa la mesa)
- Listar reservas del día/semana

---

### RF6 - Inventario y Compras

#### RF6.1 - Control de Stock
**Prioridad:** Alta  
**Descripción:** Sistema debe controlar stock de productos.

**Criterios de Aceptación:**
- Cada producto tiene: stock actual, stock mínimo
- Stock se descuenta automáticamente al crear venta
- Stock se incrementa automáticamente al registrar compra
- Alertas cuando stock < stock mínimo
- Historial de movimientos de stock

#### RF6.2 - Gestión de Proveedores
**Prioridad:** Media  
**Descripción:** Registrar y gestionar proveedores.

**Criterios de Aceptación:**
- Crear proveedor: razón social, CUIT, contacto, productos
- Editar datos de proveedor
- Eliminar proveedor (solo si no tiene compras)
- Listar proveedores

#### RF6.3 - Registro de Compras
**Prioridad:** Alta  
**Descripción:** Registrar compras a proveedores.

**Criterios de Aceptación:**
- Crear compra: proveedor, fecha, productos, cantidades, precios
- Calcular total automáticamente
- Actualizar stock de productos comprados
- Adjuntar factura (PDF/imagen) - opcional
- Listar historial de compras

---

### RF7 - Reportes y Caja

#### RF7.1 - Cierre de Caja
**Prioridad:** Alta  
**Descripción:** Realizar cierre de caja al finalizar turno.

**Criterios de Aceptación:**
- Mostrar: saldo inicial, ingresos, egresos, saldo esperado
- Ingresar saldo real contado
- Calcular diferencia (faltante/sobrante)
- Registrar observaciones
- Generar reporte PDF del cierre

#### RF7.2 - Reporte de Ventas por Período
**Prioridad:** Alta  
**Descripción:** Generar reportes de ventas en un rango de fechas.

**Criterios de Aceptación:**
- Seleccionar fecha desde/hasta
- Mostrar: ventas totales, cantidad de transacciones, ticket promedio
- Gráfico de ventas
- Comparación con período anterior
- Exportar a PDF/Excel

#### RF7.3 - Productos Más Vendidos
**Prioridad:** Media  
**Descripción:** Ranking de productos por unidades vendidas.

**Criterios de Aceptación:**
- Listar productos ordenados por cantidad vendida
- Mostrar: unidades, ingresos, porcentaje del total
- Filtrar por categoría y período
- Exportar a PDF/Excel

#### RF7.4 - Rendimiento por Empleado
**Prioridad:** Media  
**Descripción:** Estadísticas de ventas por mozo/cajero.

**Criterios de Aceptación:**
- Ventas totales por empleado
- Número de atenciones
- Ticket promedio
- Período seleccionable

#### RF7.5 - Flujo de Efectivo
**Prioridad:** Alta  
**Descripción:** Reporte de entradas y salidas de dinero.

**Criterios de Aceptación:**
- Ingresos por ventas (efectivo, tarjeta, transferencia)
- Egresos por compras y gastos
- Balance del período
- Gráfico de flujo

---

## 5. Requisitos No Funcionales

### RNF1 - Rendimiento

#### RNF1.1 - Tiempo de Respuesta
**Descripción:** El sistema debe responder en tiempos aceptables.

**Criterios:**
- Carga de página: < 3 segundos
- Consultas a BD: < 2 segundos
- Generación de reportes: < 5 segundos
- Actualización en tiempo real: < 1 segundo

#### RNF1.2 - Concurrencia
**Descripción:** Soportar múltiples usuarios simultáneos.

**Criterios:**
- Mínimo 20 usuarios concurrentes
- Sin degradación notable de rendimiento
- Manejo de conflictos en actualizaciones

---

### RNF2 - Disponibilidad

#### RNF2.1 - Uptime
**Descripción:** El sistema debe estar disponible la mayor parte del tiempo.

**Criterios:**
- Disponibilidad objetivo: 95% o superior
- Mantenimientos programados en horarios de baja actividad
- Plan de recuperación ante fallos

---

### RNF3 - Seguridad

#### RNF3.1 - Autenticación
**Descripción:** Acceso seguro al sistema.

**Criterios:**
- Contraseñas encriptadas con bcrypt (salt rounds >= 10)
- Tokens JWT con expiración
- No almacenar contraseñas en texto plano
- Logout que invalida sesión

#### RNF3.2 - Autorización
**Descripción:** Control de permisos por rol.

**Criterios:**
- Validación de permisos en backend
- Endpoints protegidos con middleware de autenticación
- Usuarios solo pueden acceder a funciones de su rol

#### RNF3.3 - Protección de Datos
**Descripción:** Información sensible protegida.

**Criterios:**
- Comunicación HTTPS en producción
- Variables sensibles en archivos .env
- No exponer información sensible en logs
- Backup regular de base de datos

---

### RNF4 - Usabilidad

#### RNF4.1 - Interfaz de Usuario
**Descripción:** UI intuitiva y fácil de usar.

**Criterios:**
- Diseño consistente en todas las páginas
- Navegación clara y lógica
- Mensajes de error descriptivos
- Confirmaciones para acciones críticas
- Feedback visual de acciones

#### RNF4.2 - Responsive Design
**Descripción:** Funcional en diferentes dispositivos.

**Criterios:**
- Adaptable a desktop, tablet y móvil
- Menú digital optimizado para smartphones
- Touch-friendly en dispositivos táctiles

#### RNF4.3 - Accesibilidad
**Descripción:** Usable por personas con discapacidades.

**Criterios:**
- Contraste de colores adecuado
- Textos alternativos en imágenes
- Navegación por teclado
- Tamaño de fuente ajustable

---

### RNF5 - Mantenibilidad

#### RNF5.1 - Código
**Descripción:** Código limpio y mantenible.

**Criterios:**
- Arquitectura MVC clara
- Código comentado en secciones complejas
- Nombres de variables/funciones descriptivos
- Separación de responsabilidades

#### RNF5.2 - Documentación
**Descripción:** Documentación completa del sistema.

**Criterios:**
- README con instrucciones de instalación
- Manual de usuario detallado
- Documentación de API
- Comentarios en código complejo

#### RNF5.3 - Versionamiento
**Descripción:** Control de versiones del código.

**Criterios:**
- Repositorio Git
- Commits descriptivos
- Branches para funcionalidades
- Tags para versiones estables

---

### RNF6 - Portabilidad

#### RNF6.1 - Independencia de Plataforma
**Descripción:** Ejecutable en diferentes sistemas operativos.

**Criterios:**
- Backend compatible con Windows, Linux, macOS
- Frontend accesible desde cualquier navegador moderno
- Base de datos MongoDB portable

#### RNF6.2 - Contenedorización
**Descripción:** Despliegue con Docker.

**Criterios:**
- Dockerfile para backend
- Dockerfile para frontend
- docker-compose.yml funcional
- Documentación de despliegue

---

### RNF7 - Escalabilidad

#### RNF7.1 - Crecimiento de Datos
**Descripción:** Manejar aumento de datos sin degradación.

**Criterios:**
- Índices en BD para consultas frecuentes
- Paginación en listados grandes
- Lazy loading de imágenes

#### RNF7.2 - Crecimiento de Usuarios
**Descripción:** Soportar más usuarios sin reescribir.

**Criterios:**
- Arquitectura escalable horizontal
- Load balancing posible
- Caché de datos frecuentes

---

### RNF8 - Compatibilidad

#### RNF8.1 - Navegadores
**Descripción:** Funcionar en navegadores principales.

**Navegadores soportados:**
- Google Chrome (últimas 2 versiones)
- Mozilla Firefox (últimas 2 versiones)
- Safari (últimas 2 versiones)
- Microsoft Edge (últimas 2 versiones)

#### RNF8.2 - Tecnologías
**Stack tecnológico:**

**Backend:**
- Node.js v18+
- Express.js v5
- MongoDB v8
- Mongoose v8

**Frontend:**
- React v19
- Vite v6
- TailwindCSS v4

---

## 6. Casos de Uso

### CU1 - Cliente escanea menú QR

**Actor:** Cliente  
**Precondiciones:** Cliente está en el restaurante con un smartphone  
**Flujo Principal:**
1. Cliente escanea código QR de la mesa
2. Sistema abre navegador con el menú digital
3. Cliente ve productos agrupados por categoría
4. Cliente selecciona categoría para expandir
5. Cliente ve detalles: nombre, descripción, precio, imagen

**Postcondiciones:** Cliente conoce la oferta del restaurante

---

### CU2 - Mozo toma pedido

**Actor:** Mozo  
**Precondiciones:** Mozo autenticado, mesa ocupada  
**Flujo Principal:**
1. Mozo selecciona "Nuevo Pedido"
2. Mozo selecciona mesa
3. Mozo busca y agrega productos al pedido
4. Mozo indica cantidades y notas especiales
5. Mozo revisa resumen del pedido
6. Mozo envía pedido a cocina
7. Sistema notifica a cocina
8. Sistema actualiza estado de mesa

**Flujo Alternativo:**
- 3a. Producto no disponible: Sistema muestra mensaje y no permite agregarlo

**Postcondiciones:** Pedido creado y visible en cocina

---

### CU3 - Cocina prepara pedido

**Actor:** Cocinero  
**Precondiciones:** Cocinero autenticado, pedido pendiente  
**Flujo Principal:**
1. Cocinero ve lista de pedidos pendientes
2. Cocinero selecciona un pedido
3. Cocinero ve detalles y productos
4. Cocinero marca "Iniciar Preparación"
5. Cocinero prepara los platos
6. Cocinero marca "Listo para Servir"
7. Sistema notifica al mozo

**Postcondiciones:** Pedido listo para entregar al cliente

---

### CU4 - Cajero cobra cuenta

**Actor:** Cajero  
**Precondiciones:** Cajero autenticado, pedido entregado  
**Flujo Principal:**
1. Cajero selecciona mesa a cerrar
2. Sistema muestra resumen de consumo
3. Cajero selecciona método de pago
4. Si es efectivo, cajero ingresa monto recibido
5. Sistema calcula vuelto
6. Cajero procesa pago
7. Sistema genera ticket
8. Sistema libera la mesa

**Flujo Alternativo:**
- 3a. División de cuenta: Cajero selecciona "Dividir", asigna productos, cobra individualmente

**Postcondiciones:** Cuenta pagada, mesa liberada

---

### CU5 - Gerente genera reporte

**Actor:** Gerente  
**Precondiciones:** Gerente autenticado  
**Flujo Principal:**
1. Gerente va a "Reportes"
2. Gerente selecciona tipo de reporte
3. Gerente define período (fecha desde/hasta)
4. Sistema genera reporte con datos y gráficos
5. Gerente revisa información
6. Gerente exporta a PDF o Excel

**Postcondiciones:** Reporte generado y descargado

---

## 7. Restricciones

### 7.1 Restricciones Técnicas

- **Lenguaje Backend:** JavaScript (Node.js)
- **Lenguaje Frontend:** JavaScript (React)
- **Base de Datos:** MongoDB (NoSQL)
- **Autenticación:** JWT obligatorio
- **No usar:** Bases de datos SQL, otros frameworks

### 7.2 Restricciones de Negocio

- Sin integración con sistemas fiscales (AFIP)
- Sin facturación electrónica
- Solo para uso local (no multi-sucursal)
- Un solo idioma (español)

### 7.3 Restricciones de Tiempo

- Desarrollo en 16 semanas (6 sprints)
- Entrega final: Diciembre 2025
- Presentación y defensa: Diciembre 2025

---

## 8. Supuestos y Dependencias

### 8.1 Supuestos

- El cliente tiene conexión a internet estable
- Personal del restaurante tiene conocimientos básicos de computación
- Todos los empleados tienen acceso a dispositivos (PC, tablet, smartphone)
- El cliente proporcionará imágenes de los productos
- Precios no incluyen impuestos (se agregan al final)

### 8.2 Dependencias

**Dependencias Externas:**
- MongoDB Atlas para base de datos en la nube
- Servicio de email (Gmail/Nodemailer) para notificaciones
- Hosting para despliegue (Railway, Vercel, etc.)

**Dependencias del Cliente:**
- Proporcionar información de productos y precios
- Proporcionar distribución de mesas del local
- Definir datos de empleados (usuarios)
- Proveer logo e imágenes del restaurante

---

## Apéndice A: Matriz de Trazabilidad

| ID | Requisito | Prioridad | HU | Estado | Notas |
|----|-----------|-----------|-----|--------|-------|
| RF1.1 | Login | Alta | HU0 | ✅ | Implementado |
| RF1.2 | Recuperar contraseña | Alta | HU0 | ✅ | Implementado |
| RF1.3 | CRUD Usuarios | Alta | HU0 | ✅ | Implementado |
| RF2.1 | Menú Digital | Alta | HU1 | ✅ | Implementado |
| RF2.2 | QR Codes | Media | HU1 | ✅ | Implementado |
| RF3.1 | CRUD Productos | Alta | HU2 | ✅ | Implementado |
| RF4.1 | Toma de Pedidos | Alta | HU3 | ✅ | Implementado |
| RF4.3 | Vista Cocina | Alta | HU4 | ✅ | Implementado |
| RF5.1 | CRUD Mesas | Alta | HU5 | ✅ | Implementado |
| RF5.4 | Reservas | Media | HU6 | ✅ | Implementado |
| RF6.1 | Control Stock | Alta | HU7 | ✅ | Implementado |
| RF6.3 | Registro Compras | Alta | HU8 | ✅ | Implementado |
| RF7.1 | Cierre de Caja | Alta | HU9 | ✅ | Implementado |
| RF7.2 | Reportes Ventas | Alta | HU10 | ✅ | Implementado |

---

## Apéndice B: Priorización de Requisitos

### Método MoSCoW

**Must Have (Debe tener):**
- RF1.1, RF1.2, RF1.3 - Autenticación
- RF2.1 - Menú Digital
- RF3.1 - CRUD Productos
- RF4.1, RF4.2, RF4.3 - Sistema POS
- RF5.1, RF5.2, RF5.3 - Gestión Mesas
- RF6.1 - Control Stock
- RF7.1, RF7.2 - Caja y Reportes

**Should Have (Debería tener):**
- RF2.2 - QR Codes
- RF4.4 - Modificar/Cancelar Pedidos
- RF5.4 - Reservas
- RF6.2, RF6.3 - Proveedores y Compras
- RF7.3, RF7.4, RF7.5 - Reportes adicionales

**Could Have (Podría tener):**
- Notificaciones push
- Chat interno
- Integración con WhatsApp

**Won't Have (No tendrá):**
- Facturación electrónica
- Delivery
- App móvil nativa

---

**Documento de Requisitos - Versión 1.0.0**  
**La Vieja Estación RestoBar**  
**UTN - Tecnicatura Universitaria en Programación**  
**Noviembre 2025**
