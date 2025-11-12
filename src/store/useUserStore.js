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
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}api/login`,
        { email, password },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Estructura del usuario basada en la respuesta del backend
      const userData = {
        _id: response.data.user?._id || response.data.user?.id, // MongoDB usa _id
        id: response.data.user?._id || response.data.user?.id,  // Mantener compatibilidad
        name: response.data.user?.username,
        email: response.data.user?.email || email,
        role: response.data.user?.role || 'user'
      };
      
      // Actualizar el estado global
      set({ 
        user: userData, 
        isAuthenticated: true, 
        isLoading: false, 
        error: null 
      });
      
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
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}api/me`,
        {
          withCredentials: true
        }
      );
      
      // Para fetchUserData, sabemos que req.user está disponible en el backend
      // pero necesitamos que el backend devuelva el ID también
      const userData = {
        _id: response.data._id || response.data.id, // MongoDB usa _id
        id: response.data._id || response.data.id,   // Mantener compatibilidad
        name: response.data.username,
        email: response.data.email,
        role: response.data.role || 'user'
      };
      
      set({ 
        user: userData, 
        isAuthenticated: true, 
        isLoading: false, 
        error: null 
      });
      
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
        `${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}api/logout`,
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
    await get().fetchUserData();
  }
}));

export default useUserStore;