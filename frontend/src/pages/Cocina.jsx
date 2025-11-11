import { useState, useEffect } from 'react';
import './Cocina.css';

/**
 * Componente de Vista de Cocina
 * Implementa HU5, HU6, HU7: Gestión de pedidos en cocina y envío a caja
 */
const Cocina = () => {
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarPedidosCocina();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarPedidosCocina, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarPedidosCocina = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3000/api/pedidos/cocina/pendientes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar pedidos');
      }

      const data = await response.json();
      setPedidosPendientes(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3000/api/pedidos/${pedidoId}/estado`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estado: nuevoEstado,
          observacion: `Cambio a ${nuevoEstado}`
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.mensaje || 'Error al cambiar estado');
      }

      await cargarPedidosCocina();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoListo = async (pedidoId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3000/api/pedidos/${pedidoId}/marcar-listo`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          observacion: 'Pedido terminado y listo para servir'
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.mensaje || 'Error al marcar como listo');
      }

      // Mostrar notificación de éxito
      alert('✅ Pedido marcado como listo y enviado a caja');
      
      await cargarPedidosCocina();
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTiempoTranscurrido = (fechaCreacion) => {
    const ahora = new Date();
    const fecha = new Date(fechaCreacion);
    const diffMinutos = Math.floor((ahora - fecha) / 60000);
    
    if (diffMinutos < 60) {
      return `${diffMinutos} min`;
    } else {
      const horas = Math.floor(diffMinutos / 60);
      const mins = diffMinutos % 60;
      return `${horas}h ${mins}min`;
    }
  };

  const getColorTiempo = (fechaCreacion) => {
    const ahora = new Date();
    const fecha = new Date(fechaCreacion);
    const diffMinutos = Math.floor((ahora - fecha) / 60000);
    
    if (diffMinutos < 15) return 'normal';
    if (diffMinutos < 30) return 'warning';
    return 'urgent';
  };

  return (
    <div className="cocina-container">
      <div className="cocina-header">
        <h1>🍳 Cocina - Gestión de Pedidos</h1>
        <button onClick={cargarPedidosCocina} className="btn-actualizar">
          🔄 Actualizar
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}

      {pedidosPendientes.length === 0 && !loading && (
        <div className="empty-message">
          <p>✅ No hay pedidos pendientes en cocina</p>
        </div>
      )}

      <div className="pedidos-grid">
        {pedidosPendientes.map((pedido) => (
          <div 
            key={pedido._id} 
            className={`pedido-card-cocina ${getColorTiempo(pedido.fechaCreacion)}`}
          >
            <div className="pedido-card-header">
              <div className="pedido-numero-grande">#{pedido.numeroPedido}</div>
              <div className="pedido-tiempo">
                ⏱️ {getTiempoTranscurrido(pedido.fechaCreacion)}
              </div>
            </div>

            <div className="pedido-mesa-info">
              <span className="mesa-badge">Mesa {pedido.mesa.numero}</span>
              <span className={`estado-badge-cocina ${pedido.estado.toLowerCase().replace(' ', '-')}`}>
                {pedido.estado}
              </span>
            </div>

            <div className="pedido-mozo">
              👤 {pedido.mozo.nombre} {pedido.mozo.apellido}
            </div>

            <div className="productos-lista-cocina">
              {pedido.productos.map((item, index) => (
                <div key={index} className="producto-item-cocina">
                  <span className="cantidad-badge">{item.cantidad}x</span>
                  <span className="producto-nombre">{item.nombre || item.producto.nombre}</span>
                  {item.observaciones && (
                    <div className="producto-observacion">
                      💬 {item.observaciones}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {pedido.observacionesGenerales && (
              <div className="observaciones-generales">
                📝 <strong>Observaciones:</strong> {pedido.observacionesGenerales}
              </div>
            )}

            <div className="pedido-acciones">
              {pedido.estado === 'Pendiente' && (
                <button
                  onClick={() => cambiarEstado(pedido._id, 'En preparación')}
                  className="btn-accion btn-preparar"
                  disabled={loading}
                >
                  ▶️ Comenzar
                </button>
              )}

              {pedido.estado === 'En preparación' && (
                <button
                  onClick={() => marcarComoListo(pedido._id)}
                  className="btn-accion btn-listo"
                  disabled={loading}
                >
                  ✅ Marcar Listo (Enviar a Caja)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cocina;
