# Importar los historiales pendientes de MongoDB

El servidor ya funciona con MySQL; eso no acredita que sus historiales de Mongo hayan sido trasladados. Antes de borrar una colección o dar de baja Atlas, hacer respaldo y conciliar sus registros con SQL.

Esta herramienta importa únicamente empleados (con asistencias, inasistencias y pagos), mensajes y sales. Usuarios y productos del archivo se utilizan para resolver referencias contra las cuentas y el catálogo SQL ya migrados; no reemplaza sus datos, contraseñas ni stock. No importar aquí pedidos, compras, reservas o cierres: los rechaza en vez de omitirlos. Si todavía existen registros exclusivos de esas colecciones en Mongo, requieren una exportación y conciliación aparte antes del corte definitivo.

## Preparar el archivo

Exportar desde Compass en formato JSON relajado: un array completo por colección, sin filtro. Conservar _id y referencias. Para usuarios alcanza con _id, email y dni; no incluir hashes de contraseñas. Productos: _id, codigo y nombre (o name). Guardar fuera del repositorio.

Reunir las listas en un objeto:

```json
{
  "usuarios": [],
  "productos": [],
  "empleados": [],
  "mensajes": [],
  "sales": []
}
```

Los arrays deben contener los documentos exportados; no usar este objeto vacío como supuesto respaldo. Los IDs Mongo pueden ser texto o {"$oid":"..."}; fechas como texto ISO o {"$date":"..."}. Conservar los números como valores JSON, no en formato canónico $numberDouble/$numberLong.

Correspondencias: usuario por email, con validación del DNI si fue exportado. Producto por código o nombre único. Una cuenta/producto ausente o ambiguo detiene toda la importación. No asumir que el ID numérico SQL corresponde a un ObjectId.

## Simular primero

Con el backend detenido, desde backend:

```powershell
npm run db:mysql:import:pendientes -- "D:\Respaldos\pendientes-mongo.json"
```

Ejecuta toda la validación e inserción dentro de una transacción y termina en ROLLBACK. No modifica datos persistentes. Revisar el resumen y cualquier conflicto.

Si hay legajos SQL existentes, no los sobrescribe automáticamente. Después de revisar que son las mismas personas, simular la vinculación:

```powershell
npm run db:mysql:import:pendientes -- "D:\Respaldos\pendientes-mongo.json" --vincular-legajos
```

Esta opción conserva la ficha SQL (cargo, salario, estado y contratación) e incorpora el historial exportado. No pisa jornadas ni pagos locales: una fecha o mes ya existente produce un conflicto y revierte toda la importación para que puedan conciliarlo.

## Confirmar

Solo después de una simulación correcta:

```powershell
npm run db:mysql:import:pendientes -- "D:\Respaldos\pendientes-mongo.json" --aplicar
npm run db:mysql:check
```

Agregar --vincular-legajos si fue la opción revisada en la simulación. La tabla migracion_mongo_ids registra cada documento importado: reintentar el mismo archivo no duplica registros. Si un documento ya importado cambia, se detiene para revisión.

Las ventas importadas preservan precios y fecha históricos, verifican el total y NO descuentan stock otra vez. Sales no acredita un cobro POS ni se agrega a reportes de pedidos; no duplicar registros entre ambos circuitos.

## Tokens y corte definitivo

No trasladar tokens de recuperación de contraseña de Mongo. Desde el nuevo sistema, solicitar enlaces nuevos; se guardan como hash, vencen en una hora y se consumen una sola vez.

Revisar conteos, importes y registros faltantes, no solamente que arranque el servidor. No borrar Mongo hasta confirmar qué historiales existían, cuáles fueron importados y cuáles ya estaban en SQL.
