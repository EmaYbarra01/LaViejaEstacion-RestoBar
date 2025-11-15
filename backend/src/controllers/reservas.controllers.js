/**
 * Controladores de Reservas
 * Maneja todas las operaciones CRUD de reservas
 */

import Reserva from '../models/reservaSchema.js';
import Mesa from '../models/mesaSchema.js';
import { enviarEmailConfirmacion, enviarEmailCancelacion, enviarNotificacionRestobar } from '../helpers/emailHelper.js';
import { generarToken, generarExpiracion, tokenExpirado, generarUrlConfirmacion, generarUrlCancelacion } from '../helpers/tokenHelper.js';
import { validarHorarioAtencion, validarAnticipacion, validarComensales } from '../config/reservasConfig.js';

/**
 * Crear una nueva reserva
 * POST /api/reservas
 */
const crearReserva = async (req, res) => {
  try {
    const { cliente, email, telefono, fecha, hora, comensales, numeroMesa, comentarios } = req.body;

    console.log('[RESERVAS] Creando nueva reserva:', { cliente, fecha, hora, comensales });

    // Validar datos obligatorios
    if (!cliente || !email || !telefono || !fecha || !hora || !comensales) {
      return res.status(400).json({
        success: false,
        mensaje: 'Todos los campos obligatorios deben ser completados',
        camposFaltantes: {
          cliente: !cliente,
          email: !email,
          telefono: !telefono,
          fecha: !fecha,
          hora: !hora,
          comensales: !comensales
        }
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        mensaje: 'Por favor ingrese un email válido'
      });
    }

    // Validar número de comensales según reglas de negocio
    const validacionComensales = validarComensales(comensales);
    if (!validacionComensales.valido) {
      return res.status(400).json({
        success: false,
        mensaje: validacionComensales.mensaje
      });
    }

    // Validar anticipación de la reserva
    const validacionAnticipacion = validarAnticipacion(fecha, hora);
    if (!validacionAnticipacion.valido) {
      return res.status(400).json({
        success: false,
        mensaje: validacionAnticipacion.mensaje
      });
    }

    // Validar horario de atención
    const validacionHorario = validarHorarioAtencion(fecha, hora);
    if (!validacionHorario.valido) {
      return res.status(400).json({
        success: false,
        mensaje: validacionHorario.mensaje
      });
    }

    // Validar que la fecha no sea pasada
    const fechaReserva = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaReserva < hoy) {
      return res.status(400).json({
        success: false,
        mensaje: 'La fecha de reserva no puede ser anterior a hoy'
      });
    }

    // Obtener mesas reservadas para esa fecha y hora (solo si el admin quiere asignar mesa)
    let mesaAsignada = null;
    
    if (numeroMesa) {
      // Solo si el administrador especifica una mesa al crear/editar la reserva
      console.log('[RESERVAS] Administrador asignando mesa:', numeroMesa);
      
      const reservasExistentes = await Reserva.find({
        fecha: fechaReserva,
        hora: hora,
        estado: { $in: ['Pendiente', 'Confirmada'] }
      });

      const mesasOcupadasIds = reservasExistentes
        .filter(r => r.mesa)
        .map(r => r.mesa.toString());

      mesaAsignada = await Mesa.findOne({ numero: numeroMesa });
      
      if (!mesaAsignada) {
        return res.status(404).json({
          success: false,
          mensaje: `La mesa ${numeroMesa} no existe`
        });
      }

      // Verificar capacidad
      if (mesaAsignada.capacidad < comensales) {
        return res.status(400).json({
          success: false,
          mensaje: `La mesa ${numeroMesa} tiene capacidad para ${mesaAsignada.capacidad} personas, pero solicitaste ${comensales} comensales`
        });
      }

      // Verificar si ya está reservada
      if (mesasOcupadasIds.includes(mesaAsignada._id.toString())) {
        return res.status(409).json({
          success: false,
          mensaje: `La mesa ${numeroMesa} ya está reservada para esa fecha y hora. Por favor elige otra mesa o un horario diferente.`
        });
      }
    }

    // Crear la reserva
    const token = generarToken();
    const tokenExpiry = generarExpiracion(72); // 72 horas
    
    const nuevaReserva = new Reserva({
      cliente,
      email,
      telefono,
      fecha: fechaReserva,
      hora,
      comensales,
      mesa: mesaAsignada ? mesaAsignada._id : null,
      numeroMesa: mesaAsignada ? mesaAsignada.numero : null,
      comentarios: comentarios || '',
      estado: 'Pendiente',
      confirmationToken: token,
      tokenExpiry: tokenExpiry
    });

    await nuevaReserva.save();

    console.log('[RESERVAS] Reserva creada exitosamente:', nuevaReserva._id);

    // Enviar email de confirmación al cliente (no bloquear la respuesta)
    enviarEmailConfirmacion(nuevaReserva, token)
      .then(resultado => {
        if (resultado.success) {
          console.log('[RESERVAS] ✅ Email de confirmación enviado al cliente');
        } else {
          console.warn('[RESERVAS] ⚠️ No se pudo enviar email al cliente:', resultado.mensaje);
        }
      })
      .catch(error => {
        console.error('[RESERVAS] ❌ Error al enviar email al cliente:', error.message);
      });

    // Enviar notificación al restobar (no bloquear la respuesta)
    enviarNotificacionRestobar(nuevaReserva)
      .then(resultado => {
        if (resultado.success) {
          console.log('[RESERVAS] ✅ Notificación enviada al restobar');
        } else {
          console.warn('[RESERVAS] ⚠️ No se pudo enviar notificación al restobar:', resultado.mensaje);
        }
      })
      .catch(error => {
        console.error('[RESERVAS] ❌ Error al enviar notificación al restobar:', error.message);
      });

    // Mensaje de éxito
    const mensajeExito = mesaAsignada 
      ? `¡Reserva creada exitosamente! Se te ha asignado la Mesa ${mesaAsignada.numero}. Te enviaremos un email de confirmación con todos los detalles.`
      : '¡Reserva creada exitosamente! El administrador asignará tu mesa y te enviaremos un email de confirmación.';

    res.status(201).json({
      success: true,
      mensaje: mensajeExito,
      reserva: nuevaReserva,
      mesaAsignada: mesaAsignada ? {
        numero: mesaAsignada.numero,
        capacidad: mesaAsignada.capacidad,
        ubicacion: mesaAsignada.ubicacion
      } : null
    });

  } catch (error) {
    console.error('[RESERVAS] Error al crear reserva:', error);
    
    // Error de validación de Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        mensaje: 'Error de validación',
        errores: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      mensaje: 'Error al crear la reserva',
      error: error.message
    });
  }
};

