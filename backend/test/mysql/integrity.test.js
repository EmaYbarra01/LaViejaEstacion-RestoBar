import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { connect } from '../../scripts/mysql/connection.js';

const enabled=process.env.MYSQL_TESTS === '1';
let db;
before(async()=>{ if(enabled) db=await connect({database:true}); });
after(async()=>{ if(db) await db.end(); });
const check=(name,fn)=>test(name,{skip:!enabled},async()=>{
  await db.beginTransaction();
  try { await fn(); } finally { await db.rollback(); }
});
const rejects=(sql,args=[])=>assert.rejects(db.query(sql,args),e=>['ER_SIGNAL_EXCEPTION','ER_CHECK_CONSTRAINT_VIOLATED','ER_NO_REFERENCED_ROW_2','ER_DUP_ENTRY'].includes(e.code));

check('demo consistente: escenarios, pagos y un cierre conciliado',async()=>{
 const [issues]=await db.query('SELECT * FROM v_incidencias_integridad');
 assert.deepEqual(issues,[]);
 const [[c]]=await db.query('SELECT * FROM cierres_caja WHERE id=1');
 assert.equal(c.total_ventas,41200);
 assert.equal(c.efectivo_contado,27200);
 assert.equal(c.diferencia,0);
 const [pending]=await db.query('SELECT * FROM v_pagos_pendientes_cierre');
 assert.equal(pending.length,1);
 assert.equal(pending[0].pedido_id,8);
});
check('stock no puede quedar negativo',()=>rejects('UPDATE productos SET stock=-1 WHERE id=1'));
check('referencias deben existir',()=>rejects('UPDATE pedidos SET mesa_id=999999 WHERE id=3'));
check('no se marca Cobrado sin un pago',()=>rejects("UPDATE pedidos SET estado='Cobrado',estado_caja='Cobrado',metodo_pago='Transferencia',fecha_cobrado=NOW(3) WHERE id=6"));
check('no se cobra antes de la entrega',()=>rejects("INSERT INTO pagos_pedido(pedido_id,cajero_id,metodo_pago,monto_aplicado,monto_recibido,cambio) SELECT id,4,'Transferencia',total,total,0 FROM pedidos WHERE id=3"));
check('no se registra un pago parcial como cobro completo',()=>rejects("INSERT INTO pagos_pedido(pedido_id,cajero_id,metodo_pago,monto_aplicado,monto_recibido,cambio) SELECT id,4,'Transferencia',total-1,total-1,0 FROM pedidos WHERE id=6"));
check('un pedido no tiene dos pagos',()=>rejects('INSERT INTO pagos_pedido(pedido_id,cajero_id,metodo_pago,monto_aplicado,monto_recibido,cambio,fecha_pago) SELECT pedido_id,cajero_id,metodo_pago,monto_aplicado,monto_recibido,cambio,fecha_pago FROM pagos_pedido WHERE id=1'));
check('pago confirmado no cambia ni se elimina',async()=>{
 await rejects('UPDATE pagos_pedido SET monto_recibido=monto_recibido+1 WHERE id=1');
 await rejects('DELETE FROM pagos_pedido WHERE id=1');
});
check('pedido cobrado no se cancela ni cambia de importe',async()=>{
 await rejects("UPDATE pedidos SET estado='Cancelado' WHERE id=1");
 await rejects('UPDATE pedidos SET total=total+1 WHERE id=1');
 await rejects('UPDATE detalle_pedido SET cantidad=cantidad+1 WHERE pedido_id=1');
});
async function newClosure(){
 const [r]=await db.query(`INSERT INTO cierres_caja(numero_cierre,realizado_por_id,hora_inicio,hora_fin,efectivo_esperado,efectivo_contado,diferencia,estado,observaciones,observaciones_revision)
 VALUES(9999,4,'2026-10-05 12:00:00','2026-10-05 23:00:00',0,0,0,'Abierto','','')`);
 return r.insertId;
}
check('un pago no se incluye en dos cierres',async()=>{
 const id=await newClosure();
 await rejects('INSERT INTO cierre_pagos(cierre_id,pago_id) VALUES(?,1)',[id]);
});
check('el cierre rechaza pagos fuera de su turno',async()=>{
 const id=await newClosure();
 await rejects('INSERT INTO cierre_pagos(cierre_id,pago_id) VALUES(?,8)',[id]);
});
check('cierre no admite ventas inventadas',async()=>{
 const id=await newClosure();
 await rejects("UPDATE cierres_caja SET total_ventas=100,estado='Cerrado' WHERE id=?",[id]);
});
check('no se modifica arqueo ni detalle de un cierre finalizado',async()=>{
 await rejects('UPDATE cierres_caja SET efectivo_contado=efectivo_contado+100 WHERE id=1');
 await rejects('INSERT INTO desglose_caja(cierre_id,denominacion,cantidad) VALUES(1,500,1)');
 await rejects("INSERT INTO movimientos_caja(cierre_id,tipo,concepto,monto) VALUES(1,'Gasto','Cambio tardío',100)");
 await rejects('DELETE FROM cierre_pagos WHERE cierre_id=1');
});
check('precio histórico permanece tras cambiar el catálogo',async()=>{
 const [[before]]=await db.query('SELECT precio_unitario FROM detalle_pedido WHERE pedido_id=1');
 await db.query('UPDATE productos SET precio=precio+1000 WHERE id=1');
 const [[after]]=await db.query('SELECT precio_unitario FROM detalle_pedido WHERE pedido_id=1');
 assert.equal(after.precio_unitario,before.precio_unitario);
});
check('cancelación repone stock y no aporta ventas',async()=>{
 const [[r]]=await db.query('SELECT SUM(cantidad) neto FROM movimientos_stock WHERE pedido_id=7');
 assert.equal(r.neto,0);
 const [[p]]=await db.query('SELECT COUNT(*) cantidad FROM pagos_pedido WHERE pedido_id=7');
 assert.equal(p.cantidad,0);
});
