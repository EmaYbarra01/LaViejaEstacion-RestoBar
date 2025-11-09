const API_URL = import.meta.env.VITE_API_URL;

/**
 * Solicitar recuperación de contraseña
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    return {
      success: response.ok,
      data,
      status: response.status
    };
  } catch (error) {
    console.error('Error al solicitar recuperación de contraseña:', error);
    return {
      success: false,
      error: 'Error de conexión'
    };
  }
};

/**
 * Verificar validez de un token de recuperación
 * @param {string} token - Token a verificar
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const verifyResetToken = async (token) => {
  try {
    const response = await fetch(`${API_URL}/auth/verify-reset-token/${token}`);
    const data = await response.json();

    return {
      success: response.ok,
      data,
      status: response.status
    };
  } catch (error) {
    console.error('Error al verificar token:', error);
    return {
      success: false,
      error: 'Error de conexión'
    };
  }
};

/**
 * Restablecer contraseña con token
 * @param {string} token - Token de recuperación
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, newPassword })
    });

    const data = await response.json();

    return {
      success: response.ok,
      data,
      status: response.status
    };
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    return {
      success: false,
      error: 'Error de conexión'
    };
  }
};
