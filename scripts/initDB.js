/**
 * Script de Inicialización de Base de Datos
 * La Vieja Estación - RestoBar
 * 
 * Este script crea la base de datos e inserta datos de prueba
 * para el desarrollo y testing del sistema.
 * 
 * Uso: node scripts/initDB.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const Usuario = require('../src/models/usuarioSchema');
const Mesa = require('../src/models/mesaSchema');
const Producto = require('../src/models/productoSchema');
const Pedido = require('../src/models/pedidoSchema');
const Compra = require('../src/models/compraSchema');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restobar_db';

// Datos de prueba
const usuariosData = [
    {
        nombre: 'Admin',
        apellido: 'Sistema',
        email: 'admin@restobar.com',
        password: '$2b$10$YourHashedPasswordHere', // Cambiar por hash real
        rol: 'Administrador',
        dni: '12345678',
        telefono: '1234567890',
        activo: true
    },
    {
        nombre: 'Carlos',
        apellido: 'García',
        email: 'carlos@restobar.com',
        password: '$2b$10$YourHashedPasswordHere',
        rol: 'Gerente',
        dni: '23456789',
        telefono: '1234567891',
        activo: true
    },
    {
        nombre: 'María',
        apellido: 'López',
        email: 'maria@restobar.com',
        password: '$2b$10$YourHashedPasswordHere',
        rol: 'Mozo',
        dni: '34567890',
        telefono: '1234567892',
        activo: true
    },
    {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@restobar.com',
        password: '$2b$10$YourHashedPasswordHere',
        rol: 'Cajero',
        dni: '45678901',
        telefono: '1234567893',
        activo: true
    },
    {
        nombre: 'Ana',
        apellido: 'Martínez',
        email: 'ana@restobar.com',
        password: '$2b$10$YourHashedPasswordHere',
        rol: 'Encargado de cocina',
        dni: '56789012',
        telefono: '1234567894',
        activo: true
    }
];

const mesasData = [
    { numero: 1, capacidad: 4, estado: 'Libre', ubicacion: 'Salón Principal' },
    { numero: 2, capacidad: 2, estado: 'Libre', ubicacion: 'Salón Principal' },
    { numero: 3, capacidad: 6, estado: 'Libre', ubicacion: 'Salón Principal' },
    { numero: 4, capacidad: 4, estado: 'Libre', ubicacion: 'Terraza' },
    { numero: 5, capacidad: 2, estado: 'Libre', ubicacion: 'Terraza' },
    { numero: 6, capacidad: 8, estado: 'Libre', ubicacion: 'Salón VIP' },
    { numero: 7, capacidad: 4, estado: 'Libre', ubicacion: 'Salón Principal' },
    { numero: 8, capacidad: 2, estado: 'Libre', ubicacion: 'Barra' }
];

const productosData = [
    // Bebidas
    {
        nombre: 'Coca Cola 500ml',
        descripcion: 'Gaseosa Coca Cola en botella de 500ml',
        categoria: 'Bebidas',
        precio: 1500,
        costo: 800,
        stock: 50,
        stockMinimo: 10,
        disponible: true,
        imagenUrl: '/images/productos/coca-cola.jpg'
    },
    {
        nombre: 'Agua Mineral 500ml',
        descripcion: 'Agua mineral sin gas',
        categoria: 'Bebidas',
        precio: 1000,
        costo: 500,
        stock: 60,
        stockMinimo: 15,
        disponible: true,
        imagenUrl: '/images/productos/agua.jpg'
    },
    {
        nombre: 'Cerveza Quilmes 1L',
        descripcion: 'Cerveza Quilmes en botella de 1 litro',
        categoria: 'Bebidas Alcohólicas',
        precio: 3500,
        costo: 2000,
        stock: 30,
        stockMinimo: 10,
        disponible: true,
        imagenUrl: '/images/productos/cerveza.jpg'
    },
    {
        nombre: 'Vino Tinto Copa',
        descripcion: 'Copa de vino tinto de la casa',
        categoria: 'Bebidas Alcohólicas',
        precio: 2500,
        costo: 1200,
        stock: 20,
        stockMinimo: 5,
        disponible: true,
        imagenUrl: '/images/productos/vino-tinto.jpg'
    },
    // Comidas
    {
        nombre: 'Hamburguesa Completa',
        descripcion: 'Hamburguesa con carne, queso, lechuga, tomate y papas fritas',
        categoria: 'Comidas',
        precio: 5500,
        costo: 2500,
        stock: 0,
        stockMinimo: 0,
        disponible: true,
        imagenUrl: '/images/productos/hamburguesa.jpg'
    },
    {
        nombre: 'Milanesa Napolitana',
        descripcion: 'Milanesa con jamón, queso y salsa, con papas fritas',
        categoria: 'Comidas',
        precio: 6000,
        costo: 3000,
        stock: 0,
        stockMinimo: 0,
        disponible: true,
        imagenUrl: '/images/productos/milanesa.jpg'
    },
    {
        nombre: 'Pizza Muzzarella',
        descripcion: 'Pizza grande de muzzarella (8 porciones)',
        categoria: 'Comidas',
        precio: 7000,
        costo: 3500,
        stock: 0,
        stockMinimo: 0,
        disponible: true,
        imagenUrl: '/images/productos/pizza.jpg'
    },
    {
        nombre: 'Empanadas de Carne (docena)',
        descripcion: 'Docena de empanadas de carne',
        categoria: 'Comidas',
        precio: 4500,
        costo: 2000,
        stock: 0,
        stockMinimo: 0,
        disponible: true,
        imagenUrl: '/images/productos/empanadas.jpg'
    },
    {
        nombre: 'Ensalada Caesar',
        descripcion: 'Ensalada Caesar con pollo grillado',
        categoria: 'Comidas',
        precio: 4000,
        costo: 1800,
        stock: 0,
        stockMinimo: 0,
        disponible: true,
        imagenUrl: '/images/productos/ensalada.jpg'
    },
    // Postres
    {
        nombre: 'Flan con Dulce de Leche',
        descripcion: 'Flan casero con dulce de leche y crema',
        categoria: 'Postres',
        precio: 2500,
        costo: 1000,
        stock: 0,
        stockMinimo: 0,
        disponible: true,
        imagenUrl: '/images/productos/flan.jpg'
    },
    {
        nombre: 'Helado (3 bochas)',
        descripcion: 'Helado de 3 bochas a elección',
        categoria: 'Postres',
        precio: 3000,
        costo: 1500,
        stock: 0,
        stockMinimo: 0,
        disponible: true,
        imagenUrl: '/images/productos/helado.jpg'
    }
];

async function initializeDatabase() {
    try {
        console.log('🔄 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Limpiar colecciones existentes
        console.log('\n🗑️  Limpiando colecciones existentes...');
        await Usuario.deleteMany({});
        await Mesa.deleteMany({});
        await Producto.deleteMany({});
        await Pedido.deleteMany({});
        await Compra.deleteMany({});
        console.log('✅ Colecciones limpiadas');

        // Insertar usuarios
        console.log('\n👥 Insertando usuarios...');
        const usuarios = await Usuario.insertMany(usuariosData);
        console.log(`✅ ${usuarios.length} usuarios creados`);

        // Insertar mesas
        console.log('\n🪑 Insertando mesas...');
        const mesas = await Mesa.insertMany(mesasData);
        console.log(`✅ ${mesas.length} mesas creadas`);

        // Insertar productos
        console.log('\n🍔 Insertando productos...');
        const productos = await Producto.insertMany(productosData);
        console.log(`✅ ${productos.length} productos creados`);

        // Crear un pedido de ejemplo
        console.log('\n📋 Creando pedido de ejemplo...');
        const mozo = usuarios.find(u => u.rol === 'Mozo');
        const mesa1 = mesas.find(m => m.numero === 1);
        const hamburguesaProducto = productos.find(p => p.nombre === 'Hamburguesa Completa');
        const cocaColaProducto = productos.find(p => p.nombre === 'Coca Cola 500ml');

        const pedidoEjemplo = new Pedido({
            numeroPedido: 1,
            mesa: mesa1._id,
            mozo: mozo._id,
            estado: 'Pendiente',
            productos: [
                {
                    producto: hamburguesaProducto._id,
                    nombre: hamburguesaProducto.nombre,
                    cantidad: 2,
                    precioUnitario: hamburguesaProducto.precio,
                    subtotal: hamburguesaProducto.precio * 2,
                    observaciones: 'Sin cebolla'
                },
                {
                    producto: cocaColaProducto._id,
                    nombre: cocaColaProducto.nombre,
                    cantidad: 2,
                    precioUnitario: cocaColaProducto.precio,
                    subtotal: cocaColaProducto.precio * 2
                }
            ],
            subtotal: 0, // Se calculará automáticamente
            total: 0,
            metodoPago: 'Pendiente',
            observacionesGenerales: 'Cliente prefiere la mesa del fondo'
        });

        await pedidoEjemplo.save();
        console.log('✅ Pedido de ejemplo creado');

        // Crear una compra de ejemplo
        console.log('\n🛒 Creando compra de ejemplo...');
        const admin = usuarios.find(u => u.rol === 'Administrador');

        const compraEjemplo = new Compra({
            numeroCompra: 1,
            proveedor: {
                nombre: 'Distribuidora La Central',
                cuit: '20-12345678-9',
                telefono: '011-4567-8900',
                email: 'ventas@lacentral.com',
                direccion: 'Av. Rivadavia 1234, CABA'
            },
            fechaCompra: new Date(),
            estado: 'Pendiente',
            productos: [
                {
                    nombre: 'Coca Cola 500ml - Caja x24',
                    cantidad: 3,
                    unidadMedida: 'Caja',
                    precioUnitario: 15000,
                    subtotal: 45000
                },
                {
                    nombre: 'Carne picada - 5kg',
                    cantidad: 2,
                    unidadMedida: 'Kg',
                    precioUnitario: 8000,
                    subtotal: 16000
                }
            ],
            subtotal: 0, // Se calculará automáticamente
            total: 0,
            metodoPago: 'Cuenta Corriente',
            numeroFactura: 'A-0001-00000123',
            tipoComprobante: 'Factura A',
            registradoPor: admin._id,
            observaciones: 'Primera compra del mes'
        });

        await compraEjemplo.save();
        console.log('✅ Compra de ejemplo creada');

        // Actualizar estado de la mesa del pedido
        mesa1.estado = 'Ocupada';
        await mesa1.save();
        console.log('✅ Estado de mesa actualizado');

        console.log('\n✨ ¡Base de datos inicializada correctamente!');
        console.log('\n📊 Resumen:');
        console.log(`   - ${usuarios.length} usuarios`);
        console.log(`   - ${mesas.length} mesas`);
        console.log(`   - ${productos.length} productos`);
        console.log(`   - 1 pedido de ejemplo`);
        console.log(`   - 1 compra de ejemplo`);
        console.log('\n💡 Credenciales de prueba:');
        console.log('   Email: admin@restobar.com');
        console.log('   Password: admin123 (debe configurar el hash)');

    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexión cerrada');
    }
}

// Ejecutar el script
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('\n✅ Script completado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { initializeDatabase };