/**
 * Obtener todas las reservas
 * GET /api/reservas
 */
const obtenerReservas = async (req, res) => {
  try {
    const { estado, fecha, page = 1, limit = 50 } = req.query;

    console.log('[RESERVAS] Obteniendo reservas con filtros:', { estado, fecha, page, limit });

    // Construir filtros
    const filtros = {};
    
    if (estado) {
      filtros.estado = estado;
    }
    
    if (fecha) {
      const fechaBusqueda = new Date(fecha);
      filtros.fecha = {
        $gte: new Date(fechaBusqueda.setHours(0, 0, 0, 0)),
        $lt: new Date(fechaBusqueda.setHours(23, 59, 59, 999))
      };
    }

    // Paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reservas, total] = await Promise.all([
      Reserva.find(filtros)
        .populate('mesa', 'numero capacidad ubicacion')
        .sort({ fecha: 1, hora: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Reserva.countDocuments(filtros)
    ]);

    console.log(`[RESERVAS] Se encontraron ${reservas.length} reservas de ${total} totales`);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      reservas
    });

  } catch (error) {
    console.error('[RESERVAS] Error al obtener reservas:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener las reservas',
      error: error.message
    });
  }
};

/**
 * Obtener una reserva por ID
 * GET /api/reservas/:id
 */
const obtenerReservaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('[RESERVAS] Buscando reserva:', id);

    const reserva = await Reserva.findById(id)
      .populate('mesa', 'numero capacidad ubicacion estado');

    if (!reserva) {
      return res.status(404).json({
        success: false,
        mensaje: 'Reserva no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      reserva
    });

  } catch (error) {
    console.error('[RESERVAS] Error al obtener reserva:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener la reserva',
      error: error.message
    });
  }
};

/**
 * Actualizar una reserva
 * PUT /api/reservas/:id
 */
const actualizarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { cliente, email, telefono, fecha, hora, comensales, numeroMesa, comentarios, estado } = req.body;

    console.log('[RESERVAS] Actualizando reserva:', id);

    const reserva = await Reserva.findById(id);

    if (!reserva) {
      return res.status(404).json({
        success: false,
        mensaje: 'Reserva no encontrada'
      });
    }

    // No permitir actualizar reservas completadas o canceladas
    if (reserva.estado === 'Completada' || reserva.estado === 'Cancelada') {
      return res.status(400).json({
        success: false,
        mensaje: `No se puede modificar una reserva ${reserva.estado.toLowerCase()}`
      });
    }

    // Actualizar campos
    if (cliente) reserva.cliente = cliente;
    if (email) reserva.email = email;
    if (telefono) reserva.telefono = telefono;
    if (fecha) reserva.fecha = new Date(fecha);
    if (hora) reserva.hora = hora;
    if (comensales) reserva.comensales = comensales;
    if (comentarios !== undefined) reserva.comentarios = comentarios;
    if (estado && ['Pendiente', 'Confirmada', 'Cancelada', 'Completada'].includes(estado)) {
      reserva.estado = estado;
    }

    // Si se cambió la mesa
    if (numeroMesa) {
      const mesaNueva = await Mesa.findOne({ numero: numeroMesa });
      
      if (!mesaNueva) {
        return res.status(404).json({
          success: false,
          mensaje: `La mesa ${numeroMesa} no existe`
        });
      }

      if (mesaNueva.capacidad < reserva.comensales) {
        return res.status(400).json({
          success: false,
          mensaje: `La mesa ${numeroMesa} no tiene suficiente capacidad`
        });
      }

      reserva.mesa = mesaNueva._id;
      reserva.numeroMesa = mesaNueva.numero;
    }

    await reserva.save();

    console.log('[RESERVAS] Reserva actualizada:', reserva._id);

    res.status(200).json({
      success: true,
      mensaje: 'Reserva actualizada exitosamente',
      reserva
    });

  } catch (error) {
    console.error('[RESERVAS] Error al actualizar reserva:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        mensaje: 'Error de validación',
        errores: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar la reserva',
      error: error.message
    });
  }
};

/**
 * Cancelar una reserva
 * DELETE /api/reservas/:id
 */
const cancelarReserva = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('[RESERVAS] Cancelando reserva:', id);

    const reserva = await Reserva.findById(id);

    if (!reserva) {
      return res.status(404).json({
        success: false,
        mensaje: 'Reserva no encontrada'
      });
    }

    // No permitir cancelar reservas ya completadas o canceladas
    if (reserva.estado === 'Completada') {
      return res.status(400).json({
        success: false,
        mensaje: 'No se puede cancelar una reserva ya completada'
      });
    }

    if (reserva.estado === 'Cancelada') {
      return res.status(400).json({
        success: false,
        mensaje: 'Esta reserva ya está cancelada'
      });
    }

    // Cambiar estado a cancelada
    reserva.estado = 'Cancelada';
    await reserva.save();

    console.log('[RESERVAS] Reserva cancelada:', reserva._id);

    // Enviar email de cancelación (no bloquear la respuesta)
    enviarEmailCancelacion(reserva)
      .then(resultado => {
        if (resultado.success) {
          console.log('[RESERVAS] ✅ Email de cancelación enviado');
        } else {
          console.warn('[RESERVAS] ⚠️ No se pudo enviar email de cancelación');
        }
      })
      .catch(error => {
        console.error('[RESERVAS] ❌ Error al enviar email de cancelación:', error.message);
      });

    res.status(200).json({
      success: true,
      mensaje: 'Reserva cancelada exitosamente. Te enviaremos un email de confirmación.',
      reserva
    });

  } catch (error) {
    console.error('[RESERVAS] Error al cancelar reserva:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al cancelar la reserva',
      error: error.message
    });
  }
};

