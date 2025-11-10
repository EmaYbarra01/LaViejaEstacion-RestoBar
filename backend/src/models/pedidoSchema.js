import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * Schema de Pedido para La Vieja Estación - RestoBar
 * 
 * Gestiona el flujo completo de pedidos desde su creación por el mozo,
 * pasando por cocina, hasta su cobro en caja.
 * 
 * Estados del pedido:
 * - Pendiente: Recién creado, esperando ser preparado
 * - En preparación: Cocina está trabajando en él
 * - Listo: Terminado, listo para servir al cliente
 * - Servido: El mozo lo entregó al cliente
 * - Cobrado: Pagado en caja
 * - Cancelado: Pedido anulado
 */

const pedidoSchema = new Schema({
    // Número de pedido único (generado automáticamente)
    numeroPedido: {
        type: Number,
        required: true,
        unique: true
    },

    // Referencia a la mesa donde se realizó el pedido (HU11)
    mesa: {
        type: Schema.Types.ObjectId,
        ref: 'Mesa',
        required: true
    },

    // Mozo que tomó el pedido (HU3, HU9)
    mozo: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },

    // Estado actual del pedido (HU5, HU6, HU7)
    estado: {
        type: String,
        enum: ['Pendiente', 'En preparación', 'Listo', 'Servido', 'Cobrado', 'Cancelado'],
        default: 'Pendiente',
        required: true
    },

    // Productos del pedido (HU3, HU8)
    productos: [{
        producto: {
            type: Schema.Types.ObjectId,
            ref: 'Producto',
            required: true
        },
        nombre: {
            type: String,
            required: true
        },
        cantidad: {
            type: Number,
            required: true,
            min: 1
        },
        precioUnitario: {
            type: Number,
            required: true,
            min: 0
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0
        },
        // Observaciones especiales del producto (ej: "sin cebolla", "punto medio")
        observaciones: {
            type: String,
            default: ''
        }
    }],

    // Subtotal sin descuentos
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },

    // Descuento aplicado (RN2: 10% si es efectivo)
    descuento: {
        porcentaje: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        monto: {
            type: Number,
            default: 0,
            min: 0
        },
        motivo: {
            type: String,
            default: ''
        }
    },

    // Total final a pagar (HU8)
    total: {
        type: Number,
        required: true,
        min: 0
    },

    // Método de pago (RN3: solo efectivo o transferencia) (HU8)
    metodoPago: {
        type: String,
        enum: ['Efectivo', 'Transferencia', 'Pendiente'],
        default: 'Pendiente'
    },

    // Información del pago (cuando se cobra en caja)
    pago: {
        fecha: {
            type: Date
        },
        cajero: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario'
        },
        montoPagado: {
            type: Number,
            min: 0
        },
        cambio: {
            type: Number,
            default: 0,
            min: 0
        }
    },

    // Registro de cambios de estado para trazabilidad (HU5, HU6)
    historialEstados: [{
        estado: {
            type: String,
            required: true
        },
        fecha: {
            type: Date,
            default: Date.now
        },
        usuario: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario'
        },
        observacion: {
            type: String,
            default: ''
        }
    }],

    // Observaciones generales del pedido
    observacionesGenerales: {
        type: String,
        default: ''
    },

    // Fecha y hora de creación del pedido
    fechaCreacion: {
        type: Date,
        default: Date.now,
        required: true
    },

    // Fecha y hora cuando se marcó como listo
    fechaListo: {
        type: Date
    },

    // Fecha y hora cuando se sirvió
    fechaServido: {
        type: Date
    },

    // Fecha y hora cuando se cobró
    fechaCobrado: {
        type: Date
    },

    // Tiempo estimado de preparación (en minutos)
    tiempoEstimado: {
        type: Number,
        min: 0
    },

    // Flag para indicar si el pedido fue cancelado y motivo
    cancelado: {
        activo: {
            type: Boolean,
            default: false
        },
        motivo: {
            type: String,
            default: ''
        },
        fecha: {
            type: Date
        },
        usuario: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario'
        }
    }

}, {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    versionKey: false
});

// Índices para mejorar el rendimiento de consultas (RNF2, RNF7)
pedidoSchema.index({ numeroPedido: 1 });
pedidoSchema.index({ mesa: 1 });
pedidoSchema.index({ mozo: 1 });
pedidoSchema.index({ estado: 1 });
pedidoSchema.index({ fechaCreacion: -1 });
pedidoSchema.index({ 'pago.cajero': 1 });
pedidoSchema.index({ metodoPago: 1 });

