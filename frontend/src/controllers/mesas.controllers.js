import Mesa from "../models/mesaSchema.js";
import Pedido from "../models/pedidoSchema.js";

/**
 * Obtener todas las mesas
 * GET /api/mesas
 */
export const obtenerMesas = async (req, res) => {
  try {
    const { estado, ubicacion } = req.query;
    
    let filtro = {};
    if (estado) filtro.estado = estado;
    if (ubicacion) filtro.ubicacion = ubicacion;
    
    const mesas = await Mesa.find(filtro).sort({ numero: 1 });
    
    res.status(200).json(mesas);
  } catch (error) {
    console.error('Error al obtener mesas:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor al obtener mesas' 
    });
  }
};

/**
 * Obtener una mesa por ID
 * GET /api/mesas/:id
 */
export const obtenerUnaMesa = async (req, res) => {
  try {
    const mesa = await Mesa.findById(req.params.id);
    
    if (!mesa) {
      return res.status(404).json({
        mensaje: "Mesa no encontrada"
      });
    }
    
    // Obtener pedidos activos de la mesa
    const pedidosActivos = await Pedido.find({
      mesa: mesa._id,
      estado: { $nin: ['Cobrado', 'Cancelado'] }
    })
      .populate('mozo', 'nombre apellido')
      .populate('productos.producto', 'nombre precio')
      .sort({ fechaCreacion: -1 });
    
    res.status(200).json({
      mesa,
      pedidosActivos
    });
  } catch (error) {
    console.error('Error al obtener mesa:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al obtener la mesa"
    });
  }
};

/**
 * Crear una nueva mesa
 * POST /api/mesas
 */
export const crearMesa = async (req, res) => {
  try {
    const { numero, capacidad, ubicacion, codigoQR } = req.body;
    
    // Validar datos
    if (!numero || !capacidad) {
      return res.status(400).json({
        mensaje: "Número y capacidad son requeridos"
      });
    }
    
    // Verificar que el número de mesa no exista
    const mesaExistente = await Mesa.findOne({ numero });
    if (mesaExistente) {
      return res.status(400).json({
        mensaje: "Ya existe una mesa con ese número"
      });
    }
    
    const nuevaMesa = new Mesa({
      numero,
      capacidad,
      ubicacion: ubicacion || 'Salón Principal',
      codigoQR: codigoQR || ''
    });
    
    await nuevaMesa.save();
    
    res.status(201).json({
      mensaje: "Mesa creada exitosamente",
      mesa: nuevaMesa
    });
  } catch (error) {
    console.error('Error al crear mesa:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        mensaje: "Ya existe una mesa con ese número"
      });
    }
    
    res.status(500).json({
      mensaje: "Error interno del servidor al crear mesa"
    });
  }
};

/**
 * Actualizar una mesa
 * PUT /api/mesas/:id
 */
export const actualizarMesa = async (req, res) => {
  try {
    const mesaActualizada = await Mesa.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!mesaActualizada) {
      return res.status(404).json({
        mensaje: "Mesa no encontrada"
      });
    }
    
    res.status(200).json({
      mensaje: "Mesa actualizada correctamente",
      mesa: mesaActualizada
    });
  } catch (error) {
    console.error('Error al actualizar mesa:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        mensaje: "Ya existe una mesa con ese número"
      });
    }
    
    res.status(500).json({
      mensaje: "Error interno del servidor al actualizar mesa"
    });
  }
};

/**
 * Eliminar una mesa
 * DELETE /api/mesas/:id
 */
export const eliminarMesa = async (req, res) => {
  try {
    // Verificar que la mesa no tenga pedidos activos
    const pedidosActivos = await Pedido.countDocuments({
      mesa: req.params.id,
      estado: { $nin: ['Cobrado', 'Cancelado'] }
    });
    
    if (pedidosActivos > 0) {
      return res.status(400).json({
        mensaje: "No se puede eliminar una mesa con pedidos activos"
      });
    }
    
    const mesaEliminada = await Mesa.findByIdAndDelete(req.params.id);
    
    if (!mesaEliminada) {
      return res.status(404).json({
        mensaje: "Mesa no encontrada"
      });
    }
    
    res.status(200).json({
      mensaje: "Mesa eliminada correctamente",
      mesa: mesaEliminada
    });
  } catch (error) {
    console.error('Error al eliminar mesa:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al eliminar mesa"
    });
  }
};

