import { Router } from 'express';
import {
    obtenerCierresCaja,
    obtenerUnCierreCaja,
    obtenerCierresCajaPorFecha,
    obtenerCierresCajaPorTurno,
    crearCierreCaja,
    actualizarCierreCaja,
    revisarCierreCaja,
    obtenerCierreActivo
} from '../controllers/cierreCaja.controllers.js';
import verificarToken from '../auth/token-verify.js';
import verificarRol from '../auth/verificar-rol.js';

const router = Router();

/**
 * Rutas de Cierre de Caja para La Vieja Estación - RestoBar
 * Implementa: HU14, RN6
 */

// Rutas de consulta (Solo Cajero, Administrador y Gerente)
router.get('/cierres-caja', verificarToken, verificarRol(['Cajero', 'Administrador', 'Gerente']), obtenerCierresCaja);
router.get('/cierres-caja/activo', verificarToken, verificarRol(['Cajero', 'Administrador', 'Gerente']), obtenerCierreActivo);
router.get('/cierres-caja/fecha', verificarToken, verificarRol(['Cajero', 'Administrador', 'Gerente']), obtenerCierresCajaPorFecha);
router.get('/cierres-caja/turno/:turno', verificarToken, verificarRol(['Cajero', 'Administrador', 'Gerente']), obtenerCierresCajaPorTurno);
router.get('/cierres-caja/:id', verificarToken, verificarRol(['Cajero', 'Administrador', 'Gerente']), obtenerUnCierreCaja);

// HU14: Realizar cierre de caja (Solo Cajero y Administrador)
router.post('/cierres-caja', verificarToken, verificarRol(['Cajero', 'Administrador']), crearCierreCaja);

// Actualizar cierre de caja
router.put('/cierres-caja/:id', verificarToken, verificarRol(['Cajero', 'Administrador']), actualizarCierreCaja);

// Revisar/auditar cierre de caja (Solo Administrador y Gerente)
router.patch('/cierres-caja/:id/revisar', verificarToken, verificarRol(['Administrador', 'Gerente']), revisarCierreCaja);

export default router;
