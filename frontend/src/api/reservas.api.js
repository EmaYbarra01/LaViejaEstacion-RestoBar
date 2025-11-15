/**
 * API de Reservas
 * Servicio para consumir los endpoints de reservas del backend
 */

import axios from 'axios';
import apiClient from './apiClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const RESERVAS_URL = `${API_URL}/api/reservas`;

/**
 * Crear una nueva reserva
 * @param {Object} reservaData - Datos de la reserva
 * @returns {Promise} Respuesta del servidor
 */
export const crearReserva = async (reservaData) => {
  try {
    const response = await apiClient.post('/reservas', reservaData);
    return response.data;
  } catch (error) {
    console.error('[API] Error al crear reserva:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Obtener todas las reservas
 * @param {Object} filtros - Filtros opcionales (estado, fecha, page, limit)
 * @returns {Promise} Lista de reservas
 */
export const obtenerReservas = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.fecha) params.append('fecha', filtros.fecha);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);

    const url = params.toString() ? `${RESERVAS_URL}?${params}` : RESERVAS_URL;
    const response = await axios.get(url);
    
    return response.data;
  } catch (error) {
    console.error('[API] Error al obtener reservas:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Obtener una reserva por ID
 * @param {string} id - ID de la reserva
 * @returns {Promise} Datos de la reserva
 */
export const obtenerReservaPorId = async (id) => {
  try {
    const response = await axios.get(`${RESERVAS_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('[API] Error al obtener reserva:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Obtener reservas por fecha
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {Promise} Lista de reservas para esa fecha
 */
export const obtenerReservasPorFecha = async (fecha) => {
  try {
    const response = await axios.get(`${RESERVAS_URL}/fecha/${fecha}`);
    return response.data;
  } catch (error) {
    console.error('[API] Error al obtener reservas por fecha:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Actualizar una reserva
 * @param {string} id - ID de la reserva
 * @param {Object} datosActualizados - Datos a actualizar
 * @returns {Promise} Reserva actualizada
 */
export const actualizarReserva = async (id, datosActualizados) => {
  try {
    const response = await axios.put(`${RESERVAS_URL}/${id}`, datosActualizados);
    return response.data;
  } catch (error) {
    console.error('[API] Error al actualizar reserva:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Cancelar una reserva
 * @param {string} id - ID de la reserva
 * @returns {Promise} Reserva cancelada
 */
export const cancelarReserva = async (id) => {
  try {
    const response = await axios.delete(`${RESERVAS_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('[API] Error al cancelar reserva:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Confirmar una reserva
 * @param {string} id - ID de la reserva
 * @returns {Promise} Reserva confirmada
 */
export const confirmarReserva = async (id) => {
  try {
    const response = await axios.patch(`${RESERVAS_URL}/${id}/confirmar`);
    return response.data;
  } catch (error) {
    console.error('[API] Error al confirmar reserva:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Completar una reserva
 * @param {string} id - ID de la reserva
 * @returns {Promise} Reserva completada
 */
export const completarReserva = async (id) => {
  try {
    const response = await axios.patch(`${RESERVAS_URL}/${id}/completar`);
    return response.data;
  } catch (error) {
    console.error('[API] Error al completar reserva:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Validar disponibilidad de mesa para una fecha y hora
 * @param {number} numeroMesa - Número de mesa
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {string} hora - Hora en formato HH:MM
 * @returns {Promise} Información de disponibilidad
 */
export const validarDisponibilidad = async (numeroMesa, fecha, hora) => {
  try {
    const response = await obtenerReservasPorFecha(fecha);
    
    // Filtrar reservas activas para la mesa y hora específica
    const reservasConflicto = response.reservas?.filter(reserva => 
      reserva.numeroMesa === numeroMesa && 
      reserva.hora === hora &&
      (reserva.estado === 'Pendiente' || reserva.estado === 'Confirmada')
    );

    return {
      disponible: reservasConflicto.length === 0,
      conflictos: reservasConflicto
    };
  } catch (error) {
    console.error('[API] Error al validar disponibilidad:', error);
    throw error;
  }
};

export default {
  crearReserva,
  obtenerReservas,
  obtenerReservaPorId,
  obtenerReservasPorFecha,
  actualizarReserva,
  cancelarReserva,
  confirmarReserva,
  completarReserva,
  validarDisponibilidad
};
