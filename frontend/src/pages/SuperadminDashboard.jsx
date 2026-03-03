import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import './SuperadminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const SuperadminDashboard = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/dashboard/estadisticas`, {
        withCredentials: true
      });

      if (response.data.success) {
        setEstadisticas(response.data.data);
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      setError('Error al cargar las estadísticas del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>❌ {error}</p>
        <button onClick={cargarEstadisticas} className="btn-reintentar">
          Reintentar
        </button>
      </div>
    );
  }

  if (!estadisticas) {
    return <div className="dashboard-error">No hay datos disponibles</div>;
  }

  // Colores para gráficos
  const COLORES_CATEGORIA = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="superadmin-dashboard">
      <header className="dashboard-header">
        <h1>📊 Dashboard - Panel de Control</h1>
        <button onClick={cargarEstadisticas} className="btn-actualizar">
          🔄 Actualizar
        </button>
      </header>

      {/* Tarjetas de resumen */}
      <div className="dashboard-resumen">
        <div className="resumen-card">
          <div className="card-icon ventas">💰</div>
          <div className="card-info">
            <h3>Ventas del Mes</h3>
            <p className="card-valor">${estadisticas.resumenMes.totalVentas.toFixed(2)}</p>
            <span className="card-detalle">
              {estadisticas.resumenMes.cantidadPedidos} pedidos cobrados
            </span>
          </div>
        </div>

        <div className="resumen-card">
          <div className="card-icon pedidos">📦</div>
          <div className="card-info">
            <h3>Pedidos del Mes</h3>
            <p className="card-valor">{estadisticas.resumenMes.cantidadPedidos}</p>
            <span className="card-detalle">
              Promedio: ${estadisticas.resumenMes.promedioVenta.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="resumen-card">
          <div className="card-icon stock">⚠️</div>
          <div className="card-info">
            <h3>Alertas de Stock</h3>
            <p className="card-valor">{estadisticas.alertasStock.length}</p>
            <span className="card-detalle">
              {estadisticas.alertasStock.filter(a => a.urgencia === 'CRÍTICO').length} críticos
            </span>
          </div>
        </div>
      </div>

      {/* Grid de gráficos */}
      <div className="dashboard-grid">
        {/* Ventas Mensuales */}
        <div className="dashboard-card ventas-mensuales">
          <div className="card-header">
            <h2>📈 Ventas Mensuales</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={estadisticas.ventasMensuales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="mes" 
                  stroke="#9ca3af"
                  style={{ fontSize: '0.875rem' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  style={{ fontSize: '0.875rem' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Total']}
                />
                <Legend />
                <Bar dataKey="total" fill="#2563eb" name="Ventas ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ventas por Categoría */}
        <div className="dashboard-card ventas-categoria">
          <div className="card-header">
            <h2>🍽️ Ventas por Categoría</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={estadisticas.ventasPorCategoria}
                  dataKey="total"
                  nameKey="categoria"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => entry.categoria}
                >
                  {estadisticas.ventasPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORES_CATEGORIA[index % COLORES_CATEGORIA.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => `$${value.toFixed(2)}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Productos */}
        <div className="dashboard-card top-productos">
          <div className="card-header">
            <h2>🏆 Top 10 Productos Más Vendidos</h2>
          </div>
          <div className="card-body">
            {estadisticas.top10Productos.length > 0 ? (
              <div className="top-productos-lista">
                {estadisticas.top10Productos.map((producto, index) => (
                  <div key={index} className="producto-item">
                    <div className="producto-rank">
                      <span className={`rank rank-${index + 1}`}>#{index + 1}</span>
                    </div>
                    <div className="producto-info">
                      <h4>{producto.nombre}</h4>
                      <span className="producto-categoria">{producto.categoria}</span>
                    </div>
                    <div className="producto-stats">
                      <div className="stat">
                        <span className="stat-label">Cantidad</span>
                        <span className="stat-valor">{producto.cantidadVendida}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Ventas</span>
                        <span className="stat-valor">${producto.totalVentas.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-datos">
                <p>📊 No hay datos de ventas este mes</p>
              </div>
            )}
          </div>
        </div>

        {/* Alertas de Stock Bajo */}
        <div className="dashboard-card alertas-stock">
          <div className="card-header">
            <h2>⚠️ Alertas de Stock Bajo</h2>
          </div>
          <div className="card-body">
            {estadisticas.alertasStock.length > 0 ? (
              <div className="alertas-lista">
                {estadisticas.alertasStock.map((alerta, index) => (
                  <div key={index} className={`alerta-item urgencia-${alerta.urgencia.toLowerCase()}`}>
                    <div className="alerta-badge">
                      {alerta.urgencia === 'CRÍTICO' && '🔴'}
                      {alerta.urgencia === 'URGENTE' && '🟠'}
                      {alerta.urgencia === 'MEDIO' && '🟡'}
                    </div>
                    <div className="alerta-info">
                      <h4>{alerta.producto}</h4>
                      <span className="alerta-categoria">{alerta.categoria}</span>
                    </div>
                    <div className="alerta-stock">
                      <span className="stock-actual">{alerta.stockActual}</span>
                      <span className="stock-separador">/</span>
                      <span className="stock-minimo">{alerta.stockMinimo}</span>
                    </div>
                    <div className="alerta-urgencia">
                      <span className={`badge-urgencia ${alerta.urgencia.toLowerCase()}`}>
                        {alerta.urgencia}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-datos success">
                <p>✅ Todos los productos tienen stock adecuado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Métodos de Pago - Placeholder para futuras implementaciones */}
      <div className="dashboard-grid-small">
        <div className="dashboard-card metodos-pago">
          <div className="card-header">
            <h2>💳 Métodos de Pago</h2>
          </div>
          <div className="card-body">
            <div className="no-datos">
              <p>📊 Próximamente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperadminDashboard;
