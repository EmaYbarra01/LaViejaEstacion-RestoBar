import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUtensils, FaAward, FaHeart, FaClock } from 'react-icons/fa';
import './QuienesSomos.css';

const QuienesSomos = () => {
    const navigate = useNavigate();

    return (
        <div className="quienes-somos-page">
            <div className="quienes-somos-header">
                <h1>Quiénes Somos</h1>
                <div className="header-divider"></div>
                <p>La Vieja Estación - Nuestra Historia</p>
            </div>

            <div className="quienes-somos-container">
                {/* Sección principal con imagen y texto */}
                <section className="historia-section">
                    <div className="historia-content">
                        <div className="historia-image">
                            <img 
                                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop" 
                                alt="Interior del restaurante La Vieja Estación"
                            />
                        </div>
                        <div className="historia-text">
                            <h2>Nuestra Historia</h2>
                            <p>
                                La Vieja Estación RestoBar abrió sus puertas en enero de 2024
                                de la mano de Jacqueline Valdivieso. Ubicado estratégicamente en el kilómetro 1361 de la Ruta 9
                                 nuestro bar se ha convertido en un punto de encuentro para camioneros y viajeros que transitan
                                 por la región.
                            </p>
                            <p>
                                La idea detrás de La Vieja Estación es ofrecer una experiencia gastronómica auténtica
                                 con comidas caseras que evocan sabores hogareños. Desde milanesas, empanada, tamales, humitas, pizzas,
                                  cada plato está preparado con dedicación y frescura, buscando que nuestros visitantes se sientan como en casa.
                            </p>
                            <p>
                                La esencia del RestoBar no solo radica en la comida sino también en la calidez familiar.
                                 Jacqueline y su familia son el corazón del lugar, garantizando un ambiente acogedor y un trato cercano que invita a volver.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Sección de valores */}
                <section className="valores-section">
                    <h2>Nuestros Valores</h2>
                    <div className="valores-grid">
                        <div className="valor-card">
                            <div className="valor-icon">
                                <FaUtensils />
                            </div>
                            <h3>Calidad</h3>
                            <p>
                                Ingredientes frescos y de primera calidad en cada uno de nuestros platos. 
                                Trabajamos con proveedores locales para garantizar lo mejor.
                            </p>
                        </div>
                        <div className="valor-card">
                            <div className="valor-icon">
                                <FaAward />
                            </div>
                            <h3>Excelencia</h3>
                            <p>
                                Nos esforzamos por brindar una experiencia gastronómica excepcional en 
                                cada visita, cuidando cada detalle del servicio.
                            </p>
                        </div>
                        <div className="valor-card">
                            <div className="valor-icon">
                                <FaHeart />
                            </div>
                            <h3>Pasión</h3>
                            <p>
                                Cocinamos con amor y dedicación, compartiendo nuestra pasión por la 
                                buena comida y el buen servicio con cada cliente.
                            </p>
                        </div>
                        <div className="valor-card">
                            <div className="valor-icon">
                                <FaClock />
                            </div>
                            <h3>Tradición</h3>
                            <p>
                                Respetamos las recetas tradicionales mientras innovamos con toques 
                                modernos para crear experiencias únicas.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Sección de misión y visión */}
                <section className="mision-vision-section">
                    <div className="mision-vision-grid">
                        <div className="mision-card">
                            <h2>Nuestra Misión</h2>
                            <p>
                                Brindar a cada viajero, camionero y visitante una experiencia gastronómica auténtica
                                 ofreciendo comida casera elaborada al momento, con sabores que recuerdan al hogar.
                                 Trabajamos con dedicación y calidez familiar para crear un ambiente cercano y acogedor
                                 donde cada persona que llegue se sienta parte de nuestra casa.
                            </p>
                        </div>
                        <div className="vision-card">
                            <h2>Nuestra Visión</h2>
                            <p>
                                Consolidarnos como el punto de encuentro preferido sobre la Ruta 9
                                 reconocidos por nuestra atención humana, nuestros platos típicos y
                                 la esencia hogareña que nos caracteriza. Aspiramos a crecer manteniendo siempre
                                 nuestros valores familiares, expandiendo nuestra propuesta sin perder la autenticidad 
                                 y el sabor casero que nos distingue.
                            </p>
                        </div>
                    </div>
                </section>

                <button className="back-button" onClick={() => navigate('/')}>
                    <FaArrowLeft /> Volver al Inicio
                </button>
            </div>
        </div>
    );
};

export default QuienesSomos;
