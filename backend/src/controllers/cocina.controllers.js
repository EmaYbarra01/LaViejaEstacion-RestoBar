import Pedido from "../models/pedidoSchema.js";

/**
 * CONTROLADOR DE COCINA
 * Gestiona operaciones específicas para el rol EncargadoCocina
 * Basado en HU5 y HU6 ya implementadas
 */

/**
 * Obtener pedidos para la vista de cocina
 * GET /api/cocina/pedidos
 * 
 * Query params:
 * - estado: filtrar por estado (Pendiente, En Preparación, Listo)
 * - limit: cantidad de pedidos a retornar (default: 50)
 * 
 * @returns {Array} Lista de pedidos ordenados por fecha de creación
 */
export const getPedidosCocina = async (req, res) => {
  try {
    const { estado, limit = 50 } = req.query;
    
    // Filtro base: solo pedidos que no están cancelados ni cobrados
    const filtro = {
      estado: { $nin: ['Cancelado', 'Cobrado'] }
    };
    
    // Si se especifica un estado, filtrar por él
    if (estado) {
      filtro.estado = estado;
    }
    
    const pedidos = await Pedido.find(filtro)
      .populate('mesa', 'numero ubicacion')
      .populate('mozo', 'nombre apellido')
      .populate('productos.producto', 'nombre categoria precio')
      .sort({ fechaCreacion: 1 }) // Más antiguos primero
      .limit(parseInt(limit))
      .lean(); // Convertir a objeto plano para manipular

    // Formatear pedidos para la respuesta
    const pedidosFormateados = pedidos.map(pedido => ({
      ...pedido,
      productos: pedido.productos.map(item => ({
        _id: item._id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal,
        observaciones: item.observaciones || '',
        producto: item.producto // Info poblada del catálogo
      }))
    }));
    
    res.status(200).json({
      success: true,
      count: pedidosFormateados.length,
      pedidos: pedidosFormateados
    });
    
  } catch (error) {
    console.error('[Cocina] Error al obtener pedidos:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener pedidos de cocina',
      error: error.message
    });
  }
};

/**
 * Actualizar estado de un pedido
 * PATCH /api/cocina/pedidos/:id/estado
 * 
 * Body:
 * - estado: nuevo estado (En Preparación, Listo, Entregado)
 * - observacion: opcional
 * 
 * @returns {Object} Pedido actualizado
 */
export const updateEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, observacion } = req.body;
    
    // Validar que se envió el estado
    if (!estado) {
      return res.status(400).json({
        success: false,
        mensaje: 'El estado es requerido'
      });
    }
    
    // Validar que el estado sea válido
    const estadosValidos = ['Pendiente', 'En Preparación', 'Listo', 'Entregado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        mensaje: `Estado no válido. Valores permitidos: ${estadosValidos.join(', ')}`
      });
    }
    
    // Buscar el pedido
    const pedido = await Pedido.findById(id);
    
    if (!pedido) {
      return res.status(404).json({
        success: false,
        mensaje: 'Pedido no encontrado'
      });
    }
    
    // Verificar que no esté cancelado o cobrado
    if (['Cancelado', 'Cobrado'].includes(pedido.estado)) {
      return res.status(400).json({
        success: false,
        mensaje: `No se puede modificar un pedido en estado ${pedido.estado}`
      });
    }
    
    // Actualizar estado
    const estadoAnterior = pedido.estado;
    pedido.estado = estado;
    
    // Actualizar también estadoCocina si existe
    if (pedido.estadoCocina !== undefined && ['Pendiente', 'En Preparación', 'Listo'].includes(estado)) {
      pedido.estadoCocina = estado;
    }
    
    // Agregar al historial
    pedido.historialEstados.push({
      estado,
      fecha: new Date(),
      usuario: req.user.id,  // ⚠️ CORREGIDO: usar req.user.id en lugar de req.user._id
      observacion: observacion || `Cambio de estado: ${estadoAnterior} → ${estado}`
    });
    
    // Actualizar fecha específica según el estado
    if (estado === 'Listo') {
      pedido.fechaListo = new Date();
    } else if (estado === 'Entregado') {
      pedido.fechaEntregado = new Date();
    }
    
    await pedido.save();
    console.log('[Cocina] Pedido guardado en DB:', pedido._id.toString(), 'estado:', pedido.estado, 'productosCount:', (pedido.productos||[]).length);
    
    // Poblar para respuesta
    await pedido.populate([
      { path: 'mesa', select: 'numero ubicacion' },
      { path: 'mozo', select: 'nombre apellido' },
      { path: 'productos.producto', select: 'nombre categoria precio' }
    ]);

    // Formatear productos
    const pedidoFormateado = {
      ...pedido.toObject(),
      productos: pedido.productos.map(item => ({
        _id: item._id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal,
        observaciones: item.observaciones || '',
        producto: item.producto
      }))
    };
    
    // Emitir evento por socket.io si está disponible
    const io = req.app.get('io');
    if (io) {
      io.emit('pedidoUpdated', {
        pedidoId: pedido._id,
        estadoAnterior,
        nuevoEstado: estado,
        pedido: pedidoFormateado
      });
      
      // Si se marcó como listo, notificar específicamente
      if (estado === 'Listo') {
        io.emit('pedido-listo', {
          pedidoId: pedido._id,
          numeroMesa: pedido.numeroMesa,
          numeroPedido: pedido.numeroPedido
        });
      }
    }
    
    res.status(200).json({
      success: true,
      mensaje: `Pedido actualizado a estado: ${estado}`,
      pedido: pedidoFormateado
    });
    
  } catch (error) {
    console.error('[Cocina] Error al actualizar estado:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar estado del pedido',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de cocina
 * GET /api/cocina/estadisticas
 * 
 * @returns {Object} Estadísticas de pedidos en cocina
 */
export const getEstadisticasCocina = async (req, res) => {
  try {
    const [pendientes, enPreparacion, listos, totalHoy] = await Promise.all([
      Pedido.countDocuments({ estado: 'Pendiente' }),
      Pedido.countDocuments({ estado: 'En Preparación' }),
      Pedido.countDocuments({ estado: 'Listo' }),
      Pedido.countDocuments({
        fechaCreacion: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        },
        estado: { $ne: 'Cancelado' }
      })
    ]);
    
    res.status(200).json({
      success: true,
      estadisticas: {
        pendientes,
        enPreparacion,
        listos,
        totalHoy
      }
    });
    
  } catch (error) {
    console.error('[Cocina] Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

/**
 * Obtener detalle de un pedido específico
 * GET /api/cocina/pedidos/:id
 * 
 * @returns {Object} Detalle completo del pedido
 */
export const getPedidoDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pedido = await Pedido.findById(id)
      .populate('mesa', 'numero ubicacion capacidad')
      .populate('mozo', 'nombre apellido')
      .populate('productos.producto', 'nombre categoria precio')
      .populate('historialEstados.usuario', 'nombre apellido rol');
    
    if (!pedido) {
      return res.status(404).json({
        success: false,
        mensaje: 'Pedido no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      pedido
    });
    
  } catch (error) {
    console.error('[Cocina] Error al obtener detalle:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener detalle del pedido',
      error: error.message
    });
  }
};

export default {
  getPedidosCocina,
  updateEstadoPedido,
  getEstadisticasCocina,
  getPedidoDetalle
};
