import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useUserStore from "../store/useUserStore";

// Componente para proteger rutas que requieren autenticación
// Ahora funciona con Zustand y cookies JWT
const ProtectedRoute = ({ children, role }) => {
    const [isLoading, setIsLoading] = useState(true);
    const { user, isAuthenticated, verifyAuth } = useUserStore();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Verificar autenticación usando el store de Zustand
                await verifyAuth();
            } catch (error) {
                console.error('Error verificando autenticación:', error);
            } finally {
                setIsLoading(false);
            }
        };

        // Si no tenemos datos del usuario, verificar autenticación
        if (!user) {
            checkAuth();
        } else {
            setIsLoading(false);
        }
    }, [user, verifyAuth]);

    // Mostrar loading mientras verificamos autenticación
    if (isLoading) {
        console.log('ProtectedRoute cargando...');
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                background: '#f5f7fa'
            }}>
                <div style={{textAlign: 'center'}}>
                    <div className="spinner" style={{
                        width: '50px', 
                        height: '50px', 
                        border: '5px solid #f3f3f3',
                        borderTop: '5px solid #667eea',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <div style={{color: '#667eea', fontSize: '1.1rem'}}>Verificando autenticación...</div>
                </div>
            </div>
        );
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // DEBUG: mostrar usuario y token local para diagnosticar 403s
    try {
        console.log('[ProtectedRoute] user:', user);
        console.log('[ProtectedRoute] token localStorage:', localStorage.getItem('token') || localStorage.getItem('accessToken'));
    } catch (e) {}

    // Si se requiere un rol específico, verificar que el usuario lo tenga
    if (role) {
        const userRole = (user?.role || '').toString().toLowerCase();
        console.log('[ProtectedRoute] role requerido:', role, 'userRole:', userRole);
        // Si role es un array, verificar que el usuario tenga uno de esos roles (normalizando)
        if (Array.isArray(role)) {
            const allowed = role.map(r => r.toString().toLowerCase());
            if (!allowed.includes(userRole)) {
                console.log('[ProtectedRoute] Acceso denegado, redirigiendo a login');
                return <Navigate to="/login" replace />;
            }
        } else {
            // Si role es un string, verificar que coincida (normalizando)
            if (userRole !== String(role).toLowerCase()) {
                console.log('[ProtectedRoute] Acceso denegado, redirigiendo a login');
                return <Navigate to="/login" replace />;
            }
        }
    }

    // Si todo está bien, mostrar el componente hijo
    return children;
};

export default ProtectedRoute;