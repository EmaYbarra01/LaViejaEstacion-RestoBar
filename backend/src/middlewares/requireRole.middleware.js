/**
 * Middleware para validar roles de usuario
 * Permite proteger rutas específicas por rol
 * 
 * Uso:
 * router.get('/ruta', requireAuth, requireRole(['EncargadoCocina', 'Administrador']), controller)
 */

/**
 * Verifica que el usuario tenga uno de los roles permitidos
 * @param {Array<string>|string} rolesPermitidos - Rol o array de roles permitidos
 * @returns {Function} Middleware de Express
 */
export const requireRole = (rolesPermitidos) => {
  return (req, res, next) => {
    try {
      // Verificar que existe req.user (debe venir del middleware de autenticación)
      if (!req.user) {
        return res.status(401).json({
          mensaje: 'No autenticado. Token requerido.'
        });
      }

      // Convertir a array si es un string
      const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];

      // Verificar si el usuario tiene uno de los roles permitidos
      if (!roles.includes(req.user.rol)) {
        return res.status(403).json({
          mensaje: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`,
          rolActual: req.user.rol
        });
      }

      // Usuario autorizado
      next();
    } catch (error) {
      console.error('Error en middleware requireRole:', error);
      return res.status(500).json({
        mensaje: 'Error interno al validar permisos'
      });
    }
  };
};

/**
 * Alias para roles específicos comunes
 */
export const requireCocina = requireRole(['EncargadoCocina', 'Cocina', 'Administrador']);
export const requireCajero = requireRole(['Cajero', 'Administrador']);
export const requireMozo = requireRole(['Mozo', 'Mozo1', 'Mozo2', 'Administrador']);
export const requireAdmin = requireRole(['Administrador', 'SuperAdministrador']);

export default requireRole;
