/**
 * Script temporal para actualizar la contraseña del SuperAdministrador
 * Ejecutar con: node actualizar-password-admin.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restobar_db';

async function actualizarPassword() {
    try {
        // Conectar a la base de datos
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        // Obtener el modelo de Usuario
        const Usuario = mongoose.model('Usuario', new mongoose.Schema({
            nombre: String,
            email: String,
            password: String,
            rol: String
        }));

        // Buscar tu SuperAdministrador (ajusta el email si es diferente)
        const email = 'juan@restobar.com'; // Email del SuperAdministrador
        const nuevaPassword = 'admin123'; // CAMBIA ESTO por tu contraseña

        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            console.log('❌ Usuario no encontrado con email:', email);
            console.log('📝 Lista de usuarios:');
            const usuarios = await Usuario.find({}, 'nombre email rol');
            usuarios.forEach(u => {
                console.log(`  - ${u.nombre} (${u.email}) - Rol: ${u.rol}`);
            });
            process.exit(1);
        }

        // Hashear la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHasheada = await bcrypt.hash(nuevaPassword, salt);

        // Actualizar directamente sin pasar por el middleware
        await Usuario.updateOne(
            { _id: usuario._id },
            { $set: { password: passwordHasheada } }
        );

        console.log('✅ Contraseña actualizada correctamente');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Nueva contraseña: ${nuevaPassword}`);
        console.log(`👤 Rol: ${usuario.rol}`);

        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

actualizarPassword();
