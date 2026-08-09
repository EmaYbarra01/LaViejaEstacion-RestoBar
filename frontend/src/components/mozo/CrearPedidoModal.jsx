import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import useUserStore from '../../store/useUserStore';
import useSocket from '../../hooks/useSocket';
import { formatCurrency } from '../../utils/currencyFormatter';
import './CrearPedidoModal.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const BACKEND_URL = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const CrearPedidoModal = ({ mesas, onClose }) => {
  const { user } = useUserStore();
  const { on, off } = useSocket('mozos'); // Conectar a la sala 'mozos'
  const [paso, setPaso] = useState(1); // 1: Mesa, 2: Productos, 3: Confirmación
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Comidas');
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [carritoMinimizado, setCarritoMinimizado] = useState(false);

  useEffect(() => {
    console.log('Mesas recibidas:', mesas);
    cargarProductos();
  }, [mesas]);

  // Escuchar actualizaciones de productos en tiempo real
  useEffect(() => {
    const handleProductosActualizados = (data) => {
      console.log('🔄 Productos actualizados en modal:', data);
      setProductos(prevProductos => {
        const productosMap = new Map(prevProductos.map(p => [p._id, p]));
        data.productos.forEach(productoActualizado => {
          productosMap.set(productoActualizado._id, productoActualizado);
        });
        return Array.from(productosMap.values());
      });
    };

    on('productos-actualizados', handleProductosActualizados);

    return () => {
      off('productos-actualizados', handleProductosActualizados);
    };
  }, [on, off]);

  const cargarProductos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/productos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProductos(response.data);
      
      // Extraer categorías únicas (sin 'Todas')
      const cats = [...new Set(response.data.map(p => p.categoria))];
      setCategorias(cats);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const handleSeleccionarMesa = (mesa) => {
    if (mesa.estado === 'Ocupada') {
      Swal.fire({
        title: 'Mesa ocupada',
        text: 'Esta mesa ya está ocupada',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    setMesaSeleccionada(mesa);
    setPaso(2);
  };

  const handleAgregarProducto = (producto) => {
    const existe = productosSeleccionados.find(p => p._id === producto._id);
    
    if (existe) {
      setProductosSeleccionados(
        productosSeleccionados.map(p =>
          p._id === producto._id
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        )
      );
    } else {
      setProductosSeleccionados([
        ...productosSeleccionados,
        { ...producto, cantidad: 1, observaciones: '' }
      ]);
    }
  };

  const handleCambiarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      handleEliminarProducto(productoId);
      return;
    }
    
    setProductosSeleccionados(
      productosSeleccionados.map(p =>
        p._id === productoId
          ? { ...p, cantidad: nuevaCantidad }
          : p
      )
    );
  };

  const handleEliminarProducto = (productoId) => {
    setProductosSeleccionados(
      productosSeleccionados.filter(p => p._id !== productoId)
    );
  };

  const handleAgregarObservacion = (productoId, observacion) => {
    setProductosSeleccionados(
      productosSeleccionados.map(p =>
        p._id === productoId
          ? { ...p, observaciones: observacion }
          : p
      )
    );
  };

  const handleEditarObservacion = async (productoId) => {
    const item = productosSeleccionados.find((producto) => producto._id === productoId);

    if (!item) return;

    const { value: observacionNueva } = await Swal.fire({
      title: 'Editar pedido',
      text: `Agregar observación para ${item.nombre}`,
      input: 'textarea',
      inputValue: item.observaciones || '',
      inputPlaceholder: 'Ej: sin cebolla, bien cocido, salsa aparte...',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1f4aa8',
      inputAttributes: {
        rows: 4
      }
    });

    if (observacionNueva === undefined) return;

    handleAgregarObservacion(productoId, observacionNueva.trim());
  };

  // Función para construir la URL completa de la imagen
  const getImageUrl = (imagenUrl) => {
    if (!imagenUrl) return null;
    if (imagenUrl.startsWith('http://') || imagenUrl.startsWith('https://')) {
      return imagenUrl;
    }
    return `${BACKEND_URL}${imagenUrl}`;
  };

  const calcularTotal = () => {
    return productosSeleccionados.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
  };

  const handleCrearPedido = async () => {
    if (!mesaSeleccionada) {
      Swal.fire({
        title: 'Mesa requerida',
        text: 'Selecciona una mesa',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (productosSeleccionados.length === 0) {
      Swal.fire({
        title: 'Productos requeridos',
        text: 'Agrega al menos un producto',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (!user || !user.id) {
      Swal.fire({
        title: 'Error de autenticación',
        text: 'Usuario no autenticado',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const pedidoData = {
        mesa: mesaSeleccionada._id,
        mozo: user.id,
        productos: productosSeleccionados.map(p => ({
          producto: p._id,
          nombre: p.nombre,
          cantidad: p.cantidad,
          precioUnitario: p.precio,
          observaciones: p.observaciones || ''
        })),
        observacionesGenerales: ''
      };

      await axios.post(`${API_URL}/pedidos`, pedidoData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await Swal.fire({
        title: '¡Pedido Creado!',
        text: 'El pedido ha sido enviado a cocina exitosamente',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#28a745'
      });
      
      // Los productos y mesas se actualizarán automáticamente vía Socket.io
      onClose();
    } catch (error) {
      console.error('Error al crear pedido:', error);
      
      // Mensaje de error más descriptivo
      let errorMessage = 'Error al crear el pedido';
      if (error.response) {
        // El servidor respondió con un código de error
        errorMessage = error.response.data?.msg || error.response.data?.message || `Error: ${error.response.status}`;
        if (error.response.status === 404) {
          errorMessage = 'Ruta no encontrada. Verifica que el backend esté corriendo en http://localhost:4000';
        } else if (error.response.status === 401) {
          errorMessage = 'No autorizado. Tu sesión puede haber expirado. Inicia sesión nuevamente.';
        }
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
      }
      
      Swal.fire({
        title: 'Error al crear pedido',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos.filter(p => {
    const estaDisponible = p.disponible !== false && p.stock > 0;
    
    // Si hay búsqueda, ignorar categoría y buscar en todos los productos
    if (busqueda !== '') {
      const cumpleBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                             (p.descripcion && p.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
      return cumpleBusqueda && estaDisponible;
    }
    
    // Si no hay búsqueda, filtrar solo por categoría
    const cumpleCategoria = p.categoria === categoriaSeleccionada;
    return cumpleCategoria && estaDisponible;
  });

  return (
    <>
      {/* Modal IZQUIERDO: Seleccionar Productos */}
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content crear-pedido-modal modal-izquierdo" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <button className="btn-back" onClick={() => paso > 1 ? setPaso(paso - 1) : onClose()}>
              ←
            </button>
            <h2>
              {paso === 1 && 'Seleccionar Mesa'}
              {paso === 2 && 'Seleccionar Productos'}
              {paso === 3 && 'Confirmar Pedido'}
            </h2>
            <button className="btn-close" onClick={onClose}>✕</button>
          </div>

          {/* Paso 1: Seleccionar Mesa */}
          {paso === 1 && (
            <div className="modal-body">
              <div className="mesas-grid">
                {mesas.map(mesa => (
                  <div
                    key={mesa._id}
                    className={`mesa-card ${mesa.estado === 'Ocupada' ? 'ocupada' : ''}`}
                    onClick={() => handleSeleccionarMesa(mesa)}
                  >
                    <div className="mesa-numero">Mesa {mesa.numero}</div>
                    <div className="mesa-info">
                      <span className="mesa-capacidad">👥 {mesa.capacidad} personas</span>
                      <span className={`mesa-estado estado-${mesa.estado.toLowerCase()}`}>
                        {mesa.estado}
                      </span>
                    </div>
                    <div className="mesa-ubicacion">{mesa.ubicacion}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paso 2: Seleccionar Productos */}
          {paso === 2 && (
            <>
              <div className="modal-toolbar">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar productos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <div className="categorias-tabs">
                {categorias.map(cat => (
                  <button
                    key={cat}
                    className={`categoria-tab ${categoriaSeleccionada === cat ? 'active' : ''}`}
                    onClick={() => setCategoriaSeleccionada(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="modal-body">
                <div className="productos-grid">
                  {productosFiltrados.map(producto => (
                    <div
                      key={producto._id}
                      className="producto-card"
                      onClick={() => handleAgregarProducto(producto)}
                    >
                      {producto.imagenUrl && (
                        <div className="producto-imagen">
                          <img 
                            src={getImageUrl(producto.imagenUrl)} 
                            alt={producto.nombre}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="producto-info">
                        <h4>{producto.nombre}</h4>
                        <p className="producto-descripcion">{producto.descripcion}</p>
                        <div className="producto-footer">
                          <span className="producto-precio">${formatCurrency(producto.precio)}</span>
                          <span className="producto-stock">Stock: {producto.stock}</span>
                          {producto.stock < 10 && producto.stock > 0 && (
                            <span className="producto-stock-bajo">⚠️ Stock bajo</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Loading */}
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Creando pedido...</p>
            </div>
          )}
        </div>

        {/* Modal DERECHO: Productos Seleccionados (SEPARADO) */}
        {paso === 2 && (
          <div className="modal-content crear-pedido-modal modal-derecho" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Productos seleccionados ({productosSeleccionados.length})</h2>
            </div>

            <div className="modal-body">
              {/* Información del pedido */}
              <div className="info-pedido">
                <div className="info-item">
                  <span className="info-label">👤 Mozo:</span>
                  <span className="info-valor">{user?.name || 'No identificado'}</span>
                </div>
                {mesaSeleccionada && (
                  <div className="info-item">
                    <span className="info-label">🪑 Mesa:</span>
                    <span className="info-valor">Mesa {mesaSeleccionada.numero}</span>
                  </div>
                )}
              </div>

              {productosSeleccionados.length > 0 ? (
                <>
                  <div className="carrito-items">
                    {productosSeleccionados.map(item => (
                      <div key={item._id} className="carrito-item">
                        <div className="item-info">
                          <span className="item-nombre">{item.nombre}</span>
                          <span className="item-precio">
                            ${formatCurrency(item.precio * item.cantidad)}
                          </span>
                        </div>

                        {item.observaciones && (
                          <div className="item-observacion">
                            <span>Observación:</span>
                            <p>{item.observaciones}</p>
                          </div>
                        )}
                        
                        <div className="item-controles">
                          <button
                            className="btn-cantidad-mini"
                            onClick={() => handleCambiarCantidad(item._id, item.cantidad - 1)}
                          >
                            −
                          </button>
                          <span className="cantidad-mini">{item.cantidad}</span>
                          <button
                            className="btn-cantidad-mini"
                            onClick={() => handleCambiarCantidad(item._id, item.cantidad + 1)}
                          >
                            +
                          </button>
                          <button
                            className="btn-editar-mini"
                            onClick={() => handleEditarObservacion(item._id)}
                            title="Editar pedido"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-eliminar-mini"
                            onClick={() => handleEliminarProducto(item._id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="carrito-total">
                    <span>Total:</span>
                    <span className="total-valor">${formatCurrency(calcularTotal())}</span>
                  </div>

                  <button className="btn-continuar" onClick={handleCrearPedido}>
                    Crear Pedido y Enviar a Cocina
                  </button>
                </>
              ) : (
                <div className="carrito-vacio">
                  <p>🛒 Aún no has seleccionado productos</p>
                  <p className="texto-ayuda">Haz clic en los productos de la izquierda para agregarlos</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CrearPedidoModal;
