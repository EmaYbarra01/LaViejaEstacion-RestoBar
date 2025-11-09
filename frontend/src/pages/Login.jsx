import { useEffect, useState } from 'react';
import './Login.css';
import { useNavigate, Link } from 'react-router-dom';
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

// Obtener funciones y estado del store de Zustand
const { login, isLoading, error, clearError, user, isAuthenticated } = useUserStore();

// Si ya está autenticado, redirigir
useEffect(() => {
    if (isAuthenticated && user) {
        if (user.role === 'admin' || user.role === 'superadmin') {
            navigate('/admin/products');
        } else {
            navigate('/');
        }
    }
}, [isAuthenticated, user, navigate]);

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
            // El store ya se encarga de actualizar el estado global
            // La redirección se maneja en el useEffect de arriba
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
                    color: 'red', 
                    marginBottom: '10px', 
                    padding: '8px', 
                    border: '1px solid red', 
                    borderRadius: '4px',
                    backgroundColor: '#ffe6e6'
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
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <Link 
                    to="/forgot-password" 
                    style={{ 
                        color: '#667eea', 
                        textDecoration: 'none', 
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    ¿Olvidaste tu contraseña?
                </Link>
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <p style={{ color: '#666', fontSize: '14px' }}>
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;