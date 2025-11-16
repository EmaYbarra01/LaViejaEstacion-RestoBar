import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import useUserStore from '../../store/useUserStore';
import './CrearPedidoModal.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const CrearPedidoModal = ({ mesas, onClose }) => {
  const { user } = useUserStore();
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
      alert('Esta mesa ya está ocupada');
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

  const calcularTotal = () => {
    return productosSeleccionados.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
  };

  const handleCrearPedido = async () => {
    if (!mesaSeleccionada) {
      alert('Selecciona una mesa');
      return;
    }

    if (productosSeleccionados.length === 0) {
      alert('Agrega al menos un producto');
      return;
    }

    if (!user || !user.id) {
      alert('Error: Usuario no autenticado');
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
      
      onClose();
    } catch (error) {
      console.error('Error al crear pedido:', error);
      alert('Error al crear el pedido: ' + (error.response?.data?.mensaje || error.message));
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos.filter(p => {
    const cumpleCategoria = p.categoria === categoriaSeleccionada;
    const cumpleBusqueda = busqueda === '' || 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const estaDisponible = p.disponible !== false && p.stock > 0;
    
    return cumpleCategoria && cumpleBusqueda && estaDisponible;
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
                      {producto.foto && (
                        <div className="producto-imagen">
                          <img src={producto.foto} alt={producto.nombre} />
                        </div>
                      )}
                      <div className="producto-info">
                        <h4>{producto.nombre}</h4>
                        <p className="producto-descripcion">{producto.descripcion}</p>
                        <div className="producto-footer">
                          <span className="producto-precio">${producto.precio.toFixed(2)}</span>
                          {producto.stock < 10 && (
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
                            ${(item.precio * item.cantidad).toFixed(2)}
                          </span>
                        </div>
                        
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
                    <span className="total-valor">${calcularTotal().toFixed(2)}</span>
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
