/**
 * MenuDigital.jsx
 * HU1 - Escanear menú digital
 * HU2 - Ver fotos, descripción y precio
 * Página pública del menú accesible mediante código QR
 * No requiere autenticación
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  FaSync
} from 'react-icons/fa';
import useMenuStore from '../store/menuStore';
import ProductoCard from '../components/menu/ProductoCard';
import './MenuDigital.css';

const MenuDigital = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mesaNumero = searchParams.get('mesa');

  // Zustand store
  const {
    menu,
    categorias,
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
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [vistaActiva, setVistaActiva] = useState('categorias'); // 'categorias' o 'grid'

  useEffect(() => {
    // Cargar menú al montar componente
    fetchMenu();
  }, [fetchMenu]);

  useEffect(() => {
    // Expandir primera categoría cuando se carga el menú
    if (categorias.length > 0 && !expandedCategory) {
      setExpandedCategory(categorias[0]);
      setCategoriaActiva(categorias[0]);
    }
  }, [categorias, expandedCategory, setCategoriaActiva]);

  const toggleCategory = (categoria) => {
    const newCategory = expandedCategory === categoria ? null : categoria;
    setExpandedCategory(newCategory);
    if (newCategory) {
      setCategoriaActiva(newCategory);
    }
  };

  const handleRefresh = async () => {
    await refreshMenu();
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
      {vistaActiva === 'grid' && categorias.length > 0 && (
        <div className="category-tabs">
          <div className="tabs-scroll">
            {categorias.map((categoria) => (
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
            Object.entries(menu).map(([categoria, productos]) => (
              <div key={categoria} className="menu-category">
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
                          onSelect={(prod) => console.log('Producto seleccionado:', prod)}
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
                {menu[categoriaActiva]?.map((producto) => (
                  <ProductoCard
                    key={producto.id}
                    producto={producto}
                    onSelect={(prod) => console.log('Producto seleccionado:', prod)}
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
