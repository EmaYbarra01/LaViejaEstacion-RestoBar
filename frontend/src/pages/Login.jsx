import { useEffect, useState, useRef } from 'react';
import './AccesoEmpleados.css';
import { useNavigate, Link } from 'react-router-dom';
import useUserStore from '../store/useUserStore';
import PublicShell from '../components/PublicShell';

const Login = ({ isNightMode, onToggleNightMode }) => {
// Nueva lógica de login con Zustand:
// 1. Obtener credenciales del formulario
// 2. Usar el store de Zustand para hacer login
// 3. El backend establece una cookie JWT httpOnly
// 4. Zustand guarda los datos del usuario en el estado global
// 5. Redirigir según el rol del usuario

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [localError, setLocalError] = useState("");
const navigate = useNavigate();
const hasRedirected = useRef(false);

// Obtener funciones y estado del store de Zustand
const { login, isLoading, error, clearError, user, isAuthenticated } = useUserStore();

// NO redirigir automáticamente - solo en handleSubmit después del login exitoso

// Limpiar errores cuando el usuario empiece a escribir
useEffect(() => {
    if (localError) {
        setLocalError("");
    }
    if (error) {
        clearError();
    }
}, [email, password, error, clearError]);

const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    // Validaciones básicas
    if (!email || !password) {
        setLocalError("Por favor, complete todos los campos");
        return;
    }

    try {
        // Usar la función de login del store
        const result = await login(email, password);
        console.log('Resultado del login:', result);
        
        if (result.success) {
            const rol = result.user?.role || '';
            
            // Redirigir según rol exacto
            if (rol === 'SuperAdministrador') {
                navigate('/admin/dashboard', { replace: true });
            } else if (rol === 'Gerente') {
                navigate('/admin/dashboard', { replace: true });
            } else if (rol === 'Mozo') {
                navigate('/mozo', { replace: true });
            } else if (rol === 'EncargadoCocina') {
                navigate('/encargado-cocina', { replace: true });
            } else if (rol === 'Cajero') {
                navigate('/caja', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } else {
            setLocalError(result.message || 'Error en el login');
        }
    } catch (err) {
        console.error('Error durante el login:', err);
        setLocalError('Error de conexión. Por favor, intente nuevamente.');
    }
};



    const [showPassword, setShowPassword] = useState(false);

    return (
        <PublicShell isNightMode={isNightMode} onToggleNightMode={onToggleNightMode} pageClass="ae-page" mainClass="ae-main">
            <div className="ps-panel ae-login" id="ae-login">
                <h1 id="ae-title">Acceso Empleados</h1>
                <div className="mv-divider" />
                <form onSubmit={handleSubmit} id="ae-form" className="ae-form">
                    {(localError || error) && (
                        <div className="ps-msg ae-msg">{localError || error}</div>
                    )}
                    <div className="ps-field">
                        <label htmlFor="login-email">Email</label>
                        <input
                            id="login-email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <div className="ps-field ae-pass" id="ae-password">
                        <label htmlFor="password-input">Contraseña</label>
                        <input
                            id="password-input"
                            type={showPassword ? "text" : "password"}
                            placeholder="Contraseña"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                        <button
                            type="button"
                            className="ae-eye"
                            id="ae-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                                <circle cx="12" cy="12" r="3" />
                                {showPassword && <path d="M4 4l16 16" />}
                            </svg>
                        </button>
                    </div>
                    <button type="submit" className="ps-btn block" disabled={isLoading}>
                        {isLoading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>
                <Link to="/forgot-password" className="ae-forgot">¿Olvidaste tu contraseña?</Link>
            </div>
        </PublicShell>
    );
};

export default Login;