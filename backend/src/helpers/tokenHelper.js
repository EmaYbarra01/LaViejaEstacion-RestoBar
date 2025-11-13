/**
 * Helper para generar y validar tokens de confirmación
 */

import crypto from 'crypto';

/**
 * Generar un token único y seguro
 * @returns {string} Token aleatorio de 32 caracteres hexadecimales
 */
export const generarToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generar fecha de expiración del token
 * @param {number} horas - Horas hasta la expiración (default: 72)
 * @returns {Date} Fecha de expiración
 */
export const generarExpiracion = (horas = 72) => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + horas);
  return expiry;
};

/**
 * Verificar si un token ha expirado
 * @param {Date} tokenExpiry - Fecha de expiración del token
 * @returns {boolean} True si el token está expirado
 */
export const tokenExpirado = (tokenExpiry) => {
  if (!tokenExpiry) return true;
  return new Date() > new Date(tokenExpiry);
};

/**
 * Generar URL de confirmación
 * @param {string} token - Token de confirmación
 * @param {string} baseUrl - URL base del servidor
 * @returns {string} URL completa de confirmación
 */
export const generarUrlConfirmacion = (token, baseUrl = 'http://localhost:4000') => {
  return `${baseUrl}/api/reservas/confirmar/${token}`;
};

/**
 * Generar URL de cancelación
 * @param {string} token - Token de confirmación
 * @param {string} baseUrl - URL base del servidor
 * @returns {string} URL completa de cancelación
 */
export const generarUrlCancelacion = (token, baseUrl = 'http://localhost:4000') => {
  return `${baseUrl}/api/reservas/cancelar/${token}`;
};
