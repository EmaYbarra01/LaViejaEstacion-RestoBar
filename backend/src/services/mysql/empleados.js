import bcrypt from 'bcryptjs';
import { transaction,actor,positiveId } from '../../database/mysql/transaction.js';
import { check,texto,dinero,entero,dia,admin } from './modulosHelpers.js';
const cargos={'Mozo':'Mozo','Cajero':'Cajero','Gerente':'Gerente','Encargado de Cocina':'EncargadoCocina','EncargadoCocina':'EncargadoCocina','SuperAdministrador':'SuperAdministrador'};
const base=`SELECT u.id,u.nombre,u.apellido,u.email,u.dni,u.telefono,u.direccion,u.activo usuario_activo,u.fecha_ingreso,r.nombre rol,
 e.usuario_id,e.cargo,e.salario_mensual,e.fecha_contratacion,e.activo empleado_activo FROM usuarios u JOIN roles r ON r.id=u.rol_id LEFT JOIN empleados e ON e.usuario_id=u.id`;
function publico(r){return {_id:String(r.id),id:String(r.id),nombre:r.nombre,apellido:r.apellido,email:r.email,dni:r.dni,telefono:r.telefono,direccion:r.direccion,rol:r.rol,activo:!!r.usuario_activo,fechaIngreso:r.fecha_ingreso};}
function formato(r){return {_id:String(r.id),usuario:publico(r),cargo:r.cargo||r.rol,salarioMensual:Number(r.salario_mensual||0),fechaContratacion:r.fecha_contratacion||r.fecha_ingreso,activo:!!r.usuario_activo&&(r.usuario_id?!!r.empleado_activo:true),esUsuarioMadre:!r.usuario_id,tieneRegistroEmpleado:!!r.usuario_id};}
async function registro(c,id,crear=false){
 id=positiveId(id);const [[u]]=await c.execute(`${base} WHERE u.id=?`,[id]);check(u,'Empleado o usuario no encontrado',404);
 if(crear&&!u.usuario_id)await c.execute('INSERT INTO empleados(usuario_id,cargo,activo) VALUES(?,?,?)',[id,u.rol,!!u.usuario_activo]);
 return formato(u);
}
async function permiso(c,usuario,escritura=false){return actor(c,usuario,escritura?['SuperAdministrador']:admin);}
export function empleadosService(pool){return {
 async listar(usuario){return transaction(pool,async c=>{await permiso(c,usuario);const [rows]=await c.query(`${base} ORDER BY u.fecha_ingreso,u.id`);
 const mes=dia().slice(0,7);const [j]=await c.execute(`SELECT e.usuario_id,SUM(a.presente=1) diasTrabajados,0 diasInasistencias FROM asistencias a JOIN empleados e ON e.id=a.empleado_id WHERE DATE_FORMAT(a.fecha,'%Y-%m')=? GROUP BY e.usuario_id`,[mes]);
 const [faltas]=await c.execute(`SELECT e.usuario_id,COUNT(*) n FROM inasistencias a JOIN empleados e ON e.id=a.empleado_id WHERE DATE_FORMAT(a.fecha,'%Y-%m')=? GROUP BY e.usuario_id`,[mes]);
 const [tot]=await c.query('SELECT e.usuario_id,COUNT(a.id) totalAsistencias,(SELECT COUNT(*) FROM inasistencias i WHERE i.empleado_id=e.id) totalInasistencias FROM empleados e LEFT JOIN asistencias a ON a.empleado_id=e.id GROUP BY e.id,e.usuario_id');
 const [pagos]=await c.execute('SELECT e.usuario_id,COUNT(*) totalPagos,SUM(mes=? AND anio=?) pagadoMesActual FROM pagos_empleado p JOIN empleados e ON e.id=p.empleado_id GROUP BY e.usuario_id',[Number(mes.slice(5)),Number(mes.slice(0,4))]);
 return rows.map(r=>{const a=j.find(x=>x.usuario_id===r.id)||{},b=tot.find(x=>x.usuario_id===r.id)||{},p=pagos.find(x=>x.usuario_id===r.id)||{};
 return {...formato(r),diasTrabajados:Number(a.diasTrabajados||0),diasInasistencias:Number(faltas.find(x=>x.usuario_id===r.id)?.n||0),totalAsistencias:Number(b.totalAsistencias||0),totalInasistencias:Number(b.totalInasistencias||0),totalPagos:Number(p.totalPagos||0),pagadoMesActual:!!Number(p.pagadoMesActual||0)};});});},
 async obtener(usuario,id){return transaction(pool,async c=>{await permiso(c,usuario);return registro(c,id);});},
 async crear(usuario,b){return transaction(pool,async c=>{await permiso(c,usuario,true);
 const email=texto(b.email,'Email',254).toLowerCase();check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),'Email inválido');
 const cargo=texto(b.cargo,'Cargo');check(cargos[cargo],'Cargo inválido');const salario=dinero(b.salarioMensual??0,'Salario');
 const [[existente]]=await c.execute('SELECT id,dni FROM usuarios WHERE email=? FOR UPDATE',[email]);let id=existente?.id;
 if(!id){
 const dni=texto(b.dni,'DNI',20),nombre=texto(b.nombre,'Nombre'),apellido=texto(b.apellido,'Apellido');
 check(typeof b.password==='string'&&b.password.length>=6&&Buffer.byteLength(b.password)<=72,'Contraseña de 6 caracteres como mínimo y 72 bytes como máximo');
 const [[otro]]=await c.execute('SELECT id FROM usuarios WHERE dni=?',[dni]);check(!otro,'El DNI pertenece a otro usuario; revisá su correo antes de vincular',409);
 const [[rol]]=await c.execute('SELECT id FROM roles WHERE nombre=?',[cargos[cargo]]);
 const [r]=await c.execute('INSERT INTO usuarios(rol_id,nombre,apellido,email,password_hash,dni,telefono) VALUES(?,?,?,?,?,?,?)',[rol.id,nombre,apellido,email,await bcrypt.hash(b.password,10),dni,texto(b.telefono??'','Teléfono',40,false)]);id=r.insertId;
 }else if(b.dni)check(b.dni===existente.dni,'El correo y el DNI no corresponden al mismo usuario',409);
 const [[e]]=await c.execute('SELECT usuario_id FROM empleados WHERE usuario_id=?',[id]);check(!e,'El usuario ya tiene registro de empleado',409);
 await c.execute('INSERT INTO empleados(usuario_id,cargo,salario_mensual) VALUES(?,?,?)',[id,cargo,salario]);return registro(c,id);});},
 async actualizar(usuario,id,b){return transaction(pool,async c=>{await permiso(c,usuario,true);id=positiveId(id);await registro(c,id,true);
 if(b.cargo!==undefined){const cargo=texto(b.cargo,'Cargo');check(cargos[cargo],'Cargo inválido');await c.execute('UPDATE empleados SET cargo=? WHERE usuario_id=?',[cargo,id]);}
 if(b.salarioMensual!==undefined)await c.execute('UPDATE empleados SET salario_mensual=? WHERE usuario_id=?',[dinero(b.salarioMensual,'Salario'),id]);
 if(b.activo!==undefined){check(typeof b.activo==='boolean','Activo inválido');check(b.activo||id!==Number(usuario),'No podés desactivar tu propia cuenta',409);
 // Desactivar personal también desactiva su acceso al sistema.
 await c.execute('UPDATE empleados SET activo=? WHERE usuario_id=?',[b.activo,id]);await c.execute('UPDATE usuarios SET activo=? WHERE id=?',[b.activo,id]);}
 return registro(c,id);});},
 async eliminar(usuario,id){return transaction(pool,async c=>{await permiso(c,usuario,true);id=positiveId(id);check(id!==Number(usuario),'No podés eliminar tu propia cuenta',409);const e=await registro(c,id);
 // Las claves foráneas impiden destruir pedidos, mensajes, jornadas o pagos.
 await c.execute('DELETE FROM empleados WHERE usuario_id=?',[id]);await c.execute('DELETE FROM usuarios WHERE id=?',[id]);return {nombre:`${e.usuario.nombre} ${e.usuario.apellido}`,cargo:e.cargo};});},
 async jornada(usuario,id,b,presente=true){return transaction(pool,async c=>{await permiso(c,usuario,true);id=positiveId(id);await c.execute('SELECT id FROM usuarios WHERE id=? FOR UPDATE',[id]);await registro(c,id,true);
 if(b.presente!==undefined){check(typeof b.presente==='boolean','Presente inválido');presente=b.presente;}
 const fecha=dia(b.fecha),entrada=texto(b.horaEntrada??'','Hora de entrada',5,false),salida=texto(b.horaSalida??'','Hora de salida',5,false);
 for(const h of [entrada,salida])check(!h||/^([01]\d|2[0-3]):[0-5]\d$/.test(h),'Hora inválida');
 const [[e]]=await c.execute('SELECT id FROM empleados WHERE usuario_id=?',[id]);
 const [[a]]=await c.execute('SELECT id FROM asistencias WHERE empleado_id=? AND fecha=? UNION ALL SELECT id FROM inasistencias WHERE empleado_id=? AND fecha=?',[e.id,fecha,e.id,fecha]);check(!a,'Ya hay asistencia o inasistencia registrada para ese día',409);
 const obs=texto(b.observaciones??'','Observaciones',500,false),motivo=texto(b.motivo??'Sin registrar asistencia','Motivo',200,false);
 const [r]=presente?await c.execute('INSERT INTO asistencias(empleado_id,fecha,presente,hora_entrada,hora_salida,observaciones) VALUES(?,?,TRUE,?,?,?)',[e.id,fecha,entrada||null,salida||null,obs]):await c.execute('INSERT INTO inasistencias(empleado_id,fecha,motivo,observaciones) VALUES(?,?,?,?)',[e.id,fecha,motivo,obs]);
 return {_id:String(r.insertId),fecha:`${fecha}T12:00:00-03:00`,presente,horaEntrada:entrada,horaSalida:salida,motivo:b.motivo||'',observaciones:b.observaciones||''};});},
 async pagar(usuario,id,b){return transaction(pool,async c=>{await permiso(c,usuario,true);id=positiveId(id);await c.execute('SELECT id FROM usuarios WHERE id=? FOR UPDATE',[id]);await registro(c,id,true);
 const mes=entero(b.mes,1,12,'Mes'),anio=entero(b.anio,2000,9999,'Año'),monto=dinero(b.monto,'Monto',true),metodo=b.metodoPago||'Efectivo';check(['Efectivo','Transferencia','Cheque'].includes(metodo),'Método de pago inválido');
 const [[e]]=await c.execute('SELECT id FROM empleados WHERE usuario_id=?',[id]);
 const [r]=await c.execute('INSERT INTO pagos_empleado(empleado_id,mes,anio,monto,metodo_pago,observaciones) VALUES(?,?,?,?,?,?)',[e.id,mes,anio,monto,metodo,texto(b.observaciones??'','Observaciones',500,false)]);
 return {_id:String(r.insertId),mes,anio,monto,metodoPago:metodo,observaciones:b.observaciones||'',fechaPago:new Date()};});},
 async historial(usuario,id,tipo,q={}){return transaction(pool,async c=>{await permiso(c,usuario);const empleado=await registro(c,id);const [[legajo]]=await c.execute('SELECT id FROM empleados WHERE usuario_id=?',[positiveId(id)]);if(!legajo)return {empleado,[tipo]:[]};let rows;
 if(tipo==='pagos'){[rows]=await c.execute('SELECT id,mes,anio,monto,metodo_pago metodoPago,observaciones,fecha_pago fechaPago FROM pagos_empleado WHERE empleado_id=? ORDER BY anio DESC,mes DESC',[legajo.id]);}
 else {const filtros=['empleado_id=?'],values=[legajo.id];
 if(q.mes!==undefined||q.anio!==undefined){const m=entero(q.mes,1,12,'Mes'),a=entero(q.anio,2000,9999,'Año');filtros.push('MONTH(fecha)=?','YEAR(fecha)=?');values.push(m,a);}
 const columnas=tipo==='asistencias'?`presente,TIME_FORMAT(hora_entrada,'%H:%i') horaEntrada,TIME_FORMAT(hora_salida,'%H:%i') horaSalida,'' motivo`:`FALSE presente,'' horaEntrada,'' horaSalida,motivo`;
 [rows]=await c.execute(`SELECT id,DATE_FORMAT(fecha,'%Y-%m-%d') fecha,${columnas},observaciones FROM ${tipo==='asistencias'?'asistencias':'inasistencias'} WHERE ${filtros.join(' AND ')} ORDER BY fecha DESC`,values);
 rows=rows.map(r=>({...r,fecha:`${r.fecha}T12:00:00-03:00`,presente:!!r.presente}));}
 return {empleado,[tipo]:rows.map(r=>({...r,_id:String(r.id)}))};});}
};}
