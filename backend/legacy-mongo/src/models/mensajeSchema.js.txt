import mongoose from 'mongoose';

const mensajeSchema = new mongoose.Schema({
  remitente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  destinatario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  remitenteRol: {
    type: String,
    enum: ['SuperAdministrador', 'Gerente', 'Mozo', 'Cajero', 'EncargadoCocina'],
    required: true
  },
  destinatarioRol: {
    type: String,
    enum: ['SuperAdministrador', 'Gerente', 'Mozo', 'Cajero', 'EncargadoCocina'],
    required: true
  },
  texto: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  leido: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

mensajeSchema.index({ remitente: 1, destinatario: 1, createdAt: -1 });

export default mongoose.model('Mensaje', mensajeSchema);
