import { Router } from 'express';
import {
    obtenerMesas,
    obtenerUnaMesa,
    obtenerMesasPorEstado,
    obtenerMesasPorUbicacion,
    crearMesa,
    actualizarMesa,
    eliminarMesa,
    cambiarEstadoMesa,
    obtenerMesasDisponibles
} from '../controllers/mesas.controllers.js';
import verificarToken from '../auth/token-verify.js';
import verificarRol from '../auth/verificar-rol.js';

const router = Router();

/**
 * Rutas de Mesas para La Vieja Estación - RestoBar
 * Implementa: HU11, RN4, RF3
 */

// Rutas de consulta
router.get('/mesas', verificarToken, obtenerMesas);
router.get('/mesas/disponibles', verificarToken, obtenerMesasDisponibles);
router.get('/mesas/estado/:estado', verificarToken, obtenerMesasPorEstado);
router.get('/mesas/ubicacion/:ubicacion', verificarToken, obtenerMesasPorUbicacion);
router.get('/mesas/:id', verificarToken, obtenerUnaMesa);

// Rutas de gestión (Solo Administrador y Gerente)
router.post('/mesas', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), crearMesa);
router.put('/mesas/:id', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), actualizarMesa);
router.delete('/mesas/:id', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), eliminarMesa);

// HU11: Cambiar estado de mesa (Libre, Ocupada, Reservada)
// RN4: Solo permite estados válidos
router.patch('/mesas/:id/estado', verificarToken, verificarRol(['Mozo', 'SuperAdministrador', 'Gerente']), cambiarEstadoMesa);

export default router;
