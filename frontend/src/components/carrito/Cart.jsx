import useCartStore from '../../store/cartStore'
import useNotificationStore from '../../store/notificationStore'
import useUserStore from '../../store/useUserStore'
import { createSale } from '../../helpers/queriesVentas'
import './Cart.css'

const Cart = ({ isOpen, onClose }) => {
  const { items, total, updateQuantity, removeItem, clearCart } = useCartStore()
  const addNotification = useNotificationStore(state => state.addNotification)
  const user = useUserStore(state => state.user)

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, parseInt(newQuantity))
  }

  const handleRemoveItem = (productId) => {
    removeItem(productId, addNotification)
  }

  const handleClearCart = () => {
    clearCart(addNotification)
  }

  const handleCheckout = async () => {
    if (items.length === 0) return

    // Verificar que el usuario esté autenticado
    if (!user) {
      addNotification('Debes iniciar sesión para realizar una compra', 'error', 5000)
      console.error('Usuario no autenticado:', user)
      return
    }

    try {
      // Estructura de datos según el schema del backend
      // El userId se obtiene automáticamente del token JWT en el backend
      const saleData = {
        items: items.map(item => ({
          productId: item._id || item.id, // ID del producto (MongoDB usa _id)
          quantity: item.quantity,
          priceAtSale: item.price // Precio del producto al momento de la venta
        }))
        // El total se calcula automáticamente en el backend
        // El userId se obtiene del token JWT
        // La fecha se genera automáticamente en el backend
      }

      console.log('Enviando venta:', saleData) // Debug

      await createSale(saleData)
      
      addNotification('¡Compra realizada con éxito!', 'success', 4000)
      clearCart()
      onClose()
    } catch (error) {
      console.error('Error al procesar la venta:', error)
      const errorMessage = error.response?.data?.mensaje || error.message || 'Error al procesar la compra'
      addNotification(`Error: ${errorMessage}`, 'error', 5000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="cart-overlay">
      <div className="cart-modal">
        <div className="cart-header">
          <h2>🛒 Carrito de Compras</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="cart-content">
          {items.length === 0 ? (
            <div className="empty-cart">
              <p>Tu carrito está vacío</p>
              <p>¡Agrega algunos productos!</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {items.map(item => (
                  <div key={item.id} className="cart-item">
                    <img 
                      src={item.imgUrl} 
                      alt={item.name}
                      className="cart-item-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80?text=Img'
                      }}
                    />
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p className="cart-item-price">${item.price}</p>
                    </div>
                    <div className="cart-item-controls">
                      <div className="quantity-controls">
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="quantity-btn"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="quantity-input"
                          min="1"
                        />
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="quantity-btn"
                        >
                          +
                        </button>
                      </div>
                      <div className="item-total">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="remove-btn"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-footer">
                <div className="cart-total">
                  <strong>Total: ${total.toFixed(2)}</strong>
                </div>
                <div className="cart-actions">
                  <button 
                    onClick={handleClearCart}
                    className="clear-btn"
                  >
                    Vaciar Carrito
                  </button>
                  <button 
                    onClick={handleCheckout}
                    className="checkout-btn"
                  >
                    Finalizar Compra
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Cart