import { Router } from 'express';
import {
    obtenerPedidos,
    obtenerUnPedido,
    obtenerPedidosPorEstado,
    obtenerPedidosPorMesa,
    obtenerPedidosPorMozo,
    crearPedido,
    actualizarPedido,
    cambiarEstadoPedido,
    registrarPago,
    cancelarPedido,
    obtenerPedidosCocina,
    obtenerPedidosCaja
} from '../controllers/pedidos.controllers.js';
import verificarToken from '../auth/token-verify.js';
import verificarRol from '../auth/verificar-rol.js';

const router = Router();

/**
 * Rutas de Pedidos para La Vieja Estación - RestoBar
 * Implementa: HU3-HU9, RF1, RF2, RF8
 */

// Rutas de consulta general (protegidas)
router.get('/pedidos', verificarToken, obtenerPedidos);
router.get('/pedidos/:id', verificarToken, obtenerUnPedido);
router.get('/pedidos/estado/:estado', verificarToken, obtenerPedidosPorEstado);
router.get('/pedidos/mesa/:mesaId', verificarToken, obtenerPedidosPorMesa);
router.get('/pedidos/mozo/:mozoId', verificarToken, obtenerPedidosPorMozo);

// HU5: Vista de cocina - Pedidos pendientes para cocina
router.get('/pedidos/cocina/pendientes', verificarToken, verificarRol(['Cocina', 'Administrador']), obtenerPedidosCocina);

// HU8: Vista de caja - Pedidos listos para cobrar
router.get('/pedidos/caja/pendientes', verificarToken, verificarRol(['Cajero', 'Administrador']), obtenerPedidosCaja);

// HU3: Mozo crea pedido
router.post('/pedidos', verificarToken, verificarRol(['Mozo', 'Administrador']), crearPedido);

// Actualizar pedido (antes de enviarlo a cocina)
router.put('/pedidos/:id', verificarToken, verificarRol(['Mozo', 'Administrador']), actualizarPedido);

// HU5, HU6: Cambiar estado del pedido
// Cocina: Pendiente → En preparación → Listo
// Mozo: Listo → Servido
router.patch('/pedidos/:id/estado', verificarToken, cambiarEstadoPedido);

// HU8: Cajero registra el pago
// RF2: Aplica descuento automático del 10% si es efectivo
router.patch('/pedidos/:id/pagar', verificarToken, verificarRol(['Cajero', 'Administrador']), registrarPago);

// Cancelar pedido
router.delete('/pedidos/:id', verificarToken, verificarRol(['Mozo', 'Administrador']), cancelarPedido);

export default router;