/**
 * Confirmar una reserva
 * PATCH /api/reservas/:id/confirmar
 */
const confirmarReserva = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('[RESERVAS] Confirmando reserva:', id);

    const reserva = await Reserva.findById(id);

    if (!reserva) {
      return res.status(404).json({
        success: false,
        mensaje: 'Reserva no encontrada'
      });
    }

    if (reserva.estado !== 'Pendiente') {
      return res.status(400).json({
        success: false,
        mensaje: `No se puede confirmar una reserva en estado ${reserva.estado}`
      });
    }

    reserva.estado = 'Confirmada';
    await reserva.save();

    console.log('[RESERVAS] Reserva confirmada:', reserva._id);

    // Enviar email de confirmación actualizada (no bloquear la respuesta)
    enviarEmailConfirmacion(reserva)
      .then(resultado => {
        if (resultado.success) {
          console.log('[RESERVAS] ✅ Email de confirmación actualizado enviado');
        } else {
          console.warn('[RESERVAS] ⚠️ No se pudo enviar email de confirmación');
        }
      })
      .catch(error => {
        console.error('[RESERVAS] ❌ Error al enviar email:', error.message);
      });

    res.status(200).json({
      success: true,
      mensaje: 'Reserva confirmada exitosamente. Te enviaremos un email de confirmación.',
      reserva
    });

  } catch (error) {
    console.error('[RESERVAS] Error al confirmar reserva:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al confirmar la reserva',
      error: error.message
    });
  }
};

/**
 * Completar una reserva
 * PATCH /api/reservas/:id/completar
 */
const completarReserva = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('[RESERVAS] Completando reserva:', id);

    const reserva = await Reserva.findById(id);

    if (!reserva) {
      return res.status(404).json({
        success: false,
        mensaje: 'Reserva no encontrada'
      });
    }

    if (reserva.estado === 'Cancelada') {
      return res.status(400).json({
        success: false,
        mensaje: 'No se puede completar una reserva cancelada'
      });
    }

    if (reserva.estado === 'Completada') {
      return res.status(400).json({
        success: false,
        mensaje: 'Esta reserva ya está completada'
      });
    }

    reserva.estado = 'Completada';
    await reserva.save();

    console.log('[RESERVAS] Reserva completada:', reserva._id);

    res.status(200).json({
      success: true,
      mensaje: 'Reserva completada exitosamente',
      reserva
    });

  } catch (error) {
    console.error('[RESERVAS] Error al completar reserva:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al completar la reserva',
      error: error.message
    });
  }
};

/**
 * Obtener reservas por fecha
 * GET /api/reservas/fecha/:fecha
 */
const obtenerReservasPorFecha = async (req, res) => {
  try {
    const { fecha } = req.params;

    console.log('[RESERVAS] Obteniendo reservas para la fecha:', fecha);

    const fechaBusqueda = new Date(fecha);
    const inicioFecha = new Date(fechaBusqueda.setHours(0, 0, 0, 0));
    const finFecha = new Date(fechaBusqueda.setHours(23, 59, 59, 999));

    const reservas = await Reserva.find({
      fecha: {
        $gte: inicioFecha,
        $lt: finFecha
      },
      estado: { $in: ['Pendiente', 'Confirmada'] }
    })
    .populate('mesa', 'numero capacidad ubicacion')
    .sort({ hora: 1 });

    console.log(`[RESERVAS] Se encontraron ${reservas.length} reservas para ${fecha}`);

    res.status(200).json({
      success: true,
      fecha,
      total: reservas.length,
      reservas
    });

  } catch (error) {
    console.error('[RESERVAS] Error al obtener reservas por fecha:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener las reservas',
      error: error.message
    });
  }
};

/**
 * Confirmar reserva mediante token (link del email)
 * GET /api/reservas/confirmar/:token
 */
