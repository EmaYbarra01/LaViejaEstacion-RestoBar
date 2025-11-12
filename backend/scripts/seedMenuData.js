/**
 * Script para poblar la base de datos con productos de ejemplo
 * HU1 - Escanear menú digital
 * 
 * Uso:
 * node scripts/seedMenuData.js
 */

import mongoose from 'mongoose';
import Producto from '../src/models/productoSchema.js';
import { MONGODB_URI } from '../src/config.js';

// Datos de ejemplo para el menú
const productosEjemplo = [
  // ===== COMIDAS =====
  {
    nombre: 'Hamburguesa Completa',
    descripcion: 'Carne de res premium, queso cheddar, lechuga fresca, tomate y mayonesa casera en pan artesanal.',
    categoria: 'Comidas',
    precio: 1200,
    costo: 600,
    stock: 50,
    stockMinimo: 10,
    disponible: true,
    imagenUrl: '/images/productos/hamburguesa completa.jpg',
    codigo: 'COM-001'
  },
  {
    nombre: 'Pizza Muzzarella',
    descripcion: 'Salsa de tomate casera, mozzarella de primera calidad y albahaca fresca.',
    categoria: 'Comidas',
    precio: 1500,
    costo: 700,
    stock: 30,
    stockMinimo: 5,
    disponible: true,
    imagenUrl: '/images/productos/pizza muzzarella.jpg',
    codigo: 'COM-002'
  },
  {
    nombre: 'Milanesa Napolitana',
    descripcion: 'Carne tierna empanada, salsa de tomate, jamón cocido y queso gratinado. Con guarnición.',
    categoria: 'Comidas',
    precio: 1700,
    costo: 850,
    stock: 40,
    stockMinimo: 8,
    disponible: true,
    imagenUrl: '/images/productos/milanesa napolitana.jpg',
    codigo: 'COM-003'
  },
  {
    nombre: 'Ensalada César',
    descripcion: 'Lechuga romana, crutones caseros, queso parmesano y nuestro aderezo César especial.',
    categoria: 'Comidas',
    precio: 900,
    costo: 400,
    stock: 35,
    stockMinimo: 10,
    disponible: true,
    imagenUrl: '/images/productos/ensalada cesar.jpg',
    codigo: 'COM-004'
  },
  {
    nombre: 'Empanadas Salteñas',
    descripcion: 'Carne cortada a cuchillo, cebolla, huevo, aceitunas y especias. Cocidas al horno.',
    categoria: 'Comidas',
    precio: 300,
    costo: 120,
    stock: 100,
    stockMinimo: 20,
    disponible: true,
    imagenUrl: '/images/productos/default.jpg',
    codigo: 'COM-005'
  },
  {
    nombre: 'Lomo Completo',
    descripcion: 'Lomo de primera, jamón, queso, huevo frito y vegetales frescos en pan casero.',
    categoria: 'Comidas',
    precio: 2000,
    costo: 1000,
    stock: 25,
    stockMinimo: 5,
    disponible: true,
    imagenUrl: '/images/productos/default.jpg',
    codigo: 'COM-006'
  },
  {
    nombre: 'Tarta de Verduras',
    descripcion: 'Masa casera crujiente rellena de espinaca, acelga, cebolla y ricota.',
    categoria: 'Comidas',
    precio: 800,
    costo: 350,
    stock: 20,
    stockMinimo: 5,
    disponible: true,
    imagenUrl: '/images/productos/default.jpg',
    codigo: 'COM-007'
  },
  {
    nombre: 'Pollo al Curry',
    descripcion: 'Suprema de pollo en salsa curry aromática, acompañado de arroz basmati.',
    categoria: 'Comidas',
    precio: 1600,
    costo: 750,
    stock: 30,
    stockMinimo: 8,
    disponible: true,
    imagenUrl: '/images/productos/pollo-curry.jpg',
    codigo: 'COM-008'
  },
  {
    nombre: 'Ravioles Caseros',
    descripcion: 'Ravioles de ricota y espinaca con salsa a elección: bolognesa, fileto o crema.',
    categoria: 'Comidas',
    precio: 1400,
    costo: 650,
    stock: 28,
    stockMinimo: 6,
    disponible: true,
    imagenUrl: '/images/productos/ravioles.jpg',
    codigo: 'COM-009'
  },
  {
    nombre: 'Bife de Chorizo',
    descripcion: 'Corte premium 350gr, punto a gusto del comensal. Con papas o ensalada.',
    categoria: 'Comidas',
    precio: 2500,
    costo: 1300,
    stock: 15,
    stockMinimo: 3,
    disponible: true,
    imagenUrl: '/images/productos/bife-chorizo.jpg',
    codigo: 'COM-010'
  },

  // ===== BEBIDAS =====
  {
    nombre: 'Cerveza Quilmes 1L',
    descripcion: 'Cerveza Quilmes Clásica. 1 litro.',
    categoria: 'Bebidas Alcohólicas',
    precio: 600,
    costo: 250,
    stock: 80,
    stockMinimo: 20,
    disponible: true,
    imagenUrl: '/images/productos/cerveza quilmes 1L.jpg',
    codigo: 'BEB-001'
  },
  {
    nombre: 'Vino Tinto Copa',
    descripcion: 'Copa de vino tinto Malbec de la región. Bodega seleccionada.',
    categoria: 'Bebidas Alcohólicas',
    precio: 900,
    costo: 400,
    stock: 45,
    stockMinimo: 10,
    disponible: true,
    imagenUrl: '/images/productos/vino tinto copa.jpg',
    codigo: 'BEB-002'
  },
  {
    nombre: 'Vino Blanco Copa',
    descripcion: 'Copa de vino blanco seleccionado de la región.',
    categoria: 'Bebidas Alcohólicas',
    precio: 850,
    costo: 380,
    stock: 40,
    stockMinimo: 10,
    disponible: true,
    imagenUrl: '/images/productos/vino blanco copa.jpg',
    codigo: 'BEB-003'
  },
  {
    nombre: 'Fernet con Coca',
    descripcion: 'Clásico argentino. Fernet Branca con Coca-Cola.',
    categoria: 'Bebidas Alcohólicas',
    precio: 700,
    costo: 300,
    stock: 60,
    stockMinimo: 15,
    disponible: true,
    imagenUrl: '/images/productos/default.jpg',
    codigo: 'BEB-004'
  },
  {
    nombre: 'Agua Mineral 500ml',
    descripcion: 'Agua mineral con o sin gas. 500ml',
    categoria: 'Bebidas',
    precio: 250,
    costo: 100,
    stock: 150,
    stockMinimo: 30,
    disponible: true,
    imagenUrl: '/images/productos/agua mineral 500ml.jpg',
    codigo: 'BEB-005'
  },
  {
    nombre: 'Coca Cola 500ml',
    descripcion: 'Coca-Cola original. 500ml',
    categoria: 'Bebidas',
    precio: 350,
    costo: 150,
    stock: 120,
    stockMinimo: 25,
    disponible: true,
    imagenUrl: '/images/productos/coca cola 500.jpg',
    codigo: 'BEB-006'
  },
  {
    nombre: 'Jugo Natural',
    descripcion: 'Jugo exprimido del día. Naranja, pomelo o mixto.',
    categoria: 'Bebidas',
    precio: 400,
    costo: 150,
    stock: 50,
    stockMinimo: 10,
    disponible: true,
    imagenUrl: '/images/productos/default.jpg',
    codigo: 'BEB-007'
  },
  {
    nombre: 'Café Espresso',
    descripcion: 'Café de especialidad, tostado artesanal.',
    categoria: 'Bebidas',
    precio: 300,
    costo: 100,
    stock: 200,
    stockMinimo: 50,
    disponible: true,
    imagenUrl: '/images/productos/cafe.jpg',
    codigo: 'BEB-008'
  },
  {
    nombre: 'Licuado',
    descripcion: 'Licuado de frutas frescas. Banana, frutilla o durazno.',
    categoria: 'Bebidas',
    precio: 450,
    costo: 180,
    stock: 40,
    stockMinimo: 10,
    disponible: true,
    imagenUrl: '/images/productos/licuado.jpg',
    codigo: 'BEB-009'
  },
  {
    nombre: 'Limonada',
    descripcion: 'Limonada casera con jengibre y menta.',
    categoria: 'Bebidas',
    precio: 380,
    costo: 120,
    stock: 55,
    stockMinimo: 12,
    disponible: true,
    imagenUrl: '/images/productos/limonada.jpg',
    codigo: 'BEB-010'
  },

  // ===== POSTRES =====
  {
    nombre: 'Flan con Dulce de Leche',
    descripcion: 'Flan casero con dulce de leche y crema.',
    categoria: 'Postres',
    precio: 500,
    costo: 200,
    stock: 30,
    stockMinimo: 8,
    disponible: true,
    imagenUrl: '/images/productos/flan con dulce de leche.jpg',
    codigo: 'POS-001'
  },
  {
    nombre: 'Helado 3 Bochas',
    descripcion: '3 bochas de helado artesanal. Sabores variados.',
    categoria: 'Postres',
    precio: 600,
    costo: 250,
    stock: 50,
    stockMinimo: 10,
    disponible: true,
    imagenUrl: '/images/productos/helado 3 bochas.jpg',
    codigo: 'POS-002'
  },
  {
    nombre: 'Tarta de Manzana',
    descripcion: 'Tarta de manzana casera con canela, servida tibia.',
    categoria: 'Postres',
    precio: 550,
    costo: 220,
    stock: 25,
    stockMinimo: 5,
    disponible: true,
    imagenUrl: '/images/productos/default.jpg',
    codigo: 'POS-003'
  },
  {
    nombre: 'Brownie con Helado',
    descripcion: 'Brownie de chocolate belga con helado de vainilla y salsa.',
    categoria: 'Postres',
    precio: 700,
    costo: 300,
    stock: 20,
    stockMinimo: 5,
    disponible: true,
    imagenUrl: '/images/productos/default.jpg',
    codigo: 'POS-004'
  },
  {
    nombre: 'Cheesecake',
    descripcion: 'Cheesecake de frutos rojos con base de galleta.',
    categoria: 'Postres',
    precio: 650,
    costo: 280,
    stock: 18,
    stockMinimo: 4,
    disponible: true,
    imagenUrl: '/images/productos/default.jpg',
    codigo: 'POS-005'
  },
  {
    nombre: 'Tiramisú',
    descripcion: 'Postre italiano con café, mascarpone y cacao.',
    categoria: 'Postres',
    precio: 700,
    costo: 320,
    stock: 15,
    stockMinimo: 3,
    disponible: true,
    imagenUrl: '/images/productos/default.jpg',
    codigo: 'POS-006'
  },
  {
    nombre: 'Mousse de Chocolate',
    descripcion: 'Mousse cremoso de chocolate amargo con crema.',
    categoria: 'Postres',
    precio: 580,
    costo: 240,
    stock: 22,
    stockMinimo: 5,
    disponible: true,
    imagenUrl: '/images/productos/default.jpg',
    codigo: 'POS-007'
  },
  {
    nombre: 'Panqueques con Dulce',
    descripcion: 'Stack de panqueques con dulce de leche y banana.',
    categoria: 'Postres',
    precio: 620,
    costo: 260,
    stock: 28,
    stockMinimo: 6,
    disponible: true,
    imagenUrl: '/images/productos/panqueques.jpg',
    codigo: 'POS-008'
  },

  // ===== ENTRADAS =====
  {
    nombre: 'Picada para 2',
    descripcion: 'Tabla de fiambres, quesos, aceitunas, pickles y pan.',
    categoria: 'Entradas',
    precio: 1800,
    costo: 900,
    stock: 20,
    stockMinimo: 5,
    disponible: true,
    imagenUrl: '/images/productos/picada.jpg',
    codigo: 'ENT-001'
  },
  {
    nombre: 'Provoleta',
    descripcion: 'Queso provolone grillado con orégano y aceite de oliva.',
    categoria: 'Entradas',
    precio: 650,
    costo: 280,
    stock: 35,
    stockMinimo: 8,
    disponible: true,
    imagenUrl: '/images/productos/provoleta.jpg',
    codigo: 'ENT-002'
  },
  {
    nombre: 'Rabas',
    descripcion: 'Aros de calamar rebozados y fritos. Con limón y alioli.',
    categoria: 'Entradas',
    precio: 850,
    costo: 400,
    stock: 25,
    stockMinimo: 5,
    disponible: true,
    imagenUrl: '/images/productos/rabas.jpg',
    codigo: 'ENT-003'
  },
  {
    nombre: 'Bruschetta',
    descripcion: 'Pan tostado con tomate, albahaca, ajo y aceite de oliva.',
    categoria: 'Entradas',
    precio: 550,
    costo: 220,
    stock: 30,
    stockMinimo: 8,
    disponible: true,
    imagenUrl: '/images/productos/bruschetta.jpg',
    codigo: 'ENT-004'
  }
];

