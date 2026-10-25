import { transaction,actor,positiveId } from '../../database/mysql/transaction.js';
import { check,entero,admin } from './modulosHelpers.js';
const roles=[...admin,'Mozo','Cajero','EncargadoCocina'];
async function leer(c,where='',params=[]){const [rows]=await c.execute(`SELECT v.*,u.nombre,u.apellido,u.email FROM ventas v JOIN usuarios u ON u.id=v.usuario_id ${where} ORDER BY v.fecha DESC,v.id DESC`,params);if(!rows.length)return [];
 const [items]=await c.execute(`SELECT d.*,d.precio_unitario precio FROM detalle_venta d WHERE d.venta_id IN (${rows.map(()=>'?').join(',')}) ORDER BY d.id`,rows.map(r=>r.id));
 return rows.map(r=>({id:String(r.id),items:items.filter(d=>d.venta_id===r.id).map(d=>({id:String(d.producto_id),name:d.nombre_historico,price:Number(d.precio),quantity:Number(d.cantidad)})),total:Number(r.total),customerInfo:{name:`${r.nombre} ${r.apellido}`,email:r.email},date:r.fecha,usuarioId:r.usuario_id,origen:'Ventas heredadas'}));}
export function ventasLegacyService(pool){return {
 async listar(usuario,todas=false,id){return transaction(pool,async c=>{const u=await actor(c,usuario,roles);if(todas)check(admin.includes(u.rol),'No tiene permiso para consultar todas las ventas',403);
 let where=todas?'':'WHERE v.usuario_id=?',params=todas?[]:[u.id];
 if(id!==undefined){where='WHERE v.id=?';params=[positiveId(id)];if(!admin.includes(u.rol)){where+=' AND v.usuario_id=?';params.push(u.id);}}
 const r=await leer(c,where,params);if(id!==undefined){check(r.length,'Venta no encontrada',404);return r[0];}return r;});},
 async crear(usuario,b){return transaction(pool,async c=>{const u=await actor(c,usuario,roles);check(Array.isArray(b.items)&&b.items.length>0&&b.items.length<=100,'Debe enviar entre 1 y 100 productos');
 const cantidades=new Map();for(const i of b.items){check(i&&typeof i==='object','Producto inválido');const id=positiveId(i.productId),q=entero(i.quantity,1,1000000,'Cantidad');cantidades.set(id,(cantidades.get(id)||0)+q);}
 const productos=[];for(const [id,q] of [...cantidades].sort((a,b)=>a[0]-b[0])){const [[p]]=await c.execute('SELECT * FROM productos WHERE id=? FOR UPDATE',[id]);check(p&&p.disponible,'Producto no disponible',404);check(Number(p.stock)>=q,`Stock insuficiente para ${p.nombre}`,409);productos.push({...p,q});}
 const [v]=await c.execute('INSERT INTO ventas(usuario_id,total) VALUES(?,0)',[u.id]);
 for(const p of productos){await c.execute('INSERT INTO detalle_venta(venta_id,producto_id,nombre_historico,cantidad,precio_unitario) VALUES(?,?,?,?,?)',[v.insertId,p.id,p.nombre,p.q,p.precio]);
 await c.execute('UPDATE productos SET disponible=(stock-? > 0),stock=stock-? WHERE id=?',[p.q,p.q,p.id]);await c.execute('INSERT INTO movimientos_stock(producto_id,cantidad,motivo,registrado_por_id) VALUES(?,?,?,?)',[p.id,-p.q,`Venta heredada ${v.insertId}`,u.id]);}
 await c.execute('UPDATE ventas SET total=(SELECT SUM(ROUND(cantidad*precio_unitario,2)) FROM detalle_venta WHERE venta_id=?) WHERE id=?',[v.insertId,v.insertId]);return (await leer(c,'WHERE v.id=?',[v.insertId]))[0];});}
};}
