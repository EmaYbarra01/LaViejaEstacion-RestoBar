/**
 * ============================================================================
 * RUTAS DE PEDIDOS - HU3 Y HU4
 * ============================================================================
 * 
 * Define las rutas HTTP para las operaciones de pedidos
 * relacionadas con las Historias de Usuario 3 y 4:
 * 
 * - HU3: Registro de pedidos por el mozo
 * - HU4: Envío automático a cocina
 * 
 * SEGURIDAD:
 * - Todas las rutas requieren autenticación JWT (middleware verificarToken)
 * - Control de acceso basado en roles (middleware verificarRol)
 * - Validación de datos de entrada
 * 
 * @module routes/pedidos-HU3-HU4
 */

import express from 'express';
import {
    crearPedido,
    obtenerMisPedidos,
    actualizarItemsPedido,
    cancelarPedido,
    obtenerPedidosCocina
} from '../controllers/pedidos.controllers.HU3-HU4.js';

// Middlewares de autenticación y autorización
import { verificarToken } from '../auth/token-verify.js';
import { verificarRol } from '../auth/verificar-rol.js';

const router = express.Router();

// ============================================================================
// MIDDLEWARE GLOBAL: TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================================================
/**
 * Aplica verificación de token JWT a todas las rutas de este router
 * Si el token no es válido, retorna 401 Unauthorized
 * Si es válido, añade req.usuario con los datos del usuario
 */
router.use(verificarToken);

// ============================================================================
// RUTAS HU3: REGISTRO DE PEDIDOS (MOZO)
// ============================================================================

/**
 * @route   POST /api/pedidos
 * @desc    Crear un nuevo pedido (HU3)
 * @access  Private - Solo Mozo y Administrador (RN1, RN5)
 * 
 * @security
 * - Requiere JWT válido
 * - Requiere rol: Mozo o Administrador
 * 
 * @body    {Object} Datos del pedido
 *   @property {String} mesaId - ID de la mesa (requerido)
 *   @property {Array} productos - Array de productos (requerido)
 *     @property {String} productoId - ID del producto
 *     @property {Number} cantidad - Cantidad solicitada
 *     @property {String} observaciones - Observaciones del producto (opcional)
 *   @property {String} observacionesGenerales - Observaciones generales (opcional)
 * 
 * @returns {Object} 201 - Pedido creado exitosamente
 * @returns {Object} 400 - Datos inválidos
 * @returns {Object} 403 - Sin permisos
 * @returns {Object} 404 - Mesa o producto no encontrado
 * @returns {Object} 500 - Error del servidor
 * 
 * @example
 * POST /api/pedidos
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * Content-Type: application/json
 * 
 * {
 *   "mesaId": "507f1f77bcf86cd799439011",
 *   "productos": [
 *     {
 *       "productoId": "507f191e810c19729de860ea",
 *       "cantidad": 2,
 *       "observaciones": "Sin cebolla"
 *     },
 *     {
 *       "productoId": "507f191e810c19729de860eb",
 *       "cantidad": 1,
 *       "observaciones": "Punto medio"
 *     }
 *   ],
 *   "observacionesGenerales": "Cliente tiene prisa"
 * }
 */
router.post(
    '/',
    verificarRol(['Mozo', 'Administrador']), // RN1: Solo mozos pueden crear pedidos
    crearPedido
);

/**
 * @route   GET /api/pedidos/mis-pedidos
 * @desc    Obtener pedidos del mozo autenticado (HU3)
 * @access  Private - Solo Mozo y Administrador
 * 
 * @security
 * - Requiere JWT válido
 * - Requiere rol: Mozo o Administrador
 * 
 * @query   {String} estado - Filtrar por estado (opcional)
 * @query   {Date} fecha - Filtrar por fecha (opcional)
 * 
 * @returns {Object} 200 - Lista de pedidos
 * @returns {Object} 500 - Error del servidor
 * 
 * @example
 * GET /api/pedidos/mis-pedidos
 * GET /api/pedidos/mis-pedidos?estado=Pendiente
 * GET /api/pedidos/mis-pedidos?fecha=2025-11-11
 * GET /api/pedidos/mis-pedidos?estado=Listo&fecha=2025-11-11
 */
router.get(
    '/mis-pedidos',
    verificarRol(['Mozo', 'Administrador']),
    obtenerMisPedidos
);

/**
 * @route   PUT /api/pedidos/:id/items
 * @desc    Actualizar productos de un pedido pendiente (HU3)
 * @access  Private - Solo el mozo que creó el pedido o Admin
 * 
 * @security
 * - Requiere JWT válido
 * - Requiere rol: Mozo o Administrador
 * - Solo puede editar el mozo que creó el pedido
 * - Solo se puede editar si el pedido está en estado "Pendiente"
 * 
 * @param   {String} id - ID del pedido
 * @body    {Object} Nuevos datos
 *   @property {Array} productos - Nuevo array de productos
 * 
 * @returns {Object} 200 - Pedido actualizado
 * @returns {Object} 400 - No se puede editar (estado inválido)
 * @returns {Object} 403 - Sin permisos
 * @returns {Object} 404 - Pedido no encontrado
 * @returns {Object} 500 - Error del servidor
 * 
 * @example
 * PUT /api/pedidos/507f1f77bcf86cd799439011/items
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * 
 * {
 *   "productos": [
 *     {
 *       "productoId": "507f191e810c19729de860ea",
 *       "cantidad": 3,
 *       "observaciones": "Bien cocido"
 *     }
 *   ]
 * }
 */
