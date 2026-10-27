/**
 * MenuDigital.jsx
 * HU1 - Escanear menú digital
 * HU2 - Ver fotos, descripción y precio
 * Página pública del menú accesible mediante código QR
 * No requiere autenticación
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUtensils, 
  FaGlassMartiniAlt, 
  FaIceCream, 
  FaBreadSlice,
  FaArrowLeft,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaCheckCircle,
  FaSearch,
  FaSync,
  FaShoppingCart,
  FaTimes,
  FaMinus,
  FaPlus
} from 'react-icons/fa';
import useMenuStore from '../store/menuStore';
import ProductoCard from '../components/menu/ProductoCard';
import './MenuDigital.css';

const MenuDigital = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mesaNumero = searchParams.get('mesa');
  const productoIdInicial = searchParams.get('producto');

  // Zustand store
  const {
    menu,
    categoriaActiva,
    loading,
    error,
    ultimaActualizacion,
    fetchMenu,
    setCategoriaActiva,
    refreshMenu,
    clearError
  } = useMenuStore();

  // Estado local para búsqueda y UI
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [vistaActiva, setVistaActiva] = useState('categorias'); // 'categorias' o 'grid'
  const [pedido, setPedido] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [errorSeleccion, setErrorSeleccion] = useState('');
  const [indicaciones, setIndicaciones] = useState('');
  const [pedidoAbierto, setPedidoAbierto] = useState(false);
  const [checkoutAbierto, setCheckoutAbierto] = useState(false);
  const [enviandoPedido, setEnviandoPedido] = useState(false);
  const [pedidoEnviado, setPedidoEnviado] = useState(null);
  const categoriaInicializada = useRef(false);
  const [datosEntrega, setDatosEntrega] = useState({
    tipoPedido: mesaNumero ? 'Local' : 'Domicilio',
    numeroMesa: mesaNumero || '',
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    referencia: '',
    metodoPago: 'Efectivo'
  });
  const productosDisponibles = useMemo(() => Object.values(menu).flat(), [menu]);
  const menuPrincipal = useMemo(() => ({
    Comidas: menu.Comidas || [],
    Bebidas: [
      ...(menu.Bebidas || []),
      ...(menu['Bebidas Alcohólicas'] || [])
    ],
    Postres: menu.Postres || []
  }), [menu]);

  useEffect(() => {
    // Cargar menú al montar componente
    fetchMenu();
  }, [fetchMenu]);

  useEffect(() => {
    // Expandir primera categoría cuando se carga el menú
    if (productosDisponibles.length > 0 && !categoriaInicializada.current) {
      setExpandedCategory('Comidas');
      setCategoriaActiva('Comidas');
      categoriaInicializada.current = true;
    }
  }, [productosDisponibles, setCategoriaActiva]);

  useEffect(() => {
    if (!productoIdInicial || productoSeleccionado || productosDisponibles.length === 0) {
      return;
    }

    const productoInicial = productosDisponibles.find(
      (producto) => String(producto.id) === String(productoIdInicial)
    );
    if (productoInicial) {
      if (productoInicial.disponible !== false && Number(productoInicial.stock || 0) > 0) {
        setProductoSeleccionado(productoInicial);
        setCantidad(1);
        setIndicaciones('');
      }
    }
  }, [productoIdInicial, productoSeleccionado, productosDisponibles]);

  const toggleCategory = (categoria) => {
    if (expandedCategory === categoria) {
      // Si ya está expandida, colapsarla
      setExpandedCategory(null);
      setCategoriaActiva(null);
    } else {
      // Expandir nueva categoría
      setExpandedCategory(categoria);
      setCategoriaActiva(categoria);
    }
  };

  const handleRefresh = async () => {
    await refreshMenu();
  };

  const handleSelectProduct = (producto) => {
    if (producto.disponible === false && Number(producto?.stock ?? 0) <= 0) {
      return;
    }

    setProductoSeleccionado(producto);
    setCantidad(1);
    setErrorSeleccion('');
    setIndicaciones('');
  };

  const handleAddToOrder = (event) => {
    event.preventDefault();

    const stockDisponible = Number(productoSeleccionado?.stock || 0);
    if (
      !productoSeleccionado
      || (productoSeleccionado?.disponible === false && stockDisponible <= 0)
      || stockDisponible <= 0
      || cantidad > stockDisponible
    ) {
      setErrorSeleccion('Este producto ya no está disponible en la cantidad solicitada.');
      return;
    }

    const productoId = productoSeleccionado.id || productoSeleccionado._id;
    setPedido((pedidoActual) => [
      ...pedidoActual,
      {
        id: `${productoId}-${Date.now()}`,
        productoId,
        nombre: productoSeleccionado.nombre,
        precio: Number(productoSeleccionado.precio),
        cantidad,
        indicaciones: indicaciones.trim()
      }
    ]);
    setProductoSeleccionado(null);
    setPedidoAbierto(true);
  };

  const removeFromOrder = (itemId) => {
    setPedido((pedidoActual) => pedidoActual.filter((item) => item.id !== itemId));
  };

  const totalPedido = pedido.reduce(
    (total, item) => total + item.precio * item.cantidad,
    0
  );

  const formatOrderPrice = (price) => formatPrice(price);

  const solicitudPublica = useRef({ firma: '', clave: '' });

  const handleCheckoutSubmit = async (event) => {
    event.preventDefault();
    setEnviandoPedido(true);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const datosPedido = {
        tipoPedido: datosEntrega.tipoPedido,
        numeroMesa: datosEntrega.tipoPedido === 'Local' ? Number(datosEntrega.numeroMesa) : undefined,
        cliente: {
          nombre: datosEntrega.nombre,
          telefono: datosEntrega.telefono,
          email: datosEntrega.email,
          direccion: datosEntrega.direccion,
          referencia: datosEntrega.referencia
        },
        metodoPago: datosEntrega.metodoPago,
        productos: pedido.map((item) => ({
          producto: item.productoId,
          cantidad: item.cantidad,
          observaciones: item.indicaciones
        }))
      };
      const firma = JSON.stringify(datosPedido);
      if (solicitudPublica.current.firma !== firma) {
        // Se conserva la clave si la respuesta se pierde y se reintenta el mismo pedido.
        const clave = globalThis.crypto?.randomUUID?.() || `pedido-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        solicitudPublica.current = { firma, clave };
      }
      const response = await axios.post(`${API_URL}/pedidos/publico`, { ...datosPedido, solicitudId: solicitudPublica.current.clave });
      solicitudPublica.current = { firma: '', clave: '' };
      setPedidoEnviado(response.data);
      setPedido([]);
      setCheckoutAbierto(false);
    } catch (error) {
      window.alert(error.response?.data?.mensaje || 'No se pudo enviar el pedido. Intentá nuevamente.');
    } finally {
      setEnviandoPedido(false);
    }
  };

  const getCategoryIcon = (categoria) => {
    const iconMap = {
      'Comidas': <FaUtensils />,
      'Bebidas': <FaGlassMartiniAlt />,
      'Bebidas Alcohólicas': <FaGlassMartiniAlt />,
      'Postres': <FaIceCream />,
      'Entradas': <FaBreadSlice />,
      'Guarniciones': <FaBreadSlice />
    };
    return iconMap[categoria] || <FaUtensils />;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="menu-digital-loading">
        <div className="loading-spinner"></div>
        <h2>Cargando menú...</h2>
        <p>Un momento por favor</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-digital-error">
        <div className="error-icon">⚠️</div>
        <h2>Error al cargar el menú</h2>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={handleRefresh} className="retry-button">
            <FaSync /> Reintentar
          </button>
          <button onClick={clearError} className="clear-button">
            Limpiar error
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-digital">
      {/* Header */}
      <div className="menu-digital-header">
        <div className="header-logo">
          <FaUtensils className="logo-icon" />
        </div>
        <h1 className="header-title">La Vieja Estación</h1>
        <p className="header-subtitle">Sabores que cuentan historias</p>
        
        {mesaNumero && (
          <div className="mesa-badge">
            <span>Mesa {mesaNumero}</span>
          </div>
        )}
        
        <div className="header-info">
          <div className="info-item">
            <FaCheckCircle className="info-icon" />
            <span>Menú actualizado</span>
          </div>
          <div className="info-item">
            <FaClock className="info-icon" />
            <span>
              {ultimaActualizacion 
                ? new Date(ultimaActualizacion).toLocaleString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Cargando...'}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className="menu-toolbar">
        <div className="toolbar-content">
          <button 
            className="refresh-button" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <FaSync className={loading ? 'spinning' : ''} />
            <span>Actualizar</span>
          </button>

          <button
            className="order-button"
            onClick={() => setPedidoAbierto(true)}
            aria-label="Abrir mi pedido"
          >
            <FaShoppingCart />
            <span>Mi pedido</span>
            {pedido.length > 0 && <strong>{pedido.length}</strong>}
          </button>
          
          <div className="view-toggle">
            <button
              className={vistaActiva === 'categorias' ? 'active' : ''}
              onClick={() => setVistaActiva('categorias')}
            >
              Categorías
            </button>
            <button
              className={vistaActiva === 'grid' ? 'active' : ''}
              onClick={() => setVistaActiva('grid')}
            >
              Todo
            </button>
          </div>
        </div>
      </div>

      {/* Navegación de categorías (tabs) */}
      {vistaActiva === 'grid' && Object.keys(menuPrincipal).length > 0 && (
        <div className="category-tabs">
          <div className="tabs-scroll">
            {Object.keys(menuPrincipal).map((categoria) => (
              <button
                key={categoria}
                className={`category-tab ${categoriaActiva === categoria ? 'active' : ''}`}
                onClick={() => setCategoriaActiva(categoria)}
              >
                <span className="tab-icon">{getCategoryIcon(categoria)}</span>
                <span className="tab-text">{categoria}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contenido del menú */}
      <div className="menu-digital-content">
        {menu && Object.keys(menu).length > 0 ? (
          vistaActiva === 'categorias' ? (
            // Vista de acordeón por categorías
            Object.entries(menuPrincipal).map(([categoria, productos]) => (
              <div key={categoria} className="menu-category" id={`accordion-${categoria.toLowerCase().replace(/\s+/g, '-')}`}>
                <div
                  className={`category-header ${expandedCategory === categoria ? 'active' : ''}`}
                  onClick={() => toggleCategory(categoria)}
                >
                  <div className="category-title">
                    <span className="category-icon">
                      {getCategoryIcon(categoria)}
                    </span>
                    <h2>{categoria}</h2>
                    <span className="category-count">({productos.length})</span>
                  </div>
                  <span className="category-chevron">
                    {expandedCategory === categoria ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </div>

                {expandedCategory === categoria && (
                  <div className="category-content">
                    <div className="productos-grid">
                      {productos.map((producto) => (
                        <ProductoCard
                          key={producto.id}
                          producto={producto}
                          onSelect={handleSelectProduct}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            // Vista de grid con todos los productos de la categoría activa
            <div className="menu-grid-view">
              <h2 className="grid-category-title">
                {getCategoryIcon(categoriaActiva)}
                <span>{categoriaActiva}</span>
              </h2>
              <div className="productos-grid">
                {menuPrincipal[categoriaActiva]?.map((producto) => (
                  <ProductoCard
                    key={producto.id}
                    producto={producto}
                    onSelect={handleSelectProduct}
                  />
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="menu-empty">
            <div className="empty-icon">🍽️</div>
            <h3>No hay productos disponibles</h3>
            <p>El menú está siendo actualizado. Por favor, intente nuevamente en unos momentos.</p>
            <button onClick={handleRefresh} className="retry-button">
              <FaSync /> Reintentar
            </button>
          </div>
        )}
      </div>

      {productoSeleccionado && (
        <div className="order-modal-backdrop" onClick={() => setProductoSeleccionado(null)}>
          <form className="order-modal" onSubmit={handleAddToOrder} onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="modal-close-button"
              onClick={() => {
                setProductoSeleccionado(null);
                setErrorSeleccion('');
              }}
              aria-label="Cerrar selección"
            >
              <FaTimes />
            </button>
            <span className="order-modal-kicker">Personalizá tu pedido</span>
            <h2>{productoSeleccionado.nombre}</h2>
            <p className="order-modal-price">{formatPrice(productoSeleccionado.precio)}</p>

            <label className="quantity-label" htmlFor="quantity">
              ¿Cuántos querés?
            </label>
            <div className="quantity-control">
              <button type="button" onClick={() => setCantidad((value) => Math.max(1, value - 1))} aria-label="Disminuir cantidad">
                <FaMinus />
              </button>
              <output id="quantity">{cantidad}</output>
              <button
                type="button"
                disabled={cantidad >= Number(productoSeleccionado.stock || 0)}
                onClick={() => setCantidad((value) => Math.min(Number(productoSeleccionado.stock || 0), value + 1))}
                aria-label="Aumentar cantidad"
              >
                <FaPlus />
              </button>
            </div>
            {errorSeleccion && <p className="order-stock-error" role="alert">{errorSeleccion}</p>}

            <label htmlFor="indicaciones">¿Cómo lo querés?</label>
            <textarea
              id="indicaciones"
              value={indicaciones}
              onChange={(event) => setIndicaciones(event.target.value)}
              placeholder="Ej.: sin sal, bien cocido, sin hielo..."
              maxLength={250}
              rows={4}
            />
            <button
              type="submit"
              className="add-order-button"
              disabled={Number(productoSeleccionado?.stock ?? 0) <= 0}
            >
              {Number(productoSeleccionado?.stock ?? 0) <= 0
                ? 'No disponible para pedidos'
                : 'Agregar al pedido'}
            </button>
          </form>
        </div>
      )}

      {pedidoAbierto && (
        <div className="order-panel-backdrop" onClick={() => setPedidoAbierto(false)}>
          <aside className="order-panel" onClick={(event) => event.stopPropagation()}>
            <div className="order-panel-header">
              <div>
                <span className="order-modal-kicker">Tu selección</span>
                <h2>Mi pedido</h2>
              </div>
              <button type="button" className="modal-close-button" onClick={() => setPedidoAbierto(false)} aria-label="Cerrar pedido">
                <FaTimes />
              </button>
            </div>

            {pedido.length === 0 ? (
              <div className="empty-order">
                <FaShoppingCart />
                <p>Tu pedido está vacío.</p>
                <span>Elegí un producto del menú para comenzar.</span>
              </div>
            ) : (
              <>
                <div className="order-items">
                  {pedido.map((item) => (
                    <div className="order-item" key={item.id}>
                      <div>
                        <h3>{item.cantidad} x {item.nombre}</h3>
                        {item.indicaciones && <p>“{item.indicaciones}”</p>}
                      </div>
                      <div className="order-item-actions">
                        <strong>{formatOrderPrice(item.precio * item.cantidad)}</strong>
                        <button type="button" onClick={() => removeFromOrder(item.id)}>Quitar</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="order-total">
                  <span>Total estimado</span>
                  <strong>{formatOrderPrice(totalPedido)}</strong>
                </div>
                <p className="order-help">Revisá los datos y enviá el pedido directamente al restaurante.</p>
                <button type="button" className="add-order-button" onClick={() => setCheckoutAbierto(true)}>
                  Enviar pedido
                </button>
              </>
            )}
          </aside>
        </div>
      )}

      {checkoutAbierto && (
        <div className="order-modal-backdrop" onClick={() => setCheckoutAbierto(false)}>
          <form className="order-modal checkout-modal" onSubmit={handleCheckoutSubmit} onClick={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close-button" onClick={() => setCheckoutAbierto(false)} aria-label="Cerrar datos del pedido">
              <FaTimes />
            </button>
            <span className="order-modal-kicker">Enviar pedido</span>
            <h2>¿Dónde lo recibís?</h2>
            <div className="delivery-toggle">
              {['Local', 'Domicilio'].map((tipo) => (
                <button
                  type="button"
                  key={tipo}
                  className={datosEntrega.tipoPedido === tipo ? 'active' : ''}
                  onClick={() => setDatosEntrega((datos) => ({ ...datos, tipoPedido: tipo }))}
                >
                  {tipo}
                </button>
              ))}
            </div>
            <label>Nombre<input required value={datosEntrega.nombre} onChange={(event) => setDatosEntrega({ ...datosEntrega, nombre: event.target.value })} /></label>
            <label>Teléfono / WhatsApp<input required value={datosEntrega.telefono} onChange={(event) => setDatosEntrega({ ...datosEntrega, telefono: event.target.value })} /></label>
            <label>Email<input required type="email" value={datosEntrega.email} onChange={(event) => setDatosEntrega({ ...datosEntrega, email: event.target.value })} /></label>
            {datosEntrega.tipoPedido === 'Domicilio' && (
              <>
                <label>Dirección<input required value={datosEntrega.direccion} onChange={(event) => setDatosEntrega({ ...datosEntrega, direccion: event.target.value })} /></label>
                <label>Referencia<input value={datosEntrega.referencia} onChange={(event) => setDatosEntrega({ ...datosEntrega, referencia: event.target.value })} /></label>
              </>
            )}
            {datosEntrega.tipoPedido === 'Local' && (
              <label>Número de mesa
                <input
                  required
                  type="number"
                  min="1"
                  value={datosEntrega.numeroMesa}
                  onChange={(event) => setDatosEntrega({ ...datosEntrega, numeroMesa: event.target.value })}
                  placeholder="Ej.: 4"
                />
              </label>
            )}
            <label>Forma de pago
              <select value={datosEntrega.metodoPago} onChange={(event) => setDatosEntrega({ ...datosEntrega, metodoPago: event.target.value })}>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </label>
            <button disabled={enviandoPedido} type="submit" className="add-order-button">
              {enviandoPedido ? 'Enviando...' : 'Confirmar pedido'}
            </button>
          </form>
        </div>
      )}

      {pedidoEnviado && (
        <div className="order-modal-backdrop">
          <div className="order-modal success-order">
            <span className="order-modal-kicker">¡Pedido recibido!</span>
            <h2>Pedido {pedidoEnviado.pedido.numeroPedido}</h2>
            <p>El restaurante ya recibió tu pedido y comenzará a prepararlo.</p>
            {pedidoEnviado.whatsappUrl && (
              <a className="add-order-button whatsapp-link" href={pedidoEnviado.whatsappUrl} target="_blank" rel="noreferrer">
                Avisar por WhatsApp
              </a>
            )}
            <button type="button" className="clear-button success-close" onClick={() => setPedidoEnviado(null)}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="menu-digital-footer">
        <button onClick={() => navigate('/')} className="back-button">
          <FaArrowLeft /> Volver al inicio
        </button>
        
        <div className="footer-info">
          <p className="footer-text">
            ¿Listo para ordenar? Llamá al mozo o acercate a la barra.
          </p>
          <p className="footer-copyright">
            © 2025 La Vieja Estación. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MenuDigital;
