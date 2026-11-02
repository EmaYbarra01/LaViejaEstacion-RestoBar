import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './Mozo.css';
import PedidoDetalle from '../components/mozo/PedidoDetalle';
import CrearPedidoModal from '../components/mozo/CrearPedidoModal';
import SocketNotification from '../components/SocketNotification';
import useUserStore from '../store/useUserStore';
import useSocket from '../hooks/useSocket';
import { formatCurrency } from '../utils/currencyFormatter';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const Mozo = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useUserStore();
  const { on, off } = useSocket('mozos', user?.role || 'Mozo', 'mozo');
  const isGerente = user?.role === 'Gerente' || user?.role === 'SuperAdministrador';
  const [pedidos, setPedidos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [mostrarCrearPedido, setMostrarCrearPedido] = useState(false);
  const vistaInicial = ['pedidos', 'menu', 'cuenta'].includes(searchParams.get('vista'))
    ? searchParams.get('vista')
    : 'pedidos';
  const [vistaActiva, setVistaActiva] = useState(vistaInicial);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const vista = ['pedidos', 'menu', 'cuenta'].includes(searchParams.get('vista'))
      ? searchParams.get('vista')
      : 'pedidos';
    setVistaActiva(vista);
  }, [searchParams]);

  const cambiarVista = (vista) => {
    setVistaActiva(vista);
    setSearchParams({ vista });
  };

  // Obtener pedidos abiertos
  useEffect(() => {
    cargarPedidosAbiertos();
    cargarMesas();
    cargarProductos();
    
    // Actualizar cada 30 segundos como respaldo
    const interval = setInterval(() => {
      cargarPedidosAbiertos();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Escuchar eventos de Socket.io para actualizaciones en tiempo real
  useEffect(() => {
    // Actualización de mesas
    const handleMesaActualizada = (data) => {
      console.log('🔄 Mesa actualizada:', data);
      setMesas(prevMesas => 
        prevMesas.map(mesa => 
          mesa._id === data.mesaId 
            ? { ...mesa, estado: data.estado }
            : mesa
        )
      );
      setNotification({
        message: `Mesa ${data.numeroMesa} ahora está ${data.estado}`,
        type: 'info'
      });
      setTimeout(() => setNotification(null), 3000);
    };

    // Actualización de productos (stock)
    const handleProductosActualizados = (data) => {
      console.log('🔄 Productos actualizados:', data);
      setProductos(prevProductos => {
        const productosMap = new Map(prevProductos.map(p => [p._id, p]));
        data.productos.forEach(productoActualizado => {
          productosMap.set(productoActualizado._id, productoActualizado);
        });
        return Array.from(productosMap.values());
      });
      setNotification({
        message: 'Stock de productos actualizado',
        type: 'success'
      });
      setTimeout(() => setNotification(null), 3000);
    };

    // Nuevo pedido creado
    const handleNuevoPedido = () => {
      console.log('🔄 Nuevo pedido creado, recargando lista...');
      cargarPedidosAbiertos();
      cargarMesas();
      setNotification({
        message: 'Nuevo pedido creado',
        type: 'success'
      });
      setTimeout(() => setNotification(null), 3000);
    };

    // Estado de pedido actualizado
    const handlePedidoActualizado = (data) => {
      console.log('🔄 Estado de pedido actualizado:', data);
      cargarPedidosAbiertos();
      setNotification({
        message: `Pedido actualizado: ${data.estado}`,
        type: 'info'
      });
      setTimeout(() => setNotification(null), 3000);
    };

    // Suscribirse a eventos
    on('mesa-actualizada', handleMesaActualizada);
    on('productos-actualizados', handleProductosActualizados);
    on('nuevo-pedido-cocina', handleNuevoPedido);
    on('pedido-actualizado', handlePedidoActualizado);

    // Cleanup
    return () => {
      off('mesa-actualizada', handleMesaActualizada);
      off('productos-actualizados', handleProductosActualizados);
      off('nuevo-pedido-cocina', handleNuevoPedido);
      off('pedido-actualizado', handlePedidoActualizado);
    };
  }, [on, off]);

  const cargarPedidosAbiertos = async () => {
    try {
      const token = localStorage.getItem('token');
      // Cargar todos los pedidos activos (excepto Cancelado y Cobrado)
      const response = await axios.get(`${API_URL}/pedidos`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Filtrar solo pedidos activos en el frontend
      const pedidosActivos = response.data.filter(p => 
        !['Cancelado', 'Cobrado'].includes(p.estado)
      );
      
      setPedidos(pedidosActivos);
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
    if (isGerente) {
      return; // No permitir crear pedidos en modo supervisión
    }
    setMostrarCrearPedido(true);
  };

  const handleCerrarCrearPedido = () => {
    setMostrarCrearPedido(false);
    cargarPedidosAbiertos();
    cargarMesas();
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

  const normalizarBusqueda = (valor) => String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  const terminoBusqueda = normalizarBusqueda(busqueda);
  const terminoMesaBusqueda = terminoBusqueda.replace(/^mesa\s+/, '');

  const pedidosFiltrados = pedidos.filter(pedido => {
    // Normalizar filtro: "En Cocina" debe buscar "En Preparación"
    let estadoBuscado = filtroEstado;
    if (filtroEstado === 'En Cocina') {
      estadoBuscado = 'En Preparación';
    }
    
    const cumpleFiltroEstado = filtroEstado === 'todos' || pedido.estado === estadoBuscado;
    const mesaNumero = normalizarBusqueda(pedido.numeroMesa || pedido.mesa?.numero);
    const mozoNombre = normalizarBusqueda([
      pedido.nombreMozo,
      pedido.mozo?.nombre,
      pedido.mozo?.apellido
    ].filter(Boolean).join(' '));
    const clienteNombre = normalizarBusqueda([
      pedido.cliente?.nombre,
      pedido.cliente?.apellido,
      pedido.cliente?.nombreCompleto,
      pedido.cliente?.email,
      pedido.cliente?.telefono
    ].filter(Boolean).join(' '));
    const productosNombres = (pedido.productos || [])
      .map((producto) => producto.nombre)
      .filter(Boolean)
      .join(' ');
    const valoresBuscables = [
      pedido.numeroPedido, pedido._id, pedido.tipoPedido, pedido.tipoServicio,
      pedido.estado, mozoNombre, clienteNombre, productosNombres
    ].map(normalizarBusqueda);
    const cumpleBusqueda = !terminoBusqueda
      || mesaNumero === terminoBusqueda
      || mesaNumero === terminoMesaBusqueda
      || valoresBuscables.some((valor) => valor.includes(terminoBusqueda));
    
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

  const normalizarCategoria = (categoria = '') => {
    const texto = categoria.toString().trim().toLowerCase();

    if (texto.includes('beb')) return 'Bebidas';
    if (texto.includes('post') || texto.includes('helad') || texto.includes('dulc')) return 'Postres';
    if (texto.includes('entrada') || texto.includes('picada') || texto.includes('snack')) return 'Entradas';
    if (texto.includes('comida') || texto.includes('plato') || texto.includes('hamburg') || texto.includes('pizza') || texto.includes('empanad') || texto.includes('sandwich') || texto.includes('sándwich')) return 'Comidas';

    return categoria || 'Otros';
  };

  const menuAgrupado = productos
    .filter((producto) => producto.disponible !== false)
    .reduce((grupos, producto) => {
      const categoria = normalizarCategoria(producto.categoria);

      if (!grupos[categoria]) {
        grupos[categoria] = [];
      }

      grupos[categoria].push(producto);
      return grupos;
    }, {});

  const ordenMenu = ['Comidas', 'Bebidas', 'Postres', 'Entradas', 'Otros'];

  return (
    <div className="mozo-container">
      {/* Header */}
      <div className="mozo-header">
        <div className="header-left">
          <div>
            <h1 className="mozo-title">Módulo Mozo</h1>
            <p className="mozo-subtitle">Gestión de pedidos, mesas y cuentas</p>
          </div>
        </div>
      </div>

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
          MODO SUPERVISIÓN - Solo Lectura (No se pueden crear/editar pedidos)
        </div>
      )}

      {/* Navegación por pestañas */}
      <div className="mozo-tabs">
        <button 
          className={`tab-button ${vistaActiva === 'pedidos' ? 'active' : ''}`}
          onClick={() => cambiarVista('pedidos')}
        >
          <span>Pedidos</span>
        </button>
        <button 
          className={`tab-button menu-tab ${vistaActiva === 'menu' ? 'active' : ''}`}
          onClick={() => cambiarVista('menu')}
        >
          <span>Menú</span>
        </button>
        <button 
          className={`tab-button cuenta-tab ${vistaActiva === 'cuenta' ? 'active' : ''}`}
          onClick={() => cambiarVista('cuenta')}
        >
          <span>Cuenta</span>
        </button>
      </div>

      {/* Búsqueda disponible desde cualquier pestaña */}
      <div className="mozo-toolbar">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por mesa, pedido, mozo o producto..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              if (vistaActiva !== 'pedidos') {
                cambiarVista('pedidos');
              }
            }}
          />
          {busqueda && (
            <button
              type="button"
              className="btn-limpiar-busqueda"
              aria-label="Limpiar búsqueda"
              onClick={() => setBusqueda('')}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Vista de Pedidos */}
      {vistaActiva === 'pedidos' && (
        <>

      {/* Filtros de estado */}
      <div className="filtros-container">
        <button
          className={`filtro-chip ${filtroEstado === 'En Cocina' ? 'active' : ''}`}
          onClick={() => setFiltroEstado('En Cocina')}
        >
          En Cocina ({pedidos.filter(p => p.estado === 'En Preparación').length})
        </button>
        <button
          className={`filtro-chip ${filtroEstado === 'Pendiente' ? 'active' : ''}`}
          onClick={() => setFiltroEstado('Pendiente')}
        >
          Pendientes ({pedidos.filter(p => p.estado === 'Pendiente').length})
        </button>
        <button
          className={`filtro-chip ${filtroEstado === 'Listo' ? 'active' : ''}`}
          onClick={() => setFiltroEstado('Listo')}
        >
          Listos ({pedidos.filter(p => p.estado === 'Listo').length})
        </button>
        <button
          className={`filtro-chip ${filtroEstado === 'todos' ? 'active' : ''}`}
          onClick={() => setFiltroEstado('todos')}
        >
          Todos ({pedidos.length})
        </button>
      </div>

      {/* Grid de pedidos */}
      <div className="pedidos-grid">
        {pedidosFiltrados.length === 0 ? (
          <div className="no-pedidos">
            <p>No hay pedidos {filtroEstado !== 'todos' ? `en estado "${filtroEstado}"` : 'disponibles'}</p>
            {!isGerente && (
              <button className="btn-crear-pedido" onClick={handleCrearPedido}>
                + Crear Nuevo Pedido
              </button>
            )}
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
                    <span>Delivery</span>
                  ) : pedido.tipoServicio === 'Retirada' ? (
                    <span>Retirada</span>
                  ) : (
                    <span>Local</span>
                  )}
                </div>
              </div>

              {/* Contenido principal */}
              <div className="card-content">
                <h3 className="card-title">
                  {pedido.tipoPedido === 'Domicilio' ? 'Domicilio' : pedido.numeroMesa ? `Mesa ${pedido.numeroMesa}` : pedido.nombreMozo || 'Pedido sin asignar'}
                </h3>
                
                <div className="card-precio">
                  ${formatCurrency(pedido.total)}
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
                <span className="estado-texto">{pedido.estado}</span>
              </div>
            </div>
          ))
        )}
      </div>

          {/* Botón flotante para crear pedido */}
          {!isGerente && (
            <button className="btn-fab" onClick={handleCrearPedido}>
              +
            </button>
          )}
        </>
      )}

      {/* Vista de Menú */}
      {vistaActiva === 'menu' && (
        <div className="menu-view">
          <div className="menu-hero">
            <div>
              <span className="menu-kicker">Selección para mozo</span>
              <h2>Menú del Restaurante</h2>
              <p>Explorá el catálogo por secciones para cargar pedidos más rápido.</p>
            </div>
            <div className="menu-hero-badge">
              {productos.filter((producto) => producto.disponible !== false).length} productos activos
            </div>
          </div>
          
          <div className="menu-sections">
            {productos.filter((producto) => producto.disponible !== false).length === 0 ? (
              <div className="no-productos">
                <p>No hay productos disponibles</p>
              </div>
            ) : (
              ordenMenu
                .filter((categoria) => (menuAgrupado[categoria] || []).length > 0)
                .map((categoria) => (
                  <section key={categoria} className="menu-section">
                    <div className="menu-section-header">
                      <h3>{categoria}</h3>
                      <span>{menuAgrupado[categoria].length} items</span>
                    </div>

                    <div className="productos-lista-view">
                      {menuAgrupado[categoria].map((producto) => (
                        <div key={producto._id} className="producto-item-view">
                          {producto.foto && (
                            <img src={producto.foto} alt={producto.nombre} className="producto-imagen-small" />
                          )}
                          <div className="producto-info-view">
                            <h4>{producto.nombre}</h4>
                            <p className="producto-descripcion-small">{producto.descripcion}</p>
                            <div className="producto-meta">
                              <span className="producto-categoria">{normalizarCategoria(producto.categoria)}</span>
                              <span className="producto-stock">Stock: {producto.stock}</span>
                            </div>
                          </div>
                          <div className="producto-precio-view">
                             ${formatCurrency(producto.precio)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
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
              <div className="resumen-info">
                <span className="resumen-label">Total Pedidos</span>
                <span className="resumen-valor cuenta-card-numero">{pedidos.length}</span>
              </div>
            </div>

            <div className="resumen-card">
              <div className="resumen-info">
                <span className="resumen-label">Productos</span>
                <span className="resumen-valor cuenta-card-productos">{calcularCantidadProductos()}</span>
              </div>
            </div>

            <div className="resumen-card total">
              <div className="resumen-info">
                <span className="resumen-label">Total General</span>
                <span className="resumen-valor cuenta-card-total">${formatCurrency(calcularTotalPedidos())}</span>
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
                      {pedido.estado}
                    </span>
                  </div>
                  <div className="cuenta-pedido-productos">
                    {pedido.productos.map((item, idx) => (
                      <div key={idx} className="cuenta-producto-linea">
                        <span>{item.cantidad}x {item.nombre}</span>
                        <span>${formatCurrency(item.cantidad * item.precioUnitario)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="cuenta-pedido-total">
                    <span>Total:</span>
                    <span className="cuenta-total-valor">${formatCurrency(pedido.total) || '0,00'}</span>
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
          productos={productos}
          onClose={handleCerrarDetalle}
          isReadOnly={isGerente}
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

      {/* Notificación de Socket.io */}
      {notification && (
        <SocketNotification
          message={notification.message}
          type={notification.type}
        />
      )}
    </div>
  );
};

export default Mozo;
