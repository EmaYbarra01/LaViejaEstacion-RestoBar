import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHamburger, FaCocktail, FaIceCream, FaArrowLeft, FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './MenuPage.css';

const MenuPage = () => {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCategory, setExpandedCategory] = useState('comida');
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

    useEffect(() => {
        fetchProductos();
    }, []);

    const fetchProductos = async () => {
        try {
            const response = await axios.get(`${API_URL}/menu`);
            console.log('Productos cargados desde BD:', response.data);
            
            // El backend devuelve un array simple de productos
            if (Array.isArray(response.data)) {
                setProductos(response.data);
            } else {
                setProductos([]);
                console.warn('La respuesta no es un array:', response.data);
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            console.error('Detalles del error:', error.response?.data || error.message);
            setLoading(false);
        }
    };
    
    // Función para construir la URL completa de la imagen
    const getImageUrl = (imagenUrl) => {
        if (!imagenUrl) return null;
        // Si la URL ya es completa (http/https), devolverla tal cual
        if (imagenUrl.startsWith('http://') || imagenUrl.startsWith('https://')) {
            return imagenUrl;
        }
        // Si es una ruta relativa, agregar la URL del backend
        return `${BACKEND_URL}${imagenUrl}`;
    };

    const categorizeProducts = () => {
        console.log('Total productos:', productos.length);
        console.log('Productos:', productos);
        
        const comidas = productos.filter(p => 
            p.categoria === 'Comidas'
        );
        const bebidas = productos.filter(p => 
            p.categoria === 'Bebidas' || 
            p.categoria === 'Bebidas Alcohólicas'
        );
        const postres = productos.filter(p => 
            p.categoria === 'Postres'
        );

        console.log('Comidas:', comidas.length);
        console.log('Bebidas:', bebidas.length);
        console.log('Postres:', postres.length);

        return { 
            comidas,
            bebidas,
            postres
        };
    };

    const { comidas, bebidas, postres } = categorizeProducts();

    const toggleCategory = (category) => {
        if (expandedCategory === category) {
            // Si ya está expandida, colapsarla
            setExpandedCategory(null);
        } else {
            // Expandir nueva categoría
            setExpandedCategory(category);
            // Scroll suave hacia la categoría después de un pequeño delay
            setTimeout(() => {
                const element = document.getElementById(`accordion-${category}`);
                if (element) {
                    const headerOffset = 100; // Offset para header fijo
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    };

    if (loading) {
        return (
            <div className="menu-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h2 style={{ color: '#ffc107', fontSize: '2rem' }}>Cargando menú...</h2>
            </div>
        );
    }

    return (
        <div className="menu-page">
            <div className="menu-header">
                <h1>Nuestro Menú</h1>
                <div className="menu-divider"></div>
                <p>La Vieja Estación - Sabores que cuentan historias</p>
            </div>

            <div className="menu-container">
                {/* Acordeones de Categorías */}
                <div className="menu-accordions">
                    {/* Comidas */}
                    <div className="accordion-item" id="accordion-comida">
                        <div 
                            className={`accordion-header ${expandedCategory === 'comida' ? 'active' : ''}`}
                            onClick={() => toggleCategory('comida')}
                        >
                            <div className="accordion-title">
                                <FaHamburger className="accordion-icon" />
                                <span>Comidas</span>
                            </div>
                            <FaChevronDown className={`chevron ${expandedCategory === 'comida' ? 'rotated' : ''}`} />
                        </div>
                        <AnimatePresence>
                        {expandedCategory === 'comida' && (
                            <motion.div 
                                className="accordion-content"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="menu-grid">
                                    {comidas.map((item, index) => (
                                        <motion.div 
                                            key={item._id} 
                                            className="menu-card"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ 
                                                y: -8, 
                                                boxShadow: "0 15px 40px rgba(255, 193, 7, 0.4)" 
                                            }}
                                        >
                                            {item.imagenUrl && (
                                                <div className="card-image">
                                                    <img 
                                                        src={getImageUrl(item.imagenUrl)} 
                                                        alt={item.nombre}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16"%3EImagen No Disponible%3C/text%3E%3C/svg%3E';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="card-header">
                                                <h3 className="card-name">{item.nombre}</h3>
                                                <span className="card-price">${item.precio?.toFixed(2)}</span>
                                            </div>
                                            {item.descripcion && (
                                                <p className="card-description">{item.descripcion}</p>
                                            )}
                                            <div className="card-footer-info">
                                                {item.disponible !== false && item.stock > 0 ? (
                                                    <span className="card-badge disponible">✓ Disponible</span>
                                                ) : (
                                                    <span className="card-badge agotado">✗ No disponible</span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>

                    {/* Bebidas */}
                    <div className="accordion-item" id="accordion-bebidas">
                        <div 
                            className={`accordion-header ${expandedCategory === 'bebidas' ? 'active' : ''}`}
                            onClick={() => toggleCategory('bebidas')}
                        >
                            <div className="accordion-title">
                                <FaCocktail className="accordion-icon" />
                                <span>Bebidas</span>
                            </div>
                            <FaChevronDown className={`chevron ${expandedCategory === 'bebidas' ? 'rotated' : ''}`} />
                        </div>
                        <AnimatePresence>
                        {expandedCategory === 'bebidas' && (
                            <motion.div 
                                className="accordion-content"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="menu-grid">
                                    {bebidas.map((item, index) => (
                                        <motion.div 
                                            key={item._id} 
                                            className="menu-card"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ 
                                                y: -8, 
                                                boxShadow: "0 15px 40px rgba(255, 193, 7, 0.4)" 
                                            }}
                                        >
                                            {item.imagenUrl && (
                                                <div className="card-image">
                                                    <img 
                                                        src={getImageUrl(item.imagenUrl)} 
                                                        alt={item.nombre}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16"%3EImagen No Disponible%3C/text%3E%3C/svg%3E';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="card-header">
                                                <h3 className="card-name">{item.nombre}</h3>
                                                <span className="card-price">${item.precio?.toFixed(2)}</span>
                                            </div>
                                            {item.descripcion && (
                                                <p className="card-description">{item.descripcion}</p>
                                            )}
                                            {item.categoria && (
                                                <p className="card-detail">
                                                    <strong>Tipo:</strong> {item.categoria}
                                                </p>
                                            )}
                                            <div className="card-footer-info">
                                                {item.disponible !== false && item.stock > 0 ? (
                                                    <span className="card-badge disponible">✓ Disponible</span>
                                                ) : (
                                                    <span className="card-badge agotado">✗ No disponible</span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>

                    {/* Postres */}
                    <div className="accordion-item" id="accordion-postres">
                        <div 
                            className={`accordion-header ${expandedCategory === 'postres' ? 'active' : ''}`}
                            onClick={() => toggleCategory('postres')}
                        >
                            <div className="accordion-title">
                                <FaIceCream className="accordion-icon" />
                                <span>Postres</span>
                            </div>
                            <FaChevronDown className={`chevron ${expandedCategory === 'postres' ? 'rotated' : ''}`} />
                        </div>
                        <AnimatePresence>
                        {expandedCategory === 'postres' && (
                            <motion.div 
                                className="accordion-content"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="menu-grid">
                                    {postres.map((item, index) => (
                                        <motion.div 
                                            key={item._id} 
                                            className="menu-card"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ 
                                                y: -8, 
                                                boxShadow: "0 15px 40px rgba(255, 193, 7, 0.4)" 
                                            }}
                                        >
                                            {item.imagenUrl && (
                                                <div className="card-image">
                                                    <img 
                                                        src={getImageUrl(item.imagenUrl)} 
                                                        alt={item.nombre}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16"%3EImagen No Disponible%3C/text%3E%3C/svg%3E';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="card-header">
                                                <h3 className="card-name">{item.nombre}</h3>
                                                <span className="card-price">${item.precio?.toFixed(2)}</span>
                                            </div>
                                            {item.descripcion && (
                                                <p className="card-description">{item.descripcion}</p>
                                            )}
                                            <div className="card-footer-info">
                                                {item.disponible !== false && item.stock > 0 ? (
                                                    <span className="card-badge disponible">✓ Disponible</span>
                                                ) : (
                                                    <span className="card-badge agotado">✗ No disponible</span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                </div>

                <button className="back-button" onClick={() => navigate('/')}>
                    <FaArrowLeft /> Volver al Inicio
                </button>
            </div>
        </div>
    );
};

export default MenuPage;
