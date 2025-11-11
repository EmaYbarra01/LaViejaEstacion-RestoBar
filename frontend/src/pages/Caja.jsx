import { useState, useEffect } from 'react';
import './Caja.css';

/**
 * Componente de Vista de Caja
 * Implementa HU8: Visualización y cobro de pedidos terminados
 */
const Caja = () => {
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [montoPagado, setMontoPagado] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ticket, setTicket] = useState(null);

  // Obtener pedidos pendientes de cobro al cargar
  useEffect(() => {
    cargarPedidosPendientes();
  }, []);

  const cargarPedidosPendientes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); // O desde tu store de auth
      
      const response = await fetch('http://localhost:3000/api/pedidos/caja/pendientes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar pedidos');
      }

      const data = await response.json();
      setPedidosPendientes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const seleccionarPedido = (pedido) => {
    setPedidoSeleccionado(pedido);
    // Calcular total con descuento si es efectivo
    const totalConDescuento = metodoPago === 'Efectivo' 
      ? pedido.subtotal * 0.9 
      : pedido.subtotal;
    setMontoPagado(totalConDescuento.toString());
    setTicket(null);
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

  const calcularCambio = () => {
    const montoPagadoNum = parseFloat(montoPagado) || 0;
    const total = calcularTotal();
    return montoPagadoNum - total;
  };

  const handleCobrar = async (e) => {
    e.preventDefault();
    
    if (!pedidoSeleccionado) {
      setError('Selecciona un pedido para cobrar');
      return;
    }

    const montoPagadoNum = parseFloat(montoPagado);
    const total = calcularTotal();

    if (montoPagadoNum < total) {
      setError(`El monto pagado es insuficiente. Total a pagar: $${total.toFixed(2)}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3000/api/pedidos/${pedidoSeleccionado._id}/cobrar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metodoPago,
          montoPagado: montoPagadoNum
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al cobrar pedido');
      }

      // Mostrar ticket
      setTicket(data.ticket);
      
      // Recargar lista de pedidos pendientes
      await cargarPedidosPendientes();
      
      // Limpiar selección
      setPedidoSeleccionado(null);
      setMontoPagado('');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const imprimirTicket = () => {
    window.print();
  };

  return (
    <div className="caja-container">
      <h1>💰 Caja - Cobro de Pedidos</h1>

      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}

      <div className="caja-layout">
        {/* Lista de pedidos pendientes */}
        <div className="pedidos-pendientes">
          <h2>📋 Pedidos Pendientes de Cobro</h2>
          
          {loading && <p>Cargando...</p>}
          
          {pedidosPendientes.length === 0 && !loading && (
            <p className="empty-message">✅ No hay pedidos pendientes de cobro</p>
          )}

          <div className="pedidos-lista">
            {pedidosPendientes.map((pedido) => (
              <div
                key={pedido._id}
                className={`pedido-card ${pedidoSeleccionado?._id === pedido._id ? 'selected' : ''}`}
                onClick={() => seleccionarPedido(pedido)}
              >
                <div className="pedido-header">
                  <span className="pedido-numero">Pedido #{pedido.numeroPedido}</span>
                  <span className={`estado-badge ${pedido.estado.toLowerCase().replace(' ', '-')}`}>
                    {pedido.estado}
                  </span>
                </div>
                
                <div className="pedido-info">
                  <p>🪑 <strong>Mesa:</strong> {pedido.mesa.numero}</p>
                  <p>👤 <strong>Mozo:</strong> {pedido.mozo.nombre} {pedido.mozo.apellido}</p>
                  <p>📦 <strong>Items:</strong> {pedido.productos.length}</p>
                  <p className="pedido-total">💵 <strong>Total:</strong> ${pedido.subtotal.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel de cobro */}
        <div className="panel-cobro">
          {!pedidoSeleccionado ? (
            <div className="empty-selection">
              <p>👈 Selecciona un pedido de la lista para cobrar</p>
            </div>
          ) : (
            <div>
              <h2>🧾 Detalle del Pedido #{pedidoSeleccionado.numeroPedido}</h2>
              
              <div className="pedido-detalle">
                <div className="info-row">
                  <strong>Mesa:</strong> {pedidoSeleccionado.mesa.numero}
                </div>
                <div className="info-row">
                  <strong>Mozo:</strong> {pedidoSeleccionado.mozo.nombre} {pedidoSeleccionado.mozo.apellido}
                </div>
                
                <h3>Productos:</h3>
                <table className="productos-tabla">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cant.</th>
                      <th>P. Unit.</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidoSeleccionado.productos.map((item, index) => (
                      <tr key={index}>
                        <td>{item.nombre || item.producto.nombre}</td>
                        <td>{item.cantidad}</td>
                        <td>${item.precioUnitario.toFixed(2)}</td>
                        <td>${item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="totales">
                  <div className="total-row">
                    <strong>Subtotal:</strong>
                    <span>${pedidoSeleccionado.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {metodoPago === 'Efectivo' && (
                    <div className="total-row descuento">
                      <strong>Descuento (10%):</strong>
                      <span>-${(pedidoSeleccionado.subtotal * 0.1).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="total-row total-final">
                    <strong>Total a Pagar:</strong>
                    <span>${calcularTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCobrar} className="form-cobro">
                <h3>Método de Pago</h3>
                
                <div className="metodo-pago-opciones">
                  <label className={`metodo-option ${metodoPago === 'Efectivo' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      value="Efectivo"
                      checked={metodoPago === 'Efectivo'}
                      onChange={(e) => {
                        setMetodoPago(e.target.value);
                        // Recalcular monto sugerido
                        const totalConDescuento = pedidoSeleccionado.subtotal * 0.9;
                        setMontoPagado(totalConDescuento.toString());
                      }}
                    />
                    💵 Efectivo
                    <span className="badge-descuento">-10%</span>
                  </label>

                  <label className={`metodo-option ${metodoPago === 'Transferencia' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      value="Transferencia"
                      checked={metodoPago === 'Transferencia'}
                      onChange={(e) => {
                        setMetodoPago(e.target.value);
                        setMontoPagado(pedidoSeleccionado.subtotal.toString());
                      }}
                    />
                    💳 Transferencia
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="montoPagado">Monto Pagado</label>
                  <input
                    type="number"
                    id="montoPagado"
                    value={montoPagado}
                    onChange={(e) => setMontoPagado(e.target.value)}
                    min={calcularTotal()}
                    step="0.01"
                    required
                    className="input-monto"
                  />
                </div>

                {metodoPago === 'Efectivo' && calcularCambio() >= 0 && (
                  <div className="cambio-info">
                    <strong>Cambio a devolver:</strong>
                    <span className="cambio-monto">${calcularCambio().toFixed(2)}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-cobrar"
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : '✅ Cobrar Pedido'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Modal de ticket */}
      {ticket && (
        <div className="modal-ticket" onClick={() => setTicket(null)}>
          <div className="ticket-content" onClick={(e) => e.stopPropagation()}>
            <div className="ticket">
              <h2>🧾 TICKET DE COMPRA</h2>
              <div className="ticket-header">
                <p><strong>La Vieja Estación - RestoBar</strong></p>
                <p>Pedido #{ticket.numeroPedido}</p>
                <p>{new Date(ticket.fecha).toLocaleString('es-AR')}</p>
              </div>

              <div className="ticket-body">
                <p>Mesa: {ticket.mesa}</p>
                <p>Mozo: {ticket.mozo}</p>
                <p>Cajero: {ticket.cajero}</p>
                
                <hr />
                
                <table className="ticket-productos">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cant</th>
                      <th>Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticket.productos.map((p, i) => (
                      <tr key={i}>
                        <td>{p.nombre}</td>
                        <td>{p.cantidad}</td>
                        <td>${p.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <hr />
                
                <div className="ticket-totales">
                  <p>Subtotal: ${ticket.subtotal.toFixed(2)}</p>
                  {ticket.descuento.monto > 0 && (
                    <p className="descuento-line">
                      Descuento ({ticket.descuento.porcentaje}%): -${ticket.descuento.monto.toFixed(2)}
                    </p>
                  )}
                  <p className="total-line"><strong>TOTAL: ${ticket.total.toFixed(2)}</strong></p>
                  <p>Pagado ({ticket.metodoPago}): ${ticket.montoPagado.toFixed(2)}</p>
                  {ticket.cambio > 0 && (
                    <p>Cambio: ${ticket.cambio.toFixed(2)}</p>
                  )}
                </div>
              </div>

              <div className="ticket-footer">
                <p>¡Gracias por su compra!</p>
                <p>Vuelva pronto</p>
              </div>
            </div>

            <div className="ticket-actions">
              <button onClick={imprimirTicket} className="btn-imprimir">
                🖨️ Imprimir
              </button>
              <button onClick={() => setTicket(null)} className="btn-cerrar">
                ✖️ Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Caja;
