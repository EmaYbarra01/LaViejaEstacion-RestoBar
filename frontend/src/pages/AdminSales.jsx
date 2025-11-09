import { useState, useEffect } from 'react';
import axios from 'axios';
import useUserStore from '../store/useUserStore';
import Swal from 'sweetalert2';
import '../pages/AdminPage.css';

function AdminSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, today, week, month
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useUserStore();

  const URL_SALES = import.meta.env.VITE_API_SALES || 'http://localhost:4000/api/sales';

  useEffect(() => {
    fetchAllSales();
  }, []);

  const fetchAllSales = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${URL_SALES}/all`, {
        withCredentials: true // Para enviar el token JWT
      });
      
      if (response.data && Array.isArray(response.data)) {
        setSales(response.data);
      }
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las ventas',
        background: '#1a1a2e',
        color: '#ffffff',
        confirmButtonColor: '#0f3460'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSalesByDate = (salesList) => {
    const now = new Date();
    
    return salesList.filter(sale => {
      const saleDate = new Date(sale.date);
      
      switch (filter) {
        case 'today':
          return saleDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return saleDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return saleDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const filterSalesBySearch = (salesList) => {
    if (!searchTerm.trim()) return salesList;
    
    const search = searchTerm.toLowerCase();
    return salesList.filter(sale => 
      sale.customerInfo?.name?.toLowerCase().includes(search) ||
      sale.customerInfo?.email?.toLowerCase().includes(search) ||
      sale.id?.toLowerCase().includes(search)
    );
  };

  const getFilteredSales = () => {
    let filtered = [...sales];
    filtered = filterSalesByDate(filtered);
    filtered = filterSalesBySearch(filtered);
    return filtered;
  };

  const calculateTotalRevenue = (salesList) => {
    return salesList.reduce((sum, sale) => sum + sale.total, 0);
  };

  const filteredSales = getFilteredSales();
  const totalRevenue = calculateTotalRevenue(filteredSales);

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Cargando ventas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>📊 Administración de Ventas</h1>
        <p className="admin-subtitle">
          Gestiona y supervisa todas las ventas realizadas
        </p>
      </div>

      {/* Estadísticas */}
      <div className="sales-stats">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>${totalRevenue.toFixed(2)}</h3>
            <p>Ingresos Totales</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <h3>{filteredSales.length}</h3>
            <p>Ventas Realizadas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>
              {filteredSales.reduce((sum, sale) => 
                sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
              )}
            </h3>
            <p>Productos Vendidos</p>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="admin-controls">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            📅 Todas
          </button>
          <button 
            className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
            onClick={() => setFilter('today')}
          >
            📆 Hoy
          </button>
          <button 
            className={`filter-btn ${filter === 'week' ? 'active' : ''}`}
            onClick={() => setFilter('week')}
          >
            📊 Semana
          </button>
          <button 
            className={`filter-btn ${filter === 'month' ? 'active' : ''}`}
            onClick={() => setFilter('month')}
          >
            📈 Mes
          </button>
        </div>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Buscar por cliente, email o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Tabla de ventas */}
      {filteredSales.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">📭</p>
          <p className="empty-text">No hay ventas para mostrar</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID Venta</th>
                <th>Cliente</th>
                <th>Email</th>
                <th>Productos</th>
                <th>Cantidad</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <span className="sale-id" title={sale.id}>
                      {sale.id.substring(0, 8)}...
                    </span>
                  </td>
                  <td>
                    <strong>{sale.customerInfo?.name || 'Usuario eliminado'}</strong>
                  </td>
                  <td>{sale.customerInfo?.email || 'N/A'}</td>
                  <td>
                    <div className="sale-items">
                      {sale.items.slice(0, 2).map((item, idx) => (
                        <span key={idx} className="item-name">
                          {item.name || 'Producto eliminado'}
                        </span>
                      ))}
                      {sale.items.length > 2 && (
                        <span className="more-items">
                          +{sale.items.length - 2} más
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="quantity-badge">
                      {sale.items.reduce((sum, item) => sum + item.quantity, 0)} unid.
                    </span>
                  </td>
                  <td>
                    <strong className="sale-total">${sale.total.toFixed(2)}</strong>
                  </td>
                  <td>
                    <span className="sale-date">
                      {new Date(sale.date).toLocaleDateString('es-AR')}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => viewSaleDetails(sale)}
                      title="Ver detalles"
                    >
                      👁️ Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  function viewSaleDetails(sale) {
    const itemsList = sale.items
      .map((item, idx) => `
        <div style="text-align: left; padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name || 'Producto eliminado'}</strong><br/>
          Precio: $${item.price} × ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}
        </div>
      `)
      .join('');

    Swal.fire({
      title: '📋 Detalle de Venta',
      html: `
        <div style="text-align: left;">
          <p><strong>ID:</strong> ${sale.id}</p>
          <p><strong>Cliente:</strong> ${sale.customerInfo?.name || 'Usuario eliminado'}</p>
          <p><strong>Email:</strong> ${sale.customerInfo?.email || 'N/A'}</p>
          <p><strong>Fecha:</strong> ${new Date(sale.date).toLocaleString('es-AR')}</p>
          <hr/>
          <h4 style="margin-top: 15px;">Productos:</h4>
          ${itemsList}
          <hr/>
          <h3 style="text-align: right; margin-top: 15px;">Total: $${sale.total.toFixed(2)}</h3>
        </div>
      `,
      background: '#1a1a2e',
      color: '#ffffff',
      confirmButtonColor: '#0f3460',
      width: '600px'
    });
  }
}

export default AdminSales;
