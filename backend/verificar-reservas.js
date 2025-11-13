/**
 * Script para verificar reservas en MongoDB
 * Ejecutar: node verificar-reservas.js
 */

import mongoose from 'mongoose';
import 'dotenv/config';

// Conectar a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restobar_db';

console.log('🔍 Conectando a MongoDB...');

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Conectado a MongoDB\n');
    
    // Importar el modelo de Reserva
    const Reserva = mongoose.model('Reserva', new mongoose.Schema({}, { strict: false }));
    
    // Obtener todas las reservas
    const reservas = await Reserva.find().sort({ createdAt: -1 });
    
    if (reservas.length === 0) {
      console.log('❌ No hay reservas en la base de datos');
    } else {
      console.log(`📊 Total de reservas: ${reservas.length}\n`);
      console.log('═'.repeat(80));
      
      reservas.forEach((reserva, index) => {
        console.log(`\n🎫 RESERVA #${index + 1}`);
        console.log('─'.repeat(80));
        console.log(`   ID:         ${reserva._id}`);
        console.log(`   Cliente:    ${reserva.cliente}`);
        console.log(`   Email:      ${reserva.email}`);
        console.log(`   Teléfono:   ${reserva.telefono}`);
        console.log(`   Fecha:      ${new Date(reserva.fecha).toLocaleDateString('es-AR')}`);
        console.log(`   Hora:       ${reserva.hora}`);
        console.log(`   Comensales: ${reserva.comensales} personas`);
        console.log(`   Mesa:       ${reserva.numeroMesa || 'Sin asignar'}`);
        console.log(`   Estado:     ${reserva.estado}`);
        console.log(`   Comentarios: ${reserva.comentarios || 'Ninguno'}`);
        console.log(`   Creada:     ${new Date(reserva.createdAt).toLocaleString('es-AR')}`);
        console.log('─'.repeat(80));
      });
      
      // Estadísticas
      console.log('\n📈 ESTADÍSTICAS:');
      console.log('═'.repeat(80));
      const pendientes = reservas.filter(r => r.estado === 'Pendiente').length;
      const confirmadas = reservas.filter(r => r.estado === 'Confirmada').length;
      const canceladas = reservas.filter(r => r.estado === 'Cancelada').length;
      const completadas = reservas.filter(r => r.estado === 'Completada').length;
      
      console.log(`   ⏳ Pendientes:  ${pendientes}`);
      console.log(`   ✅ Confirmadas: ${confirmadas}`);
      console.log(`   ❌ Canceladas:  ${canceladas}`);
      console.log(`   🎉 Completadas: ${completadas}`);
      console.log('═'.repeat(80));
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Conexión cerrada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
