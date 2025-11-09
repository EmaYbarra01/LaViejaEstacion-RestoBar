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
        if (!rolesPermitidos.includes(req.rol)) {
            return res.status(403).json({
                mensaje: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`
            });
        }

        // Si llegamos aquí, el usuario tiene el rol correcto
        next();
    };
};

export default verificarRol;