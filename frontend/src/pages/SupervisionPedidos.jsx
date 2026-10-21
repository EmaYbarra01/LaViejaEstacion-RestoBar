import { useEffect, useState } from 'react';
import axios from 'axios';
import useUserStore from '../store/useUserStore';
import PedidoDetalleLectura from '../components/mozo/PedidoDetalleLectura';
import './SupervisionPedidos.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const SupervisionPedidos = () => {
  const { user } = useUserStore();
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/pedidos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos((response.data || []).filter((pedido) => !['Cancelado', 'Cobrado'].includes(pedido.estado)));
      setError('');
    } catch (requestError) {
      console.error('Error al cargar pedidos de supervisión:', requestError);
      setError('No se pudieron cargar los pedidos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
    const interval = setInterval(cargarPedidos, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="supervision-pedidos">
      <header className="supervision-header">
        <div>
          <h1>Supervisión de pedidos</h1>
          <p>Vista de consulta para {user?.role === 'Gerente' ? 'Gerente' : 'SuperAdministrador'}</p>
        </div>
        <button className="supervision-refresh" onClick={cargarPedidos} disabled={loading}>
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </header>

      {error && <div className="supervision-error">{error}</div>}
      {loading && pedidos.length === 0 && <div className="supervision-empty">Cargando pedidos...</div>}
      {!loading && !error && pedidos.length === 0 && (
        <div className="supervision-empty">No hay pedidos activos para mostrar.</div>
      )}

      <div className="supervision-grid">
        {pedidos.map((pedido) => (
          <button
            key={pedido._id}
            className="supervision-pedido"
            onClick={() => setPedidoSeleccionado(pedido)}
          >
            <span className="supervision-pedido-mesa">Mesa {pedido.numeroMesa || 'S/N'}</span>
            <span className="supervision-pedido-numero">{pedido.numeroPedido || 'Pedido'}</span>
            <span className="supervision-pedido-total">${Number(pedido.total || 0).toLocaleString('es-AR')}</span>
            <span className="supervision-pedido-estado">{pedido.estado}</span>
          </button>
        ))}
      </div>

      {pedidoSeleccionado && (
        <PedidoDetalleLectura
          pedido={pedidoSeleccionado}
          onClose={() => setPedidoSeleccionado(null)}
        />
      )}
    </div>
  );
};

export default SupervisionPedidos;