// Middleware pre-save para calcular totales automáticamente (RF2)
pedidoSchema.pre('save', function(next) {
    // Calcular subtotal de productos
    if (this.productos && this.productos.length > 0) {
        this.subtotal = this.productos.reduce((sum, item) => {
            item.subtotal = item.cantidad * item.precioUnitario;
            return sum + item.subtotal;
        }, 0);
    }

    // Aplicar descuento del 10% si el método de pago es efectivo (RN2)
    if (this.metodoPago === 'Efectivo' && this.descuento.porcentaje === 0) {
        this.descuento.porcentaje = 10;
        this.descuento.monto = this.subtotal * 0.10;
        this.descuento.motivo = 'Descuento por pago en efectivo';
    } else if (this.metodoPago !== 'Efectivo' && this.descuento.motivo === 'Descuento por pago en efectivo') {
        // Quitar descuento si cambió el método de pago
        this.descuento.porcentaje = 0;
        this.descuento.monto = 0;
        this.descuento.motivo = '';
    }

    // Calcular total final
    this.total = this.subtotal - this.descuento.monto;

    next();
});

// Método para cambiar estado del pedido con registro en historial (HU5, HU6)
pedidoSchema.methods.cambiarEstado = function(nuevoEstado, usuario, observacion = '') {
    const estadosValidos = ['Pendiente', 'En preparación', 'Listo', 'Servido', 'Cobrado', 'Cancelado'];
    
    if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error('Estado no válido');
    }

    // Registrar en historial
    this.historialEstados.push({
        estado: nuevoEstado,
        fecha: new Date(),
        usuario: usuario,
        observacion: observacion
    });

    // Actualizar estado actual
    this.estado = nuevoEstado;

    // Actualizar fechas específicas según el estado
    switch(nuevoEstado) {
        case 'Listo':
            this.fechaListo = new Date();
            break;
        case 'Servido':
            this.fechaServido = new Date();
            break;
        case 'Cobrado':
            this.fechaCobrado = new Date();
            break;
        case 'Cancelado':
            this.cancelado.activo = true;
            this.cancelado.fecha = new Date();
            this.cancelado.usuario = usuario;
            this.cancelado.motivo = observacion;
            break;
    }

    return this.save();
};

// Método para registrar el pago (HU8)
pedidoSchema.methods.registrarPago = function(cajero, metodoPago, montoPagado) {
    this.metodoPago = metodoPago;
    this.pago.fecha = new Date();
    this.pago.cajero = cajero;
    this.pago.montoPagado = montoPagado;
    
    // Calcular cambio si es efectivo
    if (metodoPago === 'Efectivo') {
        this.pago.cambio = montoPagado - this.total;
    }

    return this.cambiarEstado('Cobrado', cajero, `Pago registrado por ${metodoPago}`);
};

// Método estático para obtener el siguiente número de pedido
pedidoSchema.statics.obtenerSiguienteNumeroPedido = async function() {
    const ultimoPedido = await this.findOne()
        .sort({ numeroPedido: -1 })
        .select('numeroPedido')
        .lean();
    
    return ultimoPedido ? ultimoPedido.numeroPedido + 1 : 1;
};

// Método estático para obtener pedidos por estado (HU5, HU8)
pedidoSchema.statics.obtenerPorEstado = function(estado) {
    return this.find({ estado: estado })
        .populate('mesa', 'numero')
        .populate('mozo', 'nombre apellido')
        .populate('productos.producto', 'nombre categoria')
        .sort({ fechaCreacion: 1 });
};

// Método estático para reportes de ventas (HU9, HU15)
pedidoSchema.statics.reporteVentas = function(filtros = {}) {
    const query = { estado: 'Cobrado' };
    
    // Filtro por fecha
    if (filtros.fechaInicio || filtros.fechaFin) {
        query.fechaCobrado = {};
        if (filtros.fechaInicio) {
            query.fechaCobrado.$gte = new Date(filtros.fechaInicio);
        }
        if (filtros.fechaFin) {
            query.fechaCobrado.$lte = new Date(filtros.fechaFin);
        }
    }
    
    // Filtro por mozo
    if (filtros.mozo) {
        query.mozo = filtros.mozo;
    }
    
    // Filtro por método de pago
    if (filtros.metodoPago) {
        query.metodoPago = filtros.metodoPago;
    }
    
    return this.find(query)
        .populate('mesa', 'numero')
        .populate('mozo', 'nombre apellido')
        .populate('pago.cajero', 'nombre apellido')
        .sort({ fechaCobrado: -1 });
};

// Virtual para calcular el tiempo de preparación real
pedidoSchema.virtual('tiempoPreparacionReal').get(function() {
    if (this.fechaListo && this.fechaCreacion) {
        const diff = this.fechaListo - this.fechaCreacion;
        return Math.round(diff / 60000); // Convertir a minutos
    }
    return null;
});

// Asegurar que los virtuals se incluyan en JSON
pedidoSchema.set('toJSON', { virtuals: true });
pedidoSchema.set('toObject', { virtuals: true });

export default mongoose.model('Pedido', pedidoSchema);
