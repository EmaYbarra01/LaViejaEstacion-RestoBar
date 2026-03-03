/**
 * Script para verificar y crear la colección cierrecajas
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CierreCaja from '../src/models/cierreCajaSchema.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restobar_db';

async function verificarColeccion() {
    try {
        console.log('🔄 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');

        // Listar todas las colecciones
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📋 Colecciones actuales en la base de datos:');
        collections.forEach(col => {
            console.log(`   - ${col.name}`);
        });

        // Verificar si existe cierrecajas
        const existeCierrecajas = collections.some(col => col.name === 'cierrecajas');
        
        if (!existeCierrecajas) {
            console.log('\n⚠️  La colección "cierrecajas" no existe');
            console.log('🔨 Creando colección "cierrecajas"...');
            
            // Crear la colección explícitamente
            await mongoose.connection.db.createCollection('cierrecajas');
            console.log('✅ Colección "cierrecajas" creada exitosamente');
        } else {
            console.log('\n✅ La colección "cierrecajas" ya existe');
        }

        // Contar documentos
        const count = await CierreCaja.countDocuments();
        console.log(`📊 Documentos en cierrecajas: ${count}`);

        // Mostrar índices
        const indexes = await CierreCaja.collection.getIndexes();
        console.log('\n🔍 Índices de la colección:');
        Object.keys(indexes).forEach(key => {
            console.log(`   - ${key}: ${JSON.stringify(indexes[key])}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexión cerrada');
    }
}

verificarColeccion()
    .then(() => {
        console.log('\n✅ Verificación completada');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error fatal:', error);
        process.exit(1);
    });
