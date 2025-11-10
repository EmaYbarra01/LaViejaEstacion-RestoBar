import Compra from "../models/compraSchema.js";
import Producto from "../models/productoSchema.js";

/**
 * Obtener todas las compras
 * GET /api/compras
 */
export const obtenerCompras = async (req, res) => {
  try {
    const { estado, proveedor, fechaInicio, fechaFin } = req.query;
    
    let filtro = {};
    if (estado) filtro.estado = estado;
    if (proveedor) filtro['proveedor.nombre'] = new RegExp(proveedor, 'i');
    
    if (fechaInicio || fechaFin) {
      filtro.fechaCompra = {};
      if (fechaInicio) filtro.fechaCompra.$gte = new Date(fechaInicio);
      if (fechaFin) filtro.fechaCompra.$lte = new Date(fechaFin);
    }
    
    const compras = await Compra.find(filtro)
      .populate('registradoPor', 'nombre apellido')
      .populate('productos.productoId', 'nombre categoria')
      .sort({ fechaCompra: -1 });
    
    res.status(200).json(compras);
  } catch (error) {
    console.error('Error al obtener compras:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor al obtener compras' 
    });
  }
};

/**
 * Obtener una compra por ID
 * GET /api/compras/:id
 */
export const obtenerUnaCompra = async (req, res) => {
  try {
    const compra = await Compra.findById(req.params.id)
      .populate('registradoPor', 'nombre apellido email')
      .populate('productos.productoId', 'nombre categoria unidadMedida');
    
    if (!compra) {
      return res.status(404).json({
        mensaje: "Compra no encontrada"
      });
    }
    
    res.status(200).json(compra);
  } catch (error) {
    console.error('Error al obtener compra:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al obtener la compra"
    });
  }
};

/**
 * Crear una nueva compra
 * POST /api/compras
 */
export const crearCompra = async (req, res) => {
  try {
    const { proveedor, productos, metodoPago, numeroFactura, observaciones } = req.body;
    const registradoPorId = req.user?.id || req.userId;
    
    // Validar datos
    if (!proveedor || !proveedor.nombre || !productos || productos.length === 0) {
      return res.status(400).json({
        mensaje: "Proveedor y productos son requeridos"
      });
    }
    
    // Obtener siguiente número de compra
    const numeroCompra = await Compra.obtenerSiguienteNumeroCompra();
    
    // Crear compra
    const nuevaCompra = new Compra({
      numeroCompra,
      proveedor,
      productos,
      metodoPago: metodoPago || 'Efectivo',
      numeroFactura: numeroFactura || '',
      observaciones: observaciones || '',
      registradoPor: registradoPorId
    });
    
    await nuevaCompra.save();
    
    // Poblar el documento
    const compraCompleta = await Compra.findById(nuevaCompra._id)
      .populate('registradoPor', 'nombre apellido')
      .populate('productos.productoId', 'nombre categoria');
    
    res.status(201).json({
      mensaje: "Compra registrada exitosamente",
      compra: compraCompleta
    });
  } catch (error) {
    console.error('Error al crear compra:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al crear compra"
    });
  }
};

/**
 * Actualizar una compra
 * PUT /api/compras/:id
 */
export const actualizarCompra = async (req, res) => {
  try {
    const compraActualizada = await Compra.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('registradoPor', 'nombre apellido')
      .populate('productos.productoId', 'nombre categoria');
    
    if (!compraActualizada) {
      return res.status(404).json({
        mensaje: "Compra no encontrada"
      });
    }
    
    res.status(200).json({
      mensaje: "Compra actualizada correctamente",
      compra: compraActualizada
    });
  } catch (error) {
    console.error('Error al actualizar compra:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al actualizar compra"
    });
  }
};

/**
 * Eliminar una compra
 * DELETE /api/compras/:id
 */
export const eliminarCompra = async (req, res) => {
  try {
    const compra = await Compra.findById(req.params.id);
    
    if (!compra) {
      return res.status(404).json({
        mensaje: "Compra no encontrada"
      });
    }
    
    // Solo permitir eliminar compras pendientes
    if (compra.estado !== 'Pendiente') {
      return res.status(400).json({
        mensaje: "Solo se pueden eliminar compras en estado Pendiente"
      });
    }
    
    await Compra.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      mensaje: "Compra eliminada correctamente",
      compra
    });
  } catch (error) {
    console.error('Error al eliminar compra:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al eliminar compra"
    });
  }
};

