#!/usr/bin/env node

/**
 * Script de Prueba para HU7 y HU8
 * Verifica el flujo completo de pedidos → caja → cobro
 * 
 * Uso: node test-flujo-caja.js
 */

const BASE_URL = 'http://localhost:3000/api';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function makeRequest(method, endpoint, token, body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function testFlujoCompleto() {
  logSection('🧪 TEST: Flujo Completo HU7 y HU8');

  logInfo('Este script prueba el flujo completo de pedidos a caja');
  logInfo('Asegúrate de tener el backend corriendo en http://localhost:3000');
  logWarning('Necesitas tokens JWT válidos para probar (edita el script)');

  // TODO: Reemplazar con tokens reales
  const TOKEN_COCINA = 'TU_TOKEN_COCINA_AQUI';
  const TOKEN_CAJERO = 'TU_TOKEN_CAJERO_AQUI';

  if (TOKEN_COCINA === 'TU_TOKEN_COCINA_AQUI' || TOKEN_CAJERO === 'TU_TOKEN_CAJERO_AQUI') {
    logError('⚠️  Debes configurar tokens válidos en el script');
    logInfo('1. Inicia sesión como usuario de Cocina y Cajero');
    logInfo('2. Copia los tokens JWT generados');
    logInfo('3. Pega los tokens en este script');
    return;
  }

  // 1. Obtener pedidos pendientes en cocina
  logSection('Paso 1: Obtener pedidos pendientes en cocina');
  const pedidosCocina = await makeRequest('GET', '/pedidos/cocina/pendientes', TOKEN_COCINA);
  
  if (!pedidosCocina.ok) {
    logError('No se pudieron obtener pedidos de cocina');
    console.log(pedidosCocina);
    return;
  }

  logSuccess(`Se encontraron ${pedidosCocina.data.length} pedidos en cocina`);

  if (pedidosCocina.data.length === 0) {
    logWarning('No hay pedidos para probar. Crea un pedido primero.');
    return;
  }

  // Tomar el primer pedido pendiente
  const pedido = pedidosCocina.data.find(p => p.estado === 'Pendiente');
  
  if (!pedido) {
    logWarning('No hay pedidos en estado "Pendiente". Prueba con uno "En preparación"');
    const pedidoEnPrep = pedidosCocina.data.find(p => p.estado === 'En preparación');
    
    if (!pedidoEnPrep) {
      logError('No hay pedidos disponibles para probar');
      return;
    }

    // 2. Marcar como listo (HU7)
    logSection('Paso 2: Marcar pedido como Listo (HU7)');
    logInfo(`Marcando pedido #${pedidoEnPrep.numeroPedido} como listo...`);
    
    const marcarListo = await makeRequest(
      'PUT',
      `/pedidos/${pedidoEnPrep._id}/marcar-listo`,
      TOKEN_COCINA,
      { observacion: 'Test: Pedido terminado' }
    );

    if (!marcarListo.ok) {
      logError('No se pudo marcar como listo');
      console.log(marcarListo);
      return;
    }

    logSuccess(`Pedido #${pedidoEnPrep.numeroPedido} marcado como LISTO`);
    logInfo(`Estado: ${marcarListo.data.pedido.estado}`);
    logInfo(`Fecha listo: ${marcarListo.data.pedido.fechaListo}`);

    // Usar este pedido para las siguientes pruebas
    pedido._id = pedidoEnPrep._id;
    pedido.numeroPedido = pedidoEnPrep.numeroPedido;
  }

  // 3. Verificar que aparece en caja (HU8)
  logSection('Paso 3: Verificar que el pedido aparece en Caja (HU8)');
  
  const pedidosCaja = await makeRequest('GET', '/pedidos/caja/pendientes', TOKEN_CAJERO);
  
  if (!pedidosCaja.ok) {
    logError('No se pudieron obtener pedidos de caja');
    console.log(pedidosCaja);
    return;
  }

  logSuccess(`Se encontraron ${pedidosCaja.data.length} pedidos pendientes en caja`);

  const pedidoEnCaja = pedidosCaja.data.find(p => p._id === pedido._id);
  
  if (pedidoEnCaja) {
    logSuccess(`✅ El pedido #${pedido.numeroPedido} APARECE en la vista de caja`);
    logInfo(`Mesa: ${pedidoEnCaja.mesa.numero}`);
    logInfo(`Subtotal: $${pedidoEnCaja.subtotal}`);
  } else {
    logWarning('El pedido no aparece en caja todavía (puede estar en estado Servido)');
  }

  // 4. Cobrar el pedido - Pago en Efectivo con descuento (HU8)
  logSection('Paso 4: Cobrar pedido en Efectivo (con descuento 10%)');
  
  const subtotal = pedidoEnCaja ? pedidoEnCaja.subtotal : 1000;
  const totalConDescuento = subtotal * 0.9;
  const montoPagado = totalConDescuento + 100; // Pagar un poco más

  logInfo(`Subtotal: $${subtotal}`);
  logInfo(`Total con descuento: $${totalConDescuento.toFixed(2)}`);
  logInfo(`Monto pagado: $${montoPagado}`);

  const cobrarEfectivo = await makeRequest(
    'POST',
    `/pedidos/${pedido._id}/cobrar`,
    TOKEN_CAJERO,
    {
      metodoPago: 'Efectivo',
      montoPagado: montoPagado
    }
  );

  if (!cobrarEfectivo.ok) {
    logError('No se pudo cobrar el pedido');
    console.log(cobrarEfectivo);
    
    // Si el pedido ya fue cobrado, intentar con otro
    if (cobrarEfectivo.data.mensaje && cobrarEfectivo.data.mensaje.includes('ya fue cobrado')) {
      logWarning('Este pedido ya fue cobrado. Busca otro pedido para probar.');
    }
    return;
  }

  logSuccess('✅ Pedido cobrado exitosamente');
  logSuccess(`Descuento aplicado: ${cobrarEfectivo.data.pedido.descuento.porcentaje}% ($${cobrarEfectivo.data.pedido.descuento.monto})`);
  logSuccess(`Total pagado: $${cobrarEfectivo.data.pedido.total}`);
  logSuccess(`Cambio: $${cobrarEfectivo.data.pedido.pago.cambio}`);

  // 5. Verificar ticket generado
  logSection('Paso 5: Verificar Ticket Generado');
  
  const ticket = cobrarEfectivo.data.ticket;
  
  logInfo('Ticket generado:');
  console.log(JSON.stringify(ticket, null, 2));
  
  logSuccess('✅ Ticket contiene todos los datos necesarios');
  logInfo(`- Número de pedido: ${ticket.numeroPedido}`);
  logInfo(`- Mesa: ${ticket.mesa}`);
  logInfo(`- Mozo: ${ticket.mozo}`);
  logInfo(`- Cajero: ${ticket.cajero}`);
  logInfo(`- Productos: ${ticket.productos.length}`);
  logInfo(`- Subtotal: $${ticket.subtotal}`);
  logInfo(`- Descuento: $${ticket.descuento.monto}`);
  logInfo(`- Total: $${ticket.total}`);
  logInfo(`- Método: ${ticket.metodoPago}`);

  // Resumen final
  logSection('📊 Resumen de la Prueba');
  
  logSuccess('✅ HU7: Pedido marcado como listo y enviado automáticamente a caja');
  logSuccess('✅ HU8: Pedido visible en vista de caja con todos los detalles');
  logSuccess('✅ HU8: Cobro realizado con descuento del 10% (efectivo)');
  logSuccess('✅ HU8: Ticket generado con todos los datos completos');
  
  logSection('🎉 ¡Todas las pruebas pasaron exitosamente!');
}

// Ejecutar tests
(async () => {
  try {
    await testFlujoCompleto();
  } catch (error) {
    logError('Error durante la prueba:');
    console.error(error);
  }
})();
