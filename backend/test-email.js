import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

console.log('=== CONFIGURACIÓN DE EMAIL ===');
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'NO CONFIGURADO');
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'NO CONFIGURADO');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configurada***' : 'NO CONFIGURADA');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'NO CONFIGURADO');
console.log('EMAIL_RESTOBAR:', process.env.EMAIL_RESTOBAR || 'NO CONFIGURADO');
console.log('===============================\n');

// Crear transportador
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

console.log('📧 Verificando conexión con Gmail...\n');

// Verificar conexión
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error en la configuración de nodemailer:');
    console.error(error);
    console.log('\n⚠️  POSIBLES SOLUCIONES:');
    console.log('1. Verifica que la contraseña de aplicación sea correcta');
    console.log('2. Asegúrate de que la verificación en 2 pasos esté activada');
    console.log('3. Genera una nueva contraseña de aplicación en: https://myaccount.google.com/apppasswords');
  } else {
    console.log('✅ Nodemailer configurado correctamente y listo para enviar emails\n');
    
    // Enviar email de prueba
    console.log('📤 Enviando email de prueba...\n');
    
    const mailOptions = {
      from: `"La Vieja Estación Resto-Bar" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_RESTOBAR,
      subject: '🧪 Test de Configuración de Email',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #667eea;">✅ Configuración Exitosa</h1>
          <p>Este es un email de prueba para verificar que la configuración de Nodemailer funciona correctamente.</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Detalles de la configuración:</h3>
            <ul>
              <li><strong>Servicio:</strong> Gmail</li>
              <li><strong>Usuario:</strong> ${process.env.EMAIL_USER}</li>
              <li><strong>Remitente:</strong> ${process.env.EMAIL_FROM}</li>
              <li><strong>Destinatario:</strong> ${process.env.EMAIL_RESTOBAR}</li>
            </ul>
          </div>
          <p>Si recibes este correo, significa que el sistema de emails está funcionando correctamente. 🎉</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #dee2e6;">
          <p style="color: #6c757d; font-size: 14px;">
            <strong>La Vieja Estación Resto-Bar</strong><br>
            Sistema de Gestión de Reservas
          </p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Error al enviar email de prueba:');
        console.error(error);
      } else {
        console.log('✅ Email de prueba enviado exitosamente!');
        console.log('📬 Message ID:', info.messageId);
        console.log('\n🎉 ¡Revisa la bandeja de entrada de:', process.env.EMAIL_RESTOBAR);
      }
      process.exit(0);
    });
  }
});
