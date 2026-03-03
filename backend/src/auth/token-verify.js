import jwt from 'jsonwebtoken';

const verificarToken = (req, res, next) => {
    console.log('\n' + '='.repeat(80));
    console.log('🔐 VERIFICAR TOKEN - TIMESTAMP:', new Date().toISOString());
    console.log('📍 Método:', req.method, '| URL:', req.originalUrl);
    console.log('='.repeat(80));
    
    // Obtener el token de cookies o del header Authorization
    let token = req.cookies?.jwt;
    
    // Si no hay token en cookies, buscar en el header Authorization
    if (!token) {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        console.log('[DEBUG] Header Authorization:', authHeader);
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remover "Bearer " del inicio
            console.log('[DEBUG] Token extraído del header');
        }
    }
    
    if(!token){
        return res.status(401).json({
            mensaje: "No hay token en la peticion"
        })
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY)
        
        // Asignar datos del usuario al request desde el token
        // Normalizar propiedades: algunas partes del código esperan 'rol',
        // otras 'role' o 'username'. Proporcionamos todas las variantes.
        req.user = {
            id: payload.usuarioId,
            username: payload.nombreUsuario,
            nombreUsuario: payload.nombreUsuario,
            // mantener ambas claves de rol para compatibilidad
            rol: payload.rol,
            role: payload.rol
        };

        // Mantener compatibilidad con código existente en otros lugares
        req.id = payload.usuarioId;
        req.nombre = payload.nombreUsuario;
        req.rol = payload.rol;
        
        console.log('[DEBUG] Usuario autenticado:', {
            id: req.id,
            nombre: req.nombre,
            rol: req.rol
        });
        
    }
    catch (error) {
        console.log(error);
        return res.status(401).json({
            mensaje: "Token no valido" 
        })      
    }
    next();
}

export default verificarToken;