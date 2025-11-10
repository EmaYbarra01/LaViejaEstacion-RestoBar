const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schema de Cierre de Caja para La Vieja Estación - RestoBar
 * 
 * Gestiona el cierre diario de caja registrando todas las ventas,
 * métodos de pago y efectivo disponible al finalizar el turno.
 * 
 * Implementa: HU14, RN6, RF7
 */

const cierreCajaSchema = new Schema({
    // Número de cierre único (generado automáticamente)
    numeroCierre: {
        type: Number,
        required: true,
        unique: true
    },

    // Fecha y hora del cierre
    fechaCierre: {
        type: Date,
        required: true,
        default: Date.now
    },

    // Turno del cierre
    turno: {
        type: String,
        required: true,
        enum: ['Mañana', 'Tarde', 'Noche', 'Completo'],
        default: 'Completo'
    },

    // Usuario que realizó el cierre (Cajero o Administrador)
    realizadoPor: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },

    // Hora de inicio del turno
    horaInicio: {
        type: Date,
        required: true
    },

    // Hora de fin del turno
    horaFin: {
        type: Date,
        required: true
    },

    // Monto inicial en caja
    montoInicial: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },

    // Detalle de ventas por método de pago
    ventasPorMetodo: {
        efectivo: {
            cantidad: {
                type: Number,
                default: 0,
                min: 0
            },
            total: {
                type: Number,
                default: 0,
                min: 0
            }
        },
        transferencia: {
            cantidad: {
                type: Number,
                default: 0,
                min: 0
            },
            total: {
                type: Number,
                default: 0,
                min: 0
            }
        }
    },

    // Total de ventas del turno
    totalVentas: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },

    // Total de descuentos aplicados (principalmente por pago en efectivo)
    totalDescuentos: {
        type: Number,
        default: 0,
        min: 0
    },

    // Detalle de pedidos incluidos en el cierre
    pedidos: [{
        pedidoId: {
            type: Schema.Types.ObjectId,
            ref: 'Pedido',
            required: true
        },
        numeroPedido: {
            type: Number,
            required: true
        },
        mesa: {
            type: Number,
            required: true
        },
        mozo: {
            type: String,
            required: true
        },
        metodoPago: {
            type: String,
            required: true
        },
        monto: {
            type: Number,
            required: true,
            min: 0
        },
        descuento: {
            type: Number,
            default: 0,
            min: 0
        },
        horaPago: {
            type: Date,
            required: true
        }
    }],

    // Efectivo en caja (inicial + ventas en efectivo)
    efectivoEnCaja: {
        type: Number,
        required: true,
        min: 0
    },

    // Efectivo contado físicamente
    efectivoContado: {
        type: Number,
        required: true,
        min: 0
    },

    // Diferencia entre el efectivo esperado y el contado
    diferencia: {
        type: Number,
        default: 0
    },

    // Desglose de billetes y monedas (opcional)
    desgloseBilletes: {
        mil: {
            cantidad: { type: Number, default: 0, min: 0 },
            total: { type: Number, default: 0, min: 0 }
        },
        doscientos: {
            cantidad: { type: Number, default: 0, min: 0 },
            total: { type: Number, default: 0, min: 0 }
        },
        cien: {
            cantidad: { type: Number, default: 0, min: 0 },
            total: { type: Number, default: 0, min: 0 }
        },
        cincuenta: {
            cantidad: { type: Number, default: 0, min: 0 },
            total: { type: Number, default: 0, min: 0 }
        },
        veinte: {
            cantidad: { type: Number, default: 0, min: 0 },
            total: { type: Number, default: 0, min: 0 }
        },
        diez: {
            cantidad: { type: Number, default: 0, min: 0 },
            total: { type: Number, default: 0, min: 0 }
        },
        monedas: {
            cantidad: { type: Number, default: 0, min: 0 },
            total: { type: Number, default: 0, min: 0 }
        }
    },

    // Gastos realizados durante el turno
    gastos: [{
        concepto: {
            type: String,
            required: true,
            trim: true
        },
        monto: {
            type: Number,
            required: true,
            min: 0
        },
        comprobante: {
            type: String,
            default: ''
        },
        fecha: {
            type: Date,
            default: Date.now
        }
    }],

    // Total de gastos
    totalGastos: {
        type: Number,
        default: 0,
        min: 0
    },

    // Ingresos adicionales (no por ventas)
    ingresosAdicionales: [{
        concepto: {
            type: String,
            required: true,
            trim: true
        },
        monto: {
            type: Number,
            required: true,
            min: 0
        },
        fecha: {
            type: Date,
            default: Date.now
        }
    }],

    // Total de ingresos adicionales
    totalIngresosAdicionales: {
        type: Number,
        default: 0,
        min: 0
    },

    // Observaciones del cierre
    observaciones: {
        type: String,
        default: ''
    },

    // Estado del cierre
    estado: {
        type: String,
        enum: ['Abierto', 'Cerrado', 'Revisado', 'Auditado'],
        default: 'Cerrado',
        required: true
    },

    // Supervisor que revisó el cierre (opcional)
    revisadoPor: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },

    // Fecha de revisión
    fechaRevision: {
        type: Date
    },

    // Observaciones de la revisión
    observacionesRevision: {
        type: String,
        default: ''
    },

    // Monto entregado a gerencia
    montoEntregado: {
        type: Number,
        default: 0,
        min: 0
    },

    // Monto que queda en caja para el siguiente turno
    montoParaSiguienteTurno: {
        type: Number,
        default: 0,
        min: 0
    }

}, {
    timestamps: true,
    versionKey: false
});

