import React from 'react';
import PublicShell from '../components/PublicShell';
import './ServiciosPage.css';

const ClockIcon = () => (
    <svg className="ps-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
const PinIcon = () => (
    <svg className="ps-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
);

const services = [
    {
        title: 'Servicio en Local',
        description: 'Disfruta de nuestro ambiente acogedor con atención personalizada de nuestros mozos.',
        icon: <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2 1-3 4-3 8h3" />,
        features: [['clock', 'Lun-Dom: 09:00 - 13:00'], ['clock', 'Lun-Dom: 20:00 - 00:00'], ['pin', 'Salón Principal y VIP']]
    },
    {
        title: 'Delivery',
        description: 'Recibe tus platos favoritos en la comodidad de tu hogar, calientes y en el menor tiempo.',
        icon: <path d="M2 6h11v10H2zM13 9h5l3 3v4h-8M6 18.5a1.5 1.5 0 1 0 .01 0M17 18.5a1.5 1.5 0 1 0 .01 0" />,
        features: [['clock', 'Tiempo: 30-45 min'], ['pin', 'Radio: 10 km']]
    },
    {
        title: 'Retiro en Local',
        description: 'Ordena por adelantado y retira tu pedido listo para llevar sin esperas.',
        icon: <path d="M5 8h14l-1 12H6zM9 8a3 3 0 0 1 6 0" />,
        features: [['clock', 'Listo en 30-45 min'], ['pin', 'Take Away Express']]
    },
    {
        title: 'Reservas de Mesas',
        description: 'Asegura tu mesa con anticipación para eventos especiales o cenas importantes.',
        icon: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
        features: [['clock', 'Confirmación inmediata'], ['pin', 'Todas las zonas']]
    }
];

const ServiciosPage = ({ isNightMode, onToggleNightMode }) => (
    <PublicShell isNightMode={isNightMode} onToggleNightMode={onToggleNightMode} pageClass="sv-page" mainClass="sv-main">
        <div className="ps-container">
            <div className="ps-head sv-head">
                <h1>Nuestros Servicios</h1>
                <div className="mv-divider" />
                <p>Disfruta de La Vieja Estación como prefieras</p>
            </div>

            <div className="sv-grid">
                {services.map((service) => (
                    <article key={service.title} className="ps-panel sv-card">
                        <div className="sv-badge">
                            <svg className="ps-icon" viewBox="0 0 24 24" aria-hidden="true">{service.icon}</svg>
                        </div>
                        <h3>{service.title}</h3>
                        <p>{service.description}</p>
                        <ul className="sv-features">
                            {service.features.map(([type, text]) => (
                                <li key={text}>{type === 'clock' ? <ClockIcon /> : <PinIcon />}{text}</li>
                            ))}
                        </ul>
                    </article>
                ))}
            </div>
        </div>
    </PublicShell>
);

export default ServiciosPage;
