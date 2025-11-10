import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reservas.css';

const Reservas = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fecha: '',
    hora: '',
    personas: '2',
    comentarios: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    // Validación básica
    if (!formData.nombre || !formData.email || !formData.telefono || !formData.fecha || !formData.hora) {
      setMessage({ type: 'error', text: 'Por favor, completa todos los campos obligatorios.' });
      setIsSubmitting(false);
      return;
    }

    try {
      // Simular envío de reserva (aquí puedes conectar con tu backend)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMessage({ 
        type: 'success', 
        text: '¡Reserva realizada con éxito! Te enviaremos un email de confirmación.' 
      });
      
      // Limpiar formulario después de 3 segundos
      setTimeout(() => {
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          fecha: '',
          hora: '',
          personas: '2',
          comentarios: ''
        });
        setMessage({ type: '', text: '' });
      }, 3000);
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Hubo un error al procesar tu reserva. Por favor, intenta nuevamente.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obtener fecha mínima (hoy)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="reservas-page">
      <div className="reservas-container">
        <div className="reservas-header">
          <h1>Reserva tu Mesa</h1>
          <div className="reservas-divider"></div>
          <p>La Vieja Estación - Una experiencia gastronómica inolvidable</p>
        </div>

        <div className="reservas-content">
          <div className="reservas-info">
            <h2>Información</h2>
            <div className="info-item">
              <span className="info-icon">📍</span>
              <div>
                <h3>Dirección</h3>
                <p>Ruta Nacional N°9, km. 1361</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">📞</span>
              <div>
                <h3>Teléfono</h3>
                <p>+54 381 636-4592</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">⏰</span>
              <div>
                <h3>Horarios</h3>
                <p>Lunes a Viernes: 12:00 - 23:00</p>
                <p>Sábados y Domingos: 11:00 - 00:00</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">ℹ️</span>
              <div>
                <h3>Importante</h3>
                <p>Las reservas se confirman por email</p>
                <p>Cancelación gratuita hasta 2 horas antes</p>
              </div>
            </div>
          </div>

          <form className="reservas-form" onSubmit={handleSubmit}>
            {message.text && (
              <div className={`form-message ${message.type}`}>
                {message.text}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="nombre">Nombre completo *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono *</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="+54 11 1234-5678"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fecha">Fecha *</label>
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  min={getMinDate()}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="hora">Hora *</label>
                <input
                  type="time"
                  id="hora"
                  name="hora"
                  value={formData.hora}
                  onChange={handleChange}
                  min="11:00"
                  max="23:00"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="personas">Personas *</label>
                <select
                  id="personas"
                  name="personas"
                  value={formData.personas}
                  onChange={handleChange}
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'persona' : 'personas'}</option>
                  ))}
                  <option value="10+">Más de 10 personas</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="comentarios">Comentarios adicionales</label>
              <textarea
                id="comentarios"
                name="comentarios"
                value={formData.comentarios}
                onChange={handleChange}
                placeholder="Alergias, preferencias de mesa, ocasión especial, etc."
                rows="4"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : 'Reservar Mesa'}
            </button>

            <button 
              type="button" 
              className="back-btn"
              onClick={() => navigate('/')}
            >
              Volver al Inicio
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Reservas;
