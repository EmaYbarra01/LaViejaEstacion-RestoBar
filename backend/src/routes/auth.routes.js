import { Router } from 'express';
import {
    forgotPassword,
    resetPassword,
    verifyResetToken
} from '../controllers/auth.controllers.js';
import {
    login,
    logout,
    getMe,
    crearUsuario as registro
} from '../controllers/usuarios.controllers.js';
import { body } from 'express-validator';
import resultadoValidacion from '../helpers/resultadoValidacion.js';
import verificarToken from '../auth/token-verify.js';

const router = Router();

/**
 * Rutas de Autenticación para La Vieja Estación - RestoBar
 * Implementa: RF6
 */

// POST /api/auth/login - Iniciar sesión
router.post(
    '/login',
    [
        body('email')
            .notEmpty().withMessage('El email es requerido')
            .isEmail().withMessage('Debe ser un email válido')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('La contraseña es requerida'),
        resultadoValidacion
    ],
    login
);

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', verificarToken, logout);

// POST /api/auth/registro - Registrar nuevo usuario (público para clientes)
router.post(
    '/registro',
    [
        body('nombre')
            .notEmpty().withMessage('El nombre es requerido'),
        body('apellido')
            .notEmpty().withMessage('El apellido es requerido'),
        body('email')
            .notEmpty().withMessage('El email es requerido')
            .isEmail().withMessage('Debe ser un email válido')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('La contraseña es requerida')
            .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
        body('dni')
            .notEmpty().withMessage('El DNI es requerido'),
        resultadoValidacion
    ],
    registro
);

// GET /api/auth/verify - Verificar si el token es válido
router.get('/verify', verificarToken, getMe);

// POST /api/auth/forgot-password - Solicitar recuperación de contraseña
router.post(
    '/forgot-password',
    [
        body('email')
            .notEmpty().withMessage('El email es requerido')
            .isEmail().withMessage('Debe ser un email válido')
            .normalizeEmail(),
        resultadoValidacion
    ],
    forgotPassword
);

// POST /api/auth/reset-password - Restablecer contraseña con token
router.post(
    '/reset-password',
    [
        body('token')
            .notEmpty().withMessage('El token es requerido'),
        body('newPassword')
            .notEmpty().withMessage('La nueva contraseña es requerida')
            .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
        resultadoValidacion
    ],
    resetPassword
);

// GET /api/auth/verify-reset-token/:token - Verificar si un token es válido
router.get('/verify-reset-token/:token', verifyResetToken);

export default router;
