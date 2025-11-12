import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * ============================================================================
 * SCHEMA DE PEDIDO - LA VIEJA ESTACIÓN RESTOBAR
 * ============================================================================
 * 
 * Este schema gestiona el ciclo completo de un pedido en el sistema:
 * 
 * FLUJO DEL PEDIDO:
 * 1. CREACIÓN (HU3): El mozo registra el pedido desde su aplicación
 * 2. ENVÍO A COCINA (HU4): El pedido se envía automáticamente a cocina
 * 3. PREPARACIÓN (HU5): Cocina marca el pedido como "En preparación"
 * 4. FINALIZACIÓN (HU6): Cocina marca el pedido como "Listo"
 * 5. SERVICIO: El mozo entrega el pedido al cliente
 * 6. COBRO (HU7, HU8): El cajero cobra el pedido y aplica descuentos
 * 
 * REGLAS DE NEGOCIO IMPLEMENTADAS:
 * - RN1: Solo mozos pueden crear pedidos
 * - RN2: 10% descuento en pagos con efectivo
 * - RN3: Solo efectivo o transferencia como métodos de pago
 * - RN4: Cambio automático de estado de mesa a "Ocupada"
 * - RN5: Control de permisos por rol
 * 
 * @author Sistema POS - La Vieja Estación
 * @version 2.0
 */

