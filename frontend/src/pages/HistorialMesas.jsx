import { useEffect, useState } from 'react';
import axios from 'axios';
import './Caja.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const HistorialMesas = () => {
  const [historialPedidos, setHistorialPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/pedidos`, {
          headers: { Authorization: ['Bearer', token].join(' ') }
        });
        const historial = (response.data || [])
          .filter((pedido) => ['Pendiente', 'Entregado', 'Cobrado'].includes(pedido.estado))
          .sort((a, b) => {
            const fechaA = new Date(a.fechaCobrado || a.fechaActualizacion || a.fechaCreacion);
            const fechaB = new Date(b.fechaCobrado || b.fechaActualizacion || b.fechaCreacion);
            return fechaB - fechaA;
          })
          .slice(0, 15);
        setHistorialPedidos(historial);
      } catch (error) {
        console.error('Error al cargar historial de mesas:', error);
        setHistorialPedidos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarHistorial();
  }, []);

  const obtenerEstadoVisible = (estado) => estado === 'Cobrado' ? 'Pagada' : estado;

  return (
    <div className="caja-container">
      <div className="historial-caja">
        <div className="historial-caja-header">
          <h2>Historial de Mesas</h2>
          <p>Estado actual por pedido: Pendiente, Entregado o Pagada</p>
        </div>

        {loading ? (
          <div className="historial-empty">Cargando historial...</div>
        ) : historialPedidos.length === 0 ? (
          <div className="historial-empty">No hay movimientos para mostrar todavía.</div>
        ) : (
          <div className="historial-lista">
            {historialPedidos.map((pedido) => (
              <div key={pedido._id} className="historial-item">
                <div className="historial-item-main">
                  <strong>{pedido.numeroPedido}</strong>
                  <span>{pedido.tipoPedido === 'Domicilio' ? 'Domicilio' : 'Mesa ' + (pedido.numeroMesa || 'N/A')}</span>
                </div>
                <div className="historial-item-side">
                  <span className={'badge badge-' + pedido.estado.toLowerCase().replace(' ', '-')}>
                    {obtenerEstadoVisible(pedido.estado)}
                  </span>
                  <small>
                    {new Date(pedido.fechaCobrado || pedido.fechaActualizacion || pedido.fechaCreacion).toLocaleString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialMesas;
