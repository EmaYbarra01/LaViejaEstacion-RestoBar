/**
 * Script para listar reservas pendientes de confirmación
 */

import mongoose from 'mongoose';
import Reserva from './src/models/reservaSchema.js';
import dotenv from 'dotenv';

dotenv.config();

const listarReservasPendientes = async () => {
  try {
    // Conectar a MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restobar_db';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar reservas pendientes
    const reservasPendientes = await Reserva.find({ estado: 'Pendiente' }).sort({ fecha: 1, hora: 1 });

    if (reservasPendientes.length === 0) {
      console.log('✨ No hay reservas pendientes de confirmación\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log(`📋 RESERVAS PENDIENTES (${reservasPendientes.length}):\n`);
    console.log('═══════════════════════════════════════════════════════════════════════\n');

    reservasPendientes.forEach((reserva, index) => {
      console.log(`${index + 1}. ID: ${reserva._id}`);
      console.log(`   Cliente:    ${reserva.cliente}`);
      console.log(`   Email:      ${reserva.email}`);
      console.log(`   Teléfono:   ${reserva.telefono}`);
      console.log(`   Fecha:      ${new Date(reserva.fecha).toLocaleDateString('es-AR')}`);
      console.log(`   Hora:       ${reserva.hora}`);
      console.log(`   Comensales: ${reserva.comensales} personas`);
      if (reserva.numeroMesa) {
        console.log(`   Mesa:       ${reserva.numeroMesa}`);
      }
      if (reserva.comentarios) {
        console.log(`   Comentarios: ${reserva.comentarios}`);
      }
      console.log(`   Creada:     ${new Date(reserva.createdAt).toLocaleString('es-AR')}`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════════════════\n');
    console.log('💡 PARA CONFIRMAR UNA RESERVA:');
    console.log('   node confirmar-reserva.js <ID_RESERVA>');
    console.log('\n📝 EJEMPLO:');
    console.log(`   node confirmar-reserva.js ${reservasPendientes[0]._id}\n`);

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

listarReservasPendientes();
