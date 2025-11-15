import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHamburger, FaCocktail, FaIceCream, FaArrowLeft, FaChevronDown } from 'react-icons/fa';
import axios from 'axios';
import './MenuPage.css';

// Datos de ejemplo (puedes reemplazarlos con datos de la BD)
const comidaEstatica = [
  { name: 'Hamburguesa Clásica', price: 1200, description: 'Carne de res, queso cheddar, lechuga, tomate y mayonesa.', preparation: 'Preparada con ingredientes frescos y pan artesanal.' },
  { name: 'Pizza Margarita', price: 1500, description: 'Salsa de tomate, mozzarella fresca y albahaca.', preparation: 'Horneada en horno de piedra para un sabor auténtico.' },
  { name: 'Ensalada César', price: 900, description: 'Lechuga romana, crutones, queso parmesano y aderezo César.', preparation: 'Aderezo casero con un toque de anchoas.' },
  { name: 'Milanesa Napolitana', price: 1700, description: 'Carne empanada, salsa de tomate, jamón y queso.', preparation: 'Acompañada de papas fritas.' },
  { name: 'Empanadas Salteñas', price: 300, description: 'Carne cortada a cuchillo, cebolla y huevo.', preparation: 'Cocidas al horno de barro.' },
  { name: 'Lomo Completo', price: 2000, description: 'Lomo, jamón, queso, huevo y vegetales.', preparation: 'En pan artesanal.' },
  { name: 'Tarta de Verduras', price: 800, description: 'Masa casera, espinaca y ricota.', preparation: 'Acompañada de ensalada.' },
  { name: 'Pollo al Curry', price: 1600, description: 'Pollo, salsa curry y arroz basmati.', preparation: 'Receta especial de la casa.' },
];

const bebidasEstaticas = [
  { name: 'Cerveza Artesanal', price: 600, tipo: 'Alcohol' },
  { name: 'Vino Malbec', price: 900, tipo: 'Alcohol' },
  { name: 'Agua Mineral', price: 250, tipo: 'Sin alcohol' },
  { name: 'Gaseosa Cola', price: 350, tipo: 'Sin alcohol' },
  { name: 'Jugo Natural', price: 400, tipo: 'Sin alcohol' },
  { name: 'Fernet con Coca', price: 700, tipo: 'Alcohol' },
  { name: 'Gin Tonic', price: 800, tipo: 'Alcohol' },
  { name: 'Café Expreso', price: 300, tipo: 'Caliente' },
];

const postresEstaticos = [
  { name: 'Flan Casero', price: 500, ingredientes: 'Leche, huevos, azúcar, vainilla' },
  { name: 'Helado Artesanal', price: 600, ingredientes: 'Leche, crema, frutas' },
  { name: 'Tarta de Manzana', price: 550, ingredientes: 'Manzana, masa, azúcar' },
  { name: 'Brownie con Helado', price: 700, ingredientes: 'Chocolate, nuez, helado' },
  { name: 'Cheesecake', price: 650, ingredientes: 'Queso crema, galleta, frutos rojos' },
  { name: 'Tiramisú', price: 700, ingredientes: 'Café, queso mascarpone, cacao' },
];

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
            // VITE_API_BASE_URL debe incluir /api al final
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
            // La ruta correcta es /menu (no /productos/menu)
            // porque el router se monta en /api, no en /api/productos
            const response = await axios.get(`${API_URL}/menu`);
            console.log('Menú público cargado:', response.data);
            
            // El endpoint /menu devuelve estructura: { menu: { categoria: [productos] } }
            // Necesitamos convertirlo a un array plano para el resto del código
            if (response.data.menu) {
                const productosArray = [];
                Object.entries(response.data.menu).forEach(([categoria, items]) => {
                    items.forEach(item => {
                        productosArray.push({
                            _id: item.id,
                            nombre: item.nombre,
                            descripcion: item.descripcion,
                            precio: item.precio,
                            categoria: categoria,
                            imagenUrl: item.imagenUrl,
                            disponible: true,
                            stock: 1 // Asumimos que está disponible
                        });
                    });
                });
                setProductos(productosArray);
            } else {
                setProductos([]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            console.error('Detalles del error:', error.response?.data || error.message);
            setLoading(false);
        }
    };

    const categorizeProducts = () => {
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
