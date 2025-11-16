import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * Schema de Empleado (extensión de Usuario)
 * Gestiona información adicional de empleados: asistencias, salarios, pagos
 */

const asistenciaSchema = new Schema({
  fecha: {
    type: Date,
    required: true
  },
  presente: {
    type: Boolean,
    default: true
  },
  horaEntrada: {
    type: String,
    default: ''
  },
  horaSalida: {
    type: String,
    default: ''
  },
  observaciones: {
    type: String,
    default: ''
  }
}, { _id: false });

const inasistenciaSchema = new Schema({
  fecha: {
    type: Date,
    required: true
  },
  motivo: {
    type: String,
    default: 'Sin registrar asistencia'
  },
  observaciones: {
    type: String,
    default: ''
  }
}, { _id: false });

const pagoSchema = new Schema({
  mes: {
    type: Number, // 1-12
    required: true
  },
  anio: {
    type: Number,
    required: true
  },
  monto: {
    type: Number,
    required: true
  },
  fechaPago: {
    type: Date,
    default: Date.now
  },
  metodoPago: {
    type: String,
    enum: ['Efectivo', 'Transferencia', 'Cheque'],
    default: 'Efectivo'
  },
  observaciones: {
    type: String,
    default: ''
  }
}, { _id: false });

const empleadoSchema = new Schema({
  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    unique: true
  },
  salarioMensual: {
    type: Number,
    required: true,
    default: 0
  },
  cargo: {
    type: String,
    required: true
  },
  fechaContratacion: {
    type: Date,
    default: Date.now
  },
  asistencias: [asistenciaSchema],
  inasistencias: [inasistenciaSchema],
  pagos: [pagoSchema],
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices
empleadoSchema.index({ usuario: 1 });
empleadoSchema.index({ activo: 1 });

// Método para registrar asistencia
empleadoSchema.methods.registrarAsistencia = function(fecha, presente = true, horaEntrada = '', horaSalida = '') {
  this.asistencias.push({
    fecha,
    presente,
    horaEntrada,
    horaSalida
  });
  return this.save();
};

// Método para registrar pago
empleadoSchema.methods.registrarPago = function(mes, anio, monto, metodoPago = 'Efectivo') {
  this.pagos.push({
    mes,
    anio,
    monto,
    metodoPago
  });
  return this.save();
};

// Método para obtener días trabajados en un mes
empleadoSchema.methods.diasTrabajadosMes = function(mes, anio) {
  return this.asistencias.filter(a => {
    const fecha = new Date(a.fecha);
    return a.presente && 
           fecha.getMonth() + 1 === mes && 
           fecha.getFullYear() === anio;
  }).length;
};

// Método para verificar si está pagado un mes
empleadoSchema.methods.estaPagadoMes = function(mes, anio) {
  return this.pagos.some(p => p.mes === mes && p.anio === anio);
};

// Método para registrar inasistencia
empleadoSchema.methods.registrarInasistencia = function(fecha, motivo = 'Sin registrar asistencia', observaciones = '') {
  this.inasistencias.push({
    fecha,
    motivo,
    observaciones
  });
  return this.save();
};

// Método para obtener inasistencias de un mes
empleadoSchema.methods.inasistenciasMes = function(mes, anio) {
  return this.inasistencias.filter(i => {
    const fecha = new Date(i.fecha);
    return fecha.getMonth() + 1 === mes && 
           fecha.getFullYear() === anio;
  }).length;
};

export default mongoose.model('Empleado', empleadoSchema);
