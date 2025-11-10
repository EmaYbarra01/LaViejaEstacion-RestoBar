import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * Schema de Mesa para La Vieja Estación - RestoBar
 * Gestiona el estado y reservas de mesas (HU11, RN4, RF3)
 */

const mesaSchema = new Schema({
  numero: {
    type: Number,
    required: true,
    unique: true
  },
  capacidad: {
    type: Number,
    required: true,
    min: 1
  },
  estado: {
    type: String,
    required: true,
    enum: ['Libre', 'Ocupada', 'Reservada'],
    default: 'Libre'
  },
  ubicacion: {
    type: String,
    default: 'Salón Principal'
  },
  codigoQR: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices
mesaSchema.index({ numero: 1 });
mesaSchema.index({ estado: 1 });

export default mongoose.model('Mesa', mesaSchema);
