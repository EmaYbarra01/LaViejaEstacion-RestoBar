import { connect } from './connection.js';
const connection = await connect({ database: true });
try {
  const [incidents] = await connection.query('SELECT * FROM v_incidencias_integridad');
  const [extra] = await connection.query('SELECT * FROM v_incidencias_modulos');
  incidents.push(...extra);
  const [counts] = await connection.query(`SELECT 'usuarios' tabla, COUNT(*) cantidad FROM usuarios
    UNION ALL SELECT 'productos',COUNT(*) FROM productos
    UNION ALL SELECT 'mesas',COUNT(*) FROM mesas
    UNION ALL SELECT 'pedidos',COUNT(*) FROM pedidos
    UNION ALL SELECT 'pagos_pedido',COUNT(*) FROM pagos_pedido
    UNION ALL SELECT 'cierres_caja',COUNT(*) FROM cierres_caja
    UNION ALL SELECT 'empleados',COUNT(*) FROM empleados
    UNION ALL SELECT 'asistencias',COUNT(*) FROM asistencias
    UNION ALL SELECT 'inasistencias',COUNT(*) FROM inasistencias
    UNION ALL SELECT 'pagos_empleado',COUNT(*) FROM pagos_empleado
    UNION ALL SELECT 'mensajes',COUNT(*) FROM mensajes
    UNION ALL SELECT 'ventas',COUNT(*) FROM ventas`);
  console.table(counts);
  console.table(incidents);
  console.log(incidents.length ? 'Hay incidencias para revisar.' : 'Integridad: OK (cero incidencias).');
  if (incidents.length) process.exitCode = 1;
} finally { await connection.end(); }
