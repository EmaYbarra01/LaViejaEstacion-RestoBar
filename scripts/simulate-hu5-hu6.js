// Simulación HU5 y HU6 - servidor Socket.io + clientes Cocina y Mozo
// Ejecutar: node scripts/simulate-hu5-hu6.js

const http = require('http');
const { Server } = require('socket.io');
const { io: Client } = require('socket.io-client');

const PORT = 4000;
const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  const { usuarioId, rol, modulo } = socket.handshake.auth || {};
  console.log(`[Server] Conexión: socket=${socket.id} usuarioId=${usuarioId} rol=${rol} modulo=${modulo}`);

  // join rooms
  socket.join('general');
  if (modulo === 'cocina') socket.join('cocina');
  if (modulo === 'caja') socket.join('caja');
  if (modulo === 'mozo') {
    socket.join('mozos');
    if (usuarioId) socket.join(`mozo-${usuarioId}`);
  }

  socket.on('actualizar-estado-pedido', (data) => {
    console.log(`[Server] recibir actualizar-estado-pedido:`, data);
    io.to('cocina').emit('pedido-actualizado', data);
    io.to('caja').emit('pedido-actualizado', data);
    io.to('mozos').emit('pedido-actualizado', data);
    if (data.mozoId) io.to(`mozo-${data.mozoId}`).emit('notificacion-mozo', {
      tipo: 'estado-pedido', mensaje: `Pedido #${data.numeroPedido} cambió a ${data.nuevoEstado}`, pedido: data
    });
  });

  socket.on('marcar-pedido-listo', (data) => {
    console.log(`[Server] recibir marcar-pedido-listo:`, data);
    io.to('cocina').emit('pedido-listo', data);
    io.to('mozos').emit('pedido-listo', data);
    io.to('caja').emit('pedido-listo', data);
    if (data.mozoId) io.to(`mozo-${data.mozoId}`).emit('notificacion-mozo', {
      tipo: 'pedido-listo', titulo: '🔔 Pedido Listo', mensaje: `El pedido #${data.numeroPedido} está listo para servir`, pedido: data
    });
  });
});

httpServer.listen(PORT, () => console.log(`[Server] Socket.io escuchando en http://localhost:${PORT}`));

// --- Clientes simulados ---
function delay(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function runSimulation(){
  // Crear cliente Cocina
  const cocinaSocket = Client(`http://localhost:${PORT}`, { auth: { usuarioId: 'cocina1', rol: 'Cocina', modulo: 'cocina' } });
  // Crear cliente Mozo
  const mozoSocket = Client(`http://localhost:${PORT}`, { auth: { usuarioId: 'mozo1', rol: 'Mozo', modulo: 'mozo' } });

  cocinaSocket.on('connect', () => console.log('[Cocina] conectado', cocinaSocket.id));
  mozoSocket.on('connect', () => console.log('[Mozo] conectado', mozoSocket.id));

  cocinaSocket.on('nuevo-pedido-cocina', (pedido) => {
    console.log('[Cocina] nuevo-pedido-cocina recibido ->', pedido.numeroPedido, pedido.estado);
  });

  cocinaSocket.on('pedido-actualizado', (data) => {
    console.log('[Cocina] pedido-actualizado ->', data.numeroPedido, data.nuevoEstado);
  });

  cocinaSocket.on('pedido-listo', (data) => {
    console.log('[Cocina] pedido-listo ->', data.numeroPedido);
  });

  mozoSocket.on('pedido-listo', (data) => {
    console.log('[Mozo] pedido-listo -> alerta visual para mozo, pedido:', data.numeroPedido);
  });

  mozoSocket.on('notificacion-mozo', (n) => {
    console.log('[Mozo] notificacion-mozo ->', n.titulo || n.mensaje || n);
  });

  // Simular creación de pedido
  await delay(500);
  const pedido = {
    pedidoId: 'pedido-1001',
    numeroPedido: 1001,
    fechaCreacion: new Date().toISOString(),
    mesa: { numero: 5 },
    mozoId: 'mozo1',
    mozo: { nombre: 'Juan', apellido: 'Perez' },
    productos: [{ nombre: 'Milanesa', cantidad: 2 }],
    estado: 'Pendiente'
  };

  console.log('\n[Sim] Emite nuevo-pedido-cocina (Pendiente)');
  io.to('cocina').emit('nuevo-pedido-cocina', pedido);

  // Esperar y luego simular Cocina comenzando la preparacion
  await delay(1000);
  console.log('\n[Sim] Cocina emite actualizar-estado-pedido -> En preparación');
  cocinaSocket.emit('actualizar-estado-pedido', {
    pedidoId: pedido.pedidoId,
    numeroPedido: pedido.numeroPedido,
    nuevoEstado: 'En preparación',
    mozoId: pedido.mozoId
  });

  // Esperar y luego simular Cocina marcando listo
  await delay(1500);
  console.log('\n[Sim] Cocina emite marcar-pedido-listo -> Listo');
  cocinaSocket.emit('marcar-pedido-listo', {
    pedidoId: pedido.pedidoId,
    numeroPedido: pedido.numeroPedido,
    nuevoEstado: 'Listo',
    mozoId: pedido.mozoId,
    numeroMesa: pedido.mesa.numero
  });

  // Esperar para que todos reciban
  await delay(1000);

  console.log('\n[Sim] Finalizando simulación. Desconectando sockets.');
  cocinaSocket.disconnect();
  mozoSocket.disconnect();
  io.close();
  httpServer.close();
}

runSimulation().catch(err => console.error(err));
