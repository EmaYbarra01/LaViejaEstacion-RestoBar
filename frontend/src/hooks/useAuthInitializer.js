import { useEffect } from 'react';
import useUserStore from '../store/useUserStore';
import { getValidStoredAuthToken } from '../auth/authToken';

// Hook personalizado para inicializar la autenticación
const useAuthInitializer = () => {
  const { initializeAuth, isLoading, user, isAuthenticated } = useUserStore();

  useEffect(() => {
    console.log('useAuthInitializer ejecutado, user:', user);
    // Solo inicializar si no tenemos datos del usuario
    if (!user && getValidStoredAuthToken()) {
      console.log('useAuthInitializer: No hay user, inicializando auth...');
      initializeAuth();
    } else {
      console.log('useAuthInitializer: Ya hay user o no hay token');
    }
  }, []); // Solo ejecutar una vez al montar el componente

  return {
    isLoading,
    user,
    isAuthenticated
  };
};

export default useAuthInitializer;