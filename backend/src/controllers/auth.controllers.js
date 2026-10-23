import { pool } from '../database/mysql/pool.js';
import { passwordResetService } from '../services/mysql/passwordReset.js';
import { endpoint } from '../services/mysql/modulosHelpers.js';
import { sendPasswordResetEmail,sendPasswordChangedEmail } from '../config/nodemailer.config.js';
const s=passwordResetService(pool,{sendReset:sendPasswordResetEmail,sendChanged:sendPasswordChangedEmail});
export const forgotPassword=endpoint(async req=>({body:await s.solicitar(req.body?.email)}));
export const resetPassword=endpoint(async req=>({body:await s.restablecer(req.body?.token,req.body?.newPassword)}));
export const verifyResetToken=endpoint(async req=>({body:await s.verificar(req.params.token)}));
