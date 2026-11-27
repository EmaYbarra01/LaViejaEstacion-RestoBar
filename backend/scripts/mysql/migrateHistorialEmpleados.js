import { connect } from './connection.js';
import { instalarHistorialEmpleados } from './historialEmpleados.js';

const connection = await connect({ database: true });
try {
  await instalarHistorialEmpleados(connection);
  console.log('Historial de estados de empleados activado; no se modificaron los estados existentes.');
} catch (error) {
  console.error('No se pudo activar el historial de empleados:', error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
