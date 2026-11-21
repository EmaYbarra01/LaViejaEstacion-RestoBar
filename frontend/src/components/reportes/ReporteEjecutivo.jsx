import { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import ReportePDF from './ReportePDF';
import './ReporteEjecutivo.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function ReporteEjecutivo() {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('monthly');

  const handleGenerateReport = async () => {
    try {
      setLoading(true);

      const response = await apiClient.get(`${API_URL}/dashboard/estadisticas`, {
        withCredentials: true
      });

      setResumen(response.data.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateReport();
  }, []);

  if (loading) return <div className="report-loading"><p>Cargando reporte ejecutivo...</p></div>;

  if (!resumen) return <div className="report-loading"><p>No hay datos disponibles</p></div>;

  const resumenMes = resumen.resumenMes || {};
  const alertasStock = resumen.alertasStock || [];
  const ventasPorMetodo = resumen.ventasPorMetodoPago || [];
  const topProductos = resumen.top10Productos || [];
  const ventasPorCategoria = resumen.ventasPorCategoria || [];

  const kpis = [
    { 
      label: 'Ventas Totales', 
      value: `$${Number(resumenMes.totalVentas || 0).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`, 
      color: '#25B269' 
    },
    { 
      label: 'Total Pedidos', 
      value: resumenMes.cantidadPedidos || 0, 
      color: '#1E88E5' 
    },
    { 
      label: 'Ocupación', 
      value: 'No disponible',
      color: '#FB8500' 
    },
    { 
      label: 'Productos Alertados', 
      value: alertasStock.length || 0, 
      color: '#FF0000' 
    }
  ];

  return (
    <div className="report-container reporte-ejecutivo">
      <div className="report-header">
        <h2>Reporte Ejecutivo Resumido</h2>
        <p>Resumen completo de operaciones del negocio</p>
      </div>

      <div className="report-filters">
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="daily">Hoy</option>
          <option value="weekly">Esta Semana</option>
          <option value="monthly">Este Mes</option>
          <option value="yearly">Este Año</option>
        </select>
        <button onClick={handleGenerateReport} disabled={loading} className="btn-generate-report">
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>

      <div className="kpis-grid">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="kpi-card" style={{ borderLeftColor: kpi.color }}>
            <div className="kpi-content">
              <span className="kpi-label">{kpi.label}</span>
              <span className="kpi-value">{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="report-sections">
        {/* Ventas */}
        <section className="report-section">
          <h3>Ventas</h3>
          <div className="section-content">
            <div className="stat-item">
              <span>Ventas del Período</span>
              <strong>${Number(resumenMes.totalVentas || 0).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</strong>
            </div>
            <div className="stat-item">
              <span>Ticket Promedio</span>
              <strong>${(resumenMes.totalVentas / Math.max(resumenMes.cantidadPedidos, 1)).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</strong>
            </div>
            <div className="stat-item">
              <span>Número de Transacciones</span>
              <strong>{resumenMes.cantidadPedidos || 0}</strong>
            </div>
          </div>
        </section>

        {/* Métodos de Pago */}
        <section className="report-section">
          <h3>Métodos de Pago</h3>
          <div className="section-content">
            {ventasPorMetodo.length > 0 ? (
              ventasPorMetodo.map((pago, idx) => (
                <div key={idx} className="stat-item">
                  <span>{pago.metodoPago || 'Sin especificar'}</span>
                  <strong>{pago.cantidad || 0} transacciones</strong>
                </div>
              ))
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>No hay datos de métodos de pago</p>
            )}
          </div>
        </section>

        {/* Categorías */}
        <section className="report-section">
          <h3>Ventas por Categoría</h3>
          <div className="section-content">
            {ventasPorCategoria.length > 0 ? (
              ventasPorCategoria.slice(0, 5).map((cat, idx) => (
                <div key={idx} className="stat-item">
                  <span>{cat.categoria || 'Sin categoría'}</span>
                  <strong>{cat.cantidad || cat.total || 0}</strong>
                </div>
              ))
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>No hay datos de categorías</p>
            )}
          </div>
        </section>

        {/* Top Productos */}
        <section className="report-section">
          <h3>Top 5 Productos Más Vendidos</h3>
          <div className="section-content">
            {topProductos.length > 0 ? (
              topProductos.slice(0, 5).map((prod, idx) => (
                <div key={idx} className="stat-item">
                  <span>{prod.nombre || 'Producto'}</span>
                  <strong>{prod.cantidadVendida || 0} unidades</strong>
                </div>
              ))
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>No hay datos de productos vendidos</p>
            )}
          </div>
        </section>

        {/* Alertas */}
        <section className="report-section alertas">
          <h3>Alertas de Stock Crítico</h3>
          <div className="section-content">
            {alertasStock.length > 0 ? (
              alertasStock.slice(0, 5).map((alerta, idx) => (
                <div key={idx} className="alert-item">
                  <span>{alerta.nombre || 'Producto'}</span>
                  <span className="alert-badge">Stock: {alerta.stock || 0}</span>
                </div>
              ))
            ) : (
              <p className="no-alerts">No hay alertas críticas de stock</p>
            )}
          </div>
        </section>

        {/* Resumen General */}
        <section className="report-section">
          <h3>Resumen General</h3>
          <div className="section-content">
            <div className="stat-item">
              <span>Período Reportado</span>
              <strong>{period === 'daily' ? 'Hoy' : period === 'weekly' ? 'Esta Semana' : period === 'monthly' ? 'Este Mes' : 'Este Año'}</strong>
            </div>
            <div className="stat-item">
              <span>Generado</span>
              <strong>{new Date().toLocaleDateString('es-AR')}</strong>
            </div>
            <div className="stat-item">
              <span>Productos en Stock</span>
              <strong>{topProductos.length || 0}</strong>
            </div>
          </div>
        </section>
      </div>

      <div className="report-actions">
        <ReportePDF 
          data={resumen} 
          title="Reporte Ejecutivo Resumido"
          reportType="Ejecutivo"
        />
      </div>
    </div>
  );
}

export default ReporteEjecutivo;
