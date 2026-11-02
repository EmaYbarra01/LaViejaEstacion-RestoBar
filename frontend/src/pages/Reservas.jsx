import React, { useState } from 'react';
import { crearReserva } from '../api/reservas.api';
import Swal from 'sweetalert2';
import PublicShell from '../components/PublicShell';
import './Reservas.css';

const HORARIOS_ATENCION = {
  0: { franjas: [{ abre: '09:00', cierra: '12:00' }, { abre: '20:00', cierra: '00:00' }] },
  1: { franjas: [{ abre: '09:00', cierra: '12:00' }, { abre: '20:00', cierra: '00:00' }] },
  2: { franjas: [{ abre: '09:00', cierra: '12:00' }, { abre: '20:00', cierra: '00:00' }] },
  3: { franjas: [{ abre: '09:00', cierra: '12:00' }, { abre: '20:00', cierra: '00:00' }] },
  4: { franjas: [{ abre: '09:00', cierra: '12:00' }, { abre: '20:00', cierra: '00:00' }] },
  5: { franjas: [{ abre: '09:00', cierra: '12:00' }, { abre: '20:00', cierra: '00:00' }] },
  6: { franjas: [{ abre: '09:00', cierra: '12:00' }, { abre: '20:00', cierra: '00:00' }] }
};

const FECHAS_ESPECIALES = {
  diasCerrados: ['01-01', '05-01', '12-25'],
  horariosEspeciales: {
    '12-24': { franjas: [{ abre: '11:00', cierra: '20:00' }] },
    '12-31': { franjas: [{ abre: '19:00', cierra: '03:00' }] }
  }
};

