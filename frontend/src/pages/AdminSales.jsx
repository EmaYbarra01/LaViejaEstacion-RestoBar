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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  useEffect(() => {
    fetchAllSales();
  }, []);

  const fetchAllSales = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Obtener pedidos cobrados (ventas realizadas)
      const response = await axios.get(`${API_URL}/pedidos`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { estado: 'Cobrado' }
      });
      
      if (response.data && Array.isArray(response.data)) {
        // Transformar pedidos a formato de ventas
        const ventasFormateadas = response.data.map(pedido => ({
          id: pedido._id,
          numeroPedido: pedido.numeroPedido,
          mesa: pedido.numeroMesa,
          mozo: pedido.nombreMozo,
          customerInfo: {
            name: pedido.nombreMozo,
            email: pedido.mozo?.email || 'N/A'
          },
          items: pedido.productos.map(item => ({
            name: item.nombre,
            quantity: item.cantidad,
            price: item.precioUnitario
          })),
          total: pedido.total,
          subtotal: pedido.subtotal,
          metodoPago: pedido.metodoPago,
          descuento: pedido.descuento,
          date: pedido.fechaCobrado || pedido.fechaCreacion,
          cajero: pedido.pago?.cajero?.nombre || 'N/A'
        }));
        
        setSales(ventasFormateadas);
      }
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las ventas',
        confirmButtonColor: '#d33'
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
          const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
          return saleDate >= inicioMes;
        default:
          return true;
      }
    });
  };

  const formatCurrency = (value) => {
    const number = Number(value) || 0;
    const parts = number.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${parts[0]},${parts[1]}`;
  };

  const removeAccents = (value) =>
    String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const filterSalesBySearch = (salesList) => {
    if (!searchTerm.trim()) return salesList;
    
    const search = searchTerm.trim();
    const digits = search.replace(/\D/g, '');
    
    // Si el término es numérico, buscar SOLO por mesa
    if (digits && digits === search) {
      return salesList.filter(sale => {
        const mesaStr = sale.mesa !== undefined && sale.mesa !== null ? String(sale.mesa).trim() : '';
        return mesaStr === digits || mesaStr === search;
      });
    }
    
    // Búsqueda case-insensitive y sin acentos en mozo, numeroPedido y cajero
    const searchNormalized = removeAccents(search);
    return salesList.filter(sale => 
      removeAccents(sale.mozo).includes(searchNormalized) ||
      sale.numeroPedido?.toLowerCase().includes(searchNormalized) ||
      removeAccents(sale.cajero).includes(searchNormalized)
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
             <h3>${formatCurrency(totalRevenue)}</h3>
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
            placeholder="🔍 Buscar por pedido, mozo, mesa o cajero..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            maxLength={50}
          />
        </div>
      </div>

      <div className="admin-results-count">
        Mostrando <strong>{filteredSales.length}</strong> de <strong>{sales.length}</strong> ventas
        {searchTerm ? ` | Buscando: "${searchTerm}"` : ''}
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
                <th>N° Pedido</th>
                <th>Mesa</th>
                <th>Mozo</th>
                <th>Cajero</th>
                <th>Productos</th>
                <th>Cantidad</th>
                <th>Método Pago</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <span className="sale-id" title={sale.numeroPedido}>
                      {sale.numeroPedido}
                    </span>
                  </td>
                  <td>
                    <strong>Mesa {sale.mesa}</strong>
                  </td>
                  <td>{sale.mozo}</td>
                  <td>{sale.cajero}</td>
                  <td>
                    <div className="sale-items">
                      {sale.items.slice(0, 2).map((item, idx) => (
                        <span key={idx} className="item-name">
                          {item.name || 'Producto'}
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
                    <span className={`badge badge-${sale.metodoPago?.toLowerCase()}`}>
                      {sale.metodoPago || 'N/A'}
                    </span>
                  </td>
                  <td>
                     <strong className="sale-total">${formatCurrency(sale.total)}</strong>
                     {sale.descuento?.monto > 0 && (
                       <small style={{display: 'block', color: '#10b981'}}>
                         (Desc: ${formatCurrency(sale.descuento.monto)})
                       </small>
                     )}
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
          <strong>${item.name || 'Producto'}</strong><br/>
          Precio: $${item.price} × ${item.quantity} = $${formatCurrency(item.price * item.quantity)}
        </div>
      `)
      .join('');

    Swal.fire({
      title: '📋 Detalle de Venta',
      html: `
        <div style="text-align: left;">
          <p><strong>Número de Pedido:</strong> ${sale.numeroPedido}</p>
          <p><strong>Mesa:</strong> ${sale.mesa}</p>
          <p><strong>Mozo:</strong> ${sale.mozo}</p>
          <p><strong>Cajero:</strong> ${sale.cajero}</p>
          <p><strong>Método de Pago:</strong> ${sale.metodoPago || 'N/A'}</p>
          <p><strong>Fecha:</strong> ${new Date(sale.date).toLocaleString('es-AR')}</p>
          <hr/>
          <h4 style="margin-top: 15px;">Productos:</h4>
          ${itemsList}
          <hr/>
          <div style="text-align: right; margin-top: 15px;">
            <p><strong>Subtotal:</strong> $${formatCurrency(sale.subtotal)}</p>
            ${sale.descuento?.monto > 0 ? `
              <p style="color: #10b981;">
                <strong>Descuento (${sale.descuento.porcentaje}%):</strong> 
                -$${formatCurrency(sale.descuento.monto)}
              </p>
            ` : ''}
            <h3><strong>TOTAL:</strong> $${formatCurrency(sale.total)}</h3>
          </div>
        </div>
      `,
      confirmButtonColor: '#0f3460',
      width: '600px'
    });
  }
}

export default AdminSales;
