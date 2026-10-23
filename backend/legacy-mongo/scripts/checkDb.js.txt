import mongoose from 'mongoose';
import { MONGODB_URI } from '../src/config.js';

async function check() {
  try {
    console.log('Intentando conectar a:', MONGODB_URI);
    const conn = await mongoose.connect(MONGODB_URI, { autoIndex: false });
    console.log('✅ Conectado a MongoDB. Base de datos:', conn.connection.name);
    console.log('Estado (readyState):', mongoose.connection.readyState, '(1 = conectado)');
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message || error);
    process.exit(1);
  }
}

check();
