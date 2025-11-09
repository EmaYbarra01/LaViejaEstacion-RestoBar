import jwt from 'jsonwebtoken';

const generarToken = (idUsuario, nombreUsuario, rolUsuario) => {
    return new Promise((resolve, reject) => {
        console.log('🎫 Iniciando generación de token...');
        console.log('🎫 Parámetros recibidos:', { idUsuario, nombreUsuario, rolUsuario });
        
        const payload = { 
            usuarioId: idUsuario, 
            nombreUsuario: nombreUsuario,
            rol: rolUsuario 
        };

        console.log('🎫 Payload del token:', payload);
        console.log('🔑 JWT_SECRET_KEY existe:', !!process.env.JWT_SECRET_KEY);
        console.log('🔑 JWT_SECRET_KEY value:', process.env.JWT_SECRET_KEY ? 'Sí definida' : 'NO DEFINIDA');

        if (!process.env.JWT_SECRET_KEY) {
            console.error('❌ JWT_SECRET_KEY no está definida en las variables de entorno');
            reject(new Error('JWT_SECRET_KEY no está configurada'));
            return;
        }

        jwt.sign(
            payload,
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: '1h' // El token expirará en 1 hora
            },
            (error, token) => {
                if (error) {
                    console.error('❌ Error al generar el token:', error);
                    reject(new Error('Error al generar el token: ' + error.message));
                } else {
                    console.log('✅ Token generado exitosamente');
                    resolve(token);
                }
            }
        );
    });
};

export default generarToken;