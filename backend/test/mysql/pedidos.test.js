import { before,after,test } from 'node:test';
import assert from 'node:assert/strict';
import { connect } from '../../scripts/mysql/connection.js';
import { pedidoService } from '../../src/services/mysql/pedidos.js';

const enabled=process.env.MYSQL_TESTS==='1';
let db,service;
before(async()=>{
 if(!enabled)return;
 db=await connect({database:true});
 // Los servicios usan una transacción real dentro del SAVEPOINT de cada caso.
 // La transacción exterior permite revertir todos los datos al finalizar.
 const scoped={
  query:(...args)=>db.query(...args),execute:(...args)=>db.execute(...args),
  beginTransaction:()=>db.query('SAVEPOINT servicio'),
  commit:()=>db.query('RELEASE SAVEPOINT servicio'),
  rollback:async()=>{await db.query('ROLLBACK TO SAVEPOINT servicio');await db.query('RELEASE SAVEPOINT servicio');},
  release:()=>{},
 };
 service=pedidoService({getConnection:async()=>scoped});
});
after(async()=>{if(db)await db.end();});
const scenario=(name,fn)=>test(name,{skip:!enabled},async()=>{
 await db.beginTransaction();
 try{await fn();}finally{await db.rollback();}
});
scenario('flujo SQL completo: crear, cocina, entregar y cobrar con descuento y vuelto',async()=>{
 const [[before]]=await db.query('SELECT stock FROM productos WHERE id=1');
 const {id}=await service.crear({mesa:1,usuario:3,productos:[{producto:1,cantidad:2}]});
 const [[created]]=await db.query('SELECT * FROM pedidos WHERE id=?',[id]);
 assert.equal(created.subtotal,16000);
 await service.cambiarEstado({id,usuario:5,estado:'En Preparación'});
 await service.cambiarEstado({id,usuario:5,estado:'Listo'});
 await service.cambiarEstado({id,usuario:3,estado:'Entregado'});
 await service.cobrar({id,usuario:4,metodoPago:'Efectivo',montoPagado:'15000'});
 const [[paid]]=await db.query('SELECT * FROM pagos_pedido WHERE pedido_id=?',[id]);
 assert.equal(paid.monto_aplicado,14400);
 assert.equal(paid.cambio,600);
 const [[after]]=await db.query('SELECT stock FROM productos WHERE id=1');
 assert.equal(after.stock,before.stock-2);
 const [[table]]=await db.query('SELECT estado FROM mesas WHERE id=1');
 assert.equal(table.estado,'Libre');
 const [history]=await db.query('SELECT estado FROM historial_estados_pedido WHERE pedido_id=? ORDER BY id',[id]);
 assert.deepEqual(history.map(r=>r.estado),['Pendiente','En Preparación','Listo','Entregado','Cobrado']);
 await assert.rejects(service.cobrar({id,usuario:4,metodoPago:'Efectivo',montoPagado:15000}));
});
scenario('renglones repetidos del mismo producto no evaden la validación de stock',async()=>{
 await assert.rejects(service.crear({mesa:1,usuario:3,productos:[{producto:16,cantidad:1},{producto:16,cantidad:1}]}),/Stock insuficiente/);
 const [[r]]=await db.query('SELECT stock FROM productos WHERE id=16');
 assert.equal(r.stock,1);
});
scenario('cobro insuficiente revierte el descuento y no guarda un pago',async()=>{
 const [[before]]=await db.query('SELECT total,descuento_monto FROM pedidos WHERE id=6');
 await assert.rejects(service.cobrar({id:6,usuario:4,metodoPago:'Efectivo',montoPagado:1}),/insuficiente/);
 const [[after]]=await db.query('SELECT total,descuento_monto FROM pedidos WHERE id=6');
 assert.deepEqual(after,before);
 const [[payment]]=await db.query('SELECT COUNT(*) cantidad FROM pagos_pedido WHERE pedido_id=6');
 assert.equal(payment.cantidad,0);
});
scenario('cancelar repone stock una sola vez',async()=>{
 const [[before]]=await db.query('SELECT stock FROM productos WHERE id=1');
 const {id}=await service.crear({mesa:1,usuario:3,productos:[{producto:1,cantidad:1}]});
 await service.cancelar({id,usuario:3,motivo:'Prueba de cancelación'});
 await assert.rejects(service.cancelar({id,usuario:3,motivo:'Repetido'}),/finalizado/);
 const [[after]]=await db.query('SELECT stock FROM productos WHERE id=1');
 assert.equal(after.stock,before.stock);
});
scenario('el rol y el mozo se comprueban desde usuarios, no desde el cuerpo de la petición',async()=>{
 await assert.rejects(service.crear({mesa:1,usuario:4,productos:[{producto:1,cantidad:1}]}),/permiso/);
 const {id}=await service.crear({mesa:1,usuario:3,productos:[{producto:1,cantidad:1}]});
 await assert.rejects(service.cancelar({id,usuario:6,motivo:'Otro mozo'}),/otro mozo/);
});
scenario('no se saltean estados ni se descuenta stock por una cantidad negativa',async()=>{
 await assert.rejects(service.crear({mesa:1,usuario:3,productos:[{producto:1,cantidad:-1}]}),/Cantidad inválida/);
 const {id}=await service.crear({mesa:1,usuario:3,productos:[{producto:1,cantidad:1}]});
 await assert.rejects(service.cambiarEstado({id,usuario:5,estado:'Listo'}),/En Preparación/);
});
