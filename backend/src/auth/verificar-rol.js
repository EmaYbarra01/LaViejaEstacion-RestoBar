const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        // Verificar que el usuario esté autenticado (debería venir del middleware verificarToken)
        if (!req.id) {
            return res.status(401).json({
                mensaje: "Usuario no autenticado"
            });
        }

        // Verificar que el usuario tenga un rol asignado
        if (!req.rol) {
            return res.status(403).json({
                mensaje: "Usuario sin rol asignado"
            });
        }

        // Verificar que el rol del usuario esté en los roles permitidos
        // Soporta roles con números (ej: "Mozo1" matchea con "Mozo")
        console.log(`[verificar-rol] Verificando rol: "${req.rol}" contra [${rolesPermitidos.join(', ')}]`);
        
        const roleMatch = rolesPermitidos.some(rolPermitido => 
            req.rol === rolPermitido || req.rol.startsWith(rolPermitido)
        );
        
        console.log(`[verificar-rol] Match encontrado: ${roleMatch}`);
        
        if (!roleMatch) {
            return res.status(403).json({
                mensaje: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`
            });
        }

        // Si llegamos aquí, el usuario tiene el rol correcto
        next();
    };
};

export default verificarRol;