/**
 * Conectar a la base de datos y poblar con datos
 */
async function seedDatabase() {
  try {
    console.log('🔌 Conectando a la base de datos...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    console.log('🗑️  Limpiando colección de productos...');
    await Producto.deleteMany({});
    console.log('✅ Colección limpiada\n');

    console.log('📝 Insertando productos de ejemplo...\n');
    const productosCreados = await Producto.insertMany(productosEjemplo);
    
    console.log('╔════════════════════════════════════════════╗');
    console.log('║         PRODUCTOS CREADOS EXITOSAMENTE     ║');
    console.log('╚════════════════════════════════════════════╝\n');
    
    // Estadísticas
    const estadisticas = {
      total: productosCreados.length,
      comidas: productosCreados.filter(p => p.categoria === 'Comidas').length,
      bebidas: productosCreados.filter(p => p.categoria === 'Bebidas').length,
      bebidasAlcoholicas: productosCreados.filter(p => p.categoria === 'Bebidas Alcohólicas').length,
      postres: productosCreados.filter(p => p.categoria === 'Postres').length,
      entradas: productosCreados.filter(p => p.categoria === 'Entradas').length
    };

    console.log('📊 ESTADÍSTICAS:');
    console.log(`   Total de productos: ${estadisticas.total}`);
    console.log(`   🍽️  Comidas: ${estadisticas.comidas}`);
    console.log(`   🥤 Bebidas: ${estadisticas.bebidas}`);
    console.log(`   🍺 Bebidas Alcohólicas: ${estadisticas.bebidasAlcoholicas}`);
    console.log(`   🍰 Postres: ${estadisticas.postres}`);
    console.log(`   🥗 Entradas: ${estadisticas.entradas}`);
    console.log();

    // Mostrar algunos productos
    console.log('📋 EJEMPLOS DE PRODUCTOS CREADOS:\n');
    productosCreados.slice(0, 5).forEach(p => {
      console.log(`   ✓ ${p.nombre} - $${p.precio}`);
      console.log(`     Categoría: ${p.categoria}`);
      console.log(`     Stock: ${p.stock} unidades\n`);
    });

    console.log('🎉 ¡Base de datos poblada exitosamente!\n');
    console.log('📍 Próximos pasos:');
    console.log('   1. Inicia el servidor: npm start');
    console.log('   2. Prueba el endpoint: GET http://localhost:4000/api/menu');
    console.log('   3. Genera el código QR: node scripts/generarQR.js\n');

  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar
seedDatabase();
