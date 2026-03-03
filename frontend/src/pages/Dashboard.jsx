import { useEffect, useState } from 'react';
import { Card, CardContent, Grid, Typography, Box, CircularProgress } from '@mui/material';
import { TrendingUp, TrendingDown, Warning, CheckCircle, Restaurant, AttachMoney, ShoppingCart, People } from '@mui/icons-material';
import axios from 'axios';
import useUserStore from '../store/useUserStore';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const Dashboard = () => {
  const { user } = useUserStore();
  const [metrics, setMetrics] = useState({
    pedidosHoy: 0,
    ventasHoy: 0,
    productosStockBajo: 0,
    empleadosActivos: 0,
    mesasOcupadas: 0,
    pedidosPendientes: 0,
    reservasHoy: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMetricas();
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarMetricas, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarMetricas = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Cargar métricas en paralelo
      const [pedidosRes, productosRes, empleadosRes, mesasRes] = await Promise.all([
        axios.get(`${API_URL}/pedidos`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/productos`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/empleados`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/mesas`, { headers }).catch(() => ({ data: [] }))
      ]);

      const pedidos = Array.isArray(pedidosRes.data) ? pedidosRes.data : [];
      const productos = Array.isArray(productosRes.data) ? productosRes.data : [];
      const empleados = Array.isArray(empleadosRes.data) ? empleadosRes.data : [];
      const mesas = Array.isArray(mesasRes.data) ? mesasRes.data : [];

      // Calcular métricas
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const pedidosHoy = pedidos.filter(p => 
        new Date(p.createdAt || p.fechaCreacion) >= hoy
      );

      const ventasHoy = pedidosHoy
        .filter(p => p.estado === 'Pagado' || p.estado === 'Completado')
        .reduce((sum, p) => sum + (p.total || 0), 0);

      setMetrics({
        pedidosHoy: pedidosHoy.length,
        ventasHoy: ventasHoy,
        productosStockBajo: productos.filter(p => p.stock <= p.stockMinimo).length,
        empleadosActivos: empleados.filter(e => e.activo).length,
        mesasOcupadas: mesas.filter(m => m.estado === 'Ocupada').length,
        pedidosPendientes: pedidos.filter(p => 
          p.estado === 'Pendiente' || p.estado === 'En preparación'
        ).length,
        reservasHoy: 0 // TODO: Implementar cuando tengamos endpoint de reservas
      });

      setLoading(false);
    } catch (error) {
      console.error('Error cargando métricas:', error);
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
    <Card className="metric-card" style={{ borderLeft: `4px solid ${color}` }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" style={{ color, fontWeight: 'bold' }}>
              {typeof value === 'number' && title.includes('Ventas') 
                ? `$${value.toLocaleString()}` 
                : value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box 
            style={{ 
              background: `${color}20`, 
              padding: '12px', 
              borderRadius: '12px' 
            }}
          >
            <Icon style={{ fontSize: 40, color }} />
          </Box>
        </Box>
        {trend && (
          <Box display="flex" alignItems="center" mt={1}>
            {trend > 0 ? (
              <TrendingUp style={{ color: '#4caf50', fontSize: 16 }} />
            ) : (
              <TrendingDown style={{ color: '#f44336', fontSize: 16 }} />
            )}
            <Typography 
              variant="caption" 
              style={{ 
                color: trend > 0 ? '#4caf50' : '#f44336',
                marginLeft: 4 
              }}
            >
              {Math.abs(trend)}% vs ayer
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="dashboard-container">
      <Box mb={3}>
        <Typography variant="h4" gutterBottom style={{ fontWeight: 'bold' }}>
          📊 Dashboard - {user?.role === 'Gerente' ? 'Supervisión' : 'Panel de Control'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Resumen en tiempo real del estado del restaurante
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Pedidos Hoy */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pedidos Hoy"
            value={metrics.pedidosHoy}
            icon={Restaurant}
            color="#2196f3"
            subtitle="Total de pedidos"
          />
        </Grid>

        {/* Ventas Hoy */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Ventas Hoy"
            value={metrics.ventasHoy}
            icon={AttachMoney}
            color="#4caf50"
            subtitle="Ingresos del día"
          />
        </Grid>

        {/* Pedidos Pendientes */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pedidos Pendientes"
            value={metrics.pedidosPendientes}
            icon={ShoppingCart}
            color="#ff9800"
            subtitle="En proceso"
          />
        </Grid>

        {/* Productos Stock Bajo */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Stock Bajo"
            value={metrics.productosStockBajo}
            icon={Warning}
            color={metrics.productosStockBajo > 0 ? '#f44336' : '#4caf50'}
            subtitle="Productos a reponer"
          />
        </Grid>

        {/* Mesas Ocupadas */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Mesas Ocupadas"
            value={`${metrics.mesasOcupadas}/8`}
            icon={Restaurant}
            color="#9c27b0"
            subtitle="Ocupación actual"
          />
        </Grid>

        {/* Empleados Activos */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Empleados Activos"
            value={metrics.empleadosActivos}
            icon={People}
            color="#00bcd4"
            subtitle="Personal trabajando"
          />
        </Grid>

        {/* Estado General */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Estado General"
            value={metrics.pedidosPendientes === 0 ? 'Óptimo' : 'Normal'}
            icon={CheckCircle}
            color={metrics.pedidosPendientes === 0 ? '#4caf50' : '#ff9800'}
            subtitle="Operación"
          />
        </Grid>

        {/* Reservas Hoy */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Reservas Hoy"
            value={metrics.reservasHoy}
            icon={Restaurant}
            color="#3f51b5"
            subtitle="Confirmadas"
          />
        </Grid>
      </Grid>

      {/* Alertas y Notificaciones */}
      {(metrics.productosStockBajo > 0 || metrics.pedidosPendientes > 5) && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom style={{ fontWeight: 'bold' }}>
            ⚠️ Alertas
          </Typography>
          <Grid container spacing={2}>
            {metrics.productosStockBajo > 0 && (
              <Grid item xs={12}>
                <Card style={{ background: '#fff3cd', border: '1px solid #ffc107' }}>
                  <CardContent>
                    <Typography variant="body1" style={{ color: '#856404' }}>
                      <Warning style={{ verticalAlign: 'middle', marginRight: 8 }} />
                      <strong>{metrics.productosStockBajo}</strong> producto{metrics.productosStockBajo > 1 ? 's' : ''} con stock bajo. 
                      {user?.role === 'Gerente' 
                        ? ' Se recomienda notificar al SuperAdministrador.'
                        : ' Revisar en la sección de Productos.'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
            {metrics.pedidosPendientes > 5 && (
              <Grid item xs={12}>
                <Card style={{ background: '#fff3cd', border: '1px solid #ffc107' }}>
                  <CardContent>
                    <Typography variant="body1" style={{ color: '#856404' }}>
                      <ShoppingCart style={{ verticalAlign: 'middle', marginRight: 8 }} />
                      Alta carga de pedidos: <strong>{metrics.pedidosPendientes}</strong> pedidos en proceso.
                      Monitorear tiempos de cocina.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
    </div>
  );
};

export default Dashboard;
