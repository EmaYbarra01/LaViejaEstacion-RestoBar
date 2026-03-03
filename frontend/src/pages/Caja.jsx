import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import useSocket from '../hooks/useSocket';
import SocketNotification from '../components/SocketNotification';
import CierreCajaModal from '../components/caja/CierreCajaModal';
import './Caja.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Módulo de Caja
 * Implementa HU7 y HU8: Gestión de cobros de pedidos terminados
 */
const Caja = () => {
  const navigate = useNavigate();
  const { on, off } = useSocket('caja'); // Conectar a sala de caja
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [montoPagado, setMontoPagado] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mostrarTicket, setMostrarTicket] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [notification, setNotification] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarCierreCaja, setMostrarCierreCaja] = useState(false);

  useEffect(() => {
    cargarPedidosPendientes();
  }, []);

  // Escuchar eventos Socket.io para actualizaciones en tiempo real
  useEffect(() => {
    const handlePedidoListo = (data) => {
      console.log('🔔 Nuevo pedido listo para cobrar:', data);
      cargarPedidosPendientes();
      setNotification({
        message: `Pedido #${data.pedido?.numeroPedido || ''} listo para cobrar`,
        type: 'success'
      });
      setTimeout(() => setNotification(null), 4000);
    };

    const handlePedidoActualizado = () => {
      console.log('🔄 Pedido actualizado, recargando lista...');
      cargarPedidosPendientes();
    };

    const handleNuevoPedido = (data) => {
      console.log('🔔 Nuevo pedido creado:', data);
      cargarPedidosPendientes();
      setNotification({
        message: `Nuevo pedido creado: Mesa ${data.pedido?.numeroMesa || 'N/A'}`,
        type: 'info'
      });
      setTimeout(() => setNotification(null), 4000);
    };

    on('pedido-listo', handlePedidoListo);
    on('pedido-actualizado', handlePedidoActualizado);
    on('nuevo-pedido-cocina', handleNuevoPedido);

    return () => {
      off('pedido-listo', handlePedidoListo);
      off('pedido-actualizado', handlePedidoActualizado);
      off('nuevo-pedido-cocina', handleNuevoPedido);
    };
  }, [on, off]);

  const cargarPedidosPendientes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/pedidos/caja/pendientes`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPedidosPendientes(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      setError('Error al cargar pedidos pendientes');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarPedido = (pedido) => {
    setPedidoSeleccionado(pedido);
    setMetodoPago('Efectivo');
    // Calcular total con descuento si es efectivo
    const totalConDescuento = pedido.subtotal * 0.9;
    setMontoPagado(totalConDescuento.toFixed(2));
    setError(null);
  };

  const calcularTotal = () => {
    if (!pedidoSeleccionado) return 0;
    
    // Si es efectivo, aplicar descuento del 10%
    if (metodoPago === 'Efectivo') {
      return pedidoSeleccionado.subtotal * 0.9;
    }
    return pedidoSeleccionado.subtotal;
  };

  const calcularDescuento = () => {
    if (!pedidoSeleccionado || metodoPago !== 'Efectivo') return 0;
    return pedidoSeleccionado.subtotal * 0.1;
  };

  const calcularCambio = () => {
    const montoPagadoNum = parseFloat(montoPagado) || 0;
    const total = calcularTotal();
    const cambio = montoPagadoNum - total;
    return cambio > 0 ? cambio : 0;
  };

  const handleMetodoPagoChange = (metodo) => {
    setMetodoPago(metodo);
    if (pedidoSeleccionado) {
      const total = metodo === 'Efectivo' 
        ? pedidoSeleccionado.subtotal * 0.9 
        : pedidoSeleccionado.subtotal;
      setMontoPagado(total.toFixed(2));
    }
  };

  const handleCobrar = async () => {
    if (!pedidoSeleccionado) {
      setError('Selecciona un pedido para cobrar');
      return;
    }

    const montoPagadoNum = parseFloat(montoPagado);
    const total = calcularTotal();

    if (!montoPagadoNum || montoPagadoNum <= 0) {
      setError('Ingresa un monto válido');
      return;
    }

    if (montoPagadoNum < total) {
      setError(`Monto insuficiente. Total a pagar: $${total.toFixed(2)}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/pedidos/${pedidoSeleccionado._id}/cobrar`,
        {
          metodoPago,
          montoPagado: montoPagadoNum
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Guardar datos del ticket
      setTicketData(response.data.ticket);
      setMostrarTicket(true);

      // Actualizar lista de pedidos
      await cargarPedidosPendientes();
      
      // Limpiar selección
      setPedidoSeleccionado(null);
      setMontoPagado('');

      await Swal.fire({
        title: '¡Cobro Exitoso!',
        text: `Pedido #${response.data.ticket.numeroPedido} cobrado correctamente`,
        icon: 'success',
        confirmButtonText: 'Ver Ticket',
        confirmButtonColor: '#10b981'
      });

    } catch (err) {
      console.error('Error al cobrar:', err);
      const errorMsg = err.response?.data?.mensaje || 'Error al procesar el cobro';
      setError(errorMsg);
      
      Swal.fire({
        title: 'Error',
        text: errorMsg,
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setLoading(false);
    }
  };

  const imprimirTicket = () => {
    window.print();
  };

  const cerrarTicket = () => {
    setMostrarTicket(false);
    setTicketData(null);
  };

  const pedidosFiltrados = pedidosPendientes.filter(pedido => {
    if (busqueda === '') return true;
    
    return (
      pedido.numeroPedido?.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.numeroMesa?.toString().includes(busqueda) ||
      pedido.nombreMozo?.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  if (mostrarTicket && ticketData) {
    return (
      <div className="ticket-container">
        <div className="ticket-wrapper">
          <div className="ticket" id="ticket-print">
            <div className="ticket-header">
              <h1>La Vieja Estación</h1>
              <p>Resto-Bar</p>
              <div className="ticket-divider"></div>
            </div>

            <div className="ticket-info">
              <p><strong>Pedido:</strong> {ticketData.numeroPedido}</p>
              <p><strong>Fecha:</strong> {new Date(ticketData.fecha).toLocaleString('es-AR')}</p>
              <p><strong>Mesa:</strong> {ticketData.mesa}</p>
              <p><strong>Mozo:</strong> {ticketData.mozo}</p>
              <p><strong>Cajero:</strong> {ticketData.cajero}</p>
            </div>

            <div className="ticket-divider"></div>

            <div className="ticket-productos">
              <table>
                <thead>
                  <tr>
                    <th>Cant.</th>
                    <th>Producto</th>
                    <th>P. Unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketData.productos.map((prod, idx) => (
                    <tr key={idx}>
                      <td>{prod.cantidad}</td>
                      <td>
                        {prod.nombre}
                        {prod.observaciones && (
                          <small className="ticket-obs">({prod.observaciones})</small>
                        )}
                      </td>
                      <td>${prod.precioUnitario.toFixed(2)}</td>
                      <td>${prod.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ticket-divider"></div>

            <div className="ticket-totales">
              <div className="ticket-linea">
                <span>Subtotal:</span>
                <span>${ticketData.subtotal.toFixed(2)}</span>
              </div>
              
              {ticketData.descuento.monto > 0 && (
                <div className="ticket-linea descuento">
                  <span>Descuento ({ticketData.descuento.porcentaje}%):</span>
                  <span>-${ticketData.descuento.monto.toFixed(2)}</span>
                </div>
              )}
              
              <div className="ticket-linea total">
                <span><strong>TOTAL:</strong></span>
                <span><strong>${ticketData.total.toFixed(2)}</strong></span>
              </div>

              <div className="ticket-divider"></div>

              <div className="ticket-linea">
                <span>Método de Pago:</span>
                <span>{ticketData.metodoPago}</span>
              </div>
              
              <div className="ticket-linea">
                <span>Pagado:</span>
                <span>${ticketData.montoPagado.toFixed(2)}</span>
              </div>
              
              {ticketData.cambio > 0 && (
                <div className="ticket-linea cambio">
                  <span><strong>Cambio:</strong></span>
                  <span><strong>${ticketData.cambio.toFixed(2)}</strong></span>
                </div>
              )}
            </div>

            <div className="ticket-divider"></div>

            <div className="ticket-footer">
              <p>¡Gracias por su visita!</p>
              <p>Vuelva pronto</p>
            </div>
          </div>

          <div className="ticket-acciones no-print">
            <button className="btn btn-primary" onClick={imprimirTicket}>
              🖨️ Imprimir
            </button>
            <button className="btn btn-secondary" onClick={cerrarTicket}>
              ✕ Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="caja-container">
      {/* Header */}
      <div className="caja-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ←
          </button>
          <h1>Caja - Cobros</h1>
        </div>
        <div className="header-right">
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-label">Pendientes</span>
              <span className="stat-value">{pedidosPendientes.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total</span>
              <span className="stat-value">
                ${pedidosPendientes.reduce((sum, p) => sum + p.subtotal, 0).toFixed(2)}
              </span>
            </div>
          </div>
          <button 
            className="btn-cierre-caja"
            onClick={() => setMostrarCierreCaja(true)}
            title="Realizar cierre de caja"
          >
            💰 Cierre de Caja
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="caja-toolbar">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por pedido, mesa o mozo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button className="btn-search">🔍</button>
        </div>
      </div>

      <div className="caja-content">
        {/* Panel izquierdo: Lista de pedidos */}
        <div className="pedidos-panel">
          <div className="panel-header">
            <h2>Pedidos Pendientes de Cobro</h2>
            <button className="btn-refresh" onClick={cargarPedidosPendientes}>
              🔄
            </button>
          </div>

          {loading && pedidosPendientes.length === 0 ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando pedidos...</p>
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="empty-state">
              <p>📋 No hay pedidos pendientes de cobro</p>
            </div>
          ) : (
            <div className="pedidos-lista">
              {pedidosFiltrados.map((pedido) => (
                <div
                  key={pedido._id}
                  className={`pedido-item ${pedidoSeleccionado?._id === pedido._id ? 'selected' : ''}`}
                  onClick={() => seleccionarPedido(pedido)}
                >
                  <div className="pedido-item-header">
                    <span className="pedido-numero">{pedido.numeroPedido}</span>
                    <span className={`pedido-estado estado-${pedido.estado.toLowerCase().replace(' ', '-')}`}>
                      {pedido.estado}
                    </span>
                  </div>

                  <div className="pedido-item-info">
                    <p><strong>Mesa:</strong> {pedido.numeroMesa}</p>
                    <p><strong>Mozo:</strong> {pedido.nombreMozo}</p>
                    <p><strong>Productos:</strong> {pedido.productos.length} items</p>
                  </div>

                  <div className="pedido-item-footer">
                    <span className="pedido-hora">
                      {new Date(pedido.fechaListo || pedido.fechaCreacion).toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className="pedido-total">${pedido.subtotal.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel derecho: Detalle y cobro */}
        <div className="cobro-panel">
          {!pedidoSeleccionado ? (
            <div className="panel-placeholder">
              <div className="placeholder-icon">💰</div>
              <h3>Selecciona un pedido</h3>
              <p>Haz clic en un pedido de la lista para procesarlo</p>
            </div>
          ) : (
            <>
              <div className="panel-header">
                <h2>Detalle del Pedido</h2>
                <button 
                  className="btn-close" 
                  onClick={() => setPedidoSeleccionado(null)}
                >
                  ✕
                </button>
              </div>

              <div className="pedido-detalle">
                <div className="detalle-info">
                  <div className="info-row">
                    <span>Pedido:</span>
                    <strong>{pedidoSeleccionado.numeroPedido}</strong>
                  </div>
                  <div className="info-row">
                    <span>Mesa:</span>
                    <strong>{pedidoSeleccionado.numeroMesa}</strong>
                  </div>
                  <div className="info-row">
                    <span>Mozo:</span>
                    <strong>{pedidoSeleccionado.nombreMozo}</strong>
                  </div>
                  <div className="info-row">
                    <span>Estado:</span>
                    <span className={`badge badge-${pedidoSeleccionado.estado.toLowerCase()}`}>
                      {pedidoSeleccionado.estado}
                    </span>
                  </div>
                </div>

                <div className="detalle-productos">
                  <h3>Productos</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Cant.</th>
                        <th>Producto</th>
                        <th>P. Unit.</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidoSeleccionado.productos.map((prod, idx) => (
                        <tr key={idx}>
                          <td>{prod.cantidad}</td>
                          <td>
                            {prod.nombre}
                            {prod.observaciones && (
                              <small className="observacion">({prod.observaciones})</small>
                            )}
                          </td>
                          <td>${prod.precioUnitario.toFixed(2)}</td>
                          <td>${prod.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="detalle-totales">
                  <div className="total-linea">
                    <span>Subtotal:</span>
                    <span>${pedidoSeleccionado.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {metodoPago === 'Efectivo' && (
                    <div className="total-linea descuento">
                      <span>Descuento 10% (Efectivo):</span>
                      <span>-${calcularDescuento().toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="total-linea total">
                    <strong>TOTAL A PAGAR:</strong>
                    <strong>${calcularTotal().toFixed(2)}</strong>
                  </div>
                </div>

                <div className="forma-pago">
                  <h3>Forma de Pago</h3>
                  <div className="metodos-pago">
                    <button
                      className={`metodo-btn ${metodoPago === 'Efectivo' ? 'active' : ''}`}
                      onClick={() => handleMetodoPagoChange('Efectivo')}
                    >
                      💵 Efectivo
                      <small>10% descuento</small>
                    </button>
                    <button
                      className={`metodo-btn ${metodoPago === 'Transferencia' ? 'active' : ''}`}
                      onClick={() => handleMetodoPagoChange('Transferencia')}
                    >
                      💳 Transferencia
                    </button>
                  </div>

                  <div className="monto-input-group">
                    <label>Monto Pagado</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="monto-input"
                      value={montoPagado}
                      onChange={(e) => setMontoPagado(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  {parseFloat(montoPagado) > calcularTotal() && (
                    <div className="cambio-info">
                      <span>Cambio:</span>
                      <strong>${calcularCambio().toFixed(2)}</strong>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="error-message">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  className="btn-cobrar"
                  onClick={handleCobrar}
                  disabled={loading || !montoPagado || parseFloat(montoPagado) < calcularTotal()}
                >
                  {loading ? '⏳ Procesando...' : '💰 Cobrar'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notificación Socket.io */}
      {notification && (
        <SocketNotification
          message={notification.message}
          type={notification.type}
        />
      )}

      {/* Modal de Cierre de Caja */}
      <CierreCajaModal
        isOpen={mostrarCierreCaja}
        onClose={() => setMostrarCierreCaja(false)}
        onCierreCreado={(cierre) => {
          console.log('Cierre creado:', cierre);
          cargarPedidosPendientes();
        }}
      />
    </div>
  );
};

export default Caja;
