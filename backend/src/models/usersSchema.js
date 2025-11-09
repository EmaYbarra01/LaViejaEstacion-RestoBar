import { Schema, model } from "mongoose";

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  password: { type: String, required: true },
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    language: { type: String, default: 'es' },
    notifications: { type: Boolean, default: true }
  }
});

const User = model('User', userSchema);

export default User;
// Exporta el modelo para usarlo en otros archivos