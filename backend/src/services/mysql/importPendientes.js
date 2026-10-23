import { createHash } from 'node:crypto';
import { check,texto,dinero,entero,dia } from './modulosHelpers.js';
const oid=v=>typeof v==='object'&&v!==null?String(v.$oid??v._id?.$oid??v._id??''):String(v??'');
const fecha=(v,def=new Date())=>{const d=new Date(v?.$date??v??def);check(!Number.isNaN(d.getTime()),'Fecha histórica inválida');return d;};
const huella=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
// El llamador controla la transacción y puede hacer ROLLBACK para simular.
export async function importarPendientes(c,datos,{vincularLegajos=false}={}){
 check(datos&&typeof datos==='object'&&!Array.isArray(datos),'El archivo debe contener un objeto con colecciones');
 for(const key of Object.keys(datos))check(['usuarios','productos','empleados','mensajes','sales'].includes(key),`Colección no admitida: ${key}. No se omite silenciosamente`);
 for(const key of ['usuarios','productos','empleados','mensajes','sales'])check(datos[key]===undefined||Array.isArray(datos[key]),`${key} debe ser una lista`);
 const usuarios=new Map(),productos=new Map(),conteo={empleados:0,mensajes:0,sales:0,omitidos:0};
 for(const u of datos.usuarios||[]){
 const id=oid(u._id);check(id,'Usuario histórico sin _id');const email=texto(u.email,'Email histórico',254).toLowerCase();const [[r]]=await c.execute('SELECT id,dni FROM usuarios WHERE email=?',[email]);
 check(r,`No se encontró en MySQL el usuario ${id}; migrá su cuenta antes de importar historiales`,409);if(u.dni)check(String(u.dni)===r.dni,`El DNI no coincide para el usuario ${id}`,409);usuarios.set(id,r.id);
 }
 for(const p of datos.productos||[]){const id=oid(p._id);check(id,'Producto histórico sin _id');const nombre=p.nombre??p.name;
 const [r]=p.codigo?await c.execute('SELECT id FROM productos WHERE codigo=?',[p.codigo]):await c.execute('SELECT id FROM productos WHERE nombre=?',[texto(nombre,'Nombre de producto',200)]);
 check(r.length===1,`No se pudo identificar unívocamente el producto ${id}; revisá código o nombre`,409);productos.set(id,r[0].id);}
 const uid=v=>{const id=usuarios.get(oid(v));check(id,`Referencia de usuario sin correspondencia: ${oid(v)}. Incluí usuarios en el JSON`,409);return id;};
 const pid=v=>{const id=productos.get(oid(v));check(id,`Referencia de producto sin correspondencia: ${oid(v)}. Incluí productos en el JSON`,409);return id;};
 async function previo(entidad,r){const mongo=oid(r._id);check(mongo,'Registro histórico sin _id');const hash=huella(r);const [[old]]=await c.execute('SELECT mysql_id,huella FROM migracion_mongo_ids WHERE entidad=? AND mongo_id=? FOR UPDATE',[entidad,mongo]);
 if(old){check(old.huella===hash,`El registro ${entidad}/${mongo} cambió desde su importación; se requiere revisión`,409);conteo.omitidos++;return null;}return {mongo,hash};}
 async function marcar(entidad,ref,id){await c.execute('INSERT INTO migracion_mongo_ids(entidad,mongo_id,mysql_id,huella) VALUES(?,?,?,?)',[entidad,ref.mongo,id,ref.hash]);conteo[entidad]++;}
 for(const e of datos.empleados||[]){const ref=await previo('empleados',e);if(!ref)continue;const id=uid(e.usuario);
 // No sobrescribir un legajo local, ni mezclar historiales sin una revisión explícita.
 const [[ex]]=await c.execute('SELECT id FROM empleados WHERE usuario_id=? FOR UPDATE',[id]);
 check(!ex||vincularLegajos,`El usuario ${id} ya tiene legajo SQL. Revisá la ficha y simulá con --vincular-legajos para conservarla e importar solo su historial`,409);
 let legajo;
 if(ex)legajo={insertId:ex.id};
 else [legajo]=await c.execute('INSERT INTO empleados(usuario_id,cargo,salario_mensual,fecha_contratacion,activo) VALUES(?,?,?,?,?)',[id,texto(e.cargo,'Cargo'),dinero(e.salarioMensual??0),fecha(e.fechaContratacion),e.activo!==false]);
 for(const a of e.asistencias||[])await c.execute('INSERT INTO asistencias(empleado_id,fecha,presente,hora_entrada,hora_salida,observaciones) VALUES(?,?,?,?,?,?)',[legajo.insertId,dia((a.fecha?.$date??a.fecha).slice(0,10)),a.presente!==false,a.horaEntrada||null,a.horaSalida||null,texto(a.observaciones??'','Observaciones',500,false)]);
 for(const a of e.inasistencias||[])await c.execute('INSERT INTO inasistencias(empleado_id,fecha,motivo,observaciones) VALUES(?,?,?,?)',[legajo.insertId,dia((a.fecha?.$date??a.fecha).slice(0,10)),texto(a.motivo??'','Motivo',200,false),texto(a.observaciones??'','Observaciones',500,false)]);
 const [[duplicado]]=await c.execute('SELECT a.id FROM asistencias a JOIN inasistencias i ON i.empleado_id=a.empleado_id AND i.fecha=a.fecha WHERE a.empleado_id=? LIMIT 1',[legajo.insertId]);check(!duplicado,'El legajo histórico tiene asistencia e inasistencia para el mismo día',409);
 for(const p of e.pagos||[])await c.execute('INSERT INTO pagos_empleado(empleado_id,mes,anio,monto,metodo_pago,observaciones,fecha_pago) VALUES(?,?,?,?,?,?,?)',[legajo.insertId,entero(p.mes,1,12,'Mes'),entero(p.anio,2000,9999,'Año'),dinero(p.monto,'Monto',true),p.metodoPago||'Efectivo',texto(p.observaciones??'','Observaciones',500,false),fecha(p.fechaPago)]);
 await marcar('empleados',ref,id);}
 for(const m of datos.mensajes||[]){const ref=await previo('mensajes',m);if(!ref)continue;const [r]=await c.execute('INSERT INTO mensajes(remitente_id,destinatario_id,remitente_rol,destinatario_rol,texto,leido,created_at) VALUES(?,?,?,?,?,?,?)',[uid(m.remitente),uid(m.destinatario),m.remitenteRol,m.destinatarioRol,texto(m.texto,'Mensaje',5000),!!m.leido,fecha(m.createdAt)]);await marcar('mensajes',ref,r.insertId);}
 for(const v of datos.sales||[]){const ref=await previo('sales',v);if(!ref)continue;check(Array.isArray(v.items)&&v.items.length,'Venta histórica sin detalle');const [r]=await c.execute('INSERT INTO ventas(usuario_id,total,fecha) VALUES(?,?,?)',[uid(v.userId),dinero(v.total),fecha(v.date)]);
 for(const i of v.items){const id=pid(i.productId);const [[p]]=await c.execute('SELECT nombre FROM productos WHERE id=?',[id]);const q=entero(i.quantity,1,1000000,'Cantidad'),precio=dinero(i.priceAtSale,'Precio histórico');
 await c.execute('INSERT INTO detalle_venta(venta_id,producto_id,nombre_historico,cantidad,precio_unitario) VALUES(?,?,?,?,?)',[r.insertId,id,p.nombre,q,precio]);}
 const [[t]]=await c.execute('SELECT SUM(ROUND(cantidad*precio_unitario,2)) total FROM detalle_venta WHERE venta_id=?',[r.insertId]);check(Math.round(Number(t.total)*100)===Math.round(Number(v.total)*100),`Total histórico no concilia en sales/${ref.mongo}`,409);
 // No descontar de nuevo stock por una venta histórica.
 await marcar('sales',ref,r.insertId);}
 return conteo;
}
