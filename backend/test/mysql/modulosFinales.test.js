import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import {readFile} from 'node:fs/promises';
import {statements} from '../../scripts/mysql/sqlFile.js';
import {empleadosService} from '../../src/services/mysql/empleados.js';
import {mensajesService} from '../../src/services/mysql/mensajes.js';
import {passwordResetService} from '../../src/services/mysql/passwordReset.js';
import {ventasLegacyService} from '../../src/services/mysql/ventasLegacy.js';
import {importarPendientes} from '../../src/services/mysql/importPendientes.js';
const enabled=process.env.MYSQL_TESTS==='1',op={skip:!enabled};
let admin,pool,empleados,mensajes,password,ventas,tokens=[],globalPool,httpServer,io;
const dbname=`final_prueba_${process.pid}_${Date.now()}`;
const options={host:process.env.MYSQL_HOST||'127.0.0.1',port:Number(process.env.MYSQL_PORT||3306),user:process.env.MYSQL_USER||'root',password:process.env.MYSQL_PASSWORD||'',decimalNumbers:true,timezone:'Z'};
const previous={MYSQL_DATABASE:process.env.MYSQL_DATABASE,PORT:process.env.PORT,JWT_SECRET_KEY:process.env.JWT_SECRET_KEY,MONGODB_URI:process.env.MONGODB_URI};
before(async()=>{if(!enabled)return;
 admin=await mysql.createConnection(options);await admin.query(`CREATE DATABASE ${dbname}`);await admin.query(`USE ${dbname}`);
 for(const file of ['001_schema.sql','002_integridad.sql','003_datos_iniciales.sql','005_compras_pagos.sql','006_pedidos_publicos.sql','007_modulos_restantes.sql']){
 const sql=(await readFile(new URL(`../../database/mysql/${file}`,import.meta.url),'utf8')).replaceAll('la_vieja_estacion',dbname);for(const statement of statements(sql))await admin.query(statement);
 }
 const incremental=(await readFile(new URL('../../database/mysql/007_modulos_restantes.sql',import.meta.url),'utf8')).replaceAll('la_vieja_estacion',dbname);for(const statement of statements(incremental))await admin.query(statement);
 pool=mysql.createPool({...options,database:dbname});empleados=empleadosService(pool);mensajes=mensajesService(pool);ventas=ventasLegacyService(pool);
 password=passwordResetService(pool,{sendReset:async(email,token)=>tokens.push({email,token}),sendChanged:async()=>{}});
});
after(async()=>{if(!enabled)return;await io?.close();await new Promise(r=>{if(httpServer?.listening)httpServer.close(r);else r();});await globalPool?.end();await pool?.end();if(admin){await admin.query(`DROP DATABASE IF EXISTS ${dbname}`);await admin.end();}for(const [k,v] of Object.entries(previous))if(v===undefined)delete process.env[k];else process.env[k]=v;});
test('final: empleados SQL, vincular usuarios, legajo estable y permisos reales',op,async()=>{
 const lista=await empleados.listar(2);assert.equal(lista.length,9);assert.equal(lista[2].usuario.password,undefined);
 await assert.rejects(empleados.crear(2,{email:'a@b.example'}),e=>e.status===403);
 const e=await empleados.crear(1,{email:'lucas.ferreyra@laviejaestacion.example',cargo:'SuperAdministrador',salarioMensual:100000});assert.equal(e._id,e.usuario._id);assert.equal(e.esUsuarioMadre,false);assert.equal((await empleados.listar(1)).find(x=>x._id===e._id).totalAsistencias,0);
 await assert.rejects(empleados.crear(1,{email:e.usuario.email,cargo:'Mozo',salarioMensual:1}),e=>e.status===409);
 await empleados.actualizar(1,e._id,{salarioMensual:120000});assert.equal((await empleados.obtener(1,e._id)).salarioMensual,120000);
 await assert.rejects(empleados.actualizar(1,1,{activo:false}),e=>e.status===409);
});
test('final: altas atómicas, hash de contraseña y DNI duplicado sin usuario huérfano',op,async()=>{
 const b={nombre:'Empleado',apellido:'Prueba',email:'empleado@prueba.example',dni:'99000001',password:'Prueba2026!',cargo:'Cajero',salarioMensual:250000};const e=await empleados.crear(1,b);
 const [[u]]=await pool.execute('SELECT password_hash FROM usuarios WHERE id=?',[e._id]);assert.equal(await bcrypt.compare(b.password,u.password_hash),true);
 await assert.rejects(empleados.crear(1,{...b,email:'otro@prueba.example'}),e=>e.status===409);
 const [[n]]=await pool.execute('SELECT COUNT(*) n FROM usuarios WHERE email=?',['otro@prueba.example']);assert.equal(n.n,0);
 await empleados.actualizar(1,e._id,{activo:false});assert.equal((await empleados.obtener(1,e._id)).usuario.activo,false);
 await empleados.actualizar(1,e._id,{activo:true});assert.equal((await empleados.obtener(1,e._id)).activo,true);
});
test('final: asistencia/inasistencia excluyentes, fechas y pagos mensuales únicos',op,async()=>{
 await empleados.jornada(1,3,{fecha:'2026-10-21',horaEntrada:'08:00',horaSalida:'14:00'});
 await assert.rejects(empleados.jornada(1,3,{fecha:'2026-10-21'},false),e=>e.status===409);
 await empleados.jornada(1,3,{fecha:'2026-10-22',motivo:'Licencia'},false);
 await assert.rejects(empleados.jornada(1,3,{fecha:'2026-02-30'}),/Fecha/);
 assert.equal((await empleados.historial(2,3,'asistencias',{mes:10,anio:2026})).asistencias.length,2);
 assert.equal((await empleados.historial(2,3,'inasistencias',{mes:10,anio:2026})).inasistencias.length,2);
 const r=await Promise.allSettled([empleados.pagar(1,3,{mes:10,anio:2026,monto:120000}),empleados.pagar(1,3,{mes:10,anio:2026,monto:120000})]);assert.equal(r.filter(x=>x.status==='fulfilled').length,1);
 assert.equal((await empleados.historial(2,3,'pagos')).pagos.length,2);
 await assert.rejects(empleados.eliminar(1,3),e=>e.code==='ER_ROW_IS_REFERENCED_2');
});
test('final: mensajes conservan contratos y toman identidad y rol de SQL',op,async()=>{
 const m=await mensajes.crear(2,{texto:'Mensaje SQL',remitente:3,remitenteRol:'Mozo'});assert.equal(m.remitente._id,'2');assert.equal(m.destinatario.rol,'SuperAdministrador');
 assert.equal((await mensajes.listar(1)).length,1);await assert.rejects(mensajes.listar(3),e=>e.status===403);
 await assert.rejects(mensajes.crear(2,{texto:'x',destinatarioRol:'Gerente'}),/destinatario/);
});
test('final: recuperación SQL expira y consume token una vez, sin exponerlo',op,async()=>{
 const [[u]]=await pool.execute('SELECT email FROM usuarios WHERE id=3');const r=await password.solicitar(u.email);assert.equal(r.token,undefined);
 const t=tokens.at(-1).token;const [[guardado]]=await pool.execute('SELECT token_hash FROM recuperaciones_password WHERE usuario_id=3');assert.notEqual(guardado.token_hash,t);
 assert.equal((await password.verificar(t)).valid,true);
 const repetidos=await Promise.allSettled([password.restablecer(t,'Nueva2026!'),password.restablecer(t,'Otra2026!')]);assert.equal(repetidos.filter(r=>r.status==='fulfilled').length,1);
 await assert.rejects(password.verificar(t));const [[user]]=await pool.execute('SELECT password_hash FROM usuarios WHERE id=3');assert.equal(await bcrypt.compare('Nueva2026!',user.password_hash)||await bcrypt.compare('Otra2026!',user.password_hash),true);
 await password.solicitar(u.email);const viejo=tokens.at(-1).token;await password.solicitar(u.email);await assert.rejects(password.verificar(viejo));
 await pool.execute('UPDATE recuperaciones_password SET created_at=DATE_SUB(UTC_TIMESTAMP(),INTERVAL 2 HOUR),expires_at=DATE_SUB(UTC_TIMESTAMP(),INTERVAL 1 SECOND) WHERE usuario_id=3');await assert.rejects(password.verificar(tokens.at(-1).token));
 const absent=await password.solicitar('nadie@prueba.example');assert.deepEqual(absent,r);
});
test('final: ventas heredadas atómicas, stock agregado y acceso al historial propio',op,async()=>{
 const [[p]]=await pool.execute('SELECT precio,stock FROM productos WHERE id=1');const v=await ventas.crear(4,{items:[{productId:1,quantity:1},{productId:1,quantity:1}],total:1});assert.equal(v.total,Number(p.precio)*2);assert.equal(v.items.length,1);
 assert.equal((await ventas.listar(4)).length,1);await assert.rejects(ventas.listar(3,false,v.id),e=>e.status===404);assert.equal((await ventas.listar(2,true)).length,1);
 const [[stock]]=await pool.execute('SELECT stock FROM productos WHERE id=1');assert.equal(Number(stock.stock),Number(p.stock)-2);
 const [[antes]]=await pool.query('SELECT COUNT(*) n FROM ventas');await assert.rejects(ventas.crear(4,{items:[{productId:1,quantity:1},{productId:16,quantity:999999}]}));const [[despues]]=await pool.query('SELECT COUNT(*) n FROM ventas');assert.equal(antes.n,despues.n);
 await assert.rejects(ventas.crear(4,{items:[{productId:1,quantity:-2}]}));
});
test('final: importación histórica no repite stock, reintentos y simulación no escriben',op,async()=>{
 await pool.query("INSERT INTO usuarios(id,rol_id,nombre,apellido,email,password_hash,dni) SELECT 20,4,'Histórico','Prueba','historico@prueba.example',password_hash,'99000020' FROM usuarios WHERE id=4");
 const [users]=await pool.query('SELECT id,email,dni FROM usuarios WHERE id IN (1,2,4,20)');const [[p]]=await pool.query('SELECT nombre,stock FROM productos WHERE id=1');
 const datos={usuarios:users.map(u=>({_id:`mongo-u-${u.id}`,email:u.email,dni:u.dni})),productos:[{_id:'mongo-p-1',nombre:p.nombre}],empleados:[{_id:'mongo-e-4',usuario:'mongo-u-20',cargo:'Cajero',salarioMensual:100000,asistencias:[{fecha:'2026-09-01',presente:true}],pagos:[{mes:9,anio:2026,monto:100000}]}],mensajes:[{_id:'mongo-m-1',remitente:'mongo-u-1',destinatario:'mongo-u-2',remitenteRol:'SuperAdministrador',destinatarioRol:'Gerente',texto:'Histórico'}],sales:[{_id:'mongo-s-1',userId:'mongo-u-4',total:1000,items:[{productId:'mongo-p-1',quantity:2,priceAtSale:500}]}]};
 const c=await pool.getConnection();try{await c.beginTransaction();const simulacion=await importarPendientes(c,datos);assert.equal(simulacion.sales,1);await c.rollback();
 await c.beginTransaction();const aplicado=await importarPendientes(c,datos);await c.commit();assert.equal(aplicado.empleados,1);
 await c.beginTransaction();assert.equal((await importarPendientes(c,datos)).omitidos,3);await c.rollback();
 await c.beginTransaction();await assert.rejects(importarPendientes(c,{...datos,mensajes:[{...datos.mensajes[0],texto:'Alterado'}]}),/cambió/);await c.rollback();
 const [[s]]=await c.execute('SELECT stock FROM productos WHERE id=1');assert.equal(s.stock,p.stock);
 }finally{c.release();}
});
test('final: vincular historial a un legajo existente requiere opción explícita y conserva su salario',op,async()=>{
 const [[u]]=await pool.query('SELECT email,dni FROM usuarios WHERE id=4');
 const d={usuarios:[{_id:'u4',email:u.email,dni:u.dni}],empleados:[{_id:'legajo-vinculado',usuario:'u4',cargo:'Cajero',salarioMensual:1,asistencias:[{fecha:'2026-08-20',presente:true}]}]};
 const c=await pool.getConnection();try{await c.beginTransaction();await assert.rejects(importarPendientes(c,d),/ya tiene legajo/);await c.rollback();
 await c.beginTransaction();assert.equal((await importarPendientes(c,d,{vincularLegajos:true})).empleados,1);const [[e]]=await c.query('SELECT salario_mensual FROM empleados WHERE usuario_id=4');assert.equal(e.salario_mensual,700000);await c.rollback();
 }finally{c.release();}
});
test('final: servidor completo arranca sin Mongo, HTTP login, empleados y mensajes',op,async()=>{
 process.env.MYSQL_DATABASE=dbname;process.env.PORT='0';process.env.JWT_SECRET_KEY='secreto-exclusivo-pruebas-sin-datos-reales';process.env.MONGODB_URI='mongodb://servidor-inexistente:1/no-debe-usarse';
 const modulo=await import('../../index.js');httpServer=modulo.httpServer;io=modulo.app.get('io');globalPool=(await import('../../src/database/mysql/pool.js')).pool;
 if(!httpServer.listening)await new Promise(r=>httpServer.once('listening',r));const url=`http://127.0.0.1:${httpServer.address().port}`;
 assert.equal((await (await fetch(url)).json()).estado,'Activo');
 const [[gerente]]=await pool.execute('SELECT email FROM usuarios WHERE id=2');const login=await fetch(`${url}/api/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:gerente.email,password:'RestoBar2026!'})});assert.equal(login.status,200);const sesion=await login.json(),headers={Authorization:`Bearer ${sesion.token}`,'Content-Type':'application/json'};
 const emp=await fetch(`${url}/api/empleados`,{headers});assert.equal(emp.status,200);assert.ok((await emp.json()).length>=9);
 const post=await fetch(`${url}/api/mensajes`,{method:'POST',headers,body:JSON.stringify({texto:'Verificación HTTP sin Mongo'})});assert.equal(post.status,201);
 const denied=await fetch(`${url}/api/empleados`,{method:'POST',headers,body:'{}'});assert.equal(denied.status,403);
 const sales=await fetch(`${url}/api/sales/all`,{headers});assert.equal(sales.status,200);
 const [[inc]]=await pool.query('SELECT COUNT(*) n FROM v_incidencias_integridad');assert.equal(inc.n,0);
});
