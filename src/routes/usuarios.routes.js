import { Router } from 'express';
import {
    obtenerUsuarios,
    obtenerUnUsuario,
    obtenerUsuariosPorRol,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    activarDesactivarUsuario,
    cambiarPassword,
    obtenerPerfil
} from '../controllers/usuarios.controllers.js';
import validarUsuario from '../helpers/validarUsuario.js';
import verificarToken from '../auth/token-verify.js';
import verificarRol from '../auth/verificar-rol.js';

const router = Router();

/**
 * Rutas de Usuarios para La Vieja Estación - RestoBar
 * Implementa: HU12, RN5, RF6
 */

// Rutas de consulta (protegidas)
router.get('/usuarios', verificarToken, verificarRol(['Administrador', 'Gerente']), obtenerUsuarios);
router.get('/usuarios/rol/:rol', verificarToken, verificarRol(['Administrador', 'Gerente']), obtenerUsuariosPorRol);
router.get('/usuarios/perfil', verificarToken, obtenerPerfil); // Usuario obtiene su propio perfil
router.get('/usuarios/:id', verificarToken, obtenerUnUsuario);

// HU12: Crear, editar usuarios y asignar roles (Solo Administrador y Gerente)
router.post('/usuarios', verificarToken, verificarRol(['Administrador', 'Gerente']), validarUsuario, crearUsuario);
router.put('/usuarios/:id', verificarToken, verificarRol(['Administrador', 'Gerente']), validarUsuario, actualizarUsuario);

// Eliminar usuario (Solo Administrador)
router.delete('/usuarios/:id', verificarToken, verificarRol(['Administrador']), eliminarUsuario);

// HU12: Activar/desactivar usuario
router.patch('/usuarios/:id/estado', verificarToken, verificarRol(['Administrador', 'Gerente']), activarDesactivarUsuario);

// Cambiar contraseña (el usuario puede cambiar la suya propia o admin puede cambiar cualquiera)
router.patch('/usuarios/:id/password', verificarToken, cambiarPassword);

export default router;    