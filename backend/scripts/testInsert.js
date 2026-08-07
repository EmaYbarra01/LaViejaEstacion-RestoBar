import mongoose from 'mongoose';
import Producto from '../src/models/productoSchema.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restobar_db';

const testProducto = {
    nombre: 'Coca Cola 500ml TEST',
    descripcion: 'Gaseosa Coca Cola en botella de 500ml',
    categoria: 'Bebidas',
    precio: 1500,
    costo: 800,
    stock: 50,
    stockMinimo: 10,
    disponible: true,
    imagenUrl: '/images/productos/coca-cola.jpg'
};

async function test() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Conectado');
        
        const result = await Producto.create(testProducto);
        console.log('Producto creado:', result);
        
        const count = await Producto.countDocuments();
        console.log('Total productos:', count);
        
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

test();
