import Pedido from "../models/pedidoSchema.js";
import Producto from "../models/productoSchema.js";
import Usuario from "../models/usuarioSchema.js";
import Compra from "../models/compraSchema.js";

/**
 * Reporte de ventas general
 * GET /api/reportes/ventas
 */
export const reporteVentas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, mozo, metodoPago } = req.query;
    
    let filtros = {};
    if (fechaInicio || fechaFin) {
      filtros.fechaInicio = fechaInicio;
      filtros.fechaFin = fechaFin;
    }
    if (mozo) filtros.mozo = mozo;
    if (metodoPago) filtros.metodoPago = metodoPago;
    
    const pedidos = await Pedido.reporteVentas(filtros);
    
    // Calcular totales
    const totalVentas = pedidos.reduce((sum, p) => sum + p.total, 0);
    const totalDescuentos = pedidos.reduce((sum, p) => sum + (p.descuento.monto || 0), 0);
    const subtotalVentas = pedidos.reduce((sum, p) => sum + p.subtotal, 0);
    
    // Agrupar por método de pago
    const ventasPorMetodo = {};
    pedidos.forEach(p => {
      if (!ventasPorMetodo[p.metodoPago]) {
        ventasPorMetodo[p.metodoPago] = {
          cantidad: 0,
          total: 0
        };
      }
      ventasPorMetodo[p.metodoPago].cantidad++;
      ventasPorMetodo[p.metodoPago].total += p.total;
    });
    
    res.status(200).json({
      pedidos,
      resumen: {
        cantidadPedidos: pedidos.length,
        subtotal: subtotalVentas,
        descuentos: totalDescuentos,
        total: totalVentas,
        ventasPorMetodo
      }
    });
  } catch (error) {
    console.error('Error al generar reporte de ventas:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al generar reporte"
    });
  }
};

/**
 * Reporte de ventas por mozo
 * GET /api/reportes/ventas/mozo
 */
export const reporteVentasPorMozo = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    let filtro = { estado: 'Cobrado' };
    
    if (fechaInicio || fechaFin) {
      filtro.fechaCobrado = {};
      if (fechaInicio) filtro.fechaCobrado.$gte = new Date(fechaInicio);
      if (fechaFin) filtro.fechaCobrado.$lte = new Date(fechaFin);
    }
    
    const reporte = await Pedido.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: '$mozo',
          cantidadPedidos: { $sum: 1 },
          totalVentas: { $sum: '$total' },
          totalDescuentos: { $sum: '$descuento.monto' }
        }
      },
      {
        $lookup: {
          from: 'usuarios',
          localField: '_id',
          foreignField: '_id',
          as: 'mozo'
        }
      },
      { $unwind: '$mozo' },
      {
        $project: {
          _id: 1,
          mozo: {
            nombre: '$mozo.nombre',
            apellido: '$mozo.apellido',
            email: '$mozo.email'
          },
          cantidadPedidos: 1,
          totalVentas: 1,
          totalDescuentos: 1,
          promedioVenta: { $divide: ['$totalVentas', '$cantidadPedidos'] }
        }
      },
      { $sort: { totalVentas: -1 } }
    ]);
    
    res.status(200).json(reporte);
  } catch (error) {
    console.error('Error al generar reporte por mozo:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al generar reporte"
    });
  }
};

/**
 * Reporte de productos más vendidos
 * GET /api/reportes/productos/mas-vendidos
 */
export const reporteProductosMasVendidos = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, limite = 20 } = req.query;
    
    let filtro = { estado: 'Cobrado' };
    
    if (fechaInicio || fechaFin) {
      filtro.fechaCobrado = {};
      if (fechaInicio) filtro.fechaCobrado.$gte = new Date(fechaInicio);
      if (fechaFin) filtro.fechaCobrado.$lte = new Date(fechaFin);
    }
    
    const reporte = await Pedido.aggregate([
      { $match: filtro },
      { $unwind: '$productos' },
      {
        $group: {
          _id: '$productos.producto',
          nombreProducto: { $first: '$productos.nombre' },
          cantidadVendida: { $sum: '$productos.cantidad' },
          ingresoTotal: { $sum: '$productos.subtotal' }
        }
      },
      { $sort: { cantidadVendida: -1 } },
      { $limit: parseInt(limite) },
      {
        $lookup: {
          from: 'productos',
          localField: '_id',
          foreignField: '_id',
          as: 'producto'
        }
      },
      { $unwind: { path: '$producto', preserveNullAndEmptyArrays: true } }
    ]);
    
    res.status(200).json(reporte);
  } catch (error) {
    console.error('Error al generar reporte de productos más vendidos:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al generar reporte"
    });
  }
};

/**
 * Reporte de ventas por categoría
 * GET /api/reportes/ventas/categoria
 */
export const reporteVentasPorCategoria = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    let filtro = { estado: 'Cobrado' };
    
    if (fechaInicio || fechaFin) {
      filtro.fechaCobrado = {};
      if (fechaInicio) filtro.fechaCobrado.$gte = new Date(fechaInicio);
      if (fechaFin) filtro.fechaCobrado.$lte = new Date(fechaFin);
    }
    
    const reporte = await Pedido.aggregate([
      { $match: filtro },
      { $unwind: '$productos' },
      {
        $lookup: {
          from: 'productos',
          localField: 'productos.producto',
          foreignField: '_id',
          as: 'productoInfo'
        }
      },
      { $unwind: { path: '$productoInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$productoInfo.categoria',
          cantidadProductos: { $sum: '$productos.cantidad' },
          ingresoTotal: { $sum: '$productos.subtotal' }
        }
      },
      { $sort: { ingresoTotal: -1 } }
    ]);
    
    res.status(200).json(reporte);
  } catch (error) {
    console.error('Error al generar reporte por categoría:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al generar reporte"
    });
  }
};

