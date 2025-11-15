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

      // DEBUG: mostrar user y roles permitidos para diagnosticar 403
      try {
        console.log('[requireRole] req.user:', JSON.stringify(req.user));
        console.log('[requireRole] rolesPermitidos:', JSON.stringify(rolesPermitidos));
        console.log('[requireRole] rol recibido:', req.user.rol || req.user.role);
      } catch (e) {
        // no bloquear por error de logging
      }

      // Convertir a array si es un string
      const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];

      // Verificar si el usuario tiene uno de los roles permitidos
      // Aceptar tanto `req.user.rol` como `req.user.role`, comparar case-insensitive
      const userRol = (req.user && (req.user.rol || req.user.role || '')).toString();
      const userRolNorm = userRol.toLowerCase();

      const allowed = roles.some(r => {
        if (!r) return false;
        return r.toString().toLowerCase() === userRolNorm;
      });

      if (!allowed) {
        console.log('[requireRole] Acceso denegado. Rol actual:', userRol, 'Roles permitidos:', roles);
        return res.status(403).json({
          mensaje: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`,
          rolActual: req.user.rol || req.user.role || null
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
