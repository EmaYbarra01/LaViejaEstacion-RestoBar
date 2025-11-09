import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: data.mensaje
        });
        setEmailSent(true);
        setEmail('');
      } else {
        setMessage({
          type: 'error',
          text: data.mensaje || 'Error al enviar el correo de recuperación'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({
        type: 'error',
        text: 'Error de conexión. Por favor, intenta de nuevo más tarde.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <div className="icon-container">
            <i className="bi bi-shield-lock"></i>
          </div>
          <h2>¿Olvidaste tu contraseña?</h2>
          <p className="subtitle">
            No te preocupes, te enviaremos instrucciones para restablecerla
          </p>
        </div>

        {!emailSent ? (
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email">
                <i className="bi bi-envelope"></i>
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <small className="form-text">
                Ingresa el email asociado a tu cuenta
              </small>
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
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Enviando...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2"></i>
                  Enviar Instrucciones
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="email-sent-message">
            <div className="success-icon">
              <i className="bi bi-envelope-check"></i>
            </div>
            <h3>¡Correo Enviado!</h3>
            <p>
              Si existe una cuenta con el email <strong>{email}</strong>, 
              recibirás un correo con las instrucciones para restablecer tu contraseña.
            </p>
            <div className="info-box">
              <i className="bi bi-info-circle"></i>
              <div>
                <p><strong>¿No recibiste el correo?</strong></p>
                <ul>
                  <li>Revisa tu carpeta de spam</li>
                  <li>Espera unos minutos</li>
                  <li>Verifica que el email sea correcto</li>
                </ul>
              </div>
            </div>
            <button
              className="btn btn-secondary btn-block"
              onClick={() => {
                setEmailSent(false);
                setMessage({ type: '', text: '' });
              }}
            >
              <i className="bi bi-arrow-counterclockwise me-2"></i>
              Enviar Nuevamente
            </button>
          </div>
        )}

        <div className="forgot-password-footer">
          <Link to="/login" className="back-link">
            <i className="bi bi-arrow-left"></i>
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
