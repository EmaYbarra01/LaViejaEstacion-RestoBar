import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Falta MONGODB_URI. Configura backend/.env con la URI de MongoDB Atlas (restobar_db).');
}

const productoSchema = new mongoose.Schema({
  nombre: String,
  precio: Number,
  categoria: String,
  descripcion: String,
  imagenUrl: String,
  stock: Number,
  disponible: Boolean
}, { collection: 'productos' });

const Producto = mongoose.model('Producto', productoSchema);

const verificarDuplicados = async () => {
  try {
    console.log('Conectando a MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a la base de datos\n');

    // Buscar todos los productos
    const productos = await Producto.find({});
    console.log(`📊 Total de productos: ${productos.length}\n`);

    // Buscar duplicados por nombre
    const nombreContador = {};
    const duplicados = [];

    productos.forEach(producto => {
      const nombre = producto.nombre.toLowerCase().trim();
      if (!nombreContador[nombre]) {
        nombreContador[nombre] = [];
      }
      nombreContador[nombre].push(producto);
    });

    // Mostrar duplicados
    console.log('🔍 Buscando duplicados...\n');
    
    for (const [nombre, lista] of Object.entries(nombreContador)) {
      if (lista.length > 1) {
        duplicados.push({ nombre, productos: lista });
        console.log(`⚠️  DUPLICADO ENCONTRADO: "${nombre}"`);
        console.log(`   Cantidad de repeticiones: ${lista.length}\n`);
        
        lista.forEach((prod, index) => {
          console.log(`   ${index + 1}. ID: ${prod._id}`);
          console.log(`      Nombre: ${prod.nombre}`);
          console.log(`      Precio: $${prod.precio}`);
          console.log(`      Categoría: ${prod.categoria}`);
          console.log(`      Stock: ${prod.stock}`);
          console.log(`      Disponible: ${prod.disponible}`);
          console.log('');
        });
      }
    }

    if (duplicados.length === 0) {
      console.log('✅ No se encontraron productos duplicados\n');
    } else {
      console.log(`\n❌ Se encontraron ${duplicados.length} producto(s) duplicado(s)\n`);
      
      // Preguntar si desea eliminar duplicados
      console.log('💡 Para eliminar los duplicados, puedes:');
      console.log('   1. Eliminarlos manualmente desde el panel de administración');
      console.log('   2. Ejecutar un script de limpieza (mantener solo el más reciente)\n');
    }

    await mongoose.disconnect();
    console.log('Desconectado de la base de datos');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
};

verificarDuplicados();