const pedidoSchema = new Schema({
    
    // ========================================================================
    // IDENTIFICACIÓN DEL PEDIDO
    // ========================================================================
    
    /**
     * Número de pedido único autogenerado
     * Formato: PED-YYYYMMDD-NNNN
     * Ejemplo: PED-20251111-0001
     * Se genera automáticamente usando el método estático generarNumeroPedido()
     */
    numeroPedido: {
        type: String,
        required: [true, 'El número de pedido es requerido'],
        unique: true,
        trim: true
    },

    // ========================================================================
    // RELACIONES CON OTRAS ENTIDADES
    // ========================================================================
    
    /**
     * Mesa donde se realiza el pedido (HU11)
     * Referencia al modelo Mesa
     * Se usa para asociar el pedido con una ubicación física
     */
    mesa: {
        type: Schema.Types.ObjectId,
        ref: 'Mesa',
        required: [true, 'La mesa es requerida']
    },

    /**
     * Número de mesa (desnormalizado para consultas rápidas)
     * Se copia del modelo Mesa al crear el pedido
     * Evita hacer populate en cada consulta
     */
    numeroMesa: {
        type: Number,
        required: [true, 'El número de mesa es requerido']
    },

    /**
     * Mozo que tomó el pedido (HU3, HU9)
     * Referencia al modelo Usuario con rol "Mozo"
     * Se obtiene del token JWT del usuario autenticado
     */
    mozo: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El mozo es requerido']
    },

    /**
     * Nombre del mozo (desnormalizado)
     * Se copia al crear el pedido para mostrar en tickets y reportes
     */
    nombreMozo: {
        type: String,
        required: [true, 'El nombre del mozo es requerido'],
        trim: true
    },

    // ========================================================================
    // ESTADOS DEL PEDIDO (HU5, HU6, HU7)
    // ========================================================================
    
    /**
     * Estado principal del pedido
     * Define en qué etapa del flujo se encuentra el pedido
     * 
     * TRANSICIONES VÁLIDAS:
     * Pendiente -> En Preparación -> Listo -> Entregado -> Cobrado
     * Cualquier estado -> Cancelado (solo admin o mozo que creó el pedido)
     */
    estado: {
        type: String,
        enum: {
            values: ['Pendiente', 'En Preparación', 'Listo', 'Entregado', 'Cobrado', 'Cancelado'],
            message: 'Estado no válido: {VALUE}'
        },
        default: 'Pendiente',
        required: true
    },

    /**
     * Estado específico para cocina (HU5, HU6)
     * Permite que cocina gestione el pedido independientemente del flujo general
     */
    estadoCocina: {
        type: String,
        enum: ['Pendiente', 'En Preparación', 'Listo'],
        default: 'Pendiente'
    },

    /**
     * Estado específico para caja (HU7, HU8)
     * Indica si el pedido está pendiente de cobro o ya fue cobrado
     */
    estadoCaja: {
        type: String,
        enum: ['Pendiente', 'Cobrado'],
        default: 'Pendiente'
    },

    // ========================================================================
    // PRODUCTOS DEL PEDIDO (HU3)
    // ========================================================================
    
    /**
     * Array de productos incluidos en el pedido
     * Cada item contiene la información del producto al momento del pedido
     * Se desnormaliza para mantener precios históricos (por si cambia el menú)
     * 
     * VALIDACIÓN: Debe tener al menos un producto
     */
    productos: [{
        /**
         * Referencia al producto en el catálogo
         * Se usa para validaciones y para acceder a info actualizada del producto
         */
        producto: {
            type: Schema.Types.ObjectId,
            ref: 'Producto',
            required: [true, 'El ID del producto es requerido']
        },
        
        /**
         * Nombre del producto (desnormalizado)
         * Se guarda para mantener registro histórico
         * Si el producto cambia de nombre, el pedido mantiene el nombre original
         */
        nombre: {
            type: String,
            required: [true, 'El nombre del producto es requerido'],
            trim: true
        },
        
        /**
         * Cantidad solicitada del producto
         * Mínimo: 1 unidad
         * Ejemplo: 2 pizzas, 3 cervezas
         */
        cantidad: {
            type: Number,
            required: [true, 'La cantidad es requerida'],
            min: [1, 'La cantidad debe ser al menos 1']
        },
        
        /**
         * Precio unitario del producto al momento del pedido
         * Se congela el precio para que no se vea afectado por cambios futuros
         */
        precioUnitario: {
            type: Number,
            required: [true, 'El precio unitario es requerido'],
            min: [0, 'El precio no puede ser negativo']
        },
        
        /**
         * Subtotal del item (precioUnitario * cantidad)
         * Se calcula automáticamente al crear/actualizar el pedido
         */
        subtotal: {
            type: Number,
            required: [true, 'El subtotal es requerido'],
            min: [0, 'El subtotal no puede ser negativo']
        },
        
        /**
         * Observaciones especiales del cliente para este producto
         * Ejemplos: "sin cebolla", "punto medio", "con extra queso", "bien cocido"
         * Se muestra en la pantalla de cocina (HU4, HU5)
         */
        observaciones: {
            type: String,
            default: '',
            maxlength: [200, 'Las observaciones no pueden superar los 200 caracteres']
        }
    }],

    // ========================================================================
    // CÁLCULOS Y TOTALES (HU8)
    // ========================================================================
    
    /**
     * Subtotal del pedido (suma de todos los subtotales de productos)
     * NO incluye descuentos
     * Se calcula automáticamente al crear el pedido
     */
    subtotal: {
        type: Number,
        required: [true, 'El subtotal es requerido'],
        min: [0, 'El subtotal no puede ser negativo']
    },

    /**
     * Descuento aplicado al pedido (RN2: 10% si es efectivo)
     * Se aplica automáticamente al momento del cobro si el pago es en efectivo
     */
    descuento: {
        /**
         * Porcentaje de descuento aplicado
         * Ejemplo: 10 para 10%
         */
        porcentaje: {
            type: Number,
            default: 0,
            min: [0, 'El porcentaje no puede ser negativo'],
            max: [100, 'El porcentaje no puede superar 100']
        },
        
        /**
         * Monto en pesos del descuento
         * Se calcula: subtotal * (porcentaje / 100)
         */
        monto: {
            type: Number,
            default: 0,
            min: [0, 'El monto del descuento no puede ser negativo']
        },
        
        /**
         * Motivo del descuento
         * Ejemplo: "Pago en efectivo", "Promoción especial", "Cliente frecuente"
         */
        motivo: {
            type: String,
            default: '',
            trim: true
        }
    },

    /**
     * Total final a pagar (subtotal - descuento.monto)
     * Este es el monto que cobra el cajero (HU8)
     */
    total: {
        type: Number,
        required: [true, 'El total es requerido'],
        min: [0, 'El total no puede ser negativo']
    },

    // ========================================================================
    // INFORMACIÓN DE PAGO (RN3, HU8)
    // ========================================================================
    
    /**
     * Método de pago seleccionado
     * RN3: Solo se permite efectivo o transferencia
     * Por defecto es "Pendiente" hasta que se cobra en caja
     */
    metodoPago: {
        type: String,
        enum: {
            values: ['Efectivo', 'Transferencia', 'Pendiente'],
            message: 'Método de pago no válido: {VALUE}. Solo se acepta Efectivo o Transferencia'
        },
        default: 'Pendiente'
    },

    /**
     * Información detallada del pago
     * Se completa cuando el cajero procesa el cobro (HU8)
     */
    pago: {
        /**
         * Fecha y hora en que se realizó el cobro
         */
        fecha: {
            type: Date
        },
        
        /**
         * Cajero que procesó el pago
         * Referencia al Usuario con rol "Cajero"
         */
        cajero: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario'
        },
        
        /**
         * Monto pagado por el cliente
         * Puede ser mayor al total (para dar cambio)
         */
        montoPagado: {
            type: Number,
            min: [0, 'El monto pagado no puede ser negativo']
        },
        
        /**
         * Cambio a devolver al cliente
         * Se calcula: montoPagado - total
         */
        cambio: {
            type: Number,
            default: 0,
            min: [0, 'El cambio no puede ser negativo']
        }
    },

    // ========================================================================
    // TRAZABILIDAD Y AUDITORÍA (HU5, HU6, HU9)
    // ========================================================================
    
    /**
     * Registro de cambios de estado del pedido
     * Mantiene un historial completo de todas las transiciones
     * Útil para auditoría y análisis de tiempos
     */
    historialEstados: [{
        /**
         * Estado al que cambió el pedido
         */
        estado: {
            type: String,
            required: true
        },
        
        /**
         * Fecha y hora del cambio de estado
         */
        fecha: {
            type: Date,
            default: Date.now
        },
        
        /**
         * Usuario que realizó el cambio de estado
         * Puede ser el mozo, cocinero o cajero
         */
        usuario: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario'
        },
        
        /**
         * Observación o comentario sobre el cambio de estado
         * Ejemplo: "Cliente canceló", "Error en el pedido", "Listo para servir"
         */
        observacion: {
            type: String,
            default: '',
            maxlength: [200, 'La observación no puede superar los 200 caracteres']
        }
    }],

    // ========================================================================
    // OBSERVACIONES Y NOTAS
    // ========================================================================
    
    /**
     * Observaciones generales del pedido
     * Comentarios que aplican a todo el pedido, no a productos específicos
     * Ejemplo: "Celebración de cumpleaños", "Cliente con prisa", "Mesa VIP"
     */
    observacionesGenerales: {
        type: String,
        default: '',
        maxlength: [500, 'Las observaciones generales no pueden superar los 500 caracteres']
    },

    // ========================================================================
    // MARCAS DE TIEMPO (TIMESTAMPS)
    // ========================================================================
    
    /**
     * Fecha y hora de creación del pedido (HU3)
     * Se establece automáticamente al crear el pedido
     */
    fechaCreacion: {
        type: Date,
        default: Date.now,
        required: true
    },

    /**
     * Fecha y hora cuando cocina marcó el pedido como "Listo" (HU6)
     * Se usa para calcular tiempo de preparación
     */
    fechaListo: {
        type: Date
    },

    /**
     * Fecha y hora cuando el mozo sirvió el pedido al cliente
     * Se usa para calcular tiempo de servicio
     */
    fechaServido: {
        type: Date
    },

    /**
     * Fecha y hora cuando se cobró el pedido en caja (HU8)
     * Se usa para reportes de ventas diarias
     */
    fechaCobrado: {
        type: Date
    },

    /**
     * Tiempo estimado de preparación en minutos
     * Se calcula automáticamente basado en los productos del pedido
     * Ejemplo: 15 minutos para pizzas, 5 para bebidas
     */
    tiempoEstimado: {
        type: Number,
        min: [0, 'El tiempo estimado no puede ser negativo'],
        default: 15 // Tiempo por defecto: 15 minutos
    },

    // ========================================================================
    // INFORMACIÓN DE CANCELACIÓN
    // ========================================================================
    
    /**
     * Información sobre la cancelación del pedido (si aplica)
     * Solo mozos y administradores pueden cancelar pedidos
     */
    cancelado: {
        /**
         * Indica si el pedido está cancelado
         */
        activo: {
            type: Boolean,
            default: false
        },
        
        /**
         * Motivo de la cancelación
         * Ejemplo: "Cliente se retiró", "Error en el pedido", "Producto no disponible"
         */
        motivo: {
            type: String,
            default: '',
            maxlength: [200, 'El motivo de cancelación no puede superar los 200 caracteres']
        },
        
        /**
         * Fecha y hora de la cancelación
         */
        fecha: {
            type: Date
        },
        
        /**
         * Usuario que canceló el pedido
         */
        usuario: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario'
        }
    },

    /**
     * Flag para soft delete (eliminación lógica)
     * Los pedidos nunca se eliminan físicamente de la BD
     * Se marcan como inactivos para mantener el historial (HU9)
     */
    activo: {
        type: Boolean,
        default: true
    }

}, {
    // Configuración del schema
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    versionKey: false // Elimina el campo __v de versionado de Mongoose
});

