import { readFile } from 'node:fs/promises';
import { statements } from './sqlFile.js';

export async function instalarHistorialEmpleados(connection) {
  const sql = await readFile(new URL('../../database/mysql/008_historial_estados_empleados.sql', import.meta.url), 'utf8');
  for (const statement of statements(sql)) {
    const trigger = statement.match(/^CREATE TRIGGER\s+(\w+)/i);
    if (trigger) {
      const [[existing]] = await connection.execute(
        'SELECT COUNT(*) AS cantidad FROM information_schema.triggers WHERE trigger_schema = DATABASE() AND trigger_name = ?',
        [trigger[1]]
      );
      if (existing.cantidad) continue;
    }
    await connection.query(statement);
  }

  await connection.beginTransaction();
  try {
    const [[inicio]] = await connection.query('SELECT fecha FROM historial_empleados_inicio WHERE id = 1 FOR UPDATE');
    if (!inicio) {
      await connection.query('INSERT INTO historial_empleados_inicio (id, fecha) VALUES (1, UTC_TIMESTAMP(3))');
      await connection.query(`
        INSERT INTO historial_estados_empleados (usuario_id, fecha, nombre, apellido, email, cargo, activo, existente)
        SELECT u.id, i.fecha, u.nombre, u.apellido, u.email, COALESCE(e.cargo, r.nombre),
               u.activo AND COALESCE(e.activo, TRUE), TRUE
        FROM usuarios u JOIN roles r ON r.id = u.rol_id
        LEFT JOIN empleados e ON e.usuario_id = u.id
        CROSS JOIN historial_empleados_inicio i WHERE i.id = 1
      `);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}
