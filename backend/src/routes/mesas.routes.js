import { Router } from 'express';
import {
  obtenerMesas, obtenerUnaMesa, obtenerMesasPorEstado,
  obtenerMesasPorUbicacion, crearMesa, actualizarMesa,
  eliminarMesa, cambiarEstadoMesa, obtenerMesasDisponibles,
  obtenerMesasLibres, obtenerMesasOcupadas, obtenerCuentaMesa,
} from '../controllers/mesas.controllers.js';
import verificarToken from '../auth/token-verify.js';
import verificarRol from '../auth/verificar-rol.js';

const router = Router();
router.get('/mesas', verificarToken, obtenerMesas);
router.get('/mesas/disponibles', verificarToken, obtenerMesasDisponibles);
router.get('/mesas/libres', verificarToken, obtenerMesasLibres);
router.get('/mesas/ocupadas', verificarToken, obtenerMesasOcupadas);
router.get('/mesas/estado/:estado', verificarToken, obtenerMesasPorEstado);
router.get('/mesas/ubicacion/:ubicacion', verificarToken, obtenerMesasPorUbicacion);
router.get('/mesas/:id/cuenta', verificarToken, obtenerCuentaMesa);
router.get('/mesas/:id', verificarToken, obtenerUnaMesa);
router.post('/mesas', verificarToken, verificarRol(['SuperAdministrador','Gerente']), crearMesa);
router.put('/mesas/:id', verificarToken, verificarRol(['SuperAdministrador','Gerente']), actualizarMesa);
router.delete('/mesas/:id', verificarToken, verificarRol(['SuperAdministrador','Gerente']), eliminarMesa);
router.patch('/mesas/:id/estado', verificarToken, verificarRol(['Mozo','SuperAdministrador','Gerente']), cambiarEstadoMesa);
export default router;
