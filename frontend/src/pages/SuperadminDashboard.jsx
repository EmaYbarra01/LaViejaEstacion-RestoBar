import { useEffect, useState } from 'react';
import axios from 'axios';
import { formatCurrency } from '../utils/currencyFormatter';
import './SuperadminDashboard.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function SuperadminDashboard() {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/dashboard/estadisticas`, {
        withCredentials: true,
        headers: { Authorization: `******'token')}` }
      });
      if (!response.data.success) throw new Error('Respuesta de estadísticas inválida');
      setEstadisticas(response.data.data);
    } catch (requestError) {
      console.error('Error al cargar estadísticas:', requestError);
      setError('Error al cargar las estadísticas del dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  if (loading) return <div className="panel-state">Cargando estadísticas...</div>;
  if (error) {
    return <div className="panel-state panel-error"><p>{error}</p><button type="button" onClick={cargarEstadisticas}>Reintentar</button></div>;
  }
  if (!estadisticas) return <div className="panel-state">No hay datos disponibles.</div>;

  const resumen = estadisticas.resumenMes;
  const pagos = estadisticas.ventasPorMetodoPago || [];
  const categorias = estadisticas.ventasPorCategoria || [];
  const productos = estadisticas.top10Productos || [];

  return (
    <div className="approved-dashboard">
      <div className="approved-dashboard-actions">
        <button type="button" onClick={cargarEstadisticas}>Actualizar</button>
      </div>
      <div className="approved-dashboard-grid">
        <section className="approved-info-card">
          <h3>Ventas del mes</h3>
          <div className="approved-rows"><span>Total mensual</span><strong>${formatCurrency(resumen.totalVentas)}</strong></div>
        </section>
        <section className="approved-info-card">
          <h3>Pedidos del mes</h3>
          <div className="approved-rows"><span>Total pedidos</span><strong>{resumen.cantidadPedidos}</strong></div>
          <div className="approved-rows"><span>Total acumulado</span><strong>${formatCurrency(resumen.totalVentas)}</strong></div>
        </section>
        <section className="approved-info-card">
          <h3>Métodos de pago</h3>
          {pagos.map((pago) => <div className="approved-rows" key={pago.metodoPago}><span>{pago.metodoPago}</span><strong>{pago.cantidad}</strong></div>)}
        </section>
        <section className="approved-info-card">
          <h3>Alertas de stock</h3>
          <div className="approved-rows"><span>Productos con alerta</span><strong>{estadisticas.alertasStock.length}</strong></div>
          <div className="approved-rows"><span>Criterio</span><strong>Stock mínimo</strong></div>
        </section>
        <section className="approved-info-card">
          <h3>Ventas por categoría</h3>
          {categorias.map((categoria) => <div className="approved-rows" key={categoria.categoria}><span>{categoria.categoria}</span><strong>{categoria.cantidad || categoria.total}</strong></div>)}
        </section>
        <section className="approved-info-card">
          <h3>Top 10 productos más vendidos</h3>
          {productos.slice(0, 10).map((producto) => <div className="approved-rows" key={producto.nombre}><span>{producto.nombre}</span><strong>{producto.cantidadVendida}</strong></div>)}
        </section>
      </div>
    </div>
  );
}

export default SuperadminDashboard;
