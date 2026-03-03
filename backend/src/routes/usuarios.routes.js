import { Router } from 'express';
import {
    obtenerUsuarios,
    obtenerUnUsuario,
    obtenerUsuariosPorRol,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    login,
    getMe
    // TODO: Implementar estas funciones en usuarios.controllers.js
    // activarDesactivarUsuario,
    // cambiarPassword,
    // obtenerPerfil
} from '../controllers/usuarios.controllers.js';
import validarUsuario from '../helpers/validarUsuario.js';
import verificarToken from '../auth/token-verify.js';
import verificarRol from '../auth/verificar-rol.js';

const router = Router();

/**
 * Rutas de Usuarios para La Vieja Estación - RestoBar
 * Implementa: HU12, RN5, RF6
 */

// Rutas de acceso directo para compatibilidad con frontend
// Estas rutas duplican las de /api/auth/* para evitar errores de cliente
router.post('/login', login);
router.get('/me', verificarToken, getMe);

// Rutas de consulta (protegidas)
router.get('/usuarios', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), obtenerUsuarios);
router.get('/usuarios/rol/:rol', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), obtenerUsuariosPorRol);
// router.get('/usuarios/perfil', verificarToken, obtenerPerfil); // TODO: Implementar obtenerPerfil en el controlador
router.get('/usuarios/:id', verificarToken, obtenerUnUsuario);

// HU12: Crear, editar usuarios y asignar roles (Solo Administrador y Gerente)
router.post('/usuarios', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), validarUsuario, crearUsuario);
router.put('/usuarios/:id', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), validarUsuario, actualizarUsuario);

// Eliminar usuario (Solo Administrador)
router.delete('/usuarios/:id', verificarToken, verificarRol(['SuperAdministrador']), eliminarUsuario);

// TODO: Implementar estas rutas cuando se implementen las funciones
// HU12: Activar/desactivar usuario
// router.patch('/usuarios/:id/estado', verificarToken, verificarRol(['SuperAdministrador', 'Gerente']), activarDesactivarUsuario);

// Cambiar contraseña (el usuario puede cambiar la suya propia o admin puede cambiar cualquiera)
// router.patch('/usuarios/:id/password', verificarToken, cambiarPassword);

export default router;    
