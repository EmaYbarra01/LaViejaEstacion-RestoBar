import mongoose from 'mongoose';
import Producto from '../src/models/productoSchema.js';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Falta MONGODB_URI. Configura backend/.env con la URI de MongoDB Atlas (restobar_db).');
}

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Conectado a MongoDB\n');
    
    const productos = await Producto.find({}, 'nombre categoria disponible stock');
    
    console.log(`Total de productos: ${productos.length}\n`);
    
    // Agrupar por categoría
    const porCategoria = {};
    productos.forEach(p => {
      const cat = p.categoria || 'Sin categoría';
      if (!porCategoria[cat]) {
        porCategoria[cat] = [];
      }
      porCategoria[cat].push(p);
    });
    
    // Mostrar por categoría
    Object.entries(porCategoria).forEach(([cat, prods]) => {
      console.log(`📦 ${cat} (${prods.length}):`);
      prods.forEach(p => {
        const disp = p.disponible && p.stock > 0 ? '✓' : '✗';
        console.log(`  ${disp} ${p.nombre} (stock: ${p.stock || 0})`);
      });
      console.log('');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
