console.log('🧪 TEST DE RESERVAS\n');

const testReserva = async () => {
  try {
    console.log('Enviando reserva de prueba...\n');
    
    const response = await fetch('http://localhost:4000/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cliente: 'Test Usuario',
        email: 'test@example.com',
        telefono: '+54 381 1234567',
        fecha: '2025-11-25',
        hora: '20:00',
        comensales: 4,
        comentarios: 'Reserva de prueba automática'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ ¡RESERVA CREADA EXITOSAMENTE!\n');
      console.log('ID:', data.reserva._id);
      console.log('Cliente:', data.reserva.cliente);
      console.log('Estado:', data.reserva.estado);
      console.log('\n📧 Revisa la consola del servidor backend para ver si los emails se enviaron.');
      console.log('💡 El sistema funciona correctamente aunque los emails fallen.\n');
    } else {
      console.log('❌ Error:', data.mensaje);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testReserva();
