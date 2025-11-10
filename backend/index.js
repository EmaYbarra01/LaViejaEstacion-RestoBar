import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import './src/database/dbConnection.js';

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Importar todas las rutas del sistema
import authRoutes from './src/routes/auth.routes.js';
import usuariosRoutes from './src/routes/usuarios.routes.js';
import productosRoutes from './src/routes/productos.routes.js';
import pedidosRoutes from './src/routes/pedidos.routes.js';
import mesasRoutes from './src/routes/mesas.routes.js';
// import comprasRoutes from './src/routes/compras.routes.js'; // Temporalmente comentado
// import cierreCajaRoutes from './src/routes/cierreCaja.routes.js'; // Temporalmente comentado
// import reportesRoutes from './src/routes/reportes.routes.js'; // Temporalmente comentado
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
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

// Registrar todas las rutas bajo el prefijo /api
app.use('/api', authRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', productosRoutes);
app.use('/api', pedidosRoutes);
app.use('/api', mesasRoutes);
// app.use('/api', comprasRoutes); // Temporalmente comentado
// app.use('/api', cierreCajaRoutes); // Temporalmente comentado
// app.use('/api', reportesRoutes); // Temporalmente comentado
app.use('/api', salesRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API La Vieja Estación RestoBar',
    version: '1.0.0',
    estado: 'Activo',
    rutas_disponibles: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      productos: '/api/productos',
      pedidos: '/api/pedidos',
      mesas: '/api/mesas',
      compras: '/api/compras',
      cierreCaja: '/api/cierre-caja',
      reportes: '/api/reportes',
      sales: '/api/sales'
    }
  });
});

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    mensaje: 'Ruta no encontrada',
    ruta_solicitada: req.originalUrl
  });
});

// Iniciar servidor
app.set('port', process.env.PORT || 4000);
app.listen(app.get('port'), () => {
    console.log(`✅ Servidor activo en el puerto ${app.get('port')}`);
    console.log(`🌐 URL: http://localhost:${app.get('port')}`);
    console.log(`📚 API Docs: http://localhost:${app.get('port')}/api`);
});