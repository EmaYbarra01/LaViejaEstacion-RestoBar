import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './PedidoDetalle.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const PedidoDetalle = ({ pedido, onClose, isReadOnly = false }) => {
  const [pedidoActual, setPedidoActual] = useState(pedido);
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);

  const actualizarCantidad = async (productoId, nuevaCantidad) => {
    if (isReadOnly) return; // No permitir edición en modo solo lectura
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
      Swal.fire({
        title: 'Error',
        text: 'Error al actualizar la cantidad',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setLoading(false);
    }
  };

  const eliminarProducto = async (productoId) => {
    if (isReadOnly) return; // No permitir eliminación en modo solo lectura
    
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: '¿Estás seguro de eliminar este producto del pedido?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    });
    
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const productosActualizados = pedidoActual.productos.filter(
        item => item.producto._id !== productoId
      );

      if (productosActualizados.length === 0) {
        Swal.fire({
          title: 'No permitido',
          text: 'No se puede eliminar el último producto. Cancela el pedido completo.',
          icon: 'warning',
          confirmButtonText: 'Entendido'
        });
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
      Swal.fire({
        title: 'Error',
        text: 'Error al eliminar el producto',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (nuevoEstado) => {
    if (isReadOnly) {
      Swal.fire({
        title: 'Modo Supervisión',
        text: 'No puedes modificar pedidos en modo solo lectura',
        icon: 'info',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    
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
      Swal.fire({
        title: '¡Éxito!',
        text: `Pedido ${nuevoEstado} correctamente`,
        icon: 'success',
        confirmButtonText: 'Aceptar',
        timer: 2000
      });
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al cambiar el estado del pedido',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setLoading(false);
    }
  };

  const enviarACocina = () => cambiarEstado('En Preparación');
  
  const marcarComoEntregado = async () => {
    try {
      await cambiarEstado('Entregado');
      // Cerrar el modal después de marcar como entregado
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error al marcar como entregado:', error);
    }
  };
  
  const handlePagar = async () => {
    if (isReadOnly) {
      Swal.fire({
        title: 'Modo Supervisión',
        text: 'No puedes procesar pagos en modo solo lectura',
        icon: 'info',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    
    const result = await Swal.fire({
      title: '¿Procesar pago?',
      text: `Total a cobrar: $${pedidoActual.total?.toFixed(2) || '0.00'}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, procesar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d'
    });
    
    if (!result.isConfirmed) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Cambiar estado a Cobrado
      await axios.patch(
        `${API_URL}/pedidos/${pedidoActual._id}/estado`,
        { estado: 'Cobrado' },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      await Swal.fire({
        title: '¡Pago procesado!',
        text: 'El pedido ha sido marcado como cobrado',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        timer: 2000
      });
      
      // Cerrar el modal y recargar la lista
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error al procesar pago:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al procesar el pago',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setLoading(false);
    }
  };
  
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
            <span className="valor">${pedidoActual.total?.toFixed(2) || '0.00'}</span>
            <button className="btn-info">?</button>
          </div>
          
          {pedidoActual.descuento && pedidoActual.descuento.monto > 0 && (
            <>
              <div className="resumen-item">
                <span className="label">Cargo por servicio</span>
                <span className="valor">${pedidoActual.descuento.monto.toFixed(2)}</span>
              </div>
              <div className="resumen-item">
                <span className="label">{pedidoActual.descuento.motivo || 'Descuento'}</span>
                <span className="valor">${pedidoActual.descuento.monto.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* Lista de productos */}
        <div className="productos-lista">
          {pedidoActual.productos && pedidoActual.productos.map((item, index) => (
            <div className="producto-item">
              <div className="producto-header">
                <h3 className="producto-nombre">{item.nombre}</h3>
                <span className="producto-precio">
                  ${(item.precioUnitario * item.cantidad).toFixed(2)}
                </span>
              </div>

              {/* Variaciones si existen */}
              {item.observaciones && (
                <div className="producto-variaciones">
                  <p><strong>Observaciones:</strong></p>
                  <p>{item.observaciones}</p>
                </div>
              )}

              {/* Controles de cantidad */}
              <div className="producto-controles">
                <div className="cantidad-controles">
                  <button
                    className="btn-cantidad"
                    onClick={() => actualizarCantidad(item.producto._id, item.cantidad - 1)}
                    disabled={isReadOnly || loading || item.cantidad <= 1}
                  >
                    -1
                  </button>
                  <span className="cantidad">{item.cantidad}</span>
                  <button
                    className="btn-cantidad"
                    onClick={() => actualizarCantidad(item.producto._id, item.cantidad + 1)}
                    disabled={isReadOnly || loading}
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
                    disabled={isReadOnly || loading}
                  >
                    🗑️
                  </button>
                  <button className="btn-accion btn-duplicar" title="Duplicar" disabled={isReadOnly}>
                    📄
                  </button>
                  <button className="btn-accion btn-editar" title="Editar" disabled={isReadOnly}>
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
        {!isReadOnly && (
          <button className="btn-agregar-item">
            <span className="plus-icon">+</span>
            Agregar Item
          </button>
        )}

        {/* Footer con acciones */}
        <div className="detalle-footer">
          <button className="footer-btn" onClick={handlePagar} disabled={isReadOnly}>
            <span className="btn-icon">💲</span>
            <span>Pagar</span>
          </button>
          
          <button className="footer-btn" onClick={marcarComoEntregado} disabled={isReadOnly}>
            <span className="btn-icon">✓</span>
            <span>Entrega</span>
          </button>
          
          <button className="footer-btn" onClick={enviarACocina} disabled={isReadOnly}>
            <span className="btn-icon">+</span>
            <span>Agregar Item</span>
          </button>
          
          <button className="footer-btn" onClick={imprimirComanda}>
            <span className="btn-icon">🖨️</span>
            <span>Imprimir</span>
          </button>
          
          <button className="footer-btn" disabled={isReadOnly}>
            <span className="btn-icon">⋮</span>
            <span>Opciones</span>
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
