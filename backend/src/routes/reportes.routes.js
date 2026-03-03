import { Router } from 'express';
import {
    reporteVentasPorFecha,
    reporteVentasPorProducto,
    reporteVentasPorMozo,
    reporteVentasPorMetodoPago,
    reporteVentasDiario,
    reporteVentasMensual,
    reporteCompras,
    reporteProductosMasVendidos,
    reporteProductosBajoStock,
    reporteResumenDiario,
    reporteCierresCaja
} from '../controllers/reportes.controllers.js';
import verificarToken from '../auth/token-verify.js';
import verificarRol from '../auth/verificar-rol.js';

const router = Router();

/**
 * Rutas de Reportes para La Vieja Estación - RestoBar
 * Implementa: HU9, HU15, RF7
 */

// Todas las rutas de reportes requieren autenticación y rol Administrador o Gerente

// HU15: Reportes de ventas
router.get('/reportes/ventas/fecha', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), reporteVentasPorFecha);
router.get('/reportes/ventas/producto', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), reporteVentasPorProducto);
router.get('/reportes/ventas/mozo', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), reporteVentasPorMozo);
router.get('/reportes/ventas/metodo-pago', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), reporteVentasPorMetodoPago);
router.get('/reportes/ventas/diario', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), reporteVentasDiario);
router.get('/reportes/ventas/mensual', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), reporteVentasMensual);

// HU13: Reportes de compras
router.get('/reportes/compras', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), reporteCompras);

// Reportes de productos
router.get('/reportes/productos/mas-vendidos', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), reporteProductosMasVendidos);
router.get('/reportes/productos/bajo-stock', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), reporteProductosBajoStock);

// HU14: Reportes de cierres de caja
router.get('/reportes/cierres-caja', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), reporteCierresCaja);

// Resumen diario completo
router.get('/reportes/resumen-diario', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), reporteResumenDiario);

export default router;
