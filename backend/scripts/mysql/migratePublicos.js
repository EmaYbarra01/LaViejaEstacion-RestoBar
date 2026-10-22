import { connect } from './connection.js';
import { executeFile } from './sqlFile.js';
const db=await connect({database:true});
try {
  await executeFile(db,new URL('../../database/mysql/006_pedidos_publicos.sql',import.meta.url));
  console.log('Pedidos públicos: actualización aplicada sin recargar ni borrar datos.');
} catch(error) {console.error(error.message);process.exitCode=1;}
finally {await db.end();}
