import { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicShell from '../components/PublicShell';
import { requestPasswordReset } from '../helpers/queriesPasswordReset';
import './ForgotPassword.css';

const ForgotPassword = ({ isNightMode, onToggleNightMode }) => {
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await requestPasswordReset(email.trim());
      if (result.success) {
        setMessage({
          type: 'success',
          text: result.data?.mensaje || 'Si el email existe, recibirás un correo con las instrucciones para restablecer tu contraseña.'
        });
        setEmailSent(true);
        setSentTo(email.trim());
        setEmail('');
      } else {
        setMessage({
          type: 'error',
          text: result.data?.mensaje || result.error || 'Error al enviar el correo de recuperación'
        });
      }
    } catch (error) {
      console.error('Error al solicitar recuperación de contraseña:', error);
      setMessage({
        type: 'error',
        text: 'Error de conexión. Por favor, intenta de nuevo más tarde.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicShell isNightMode={isNightMode} onToggleNightMode={onToggleNightMode} pageClass="fp-page" mainClass="fp-main">
      <div className="ps-panel fp-card">
        <h1>Recuperar contraseña</h1>
        <div className="mv-divider" />

        {!emailSent ? (
          <>
            <p className="fp-sub">No te preocupes, te enviaremos instrucciones para restablecerla</p>
            <form onSubmit={handleSubmit} className="fp-form">
              {message.text && (
                <div className={`ps-msg fp-msg ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</div>
              )}
              <div className="ps-field">
                <label htmlFor="fp-email">Correo electrónico</label>
                <input
                  type="email"
                  id="fp-email"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <span className="fp-hint">Ingresa el email asociado a tu cuenta</span>
              </div>
              <button type="submit" className="ps-btn block" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar instrucciones'}
              </button>
            </form>
          </>
        ) : (
          <div className="fp-sent">
            <h3>Solicitud recibida</h3>
            <p>Procesamos la solicitud para <strong>{sentTo}</strong>.</p>
            {message.text && (
              <div className={`ps-msg fp-msg ${message.type}`} role="status">{message.text}</div>
            )}
            <div className="fp-info">
              <b>¿No recibiste el correo?</b>
              <ul>
                <li>Revisa tu carpeta de spam</li>
                <li>Espera unos minutos</li>
                <li>Verifica que el email sea correcto</li>
              </ul>
            </div>
            <button
              type="button"
              className="ps-btn block"
              onClick={() => {
                setEmailSent(false);
                setMessage({ type: '', text: '' });
              }}
            >
              Enviar nuevamente
            </button>
          </div>
        )}

        <Link to="/login" className="fp-back">Volver al inicio de sesión</Link>
      </div>
    </PublicShell>
  );
};

export default ForgotPassword;
