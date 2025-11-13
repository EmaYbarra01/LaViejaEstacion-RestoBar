import { useState, useEffect } from 'react';
import axios from 'axios';
import './PedidoDetalle.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const PedidoDetalle = ({ pedido, onClose }) => {
  const [pedidoActual, setPedidoActual] = useState(pedido);
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);

  const actualizarCantidad = async (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const productosActualizados = pedidoActual.productos.map(item => {
        if (item.producto._id === productoId) {
          return {
            ...item,
            cantidad: nuevaCantidad,
            subtotal: nuevaCantidad * item.precioUnitario
          };
        }
        return item;
      });

      const response = await axios.put(
        `${API_URL}/pedidos/${pedidoActual._id}`,
        { productos: productosActualizados },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setPedidoActual(response.data);
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      alert('Error al actualizar la cantidad');
    } finally {
      setLoading(false);
    }
  };

  const eliminarProducto = async (productoId) => {
    if (!confirm('¿Eliminar este producto del pedido?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const productosActualizados = pedidoActual.productos.filter(
        item => item.producto._id !== productoId
      );

      if (productosActualizados.length === 0) {
        alert('No se puede eliminar el último producto. Cancela el pedido completo.');
        return;
      }

      const response = await axios.put(
        `${API_URL}/pedidos/${pedidoActual._id}`,
        { productos: productosActualizados },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setPedidoActual(response.data);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar el producto');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (nuevoEstado) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.patch(
        `${API_URL}/pedidos/${pedidoActual._id}/estado`,
        { estado: nuevoEstado },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setPedidoActual(response.data);
      alert(`Pedido ${nuevoEstado} correctamente`);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado del pedido');
    } finally {
      setLoading(false);
    }
  };

  const enviarACocina = () => cambiarEstado('En Preparación');
  const marcarComoEntregado = () => cambiarEstado('Entregado');
  
  const imprimirComanda = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content pedido-detalle" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="detalle-header">
          <button className="btn-back" onClick={onClose}>
            ←
          </button>
          <h2>Mesa {pedidoActual.numeroMesa || 'S/N'}</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Resumen financiero */}
        <div className="resumen-financiero">
          <div className="resumen-item total">
            <span className="label">Total</span>
            <span className="valor">R$ {pedidoActual.total?.toFixed(2) || '0.00'}</span>
            <button className="btn-info">?</button>
          </div>
          
          {pedidoActual.descuento && pedidoActual.descuento.monto > 0 && (
            <>
              <div className="resumen-item">
                <span className="label">Taxa de serviço</span>
                <span className="valor">R$ {pedidoActual.descuento.monto.toFixed(2)}</span>
              </div>
              <div className="resumen-item">
                <span className="label">{pedidoActual.descuento.motivo || 'Descuento'}</span>
                <span className="valor">R$ {pedidoActual.descuento.monto.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* Lista de productos */}
        <div className="productos-lista">
          {pedidoActual.productos && pedidoActual.productos.map((item, index) => (
            <div key={index} className="producto-item">
              <div className="producto-header">
                <h3 className="producto-nombre">{item.nombre}</h3>
                <span className="producto-precio">
                  R$ {(item.precioUnitario * item.cantidad).toFixed(2)}
                </span>
              </div>

              {/* Variaciones si existen */}
              {item.observaciones && (
                <div className="producto-variaciones">
                  <p><strong>Variações:</strong></p>
                  <p>{item.observaciones}</p>
                </div>
              )}

              {/* Controles de cantidad */}
              <div className="producto-controles">
                <div className="cantidad-controles">
                  <button
                    className="btn-cantidad"
                    onClick={() => actualizarCantidad(item.producto._id, item.cantidad - 1)}
                    disabled={loading || item.cantidad <= 1}
                  >
                    -1
                  </button>
                  <span className="cantidad">{item.cantidad}</span>
                  <button
                    className="btn-cantidad"
                    onClick={() => actualizarCantidad(item.producto._id, item.cantidad + 1)}
                    disabled={loading}
                  >
                    +1
                  </button>
                </div>

                <div className="acciones-producto">
                  <button className="btn-accion btn-imprimir" title="Imprimir">
                    🖨️
                  </button>
                  <button 
                    className="btn-accion btn-eliminar" 
                    title="Eliminar"
                    onClick={() => eliminarProducto(item.producto._id)}
                    disabled={loading}
                  >
                    🗑️
                  </button>
                  <button className="btn-accion btn-duplicar" title="Duplicar">
                    📄
                  </button>
                  <button className="btn-accion btn-editar" title="Editar">
                    ✏️
                  </button>
                </div>
              </div>

              {/* Info del mozo que registró el item */}
              <div className="producto-info">
                <span className="info-mozo">
                  👤 {pedidoActual.nombreMozo}
                </span>
                <span className="info-fecha">
                  {new Date(pedidoActual.fechaCreacion).toLocaleString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Botón para agregar más items */}
        <button className="btn-agregar-item">
          <span className="plus-icon">+</span>
          Add Item
        </button>

        {/* Footer con acciones */}
        <div className="detalle-footer">
          <button className="footer-btn" onClick={onClose}>
            <span className="btn-icon">💲</span>
            <span>Pagar</span>
          </button>
          
          <button className="footer-btn" onClick={marcarComoEntregado}>
            <span className="btn-icon">✓</span>
            <span>Entrega</span>
          </button>
          
          <button className="footer-btn" onClick={enviarACocina}>
            <span className="btn-icon">+</span>
            <span>Add Item</span>
          </button>
          
          <button className="footer-btn" onClick={imprimirComanda}>
            <span className="btn-icon">🖨️</span>
            <span>Imprimir</span>
          </button>
          
          <button className="footer-btn">
            <span className="btn-icon">⋮</span>
            <span>Opções</span>
          </button>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PedidoDetalle;
