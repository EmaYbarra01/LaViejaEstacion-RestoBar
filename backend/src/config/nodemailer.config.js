import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Leer variables de entorno relevantes
const { EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS, EMAIL_FROM, EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE } = process.env;

const hasRealSmtpCredentials = () => {
  const user = String(EMAIL_USER || '').trim();
  const pass = String(EMAIL_PASS || '').trim();

  if (!user || !pass) return false;

  const placeholderPattern = /^(tu_|your_|demo_|example|test_|placeholder|mailtrap|gmail)/i;
  if (placeholderPattern.test(user) || placeholderPattern.test(pass) || user.includes('example') || pass.includes('example')) {
    return false;
  }

  return true;
};

// Crear un transportador compatible con Gmail o SMTP personalizado (Mailtrap, SMTP propio, etc.).
// Si faltan credenciales reales, usamos un stream transport para desarrollo para que la app siga funcionando.
let transporter;
if (hasRealSmtpCredentials() && EMAIL_HOST) {
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT) || 587,
    secure: String(EMAIL_SECURE).toLowerCase() === 'true' || Number(EMAIL_PORT) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
} else if (hasRealSmtpCredentials()) {
  transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE || 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
} else {
  console.warn('⚠️ SMTP desactivado: faltan credenciales reales de email. Completa EMAIL_USER y EMAIL_PASS en .env para activar envíos reales.');
  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true
  });
}

export { transporter };

// Verificación opcional: evitamos bloquear o ensuciar el arranque del servidor
// cuando Gmail no responde o la red no está disponible.
if (process.env.EMAIL_SMTP_VERIFY === 'true') {
  transporter.verify((error) => {
    if (error) {
      console.warn('⚠️ Nodemailer no pudo verificarse al iniciar:', error.message || error);
    } else {
      console.log('✅ Nodemailer configurado correctamente y listo para enviar emails');
    }
  });
}

// Función para enviar email de recuperación de contraseña
export const sendPasswordResetEmail = async (email, token, username) => {
  if (!EMAIL_USER || !EMAIL_PASS || !EMAIL_FROM) throw new Error('SMTP no configurado');
  const destino = process.env.FRONTEND_URL || 'http://localhost:5173';
  const enlace = new URL('/reset-password', destino);
  enlace.searchParams.set('token', token);
  const resetUrl = enlace.toString().replaceAll('&','&amp;');
  username = String(username || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  
  const mailOptions = {
    from: `"La Vieja Estación Resto-Bar" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Recuperación de Contraseña - La Vieja Estación',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f4f4f4;
            border-radius: 10px;
            padding: 30px;
          }
          .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            margin: 20px 0;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          }
          .button:hover {
            background-color: #45a049;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 10px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ Recuperación de Contraseña</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${username}</strong>,</p>
            
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
            
            <p>Si realizaste esta solicitud, haz clic en el siguiente botón para crear una nueva contraseña:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </div>
            
            <p>O copia y pega el siguiente enlace en tu navegador:</p>
            <p style="word-break: break-all; background-color: #f4f4f4; padding: 10px; border-radius: 5px;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este enlace expirará en <strong>1 hora</strong></li>
                <li>Si no solicitaste este cambio, ignora este correo</li>
                <li>Tu contraseña actual seguirá siendo válida</li>
              </ul>
            </div>
            
            <p>Si tienes algún problema, contacta con el administrador del sistema.</p>
            
            <p>Saludos,<br><strong>Equipo La Vieja Estación Resto-Bar</strong></p>
          </div>
          <div class="footer">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>&copy; 2025 La Vieja Estación Resto-Bar</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de recuperación enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    throw error;
  }
};

// Función para enviar email de confirmación de cambio de contraseña
export const sendPasswordChangedEmail = async (email, username) => {
  username = String(username || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const mailOptions = {
    from: `"La Vieja Estación Resto-Bar" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Contraseña Cambiada Exitosamente - La Vieja Estación',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f4f4f4;
            border-radius: 10px;
            padding: 30px;
          }
          .header {
            background-color: #28a745;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .success-icon {
            font-size: 48px;
            text-align: center;
            margin: 20px 0;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Contraseña Actualizada</h1>
          </div>
          <div class="content">
            <div class="success-icon">🎉</div>
            
            <p>Hola <strong>${username}</strong>,</p>
            
            <p>Te confirmamos que tu contraseña ha sido cambiada exitosamente.</p>
            
            <p>Si no realizaste este cambio, contacta inmediatamente con el administrador del sistema.</p>
            
            <p>Saludos,<br><strong>Equipo La Vieja Estación Resto-Bar</strong></p>
          </div>
          <div class="footer">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>&copy; 2025 La Vieja Estación Resto-Bar</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de confirmación enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    throw error;
  }
};
