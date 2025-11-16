import { useState } from 'react';
import usePedidosCocina from '../hooks/usePedidosCocina';
import PedidoCard from '../components/cocina/PedidoCard';
import { fetchEstadisticasCocina } from '../api/cocinaAPI';
import useUserStore from '../store/useUserStore';
import './CocinaView.css';

/**
 * Vista de Cocina para EncargadoCocina
 * Implementa HU5, HU6: Gestión completa de pedidos en cocina
 * 
 * Características:
 * - Visualización en tiempo real de pedidos
 * - Filtros por estado
 * - Estadísticas en tiempo real
 * - Actualización automática vía sockets
 * - Interfaz intuitiva con indicadores visuales
 */
const CocinaView = () => {
  const { user } = useUserStore();
  const isGerente = user?.role === 'Gerente' || user?.role === 'SuperAdministrador';
  const [vistaActiva, setVistaActiva] = useState('todos'); // todos, pendientes, preparacion, listos
  const [estadisticas, setEstadisticas] = useState(null);
  
  // Hook personalizado para manejar pedidos
  const {
    pedidos,
    loading,
    error,
    filtroEstado,
    setFiltroEstado,
    cargarPedidos,
    cambiarEstado
  } = usePedidosCocina({
    estadoInicial: null,
    autoRefresh: true,
    refreshInterval: 30000
  });

  /**
   * Cargar estadísticas
   */
  const cargarEstadisticas = async () => {
    try {
      const data = await fetchEstadisticasCocina();
      if (data.success) {
        setEstadisticas(data.estadisticas);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  /**
   * Cambiar vista y aplicar filtro
   */
  const cambiarVista = (vista) => {
    setVistaActiva(vista);
    
    switch (vista) {
      case 'pendientes':
        setFiltroEstado('Pendiente');
        break;
      case 'preparacion':
        setFiltroEstado('En Preparación');
        break;
      case 'listos':
        setFiltroEstado('Listo');
        break;
      default:
        setFiltroEstado(null);
    }
  };

  /**
   * Refrescar todo
   */
  const refrescarTodo = async () => {
    await Promise.all([
      cargarPedidos(true),
      cargarEstadisticas()
    ]);
  };

  /**
   * Filtrar pedidos según la vista activa
   */
  const pedidosFiltrados = () => {
    if (!pedidos) return [];
    
    switch (vistaActiva) {
      case 'pendientes':
        return pedidos.filter(p => p.estado === 'Pendiente');
      case 'preparacion':
        return pedidos.filter(p => p.estado === 'En Preparación');
      case 'listos':
        return pedidos.filter(p => p.estado === 'Listo');
      default:
        return pedidos.filter(p => !['Cancelado', 'Cobrado'].includes(p.estado));
    }
  };

  return (
    <div className="cocina-view">
      {/* Header */}
      <header className="cocina-header">
        <div className="header-content">
          <h1>🍳 Cocina - Gestión de Pedidos</h1>
          <button 
            onClick={refrescarTodo} 
            className="btn-refrescar"
            disabled={loading}
          >
            🔄 Actualizar
          </button>
        </div>
      </header>

      {/* Banner de Solo Lectura para Gerente */}
      {isGerente && (
        <div style={{ 
          padding: '12px 20px', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold',
          borderBottom: '3px solid #ffc107',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          🔍 MODO SUPERVISIÓN - Solo Lectura (No se pueden cambiar estados de pedidos)
        </div>
      )}

      {/* Estadísticas */}
      {estadisticas && (
        <div className="estadisticas-bar">
          <div className="stat-item">
            <span className="stat-label">Pendientes</span>
            <span className="stat-value pendientes">{estadisticas.pendientes || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">En Preparación</span>
            <span className="stat-value preparacion">{estadisticas.enPreparacion || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Listos</span>
            <span className="stat-value listos">{estadisticas.listos || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Hoy</span>
            <span className="stat-value total">{estadisticas.totalHoy || 0}</span>
          </div>
        </div>
      )}

      {/* Filtros / Tabs */}
      <div className="filtros-tabs">
        <button
          className={`tab-btn ${vistaActiva === 'todos' ? 'active' : ''}`}
          onClick={() => cambiarVista('todos')}
        >
          📋 Todos
        </button>
        <button
          className={`tab-btn ${vistaActiva === 'pendientes' ? 'active' : ''}`}
          onClick={() => cambiarVista('pendientes')}
        >
          ⏸️ Pendientes
        </button>
        <button
          className={`tab-btn ${vistaActiva === 'preparacion' ? 'active' : ''}`}
          onClick={() => cambiarVista('preparacion')}
        >
          🔥 En Preparación
        </button>
        <button
          className={`tab-btn ${vistaActiva === 'listos' ? 'active' : ''}`}
          onClick={() => cambiarVista('listos')}
        >
          ✅ Listos
        </button>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="alert alert-error">
          <span>❌</span>
          <p>{error}</p>
          <button onClick={() => cargarPedidos(true)}>Reintentar</button>
        </div>
      )}

      {/* Loading */}
      {loading && pedidos.length === 0 && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando pedidos...</p>
        </div>
      )}

      {/* Lista de pedidos */}
      <div className="pedidos-container">
        {!loading && pedidosFiltrados().length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No hay pedidos {vistaActiva !== 'todos' ? `en estado "${vistaActiva}"` : 'en este momento'}</h3>
            <p>Los nuevos pedidos aparecerán automáticamente aquí</p>
          </div>
        )}

        <div className="pedidos-grid">
          {pedidosFiltrados().map((pedido) => (
            <PedidoCard
              key={pedido._id}
              pedido={pedido}
              onCambiarEstado={cambiarEstado}
            />
          ))}
        </div>
      </div>

      {/* Indicador de actualización automática */}
      <div className="footer-info">
        <span className="conexion-status">
          🟢 Actualización automática activa
        </span>
        <span className="ultimo-update">
          Última actualización: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default CocinaView;
