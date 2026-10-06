# MySQL: estructura y demo de La Vieja Estación

Estado: etapas de diseño y datos de prueba completadas. La API existente todavía
usa MongoDB. Los servicios SQL de pedidos están implementados y probados, pero
no están conectados a las rutas de Express: aún falta adaptar los demás módulos
y verificar el contrato de respuestas con React antes de cambiar la conexión.

## Cargar desde Workbench (Windows 10)

1. Descargar `INSTALAR_DEMO.sql`.
2. Abrir Workbench y entrar en la conexión local que ya funciona.
3. Ir a **File → Open SQL Script** y abrir el archivo descargado.
4. Ejecutar **todo el archivo** con el botón del rayo que ejecuta el script completo.
   En el editor no seleccionar un fragmento ni usar el rayo de la sentencia actual.
5. Revisar **Action Output**. Todas las sentencias deben finalizar correctamente.
6. Actualizar el panel **SCHEMAS**. Aparecerá `restobar_mysql_demo`.
7. La consulta `SELECT * FROM restobar_mysql_demo.v_incidencias_integridad;`
   debe devolver cero filas.

Ejecutar una sola vez en una base nueva. El archivo no borra bases ni tablas;
si una tabla ya existe, detener la ejecución y revisar el error, sin continuar
con la carga de datos. El DDL de MySQL no es una transacción: un fallo durante
la creación puede dejar algunas tablas creadas. Para una carga parcialmente
fallida no volver a ejecutar sin revisar primero qué se creó.

El último bloque del archivo muestra los estados, los cobros y el cierre.
La demo contiene 9 usuarios ficticios, 16 productos, 8 mesas, 8 pedidos,
3 pagos y 1 cierre. Los datos originales de MongoDB no se importan.

## Datos de demostración

| Estado | Pedidos |
|---|---:|
| Pendiente | 1 |
| En Preparación | 1 |
| Listo | 1 |
| Entregado sin pago | 1 |
| Cobrado | 3 |
| Cancelado con motivo, fecha y usuario | 1 |

Los precios, nombres e imágenes del catálogo se tomaron de la exportación de
productos. El stock, los usuarios y todas las operaciones son nuevos y ficticios.
No se copiaron contraseñas ni información personal de los usuarios originales.
Las fechas de la demo son fijas (5, 6 y 7 de octubre de 2026) para reproducir pruebas.
Las marcas de tiempo de operaciones se guardan en UTC; la reserva usa fecha y
hora de la agenda local del restaurante, en America/Argentina/Buenos_Aires.

El cierre del 5 de octubre incluye solo 2 pagos de ese turno:

| Concepto | Importe |
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

Un tercer pago del día siguiente queda pendiente de cierre. El vuelto no se
suma a las ventas ni al efectivo esperado. El pedido cancelado no tiene pago
y sus movimientos de stock se compensan.

Hay una compra pendiente: **1 caja = 24 unidades**, con producto y factor de
conversión explícitos. Todavía no suma stock porque no fue recibida. Hay además
una reserva futura, empleados, asistencia, inasistencia, pago salarial y mensajes.
Tokens de recuperación, ventas independientes y recepciones quedan vacíos.

Los correos de prueba son `usuario1@restobar.example` a `usuario9@restobar.example`.
La contraseña de demo es `DemoResto2026!`, almacenada con bcrypt. Son credenciales
públicas de prueba: se reemplazarán al crear cuentas del entorno compartido.

| Usuario | Rol |
|---|---|
| usuario1 | SuperAdministrador |
| usuario2 | Gerente |
| usuario3, usuario6, usuario7, usuario8 | Mozo |
| usuario4 | Cajero |
| usuario5, usuario9 | EncargadoCocina |

Estos usuarios aún no permiten iniciar sesión en la aplicación actual, que sigue
consultando MongoDB.

## Archivos y ejecución desde Node