// Índices para mejorar el rendimiento de consultas
cierreCajaSchema.index({ numeroCierre: 1 });
cierreCajaSchema.index({ fechaCierre: -1 });
cierreCajaSchema.index({ realizadoPor: 1 });
cierreCajaSchema.index({ turno: 1 });
cierreCajaSchema.index({ estado: 1 });

// Middleware pre-save para calcular totales automáticamente
cierreCajaSchema.pre('save', function(next) {
    // Calcular total de ventas por método de pago
    if (this.pedidos && this.pedidos.length > 0) {
        // Resetear contadores
        this.ventasPorMetodo.efectivo.cantidad = 0;
        this.ventasPorMetodo.efectivo.total = 0;
        this.ventasPorMetodo.transferencia.cantidad = 0;
        this.ventasPorMetodo.transferencia.total = 0;
        this.totalDescuentos = 0;

        // Calcular por cada pedido
        this.pedidos.forEach(pedido => {
            if (pedido.metodoPago === 'Efectivo') {
                this.ventasPorMetodo.efectivo.cantidad += 1;
                this.ventasPorMetodo.efectivo.total += pedido.monto;
            } else if (pedido.metodoPago === 'Transferencia') {
                this.ventasPorMetodo.transferencia.cantidad += 1;
                this.ventasPorMetodo.transferencia.total += pedido.monto;
            }
            this.totalDescuentos += pedido.descuento || 0;
        });

        // Total de ventas
        this.totalVentas = this.ventasPorMetodo.efectivo.total + 
                          this.ventasPorMetodo.transferencia.total;
    }

    // Calcular total de gastos
    if (this.gastos && this.gastos.length > 0) {
        this.totalGastos = this.gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
    }

    // Calcular total de ingresos adicionales
    if (this.ingresosAdicionales && this.ingresosAdicionales.length > 0) {
        this.totalIngresosAdicionales = this.ingresosAdicionales.reduce(
            (sum, ingreso) => sum + ingreso.monto, 0
        );
    }

    // Calcular efectivo esperado en caja
    this.efectivoEnCaja = this.montoInicial + 
                          this.ventasPorMetodo.efectivo.total + 
                          this.totalIngresosAdicionales - 
                          this.totalGastos;

    // Calcular diferencia
    this.diferencia = this.efectivoContado - this.efectivoEnCaja;

    // Calcular total del desglose de billetes
    const totalDesglose = 
        this.desgloseBilletes.mil.total +
        this.desgloseBilletes.doscientos.total +
        this.desgloseBilletes.cien.total +
        this.desgloseBilletes.cincuenta.total +
        this.desgloseBilletes.veinte.total +
        this.desgloseBilletes.diez.total +
        this.desgloseBilletes.monedas.total;

    // Si hay desglose, usar ese valor como efectivo contado
    if (totalDesglose > 0 && this.efectivoContado === 0) {
        this.efectivoContado = totalDesglose;
        this.diferencia = this.efectivoContado - this.efectivoEnCaja;
    }

    next();
});

