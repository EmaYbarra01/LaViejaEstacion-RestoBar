import { Router } from 'express';
import { listarMensajesEntreRoles, crearMensaje } from '../controllers/mensajes.controllers.js';
import verificarToken from '../auth/token-verify.js';
import verificarRol from '../auth/verificar-rol.js';

const router = Router();

router.get('/mensajes', verificarToken, verificarRol(['Gerente', 'SuperAdministrador']), listarMensajesEntreRoles);
router.post('/mensajes', verificarToken, verificarRol(['Gerente', 'SuperAdministrador']), crearMensaje);

export default router;
