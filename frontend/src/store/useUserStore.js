import { create } from 'zustand';
import axios from 'axios';

// Store para manejar el estado del usuario
const useUserStore = create((set, get) => ({
  // Estado inicial
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  // Acciones
  
  // Acción para hacer login y guardar datos del usuario
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await axios.post(
        `${API_URL}/login`,
        { email, password },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Estructura del usuario basada en la respuesta del backend
      const usuario = response.data.usuario; // El backend devuelve 'usuario', no 'user'
      const token = response.data.token; // Guardar el token
      
      const userData = {
        _id: usuario._id || usuario.id, // MongoDB usa _id
        id: usuario._id || usuario.id,  // Mantener compatibilidad
        name: usuario.nombre,
        apellido: usuario.apellido,
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email || email,
        role: usuario.rol // El backend devuelve 'rol', no 'role'
      };
      
      // Guardar token en localStorage para peticiones futuras
      if (token) {
        try {
          localStorage.setItem('token', token);
          localStorage.setItem('accessToken', token);
        } catch (e) {}
      }
      
      // Actualizar el estado global
      set({ 
        user: userData, 
        isAuthenticated: true, 
        isLoading: false, 
        error: null 
      });
      
      console.log('✅ Login exitoso - Usuario:', userData);
      
      return {
        success: true,
        data: response.data,
        user: userData
      };
    } catch (error) {
      const errorMessage = error.response?.data?.mensaje || 'Error de conexión';
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false, 
        error: errorMessage 
      });
      
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // Acción para obtener datos del usuario actual (/getMe)
  fetchUserData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/me`,
        {
          withCredentials: true,
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }
      );
      
      // Estructura del usuario basada en la respuesta del backend
      const userData = {
        _id: response.data.id, // MongoDB usa _id
        id: response.data.id,   // Mantener compatibilidad
        name: response.data.nombre,
        apellido: response.data.apellido,
        nombreCompleto: response.data.nombreCompleto,
        email: response.data.email,
        role: response.data.rol, // El backend devuelve 'rol', no 'role'
        dni: response.data.dni,
        telefono: response.data.telefono,
        direccion: response.data.direccion
      };
      
      set({ 
        user: userData, 
        isAuthenticated: true, 
        isLoading: false, 
        error: null 
      });
      
      console.log('✅ Usuario autenticado:', userData);
      
      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.mensaje || 'No autenticado';
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false, 
        error: errorMessage 
      });
      
      return { success: false, message: errorMessage };
    }
  },

  // Acción para verificar autenticación (para uso en rutas protegidas)
  verifyAuth: async () => {
    // Si ya tenemos datos del usuario, no necesitamos verificar de nuevo
    const currentUser = get().user;
    if (currentUser) {
      return { success: true, user: currentUser };
    }
    
    // Si no tenemos datos, hacemos fetch
    return get().fetchUserData();
  },

  // Acción para logout
  logout: async () => {
    set({ isLoading: true });
    
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/logout`,
        {},
        {
          withCredentials: true
        }
      );
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Siempre limpiar el estado local, independientemente del resultado
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false, 
        error: null 
      });
      
      // También limpiar localStorage por compatibilidad
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  },

  // Acción para limpiar errores
  clearError: () => set({ error: null }),

  // Acción para actualizar datos del usuario (útil para cambios de perfil)
  updateUser: (userData) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ 
        user: { ...currentUser, ...userData }
      });
    }
  },

  // Acción para inicializar el store (útil para cuando se recarga la página)
  initializeAuth: async () => {
    const currentUser = get().user;
    
    // Si ya tenemos datos del usuario, no hacer nada
    if (currentUser) {
      return;
    }
    
    // Intentar obtener datos del usuario del backend
    // Solo si parece que hay una sesión activa (evitar errores 401 innecesarios)
    try {
      await get().fetchUserData();
    } catch (error) {
      // Silenciosamente fallar si no hay sesión activa
      // Esto es normal cuando el usuario no ha iniciado sesión
      console.log('No hay sesión activa');
    }
  }
}));

export default useUserStore;