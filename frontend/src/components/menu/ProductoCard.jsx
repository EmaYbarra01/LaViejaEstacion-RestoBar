/**
 * ProductoCard.jsx
 * HU2 - Ver fotos, descripción y precio
 * Componente de tarjeta de producto con imagen, nombre, descripción y precio
 */

import React, { useState } from 'react';
import './ProductoCard.css';

const ProductoCard = ({ producto, onSelect }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const stock = Number(producto.stock || 0);
  const disponible = producto.disponible !== false && stock > 0;
  const agotado = stock <= 0;
  const stockBajo = stock > 0 && Number(producto.stockMinimo || 0) >= stock;

  const formatPrice = (price) => {
    return `$${Number(price || 0).toFixed(2)}`;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const getImageUrl = () => {
    if (!producto.imagenUrl || imageError) {
      return null;
    }
    
    // Si la URL es relativa, usar el backend
    if (producto.imagenUrl.startsWith('/')) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
      return `${backendUrl}${producto.imagenUrl}`;
    }
    
    return producto.imagenUrl;
  };

  const imageUrl = getImageUrl();
  const showImage = imageUrl && !imageError;

  return (
    <div 
      className={`producto-card ${showImage ? 'with-image' : 'no-image'}`}
      onClick={() => onSelect && onSelect(producto)}
    >
      {/* Imagen del producto */}
      {showImage && (
        <div className="producto-image-wrapper">
          {!imageLoaded && (
            <div className="image-skeleton">
              <div className="skeleton-loader"></div>
            </div>
          )}
          <img
            src={imageUrl}
            alt={producto.nombre}
            className={`producto-image ${imageLoaded ? 'loaded' : 'loading'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
          <div className="image-overlay">
            <div className="overlay-content">
              <span className="view-details">Ver detalles</span>
            </div>
          </div>
        </div>
      )}

      {/* Contenido del producto */}
      <div className="producto-content">
        {/* Encabezado con nombre y precio */}
        <div className="producto-header">
          <h3 className="producto-nombre">{producto.nombre}</h3>
          {producto.descripcion && (
            <p className="producto-descripcion">{producto.descripcion}</p>
          )}
          <span className="producto-precio">{formatPrice(producto.precio)}</span>
        </div>

      </div>

      <div className="producto-details">
        <div className="producto-badge">
          {agotado ? (
            <span className="badge-agotado">Agotado</span>
          ) : disponible ? (
            <span className={`badge-disponible ${stockBajo ? 'badge-stock-bajo' : ''}`}>
              Disponible
            </span>
          ) : (
            <span className="badge-no-disponible">No disponible</span>
          )}
        </div>

        <button
          type="button"
          className="add-product-button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect && onSelect(producto);
          }}
          disabled={!disponible}
        >
          <span>{disponible ? 'Agregar al pedido' : 'No disponible'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductoCard;
