import { Schema, model } from "mongoose";

// Schema para tokens de recuperación de contraseña
const passwordResetSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  token: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 3600 // El documento se elimina automáticamente después de 1 hora (3600 segundos)
  }
});

const PasswordReset = model('PasswordReset', passwordResetSchema);

export default PasswordReset;
