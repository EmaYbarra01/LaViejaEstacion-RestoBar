import { connect } from './connection.js';
import { executeFile } from './sqlFile.js';
const db=await connect({database:true});
try {
 for(const f of ['005_compras_pagos.sql','006_pedidos_publicos.sql','007_modulos_restantes.sql'])await executeFile(db,new URL(`../../database/mysql/${f}`,import.meta.url));
 console.log('Migración final aplicada: empleados, jornadas, pagos, mensajes, recuperación y ventas heredadas. Datos existentes conservados.');
}catch(e){console.error(e.message);process.exitCode=1;}finally{await db.end();}
