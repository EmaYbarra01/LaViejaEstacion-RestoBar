import useCartStore from '../../store/cartStore'
import useNotificationStore from '../../store/notificationStore'
import './ProductCard.css'

const ProductCard = ({ product }) => {
  const addItem = useCartStore(state => state.addItem)
  const addNotification = useNotificationStore(state => state.addNotification)

  const handleAddToCart = () => {
    addItem(product, addNotification)
  }

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img 
          src={product.imgUrl} 
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300?text=Imagen+no+disponible'
          }}
        />
        <div className="product-category">{product.category}</div>
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {/* <p className="product-description">{product.description}</p> */}
        
        <div className="product-footer">
          <div className="price-stock">
            <span className="product-price">${product.price}</span>
            <span className="product-stock">Stock: {product.stock}</span>
          </div>
          
          <button 
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard