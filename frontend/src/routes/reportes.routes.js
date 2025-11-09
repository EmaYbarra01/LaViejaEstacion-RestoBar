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
router.get('/reportes/ventas/fecha', verificarToken, verificarRol(['Administrador', 'Gerente']), reporteVentasPorFecha);
router.get('/reportes/ventas/producto', verificarToken, verificarRol(['Administrador', 'Gerente']), reporteVentasPorProducto);
router.get('/reportes/ventas/mozo', verificarToken, verificarRol(['Administrador', 'Gerente']), reporteVentasPorMozo);
router.get('/reportes/ventas/metodo-pago', verificarToken, verificarRol(['Administrador', 'Gerente']), reporteVentasPorMetodoPago);
router.get('/reportes/ventas/diario', verificarToken, verificarRol(['Administrador', 'Gerente']), reporteVentasDiario);
router.get('/reportes/ventas/mensual', verificarToken, verificarRol(['Administrador', 'Gerente']), reporteVentasMensual);

// HU13: Reportes de compras
router.get('/reportes/compras', verificarToken, verificarRol(['Administrador', 'Gerente']), reporteCompras);

// Reportes de productos
router.get('/reportes/productos/mas-vendidos', verificarToken, verificarRol(['Administrador', 'Gerente']), reporteProductosMasVendidos);
router.get('/reportes/productos/bajo-stock', verificarToken, verificarRol(['Administrador', 'Gerente']), reporteProductosBajoStock);

// HU14: Reportes de cierres de caja
router.get('/reportes/cierres-caja', verificarToken, verificarRol(['Administrador', 'Gerente']), reporteCierresCaja);

// Resumen diario completo
router.get('/reportes/resumen-diario', verificarToken, verificarRol(['Administrador', 'Gerente']), reporteResumenDiario);

export default router;
