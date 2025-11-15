import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt, FaUsers, FaTable } from 'react-icons/fa';
import './AdminReservas.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const AdminReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [busqueda, setBusqueda] = useState('');
  
  // Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [reservaEditar, setReservaEditar] = useState(null);

  // Obtener reservas del backend
  const fetchReservas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (filtroEstado) params.append('estado', filtroEstado);
      if (filtroFecha) params.append('fecha', filtroFecha);

      const response = await axios.get(`${API_URL}/reservas?${params}`);
      
      if (response.data.success) {
        setReservas(response.data.reservas);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error al obtener reservas:', err);
      setError('Error al cargar las reservas');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, [page, filtroEstado, filtroFecha]);

  // Filtrar por búsqueda en cliente
  const reservasFiltradas = reservas.filter(reserva => 
    reserva.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
    reserva.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    reserva.telefono.includes(busqueda)
  );

  // Manejar eliminación
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/reservas/${id}`);
      fetchReservas();
      alert('Reserva eliminada correctamente');
    } catch (err) {
      console.error('Error al eliminar reserva:', err);
      alert('Error al eliminar la reserva');
    }
  };

  // Manejar edición
  const handleEditar = (reserva) => {
    setReservaEditar({
      ...reserva,
      fecha: new Date(reserva.fecha).toISOString().split('T')[0]
    });
    setShowEditModal(true);
  };

  // Guardar cambios de edición
  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    
    try {
      await axios.put(`${API_URL}/reservas/${reservaEditar._id}`, reservaEditar);
      setShowEditModal(false);
      fetchReservas();
      alert('Reserva actualizada correctamente');
    } catch (err) {
      console.error('Error al actualizar reserva:', err);
      alert('Error al actualizar la reserva');
    }
  };

  // Cambiar estado de reserva
  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      if (nuevoEstado === 'Confirmada') {
        await axios.patch(`${API_URL}/reservas/${id}/confirmar`);
      } else if (nuevoEstado === 'Completada') {
        await axios.patch(`${API_URL}/reservas/${id}/completar`);
      } else {
        await axios.put(`${API_URL}/reservas/${id}`, { estado: nuevoEstado });
      }
      fetchReservas();
      alert(`Reserva marcada como ${nuevoEstado}`);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      alert('Error al cambiar el estado de la reserva');
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Badge de estado
  const getEstadoBadge = (estado) => {
    const badges = {
      'Pendiente': { icon: <FaClock />, color: 'warning' },
      'Confirmada': { icon: <FaCheckCircle />, color: 'success' },
      'Cancelada': { icon: <FaTimesCircle />, color: 'danger' },
      'Completada': { icon: <FaCheckCircle />, color: 'info' }
    };
    
    const badge = badges[estado] || { icon: <FaClock />, color: 'secondary' };
    
    return (
      <span className={`estado-badge ${badge.color}`}>
        {badge.icon} {estado}
      </span>
    );
  };

  if (loading && reservas.length === 0) {
    return (
      <div className="admin-reservas-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-reservas-page">
      <div className="admin-reservas-container">
        <header className="admin-reservas-header">
          <h1>📋 Gestión de Reservas</h1>
          <p>Panel de administración - {total} reservas totales</p>
        </header>

        {/* Filtros y búsqueda */}
        <div className="filtros-container">
          <div className="filtro-grupo">
            <label>
              <FaSearch /> Buscar Cliente
            </label>
            <input
              type="text"
              placeholder="Nombre, email o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-busqueda"
            />
          </div>

          <div className="filtro-grupo">
            <label>
              <FaCalendarAlt /> Filtrar por Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setPage(1);
              }}
              className="select-filtro"
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Confirmada">Confirmada</option>
              <option value="Cancelada">Cancelada</option>
              <option value="Completada">Completada</option>
            </select>
          </div>

          <div className="filtro-grupo">
            <label>
              <FaCalendarAlt /> Filtrar por Fecha
            </label>
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => {
                setFiltroFecha(e.target.value);
                setPage(1);
              }}
              className="input-fecha"
            />
          </div>

          <button
            className="btn-limpiar-filtros"
            onClick={() => {
              setFiltroEstado('');
              setFiltroFecha('');
              setBusqueda('');
              setPage(1);
            }}
          >
            Limpiar Filtros
          </button>
        </div>

        {/* Tabla de reservas */}
        <div className="tabla-container">
          {error ? (
            <div className="error-message">{error}</div>
          ) : reservasFiltradas.length === 0 ? (
            <div className="no-reservas">
              <p>No se encontraron reservas</p>
            </div>
          ) : (
            <table className="tabla-reservas">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Contacto</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th><FaUsers /> Comensales</th>
                  <th><FaTable /> Mesa</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservasFiltradas.map((reserva) => (
                  <tr key={reserva._id}>
                    <td className="td-cliente">{reserva.cliente}</td>
                    <td className="td-contacto">
                      <div>{reserva.email}</div>
                      <div className="telefono">{reserva.telefono}</div>
                    </td>
                    <td>{formatearFecha(reserva.fecha)}</td>
                    <td className="td-hora">{reserva.hora}</td>
                    <td className="td-center">{reserva.comensales}</td>
                    <td className="td-center">
                      {reserva.mesa ? `Mesa ${reserva.mesa.numero}` : 'Sin asignar'}
                    </td>
                    <td>{getEstadoBadge(reserva.estado)}</td>
                    <td className="td-acciones">
                      <div className="acciones-grupo">
                        {reserva.estado === 'Pendiente' && (
                          <button
                            className="btn-accion confirmar"
                            onClick={() => handleCambiarEstado(reserva._id, 'Confirmada')}
                            title="Confirmar reserva"
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                        {reserva.estado === 'Confirmada' && (
                          <button
                            className="btn-accion completar"
                            onClick={() => handleCambiarEstado(reserva._id, 'Completada')}
                            title="Marcar como completada"
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                        <button
                          className="btn-accion editar"
                          onClick={() => handleEditar(reserva)}
                          title="Editar reserva"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-accion eliminar"
                          onClick={() => handleEliminar(reserva._id)}
                          title="Eliminar reserva"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="paginacion">
            <button
              className="btn-paginacion"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </button>
            <span className="pagina-info">
              Página {page} de {totalPages}
            </span>
            <button
              className="btn-paginacion"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Modal de edición */}
      {showEditModal && reservaEditar && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Editar Reserva</h2>
            <form onSubmit={handleGuardarEdicion}>
              <div className="form-grupo">
                <label>Cliente</label>
                <input
                  type="text"
                  value={reservaEditar.cliente}
                  onChange={(e) => setReservaEditar({...reservaEditar, cliente: e.target.value})}
                  required
                />
              </div>

              <div className="form-grupo">
                <label>Email</label>
                <input
                  type="email"
                  value={reservaEditar.email}
                  onChange={(e) => setReservaEditar({...reservaEditar, email: e.target.value})}
                  required
                />
              </div>

              <div className="form-grupo">
                <label>Teléfono</label>
                <input
                  type="tel"
                  value={reservaEditar.telefono}
                  onChange={(e) => setReservaEditar({...reservaEditar, telefono: e.target.value})}
                  required
                />
              </div>

              <div className="form-grupo">
                <label>Fecha</label>
                <input
                  type="date"
                  value={reservaEditar.fecha}
                  onChange={(e) => setReservaEditar({...reservaEditar, fecha: e.target.value})}
                  required
                />
              </div>

              <div className="form-grupo">
                <label>Hora</label>
                <input
                  type="time"
                  value={reservaEditar.hora}
                  onChange={(e) => setReservaEditar({...reservaEditar, hora: e.target.value})}
                  required
                />
              </div>

              <div className="form-grupo">
                <label>Comensales</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={reservaEditar.comensales}
                  onChange={(e) => setReservaEditar({...reservaEditar, comensales: parseInt(e.target.value)})}
                  required
                />
              </div>

              <div className="form-grupo">
                <label>Comentarios</label>
                <textarea
                  value={reservaEditar.comentarios || ''}
                  onChange={(e) => setReservaEditar({...reservaEditar, comentarios: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="modal-acciones">
                <button type="submit" className="btn-guardar">
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservas;
