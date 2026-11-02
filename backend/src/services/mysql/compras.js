import { transaction, requireCondition as check, positiveId, nextNumber } from '../../database/mysql/transaction.js';
import { validarFecha } from './reservas.js';

const roles = ['SuperAdministrador', 'Gerente'];
const estados = ['Pendiente', 'Parcial', 'Recibida', 'Cancelada'];
const metodos = ['Efectivo', 'Transferencia', 'Cheque', 'Cuenta Corriente', 'Otro'];
const unidades = ['Unidad', 'Kg', 'Litro', 'Gramo', 'Ml', 'Caja', 'Pack', 'Otro'];
const maxDecimal = 999999999999n;
const texto = (value, max, campo, requerido = false) => {
  check(typeof value === 'string' && value.trim().length <= max && (!requerido || value.trim()), `${campo} inválido`);
  return value.trim();
};
// Importes y cantidades se calculan en enteros: centavos y milésimas.
export function decimal(value, digits, campo) {
  check(['number', 'string'].includes(typeof value), `${campo} inválido`);
  const match = String(value).match(new RegExp(`^(\\d+)(?:\\.(\\d{1,${digits}}))?$`));
  check(match, `${campo} inválido (máximo ${digits} decimales)`);
  const result = BigInt(match[1]) * 10n ** BigInt(digits) + BigInt((match[2] || '').padEnd(digits, '0') || '0');
  check(result <= maxDecimal, `${campo} fuera de rango`);
  return result;
}
const sqlDecimal = (value, digits) => {
  const scale = 10n ** BigInt(digits);
  return `${value / scale}.${String(value % scale).padStart(digits, '0')}`;
};
const round = (value, divisor) => (value + divisor / 2n) / divisor;
export function validarCompra(datos) {
  check(datos && typeof datos === 'object', 'Datos inválidos');
  const proveedor = datos.proveedor;
  check(proveedor && typeof proveedor === 'object', 'Proveedor requerido');
  const prov = {
    nombre: texto(proveedor.nombre, 200, 'Proveedor', true),
    cuit: texto(proveedor.cuit ?? '', 20, 'CUIT') || null,
    telefono: texto(proveedor.telefono ?? '', 40, 'Teléfono'),
    email: texto(proveedor.email ?? '', 254, 'Email').toLowerCase(),
    direccion: texto(proveedor.direccion ?? '', 255, 'Dirección')
  };
  if (proveedor.id || proveedor._id) prov.id = positiveId(proveedor.id || proveedor._id);
  check(!prov.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(prov.email), 'Email inválido');
  check(Array.isArray(datos.productos) && datos.productos.length > 0 && datos.productos.length <= 100, 'Se requieren entre 1 y 100 renglones');
  check(datos.estado === undefined || datos.estado === 'Pendiente', 'El estado se cambia mediante la operación correspondiente');
  const productos = datos.productos.map(item => {
    check(item && typeof item === 'object', 'Renglón de compra inválido');
    const productoId = item.productoId && typeof item.productoId === 'object' ? item.productoId.id || item.productoId._id : item.productoId;
    const id = productoId ? positiveId(productoId) : null;
    const cantidad = decimal(item.cantidad, 3, 'Cantidad');
    const precio = decimal(item.precioUnitario, 2, 'Precio');
    check(cantidad > 0n, 'Cantidad debe ser mayor a cero');
    check(item.cantidadRecibida === undefined || Number(item.cantidadRecibida) === 0, 'La recepción se registra por separado');
    const unidad = item.unidadMedida || 'Unidad';
    check(unidades.includes(unidad), 'Unidad de medida inválida');
    // Caja/Pack/Kg no se convierten automáticamente a unidades de catálogo.
    const factor = item.factorStock === undefined || item.factorStock === null ? null : decimal(item.factorStock, 3, 'Factor de stock');
    check(factor === null || factor > 0n, 'Factor de stock debe ser mayor a cero');
    const subtotal = round(cantidad * precio, 1000n);
    check(subtotal <= maxDecimal, 'Subtotal fuera de rango');
    return { id, nombre: texto(item.nombre, 200, 'Nombre de producto', true), cantidad, precio, unidad, factor, subtotal };
  });
  const subtotal = productos.reduce((sum, p) => sum + p.subtotal, 0n);
  const porcentaje = decimal(datos.impuestos?.iva?.porcentaje ?? 21, 2, 'IVA');
  check(porcentaje <= 10000n, 'IVA debe estar entre 0 y 100');
  const iva = round(subtotal * porcentaje, 10000n);
  check(subtotal + iva <= maxDecimal, 'Total fuera de rango');
  const metodo = datos.metodoPago || 'Efectivo';
  check(metodos.includes(metodo), 'Método de pago inválido');
  return { proveedor: prov, productos, subtotal, porcentaje, iva, total: subtotal + iva, metodo,
    factura: texto(datos.numeroFactura ?? '', 100, 'Factura'), observaciones: texto(datos.observaciones ?? '', 10000, 'Observaciones') };
}

