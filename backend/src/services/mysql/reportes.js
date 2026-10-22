import { transaction, actor, positiveId, requireCondition as check } from '../../database/mysql/transaction.js';
import { validarFecha } from './reservas.js';

const ROLES = ['SuperAdministrador', 'Gerente'];
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const centavos = value => {
  const n = Number(value);
  check(Number.isFinite(n) && Number.isSafeInteger(Math.round(n * 100)), 'Importe fuera de rango');
  return BigInt(Math.round(n * 100));
};
const dinero = value => {
  check(Number.isSafeInteger(Number(value)), 'Acumulado fuera de rango');
  return Number(value) / 100;
};
const sumar = (rows, campo) => dinero(rows.reduce((total, row) => total + centavos(row[campo] || 0), 0n));
const cantidad = value => Math.round(value * 1000) / 1000;
export const diaArgentino = fecha => new Date(new Date(fecha).getTime() - 3 * 3600000).toISOString().slice(0,10);
export function periodoReporte(query = {}, columna = 'pg.fecha_pago') {
  const where = [], args = [];
  if (query.fechaInicio) {
    const dia = validarFecha(query.fechaInicio);
    where.push(`${columna}>=?`); args.push(new Date(`${dia}T00:00:00-03:00`));
  }
  if (query.fechaFin) {
    const dia = validarFecha(query.fechaFin);
    const fin = new Date(`${dia}T00:00:00-03:00`); fin.setTime(fin.getTime()+86400000);
    check(fin.getUTCFullYear()<=9999,'Fecha final fuera de rango');
    where.push(`${columna}<?`); args.push(fin);
  }
  if (query.fechaInicio && query.fechaFin) check(query.fechaInicio<=query.fechaFin,'El inicio no puede ser posterior al fin');
  return {where,args};
}
const limitar = value => { const n=Number(value??20); check(Number.isSafeInteger(n)&&n>0&&n<=500,'Límite inválido (1 a 500)'); return n; };

