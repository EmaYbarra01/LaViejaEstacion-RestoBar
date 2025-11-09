import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useUserStore from "../store/useUserStore";
import useCartStore from "../store/cartStore";
import "./Header.css";

function Header({ onCartClick, onSalesClick }) {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    // Obtener datos del usuario y funciones del store de Zustand
    const { user, isAuthenticated, logout } = useUserStore();
    
    // Obtener datos del carrito
    const { getItemsCount, total } = useCartStore();
    const itemsCount = getItemsCount();

    // Debug: Verificar datos del usuario
    useEffect(() => {
        console.log('Header - Usuario actual:', user);
        console.log('Header - Autenticado:', isAuthenticated);
    }, [user, isAuthenticated]);

    // ✅ Logout usando Zustand
    const handleLogout = async () => {
        try {
            setLoading(true);
            await logout(); // Zustand se encarga de limpiar el estado y hacer la llamada al backend
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            navigate('/login'); // Redirigir de todas formas
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

    return (
        <header className="header">
            <nav className="nav-container">
                <div className="nav-brand">
                    <h1 className="brand-title">🛍️ TiendaCom12</h1>
                </div>
                
                <div className="nav-links">
                    <NavLink to="/" className="nav-link">
                        🏠 Inicio
                    </NavLink>
                    
                    {!isAuthenticated && (
                        <>
                            <NavLink to="/login" className="nav-link">
                                🔑 Login
                            </NavLink>
                            <NavLink to="/register" className="nav-link">
                                📝 Registro
                            </NavLink>
                        </>
                    )}

                    {isAdmin && (
                        <>
                            <NavLink to="/admin/" className="nav-link admin-link">
                                ⚙️ Admin
                            </NavLink>
                            <NavLink to="/admin/users" className="nav-link admin-link">
                                👥 Usuarios
                            </NavLink>
                            <NavLink to="/admin/products" className="nav-link admin-link">
                                📦 Productos
                            </NavLink>
                            <NavLink to="/admin/sales" className="nav-link admin-link">
                                📊 Ventas
                            </NavLink>
                        </>
                    )}
                    
                    {/* Botón de Historial de Ventas (solo para usuarios normales autenticados) */}
                    {isAuthenticated && !isAdmin && onSalesClick && (
                        <button 
                            className="nav-button sales-button"
                            onClick={onSalesClick}
                            title="Ver mi historial de compras"
                        >
                            � Mis Compras
                        </button>
                    )}
                    
                    {/* Botón del Carrito (solo para usuarios normales autenticados) */}
                    {isAuthenticated && !isAdmin && onCartClick && (
                        <button 
                            className="nav-button cart-button"
                            onClick={onCartClick}
                            title="Ver carrito de compras"
                        >
                            <span className="cart-icon">🛒</span>
                            <span className="cart-info">
                                {itemsCount > 0 && (
                                    <span className="cart-count">{itemsCount}</span>
                                )}
                                <span className="cart-total">${total.toFixed(2)}</span>
                            </span>
                        </button>
                    )}
                </div>
                
                {isAuthenticated && user && (
                    <div className="nav-user">
                        <span className="user-welcome">
                            ¡Hola, {user.name}! 
                            <span className="user-role">({user.role})</span>
                        </span>
                        <button 
                            className="logout-btn" 
                            onClick={handleLogout}
                            disabled={loading}
                        >
                            {loading ? '⏳' : '🚪'} Logout
                        </button>
                    </div>
                )}
            </nav>
        </header>
    );
}

export default Header;