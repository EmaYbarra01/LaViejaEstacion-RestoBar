import CierreCaja from "../models/cierreCajaSchema.js";
import Pedido from "../models/pedidoSchema.js";

/**
 * Obtener todos los cierres de caja
 * GET /api/cierres-caja
 */
export const obtenerCierresCaja = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, turno, estado, usuario } = req.query;
    
    let filtro = {};
    
    if (fechaInicio || fechaFin) {
      filtro.fechaCierre = {};
      if (fechaInicio) filtro.fechaCierre.$gte = new Date(fechaInicio);
      if (fechaFin) filtro.fechaCierre.$lte = new Date(fechaFin);
    }
    
    if (turno) filtro.turno = turno;
    if (estado) filtro.estado = estado;
    if (usuario) filtro.realizadoPor = usuario;
    
    const cierres = await CierreCaja.find(filtro)
      .populate('realizadoPor', 'nombre apellido')
      .populate('revisadoPor', 'nombre apellido')
      .sort({ fechaCierre: -1 });
    
    res.status(200).json(cierres);
  } catch (error) {
    console.error('Error al obtener cierres de caja:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor al obtener cierres de caja' 
    });
  }
};

/**
 * Obtener un cierre de caja por ID
 * GET /api/cierres-caja/:id
 */
export const obtenerUnCierreCaja = async (req, res) => {
  try {
    const cierre = await CierreCaja.findById(req.params.id)
      .populate('realizadoPor', 'nombre apellido email rol')
      .populate('revisadoPor', 'nombre apellido email rol')
      .populate('pedidos.pedidoId', 'numeroPedido productos');
    
    if (!cierre) {
      return res.status(404).json({
        mensaje: "Cierre de caja no encontrado"
      });
    }
    
    res.status(200).json(cierre);
  } catch (error) {
    console.error('Error al obtener cierre de caja:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al obtener el cierre de caja"
    });
  }
};

/**
 * Crear un nuevo cierre de caja
 * POST /api/cierres-caja
 */
export const crearCierreCaja = async (req, res) => {
  try {
    const {
      turno,
      horaInicio,
      horaFin,
      montoInicial,
      efectivoContado,
      desgloseBilletes,
      gastos,
      ingresosAdicionales,
      observaciones,
      pedidosIds
    } = req.body;
    
    const realizadoPorId = req.user?.id || req.userId;
    
    // Validar datos
    if (!turno || !horaInicio || !horaFin) {
      return res.status(400).json({
        mensaje: "Turno, hora inicio y hora fin son requeridos"
      });
    }
    
    // Obtener siguiente número de cierre
    const numeroCierre = await CierreCaja.obtenerSiguienteNumeroCierre();
    
    // Obtener pedidos cobrados en el rango de fechas
    let pedidosCobrados;
    if (pedidosIds && pedidosIds.length > 0) {
      pedidosCobrados = await Pedido.find({
        _id: { $in: pedidosIds },
        estado: 'Cobrado'
      })
        .populate('mesa', 'numero')
        .populate('mozo', 'nombre apellido');
    } else {
      pedidosCobrados = await Pedido.find({
        estado: 'Cobrado',
        'pago.fecha': {
          $gte: new Date(horaInicio),
          $lte: new Date(horaFin)
        }
      })
        .populate('mesa', 'numero')
        .populate('mozo', 'nombre apellido');
    }
    
    // Procesar pedidos para el cierre
    const pedidosParaCierre = pedidosCobrados.map(p => ({
      pedidoId: p._id,
      numeroPedido: p.numeroPedido,
      mesa: p.mesa.numero || p.mesa,
      mozo: `${p.mozo.nombre} ${p.mozo.apellido}`,
      metodoPago: p.metodoPago,
      monto: p.total,
      descuento: p.descuento.monto || 0,
      horaPago: p.pago.fecha || p.fechaCobrado
    }));
    
    // Crear cierre de caja
    const nuevoCierre = new CierreCaja({
      numeroCierre,
      fechaCierre: new Date(),
      turno,
      realizadoPor: realizadoPorId,
      horaInicio: new Date(horaInicio),
      horaFin: new Date(horaFin),
      montoInicial: montoInicial || 0,
      efectivoContado: efectivoContado || 0,
      desgloseBilletes: desgloseBilletes || {},
      gastos: gastos || [],
      ingresosAdicionales: ingresosAdicionales || [],
      observaciones: observaciones || '',
      pedidos: pedidosParaCierre
    });
    
    await nuevoCierre.save();
    
    // Poblar el documento
    const cierreCompleto = await CierreCaja.findById(nuevoCierre._id)
      .populate('realizadoPor', 'nombre apellido')
      .populate('pedidos.pedidoId', 'numeroPedido');
    
    res.status(201).json({
      mensaje: "Cierre de caja creado exitosamente",
      cierre: cierreCompleto
    });
  } catch (error) {
    console.error('Error al crear cierre de caja:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al crear cierre de caja"
    });
  }
};

