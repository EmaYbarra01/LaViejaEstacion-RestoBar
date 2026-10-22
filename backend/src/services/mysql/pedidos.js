import { transaction, requireCondition as ensure, positiveId, actor, nextNumber } from '../../database/mysql/transaction.js';

const kitchenRoles=['EncargadoCocina','Gerente','SuperAdministrador'];
const adminRoles=['SuperAdministrador','Gerente'];
const roundQty=value=>{
 const number=Number(value);
 ensure(Number.isFinite(number) && number>0 && number<=999999999 && Math.abs(number*1000-Math.round(number*1000))<1e-6,'Cantidad inválida (máximo 3 decimales)');
 return number;
};
const note=value=>{
 ensure(typeof value==='string' && value.length<=200,'Observación inválida');
 return value;
};
async function lockedOrder(c,id){
 const orderId=positiveId(id);
 const [[ref]]=await c.execute('SELECT mesa_id FROM pedidos WHERE id=?',[orderId]);
 ensure(ref,'Pedido no encontrado',404);
 if(ref.mesa_id!==null)await c.execute('SELECT id FROM mesas WHERE id=? FOR UPDATE',[ref.mesa_id]);
 const [[order]]=await c.execute('SELECT * FROM pedidos WHERE id=? FOR UPDATE',[orderId]);
 ensure(order,'Pedido no encontrado',404);
 return order;
}
async function history(c,id,state,user,observation=''){
 await c.execute('INSERT INTO historial_estados_pedido(pedido_id,estado,usuario_id,observacion) VALUES(?,?,?,?)',[id,state,user,observation]);
}
async function freeTable(c,table){
 if(table===null)return;
 const [r]=await c.execute("SELECT id FROM pedidos WHERE mesa_id=? AND activo=TRUE AND estado NOT IN ('Cobrado','Cancelado') FOR UPDATE",[table]);
 if(!r.length) await c.execute("UPDATE mesas SET estado='Libre' WHERE id=?",[table]);
}