/**
 * Cambiar estado de una mesa
 * PUT /api/mesas/:id/estado
 */
export const cambiarEstadoMesa = async (req, res) => {
  try {
    const { estado } = req.body;
    
    if (!estado) {
      return res.status(400).json({
        mensaje: "El estado es requerido"
      });
    }
    
    const estadosValidos = ['Libre', 'Ocupada', 'Reservada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        mensaje: "Estado no válido. Use: Libre, Ocupada o Reservada"
      });
    }
    
    const mesa = await Mesa.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );
    
    if (!mesa) {
      return res.status(404).json({
        mensaje: "Mesa no encontrada"
      });
    }
    
    res.status(200).json({
      mensaje: "Estado actualizado correctamente",
      mesa
    });
  } catch (error) {
    console.error('Error al cambiar estado de mesa:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

/**
 * Obtener mesas libres
 * GET /api/mesas/disponibles
 */
export const obtenerMesasLibres = async (req, res) => {
  try {
    const mesasLibres = await Mesa.find({ estado: 'Libre' })
      .sort({ numero: 1 });
    
    res.status(200).json(mesasLibres);
  } catch (error) {
    console.error('Error al obtener mesas libres:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

/**
 * Obtener mesas ocupadas
 * GET /api/mesas/ocupadas
 */
export const obtenerMesasOcupadas = async (req, res) => {
  try {
    const mesasOcupadas = await Mesa.find({ estado: 'Ocupada' })
      .sort({ numero: 1 });
    
    // Agregar información de pedidos activos
    const mesasConPedidos = await Promise.all(
      mesasOcupadas.map(async (mesa) => {
        const pedidos = await Pedido.find({
          mesa: mesa._id,
          estado: { $nin: ['Cobrado', 'Cancelado'] }
        })
          .populate('mozo', 'nombre apellido')
          .select('numeroPedido estado total fechaCreacion');
        
        return {
          ...mesa.toObject(),
          pedidos
        };
      })
    );
    
    res.status(200).json(mesasConPedidos);
  } catch (error) {
    console.error('Error al obtener mesas ocupadas:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

/**
 * Obtener cuenta de una mesa
 * GET /api/mesas/:id/cuenta
 */
export const obtenerCuentaMesa = async (req, res) => {
  try {
    const mesa = await Mesa.findById(req.params.id);
    
    if (!mesa) {
      return res.status(404).json({
        mensaje: "Mesa no encontrada"
      });
    }
    
    // Obtener todos los pedidos pendientes de pago
    const pedidos = await Pedido.find({
      mesa: mesa._id,
      estado: { $in: ['Servido', 'Listo', 'En preparación', 'Pendiente'] }
    })
      .populate('mozo', 'nombre apellido')
      .populate('productos.producto', 'nombre categoria');
    
    if (pedidos.length === 0) {
      return res.status(404).json({
        mensaje: "No hay pedidos pendientes de pago para esta mesa"
      });
    }
    
    // Calcular totales
    const totalGeneral = pedidos.reduce((sum, pedido) => sum + pedido.total, 0);
    const subtotalGeneral = pedidos.reduce((sum, pedido) => sum + pedido.subtotal, 0);
    const descuentosGeneral = pedidos.reduce((sum, pedido) => sum + pedido.descuento.monto, 0);
    
    res.status(200).json({
      mesa: {
        numero: mesa.numero,
        ubicacion: mesa.ubicacion
      },
      pedidos,
      resumen: {
        subtotal: subtotalGeneral,
        descuentos: descuentosGeneral,
        total: totalGeneral,
        cantidadPedidos: pedidos.length
      }
    });
  } catch (error) {
    console.error('Error al obtener cuenta de mesa:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};