/**
 * Actualizar un cierre de caja
 * PUT /api/cierres-caja/:id
 */
export const actualizarCierreCaja = async (req, res) => {
  try {
    const cierre = await CierreCaja.findById(req.params.id);
    
    if (!cierre) {
      return res.status(404).json({
        mensaje: "Cierre de caja no encontrado"
      });
    }
    
    // Solo permitir actualizar si está en estado Abierto o Cerrado
    if (cierre.estado === 'Auditado') {
      return res.status(400).json({
        mensaje: "No se puede modificar un cierre auditado"
      });
    }
    
    const cierreActualizado = await CierreCaja.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('realizadoPor', 'nombre apellido')
      .populate('revisadoPor', 'nombre apellido');
    
    res.status(200).json({
      mensaje: "Cierre de caja actualizado correctamente",
      cierre: cierreActualizado
    });
  } catch (error) {
    console.error('Error al actualizar cierre de caja:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al actualizar cierre de caja"
    });
  }
};

/**
 * Revisar un cierre de caja
 * PUT /api/cierres-caja/:id/revisar
 */
export const revisarCierreCaja = async (req, res) => {
  try {
    const { observaciones } = req.body;
    const supervisorId = req.user?.id || req.userId;
    
    const cierre = await CierreCaja.findById(req.params.id);
    
    if (!cierre) {
      return res.status(404).json({
        mensaje: "Cierre de caja no encontrado"
      });
    }
    
    if (cierre.estado !== 'Cerrado') {
      return res.status(400).json({
        mensaje: "Solo se pueden revisar cierres en estado Cerrado"
      });
    }
    
    // Usar el método del modelo
    await cierre.revisar(supervisorId, observaciones || '');
    
    const cierreActualizado = await CierreCaja.findById(cierre._id)
      .populate('realizadoPor', 'nombre apellido')
      .populate('revisadoPor', 'nombre apellido');
    
    res.status(200).json({
      mensaje: "Cierre revisado exitosamente",
      cierre: cierreActualizado
    });
  } catch (error) {
    console.error('Error al revisar cierre de caja:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al revisar cierre"
    });
  }
};

/**
 * Agregar pedido a un cierre de caja
 * PUT /api/cierres-caja/:id/agregar-pedido
 */
export const agregarPedidoACierre = async (req, res) => {
  try {
    const { pedidoId } = req.body;
    
    if (!pedidoId) {
      return res.status(400).json({
        mensaje: "El ID del pedido es requerido"
      });
    }
    
    const cierre = await CierreCaja.findById(req.params.id);
    
    if (!cierre) {
      return res.status(404).json({
        mensaje: "Cierre de caja no encontrado"
      });
    }
    
    if (cierre.estado === 'Auditado') {
      return res.status(400).json({
        mensaje: "No se pueden agregar pedidos a un cierre auditado"
      });
    }
    
    const pedido = await Pedido.findById(pedidoId)
      .populate('mesa', 'numero')
      .populate('mozo', 'nombre apellido');
    
    if (!pedido) {
      return res.status(404).json({
        mensaje: "Pedido no encontrado"
      });
    }
    
    if (pedido.estado !== 'Cobrado') {
      return res.status(400).json({
        mensaje: "Solo se pueden agregar pedidos cobrados"
      });
    }
    
    // Usar el método del modelo
    await cierre.agregarPedido(pedido);
    
    const cierreActualizado = await CierreCaja.findById(cierre._id)
      .populate('realizadoPor', 'nombre apellido')
      .populate('pedidos.pedidoId', 'numeroPedido');
    
    res.status(200).json({
      mensaje: "Pedido agregado exitosamente",
      cierre: cierreActualizado
    });
  } catch (error) {
    console.error('Error al agregar pedido:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al agregar pedido"
    });
  }
};

/**
 * Obtener cierres por rango de fechas
 * GET /api/cierres-caja/fechas
 */
