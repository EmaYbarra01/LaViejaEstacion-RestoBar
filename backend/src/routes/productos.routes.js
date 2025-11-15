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
    cambiarDisponibilidad,
    obtenerMenuPublico
} from '../controllers/productos.controllers.js';
import validarProducto from '../helpers/validarProducto.js';
import verificarToken from '../auth/token-verify.js';
import verificarRol from '../auth/verificar-rol.js';

const router = Router();

/**
 * Rutas de Productos para La Vieja Estación - RestoBar
 * Implementa: HU1, HU2, HU10, RF4
 */

// ===== RUTAS PÚBLICAS (SIN AUTENTICACIÓN) =====
// HU1: Menú digital accesible desde código QR
router.get('/menu', obtenerMenuPublico);
router.get('/productos/menu/categoria/:categoria', obtenerProductosPorCategoria);

// Rutas protegidas - Consulta (Mozo, Cajero, Cocina, Gerente, Admin)
router.get('/productos', verificarToken, obtenerProductos);
// TODO: Implementar buscarProductos
// router.get('/productos/buscar', verificarToken, buscarProductos);
router.get('/productos/bajo-stock', verificarToken, verificarRol(['SuperAdministrador', 'SuperAdministrador', 'Gerente']), obtenerProductosParaReposicion);
router.get('/productos/:id', verificarToken, obtenerUnProducto);

// Rutas protegidas - Gestión (Solo Administrador, Gerente y SuperAdministrador)
// RF4: Gestionar menú de productos
router.post('/productos', verificarToken, verificarRol(['SuperAdministrador', 'SuperAdministrador', 'Gerente']), validarProducto, crearProducto);
router.put('/productos/:id', verificarToken, verificarRol(['SuperAdministrador', 'SuperAdministrador', 'Gerente']), validarProducto, actualizarProducto);
router.delete('/productos/:id', verificarToken, verificarRol(['SuperAdministrador', 'SuperAdministrador', 'Gerente']), eliminarProducto);

// HU10: Activar/desactivar productos en tiempo real
router.patch('/productos/:id/disponibilidad', verificarToken, verificarRol(['SuperAdministrador', 'SuperAdministrador', 'Gerente']), cambiarDisponibilidad);

// Actualizar stock (Administrador, Gerente, SuperAdministrador)
router.patch('/productos/:id/stock', verificarToken, verificarRol(['SuperAdministrador', 'SuperAdministrador', 'Gerente']), actualizarStock);

export default router;
