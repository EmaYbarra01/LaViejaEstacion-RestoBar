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
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <div>Verificando autenticación...</div>
            </div>
        );
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Si se requiere un rol específico, verificar que el usuario lo tenga
    if (role) {
        // Si role es un array, verificar que el usuario tenga uno de esos roles
        if (Array.isArray(role)) {
            if (!role.includes(user.role)) {
                return <Navigate to="/login" replace />;
            }
        } else {
            // Si role es un string, verificar que coincida exactamente
            if (user.role !== role) {
                return <Navigate to="/login" replace />;
            }
        }
    }

    // Si todo está bien, mostrar el componente hijo
    return children;
};

export default ProtectedRoute;