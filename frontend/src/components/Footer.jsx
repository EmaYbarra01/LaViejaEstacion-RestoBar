import React from 'react';
import { FaUtensils } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="modern-footer">
      <div className="footer-simple-container">
        <div className="footer-text">
          <p className="footer-copyright">
            <FaUtensils className="footer-icon-inline" />
            La Vieja Estación - &copy; 2025 La Vieja Estación. Todos los derechos reservados.
          </p>
          <Link to="/equipo-desarrollo" className="footer-team-link">
            Conocé al equipo de Desarrollo de la Vieja Estación
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;