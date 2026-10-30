import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaMoon, FaSun, FaArrowUp } from 'react-icons/fa';
import { formatClockDate, formatClockTime } from '../utils/clockFormat';
import { getScrollTop, scrollPageTo } from '../utils/pageScroll';
import '../pages/MenuPage.css';
import './PublicShell.css';

const navigation = [
    ['Inicio', '/'],
    ['Menú', '/menu'],
    ['Reservas', '/reservas'],
    ['Servicios', '/servicios'],
    ['Quiénes somos', '/quienes-somos'],
    ['Equipo de desarrollo', '/equipo-desarrollo'],
    ['Acceso empleados', '/login']
];

function AccessibilityIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="4.5" r="2" />
            <path d="M5.5 8.5h13M12 7v6.5M12 10.5 7.5 18M12 10.5 16.5 18M8.5 13.5 5 11M15.5 13.5 19 11" />
        </svg>
    );
}

// Estructura común (logo, navegación, reloj, copyright y botones flotantes) de las páginas públicas rediseñadas
const PublicShell = ({ isNightMode, onToggleNightMode, pageClass = '', mainClass = '', children }) => {
    const { pathname } = useLocation();
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [showGoTop, setShowGoTop] = useState(false);
    const [goTopBusy, setGoTopBusy] = useState(false);
    const busyTimer = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const onScroll = () => {
            setShowGoTop(getScrollTop() > 0);
            setGoTopBusy(true);
            clearTimeout(busyTimer.current);
            busyTimer.current = setTimeout(() => setGoTopBusy(false), 150);
        };
        onScroll();
        document.addEventListener('scroll', onScroll, { passive: true, capture: true });
        return () => {
            document.removeEventListener('scroll', onScroll, { capture: true });
            clearTimeout(busyTimer.current);
        };
    }, []);

    return (
        <div className={`mv-page ps-page ${isNightMode ? 'mv-night' : 'mv-day'} ${pageClass}`}>
            <div className="mv-background" />
            <div className="mv-brand">
                <Link to="/">
                    <img src="/logo.svg" alt="La Vieja Estación" />
                    <span>Ciudad de Trancas</span>
                </Link>
            </div>
            <nav className="mv-navigation" aria-label="Navegación principal">
                {navigation.map(([label, path]) => (
                    <Link key={path} to={path} className={path === pathname ? 'active' : ''}>{label}</Link>
                ))}
            </nav>
            <div className="mv-datetime" aria-label="Fecha y hora">
                <div>{formatClockDate(currentDateTime)}</div>
                <strong>{formatClockTime(currentDateTime)}</strong>
            </div>

            <main className={`ps-main ${mainClass}`}>{children}</main>

            <p className="mv-copyright">© 2026 La Vieja Estación. Todos los derechos reservados.</p>

            <button
                type="button"
                className={`mv-go-top ${showGoTop ? '' : 'hidden'} ${goTopBusy ? 'busy' : ''}`}
                onClick={() => scrollPageTo(0)}
                aria-label="Volver arriba"
                title="Volver arriba"
            >
                <FaArrowUp />
                <span className="mv-go-top-spinner" />
            </button>
            <div className="mv-actions">
                <button type="button" className="mv-round mv-moon" onClick={onToggleNightMode} aria-label="Modo nocturno" title="Modo nocturno">
                    {isNightMode ? <FaSun /> : <FaMoon />}
                </button>
                <button type="button" className="mv-round" aria-label="Accesibilidad">
                    <AccessibilityIcon />
                </button>
            </div>
        </div>
    );
};

export default PublicShell;
