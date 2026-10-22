import { createHash, randomUUID } from 'node:crypto';
import { transaction, nextNumber, positiveId, requireCondition as check } from '../../database/mysql/transaction.js';

function texto(value,max,nombre,requerido=false) {
  check(typeof value==='string' && value.trim().length<=max && (!requerido || value.trim()),`${nombre} inválido`);
  return value.trim();
}
export function validarPedidoPublico(body) {
  check(body && typeof body==='object','Datos del pedido inválidos');
  check(['Local','Domicilio'].includes(body.tipoPedido),'Tipo de pedido inválido');
  check(body.cliente && typeof body.cliente==='object','Datos del cliente requeridos');
  const cliente={
    nombre:texto(body.cliente.nombre,100,'Nombre del cliente',true),
    telefono:texto(body.cliente.telefono,40,'Teléfono',true),
    email:texto(body.cliente.email,254,'Email',true).toLowerCase(),
    direccion:texto(body.cliente.direccion??'',255,'Dirección',body.tipoPedido==='Domicilio'),
    referencia:texto(body.cliente.referencia??'',255,'Referencia')
  };
  check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email),'Email inválido');
  check(cliente.telefono.replace(/\D/g,'').length>=5,'Teléfono inválido');
  const numeroMesa=body.tipoPedido==='Local'?positiveId(body.numeroMesa):null;
  const metodoPago=body.metodoPago||'Efectivo';
  check(['Efectivo','Transferencia'].includes(metodoPago),'Método de pago inválido');
  check(Array.isArray(body.productos)&&body.productos.length>0&&body.productos.length<=100,'Indicá entre 1 y 100 productos');
  const productos=body.productos.map(item=>{
    check(item && typeof item==='object','Producto inválido');
    check(typeof item.cantidad==='number' || (typeof item.cantidad==='string' && /^\d+$/.test(item.cantidad)),'Cantidad inválida');
    const cantidad=Number(item.cantidad);
    check(Number.isSafeInteger(cantidad)&&cantidad>0&&cantidad<=1000000,'Cantidad inválida');
    return {producto:positiveId(item.producto),cantidad,observaciones:texto(item.observaciones??'',200,'Indicaciones')};
  });
  const observacionesGenerales=texto(body.observacionesGenerales??'',500,'Observaciones');
  const solicitudId=body.solicitudId??randomUUID();
  check(typeof solicitudId==='string'&&/^[A-Za-z0-9_-]{8,100}$/.test(solicitudId),'solicitudId inválida');
  const datos={tipoPedido:body.tipoPedido,numeroMesa,cliente,metodoPago,productos,observacionesGenerales};
  return {...datos,solicitudId,huella:createHash('sha256').update(JSON.stringify(datos)).digest('hex')};
}
export function pedidosPublicosService(pool) {
  return {
    async crear(body) {
      const v=validarPedidoPublico(body);
      return transaction(pool,async db=>{
        // El INSERT bloquea únicamente esta clave. Los reintentos esperan el COMMIT
        // y leen el pedido ya creado; una transacción fallida no deja la clave reservada.
        await db.execute(`INSERT INTO pedidos_publicos(solicitud_id,huella,tipo_pedido,cliente_nombre,cliente_telefono,cliente_email,
          cliente_direccion,cliente_referencia,metodo_pago_solicitado) VALUES(?,?,?,?,?,?,?,?,?)
          ON DUPLICATE KEY UPDATE solicitud_id=solicitud_id`,[v.solicitudId,v.huella,v.tipoPedido,v.cliente.nombre,v.cliente.telefono,
            v.cliente.email,v.cliente.direccion,v.cliente.referencia,v.metodoPago]);
        const [[solicitud]]=await db.execute('SELECT huella,pedido_id FROM pedidos_publicos WHERE solicitud_id=? FOR UPDATE',[v.solicitudId]);
        check(solicitud.huella===v.huella,'La solicitud ya se usó con otros datos; iniciá un pedido nuevo',409);
        if(solicitud.pedido_id)return {id:solicitud.pedido_id,creado:false};
        let mesa=null;
        if(v.tipoPedido==='Local') {
          [[mesa]]=await db.execute('SELECT * FROM mesas WHERE numero=? FOR UPDATE',[v.numeroMesa]);
          check(mesa,'La mesa indicada no existe',404);
          check(mesa.estado!=='Reservada','La mesa indicada está reservada',409);
        }
        const cantidades=new Map(),catalogo=new Map();
        for(const p of v.productos)cantidades.set(p.producto,(cantidades.get(p.producto)||0)+p.cantidad);
        for(const id of [...cantidades.keys()].sort((a,b)=>a-b)) {
          const [[p]]=await db.execute('SELECT * FROM productos WHERE id=? FOR UPDATE',[id]);
          check(p && p.disponible,'Uno de los productos no está disponible',400);
          check(Number(p.stock)>=cantidades.get(id),`Stock insuficiente para ${p.nombre}`,409);
          catalogo.set(id,p);
        }
        const date=new Date(Date.now()-3*3600000).toISOString().slice(0,10).replaceAll('-','');
        const numero=await nextNumber(db,`pedido-${date}`);
        const [r]=await db.execute(`INSERT INTO pedidos(numero_pedido,mesa_id,mozo_id,numero_mesa_historico,nombre_mozo_historico,subtotal,total,observaciones_generales)
          VALUES(?,?,NULL,?,'Pedido público',0,0,?)`,[`PED-${date}-${String(numero).padStart(4,'0')}`,mesa?.id??null,mesa?.numero??null,v.observacionesGenerales]);
        const id=r.insertId;
        for(const [index,item] of v.productos.entries()) {
          const p=catalogo.get(item.producto);
          await db.execute(`INSERT INTO detalle_pedido(pedido_id,producto_id,orden,nombre_historico,cantidad,precio_unitario,subtotal,observaciones)
            VALUES(?,?,?,?,?,?,ROUND(?*?,2),?)`,[id,p.id,index+1,p.nombre,item.cantidad,p.precio,item.cantidad,p.precio,item.observaciones]);
        }
        for(const [producto,cantidad] of cantidades) {
          await db.execute('UPDATE productos SET stock=stock-? WHERE id=?',[cantidad,producto]);
          await db.execute(`INSERT INTO movimientos_stock(producto_id,pedido_id,cantidad,motivo,registrado_por_id)
            VALUES(?,?,?,'Pedido público creado',NULL)`,[producto,id,-cantidad]);
        }
        await db.execute(`UPDATE pedidos SET subtotal=(SELECT SUM(subtotal) FROM detalle_pedido WHERE pedido_id=?),
          total=(SELECT SUM(subtotal) FROM detalle_pedido WHERE pedido_id=?) WHERE id=?`,[id,id,id]);
        await db.execute('UPDATE pedidos_publicos SET pedido_id=? WHERE solicitud_id=?',[id,v.solicitudId]);
        await db.execute(`INSERT INTO historial_estados_pedido(pedido_id,estado,usuario_id,observacion)
          VALUES(?,'Pendiente',NULL,'Pedido recibido desde el menú público')`,[id]);
        if(mesa)await db.execute("UPDATE mesas SET estado='Ocupada' WHERE id=?",[mesa.id]);
        return {id,creado:true};
      });
    }
  };
}
