// La creación pública conserva temporalmente su implementación MongoDB.
// El circuito de mozos, cocina y caja usa el servicio MySQL que sigue debajo.
import Pedido from '../models/pedidoSchema.js';
import Mesa from '../models/mesaSchema.js';
import Producto from '../models/productoSchema.js';
import { enviarNotificacionPedido } from '../helpers/emailHelper.js';

import { pool, getMySQLConnection } from '../database/mysql/pool.js';
import { pedidoService } from '../services/mysql/pedidos.js';
import { requireCondition as ensure, positiveId } from '../database/mysql/transaction.js';

const service = pedidoService(pool);
const ESTADOS = ['Pendiente','En Preparación','Listo','Entregado','Cobrado','Cancelado'];
export function normalizarEstado(valor) {
  ensure(typeof valor === 'string','Estado inválido');
  if (valor.toLowerCase() === 'servido') return 'Entregado';
  const estado = ESTADOS.find(e => e.toLowerCase() === valor.trim().toLowerCase());
  ensure(estado,'Estado inválido');
  return estado;
}
function usuario(req) {
  ensure(req.user?.id != null,'Usuario no autenticado',401);
  return positiveId(req.user.id);
}
export async function leerPedidosSQL(operacion) {
  const c = await getMySQLConnection();
  try {
    await c.beginTransaction();
    const resultado = await operacion(c);
    await c.commit();
    return resultado;
  } catch (error) { await c.rollback(); throw error; }
  finally { c.release(); }
}
function fechaFiltro(valor, fin = false) {
  ensure(typeof valor === 'string','Fecha inválida');
  const dia = /^\d{4}-\d{2}-\d{2}$/.test(valor);
  const fecha = new Date(dia ? valor+'T00:00:00-03:00' : valor);
  ensure(!Number.isNaN(fecha.getTime()),'Fecha inválida');
  if (dia && fin) fecha.setTime(fecha.getTime()+86400000);
  return {fecha, exclusivo:dia && fin};
}
export async function consultarPedidos(c, filtros = {}, orden = 'desc') {
  const where = ['p.activo = TRUE'], valores = [];
  for (const [campo,columna] of [['id','p.id'],['mesa','p.mesa_id'],['mozo','p.mozo_id']]) {
    if (filtros[campo] != null) { where.push(columna+' = ?'); valores.push(positiveId(filtros[campo])); }
  }
  if (filtros.estado) { where.push('p.estado = ?'); valores.push(normalizarEstado(filtros.estado)); }
  if (filtros.estados) {
    const estados = filtros.estados.map(normalizarEstado);
    where.push('p.estado IN ('+estados.map(()=>'?').join(',')+')');valores.push(...estados);
  }
  if (filtros.fechaInicio) { const f=fechaFiltro(filtros.fechaInicio);where.push('p.fecha_creacion >= ?');valores.push(f.fecha); }
  if (filtros.fechaFin) { const f=fechaFiltro(filtros.fechaFin,true);where.push('p.fecha_creacion '+(f.exclusivo?'<':'<=')+' ?');valores.push(f.fecha); }
  let limite='';
  if(filtros.limit!=null){const n=Number(filtros.limit);ensure(Number.isInteger(n)&&n>0&&n<=1000,'Límite inválido');limite=' LIMIT '+n;}
  const [rows] = await c.execute(
    `SELECT p.*,m.numero mesa_numero,m.ubicacion mesa_ubicacion,m.capacidad mesa_capacidad,
     u.nombre mozo_nombre,u.apellido mozo_apellido,
     pg.fecha_pago,pg.monto_recibido,pg.cambio,pg.cajero_id,
     ca.nombre cajero_nombre,ca.apellido cajero_apellido
     FROM pedidos p JOIN mesas m ON m.id=p.mesa_id JOIN usuarios u ON u.id=p.mozo_id
     LEFT JOIN pagos_pedido pg ON pg.pedido_id=p.id LEFT JOIN usuarios ca ON ca.id=pg.cajero_id
     WHERE ${where.join(' AND ')} ORDER BY p.fecha_creacion ${orden==='asc'?'ASC':'DESC'},p.id ${orden==='asc'?'ASC':'DESC'}${limite}`,valores
  );
  if (!rows.length) return [];
  const ids=rows.map(r=>r.id),marcas=ids.map(()=>'?').join(',');
  const [detalles]=await c.execute(
    `SELECT d.*,pr.nombre nombre_actual,pr.precio precio_actual,cat.nombre categoria
     FROM detalle_pedido d JOIN productos pr ON pr.id=d.producto_id
     JOIN categorias cat ON cat.id=pr.categoria_id WHERE d.pedido_id IN (${marcas}) ORDER BY d.pedido_id,d.orden`,ids
  );
  const [eventos]=await c.execute(
    `SELECT h.*,u.nombre,u.apellido FROM historial_estados_pedido h JOIN usuarios u ON u.id=h.usuario_id
     WHERE h.pedido_id IN (${marcas}) ORDER BY h.fecha,h.id`,ids
  );
  return rows.map(p=>{
    const productos=detalles.filter(d=>d.pedido_id===p.id).map(d=>({
      _id:String(d.id),producto:{_id:String(d.producto_id),id:String(d.producto_id),nombre:d.nombre_actual,categoria:d.categoria,precio:Number(d.precio_actual)},
      nombre:d.nombre_historico,cantidad:Number(d.cantidad),precioUnitario:Number(d.precio_unitario),subtotal:Number(d.subtotal),observaciones:d.observaciones,
    }));
    return {
      _id:String(p.id),id:String(p.id),numeroPedido:p.numero_pedido,
      mesa:{_id:String(p.mesa_id),id:String(p.mesa_id),numero:p.mesa_numero,ubicacion:p.mesa_ubicacion,capacidad:p.mesa_capacidad},
      numeroMesa:p.numero_mesa_historico,
      mozo:{_id:String(p.mozo_id),id:String(p.mozo_id),nombre:p.mozo_nombre,apellido:p.mozo_apellido},
      nombreMozo:p.nombre_mozo_historico,estado:p.estado,estadoCocina:p.estado_cocina,estadoCaja:p.estado_caja,
      productos,subtotal:Number(p.subtotal),descuento:{porcentaje:Number(p.descuento_porcentaje),monto:Number(p.descuento_monto),motivo:p.descuento_motivo},total:Number(p.total),
      metodoPago:p.metodo_pago,
      pago:p.cajero_id?{fecha:p.fecha_pago,cajero:{_id:String(p.cajero_id),id:String(p.cajero_id),nombre:p.cajero_nombre,apellido:p.cajero_apellido},montoPagado:Number(p.monto_recibido),cambio:Number(p.cambio)}:{cambio:0},
      historialEstados:eventos.filter(e=>e.pedido_id===p.id).map(e=>({_id:String(e.id),estado:e.estado,fecha:e.fecha,usuario:{_id:String(e.usuario_id),id:String(e.usuario_id),nombre:e.nombre,apellido:e.apellido},observacion:e.observacion})),
      observacionesGenerales:p.observaciones_generales,tiempoEstimado:p.tiempo_estimado,
      fechaCreacion:p.fecha_creacion,fechaListo:p.fecha_listo,fechaServido:p.fecha_servido,fechaCobrado:p.fecha_cobrado,
      cancelado:{activo:p.estado==='Cancelado',motivo:p.cancelado_motivo||'',fecha:p.cancelado_fecha,usuario:p.cancelado_por_id?String(p.cancelado_por_id):undefined},
      activo:Boolean(p.activo),createdAt:p.created_at,updatedAt:p.updated_at,
      cantidadProductos:productos.reduce((sum,r)=>sum+r.cantidad,0),
      tiempoPreparacionReal:p.fecha_listo?Math.round((p.fecha_listo-p.fecha_creacion)/60000):null,
    };
  });
}
async function porId(id) {
  return leerPedidosSQL(async c=>{
    const [p]=await consultarPedidos(c,{id:positiveId(id)});
    ensure(p,'Pedido no encontrado',404);
    return p;
  });
}
function endpoint(operacion) {
  return async(req,res)=>{
    try {const resultado=await operacion(req);return res.status(resultado.status||200).json(resultado.body);}
    catch(error){
      if(error.status)return res.status(error.status).json({mensaje:error.message});
      if(['ER_DUP_ENTRY','ER_LOCK_DEADLOCK','ER_LOCK_WAIT_TIMEOUT'].includes(error.code))return res.status(409).json({mensaje:'La operación no se confirmó por un conflicto concurrente. Actualizá la consulta antes de reintentar'});
      if(error.code==='ER_CHECK_CONSTRAINT_VIOLATED')return res.status(400).json({mensaje:'La operación incumple una restricción del pedido o del stock'});
      console.error('Error en pedidos MySQL:',error.code||error.message);
      return res.status(500).json({mensaje:'Error al procesar el pedido'});
    }
  };
}
async function notificar(req,pedido,tipo) {
  try {
    const io=req.app?.get('io');if(!io)return;
    const datos={pedido,pedidoId:pedido._id,estado:pedido.estado,nuevoEstado:pedido.estado,numeroPedido:pedido.numeroPedido,numeroMesa:pedido.numeroMesa};
    for(const sala of ['mozos','cocina','caja'])io.to(sala).emit('pedido-actualizado',datos);
    if(tipo==='crear'){
      io.to('cocina').emit('nuevo-pedido-cocina',{...pedido,pedido});
      io.to('caja').emit('nuevo-pedido-cocina',{pedido});
      io.to('mozos').emit('nuevo-pedido',{pedido});
    }
    if(['Listo','Entregado'].includes(pedido.estado))for(const sala of ['mozos','caja','cocina'])io.to(sala).emit('pedido-listo',datos);
    if(pedido.estado==='Cancelado')for(const sala of ['mozos','caja','cocina'])io.to(sala).emit('pedido-cancelado',datos);
    if(['crear','actualizar','cancelar','cobrar'].includes(tipo)){
      const info=await leerPedidosSQL(async c=>{
        const [[mesa]]=await c.execute('SELECT id,numero,estado FROM mesas WHERE id=?',[Number(pedido.mesa._id)]);
        const [productos]=await c.query(`SELECT p.id,p.nombre,p.descripcion,p.precio,p.costo,p.stock,p.stock_minimo stockMinimo,p.unidad_medida unidadMedida,p.disponible,p.imagen_url imagenUrl,c.nombre categoria FROM productos p JOIN categorias c ON c.id=p.categoria_id`);
        return {mesa,productos:productos.map(p=>({...p,_id:String(p.id),id:String(p.id),disponible:Boolean(p.disponible)}))};
      });
      io.to('mozos').emit('mesa-actualizada',{mesaId:String(info.mesa.id),numeroMesa:info.mesa.numero,estado:info.mesa.estado});
      io.to('mozos').emit('productos-actualizados',{productos:info.productos});
    }
  }catch(error){console.error('Notificación de pedido:',error.code||error.message);}
}
const lista=(filtros,orden)=>endpoint(async req=>({body:await leerPedidosSQL(c=>consultarPedidos(c,filtros(req),orden))}));
export const obtenerPedidos=lista(req=>req.query||{});
export const obtenerUnPedido=endpoint(async req=>({body:await porId(req.params.id)}));
export const obtenerPedidosPorEstado=lista(req=>({estado:req.params.estado}));
export const obtenerPedidosPorMesa=lista(req=>({mesa:req.params.mesaId}));
export const obtenerPedidosPorMozo=lista(req=>({mozo:req.params.mozoId}));
export const obtenerPedidosCocina=lista(()=>({estados:['Pendiente','En Preparación']}),'asc');
export const obtenerPedidosListos=lista(()=>({estado:'Listo'}),'asc');
export const obtenerPedidosCaja=lista(()=>({estados:['Pendiente','En Preparación','Listo','Entregado']}));
export const crearPedido=endpoint(async req=>{
  const idUsuario=usuario(req),b=req.body||{};
  if(b.mozo!=null)ensure(positiveId(b.mozo)===idUsuario,'El mozo debe coincidir con el usuario autenticado',403);
  const r=await service.crear({mesa:b.mesa,usuario:idUsuario,productos:b.productos,observacionesGenerales:b.observacionesGenerales});
  const pedido=await porId(r.id);await notificar(req,pedido,'crear');
  return {status:201,body:{mensaje:'Pedido creado exitosamente',pedido}};
});
export const actualizarPedido=endpoint(async req=>{
  const r=await service.actualizar({id:req.params.id,usuario:usuario(req),productos:req.body?.productos,observacionesGenerales:req.body?.observacionesGenerales});
  const pedido=await porId(r.id);await notificar(req,pedido,'actualizar');
  return {body:{mensaje:'Pedido actualizado correctamente',pedido}};
});
async function cancelar(req){
  const r=await service.cancelar({id:req.params.id,usuario:usuario(req),motivo:req.body?.motivo||req.body?.observacion});
  const pedido=await porId(r.id);await notificar(req,pedido,'cancelar');
  return {body:{mensaje:'Pedido cancelado correctamente',pedido}};
}
export const cancelarPedido=endpoint(cancelar);
async function estado(req,forzado){
  const nuevo=normalizarEstado(forzado||req.body?.estado);
  if(nuevo==='Cancelado')return cancelar(req);
  const r=await service.cambiarEstado({id:req.params.id,usuario:usuario(req),estado:nuevo,observacion:req.body?.observacion||''});
  const pedido=await porId(r.id);await notificar(req,pedido,'estado');
  return {body:{mensaje:'Estado actualizado correctamente',pedido}};
}
export const cambiarEstadoPedido=endpoint(req=>estado(req));
export const marcarPedidoListo=endpoint(req=>estado(req,'Listo'));
export const cobrarPedido=endpoint(async req=>{
  const r=await service.cobrar({id:req.params.id,usuario:usuario(req),metodoPago:req.body?.metodoPago,montoPagado:req.body?.montoPagado});
  const pedido=await porId(r.id);await notificar(req,pedido,'cobrar');
  return {body:{mensaje:'Pago registrado exitosamente',pedido,ticket:{
    numeroPedido:pedido.numeroPedido,fecha:pedido.pago.fecha,mesa:pedido.numeroMesa,mozo:pedido.nombreMozo,
    cajero:`${pedido.pago.cajero.nombre} ${pedido.pago.cajero.apellido}`,
    productos:pedido.productos.map(({nombre,cantidad,precioUnitario,subtotal,observaciones})=>({nombre,cantidad,precioUnitario,subtotal,observaciones})),
    subtotal:pedido.subtotal,descuento:pedido.descuento,total:pedido.total,metodoPago:pedido.metodoPago,montoPagado:pedido.pago.montoPagado,cambio:pedido.pago.cambio,
  }}};
});
export const registrarPago=cobrarPedido;

/**
 * Crear un pedido desde el menú público, sin autenticación.
 * POST /api/pedidos/publico
 */
export const crearPedidoPublico = async (req, res) => {
  try {
    const {
      tipoPedido,
      numeroMesa,
      cliente,
      productos,
      observacionesGenerales,
      metodoPago
    } = req.body;

    if (!['Local', 'Domicilio'].includes(tipoPedido)) {
      return res.status(400).json({ mensaje: 'El tipo de pedido no es válido' });
    }

    if (!cliente?.nombre || !cliente?.telefono || !cliente?.email) {
      return res.status(400).json({
        mensaje: 'Nombre, teléfono y email son requeridos'
      });
    }

    if (tipoPedido === 'Domicilio' && !cliente.direccion) {
      return res.status(400).json({ mensaje: 'La dirección es requerida para pedidos a domicilio' });
    }

    let mesaDoc = null;
    if (tipoPedido === 'Local') {
      if (!Number.isInteger(Number(numeroMesa)) || Number(numeroMesa) < 1) {
        return res.status(400).json({ mensaje: 'El número de mesa es requerido para pedidos en el local' });
      }
      mesaDoc = await Mesa.findOne({ numero: Number(numeroMesa) });
      if (!mesaDoc) {
        return res.status(404).json({ mensaje: 'La mesa indicada no existe' });
      }
    }

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ mensaje: 'El pedido debe incluir al menos un producto' });
    }

    const productosDelPedido = [];
    for (const item of productos) {
      const cantidad = Number(item.cantidad);
      if (!item.producto || !Number.isInteger(cantidad) || cantidad < 1) {
        return res.status(400).json({ mensaje: 'Los productos del pedido no son válidos' });
      }

      const producto = await Producto.findById(item.producto);
      if (!producto || !producto.disponible) {
        return res.status(400).json({ mensaje: 'Uno de los productos ya no está disponible' });
      }
      if (producto.stock < cantidad) {
        return res.status(400).json({
          mensaje: `Stock insuficiente para ${producto.nombre}. Stock disponible: ${producto.stock}`
        });
      }

      productosDelPedido.push({
        producto: producto._id,
        nombre: producto.nombre,
        cantidad,
        precioUnitario: producto.precio,
        subtotal: producto.precio * cantidad,
        observaciones: String(item.observaciones || '').slice(0, 200)
      });
    }

    const subtotal = productosDelPedido.reduce((total, item) => total + item.subtotal, 0);
    const nuevoPedido = await Pedido.create({
      numeroPedido: await Pedido.generarNumeroPedido(),
      tipoPedido,
      mesa: mesaDoc?._id,
      numeroMesa: mesaDoc?.numero,
      cliente: {
        nombre: String(cliente.nombre).trim(),
        telefono: String(cliente.telefono).trim(),
        email: String(cliente.email).trim(),
        direccion: String(cliente.direccion || '').trim(),
        referencia: String(cliente.referencia || '').trim()
      },
      productos: productosDelPedido,
      observacionesGenerales: String(observacionesGenerales || '').slice(0, 500),
      subtotal,
      total: subtotal,
      metodoPago: ['Efectivo', 'Transferencia'].includes(metodoPago) ? metodoPago : 'Pendiente',
      historialEstados: [{
        estado: 'Pendiente',
        fecha: new Date(),
        observacion: 'Pedido recibido desde el menú público'
      }]
    });

    for (const item of productos) {
      await Producto.findByIdAndUpdate(item.producto, { $inc: { stock: -Number(item.cantidad) } });
    }

    if (mesaDoc) {
      await Mesa.findByIdAndUpdate(mesaDoc._id, { estado: 'Ocupada' });
    }

    const pedidoCompleto = await Pedido.findById(nuevoPedido._id)
      .populate('productos.producto', 'nombre categoria');
    const io = req.app.get('io');
    if (io) {
      io.to('cocina').emit('nuevo-pedido-cocina', {
        pedido: pedidoCompleto,
        mensaje: `Nuevo pedido online #${pedidoCompleto.numeroPedido}`
      });
      io.to('caja').emit('nuevo-pedido-online', { pedido: pedidoCompleto });
    }

    enviarNotificacionPedido(pedidoCompleto).catch((error) => {
      console.error('Error enviando email del pedido público:', error.message);
    });

    const whatsappNumber = process.env.WHATSAPP_RESTAURANTE;
    const whatsappUrl = whatsappNumber
      ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Nuevo pedido ${pedidoCompleto.numeroPedido} por ${pedidoCompleto.total}`
      )}`
      : null;

    return res.status(201).json({
      mensaje: 'Pedido recibido correctamente',
      pedido: pedidoCompleto,
      whatsappUrl
    });
  } catch (error) {
    console.error('Error al crear pedido público:', error);
    return res.status(500).json({ mensaje: 'No se pudo registrar el pedido' });
  }
};
