# La Vieja Estación - RestoBar: base de datos MySQL

Esquema relacional de 28 tablas con datos iniciales ficticios para validar el
proyecto académico. Los servicios SQL de pedidos están implementados y probados.
La API actual todavía usa MongoDB: falta conectar estos servicios a Express y
adaptar los demás módulos antes de cambiar la conexión de la aplicación.

## Instalación en Workbench

1. Descargar `INSTALAR_BASE_DATOS.sql`.
2. Abrir la conexión local de Workbench.
3. Ir a **File → Open SQL Script** y abrir el archivo.
4. Ejecutar el script completo una sola vez, sin seleccionar un fragmento.
5. Revisar **Action Output** y actualizar el panel **SCHEMAS**.
6. Seleccionar `la_vieja_estacion`.

El script crea una base nueva. No borra ni cambia la base de la versión anterior.
Si `la_vieja_estacion` ya contiene tablas, detenerse ante el error y revisar lo
existente: no volver a cargar ni continuar insertando los datos. El DDL de MySQL
no es transaccional; un fallo puede dejar algunas tablas creadas.

Para mostrar el proyecto, abrir `PRESENTAR_BASE_DATOS.sql`. Sus consultas muestran
roles, carta, stock, mesas, pedidos, cobros, caja, compras y reservas. No modifican
datos ni muestran hashes de contraseñas. Escribir `la_vieja_estacion` en el filtro
del panel SCHEMAS permite mostrar solo esta base.

La consulta `SELECT * FROM la_vieja_estacion.v_incidencias_integridad;` debe
devolver cero filas.

## Hora argentina y almacenamiento

Argentina usa UTC−03:00. Se mantienen las fechas de operaciones en UTC y las
conexiones de escritura usan `SET time_zone = '+00:00'`. Esto permite que los
cuatro integrantes y el futuro servidor compartido interpreten las fechas igual.

En MySQL, cambiar la zona de la sesión no convierte los valores de DATETIME
ya guardados. Las vistas `v_pedidos_presentacion` y `v_cierres_presentacion`
usan `CONVERT_TZ(fecha, '+00:00', '-03:00')` para mostrar la hora argentina.
Por ejemplo, 14:01 UTC se muestra como 11:01 en Argentina.

`PRESENTAR_BASE_DATOS.sql` establece `SET time_zone = '-03:00'` solo para la
sesión de consulta. Sus vistas también convierten las fechas guardadas en UTC.
No se debe usar esa sesión para insertar fechas de operaciones sin convertirlas
a UTC. El backend restablece UTC al comenzar sus transacciones.

La fecha y hora de las reservas corresponden a la agenda local del restaurante;
no se convierten como si fueran marcas UTC. Los campos de asistencia también
representan el día y el horario local de trabajo.

## Datos iniciales

Se cargan 9 usuarios ficticios, 16 productos, 8 mesas, 8 pedidos, 3 pagos y 1 cierre.
Nombres, DNI, correos y operaciones son ficticios. Los nombres, precios e imágenes
del catálogo provienen de la exportación de productos. El stock se inicializa
nuevamente con sus movimientos de apertura. Las fechas son fijas, del 5 al 7 de
octubre de 2026, para reproducir las pruebas.

| Estado del pedido | Cantidad |
|---|---:|
| Pendiente | 1 |
| En Preparación | 1 |
| Listo | 1 |
| Entregado sin pago | 1 |
| Cobrado | 3 |
| Cancelado con motivo, fecha y usuario | 1 |

La numeración usa `PED-YYYYMMDD-NNNN`, como el servicio de pedidos. Las secuencias
quedan inicializadas para evitar números repetidos al crear nuevos pedidos.
El pedido cancelado no tiene pago y su stock se restituye una sola vez.

| Concepto del cierre del 5 de octubre | Importe |
|---|---:|
| Ventas en efectivo | $7.200 |
| Ventas por transferencia | $34.000 |
| Total vendido | $41.200 |
| Descuentos | $800 |
| Fondo inicial | $20.000 |
| Gastos en efectivo | $1.000 |
| Ingresos adicionales en efectivo | $1.000 |
| Efectivo esperado y contado | $27.200 |
| Diferencia | $0 |

El cierre incluye únicamente dos pagos de su turno. Un tercer pago del día
siguiente queda pendiente de cierre. El vuelto no aumenta las ventas.
Hay una compra pendiente de una caja de 24 unidades, con producto y conversión
explícitos; no modifica stock hasta recibirla. También hay una reserva, empleados,
asistencia, inasistencia, pago salarial y mensajes.

