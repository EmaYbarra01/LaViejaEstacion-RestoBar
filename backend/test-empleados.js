/**
 * Script de Prueba para la API de Empleados
 * Ejecutar con: node test-empleados.js
 * 
 * Pre-requisitos:
 * - Servidor backend corriendo en http://localhost:4000
 * - Usuario SuperAdministrador creado y autenticado
 */

const API_BASE = 'http://localhost:4000/api';

// Token de autenticación del SuperAdministrador
// REEMPLAZAR con un token válido obtenido del login
const TOKEN = 'tu_token_aqui';

// ID de un usuario existente para crear como empleado
// REEMPLAZAR con un ID de usuario válido de tu BD
const USUARIO_ID = '673580c7a0b7f0c29d6c7a5e';

/**
 * Test 1: Obtener todos los empleados
 */
async function testObtenerEmpleados() {
  console.log('\n📋 TEST 1: Obtener todos los empleados');
  console.log('='.repeat(50));
  
  try {
    const response = await fetch(`${API_BASE}/empleados`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return response.ok;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

/**
 * Test 2: Crear un nuevo empleado
 */
async function testCrearEmpleado() {
  console.log('\n➕ TEST 2: Crear un nuevo empleado');
  console.log('='.repeat(50));
  
  const nuevoEmpleado = {
    usuarioId: USUARIO_ID,
    cargo: 'Mozo',
    salarioMensual: 450000
  };

  try {
    const response = await fetch(`${API_BASE}/empleados`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevoEmpleado)
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.empleado) {
      return data.empleado._id;
    }
    return null;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

/**
 * Test 3: Registrar asistencia de un empleado
 */
async function testRegistrarAsistencia(empleadoId) {
  console.log('\n📅 TEST 3: Registrar asistencia');
  console.log('='.repeat(50));
  
  const asistencia = {
    fecha: new Date(),
    presente: true,
    horaEntrada: '09:00',
    horaSalida: '18:00',
    observaciones: 'Asistencia completa'
  };

  try {
    const response = await fetch(`${API_BASE}/empleados/${empleadoId}/asistencia`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(asistencia)
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return response.ok;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

/**
 * Test 4: Registrar pago de un empleado
 */
async function testRegistrarPago(empleadoId) {
  console.log('\n💰 TEST 4: Registrar pago mensual');
  console.log('='.repeat(50));
  
  const mesActual = new Date().getMonth() + 1;
  const anioActual = new Date().getFullYear();

  const pago = {
    mes: mesActual,
    anio: anioActual,
    monto: 450000,
    metodoPago: 'Transferencia',
    observaciones: 'Pago del mes completo'
  };

  try {
    const response = await fetch(`${API_BASE}/empleados/${empleadoId}/pago`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pago)
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return response.ok;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

/**
 * Test 5: Obtener historial de asistencias
 */
async function testObtenerAsistencias(empleadoId) {
  console.log('\n📊 TEST 5: Obtener historial de asistencias');
  console.log('='.repeat(50));
  
  try {
    const response = await fetch(`${API_BASE}/empleados/${empleadoId}/asistencias`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return response.ok;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

/**
 * Test 6: Obtener historial de pagos
 */
async function testObtenerPagos(empleadoId) {
  console.log('\n💳 TEST 6: Obtener historial de pagos');
  console.log('='.repeat(50));
  
  try {
    const response = await fetch(`${API_BASE}/empleados/${empleadoId}/pagos`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return response.ok;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

/**
 * Ejecutar todos los tests
 */
async function ejecutarTests() {
  console.log('\n🚀 INICIANDO PRUEBAS DE LA API DE EMPLEADOS');
  console.log('='.repeat(50));
  
  if (TOKEN === 'tu_token_aqui') {
    console.error('\n❌ ERROR: Debes configurar un TOKEN válido en el script');
    console.error('👉 Obtén un token haciendo login como SuperAdministrador');
    return;
  }

  if (USUARIO_ID === '673580c7a0b7f0c29d6c7a5e') {
    console.warn('\n⚠️  ADVERTENCIA: Usando USUARIO_ID de ejemplo');
    console.warn('👉 Reemplaza con un ID de usuario válido de tu base de datos');
  }

  // Test 1: Obtener empleados
  await testObtenerEmpleados();

  // Test 2: Crear empleado
  const empleadoId = await testCrearEmpleado();
  
  if (empleadoId) {
    // Test 3: Registrar asistencia
    await testRegistrarAsistencia(empleadoId);
    
    // Test 4: Registrar pago
    await testRegistrarPago(empleadoId);
    
    // Test 5: Obtener asistencias
    await testObtenerAsistencias(empleadoId);
    
    // Test 6: Obtener pagos
    await testObtenerPagos(empleadoId);
  }

  console.log('\n✅ PRUEBAS FINALIZADAS');
  console.log('='.repeat(50));
}

// Ejecutar tests
ejecutarTests();
