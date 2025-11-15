import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import './EquipoDesarrollo.css';

const EquipoDesarrollo = () => {
    const navigate = useNavigate();

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

    return (
        <div className="equipo-page">
            <div className="equipo-header">
                <h1>Equipo de Desarrollo</h1>
                <div className="header-divider"></div>
                <p>Conocé a las personas detrás de La Vieja Estación</p>
            </div>

            <div className="equipo-container">
                <div className="equipo-grid">
                    {equipo.map((miembro, index) => (
                        <div key={index} className="equipo-card">
                            <div className="equipo-imagen">
                                <img src={miembro.imagen} alt={miembro.nombre} />
                            </div>
                            <div className="equipo-info">
                                <h3>{miembro.nombre}</h3>
                                <p className="equipo-rol">{miembro.rol}</p>
                                <div className="equipo-social">
                                    <a href={miembro.github} target="_blank" rel="noopener noreferrer">
                                        <FaGithub />
                                    </a>
                                    <a href={miembro.linkedin} target="_blank" rel="noopener noreferrer">
                                        <FaLinkedin />
                                    </a>
                                    <a href={`mailto:${miembro.email}`}>
                                        <FaEnvelope />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="back-button" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Volver
                </button>
            </div>
        </div>
    );
};

export default EquipoDesarrollo;
