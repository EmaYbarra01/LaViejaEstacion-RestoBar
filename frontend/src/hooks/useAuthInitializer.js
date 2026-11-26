import { useEffect, useRef, useState } from 'react';
import useUserStore from '../store/useUserStore';
import { getValidStoredAuthToken } from '../auth/authToken';

// Hook personalizado para inicializar la autenticación
const useAuthInitializer = () => {
  const { initializeAuth, isLoading, user, isAuthenticated } = useUserStore();
  const [authReady, setAuthReady] = useState(() => !getValidStoredAuthToken());
  const initialization = useRef(null);

  useEffect(() => {
    let active = true;
    if (!useUserStore.getState().user && getValidStoredAuthToken()) {
      if (!initialization.current) initialization.current = initializeAuth();
      initialization.current.catch((error) => {
        console.error('Error al inicializar la autenticación:', error);
      }).finally(() => {
        if (active) setAuthReady(true);
      });
    } else {
      setAuthReady(true);
    }
    return () => { active = false; };
  }, [initializeAuth]);

  return {
    isLoading,
    authReady,
    user,
    isAuthenticated
  };
};

export default useAuthInitializer;