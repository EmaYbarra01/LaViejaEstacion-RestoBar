import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaClock, FaUsers, FaTable, FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaTrash, FaArrowLeft } from 'react-icons/fa';
import './MisReservas.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const MisReservas = () => {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [estadisticas, setEstadisticas] = useState(null);

  const fetchReservas = async (emailCliente) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/reservas/cliente/${emailCliente}`);
      
      if (response.data.success) {
        setReservas(response.data.reservas);
        setEstadisticas(response.data.estadisticas);
        setMostrarFormulario(false);
        // Guardar email en localStorage para próximas visitas
        localStorage.setItem('clienteEmail', emailCliente);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error al obtener reservas:', err);
      setError('No se pudieron cargar las reservas');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Intentar cargar email guardado
    const emailGuardado = localStorage.getItem('clienteEmail');
    if (emailGuardado) {
      setEmail(emailGuardado);
      fetchReservas(emailGuardado);
    } else {
      setLoading(false);
    }
  }, []);

  const handleSubmitEmail = (e) => {
    e.preventDefault();
    if (email.trim()) {
      fetchReservas(email.trim());
    }
  };

  const handleCancelarReserva = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/reservas/${id}`);
      // Recargar reservas
      fetchReservas(email);
      alert('Reserva cancelada correctamente');
    } catch (err) {
      console.error('Error al cancelar reserva:', err);
      alert('Error al cancelar la reserva');
    }
  };

  const cambiarEmail = () => {
    localStorage.removeItem('clienteEmail');
    setEmail('');
    setReservas([]);
    setEstadisticas(null);
    setMostrarFormulario(true);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getEstadoConfig = (estado) => {
    const configs = {
      'Pendiente': {
        icon: <FaExclamationCircle />,
        color: 'warning',
        texto: 'Pendiente de confirmación'
      },
      'Confirmada': {
        icon: <FaCheckCircle />,
        color: 'success',
        texto: 'Confirmada'
      },
      'Cancelada': {
        icon: <FaTimesCircle />,
        color: 'danger',
        texto: 'Cancelada'
      },
      'Completada': {
        icon: <FaCheckCircle />,
        color: 'info',
        texto: 'Completada'
      }
    };
    return configs[estado] || configs['Pendiente'];
  };

  const esFutura = (fecha, hora) => {
    const ahora = new Date();
    const fechaReserva = new Date(`${fecha}T${hora}`);
    return fechaReserva > ahora;
  };

  // Separar reservas
  const reservasFuturas = reservas.filter(r => 
    esFutura(r.fecha, r.hora) && (r.estado === 'Pendiente' || r.estado === 'Confirmada')
  );
  const reservasPasadas = reservas.filter(r => 
    !esFutura(r.fecha, r.hora) || r.estado === 'Cancelada' || r.estado === 'Completada'
  );

  if (mostrarFormulario) {
    return (
      <div className="mis-reservas-page">
        <div className="mis-reservas-container">
          <button className="btn-volver" onClick={() => navigate('/')}>
            <FaArrowLeft /> Volver al Inicio
          </button>

          <header className="mis-reservas-header">
            <h1>📋 Mis Reservas</h1>
            <p>Consulta tus reservas ingresando tu email</p>
          </header>

          <div className="email-form-container">
            <form onSubmit={handleSubmitEmail} className="email-form">
              <div className="form-grupo">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-consultar">
                Ver Mis Reservas
              </button>
            </form>
            <div className="info-privacidad">
              <p>🔒 Tu información está segura. Solo podrás ver las reservas asociadas a tu email.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mis-reservas-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mis-reservas-page">
      <div className="mis-reservas-container">
        <button className="btn-volver" onClick={() => navigate('/')}>
          <FaArrowLeft /> Volver al Inicio
        </button>

        <header className="mis-reservas-header">
          <h1>📋 Mis Reservas</h1>
          <p>Email: <strong>{email}</strong></p>
          <button className="btn-cambiar-email" onClick={cambiarEmail}>
            Cambiar Email
          </button>
        </header>

        {estadisticas && (
          <div className="estadisticas-container">
            <div className="stat-card">
              <span className="stat-numero">{reservas.length}</span>
              <span className="stat-label">Total de Reservas</span>
            </div>
            <div className="stat-card warning">
              <span className="stat-numero">{estadisticas.pendientes}</span>
              <span className="stat-label">Pendientes</span>
            </div>
            <div className="stat-card success">
              <span className="stat-numero">{estadisticas.confirmadas}</span>
              <span className="stat-label">Confirmadas</span>
            </div>
            <div className="stat-card info">
              <span className="stat-numero">{estadisticas.completadas}</span>
              <span className="stat-label">Completadas</span>
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {reservas.length === 0 ? (
          <div className="no-reservas">
            <p>No tienes reservas registradas con este email.</p>
            <button className="btn-nueva-reserva" onClick={() => navigate('/reservas')}>
              Hacer una Reserva
            </button>
          </div>
        ) : (
          <>
            {/* Reservas Futuras */}
            {reservasFuturas.length > 0 && (
              <section className="seccion-reservas">
                <h2>🔜 Próximas Reservas</h2>
                <div className="reservas-grid">
                  {reservasFuturas.map(reserva => {
                    const estadoConfig = getEstadoConfig(reserva.estado);
                    return (
                      <div key={reserva._id} className={`reserva-card ${estadoConfig.color}`}>
                        <div className="reserva-header">
                          <div className={`estado-badge ${estadoConfig.color}`}>
                            {estadoConfig.icon}
                            <span>{estadoConfig.texto}</span>
                          </div>
                          {(reserva.estado === 'Pendiente' || reserva.estado === 'Confirmada') && (
                            <button
                              className="btn-cancelar-mini"
                              onClick={() => handleCancelarReserva(reserva._id)}
                              title="Cancelar reserva"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>

                        <div className="reserva-body">
                          <div className="reserva-info-item">
                            <FaCalendarAlt className="icon" />
                            <div>
                              <span className="label">Fecha</span>
                              <span className="value">{formatearFecha(reserva.fecha)}</span>
                            </div>
                          </div>

                          <div className="reserva-info-item">
                            <FaClock className="icon" />
                            <div>
                              <span className="label">Hora</span>
                              <span className="value">{reserva.hora}</span>
                            </div>
                          </div>

                          <div className="reserva-info-item">
                            <FaUsers className="icon" />
                            <div>
                              <span className="label">Comensales</span>
                              <span className="value">{reserva.comensales} personas</span>
                            </div>
                          </div>

                          {reserva.mesa && (
                            <div className="reserva-info-item">
                              <FaTable className="icon" />
                              <div>
                                <span className="label">Mesa</span>
                                <span className="value">Mesa {reserva.mesa.numero}</span>
                              </div>
                            </div>
                          )}

                          {reserva.comentarios && (
                            <div className="reserva-comentarios">
                              <strong>Comentarios:</strong>
                              <p>{reserva.comentarios}</p>
                            </div>
                          )}
                        </div>

                        {reserva.estado === 'Pendiente' && (
                          <div className="reserva-alerta">
                            ⚠️ Revisa tu email para confirmar esta reserva
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Reservas Pasadas */}
            {reservasPasadas.length > 0 && (
              <section className="seccion-reservas">
                <h2>📜 Historial</h2>
                <div className="reservas-grid">
                  {reservasPasadas.map(reserva => {
                    const estadoConfig = getEstadoConfig(reserva.estado);
                    return (
                      <div key={reserva._id} className={`reserva-card ${estadoConfig.color} pasada`}>
                        <div className="reserva-header">
                          <div className={`estado-badge ${estadoConfig.color}`}>
                            {estadoConfig.icon}
                            <span>{estadoConfig.texto}</span>
                          </div>
                        </div>

                        <div className="reserva-body">
                          <div className="reserva-info-item">
                            <FaCalendarAlt className="icon" />
                            <div>
                              <span className="label">Fecha</span>
                              <span className="value">{formatearFecha(reserva.fecha)}</span>
                            </div>
                          </div>

                          <div className="reserva-info-item">
                            <FaClock className="icon" />
                            <div>
                              <span className="label">Hora</span>
                              <span className="value">{reserva.hora}</span>
                            </div>
                          </div>

                          <div className="reserva-info-item">
                            <FaUsers className="icon" />
                            <div>
                              <span className="label">Comensales</span>
                              <span className="value">{reserva.comensales} personas</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MisReservas;
