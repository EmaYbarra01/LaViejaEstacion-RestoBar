/**
 * Script para crear mesas iniciales en la base de datos
 * Ejecutar con: node crear-mesas.js
 */

import mongoose from 'mongoose';
import Mesa from './src/models/mesaSchema.js';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Falta MONGODB_URI. Configura backend/.env con la URI de MongoDB Atlas (restobar_db).');
}

async function crearMesas() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existen mesas
    const mesasExistentes = await Mesa.countDocuments();
    
    if (mesasExistentes > 0) {
      console.log(`ℹ️ Ya existen ${mesasExistentes} mesas en la base de datos.`);
      const respuesta = await new Promise((resolve) => {
        process.stdout.write('¿Deseas eliminarlas y crear nuevas? (s/n): ');
        process.stdin.once('data', (data) => {
          resolve(data.toString().trim().toLowerCase());
        });
      });

      if (respuesta === 's' || respuesta === 'si') {
        await Mesa.deleteMany({});
        console.log('🗑️ Mesas anteriores eliminadas');
      } else {
        console.log('❌ Operación cancelada');
        process.exit(0);
      }
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

    const mesasCreadas = await Mesa.insertMany(mesas);
    
    console.log(`✅ ${mesasCreadas.length} mesas creadas exitosamente:`);
    mesasCreadas.forEach(mesa => {
      console.log(`   📍 Mesa ${mesa.numero} - Capacidad: ${mesa.capacidad} - ${mesa.ubicacion}`);
    });

    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

crearMesas();
