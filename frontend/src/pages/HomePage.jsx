import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();

    const handleMenuClick = () => {
        navigate('/menu');
    };

    // Variantes de animación
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    };

    const buttonVariants = {
        hidden: { scale: 0, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.8
            }
        },
        hover: {
            scale: 1.1,
            boxShadow: "0 0 25px rgba(255, 193, 7, 0.8)",
            transition: {
                type: "spring",
                stiffness: 300
            }
        },
        tap: {
            scale: 0.95
        }
    };

    return (
        <div className="home-container">
            <div className="home-background"></div>
            <div className="home-overlay"></div>
            <motion.div 
                className="home-content"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h2 
                    className="home-subtitle"
                    variants={itemVariants}
                >
                    Resto-Bar
                </motion.h2>
                <motion.h1 
                    className="home-title"
                    variants={itemVariants}
                >
                    LA VIEJA ESTACIÓN
                </motion.h1>
                <motion.div 
                    className="home-divider"
                    variants={itemVariants}
                ></motion.div>
                <motion.p 
                    className="home-tagline"
                    variants={itemVariants}
                >
                    "Sabores que cuentan historias"
                </motion.p>
                <motion.button 
                    className="home-cta-button" 
                    onClick={handleMenuClick}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                >
                    Ver Menú
                </motion.button>
            </motion.div>
        </div>
    );
};

export default HomePage;