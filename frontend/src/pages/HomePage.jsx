import React, { useEffect, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

function AccessibilityIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="4.5" r="2" />
            <path d="M5.5 8.5h13M12 7v6.5M12 10.5 7.5 18M12 10.5 16.5 18M8.5 13.5 5 11M15.5 13.5 19 11" />
        </svg>
    );
}

const HomePage = ({ isNightMode, onToggleNightMode }) => {
    const navigate = useNavigate();
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date) => {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
    };

    const formatTime = (date) => date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    return (
        <div className="home-container">
            <div className="home-background" />
            <div className="home-overlay" />

            <button
                type="button"
                className="home-enter-button"
                onClick={() => navigate('/entrar')}
            >
                ENTRAR
            </button>

            <div className="home-datetime" aria-label={`Fecha ${formatDate(currentDateTime)}, hora ${formatTime(currentDateTime)}`}>
                <div>{formatDate(currentDateTime)}</div>
                <strong>{formatTime(currentDateTime)}</strong>
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
                <button type="button" className="home-cta-button" onClick={() => navigate('/menu')}>
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
                <button type="button" className="home-round-button home-accessibility-button" aria-label="Accesibilidad">
                    <AccessibilityIcon />
                </button>
            </div>

            <div className="home-copyright">
                © 2026 La Vieja Estación. Todos los derechos reservados.
            </div>
        </div>
    );
};

export default HomePage;
