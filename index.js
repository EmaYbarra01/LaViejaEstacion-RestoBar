import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import './src/database/dbConnection.js';

// Rutas de autenticación
import authRoutes from './src/routes/auth.routes.js';

// Rutas principales del RestoBar
import productosRoutes from './src/routes/productos.routes.js';
import pedidosRoutes from './src/routes/pedidos.routes.js';
import mesasRoutes from './src/routes/mesas.routes.js';
import comprasRoutes from './src/routes/compras.routes.js';
import usuariosRoutes from './src/routes/usuarios.routes.js';
import reportesRoutes from './src/routes/reportes.routes.js';
import cierreCajaRoutes from './src/routes/cierreCaja.routes.js';

// Rutas antiguas (mantener para compatibilidad)
import userRoutes from './src/routes/users.routes.js';
import productRoutes from './src/routes/products.routes.js';
import salesRoutes from './src/routes/sales.routes.js';

const app = express();

//middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Múltiples orígenes permitidos
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas principales del RestoBar
app.use('/api', productosRoutes);
app.use('/api', pedidosRoutes);
app.use('/api', mesasRoutes);
app.use('/api', comprasRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', reportesRoutes);
app.use('/api', cierreCajaRoutes);

// Rutas antiguas (mantener para compatibilidad)
app.use('/api', userRoutes, productRoutes, salesRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        ok: true,
        mensaje: 'API RestoBar funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        ok: false,
        mensaje: err.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Ruta no encontrada (404)
app.use((req, res) => {
    res.status(404).json({
        ok: false,
        mensaje: 'Ruta no encontrada'
    });
});

app.set('port', process.env.PORT || 4000);
app.listen(app.get('port'), () => {
    console.log(`Servidor en el puerto ${app.get('port')}`);
});