// ============================================================================
// ÍNDICES DE BASE DE DATOS (RNF2, RNF7)
// ============================================================================
// Los índices mejoran el rendimiento de las consultas frecuentes
// Garantizan tiempos de respuesta menores a 2 segundos (RNF2)

pedidoSchema.index({ numeroPedido: 1 });          // Búsqueda por número de pedido
pedidoSchema.index({ mesa: 1 });                  // Pedidos por mesa
pedidoSchema.index({ mozo: 1 });                  // Pedidos por mozo (HU9)
pedidoSchema.index({ estado: 1 });                // Filtro por estado (HU5)
pedidoSchema.index({ estadoCocina: 1 });          // Vista de cocina (HU4, HU5)
pedidoSchema.index({ estadoCaja: 1 });            // Vista de caja (HU7, HU8)
pedidoSchema.index({ fechaCreacion: -1 });        // Ordenar por fecha (más recientes primero)
pedidoSchema.index({ 'pago.cajero': 1 });         // Reportes por cajero (HU9)
pedidoSchema.index({ metodoPago: 1 });            // Reportes por método de pago (HU9, HU15)
pedidoSchema.index({ activo: 1 });                // Filtrar activos/inactivos

// Índice compuesto para reportes (HU15)
pedidoSchema.index({ fechaCreacion: -1, mozo: 1, estado: 1 });

