/**
 * Modelo de Reservas
 * Gestiona las reservas de mesas del restaurante
 */

import mongoose from 'mongoose';

const reservaSchema = new mongoose.Schema({
  // Datos del cliente
  cliente: {
    type: String,
    required: [true, 'El nombre del cliente es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido']
  },
  
  telefono: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    trim: true,
    match: [/^[0-9]{10}$/, 'El teléfono debe tener 10 dígitos']
  },
  
  // Datos de la reserva
  fecha: {
    type: Date,
    required: [true, 'La fecha es obligatoria'],
    validate: {
      validator: function(value) {
        // La fecha debe ser igual o posterior a hoy
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return value >= hoy;
      },
      message: 'La fecha no puede ser anterior a hoy'
    }
  },
  
  hora: {
    type: String,
    required: [true, 'La hora es obligatoria'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
  },
  
  comensales: {
    type: Number,
    required: [true, 'El número de comensales es obligatorio'],
    min: [1, 'Debe haber al menos 1 comensal'],
    max: [20, 'El máximo es 20 comensales']
  },
  
  // Referencia a la mesa
  mesa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mesa',
    default: null
  },
  
  numeroMesa: {
    type: Number,
    default: null
  },
  
  // Estado de la reserva
  estado: {
    type: String,
    enum: ['Pendiente', 'Confirmada', 'Cancelada', 'Completada'],
    default: 'Pendiente'
  },
  
  // Comentarios adicionales
  comentarios: {
    type: String,
    maxlength: [500, 'Los comentarios no pueden exceder 500 caracteres'],
    default: ''
  },
  
  // Sistema de confirmación por email
  confirmationToken: {
    type: String,
    default: null
  },
  
  tokenExpiry: {
    type: Date,
    default: null
  },
  
  confirmedAt: {
    type: Date,
    default: null
  },
  
  cancelledAt: {
    type: Date,
    default: null
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices para mejorar el rendimiento
reservaSchema.index({ fecha: 1, hora: 1 });
reservaSchema.index({ email: 1 });
reservaSchema.index({ estado: 1 });
reservaSchema.index({ mesa: 1 });

// Método para verificar si la reserva está activa
reservaSchema.methods.estaActiva = function() {
  return this.estado === 'Pendiente' || this.estado === 'Confirmada';
};

// Método virtual para obtener fecha y hora completa
reservaSchema.virtual('fechaHoraCompleta').get(function() {
  const fecha = new Date(this.fecha);
  return `${fecha.toLocaleDateString('es-AR')} ${this.hora}`;
});

const Reserva = mongoose.model('Reserva', reservaSchema);

export default Reserva;
