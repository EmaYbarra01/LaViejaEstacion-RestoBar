/**
 * ============================================================================
 * SERVIDOR PRINCIPAL - INTEGRACIÓN HU3 Y HU4
 * ============================================================================
 * 
 * Este archivo muestra cómo integrar los controladores y rutas de las
 * Historias de Usuario 3 y 4 en el servidor principal.
 * 
 * PASOS DE INTEGRACIÓN:
 * 1. Importar dependencias
 * 2. Configurar Express
 * 3. Inicializar Socket.io
 * 4. Registrar rutas
 * 5. Iniciar servidor
 */

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Conexión a base de datos
import dbConnection from './database/dbConnection.js';

// Socket.io
import { initializeSocket } from './config/socket.config.js';

// Rutas existentes
import authRoutes from './routes/auth.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import mesasRoutes from './routes/mesas.routes.js';
import productosRoutes from './routes/productos.routes.js';

// ============================================================================
// ✨ NUEVAS RUTAS HU3 Y HU4
// ============================================================================
import pedidosRoutes from './routes/pedidos.routes.HU3-HU4.js';

// Cargar variables de entorno
dotenv.config();

// ============================================================================
// CONFIGURACIÓN DE EXPRESS
// ============================================================================
const app = express();
const PORT = process.env.PORT || 3000;

// Crear servidor HTTP
const httpServer = createServer(app);

// ============================================================================
// MIDDLEWARES GLOBALES
// ============================================================================

// 1. CORS - Permitir peticiones desde el frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// 2. Body Parser - Parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Morgan - Logger de peticiones HTTP
app.use(morgan('dev'));

// 4. Archivos estáticos (opcional)
app.use(express.static('public'));

// ============================================================================
// INICIALIZAR SOCKET.IO (HU4)
// ============================================================================
/**
 * Socket.io se inicializa aquí y se guarda en Express para
 * poder accederlo desde los controladores
 */
const io = initializeSocket(httpServer);
app.set('io', io); // Guardar en Express

console.log('[Server] ✓ Socket.io inicializado');

// ============================================================================
// CONECTAR A BASE DE DATOS
// ============================================================================
dbConnection()
    .then(() => {
        console.log('[Server] ✓ Conectado a MongoDB');
    })
    .catch((error) => {
        console.error('[Server] ✗ Error al conectar a MongoDB:', error);
        process.exit(1); // Salir si no se puede conectar a la BD
    });

// ============================================================================
// RUTAS DE LA API
// ============================================================================

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        mensaje: 'API - La Vieja Estación RestoBar',
        version: '2.0',
        status: 'Activo',
        documentacion: '/api/docs',
        socket: 'Activo',
        timestamp: new Date()
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        mongodb: 'Conectado',
        socket: 'Activo'
    });
});

// ============================================================================
// REGISTRAR RUTAS DE LA API
// ============================================================================

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de usuarios
app.use('/api/usuarios', usuariosRoutes);

// Rutas de mesas
app.use('/api/mesas', mesasRoutes);

// Rutas de productos
app.use('/api/productos', productosRoutes);

// ============================================================================
// ✨ NUEVAS RUTAS - HU3 Y HU4
// ============================================================================
/**
 * Registrar las rutas de pedidos que implementan:
 * - HU3: Registro de pedidos por el mozo
 * - HU4: Envío automático a cocina
 */
app.use('/api/pedidos', pedidosRoutes);

console.log('[Server] ✓ Rutas HU3 y HU4 registradas en /api/pedidos');

// ============================================================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ============================================================================

// Ruta no encontrada (404)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        mensaje: 'Ruta no encontrada',
        ruta: req.originalUrl,
        metodo: req.method
    });
});

// Manejo de errores global
app.use((error, req, res, next) => {
    console.error('[Server] Error:', error);
    
    res.status(error.status || 500).json({
        success: false,
        mensaje: error.message || 'Error interno del servidor',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
});

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================

httpServer.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                                                            ║');
    console.log('║         🍺 LA VIEJA ESTACIÓN - RESTOBAR 🍺                 ║');
    console.log('║              Sistema POS - Versión 2.0                     ║');
    console.log('║                                                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`[Server] ✓ Servidor HTTP corriendo en puerto ${PORT}`);
    console.log(`[Server] ✓ URL: http://localhost:${PORT}`);
    console.log(`[Server] ✓ Socket.io: Activo`);
    console.log(`[Server] ✓ MongoDB: Conectado`);
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  HISTORIAS DE USUARIO IMPLEMENTADAS:                      ║');
    console.log('║                                                            ║');
    console.log('║  ✅ HU3: Registro de pedidos por el mozo                   ║');
    console.log('║      POST   /api/pedidos                                   ║');
    console.log('║      GET    /api/pedidos/mis-pedidos                       ║');
    console.log('║      PUT    /api/pedidos/:id/items                         ║');
    console.log('║      DELETE /api/pedidos/:id                               ║');
    console.log('║                                                            ║');
    console.log('║  ✅ HU4: Envío automático a cocina                         ║');
    console.log('║      GET    /api/pedidos/cocina                            ║');
    console.log('║      Socket.io: nuevo-pedido-cocina                        ║');
    console.log('║                                                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('[Server] Presiona CTRL+C para detener el servidor');
    console.log('');
});

// ============================================================================
// MANEJO DE SEÑALES DE TERMINACIÓN
// ============================================================================

/**
 * Manejo graceful shutdown
 * Cierra conexiones activas antes de terminar el proceso
 */
const gracefulShutdown = async () => {
    console.log('');
    console.log('[Server] Recibida señal de terminación...');
    console.log('[Server] Cerrando servidor HTTP...');
    
    httpServer.close(() => {
        console.log('[Server] ✓ Servidor HTTP cerrado');
    });
    
    // Cerrar conexiones de Socket.io
    io.close(() => {
        console.log('[Server] ✓ Socket.io cerrado');
    });
    
    // Cerrar conexión a MongoDB
    try {
        await dbConnection.close();
        console.log('[Server] ✓ MongoDB desconectado');
    } catch (error) {
        console.error('[Server] Error al cerrar MongoDB:', error);
    }
    
    console.log('[Server] ✓ Apagado completado');
    process.exit(0);
};

// Escuchar señales de terminación
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('[Server] ✗ Promesa rechazada no manejada:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('[Server] ✗ Excepción no capturada:', error);
    process.exit(1);
});

// ============================================================================
// EXPORTAR APP Y SERVER (para tests)
// ============================================================================

export { app, httpServer, io };
export default app;
