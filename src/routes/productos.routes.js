import { Router } from 'express';
import {
    obtenerProductos,
    obtenerUnProducto,
    obtenerProductosPorCategoria,
    obtenerProductosDisponibles,
    obtenerProductosConBajoStock,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    activarDesactivarProducto,
    actualizarStock,
    buscarProductos
} from '../controllers/productos.controllers.js';
import validarProducto from '../helpers/validarProducto.js';
import verificarToken from '../auth/token-verify.js';
import verificarRol from '../auth/verificar-rol.js';

const router = Router();

/**
 * Rutas de Productos para La Vieja Estación - RestoBar
 * Implementa: HU2, HU10, RF4
 */

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Obtener todos los productos
 *     tags: [Productos]
 *     description: Obtiene lista completa de productos (requiere autenticación)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 productos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Producto'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/productos/menu:
 *   get:
 *     summary: Obtener menú público
 *     tags: [Productos]
 *     description: Obtiene productos disponibles (ruta pública, accesible desde QR)
 *     responses:
 *       200:
 *         description: Menú de productos disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 productos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Producto'
 */

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crear nuevo producto
 *     tags: [Productos]
 *     description: Crea un nuevo producto (solo Admin y Gerente)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - precio
 *               - categoria
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Pizza Margarita"
 *               precio:
 *                 type: number
 *                 example: 15000
 *               categoria:
 *                 type: string
 *                 enum: [Comida, Bebida, Postre, Entrada]
 *                 example: "Comida"
 *               descripcion:
 *                 type: string
 *                 example: "Pizza con mozzarella y albahaca"
 *               imagen:
 *                 type: string
 *                 example: "https://example.com/pizza.jpg"
 *               disponible:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Actualizar producto
 *     tags: [Productos]
 *     description: Actualiza un producto existente (solo Admin y Gerente)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Producto'
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Eliminar producto
 *     tags: [Productos]
 *     description: Elimina un producto (solo Admin y Gerente)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

// Rutas públicas (accesibles por clientes y QR)
// HU1, HU2: Menú digital accesible desde QR
router.get('/productos/menu', obtenerProductosDisponibles);
router.get('/productos/menu/categoria/:categoria', obtenerProductosPorCategoria);

// Rutas protegidas - Consulta (Mozo, Cajero, Cocina, Gerente, Admin)
router.get('/productos', verificarToken, obtenerProductos);
router.get('/productos/buscar', verificarToken, buscarProductos);
router.get('/productos/bajo-stock', verificarToken, verificarRol(['Administrador', 'Gerente']), obtenerProductosConBajoStock);
router.get('/productos/:id', verificarToken, obtenerUnProducto);

// Rutas protegidas - Gestión (Solo Administrador y Gerente)
// RF4: Gestionar menú de productos
router.post('/productos', verificarToken, verificarRol(['Administrador', 'Gerente']), validarProducto, crearProducto);
router.put('/productos/:id', verificarToken, verificarRol(['Administrador', 'Gerente']), validarProducto, actualizarProducto);
router.delete('/productos/:id', verificarToken, verificarRol(['Administrador', 'Gerente']), eliminarProducto);

// HU10: Activar/desactivar productos en tiempo real
router.patch('/productos/:id/disponibilidad', verificarToken, verificarRol(['Administrador', 'Gerente']), activarDesactivarProducto);

// Actualizar stock (Administrador, Gerente)
router.patch('/productos/:id/stock', verificarToken, verificarRol(['Administrador', 'Gerente']), actualizarStock);

export default router;