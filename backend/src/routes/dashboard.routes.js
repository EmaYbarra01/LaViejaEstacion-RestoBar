import { Router } from 'express';
import verificarToken from '../auth/token-verify.js';
import verificarRol from '../auth/verificar-rol.js';
import { 
  obtenerEstadisticasDashboard 
} from '../controllers/dashboard.controller.js';

const router = Router();

/**
 * @route   GET /api/dashboard/estadisticas
 * @desc    Obtener estadísticas completas del dashboard (ventas, categorías, top productos, stock)
 * @access  SuperAdministrador, Gerente
 */
router.get('/dashboard/estadisticas', 
  verificarToken, 
  verificarRol(['SuperAdministrador', 'Gerente']), 
  obtenerEstadisticasDashboard
);

export default router;
