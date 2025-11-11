/**
 * ============================================================================
 * CONTROLADOR DE PEDIDOS - HU3 Y HU4
 * ============================================================================
 * 
 * Este controlador implementa las Historias de Usuario 3 y 4:
 * 
 * HU3: Como mozo, quiero poder registrar el pedido del cliente desde mi 
 *      aplicación, para enviar la orden de manera rápida y precisa sin 
 *      anotar en papel.
 * 
 * HU4: Como mozo, quiero que el pedido que registro se envíe automáticamente 
 *      a la pantalla de cocina, para que los cocineros comiencen a prepararlo 
 *      sin demoras ni confusiones.
 * 
 * @module controllers/pedidos.HU3-HU4
 * @requires models/pedidoSchema
 * @requires models/mesaSchema
 * @requires models/productoSchema
 * @requires models/usuarioSchema
 */

import Pedido from '../models/pedidoSchema.js';
import Mesa from '../models/mesaSchema.js';
import Producto from '../models/productoSchema.js';
import Usuario from '../models/usuarioSchema.js';

// ============================================================================
// HU3: CREAR PEDIDO (MOZO)
// ============================================================================

/**
 * Crea un nuevo pedido desde la aplicación del mozo (HU3)
 * 
 * FLUJO:
 * 1. Validar que el usuario tenga rol de Mozo (RN1, RN5)
 * 2. Validar que la mesa existe y no está ocupada (RN4)
 * 3. Validar que todos los productos existen y están disponibles (RN7)
 * 4. Calcular precios y subtotales
 * 5. Generar número de pedido automático
 * 6. Crear el pedido en la base de datos
 * 7. Cambiar estado de mesa a "Ocupada" (RN4)
 * 8. Enviar notificación a cocina (HU4) - mediante Socket.io
 * 9. Registrar en historial de estados
 * 
 * @route POST /api/pedidos
 * @access Private - Solo rol Mozo y Administrador (RN1, RN5)
 * 
 * @param {Object} req.body - Datos del pedido
 * @param {String} req.body.mesaId - ID de la mesa
 * @param {Array} req.body.productos - Array de productos [{productoId, cantidad, observaciones}]
 * @param {String} req.body.observacionesGenerales - Observaciones del pedido completo
 * 
 * @returns {Object} 201 - Pedido creado exitosamente
 * @returns {Object} 400 - Datos inválidos o mesa ocupada
 * @returns {Object} 403 - Usuario sin permisos (RN5)
 * @returns {Object} 404 - Mesa o producto no encontrado
 * @returns {Object} 500 - Error del servidor
 * 
 * @example
 * // Request Body:
 * {
 *   "mesaId": "507f1f77bcf86cd799439011",
 *   "productos": [
 *     {
 *       "productoId": "507f191e810c19729de860ea",
 *       "cantidad": 2,
 *       "observaciones": "Sin cebolla"
 *     }
 *   ],
 *   "observacionesGenerales": "Cliente tiene prisa"
 * }
 * 
 * // Response 201:
 * {
 *   "success": true,
 *   "mensaje": "Pedido creado exitosamente y enviado a cocina",
 *   "data": {
 *     "_id": "...",
 *     "numeroPedido": "PED-20251111-0001",
 *     "mesa": {...},
 *     "productos": [...],
 *     "total": 1500
 *   }
 * }
 */
