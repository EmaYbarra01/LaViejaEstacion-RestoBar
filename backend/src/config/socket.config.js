/**
 * ============================================================================
 * CONFIGURACIÓN DE SOCKET.IO - COMUNICACIÓN EN TIEMPO REAL
 * ============================================================================
 * 
 * Este archivo configura Socket.io para la comunicación en tiempo real
 * entre el servidor y los clientes (navegadores).
 * 
 * IMPLEMENTA:
 * - HU4: Envío automático de pedidos a cocina
 * - HU5: Actualización de estados de pedidos en tiempo real
 * - HU6: Notificaciones cuando un pedido está listo
 * - HU11: Actualización del estado de mesas
 * 
 * EVENTOS SOPORTADOS:
 * - nuevo-pedido-cocina: Notifica a cocina cuando hay un nuevo pedido
 * - pedido-actualizado: Notifica cambios de estado en pedidos
 * - pedido-listo: Notifica al mozo que un pedido está listo
 * - pedido-cancelado: Notifica cancelación de pedidos
 * - mesa-actualizada: Notifica cambios de estado en mesas
 * 
 * @module config/socket
 * @requires socket.io
 */

import { Server } from 'socket.io';

/**
 * Inicializa y configura Socket.io
 * 
 * @param {Object} httpServer - Servidor HTTP de Express
 * @returns {Object} Instancia de Socket.io configurada
 * 
 * @example
 * // En el archivo principal del servidor (index.js)
 * import { createServer } from 'http';
 * import { initializeSocket } from './config/socket.js';
 * 
 * const httpServer = createServer(app);
 * const io = initializeSocket(httpServer);
 * app.set('io', io); // Guardar en Express para usar en controladores
 */