// ============================================================================
// MIDDLEWARE PRE-SAVE (RF2)
// ============================================================================
// Se ejecuta automáticamente antes de guardar un documento en la BD

/**
 * Middleware que se ejecuta antes de guardar un pedido
 * Calcula automáticamente:
 * - Subtotales de cada producto
 * - Subtotal general
 * - Descuento del 10% si el pago es en efectivo (RN2)
 * - Total final
 */
pedidoSchema.pre('save', function(next) {
    // 1. Calcular subtotal de cada producto y subtotal general
    if (this.productos && this.productos.length > 0) {
        this.subtotal = this.productos.reduce((sum, item) => {
            // Calcular subtotal de cada item: cantidad × precioUnitario
            item.subtotal = item.cantidad * item.precioUnitario;
            // Sumar al subtotal general
            return sum + item.subtotal;
        }, 0);
    }

    // 2. Aplicar descuento del 10% si el método de pago es efectivo (RN2)
    if (this.metodoPago === 'Efectivo' && this.descuento.porcentaje === 0) {
        this.descuento.porcentaje = 10;
        this.descuento.monto = this.subtotal * 0.10; // 10% del subtotal
        this.descuento.motivo = 'Descuento por pago en efectivo';
    } else if (this.metodoPago !== 'Efectivo' && this.descuento.motivo === 'Descuento por pago en efectivo') {
        // Si cambió el método de pago, quitar el descuento automático
        this.descuento.porcentaje = 0;
        this.descuento.monto = 0;
        this.descuento.motivo = '';
    }

    // 3. Calcular total final: subtotal - descuento
    this.total = this.subtotal - this.descuento.monto;

    // 4. Continuar con el guardado
    next();
});

// ============================================================================
// MÉTODOS DE INSTANCIA
// ============================================================================
// Métodos que se pueden llamar en un documento específico de pedido