router.put(
    '/:id/items',
    verificarRol(['Mozo', 'Administrador']),
    actualizarItemsPedido
);

/**
 * @route   DELETE /api/pedidos/:id
 * @desc    Cancelar un pedido (HU3)
 * @access  Private - Solo el mozo que creó el pedido o Admin
 * 
 * @security
 * - Requiere JWT válido
 * - Requiere rol: Mozo o Administrador
 * - Solo el mozo que creó el pedido puede cancelarlo
 * - Solo se puede cancelar si está en estado "Pendiente"
 * 
 * @param   {String} id - ID del pedido a cancelar
 * @body    {Object} Datos de cancelación
 *   @property {String} motivo - Motivo de la cancelación (opcional)
 * 
 * @returns {Object} 200 - Pedido cancelado
 * @returns {Object} 400 - No se puede cancelar (estado inválido)
 * @returns {Object} 403 - Sin permisos
 * @returns {Object} 404 - Pedido no encontrado
 * @returns {Object} 500 - Error del servidor
 * 
 * @example
 * DELETE /api/pedidos/507f1f77bcf86cd799439011
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * 
 * {
 *   "motivo": "Cliente se retiró del restaurante"
 * }
 */
router.delete(
    '/:id',
    verificarRol(['Mozo', 'Administrador']),
    cancelarPedido
);

// ============================================================================
// RUTAS HU4: VISTA DE COCINA
// ============================================================================

/**
 * @route   GET /api/pedidos/cocina
 * @desc    Obtener pedidos para la pantalla de cocina (HU4)
 * @access  Private - Solo Cocina y Administrador
 * 
 * @security
 * - Requiere JWT válido
 * - Requiere rol: Cocina o Administrador
 * 
 * @query   {String} estadoCocina - Filtrar por estado de cocina (opcional)
 *          Valores: 'Pendiente', 'En Preparación', 'Listo'
 * 
 * @returns {Object} 200 - Lista de pedidos ordenados cronológicamente
 * @returns {Object} 500 - Error del servidor
 * 
 * @description
 * Esta ruta implementa la HU4: Los pedidos se envían automáticamente
 * a la pantalla de cocina. Los pedidos se ordenan por fecha de creación
 * (más antiguos primero) para que cocina prepare en orden de llegada.
 * 
 * @example
 * GET /api/pedidos/cocina
 * GET /api/pedidos/cocina?estadoCocina=Pendiente
 * GET /api/pedidos/cocina?estadoCocina=En Preparación
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "numeroPedido": "PED-20251111-0001",
 *       "mesa": { "numero": 5 },
 *       "mozo": { "nombre": "Juan" },
 *       "productos": [...],
 *       "estadoCocina": "Pendiente",
 *       "fechaCreacion": "2025-11-11T10:30:00Z"
 *     }
 *   ],
 *   "total": 5
 * }
 */
router.get(
    '/cocina',
    verificarRol(['Cocina', 'Administrador']), // RN5: Control de acceso por rol
    obtenerPedidosCocina
);

// ============================================================================
// DOCUMENTACIÓN ADICIONAL
// ============================================================================

/**
 * FLUJO COMPLETO HU3 + HU4:
 * 
 * 1. El mozo inicia sesión y obtiene un JWT
 * 2. El mozo selecciona una mesa libre
 * 3. El mozo agrega productos al pedido
 * 4. El mozo confirma el pedido (POST /api/pedidos)
 * 5. El sistema valida:
 *    - Permisos del mozo (RN1, RN5)
 *    - Estado de la mesa (RN4)
 *    - Disponibilidad de productos (RN7, HU10)
 * 6. El sistema crea el pedido y cambia la mesa a "Ocupada"
 * 7. El sistema emite un evento Socket.io a cocina (HU4) ✓
 * 8. Cocina recibe la notificación automáticamente
 * 9. El mozo puede ver sus pedidos en tiempo real
 * 
 * CRITERIOS DE ACEPTACIÓN CUMPLIDOS:
 * 
 * HU3:
 * ✓ El mozo puede seleccionar productos del menú y agregarlos al pedido
 * ✓ Puede editar o eliminar ítems antes de enviar
 * ✓ El pedido muestra número de mesa y nombre del mozo
 * ✓ Al confirmar, el pedido se envía automáticamente a cocina y caja
 * ✓ El pedido asocia automáticamente la mesa con estado "ocupada"
 * 
 * HU4:
 * ✓ El pedido aparece en la lista de pedidos pendientes en cocina
 * ✓ Se muestran los detalles (mesa, hora, productos, cantidad y observaciones)
 * ✓ Los pedidos se ordenan cronológicamente
 * ✓ No hay duplicación de pedidos
 * ✓ El pedido cambia el estado de la mesa a "ocupada"
 */

// ============================================================================
// EXPORTAR ROUTER
// ============================================================================

export default router;
