import { pool } from '../database/mysql/pool.js';
import { ventasLegacyService } from '../services/mysql/ventasLegacy.js';
import { endpoint } from '../services/mysql/modulosHelpers.js';
const s=ventasLegacyService(pool),uid=req=>req.user?.id??req.id;
export const obtenerVentas=endpoint(async req=>({body:await s.listar(uid(req),true)}));
export const obtenerVentasUsuario=endpoint(async req=>({body:await s.listar(uid(req))}));
export const obtenerUnaVenta=endpoint(async req=>({body:await s.listar(uid(req),false,req.params.id)}));
export const crearVenta=endpoint(async req=>({status:201,body:{mensaje:'Venta creada exitosamente',sale:await s.crear(uid(req),req.body||{})}}));
