// Script para generar datos de prueba para el dashboard
import mongoose from 'mongoose';
import 'dotenv/config';

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restobar_db';

const Pedido = mongoose.model('Pedido', new mongoose.Schema({}, { strict: false }));
const Producto = mongoose.model('Producto', new mongoose.Schema({}, { strict: false }));
const Usuario = mongoose.model('Usuario', new mongoose.Schema({}, { strict: false }));
const Mesa = mongoose.model('Mesa', new mongoose.Schema({}, { strict: false }));

async function generarDatosPrueba() {
  try {
    console.log('📊 Conectando a MongoDB...');
    await mongoose.connect(DB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Obtener datos necesarios
    const productos = await Producto.find({}).limit(10);
    const usuarios = await Usuario.find({});
    const mozos = usuarios.filter(u => u.role === 'Mozo' || u.rol === 'Mozo');
    const mesas = await Mesa.find();

    console.log('📦 Productos encontrados:', productos.length);
    console.log('👥 Usuarios totales:', usuarios.length);
    console.log('👤 Mozos encontrados:', mozos.length);
    console.log('🪑 Mesas encontradas:', mesas.length);

    if (!productos.length || !mozos.length || !mesas.length) {
      console.log('❌ No hay suficientes datos base. Ejecuta initDB.js primero.');
      console.log('   Productos:', productos.length);
      console.log('   Mozos:', mozos.length);
      console.log('   Mesas:', mesas.length);
      
      if (usuarios.length > 0) {
        console.log('\n👥 Roles de usuarios encontrados:');
        usuarios.forEach(u => console.log(`   - ${u.name}: ${u.role || u.rol || 'sin rol'}`));
      }
      
      await mongoose.connection.close();
      process.exit(1);
    }

    // Generar pedidos cobrados de los últimos 12 meses
    const pedidosCreados = [];
    const mesesAtras = 12;
    const hoy = new Date();

    for (let mesOffset = 0; mesOffset < mesesAtras; mesOffset++) {
      const fecha = new Date(hoy);
      fecha.setMonth(fecha.getMonth() - mesOffset);
      
      // Generar entre 5 y 15 pedidos por mes
      const cantidadPedidos = Math.floor(Math.random() * 10) + 5;

      for (let i = 0; i < cantidadPedidos; i++) {
        // Seleccionar productos aleatorios (2-5 productos por pedido)
        const cantidadProductos = Math.floor(Math.random() * 4) + 2;
        const productosSeleccionados = [];
        let total = 0;

        for (let j = 0; j < cantidadProductos; j++) {
          const producto = productos[Math.floor(Math.random() * productos.length)];
          const cantidad = Math.floor(Math.random() * 3) + 1;
          const subtotal = producto.precio * cantidad;

          productosSeleccionados.push({
            producto: producto._id,
            nombre: producto.nombre,
            cantidad,
            precioUnitario: producto.precio,
            subtotal
          });

          total += subtotal;
        }

        // Crear pedido
        const pedido = {
          numeroPedido: `PED-${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, '0')}${String(i + 1).padStart(4, '0')}`,
          mesa: mesas[Math.floor(Math.random() * mesas.length)]._id,
          numeroMesa: Math.floor(Math.random() * 10) + 1,
          mozo: mozos[Math.floor(Math.random() * mozos.length)]._id,
          productos: productosSeleccionados,
          estado: 'Cobrado',
          total,
          metodoPago: Math.random() > 0.5 ? 'Efectivo' : 'Transferencia',
          descuento: Math.random() > 0.5 ? total * 0.1 : 0,
          observacionesGenerales: '',
          createdAt: new Date(fecha.getFullYear(), fecha.getMonth(), Math.floor(Math.random() * 28) + 1),
          updatedAt: new Date()
        };

        pedidosCreados.push(pedido);
      }
    }

    console.log(`📝 Generando ${pedidosCreados.length} pedidos de prueba...`);
    
    // Insertar pedidos
    await Pedido.insertMany(pedidosCreados);

    console.log(`✅ ${pedidosCreados.length} pedidos creados exitosamente\n`);

    // Mostrar resumen
    const resumen = await Pedido.aggregate([
      { $match: { estado: 'Cobrado' } },
      { $group: { _id: null, total: { $sum: '$total' }, cantidad: { $sum: 1 } } }
    ]);

    console.log('📊 RESUMEN:');
    console.log(`   Total de pedidos cobrados: ${resumen[0]?.cantidad || 0}`);
    console.log(`   Total de ventas: $${resumen[0]?.total.toFixed(2) || 0}`);

    await mongoose.connection.close();
    console.log('\n✅ Datos de prueba generados correctamente');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

generarDatosPrueba();
