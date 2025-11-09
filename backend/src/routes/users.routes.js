import {Router} from 'express';
import { obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario, obtenerUnUsuario, login, logout, getMe, registrarUsuario  } from '../controllers/users.controllers';
import validarUsuario from '../helpers/validarUsuario';
import verificarToken from '../auth/token-verify.js';
import verificarRol from '../auth/verificar-rol.js';


const router = Router();

router.route('/users')
    .get(verificarToken, obtenerUsuarios)  // Proteger GET
    .post(validarUsuario, crearUsuario);   // Crear usuario no necesita token

router.route('/users/:id')
    .get(verificarToken, obtenerUnUsuario)      // Proteger GET
    .patch(verificarToken, actualizarUsuario)   // Proteger PATCH
    .delete(verificarToken, eliminarUsuario);   // Proteger DELETE

router.route('/login')
    .post(login);  // Login no necesita token (obviamente)

// Ruta pública para registro (siempre crea usuarios con rol 'user')
router.route('/register')
    .post(validarUsuario, registrarUsuario);

// Ruta para verificar si el token es válido (para el frontend)
router.route('/verify')
    .get(verificarToken, (req, res) => {
        res.status(200).json({
            success: true,
            user: {
                id: req.user.id,
                username: req.user.username,
                role: req.user.role
            }
        });
    });

 router.route('/logout')
    .post(verificarToken, logout); // Proteger logout

 router.route('/me')    
    .get(verificarToken, getMe);

export default router;    