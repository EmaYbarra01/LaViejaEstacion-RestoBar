import apiClient from './apiClient';

/**
 * API CLIENT PARA COCINA
 * Funciones para interactuar con los endpoints de cocina
 * Base: /api/cocina
 */

/**
 * Obtener lista de pedidos para cocina
 * @param {Object} params - Parámetros de consulta
 * @param {string} params.estado - Filtrar por estado (Pendiente, En Preparación, Listo)
 * @param {number} params.limit - Límite de resultados
 * @returns {Promise<Object>} { success, count, pedidos }
 */
export const fetchPedidosCocina = async (params = {}) => {
  try {
    const response = await apiClient.get('/cocina/pedidos', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener pedidos de cocina:', error);
    throw error;
  }
};

/**
 * Obtener detalle de un pedido específico
 * @param {string} pedidoId - ID del pedido
 * @returns {Promise<Object>} { success, pedido }
 */
export const fetchPedidoDetalle = async (pedidoId) => {
  try {
    const response = await apiClient.get(`/cocina/pedidos/${pedidoId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener detalle del pedido:', error);
    throw error;
  }
};

/**
 * Actualizar estado de un pedido
 * @param {string} pedidoId - ID del pedido
 * @param {Object} data - Datos de actualización
 * @param {string} data.estado - Nuevo estado
 * @param {string} data.observacion - Observación opcional
 * @returns {Promise<Object>} { success, mensaje, pedido }
 */
export const updateEstadoPedido = async (pedidoId, data) => {
  try {
    const response = await apiClient.patch(`/cocina/pedidos/${pedidoId}/estado`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de cocina
 * @returns {Promise<Object>} { success, estadisticas }
 */
export const fetchEstadisticasCocina = async () => {
  try {
    const response = await apiClient.get('/cocina/estadisticas');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};

/**
 * Helpers para transiciones de estado comunes
 */
export const marcarEnPreparacion = (pedidoId, observacion = '') => {
  return updateEstadoPedido(pedidoId, {
    estado: 'En Preparación',
    observacion: observacion || 'Pedido en preparación'
  });
};

export const marcarListo = (pedidoId, observacion = '') => {
  return updateEstadoPedido(pedidoId, {
    estado: 'Listo',
    observacion: observacion || 'Pedido listo para servir'
  });
};

export const marcarEntregado = (pedidoId, observacion = '') => {
  return updateEstadoPedido(pedidoId, {
    estado: 'Entregado',
    observacion: observacion || 'Pedido entregado'
  });
};

export default {
  fetchPedidosCocina,
  fetchPedidoDetalle,
  updateEstadoPedido,
  fetchEstadisticasCocina,
  marcarEnPreparacion,
  marcarListo,
  marcarEntregado
};
