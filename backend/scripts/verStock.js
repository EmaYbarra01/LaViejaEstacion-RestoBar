import mongoose from 'mongoose';
import Producto from '../src/models/productoSchema.js';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Falta MONGODB_URI. Configura backend/.env con la URI de MongoDB Atlas (restobar_db).');
}

async function verStock() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    const productos = await Producto.find({}).select('nombre stock disponible categoria');
    
    console.log('\n=== STOCK DE PRODUCTOS ===\n');
    
    const categorias = ['Comidas', 'Bebidas', 'Bebidas Alcohólicas', 'Postres'];
    
    for (const categoria of categorias) {
      const prods = productos.filter(p => p.categoria === categoria);
      if (prods.length > 0) {
        console.log(`\n📦 ${categoria.toUpperCase()}`);
        prods.forEach(p => {
          const disponibleIcon = p.disponible ? '✅' : '❌';
          const stockColor = p.stock === 0 ? '⚠️' : p.stock < 10 ? '⚡' : '✔️';
          console.log(`  ${disponibleIcon} ${p.nombre.padEnd(30)} - Stock: ${stockColor} ${p.stock}`);
        });
      }
    }
    
    console.log('\n');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verStock();