const confirmarReservaToken = async (req, res) => {
  try {
    const { token } = req.params;

    console.log('[RESERVAS] Intentando confirmar reserva con token');

    // Buscar reserva por token
    const reserva = await Reserva.findOne({ confirmationToken: token });

    if (!reserva) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reserva no encontrada</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .error { background: #fee; border-left: 4px solid #c33; padding: 20px; border-radius: 5px; }
            h1 { color: #c33; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>❌ Reserva no encontrada</h1>
            <p>El link de confirmación no es válido o ha sido utilizado.</p>
            <p>Si tienes problemas, contáctanos al +54 381 636-4592</p>
          </div>
        </body>
        </html>
      `);
    }

    // Verificar si el token ha expirado
    if (tokenExpirado(reserva.tokenExpiry)) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Link expirado</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 5px; }
            h1 { color: #856404; }
          </style>
        </head>
        <body>
          <div class="warning">
            <h1>⏰ Link expirado</h1>
            <p>Este link de confirmación ha expirado.</p>
            <p>Por favor, contáctanos para confirmar tu reserva:</p>
            <p><strong>📱 +54 381 636-4592</strong></p>
            <p><strong>📧 reservas@laviejaestacion.com</strong></p>
          </div>
        </body>
        </html>
      `);
    }

    // Verificar si ya está confirmada
    if (reserva.estado === 'Confirmada') {
      return res.status(200).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reserva ya confirmada</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .info { background: #d4edda; border-left: 4px solid #28a745; padding: 20px; border-radius: 5px; }
            h1 { color: #155724; }
          </style>
        </head>
        <body>
          <div class="info">
            <h1>✅ Reserva ya confirmada</h1>
            <p>Tu reserva ya fue confirmada anteriormente.</p>
            <p><strong>Cliente:</strong> ${reserva.cliente}</p>
            <p><strong>Fecha:</strong> ${new Date(reserva.fecha).toLocaleDateString('es-AR')}</p>
            <p><strong>Hora:</strong> ${reserva.hora}</p>
            <p><strong>Comensales:</strong> ${reserva.comensales}</p>
            <p>¡Te esperamos en La Vieja Estación!</p>
          </div>
        </body>
        </html>
      `);
    }

    // Verificar si está cancelada
    if (reserva.estado === 'Cancelada') {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reserva cancelada</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .error { background: #fee; border-left: 4px solid #c33; padding: 20px; border-radius: 5px; }
            h1 { color: #c33; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>❌ Reserva cancelada</h1>
            <p>Esta reserva fue cancelada y no se puede confirmar.</p>
            <p>Si deseas hacer una nueva reserva, visita nuestra web.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Confirmar la reserva
    reserva.estado = 'Confirmada';
    reserva.confirmedAt = new Date();
    await reserva.save();

    console.log('[RESERVAS] ✅ Reserva confirmada via token:', reserva._id);

    // TODO: Enviar email de notificación al restaurante

    // Mostrar página de confirmación exitosa
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reserva Confirmada</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .card {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          .success { color: #28a745; font-size: 60px; margin: 0; }
          h1 { color: #333; margin: 20px 0; }
          .details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            text-align: left;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #dee2e6;
          }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #667eea; }
          .value { color: #495057; }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="success">✅</div>
          <h1>¡Reserva Confirmada!</h1>
          <p>Tu reserva ha sido confirmada exitosamente.</p>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Cliente:</span>
              <span class="value">${reserva.cliente}</span>
            </div>
            <div class="detail-row">
              <span class="label">Fecha:</span>
              <span class="value">${new Date(reserva.fecha).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="detail-row">
              <span class="label">Hora:</span>
              <span class="value">${reserva.hora}</span>
            </div>
            <div class="detail-row">
              <span class="label">Comensales:</span>
              <span class="value">${reserva.comensales} ${reserva.comensales === 1 ? 'persona' : 'personas'}</span>
            </div>
            ${reserva.numeroMesa ? `
            <div class="detail-row">
              <span class="label">Mesa:</span>
              <span class="value">Mesa ${reserva.numeroMesa}</span>
            </div>
            ` : ''}
          </div>
          
          <p style="color: #28a745; font-weight: bold;">¡Te esperamos en La Vieja Estación!</p>
          
          <div class="footer">
            <p><strong>La Vieja Estación RestoBar</strong></p>
            <p>📍 Ruta Nacional N°9, km. 1361</p>
            <p>📱 +54 381 636-4592</p>
          </div>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('[RESERVAS] Error al confirmar reserva:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          .error { background: #fee; border-left: 4px solid #c33; padding: 20px; border-radius: 5px; }
          h1 { color: #c33; }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>❌ Error</h1>
          <p>Hubo un error al procesar tu confirmación.</p>
          <p>Por favor, contáctanos al +54 381 636-4592</p>
        </div>
      </body>
      </html>
    `);
  }
};

/**
 * Cancelar reserva mediante token (link del email)
 * GET /api/reservas/cancelar/:token
 */
const cancelarReservaToken = async (req, res) => {
  try {
    const { token } = req.params;

    console.log('[RESERVAS] Intentando cancelar reserva con token');

    // Buscar reserva por token
    const reserva = await Reserva.findOne({ confirmationToken: token });

    if (!reserva) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reserva no encontrada</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .error { background: #fee; border-left: 4px solid #c33; padding: 20px; border-radius: 5px; }
            h1 { color: #c33; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>❌ Reserva no encontrada</h1>
            <p>El link de cancelación no es válido o ha sido utilizado.</p>
            <p>Si tienes problemas, contáctanos al +54 381 636-4592</p>
          </div>
        </body>
        </html>
      `);
    }

    // Verificar si ya está cancelada
    if (reserva.estado === 'Cancelada') {
      return res.status(200).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reserva ya cancelada</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .info { background: #f8d7da; border-left: 4px solid #721c24; padding: 20px; border-radius: 5px; }
            h1 { color: #721c24; }
          </style>
        </head>
        <body>
          <div class="info">
            <h1>❌ Reserva ya cancelada</h1>
            <p>Esta reserva ya fue cancelada anteriormente.</p>
            <p>Si deseas hacer una nueva reserva, visita nuestra web.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Cancelar la reserva
    reserva.estado = 'Cancelada';
    reserva.cancelledAt = new Date();
    await reserva.save();

    console.log('[RESERVAS] ❌ Reserva cancelada via token:', reserva._id);

    // Enviar email de cancelación
    enviarEmailCancelacion(reserva)
      .then(resultado => {
        if (resultado.success) {
          console.log('[RESERVAS] ✅ Email de cancelación enviado');
        }
      })
      .catch(error => {
        console.error('[RESERVAS] ❌ Error al enviar email:', error.message);
      });

    // TODO: Enviar email de notificación al restaurante

    // Mostrar página de cancelación exitosa
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reserva Cancelada</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }
          .card {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          .cancel-icon { color: #dc3545; font-size: 60px; margin: 0; }
          h1 { color: #333; margin: 20px 0; }
          .details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            text-align: left;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #dee2e6;
          }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #dc3545; }
          .value { color: #495057; }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="cancel-icon">❌</div>
          <h1>Reserva Cancelada</h1>
          <p>Tu reserva ha sido cancelada exitosamente.</p>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Cliente:</span>
              <span class="value">${reserva.cliente}</span>
            </div>
            <div class="detail-row">
              <span class="label">Fecha:</span>
              <span class="value">${new Date(reserva.fecha).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="detail-row">
              <span class="label">Hora:</span>
              <span class="value">${reserva.hora}</span>
            </div>
            <div class="detail-row">
              <span class="label">Comensales:</span>
              <span class="value">${reserva.comensales} ${reserva.comensales === 1 ? 'persona' : 'personas'}</span>
            </div>
          </div>
          
          <p>Lamentamos que no puedas asistir.</p>
          <p>Esperamos verte pronto en La Vieja Estación.</p>
          
          <div class="footer">
            <p><strong>La Vieja Estación RestoBar</strong></p>
            <p>Para hacer una nueva reserva:</p>
            <p>📱 +54 381 636-4592</p>
            <p>📧 reservas@laviejaestacion.com</p>
          </div>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('[RESERVAS] Error al cancelar reserva:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          .error { background: #fee; border-left: 4px solid #c33; padding: 20px; border-radius: 5px; }
          h1 { color: #c33; }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>❌ Error</h1>
          <p>Hubo un error al procesar tu cancelación.</p>
          <p>Por favor, contáctanos al +54 381 636-4592</p>
        </div>
      </body>
      </html>
    `);
  }
};

/**
 * Verificar disponibilidad de mesas para una fecha y hora específica
 * GET /api/reservas/disponibilidad/:fecha/:hora
 */
const verificarDisponibilidad = async (req, res) => {
  try {
    const { fecha, hora } = req.params;
    const { comensales } = req.query;

    console.log('[DISPONIBILIDAD] Verificando:', { fecha, hora, comensales });

    // Validar horario de atención
    const validacionHorario = validarHorarioAtencion(fecha, hora);
    if (!validacionHorario.valido) {
      return res.status(400).json({
        disponible: false,
        mensaje: validacionHorario.mensaje
      });
    }

    // Obtener todas las mesas
    const todasLasMesas = await Mesa.find({ disponible: true });

    // Obtener reservas confirmadas para esa fecha y hora
    const reservasOcupadas = await Reserva.find({
      fecha: fecha,
      hora: hora,
      estado: { $in: ['Pendiente', 'Confirmada'] }
    });

    const mesasOcupadasIds = reservasOcupadas.map(r => r.numeroMesa?.toString());
    const mesasDisponibles = todasLasMesas.filter(
      mesa => !mesasOcupadasIds.includes(mesa.numero?.toString())
    );

    // Filtrar por capacidad si se especificaron comensales
    let mesasFiltradas = mesasDisponibles;
    if (comensales) {
      const numComensales = parseInt(comensales);
      mesasFiltradas = mesasDisponibles.filter(m => m.capacidad >= numComensales);
    }

    return res.status(200).json({
      disponible: mesasFiltradas.length > 0,
      mensaje: mesasFiltradas.length > 0 
        ? `Hay ${mesasFiltradas.length} mesa(s) disponible(s)` 
        : 'No hay mesas disponibles para esa fecha y hora',
      mesasDisponibles: mesasFiltradas.map(m => ({
        numero: m.numero,
        capacidad: m.capacidad,
        ubicacion: m.ubicacion
      })),
      totalMesas: todasLasMesas.length,
      mesasOcupadas: mesasOcupadasIds.length
    });

  } catch (error) {
    console.error('[ERROR] Error al verificar disponibilidad:', error);
    return res.status(500).json({
      disponible: false,
      mensaje: 'Error al verificar disponibilidad',
      error: error.message
    });
  }
};

/**
 * Obtener reservas por email de cliente
 * GET /api/reservas/cliente/:email
 */
const obtenerReservasPorCliente = async (req, res) => {
  try {
    const { email } = req.params;

    console.log('[RESERVAS] Buscando reservas para:', email);

    const reservas = await Reserva.find({ email })
      .sort({ fecha: -1, hora: -1 })
      .lean();

    // Calcular estadísticas
    const estadisticas = {
      total: reservas.length,
      pendientes: reservas.filter(r => r.estado === 'Pendiente').length,
      confirmadas: reservas.filter(r => r.estado === 'Confirmada').length,
      canceladas: reservas.filter(r => r.estado === 'Cancelada').length,
      completadas: reservas.filter(r => r.estado === 'Completada').length
    };

    return res.status(200).json({
      success: true,
      reservas,
      estadisticas
    });

  } catch (error) {
    console.error('[ERROR] Error al obtener reservas del cliente:', error);
    return res.status(500).json({
      success: false,
      mensaje: 'Error al obtener reservas',
      error: error.message
    });
  }
};

export {
  crearReserva,
  obtenerReservas,
  obtenerReservaPorId,
  actualizarReserva,
  cancelarReserva,
  confirmarReserva,
  completarReserva,
  obtenerReservasPorFecha,
  confirmarReservaToken,
  cancelarReservaToken,
  verificarDisponibilidad,
  obtenerReservasPorCliente
};
