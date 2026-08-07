import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearReserva } from '../api/reservas.api';
import Swal from 'sweetalert2';
import './Reservas.css';

const Reservas = () => {
  const navigate = useNavigate();
  const maxComensales = 15;
  const maxFecha = '9999-12-31';
  const [formData, setFormData] = useState({
    cliente: '',
    email: '',
    telefono: '',
    fecha: '',
    hora: '',
    comensales: 2,
    comentarios: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const limitarFechaA4Digitos = (value) => {
    if (!value) return value;

    const [anio, mes, dia] = value.split('-');
    if (!anio) return value;

    return [anio.slice(0, 4), mes, dia].filter(Boolean).join('-');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fecha' ? limitarFechaA4Digitos(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    // Validación básica
    if (!formData.cliente || !formData.email || !formData.telefono || !formData.fecha || !formData.hora) {
      setMessage({ type: 'error', text: 'Por favor, completa todos los campos obligatorios.' });
      setIsSubmitting(false);
      return;
    }

    try {
      // Preparar datos para enviar al backend
      const reservaData = {
        cliente: formData.cliente,
        email: formData.email,
        telefono: formData.telefono,
        fecha: formData.fecha,
        hora: formData.hora,
        comensales: parseInt(formData.comensales),
        comentarios: formData.comentarios
      };

      console.log('[RESERVAS] Enviando reserva:', reservaData);

      // Enviar reserva al backend
      const response = await crearReserva(reservaData);
      
      console.log('[RESERVAS] Respuesta del servidor:', response);

      if (response.success) {
        // Mostrar SweetAlert de éxito
        await Swal.fire({
          icon: 'success',
          title: '¡Reserva Enviada!',
          html: `
            <div style="text-align: left;">
              <p><strong>Tu reserva ha sido enviada exitosamente.</strong></p>
              <br>
              <p>📧 Hemos enviado un correo de confirmación a:</p>
              <p style="color: #667eea; font-weight: bold; text-align: center;">${formData.email}</p>
              <br>
              <p>📬 También enviamos una notificación al restaurante:</p>
              <p style="color: #667eea; font-weight: bold; text-align: center;">laviejaestacionbar@gmail.com</p>
              <br>
              ${response.mesaAsignada 
                ? `<p>🪑 <strong>Mesa asignada:</strong> Mesa ${response.mesaAsignada.numero}</p>` 
                : '<p>⏳ El administrador asignará tu mesa pronto.</p>'
              }
              <br>
              <p style="font-size: 14px; color: #666;">
                <strong>Próximos pasos:</strong><br>
                1️⃣ Revisa tu correo electrónico<br>
                2️⃣ Confirma tu reserva desde el enlace<br>
                3️⃣ Espera la confirmación final del restaurante
              </p>
            </div>
          `,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#667eea',
          allowOutsideClick: false
        });
        
        // Limpiar formulario
        setFormData({
          cliente: '',
          email: '',
          telefono: '',
          fecha: '',
          hora: '',
          comensales: 2,
          comentarios: ''
        });
        setMessage({ type: '', text: '' });
      } else {
        throw new Error(response.mensaje || 'Error al crear la reserva');
      }
      
    } catch (error) {
      console.error('[RESERVAS] Error:', error);
      
      let errorMessage = 'Hubo un error al procesar tu reserva. Por favor, intenta nuevamente.';
      
      if (error.mensaje) {
        errorMessage = error.mensaje;
      } else if (error.errores && Array.isArray(error.errores)) {
        errorMessage = error.errores.join('. ');
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessage({ 
        type: 'error', 
        text: errorMessage
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

        

          <form className="reservas-form" onSubmit={handleSubmit}>
            {message.text && (
              <div className={`form-message ${message.type}`}>
                {message.text}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="cliente">Nombre completo *</label>
              <input
                type="text"
                id="cliente"
                name="cliente"
                value={formData.cliente}
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
                  max={maxFecha}
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
                  min="09:00"
                  max="00:00"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="comensales">Comensales *</label>
                <select
                  id="comensales"
                  name="comensales"
                  value={formData.comensales}
                  onChange={handleChange}
                  required
                >
                  {Array.from({ length: maxComensales }, (_, index) => index + 1).map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'persona' : 'personas'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <div className="info-asignacion-automatica">
                <span className="icon-info">ℹ️</span>
                <p><strong>Asignación de mesa por el administrador:</strong> Una vez recibida tu reserva, nuestro equipo asignará la mejor mesa disponible según el número de comensales y tus preferencias. Recibirás la confirmación con el número de mesa asignada por email.</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="comentarios">Comentarios adicionales</label>
              <textarea
                id="comentarios"
                name="comentarios"
                value={formData.comentarios}
                onChange={handleChange}
                placeholder="Alergias, preferencias de ubicación, ocasión especial, etc."
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

          {/* Instrucciones post-reserva */}
          <div className="post-reserva-info">
            <h3>📋 ¿Qué sigue después de hacer tu reserva?</h3>
            <div className="instrucciones-pasos">
              <div className="paso">
                <span className="paso-numero">1</span>
                <div className="paso-content">
                  <h4>Revisa tu correo electrónico</h4>
                  <p>Recibirás un email con los detalles de tu reserva y un enlace de confirmación.</p>
                </div>
              </div>
              <div className="paso">
                <span className="paso-numero">2</span>
                <div className="paso-content">
                  <h4>Confirma tu reserva</h4>
                  <p>Haz clic en el enlace del correo para confirmar tu asistencia. Tu reserva quedará en estado "Pendiente" hasta que la confirmes.</p>
                </div>
              </div>
              <div className="paso">
                <span className="paso-numero">3</span>
                <div className="paso-content">
                  <h4>Espera la confirmación final</h4>
                  <p>El restaurante revisará tu reserva y te enviará un correo de confirmación definitiva.</p>
                </div>
              </div>
            </div>

            <div className="contacto-alternativo">
              <h4>⚠️ ¿No recibiste el correo de confirmación?</h4>
              <p>Si escribiste mal tu email o no te llegó el correo en los próximos minutos:</p>
              <ul>
                <li>Revisa tu carpeta de spam o correo no deseado</li>
                <li>Verifica que escribiste correctamente tu dirección de email</li>
                <li>Contáctanos directamente:</li>
              </ul>
              <div className="contacto-directo">
                <div className="contacto-item">
                  <span className="contacto-icon">📧</span>
                  <div>
                    <strong>Email:</strong>
                    <a href="mailto:laviejaestacionbar@gmail.com">
                      laviejaestacionbar@gmail.com
                    </a>
                  </div>
                </div>
                <div className="contacto-item">
                  <span className="contacto-icon">📞</span>
                  <div>
                    <strong>Teléfono:</strong>
                    <a href="tel:+543816364592">+54 381 636-4592</a>
                  </div>
                </div>
                <div className="contacto-item">
                  <span className="contacto-icon">📍</span>
                  <div>
                    <strong>Dirección:</strong>
                    <span>Ruta Nacional N°9, km. 1361</span>
                  </div>
                </div>
              </div>
              <p className="nota-importante">
                <strong>Importante:</strong> Si necesitas cancelar o modificar tu reserva, 
                puedes hacerlo desde el enlace que recibirás en el correo o contactándonos 
                directamente con al menos 2 horas de anticipación.
              </p>
            </div>
          </div>
        </div>
      </div>
    
  );
};

export default Reservas;
