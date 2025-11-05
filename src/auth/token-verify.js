import jwt from 'jsonwebtoken';

/**
 * Middleware para verificar y validar tokens JWT
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para pasar al siguiente middleware
 * @returns {void}
 */
const verificarToken = (req, res, next) => {
    try {
        // Obtener el token de las cookies o del header Authorization
        let token = req.cookies?.jwt;
        
        // Si no hay token en cookies, intentar obtenerlo del header
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        
        // Validar que exista un token
        if (!token) {
            return res.status(401).json({
                ok: false,
                mensaje: "No se proporcionó token de autenticación"
            });
        }

        // Verificar que existe la clave secreta
        if (!process.env.JWT_SECRET_KEY) {
            console.error('JWT_SECRET_KEY no está definida en las variables de entorno');
            return res.status(500).json({
                ok: false,
                mensaje: "Error en la configuración del servidor"
            });
        }

        // Verificar y decodificar el token
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        // Validar que el payload contiene la información necesaria
        if (!payload.usuarioId || !payload.rol) {
            return res.status(401).json({
                ok: false,
                mensaje: "Token inválido: información incompleta"
            });
        }
        
        // Asignar datos del usuario al request desde el token
        req.user = {
            id: payload.usuarioId,
            username: payload.nombreUsuario,
            role: payload.rol,
            email: payload.email
        };
        
        // Mantener compatibilidad con código existente
        req.id = payload.usuarioId;
        req.nombre = payload.nombreUsuario;
        req.rol = payload.rol;
        
        next();
        
    } catch (error) {
        // Manejo de errores específicos de JWT
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                ok: false,
                mensaje: "Token expirado",
                codigo: "TOKEN_EXPIRED"
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                ok: false,
                mensaje: "Token inválido",
                codigo: "TOKEN_INVALID"
            });
        }
        
        if (error.name === 'NotBeforeError') {
            return res.status(401).json({
                ok: false,
                mensaje: "Token aún no es válido",
                codigo: "TOKEN_NOT_ACTIVE"
            });
        }
        
        // Error genérico
        console.error('Error al verificar token:', error);
        return res.status(401).json({
            ok: false,
            mensaje: "Error al verificar el token de autenticación"
        });
    }
};

export default verificarToken;