import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Usuario from '../src/models/usuarioSchema.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Falta MONGODB_URI. Configura backend/.env con la URI de MongoDB Atlas (restobar_db).');
}

async function verificarUsuario() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a la base de datos');

    const usuario = await Usuario.findOne({ email: 'maria@restobar.com' });
    
    if (!usuario) {
      console.log('❌ Usuario NO encontrado');
      process.exit(0);
    }

    console.log('\n📋 Usuario encontrado:');
    console.log('Email:', usuario.email);
    console.log('Nombre:', usuario.nombre);
    console.log('Apellido:', usuario.apellido);
    console.log('Rol:', usuario.rol);
    console.log('Activo:', usuario.activo);
    console.log('Password hash:', usuario.password.substring(0, 30) + '...');

    // Probar comparación con MOZ123
    const passwordValido = await usuario.compararPassword('MOZ123');
    console.log('\n🔐 ¿Password "MOZ123" es válido?:', passwordValido);

    await mongoose.connection.close();
    console.log('\n✅ Conexión cerrada');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verificarUsuario();
