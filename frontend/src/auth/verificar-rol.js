/**
 * Middleware para verificar roles de usuario
 * Debe usarse después del middleware verificarToken
 * @param {...string} rolesPermitidos - Lista de roles que tienen acceso al recurso
 * @returns {Function} Middleware de Express
 * @example
 * // Permitir solo administradores
 * router.get('/admin', verificarToken, verificarRol('admin'), controller)
 * 
 * // Permitir múltiples roles
 * router.get('/ventas', verificarToken, verificarRol('admin', 'cajero'), controller)
 */
const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        try {
            // Validar que hay roles permitidos especificados
            if (!rolesPermitidos || rolesPermitidos.length === 0) {
                console.error('verificarRol llamado sin roles permitidos');
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error en la configuración de permisos"
                });
            }

            // Verificar que el usuario esté autenticado (debería venir del middleware verificarToken)
            if (!req.id && !req.user?.id) {
                return res.status(401).json({
                    ok: false,
                    mensaje: "Usuario no autenticado. Debe iniciar sesión primero",
                    codigo: "NO_AUTENTICADO"
                });
            }

            // Obtener el rol del usuario (compatible con ambos formatos)
            const rolUsuario = req.rol || req.user?.role;

            // Verificar que el usuario tenga un rol asignado
            if (!rolUsuario) {
                return res.status(403).json({
                    ok: false,
                    mensaje: "Usuario sin rol asignado",
                    codigo: "SIN_ROL"
                });
            }

            // Normalizar roles a minúsculas para comparación
            const rolesNormalizados = rolesPermitidos.map(r => r.toLowerCase());
            const rolUsuarioNormalizado = rolUsuario.toLowerCase();

            // Verificar que el rol del usuario esté en los roles permitidos
            if (!rolesNormalizados.includes(rolUsuarioNormalizado)) {
                console.warn(`Acceso denegado para usuario ${req.user?.username || req.nombre} con rol ${rolUsuario}`);
                return res.status(403).json({
                    ok: false,
                    mensaje: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`,
                    codigo: "ROL_INSUFICIENTE",
                    rolRequerido: rolesPermitidos,
                    rolActual: rolUsuario
                });
            }

            // Logging opcional para auditoría
            if (process.env.NODE_ENV === 'development') {
                console.log(`✓ Acceso concedido a ${req.user?.username || req.nombre} (${rolUsuario})`);
            }

            // Si llegamos aquí, el usuario tiene el rol correcto
            next();
            
        } catch (error) {
            console.error('Error en verificarRol:', error);
            return res.status(500).json({
                ok: false,
                mensaje: "Error al verificar permisos de usuario"
            });
        }
    };
};

export default verificarRol;