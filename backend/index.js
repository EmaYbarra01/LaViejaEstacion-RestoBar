import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import './src/database/dbConnection.js';
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
app.use('/api', userRoutes, productRoutes, salesRoutes );
app.set('port', process.env.PORT || 4000);
app.listen(app.get('port'), () => {
    console.log(`Servidor en el puerto ${app.get('port')}`);
});