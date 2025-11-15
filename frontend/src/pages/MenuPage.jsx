import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHamburger, FaCocktail, FaIceCream, FaArrowLeft, FaChevronDown } from 'react-icons/fa';
import axios from 'axios';
import './MenuPage.css';

const MenuPage = () => {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCategory, setExpandedCategory] = useState('comida');

    useEffect(() => {
        fetchProductos();
    }, []);

    const fetchProductos = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
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
        setExpandedCategory(expandedCategory === category ? null : category);
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
                    <div className="accordion-item">
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
                        {expandedCategory === 'comida' && (
                            <div className="accordion-content">
                                <div className="menu-grid">
                                    {comidas.map((item) => (
                                        <div key={item._id} className="menu-card">
                                            {item.imagenUrl && (
                                                <div className="card-image">
                                                    <img 
                                                        src={item.imagenUrl} 
                                                        alt={item.nombre}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+No+Disponible';
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
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bebidas */}
                    <div className="accordion-item">
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
                        {expandedCategory === 'bebidas' && (
                            <div className="accordion-content">
                                <div className="menu-grid">
                                    {bebidas.map((item) => (
                                        <div key={item._id} className="menu-card">
                                            {item.imagenUrl && (
                                                <div className="card-image">
                                                    <img 
                                                        src={item.imagenUrl} 
                                                        alt={item.nombre}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+No+Disponible';
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
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Postres */}
                    <div className="accordion-item">
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
                        {expandedCategory === 'postres' && (
                            <div className="accordion-content">
                                <div className="menu-grid">
                                    {postres.map((item) => (
                                        <div key={item._id} className="menu-card">
                                            {item.imagenUrl && (
                                                <div className="card-image">
                                                    <img 
                                                        src={item.imagenUrl} 
                                                        alt={item.nombre}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+No+Disponible';
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
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
