/**
 * Script de Inicialización de Base de Datos
 * La Vieja Estación - RestoBar
 * 
 * Este script crea la base de datos e inserta datos de prueba
 * para el desarrollo y testing del sistema.
 * 
 * Uso: node scripts/initDB.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Importar modelos
import Usuario from '../src/models/usuarioSchema.js';
import Mesa from '../src/models/mesaSchema.js';
import Producto from '../src/models/productoSchema.js';
import Pedido from '../src/models/pedidoSchema.js';
import Compra from '../src/models/compraSchema.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restobar_db';

// Datos de prueba
const usuariosData = [
    {
        nombre: 'Juan',
        apellido: 'Suarez',
        email: 'juan@restobar.com',
        password: 'SA007', // Cambiar por hash real
        rol: 'SuperAdministrador',
        dni: '33245128',
        telefono: '3815498754',
        activo: true
    },
    {
        nombre: 'Carlos',
        apellido: 'García',
        email: 'carlos@restobar.com',
        password: 'GER123',
        rol: 'Gerente',
        dni: '23456789',
        telefono: '3814265138',
        activo: true
    },
    {
        nombre: 'María',
        apellido: 'López',
        email: 'maria@restobar.com',
        password: 'MOZ123',
        rol: 'Mozo',
        dni: '34567890',
        telefono: '3875423612',
        activo: true
    },
    {
        nombre: 'Mario',
        apellido: 'García',
        email: 'mario@restobar.com',
        password: 'MOZ124',
        rol: 'Mozo',
        dni: '31889890',
        telefono: '3815463612',
        activo: true
    },
    {
        nombre: 'Miguel',
        apellido: 'Ramírez',
        email: 'miguel@restobar.com',
        password: 'CAJ123',
        rol: 'Cajero',
        dni: '45678901',
        telefono: '3816477331',
        activo: true
    },
    {
        nombre: 'Ana',
        apellido: 'Martínez',
        email: 'ana@restobar.com',
        password: 'COC123',
        rol: 'EncargadoCocina',
        dni: '56789012',
        telefono: '386459157',
        activo: true
    }
];

const mesasData = [
    { numero: 1, capacidad: 4, estado: 'Libre', ubicacion: 'Salón Principal' },
    { numero: 2, capacidad: 2, estado: 'Libre', ubicacion: 'Salón Principal' },
    { numero: 3, capacidad: 6, estado: 'Libre', ubicacion: 'Salón Principal' },
    { numero: 4, capacidad: 4, estado: 'Libre', ubicacion: 'Salón Principal' },
    { numero: 5, capacidad: 2, estado: 'Libre', ubicacion: 'Salón Principal' },
    { numero: 6, capacidad: 8, estado: 'Libre', ubicacion: 'Salón VIP' },
    { numero: 7, capacidad: 4, estado: 'Libre', ubicacion: 'Salón VIP' },
    { numero: 8, capacidad: 2, estado: 'Libre', ubicacion: 'Salón VIP' }
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
        imagenUrl: '/images/productos/agua-mineral-500ml.jpg'
        
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
        imagenUrl: '/images/productos/cerveza-quilmes-1l.jpg'
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
        imagenUrl: '/images/productos/vino-tinto-copa.jpg'
    },

    {
        nombre: 'Vino Blanco Copa',
        descripcion: 'Copa de vino blanco de la casa',
        categoria: 'Bebidas Alcohólicas',
        precio: 2500,
        costo: 1200,
        stock: 20,
        stockMinimo: 5,
        disponible: true,
        imagenUrl: '/images/productos/vino-blanco-copa.jpg'
    },

    // Comidas
    {
        nombre: 'Hamburguesa Completa',
        descripcion: 'Hamburguesa con carne, queso, lechuga, tomate y papas fritas',
        categoria: 'Comidas',
        precio: 5500,
        costo: 2500,
        stock: 20,
        stockMinimo: 5,
        disponible: true,
        imagenUrl: '/images/productos/hamburguesa-completa.jpg'
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
        imagenUrl: '/images/productos/milanesa-napolitana.jpg'
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
        imagenUrl: '/images/productos/pizza-muzzarella.jpg'
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
        imagenUrl: '/images/productos/empanadas-de-carne.jpeg'
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
        imagenUrl: '/images/productos/ensalada-cesar.jpg'
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
        imagenUrl: '/images/productos/flan-dulce-leche.jpg'
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
        imagenUrl: '/images/productos/helado-3-bochas.jpg'
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

        // Insertar usuarios con contraseñas hasheadas
        console.log('\n👥 Insertando usuarios...');
        const usuarios = [];
        
        for (const userData of usuariosData) {
            try {
                // Hashear la contraseña antes de crear el usuario
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(userData.password, salt);
                
                const usuario = await Usuario.create({
                    ...userData,
                    password: hashedPassword
                });
                
                usuarios.push(usuario);
                console.log(`   ✓ ${usuario.nombre} ${usuario.apellido} (${usuario.rol})`);
            } catch (error) {
                console.error(`   ✗ Error al crear ${userData.nombre}:`, error.message);
            }
        }
        
        console.log(`✅ ${usuarios.length} usuarios creados de ${usuariosData.length} intentados`);

        // Insertar mesas
        console.log('\n🪑 Insertando mesas...');
        const mesas = await Mesa.insertMany(mesasData);
        console.log(`✅ ${mesas.length} mesas creadas`);

        // Insertar productos
        console.log('\n🍔 Insertando productos...');
        const productos = [];
        
        for (const productoData of productosData) {
            try {
                const producto = await Producto.create(productoData);
                productos.push(producto);
                console.log(`   ✓ ${producto.nombre} creado`);
            } catch (error) {
                console.error(`   ✗ Error al crear ${productoData.nombre}:`, error.message);
            }
        }
        
        console.log(`✅ ${productos.length} productos creados de ${productosData.length} intentados`);
        
        // Verificar que los productos estén realmente en la BD
        const countProductos = await Producto.countDocuments();
        console.log(`📊 Verificación: ${countProductos} productos en la base de datos`);

        // Crear un pedido de ejemplo
        console.log('\n📋 Creando pedido de ejemplo...');
        const mozo = usuarios.find(u => u.rol === 'Mozo1' || u.rol === 'Mozo2');
        const mesa1 = mesas.find(m => m.numero === 1);
        const hamburguesaProducto = productos.find(p => p.nombre === 'Hamburguesa Completa');
        const cocaColaProducto = productos.find(p => p.nombre === 'Coca Cola 500ml');
        
        console.log('Mozo encontrado:', mozo ? mozo.nombre : 'NO ENCONTRADO');
        console.log('Mesa encontrada:', mesa1 ? mesa1.numero : 'NO ENCONTRADA');
        console.log('Hamburguesa encontrada:', hamburguesaProducto ? hamburguesaProducto.nombre : 'NO ENCONTRADA');
        console.log('Coca Cola encontrada:', cocaColaProducto ? cocaColaProducto.nombre : 'NO ENCONTRADA');

        const pedidoEjemplo = new Pedido({
            numeroPedido: 1,
            mesa: mesa1._id,
            numeroMesa: mesa1.numero,
            mozo: mozo._id,
            nombreMozo: `${mozo.nombre} ${mozo.apellido}`,
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
        const admin = usuarios.find(u => u.rol === 'SuperAdministrador' || u.rol === 'Gerente');

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
initializeDatabase()
    .then(() => {
        console.log('\n✅ Script completado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error fatal:', error);
        process.exit(1);
    });

export { initializeDatabase };
