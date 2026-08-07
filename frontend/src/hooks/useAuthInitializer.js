import { useEffect } from 'react';
import useUserStore from '../store/useUserStore';
import { getValidStoredAuthToken } from '../auth/authToken';

// Hook personalizado para inicializar la autenticación
const useAuthInitializer = () => {
  const { initializeAuth, isLoading, user, isAuthenticated } = useUserStore();

  useEffect(() => {
    // Solo inicializar si no tenemos datos del usuario
    if (!user && getValidStoredAuthToken()) {
      initializeAuth();
    }
  }, []); // Solo ejecutar una vez al montar el componente

  return {
    isLoading,
    user,
    isAuthenticated
  };
};

export default useAuthInitializer;