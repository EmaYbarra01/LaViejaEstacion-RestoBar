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
router.get('/compras', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), obtenerCompras);
router.get('/compras/pendientes-pago', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), obtenerComprasPendientesPago);
router.get('/compras/proveedor/:proveedor', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), obtenerComprasPorProveedor);
router.get('/compras/:id', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), obtenerUnaCompra);

// HU13: Registrar compras a proveedores
router.post('/compras', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), crearCompra);

// Actualizar compra
router.put('/compras/:id', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), actualizarCompra);

// Eliminar compra
router.delete('/compras/:id', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), eliminarCompra);

// Cambiar estado de compra (Pendiente, Recibida, Parcial, Cancelada)
router.patch('/compras/:id/estado', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), cambiarEstadoCompra);

// Registrar recepción de mercadería
router.patch('/compras/:id/recepcion', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), registrarRecepcion);

// Registrar pago de compra
router.patch('/compras/:id/pago', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), registrarPagoCompra);

export default router;
