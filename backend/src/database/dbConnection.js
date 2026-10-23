import { pool } from './mysql/pool.js';
export async function verificarBaseMySQL(){
 const c=await pool.getConnection();
 try {
  await c.query("SET time_zone='+00:00'");
  const [rows]=await c.execute(`SELECT table_name FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name IN ('usuarios','productos','pedidos','pagos_pedido','reservas','compras','cierres_caja','pedidos_publicos','empleados','asistencias','inasistencias','pagos_empleado','mensajes','recuperaciones_password','ventas','detalle_venta','migracion_mongo_ids')`);
  if(rows.length!==17)throw new Error('Base incompleta: ejecutá npm run db:mysql:migrate:final antes de iniciar');
  console.log('MySQL conectado. El servidor funciona sin MongoDB.');
 }finally{c.release();}
}
