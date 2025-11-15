import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUtensils, FaTruck, FaShoppingBag, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';
import './ServiciosPage.css';

const ServiciosPage = () => {
    const navigate = useNavigate();
    
    // Debug: verificar que el componente se está renderizando
    console.log('ServiciosPage renderizado');

    const handleReservaClick = () => {
        navigate('/reservas');
    };

    return (
        <div className="servicios-page">
            <div className="servicios-container">
                <div className="servicios-header">
                    <h2 className="servicios-title">Nuestros Servicios</h2>
                    <div className="servicios-divider"></div>
                    <p className="servicios-subtitle">Disfruta de La Vieja Estación como prefieras</p>
                </div>

                <div className="services-grid">
                    {/* Servicio en Local */}
                    <div className="service-card">
                        <div className="service-icon-wrapper">
                            <FaUtensils className="service-icon" />
                        </div>
                        <h3 className="service-title">Servicio en Local</h3>
                        <p className="service-description">
                            Disfruta de nuestro ambiente acogedor con atención personalizada de nuestros mozos.
                        </p>
                        <ul className="service-features">
                            <li><FaClock /> Lun-Dom: 11:00 - 00:00</li>
                            <li><FaMapMarkerAlt /> Salón Principal y VIP</li>
                        </ul>
                    </div>

                    {/* Delivery */}
                    <div className="service-card">
                        <div className="service-icon-wrapper">
                            <FaTruck className="service-icon" />
                        </div>
                        <h3 className="service-title">Delivery</h3>
                        <p className="service-description">
                            Recibe tus platos favoritos en la comodidad de tu hogar, calientes y en el menor tiempo.
                        </p>
                        <ul className="service-features">
                            <li><FaClock /> Tiempo: 30-45 min</li>
                            <li><FaMapMarkerAlt /> Radio: 5 km</li>
                        </ul>
                    </div>

                    {/* Retiro en Local */}
                    <div className="service-card">
                        <div className="service-icon-wrapper">
                            <FaShoppingBag className="service-icon" />
                        </div>
                        <h3 className="service-title">Retiro en Local</h3>
                        <p className="service-description">
                            Ordena por adelantado y retira tu pedido listo para llevar sin esperas.
                        </p>
                        <ul className="service-features">
                            <li><FaClock /> Listo en 20-30 min</li>
                            <li><FaMapMarkerAlt /> Take Away Express</li>
                        </ul>
                    </div>

                    {/* Reservas */}
                    <div className="service-card">
                        <div className="service-icon-wrapper">
                            <FaCalendarAlt className="service-icon" />
                        </div>
                        <h3 className="service-title">Reservas de Mesas</h3>
                        <p className="service-description">
                            Asegura tu mesa con anticipación para eventos especiales o cenas importantes.
                        </p>
                        <ul className="service-features">
                            <li><FaClock /> Confirmación inmediata</li>
                            <li><FaMapMarkerAlt /> Todas las zonas</li>
                        </ul>
                        <button className="service-cta" onClick={handleReservaClick}>
                            Reservar Ahora
                        </button>
                    </div>
                </div>

                <button className="back-button" onClick={() => navigate('/')}>
                    <FaArrowLeft /> Volver al Inicio
                </button>
            </div>
        </div>
    );
};

export default ServiciosPage;
