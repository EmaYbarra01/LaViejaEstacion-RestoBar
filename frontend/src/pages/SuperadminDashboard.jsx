import { useEffect, useState } from 'react';
import axios from 'axios';
import { formatCurrency } from '../utils/currencyFormatter';
import './SuperadminDashboard.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="120"%3E%3Crect fill="%234f222b" width="160" height="120"/%3E%3Ctext fill="%23f3e7cd" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12"%3ESin imagen%3C/text%3E%3C/svg%3E';

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
  const obtenerImagenProducto = (imagenUrl) => {
    if (!imagenUrl) return FALLBACK_IMAGE;
    if (imagenUrl.startsWith('http://') || imagenUrl.startsWith('https://')) return imagenUrl;
    return `${BACKEND_URL}${imagenUrl.startsWith('/') ? '' : '/'}${imagenUrl}`;
  };

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
        <section className="approved-info-card top-products-card">
          <h3>Top 10 productos más vendidos</h3>
          <div className="top-products-list">
            {productos.slice(0, 10).map((producto, index) => (
              <article className="top-product-item" key={`${producto.nombre}-${index}`}>
                <span className="top-product-rank">{index + 1}</span>
                <img
                  className="top-product-image"
                  src={obtenerImagenProducto(producto.imagenUrl)}
                  alt={producto.nombre}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
                <div className="top-product-info">
                  <span className="top-product-name">{producto.nombre}</span>
                  <span className="top-product-sold">{producto.cantidadVendida} vendidos</span>
                </div>
              </article>
            ))}
            {productos.length === 0 && <p className="top-products-empty">Aún no hay ventas de productos este mes.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

export default SuperadminDashboard;
