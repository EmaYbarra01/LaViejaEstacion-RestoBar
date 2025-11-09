import { useState, useEffect } from 'react'
import { getMyPurchases } from '../../helpers/queriesVentas'
import './SalesHistory.css'

const SalesHistory = ({ isOpen, onClose }) => {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadSales()
    }
  }, [isOpen])

  const loadSales = async () => {
    try {
      setLoading(true)
      // Ahora obtenemos solo las compras del usuario autenticado
      const salesData = await getMyPurchases()
      setSales(salesData) // Ya vienen ordenadas por fecha descendente del backend
    } catch (error) {
      console.error('Error loading my purchases:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="sales-overlay">
      <div className="sales-modal">
        <div className="sales-header">
          <h2>� Mi Historial de Compras</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="sales-content">
          {loading ? (
            <div className="loading">Cargando tus compras...</div>
          ) : sales.length === 0 ? (
            <div className="no-sales">
              <p>No tienes compras registradas aún</p>
              <p style={{ fontSize: '14px', marginTop: '10px', opacity: 0.7 }}>
                ¡Explora nuestros productos y realiza tu primera compra!
              </p>
            </div>
          ) : (
            <div className="sales-list">
              {sales.map(sale => (
                <div key={sale.id} className="sale-item">
                  <div className="sale-header-info">
                    <span className="sale-id">Compra #{sale.id.substring(0, 8)}</span>
                    <span className="sale-date">
                      {new Date(sale.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <div className="sale-items">
                    {sale.items.map((item, index) => (
                      <div key={index} className="sale-item-detail">
                        <span>{item.name}</span>
                        <span>{item.quantity}x ${item.price}</span>
                        <span>${(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="sale-total">
                    <strong>Total: ${sale.total.toFixed(2)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SalesHistory