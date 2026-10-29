import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHamburger, FaCocktail, FaIceCream, FaChevronDown, FaMoon, FaSun, FaArrowUp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { formatClockDate, formatClockTime } from '../utils/clockFormat';
import './MenuPage.css';

const navigation = [
    ['Inicio', '/'],
    ['Menú', '/menu'],
    ['Reservas', '/reservas'],
    ['Servicios', '/servicios'],
    ['Quiénes somos', '/quienes-somos'],
    ['Equipo de desarrollo', '/equipo-desarrollo'],
    ['Acceso empleados', '/login']
];

const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%234f222b" width="300" height="200"/%3E%3Ctext fill="%23f3e7cd" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16"%3EImagen No Disponible%3C/text%3E%3C/svg%3E';

function AccessibilityIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="4.5" r="2" />
            <path d="M5.5 8.5h13M12 7v6.5M12 10.5 7.5 18M12 10.5 16.5 18M8.5 13.5 5 11M15.5 13.5 19 11" />
        </svg>
    );
}

const MotionDiv = motion.div;

// En esta app el contenedor con scroll es el body, no la ventana
const getScrollTop = () => Math.max(window.scrollY, document.body.scrollTop, document.documentElement.scrollTop);
const scrollerScrollTo = (top) => {
    window.scrollTo({ top, behavior: 'smooth' });
    document.body.scrollTo({ top, behavior: 'smooth' });
};

const MenuPage = ({ isNightMode, onToggleNightMode }) => {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCategory, setExpandedCategory] = useState('comida');
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [showGoTop, setShowGoTop] = useState(false);
    const [goTopBusy, setGoTopBusy] = useState(false);
    const busyTimer = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

    const fetchProductos = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/menu`);
            setProductos(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error al cargar productos:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchProductos();
    }, [fetchProductos]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Mismo comportamiento que el botón "Go to top" de noburestaurants.com
    useEffect(() => {
        const onScroll = () => {
            setShowGoTop(getScrollTop() > 0);
            setGoTopBusy(true);
            clearTimeout(busyTimer.current);
            busyTimer.current = setTimeout(() => setGoTopBusy(false), 150);
        };
        onScroll();
        // El scroll puede ocurrir en window o en body; la captura cubre ambos
        document.addEventListener('scroll', onScroll, { passive: true, capture: true });
        return () => {
            document.removeEventListener('scroll', onScroll, { capture: true });
            clearTimeout(busyTimer.current);
        };
    }, []);

    const getImageUrl = (imagenUrl) => {
        if (!imagenUrl) return FALLBACK_IMAGE;
        if (imagenUrl.startsWith('http://') || imagenUrl.startsWith('https://')) {
            return imagenUrl;
        }
        return `${BACKEND_URL}${imagenUrl}`;
    };

    const categories = [
        { key: 'comida', title: 'Comidas', icon: <FaHamburger className="mv-acc-icon" />, items: productos.filter((p) => p.categoria === 'Comidas') },
        { key: 'bebidas', title: 'Bebidas', icon: <FaCocktail className="mv-acc-icon" />, items: productos.filter((p) => p.categoria === 'Bebidas' || p.categoria === 'Bebidas Alcohólicas') },
        { key: 'postres', title: 'Postres', icon: <FaIceCream className="mv-acc-icon" />, items: productos.filter((p) => p.categoria === 'Postres') }
    ];

    const toggleCategory = (category) => {
        if (expandedCategory === category) {
            setExpandedCategory(null);
            return;
        }
        setExpandedCategory(category);
        setTimeout(() => {
            const element = document.getElementById(`accordion-${category}`);
            if (element) {
                const offsetPosition = element.getBoundingClientRect().top + getScrollTop() - 30;
                scrollerScrollTo(offsetPosition);
            }
        }, 100);
    };

    const scrollToTop = () => scrollerScrollTo(0);

    return (
        <div className={`mv-page ${isNightMode ? 'mv-night' : 'mv-day'}`}>
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
                <div className="mv-header">
                    <h1>Nuestro Menú</h1>
                    <div className="mv-divider"></div>
                    <p>La Vieja Estación - Sabores que cuentan historias</p>
                    <button type="button" className="mv-order" onClick={() => navigate('/menu-digital')}>
                        Pedir ahora
                    </button>
                </div>

                <div className="mv-container">
                    {loading ? (
                        <p className="mv-loading">Cargando menú...</p>
                    ) : (
                        <div>
                            {categories.map(({ key, title, icon, items }) => (
                                <div className="mv-accordion" id={`accordion-${key}`} key={key}>
                                    <button
                                        type="button"
                                        className={`mv-acc-header ${expandedCategory === key ? 'active' : ''}`}
                                        onClick={() => toggleCategory(key)}
                                        aria-expanded={expandedCategory === key}
                                    >
                                        <span className="mv-acc-title">
                                            {icon}
                                            <span>{title}</span>
                                        </span>
                                        <FaChevronDown className={`mv-chevron ${expandedCategory === key ? 'rotated' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {expandedCategory === key && (
                                            <MotionDiv
                                                className="mv-acc-content"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="mv-grid">
                                                    {items.map((item, index) => (
                                                        <MotionDiv
                                                            key={item._id}
                                                            className="mv-card"
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                            whileHover={{ y: -8, boxShadow: '0 15px 40px rgba(79, 34, 43, 0.45)' }}
                                                        >
                                                            <div className="mv-card-image">
                                                                <img
                                                                    src={getImageUrl(item.imagenUrl)}
                                                                    alt={item.nombre}
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = FALLBACK_IMAGE;
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="mv-card-head">
                                                                <h3 className="mv-card-name">{item.nombre}</h3>
                                                                <span className="mv-card-price">${item.precio?.toFixed(2)}</span>
                                                            </div>
                                                            <p className="mv-card-desc">{item.descripcion}</p>
                                                            <div className="mv-card-foot">
                                                                {item.disponible !== false && item.stock > 0 ? (
                                                                    <span className="mv-badge">Disponible</span>
                                                                ) : (
                                                                    <span className="mv-badge mv-badge-off">No disponible</span>
                                                                )}
                                                            </div>
                                                        </MotionDiv>
                                                    ))}
                                                </div>
                                            </MotionDiv>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <p className="mv-copyright">© 2026 La Vieja Estación. Todos los derechos reservados.</p>

            <button
                type="button"
                className={`mv-go-top ${showGoTop ? '' : 'hidden'} ${goTopBusy ? 'busy' : ''}`}
                onClick={scrollToTop}
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

export default MenuPage;
