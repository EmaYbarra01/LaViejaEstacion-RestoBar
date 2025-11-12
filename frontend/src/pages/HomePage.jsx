import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();

    const handleMenuClick = () => {
        navigate('/menu');
    };

    return (
        <div className="home-container">
            <div className="home-background"></div>
            <div className="home-overlay"></div>
            <div className="home-content">
                <h2 className="home-subtitle">Resto-Bar</h2>
                <h1 className="home-title">LA VIEJA ESTACIÓN</h1>
                <div className="home-divider"></div>
                <p className="home-tagline">"Sabores que cuentan historias"</p>
                <button className="home-cta-button" onClick={handleMenuClick}>
                    Ver Menú
                </button>
            </div>
        </div>
    );
};

export default HomePage;