/**
 * ProductoCard.jsx
 * HU2 - Ver fotos, descripción y precio
 * Tarjeta de producto del menú digital (usa los estilos mv-* de MenuPage.css y pd-* de MenuDigital.css)
 */

import React, { useState } from 'react';

const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%234f222b" width="300" height="200"/%3E%3Ctext fill="%23f3e7cd" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16"%3EImagen No Disponible%3C/text%3E%3C/svg%3E';

const ProductoCard = ({ producto, onSelect }) => {
  const [imageError, setImageError] = useState(false);
  const stock = Number(producto.stock || 0);
  const disponible = producto.disponible !== false && stock > 0;
  const agotado = stock <= 0;
  const stockBajo = stock > 0 && Number(producto.stockMinimo || 0) >= stock;

  const formatPrice = (price) => `$${Number(price || 0).toFixed(2)}`;

  const getImageUrl = () => {
    if (!producto.imagenUrl || imageError) {
      return FALLBACK_IMAGE;
    }
    if (producto.imagenUrl.startsWith('/')) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
      return `${backendUrl}${producto.imagenUrl}`;
    }
    return producto.imagenUrl;
  };

  return (
    <article
      className={`mv-card pd-card ${disponible ? '' : 'pd-card-off'}`}
      onClick={() => onSelect && onSelect(producto)}
    >
      <div className="mv-card-image">
        <img src={getImageUrl()} alt={producto.nombre} loading="lazy" onError={() => setImageError(true)} />
      </div>
      <div className="mv-card-head">
        <h3 className="mv-card-name">{producto.nombre}</h3>
        <span className="mv-card-price">{formatPrice(producto.precio)}</span>
      </div>
      <p className="mv-card-desc">{producto.descripcion}</p>
      <div className="mv-card-foot pd-card-foot">
        {agotado ? (
          <span className="mv-badge mv-badge-off">Sin stock</span>
        ) : disponible ? (
          <span className={`mv-badge ${stockBajo ? 'pd-badge-low' : ''}`}>Disponible</span>
        ) : (
          <span className="mv-badge mv-badge-off">No disponible</span>
        )}
        <button
          type="button"
          className="pd-add"
          onClick={(event) => {
            event.stopPropagation();
            onSelect && onSelect(producto);
          }}
          disabled={!disponible}
        >
          {disponible ? 'Agregar al pedido' : 'No disponible para pedidos'}
        </button>
      </div>
    </article>
  );
};

export default ProductoCard;
