import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaUtensils, FaFacebookF, FaTwitter, FaTripadvisor, FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

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

  return (
    <header className="modern-header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo" onClick={() => navigate('/')}>
          <FaUtensils className="logo-icon" />
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Navigation */}
        <nav className={`header-nav ${isMenuOpen ? 'active' : ''}`}>
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
          <NavLink to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            LOGIN
          </NavLink>
          <a href="#blog" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            BLOG
          </a>
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