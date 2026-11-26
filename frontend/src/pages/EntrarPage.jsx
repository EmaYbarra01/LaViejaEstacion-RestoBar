import { useEffect, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './EntrarPage.css';
import { formatClockDate, formatClockTime } from '../utils/clockFormat';
import { AccessibilityTrigger } from '../components/AccessibilityWidget';

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
                <div>{formatClockDate(currentDateTime)}</div>
                <strong>{formatClockTime(currentDateTime)}</strong>
            </div>
            <Link className="enter-employee-access" to="/login">Acceso empleados</Link>
            <div className="enter-actions">
                <button type="button" className="enter-round-button" onClick={onToggleNightMode} aria-label="Modo nocturno" title="Modo nocturno">
                    {isNightMode ? <FaSun /> : <FaMoon />}
                </button>
                <AccessibilityTrigger className="enter-round-button enter-accessibility-button" />
            </div>
            <p className="enter-copyright">© 2026 La Vieja Estación. Todos los derechos reservados.</p>
        </main>
    );
}

export default EntrarPage;