/**
 * Reporte de ventas diarias
 * GET /api/reportes/ventas/diarias
 */
export const reporteVentasDiarias = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    let filtro = { estado: 'Cobrado' };
    
    if (fechaInicio || fechaFin) {
      filtro.fechaCobrado = {};
      if (fechaInicio) filtro.fechaCobrado.$gte = new Date(fechaInicio);
      if (fechaFin) filtro.fechaCobrado.$lte = new Date(fechaFin);
    }
    
    const reporte = await Pedido.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: {
            year: { $year: '$fechaCobrado' },
            month: { $month: '$fechaCobrado' },
            day: { $dayOfMonth: '$fechaCobrado' }
          },
          cantidadPedidos: { $sum: 1 },
          totalVentas: { $sum: '$total' },
          totalDescuentos: { $sum: '$descuento.monto' }
        }
      },
      {
        $project: {
          _id: 0,
          fecha: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          cantidadPedidos: 1,
          totalVentas: 1,
          totalDescuentos: 1
        }
      },
      { $sort: { fecha: 1 } }
    ]);
    
    res.status(200).json(reporte);
  } catch (error) {
    console.error('Error al generar reporte diario:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al generar reporte"
    });
  }
};

/**
 * Reporte de inventario
 * GET /api/reportes/inventario
 */
export const reporteInventario = async (req, res) => {
  try {
    const { categoria, necesitaReposicion } = req.query;
    
    let filtro = {};
    if (categoria) filtro.categoria = categoria;
    
    let productos = await Producto.find(filtro).sort({ nombre: 1 });
    
    if (necesitaReposicion === 'true') {
      productos = productos.filter(p => p.stock <= p.stockMinimo);
    }
    
    // Calcular totales
    const valorInventario = productos.reduce((sum, p) => {
      return sum + (p.stock * p.costo);
    }, 0);
    
    const valorVenta = productos.reduce((sum, p) => {
      return sum + (p.stock * p.precio);
    }, 0);
    
    res.status(200).json({
      productos,
      resumen: {
        totalProductos: productos.length,
        valorInventario,
        valorVenta,
        margenPotencial: valorVenta - valorInventario,
        productosConBajoStock: productos.filter(p => p.stock <= p.stockMinimo).length
      }
    });
  } catch (error) {
    console.error('Error al generar reporte de inventario:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al generar reporte"
    });
  }
};

/**
 * Reporte de compras
 * GET /api/reportes/compras
 */
export const reporteCompras = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, proveedor, estado } = req.query;
    
    let filtro = {};
    
    if (fechaInicio || fechaFin) {
      filtro.fechaCompra = {};
      if (fechaInicio) filtro.fechaCompra.$gte = new Date(fechaInicio);
      if (fechaFin) filtro.fechaCompra.$lte = new Date(fechaFin);
    }
    
    if (proveedor) filtro['proveedor.nombre'] = new RegExp(proveedor, 'i');
    if (estado) filtro.estado = estado;
    
    const compras = await Compra.find(filtro)
      .populate('registradoPor', 'nombre apellido')
      .sort({ fechaCompra: -1 });
    
    // Calcular totales
    const totalCompras = compras.reduce((sum, c) => sum + c.total, 0);
    const subtotalCompras = compras.reduce((sum, c) => sum + c.subtotal, 0);
    const totalImpuestos = compras.reduce((sum, c) => sum + c.impuestos.iva.monto, 0);
    
    // Agrupar por proveedor
    const comprasPorProveedor = {};
    compras.forEach(c => {
      const nombreProveedor = c.proveedor.nombre;
      if (!comprasPorProveedor[nombreProveedor]) {
        comprasPorProveedor[nombreProveedor] = {
          cantidad: 0,
          total: 0
        };
      }
      comprasPorProveedor[nombreProveedor].cantidad++;
      comprasPorProveedor[nombreProveedor].total += c.total;
    });
    
    res.status(200).json({
      compras,
      resumen: {
        cantidadCompras: compras.length,
        subtotal: subtotalCompras,
        impuestos: totalImpuestos,
        total: totalCompras,
        comprasPorProveedor
      }
    });
  } catch (error) {
    console.error('Error al generar reporte de compras:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al generar reporte"
    });
  }
};

/**
 * Dashboard general (estadísticas generales)
 * GET /api/reportes/dashboard
 */
export const dashboard = async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const finHoy = new Date();
    finHoy.setHours(23, 59, 59, 999);
    
    // Ventas del día
    const ventasHoy = await Pedido.find({
      estado: 'Cobrado',
      fechaCobrado: { $gte: hoy, $lte: finHoy }
    });
    
    // Pedidos activos
    const pedidosActivos = await Pedido.countDocuments({
      estado: { $nin: ['Cobrado', 'Cancelado'] }
    });
    
    // Productos con stock bajo
    const productosStockBajo = await Producto.countDocuments({
      $expr: { $lte: ['$stock', '$stockMinimo'] }
    });
    
    // Calcular totales del día
    const totalVentasHoy = ventasHoy.reduce((sum, p) => sum + p.total, 0);
    const cantidadVentasHoy = ventasHoy.length;
    
    res.status(200).json({
      ventasDelDia: {
        cantidad: cantidadVentasHoy,
        total: totalVentasHoy,
        promedio: cantidadVentasHoy > 0 ? totalVentasHoy / cantidadVentasHoy : 0
      },
      pedidosActivos,
      productosStockBajo,
      fecha: new Date()
    });
  } catch (error) {
    console.error('Error al generar dashboard:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al generar dashboard"
    });
  }
};