export const crearPedido = async (req, res) => {
    try {
        // ====================================================================
        // 1. EXTRAER DATOS DEL REQUEST
        // ====================================================================
        const { mesaId, productos, observacionesGenerales } = req.body;
        
        // Obtener datos del usuario autenticado desde el middleware JWT
        const mozoId = req.usuario.id;      // ID del usuario
        const mozoRol = req.usuario.rol;    // Rol del usuario

        console.log(`[HU3] Iniciando creación de pedido - Mozo ID: ${mozoId}`);

        // ====================================================================
        // 2. VALIDACIÓN DE PERMISOS (RN1, RN5)
        // ====================================================================
        // Solo mozos y administradores pueden crear pedidos
        if (mozoRol !== 'Mozo' && mozoRol !== 'Administrador') {
            console.log(`[HU3] RECHAZADO - Usuario ${mozoId} con rol ${mozoRol} intentó crear pedido`);
            return res.status(403).json({
                success: false,
                mensaje: 'Solo los mozos pueden crear pedidos (RN1)',
                error: 'PERMISO_DENEGADO'
            });
        }

        // ====================================================================
        // 3. VALIDACIÓN DE DATOS DE ENTRADA
        // ====================================================================
        
        // Validar que se proporcionó una mesa
        if (!mesaId) {
            return res.status(400).json({
                success: false,
                mensaje: 'La mesa es requerida',
                error: 'MESA_REQUERIDA'
            });
        }

        // Validar que hay productos en el pedido
        if (!productos || !Array.isArray(productos) || productos.length === 0) {
            return res.status(400).json({
                success: false,
                mensaje: 'El pedido debe tener al menos un producto',
                error: 'PRODUCTOS_REQUERIDOS'
            });
        }

        // Validar que cada producto tenga cantidad
        for (const item of productos) {
            if (!item.productoId) {
                return res.status(400).json({
                    success: false,
                    mensaje: 'Cada producto debe tener un ID válido',
                    error: 'PRODUCTO_ID_REQUERIDO'
                });
            }
            if (!item.cantidad || item.cantidad < 1) {
                return res.status(400).json({
                    success: false,
                    mensaje: 'La cantidad de cada producto debe ser al menos 1',
                    error: 'CANTIDAD_INVALIDA'
                });
            }
        }

        // ====================================================================
        // 4. VERIFICAR QUE LA MESA EXISTE (RF3)
        // ====================================================================
        const mesa = await Mesa.findById(mesaId);
        
        if (!mesa) {
            console.log(`[HU3] ERROR - Mesa ${mesaId} no encontrada`);
            return res.status(404).json({
                success: false,
                mensaje: 'Mesa no encontrada',
                error: 'MESA_NO_ENCONTRADA'
            });
        }

        // ====================================================================
        // 5. VALIDAR ESTADO DE LA MESA (RN4)
        // ====================================================================
        // La mesa debe estar "Libre" para crear un nuevo pedido
        if (mesa.estado === 'Ocupada') {
            console.log(`[HU3] ERROR - Mesa ${mesa.numero} ya está ocupada`);
            return res.status(400).json({
                success: false,
                mensaje: `La mesa ${mesa.numero} ya está ocupada. No se puede crear un nuevo pedido.`,
                error: 'MESA_OCUPADA'
            });
        }

        if (mesa.estado === 'Reservada') {
            console.log(`[HU3] ADVERTENCIA - Mesa ${mesa.numero} está reservada`);
            return res.status(400).json({
                success: false,
                mensaje: `La mesa ${mesa.numero} está reservada.`,
                error: 'MESA_RESERVADA'
            });
        }

        // ====================================================================
        // 6. OBTENER INFORMACIÓN DEL MOZO
        // ====================================================================
        const mozo = await Usuario.findById(mozoId).select('nombre apellido');
        
        if (!mozo) {
            console.log(`[HU3] ERROR - Mozo ${mozoId} no encontrado`);
            return res.status(404).json({
                success: false,
                mensaje: 'Mozo no encontrado en el sistema',
                error: 'MOZO_NO_ENCONTRADO'
            });
        }

        // ====================================================================
        // 7. VALIDAR Y PROCESAR PRODUCTOS (RN7, RF4)
        // ====================================================================
        let subtotal = 0;
        const productosValidados = [];

        console.log(`[HU3] Validando ${productos.length} productos...`);

        for (const item of productos) {
            // Buscar el producto en la base de datos
            const producto = await Producto.findById(item.productoId);

            // Verificar que el producto existe
            if (!producto) {
                console.log(`[HU3] ERROR - Producto ${item.productoId} no encontrado`);
                return res.status(404).json({
                    success: false,
                    mensaje: `Producto con ID ${item.productoId} no encontrado`,
                    error: 'PRODUCTO_NO_ENCONTRADO'
                });
            }

            // Verificar que el producto está disponible (RN7, HU10)
            if (!producto.disponible) {
                console.log(`[HU3] ERROR - Producto "${producto.nombre}" no disponible`);
                return res.status(400).json({
                    success: false,
                    mensaje: `El producto "${producto.nombre}" no está disponible actualmente`,
                    error: 'PRODUCTO_NO_DISPONIBLE',
                    productoId: producto._id,
                    productoNombre: producto.nombre
                });
            }

            // Calcular subtotal del item
            const precioUnitario = producto.precio;
            const cantidad = item.cantidad;
            const subtotalItem = precioUnitario * cantidad;
            
            // Sumar al subtotal general
            subtotal += subtotalItem;

            // Agregar al array de productos validados
            productosValidados.push({
                producto: producto._id,
                nombre: producto.nombre,
                cantidad: cantidad,
                precioUnitario: precioUnitario,
                subtotal: subtotalItem,
                observaciones: item.observaciones || ''
            });

            console.log(`[HU3] ✓ Producto validado: ${producto.nombre} x${cantidad} = $${subtotalItem}`);
        }

        console.log(`[HU3] Subtotal calculado: $${subtotal}`);

        // ====================================================================
        // 8. GENERAR NÚMERO DE PEDIDO AUTOMÁTICO
        // ====================================================================
        const numeroPedido = await Pedido.generarNumeroPedido();
        console.log(`[HU3] Número de pedido generado: ${numeroPedido}`);

        // ====================================================================
        // 9. CREAR EL PEDIDO EN LA BASE DE DATOS
        // ====================================================================
        const nuevoPedido = new Pedido({
            numeroPedido: numeroPedido,
            mesa: mesaId,
            numeroMesa: mesa.numero,
            mozo: mozoId,
            nombreMozo: `${mozo.nombre} ${mozo.apellido}`,
            productos: productosValidados,
            subtotal: subtotal,
            total: subtotal, // Sin descuento por ahora (se aplica al pagar)
            estado: 'Pendiente',
            estadoCocina: 'Pendiente',
            estadoCaja: 'Pendiente',
            observacionesGenerales: observacionesGenerales || '',
            fechaCreacion: new Date()
        });

        // Guardar en la base de datos
        await nuevoPedido.save();
        console.log(`[HU3] ✓ Pedido guardado en BD con ID: ${nuevoPedido._id}`);

        // ====================================================================
        // 10. CAMBIAR ESTADO DE MESA A "OCUPADA" (RN4)
        // ====================================================================
        mesa.estado = 'Ocupada';
        mesa.pedidoActual = nuevoPedido._id;
        await mesa.save();
        console.log(`[HU3] ✓ Mesa ${mesa.numero} marcada como OCUPADA`);

        // ====================================================================
        // 11. POPULAR DATOS PARA LA RESPUESTA
        // ====================================================================
        const pedidoCompleto = await Pedido.findById(nuevoPedido._id)
            .populate('mesa', 'numero ubicacion capacidad estado')
            .populate('mozo', 'nombre apellido')
            .populate('productos.producto', 'nombre categoria foto precio');

        // ====================================================================
        // 12. ENVIAR A COCINA (HU4) - NOTIFICACIÓN EN TIEMPO REAL
        // ====================================================================
        // Si Socket.io está configurado, emitir evento para cocina
        if (req.app.get('io')) {
            console.log(`[HU4] 📡 Enviando pedido a cocina vía Socket.io...`);
            
            // Emitir evento a todos los clientes conectados en el namespace de cocina
            req.app.get('io').emit('nuevo-pedido-cocina', {
                pedido: pedidoCompleto,
                mensaje: `Nuevo pedido #${numeroPedido} - Mesa ${mesa.numero}`,
                timestamp: new Date()
            });
            
            console.log(`[HU4] ✓ Pedido enviado a cocina automáticamente`);
        } else {
            console.log(`[HU4] ⚠ Socket.io no configurado - Pedido no enviado en tiempo real`);
        }

        // ====================================================================
        // 13. EMITIR EVENTO DE ACTUALIZACIÓN DE MESA
        // ====================================================================
        if (req.app.get('io')) {
            req.app.get('io').emit('mesa-actualizada', {
                mesaId: mesa._id,
                numeroMesa: mesa.numero,
                estado: mesa.estado,
                pedidoId: nuevoPedido._id
            });
        }

        // ====================================================================
        // 14. RESPUESTA EXITOSA
        // ====================================================================
        console.log(`[HU3] ✓ Pedido creado exitosamente`);
        console.log(`[HU4] ✓ Pedido enviado automáticamente a cocina`);
        
        return res.status(201).json({
            success: true,
            mensaje: 'Pedido creado exitosamente y enviado a cocina',
            data: pedidoCompleto,
            meta: {
                numeroPedido: numeroPedido,
                mesa: mesa.numero,
                mozo: `${mozo.nombre} ${mozo.apellido}`,
                subtotal: subtotal,
                cantidadProductos: productos.length,
                estadoCocina: 'Pendiente',
                enviadoCocina: true // HU4 cumplida
            }
        });

    } catch (error) {
        // ====================================================================
        // MANEJO DE ERRORES
        // ====================================================================
        console.error('[HU3] ERROR al crear pedido:', error);
        
        return res.status(500).json({
            success: false,
            mensaje: 'Error interno del servidor al crear el pedido',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// ============================================================================
// OBTENER PEDIDOS DEL MOZO ACTUAL (HU3)
// ============================================================================

/**
 * Obtiene los pedidos creados por el mozo autenticado
 * El mozo puede ver solo sus propios pedidos (RN5)
 * 
 * @route GET /api/pedidos/mis-pedidos
 * @access Private - Solo Mozo
 * 
 * @query {String} estado - Filtrar por estado (opcional)
 * @query {Date} fecha - Filtrar por fecha (opcional)
 * 
 * @returns {Object} 200 - Lista de pedidos del mozo
 * 
 * @example
 * GET /api/pedidos/mis-pedidos?estado=Pendiente
 * GET /api/pedidos/mis-pedidos?fecha=2025-11-11
 */
export const obtenerMisPedidos = async (req, res) => {
    try {
        const mozoId = req.usuario.id;
        const { estado, fecha } = req.query;

        console.log(`[HU3] Obteniendo pedidos del mozo ${mozoId}`);

        // Construir filtro
        let filtro = { 
            mozo: mozoId,
            activo: true // Solo pedidos activos (no cancelados)
        };

        // Filtrar por estado si se proporciona
        if (estado) {
            filtro.estado = estado;
        }

        // Filtrar por fecha si se proporciona
        if (fecha) {
            const fechaInicio = new Date(fecha);
            fechaInicio.setHours(0, 0, 0, 0);
            
            const fechaFin = new Date(fecha);
            fechaFin.setHours(23, 59, 59, 999);
            
            filtro.fechaCreacion = {
                $gte: fechaInicio,
                $lte: fechaFin
            };
        }

        // Buscar pedidos
        const pedidos = await Pedido.find(filtro)
            .populate('mesa', 'numero ubicacion estado')
            .populate('productos.producto', 'nombre foto categoria')
            .sort({ fechaCreacion: -1 }) // Más recientes primero
            .limit(50); // Límite de 50 pedidos

        console.log(`[HU3] ✓ ${pedidos.length} pedidos encontrados`);

        return res.status(200).json({
            success: true,
            data: pedidos,
            total: pedidos.length,
            mozo: req.usuario.nombre
        });

    } catch (error) {
        console.error('[HU3] ERROR al obtener pedidos:', error);
        return res.status(500).json({
            success: false,
            mensaje: 'Error al obtener los pedidos',
            error: error.message
        });
    }
};

// ============================================================================
// ACTUALIZAR ITEMS DE UN PEDIDO (HU3)
// ============================================================================

/**
 * Permite al mozo editar los productos de un pedido ANTES de enviarlo a cocina
 * Solo se pueden editar pedidos en estado "Pendiente"
 * 
 * @route PUT /api/pedidos/:id/items
 * @access Private - Solo el mozo que creó el pedido
 * 
 * @param {String} req.params.id - ID del pedido
 * @param {Array} req.body.productos - Nuevos productos
 * 
 * @returns {Object} 200 - Pedido actualizado
 * @returns {Object} 400 - No se puede editar (ya no está en estado Pendiente)
 * @returns {Object} 403 - No es el mozo que creó el pedido
 * @returns {Object} 404 - Pedido no encontrado
 */
export const actualizarItemsPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const { productos } = req.body;
        const mozoId = req.usuario.id;

        console.log(`[HU3] Actualizando items del pedido ${id}`);

        // Buscar el pedido
        const pedido = await Pedido.findById(id);

        if (!pedido) {
            return res.status(404).json({
                success: false,
                mensaje: 'Pedido no encontrado'
            });
        }

        // Verificar que el pedido pertenece al mozo (RN5)
        if (pedido.mozo.toString() !== mozoId && req.usuario.rol !== 'Administrador') {
            console.log(`[HU3] RECHAZADO - Mozo ${mozoId} intentó editar pedido de otro mozo`);
            return res.status(403).json({
                success: false,
                mensaje: 'No tienes permiso para modificar este pedido',
                error: 'PERMISO_DENEGADO'
            });
        }

        // Solo se puede editar si está en estado Pendiente
        if (pedido.estado !== 'Pendiente') {
            return res.status(400).json({
                success: false,
                mensaje: 'Solo se pueden editar pedidos en estado Pendiente',
                estadoActual: pedido.estado,
                error: 'ESTADO_INVALIDO'
            });
        }

        // Validar y procesar nuevos productos
        let subtotal = 0;
        const productosValidados = [];

        for (const item of productos) {
            const producto = await Producto.findById(item.productoId);
            
            if (!producto || !producto.disponible) {
                return res.status(400).json({
                    success: false,
                    mensaje: `Producto no disponible`,
                    error: 'PRODUCTO_NO_DISPONIBLE'
                });
            }

            const subtotalItem = producto.precio * item.cantidad;
            subtotal += subtotalItem;

            productosValidados.push({
                producto: producto._id,
                nombre: producto.nombre,
                cantidad: item.cantidad,
                precioUnitario: producto.precio,
                subtotal: subtotalItem,
                observaciones: item.observaciones || ''
            });
        }

        // Actualizar el pedido
        pedido.productos = productosValidados;
        pedido.subtotal = subtotal;
        pedido.total = subtotal;
        await pedido.save();

        console.log(`[HU3] ✓ Pedido actualizado exitosamente`);

        return res.status(200).json({
            success: true,
            mensaje: 'Pedido actualizado exitosamente',
            data: pedido
        });

    } catch (error) {
        console.error('[HU3] ERROR al actualizar pedido:', error);
        return res.status(500).json({
            success: false,
            mensaje: 'Error al actualizar el pedido',
            error: error.message
        });
    }
};

// ============================================================================
// CANCELAR UN PEDIDO (HU3)
// ============================================================================

/**
 * Cancela un pedido creado por el mozo
 * Solo se pueden cancelar pedidos en estado "Pendiente"
 * Al cancelar, la mesa vuelve a estado "Libre"
 * 
 * @route DELETE /api/pedidos/:id
 * @access Private - Solo el mozo que creó el pedido o Admin
 * 
 * @param {String} req.params.id - ID del pedido
 * @param {String} req.body.motivo - Motivo de la cancelación
 * 
 * @returns {Object} 200 - Pedido cancelado
 * @returns {Object} 400 - No se puede cancelar (no está en estado Pendiente)
 * @returns {Object} 403 - Sin permisos
 * @returns {Object} 404 - Pedido no encontrado
 */
export const cancelarPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body;
        const mozoId = req.usuario.id;

        console.log(`[HU3] Cancelando pedido ${id}`);

        const pedido = await Pedido.findById(id);

        if (!pedido) {
            return res.status(404).json({
                success: false,
                mensaje: 'Pedido no encontrado'
            });
        }

        // Verificar permisos
        if (pedido.mozo.toString() !== mozoId && req.usuario.rol !== 'Administrador') {
            return res.status(403).json({
                success: false,
                mensaje: 'No tienes permiso para cancelar este pedido'
            });
        }

        // Solo se puede cancelar si está Pendiente
        if (pedido.estado !== 'Pendiente') {
            return res.status(400).json({
                success: false,
                mensaje: 'Solo se pueden cancelar pedidos en estado Pendiente',
                estadoActual: pedido.estado
            });
        }

        // Cancelar el pedido usando el método del schema
        await pedido.cambiarEstado('Cancelado', mozoId, motivo || 'Cancelado por el mozo');

        // Liberar la mesa
        const mesa = await Mesa.findById(pedido.mesa);
        if (mesa) {
            mesa.estado = 'Libre';
            mesa.pedidoActual = null;
            await mesa.save();
            console.log(`[HU3] ✓ Mesa ${mesa.numero} liberada`);
        }

        // Notificar cancelación a cocina
        if (req.app.get('io')) {
            req.app.get('io').emit('pedido-cancelado', {
                pedidoId: pedido._id,
                numeroPedido: pedido.numeroPedido,
                mesa: pedido.numeroMesa
            });
        }

        console.log(`[HU3] ✓ Pedido cancelado exitosamente`);

        return res.status(200).json({
            success: true,
            mensaje: 'Pedido cancelado exitosamente',
            data: pedido
        });

    } catch (error) {
        console.error('[HU3] ERROR al cancelar pedido:', error);
        return res.status(500).json({
            success: false,
            mensaje: 'Error al cancelar el pedido',
            error: error.message
        });
    }
};

