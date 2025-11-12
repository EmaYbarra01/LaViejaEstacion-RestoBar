const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schema de Compra para La Vieja Estación - RestoBar
 * Gestiona el registro de compras realizadas a proveedores (HU13)
 */

const compraSchema = new Schema({
    numeroCompra: {
        type: Number,
        required: true,
        unique: true
    },
    proveedor: {
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        cuit: {
            type: String,
            trim: true
        },
        telefono: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        direccion: {
            type: String,
            trim: true
        }
    },
    fechaCompra: {
        type: Date,
        required: true,
        default: Date.now
    },
    fechaRecepcion: {
        type: Date
    },
    estado: {
        type: String,
        enum: ['Pendiente', 'Recibida', 'Parcial', 'Cancelada'],
        default: 'Pendiente',
        required: true
    },
    productos: [{
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        productoId: {
            type: Schema.Types.ObjectId,
            ref: 'Producto'
        },
        cantidad: {
            type: Number,
            required: true,
            min: 0
        },
        unidadMedida: {
            type: String,
            required: true,
            enum: ['Unidad', 'Kg', 'Litro', 'Gramo', 'Ml', 'Caja', 'Pack', 'Otro'],
            default: 'Unidad'
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
        cantidadRecibida: {
            type: Number,
            default: 0,
            min: 0
        }
    }],
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    impuestos: {
        iva: {
            porcentaje: {
                type: Number,
                default: 21,
                min: 0
            },
            monto: {
                type: Number,
                default: 0,
                min: 0
            }
        }
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    metodoPago: {
        type: String,
        enum: ['Efectivo', 'Transferencia', 'Cheque', 'Cuenta Corriente', 'Otro'],
        required: true
    },
    numeroFactura: {
        type: String,
        trim: true
    },
    registradoPor: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    observaciones: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    versionKey: false
});

// Índices
compraSchema.index({ numeroCompra: 1 });
compraSchema.index({ fechaCompra: -1 });
compraSchema.index({ 'proveedor.nombre': 1 });

// Middleware pre-save
compraSchema.pre('save', function(next) {
    if (this.productos && this.productos.length > 0) {
        this.subtotal = this.productos.reduce((sum, item) => {
            item.subtotal = item.cantidad * item.precioUnitario;
            return sum + item.subtotal;
        }, 0);
    }
    this.impuestos.iva.monto = (this.subtotal * this.impuestos.iva.porcentaje) / 100;
    this.total = this.subtotal + this.impuestos.iva.monto;
    next();
});

// Método estático para obtener siguiente número
compraSchema.statics.obtenerSiguienteNumeroCompra = async function() {
    const ultima = await this.findOne().sort({ numeroCompra: -1 }).select('numeroCompra').lean();
    return ultima ? ultima.numeroCompra + 1 : 1;
};

module.exports = mongoose.model('Compra', compraSchema);
