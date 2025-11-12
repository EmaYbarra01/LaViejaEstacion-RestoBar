const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schema de Usuario para La Vieja Estación - RestoBar
 * Gestiona usuarios, empleados y roles del sistema (HU12, RN5, RF6)
 */

const usuarioSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  apellido: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    required: true,
    enum: ['Administrador', 'Gerente', 'Mozo', 'Cajero', 'Cocina'],
    default: 'Mozo'
  },
  dni: {
    type: String,
    required: true,
    unique: true
  },
  telefono: {
    type: String,
    default: ''
  },
  direccion: {
    type: String,
    default: ''
  },
  activo: {
    type: Boolean,
    default: true
  },
  fechaIngreso: {
    type: Date,
    default: Date.now
  },
  ultimoAcceso: {
    type: Date
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices
usuarioSchema.index({ email: 1 });
usuarioSchema.index({ dni: 1 });
usuarioSchema.index({ rol: 1 });

// Virtual para nombre completo
usuarioSchema.virtual('nombreCompleto').get(function() {
  return `${this.nombre} ${this.apellido}`;
});

usuarioSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password; // No incluir password en respuestas JSON
    return ret;
  }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
