/**
 * Helper de Email
 * Maneja el envío de correos electrónicos usando Nodemailer
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configurar el transporter de Nodemailer
 */
const crearTransporter = () => {
  // Si se usa un servicio conocido (Gmail, Outlook, etc.)
  if (process.env.EMAIL_SERVICE) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Si se usa SMTP personalizado
  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Si no hay configuración, devolver null
  console.warn('[EMAIL] No se encontró configuración de email. Verifica tu archivo .env');
  return null;
};

/**
 * Formatear fecha para mostrar en español
 */
const formatearFecha = (fecha) => {
  const opciones = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(fecha).toLocaleDateString('es-AR', opciones);
};

/**
 * Plantilla HTML para confirmación de reserva
 */
const plantillaConfirmacionReserva = (reserva, token = null) => {
  const fechaFormateada = formatearFecha(reserva.fecha);
  const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
  const urlConfirmar = token ? `${baseUrl}/api/reservas/confirmar/${token}` : null;
  const urlCancelar = token ? `${baseUrl}/api/reservas/cancelar/${token}` : null;
  
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Reserva</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 30px;
        }
        .reserva-info {
          background-color: #f8f9fa;
          border-left: 4px solid #667eea;
          padding: 20px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: bold;
          color: #667eea;
        }
        .info-value {
          color: #495057;
        }
        .estado {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 14px;
        }
        .estado-pendiente {
          background-color: #fff3cd;
          color: #856404;
        }
        .estado-confirmada {
          background-color: #d4edda;
          color: #155724;
        }
        .importante {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
        }
        .btn {
          display: inline-block;
          padding: 12px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white !important;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px 5px;
          font-weight: bold;
        }
        .btn-confirm {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        }
        .btn-cancel {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        }
        .btn:hover {
          opacity: 0.9;
        }
        .buttons-container {
          text-align: center;
          margin: 30px 0;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 5px;
        }
        .contacto {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍽️ La Vieja Estación RestoBar</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Confirmación de Reserva</p>
        </div>
        
        <div class="content">
          <p>Hola <strong>${reserva.cliente}</strong>,</p>
          
          <p>¡Gracias por elegir La Vieja Estación RestoBar! Hemos recibido tu reserva con los siguientes detalles:</p>
          
          <div class="reserva-info">
            <div class="info-row">
              <span class="info-label">📅 Fecha:</span>
              <span class="info-value">${fechaFormateada}</span>
            </div>
            <div class="info-row">
              <span class="info-label">🕐 Hora:</span>
              <span class="info-value">${reserva.hora}</span>
            </div>
            <div class="info-row">
              <span class="info-label">👥 Comensales:</span>
              <span class="info-value">${reserva.comensales} ${reserva.comensales === 1 ? 'persona' : 'personas'}</span>
            </div>
            ${reserva.numeroMesa ? `
            <div class="info-row">
              <span class="info-label">🪑 Mesa:</span>
              <span class="info-value">Mesa ${reserva.numeroMesa}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="info-label">📧 Email:</span>
              <span class="info-value">${reserva.email}</span>
            </div>
            <div class="info-row">
              <span class="info-label">📱 Teléfono:</span>
              <span class="info-value">${reserva.telefono}</span>
            </div>
            ${reserva.comentarios ? `
            <div class="info-row">
              <span class="info-label">💬 Comentarios:</span>
              <span class="info-value">${reserva.comentarios}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="info-label">Estado:</span>
              <span class="info-value">
                <span class="estado estado-${reserva.estado.toLowerCase()}">${reserva.estado}</span>
              </span>
            </div>
          </div>
          
          ${reserva.estado === 'Pendiente' ? `
          <div class="importante">
            <strong>⏳ Reserva Pendiente de Confirmación</strong>
            <p style="margin: 10px 0 0 0;">Por favor, confirma tu asistencia haciendo click en el botón de abajo.</p>
          </div>
          ${urlConfirmar && urlCancelar ? `
          <div class="buttons-container">
            <p style="margin-bottom: 15px; font-weight: bold;">¿Asistirás a tu reserva?</p>
            <a href="${urlConfirmar}" class="btn btn-confirm" style="color: white;">✅ Sí, Confirmar mi Reserva</a>
            <a href="${urlCancelar}" class="btn btn-cancel" style="color: white;">❌ No, Cancelar Reserva</a>
            <p style="margin-top: 15px; font-size: 12px; color: #6c757d;">Estos links son válidos por 72 horas</p>
          </div>
          ` : ''}
          ` : ''}
          
          ${reserva.estado === 'Confirmada' ? `
          <div style="text-align: center;">
            <p style="color: #28a745; font-size: 18px; font-weight: bold;">✅ ¡Tu reserva está confirmada!</p>
            <p>Te esperamos en la fecha y hora indicadas.</p>
            ${urlCancelar ? `
            <div class="buttons-container">
              <p style="margin-bottom: 10px;">¿Necesitas cancelar?</p>
              <a href="${urlCancelar}" class="btn btn-cancel" style="color: white;">❌ Cancelar Reserva</a>
              <p style="margin-top: 10px; font-size: 12px; color: #6c757d;">Cancelación gratuita hasta 2 horas antes</p>
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          <div class="contacto">
            <p><strong>¿Necesitas modificar o cancelar tu reserva?</strong></p>
            <p>Contáctanos:</p>
            <ul style="list-style: none; padding: 0;">
                <li>📧 Email: reservas@laviejaestacion.com</li>
                <li>📱 Teléfono: +54 381 636-4592</li>
                <li>📍 Dirección: Ruta Nacional N°9, km. 1361</li>
                <li>⏰ Horarios:</li>
                <li style="margin-left:18px;">Lunes a Viernes: 12:00 - 23:00</li>
                <li style="margin-left:18px;">Sábados y Domingos: 11:00 - 00:00</li>
                <li style="margin-top:8px;">ℹ️ Importante: Las reservas se confirman por email. Cancelación gratuita hasta 2 horas antes.</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>La Vieja Estación RestoBar</strong></p>
          <p>Sabores que trascienden el tiempo</p>
          <p style="font-size: 12px; margin-top: 10px;">
            Este es un correo automático, por favor no responder directamente.<br>
            Para consultas, contacta a reservas@laviejaestacion.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Plantilla de texto plano (fallback)
 */
const plantillaTextoPlano = (reserva) => {
  const fechaFormateada = formatearFecha(reserva.fecha);
  
  return `
LA VIEJA ESTACIÓN RESTOBAR
Confirmación de Reserva

Hola ${reserva.cliente},

¡Gracias por elegir La Vieja Estación RestoBar! Hemos recibido tu reserva con los siguientes detalles:

DETALLES DE LA RESERVA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Fecha: ${fechaFormateada}
🕐 Hora: ${reserva.hora}
👥 Comensales: ${reserva.comensales} ${reserva.comensales === 1 ? 'persona' : 'personas'}
${reserva.numeroMesa ? `🪑 Mesa: Mesa ${reserva.numeroMesa}\n` : ''}📧 Email: ${reserva.email}
📱 Teléfono: ${reserva.telefono}
${reserva.comentarios ? `💬 Comentarios: ${reserva.comentarios}\n` : ''}Estado: ${reserva.estado}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${reserva.estado === 'Pendiente' ? '⏳ Tu reserva está pendiente de confirmación. Te contactaremos pronto.\n' : ''}
${reserva.estado === 'Confirmada' ? '✅ ¡Tu reserva está confirmada! Te esperamos.\n' : ''}

¿NECESITAS MODIFICAR O CANCELAR?
Contáctanos:
📧 Email: reservas@laviejaestacion.com
📱 Teléfono: (0387) 123-4567
📍 Dirección: Av. Principal 123, Salta Capital
📱 Teléfono: +54 381 636-4592
📍 Dirección: Ruta Nacional N°9, km. 1361
⏰ Horarios: Lunes a Viernes: 12:00 - 23:00; Sábados y Domingos: 11:00 - 00:00
ℹ️ Importante: Las reservas se confirman por email. Cancelación gratuita hasta 2 horas antes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La Vieja Estación RestoBar
Sabores que trascienden el tiempo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `;
};

/**
 * Enviar email de confirmación de reserva
 */
const enviarEmailConfirmacion = async (reserva, token = null) => {
  try {
    const transporter = crearTransporter();

    if (!transporter) {
      console.error('[EMAIL] No se pudo crear el transporter. Verifica la configuración en .env');
      return {
        success: false,
        mensaje: 'Email no configurado'
      };
    }

    // Verificar que tenemos el email del destinatario
    if (!reserva.email) {
      console.error('[EMAIL] No se proporcionó email del cliente');
      return {
        success: false,
        mensaje: 'Email del cliente no proporcionado'
      };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'La Vieja Estación RestoBar <noreply@laviejaestacion.com>',
      to: reserva.email,
      subject: `Confirmación de Reserva - ${formatearFecha(reserva.fecha)} ${reserva.hora}`,
      text: plantillaTextoPlano(reserva),
      html: plantillaConfirmacionReserva(reserva, token)
    };

    console.log(`[EMAIL] Enviando confirmación a ${reserva.email}...`);

    const info = await transporter.sendMail(mailOptions);

    console.log('[EMAIL] ✅ Email enviado exitosamente:', info.messageId);

    return {
      success: true,
      mensaje: 'Email enviado correctamente',
      messageId: info.messageId
    };

  } catch (error) {
    console.error('[EMAIL] ❌ Error al enviar email:', error);
    
    // Errores comunes y sus soluciones
    if (error.code === 'EAUTH') {
      console.error('[EMAIL] Error de autenticación. Verifica EMAIL_USER y EMAIL_PASS en .env');
      console.error('[EMAIL] Si usas Gmail, necesitas una "Contraseña de aplicación"');
    } else if (error.code === 'ESOCKET') {
      console.error('[EMAIL] Error de conexión. Verifica EMAIL_HOST y EMAIL_PORT en .env');
    }

    return {
      success: false,
      mensaje: 'Error al enviar email',
      error: error.message
    };
  }
};

/**
 * Enviar email de cancelación de reserva
 */
const enviarEmailCancelacion = async (reserva) => {
  try {
    const transporter = crearTransporter();

    if (!transporter) {
      return {
        success: false,
        mensaje: 'Email no configurado'
      };
    }

    const fechaFormateada = formatearFecha(reserva.fecha);

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reserva Cancelada</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background-color: #dc3545;
            color: white;
            padding: 30px;
            text-align: center;
          }
          .content {
            padding: 30px;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ La Vieja Estación RestoBar</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Reserva Cancelada</p>
          </div>
          
          <div class="content">
            <p>Hola <strong>${reserva.cliente}</strong>,</p>
            
            <p>Tu reserva ha sido <strong>cancelada</strong> exitosamente:</p>
            
            <ul>
              <li><strong>Fecha:</strong> ${fechaFormateada}</li>
              <li><strong>Hora:</strong> ${reserva.hora}</li>
              <li><strong>Comensales:</strong> ${reserva.comensales}</li>
            </ul>
            
            <p>Esperamos poder atenderte en otra ocasión.</p>
            
            <p>Para hacer una nueva reserva, visita nuestra página web o contáctanos:</p>
            <ul>
              <li>📧 reservas@laviejaestacion.com</li>
              <li>📱 (0387) 123-4567</li>
            </ul>
          </div>
          
          <div class="footer">
            <p><strong>La Vieja Estación RestoBar</strong></p>
            <p>Sabores que trascienden el tiempo</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'La Vieja Estación RestoBar <noreply@laviejaestacion.com>',
      to: reserva.email,
      subject: `Reserva Cancelada - ${fechaFormateada} ${reserva.hora}`,
      html: htmlContent
    };

    console.log(`[EMAIL] Enviando cancelación a ${reserva.email}...`);

    const info = await transporter.sendMail(mailOptions);

    console.log('[EMAIL] ✅ Email de cancelación enviado:', info.messageId);

    return {
      success: true,
      mensaje: 'Email de cancelación enviado correctamente',
      messageId: info.messageId
    };

  } catch (error) {
    console.error('[EMAIL] ❌ Error al enviar email de cancelación:', error);
    
    return {
      success: false,
      mensaje: 'Error al enviar email de cancelación',
      error: error.message
    };
  }
};

export {
  enviarEmailConfirmacion,
  enviarEmailCancelacion
};
