import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  // Verificar token al cargar
  useEffect(() => {
    if (!token) {
      setMessage({
        type: 'error',
        text: 'Token no proporcionado. El enlace es inválido.'
      });
      setVerifying(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-reset-token/${token}`);
      const data = await response.json();

      if (data.valid) {
        setTokenValid(true);
        setUserEmail(data.email);
      } else {
        setMessage({
          type: 'error',
          text: data.mensaje || 'El enlace ha expirado o es inválido'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({
        type: 'error',
        text: 'Error al verificar el token. Por favor, intenta de nuevo.'
      });
    } finally {
      setVerifying(false);
    }
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return '';
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
      return 'strong';
    }
    return 'medium';
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPasswords({ ...passwords, newPassword });
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validaciones
    if (passwords.newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'La contraseña debe tener al menos 6 caracteres'
      });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Las contraseñas no coinciden'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          newPassword: passwords.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: data.mensaje
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: data.mensaje || 'Error al restablecer la contraseña'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({
        type: 'error',
        text: 'Error de conexión. Por favor, intenta de nuevo.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="verifying-container">
            <div className="spinner-large"></div>
            <h3>Verificando enlace...</h3>
            <p>Por favor espera un momento</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="error-container">
            <div className="error-icon">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h2>Enlace Inválido o Expirado</h2>
            <p>{message.text}</p>
            <div className="error-actions">
              <Link to="/forgot-password" className="btn btn-primary">
                <i className="bi bi-arrow-counterclockwise me-2"></i>
                Solicitar Nuevo Enlace
              </Link>
              <Link to="/login" className="btn btn-secondary">
                <i className="bi bi-arrow-left me-2"></i>
                Volver al Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <div className="icon-container">
            <i className="bi bi-key"></i>
          </div>
          <h2>Restablecer Contraseña</h2>
          <p className="subtitle">
            Crea una nueva contraseña para <strong>{userEmail}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="newPassword">
              <i className="bi bi-lock"></i>
              Nueva Contraseña
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                className="form-control"
                placeholder="Ingresa tu nueva contraseña"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
              </button>
            </div>
            {passwords.newPassword && (
              <div className="password-strength">
                <div className={`strength-bar strength-${passwordStrength}`}>
                  <div className="strength-fill"></div>
                </div>
                <span className={`strength-text strength-${passwordStrength}`}>
                  {passwordStrength === 'weak' && '⚠️ Débil'}
                  {passwordStrength === 'medium' && '✓ Media'}
                  {passwordStrength === 'strong' && '✓✓ Fuerte'}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <i className="bi bi-lock-fill"></i>
              Confirmar Contraseña
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                className="form-control"
                placeholder="Confirma tu nueva contraseña"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
              </button>
            </div>
            {passwords.confirmPassword && (
              <small className={`match-indicator ${passwords.newPassword === passwords.confirmPassword ? 'match' : 'no-match'}`}>
                {passwords.newPassword === passwords.confirmPassword ? (
                  <><i className="bi bi-check-circle"></i> Las contraseñas coinciden</>
                ) : (
                  <><i className="bi bi-x-circle"></i> Las contraseñas no coinciden</>
                )}
              </small>
            )}
          </div>

          <div className="password-requirements">
            <p><i className="bi bi-info-circle"></i> <strong>Requisitos:</strong></p>
            <ul>
              <li className={passwords.newPassword.length >= 6 ? 'met' : ''}>
                Mínimo 6 caracteres
              </li>
              <li className={/[A-Z]/.test(passwords.newPassword) ? 'met' : ''}>
                Al menos una mayúscula (recomendado)
              </li>
              <li className={/\d/.test(passwords.newPassword) ? 'met' : ''}>
                Al menos un número (recomendado)
              </li>
            </ul>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type}`}>
              <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading || !passwords.newPassword || !passwords.confirmPassword}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Restableciendo...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>
                Restablecer Contraseña
              </>
            )}
          </button>
        </form>

        <div className="reset-password-footer">
          <Link to="/login" className="back-link">
            <i className="bi bi-arrow-left"></i>
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