| Usuario ficticio | Rol | Correo |
|---|---|---|
| Lucas Ferreyra | SuperAdministrador | lucas.ferreyra@laviejaestacion.example |
| Valeria Medina | Gerente | valeria.medina@laviejaestacion.example |
| Mario García | Mozo | mario.garcia@laviejaestacion.example |
| Lucía Pérez | Cajero | lucia.perez@laviejaestacion.example |
| Diego Ruiz | EncargadoCocina | diego.ruiz@laviejaestacion.example |
| Sofía López | Mozo | sofia.lopez@laviejaestacion.example |
| Tomás Soria | Mozo | tomas.soria@laviejaestacion.example |
| Julieta Ríos | Mozo | julieta.rios@laviejaestacion.example |
| Carla Vega | EncargadoCocina | carla.vega@laviejaestacion.example |

La contraseña de estas cuentas de validación es `RestoBar2026!`, guardada con
bcrypt. Son credenciales públicas de prueba; se reemplazarán al crear cuentas
del entorno compartido. Los correos .example no son buzones reales. Estas cuentas
no permiten iniciar sesión todavía en la aplicación que consulta MongoDB.

## Instalación alternativa desde Node

Elegir Workbench o Node; no ejecutar ambos instaladores sobre la misma base.
Desde `backend`, agregar al archivo local `.env`, conservando sus otras variables:

```dotenv
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=tu_clave_local
```

No subir `.env` a GitHub. Ejecutar:

```bash
npm install
npm run db:mysql:setup
npm run db:mysql:check
```

El instalador se detiene si encuentra tablas en `la_vieja_estacion`.
`INSTALAR_BASE_DATOS.sql` reúne `001_schema.sql`, `002_integridad.sql`,
`003_datos_iniciales.sql` y `004_verificacion.sql` en ese orden.

## Tablas y controles

| Área | Tablas |
|---|---|
| Usuarios y catálogo | roles, usuarios, categorias, productos, mesas |
| Reservas | reservas |
| Pedidos | pedidos, detalle_pedido, historial_estados_pedido, pagos_pedido |
| Stock | movimientos_stock |
| Compras | proveedores, compras, detalle_compra, recepciones_compra |
| Caja | cierres_caja, cierre_pagos, movimientos_caja, desglose_caja |
| Personal | empleados, asistencias, inasistencias, pagos_empleado |
| Comunicación y acceso | mensajes, recuperaciones_password |
| Ventas independientes | ventas, detalle_venta |
| Numeración concurrente | secuencias |

Dinero en DECIMAL, claves foráneas y precios históricos en el detalle.
Hasta un pago completo por pedido. Los cierres se construyen como Abierto y
se confirman como Cerrado después de conciliar pagos, movimientos y billetes.
Los pagos confirmados y detalles de operaciones finalizadas son inmutables.
Los permisos, transiciones y escrituras relacionadas se validan en el backend.

Las ventas independientes conservan el módulo Sale; no se suman nuevamente
a reportes del POS. Tokens, recepciones y ventas independientes comienzan vacíos.

## Pruebas y tareas pendientes

La instalación y los servicios se prueban en MySQL 8.0.46. Ejecutar el lector SQL
sin servidor con `npm run test:mysql`. Para incluir integración sobre la base
inicial intacta, en PowerShell desde `backend`:

```powershell
$env:MYSQL_TESTS = "1"
npm run test:mysql
```

Los casos revierten sus escrituras; pueden avanzar contadores AUTO_INCREMENT.
Se verifican cobros, roles, estados, stock, cancelaciones, cierres, precios
históricos, presentación sin etiquetas genéricas y conversión de hora argentina.
La integración completa con React y los cuatro equipos sigue pendiente.

La continuación autorizada incluye adaptar controladores y formatos JSON,
conservar eventos Socket.IO después del commit, adaptar los demás módulos y
configurar el servidor compartido. Cuatro instalaciones locales no sincronizan
los registros: el equipo necesitará una misma base/servidor y un backend común.
Workbench necesita volver a ejecutar SELECT para mostrar cambios.

Referencias: [zona horaria en MySQL](https://dev.mysql.com/doc/mysql-g11n-excerpt/8.0/en/time-zone-support.html),
[claves foráneas](https://dev.mysql.com/doc/refman/8.0/en/create-table-foreign-keys.html),
[CHECK](https://dev.mysql.com/doc/refman/8.0/en/create-table-check-constraints.html).
