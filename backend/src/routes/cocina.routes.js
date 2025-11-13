import { Router } from 'express';
import {
  getPedidosCocina,
  updateEstadoPedido,
  getEstadisticasCocina,
  getPedidoDetalle
} from '../controllers/cocina.controllers.js';
import verificarToken from '../auth/token-verify.js';
import { requireCocina } from '../middlewares/requireRole.middleware.js';

const router = Router();

/**
 * RUTAS DE COCINA
 * Específicas para el rol EncargadoCocina
 * Basadas en HU5 y HU6
 * 
 * Todas las rutas requieren:
 * 1. Token JWT válido (verificarToken)
 * 2. Rol: EncargadoCocina, Cocina o Administrador (requireCocina)
 */

// Obtener lista de pedidos para cocina
// GET /api/cocina/pedidos?estado=Pendiente&limit=50
router.get(
  '/pedidos',
  verificarToken,
  requireCocina,
  getPedidosCocina
);

// Obtener detalle de un pedido específico
// GET /api/cocina/pedidos/:id
router.get(
  '/pedidos/:id',
  verificarToken,
  requireCocina,
  getPedidoDetalle
);

// Actualizar estado de un pedido
// PATCH /api/cocina/pedidos/:id/estado
// Body: { estado: 'En Preparación', observacion: 'opcional' }
router.patch(
  '/pedidos/:id/estado',
  verificarToken,
  requireCocina,
  updateEstadoPedido
);

// Obtener estadísticas de cocina
// GET /api/cocina/estadisticas
router.get(
  '/estadisticas',
  verificarToken,
  requireCocina,
  getEstadisticasCocina
);

export default router;