export const initializeSocket = (httpServer) => {
    console.log('[Socket.io] Inicializando servidor de WebSockets...');

    // ========================================================================
    // CONFIGURACIÓN DEL SERVIDOR SOCKET.IO
    // ========================================================================
    const io = new Server(httpServer, {
        // Configuración de CORS para permitir conexiones desde el frontend
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        },
        
        // Configuración de transporte
        transports: ['websocket', 'polling'],
        
        // Tiempo de espera para conexión
        connectTimeout: 45000,
        
        // Permitir actualizaciones de protocolo
        allowUpgrades: true
    });

    // ========================================================================
    // ALMACENAMIENTO DE USUARIOS CONECTADOS
    // ========================================================================
    // Mantiene un registro de qué usuarios están conectados y desde qué módulo
    const usuariosConectados = new Map();
    
    /**
     * Estructura de usuariosConectados:
     * {
     *   socketId: {
     *     usuarioId: '507f1f77bcf86cd799439011',
     *     nombre: 'Juan Pérez',
     *     rol: 'Cocina',
     *     modulo: 'cocina', // 'mozo', 'cocina', 'caja', 'admin'
     *     conectadoDesde: Date
     *   }
     * }
     */

    // ========================================================================
    // MIDDLEWARE DE AUTENTICACIÓN (OPCIONAL)
    // ========================================================================
    /**
     * Middleware que se ejecuta antes de aceptar la conexión
     * Puede validar tokens JWT si se requiere autenticación
     */
    io.use((socket, next) => {
        // Obtener datos del handshake
        const { token, usuarioId, rol, modulo } = socket.handshake.auth;
        
        // Log de intento de conexión
        console.log(`[Socket.io] Intento de conexión - Módulo: ${modulo}, Rol: ${rol}, UsuarioId: ${usuarioId || 'N/A'}`);
        
        // Validación básica: solo requiere rol y modulo (usuarioId es opcional)
        if (!rol || !modulo) {
            console.log('[Socket.io] Conexión rechazada - Faltan datos de autenticación (rol/modulo)');
            return next(new Error('Autenticación requerida: rol y modulo son obligatorios'));
        }
        
        // Guardar datos en el socket para usarlos después
        socket.usuarioId = usuarioId || null;
        socket.rol = rol;
        socket.modulo = modulo;
        
        console.log('[Socket.io] ✓ Autenticación aceptada');
        
        // Permitir la conexión
        next();
    });

    // ========================================================================
    // EVENTOS DE CONEXIÓN Y DESCONEXIÓN
    // ========================================================================
    
    /**
     * Evento que se dispara cuando un cliente se conecta
     */
    io.on('connection', (socket) => {
        console.log(`[Socket.io] ✓ Cliente conectado: ${socket.id}`);
        console.log(`[Socket.io]   - Usuario: ${socket.usuarioId || 'Anónimo'}`);
        console.log(`[Socket.io]   - Rol: ${socket.rol}`);
        console.log(`[Socket.io]   - Módulo: ${socket.modulo}`);
        
        // Guardar información del usuario conectado
        usuariosConectados.set(socket.id, {
            usuarioId: socket.usuarioId,
            rol: socket.rol,
            modulo: socket.modulo,
            conectadoDesde: new Date()
        });

        // ====================================================================
        // UNIRSE A SALAS (ROOMS) SEGÚN EL MÓDULO
        // ====================================================================
        // Las salas permiten enviar eventos solo a grupos específicos
        
        // Todos se unen a la sala general
        socket.join('general');
        
        // Unirse a sala específica según el rol/módulo
        switch (socket.modulo) {
            case 'cocina':
                socket.join('cocina');
                console.log(`[Socket.io] Usuario se unió a sala: cocina`);
                break;
                
            case 'caja':
                socket.join('caja');
                console.log(`[Socket.io] Usuario se unió a sala: caja`);
                break;
                
            case 'mozo':
                socket.join('mozos');
                // También unirse a sala personal del mozo
                if (socket.usuarioId) {
                    socket.join(`mozo-${socket.usuarioId}`);
                }
                console.log(`[Socket.io] Usuario se unió a sala: mozos`);
                break;
                
            case 'admin':
                socket.join('admin');
                socket.join('cocina'); // Admin ve todo
                socket.join('caja');
                socket.join('mozos');
                console.log(`[Socket.io] Admin se unió a todas las salas`);
                break;
        }

        // ====================================================================
        // EVENTO: PING (MANTENER CONEXIÓN ACTIVA)
        // ====================================================================
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: Date.now() });
        });

        // ====================================================================
        // EVENTO: UNIRSE A UNA SALA MANUALMENTE
        // ====================================================================
        socket.on('join-room', (room) => {
            socket.join(room);
            console.log(`[Socket.io] Cliente ${socket.id} se unió manualmente a sala: ${room}`);
        });

        // ====================================================================
        // EVENTO: SOLICITAR ESTADO INICIAL
        // ====================================================================
        /**
         * El cliente solicita el estado actual de pedidos al conectarse
         */
        socket.on('solicitar-estado-inicial', async () => {
            try {
                console.log(`[Socket.io] Cliente ${socket.id} solicitó estado inicial`);
                
                // Aquí podrías consultar la BD y enviar el estado actual
                // Por ejemplo, pedidos pendientes en cocina
                
                socket.emit('estado-inicial', {
                    mensaje: 'Conectado exitosamente',
                    modulo: socket.modulo,
                    timestamp: new Date()
                });
                
            } catch (error) {
                console.error('[Socket.io] Error al enviar estado inicial:', error);
            }
        });

        // ====================================================================
        // HU4: NUEVO PEDIDO PARA COCINA
        // ====================================================================
        /**
         * NO se usa aquí directamente. Este evento se emite desde el
         * controlador cuando se crea un pedido.
         * 
         * Se incluye aquí solo como documentación de cómo funciona:
         * 
         * En pedidos.controllers.HU3-HU4.js:
         * req.app.get('io').emit('nuevo-pedido-cocina', pedido);
         * 
         * Los clientes conectados a la sala 'cocina' recibirán:
         * socket.on('nuevo-pedido-cocina', (data) => {
         *   console.log('Nuevo pedido:', data);
         * });
         */

        // ====================================================================
        // HU5: ACTUALIZAR ESTADO DE PEDIDO
        // ====================================================================
        /**
         * Cocina notifica que cambió el estado de un pedido
         */
        socket.on('actualizar-estado-pedido', (data) => {
            console.log(`[Socket.io] Actualizando estado de pedido ${data.pedidoId}`);
            
            // Emitir a todos los clientes relevantes
            io.to('cocina').emit('pedido-actualizado', data);
            io.to('caja').emit('pedido-actualizado', data);
            io.to('mozos').emit('pedido-actualizado', data);
            
            // Si hay un mozo específico, notificarle directamente
            if (data.mozoId) {
                io.to(`mozo-${data.mozoId}`).emit('notificacion-mozo', {
                    tipo: 'estado-pedido',
                    mensaje: `Pedido #${data.numeroPedido} cambió a ${data.nuevoEstado}`,
                    pedido: data
                });
            }
        });

        // ====================================================================
        // HU6: PEDIDO LISTO (NOTIFICAR AL MOZO)
        // ====================================================================
        /**
         * Cocina notifica que un pedido está listo para servir
         */
        socket.on('marcar-pedido-listo', (data) => {
            console.log(`[Socket.io] Pedido ${data.numeroPedido} marcado como LISTO`);
            
            // Notificar a todos los módulos
            io.to('cocina').emit('pedido-listo', data);
            io.to('mozos').emit('pedido-listo', data);
            io.to('caja').emit('pedido-listo', data);
            
            // Notificación especial al mozo que creó el pedido
            if (data.mozoId) {
                io.to(`mozo-${data.mozoId}`).emit('notificacion-mozo', {
                    tipo: 'pedido-listo',
                    titulo: '🔔 Pedido Listo',
                    mensaje: `El pedido #${data.numeroPedido} de la Mesa ${data.numeroMesa} está listo para servir`,
                    pedido: data,
                    prioridad: 'alta',
                    sonido: true // Indicar que debe sonar una alerta
                });
            }
        });

        // ====================================================================
        // EVENTO: CANCELAR PEDIDO
        // ====================================================================
        socket.on('cancelar-pedido-cocina', (data) => {
            console.log(`[Socket.io] Pedido ${data.numeroPedido} CANCELADO`);
            
            // Notificar a cocina que el pedido fue cancelado
            io.to('cocina').emit('pedido-cancelado', data);
            io.to('caja').emit('pedido-cancelado', data);
        });

        // ====================================================================
        // HU11: ACTUALIZACIÓN DE ESTADO DE MESAS
        // ====================================================================
        socket.on('actualizar-mesa', (data) => {
            console.log(`[Socket.io] Mesa ${data.numeroMesa} actualizada a ${data.estado}`);
            
            // Notificar a todos sobre el cambio de estado de mesa
            io.emit('mesa-actualizada', data);
        });

        // ====================================================================
        // EVENTO: MENSAJE DE CHAT (OPCIONAL)
        // ====================================================================
        /**
         * Sistema de mensajería entre cocina, mozos y caja
         */
        socket.on('enviar-mensaje', (data) => {
            console.log(`[Socket.io] Mensaje de ${socket.modulo}: ${data.mensaje}`);
            
            // Reenviar el mensaje a todos
            io.emit('mensaje-recibido', {
                de: socket.modulo,
                rol: socket.rol,
                mensaje: data.mensaje,
                timestamp: new Date()
            });
        });

        // ====================================================================
        // EVENTO: DESCONEXIÓN
        // ====================================================================
        /**
         * Se ejecuta cuando un cliente se desconecta
         */
        socket.on('disconnect', (reason) => {
            console.log(`[Socket.io] ✗ Cliente desconectado: ${socket.id}`);
            console.log(`[Socket.io]   - Razón: ${reason}`);
            
            // Eliminar del registro de usuarios conectados
            usuariosConectados.delete(socket.id);
            
            // Log de usuarios activos restantes
            console.log(`[Socket.io] Usuarios conectados: ${usuariosConectados.size}`);
        });

        // ====================================================================
        // MANEJO DE ERRORES
        // ====================================================================
        socket.on('error', (error) => {
            console.error(`[Socket.io] Error en socket ${socket.id}:`, error);
        });
    });

    // ========================================================================
    // FUNCIONES AUXILIARES
    // ========================================================================
    
    /**
     * Obtiene la lista de usuarios conectados por módulo
     */
    io.getUsuariosConectados = () => {
        const resumen = {
            total: usuariosConectados.size,
            porModulo: {
                cocina: 0,
                caja: 0,
                mozo: 0,
                admin: 0
            }
        };
        
        usuariosConectados.forEach((usuario) => {
            if (resumen.porModulo[usuario.modulo] !== undefined) {
                resumen.porModulo[usuario.modulo]++;
            }
        });
        
        return resumen;
    };

    /**
     * Envia un mensaje de broadcast a todos los clientes
     */
    io.broadcast = (evento, data) => {
        console.log(`[Socket.io] Broadcasting evento: ${evento}`);
        io.emit(evento, data);
    };

    // ========================================================================
    // LOG DE INICIALIZACIÓN EXITOSA
    // ========================================================================
    console.log('[Socket.io] ✓ Servidor de WebSockets inicializado correctamente');
    console.log('[Socket.io] Salas disponibles: general, cocina, caja, mozos, admin');
    
    return io;
};

