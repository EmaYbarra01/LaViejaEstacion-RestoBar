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
    if (!mozoDoc || !mozoDoc.rol.startsWith('Mozo')) {
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
    const numeroPedido = await Pedido.generarNumeroPedido();
    
    // Calcular subtotal y total
    const subtotal = productosDelPedido.reduce((acc, p) => acc + p.subtotal, 0);
    const total = subtotal; // Sin descuento inicial
    
    // Crear pedido
    const nuevoPedido = new Pedido({
      numeroPedido,
      numeroMesa: mesaDoc.numero,
      mesa,
      mozo,
      nombreMozo: `${mozoDoc.nombre} ${mozoDoc.apellido}`,
      productos: productosDelPedido,
      observacionesGenerales: observacionesGenerales || '',
      subtotal,
      total,
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
    
    // HU4: Emitir evento Socket.io para notificar a cocina
    const io = req.app.get('io');
    if (io) {
      io.to('cocina').emit('nuevo-pedido-cocina', {
        pedido: pedidoCompleto,
        mensaje: `Nuevo pedido #${pedidoCompleto.numeroPedido} - Mesa ${pedidoCompleto.numeroMesa}`
      });
      console.log(`[Socket.io] Evento 'nuevo-pedido-cocina' emitido para pedido #${pedidoCompleto.numeroPedido}`);
    }
    
    res.status(201).json({
      mensaje: "Pedido creado exitosamente",
      pedido: pedidoCompleto
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al crear pedido",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Actualizar un pedido (antes de enviarlo a cocina)
 * PUT /api/pedidos/:id
 */
export const actualizarPedido = async (req, res) => {
  try {
    const { productos, observacionesGenerales } = req.body;
    
    const pedido = await Pedido.findById(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({
        mensaje: "Pedido no encontrado"
      });
    }
    
    // Solo se puede actualizar si está en estado Pendiente
    if (pedido.estado !== 'Pendiente') {
      return res.status(400).json({
        mensaje: "Solo se pueden actualizar pedidos en estado Pendiente"
      });
    }
    
    // Si se actualizan productos
    if (productos && productos.length > 0) {
      const productosActualizados = [];
      for (let item of productos) {
        const producto = await Producto.findById(item.producto);
        
        if (!producto) {
          return res.status(404).json({
            mensaje: `Producto ${item.producto} no encontrado`
          });
        }
        
        productosActualizados.push({
          producto: producto._id,
          nombre: producto.nombre,
          cantidad: item.cantidad,
          precioUnitario: producto.precio,
          subtotal: producto.precio * item.cantidad,
          observaciones: item.observaciones || ''
        });
      }
      pedido.productos = productosActualizados;
    }
    
    // Actualizar observaciones si se proporcionan
    if (observacionesGenerales !== undefined) {
      pedido.observacionesGenerales = observacionesGenerales;
    }
    
    await pedido.save();
    
    const pedidoActualizado = await Pedido.findById(pedido._id)
      .populate('mesa', 'numero ubicacion')
      .populate('mozo', 'nombre apellido')
      .populate('productos.producto', 'nombre categoria');
    
    res.status(200).json({
      mensaje: "Pedido actualizado exitosamente",
      pedido: pedidoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al actualizar pedido"
    });
  }
};

/**
 * Actualizar estado de un pedido (cambiar estado)
 * PATCH /api/pedidos/:id/estado
 */
export const cambiarEstadoPedido = async (req, res) => {
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
 * PATCH /api/pedidos/:id/pagar
 */
export const registrarPago = async (req, res) => {
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
 * HU7: Marcar pedido como "Listo" y enviarlo automáticamente a caja
 * PUT /api/pedidos/:id/marcar-listo
 * Cuando cocina termina un pedido, lo marca como "Listo" y queda disponible para caja
 */
export const marcarPedidoListo = async (req, res) => {
  try {
    const { observacion } = req.body;
    const userId = req.user?.id || req.userId;
    
    const pedido = await Pedido.findById(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({
        mensaje: "Pedido no encontrado"
      });
    }
    
    // Validar que el pedido esté en estado que permita marcarlo como listo
    if (pedido.estado !== 'En Preparación') {
      return res.status(400).json({
        mensaje: "Solo se pueden marcar como listos los pedidos en preparación"
      });
    }
    
    // Cambiar estado a "Listo" usando el método del modelo
    // Esto automáticamente registra fechaListo y lo envía a la vista de caja
    await pedido.cambiarEstado('Listo', userId, observacion || 'Pedido terminado por cocina');
    
    // Poblar el pedido actualizado con todos los detalles para caja
    const pedidoCompleto = await Pedido.findById(pedido._id)
      .populate('mesa', 'numero ubicacion')
      .populate('mozo', 'nombre apellido')
      .populate('productos.producto', 'nombre precio categoria')
      .populate('historialEstados.usuario', 'nombre apellido');
    
    res.status(200).json({
      mensaje: "Pedido marcado como listo y enviado a caja",
      pedido: pedidoCompleto
    });
  } catch (error) {
    console.error('Error al marcar pedido como listo:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al marcar pedido como listo"
    });
  }
};

/**
 * HU8: Obtener pedidos terminados listos para cobrar (vista de caja)
 * GET /api/pedidos/caja/pendientes
 * Muestra pedidos con estado "Listo" o "Servido" que están pendientes de cobro
 */
export const obtenerPedidosCaja = async (req, res) => {
  try {
    // Obtener pedidos que están listos para cobrar
    // Estado "Listo" = terminado por cocina, esperando cobro
    // Estado "Servido" = entregado al cliente, esperando cobro
    const pedidos = await Pedido.find({ 
      estado: { $in: ['Listo', 'Servido'] } 
    })
      .populate('mesa', 'numero ubicacion')
      .populate('mozo', 'nombre apellido')
      .populate('productos.producto', 'nombre precio categoria')
      .sort({ fechaListo: 1 }); // Ordenar por el más antiguo primero
    
    res.status(200).json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos por cobrar:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

/**
 * HU8: Cobrar un pedido desde caja
 * POST /api/pedidos/:id/cobrar
 * El cajero registra el cobro y genera el ticket/comprobante
 * Aplica descuento del 10% automáticamente si el pago es en efectivo (RN2)
 */
export const cobrarPedido = async (req, res) => {
  try {
    const { metodoPago, montoPagado } = req.body;
    const cajeroId = req.user?.id || req.userId;
    
    // Validar datos
    if (!metodoPago || !montoPagado) {
      return res.status(400).json({
        mensaje: "Método de pago y monto pagado son requeridos"
      });
    }
    
    // Validar método de pago (RN3: solo efectivo o transferencia)
    if (!['Efectivo', 'Transferencia'].includes(metodoPago)) {
      return res.status(400).json({
        mensaje: "Método de pago no válido. Solo se acepta Efectivo o Transferencia"
      });
    }
    
    const pedido = await Pedido.findById(req.params.id)
      .populate('mesa', 'numero ubicacion')
      .populate('mozo', 'nombre apellido')
      .populate('productos.producto', 'nombre precio categoria');
    
    if (!pedido) {
      return res.status(404).json({
        mensaje: "Pedido no encontrado"
      });
    }
    
    // Validar que el pedido esté listo para cobrar
    if (!['Listo', 'Servido'].includes(pedido.estado)) {
      return res.status(400).json({
        mensaje: "Solo se pueden cobrar pedidos en estado Listo o Servido"
      });
    }
    
    if (pedido.estado === 'Cobrado') {
      return res.status(400).json({
        mensaje: "Este pedido ya fue cobrado"
      });
    }
    
    // Actualizar método de pago (esto activa el middleware pre-save que aplica el descuento del 10% si es efectivo)
    pedido.metodoPago = metodoPago;
    
    // Guardar para que se aplique el descuento automático si corresponde
    await pedido.save();
    
    // Validar que el monto pagado sea suficiente
    if (montoPagado < pedido.total) {
      return res.status(400).json({
        mensaje: `El monto pagado ($${montoPagado}) es insuficiente. Total a pagar: $${pedido.total}`,
        totalAPagar: pedido.total,
        descuentoAplicado: pedido.descuento.monto,
        subtotal: pedido.subtotal
      });
    }
    
    // Registrar pago usando el método del modelo
    await pedido.registrarPago(cajeroId, metodoPago, montoPagado);
    
    // Liberar la mesa
    await Mesa.findByIdAndUpdate(pedido.mesa._id, { estado: 'Libre' });
    
    // Poblar el pedido con todos los detalles para el ticket
    const pedidoCobrado = await Pedido.findById(pedido._id)
      .populate('mesa', 'numero ubicacion')
      .populate('mozo', 'nombre apellido')
      .populate('productos.producto', 'nombre precio categoria')
      .populate('pago.cajero', 'nombre apellido');
    
    // Generar datos para el ticket/comprobante
    const ticket = {
      numeroPedido: pedidoCobrado.numeroPedido,
      fecha: pedidoCobrado.pago.fecha,
      mesa: pedidoCobrado.mesa.numero,
      mozo: `${pedidoCobrado.mozo.nombre} ${pedidoCobrado.mozo.apellido}`,
      cajero: `${pedidoCobrado.pago.cajero.nombre} ${pedidoCobrado.pago.cajero.apellido}`,
      productos: pedidoCobrado.productos.map(p => ({
        nombre: p.nombre,
        cantidad: p.cantidad,
        precioUnitario: p.precioUnitario,
        subtotal: p.subtotal,
        observaciones: p.observaciones
      })),
      subtotal: pedidoCobrado.subtotal,
      descuento: {
        porcentaje: pedidoCobrado.descuento.porcentaje,
        monto: pedidoCobrado.descuento.monto,
        motivo: pedidoCobrado.descuento.motivo
      },
      total: pedidoCobrado.total,
      metodoPago: pedidoCobrado.metodoPago,
      montoPagado: pedidoCobrado.pago.montoPagado,
      cambio: pedidoCobrado.pago.cambio
    };
    
    res.status(200).json({
      mensaje: "Pago registrado exitosamente",
      pedido: pedidoCobrado,
      ticket: ticket
    });
  } catch (error) {
    console.error('Error al cobrar pedido:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al registrar el pago"
    });
  }
};

/**
 * Obtener pedidos por mesa
 * GET /api/pedidos/mesa/:mesaId
 */
export const obtenerPedidosPorMesa = async (req, res) => {
  try {
    const { mesaId } = req.params;
    
    const pedidos = await Pedido.find({ mesa: mesaId })
      .populate('mesa', 'numero ubicacion')
      .populate('mozo', 'nombre apellido')
      .populate('productos.producto', 'nombre categoria')
      .sort({ fechaCreacion: -1 });
    
    res.status(200).json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos por mesa:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

/**
 * Obtener pedidos por mozo
 * GET /api/pedidos/mozo/:mozoId
 */
export const obtenerPedidosPorMozo = async (req, res) => {
  try {
    const { mozoId } = req.params;
    
    const pedidos = await Pedido.find({ mozo: mozoId })
      .populate('mesa', 'numero ubicacion')
      .populate('mozo', 'nombre apellido')
      .populate('productos.producto', 'nombre categoria')
      .sort({ fechaCreacion: -1 });
    
    res.status(200).json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos por mozo:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

