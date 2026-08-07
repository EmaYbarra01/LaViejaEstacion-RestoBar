import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Definir el esquema de Producto (simplificado)
const productoSchema = new mongoose.Schema({
    nombre: String,
    imagenUrl: String,
    precio: Number,
    categoria: String,
    descripcion: String,
    disponible: Boolean,
    stock: Number
});

const Producto = mongoose.model('Producto', productoSchema);

// Mapeo de nombres de productos a nombres de archivos de imágenes
const imagenesDisponibles = {
    'Agua Mineral 500ml': 'agua mineral 500ml.jpg',
    'Cerveza Quilmes 1L': 'cerveza quilmes 1L.jpg',
    'Coca Cola 500ml': 'coca cola 500.jpg',
    'Empanadas de Carne': 'empanadas de carne.jpeg',
    'Ensalada César': 'ensalada cesar.jpg',
    'Flan con Dulce de Leche': 'flan con dulce de leche.jpg',
    'Hamburguesa Completa': 'hamburguesa completa.jpg',
    'Helado 3 Bochas': 'helado 3 bochas.jpg',
    'Milanesa Napolitana': 'milanesa napolitana.jpg',
    'Pizza Muzzarella': 'pizza muzzarella.jpg',
    'Vino Blanco Copa': 'vino blanco copa.jpg',
    'Vino Tinto Copa': 'vino tinto copa.jpg'
};

async function actualizarImagenes() {
    try {
        console.log('🔌 Conectando a MongoDB...');
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI no está definido en las variables de entorno');
        }
        await mongoose.connect(mongoUri);
        console.log('✅ Conectado a MongoDB');

        console.log('\n📸 Actualizando imágenes de productos...');
        
        let actualizados = 0;
        let noEncontrados = [];

        for (const [nombreProducto, nombreArchivo] of Object.entries(imagenesDisponibles)) {
            const imagenUrl = `/images/productos/${nombreArchivo}`;
            
            const resultado = await Producto.updateOne(
                { nombre: { $regex: new RegExp(nombreProducto, 'i') } },
                { $set: { imagenUrl: imagenUrl } }
            );

            if (resultado.modifiedCount > 0) {
                console.log(`✅ ${nombreProducto} -> ${imagenUrl}`);
                actualizados++;
            } else {
                noEncontrados.push(nombreProducto);
            }
        }

        console.log(`\n📊 Resumen:`);
        console.log(`   ✅ Productos actualizados: ${actualizados}`);
        
        if (noEncontrados.length > 0) {
            console.log(`   ⚠️  Productos no encontrados en BD: ${noEncontrados.length}`);
            noEncontrados.forEach(p => console.log(`      - ${p}`));
        }

        // Listar productos sin imagen
        const sinImagen = await Producto.find({ 
            $or: [
                { imagenUrl: { $exists: false } },
                { imagenUrl: null },
                { imagenUrl: '' }
            ]
        }).select('nombre categoria');

        if (sinImagen.length > 0) {
            console.log(`\n⚠️  Productos sin imagen (${sinImagen.length}):`);
            sinImagen.forEach(p => {
                console.log(`   - ${p.nombre} (${p.categoria})`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexión cerrada');
    }
}

// Ejecutar
actualizarImagenes();
