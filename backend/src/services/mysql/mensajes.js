import { transaction,actor } from '../../database/mysql/transaction.js';
import { check,texto,admin } from './modulosHelpers.js';
const select=`SELECT m.*,a.nombre remitente_nombre,a.apellido remitente_apellido,b.nombre destinatario_nombre,b.apellido destinatario_apellido FROM mensajes m JOIN usuarios a ON a.id=m.remitente_id JOIN usuarios b ON b.id=m.destinatario_id`;
function formato(r){return {_id:String(r.id),remitente:{_id:String(r.remitente_id),nombre:r.remitente_nombre,apellido:r.remitente_apellido,rol:r.remitente_rol},destinatario:{_id:String(r.destinatario_id),nombre:r.destinatario_nombre,apellido:r.destinatario_apellido,rol:r.destinatario_rol},remitenteRol:r.remitente_rol,destinatarioRol:r.destinatario_rol,texto:r.texto,leido:!!r.leido,createdAt:r.created_at};}
export function mensajesService(pool){return {
 async listar(usuario){return transaction(pool,async c=>{await actor(c,usuario,admin);const [r]=await c.query(`${select} WHERE (m.remitente_rol='Gerente' AND m.destinatario_rol='SuperAdministrador') OR (m.remitente_rol='SuperAdministrador' AND m.destinatario_rol='Gerente') ORDER BY m.created_at,m.id`);return r.map(formato);});},
 async crear(usuario,b){return transaction(pool,async c=>{const u=await actor(c,usuario,admin);const destino=b.destinatarioRol||(u.rol==='Gerente'?'SuperAdministrador':'Gerente');check(admin.includes(destino)&&destino!==u.rol,'El destinatario debe ser el otro rol de administración');
 const [[d]]=await c.execute('SELECT u.id FROM usuarios u JOIN roles r ON r.id=u.rol_id WHERE u.activo=TRUE AND r.nombre=? ORDER BY u.id LIMIT 1',[destino]);check(d,'No existe un destinatario activo para ese rol',404);
 const [r]=await c.execute('INSERT INTO mensajes(remitente_id,destinatario_id,remitente_rol,destinatario_rol,texto) VALUES(?,?,?,?,?)',[u.id,d.id,u.rol,destino,texto(b.texto,'Mensaje',5000)]);
 const [[m]]=await c.execute(`${select} WHERE m.id=?`,[r.insertId]);return formato(m);});}
};}
