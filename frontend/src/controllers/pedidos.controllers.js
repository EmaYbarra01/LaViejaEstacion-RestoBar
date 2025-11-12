import Pedido from "../models/pedidoSchema.js";
import Mesa from "../models/mesaSchema.js";
import Producto from "../models/productoSchema.js";
import Usuario from "../models/usuarioSchema.js";

/**
 * Obtener todos los pedidos
 * GET /api/pedidos
 */
export const obtenerPedidos = async (req, res) => {
  try {
    const { estado, mesa, mozo, fechaInicio, fechaFin } = req.query;
    
    let filtro = {};
    
    if (estado) filtro.estado = estado;
    if (mesa) filtro.mesa = mesa;
    if (mozo) filtro.mozo = mozo;
    
    if (fechaInicio || fechaFin) {
      filtro.fechaCreacion = {};
      if (fechaInicio) filtro.fechaCreacion.$gte = new Date(fechaInicio);
      if (fechaFin) filtro.fechaCreacion.$lte = new Date(fechaFin);
    }
    
    const pedidos = await Pedido.find(filtro)
      .populate('mesa', 'numero ubicacion')
      .populate('mozo', 'nombre apellido')
      .populate('productos.producto', 'nombre categoria')
      .populate('pago.cajero', 'nombre apellido')
      .sort({ fechaCreacion: -1 });
    
    res.status(200).json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor al obtener pedidos' 
    });
  }
};

/**
 * Obtener un pedido por ID
 * GET /api/pedidos/:id
 */
export const obtenerUnPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('mesa', 'numero ubicacion capacidad')
      .populate('mozo', 'nombre apellido email')
      .populate('productos.producto', 'nombre categoria precio')
      .populate('pago.cajero', 'nombre apellido')
      .populate('historialEstados.usuario', 'nombre apellido');
    
    if (!pedido) {
      return res.status(404).json({
        mensaje: "Pedido no encontrado"
      });
    }
    
    res.status(200).json(pedido);
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al obtener el pedido"
    });
  }
};

/**
 * Crear un nuevo pedido
 * POST /api/pedidos
 */
export const crearPedido = async (req, res) => {
  try {
    const { mesa, mozo, productos, observacionesGenerales } = req.body;
    
    // Validar datos
    if (!mesa || !mozo || !productos || productos.length === 0) {
      return res.status(400).json({
        mensaje: "Mesa, mozo y productos son requeridos"
      });
    }
    
    // Verificar que la mesa existe y está disponible
    const mesaDoc = await Mesa.findById(mesa);
    if (!mesaDoc) {
      return res.status(404).json({
        mensaje: "Mesa no encontrada"
      });
    }
    
    // Verificar que el mozo existe
    const mozoDoc = await Usuario.findById(mozo);
    if (!mozoDoc || mozoDoc.rol !== 'Mozo') {
      return res.status(400).json({
        mensaje: "Mozo no válido"
      });
    }
    
    // Procesar productos y verificar disponibilidad
    const productosDelPedido = [];
    for (let item of productos) {
      const producto = await Producto.findById(item.producto);
      
      if (!producto) {
        return res.status(404).json({
          mensaje: `Producto ${item.producto} no encontrado`
        });
      }
      
      if (!producto.disponible) {
        return res.status(400).json({
          mensaje: `El producto ${producto.nombre} no está disponible`
        });
      }
      
      productosDelPedido.push({
        producto: producto._id,
        nombre: producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: producto.precio,
        subtotal: producto.precio * item.cantidad,
        observaciones: item.observaciones || ''
      });
    }
    
    // Obtener siguiente número de pedido
    const numeroPedido = await Pedido.obtenerSiguienteNumeroPedido();
    
    // Crear pedido
    const nuevoPedido = new Pedido({
      numeroPedido,
      mesa,
      mozo,
      productos: productosDelPedido,
      observacionesGenerales: observacionesGenerales || '',
      historialEstados: [{
        estado: 'Pendiente',
        fecha: new Date(),
        usuario: mozo,
        observacion: 'Pedido creado'
      }]
    });
    
    await nuevoPedido.save();
    
    // Actualizar estado de la mesa a Ocupada
    await Mesa.findByIdAndUpdate(mesa, { estado: 'Ocupada' });
    
    // Poblar el pedido antes de enviarlo
    const pedidoCompleto = await Pedido.findById(nuevoPedido._id)
      .populate('mesa', 'numero ubicacion')
      .populate('mozo', 'nombre apellido')
      .populate('productos.producto', 'nombre categoria');
    
    res.status(201).json({
      mensaje: "Pedido creado exitosamente",
      pedido: pedidoCompleto
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al crear pedido"
    });
  }
};

