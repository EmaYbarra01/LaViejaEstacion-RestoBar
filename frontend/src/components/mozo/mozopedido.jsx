import React from 'react';
import './MozoPedido.css';

const MozoPedido = () => {
  return (
    <div className="mozo-container">
      <h2>Tomar Pedido</h2>

      {/* Selector de mesa */}
      <div className="mesa-selector">
        <label htmlFor="mesa">Seleccionar mesa:</label>
        <select id="mesa">
          <option value="">Mesa 1</option>
          <option value="">Mesa 2</option>
          <option value="">Mesa 3</option>
        </select>
      </div>

      {/* Categorías del menú */}
      <div className="categorias-menu">
        <button>Bebidas</button>
        <button>Comidas</button>
        <button>Postres</button>
      </div>

      {/* Productos */}
      <div className="productos-grid">
        <div className="producto-card">
          <img src="/assets/mozo/producto1.jpg" alt="Producto" />
          <h4>Coca Cola</h4>
          <p>Refresco frío 500ml</p>
          <span>$1200</span>
          <button>Agregar</button>
        </div>

        <div className="producto-card">
          <img src="/assets/mozo/producto2.jpg" alt="Producto" />
          <h4>Hamburguesa</h4>
          <p>Con cheddar y panceta</p>
          <span>$2500</span>
          <button>Agregar</button>
        </div>
      </div>

      {/* Resumen del pedido */}
      <div className="resumen-pedido">
        <h3>Resumen del Pedido</h3>
        <ul>
          <li>Coca Cola x1 - $1200</li>
          <li>Hamburguesa x2 - $5000</li>
        </ul>
        <button className="enviar-btn">Enviar Pedido</button>
      </div>
    </div>
  );
};

export default MozoPedido;