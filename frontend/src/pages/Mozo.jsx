import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Mozo.css';
import PedidoDetalle from '../components/mozo/PedidoDetalle';
import CrearPedidoModal from '../components/mozo/CrearPedidoModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const Mozo = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [mostrarCrearPedido, setMostrarCrearPedido] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState(null);
  const [vistaActiva, setVistaActiva] = useState('pedidos'); // pedidos, menu, cuenta

  // Obtener pedidos abiertos
  useEffect(() => {
    cargarPedidosAbiertos();
    cargarMesas();
    cargarProductos();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      cargarPedidosAbiertos();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const cargarPedidosAbiertos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/pedidos`, {
        params: {
          estado: 'Pendiente,En Preparación,Listo,Entregado'
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setPedidos(response.data);
      setError(null);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      setError('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const cargarMesas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/mesas`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMesas(response.data);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
    }
  };

  const cargarProductos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/productos`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProductos(response.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const handleSeleccionarPedido = (pedido) => {
    setPedidoSeleccionado(pedido);
  };

  const handleCerrarDetalle = () => {
    setPedidoSeleccionado(null);
    cargarPedidosAbiertos();
  };

  const handleCrearPedido = () => {
    setMostrarCrearPedido(true);
  };

  const handleCerrarCrearPedido = () => {
    setMostrarCrearPedido(false);
    cargarPedidosAbiertos();
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'estado-pendiente';
      case 'En Preparación':
        return 'estado-preparacion';
      case 'Listo':
        return 'estado-listo';
      case 'Entregado':
        return 'estado-entregado';
      default:
        return '';
    }
  };

  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return '⏰';
      case 'En Preparación':
        return '👨‍🍳';
      case 'Listo':
        return '✅';
      case 'Entregado':
        return '🍽️';
      default:
        return '📋';
    }
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    const cumpleFiltroEstado = filtroEstado === 'todos' || pedido.estado === filtroEstado;
    const cumpleBusqueda = busqueda === '' || 
      pedido.numeroPedido?.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.numeroMesa?.toString().includes(busqueda) ||
      pedido.nombreMozo?.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleFiltroEstado && cumpleBusqueda;
  });

  if (loading) {
    return (
      <div className="mozo-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  // Calcular totales
  const calcularTotalPedidos = () => {
    return pedidos.reduce((sum, pedido) => sum + (pedido.total || 0), 0);
  };

  const calcularCantidadProductos = () => {
    return pedidos.reduce((sum, pedido) => 
      sum + pedido.productos.reduce((pSum, item) => pSum + item.cantidad, 0), 0);
  };

  return (
    <div className="mozo-container">
      {/* Header */}
      <div className="mozo-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ←
          </button>
          <h1>Panel del Mozo</h1>
        </div>
        <div className="header-right">
          <button className="btn-grid-view">
            <span className="grid-icon">⊞</span>
          </button>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="mozo-tabs">
        <button 
          className={`tab-button ${vistaActiva === 'pedidos' ? 'active' : ''}`}
          onClick={() => setVistaActiva('pedidos')}
        >
          <span>📋</span>
          <span>Pedidos</span>
        </button>
        <button 
          className={`tab-button ${vistaActiva === 'menu' ? 'active' : ''}`}
          onClick={() => setVistaActiva('menu')}
        >
          <span>📖</span>
          <span>Menú</span>
        </button>
        <button 
          className={`tab-button ${vistaActiva === 'cuenta' ? 'active' : ''}`}
          onClick={() => setVistaActiva('cuenta')}
        >
          <span>💰</span>
          <span>Cuenta</span>
        </button>
      </div>

      {/* Vista de Pedidos */}
      {vistaActiva === 'pedidos' && (
        <>
          {/* Barra de búsqueda y filtros */}
          <div className="mozo-toolbar">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por mesa, pedido o mozo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button className="btn-search">
            🔍
          </button>
          <button className="btn-qr">
            📷
          </button>
        </div>
      </div>

      {/* Filtros de estado */}
      <div className="filtros-container">
        <button
          className={`filtro-chip ${filtroEstado === 'todos' ? 'active' : ''}`}
          onClick={() => setFiltroEstado('todos')}
        >
          Todos ({pedidos.length})
        </button>
        <button
          className={`filtro-chip ${filtroEstado === 'Pendiente' ? 'active' : ''}`}
          onClick={() => setFiltroEstado('Pendiente')}
        >
          ⏰ Pendientes ({pedidos.filter(p => p.estado === 'Pendiente').length})
        </button>
        <button
          className={`filtro-chip ${filtroEstado === 'En Preparación' ? 'active' : ''}`}
          onClick={() => setFiltroEstado('En Preparación')}
        >
          👨‍🍳 En Cocina ({pedidos.filter(p => p.estado === 'En Preparación').length})
        </button>
        <button
          className={`filtro-chip ${filtroEstado === 'Listo' ? 'active' : ''}`}
          onClick={() => setFiltroEstado('Listo')}
        >
          ✅ Listos ({pedidos.filter(p => p.estado === 'Listo').length})
        </button>
      </div>

      {/* Grid de pedidos */}
      <div className="pedidos-grid">
        {pedidosFiltrados.length === 0 ? (
          <div className="no-pedidos">
            <p>No hay pedidos {filtroEstado !== 'todos' ? `en estado "${filtroEstado}"` : 'disponibles'}</p>
            <button className="btn-crear-pedido" onClick={handleCrearPedido}>
              + Crear Nuevo Pedido
            </button>
          </div>
        ) : (
          pedidosFiltrados.map((pedido) => (
            <div
              key={pedido._id}
              className={`pedido-card ${obtenerColorEstado(pedido.estado)}`}
              onClick={() => handleSeleccionarPedido(pedido)}
            >
              {/* Header de la card */}
              <div className="card-header">
                <div className="card-tipo">
                  {pedido.tipoServicio === 'Delivery' ? (
                    <>
                      <span className="icono-tipo">🛵</span>
                      <span>Delivery</span>
                    </>
                  ) : pedido.tipoServicio === 'Retirada' ? (
                    <>
                      <span className="icono-tipo">🚶</span>
                      <span>Retirada</span>
                    </>
                  ) : (
                    <>
                      <span className="icono-tipo">🍽️</span>
                      <span>Local</span>
                    </>
                  )}
                </div>
                <button className="btn-opciones" onClick={(e) => e.stopPropagation()}>
                  ⋮
                </button>
              </div>

              {/* Contenido principal */}
              <div className="card-content">
                <h3 className="card-title">
                  {pedido.numeroMesa ? `Mesa ${pedido.numeroMesa}` : pedido.nombreMozo || 'Pedido sin asignar'}
                </h3>
                
                <div className="card-precio">
                  R$ {pedido.total?.toFixed(2) || '0.00'}
                </div>
                
                <div className="card-fecha">
                  {new Date(pedido.fechaCreacion).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Footer con estado */}
              <div className={`card-footer ${obtenerColorEstado(pedido.estado)}`}>
                <span className="estado-icono">{obtenerIconoEstado(pedido.estado)}</span>
                <span className="estado-texto">{pedido.estado}</span>
                <button className="btn-opciones-footer" onClick={(e) => e.stopPropagation()}>
                  ⋮
                </button>
              </div>
            </div>
          ))
        )}
      </div>

          {/* Botón flotante para crear pedido */}
          <button className="btn-fab" onClick={handleCrearPedido}>
            +
          </button>
        </>
      )}

      {/* Vista de Menú */}
      {vistaActiva === 'menu' && (
        <div className="menu-view">
          <div className="menu-header">
            <h2>Menú del Restaurante</h2>
            <p>Productos disponibles</p>
          </div>
          
          <div className="productos-lista-view">
            {productos.length === 0 ? (
              <div className="no-productos">
                <p>No hay productos disponibles</p>
              </div>
            ) : (
              productos
                .filter(p => p.disponible !== false)
                .map((producto) => (
                  <div key={producto._id} className="producto-item-view">
                    {producto.foto && (
                      <img src={producto.foto} alt={producto.nombre} className="producto-imagen-small" />
                    )}
                    <div className="producto-info-view">
                      <h4>{producto.nombre}</h4>
                      <p className="producto-descripcion-small">{producto.descripcion}</p>
                      <div className="producto-meta">
                        <span className="producto-categoria">{producto.categoria}</span>
                        <span className="producto-stock">Stock: {producto.stock}</span>
                      </div>
                    </div>
                    <div className="producto-precio-view">
                      R$ {producto.precio.toFixed(2)}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Vista de Cuenta */}
      {vistaActiva === 'cuenta' && (
        <div className="cuenta-view">
          <div className="cuenta-header">
            <h2>Estado de Cuenta</h2>
            <p>Resumen de pedidos activos</p>
          </div>

          <div className="cuenta-resumen">
            <div className="resumen-card">
              <div className="resumen-icon">📋</div>
              <div className="resumen-info">
                <span className="resumen-label">Total Pedidos</span>
                <span className="resumen-valor">{pedidos.length}</span>
              </div>
            </div>

            <div className="resumen-card">
              <div className="resumen-icon">🍽️</div>
              <div className="resumen-info">
                <span className="resumen-label">Productos</span>
                <span className="resumen-valor">{calcularCantidadProductos()}</span>
              </div>
            </div>

            <div className="resumen-card total">
              <div className="resumen-icon">💰</div>
              <div className="resumen-info">
                <span className="resumen-label">Total General</span>
                <span className="resumen-valor">R$ {calcularTotalPedidos().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="cuenta-detalle">
            <h3>Detalle por Pedido</h3>
            {pedidos.length === 0 ? (
              <div className="no-pedidos-cuenta">
                <p>No hay pedidos activos</p>
              </div>
            ) : (
              pedidos.map((pedido) => (
                <div key={pedido._id} className="cuenta-pedido-item">
                  <div className="cuenta-pedido-header">
                    <span className="cuenta-mesa">
                      {pedido.numeroMesa ? `Mesa ${pedido.numeroMesa}` : 'Sin mesa'}
                    </span>
                    <span className={`cuenta-estado ${obtenerColorEstado(pedido.estado)}`}>
                      {obtenerIconoEstado(pedido.estado)} {pedido.estado}
                    </span>
                  </div>
                  <div className="cuenta-pedido-productos">
                    {pedido.productos.map((item, idx) => (
                      <div key={idx} className="cuenta-producto-linea">
                        <span>{item.cantidad}x {item.nombre}</span>
                        <span>R$ {(item.cantidad * item.precioUnitario).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="cuenta-pedido-total">
                    <span>Total:</span>
                    <span className="cuenta-total-valor">R$ {pedido.total?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal de detalle de pedido */}
      {pedidoSeleccionado && (
        <PedidoDetalle
          pedido={pedidoSeleccionado}
          onClose={handleCerrarDetalle}
        />
      )}

      {/* Modal de crear pedido */}
      {mostrarCrearPedido && (
        <CrearPedidoModal
          mesas={mesas}
          onClose={handleCerrarCrearPedido}
        />
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="error-toast">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}
    </div>
  );
};

export default Mozo;
