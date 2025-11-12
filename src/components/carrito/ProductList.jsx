import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import { getAllProducts } from '../../helpers/queriesProductos'
import './ProductList.css'

const ProductList = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await getAllProducts()
      setProducts(data)
    } catch (err) {
      setError('Error al cargar los productos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['all', ...new Set(products.map(product => product.category))]
  
  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(product => product.category === filter)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Cargando productos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          {error}
          <button onClick={loadProducts} className="retry-btn">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="product-list-container">
      <div className="filters">
        <h2>Nuestros Productos</h2>
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${filter === category ? 'active' : ''}`}
              onClick={() => setFilter(category)}
            >
              {category === 'all' ? 'Todos' : category}
            </button>
          ))}
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="no-products">
          No hay productos disponibles en esta categoría.
        </div>
      )}
    </div>
  )
}

export default ProductList