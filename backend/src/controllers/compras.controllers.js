import { pool } from '../database/mysql/pool.js';
import { comprasService } from '../services/mysql/compras.js';
import { requireCondition as check } from '../database/mysql/transaction.js';
const service = comprasService(pool);
const usuario = req => req.user?.id || req.id;
const manejar = fn => async (req,res) => {
  try { await fn(req,res); }
  catch (error) {
    console.error('[COMPRAS]', error.message);
    const conflicto = ['ER_DUP_ENTRY','ER_LOCK_DEADLOCK','ER_LOCK_WAIT_TIMEOUT'].includes(error.code);
    const status = error.status || (conflicto ? 409 : 500);
    res.status(status).json({ mensaje:error.status ? error.message : conflicto ? 'La operación entró en conflicto. Volvé a consultar antes de reintentar.' : 'Error al procesar la compra' });
  }
};
export const obtenerCompras = manejar(async(req,res)=>res.json(await service.listar(usuario(req),req.query)));
export const obtenerUnaCompra = manejar(async(req,res)=>res.json(await service.obtener(usuario(req),req.params.id)));
export const obtenerComprasPorProveedor = manejar(async(req,res)=>res.json(await service.listar(usuario(req),{...req.query,proveedor:req.params.proveedor})));
export const obtenerComprasPendientesPago = manejar(async(req,res)=>res.json(await service.listar(usuario(req),{...req.query,pendientesPago:true})));
export const obtenerComprasPendientes = manejar(async(req,res)=>res.json(await service.listar(usuario(req),{...req.query,estado:'Pendiente'})));
export const reporteComprasPorProveedor = manejar(async(req,res)=>res.json(await service.reporte(usuario(req),req.query)));
export const crearCompra = manejar(async(req,res)=>res.status(201).json({mensaje:'Compra registrada exitosamente',compra:await service.crear(usuario(req),(req.body || {}))}));
export const actualizarCompra = manejar(async(req,res)=>res.json({mensaje:'Compra actualizada correctamente',compra:await service.actualizar(usuario(req),req.params.id,(req.body || {}))}));
export const eliminarCompra = manejar(async(req,res)=>res.json({mensaje:'Compra eliminada correctamente',compra:await service.eliminar(usuario(req),req.params.id)}));
export const registrarRecepcion = manejar(async(req,res)=>res.json({mensaje:'Recepción registrada exitosamente',compra:await service.recibir(usuario(req),req.params.id,(req.body || {}))}));
export const registrarRecepcionCompra = registrarRecepcion;
export const registrarPagoCompra = manejar(async(req,res)=>res.json({mensaje:'Pago registrado correctamente',compra:await service.pagar(usuario(req),req.params.id,(req.body || {}))}));
export const cancelarCompra = manejar(async(req,res)=>res.json({mensaje:'Compra cancelada exitosamente',compra:await service.cancelar(usuario(req),req.params.id)}));
export const cambiarEstadoCompra = manejar(async(req,res)=>{
  // El estado Parcial/Recibida se obtiene de los renglones efectivamente recibidos.
  check(req.body?.estado==='Cancelada','Para cambiar a Parcial o Recibida registrá la recepción de mercadería');
  res.json({mensaje:'Compra cancelada exitosamente',compra:await service.cancelar(usuario(req),req.params.id)});
});
