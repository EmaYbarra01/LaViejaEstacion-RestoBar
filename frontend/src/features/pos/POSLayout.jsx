import React, { useState } from 'react';
import ProductCard from '../productos/ProductCard';
import OrderPanel from './OrderPanel';

const mockProducts = [
  { id: 1, name: 'Pizza Margarita', category: 'Comida', price: 1200, image: '/assets/sample-food.svg' },
  { id: 2, name: 'Cerveza Artesanal', category: 'Bebida', price: 600, image: '/assets/sample-food.svg' },
  { id: 3, name: 'Ensalada César', category: 'Comida', price: 900, image: '/assets/sample-food.svg' },
];

export default function POSLayout() {
  const [order, setOrder] = useState([]);

  const handleAddProduct = (product) => {
    setOrder((prevOrder) => {
      const existing = prevOrder.find((item) => item.id === product.id);
      if (existing) {
        return prevOrder.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevOrder, { ...product, qty: 1 }];
    });
  };

  const handleRemoveProduct = (productId) => {
    setOrder((prevOrder) => prevOrder.filter((item) => item.id !== productId));
  };

  return (
    <div className="flex h-screen">
      {/* Catálogo de productos */}
      <div className="w-2/3 p-4 grid grid-cols-3 gap-4 bg-[var(--bg-dark)]">
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={handleAddProduct} />
        ))}
      </div>

      {/* Panel de orden */}
      <div className="w-1/3 p-4 bg-[var(--panel)]">
        <OrderPanel order={order} onRemove={handleRemoveProduct} />
      </div>
    </div>
  );
}