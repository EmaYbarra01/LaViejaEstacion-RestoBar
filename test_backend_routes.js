// Script de prueba para verificar las rutas del backend
// Ejecutar con: node test_backend_routes.js

import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

async function testBackendRoutes() {
  console.log('🧪 Iniciando pruebas de rutas del backend...\n');

  try {
    // Test 1: Login
    console.log('📋 Test 1: Login');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: 'test@test.com', // Cambia por un email válido
      password: 'test123'     // Cambia por una contraseña válida
    }, {
      withCredentials: true
    });
    
    console.log('✅ Login exitoso:', loginResponse.data);
    console.log('📄 Estructura del usuario:', JSON.stringify(loginResponse.data.user, null, 2));
    
    // Extraer cookies para las siguientes peticiones
    const cookies = loginResponse.headers['set-cookie'];
    
    // Test 2: GetMe
    console.log('\n📋 Test 2: GetMe');
    const getMeResponse = await axios.get(`${BASE_URL}/me`, {
      withCredentials: true,
      headers: {
        'Cookie': cookies
      }
    });
    
    console.log('✅ GetMe exitoso:', getMeResponse.data);
    console.log('📄 Estructura del usuario:', JSON.stringify(getMeResponse.data, null, 2));
    
    // Test 3: Logout
    console.log('\n📋 Test 3: Logout');
    const logoutResponse = await axios.post(`${BASE_URL}/logout`, {}, {
      withCredentials: true,
      headers: {
        'Cookie': cookies
      }
    });
    
    console.log('✅ Logout exitoso:', logoutResponse.data);
    
    console.log('\n🎉 Todas las pruebas completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:');
    console.error('Status:', error.response?.status);
    console.error('Mensaje:', error.response?.data);
    console.error('URL:', error.config?.url);
    console.error('Método:', error.config?.method);
  }
}

// Verificar URLs del Zustand Store
console.log('🔍 URLs configuradas en el Zustand Store:');
console.log('- Login:', `${process.env.VITE_API_BASE || 'http://localhost:4000'}api/login`);
console.log('- GetMe:', `${process.env.VITE_API_BASE || 'http://localhost:4000'}api/me`);
console.log('- Logout:', `${process.env.VITE_API_BASE || 'http://localhost:4000'}api/logout`);
console.log('');

// Ejecutar pruebas si el backend está ejecutándose
testBackendRoutes();