// ============================================================================
// OBTENER PEDIDOS PARA COCINA (HU4)
// ============================================================================

/**
 * Obtiene los pedidos pendientes para la pantalla de cocina (HU4)
 * Los pedidos se ordenan cronológicamente (más antiguos primero)
 * 
 * @route GET /api/pedidos/cocina
 * @access Private - Solo rol Cocina y Administrador
 * 
 * @query {String} estadoCocina - Filtrar por estado: Pendiente, En Preparación, Listo
 * 
 * @returns {Object} 200 - Lista de pedidos para cocina
 * 
 * @example
 * GET /api/pedidos/cocina?estadoCocina=Pendiente
 */
export const obtenerPedidosCocina = async (req, res) => {
    try {
        const { estadoCocina } = req.query;

        console.log(`[HU4] Obteniendo pedidos para cocina - Estado: ${estadoCocina || 'Todos'}`);

        // Construir query
        const query = {
            activo: true,
            estado: { $nin: ['Cancelado', 'Cobrado'] } // Excluir cancelados y cobrados
        };

        // Filtrar por estado de cocina si se proporciona
        if (estadoCocina) {
            query.estadoCocina = estadoCocina;
        }

        // Obtener pedidos
        const pedidos = await Pedido.find(query)
            .populate('mesa', 'numero ubicacion')
            .populate('mozo', 'nombre apellido')
            .populate('productos.producto', 'nombre categoria')
            .sort({ fechaCreacion: 1 }) // Más antiguos primero (FIFO - First In First Out)
            .lean(); // Objeto plano para mejor rendimiento

        console.log(`[HU4] ✓ ${pedidos.length} pedidos encontrados para cocina`);

        return res.status(200).json({
            success: true,
            data: pedidos,
            total: pedidos.length,
            mensaje: 'Pedidos obtenidos exitosamente'
        });

    } catch (error) {
        console.error('[HU4] ERROR al obtener pedidos de cocina:', error);
        return res.status(500).json({
            success: false,
            mensaje: 'Error al obtener pedidos de cocina',
            error: error.message
        });
    }
};

// ============================================================================
// EXPORTAR CONTROLADORES
// ============================================================================

export default {
    crearPedido,
    obtenerMisPedidos,
    actualizarItemsPedido,
    cancelarPedido,
    obtenerPedidosCocina
};
