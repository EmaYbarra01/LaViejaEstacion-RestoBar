# 📖 Manual de Usuario - La Vieja Estación RestoBar

## Sistema de Gestión Integral para Restaurantes

**Versión:** 1.0.0  
**Fecha:** Noviembre 2025  
**Equipo:** Comisión 12 - UTN TUP

---

## 📋 Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Requisitos del Sistema](#2-requisitos-del-sistema)
3. [Acceso al Sistema](#3-acceso-al-sistema)
4. [Roles y Permisos](#4-roles-y-permisos)
5. [Módulo: Menú Digital](#5-módulo-menú-digital)
6. [Módulo: Gestión de Productos](#6-módulo-gestión-de-productos)
7. [Módulo: Sistema POS / Pedidos](#7-módulo-sistema-pos--pedidos)
8. [Módulo: Gestión de Mesas](#8-módulo-gestión-de-mesas)
9. [Módulo: Inventario y Compras](#9-módulo-inventario-y-compras)
10. [Módulo: Reportes y Caja](#10-módulo-reportes-y-caja)
11. [Preguntas Frecuentes](#11-preguntas-frecuentes)
12. [Solución de Problemas](#12-solución-de-problemas)
13. [Contacto y Soporte](#13-contacto-y-soporte)

---

## 1. Introducción

### 1.1 ¿Qué es La Vieja Estación?

**La Vieja Estación** es un sistema integral de gestión diseñado específicamente para restaurantes y bares. Permite digitalizar y automatizar todos los procesos operativos del negocio, desde la toma de pedidos hasta el control de inventario y la generación de reportes.

### 1.2 Beneficios del Sistema

- ✅ **Reducción de errores** en pedidos y cálculos
- ⚡ **Mayor velocidad** en la atención al cliente
- 📊 **Control total** del inventario en tiempo real
- 💰 **Cierres de caja** automatizados y precisos
- 📈 **Reportes detallados** para toma de decisiones
- 📱 **Menú digital** accesible vía código QR

### 1.3 Componentes del Sistema

El sistema está compuesto por:

1. **Aplicación Web** - Accesible desde cualquier navegador
2. **Menú Digital** - Vista pública para clientes
3. **Panel de Administración** - Gestión completa del negocio
4. **Base de Datos** - Almacenamiento seguro de información

---

## 2. Requisitos del Sistema

### 2.1 Hardware Recomendado

**Para PC/Laptop:**
- Procesador: Intel Core i3 o equivalente
- RAM: 4 GB mínimo (8 GB recomendado)
- Pantalla: 1366x768 o superior
- Conexión a Internet estable

**Para Tablets/Smartphones:**
- Sistema operativo: Android 8+ o iOS 12+
- RAM: 2 GB mínimo
- Pantalla: 7 pulgadas o superior (para tablets)
- Conexión a Internet estable

### 2.2 Software Necesario

- **Navegador Web:** Google Chrome (recomendado), Firefox, Safari, Edge
- **Versión del Navegador:** Última versión estable
- **JavaScript:** Habilitado

### 2.3 Conectividad

- **Internet:** Conexión estable de al menos 2 Mbps
- **Red Local:** Recomendado para mayor velocidad

---

## 3. Acceso al Sistema

### 3.1 Cómo Ingresar

1. Abrir el navegador web
2. Ingresar la URL del sistema:
   ```
   http://localhost:5173
   ```
   O la URL proporcionada por el administrador

3. Se mostrará la pantalla de inicio de sesión

### 3.2 Inicio de Sesión

**Pasos:**

1. Ingrese su **email** o **nombre de usuario**
2. Ingrese su **contraseña**
3. Haga clic en **"Iniciar Sesión"**

**Credenciales de Ejemplo:**

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@laviejaestacion.com | Admin123! |
| Gerente | gerente@laviejaestacion.com | Gerente123! |
| Mozo | mozo@laviejaestacion.com | Mozo123! |
| Cajero | cajero@laviejaestacion.com | Cajero123! |

⚠️ **Nota:** Cambiar las contraseñas por defecto en el primer acceso.

### 3.3 Recuperar Contraseña

Si olvidó su contraseña:

1. En la pantalla de login, haga clic en **"¿Olvidaste tu contraseña?"**
2. Ingrese su email registrado
3. Haga clic en **"Enviar Código"**
4. Revise su email (puede tardar unos minutos)
5. Ingrese el código de 6 dígitos recibido
6. Cree una nueva contraseña
7. Confirme la nueva contraseña
8. Haga clic en **"Restablecer Contraseña"**

### 3.4 Cerrar Sesión

Para salir del sistema de forma segura:

1. Haga clic en su nombre de usuario (esquina superior derecha)
2. Seleccione **"Cerrar Sesión"**

---

## 4. Roles y Permisos

### 4.1 Roles del Sistema

El sistema tiene 5 roles principales:

#### 🔐 Administrador
**Acceso completo a todas las funciones**

- Gestión de usuarios y permisos
- Configuración del sistema
- Gestión de productos y menú
- Control total de mesas y pedidos
- Acceso a todos los reportes
- Gestión de inventario y compras

#### 👔 Gerente
**Supervisión y gestión operativa**

- Gestión de productos y precios
- Control de mesas y reservas
- Supervisión de pedidos
- Acceso a reportes de ventas
- Gestión de inventario
- Cierre de caja

#### 🍽️ Mozo
**Atención al cliente y pedidos**

- Ver y asignar mesas
- Tomar y gestionar pedidos
- Ver menú y productos
- Imprimir cuentas

#### 💰 Cajero
**Cobros y cierre de caja**

- Procesar pagos
- Cerrar cuentas
- Emitir tickets
- Realizar cierre de caja
- Ver reportes de ventas diarias

#### 👨‍🍳 Cocina
**Preparación de pedidos**

- Ver pedidos asignados
- Actualizar estado de pedidos
- Marcar pedidos como listos
- Ver detalles de preparación

### 4.2 Permisos por Módulo

| Módulo | Admin | Gerente | Mozo | Cajero | Cocina |
|--------|-------|---------|------|--------|--------|
| Usuarios | ✅ | ❌ | ❌ | ❌ | ❌ |
| Productos | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| Menú Digital | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| Mesas | ✅ | ✅ | ✅ | 👁️ | ❌ |
| Pedidos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Inventario | ✅ | ✅ | ❌ | ❌ | ❌ |
| Compras | ✅ | ✅ | ❌ | ❌ | ❌ |
| Caja | ✅ | ✅ | ❌ | ✅ | ❌ |
| Reportes | ✅ | ✅ | ❌ | 📊 | ❌ |

✅ = Acceso completo | 👁️ = Solo lectura | 📊 = Reportes limitados | ❌ = Sin acceso

---

## 5. Módulo: Menú Digital

### 5.1 ¿Qué es el Menú Digital?

El menú digital es una vista pública que permite a los clientes ver los productos disponibles escaneando un código QR desde su teléfono móvil.

### 5.2 Para Clientes

#### Acceder al Menú

1. **Escanear código QR** desde la cámara del teléfono
2. El navegador abrirá automáticamente el menú digital
3. Navegar por las categorías de productos
4. Ver precios y descripciones

#### Navegación

- **Categorías en acordeón:** Toque una categoría para expandirla
- **Ver productos:** Nombre, descripción, precio e imagen
- **Actualización automática:** Los precios se actualizan en tiempo real

### 5.3 Para Personal (Gestión de Códigos QR)

#### Generar Códigos QR

**Solo Administrador o Gerente:**

1. Ir a **"Configuración"** → **"Códigos QR"**
2. Seleccionar **"Generar QR para Menú"**
3. Elegir:
   - QR general (para todas las mesas)
   - QR por mesa (uno para cada mesa)
4. Descargar los archivos PNG o SVG
5. Imprimir y colocar en las mesas

#### Regenerar QR (cambio de URL)

Si cambió el dominio o URL del sistema:

1. Ir a **"Configuración"** → **"Sistema"**
2. Actualizar **"URL del Frontend"**
3. Ir a **"Códigos QR"** → **"Regenerar QR"**
4. Descargar nuevos códigos
5. Reemplazar los códigos impresos

---

## 6. Módulo: Gestión de Productos

### 6.1 Ver Productos

**Todos los roles pueden ver la lista de productos**

1. Ir al menú **"Productos"**
2. Ver lista completa con:
   - Nombre
   - Categoría
   - Precio
   - Stock (si aplica)
   - Disponibilidad

#### Buscar Productos

- Usar la barra de búsqueda en la parte superior
- Filtrar por categoría usando el dropdown
- Ordenar por nombre o precio

### 6.2 Crear Producto

**Solo Administrador y Gerente**

1. Ir a **"Productos"** → **"Nuevo Producto"**
2. Completar el formulario:
   - **Nombre:** Nombre del producto
   - **Descripción:** Detalles y características
   - **Categoría:** Comidas, Bebidas, Postres, etc.
   - **Precio:** Precio de venta
   - **Costo:** Precio de costo (opcional)
   - **Stock:** Cantidad disponible
   - **Disponible:** Marcar si está disponible para venta
3. **Subir imagen** (opcional pero recomendado)
4. Hacer clic en **"Guardar Producto"**

#### Categorías Disponibles

- 🍔 Comidas
- 🥤 Bebidas
- 🍺 Bebidas Alcohólicas
- 🍰 Postres
- 🥗 Entradas

### 6.3 Editar Producto

1. En la lista de productos, hacer clic en el ícono ✏️ (editar)
2. Modificar los campos necesarios
3. Hacer clic en **"Actualizar Producto"**

### 6.4 Eliminar Producto

⚠️ **Precaución:** Esta acción no se puede deshacer.

1. En la lista de productos, hacer clic en el ícono 🗑️ (eliminar)
2. Confirmar la eliminación
3. El producto se eliminará permanentemente

**Alternativa:** En lugar de eliminar, desmarcar **"Disponible"** para ocultarlo temporalmente.

### 6.5 Cambiar Disponibilidad

Para ocultar un producto temporalmente sin eliminarlo:

1. Editar el producto
2. Desmarcar la casilla **"Disponible"**
3. Guardar cambios

El producto desaparecerá del menú digital pero permanecerá en la base de datos.

---

## 7. Módulo: Sistema POS / Pedidos

### 7.1 Vista de Cocina

**Para rol Cocina**

#### Ver Pedidos Pendientes

1. Ingresar al sistema con usuario de **Cocina**
2. Ver lista de pedidos en pantalla principal
3. Los pedidos se muestran por orden de llegada

#### Estado de Pedidos

- 🔵 **Pendiente:** Recién ingresado, sin preparar
- 🟡 **En Preparación:** Se está cocinando
- 🟢 **Listo:** Terminado, listo para servir
- ⚫ **Entregado:** Ya fue servido al cliente

#### Actualizar Estado

1. Hacer clic en un pedido
2. Ver detalles completos (productos, cantidades, notas)
3. Cambiar estado según progreso:
   - Clic en **"Iniciar Preparación"** cuando comience
   - Clic en **"Marcar como Listo"** cuando termine

#### Filtros

- **Por Estado:** Ver solo pendientes, en preparación, etc.
- **Por Mesa:** Filtrar por número de mesa
- **Por Mozo:** Ver quién tomó el pedido

### 7.2 Toma de Pedidos

**Para roles Mozo, Gerente, Administrador**

#### Crear Pedido Nuevo

1. Ir a **"Pedidos"** → **"Nuevo Pedido"**
2. Seleccionar **Mesa**
3. Agregar productos:
   - Buscar producto en el catálogo
   - Seleccionar cantidad
   - Agregar notas especiales (ej: "sin cebolla")
   - Clic en **"Agregar al Pedido"**
4. Revisar resumen:
   - Productos agregados
   - Cantidades
   - Subtotal
5. Clic en **"Enviar a Cocina"**

#### Modificar Pedido

⚠️ Solo se pueden modificar pedidos en estado **"Pendiente"**

1. Ir a **"Pedidos"** → **"Lista de Pedidos"**
2. Buscar el pedido a modificar
3. Hacer clic en **"Editar"**
4. Agregar o quitar productos
5. Guardar cambios

#### Cancelar Pedido

⚠️ Requiere permiso de Gerente o Administrador

1. Seleccionar pedido a cancelar
2. Clic en **"Cancelar Pedido"**
3. Ingresar motivo de cancelación
4. Confirmar

### 7.3 Cobros y Cierre de Cuenta

**Para roles Cajero, Gerente, Administrador**

#### Cerrar Cuenta

1. Ir a **"Caja"** → **"Cuentas Abiertas"**
2. Seleccionar la mesa a cerrar
3. Ver resumen de consumo:
   - Productos consumidos
   - Cantidades
   - Subtotal
   - Impuestos
   - Total a cobrar
4. Seleccionar **Método de Pago:**
   - Efectivo
   - Tarjeta de débito
   - Tarjeta de crédito
   - Transferencia
5. Si es efectivo, ingresar **Monto Recibido**
6. El sistema calcula el **Vuelto** automáticamente
7. Clic en **"Procesar Pago"**
8. Imprimir ticket (opcional)

#### División de Cuenta

Para dividir una cuenta entre varios clientes:

1. Seleccionar la cuenta
2. Clic en **"Dividir Cuenta"**
3. Elegir modo:
   - **Por partes iguales:** Dividir en N partes
   - **Por productos:** Asignar productos a cada comensal
4. Procesar cada pago individualmente

#### Aplicar Descuentos

1. Antes de procesar el pago
2. Clic en **"Aplicar Descuento"**
3. Elegir tipo:
   - **Porcentaje:** Ej: 10%, 20%
   - **Monto fijo:** Ej: $500
4. Ingresar motivo del descuento
5. Aplicar y procesar pago

---

## 8. Módulo: Gestión de Mesas

### 8.1 Ver Estado de Mesas

**Para roles Mozo, Gerente, Administrador**

1. Ir a **"Mesas"**
2. Ver plano visual del salón:
   - 🟢 Verde = Disponible
   - 🔴 Rojo = Ocupada
   - 🟡 Amarillo = Reservada

3. Información de cada mesa:
   - Número de mesa
   - Capacidad (personas)
   - Estado actual
   - Mozo asignado (si está ocupada)
   - Tiempo transcurrido

### 8.2 Ocupar Mesa

1. Seleccionar una mesa **disponible**
2. Clic en **"Ocupar Mesa"**
3. Ingresar:
   - Número de comensales
   - Mozo asignado
4. Clic en **"Confirmar"**
5. La mesa cambia a estado **Ocupada**

### 8.3 Liberar Mesa

Cuando los clientes se retiran:

1. Asegurarse de que la cuenta esté **cerrada y pagada**
2. Seleccionar la mesa
3. Clic en **"Liberar Mesa"**
4. Confirmar
5. La mesa vuelve a estado **Disponible**

### 8.4 Sistema de Reservas

#### Crear Reserva

1. Ir a **"Mesas"** → **"Reservas"** → **"Nueva Reserva"**
2. Completar formulario:
   - **Cliente:** Nombre y apellido
   - **Teléfono:** Número de contacto
   - **Email:** Correo electrónico (opcional)
   - **Fecha:** Día de la reserva
   - **Hora:** Hora de llegada
   - **Comensales:** Cantidad de personas
   - **Mesa:** Seleccionar mesa (o dejar automático)
   - **Notas:** Ocasiones especiales, alergias, etc.
3. Clic en **"Crear Reserva"**
4. Se envía confirmación por email (si se proporcionó)

#### Ver Reservas

1. Ir a **"Mesas"** → **"Reservas"**
2. Ver calendario con reservas del día/semana
3. Filtrar por:
   - Fecha
   - Estado (pendiente, confirmada, cancelada)
   - Mesa

#### Confirmar Llegada

Cuando el cliente llega:

1. Buscar reserva en el sistema
2. Clic en **"Cliente ha llegado"**
3. La mesa se ocupa automáticamente

#### Cancelar Reserva

1. Seleccionar reserva
2. Clic en **"Cancelar Reserva"**
3. Ingresar motivo (opcional)
4. Confirmar

---

## 9. Módulo: Inventario y Compras

### 9.1 Control de Inventario

**Solo Administrador y Gerente**

#### Ver Stock

1. Ir a **"Inventario"**
2. Ver lista de productos con:
   - Producto
   - Stock actual
   - Stock mínimo
   - Estado (⚠️ si está bajo)

#### Ajustar Stock Manualmente

Para correcciones o conteos:

1. Seleccionar producto
2. Clic en **"Ajustar Stock"**
3. Ingresar:
   - Nueva cantidad
   - Motivo del ajuste
4. Guardar

#### Alertas de Stock Bajo

El sistema envía alertas cuando:
- Stock actual < Stock mínimo
- Se puede configurar para enviar email

### 9.2 Gestión de Proveedores

#### Agregar Proveedor

1. Ir a **"Compras"** → **"Proveedores"** → **"Nuevo"**
2. Completar:
   - Razón social
   - CUIT
   - Teléfono
   - Email
   - Dirección
   - Productos que suministra
3. Guardar

#### Editar/Eliminar Proveedor

- Editar: Clic en ✏️
- Eliminar: Clic en 🗑️ (solo si no tiene compras registradas)

### 9.3 Registro de Compras

#### Crear Compra

1. Ir a **"Compras"** → **"Nueva Compra"**
2. Seleccionar **Proveedor**
3. Agregar productos:
   - Producto
   - Cantidad comprada
   - Precio unitario
   - Subtotal (calculado automáticamente)
4. Ver **Total de la Compra**
5. Adjuntar factura (PDF o imagen) - opcional
6. Clic en **"Registrar Compra"**

⚡ **El stock se actualiza automáticamente**

#### Ver Historial de Compras

1. Ir a **"Compras"** → **"Historial"**
2. Ver lista con:
   - Fecha
   - Proveedor
   - Productos
   - Total
3. Filtrar por:
   - Fecha
   - Proveedor
   - Monto

---

## 10. Módulo: Reportes y Caja

### 10.1 Cierre de Caja

**Para roles Cajero, Gerente, Administrador**

#### Realizar Cierre

1. Ir a **"Caja"** → **"Cierre de Caja"**
2. El sistema muestra automáticamente:
   - **Saldo inicial:** Dinero al inicio del turno
   - **Ingresos en efectivo:** Ventas cobradas en efectivo
   - **Ingresos con tarjeta:** Ventas con tarjeta
   - **Egresos:** Gastos y retiros
   - **Saldo esperado:** Total que debería haber
3. Ingresar **Saldo real:** Dinero contado físicamente
4. El sistema calcula:
   - Diferencia (faltante o sobrante)
5. Ingresar observaciones si hay diferencias
6. Clic en **"Cerrar Caja"**
7. Imprimir reporte

### 10.2 Reportes de Ventas

#### Ventas por Período

1. Ir a **"Reportes"** → **"Ventas"**
2. Seleccionar:
   - Fecha desde
   - Fecha hasta
   - Tipo de reporte (día, semana, mes, custom)
3. Ver gráfico y tabla con:
   - Ventas totales
   - Cantidad de transacciones
   - Ticket promedio
   - Comparación con períodos anteriores

#### Ventas por Producto

1. Ir a **"Reportes"** → **"Productos Más Vendidos"**
2. Ver ranking de productos:
   - Unidades vendidas
   - Ingresos generados
   - Porcentaje del total
3. Exportar a Excel/PDF

#### Ventas por Empleado

1. Ir a **"Reportes"** → **"Rendimiento de Personal"**
2. Ver estadísticas por mozo/cajero:
   - Ventas totales
   - Número de atenciones
   - Ticket promedio
   - Propinas

### 10.3 Reportes de Inventario

1. Ir a **"Reportes"** → **"Inventario"**
2. Ver:
   - Valorización del stock
   - Productos con bajo stock
   - Rotación de productos
   - Valor total del inventario

### 10.4 Flujo de Efectivo

1. Ir a **"Reportes"** → **"Flujo de Caja"**
2. Ver:
   - Ingresos por ventas
   - Egresos por compras
   - Balance del período
   - Gráfico de flujo

### 10.5 Exportar Reportes

Todos los reportes pueden exportarse:

1. Después de generar un reporte
2. Clic en **"Exportar"**
3. Elegir formato:
   - **PDF:** Para impresión
   - **Excel:** Para análisis adicional
   - **CSV:** Para integración con otros sistemas

---

## 11. Preguntas Frecuentes

### 11.1 General

**P: ¿Puedo usar el sistema desde mi celular?**  
R: Sí, el sistema es totalmente responsive y funciona en smartphones y tablets.

**P: ¿Se puede usar sin internet?**  
R: No, el sistema requiere conexión a internet constante para funcionar.

**P: ¿Los datos están seguros?**  
R: Sí, todos los datos están encriptados y protegidos. Las contraseñas nunca se almacenan en texto plano.

### 11.2 Menú Digital

**P: ¿El menú se actualiza automáticamente?**  
R: Sí, cualquier cambio en productos o precios se refleja inmediatamente en el menú digital.

**P: ¿Los clientes pueden pedir desde el menú?**  
R: En la versión actual, solo pueden ver el menú. La función de pedidos en línea está en desarrollo.

**P: ¿Cómo imprimo los códigos QR?**  
R: Descargue los archivos PNG desde "Configuración → Códigos QR" e imprímalos en tamaño mínimo 5x5 cm.

### 11.3 Pedidos

**P: ¿Se puede modificar un pedido después de enviarlo?**  
R: Solo si está en estado "Pendiente" y con permiso de gerente.

**P: ¿Cómo cancelo un pedido?**  
R: Requiere permiso de gerente. Seleccione el pedido y use la opción "Cancelar".

**P: ¿Se notifica a cocina automáticamente?**  
R: Sí, cocina recibe notificaciones en tiempo real de nuevos pedidos.

### 11.4 Inventario

**P: ¿El stock se descuenta automáticamente al vender?**  
R: Sí, el stock se actualiza automáticamente con cada venta.

**P: ¿Recibo alertas de stock bajo?**  
R: Sí, el sistema envía notificaciones cuando el stock está por debajo del mínimo configurado.

**P: ¿Cómo registro mercadería vencida o rota?**  
R: Use "Inventario → Ajustar Stock" e indique el motivo.

---

## 12. Solución de Problemas

### 12.1 No puedo iniciar sesión

**Problema:** "Usuario o contraseña incorrectos"

**Soluciones:**
1. Verificar que esté escribiendo el email correcto
2. Verificar que la contraseña no tenga espacios
3. Usar "Recuperar contraseña" si la olvidó
4. Contactar al administrador si el usuario fue deshabilitado

### 12.2 El menú digital no carga

**Problema:** Al escanear el QR, el menú no se muestra

**Soluciones:**
1. Verificar que tenga conexión a internet
2. Verificar que el servidor esté corriendo
3. Intentar acceder manualmente a la URL
4. Limpiar caché del navegador
5. Regenerar el código QR

### 12.3 No puedo ver ciertos módulos

**Problema:** Faltan opciones en el menú

**Solución:**
- Es normal. Su rol de usuario determina qué módulos puede acceder.
- Contacte al administrador si necesita más permisos.

### 12.4 Error al crear pedido

**Problema:** "Error al guardar el pedido"

**Soluciones:**
1. Verificar que la mesa esté ocupada
2. Verificar que haya productos en el pedido
3. Verificar conexión a internet
4. Recargar la página e intentar nuevamente

### 12.5 Los datos no se actualizan

**Problema:** No veo cambios recientes

**Soluciones:**
1. Refrescar la página (F5)
2. Cerrar sesión y volver a ingresar
3. Limpiar caché del navegador
4. Verificar conexión a internet

### 12.6 Error al imprimir

**Problema:** No se genera el PDF o ticket

**Soluciones:**
1. Verificar que el navegador permita ventanas emergentes
2. Verificar que tenga instalado un lector de PDF
3. Intentar con otro navegador
4. Descargar el archivo en lugar de imprimirlo directamente

---

## 13. Contacto y Soporte

### 13.1 Soporte Técnico

**Email:** soporte.laviejaestacion@gmail.com  
**Horario:** Lunes a Viernes, 9:00 - 18:00

### 13.2 Reportar Errores

Si encuentra un error o bug:

1. Tomar captura de pantalla
2. Anotar los pasos para reproducir el error
3. Enviar email con:
   - Descripción del problema
   - Capturas de pantalla
   - Navegador y versión
   - Pasos para reproducir

### 13.3 Solicitar Funcionalidades

Para sugerir nuevas funcionalidades:

1. Enviar email a: sugerencias.laviejaestacion@gmail.com
2. Describir la funcionalidad deseada
3. Explicar el caso de uso
4. El equipo evaluará la sugerencia

### 13.4 Capacitación

¿Necesita capacitación para su equipo?

- Ofrecemos sesiones de capacitación personalizadas
- Presencial o virtual
- Contactar para coordinar

---

## Apéndice A: Atajos de Teclado

| Acción | Atajo |
|--------|-------|
| Buscar producto | `Ctrl + F` |
| Nuevo pedido | `Ctrl + N` |
| Guardar | `Ctrl + S` |
| Cerrar sesión | `Alt + X` |
| Ayuda | `F1` |

---

## Apéndice B: Glosario

- **POS:** Point of Sale (Punto de Venta)
- **Stock:** Cantidad de productos disponibles
- **Ticket:** Comprobante de venta
- **Mozo:** Mesero o camarero
- **Comanda:** Pedido de cocina
- **Flujo de caja:** Movimiento de dinero (entradas y salidas)

---

**Manual de Usuario - Versión 1.0.0**  
**La Vieja Estación RestoBar**  
**UTN - Tecnicatura Universitaria en Programación**  
**Noviembre 2025**
