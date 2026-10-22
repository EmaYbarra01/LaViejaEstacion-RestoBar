# Compras con MySQL

El módulo usa `compras`, `detalle_compra`, `proveedores`, `recepciones_compra` y `movimientos_stock`. Se activa `/api/compras`, antes deshabilitada. El formato conserva `_id` como alias de los identificadores SQL para facilitar la compatibilidad.

## Aplicar en una base existente

1. Incorporar esta rama al proyecto conservando los `.env` locales.
2. Detener el backend con Ctrl+C.
3. En `backend`, ejecutar:

```powershell
npm run db:mysql:migrate:compras
npm run db:mysql:check
npm run dev
```

La actualización agrega `pagos_compra`, sus protecciones contra modificación y eliminación de pagos, y alinea la secuencia de compras. Se puede repetir. No reinstala la base ni vuelve a cargar los datos iniciales. Verificada con MySQL 8.0.46; las sentencias `CREATE TRIGGER IF NOT EXISTS` requieren 8.0.29 o posterior.

Las bases nuevas creadas con `npm run db:mysql:setup` incluyen la actualización. También se incluye al final de `INSTALAR_BASE_DATOS.sql`, reservado para instalaciones nuevas.

Los documentos de MongoDB no se importan automáticamente: las operaciones del módulo pasan a usar los registros SQL existentes. No se inventan pagos para compras históricas. Si hay documentos de compras reales que conservar, exportarlos y mapear sus identificadores de proveedor y producto antes de importarlos.

## Primera comprobación en PowerShell

En una segunda terminal, iniciar sesión con un gerente de la carga inicial:

```powershell
$datosGerente = @{ email = 'valeria.medina@laviejaestacion.example'; password = 'RestoBar2026!' } | ConvertTo-Json
$sesionGerente = Invoke-RestMethod -Uri 'http://localhost:4000/api/login' -Method Post -ContentType 'application/json; charset=utf-8' -Body ([System.Text.Encoding]::UTF8.GetBytes($datosGerente))
$headersGerente = @{ Authorization = "Bearer $($sesionGerente.token)" }
$compras = Invoke-RestMethod -Uri 'http://localhost:4000/api/compras' -Headers $headersGerente
$compras | Select-Object numeroCompra, estado, subtotal, total, totalPagado, saldoPendiente | Format-Table -AutoSize
```

Si se conserva la carga inicial, la compra 1 figura Pendiente con subtotal 20.000, IVA 4.200 y total/saldo 24.200. No es necesario crear otra compra para comprobar la consulta.

## Operaciones

Todas requieren sesión de Gerente o SuperAdministrador. El servicio vuelve a comprobar el rol y el estado activo en MySQL.

| Método | Ruta | Operación |
| --- | --- | --- |
| GET | `/api/compras` | Listado con filtros `estado`, `proveedor`, `fechaInicio`, `fechaFin` |
| GET | `/api/compras/:id` | Detalle, recepciones acumuladas, pagos y saldo |
| POST | `/api/compras` | Registrar compra Pendiente |
| PUT | `/api/compras/:id` | Editar una Pendiente sin recepciones ni pagos |
| DELETE | `/api/compras/:id` | Eliminar una Pendiente sin movimientos |
| PATCH | `/api/compras/:id/recepcion` | Registrar cantidades acumuladas recibidas |
| PATCH | `/api/compras/:id/estado` | Cancelar con `{ "estado": "Cancelada" }` |
| PATCH | `/api/compras/:id/pago` | Registrar pago parcial o completo |
| GET | `/api/compras/pendientes` | Compras Pendientes de recepción |
| GET | `/api/compras/pendientes-pago` | Compras no canceladas con saldo |
| GET | `/api/compras/proveedor/:proveedor` | Filtrar por nombre de proveedor |
| GET | `/api/compras/reporte/proveedor` | Agrupar compras no canceladas por proveedor |

También se conservan los alias PUT de recepción y cancelación. Las fechas de los filtros son días argentinos completos (UTC-03:00); se almacenan los instantes en UTC.

### Registrar compra