`INSTALAR_DEMO.sql` reúne, en orden, los archivos `001_schema.sql`,
`002_integridad.sql`, `003_demo.sql` y `004_verificacion.sql` para Workbench.
Se usa una alternativa de instalación: Workbench **o** Node, no ambas sobre la misma base.

Para Node, desde la carpeta `backend`:

```bash
npm install
npm run db:mysql:setup
npm run db:mysql:check
```

Agregar al archivo local `backend/.env` sin quitar las variables existentes:

```dotenv
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=tu_clave_local
```

No subir `.env` a GitHub. El instalador de Node se detiene si encuentra tablas en
`restobar_mysql_demo`; no las sobrescribe. Usar `npm run db:mysql:check` después
para inspeccionar la integridad.

## Diseño: 28 tablas

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

El dinero usa DECIMAL; los detalles conservan sus precios históricos. Las claves
foráneas impiden referencias inexistentes. Un pedido tiene hasta un pago completo.
Las ventas de `ventas` corresponden a las rutas independientes de Sale y no se
sumarán otra vez en los reportes del POS.

Los cierres se crean como Abierto, se asocian sus pagos/movimientos/billetes y se
confirman como Cerrado en una transacción. La confirmación concilia sus importes.
Los pagos confirmados y los detalles de operaciones finalizadas son inmutables.
Los triggers cubren estas reglas puntuales; el backend sigue siendo responsable
de permisos, transiciones, cantidades, stock y escrituras atómicas.

## Validación realizada

Se ejecutó la creación completa en MySQL **8.0.46**, sin incidencias. Pasaron
**23 pruebas**: 15 de integridad SQL, 6 de servicios de pedidos y 2 del lector SQL.
Incluyen referencias inválidas, stock negativo, pago insuficiente, estados,
duplicación de pagos, turno de cierre, cambios tardíos, precio histórico,
renglones repetidos y reposición de stock una sola vez.

Pruebas unitarias del lector (no necesitan servidor):

```bash
npm run test:mysql
```

Para ejecutar también las pruebas de integración sobre la demo recién cargada,
en PowerShell desde `backend`:

```powershell
$env:MYSQL_TESTS = "1"
npm run test:mysql
```

Los casos de integración revierten sus escrituras al terminar; pueden avanzar
contadores AUTO_INCREMENT. Requieren una demo intacta para comparar los importes
esperados. No se ha probado aún la integración de React ni los cuatro equipos.

## Continuación autorizada

1. Conectar los servicios SQL de pedidos a los controladores manteniendo el
   contrato de JSON y los eventos de Socket.IO; adaptar login, usuarios, productos
   y mesas para usar IDs SQL. Emitir eventos solo después del commit.
2. Adaptar reservas (confirmación y agenda), compras (recepción con conversión),
   cierres, empleados, mensajes, recuperación y reportes. Revisar las rutas de
   compras/reportes, actualmente desactivadas en `index.js`.
3. Probar permisos y flujos de extremo a extremo con React. Los servicios de
   `src/services/mysql/pedidos.js` no reemplazan aún los controladores Mongoose.
4. Elegir y configurar el servidor MySQL compartido. Los cuatro integrantes
   necesitan acceso a la misma base/servidor; instalar cuatro bases locales no
   sincroniza datos. Versionar estructura y migraciones; crear usuarios del
   equipo y configuración local de conexión. No usar root para la aplicación.
5. Probar dos sesiones simultáneas y Socket.IO contra el backend compartido.
   Workbench necesita volver a ejecutar SELECT para mostrar cambios.

La autorización ya está dada para continuar esas tareas. La provisión del
servidor compartido depende de elegir el alojamiento y disponer de su acceso;
no se creó ni contrató un servicio externo en esta etapa.

Referencias técnicas: [claves foráneas](https://dev.mysql.com/doc/refman/8.0/en/create-table-foreign-keys.html),
[CHECK](https://dev.mysql.com/doc/refman/8.0/en/create-table-check-constraints.html),
[transacciones](https://dev.mysql.com/doc/refman/8.0/en/commit.html).
