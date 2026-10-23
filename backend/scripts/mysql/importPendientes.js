import { readFile } from 'node:fs/promises';
import { connect } from './connection.js';
import { importarPendientes } from '../../src/services/mysql/importPendientes.js';
const args=process.argv.slice(2),aplicar=args.includes('--aplicar'),ruta=args.find(x=>!x.startsWith('--'));
if(!ruta){console.error('Uso: npm run db:mysql:import:pendientes -- ruta/al/export.json [--vincular-legajos] [--aplicar]. Sin --aplicar: simulación con ROLLBACK.');process.exit(1);}
const datos=JSON.parse(await readFile(ruta,'utf8')),db=await connect({database:true});
try{
 await db.beginTransaction();
 // Evitar que dos importadores del mismo archivo compitan por las correspondencias.
 const [[lock]]=await db.query("SELECT GET_LOCK('restobar-importar-pendientes',10) adquirido");if(lock.adquirido!==1)throw new Error('Hay otra importación en curso');
 const resumen=await importarPendientes(db,datos,{vincularLegajos:args.includes('--vincular-legajos')});
 if(aplicar)await db.commit();else await db.rollback();
 console.table(resumen);console.log(aplicar?'Importación confirmada; stock existente sin modificaciones.':'Simulación OK; no se guardó ningún cambio. Repetí con --aplicar para confirmar.');
}catch(e){await db.rollback();console.error('No se importó ningún registro:',e.message);process.exitCode=1;}
finally{await db.query("SELECT RELEASE_LOCK('restobar-importar-pendientes')");await db.end();}
