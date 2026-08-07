import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Leer variables de entorno relevantes
const { EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = process.env;

// Crear un transportador seguro para Gmail cuando haya credenciales.
// Si faltan, creamos un transportador de "stream" para desarrollo que no envía correos
// reales pero permite que la app siga funcionando y devuelve información útil.
let transporter;
if (!EMAIL_USER || !EMAIL_PASS || !EMAIL_FROM) {
  console.error('❌ Variables de entorno de email faltantes. Configura EMAIL_USER, EMAIL_PASS y EMAIL_FROM en tu .env');
  // Transportador de fallback para desarrollo (no envía correos reales)
  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true
  });
} else {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

export { transporter };

// Verificar la configuración del transportador
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error en la configuración de nodemailer:', error);
  } else {
    console.log('✅ Nodemailer configurado correctamente y listo para enviar emails');
  }
});

// Función para enviar email de recuperación de contraseña
export const sendPasswordResetEmail = async (email, token, username) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
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
