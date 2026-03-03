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
    obtenerPedidosCaja,
    marcarPedidoListo,
    cobrarPedido
} from '../controllers/pedidos.controllers.js';
import verificarToken from '../auth/token-verify.js';
import verificarRol from '../auth/verificar-rol.js';

const router = Router();

/**
 * Rutas de Pedidos para La Vieja Estación - RestoBar
 * Implementa: HU3-HU9, RF1, RF2, RF8
 */

// Rutas de consulta general (protegidas)
// Gerente y SuperAdministrador pueden ver todos los pedidos para supervisión
router.get('/pedidos', verificarToken, obtenerPedidos);
router.get('/pedidos/:id', verificarToken, obtenerUnPedido);
router.get('/pedidos/estado/:estado', verificarToken, obtenerPedidosPorEstado);
router.get('/pedidos/mesa/:mesaId', verificarToken, obtenerPedidosPorMesa);
router.get('/pedidos/mozo/:mozoId', verificarToken, obtenerPedidosPorMozo);

// HU5: Vista de cocina - Pedidos pendientes para cocina
// Gerente y SuperAdministrador pueden ver para supervisión
router.get('/pedidos/cocina/pendientes', verificarToken, verificarRol(['EncargadoCocina', 'Gerente', 'SuperAdministrador']), obtenerPedidosCocina);

// HU7, HU8: Vista de caja - Pedidos listos para cobrar (Listo o Servido)
// Gerente y SuperAdministrador pueden ver para supervisión
router.get('/pedidos/caja/pendientes', verificarToken, verificarRol(['Cajero', 'Gerente', 'SuperAdministrador']), obtenerPedidosCaja);

// HU3: Mozo crea pedido
// ⚠️ Temporalmente sin verificarRol hasta resolver caché de Node.js
router.post('/pedidos', verificarToken, crearPedido);

// Actualizar pedido (antes de enviarlo a cocina)
// ⚠️ Temporalmente sin verificarRol
router.put('/pedidos/:id', verificarToken, actualizarPedido);

// HU5, HU6: Cambiar estado del pedido
// Cocina: Pendiente → En preparación → Listo
// Mozo: Listo → Servido
router.patch('/pedidos/:id/estado', verificarToken, cambiarEstadoPedido);

// HU6: Cocina marca pedido como "Listo" (lo envía automáticamente a caja)
// ⚠️ Temporalmente sin verificarRol
router.put('/pedidos/:id/marcar-listo', verificarToken, marcarPedidoListo);

// HU8: Cajero cobra el pedido y genera ticket
// RF2: Aplica descuento automático del 10% si es efectivo
// ⚠️ Temporalmente sin verificarRol
router.post('/pedidos/:id/cobrar', verificarToken, cobrarPedido);

// HU8 (alternativa): Registrar pago (método antiguo, mantener para compatibilidad)
router.patch('/pedidos/:id/pagar', verificarToken, verificarRol(['Cajero', 'SuperAdministrador']), registrarPago);

// Cancelar pedido
router.delete('/pedidos/:id', verificarToken, verificarRol(['Mozo', 'SuperAdministrador']), cancelarPedido);

export default router;
