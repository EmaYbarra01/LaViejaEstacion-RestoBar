import { Router } from 'express';
import {
    obtenerCierresCaja,
    obtenerUnCierreCaja,
    obtenerCierresCajaPorFecha,
    obtenerCierresCajaPorTurno,
    crearCierreCaja,
    actualizarCierreCaja,
    revisarCierreCaja,
    obtenerCierreActivo,
    obtenerPedidosPendientesCierre,
    agregarPedidoACierre,
    obtenerUltimoCierre,
    reporteCierres
} from '../controllers/cierreCaja.controllers.js';
import verificarToken from '../auth/token-verify.js';
import verificarRol from '../auth/verificar-rol.js';

const router = Router();

/**
 * Rutas de Cierre de Caja para La Vieja Estación - RestoBar
 * Implementa: HU14, RN6
 */

// Rutas de consulta (Solo Cajero, Administrador y Gerente)
router.get('/cierres-caja', verificarToken, verificarRol(['Cajero', 'SuperAdministrador', 'Gerente']), obtenerCierresCaja);
router.get('/cierres-caja/activo', verificarToken, verificarRol(['Cajero', 'SuperAdministrador', 'Gerente']), obtenerCierreActivo);
router.get('/cierres-caja/ultimo', verificarToken, verificarRol(['Cajero', 'SuperAdministrador', 'Gerente']), obtenerUltimoCierre);
router.get('/cierres-caja/reporte', verificarToken, verificarRol(['Cajero', 'SuperAdministrador', 'Gerente']), reporteCierres);
router.get('/cierres-caja/pedidos-pendientes', verificarToken, verificarRol(['Cajero', 'SuperAdministrador', 'Gerente']), obtenerPedidosPendientesCierre);
router.get('/cierres-caja/fecha', verificarToken, verificarRol(['Cajero', 'SuperAdministrador', 'Gerente']), obtenerCierresCajaPorFecha);
router.get('/cierres-caja/turno/:turno', verificarToken, verificarRol(['Cajero', 'SuperAdministrador', 'Gerente']), obtenerCierresCajaPorTurno);
router.get('/cierres-caja/:id', verificarToken, verificarRol(['Cajero', 'SuperAdministrador', 'Gerente']), obtenerUnCierreCaja);

// HU14: Realizar cierre de caja (Solo Cajero y Administrador)
router.post('/cierres-caja', verificarToken, verificarRol(['Cajero', 'SuperAdministrador', 'Gerente']), crearCierreCaja);

// Actualizar cierre de caja
router.put('/cierres-caja/:id', verificarToken, verificarRol(['Cajero', 'SuperAdministrador']), actualizarCierreCaja);
router.put('/cierres-caja/:id/agregar-pedido', verificarToken, verificarRol(['Cajero', 'SuperAdministrador']), agregarPedidoACierre);

// Revisar/auditar cierre de caja (Solo Administrador y Gerente)
router.patch('/cierres-caja/:id/revisar', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), revisarCierreCaja);

export default router;