export const obtenerCierresPorFechas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        mensaje: "Fecha inicio y fecha fin son requeridas"
      });
    }
    
    const cierres = await CierreCaja.obtenerPorFechas(fechaInicio, fechaFin);
    
    res.status(200).json(cierres);
  } catch (error) {
    console.error('Error al obtener cierres por fechas:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

/**
 * Reporte de cierres de caja
 * GET /api/cierres-caja/reporte
 */
export const reporteCierres = async (req, res) => {
  try {
    const filtros = {
      fechaInicio: req.query.fechaInicio,
      fechaFin: req.query.fechaFin,
      turno: req.query.turno,
      usuario: req.query.usuario,
      estado: req.query.estado
    };
    
    const cierres = await CierreCaja.reporteCierres(filtros);
    
    // Calcular totales
    const totalVentas = cierres.reduce((sum, c) => sum + c.totalVentas, 0);
    const totalDescuentos = cierres.reduce((sum, c) => sum + c.totalDescuentos, 0);
    const totalGastos = cierres.reduce((sum, c) => sum + c.totalGastos, 0);
    const totalIngresos = cierres.reduce((sum, c) => sum + c.totalIngresosAdicionales, 0);
    const totalDiferencias = cierres.reduce((sum, c) => sum + c.diferencia, 0);
    
    res.status(200).json({
      cierres,
      resumen: {
        cantidadCierres: cierres.length,
        totalVentas,
        totalDescuentos,
        totalGastos,
        totalIngresos,
        totalDiferencias,
        balanceGeneral: totalVentas + totalIngresos - totalGastos
      }
    });
  } catch (error) {
    console.error('Error al generar reporte de cierres:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al generar reporte"
    });
  }
};

/**
 * Obtener último cierre de caja
 * GET /api/cierres-caja/ultimo
 */
export const obtenerUltimoCierre = async (req, res) => {
  try {
    const ultimoCierre = await CierreCaja.findOne()
      .sort({ numeroCierre: -1 })
      .populate('realizadoPor', 'nombre apellido')
      .populate('revisadoPor', 'nombre apellido');
    
    if (!ultimoCierre) {
      return res.status(404).json({
        mensaje: "No hay cierres registrados"
      });
    }
    
    res.status(200).json(ultimoCierre);
  } catch (error) {
    console.error('Error al obtener último cierre:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

/**
 * Obtener cierre de caja activo (abierto)
 * GET /api/cierres-caja/activo
 */
export const obtenerCierreActivo = async (req, res) => {
  try {
    const cierreActivo = await CierreCaja.findOne({ estado: 'Abierto' })
      .populate('realizadoPor', 'nombre apellido')
      .sort({ fechaCierre: -1 });
    
    res.status(200).json(cierreActivo);
  } catch (error) {
    console.error('Error al obtener cierre activo:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

/**
 * Obtener cierres de caja por fecha
 * GET /api/cierres-caja/fecha?fechaInicio=...&fechaFin=...
 */
export const obtenerCierresCajaPorFecha = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        mensaje: "Se requieren fechaInicio y fechaFin"
      });
    }
    
    const cierres = await CierreCaja.find({
      fechaCierre: {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin)
      }
    })
      .populate('realizadoPor', 'nombre apellido')
      .populate('revisadoPor', 'nombre apellido')
      .sort({ fechaCierre: -1 });
    
    res.status(200).json(cierres);
  } catch (error) {
    console.error('Error al obtener cierres por fecha:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

/**
 * Obtener cierres de caja por turno
 * GET /api/cierres-caja/turno/:turno
 */
export const obtenerCierresCajaPorTurno = async (req, res) => {
  try {
    const { turno } = req.params;
    
    if (!['Mañana', 'Tarde', 'Noche', 'Completo'].includes(turno)) {
      return res.status(400).json({
        mensaje: "Turno inválido. Valores permitidos: Mañana, Tarde, Noche, Completo"
      });
    }
    
    const cierres = await CierreCaja.find({ turno })
      .populate('realizadoPor', 'nombre apellido')
      .populate('revisadoPor', 'nombre apellido')
      .sort({ fechaCierre: -1 });
    
    res.status(200).json(cierres);
  } catch (error) {
    console.error('Error al obtener cierres por turno:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

/**
 * Obtener pedidos cobrados pendientes de cierre
 * GET /api/cierres-caja/pedidos-pendientes
 */
export const obtenerPedidosPendientesCierre = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    const query = {
      estado: 'Cobrado'
    };
    
    if (fechaInicio && fechaFin) {
      query.fechaCobrado = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin)
      };
    }
    
    const pedidos = await Pedido.find(query)
      .populate('mesa', 'numero')
      .populate('mozo', 'nombre apellido')
      .sort({ fechaCobrado: -1 });
    
    res.status(200).json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos pendientes:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};