export function pedidoService(pool){
 return {
  async crear({mesa,usuario,productos,observacionesGenerales=''}){
   ensure(Array.isArray(productos) && productos.length>0 && productos.length<=100,'El pedido necesita entre 1 y 100 renglones');
   ensure(typeof observacionesGenerales==='string' && observacionesGenerales.length<=500,'Observaciones generales inválidas');
   const items=productos.map(p=>({id:positiveId(p.producto),cantidad:roundQty(p.cantidad),observaciones:note(p.observaciones||'')}));
   return transaction(pool,async c=>{
    const user=await actor(c,usuario,['Mozo']);
    const [[table]]=await c.execute('SELECT * FROM mesas WHERE id=? FOR UPDATE',[positiveId(mesa)]);
    ensure(table,'Mesa no encontrada',404);
    ensure(table.estado!=='Reservada','La mesa está reservada');
    // Bloqueo en el mismo orden para pedidos de distintas mesas.
    const totals=new Map();
    for(const item of items)totals.set(item.id,Math.round(((totals.get(item.id)||0)*1000)+Math.round(item.cantidad*1000))/1000);
    const products=new Map();
    for(const id of [...totals.keys()].sort((a,b)=>a-b)){
     const [[p]]=await c.execute('SELECT * FROM productos WHERE id=? FOR UPDATE',[id]);
     ensure(p && p.disponible,'Producto no disponible');
     ensure(Number(p.stock)>=totals.get(id),`Stock insuficiente para ${p.nombre}`);
     products.set(id,p);
    }
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const date=['year','month','day'].map(type=>parts.find(p=>p.type===type).value).join('');
    const number=await nextNumber(c,`pedido-${date}`);
    const [r]=await c.execute(`INSERT INTO pedidos(numero_pedido,mesa_id,mozo_id,numero_mesa_historico,nombre_mozo_historico,subtotal,total,observaciones_generales)
      VALUES(?,?,?,?,?,0,0,?)`,[`PED-${date}-${String(number).padStart(4,'0')}`,table.id,user.id,table.numero,`${user.nombre} ${user.apellido}`,observacionesGenerales]);
    for(const [index,item] of items.entries()){
     const p=products.get(item.id);
     await c.execute(`INSERT INTO detalle_pedido(pedido_id,producto_id,orden,nombre_historico,cantidad,precio_unitario,subtotal,observaciones)
      VALUES(?,?,?,?,?,?,ROUND(?*?,2),?)`,[r.insertId,item.id,index+1,p.nombre,item.cantidad,p.precio,item.cantidad,p.precio,item.observaciones]);
    }
    for(const [id,quantity] of totals){
     await c.execute('UPDATE productos SET stock=stock-? WHERE id=?',[quantity,id]);
     await c.execute(`INSERT INTO movimientos_stock(producto_id,pedido_id,cantidad,motivo,registrado_por_id)
      VALUES(?,?,?,'Pedido creado',?)`,[id,r.insertId,-quantity,user.id]);
    }
    await c.execute(`UPDATE pedidos SET subtotal=(SELECT SUM(subtotal) FROM detalle_pedido WHERE pedido_id=?),
     total=(SELECT SUM(subtotal) FROM detalle_pedido WHERE pedido_id=?) WHERE id=?`,[r.insertId,r.insertId,r.insertId]);
    await history(c,r.insertId,'Pendiente',user.id,'Pedido creado');
    await c.execute("UPDATE mesas SET estado='Ocupada' WHERE id=?",[table.id]);
    return {id:r.insertId,mesaId:table.id};
   });
  },
  async actualizar({id,usuario,productos,observacionesGenerales}){
   ensure(productos!==undefined || observacionesGenerales!==undefined,'No hay cambios para guardar');
   if(observacionesGenerales!==undefined)ensure(typeof observacionesGenerales==='string' && observacionesGenerales.length<=500,'Observaciones generales inválidas');
   let items;
   if(productos!==undefined){
    ensure(Array.isArray(productos) && productos.length>0 && productos.length<=100,'El pedido necesita entre 1 y 100 renglones');
    items=productos.map(p=>({id:positiveId(p.producto),cantidad:roundQty(p.cantidad),observaciones:note(p.observaciones||'')}));
   }
   return transaction(pool,async c=>{
    const user=await actor(c,usuario,['Mozo',...adminRoles]);
    const order=await lockedOrder(c,id);
    ensure(order.estado==='Pendiente','Solo se editan pedidos pendientes');
    if(user.rol==='Mozo')ensure(order.mozo_id===null || order.mozo_id===user.id,'El pedido pertenece a otro mozo',403);
    if(items){
     const [old]=await c.execute('SELECT * FROM detalle_pedido WHERE pedido_id=? ORDER BY orden',[order.id]);
     const before=new Map(),after=new Map(),catalog=new Map();
     for(const row of old)before.set(row.producto_id,(before.get(row.producto_id)||0)+Math.round(Number(row.cantidad)*1000));
     for(const row of items)after.set(row.id,(after.get(row.id)||0)+Math.round(row.cantidad*1000));
     const ids=[...new Set([...before.keys(),...after.keys()])].sort((a,b)=>a-b);
     for(const productId of ids){
      const [[p]]=await c.execute('SELECT * FROM productos WHERE id=? FOR UPDATE',[productId]);
      ensure(p,'Producto no encontrado',404);catalog.set(productId,p);
      const delta=((before.get(productId)||0)-(after.get(productId)||0))/1000;
      ensure(delta>=0 || p.disponible,'Producto no disponible');
      ensure(Math.round(Number(p.stock)*1000)+Math.round(delta*1000)>=0,`Stock insuficiente para ${p.nombre}`);
      if(delta!==0){
       await c.execute('UPDATE productos SET stock=stock+? WHERE id=?',[delta.toFixed(3),productId]);
       await c.execute("INSERT INTO movimientos_stock(producto_id,pedido_id,cantidad,motivo,registrado_por_id) VALUES(?,?,?,'Edición de pedido',?)",[productId,order.id,delta.toFixed(3),user.id]);
      }
     }
     await c.execute('DELETE FROM detalle_pedido WHERE pedido_id=?',[order.id]);
     const used=new Set();
     for(const [index,item] of items.entries()){
      let previous=old[index]?.producto_id===item.id && !used.has(index)?index:-1;
      if(previous<0)previous=old.findIndex((r,i)=>r.producto_id===item.id && !used.has(i));
      if(previous>=0)used.add(previous);
      const p=catalog.get(item.id),historical=previous>=0?old[previous]:null;
      const price=historical?.precio_unitario??p.precio,name=historical?.nombre_historico??p.nombre;
      await c.execute('INSERT INTO detalle_pedido(pedido_id,producto_id,orden,nombre_historico,cantidad,precio_unitario,subtotal,observaciones) VALUES(?,?,?,?,?,?,ROUND(?*?,2),?)',[order.id,item.id,index+1,name,item.cantidad,price,item.cantidad,price,item.observaciones]);
     }
     await c.execute('UPDATE pedidos SET subtotal=(SELECT SUM(subtotal) FROM detalle_pedido WHERE pedido_id=?),total=(SELECT SUM(subtotal) FROM detalle_pedido WHERE pedido_id=?)-descuento_monto WHERE id=?',[order.id,order.id,order.id]);
    }
    if(observacionesGenerales!==undefined)await c.execute('UPDATE pedidos SET observaciones_generales=? WHERE id=?',[observacionesGenerales,order.id]);
    await history(c,order.id,'Pendiente',user.id,'Pedido actualizado');
    return {id:order.id,mesaId:order.mesa_id};
   });
  },
  async cambiarEstado({id,usuario,estado,observacion=''}){
   note(observacion);
   ensure(['En Preparación','Listo','Entregado'].includes(estado),'Transición no válida');
   return transaction(pool,async c=>{
    const user=await actor(c,usuario,estado==='Entregado'?['Mozo',...adminRoles]:kitchenRoles);
    const order=await lockedOrder(c,id);
    const previous={'En Preparación':'Pendiente',Listo:'En Preparación',Entregado:'Listo'}[estado];
    ensure(order.estado===previous,`El pedido debe estar en ${previous}`);
    if(estado==='Entregado' && user.rol==='Mozo') {
     ensure(order.mozo_id===null || order.mozo_id===user.id,'El pedido pertenece a otro mozo',403);
     if(order.mozo_id===null)await c.execute('UPDATE pedidos SET mozo_id=?,nombre_mozo_historico=? WHERE id=?',[user.id,`${user.nombre} ${user.apellido}`,order.id]);
    }
    if(estado==='Entregado') await c.execute("UPDATE pedidos SET estado='Entregado',fecha_servido=NOW(3) WHERE id=?",[order.id]);
    else await c.execute(`UPDATE pedidos SET estado=?,estado_cocina=?,fecha_listo=IF(?='Listo',NOW(3),fecha_listo) WHERE id=?`,[estado,estado,estado,order.id]);
    await history(c,order.id,estado,user.id,observacion);
    return {id:order.id,estado};
   });
  },
  async cobrar({id,usuario,metodoPago,montoPagado}){
   ensure(['Efectivo','Transferencia'].includes(metodoPago),'Método de pago inválido');
   ensure(/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(String(montoPagado)),'Importe inválido (máximo 2 decimales)');
   return transaction(pool,async c=>{
    const user=await actor(c,usuario,['Cajero',...adminRoles]);
    const order=await lockedOrder(c,id);
    ensure(order.estado==='Entregado','Solo se cobran pedidos entregados');
    // Dinero calculado por MySQL con DECIMAL, sin redondeos binarios en JS.
    await c.execute(`UPDATE pedidos SET descuento_porcentaje=?,descuento_monto=ROUND(subtotal*?/100,2),
     descuento_motivo=?,total=subtotal-ROUND(subtotal*?/100,2) WHERE id=?`,[metodoPago==='Efectivo'?10:0,metodoPago==='Efectivo'?10:0,metodoPago==='Efectivo'?'Descuento por pago en efectivo':'',metodoPago==='Efectivo'?10:0,order.id]);
    const [[r]]=await c.execute('SELECT total,CAST(? AS DECIMAL(12,2))>=total suficiente,CAST(? AS DECIMAL(12,2))=total exacto FROM pedidos WHERE id=?',[String(montoPagado),String(montoPagado),order.id]);
    ensure(r.suficiente,'El monto recibido es insuficiente');
    ensure(metodoPago==='Efectivo'||r.exacto,'La transferencia debe coincidir con el total');
    await c.execute(`INSERT INTO pagos_pedido(pedido_id,cajero_id,metodo_pago,monto_aplicado,monto_recibido,cambio)
     SELECT id,?,?,total,CAST(? AS DECIMAL(12,2)),CAST(? AS DECIMAL(12,2))-total FROM pedidos WHERE id=?`,[user.id,metodoPago,String(montoPagado),String(montoPagado),order.id]);
    await c.execute(`UPDATE pedidos p JOIN pagos_pedido pg ON pg.pedido_id=p.id SET p.estado='Cobrado',p.estado_caja='Cobrado',
     p.metodo_pago=pg.metodo_pago,p.fecha_cobrado=pg.fecha_pago WHERE p.id=?`,[order.id]);
    await history(c,order.id,'Cobrado',user.id,'Pago confirmado');
    await freeTable(c,order.mesa_id);
    return {id:order.id,mesaId:order.mesa_id};
   });
  },
  async cancelar({id,usuario,motivo}){
   ensure(typeof motivo==='string' && motivo.trim().length>0 && motivo.length<=200,'Se requiere un motivo de cancelación');
   return transaction(pool,async c=>{
    const user=await actor(c,usuario,['Mozo',...adminRoles]);
    const order=await lockedOrder(c,id);
    ensure(!['Cobrado','Cancelado'].includes(order.estado),'El pedido ya está finalizado');
    if(user.rol==='Mozo')ensure(order.mozo_id===null || order.mozo_id===user.id,'El pedido pertenece a otro mozo',403);
    const [items]=await c.execute('SELECT producto_id,SUM(cantidad) cantidad FROM detalle_pedido WHERE pedido_id=? GROUP BY producto_id ORDER BY producto_id',[order.id]);
    for(const item of items){
     await c.execute('UPDATE productos SET stock=stock+? WHERE id=?',[item.cantidad,item.producto_id]);
     await c.execute(`INSERT INTO movimientos_stock(producto_id,pedido_id,cantidad,motivo,registrado_por_id)
       VALUES(?,?,?,'Restitución por cancelación',?)`,[item.producto_id,order.id,item.cantidad,user.id]);
    }
    await c.execute("UPDATE pedidos SET estado='Cancelado',cancelado_motivo=?,cancelado_por_id=?,cancelado_fecha=NOW(3) WHERE id=?",[motivo.trim(),user.id,order.id]);
    await history(c,order.id,'Cancelado',user.id,motivo.trim());
    await freeTable(c,order.mesa_id);
    return {id:order.id,mesaId:order.mesa_id};
   });
  },
 };
}
