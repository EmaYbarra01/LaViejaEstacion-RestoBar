import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔐 Intentando autenticación con Gmail...\n');
console.log('Usuario:', process.env.EMAIL_USER);
console.log('Contraseña:', process.env.EMAIL_PASS ? `${process.env.EMAIL_PASS.substring(0, 4)}...${process.env.EMAIL_PASS.substring(12)}` : 'NO CONFIGURADA');
console.log('Longitud de contraseña:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
console.log('\n⚠️  La contraseña de aplicación de Google debe tener exactamente 16 caracteres (sin espacios)\n');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  debug: true, // Activar modo debug para ver más detalles
  logger: true
});

console.log('📡 Conectando a Gmail...\n');

transporter.verify(function(error, success) {
  if (error) {
    console.log('\n❌ ERROR DE AUTENTICACIÓN:\n');
    console.error(error);
    console.log('\n📋 PASOS PARA SOLUCIONAR:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Ve a: https://myaccount.google.com/apppasswords');
    console.log('2. Inicia sesión con: laviejaestacionbar@gmail.com');
    console.log('3. Si no aparece "Contraseñas de aplicaciones":');
    console.log('   - Ve a Seguridad → Verificación en 2 pasos');
    console.log('   - Activa la verificación en 2 pasos si no está activada');
    console.log('   - Regresa a Contraseñas de aplicaciones');
    console.log('4. Selecciona:');
    console.log('   - Aplicación: "Correo"');
    console.log('   - Dispositivo: "Otro (nombre personalizado)"');
    console.log('   - Escribe: "La Vieja Estación"');
    console.log('5. Copia la contraseña de 16 caracteres (SIN ESPACIOS)');
    console.log('6. Pégala en el archivo .env en EMAIL_PASS=');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } else {
    console.log('\n✅ ¡ÉXITO! Conexión establecida con Gmail');
    console.log('📧 El servidor está listo para enviar emails\n');
    process.exit(0);
  }
  process.exit(1);
});
