/**
 * Script de Prueba - Sistema de Emails
 * Prueba el envío de emails de confirmación de reserva
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { enviarEmailConfirmacion, enviarEmailCancelacion } from './src/helpers/emailHelper.js';

// Cargar variables de entorno
dotenv.config();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 PRUEBA DEL SISTEMA DE EMAILS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Verificar configuración
console.log('📋 Configuración actual:');
console.log('  EMAIL_SERVICE:', process.env.EMAIL_SERVICE || '❌ NO CONFIGURADO');
console.log('  EMAIL_USER:   ', process.env.EMAIL_USER || '❌ NO CONFIGURADO');
console.log('  EMAIL_PASS:   ', process.env.EMAIL_PASS ? '✅ Configurado' : '❌ NO CONFIGURADO');
console.log('  EMAIL_FROM:   ', process.env.EMAIL_FROM || '❌ NO CONFIGURADO');
console.log('');

if (!process.env.EMAIL_SERVICE || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ ERROR: Falta configuración de email en .env');
  console.error('');
  console.error('Por favor, edita backend/.env y agrega:');
  console.error('  EMAIL_SERVICE=gmail');
  console.error('  EMAIL_USER=tu-email@gmail.com');
  console.error('  EMAIL_PASS=tu-contraseña-de-aplicacion');
  console.error('  EMAIL_FROM=La Vieja Estación <tu-email@gmail.com>');
  console.error('');
  console.error('Para Gmail, necesitas generar una contraseña de aplicación:');
  console.error('  https://myaccount.google.com/security');
  console.error('');
  process.exit(1);
}

// Datos de reserva de prueba
const reservaPrueba = {
  _id: 'test-' + Date.now(),
  cliente: 'Usuario de Prueba',
  email: process.env.EMAIL_USER, // Envía a tu mismo email
  telefono: '3874123456',
  fecha: new Date('2025-11-20'),
  hora: '20:30',
  comensales: 4,
  numeroMesa: 5,
  comentarios: 'Este es un email de prueba del sistema',
  estado: 'Pendiente'
};

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📧 Datos de la reserva de prueba:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  Cliente:    ', reservaPrueba.cliente);
console.log('  Email:      ', reservaPrueba.email);
console.log('  Teléfono:   ', reservaPrueba.telefono);
console.log('  Fecha:      ', reservaPrueba.fecha.toLocaleDateString('es-AR'));
console.log('  Hora:       ', reservaPrueba.hora);
console.log('  Comensales: ', reservaPrueba.comensales);
console.log('  Mesa:       ', reservaPrueba.numeroMesa);
console.log('  Estado:     ', reservaPrueba.estado);
console.log('');

// Función para probar email de confirmación
async function probarEmailConfirmacion() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📤 Enviando email de confirmación...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const resultado = await enviarEmailConfirmacion(reservaPrueba);

    if (resultado.success) {
      console.log('✅ EMAIL ENVIADO EXITOSAMENTE!');
      console.log('');
      console.log('  Message ID:', resultado.messageId);
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✉️  REVISA TU BANDEJA DE ENTRADA');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('  📧 Email enviado a:', reservaPrueba.email);
      console.log('  📥 Revisa también la carpeta de SPAM');
      console.log('  🎨 Deberías ver un email con diseño profesional');
      console.log('  📅 Con todos los detalles de la reserva');
      console.log('');
      
      return true;
    } else {
      console.error('❌ ERROR AL ENVIAR EMAIL');
      console.error('');
      console.error('  Mensaje:', resultado.mensaje);
      console.error('  Error:', resultado.error);
      console.error('');
      
      return false;
    }

  } catch (error) {
    console.error('❌ EXCEPCIÓN AL ENVIAR EMAIL');
    console.error('');
    console.error('  Error:', error.message);
    console.error('');
    
    if (error.code === 'EAUTH') {
      console.error('💡 SOLUCIÓN:');
      console.error('  - Verifica EMAIL_USER y EMAIL_PASS en .env');
      console.error('  - Si usas Gmail, necesitas una contraseña de aplicación');
      console.error('  - Ve a: https://myaccount.google.com/security');
      console.error('');
    } else if (error.code === 'ESOCKET') {
      console.error('💡 SOLUCIÓN:');
      console.error('  - Verifica tu conexión a internet');
      console.error('  - Verifica EMAIL_HOST y EMAIL_PORT en .env');
      console.error('');
    }
    
    return false;
  }
}

// Función para probar email de cancelación
async function probarEmailCancelacion() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📤 Enviando email de cancelación...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const reservaCancelada = {
    ...reservaPrueba,
    estado: 'Cancelada'
  };

  try {
    const resultado = await enviarEmailCancelacion(reservaCancelada);

    if (resultado.success) {
      console.log('✅ EMAIL DE CANCELACIÓN ENVIADO!');
      console.log('');
      console.log('  Message ID:', resultado.messageId);
      console.log('');
      console.log('  📧 Email enviado a:', reservaCancelada.email);
      console.log('  📥 Revisa tu bandeja de entrada');
      console.log('');
      
      return true;
    } else {
      console.error('❌ ERROR AL ENVIAR EMAIL DE CANCELACIÓN');
      console.error('');
      console.error('  Mensaje:', resultado.mensaje);
      console.error('');
      
      return false;
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return false;
  }
}

// Menú de opciones
async function menu() {
  const args = process.argv.slice(2);
  const opcion = args[0];

  if (opcion === 'confirmacion' || opcion === '1') {
    await probarEmailConfirmacion();
  } else if (opcion === 'cancelacion' || opcion === '2') {
    await probarEmailCancelacion();
  } else if (opcion === 'ambos' || opcion === '3') {
    const exito1 = await probarEmailConfirmacion();
    
    if (exito1) {
      console.log('⏳ Esperando 3 segundos antes del siguiente email...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
      await probarEmailCancelacion();
    }
  } else {
    // Sin argumentos, mostrar menú
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 OPCIONES DE PRUEBA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('  node test-email.js confirmacion  (o 1)');
    console.log('    → Envía email de confirmación de reserva');
    console.log('');
    console.log('  node test-email.js cancelacion   (o 2)');
    console.log('    → Envía email de cancelación');
    console.log('');
    console.log('  node test-email.js ambos         (o 3)');
    console.log('    → Envía ambos emails');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('💡 Ejemplo:');
    console.log('  node test-email.js confirmacion');
    console.log('');
    
    process.exit(0);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ PRUEBA COMPLETADA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  process.exit(0);
}

// Ejecutar menú
menu().catch(error => {
  console.error('Error inesperado:', error);
  process.exit(1);
});
