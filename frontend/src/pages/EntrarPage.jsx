import { useEffect, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './EntrarPage.css';

function AccessibilityIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="4.5" r="2" />
            <path d="M5.5 8.5h13M12 7v6.5M12 10.5 7.5 18M12 10.5 16.5 18M8.5 13.5 5 11M15.5 13.5 19 11" />
        </svg>
    );
}

function EntrarPage({ isNightMode, onToggleNightMode }) {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const navigation = [
        ['Inicio', '/'],
        ['Menú', '/menu'],
        ['Reservas', '/reservas'],
        ['Servicios', '/servicios'],
        ['Quiénes somos', '/quienes-somos'],
        ['Equipo de desarrollo', '/equipo-desarrollo']
    ];

    useEffect(() => {
        const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <main className="enter-page">
            <div className="enter-page-overlay" />
            <div className="enter-brand">
                <Link to="/">
                    <img src="/logo.svg" alt="La Vieja Estación" />
                    <span>Ciudad de Trancas</span>
                </Link>
            </div>
            <nav className="enter-navigation" aria-label="Navegación principal">
                {navigation.map(([label, path]) => <Link key={path} to={path}>{label}</Link>)}
            </nav>
            <div className="enter-datetime" aria-label="Fecha y hora">
                <div>{currentDateTime.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })}</div>
                <strong>{currentDateTime.toLocaleTimeString('es-AR', { hour12: false })}</strong>
            </div>
            <Link className="enter-employee-access" to="/login">Acceso empleados</Link>
            <div className="enter-actions">
                <button type="button" className="enter-round-button" onClick={onToggleNightMode} aria-label="Modo nocturno" title="Modo nocturno">
                    {isNightMode ? <FaSun /> : <FaMoon />}
                </button>
                <button type="button" className="enter-round-button enter-accessibility-button" aria-label="Accesibilidad">
                    <AccessibilityIcon />
                </button>
            </div>
            <p className="enter-copyright">© 2026 La Vieja Estación. Todos los derechos reservados.</p>
        </main>
    );
}

export default EntrarPage;
