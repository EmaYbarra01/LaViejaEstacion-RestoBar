import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const { Schema } = mongoose;

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
    // Roles alineados con initDB.js (fuente de verdad)
    enum: ['SuperAdministrador', 'Gerente', 'Mozo', 'Cajero', 'EncargadoCocina'],
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

// Middleware para hashear la contraseña antes de guardar
usuarioSchema.pre('save', async function(next) {
  // Solo hashear si la contraseña ha sido modificada (o es nueva)
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
usuarioSchema.methods.compararPassword = async function(passwordIngresado) {
  return await bcrypt.compare(passwordIngresado, this.password);
};

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

export default mongoose.model('Usuario', usuarioSchema);
