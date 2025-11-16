import Pedido from '../models/pedidoSchema.js';
import Producto from '../models/productoSchema.js';

/**
 * @desc    Obtener estadísticas completas del dashboard
 * @route   GET /api/dashboard/estadisticas
 * @access  SuperAdministrador, Gerente
 */
export const obtenerEstadisticasDashboard = async (req, res) => {
  try {
    const mesActual = new Date().getMonth(); // 0-11
    const añoActual = new Date().getFullYear();

    // ============================================
    // 1. VENTAS MENSUALES (últimos 12 meses)
    // ============================================
    const ventasMensuales = await calcularVentasMensuales(añoActual);

    // ============================================
    // 2. VENTAS POR CATEGORÍA (mes actual)
    // ============================================
    const ventasPorCategoria = await calcularVentasPorCategoria(mesActual, añoActual);

    // ============================================
    // 3. TOP 10 PRODUCTOS MÁS VENDIDOS (mes actual)
    // ============================================
    const top10Productos = await calcularTop10Productos(mesActual, añoActual);

    // ============================================
    // 4. ALERTAS DE STOCK BAJO
    // ============================================
    const alertasStock = await obtenerProductosStockBajo();

    // ============================================
    // 5. RESUMEN DEL MES ACTUAL
    // ============================================
    const resumenMes = await calcularResumenMesActual(mesActual, añoActual);

    res.status(200).json({
      success: true,
      data: {
        ventasMensuales,
        ventasPorCategoria,
        top10Productos,
        alertasStock,
        resumenMes
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del dashboard',
      error: error.message
    });
  }
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Calcular ventas mensuales de los últimos 12 meses
 */
const calcularVentasMensuales = async (año) => {
  const mesesLabels = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const ventasPorMes = await Pedido.aggregate([
    {
      $match: {
        estado: 'Cobrado',
        createdAt: {
          $gte: new Date(año, 0, 1), // 1 de enero del año actual
          $lt: new Date(año + 1, 0, 1) // 1 de enero del año siguiente
        }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        total: { $sum: '$total' },
        cantidad: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Crear array con todos los meses (inicializar en 0)
  const resultado = mesesLabels.map((label, index) => {
    const mesData = ventasPorMes.find(v => v._id === index + 1);
    return {
      mes: label,
      total: mesData ? mesData.total : 0,
      cantidad: mesData ? mesData.cantidad : 0
    };
  });

  return resultado;
};

/**
 * Calcular ventas por categoría del mes actual
 */
const calcularVentasPorCategoria = async (mes, año) => {
  const inicioMes = new Date(año, mes, 1);
  const finMes = new Date(año, mes + 1, 1);

  const ventasPorCategoria = await Pedido.aggregate([
    {
      $match: {
        estado: 'Cobrado',
        createdAt: {
          $gte: inicioMes,
          $lt: finMes
        }
      }
    },
    {
      $unwind: '$productos'
    },
    {
      $lookup: {
        from: 'productos',
        localField: 'productos.producto',
        foreignField: '_id',
        as: 'productoInfo'
      }
    },
    {
      $unwind: '$productoInfo'
    },
    {
      $group: {
        _id: '$productoInfo.categoria',
        total: {
          $sum: {
            $multiply: ['$productos.cantidad', '$productos.precioUnitario']
          }
        },
        cantidad: { $sum: '$productos.cantidad' }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);

  return ventasPorCategoria.map(cat => ({
    categoria: cat._id || 'Sin categoría',
    total: cat.total,
    cantidad: cat.cantidad
  }));
};

/**
 * Calcular top 10 productos más vendidos del mes actual
 */
const calcularTop10Productos = async (mes, año) => {
  const inicioMes = new Date(año, mes, 1);
  const finMes = new Date(año, mes + 1, 1);

  const topProductos = await Pedido.aggregate([
    {
      $match: {
        estado: 'Cobrado',
        createdAt: {
          $gte: inicioMes,
          $lt: finMes
        }
      }
    },
    {
      $unwind: '$productos'
    },
    {
      $lookup: {
        from: 'productos',
        localField: 'productos.producto',
        foreignField: '_id',
        as: 'productoInfo'
      }
    },
    {
      $unwind: '$productoInfo'
    },
    {
      $group: {
        _id: '$productos.producto',
        nombre: { $first: '$productoInfo.nombre' },
        categoria: { $first: '$productoInfo.categoria' },
        cantidadVendida: { $sum: '$productos.cantidad' },
        totalVentas: {
          $sum: {
            $multiply: ['$productos.cantidad', '$productos.precioUnitario']
          }
        }
      }
    },
    {
      $sort: { cantidadVendida: -1 }
    },
    {
      $limit: 10
    }
  ]);

  return topProductos.map(prod => ({
    nombre: prod.nombre,
    categoria: prod.categoria,
    cantidadVendida: prod.cantidadVendida,
    totalVentas: prod.totalVentas
  }));
};

/**
 * Obtener productos con stock bajo
 */
const obtenerProductosStockBajo = async () => {
  const productos = await Producto.find({
    $expr: { $lte: ['$stock', '$stockMinimo'] },
    activo: true
  })
    .select('nombre categoria stock stockMinimo')
    .sort({ stock: 1 })
    .limit(10);

  return productos.map(prod => ({
    producto: prod.nombre,
    categoria: prod.categoria,
    stockActual: prod.stock,
    stockMinimo: prod.stockMinimo,
    urgencia: prod.stock === 0 ? 'CRÍTICO' : prod.stock < prod.stockMinimo / 2 ? 'URGENTE' : 'MEDIO'
  }));
};

/**
 * Calcular resumen del mes actual
 */
const calcularResumenMesActual = async (mes, año) => {
  const inicioMes = new Date(año, mes, 1);
  const finMes = new Date(año, mes + 1, 1);

  const resumen = await Pedido.aggregate([
    {
      $match: {
        estado: 'Cobrado',
        createdAt: {
          $gte: inicioMes,
          $lt: finMes
        }
      }
    },
    {
      $group: {
        _id: null,
        totalVentas: { $sum: '$total' },
        cantidadPedidos: { $sum: 1 },
        promedioVenta: { $avg: '$total' }
      }
    }
  ]);

  if (resumen.length === 0) {
    return {
      totalVentas: 0,
      cantidadPedidos: 0,
      promedioVenta: 0
    };
  }

  return {
    totalVentas: resumen[0].totalVentas,
    cantidadPedidos: resumen[0].cantidadPedidos,
    promedioVenta: resumen[0].promedioVenta
  };
};