/**
 * Actualizar datos de un pedido (antes de enviarlo a cocina)
 * PUT /api/pedidos/:id
 */
export const actualizarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { productos, observacionesGenerales, tiempoEstimado } = req.body;

    const pedido = await Pedido.findById(id);
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    if (pedido.estado === 'Cobrado' || pedido.estado === 'Cancelado') {
      return res.status(400).json({ mensaje: 'No se puede modificar un pedido cobrado o cancelado' });
    }

    if (productos && Array.isArray(productos)) {
      const productosDelPedido = [];
      for (let item of productos) {
        const producto = await Producto.findById(item.producto);
        if (!producto) {
          return res.status(404).json({ mensaje: `Producto ${item.producto} no encontrado` });
        }
        if (!producto.disponible) {
          return res.status(400).json({ mensaje: `El producto ${producto.nombre} no está disponible` });
        }

        productosDelPedido.push({
          producto: producto._id,
          nombre: producto.nombre,
          cantidad: item.cantidad,
          precioUnitario: producto.precio,
          subtotal: producto.precio * item.cantidad,
          observaciones: item.observaciones || ''
        });
      }

      pedido.productos = productosDelPedido;
    }

    if (typeof observacionesGenerales !== 'undefined') pedido.observacionesGenerales = observacionesGenerales;
    if (typeof tiempoEstimado !== 'undefined') pedido.tiempoEstimado = tiempoEstimado;

    await pedido.save();

    const pedidoActualizado = await Pedido.findById(pedido._id)
      .populate('mesa', 'numero ubicacion')
      .populate('mozo', 'nombre apellido')
      .populate('productos.producto', 'nombre categoria');

    res.status(200).json({ mensaje: 'Pedido actualizado', pedido: pedidoActualizado });
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor al actualizar pedido' });
  }
};

/**
 * Actualizar estado de un pedido
 * PUT /api/pedidos/:id/estado
 */