const cabecera = `SELECT c.*, p.cuit,p.telefono,p.email,p.direccion,
  u.nombre,u.apellido,u.email usuario_email,
  COALESCE((SELECT SUM(pg.monto) FROM pagos_compra pg WHERE pg.compra_id=c.id),0) total_pagado
  FROM compras c JOIN proveedores p ON p.id=c.proveedor_id JOIN usuarios u ON u.id=c.registrado_por_id`;
async function leer(db, id) {
  const [[c]] = await db.execute(`${cabecera} WHERE c.id=?`, [positiveId(id)]);
  check(c, 'Compra no encontrada', 404);
  const [items] = await db.execute(`SELECT d.*,p.nombre producto_nombre,cat.nombre categoria,p.unidad_medida producto_unidad
    FROM detalle_compra d LEFT JOIN productos p ON p.id=d.producto_id LEFT JOIN categorias cat ON cat.id=p.categoria_id
    WHERE d.compra_id=? ORDER BY d.id`, [c.id]);
  const [pagos] = await db.execute('SELECT * FROM pagos_compra WHERE compra_id=? ORDER BY id', [c.id]);
  return { id:c.id, _id:String(c.id), numeroCompra:c.numero_compra, fechaCompra:c.fecha_compra, fechaRecepcion:c.fecha_recepcion,
    estado:c.estado, proveedor:{id:c.proveedor_id,_id:String(c.proveedor_id),nombre:c.proveedor_nombre_historico,cuit:c.cuit,telefono:c.telefono,email:c.email,direccion:c.direccion},
    registradoPor:{id:c.registrado_por_id,_id:String(c.registrado_por_id),nombre:c.nombre,apellido:c.apellido,email:c.usuario_email},
    productos:items.map(d=>({id:d.id,_id:String(d.id),nombre:d.nombre_historico,
      productoId:d.producto_id ? {id:d.producto_id,_id:String(d.producto_id),nombre:d.producto_nombre,categoria:d.categoria,unidadMedida:d.producto_unidad} : null,
      cantidad:Number(d.cantidad),unidadMedida:d.unidad_medida,factorStock:d.factor_stock===null?null:Number(d.factor_stock),
      precioUnitario:Number(d.precio_unitario),subtotal:Number(d.subtotal),cantidadRecibida:Number(d.cantidad_recibida)})),
    subtotal:Number(c.subtotal),impuestos:{iva:{porcentaje:Number(c.iva_porcentaje),monto:Number(c.iva_monto)}},total:Number(c.total),
    metodoPago:c.metodo_pago,numeroFactura:c.numero_factura,observaciones:c.observaciones,
    totalPagado:Number(c.total_pagado),saldoPendiente:Number(sqlDecimal(decimal(c.total,2,'Total')-decimal(c.total_pagado,2,'Pagado'),2)),
    pagos:pagos.map(p=>({id:p.id,_id:String(p.id),monto:Number(p.monto),metodoPago:p.metodo_pago,referencia:p.referencia,fechaPago:p.fecha_pago,registradoPor:p.registrado_por_id})),
    createdAt:c.created_at,updatedAt:c.updated_at };
}
async function bloquear(db, id) {
  const [[c]] = await db.execute('SELECT * FROM compras WHERE id=? FOR UPDATE',[positiveId(id)]);
  check(c, 'Compra no encontrada',404);
  return c;
}
async function proveedorId(db, prov) {
  if (prov.id) {
    const [[row]] = await db.execute('SELECT id FROM proveedores WHERE id=? AND activo=TRUE',[prov.id]);
    check(row, 'Proveedor no disponible',404);
    return row.id;
  }
  const [[existente]] = await db.execute(prov.cuit ? 'SELECT id FROM proveedores WHERE cuit=? AND activo=TRUE' :
    'SELECT id FROM proveedores WHERE nombre=? AND cuit IS NULL AND activo=TRUE ORDER BY id LIMIT 1', [prov.cuit || prov.nombre]);
  if (existente) return existente.id;
  const [result] = await db.execute('INSERT INTO proveedores(nombre,cuit,telefono,email,direccion) VALUES(?,?,?,?,?)',
    [prov.nombre,prov.cuit,prov.telefono,prov.email,prov.direccion]);
  return result.insertId;
}
async function prepararProductos(db, datos) {
  const catalogo = new Map();
  for (const id of [...new Set(datos.productos.filter(p=>p.id).map(p=>p.id))].sort((a,b)=>a-b)) {
    const [[p]] = await db.execute('SELECT id,unidad_medida FROM productos WHERE id=?',[id]);
    check(p, 'Producto no encontrado',404);
    catalogo.set(id,p);
  }
  for (const item of datos.productos) {
    if (item.id && item.factor === null) {
      check(item.unidad === catalogo.get(item.id).unidad_medida, `Indicá factorStock para convertir ${item.unidad} a ${catalogo.get(item.id).unidad_medida}`);
      item.factor=1000n;
    }
  }
}
async function insertarDetalles(db, compra, datos) {
  for (const p of datos.productos) await db.execute(`INSERT INTO detalle_compra
    (compra_id,producto_id,nombre_historico,cantidad,unidad_medida,factor_stock,precio_unitario,subtotal) VALUES(?,?,?,?,?,?,?,?)`,
    [compra,p.id,p.nombre,sqlDecimal(p.cantidad,3),p.unidad,p.factor===null?null:sqlDecimal(p.factor,3),sqlDecimal(p.precio,2),sqlDecimal(p.subtotal,2)]);
}
async function seleccionar(db, query={}) {
  const filtros=[], args=[];
  if (query.estado) { check(estados.includes(query.estado),'Estado inválido'); filtros.push('c.estado=?'); args.push(query.estado); }
  if (query.proveedor) { filtros.push('LOCATE(LOWER(?),LOWER(c.proveedor_nombre_historico))>0'); args.push(texto(query.proveedor,200,'Proveedor')); }
  if (query.fechaInicio) { filtros.push('c.fecha_compra>=?'); args.push(`${validarFecha(query.fechaInicio)} 03:00:00`); }
  if (query.fechaFin) { filtros.push('c.fecha_compra<DATE_ADD(?,INTERVAL 1 DAY)'); args.push(`${validarFecha(query.fechaFin)} 03:00:00`); }
  if (query.fechaInicio && query.fechaFin) check(query.fechaInicio<=query.fechaFin,'Período inválido');
  if (query.pendientesPago) filtros.push("c.estado<>'Cancelada' AND c.total>COALESCE((SELECT SUM(monto) FROM pagos_compra WHERE compra_id=c.id),0)");
  const [rows]=await db.execute(`SELECT c.id FROM compras c${filtros.length?' WHERE '+filtros.join(' AND '):''} ORDER BY c.fecha_compra DESC,c.id DESC`,args);
  const result=[];
  for (const row of rows) result.push(await leer(db,row.id));
  return result;
}
export function comprasService(pool) {
  const operar = (usuario, fn) => transaction(pool, async db => {
    // Lectura actual con bloqueo compartido: no crea una instantánea anterior
    // a la espera por el bloqueo de compra en recepciones o pagos simultáneos.
    const [[user]] = await db.execute(`SELECT u.id,r.nombre rol FROM usuarios u
      JOIN roles r ON r.id=u.rol_id WHERE u.id=? AND u.activo=TRUE FOR SHARE`, [positiveId(usuario)]);
    check(user && roles.includes(user.rol), 'El usuario no tiene permiso para esta operación', 403);
    return fn(db);
  });
  const sinMovimientos = async (db,c) => {
    check(c.estado==='Pendiente','Solo se modifica o elimina una compra Pendiente');
    const [[r]]=await db.execute(`SELECT (SELECT COUNT(*) FROM recepciones_compra r JOIN detalle_compra d ON d.id=r.detalle_compra_id WHERE d.compra_id=?) recepciones,
      (SELECT COUNT(*) FROM pagos_compra WHERE compra_id=?) pagos`,[c.id,c.id]);
    check(!Number(r.recepciones) && !Number(r.pagos),'Una compra con recepciones o pagos no admite esta operación');
  };
  return {
    listar:(usuario,query)=>operar(usuario,db=>seleccionar(db,query)),
    obtener:(usuario,id)=>operar(usuario,db=>leer(db,id)),
    crear: (usuario,datos) => operar(usuario,async db=>{
      const v=validarCompra(datos);
      await prepararProductos(db,v);
      const prov=await proveedorId(db,v.proveedor);
      const numero=await nextNumber(db,'compra');
      const [r]=await db.execute(`INSERT INTO compras(numero_compra,proveedor_id,proveedor_nombre_historico,registrado_por_id,
        subtotal,iva_porcentaje,iva_monto,total,metodo_pago,numero_factura,observaciones) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
        [numero,prov,v.proveedor.nombre,usuario,sqlDecimal(v.subtotal,2),sqlDecimal(v.porcentaje,2),sqlDecimal(v.iva,2),sqlDecimal(v.total,2),v.metodo,v.factura,v.observaciones]);
      await insertarDetalles(db,r.insertId,v);
      return leer(db,r.insertId);
    }),
    actualizar:(usuario,id,datos)=>operar(usuario,async db=>{
      const c=await bloquear(db,id); await sinMovimientos(db,c);
      const anterior=await leer(db,id);
      const v=validarCompra({...anterior,...datos,estado:datos.estado??anterior.estado});
      await prepararProductos(db,v);
      const prov=await proveedorId(db,v.proveedor);
      await db.execute(`UPDATE compras SET proveedor_id=?,proveedor_nombre_historico=?,subtotal=?,iva_porcentaje=?,iva_monto=?,total=?,metodo_pago=?,numero_factura=?,observaciones=? WHERE id=?`,
        [prov,v.proveedor.nombre,sqlDecimal(v.subtotal,2),sqlDecimal(v.porcentaje,2),sqlDecimal(v.iva,2),sqlDecimal(v.total,2),v.metodo,v.factura,v.observaciones,c.id]);
      await db.execute('DELETE FROM detalle_compra WHERE compra_id=?',[c.id]);
      await insertarDetalles(db,c.id,v); return leer(db,c.id);
    }),
    eliminar:(usuario,id)=>operar(usuario,async db=>{
      const c=await bloquear(db,id); await sinMovimientos(db,c); const anterior=await leer(db,id);
      await db.execute('DELETE FROM detalle_compra WHERE compra_id=?',[c.id]);
      await db.execute('DELETE FROM compras WHERE id=?',[c.id]); return anterior;
    }),
    recibir:(usuario,id,datos)=>operar(usuario,async db=>{
      const c=await bloquear(db,id);
      check(c.estado!=='Cancelada','No se puede recibir una compra cancelada');
      check(Array.isArray(datos.productosRecibidos) && datos.productosRecibidos.length>0 && datos.productosRecibidos.length<=100,'Indicá entre 1 y 100 productosRecibidos con cantidades acumuladas');
      const [items]=await db.execute('SELECT * FROM detalle_compra WHERE compra_id=? ORDER BY id FOR UPDATE',[c.id]);
      const vistos=new Set(), incrementos=new Map();
      for (const input of datos.productosRecibidos) {
        check(input && typeof input === 'object', 'Renglón de recepción inválido');
        const detalle=positiveId(input.detalleId??input.productoId);
        check(!vistos.has(detalle),'Renglón de recepción repetido'); vistos.add(detalle);
        const item=items.find(i=>i.id===detalle); check(item,'Renglón ajeno a esta compra',400);
        const total=decimal(input.cantidadRecibida,3,'Cantidad recibida'), anterior=decimal(item.cantidad_recibida,3,'Cantidad anterior');
        check(total>=anterior && total<=decimal(item.cantidad,3,'Cantidad pedida'),'La cantidad acumulada no puede disminuir ni superar lo pedido');
        const delta=total-anterior;
        if (!delta) continue;
        if (item.producto_id) {
          const conversion=delta*decimal(item.factor_stock,3,'Factor');
          check(conversion%1000n===0n,'La conversión de stock requiere más de 3 decimales');
          incrementos.set(item.producto_id,(incrementos.get(item.producto_id)||0n)+conversion/1000n);
        }
        await db.execute('INSERT INTO recepciones_compra(detalle_compra_id,registrado_por_id,cantidad) VALUES(?,?,?)',[detalle,usuario,sqlDecimal(delta,3)]);
        await db.execute('UPDATE detalle_compra SET cantidad_recibida=? WHERE id=?',[sqlDecimal(total,3),detalle]);
        item.cantidad_recibida=sqlDecimal(total,3);
      }
      for (const [producto,delta] of [...incrementos].sort((a,b)=>a[0]-b[0])) {
        const [[p]]=await db.execute('SELECT stock FROM productos WHERE id=? FOR UPDATE',[producto]);
        check(p,'Producto no encontrado',404);
        check(decimal(p.stock,3,'Stock')+delta<=maxDecimal,'Stock fuera de rango');
        await db.execute(
          'UPDATE productos SET disponible=(stock+? > 0),stock=stock+? WHERE id=?',
          [sqlDecimal(delta,3),sqlDecimal(delta,3),producto]
        );
        await db.execute('INSERT INTO movimientos_stock(producto_id,cantidad,motivo,registrado_por_id) VALUES(?,?,?,?)',
          [producto,sqlDecimal(delta,3),`Recepción compra #${c.numero_compra}`,usuario]);
      }
      const estado=items.every(p=>Number(p.cantidad_recibida)===Number(p.cantidad))?'Recibida':items.some(p=>Number(p.cantidad_recibida)>0)?'Parcial':'Pendiente';
      const huboRecepcion=items.some(p=>vistos.has(p.id) && Number(p.cantidad_recibida)>0);
      await db.execute('UPDATE compras SET estado=?,fecha_recepcion=IF(?,COALESCE(fecha_recepcion,CURRENT_TIMESTAMP(3)),fecha_recepcion) WHERE id=?',[estado,huboRecepcion,c.id]);
      return leer(db,c.id);
    }),
    cancelar:(usuario,id)=>operar(usuario,async db=>{
      const c=await bloquear(db,id);
      check(c.estado==='Pendiente' || c.estado==='Cancelada','Una compra recibida o parcial requiere gestionar la devolución antes de cancelar');
      const [[{pagos}]]=await db.execute('SELECT COUNT(*) pagos FROM pagos_compra WHERE compra_id=?',[c.id]);
      check(!Number(pagos),'Una compra con pagos requiere gestionar el reintegro antes de cancelar');
      await db.execute("UPDATE compras SET estado='Cancelada' WHERE id=?",[c.id]); return leer(db,c.id);
    }),
    pagar:(usuario,id,datos)=>operar(usuario,async db=>{
      const c=await bloquear(db,id);
      check(c.estado!=='Cancelada','No se paga una compra cancelada');
      const monto=decimal(datos.monto,2,'Monto'); check(monto>0n,'Monto debe ser mayor a cero');
      const metodo=datos.metodoPago; check(metodos.includes(metodo) && metodo!=='Cuenta Corriente','Método de pago efectivo requerido');
      const clave=texto(datos.idempotencyKey,100,'idempotencyKey',true); check(clave.length>=8,'idempotencyKey debe tener entre 8 y 100 caracteres');
      const referencia=texto(datos.referencia??'',200,'Referencia');
      const [[anterior]]=await db.execute('SELECT * FROM pagos_compra WHERE compra_id=? AND idempotency_key=?',[c.id,clave]);
      if (anterior) {
        check(decimal(anterior.monto,2,'Pago')===monto && anterior.metodo_pago===metodo && anterior.referencia===referencia,'La clave de pago ya fue utilizada con otros datos',409);
        return leer(db,c.id);
      }
      const [[{pagado}]]=await db.execute('SELECT COALESCE(SUM(monto),0) pagado FROM pagos_compra WHERE compra_id=?',[c.id]);
      check(monto+decimal(pagado,2,'Pagado')<=decimal(c.total,2,'Total'),'El pago supera el saldo pendiente');
      await db.execute('INSERT INTO pagos_compra(compra_id,registrado_por_id,monto,metodo_pago,referencia,idempotency_key) VALUES(?,?,?,?,?,?)',
        [c.id,usuario,sqlDecimal(monto,2),metodo,referencia,clave]); return leer(db,c.id);
    }),
    reporte:(usuario,query)=>operar(usuario,async db=>{
      const compras=await seleccionar(db,query), grupos=new Map();
      for (const compra of compras.filter(c=>c.estado!=='Cancelada')) {
        const nombre=compra.proveedor.nombre;
        if(!grupos.has(nombre))grupos.set(nombre,{_id:nombre,totalCompras:0,montoTotal:0,compras:[]});
        const g=grupos.get(nombre);g.totalCompras++;g.montoTotal=Number(sqlDecimal(decimal(g.montoTotal,2,'Acumulado')+decimal(compra.total,2,'Total'),2));g.compras.push(compra);
      }
      return [...grupos.values()].sort((a,b)=>b.montoTotal-a.montoTotal);
    })
  };
}