const Reservas = ({ isNightMode, onToggleNightMode }) => {
  const maxComensales = 10;
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

    // Validación básica
    if (!formData.cliente || !formData.email || !formData.telefono || !formData.fecha || !formData.hora) {
      await Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Por favor, completa todos los campos obligatorios.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#642f3a'
      });
      setIsSubmitting(false);
      return;
    }

    const horario = getHorarioAtencion(formData.fecha);
    const minutosSeleccionados = Number(formData.hora.slice(0, 2)) * 60
      + Number(formData.hora.slice(3, 5));
    const horarioValido = horario?.franjas.some(({ abre, cierra }) => {
      const minutosApertura = Number(abre.slice(0, 2)) * 60 + Number(abre.slice(3, 5));
      let minutosCierre = Number(cierra.slice(0, 2)) * 60 + Number(cierra.slice(3, 5));
      const cierraMedianoche = cierra === '00:00' || minutosCierre <= minutosApertura;
      if (cierraMedianoche) minutosCierre = 24 * 60;
      return minutosSeleccionados >= minutosApertura
        && minutosSeleccionados <= minutosCierre
        && (!cierraMedianoche || minutosSeleccionados < minutosCierre);
    });

    if (!horarioValido) {
      await Swal.fire({
        icon: 'warning',
        title: 'Horario no disponible',
        text: 'Elegí un horario entre 09:00 y 12:00, o entre 20:00 y 00:00.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#642f3a'
      });
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
        comensales: formData.comensales === 'evento-especial' ? 10 : parseInt(formData.comensales),
        eventoEspecial: formData.comensales === 'evento-especial',
        comentarios: formData.comentarios
      };

      console.log('[RESERVAS] Enviando reserva:', reservaData);

      // Enviar reserva al backend
      const response = await crearReserva(reservaData);

      console.log('[RESERVAS] Respuesta del servidor:', response);

      if (response.success) {
        await Swal.fire({
          icon: 'success',
          title: '¡Solicitud recibida!',
          html: `
            <div style="text-align: left;">
              <p><strong>Recibimos tu solicitud de reserva.</strong></p>
              <br>
              <p>📧 Te enviaremos un correo a:</p>
              <p style="color: #642f3a; font-weight: bold; text-align: center;">${formData.email}</p>
              <br>
              <p>cuando confirmemos la disponibilidad de mesas para la fecha y hora elegidas.</p>
              <br>
              ${formData.comensales === 'evento-especial'
                ? '<p>🎉 Tu solicitud corresponde a un evento especial.</p>'
                : response.mesaAsignada
                  ? `<p>🪑 <strong>Mesa asignada:</strong> Mesa ${response.mesaAsignada.numero}</p>`
                  : '<p>⏳ El restaurante revisará tu solicitud pronto.</p>'
              }
              <br>
              <p style="font-size: 14px; color: #666;">
                <strong>Importante:</strong> El correo se enviará una sola vez, cuando el restaurante confirme la disponibilidad.
              </p>
            </div>
          `,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#642f3a',
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

      await Swal.fire({
        icon: 'error',
        title: 'No se pudo crear la reserva',
        text: errorMessage,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#642f3a'
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

  const getHorarioAtencion = (fecha) => {
    if (!fecha) return null;

    const fechaObj = new Date(`${fecha}T12:00:00Z`);
    const mesYDia = fecha.slice(5);
    if (FECHAS_ESPECIALES.diasCerrados.includes(mesYDia)) return null;

    return FECHAS_ESPECIALES.horariosEspeciales[mesYDia]
      || HORARIOS_ATENCION[fechaObj.getUTCDay()];
  };

  const horarioAtencion = getHorarioAtencion(formData.fecha);

  return (
    <PublicShell isNightMode={isNightMode} onToggleNightMode={onToggleNightMode} pageClass="rs-page">
      <div className="ps-container rs-container">
        <div className="ps-head">
          <h1>Reserva tu Mesa</h1>
          <div className="mv-divider" />
          <p>La Vieja Estación - Una experiencia gastronómica inolvidable</p>
        </div>

        <form className="ps-panel rs-form" onSubmit={handleSubmit}>
          <div className="rs-row rs-c1">
            <div className="ps-field">
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
          </div>

          <div className="rs-row rs-c2">
            <div className="ps-field">
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

            <div className="ps-field">
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

          <div className="rs-row rs-c3">
            <div className="ps-field">
              <label htmlFor="fecha">Fecha *</label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                value={formData.fecha}
                onChange={(e) => {
                  handleChange(e);
                  setFormData(prev => ({ ...prev, hora: '' }));
                }}
                min={getMinDate()}
                max={maxFecha}
                required
              />
            </div>

            <div className="ps-field">
              <label htmlFor="hora">Hora *</label>
              <input
                type="time"
                id="hora"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                disabled={!formData.fecha || !horarioAtencion}
                step="60"
                required
              />
            </div>

            <div className="ps-field">
              <label htmlFor="comensales">Comensales *</label>
              <select
                id="comensales"
                name="comensales"
                value={formData.comensales}
                onChange={handleChange}
                required
              >
                <option value="evento-especial">Evento especial (más de 10 personas)</option>
                {Array.from({ length: maxComensales }, (_, index) => index + 1).map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'persona' : 'personas'}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.comensales === 'evento-especial' ? (
            <div className="rs-aviso">
              <strong>Organizá tu evento especial</strong>
              <p>Para más de 10 personas, contactanos directamente:</p>
              <a href="mailto:laviejaestacionbar@gmail.com">laviejaestacionbar@gmail.com</a>
              <a href="tel:+543816364592">+54 381 636-4592</a>
            </div>
          ) : (
            <p className="rs-aviso-txt">¿Son más de 10 personas? Elegí “Evento especial”.</p>
          )}

          <div className="rs-info">
            <svg className="ps-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
            <p><strong>Información sobre la reserva:</strong> ¡Gracias por reservar con nosotros! La mesa se asignará teniendo en cuenta la cantidad de personas y la disponibilidad del momento. Una vez confirmada tu reserva, recibirás un email con el número de tu mesa asignada.</p>
          </div>

          <div className="rs-row rs-c1">
            <div className="ps-field">
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
          </div>

          <button type="submit" className="ps-btn block" disabled={isSubmitting}>
            {isSubmitting ? 'Procesando...' : 'Reservar Mesa'}
          </button>
        </form>

        {/* Instrucciones post-reserva */}
        <section className="rs-after">
          <h2 className="ps-section-title">¿Qué sigue después de hacer tu reserva?</h2>
          <div className="rs-steps">
            <div className="ps-panel rs-step">
              <span className="rs-num">1</span>
              <h4>Esperá la revisión del restaurante</h4>
              <p>El restaurante revisará la disponibilidad de mesas para la fecha y hora que elegiste.</p>
            </div>
            <div className="ps-panel rs-step">
              <span className="rs-num">2</span>
              <h4>Esperá la confirmación de disponibilidad</h4>
              <p>Tu solicitud quedará pendiente mientras el restaurante verifica si puede asignarte una mesa.</p>
            </div>
            <div className="ps-panel rs-step">
              <span className="rs-num">3</span>
              <h4>Recibí un único correo de confirmación</h4>
              <p>Si hay disponibilidad, recibirás un correo avisándote que tu reserva fue confirmada. No se envían correos antes de esa confirmación.</p>
            </div>
          </div>

          <div className="ps-panel rs-contact">
            <h4>¿No recibiste el correo de confirmación?</h4>
            <p>Si el restaurante confirmó la disponibilidad y todavía no recibiste el correo:</p>
            <ul>
              <li>Revisa tu carpeta de spam o correo no deseado</li>
              <li>Verifica que escribiste correctamente tu dirección de email</li>
              <li>Contáctanos directamente:</li>
            </ul>
            <div className="rs-contact-grid">
              <div className="rs-contact-item">
                <svg className="ps-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
                <div>
                  <strong>Email</strong>
                  <a href="mailto:laviejaestacionbar@gmail.com">laviejaestacionbar@gmail.com</a>
                </div>
              </div>
              <div className="rs-contact-item">
                <svg className="ps-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>
                <div>
                  <strong>Teléfono</strong>
                  <a href="tel:+543816364592">+54 381 636-4592</a>
                </div>
              </div>
              <div className="rs-contact-item">
                <svg className="ps-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
                <div>
                  <strong>Dirección</strong>
                  <span>Ruta Nacional N°9, km. 1361</span>
                </div>
              </div>
            </div>
            <p className="rs-note">
              <strong>Importante:</strong> Si necesitas cancelar o modificar tu reserva,
              puedes hacerlo desde el enlace que recibirás en el correo o contactándonos
              directamente con al menos 2 horas de anticipación.
            </p>
          </div>
        </section>
      </div>
    </PublicShell>
  );
};

export default Reservas;
