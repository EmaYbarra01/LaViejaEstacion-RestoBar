import React from 'react';
import { FaUtensils } from 'react-icons/fa';
import './Footer.css';

function Footer() {
  return (
    <footer className="modern-footer">
      <div className="footer-simple-container">
        <div className="footer-brand">
          <FaUtensils className="footer-icon" />
          <h3>La Vieja Estación</h3>
        </div>
        <div className="footer-text">
          <p>&copy; 2025 La Vieja Estación. Todos los derechos reservados.</p>
          <p>Desarrollado con ❤️ por el equipo de La Vieja Estación</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;