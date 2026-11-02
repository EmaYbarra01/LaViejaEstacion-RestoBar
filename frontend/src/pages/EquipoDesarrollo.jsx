import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import PublicShell from '../components/PublicShell';
import './EquipoDesarrollo.css';

const equipo = [
    {
        nombre: 'Emanuel Ybarra',
        rol: 'Full Stack Developer',
        imagen: '/img/Emanuel.jpg',
        github: 'https://github.com/EmaYbarra01',
        linkedin: '#',
        email: 'dev1@example.com'
    },
    {
        nombre: 'Benjamín Sanagua',
        rol: 'Frontend Developer',
        imagen: '/img/Benjamin.jpg',
        github: 'https://github.com/benjamin7392',
        linkedin: '#',
        email: 'dev2@example.com'
    },
    {
        nombre: 'Patricia Argüello',
        rol: 'Backend Developer',
        imagen: '/img/Patricia.jpg',
        github: 'https://github.com/Pato-24',
        linkedin: '#',
        email: 'dev3@example.com'
    },
    {
        nombre: 'Cristian de la Cruz',
        rol: 'UI/UX Designer',
        imagen: '/img/Cristian.jpg',
        github: 'https://github.com/cristian29delacruz',
        linkedin: '#',
        email: 'dev4@example.com'
    }
];

const EquipoDesarrollo = ({ isNightMode, onToggleNightMode }) => (
    <PublicShell isNightMode={isNightMode} onToggleNightMode={onToggleNightMode} pageClass="eq-page" mainClass="eq-main">
        <div className="ps-container">
            <div className="ps-head eq-head">
                <h1>Equipo de Desarrollo</h1>
                <div className="mv-divider" />
                <p>Conocé a las personas detrás de La Vieja Estación</p>
            </div>

            <div className="eq-grid">
                {equipo.map((miembro) => (
                    <article key={miembro.nombre} className="ps-panel eq-card">
                        <div className="eq-photo">
                            <img src={miembro.imagen} alt={miembro.nombre} />
                        </div>
                        <div className="eq-info">
                            <h3>{miembro.nombre}</h3>
                            <p className="eq-role">{miembro.rol}</p>
                            <div className="eq-social">
                                <a href={miembro.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub /></a>
                                <a href={miembro.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
                                <a href={`mailto:${miembro.email}`} aria-label="Email"><FaEnvelope /></a>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    </PublicShell>
);

export default EquipoDesarrollo;
