import React, { useEffect, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import { formatClockDate, formatClockTime } from '../utils/clockFormat';
import { AccessibilityTrigger } from '../components/AccessibilityWidget';

const HomePage = ({ isNightMode, onToggleNightMode }) => {
    const navigate = useNavigate();
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = formatClockDate;
    const formatTime = formatClockTime;

    return (
        <div className="home-container">
            <div className="home-background" />
            <div className="home-overlay" />

            <button
                type="button"
                className="home-enter-button"
                data-accessibility-description="Abre la navegación principal"
                onClick={() => navigate('/entrar')}
            >
                ENTRAR
            </button>

            <div className="home-datetime" aria-label={`Fecha ${formatDate(currentDateTime)}, hora ${formatTime(currentDateTime)}`}>
                <div>{formatClockDate(currentDateTime)}</div>
                <strong>{formatClockTime(currentDateTime)}</strong>
            </div>

            <main
                className="home-content"
            >
                <img className="home-logo" src="/logo.svg" alt="La Vieja Estación" />
                <h1 className="home-title">La Vieja Estación</h1>
                <p className="home-tagline">
                    “Porque alrededor de una buena mesa siempre hay algo para celebrar,
                    una historia para contar y un motivo para quedarse un rato más”
                </p>
                <button type="button" className="home-cta-button" data-accessibility-description="Abre el menú del restaurante" onClick={() => navigate('/menu')}>
                    Ver menú
                </button>
            </main>

            <div className="home-actions">
                <button
                    type="button"
                    className="home-round-button"
                    onClick={onToggleNightMode}
                    aria-label={isNightMode ? 'Activar modo diurno' : 'Activar modo nocturno'}
                    title={isNightMode ? 'Modo diurno' : 'Modo nocturno'}
                >
                    {isNightMode ? <FaSun /> : <FaMoon />}
                </button>
                <AccessibilityTrigger className="home-round-button home-accessibility-button" />
            </div>

            <div className="home-copyright">
                © 2026 La Vieja Estación. Todos los derechos reservados.
            </div>
        </div>
    );
};

export default HomePage;
