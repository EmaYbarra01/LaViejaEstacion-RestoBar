import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaUtensils, FaFacebookF, FaTwitter, FaTripadvisor, FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
          <NavLink to="/productos" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            EVENTOS
          </NavLink>
          <NavLink to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            RESERVAS
          </NavLink>
          <a href="#features" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            SERVICIOS
          </a>
          <a href="#shop" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            TIENDA
          </a>
          <a href="#blog" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            BLOG
          </a>
        </nav>

        {/* Social Icons & CTA */}
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
          <button className="purchase-btn" onClick={() => navigate('/productos')}>
            COMPRAR
          </button>
        </div>
      </div>
    </header>
  );
}