/**
 * Rutas de Reservas
 * Define todos los endpoints para la gestión de reservas
 */

import express from 'express';
const router = express.Router();

import {
  crearReserva,
  obtenerReservas,
  obtenerReservaPorId,
  actualizarReserva,
  cancelarReserva,
  confirmarReserva,
  completarReserva,
  obtenerReservasPorFecha,
  confirmarReservaToken,
  cancelarReservaToken
} from '../controllers/reservas.controllers.js';

// Middleware de autenticación (opcional, descomentar si quieres proteger las rutas)
// const { verificarToken } = require('../auth/jwt');

/**
 * @route   POST /api/reservas
 * @desc    Crear una nueva reserva
 * @access  Public
 */
router.post('/', crearReserva);

/**
 * @route   GET /api/reservas/confirmar/:token
 * @desc    Confirmar reserva mediante token del email
 * @param   token - Token de confirmación
 * @access  Public
 */
router.get('/confirmar/:token', confirmarReservaToken);

/**
 * @route   GET /api/reservas/cancelar/:token
 * @desc    Cancelar reserva mediante token del email
 * @param   token - Token de confirmación
 * @access  Public
 */
router.get('/cancelar/:token', cancelarReservaToken);

/**
 * @route   GET /api/reservas
 * @desc    Obtener todas las reservas (con filtros opcionales)
 * @query   estado - Filtrar por estado (Pendiente, Confirmada, Cancelada, Completada)
 * @query   fecha - Filtrar por fecha (YYYY-MM-DD)
 * @query   page - Número de página (default: 1)
 * @query   limit - Límite de resultados por página (default: 50)
 * @access  Public (puede protegerse con autenticación)
 */
router.get('/', obtenerReservas);

/**
 * @route   GET /api/reservas/fecha/:fecha
 * @desc    Obtener reservas por fecha específica
 * @param   fecha - Fecha en formato YYYY-MM-DD
 * @access  Public
 */
router.get('/fecha/:fecha', obtenerReservasPorFecha);

/**
 * @route   GET /api/reservas/:id
 * @desc    Obtener una reserva por ID
 * @access  Public
 */
router.get('/:id', obtenerReservaPorId);

/**
 * @route   PUT /api/reservas/:id
 * @desc    Actualizar una reserva
 * @access  Public (puede protegerse con autenticación)
 */
router.put('/:id', actualizarReserva);

/**
 * @route   DELETE /api/reservas/:id
 * @desc    Cancelar una reserva
 * @access  Public (puede protegerse con autenticación)
 */
router.delete('/:id', cancelarReserva);

/**
 * @route   PATCH /api/reservas/:id/confirmar
 * @desc    Confirmar una reserva pendiente
 * @access  Private (requiere autenticación de admin)
 */
router.patch('/:id/confirmar', confirmarReserva);

/**
 * @route   PATCH /api/reservas/:id/completar
 * @desc    Marcar una reserva como completada
 * @access  Private (requiere autenticación de admin)
 */
router.patch('/:id/completar', completarReserva);

export default router;