/**
 * Cambia el estado del pedido y registra el cambio en el historial (HU5, HU6)
 * 
 * @param {String} nuevoEstado - Estado al que se quiere cambiar
 * @param {ObjectId} usuario - ID del usuario que realiza el cambio
 * @param {String} observacion - Comentario opcional sobre el cambio
 * @throws {Error} Si el estado no es válido
 * 
 * Ejemplo de uso:
 * await pedido.cambiarEstado('En Preparación', usuarioId, 'Iniciando cocción');
 */
pedidoSchema.methods.cambiarEstado = function(nuevoEstado, usuario, observacion = '') {
    const estadosValidos = ['Pendiente', 'En Preparación', 'Listo', 'Entregado', 'Cobrado', 'Cancelado'];
    
    if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error(`Estado no válido: ${nuevoEstado}. Estados válidos: ${estadosValidos.join(', ')}`);
    }

    // 1. Registrar en historial para auditoría
    this.historialEstados.push({
        estado: nuevoEstado,
        fecha: new Date(),
        usuario: usuario,
        observacion: observacion
    });

    // 2. Actualizar estado actual del pedido
    this.estado = nuevoEstado;

    // 3. Actualizar estados específicos según el módulo
    switch(nuevoEstado) {
        case 'Pendiente':
            this.estadoCocina = 'Pendiente';
            break;
        case 'En Preparación':
            this.estadoCocina = 'En Preparación';
            break;
        case 'Listo':
            this.estadoCocina = 'Listo';
            this.fechaListo = new Date();
            break;
        case 'Entregado':
            this.fechaServido = new Date();
            break;
        case 'Cobrado':
            this.estadoCaja = 'Cobrado';
            this.fechaCobrado = new Date();
            break;
        case 'Cancelado':
            this.cancelado.activo = true;
            this.cancelado.fecha = new Date();
            this.cancelado.usuario = usuario;
            this.cancelado.motivo = observacion;
            this.activo = false; // Soft delete
            break;
    }

    // 4. Guardar los cambios
    return this.save();
};

/**
 * Registra el pago de un pedido en caja (HU8)
 * Aplica automáticamente el descuento del 10% si es en efectivo (RN2)
 * 
 * @param {ObjectId} cajero - ID del cajero que procesa el pago
 * @param {String} metodoPago - 'Efectivo' o 'Transferencia'
 * @param {Number} montoPagado - Monto pagado por el cliente
 * @returns {Promise} Promesa con el pedido actualizado
 * 
 * Ejemplo de uso:
 * await pedido.registrarPago(cajeroId, 'Efectivo', 1500);
 */
pedidoSchema.methods.registrarPago = function(cajero, metodoPago, montoPagado) {
    // Validar método de pago (RN3)
    if (!['Efectivo', 'Transferencia'].includes(metodoPago)) {
        throw new Error('Método de pago no válido. Solo se acepta Efectivo o Transferencia');
    }

    // Establecer método de pago
    this.metodoPago = metodoPago;
    
    // Registrar información del pago
    this.pago.fecha = new Date();
    this.pago.cajero = cajero;
    this.pago.montoPagado = montoPagado;
    
    // Calcular cambio si es efectivo
    if (metodoPago === 'Efectivo') {
        this.pago.cambio = montoPagado - this.total;
        
        // Validar que el monto pagado sea suficiente
        if (this.pago.cambio < 0) {
            throw new Error(`Monto insuficiente. Se requieren $${this.total} y solo se recibieron $${montoPagado}`);
        }
    }

    // Cambiar estado a Cobrado y guardar
    return this.cambiarEstado('Cobrado', cajero, `Pago registrado por ${metodoPago}`);
};

// ============================================================================
// MÉTODOS ESTÁTICOS
// ============================================================================
// Métodos que se pueden llamar directamente en el modelo Pedido

/**
 * Genera el siguiente número de pedido automáticamente
 * Formato: PED-YYYYMMDD-NNNN
 * 
 * @returns {Promise<String>} Número de pedido generado
 * 
 * Ejemplo: PED-20251111-0001, PED-20251111-0002, etc.
 */
