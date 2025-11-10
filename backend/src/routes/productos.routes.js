import { Router } from 'express';
import {
    obtenerProductos,
    obtenerUnProducto,
    obtenerProductosPorCategoria,
    obtenerProductosParaReposicion,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    actualizarStock,
    cambiarDisponibilidad
    // TODO: Implementar estas funciones en productos.controllers.js
    // obtenerProductosDisponibles (para menú público),
    // buscarProductos
} from '../controllers/productos.controllers.js';
import validarProducto from '../helpers/validarProducto.js';
import verificarToken from '../auth/token-verify.js';
import verificarRol from '../auth/verificar-rol.js';

const router = Router();

/**
 * Rutas de Productos para La Vieja Estación - RestoBar
 * Implementa: HU2, HU10, RF4
 */

// Rutas públicas (accesibles por clientes y QR)
// HU1, HU2: Menú digital accesible desde QR
router.get('/productos/menu', obtenerProductosDisponibles);
router.get('/productos/menu/categoria/:categoria', obtenerProductosPorCategoria);

// Rutas protegidas - Consulta (Mozo, Cajero, Cocina, Gerente, Admin)
router.get('/productos', verificarToken, obtenerProductos);
// TODO: Implementar buscarProductos
// router.get('/productos/buscar', verificarToken, buscarProductos);
router.get('/productos/bajo-stock', verificarToken, verificarRol(['Administrador', 'Gerente']), obtenerProductosParaReposicion);
router.get('/productos/:id', verificarToken, obtenerUnProducto);

// Rutas protegidas - Gestión (Solo Administrador y Gerente)
// RF4: Gestionar menú de productos
router.post('/productos', verificarToken, verificarRol(['Administrador', 'Gerente']), validarProducto, crearProducto);
router.put('/productos/:id', verificarToken, verificarRol(['Administrador', 'Gerente']), validarProducto, actualizarProducto);
router.delete('/productos/:id', verificarToken, verificarRol(['Administrador', 'Gerente']), eliminarProducto);

// HU10: Activar/desactivar productos en tiempo real
router.patch('/productos/:id/disponibilidad', verificarToken, verificarRol(['Administrador', 'Gerente']), cambiarDisponibilidad);

// Actualizar stock (Administrador, Gerente)
router.patch('/productos/:id/stock', verificarToken, verificarRol(['Administrador', 'Gerente']), actualizarStock);

export default router;