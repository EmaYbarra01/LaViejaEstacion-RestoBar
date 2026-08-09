import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { formatCurrency } from '../../utils/currencyFormatter';
import './PedidoDetalle.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const PedidoDetalle = ({ pedido, productos = [], onClose, isReadOnly = false }) => {
  const [pedidoActual, setPedidoActual] = useState(pedido);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPedidoActual(pedido);
  }, [pedido]);

  const normalizarPedido = (responseData) => responseData?.pedido || responseData;

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

      setPedidoActual(normalizarPedido(response.data));
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

    const itemSeleccionado = pedidoActual.productos.find(
      (item) => (item.producto?._id || item.producto) === productoId
    );
    
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      html: `
        <div style="text-align:left;line-height:1.6">
          <p>¿Estás seguro de eliminar este producto del pedido?</p>
          <p><strong>Total actual:</strong> ${formatCurrency(pedidoActual.total) || '0,00'}</p>
          <p><strong>Monto del item:</strong> ${formatCurrency(itemSeleccionado ? itemSeleccionado.precioUnitario * itemSeleccionado.cantidad : 0)}</p>
        </div>
      `,
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

      setPedidoActual(normalizarPedido(response.data));
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

  const editarObservacionProducto = async (productoId) => {
    if (isReadOnly) return;

    const itemSeleccionado = pedidoActual.productos.find(
      (item) => (item.producto?._id || item.producto) === productoId
    );

    if (!itemSeleccionado) return;

    const { value: observacionNueva } = await Swal.fire({
      title: 'Editar pedido',
      text: 'Agregá o cambiá la observación de este plato',
      input: 'textarea',
      inputLabel: itemSeleccionado.nombre,
      inputValue: itemSeleccionado.observaciones || '',
      inputPlaceholder: 'Ej: sin cebolla, punto medio, salsa aparte...',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      inputAttributes: {
        rows: 4
      }
    });

    if (observacionNueva === undefined) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const productosActualizados = pedidoActual.productos.map((item) => {
        if ((item.producto?._id || item.producto) === productoId) {
          return {
            producto: item.producto?._id || item.producto,
            nombre: item.nombre,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            observaciones: observacionNueva.trim()
          };
        }

        return {
          producto: item.producto?._id || item.producto,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          observaciones: item.observaciones || ''
        };
      });

      const response = await axios.put(
        `${API_URL}/pedidos/${pedidoActual._id}`,
        { productos: productosActualizados },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setPedidoActual(normalizarPedido(response.data));
      await Swal.fire({
        title: 'Pedido actualizado',
        text: 'La observación se guardó correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        timer: 1500
      });
    } catch (error) {
      console.error('Error al editar la observación:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.mensaje || 'No se pudo guardar la observación',
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

      setPedidoActual(normalizarPedido(response.data));
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
      text: `Total a cobrar: ${formatCurrency(pedidoActual.total) || '0,00'}`,
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
  
  const agregarItem = async () => {
    if (isReadOnly) return;

    const productosDisponibles = productos.filter((producto) => producto.disponible !== false);

    if (productosDisponibles.length === 0) {
      Swal.fire({
        title: 'Sin productos',
        text: 'No hay productos disponibles para agregar',
        icon: 'info',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const opciones = productosDisponibles
      .map((producto) => `<option value="${producto._id}">${producto.nombre} - ${formatCurrency(Number(producto.precio || 0))}</option>`)
      .join('');

    const { value } = await Swal.fire({
      title: 'Agregar item',
      html: `
        <div style="display:grid;gap:12px;text-align:left">
          <label style="display:grid;gap:6px">
            <span>Producto</span>
            <select id="swal-producto" class="swal2-input" style="margin:0">${opciones}</select>
          </label>
          <label style="display:grid;gap:6px">
            <span>Cantidad</span>
            <input id="swal-cantidad" type="number" min="1" value="1" class="swal2-input" style="margin:0" />
          </label>
          <label style="display:grid;gap:6px">
            <span>Observaciones</span>
            <input id="swal-observaciones" type="text" class="swal2-input" style="margin:0" placeholder="Opcional" />
          </label>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        const productoId = document.getElementById('swal-producto')?.value;
        const cantidad = Number(document.getElementById('swal-cantidad')?.value || 1);
        const observaciones = document.getElementById('swal-observaciones')?.value || '';

        if (!productoId || Number.isNaN(cantidad) || cantidad < 1) {
          Swal.showValidationMessage('Selecciona un producto y una cantidad válida');
          return null;
        }

        return { productoId, cantidad, observaciones };
      }
    });

    if (!value) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const productoSeleccionado = productosDisponibles.find((producto) => producto._id === value.productoId);

      const productosActualizados = [
        ...(pedidoActual.productos || []).map((item) => ({
          producto: item.producto?._id || item.producto,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          observaciones: item.observaciones || ''
        })),
        {
          producto: productoSeleccionado._id,
          nombre: productoSeleccionado.nombre,
          cantidad: value.cantidad,
          precioUnitario: productoSeleccionado.precio,
          observaciones: value.observaciones
        }
      ];

      const response = await axios.put(
        `${API_URL}/pedidos/${pedidoActual._id}`,
        { productos: productosActualizados },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setPedidoActual(normalizarPedido(response.data));
      await Swal.fire({
        title: 'Item agregado',
        text: 'El pedido se actualizó correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        timer: 1600
      });
    } catch (error) {
      console.error('Error al agregar item:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.mensaje || 'No se pudo agregar el item',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content pedido-detalle" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="detalle-header">
          <button className="btn-back" onClick={onClose}>
            ←
          </button>
          <div className="detalle-header-titulo">
            <h2>Mesa {pedidoActual.numeroMesa || 'S/N'}</h2>
            <div className="detalle-header-meta">
              <span className={`detalle-badge estado-${String(pedidoActual.estado || '').toLowerCase().replace(/\s+/g, '-')}`}>
                {pedidoActual.estado || 'Pendiente'}
              </span>
              <span className="detalle-meta-item">👤 {pedidoActual.nombreMozo || pedidoActual.mozo?.nombre || 'Sin mozo'}</span>
              <span className="detalle-meta-item">
                📅 {pedidoActual.fechaCreacion
                  ? new Date(pedidoActual.fechaCreacion).toLocaleString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Sin fecha'}
              </span>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Resumen financiero */}
        <div className="resumen-financiero">
          <div className="resumen-item total">
            <span className="label">Total</span>
             <span className="valor">${formatCurrency(pedidoActual.total) || '0,00'}</span>
            <button className="btn-info">?</button>
          </div>
          
          {pedidoActual.descuento && pedidoActual.descuento.monto > 0 && (
            <>
              <div className="resumen-item">
                <span className="label">Cargo por servicio</span>
                <span className="valor">${formatCurrency(pedidoActual.descuento.monto)}</span>
              </div>
              <div className="resumen-item">
                <span className="label">{pedidoActual.descuento.motivo || 'Descuento'}</span>
                <span className="valor">${formatCurrency(pedidoActual.descuento.monto)}</span>
              </div>
            </>
          )}
        </div>

        {/* Lista de productos */}
        <div className="productos-lista">
          {pedidoActual.productos && pedidoActual.productos.map((item, index) => (
            <div className="producto-item producto-item-detalle" key={item.producto?._id || index}>
              <div className="producto-header">
                <h3 className="producto-nombre">{item.nombre}</h3>
                <span className="producto-precio">
                  ${formatCurrency(item.precioUnitario * item.cantidad)}
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
                  <button
                    className="btn-accion btn-editar-observacion"
                    title="Editar pedido"
                    onClick={() => editarObservacionProducto(item.producto._id)}
                    disabled={isReadOnly || loading}
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-accion btn-eliminar" 
                    title="Eliminar"
                    onClick={() => eliminarProducto(item.producto._id)}
                    disabled={isReadOnly || loading}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

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
          
          <button className="footer-btn" onClick={agregarItem} disabled={isReadOnly || loading}>
            <span className="btn-icon">+</span>
            <span>Agregar Item</span>
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
