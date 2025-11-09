import React from 'react'

export default function ProductCard({ product = {}, onAdd }) {
  const { name, category, price, image } = product

  return (
    <article className="product-card">
      <img src={image || '/assets/sample-food.svg'} alt={name} className="product-image" />
      <h3 className="text-sm font-semibold text-[var(--text)] mt-3 text-center">{name || 'Producto'}</h3>
      <p className="text-xs text-[var(--muted)] text-center">{category || 'Categoría'}</p>
      <div className="flex items-center justify-between mt-4 px-2">
        <span className="text-[var(--text)] font-bold">{price ? `${price} ARS` : '-'}</span>
        <button onClick={() => onAdd?.(product)} className="p-2 rounded-full shadow-lg" style={{background: 'linear-gradient(90deg,var(--neon-1),var(--neon-2))', color: '#fff'}}>
          +
        </button>
      </div>
    </article>
  )
}