export const actualizarEstadoPedido = async (req, res) => {
  try {
    const { estado, observacion } = req.body;
    const userId = req.user?.id || req.userId;
    
    if (!estado) {
      return res.status(400).json({
        mensaje: "El estado es requerido"
      });
    }
    
    const pedido = await Pedido.findById(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({
        mensaje: "Pedido no encontrado"
      });
    }
    
    // Cambiar estado usando el método del modelo
    await pedido.cambiarEstado(estado, userId, observacion || '');
    
    // Poblar el pedido actualizado
    const pedidoActualizado = await Pedido.findById(pedido._id)
      .populate('mesa', 'numero ubicacion')
      .populate('mozo', 'nombre apellido')
      .populate('productos.producto', 'nombre categoria')
      .populate('historialEstados.usuario', 'nombre apellido');
    
    res.status(200).json({
      mensaje: "Estado actualizado correctamente",
      pedido: pedidoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({
      mensaje: error.message || "Error interno del servidor al actualizar estado"
    });
  }
};

/**
 * Registrar pago de un pedido
 * PUT /api/pedidos/:id/pago
 */
export const registrarPagoPedido = async (req, res) => {
  try {
    const { metodoPago, montoPagado } = req.body;
    const cajeroId = req.user?.id || req.userId;
    
    if (!metodoPago || !montoPagado) {
      return res.status(400).json({
        mensaje: "Método de pago y monto son requeridos"
      });
    }
    
    const pedido = await Pedido.findById(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({
        mensaje: "Pedido no encontrado"
      });
    }
    
    if (pedido.estado === 'Cobrado') {
      return res.status(400).json({
        mensaje: "Este pedido ya fue cobrado"
      });
    }
    
    // Validar monto pagado
    if (montoPagado < pedido.total) {
      return res.status(400).json({
        mensaje: "El monto pagado es insuficiente"
      });
    }
    
    // Registrar pago usando el método del modelo
    await pedido.registrarPago(cajeroId, metodoPago, montoPagado);
    
    // Si el pedido se pagó, liberar la mesa
    await Mesa.findByIdAndUpdate(pedido.mesa, { estado: 'Libre' });
    
    // Poblar el pedido actualizado
    const pedidoActualizado = await Pedido.findById(pedido._id)
      .populate('mesa', 'numero ubicacion')
      .populate('mozo', 'nombre apellido')
      .populate('productos.producto', 'nombre categoria')
      .populate('pago.cajero', 'nombre apellido');
    
    res.status(200).json({
      mensaje: "Pago registrado exitosamente",
      pedido: pedidoActualizado
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al registrar pago"
    });
  }
};

/**
 * Cancelar un pedido
 * PUT /api/pedidos/:id/cancelar
 */
export const cancelarPedido = async (req, res) => {
  try {
    const { motivo } = req.body;
    const userId = req.user?.id || req.userId;
    
    const pedido = await Pedido.findById(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({
        mensaje: "Pedido no encontrado"
      });
    }
    
    if (pedido.estado === 'Cobrado') {
      return res.status(400).json({
        mensaje: "No se puede cancelar un pedido ya cobrado"
      });
    }
    
    // Cambiar estado a Cancelado
    await pedido.cambiarEstado('Cancelado', userId, motivo || 'Sin especificar');
    
    // Liberar la mesa
    await Mesa.findByIdAndUpdate(pedido.mesa, { estado: 'Libre' });
    
    const pedidoActualizado = await Pedido.findById(pedido._id)
      .populate('mesa', 'numero ubicacion')
      .populate('mozo', 'nombre apellido')
      .populate('productos.producto', 'nombre categoria');
    
    res.status(200).json({
      mensaje: "Pedido cancelado exitosamente",
      pedido: pedidoActualizado
    });
  } catch (error) {
    console.error('Error al cancelar pedido:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al cancelar pedido"
    });
  }
};

/**
 * Obtener pedidos por estado
 * GET /api/pedidos/estado/:estado
 */
export const obtenerPedidosPorEstado = async (req, res) => {
  try {
    const { estado } = req.params;
    
    const pedidos = await Pedido.obtenerPorEstado(estado);
    
    res.status(200).json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos por estado:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

/**
 * Obtener pedidos pendientes en cocina
 * GET /api/pedidos/cocina/pendientes
 */
export const obtenerPedidosCocina = async (req, res) => {
  try {
    const pedidos = await Pedido.find({
      estado: { $in: ['Pendiente', 'En preparación'] }
    })
      .populate('mesa', 'numero')
      .populate('mozo', 'nombre apellido')
      .populate('productos.producto', 'nombre categoria')
      .sort({ fechaCreacion: 1 });
    
    res.status(200).json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos de cocina:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

/**
 * Obtener pedidos listos para servir
 * GET /api/pedidos/listos
 */
export const obtenerPedidosListos = async (req, res) => {
  try {
    const pedidos = await Pedido.find({ estado: 'Listo' })
      .populate('mesa', 'numero')
      .populate('mozo', 'nombre apellido')
      .populate('productos.producto', 'nombre categoria')
      .sort({ fechaListo: 1 });
    
    res.status(200).json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos listos:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

/**
 * Obtener pedidos por cobrar (en caja)
 * GET /api/pedidos/por-cobrar
 */
export const obtenerPedidosPorCobrar = async (req, res) => {
  try {
    const pedidos = await Pedido.find({ estado: 'Servido' })
      .populate('mesa', 'numero')
      .populate('mozo', 'nombre apellido')
      .populate('productos.producto', 'nombre categoria')
      .sort({ fechaServido: 1 });
    
    res.status(200).json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos por cobrar:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

// Export aliases para compatibilidad con las rutas
export const cambiarEstadoPedido = actualizarEstadoPedido;
export const registrarPago = registrarPagoPedido;