// Método para agregar un pedido al cierre
cierreCajaSchema.methods.agregarPedido = function(pedido) {
    this.pedidos.push({
        pedidoId: pedido._id,
        numeroPedido: pedido.numeroPedido,
        mesa: pedido.mesa.numero || pedido.mesa,
        mozo: pedido.mozo.nombreCompleto || `${pedido.mozo.nombre} ${pedido.mozo.apellido}`,
        metodoPago: pedido.metodoPago,
        monto: pedido.total,
        descuento: pedido.descuento.monto || 0,
        horaPago: pedido.fechaCobrado || pedido.pago.fecha
    });
    
    return this.save();
};

// Método para revisar el cierre
cierreCajaSchema.methods.revisar = function(supervisor, observaciones = '') {
    this.estado = 'Revisado';
    this.revisadoPor = supervisor;
    this.fechaRevision = new Date();
    this.observacionesRevision = observaciones;
    
    return this.save();
};

// Método estático para obtener el siguiente número de cierre
cierreCajaSchema.statics.obtenerSiguienteNumeroCierre = async function() {
    const ultimoCierre = await this.findOne()
        .sort({ numeroCierre: -1 })
        .select('numeroCierre')
        .lean();
    
    return ultimoCierre ? ultimoCierre.numeroCierre + 1 : 1;
};

// Método estático para obtener cierres por rango de fechas
cierreCajaSchema.statics.obtenerPorFechas = function(fechaInicio, fechaFin) {
    const query = {
        fechaCierre: {
            $gte: new Date(fechaInicio),
            $lte: new Date(fechaFin)
        }
    };
    
    return this.find(query)
        .populate('realizadoPor', 'nombre apellido')
        .populate('revisadoPor', 'nombre apellido')
        .sort({ fechaCierre: -1 });
};

// Método estático para reportes de cierres (HU15)
cierreCajaSchema.statics.reporteCierres = function(filtros = {}) {
    const query = {};
    
    // Filtro por fecha
    if (filtros.fechaInicio || filtros.fechaFin) {
        query.fechaCierre = {};
        if (filtros.fechaInicio) {
            query.fechaCierre.$gte = new Date(filtros.fechaInicio);
        }
        if (filtros.fechaFin) {
            query.fechaCierre.$lte = new Date(filtros.fechaFin);
        }
    }
    
    // Filtro por turno
    if (filtros.turno) {
        query.turno = filtros.turno;
    }
    
    // Filtro por usuario que realizó el cierre
    if (filtros.usuario) {
        query.realizadoPor = filtros.usuario;
    }
    
    // Filtro por estado
    if (filtros.estado) {
        query.estado = filtros.estado;
    }
    
    return this.find(query)
        .populate('realizadoPor', 'nombre apellido rol')
        .populate('revisadoPor', 'nombre apellido')
        .sort({ fechaCierre: -1 });
};

// Virtual para calcular el balance del turno
cierreCajaSchema.virtual('balance').get(function() {
    return this.totalVentas + this.totalIngresosAdicionales - this.totalGastos;
});

// Virtual para calcular porcentaje de diferencia
cierreCajaSchema.virtual('porcentajeDiferencia').get(function() {
    if (this.efectivoEnCaja > 0) {
        return ((this.diferencia / this.efectivoEnCaja) * 100).toFixed(2);
    }
    return 0;
});

// Virtual para determinar si hay faltante o sobrante
cierreCajaSchema.virtual('tipoDiferencia').get(function() {
    if (this.diferencia === 0) return 'Exacto';
    return this.diferencia > 0 ? 'Sobrante' : 'Faltante';
});

// Asegurar que los virtuals se incluyan en JSON
cierreCajaSchema.set('toJSON', { virtuals: true });
cierreCajaSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CierreCaja', cierreCajaSchema);