// Reparto proporcional en centavos con restos mayores y desempate por orden.
// La suma coincide con el cobro y un renglón de precio cero no recibe ingresos.
export function distribuirNeto(items, total) {
  const neto=centavos(total), bruto=items.reduce((s,d)=>s+centavos(d.subtotal),0n);
  check(neto>=0n && neto<=bruto,'El cobro no concilia con sus renglones');
  const partes=items.map((item,index)=>({index,importe:bruto?centavos(item.subtotal)*neto/bruto:0n,resto:bruto?centavos(item.subtotal)*neto%bruto:0n}));
  let restantes=neto-partes.reduce((s,p)=>s+p.importe,0n);
  for(const parte of [...partes].sort((a,b)=>a.resto===b.resto?a.index-b.index:a.resto>b.resto?-1:1)) {
    if(!restantes)break;
    parte.importe++;restantes--;
  }
  return items.map((item,index)=>({...item,ingresoNeto:dinero(partes[index].importe),descuentoAsignado:dinero(centavos(item.subtotal)-partes[index].importe)}));
}
async function ventas(db,query={}) {
  const {where,args}=periodoReporte(query);
  where.unshift("p.estado='Cobrado'");
  if(query.mozo) {where.push('p.mozo_id=?');args.push(positiveId(query.mozo));}
  if(query.metodoPago) {check(['Efectivo','Transferencia'].includes(query.metodoPago),'Método de pago inválido');where.push('pg.metodo_pago=?');args.push(query.metodoPago);}
  const [rows]=await db.execute(`SELECT p.id,p.numero_pedido,p.numero_mesa_historico,p.mozo_id,p.nombre_mozo_historico,
    p.subtotal,p.descuento_monto,p.descuento_porcentaje,p.total,p.fecha_creacion,
    pg.fecha_pago,pg.metodo_pago,pg.monto_aplicado,u.nombre,u.apellido,u.email
    FROM pedidos p JOIN pagos_pedido pg ON pg.pedido_id=p.id LEFT JOIN usuarios u ON u.id=p.mozo_id
    WHERE ${where.join(' AND ')} ORDER BY pg.fecha_pago,p.id`,args);
  if(!rows.length)return [];
  const ids=rows.map(r=>r.id);
  const [detalles]=await db.query(`SELECT d.*,cat.nombre categoria FROM detalle_pedido d
    JOIN productos pr ON pr.id=d.producto_id JOIN categorias cat ON cat.id=pr.categoria_id
    WHERE d.pedido_id IN (${ids.map(()=>'?').join(',')}) ORDER BY d.pedido_id,d.orden`,ids);
  const grupos=new Map();
  for(const d of detalles){if(!grupos.has(d.pedido_id))grupos.set(d.pedido_id,[]);grupos.get(d.pedido_id).push(d);}
  return rows.map(p=>{
    const items=grupos.get(p.id)||[];
    check(centavos(p.subtotal)===items.reduce((s,d)=>s+centavos(d.subtotal),0n) && centavos(p.total)===centavos(p.monto_aplicado),'El pedido no concilia con su cobro');
    const productos=distribuirNeto(items, p.monto_aplicado).map(d=>({id:d.id,_id:String(d.id),productoId:d.producto_id,
      producto:{id:d.producto_id,_id:String(d.producto_id),nombre:d.nombre_historico,categoria:d.categoria},
      nombre:d.nombre_historico,categoria:d.categoria,cantidad:Number(d.cantidad),precioUnitario:Number(d.precio_unitario),subtotal:Number(d.subtotal),
      ingresoNeto:d.ingresoNeto,descuentoAsignado:d.descuentoAsignado}));
    return {id:p.id,_id:String(p.id),numeroPedido:p.numero_pedido,mesa:{numero:p.numero_mesa_historico},numeroMesa:p.numero_mesa_historico,
      mozo:{id:p.mozo_id,_id:String(p.mozo_id),nombre:p.nombre||'Pedido público',apellido:p.apellido||'',email:p.email},nombreMozo:p.nombre_mozo_historico,
      estado:'Cobrado',subtotal:Number(p.subtotal),descuento:{monto:Number(p.descuento_monto),porcentaje:Number(p.descuento_porcentaje)},
      total:Number(p.monto_aplicado),metodoPago:p.metodo_pago,fechaCobrado:p.fecha_pago,fechaCreacion:p.fecha_creacion,productos};
  });
}
function porMetodo(pedidos) {
  return ['Efectivo','Transferencia'].map(metodo=>{
    const rows=pedidos.filter(p=>p.metodoPago===metodo);
    return {_id:metodo,metodoPago:metodo,cantidad:rows.length,total:sumar(rows,'total')};
  });
}
function resumenVentas(pedidos) {
  return {cantidadPedidos:pedidos.length,subtotal:sumar(pedidos,'subtotal'),descuentos:sumar(pedidos.map(p=>({monto:p.descuento.monto})),'monto'),total:sumar(pedidos,'total'),
    ventasPorMetodo:Object.fromEntries(porMetodo(pedidos).map(m=>[m.metodoPago,{cantidad:m.cantidad,total:m.total}]))};
}
function agruparVentas(pedidos,tipo) {
  const grupos=new Map();
  for(const p of pedidos) {
    const clave=tipo==='mozo'?String(p.mozo.id):tipo==='mensual'?diaArgentino(p.fechaCobrado).slice(0,7):diaArgentino(p.fechaCobrado);
    if(!grupos.has(clave))grupos.set(clave,[]);grupos.get(clave).push(p);
  }
  return [...grupos].map(([clave,rows])=>{
    const r=resumenVentas(rows);
    return {...(tipo==='mozo'?{_id:clave,mozo:rows[0].mozo}:{fecha:clave,_id:clave}),
      cantidadPedidos:rows.length,totalVentas:r.total,totalDescuentos:r.descuentos,promedioVenta:rows.length?r.total/rows.length:0};
  }).sort((a,b)=>tipo==='mozo'?b.totalVentas-a.totalVentas:a.fecha.localeCompare(b.fecha));
}
function agruparProductos(pedidos,tipo='producto') {
  const grupos=new Map();
  for(const p of pedidos)for(const d of p.productos) {
    const clave=tipo==='categoria'?d.categoria:String(d.productoId);
    if(!grupos.has(clave))grupos.set(clave,{_id:clave,nombreProducto:d.nombre,categoria:d.categoria,rows:[]});
    const grupo=grupos.get(clave);grupo.nombreProducto=d.nombre;grupo.rows.push(d);
  }
  return [...grupos.values()].map(({rows,...grupo})=>({...grupo,cantidadVendida:cantidad(rows.reduce((s,d)=>s+d.cantidad,0)),
    cantidadProductos:cantidad(rows.reduce((s,d)=>s+d.cantidad,0)),subtotalBruto:sumar(rows,'subtotal'),descuentos:sumar(rows,'descuentoAsignado'),ingresoTotal:sumar(rows,'ingresoNeto')}))
    .sort((a,b)=>tipo==='categoria'?b.ingresoTotal-a.ingresoTotal:b.cantidadVendida-a.cantidadVendida||Number(a._id)-Number(b._id));
}
async function inventario(db,query={}) {
  const where=[],args=[];
  if(query.categoria){check(typeof query.categoria==='string','Categoría inválida');where.push('cat.nombre=?');args.push(query.categoria);}
  if(query.necesitaReposicion!==undefined)check(['true','false'].includes(String(query.necesitaReposicion)),'necesitaReposicion debe ser true o false');
  if(String(query.necesitaReposicion)==='true')where.push('p.stock<=p.stock_minimo');
  const [rows]=await db.execute(`SELECT p.*,cat.nombre categoria FROM productos p JOIN categorias cat ON cat.id=p.categoria_id
    ${where.length?'WHERE '+where.join(' AND '):''} ORDER BY p.nombre,p.id`,args);
  const productos=rows.map(p=>({id:p.id,_id:String(p.id),nombre:p.nombre,categoria:p.categoria,stock:Number(p.stock),stockMinimo:Number(p.stock_minimo),
    costo:Number(p.costo),precio:Number(p.precio),disponible:Boolean(p.disponible),unidadMedida:p.unidad_medida,
    valorCosto:dinero((BigInt(Math.round(Number(p.stock)*1000))*centavos(p.costo)+500n)/1000n),
    valorVenta:dinero((BigInt(Math.round(Number(p.stock)*1000))*centavos(p.precio)+500n)/1000n)}));
  const costo=sumar(productos,'valorCosto'),venta=sumar(productos,'valorVenta');
  return {productos,resumen:{totalProductos:productos.length,valorInventario:costo,valorVenta:venta,margenPotencial:dinero(centavos(venta)-centavos(costo)),productosConBajoStock:productos.filter(p=>p.stock<=p.stockMinimo).length}};
}
async function compras(db,query={}) {
  const {where,args}=periodoReporte(query,'c.fecha_compra');
  if(query.estado){check(['Pendiente','Parcial','Recibida','Cancelada'].includes(query.estado),'Estado de compra inválido');where.push('c.estado=?');args.push(query.estado);}
  if(query.proveedor){check(typeof query.proveedor==='string'&&query.proveedor.length<=200,'Proveedor inválido');where.push('LOCATE(LOWER(?),LOWER(c.proveedor_nombre_historico))>0');args.push(query.proveedor.trim());}
  const [rows]=await db.execute(`SELECT c.*,u.nombre,u.apellido,
    COALESCE((SELECT SUM(monto) FROM pagos_compra WHERE compra_id=c.id),0) pagado
    FROM compras c JOIN usuarios u ON u.id=c.registrado_por_id ${where.length?'WHERE '+where.join(' AND '):''} ORDER BY c.fecha_compra,c.id`,args);
  const lista=rows.map(c=>({id:c.id,_id:String(c.id),numeroCompra:c.numero_compra,proveedor:{id:c.proveedor_id,nombre:c.proveedor_nombre_historico},
    registradoPor:{id:c.registrado_por_id,nombre:c.nombre,apellido:c.apellido},estado:c.estado,fechaCompra:c.fecha_compra,fechaRecepcion:c.fecha_recepcion,
    subtotal:Number(c.subtotal),impuestos:{iva:{porcentaje:Number(c.iva_porcentaje),monto:Number(c.iva_monto)}},iva:Number(c.iva_monto),total:Number(c.total),
    totalPagado:Number(c.pagado),saldoPendiente:dinero(centavos(c.total)-centavos(c.pagado)),metodoPago:c.metodo_pago}));
  const vigentes=lista.filter(c=>c.estado!=='Cancelada'), proveedores=new Map();
  for(const c of vigentes){const nombre=c.proveedor.nombre;if(!proveedores.has(nombre))proveedores.set(nombre,[]);proveedores.get(nombre).push(c);}
  return {compras:lista,resumen:{cantidadCompras:vigentes.length,cantidadCanceladas:lista.length-vigentes.length,subtotal:sumar(vigentes,'subtotal'),impuestos:sumar(vigentes,'iva'),
    total:sumar(vigentes,'total'),totalPagado:sumar(vigentes,'totalPagado'),saldoPendiente:sumar(vigentes,'saldoPendiente'),
    comprasPorProveedor:Object.fromEntries([...proveedores].map(([nombre,items])=>[nombre,{cantidad:items.length,total:sumar(items,'total')}]))}};
}
async function cierres(db,query={}) {
  const {where,args}=periodoReporte(query,'c.fecha_cierre');
  where.unshift("c.estado<>'Abierto'");
  if(query.estado){check(['Cerrado','Revisado','Auditado'].includes(query.estado),'Estado de cierre inválido');where.push('c.estado=?');args.push(query.estado);}
  const [rows]=await db.execute(`SELECT c.*,u.nombre,u.apellido FROM cierres_caja c JOIN usuarios u ON u.id=c.realizado_por_id WHERE ${where.join(' AND ')} ORDER BY c.fecha_cierre,c.id`,args);
  const lista=rows.map(c=>({id:c.id,_id:String(c.id),numeroCierre:c.numero_cierre,fechaCierre:c.fecha_cierre,turno:c.turno,estado:c.estado,
    realizadoPor:{nombre:c.nombre,apellido:c.apellido},totalVentas:Number(c.total_ventas),totalDescuentos:Number(c.total_descuentos),totalGastos:Number(c.total_gastos),
    totalIngresosAdicionales:Number(c.total_ingresos_adicionales),efectivoEnCaja:Number(c.efectivo_esperado),efectivoContado:Number(c.efectivo_contado),diferencia:Number(c.diferencia)}));
  const total=sumar(lista,'totalVentas'),gastos=sumar(lista,'totalGastos'),ingresos=sumar(lista,'totalIngresosAdicionales');
  return {cierres:lista,resumen:{cantidadCierres:lista.length,totalVentas:total,totalDescuentos:sumar(lista,'totalDescuentos'),totalGastos:gastos,totalIngresos:ingresos,
    totalDiferencias:sumar(lista,'diferencia'),balanceGeneral:dinero(centavos(total)+centavos(ingresos)-centavos(gastos))}};
}
async function metricas(db,now) {
  const dia=diaArgentino(now), inicio=new Date(`${dia}T00:00:00-03:00`),fin=new Date(inicio.getTime()+86400000);
  const [[m]]=await db.execute(`SELECT
    (SELECT COUNT(*) FROM pedidos WHERE fecha_creacion>=? AND fecha_creacion<?) pedidosHoy,
    (SELECT COALESCE(SUM(pg.monto_aplicado),0) FROM pagos_pedido pg JOIN pedidos p ON p.id=pg.pedido_id WHERE p.estado='Cobrado' AND pg.fecha_pago>=? AND pg.fecha_pago<?) ventasHoy,
    (SELECT COUNT(*) FROM productos WHERE disponible=TRUE AND stock<=stock_minimo) productosStockBajo,
    (SELECT COUNT(*) FROM empleados e JOIN usuarios u ON u.id=e.usuario_id WHERE e.activo=TRUE AND u.activo=TRUE) empleadosActivos,
    (SELECT COUNT(*) FROM mesas WHERE estado='Ocupada') mesasOcupadas,
    (SELECT COUNT(*) FROM pedidos WHERE activo=TRUE AND estado IN ('Pendiente','En Preparación')) pedidosPendientes,
    (SELECT COUNT(*) FROM pedidos WHERE activo=TRUE AND estado NOT IN ('Cobrado','Cancelado')) pedidosActivos,
    (SELECT COUNT(*) FROM reservas WHERE fecha=? AND estado IN ('Pendiente','Confirmada')) reservasHoy`,[inicio,fin,inicio,fin,dia]);
  return Object.fromEntries(Object.entries(m).map(([k,v])=>[k,Number(v)]));
}
export function reportesService(pool) {
  const leer=(usuario,fn)=>transaction(pool,async db=>{await actor(db,usuario,ROLES);return fn(db);});
  const resumenDia=async(db,query,now)=>{
    const dia=query.fecha?validarFecha(query.fecha):diaArgentino(now),filtro={fechaInicio:dia,fechaFin:dia};
    const pedidos=await ventas(db,filtro),r=resumenVentas(pedidos),m=await metricas(db,now);
    return {fecha:dia,ventasDelDia:{cantidad:r.cantidadPedidos,total:r.total,promedio:r.cantidadPedidos?r.total/r.cantidadPedidos:0},
      resumenVentas:r,pedidosActivos:m.pedidosActivos,productosStockBajo:m.productosStockBajo,
      comprasDelDia:(await compras(db,filtro)).resumen,cierresDelDia:(await cierres(db,filtro)).resumen};
  };
  return {
    ventas:(usuario,query)=>leer(usuario,async db=>{const pedidos=await ventas(db,query);return {pedidos,resumen:resumenVentas(pedidos)};}),
    mozos:(usuario,query)=>leer(usuario,async db=>agruparVentas(await ventas(db,query),'mozo')),
    diarias:(usuario,query)=>leer(usuario,async db=>agruparVentas(await ventas(db,query),'diario')),
    mensuales:(usuario,query)=>leer(usuario,async db=>agruparVentas(await ventas(db,query),'mensual')),
    metodos:(usuario,query)=>leer(usuario,async db=>porMetodo(await ventas(db,query))),
    productos:(usuario,query={})=>leer(usuario,async db=>agruparProductos(await ventas(db,query)).slice(0,limitar(query.limite))),
    categorias:(usuario,query)=>leer(usuario,async db=>agruparProductos(await ventas(db,query),'categoria')),
    inventario:(usuario,query)=>leer(usuario,db=>inventario(db,query)),
    compras:(usuario,query)=>leer(usuario,db=>compras(db,query)),
    cierres:(usuario,query)=>leer(usuario,db=>cierres(db,query)),
    resumenDiario:(usuario,query={},now=new Date())=>leer(usuario,db=>resumenDia(db,query,now)),
    dashboard:(usuario,now=new Date())=>leer(usuario,async db=>{
      const dia=diaArgentino(now),anio=dia.slice(0,4),mes=dia.slice(0,7);
      const anual=await ventas(db,{fechaInicio:`${anio}-01-01`,fechaFin:`${anio}-12-31`});
      const delMes=anual.filter(p=>diaArgentino(p.fechaCobrado).startsWith(mes)),r=resumenVentas(delMes);
      const inv=await inventario(db,{necesitaReposicion:'true'});
      const alertas=inv.productos.filter(p=>p.disponible).sort((a,b)=>a.stock-b.stock||a.id-b.id).slice(0,10);
      const mensual=agruparVentas(anual,'mensual');
      return {success:true,data:{
        ventasMensuales:MESES.map((label,index)=>{const m=mensual.find(x=>x.fecha===`${anio}-${String(index+1).padStart(2,'0')}`);return {mes:label,total:m?.totalVentas||0,cantidad:m?.cantidadPedidos||0};}),
        ventasPorCategoria:agruparProductos(delMes,'categoria').map(c=>({categoria:c.categoria,total:c.ingresoTotal,cantidad:c.cantidadVendida})),
        top10Productos:agruparProductos(delMes).slice(0,10).map(p=>({nombre:p.nombreProducto,categoria:p.categoria,cantidadVendida:p.cantidadVendida,totalVentas:p.ingresoTotal})),
        alertasStock:alertas.map(p=>({producto:p.nombre,categoria:p.categoria,stockActual:p.stock,stockMinimo:p.stockMinimo,urgencia:p.stock===0?'CRÍTICO':p.stock<p.stockMinimo/2?'URGENTE':'MEDIO'})),
        resumenMes:{totalVentas:r.total,cantidadPedidos:r.cantidadPedidos,promedioVenta:r.cantidadPedidos?r.total/r.cantidadPedidos:0},
        ventasPorMetodoPago:porMetodo(delMes),metricas:await metricas(db,now),fecha:dia
      }};
    })
  };
}
