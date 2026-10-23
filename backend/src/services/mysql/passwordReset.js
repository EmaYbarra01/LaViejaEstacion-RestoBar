import { createHash,randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { transaction } from '../../database/mysql/transaction.js';
import { check,texto } from './modulosHelpers.js';
const hash=v=>createHash('sha256').update(v).digest('hex');
const tokenValido=t=>typeof t==='string'&&/^[a-f0-9]{64}$/.test(t);
const GENERICO='Si el email existe, recibirás un correo con las instrucciones para restablecer tu contraseña';
export function passwordResetService(pool,{sendReset,sendChanged}={}){return {
 async solicitar(email){email=texto(email,'Email',254).toLowerCase();check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),'Email inválido');
 const datos=await transaction(pool,async c=>{const [[u]]=await c.execute('SELECT id,email,nombre FROM usuarios WHERE email=? AND activo=TRUE FOR UPDATE',[email]);if(!u)return null;
 const token=randomBytes(32).toString('hex');await c.execute('DELETE FROM recuperaciones_password WHERE expires_at<=UTC_TIMESTAMP(3)');
 await c.execute('DELETE FROM recuperaciones_password WHERE usuario_id=?',[u.id]);
 await c.execute('INSERT INTO recuperaciones_password(usuario_id,token_hash,expires_at) VALUES(?,?,DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 1 HOUR))',[u.id,hash(token)]);return {...u,token};});
 if(datos){try{check(typeof sendReset==='function','Envío de correo no disponible',503);await sendReset(datos.email,datos.token,datos.nombre);}catch(e){
 await pool.execute('DELETE FROM recuperaciones_password WHERE usuario_id=? AND token_hash=?',[datos.id,hash(datos.token)]);console.warn('No se pudo enviar el correo de recuperación');}}
 return {mensaje:GENERICO};},
 async verificar(token){check(tokenValido(token),'Token inválido o expirado');const [[u]]=await pool.execute('SELECT u.email FROM recuperaciones_password p JOIN usuarios u ON u.id=p.usuario_id WHERE p.token_hash=? AND p.usado_at IS NULL AND p.expires_at>UTC_TIMESTAMP(3) AND u.activo=TRUE',[hash(token)]);check(u,'Token inválido o expirado');return {valid:true,mensaje:'Token válido',email:u.email};},
 async restablecer(token,password){check(tokenValido(token),'Token inválido o expirado');check(typeof password==='string'&&password.length>=6&&Buffer.byteLength(password)<=72,'La contraseña debe tener entre 6 caracteres y 72 bytes');
 const passwordHash=await bcrypt.hash(password,10);
 const u=await transaction(pool,async c=>{
 // Bloquear primero el usuario mantiene el mismo orden de bloqueos que solicitar().
 const [[ref]]=await c.execute('SELECT usuario_id FROM recuperaciones_password WHERE token_hash=?',[hash(token)]);check(ref,'Token inválido o expirado');
 const [[user]]=await c.execute('SELECT id,email,nombre,activo FROM usuarios WHERE id=? FOR UPDATE',[ref.usuario_id]);check(user?.activo,'Token inválido o expirado');
 const [[p]]=await c.execute('SELECT usuario_id FROM recuperaciones_password WHERE usuario_id=? AND token_hash=? AND usado_at IS NULL AND expires_at>UTC_TIMESTAMP(3) FOR UPDATE',[user.id,hash(token)]);check(p,'Token inválido o expirado');
 await c.execute('UPDATE usuarios SET password_hash=? WHERE id=?',[passwordHash,user.id]);await c.execute('DELETE FROM recuperaciones_password WHERE usuario_id=?',[user.id]);return user;});
 try{await sendChanged?.(u.email,u.nombre);}catch(e){console.warn('Contraseña actualizada; no se pudo enviar el aviso');}
 return {mensaje:'Contraseña actualizada exitosamente'};}
};}
