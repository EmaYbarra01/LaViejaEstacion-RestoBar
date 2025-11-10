import User from '../models/usuarioSchema.js';
import PasswordReset from '../models/passwordResetSchema.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendPasswordResetEmail, sendPasswordChangedEmail } from '../config/nodemailer.config.js';

// Solicitar recuperación de contraseña
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validar que el email fue proporcionado
        if (!email) {
            return res.status(400).json({ mensaje: 'El email es requerido' });
        }

        // Buscar usuario por email
        const user = await User.findOne({ email });
        if (!user) {
            // Por seguridad, no revelamos si el email existe o no
            return res.status(200).json({ 
                mensaje: 'Si el email existe, recibirás un correo con las instrucciones para restablecer tu contraseña' 
            });
        }

        // Eliminar tokens anteriores del usuario
        await PasswordReset.deleteMany({ userId: user._id });

        // Generar token único
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Hashear el token antes de guardarlo
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Guardar token en la base de datos
        await PasswordReset.create({
            userId: user._id,
            token: hashedToken
        });

        // Enviar email con el token sin hashear
        try {
            await sendPasswordResetEmail(user.email, resetToken, user.username);
            
            res.status(200).json({ 
                mensaje: 'Si el email existe, recibirás un correo con las instrucciones para restablecer tu contraseña' 
            });
        } catch (emailError) {
            console.error('Error al enviar email:', emailError);
            // Eliminar el token si no se pudo enviar el email
            await PasswordReset.deleteOne({ userId: user._id, token: hashedToken });
            
            return res.status(500).json({ 
                mensaje: 'Error al enviar el correo de recuperación. Por favor, intenta de nuevo más tarde.' 
            });
        }

    } catch (error) {
        console.error('Error en forgotPassword:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor al procesar la solicitud' });
    }
};

// Restablecer contraseña con token
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Validar datos
        if (!token || !newPassword) {
            return res.status(400).json({ mensaje: 'Token y nueva contraseña son requeridos' });
        }

        // Validar longitud mínima de contraseña
        if (newPassword.length < 6) {
            return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Hashear el token recibido para compararlo con el almacenado
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Buscar el token en la base de datos
        const resetToken = await PasswordReset.findOne({ token: hashedToken });

        if (!resetToken) {
            return res.status(400).json({ mensaje: 'Token inválido o expirado' });
        }

        // Buscar el usuario
        const user = await User.findById(resetToken.userId);
        if (!user) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Hashear la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Actualizar la contraseña del usuario
        user.password = hashedPassword;
        await user.save();

        // Eliminar el token usado
        await PasswordReset.deleteOne({ _id: resetToken._id });

        // Enviar email de confirmación
        try {
            await sendPasswordChangedEmail(user.email, user.username);
        } catch (emailError) {
            console.error('Error al enviar email de confirmación:', emailError);
            // No fallar la operación si el email no se envía
        }

        res.status(200).json({ mensaje: 'Contraseña actualizada exitosamente' });

    } catch (error) {
        console.error('Error en resetPassword:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor al restablecer la contraseña' });
    }
};

// Verificar si un token es válido (opcional, útil para el frontend)
export const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({ mensaje: 'Token es requerido' });
        }

        // Hashear el token para comparar
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Buscar el token
        const resetToken = await PasswordReset.findOne({ token: hashedToken });

        if (!resetToken) {
            return res.status(400).json({ 
                valid: false, 
                mensaje: 'Token inválido o expirado' 
            });
        }

        // Verificar que el usuario existe
        const user = await User.findById(resetToken.userId);
        if (!user) {
            return res.status(404).json({ 
                valid: false, 
                mensaje: 'Usuario no encontrado' 
            });
        }

        res.status(200).json({ 
            valid: true, 
            mensaje: 'Token válido',
            email: user.email 
        });

    } catch (error) {
        console.error('Error en verifyResetToken:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor al verificar el token' });
    }
};