```json
{
  "proveedor": { "nombre": "Distribuidora del Norte" },
  "productos": [{
    "nombre": "Cerveza Quilmes 1L - caja de 24",
    "productoId": 1,
    "cantidad": 2,
    "unidadMedida": "Caja",
    "factorStock": 24,
    "precioUnitario": 20000
  }],
  "impuestos": { "iva": { "porcentaje": 21 } },
  "metodoPago": "Cuenta Corriente",
  "numeroFactura": "A-0001-00000002",
  "observaciones": "Pedido de reposición"
}
```

El backend calcula los subtotales y el IVA en centavos, sin confiar en el total enviado por el cliente. `cantidad` y `factorStock` admiten hasta tres decimales; el precio admite dos. Un producto sin `productoId` registra un gasto de compra sin modificar el catálogo. Para productos vinculados, `factorStock` expresa cuántas unidades de stock hay en cada unidad comprada. Si ambas unidades coinciden, se asume factor 1; si difieren debe indicarse explícitamente.

### Recepción

```json
{ "productosRecibidos": [{ "detalleId": 5, "cantidadRecibida": 1 }] }
```

`detalleId` es el ID del renglón de compra, devuelto en `compra.productos[].id`. Se admite `productoId` como alias heredado del ID de renglón; no es el identificador del catálogo.

La cantidad es acumulada: recibir primero 1 caja y después 2 significa sumar 1 caja adicional. Repetir 2 no suma nada. Cada incremento guarda recepción, movimiento de stock y estado dentro de la misma transacción. Los renglones ajenos, repetidos, cantidades menores a lo ya recibido o mayores a lo pedido se rechazan. Los estados Parcial y Recibida se calculan a partir de las cantidades; no se pueden imponer mediante una edición.

### Pago

```json
{
  "monto": 10000,
  "metodoPago": "Transferencia",
  "referencia": "Número de operación bancaria",
  "idempotencyKey": "pago-compra-2-operacion-001"
}
```

Usar una clave nueva para cada pago y conservar la misma si se reintenta la misma operación. La clave tiene entre 8 y 100 caracteres. Dos solicitudes iguales con la misma clave registran un solo pago; reutilizarla con otros datos devuelve conflicto. El saldo nunca puede ser negativo. Cuenta Corriente describe la condición de la compra, y no se acepta como medio de un pago efectivo.

Los pagos de proveedores no se incorporan automáticamente a cierres de caja: deben conciliarse por el procedimiento de gastos que ya utilice el negocio. No se alteran cierres históricos.

Una compra con recepción parcial/completa o pagos no puede eliminarse. Cancelar una compra con mercadería recibida o pagos requiere un circuito de devolución/reintegro, fuera del alcance de esta migración.

## Verificación realizada

- 43 pruebas con MySQL 8.0.46, sin omisiones: reservas, pedidos, integridad y compras.
- Recepciones concurrentes, pagos concurrentes iguales y pagos distintos que compiten por el mismo saldo.
- Rutas HTTP: permisos, consulta, creación, recepción y rechazo de cambios de estado incoherentes.
- Migración repetida sobre la base de prueba, conservando datos.
- Compilación del frontend e integridad SQL sin incidencias.

Los casos de concurrencia/HTTP crean y eliminan una base temporal independiente. Los demás casos SQL usan transacciones y rollback. Las pruebas requieren un servidor de pruebas con la carga inicial y permisos para crear la base temporal:

```powershell
$env:MYSQL_TESTS = '1'
npm run test:mysql
Remove-Item Env:MYSQL_TESTS
```

La versión actual del frontend no tiene una pantalla de Compras conectada; esta etapa habilita y verifica la API. No se modifican pantallas existentes.

## Orden de las siguientes migraciones

1. Dashboard y reportes: reemplazar agregaciones de Mongo por consultas de pedidos, pagos, productos y compras SQL.
2. Empleados: legajos, asistencias, inasistencias y pagos.
3. Mensajes: consultas y persistencia, conservando Socket.io.
4. Recuperación de contraseña: usuarios y tokens SQL.
5. Revisar `/sales`: el circuito heredado usa Mongo y roles antiguos; debe conciliarse con los pedidos/pagos SQL para evitar duplicar ventas.
6. Retirar la conexión y dependencias Mongo cuando todas las rutas activas estén migradas y verificadas.