/**
 * Registrar recepción de compra
 * PUT /api/compras/:id/recepcion
 */
export const registrarRecepcionCompra = async (req, res) => {
  try {
    const { productosRecibidos } = req.body;
    
    const compra = await Compra.findById(req.params.id);
    
    if (!compra) {
      return res.status(404).json({
        mensaje: "Compra no encontrada"
      });
    }
    
    if (compra.estado === 'Cancelada') {
      return res.status(400).json({
        mensaje: "No se puede recepcionar una compra cancelada"
      });
    }
    
    // Actualizar cantidades recibidas
    if (productosRecibidos && Array.isArray(productosRecibidos)) {
      productosRecibidos.forEach(pr => {
        const productoCompra = compra.productos.id(pr.productoId);
        if (productoCompra) {
          productoCompra.cantidadRecibida = pr.cantidadRecibida;
        }
      });
    }
    
    // Verificar si la recepción está completa
    const todosRecibidos = compra.productos.every(
      p => p.cantidadRecibida >= p.cantidad
    );
    
    const algunosRecibidos = compra.productos.some(
      p => p.cantidadRecibida > 0
    );
    
    if (todosRecibidos) {
      compra.estado = 'Recibida';
    } else if (algunosRecibidos) {
      compra.estado = 'Parcial';
    }
    
    compra.fechaRecepcion = new Date();
    await compra.save();
    
    // Actualizar stock de productos
    for (let item of compra.productos) {
      if (item.productoId && item.cantidadRecibida > 0) {
        await Producto.findByIdAndUpdate(
          item.productoId,
          { $inc: { stock: item.cantidadRecibida } }
        );
      }
    }
    
    const compraActualizada = await Compra.findById(compra._id)
      .populate('registradoPor', 'nombre apellido')
      .populate('productos.productoId', 'nombre categoria');
    
    res.status(200).json({
      mensaje: "Recepción registrada exitosamente",
      compra: compraActualizada
    });
  } catch (error) {
    console.error('Error al registrar recepción:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al registrar recepción"
    });
  }
};

/**
 * Cancelar una compra
 * PUT /api/compras/:id/cancelar
 */
export const cancelarCompra = async (req, res) => {
  try {
    const compra = await Compra.findById(req.params.id);
    
    if (!compra) {
      return res.status(404).json({
        mensaje: "Compra no encontrada"
      });
    }
    
    if (compra.estado === 'Recibida') {
      return res.status(400).json({
        mensaje: "No se puede cancelar una compra ya recibida"
      });
    }
    
    compra.estado = 'Cancelada';
    await compra.save();
    
    res.status(200).json({
      mensaje: "Compra cancelada exitosamente",
      compra
    });
  } catch (error) {
    console.error('Error al cancelar compra:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al cancelar compra"
    });
  }
};

/**
 * Obtener compras pendientes
 * GET /api/compras/pendientes
 */
export const obtenerComprasPendientes = async (req, res) => {
  try {
    const comprasPendientes = await Compra.find({ estado: 'Pendiente' })
      .populate('registradoPor', 'nombre apellido')
      .populate('productos.productoId', 'nombre categoria')
      .sort({ fechaCompra: 1 });
    
    res.status(200).json(comprasPendientes);
  } catch (error) {
    console.error('Error al obtener compras pendientes:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

/**
 * Obtener reporte de compras por proveedor
 * GET /api/compras/reporte/proveedor
 */
export const reporteComprasPorProveedor = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    let filtro = {};
    if (fechaInicio || fechaFin) {
      filtro.fechaCompra = {};
      if (fechaInicio) filtro.fechaCompra.$gte = new Date(fechaInicio);
      if (fechaFin) filtro.fechaCompra.$lte = new Date(fechaFin);
    }
    
    const reporte = await Compra.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: '$proveedor.nombre',
          totalCompras: { $sum: 1 },
          montoTotal: { $sum: '$total' },
          compras: { $push: '$$ROOT' }
        }
      },
      { $sort: { montoTotal: -1 } }
    ]);
    
    res.status(200).json(reporte);
  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al generar reporte"
    });
  }
};
