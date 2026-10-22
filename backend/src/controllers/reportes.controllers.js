import { pool } from '../database/mysql/pool.js';
import { reportesService } from '../services/mysql/reportes.js';
const service=reportesService(pool);
const endpoint=metodo=>async(req,res)=>{
  try {res.json(await service[metodo](req.user?.id||req.id,req.query));}
  catch(error){console.error('[REPORTES]',error.message);res.status(error.status||500).json({mensaje:error.status?error.message:'No se pudo generar el reporte'});}
};
export const reporteVentas=endpoint('ventas');
export const reporteVentasPorFecha=reporteVentas;
export const reporteVentasPorMozo=endpoint('mozos');
export const reporteVentasDiarias=endpoint('diarias');
export const reporteVentasDiario=reporteVentasDiarias;
export const reporteVentasMensual=endpoint('mensuales');
export const reporteVentasPorMetodoPago=endpoint('metodos');
export const reporteProductosMasVendidos=endpoint('productos');
export const reporteVentasPorProducto=reporteProductosMasVendidos;
export const reporteVentasPorCategoria=endpoint('categorias');
export const reporteInventario=endpoint('inventario');
export const reporteProductosBajoStock=async(req,res)=>{
  try {res.json(await service.inventario(req.user?.id||req.id,{...req.query,necesitaReposicion:'true'}));}
  catch(error){res.status(error.status||500).json({mensaje:error.status?error.message:'No se pudo consultar el inventario'});}
};
export const reporteCompras=endpoint('compras');
export const reporteCierresCaja=endpoint('cierres');
export const reporteResumenDiario=endpoint('resumenDiario');
export const dashboard=reporteResumenDiario;
