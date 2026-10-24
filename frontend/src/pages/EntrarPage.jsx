import { Link } from 'react-router-dom';
import './EntrarPage.css';

function EntrarPage() {
    return (
        <main className="enter-page">
            <h1>Pantalla de navegación</h1>
            <p>Aquí estarán las opciones principales del sitio.</p>
            <Link to="/">Volver al inicio</Link>
        </main>
    );
}

export default EntrarPage;
