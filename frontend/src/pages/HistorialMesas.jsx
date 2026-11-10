import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './Caja.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const HistorialMesas = () => {
  const [historialPedidos, setHistorialPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

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
          });
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

  const pedidosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return historialPedidos.filter((pedido) => {
      const fechaPedido = new Date(pedido.fechaCobrado || pedido.fechaActualizacion || pedido.fechaCreacion);
      const fechaPedidoTexto = fechaPedido.toISOString().slice(0, 10);

      if (fechaDesde && fechaPedidoTexto < fechaDesde) return false;
      if (fechaHasta && fechaPedidoTexto > fechaHasta) return false;

      if (!texto) return true;

      const numeroMesa = pedido.numeroMesa !== undefined && pedido.numeroMesa !== null ? String(pedido.numeroMesa) : '';
      const numeroPedido = String(pedido.numeroPedido || '');
      const tipoPedido = String(pedido.tipoPedido || '');
      const productos = (pedido.productos || [])
        .map((item) => String(item.nombre || item.producto || ''))
        .join(' ');
      const textoBusqueda = [
        numeroMesa,
        `mesa ${numeroMesa}`,
        numeroPedido,
        `pedido ${numeroPedido}`,
        tipoPedido,
        `tipo ${tipoPedido}`,
        productos,
        fechaPedidoTexto,
        'mesa',
        'pedido',
      ].join(' ').toLowerCase();

      return textoBusqueda.includes(texto);
    });
  }, [busqueda, fechaDesde, fechaHasta, historialPedidos]);

  const pedidosAgrupados = useMemo(() => {
    return pedidosFiltrados.reduce((grupos, pedido) => {
      const fecha = new Date(pedido.fechaCobrado || pedido.fechaActualizacion || pedido.fechaCreacion);
      const key = fecha.toISOString().slice(0, 10);
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(pedido);
      return grupos;
    }, {});
  }, [pedidosFiltrados]);

  const formatearFechaGrupo = (key) => {
    const fecha = new Date(`${key}T12:00:00`);
    return fecha.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="caja-container">
      <div className="historial-caja">
        <div className="historial-caja-header">
          <h2>Historial de Mesas</h2>
          <p>Estado actual por pedido: Pendiente, Entregado o Pagada</p>
        </div>

        <div className="historial-busqueda">
          <div className="historial-fecha-range">
            <label>
              <span>Desde</span>
              <input
                type="date"
                className="historial-busqueda-input"
                value={fechaDesde}
                onClick={(event) => event.target.showPicker?.()}
                onFocus={(event) => event.target.showPicker?.()}
                onChange={(event) => setFechaDesde(event.target.value)}
                aria-label="Fecha desde"
              />
            </label>
            <label>
              <span>Hasta</span>
              <input
                type="date"
                className="historial-busqueda-input"
                value={fechaHasta}
                onClick={(event) => event.target.showPicker?.()}
                onFocus={(event) => event.target.showPicker?.()}
                onChange={(event) => setFechaHasta(event.target.value)}
                aria-label="Fecha hasta"
              />
            </label>
          </div>

          <input
            type="text"
            className="historial-busqueda-input historial-busqueda-texto"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por mesa, número o nombre de pedido"
            aria-label="Buscar en historial de mesas"
          />

          {(fechaDesde || fechaHasta) && (
            <button
              type="button"
              className="historial-limpiar-filtro"
              onClick={() => {
                setFechaDesde('');
                setFechaHasta('');
              }}
            >
              Limpiar rango
            </button>
          )}
        </div>

        {loading ? (
          <div className="historial-empty">Cargando historial...</div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="historial-empty">No hay movimientos para mostrar todavía.</div>
        ) : (
          <div className="historial-lista">
            {Object.entries(pedidosAgrupados).map(([key, pedidosDelDia]) => (
              <div key={key} className="historial-dia-group">
                <div className="historial-dia-header">
                  <span>{formatearFechaGrupo(key)}</span>
                </div>

                <div className="historial-dia-items">
                  {pedidosDelDia.map((pedido) => (
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialMesas;