pedidoSchema.statics.generarNumeroPedido = async function() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    
    // Prefijo del día: PED-20251111
    const prefijo = `PED-${año}${mes}${dia}`;
    
    // Buscar el último pedido del día
    const ultimoPedido = await this.findOne({
        numeroPedido: new RegExp(`^${prefijo}`)
    }).sort({ numeroPedido: -1 });
    
    let numero = 1;
    if (ultimoPedido) {
        // Extraer el número secuencial del último pedido
        const ultimoNumero = parseInt(ultimoPedido.numeroPedido.split('-')[2]);
        numero = ultimoNumero + 1;
    }
    
    // Retornar número completo: PED-20251111-0001
    return `${prefijo}-${String(numero).padStart(4, '0')}`;
};

/**
 * Obtiene pedidos filtrados por estado (HU5, HU7, HU8)
 * 
 * @param {String} estado - Estado del pedido a buscar
 * @returns {Promise<Array>} Array de pedidos con ese estado
 * 
 * Ejemplo de uso:
 * const pedidosPendientes = await Pedido.obtenerPorEstado('Pendiente');
 */
pedidoSchema.statics.obtenerPorEstado = function(estado) {
    return this.find({ 
        estado: estado,
        activo: true // Solo pedidos activos (no cancelados)
    })
    .populate('mesa', 'numero ubicacion')
    .populate('mozo', 'nombre apellido')
    .populate('productos.producto', 'nombre categoria foto')
    .sort({ fechaCreacion: 1 }); // Más antiguos primero
};

/**
 * Obtiene pedidos para la vista de cocina (HU4, HU5)
 * Filtra por estado de cocina y ordena por antigüedad
 * 
 * @param {String} estadoCocina - 'Pendiente', 'En Preparación' o 'Listo'
 * @returns {Promise<Array>} Array de pedidos para cocina
 * 
 * Ejemplo de uso:
 * const pedidosPendientesCocina = await Pedido.obtenerParaCocina('Pendiente');
 */
pedidoSchema.statics.obtenerParaCocina = function(estadoCocina = null) {
    const query = { 
        activo: true,
        estado: { $nin: ['Cancelado', 'Cobrado'] } // Excluir cancelados y cobrados
    };
    
    if (estadoCocina) {
        query.estadoCocina = estadoCocina;
    }
    
    return this.find(query)
        .populate('mesa', 'numero')
        .populate('mozo', 'nombre')
        .populate('productos.producto', 'nombre categoria')
        .sort({ fechaCreacion: 1 }) // Más antiguos primero (FIFO)
        .lean(); // Devolver objetos planos para mejor rendimiento
};

/**
 * Obtiene pedidos para la vista de caja (HU7, HU8)
 * 
 * @returns {Promise<Array>} Array de pedidos listos para cobrar
 */
pedidoSchema.statics.obtenerParaCaja = function() {
    return this.find({
        activo: true,
        estadoCaja: 'Pendiente',
        estado: { $in: ['Listo', 'Entregado'] } // Solo pedidos terminados
    })
    .populate('mesa', 'numero')
    .populate('mozo', 'nombre apellido')
    .populate('productos.producto', 'nombre precio')
    .sort({ fechaListo: 1 }); // Más antiguos primero
};

/**
 * Genera reporte de ventas con filtros (HU9, HU15)
 * 
 * @param {Object} filtros - Objeto con filtros opcionales
 * @param {Date} filtros.fechaInicio - Fecha de inicio
 * @param {Date} filtros.fechaFin - Fecha de fin
 * @param {ObjectId} filtros.mozo - ID del mozo
 * @param {String} filtros.metodoPago - Método de pago
 * @returns {Promise<Array>} Array de pedidos cobrados
 * 
 * Ejemplo de uso:
 * const ventas = await Pedido.reporteVentas({
 *   fechaInicio: new Date('2025-11-01'),
 *   fechaFin: new Date('2025-11-30'),
 *   metodoPago: 'Efectivo'
 * });
 */
