import mongoose from 'mongoose';
import Producto from '../src/models/productoSchema.js';

mongoose.connect('mongodb://localhost:27017/restobar_db')
  .then(async () => {
    console.log('✅ Conectado a MongoDB\n');
    
    // Actualizar stock de todos los productos
    const updates = [
      // Postres
      { nombre: 'Flan con Dulce de Leche', stock: 25, disponible: true },
      { nombre: 'Helado (3 bochas)', stock: 30, disponible: true },
      
      // Comidas sin stock
      { nombre: 'Milanesa Napolitana', stock: 15, disponible: true },
      { nombre: 'Pizza Muzzarella', stock: 20, disponible: true },
      { nombre: 'Empanadas de Carne (docena)', stock: 40, disponible: true },
      { nombre: 'Ensalada Caesar', stock: 18, disponible: true },
    ];
    
    console.log('📝 Actualizando stock de productos...\n');
    
    for (const update of updates) {
      const result = await Producto.updateOne(
        { nombre: update.nombre },
        { 
          $set: { 
            stock: update.stock,
            disponible: update.disponible 
          } 
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✓ ${update.nombre}: stock actualizado a ${update.stock}`);
      } else {
        console.log(`✗ ${update.nombre}: no se encontró o no se actualizó`);
      }
    }
    
    console.log('\n✅ Stock actualizado correctamente');
    
    // Mostrar resumen
    console.log('\n📊 Resumen de productos:');
    const productos = await Producto.find({}, 'nombre categoria stock disponible');
    
    const porCategoria = {};
    productos.forEach(p => {
      const cat = p.categoria || 'Sin categoría';
      if (!porCategoria[cat]) {
        porCategoria[cat] = [];
      }
      porCategoria[cat].push(p);
    });
    
    Object.entries(porCategoria).forEach(([cat, prods]) => {
      console.log(`\n📦 ${cat} (${prods.length}):`);
      prods.forEach(p => {
        const disp = p.disponible && p.stock > 0 ? '✓' : '✗';
        console.log(`  ${disp} ${p.nombre} (stock: ${p.stock || 0})`);
      });
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
