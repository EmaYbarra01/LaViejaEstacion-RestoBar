import { Router } from 'express';
import {
  obtenerEmpleados,
  obtenerEmpleadoPorId,
  crearEmpleado,
  actualizarEmpleado,
  desactivarEmpleado,
  eliminarEmpleado,
  registrarAsistencia,
  registrarPago,
  obtenerAsistencias,
  obtenerPagos,
  registrarInasistencia,
  obtenerInasistencias
} from '../controllers/empleados.controllers.js';
import verificarToken from '../auth/token-verify.js';
import verificarRol from '../auth/verificar-rol.js';

const router = Router();

/**
 * Rutas de Empleados
 * Todas las rutas requieren autenticación y rol de SuperAdministrador
 */

// Obtener todos los empleados
// Gerente puede ver para supervisión
router.get(
  '/',
  verificarToken,
  verificarRol(['SuperAdministrador', 'Gerente']),
  obtenerEmpleados
);

// Obtener un empleado por ID
// Gerente puede ver para supervisión
router.get(
  '/:id',
  verificarToken,
  verificarRol(['SuperAdministrador', 'Gerente']),
  obtenerEmpleadoPorId
);

// Crear un nuevo empleado
router.post(
  '/',
  verificarToken,
  verificarRol(['SuperAdministrador']),
  crearEmpleado
);

// Actualizar datos de un empleado
router.put(
  '/:id',
  verificarToken,
  verificarRol(['SuperAdministrador']),
  actualizarEmpleado
);

// Desactivar un empleado (soft delete)
router.patch(
  '/:id/desactivar',
  verificarToken,
  verificarRol(['SuperAdministrador']),
  desactivarEmpleado
);

// Eliminar permanentemente un empleado (solo SuperAdministrador)
router.delete(
  '/:id',
  verificarToken,
  verificarRol(['SuperAdministrador']),
  eliminarEmpleado
);

// Registrar asistencia de un empleado
router.post(
  '/:id/asistencia',
  verificarToken,
  verificarRol(['SuperAdministrador']),
  registrarAsistencia
);

// Registrar pago de un empleado
router.post(
  '/:id/pago',
  verificarToken,
  verificarRol(['SuperAdministrador']),
  registrarPago
);

// Obtener historial de asistencias de un empleado
// Gerente puede ver para supervisión
router.get(
  '/:id/asistencias',
  verificarToken,
  verificarRol(['SuperAdministrador', 'Gerente']),
  obtenerAsistencias
);

// Obtener historial de pagos de un empleado
// Gerente puede ver para supervisión
router.get(
  '/:id/pagos',
  verificarToken,
  verificarRol(['SuperAdministrador', 'Gerente']),
  obtenerPagos
);

// Registrar inasistencia de un empleado
router.post(
  '/:id/inasistencia',
  verificarToken,
  verificarRol(['SuperAdministrador']),
  registrarInasistencia
);

// Obtener historial de inasistencias de un empleado
// Gerente puede ver para supervisión
router.get(
  '/:id/inasistencias',
  verificarToken,
  verificarRol(['SuperAdministrador', 'Gerente']),
  obtenerInasistencias
);

export default router;
