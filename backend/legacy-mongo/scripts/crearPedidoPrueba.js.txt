import 'dotenv/config';
import mongoose from 'mongoose';

const crearPedidoPrueba = async () => {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = mongoose.connection.db;

    // Buscar un mozo (intentar con diferentes variantes del rol)
    let mozo = await db.collection('usuarios').findOne({ rol: 'Mozo' });
    if (!mozo) {
      mozo = await db.collection('usuarios').findOne({ rol: /mozo/i });
    }
    if (!mozo) {
      // Usar cualquier usuario si no hay mozo
      mozo = await db.collection('usuarios').findOne();
      console.log('⚠️  No se encontró mozo, usando usuario:', mozo?.nombreCompleto || 'desconocido');
    }

    // Buscar una mesa
    let mesa = await db.collection('mesas').findOne({ estado: 'disponible' });
    if (!mesa) {
      console.log('⚠️  No hay mesas disponibles, usando la primera mesa');
      mesa = await db.collection('mesas').findOne();
      if (!mesa) {
        console.log('❌ No hay mesas en la base de datos');
        process.exit(1);
      }
    }

    // Buscar algunos productos
    const productos = await db.collection('productos').find().limit(3).toArray();
    if (productos.length === 0) {
      console.log('❌ No hay productos en la base de datos');
      process.exit(1);
    }

    // Generar número de pedido
    const ultimoPedido = await db.collection('pedidos').findOne({}, { sort: { numeroPedido: -1 } });
    const numeroPedido = ultimoPedido ? ultimoPedido.numeroPedido + 1 : 1;

    // Crear items del pedido
    const items = productos.slice(0, 2).map((prod, index) => ({
      producto: prod._id,
      nombreProducto: prod.nombre,
      cantidad: index === 0 ? 2 : 1,
      precioUnitario: prod.precio,
      subtotal: prod.precio * (index === 0 ? 2 : 1),
      categoria: prod.categoria,
      notas: index === 0 ? 'Sin cebolla' : ''
    }));

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    // Crear el pedido
    const nuevoPedido = {
      numeroPedido,
      mesa: mesa._id,
      numeroMesa: mesa.numero,
      mozo: mozo._id,
      nombreMozo: mozo.nombreCompleto,
      items,
      estado: 'Pendiente',
      estadoCocina: 'Pendiente',
      estadoPago: 'Pendiente',
      total,
      notas: 'Pedido de prueba para cocina',
      fechaCreacion: new Date()
    };

    await db.collection('pedidos').insertOne(nuevoPedido);

    console.log('✅ Pedido de prueba creado exitosamente!\n');
    console.log('📋 Detalles del pedido:');
    console.log(`   • Número: #${numeroPedido}`);
    console.log(`   • Mesa: ${mesa.numero}`);
    console.log(`   • Mozo: ${mozo.nombreCompleto}`);
    console.log(`   • Estado: Pendiente`);
    console.log(`   • Total: $${total}`);
    console.log(`   • Items: ${items.length}`);
    items.forEach((item, i) => {
      console.log(`     ${i + 1}. ${item.cantidad}x ${item.nombreProducto} - $${item.subtotal}`);
    });

    console.log('\n🌐 Ve a http://localhost:5173/cocina para ver el pedido');

  } catch (error) {
    console.error('❌ Error al crear pedido de prueba:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Conexión cerrada');
  }
};

crearPedidoPrueba();
