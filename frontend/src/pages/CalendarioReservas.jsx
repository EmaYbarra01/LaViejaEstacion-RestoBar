import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaClock, FaUsers, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';
import './CalendarioReservas.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const CalendarioReservas = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservas, setReservas] = useState([]);
  const [reservasDelMes, setReservasDelMes] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [reservasDelDia, setReservasDelDia] = useState([]);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Obtener reservas del mes actual
  useEffect(() => {
    fetchReservasDelMes();
  }, [currentDate]);

  const fetchReservasDelMes = async () => {
    try {
      setLoading(true);
      const primerDia = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const ultimoDia = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Obtener todas las reservas sin filtro de fecha específico
      const response = await axios.get(`${API_URL}/reservas`, {
        params: { limit: 500 }
      });

      if (response.data.success) {
        const todasReservas = response.data.reservas;
        
        // Filtrar reservas del mes actual
        const reservasMes = todasReservas.filter(reserva => {
          const fechaReserva = new Date(reserva.fecha);
          return fechaReserva >= primerDia && fechaReserva <= ultimoDia;
        });

        // Agrupar por fecha
        const reservasPorFecha = {};
        reservasMes.forEach(reserva => {
          const fecha = new Date(reserva.fecha).toISOString().split('T')[0];
          if (!reservasPorFecha[fecha]) {
            reservasPorFecha[fecha] = [];
          }
          reservasPorFecha[fecha].push(reserva);
        });

        setReservasDelMes(reservasPorFecha);
        setReservas(reservasMes);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener reservas del mes:', error);
      setLoading(false);
    }
  };

  // Generar días del calendario
  const generarDiasCalendario = () => {
    const año = currentDate.getFullYear();
    const mes = currentDate.getMonth();
    
    const primerDiaMes = new Date(año, mes, 1);
    const ultimoDiaMes = new Date(año, mes + 1, 0);
    const primerDiaSemana = primerDiaMes.getDay();
    const diasEnMes = ultimoDiaMes.getDate();

    const dias = [];

    // Días del mes anterior (espacios vacíos)
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null);
    }

    // Días del mes actual
    for (let dia = 1; dia <= diasEnMes; dia++) {
      dias.push(new Date(año, mes, dia));
    }

    return dias;
  };

  const cambiarMes = (direccion) => {
    const nuevoMes = new Date(currentDate);
    nuevoMes.setMonth(currentDate.getMonth() + direccion);
    setCurrentDate(nuevoMes);
    setSelectedDate(null);
    setReservasDelDia([]);
  };

  const seleccionarDia = (fecha) => {
    if (!fecha) return;

    setSelectedDate(fecha);
    const fechaStr = fecha.toISOString().split('T')[0];
    const reservasDia = reservasDelMes[fechaStr] || [];
    setReservasDelDia(reservasDia);
  };

  const obtenerEstadisticasDia = (fecha) => {
    if (!fecha) return null;

    const fechaStr = fecha.toISOString().split('T')[0];
    const reservasDia = reservasDelMes[fechaStr] || [];

    if (reservasDia.length === 0) return null;

    const pendientes = reservasDia.filter(r => r.estado === 'Pendiente').length;
    const confirmadas = reservasDia.filter(r => r.estado === 'Confirmada').length;
    const canceladas = reservasDia.filter(r => r.estado === 'Cancelada').length;
    const completadas = reservasDia.filter(r => r.estado === 'Completada').length;

    return {
      total: reservasDia.length,
      pendientes,
      confirmadas,
      canceladas,
      completadas
    };
  };

  const esHoy = (fecha) => {
    if (!fecha) return false;
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return <FaExclamationCircle className="icon-warning" />;
      case 'Confirmada':
        return <FaCheckCircle className="icon-success" />;
      case 'Cancelada':
        return <FaTimesCircle className="icon-danger" />;
      case 'Completada':
        return <FaCheckCircle className="icon-info" />;
      default:
        return <FaClock />;
    }
  };

  const dias = generarDiasCalendario();

  return (
    <div className="calendario-reservas-page">
      <div className="calendario-container">
        <header className="calendario-header">
          <h1><FaCalendarAlt /> Calendario de Reservas</h1>
          <p>Vista mensual de todas las reservas del restaurante</p>
        </header>

        <div className="calendario-navegacion">
          <button className="btn-nav" onClick={() => cambiarMes(-1)}>
            <FaChevronLeft />
          </button>
          <h2 className="mes-año">
            {meses[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button className="btn-nav" onClick={() => cambiarMes(1)}>
            <FaChevronRight />
          </button>
        </div>

        <div className="calendario-grid-container">
          {/* Días de la semana */}
          <div className="dias-semana">
            {diasSemana.map(dia => (
              <div key={dia} className="dia-semana-header">
                {dia}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="dias-grid">
            {dias.map((fecha, index) => {
              const stats = obtenerEstadisticasDia(fecha);
              const isHoy = esHoy(fecha);
              const isSelected = selectedDate && fecha && 
                fecha.toDateString() === selectedDate.toDateString();

              return (
                <div
                  key={index}
                  className={`dia-celda ${!fecha ? 'vacio' : ''} ${isHoy ? 'hoy' : ''} ${isSelected ? 'selected' : ''} ${stats ? 'con-reservas' : ''}`}
                  onClick={() => seleccionarDia(fecha)}
                >
                  {fecha && (
                    <>
                      <div className="dia-numero">{fecha.getDate()}</div>
                      {stats && (
                        <div className="dia-stats">
                          <div className="stats-badges">
                            {stats.pendientes > 0 && (
                              <span className="badge badge-warning" title="Pendientes">
                                {stats.pendientes}
                              </span>
                            )}
                            {stats.confirmadas > 0 && (
                              <span className="badge badge-success" title="Confirmadas">
                                {stats.confirmadas}
                              </span>
                            )}
                            {stats.completadas > 0 && (
                              <span className="badge badge-info" title="Completadas">
                                {stats.completadas}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel de detalles del día seleccionado */}
        {selectedDate && (
          <div className="detalles-dia">
            <h3>
              <FaCalendarAlt /> {formatearFecha(selectedDate)}
            </h3>
            
            {reservasDelDia.length === 0 ? (
              <p className="no-reservas-dia">No hay reservas para este día</p>
            ) : (
              <>
                <div className="resumen-dia">
                  <div className="stat-card">
                    <span className="stat-numero">{reservasDelDia.length}</span>
                    <span className="stat-label">Total</span>
                  </div>
                  <div className="stat-card warning">
                    <span className="stat-numero">
                      {reservasDelDia.filter(r => r.estado === 'Pendiente').length}
                    </span>
                    <span className="stat-label">Pendientes</span>
                  </div>
                  <div className="stat-card success">
                    <span className="stat-numero">
                      {reservasDelDia.filter(r => r.estado === 'Confirmada').length}
                    </span>
                    <span className="stat-label">Confirmadas</span>
                  </div>
                </div>

                <div className="lista-reservas-dia">
                  {reservasDelDia
                    .sort((a, b) => a.hora.localeCompare(b.hora))
                    .map(reserva => (
                      <div key={reserva._id} className={`reserva-card ${reserva.estado.toLowerCase()}`}>
                        <div className="reserva-hora">
                          <FaClock />
                          <span>{reserva.hora}</span>
                        </div>
                        <div className="reserva-info">
                          <h4>{reserva.cliente}</h4>
                          <div className="reserva-detalles">
                            <span>
                              <FaUsers /> {reserva.comensales} personas
                            </span>
                            {reserva.mesa && (
                              <span>Mesa {reserva.mesa.numero}</span>
                            )}
                          </div>
                          <div className="reserva-contacto">
                            <small>{reserva.email}</small>
                            <small>{reserva.telefono}</small>
                          </div>
                        </div>
                        <div className="reserva-estado">
                          {getEstadoIcon(reserva.estado)}
                          <span>{reserva.estado}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        )}

        {loading && (
          <div className="calendario-loading">
            <div className="spinner"></div>
            <p>Cargando reservas...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarioReservas;
