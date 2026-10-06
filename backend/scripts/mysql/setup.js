import { connect } from './connection.js';
import { executeFile } from './sqlFile.js';

const connection = await connect();
try {
  const [[server]] = await connection.query('SELECT VERSION() version');
  if (!/^8\./.test(server.version)) throw new Error(`Se requiere MySQL 8; servidor: ${server.version}`);
  const [[existing]] = await connection.query("SELECT COUNT(*) cantidad FROM information_schema.tables WHERE table_schema='restobar_mysql_demo'");
  if (existing.cantidad) throw new Error('restobar_mysql_demo ya contiene tablas. No se sobrescribe: ejecutá db:mysql:check para revisarla.');
  for (const file of ['001_schema.sql', '002_integridad.sql', '003_demo.sql']) {
    await executeFile(connection, new URL(`../../database/mysql/${file}`, import.meta.url));
    console.log(`OK ${file}`);
  }
  const [incidents] = await connection.query('SELECT * FROM v_incidencias_integridad');
  if (incidents.length) throw new Error(`Incidencias: ${JSON.stringify(incidents)}`);
  console.log(`Demo creada y verificada en MySQL ${server.version}. MongoDB permanece sin cambios.`);
} catch (error) {
  await connection.rollback();
  console.error(error.message);
  console.error('No se borraron bases. Si falló el esquema, revisá las tablas creadas antes de volver a ejecutar.');
  process.exitCode = 1;
} finally { await connection.end(); }
