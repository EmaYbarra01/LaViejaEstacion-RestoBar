import 'dotenv/config';
import mongoose from 'mongoose';

const arreglarPedido = async () => {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = mongoose.connection.db;

    // Actualizar el pedido con los campos faltantes
    const result = await db.collection('pedidos').updateOne(
      { numeroPedido: 1 },
      { 
        $set: { 
          subtotal: 4000,
          nombreMozo: 'Usuario de Prueba'
        } 
      }
    );

    console.log('✅ Pedido actualizado:', result.modifiedCount, 'documento(s)');
    
    // Verificar el pedido
    const pedido = await db.collection('pedidos').findOne({ numeroPedido: 1 });
    console.log('\n📋 Pedido actualizado:');
    console.log('  • Número:', pedido.numeroPedido);
    console.log('  • Subtotal:', pedido.subtotal);
    console.log('  • Total:', pedido.total);
    console.log('  • Nombre Mozo:', pedido.nombreMozo);
    console.log('  • Estado:', pedido.estado);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Conexión cerrada');
  }
};

arreglarPedido();
