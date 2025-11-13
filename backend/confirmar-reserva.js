/**
 * Script para confirmar reservas pendientes
 * Uso: node confirmar-reserva.js <ID_RESERVA>
 */

import mongoose from 'mongoose';
import Reserva from './src/models/reservaSchema.js';
import { enviarEmailConfirmacion } from './src/helpers/emailHelper.js';
import dotenv from 'dotenv';

dotenv.config();

const confirmarReserva = async (reservaId) => {
  try {
    // Conectar a MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restobar_db';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Buscar la reserva
    const reserva = await Reserva.findById(reservaId);

    if (!reserva) {
      console.error('❌ Reserva no encontrada con ID:', reservaId);
      process.exit(1);
    }

    console.log('\n📋 DATOS DE LA RESERVA:');
    console.log('   Cliente:    ', reserva.cliente);
    console.log('   Email:      ', reserva.email);
    console.log('   Fecha:      ', reserva.fecha);
    console.log('   Hora:       ', reserva.hora);
    console.log('   Comensales: ', reserva.comensales);
    console.log('   Estado:     ', reserva.estado);

    if (reserva.estado === 'Confirmada') {
      console.log('\n⚠️  Esta reserva ya está confirmada');
      process.exit(0);
    }

    if (reserva.estado === 'Cancelada') {
      console.log('\n⚠️  Esta reserva está cancelada. No se puede confirmar.');
      process.exit(1);
    }

    // Cambiar estado a Confirmada
    reserva.estado = 'Confirmada';
    await reserva.save();

    console.log('\n✅ Reserva confirmada exitosamente');

    // Enviar email de confirmación actualizado
    console.log('\n📧 Enviando email de confirmación...');
    const resultado = await enviarEmailConfirmacion(reserva);

    if (resultado.success) {
      console.log('✅ Email enviado a:', reserva.email);
      console.log('   Message ID:', resultado.messageId);
    } else {
      console.log('⚠️  No se pudo enviar el email:', resultado.mensaje);
    }

    console.log('\n🎉 ¡Proceso completado!\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Obtener ID de los argumentos
const reservaId = process.argv[2];

if (!reservaId) {
  console.log('\n📝 USO DEL SCRIPT:');
  console.log('   node confirmar-reserva.js <ID_RESERVA>');
  console.log('\n💡 EJEMPLO:');
  console.log('   node confirmar-reserva.js 673123abc456def789012345');
  console.log('\n📌 Para ver las reservas pendientes, ejecuta:');
  console.log('   node verificar-reservas.js\n');
  process.exit(1);
}

confirmarReserva(reservaId);
