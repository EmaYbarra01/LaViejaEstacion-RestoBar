import axios from 'axios';

const URL_USUARIOS = import.meta.env.VITE_API_USUARIOS;

// Obtener todos los usuarios
export const getAllUsers = async () => {
  try {
    const response = await axios.get(URL_USUARIOS, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

// Crear nuevo usuario
export const createUser = async (userData) => {
  try {
    const response = await axios.post(URL_USUARIOS, userData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};

// Actualizar usuario
export const updateUser = async (id, userData) => {
  try {
    const response = await axios.put(`${URL_USUARIOS}/${id}`, userData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

// Eliminar usuario
export const deleteUser = async (id) => {
  try {
    await axios.delete(`${URL_USUARIOS}/${id}`, {
      withCredentials: true
    });
    return true;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
};

// Función de login que utiliza cookies JWT
export const login = async (email, password) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/login`,
      { email, password },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    // La cookie JWT se configura automáticamente por el backend
    // Retornamos los datos del usuario para uso inmediato
    return {
      success: true,
      data: response.data,
      user: {
        id: response.data.idUsuario,
        name: response.data.nombreUsuario,
        email: email,
        // Determinamos el rol basado en la respuesta o establecemos un valor por defecto
        role: response.data.rol || 'user'
      }
    };
  } catch (error) {
    console.error('Error al realizar login:', error);
    return {
      success: false,
      message: error.response?.data?.mensaje || 'Error de conexión'
    };
  }
};

// Función para verificar si el usuario está autenticado
export const verifyAuth = async () => {
  try {
    // Esta función verificará si la cookie JWT es válida
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/verify`,
      {
        withCredentials: true
      }
    );
    return {
      success: true,
      user: response.data.user
    };
  } catch (error) {
    return {
      success: false,
      message: 'No autenticado'
    };
  }
};

// Función para cerrar sesión
export const logout = async () => {
  try {
    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/users/logout`,
      {},
      {
        withCredentials: true
      }
    );
    // Limpiar datos locales si existen
    localStorage.removeItem('user');
    return { success: true };
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    // Aún así limpiar datos locales
    localStorage.removeItem('user');
    return { success: false };
  }
};