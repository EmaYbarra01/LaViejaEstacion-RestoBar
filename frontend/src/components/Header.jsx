import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaUtensils, FaFacebookF, FaTwitter, FaTripadvisor, FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';
import './Header.css';
import useUserStore from '../store/useUserStore';

export default function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  // Obtener datos del usuario desde Zustand
  const { user, isAuthenticated, logout } = useUserStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const formatDate = (date) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="modern-header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo" onClick={() => navigate('/')}> <FaUtensils className="logo-icon" /> </div>
        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        {/* Navigation */}
        <nav className={`header-nav ${isMenuOpen ? 'active' : ''}`}>
          {/* Mostrar navegación solo si NO es EncargadoCocina */}
          {user?.role !== 'EncargadoCocina' ? (
            <>
              <NavLink to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                INICIO
              </NavLink>
              <NavLink to="/menu" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                MENÚ
              </NavLink>
              <NavLink to="/reservas" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                RESERVAS
              </NavLink>
              <a href="#features" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                SERVICIOS
              </a>
              <a href="#blog" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                BLOG
              </a>
            </>
          ) : null}
          {/* Mostrar botón de salir y datos de usuario para cualquier usuario autenticado */}
          {isAuthenticated && (
            <>
              <div className="nav-link user-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaUser style={{ fontSize: '14px' }} />
                <span>{user?.name || user?.nombreCompleto || 'Usuario'}</span>
                <span style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(255, 193, 7, 0.2)', borderRadius: '12px', color: '#ffc107' }}>
                  {user?.role}
                </span>
              </div>
              <button className="nav-link logout-btn" onClick={handleLogout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#ff6b6b' }}>
                <FaSignOutAlt />
                SALIR
              </button>
            </>
          )}
        </nav>
        {/* Social Icons & DateTime */}
        <div className="header-actions">
          <div className="social-icons">
            <a href="#facebook" className="social-icon">
              <FaFacebookF />
            </a>
            <a href="#twitter" className="social-icon">
              <FaTwitter />
            </a>
            <a href="#tripadvisor" className="social-icon">
              <FaTripadvisor />
            </a>
          </div>
          <div className="datetime-display">
            <div className="date-text">{formatDate(currentDateTime)}</div>
            <div className="time-text">{formatTime(currentDateTime)}</div>
          </div>
        </div>
      </div>
    </header>
  );
}