// EJEMPLO: Cómo usar useUserStore en cualquier componente

import useUserStore from '../store/useUserStore';

const EjemploComponente = () => {
  // ✅ Obtener datos del usuario y funciones del store
  const { 
    user,           // Datos del usuario: { id, name, email, role }
    isAuthenticated, // Boolean: está autenticado?
    isLoading,      // Boolean: está cargando?
    error,          // String: mensaje de error si lo hay
    login,          // Function: hacer login
    logout,         // Function: hacer logout
    fetchUserData,  // Function: refrescar datos del usuario
    clearError,     // Function: limpiar errores
    updateUser      // Function: actualizar datos del usuario localmente
  } = useUserStore();

  // ✅ Ejemplo 1: Mostrar información condicional basada en el usuario
  const renderUserInfo = () => {
    if (isLoading) {
      return <div>Cargando información del usuario...</div>;
    }

    if (!isAuthenticated) {
      return <div>No estás autenticado</div>;
    }

    return (
      <div>
        <h3>Información del Usuario</h3>
        <p>Nombre: {user.name}</p>
        <p>Email: {user.email}</p>
        <p>Rol: {user.role}</p>
        <p>ID: {user.id}</p>
      </div>
    );
  };

  // ✅ Ejemplo 2: Verificar permisos basados en rol
  const canAccessAdminFeatures = user?.role === 'admin' || user?.role === 'superadmin';

  // ✅ Ejemplo 3: Manejar logout
  const handleLogout = async () => {
    try {
      await logout();
      console.log('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // ✅ Ejemplo 4: Refrescar datos del usuario
  const refreshUserData = async () => {
    try {
      await fetchUserData();
      console.log('Datos del usuario actualizados');
    } catch (error) {
      console.error('Error al actualizar datos:', error);
    }
  };

  // ✅ Ejemplo 5: Mostrar errores
  if (error) {
    return (
      <div style={{ color: 'red', padding: '10px', border: '1px solid red' }}>
        Error: {error}
        <button onClick={clearError}>Limpiar Error</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Ejemplo de Uso de Zustand Store</h2>
      
      {/* Información del usuario */}
      {renderUserInfo()}

      {/* Botones condicionales */}
      {isAuthenticated && (
        <div style={{ marginTop: '20px' }}>
          <button onClick={handleLogout}>
            Cerrar Sesión
          </button>
          
          <button onClick={refreshUserData} disabled={isLoading}>
            {isLoading ? 'Actualizando...' : 'Refrescar Datos'}
          </button>
          
          {canAccessAdminFeatures && (
            <button onClick={() => console.log('Acceso a funciones de admin')}>
              Panel de Administración
            </button>
          )}
        </div>
      )}

      {/* Contenido específico para diferentes roles */}
      {user?.role === 'admin' && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
          <h4>Panel de Administrador</h4>
          <p>Contenido exclusivo para administradores</p>
        </div>
      )}

      {user?.role === 'user' && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f5e8' }}>
          <h4>Panel de Usuario</h4>
          <p>Contenido para usuarios regulares</p>
        </div>
      )}
    </div>
  );
};

export default EjemploComponente;

// ============================================================================
// CASOS DE USO COMUNES:
// ============================================================================

// 🔹 1. Verificar si el usuario puede editar algo
const puedeEditar = user?.id === idDelRecurso || user?.role === 'admin';

// 🔹 2. Mostrar nombre del usuario en cualquier lugar
const saludo = user ? `Hola, ${user.name}!` : 'Hola, invitado!';

// 🔹 3. Verificar múltiples roles
const esAdministrador = ['admin', 'superadmin'].includes(user?.role);

// 🔹 4. Usar en useEffect para cargar datos específicos del usuario
useEffect(() => {
  if (user?.id) {
    // Cargar datos específicos para este usuario
    cargarDatosDelUsuario(user.id);
  }
}, [user?.id]);

// 🔹 5. Configuración condicional de la UI
const configuracionUI = {
  mostrarMenuAdmin: user?.role === 'admin',
  tema: user?.preferencias?.tema || 'claro',
  idioma: user?.preferencias?.idioma || 'es'
};

// ============================================================================
// HOOKS PERSONALIZADOS CON ZUSTAND:
// ============================================================================

// Hook para verificar permisos
const usePermissions = () => {
  const { user } = useUserStore();
  
  return {
    canEdit: (resourceOwnerId) => user?.id === resourceOwnerId || user?.role === 'admin',
    canDelete: (resourceOwnerId) => user?.id === resourceOwnerId || user?.role === 'admin',
    canViewAdmin: () => ['admin', 'superadmin'].includes(user?.role),
    isOwner: (resourceOwnerId) => user?.id === resourceOwnerId
  };
};

// Hook para datos del usuario con valores por defecto
const useUserData = () => {
  const { user, isAuthenticated } = useUserStore();
  
  return {
    userName: user?.name || 'Usuario',
    userEmail: user?.email || '',
    userRole: user?.role || 'user',
    userId: user?.id || null,
    isLoggedIn: isAuthenticated
  };
};