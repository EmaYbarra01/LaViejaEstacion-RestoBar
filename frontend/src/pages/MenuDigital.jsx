/**
 * MenuDigital.jsx
 * HU1 - Escanear menú digital
 * HU2 - Ver fotos, descripción y precio
 * Página pública del menú accesible mediante código QR y desde "Pedir ahora"
 * No requiere autenticación
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  FaUtensils,
  FaGlassMartiniAlt,
  FaIceCream,
  FaBreadSlice,
  FaChevronDown,
  FaClock,
  FaCheckCircle,
  FaSync,
  FaShoppingCart,
  FaTimes,
  FaMinus,
  FaPlus,
  FaMoon,
  FaSun,
  FaArrowUp
} from 'react-icons/fa';
import useMenuStore from '../store/menuStore';
import ProductoCard from '../components/menu/ProductoCard';
import { formatClockDate, formatClockTime } from '../utils/clockFormat';
import { getScrollTop, scrollPageTo } from '../utils/pageScroll';
import './MenuPage.css';
import './MenuDigital.css';

const navigation = [
  ['Inicio', '/'],
  ['Menú', '/menu'],
  ['Reservas', '/reservas'],
  ['Servicios', '/servicios'],
  ['Quiénes somos', '/quienes-somos'],
  ['Equipo de desarrollo', '/equipo-desarrollo'],
  ['Acceso empleados', '/login']
];

const categoryIcons = {
  'Comidas': FaUtensils,
  'Bebidas': FaGlassMartiniAlt,
  'Bebidas Alcohólicas': FaGlassMartiniAlt,
  'Postres': FaIceCream,
  'Entradas': FaBreadSlice,
  'Guarniciones': FaBreadSlice
};

function AccessibilityIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="4.5" r="2" />
      <path d="M5.5 8.5h13M12 7v6.5M12 10.5 7.5 18M12 10.5 16.5 18M8.5 13.5 5 11M15.5 13.5 19 11" />
    </svg>
  );
}

const MenuDigital = ({ isNightMode, onToggleNightMode }) => {
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
  const [indicaciones, setIndicaciones] = useState('');
  const [pedidoAbierto, setPedidoAbierto] = useState(false);
  const [checkoutAbierto, setCheckoutAbierto] = useState(false);
  const [enviandoPedido, setEnviandoPedido] = useState(false);
  const [pedidoEnviado, setPedidoEnviado] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showGoTop, setShowGoTop] = useState(false);
  const [goTopBusy, setGoTopBusy] = useState(false);
  const busyTimer = useRef(null);
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
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mismo comportamiento que el botón "volver arriba" de la página del menú
  useEffect(() => {
    const onScroll = () => {
      setShowGoTop(getScrollTop() > 0);
      setGoTopBusy(true);
      clearTimeout(busyTimer.current);
      busyTimer.current = setTimeout(() => setGoTopBusy(false), 150);
    };
    onScroll();
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true });
      clearTimeout(busyTimer.current);
    };
  }, []);

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
      setTimeout(() => {
        const element = document.getElementById(`accordion-${categoria.toLowerCase().replace(/\s+/g, '-')}`);
        if (element) {
          scrollPageTo(element.getBoundingClientRect().top + getScrollTop() - 30);
        }
      }, 100);
    }
  };

  const handleRefresh = async () => {
    await refreshMenu();
  };

  const handleSelectProduct = (producto) => {
    if (producto.disponible === false || Number(producto.stock || 0) <= 0) {
      return;
    }

    setProductoSeleccionado(producto);
    setCantidad(1);
    setIndicaciones('');
  };

  const handleAddToOrder = (event) => {
    event.preventDefault();

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

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

  const renderCategoryIcon = (categoria, className) => {
    const Icon = categoryIcons[categoria] || FaUtensils;
    return <Icon className={className} />;
  };

  const renderProductos = (productos) => (
    <div className="mv-grid">
      {productos.map((producto) => (
        <ProductoCard
          key={producto.id}
          producto={producto}
          onSelect={handleSelectProduct}
        />
      ))}
    </div>
  );

  const renderContenido = () => {
    if (loading) {
      return <p className="mv-loading">Cargando menú...</p>;
    }

    if (error) {
      return (
        <div className="pd-state">
          <h2>Error al cargar el menú</h2>
          <p>{error}</p>
          <div className="pd-state-actions">
            <button type="button" onClick={handleRefresh} className="pd-btn"><FaSync /> Reintentar</button>
            <button type="button" onClick={clearError} className="pd-btn pd-btn-ghost">Limpiar error</button>
          </div>
        </div>
      );
    }

    if (!menu || Object.keys(menu).length === 0) {
      return (
        <div className="pd-state">
          <h2>No hay productos disponibles</h2>
          <p>El menú está siendo actualizado. Por favor, intente nuevamente en unos momentos.</p>
          <div className="pd-state-actions">
            <button type="button" onClick={handleRefresh} className="pd-btn"><FaSync /> Reintentar</button>
          </div>
        </div>
      );
    }

    if (vistaActiva === 'categorias') {
      return Object.entries(menuPrincipal).map(([categoria, productos]) => (
        <div
          key={categoria}
          className="mv-accordion"
          id={`accordion-${categoria.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <button
            type="button"
            className={`mv-acc-header ${expandedCategory === categoria ? 'active' : ''}`}
            onClick={() => toggleCategory(categoria)}
            aria-expanded={expandedCategory === categoria}
          >
            <span className="mv-acc-title">
              {renderCategoryIcon(categoria, 'mv-acc-icon')}
              <span>{categoria}</span>
              <span className="pd-count">({productos.length})</span>
            </span>
            <FaChevronDown className={`mv-chevron ${expandedCategory === categoria ? 'rotated' : ''}`} />
          </button>
          {expandedCategory === categoria && (
            <div className="mv-acc-content">{renderProductos(productos)}</div>
          )}
        </div>
      ));
    }

    return renderProductos(menuPrincipal[categoriaActiva] || []);
  };

  return (
    <div className={`mv-page pd-page ${isNightMode ? 'mv-night' : 'mv-day'}`}>
      <div className="mv-background" />
      <div className="mv-brand">
        <Link to="/">
          <img src="/logo.svg" alt="La Vieja Estación" />
          <span>Ciudad de Trancas</span>
        </Link>
      </div>
      <nav className="mv-navigation" aria-label="Navegación principal">
        {navigation.map(([label, path]) => (
          <Link key={path} to={path} className={path === '/menu' ? 'active' : ''}>{label}</Link>
        ))}
      </nav>
      <div className="mv-datetime" aria-label="Fecha y hora">
        <div>{formatClockDate(currentDateTime)}</div>
        <strong>{formatClockTime(currentDateTime)}</strong>
      </div>

      <main className="mv-main">
        <div className="mv-container">
          <div className="mv-header pd-header">
            <h1>La Vieja Estación</h1>
            <div className="mv-divider"></div>
            <p>Sabores que cuentan historias</p>
            {mesaNumero && <span className="pd-mesa">Mesa {mesaNumero}</span>}
            <div className="pd-info">
              <span><FaCheckCircle /> Menú actualizado</span>
              <span>
                <FaClock />
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

          <div className="pd-toolbar">
            <button type="button" className="pd-btn" onClick={handleRefresh} disabled={loading}>
              <FaSync className={loading ? 'pd-spin' : ''} />
              <span>Actualizar</span>
            </button>
            <button
              type="button"
              className="pd-btn"
              onClick={() => setPedidoAbierto(true)}
              aria-label="Abrir mi pedido"
            >
              <FaShoppingCart />
              <span>Mi pedido</span>
              {pedido.length > 0 && <strong className="pd-btn-count">{pedido.length}</strong>}
            </button>
            <div className="pd-toggle">
              <button type="button" className={vistaActiva === 'categorias' ? 'active' : ''} onClick={() => setVistaActiva('categorias')}>
                Categorías
              </button>
              <button type="button" className={vistaActiva === 'grid' ? 'active' : ''} onClick={() => setVistaActiva('grid')}>
                Todo
              </button>
            </div>
          </div>

          {vistaActiva === 'grid' && (
            <div className="pd-tabs">
              {Object.keys(menuPrincipal).map((categoria) => (
                <button
                  type="button"
                  key={categoria}
                  className={`pd-tab ${categoriaActiva === categoria ? 'active' : ''}`}
                  onClick={() => setCategoriaActiva(categoria)}
                >
                  {renderCategoryIcon(categoria)}
                  <span>{categoria}</span>
                </button>
              ))}
            </div>
          )}

          {renderContenido()}

          <div className="pd-ready">¿Listo para ordenar? Llamá al mozo o acercate a la barra.</div>
        </div>
      </main>

      {productoSeleccionado && (
        <div className="pd-backdrop" onClick={() => setProductoSeleccionado(null)}>
          <form className="pd-modal" onSubmit={handleAddToOrder} onClick={(event) => event.stopPropagation()}>
            <button type="button" className="pd-close" onClick={() => setProductoSeleccionado(null)} aria-label="Cerrar selección">
              <FaTimes />
            </button>
            <span className="pd-kicker">Personalizá tu pedido</span>
            <h2>{productoSeleccionado.nombre}</h2>
            <p className="pd-price">{formatPrice(productoSeleccionado.precio)}</p>

            <label className="pd-label" htmlFor="quantity">¿Cuántos querés?</label>
            <div className="pd-qty">
              <button type="button" onClick={() => setCantidad((value) => Math.max(1, value - 1))} aria-label="Disminuir cantidad">
                <FaMinus />
              </button>
              <output id="quantity">{cantidad}</output>
              <button type="button" onClick={() => setCantidad((value) => value + 1)} aria-label="Aumentar cantidad">
                <FaPlus />
              </button>
            </div>

            <label className="pd-label" htmlFor="indicaciones">¿Cómo lo querés?</label>
            <textarea
              id="indicaciones"
              className="pd-field"
              value={indicaciones}
              onChange={(event) => setIndicaciones(event.target.value)}
              placeholder="Ej.: sin sal, bien cocido, sin hielo..."
              maxLength={250}
              rows={4}
            />
            <button type="submit" className="pd-btn pd-btn-full">Agregar al pedido</button>
          </form>
        </div>
      )}

      {pedidoAbierto && (
        <div className="pd-backdrop pd-backdrop-side" onClick={() => setPedidoAbierto(false)}>
          <aside className="pd-side" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="pd-close" onClick={() => setPedidoAbierto(false)} aria-label="Cerrar pedido">
              <FaTimes />
            </button>
            <span className="pd-kicker">Tu selección</span>
            <h2>Mi pedido</h2>

            {pedido.length === 0 ? (
              <div className="pd-empty">
                <FaShoppingCart />
                <p>Tu pedido está vacío.</p>
                <span>Elegí un producto del menú para comenzar.</span>
              </div>
            ) : (
              <>
                <div className="pd-items">
                  {pedido.map((item) => (
                    <div className="pd-item" key={item.id}>
                      <div>
                        <h3>{item.cantidad} x {item.nombre}</h3>
                        {item.indicaciones && <p>“{item.indicaciones}”</p>}
                      </div>
                      <div className="pd-item-actions">
                        <strong>{formatOrderPrice(item.precio * item.cantidad)}</strong>
                        <button type="button" onClick={() => removeFromOrder(item.id)}>Quitar</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pd-total">
                  <span>Total estimado</span>
                  <strong>{formatOrderPrice(totalPedido)}</strong>
                </div>
                <p className="pd-help">Revisá los datos y enviá el pedido directamente al restaurante.</p>
                <button type="button" className="pd-btn pd-btn-full" onClick={() => setCheckoutAbierto(true)}>
                  Enviar pedido
                </button>
              </>
            )}
          </aside>
        </div>
      )}

      {checkoutAbierto && (
        <div className="pd-backdrop" onClick={() => setCheckoutAbierto(false)}>
          <form className="pd-modal pd-modal-wide" onSubmit={handleCheckoutSubmit} onClick={(event) => event.stopPropagation()}>
            <button type="button" className="pd-close" onClick={() => setCheckoutAbierto(false)} aria-label="Cerrar datos del pedido">
              <FaTimes />
            </button>
            <span className="pd-kicker">Enviar pedido</span>
            <h2>¿Dónde lo recibís?</h2>
            <div className="pd-delivery">
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
            <label className="pd-label">Nombre<input className="pd-field" required value={datosEntrega.nombre} onChange={(event) => setDatosEntrega({ ...datosEntrega, nombre: event.target.value })} /></label>
            <label className="pd-label">Teléfono / WhatsApp<input className="pd-field" required value={datosEntrega.telefono} onChange={(event) => setDatosEntrega({ ...datosEntrega, telefono: event.target.value })} /></label>
            <label className="pd-label">Email<input className="pd-field" required type="email" value={datosEntrega.email} onChange={(event) => setDatosEntrega({ ...datosEntrega, email: event.target.value })} /></label>
            {datosEntrega.tipoPedido === 'Domicilio' && (
              <>
                <label className="pd-label">Dirección<input className="pd-field" required value={datosEntrega.direccion} onChange={(event) => setDatosEntrega({ ...datosEntrega, direccion: event.target.value })} /></label>
                <label className="pd-label">Referencia<input className="pd-field" value={datosEntrega.referencia} onChange={(event) => setDatosEntrega({ ...datosEntrega, referencia: event.target.value })} /></label>
              </>
            )}
            {datosEntrega.tipoPedido === 'Local' && (
              <label className="pd-label">Número de mesa
                <input
                  className="pd-field"
                  required
                  type="number"
                  min="1"
                  value={datosEntrega.numeroMesa}
                  onChange={(event) => setDatosEntrega({ ...datosEntrega, numeroMesa: event.target.value })}
                  placeholder="Ej.: 4"
                />
              </label>
            )}
            <label className="pd-label">Forma de pago
              <select className="pd-field" value={datosEntrega.metodoPago} onChange={(event) => setDatosEntrega({ ...datosEntrega, metodoPago: event.target.value })}>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </label>
            <button disabled={enviandoPedido} type="submit" className="pd-btn pd-btn-full">
              {enviandoPedido ? 'Enviando...' : 'Confirmar pedido'}
            </button>
          </form>
        </div>
      )}

      {pedidoEnviado && (
        <div className="pd-backdrop">
          <div className="pd-modal pd-success">
            <span className="pd-kicker">¡Pedido recibido!</span>
            <h2>Pedido {pedidoEnviado.pedido.numeroPedido}</h2>
            <p>El restaurante ya recibió tu pedido y comenzará a prepararlo.</p>
            {pedidoEnviado.whatsappUrl && (
              <a className="pd-btn pd-btn-full" href={pedidoEnviado.whatsappUrl} target="_blank" rel="noreferrer">
                Avisar por WhatsApp
              </a>
            )}
            <button type="button" className="pd-btn pd-btn-ghost pd-btn-full" onClick={() => setPedidoEnviado(null)}>Cerrar</button>
          </div>
        </div>
      )}

      <p className="mv-copyright">© 2026 La Vieja Estación. Todos los derechos reservados.</p>

      <button
        type="button"
        className={`mv-go-top ${showGoTop ? '' : 'hidden'} ${goTopBusy ? 'busy' : ''}`}
        onClick={() => scrollPageTo(0)}
        aria-label="Volver arriba"
        title="Volver arriba"
      >
        <FaArrowUp />
        <span className="mv-go-top-spinner" />
      </button>
      <div className="mv-actions">
        <button type="button" className="mv-round mv-moon" onClick={onToggleNightMode} aria-label="Modo nocturno" title="Modo nocturno">
          {isNightMode ? <FaSun /> : <FaMoon />}
        </button>
        <button type="button" className="mv-round" aria-label="Accesibilidad">
          <AccessibilityIcon />
        </button>
      </div>
    </div>
  );
};

export default MenuDigital;
