import { Router } from 'express';
import {
  obtenerEmpleados,
  obtenerEmpleadoPorId,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
  registrarAsistencia,
  registrarPago,
  obtenerAsistencias,
  obtenerPagos
} from '../controllers/empleados.controllers.js';
import verificarToken from '../auth/token-verify.js';
import verificarRol from '../auth/verificar-rol.js';

const router = Router();

/**
 * Rutas de Empleados
 * Todas las rutas requieren autenticación y rol de SuperAdministrador
 */

// Obtener todos los empleados
router.get(
  '/',
  verificarToken,
  verificarRol(['SuperAdministrador']),
  obtenerEmpleados
);

// Obtener un empleado por ID
router.get(
  '/:id',
  verificarToken,
  verificarRol(['SuperAdministrador']),
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

// Eliminar (desactivar) un empleado
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
router.get(
  '/:id/asistencias',
  verificarToken,
  verificarRol(['SuperAdministrador']),
  obtenerAsistencias
);

// Obtener historial de pagos de un empleado
router.get(
  '/:id/pagos',
  verificarToken,
  verificarRol(['SuperAdministrador']),
  obtenerPagos
);

export default router;
