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

const eliminarDuplicado = async () => {
  try {
    console.log('Conectando a MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a la base de datos\n');

    // Buscar todos los "Sandwich Pio"
    const sandwichPios = await Producto.find({ 
      nombre: { $regex: /^Sandwich Pio$/i } 
    }).sort({ _id: 1 }); // Ordenar por ID (el más antiguo primero)

    console.log(`📊 Se encontraron ${sandwichPios.length} productos "Sandwich Pio"\n`);

    if (sandwichPios.length > 1) {
      // Mantener el primero (más antiguo) y eliminar el resto
      const aMantener = sandwichPios[0];
      const aEliminar = sandwichPios.slice(1);

      console.log('✅ Se mantendrá:');
      console.log(`   ID: ${aMantener._id}`);
      console.log(`   Nombre: ${aMantener.nombre}`);
      console.log(`   Precio: $${aMantener.precio}`);
      console.log('');

      console.log('❌ Se eliminará(n):');
      for (const prod of aEliminar) {
        console.log(`   ID: ${prod._id}`);
        console.log(`   Nombre: ${prod.nombre}`);
        console.log(`   Precio: $${prod.precio}`);
        
        // Eliminar el duplicado
        await Producto.deleteOne({ _id: prod._id });
        console.log('   ✓ Eliminado\n');
      }

      console.log(`\n🎉 Duplicados eliminados exitosamente!`);
      console.log(`Se mantiene 1 "Sandwich Pio" y se eliminaron ${aEliminar.length} duplicado(s)\n`);
    } else {
      console.log('✅ No hay duplicados que eliminar\n');
    }

    // Verificar que solo quede uno
    const verificacion = await Producto.find({ 
      nombre: { $regex: /^Sandwich Pio$/i } 
    });
    
    console.log(`📊 Verificación final: ${verificacion.length} "Sandwich Pio" en la base de datos`);

    await mongoose.disconnect();
    console.log('\nDesconectado de la base de datos');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
};

eliminarDuplicado();