/**
 * GUÍA DE USO DESDE EL FRONTEND
 * ========================================================================
 * 
 * 1. CONECTAR AL SERVIDOR:
 * 
 * import { io } from 'socket.io-client';
 * 
 * const socket = io('http://localhost:3000', {
 *   auth: {
 *     usuarioId: '507f1f77bcf86cd799439011',
 *     rol: 'Mozo',
 *     modulo: 'mozo'
 *   }
 * });
 * 
 * 2. ESCUCHAR EVENTOS (HU4 - Cocina):
 * 
 * socket.on('nuevo-pedido-cocina', (pedido) => {
 *   console.log('Nuevo pedido recibido:', pedido);
 *   // Mostrar notificación
 *   // Actualizar lista de pedidos
 *   // Reproducir sonido de alerta
 * });
 * 
 * 3. ESCUCHAR NOTIFICACIONES (HU6 - Mozo):
 * 
 * socket.on('notificacion-mozo', (notificacion) => {
 *   if (notificacion.tipo === 'pedido-listo') {
 *     // Mostrar alerta al mozo
 *     alert(notificacion.mensaje);
 *     // Reproducir sonido
 *     new Audio('/alert.mp3').play();
 *   }
 * });
 * 
 * 4. EMITIR EVENTOS (HU5 - Cocina marca pedido):
 * 
 * socket.emit('actualizar-estado-pedido', {
 *   pedidoId: '507f1f77bcf86cd799439011',
 *   numeroPedido: 'PED-20251111-0001',
 *   nuevoEstado: 'En Preparación',
 *   mozoId: '507f1f77bcf86cd799439012'
 * });
 * 
 * 5. SOLICITAR ESTADO INICIAL:
 * 
 * socket.on('connect', () => {
 *   socket.emit('solicitar-estado-inicial');
 * });
 * 
 * socket.on('estado-inicial', (data) => {
 *   console.log('Estado inicial recibido:', data);
 * });
 */

export default initializeSocket;
