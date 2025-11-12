import { Router } from 'express';
import {
    obtenerCompras,
    obtenerUnaCompra,
    obtenerComprasPorProveedor,
    obtenerComprasPendientesPago,
    crearCompra,
    actualizarCompra,
    eliminarCompra,
    cambiarEstadoCompra,
    registrarRecepcion,
    registrarPagoCompra
} from '../controllers/compras.controllers.js';
import verificarToken from '../auth/token-verify.js';
import verificarRol from '../auth/verificar-rol.js';

const router = Router();

/**
 * Rutas de Compras para La Vieja Estación - RestoBar
 * Implementa: HU13, RF5
 */

// Rutas de consulta (Solo Administrador y Gerente)
router.get('/compras', verificarToken, verificarRol(['Administrador', 'Gerente']), obtenerCompras);
router.get('/compras/pendientes-pago', verificarToken, verificarRol(['Administrador', 'Gerente']), obtenerComprasPendientesPago);
router.get('/compras/proveedor/:proveedor', verificarToken, verificarRol(['Administrador', 'Gerente']), obtenerComprasPorProveedor);
router.get('/compras/:id', verificarToken, verificarRol(['Administrador', 'Gerente']), obtenerUnaCompra);

// HU13: Registrar compras a proveedores
router.post('/compras', verificarToken, verificarRol(['Administrador', 'Gerente']), crearCompra);

// Actualizar compra
router.put('/compras/:id', verificarToken, verificarRol(['Administrador', 'Gerente']), actualizarCompra);

// Eliminar compra
router.delete('/compras/:id', verificarToken, verificarRol(['Administrador', 'Gerente']), eliminarCompra);

// Cambiar estado de compra (Pendiente, Recibida, Parcial, Cancelada)
router.patch('/compras/:id/estado', verificarToken, verificarRol(['Administrador', 'Gerente']), cambiarEstadoCompra);

// Registrar recepción de mercadería
router.patch('/compras/:id/recepcion', verificarToken, verificarRol(['Administrador', 'Gerente']), registrarRecepcion);

// Registrar pago de compra
router.patch('/compras/:id/pago', verificarToken, verificarRol(['Administrador', 'Gerente']), registrarPagoCompra);

export default router;
