import { pool } from '../database/mysql/pool.js';
import { mensajesService } from '../services/mysql/mensajes.js';
import { endpoint } from '../services/mysql/modulosHelpers.js';
const s=mensajesService(pool);
export const listarMensajesEntreRoles=endpoint(async req=>({body:{mensajes:await s.listar(req.user?.id??req.id)}}));
export const crearMensaje=endpoint(async req=>({status:201,body:{mensaje:'Mensaje enviado correctamente',data:await s.crear(req.user?.id??req.id,req.body||{})}}));
