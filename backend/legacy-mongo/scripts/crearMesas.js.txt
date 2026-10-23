/**
 * Script para crear mesas iniciales
 */

import mongoose from 'mongoose';
import Mesa from '../src/models/mesaSchema.js';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Falta MONGODB_URI. Configura backend/.env con la URI de MongoDB Atlas (restobar_db).');
}

async function crearMesas() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Verificar mesas existentes
    const count = await Mesa.countDocuments();
    console.log(`📊 Mesas existentes: ${count}`);

    if (count > 0) {
      console.log('⚠️ Ya hay mesas. Se eliminarán y crearán nuevas...');
      await Mesa.deleteMany({});
    }

    // Crear mesas
    const mesas = [
      { numero: 1, capacidad: 2, ubicacion: 'Ventana', estado: 'Libre' },
      { numero: 2, capacidad: 2, ubicacion: 'Interior', estado: 'Libre' },
      { numero: 3, capacidad: 4, ubicacion: 'Centro', estado: 'Libre' },
      { numero: 4, capacidad: 4, ubicacion: 'Terraza', estado: 'Libre' },
      { numero: 5, capacidad: 4, ubicacion: 'Interior', estado: 'Libre' },
      { numero: 6, capacidad: 6, ubicacion: 'Salón Principal', estado: 'Libre' },
      { numero: 7, capacidad: 6, ubicacion: 'Terraza', estado: 'Libre' },
      { numero: 8, capacidad: 8, ubicacion: 'Salón VIP', estado: 'Libre' },
      { numero: 9, capacidad: 8, ubicacion: 'Salón Principal', estado: 'Libre' },
      { numero: 10, capacidad: 10, ubicacion: 'Salón VIP', estado: 'Libre' }
    ];

    const resultado = await Mesa.insertMany(mesas);
    console.log(`✅ ${resultado.length} mesas creadas:`);
    resultado.forEach(m => console.log(`   Mesa ${m.numero} - Cap: ${m.capacidad} - ${m.ubicacion}`));

    await mongoose.disconnect();
    console.log('✅ Proceso completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

crearMesas();