pedidoSchema.statics.reporteVentas = function(filtros = {}) {
    const query = { 
        estado: 'Cobrado',
        activo: true
    };
    
    // Filtro por rango de fechas
    if (filtros.fechaInicio || filtros.fechaFin) {
        query.fechaCobrado = {};
        if (filtros.fechaInicio) {
            query.fechaCobrado.$gte = new Date(filtros.fechaInicio);
        }
        if (filtros.fechaFin) {
            // Incluir todo el día final (23:59:59)
            const fechaFin = new Date(filtros.fechaFin);
            fechaFin.setHours(23, 59, 59, 999);
            query.fechaCobrado.$lte = fechaFin;
        }
    }
    
    // Filtro por mozo (HU9)
    if (filtros.mozo) {
        query.mozo = filtros.mozo;
    }
    
    // Filtro por método de pago (HU15)
    if (filtros.metodoPago) {
        query.metodoPago = filtros.metodoPago;
    }
    
    // Filtro por cajero
    if (filtros.cajero) {
        query['pago.cajero'] = filtros.cajero;
    }
    
    return this.find(query)
        .populate('mesa', 'numero')
        .populate('mozo', 'nombre apellido')
        .populate('pago.cajero', 'nombre apellido')
        .populate('productos.producto', 'nombre categoria')
        .sort({ fechaCobrado: -1 }); // Más recientes primero
};

/**
 * Calcula estadísticas de ventas (HU15)
 * 
 * @param {Object} filtros - Filtros de fecha y otros
 * @returns {Promise<Object>} Objeto con estadísticas
 */
pedidoSchema.statics.calcularEstadisticas = async function(filtros = {}) {
    const query = { 
        estado: 'Cobrado',
        activo: true
    };
    
    // Aplicar filtros de fecha
    if (filtros.fechaInicio || filtros.fechaFin) {
        query.fechaCobrado = {};
        if (filtros.fechaInicio) {
            query.fechaCobrado.$gte = new Date(filtros.fechaInicio);
        }
        if (filtros.fechaFin) {
            const fechaFin = new Date(filtros.fechaFin);
            fechaFin.setHours(23, 59, 59, 999);
            query.fechaCobrado.$lte = fechaFin;
        }
    }
    
    // Realizar agregación
    const stats = await this.aggregate([
        { $match: query },
        {
            $group: {
                _id: null,
                totalPedidos: { $sum: 1 },
                totalVentas: { $sum: '$total' },
                totalDescuentos: { $sum: '$descuento.monto' },
                ventasEfectivo: {
                    $sum: {
                        $cond: [{ $eq: ['$metodoPago', 'Efectivo'] }, '$total', 0]
                    }
                },
                ventasTransferencia: {
                    $sum: {
                        $cond: [{ $eq: ['$metodoPago', 'Transferencia'] }, '$total', 0]
                    }
                },
                promedioVenta: { $avg: '$total' }
            }
        }
    ]);
    
    return stats.length > 0 ? stats[0] : {
        totalPedidos: 0,
        totalVentas: 0,
        totalDescuentos: 0,
        ventasEfectivo: 0,
        ventasTransferencia: 0,
        promedioVenta: 0
    };
};

// ============================================================================
// CAMPOS VIRTUALES
// ============================================================================
// Campos calculados que no se guardan en la BD pero se pueden acceder

/**
 * Campo virtual: Tiempo de preparación real en minutos
 * Calcula cuánto tiempo tardó cocina en preparar el pedido
 * Útil para análisis de eficiencia (HU9, HU15)
 */
pedidoSchema.virtual('tiempoPreparacionReal').get(function() {
    if (this.fechaListo && this.fechaCreacion) {
        const diff = this.fechaListo - this.fechaCreacion;
        return Math.round(diff / 60000); // Convertir milisegundos a minutos
    }
    return null;
});

/**
 * Campo virtual: Cantidad total de productos en el pedido
 */
pedidoSchema.virtual('cantidadProductos').get(function() {
    if (this.productos && this.productos.length > 0) {
        return this.productos.reduce((sum, item) => sum + item.cantidad, 0);
    }
    return 0;
});

// ============================================================================
// CONFIGURACIÓN DE SERIALIZACIÓN
// ============================================================================
// Asegurar que los campos virtuales se incluyan al convertir a JSON

pedidoSchema.set('toJSON', { 
    virtuals: true,
    transform: function(doc, ret) {
        // Formatear fechas y números
        if (ret.total) ret.total = parseFloat(ret.total.toFixed(2));
        if (ret.subtotal) ret.subtotal = parseFloat(ret.subtotal.toFixed(2));
        return ret;
    }
});

pedidoSchema.set('toObject', { virtuals: true });

// ============================================================================
// EXPORTAR MODELO
// ============================================================================

export default mongoose.model('Pedido', pedidoSchema);
