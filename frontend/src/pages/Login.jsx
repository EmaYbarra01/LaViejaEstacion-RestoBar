import { useEffect, useState, useRef } from 'react';
import './Login.css';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import useUserStore from '../store/useUserStore';

const Login = () => {
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
const location = useLocation();
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
        <div id='login-container'>
            <h2 id='login-h2'>Login</h2>
            {(localError || error) && (
                <div style={{ 
                    color: '#ff6b6b', 
                    marginBottom: '15px', 
                    padding: '12px', 
                    border: '1px solid rgba(255, 107, 107, 0.3)', 
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '0.95rem'
                }}>
                    {localError || error}
                </div>
            )}
            <form onSubmit={handleSubmit} id='login-form'>
                <input
                    type="email"
                    placeholder='Email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                />
                <div id='password-container'>
                    <input
                        id='password-input'
                        type={showPassword ? "text" : "password"}
                        placeholder='Contraseña'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={isLoading}
                        required
                    />
                    <span id='toggle-password'
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                    >
                        {showPassword ? '🙈' : '👁️'}
                    </span>
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Ingresando...' : 'Ingresar'}
                </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link 
                    to="/forgot-password" 
                    style={{ 
                        color: '#ffc107', 
                        textDecoration: 'none', 
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'color 0.3s ease'
                    }}
                >
                    ¿Olvidaste tu contraseña?
                </Link>
            </div>
            
        </div>
    );
};

export default Login;