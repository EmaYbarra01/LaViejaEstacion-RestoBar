import React from 'react';
import PublicShell from '../components/PublicShell';
import './QuienesSomos.css';

const values = [
    {
        title: 'Calidad',
        text: 'Ingredientes frescos y de primera calidad en cada uno de nuestros platos. Trabajamos con proveedores locales para garantizar lo mejor.',
        icon: <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2 1-3 4-3 8h3" />
    },
    {
        title: 'Excelencia',
        text: 'Nos esforzamos por brindar una experiencia gastronómica excepcional en cada visita, cuidando cada detalle del servicio.',
        icon: <><circle cx="12" cy="9" r="6" /><path d="M8.5 14L7 21l5-3 5 3-1.5-7" /></>
    },
    {
        title: 'Pasión',
        text: 'Cocinamos con amor y dedicación, compartiendo nuestra pasión por la buena comida y el buen servicio con cada cliente.',
        icon: <path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z" />
    },
    {
        title: 'Tradición',
        text: 'Respetamos las recetas tradicionales mientras innovamos con toques modernos para crear experiencias únicas.',
        icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>
    }
];

const QuienesSomos = ({ isNightMode, onToggleNightMode }) => (
    <PublicShell isNightMode={isNightMode} onToggleNightMode={onToggleNightMode} pageClass="qs-page">
        <div className="ps-container">
            <div className="ps-head">
                <h1>Quiénes Somos</h1>
                <div className="mv-divider" />
                <p>La Vieja Estación - Nuestra Historia</p>
            </div>

            <section className="qs-section">
                <div className="ps-panel qs-historia">
                    <img
                        src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop"
                        alt="Interior del restaurante La Vieja Estación"
                    />
                    <div className="qs-text">
                        <h2>Nuestra Historia</h2>
                        <p>La Vieja Estación RestoBar abrió sus puertas en enero de 2024 de la mano de Jacqueline Valdivieso. Ubicado estratégicamente en el kilómetro 1361 de la Ruta 9, nuestro bar se ha convertido en un punto de encuentro para camioneros y viajeros que transitan por la región.</p>
                        <p>La idea detrás de La Vieja Estación es ofrecer una experiencia gastronómica auténtica con comidas caseras que evocan sabores hogareños. Desde milanesas, empanadas, tamales, humitas, pizzas, cada plato está preparado con dedicación y frescura, buscando que nuestros visitantes se sientan como en casa.</p>
                        <p>La esencia del RestoBar no solo radica en la comida sino también en la calidez familiar. Jacqueline y su familia son el corazón del lugar, garantizando un ambiente acogedor y un trato cercano que invita a volver.</p>
                    </div>
                </div>
            </section>

            <section className="qs-section">
                <h2 className="ps-section-title">Nuestros Valores</h2>
                <div className="qs-valores">
                    {values.map((value) => (
                        <article key={value.title} className="ps-panel qs-valor">
                            <div className="qs-badge">
                                <svg className="ps-icon" viewBox="0 0 24 24" aria-hidden="true">{value.icon}</svg>
                            </div>
                            <h3>{value.title}</h3>
                            <p>{value.text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="qs-section">
                <div className="qs-mv">
                    <article className="ps-panel">
                        <h2>Nuestra Misión</h2>
                        <p>Brindar a cada viajero, camionero y visitante una experiencia gastronómica auténtica, ofreciendo comida casera elaborada al momento, con sabores que recuerdan al hogar. Trabajamos con dedicación y calidez familiar para crear un ambiente cercano y acogedor donde cada persona que llegue se sienta parte de nuestra casa.</p>
                    </article>
                    <article className="ps-panel">
                        <h2>Nuestra Visión</h2>
                        <p>Consolidarnos como el punto de encuentro preferido sobre la Ruta 9, reconocidos por nuestra atención humana, nuestros platos típicos y la esencia hogareña que nos caracteriza. Aspiramos a crecer manteniendo siempre nuestros valores familiares, expandiendo nuestra propuesta sin perder la autenticidad y el sabor casero que nos distingue.</p>
                    </article>
                </div>
            </section>
        </div>
    </PublicShell>
);

export default QuienesSomos;
