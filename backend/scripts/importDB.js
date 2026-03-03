/**
 * Script de Importación de Base de Datos
 * Importa los archivos JSON de la base de datos compartida
 */

import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restobar_db';
const DB_FOLDER = 'C:\\Users\\crist\\Downloads\\restobar_db\\restobar_db';

// Mapeo de archivos a colecciones
const collections = [
    { file: 'restobar_db.cierrecajas.json', collection: 'cierrecajas' },
    { file: 'restobar_db.compras.json', collection: 'compras' },
    { file: 'restobar_db.mesas.json', collection: 'mesas' },
    { file: 'restobar_db.passwordresets.json', collection: 'passwordresets' },
    { file: 'restobar_db.pedidos.json', collection: 'pedidos' },
    { file: 'restobar_db.productos.json', collection: 'productos' },
    { file: 'restobar_db.reservas.json', collection: 'reservas' },
    { file: 'restobar_db.sales.json', collection: 'sales' },
    { file: 'restobar_db.usuarios.json', collection: 'usuarios' }
];

// Función para convertir objetos MongoDB extendidos a formato estándar
function convertExtendedJSON(obj) {
    if (obj === null || obj === undefined) return obj;
    
    if (Array.isArray(obj)) {
        return obj.map(item => convertExtendedJSON(item));
    }
    
    if (typeof obj === 'object') {
        // Convertir ObjectId
        if (obj.$oid) {
            return new mongoose.Types.ObjectId(obj.$oid);
        }
        
        // Convertir Date
        if (obj.$date) {
            if (typeof obj.$date === 'object' && obj.$date.$numberLong) {
                return new Date(parseInt(obj.$date.$numberLong));
            }
            return new Date(obj.$date);
        }
        
        // Convertir NumberLong
        if (obj.$numberLong) {
            return parseInt(obj.$numberLong);
        }
        
        // Convertir NumberInt
        if (obj.$numberInt) {
            return parseInt(obj.$numberInt);
        }
        
        // Convertir NumberDouble
        if (obj.$numberDouble) {
            return parseFloat(obj.$numberDouble);
        }
        
        // Procesar recursivamente otros objetos
        const converted = {};
        for (const key in obj) {
            converted[key] = convertExtendedJSON(obj[key]);
        }
        return converted;
    }
    
    return obj;
}

async function importCollection(collectionName, filePath) {
    try {
        console.log(`📥 Importando ${collectionName}...`);
        
        // Leer archivo JSON
        const fileContent = await fs.readFile(filePath, 'utf-8');
        let documents = JSON.parse(fileContent);
        
        if (!Array.isArray(documents) || documents.length === 0) {
            console.log(`   ⚠️  ${collectionName}: Sin documentos para importar`);
            return 0;
        }
        
        // Convertir formato extendido de MongoDB
        documents = documents.map(doc => convertExtendedJSON(doc));
        
        // Eliminar colección existente
        const collection = mongoose.connection.collection(collectionName);
        await collection.drop().catch(() => {
            // Ignorar error si la colección no existe
        });
        
        // Insertar documentos
        const result = await collection.insertMany(documents);
        console.log(`   ✅ ${collectionName}: ${result.insertedCount} documentos importados`);
        
        return result.insertedCount;
    } catch (error) {
        console.error(`   ❌ Error importando ${collectionName}:`, error.message);
        return 0;
    }
}

async function importDatabase() {
    let totalImported = 0;
    
    try {
        console.log('🔄 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');
        
        console.log('📦 Iniciando importación de base de datos...\n');
        
        for (const { file, collection } of collections) {
            const filePath = path.join(DB_FOLDER, file);
            
            try {
                await fs.access(filePath);
                const count = await importCollection(collection, filePath);
                totalImported += count;
            } catch (error) {
                console.log(`   ⚠️  Archivo no encontrado: ${file}`);
            }
        }
        
        console.log('\n✨ ¡Importación completada!');
        console.log(`📊 Total de documentos importados: ${totalImported}`);
        
        // Mostrar resumen de colecciones
        console.log('\n📋 Resumen de colecciones:');
        for (const { collection } of collections) {
            try {
                const count = await mongoose.connection.collection(collection).countDocuments();
                if (count > 0) {
                    console.log(`   - ${collection}: ${count} documentos`);
                }
            } catch (error) {
                // Colección no existe
            }
        }
        
    } catch (error) {
        console.error('❌ Error durante la importación:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexión cerrada');
    }
}

// Ejecutar el script
importDatabase()
    .then(() => {
        console.log('\n✅ Script completado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error fatal:', error);
        process.exit(1);
    });
