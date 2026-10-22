import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import { statements,executeFile } from '../../scripts/mysql/sqlFile.js';
import { connect } from '../../scripts/mysql/connection.js';
import { pedidosPublicosService,validarPedidoPublico } from '../../src/services/mysql/pedidosPublicos.js';
import { pedidoService } from '../../src/services/mysql/pedidos.js';
import { reportesService } from '../../src/services/mysql/reportes.js';
const datos=extra=>({solicitudId:'solicitud-publica-prueba',tipoPedido:'Domicilio',cliente:{nombre:'Cliente prueba',telefono:'3811234567',email:'cliente@restobar.example',direccion:'Calle de prueba 123'},productos:[{producto:1,cantidad:2}],metodoPago:'Efectivo',...extra});
test('públicos: valida contacto, dirección, mesa y cantidades sin aceptar IDs Mongo',()=>{
 assert.throws(()=>validarPedidoPublico(datos({cliente:{nombre:'Cliente'}})),/Teléfono/);
 assert.throws(()=>validarPedidoPublico(datos({cliente:{...datos().cliente,direccion:''}})),/Dirección/);
 assert.throws(()=>validarPedidoPublico(datos({tipoPedido:'Local',numeroMesa:0})),/Identificador/);
 assert.throws(()=>validarPedidoPublico(datos({productos:[{producto:'507f1f77bcf86cd799439011',cantidad:1}]})),/Identificador/);
 assert.throws(()=>validarPedidoPublico(datos({productos:[{producto:1,cantidad:-1}]})),/Cantidad/);
 assert.throws(()=>validarPedidoPublico(datos({productos:[{producto:1,cantidad:true}]})),/Cantidad/);
 assert.equal(validarPedidoPublico(datos()).tipoPedido,'Domicilio');
});
const enabled=process.env.MYSQL_TESTS==='1';
let db,publicos,internos,reportes;
before(async()=>{
 if(!enabled)return;db=await connect({database:true});
 const scoped={query:(...a)=>db.query(...a),execute:(...a)=>db.execute(...a),beginTransaction:()=>db.query('SAVEPOINT publico_test'),commit:()=>db.query('RELEASE SAVEPOINT publico_test'),rollback:async()=>{await db.query('ROLLBACK TO SAVEPOINT publico_test');await db.query('RELEASE SAVEPOINT publico_test');},release:()=>{}};
 const pool={getConnection:async()=>scoped};publicos=pedidosPublicosService(pool);internos=pedidoService(pool);reportes=reportesService(pool);
});
after(async()=>{if(db)await db.end();});
const scenario=(name,fn)=>test(name,{skip:!enabled},async()=>{await db.beginTransaction();try{await fn();}finally{await db.rollback();}});
scenario('públicos: domicilio sin mesa ni empleado ficticio; precios y stock salen de MySQL',async()=>{
 const [[antes]]=await db.execute('SELECT stock,precio FROM productos WHERE id=1');
 const {id}=await publicos.crear(datos({total:1,mozo:3,productos:[{producto:1,cantidad:2,precioUnitario:0.01}]}));
 const [[p]]=await db.execute('SELECT * FROM pedidos WHERE id=?',[id]);
 assert.equal(p.mesa_id,null);assert.equal(p.mozo_id,null);assert.equal(p.estado,'Pendiente');assert.equal(p.metodo_pago,'Pendiente');assert.equal(p.total,Number(antes.precio)*2);
 const [[despues]]=await db.execute('SELECT stock FROM productos WHERE id=1');assert.equal(despues.stock,Number(antes.stock)-2);
 const [[r]]=await db.execute('SELECT * FROM pedidos_publicos WHERE pedido_id=?',[id]);assert.equal(r.cliente_direccion,'Calle de prueba 123');assert.equal(r.metodo_pago_solicitado,'Efectivo');
 const [[h]]=await db.execute('SELECT usuario_id FROM historial_estados_pedido WHERE pedido_id=?',[id]);assert.equal(h.usuario_id,null);
});
scenario('públicos: pedido local se integra con la mesa y reintentar no duplica pedido ni stock',async()=>{
 const body=datos({tipoPedido:'Local',numeroMesa:1});
 const primera=await publicos.crear(body),segunda=await publicos.crear(body);
 assert.equal(primera.id,segunda.id);assert.equal(segunda.creado,false);
 const [[r]]=await db.execute('SELECT estado FROM mesas WHERE numero=1');assert.equal(r.estado,'Ocupada');
 const [[m]]=await db.execute('SELECT COUNT(*) registros FROM movimientos_stock WHERE pedido_id=?',[primera.id]);assert.equal(m.registros,1);
 await assert.rejects(publicos.crear({...body,productos:[{producto:1,cantidad:3}]}),e=>e.status===409);
});
scenario('públicos: productos repetidos no evaden stock; un fallo revierte pedido y clave',async()=>{
 await assert.rejects(publicos.crear(datos({productos:[{producto:16,cantidad:1},{producto:16,cantidad:1}]})),/Stock insuficiente/);
 const [[r]]=await db.execute('SELECT COUNT(*) n FROM pedidos_publicos WHERE solicitud_id=?',[datos().solicitudId]);assert.equal(r.n,0);
 await assert.rejects(publicos.crear(datos({productos:[{producto:999999,cantidad:1}]})),/disponible/);
 await assert.rejects(publicos.crear(datos({tipoPedido:'Local',numeroMesa:999999})),/mesa/);
});
scenario('públicos: cocina, entrega por gerente, cobro y reportes incluyen pedidos sin mozo',async()=>{
 const {id}=await publicos.crear(datos());
 await internos.cambiarEstado({id,usuario:5,estado:'En Preparación'});await internos.cambiarEstado({id,usuario:5,estado:'Listo'});
 await internos.cambiarEstado({id,usuario:2,estado:'Entregado'});await internos.cobrar({id,usuario:4,metodoPago:'Efectivo',montoPagado:16000});
 const ventas=await reportes.ventas(2);assert.ok(ventas.pedidos.some(p=>p.id===id));
 const agregado=ventas.pedidos.find(p=>p.id===id);assert.equal(agregado.total,14400);assert.equal(agregado.mozo.id,null);
 assert.equal(ventas.resumen.total,60100);
});
scenario('públicos: mozo puede entregar un pedido sin asignar y queda registrado como responsable',async()=>{
 const {id}=await publicos.crear(datos());await internos.cambiarEstado({id,usuario:5,estado:'En Preparación'});await internos.cambiarEstado({id,usuario:5,estado:'Listo'});
 await internos.cambiarEstado({id,usuario:3,estado:'Entregado'});
 const [[p]]=await db.execute('SELECT mozo_id,nombre_mozo_historico FROM pedidos WHERE id=?',[id]);assert.equal(p.mozo_id,3);assert.ok(p.nombre_mozo_historico.trim());
});
scenario('públicos: cancelar repone stock una sola vez y no modifica otras mesas',async()=>{
 const [[antes]]=await db.execute('SELECT stock FROM productos WHERE id=1');
 const {id}=await publicos.crear(datos());await internos.cancelar({id,usuario:2,motivo:'Prueba de cancelación'});
 const [[despues]]=await db.execute('SELECT stock FROM productos WHERE id=1');assert.equal(despues.stock,antes.stock);
 await assert.rejects(internos.cancelar({id,usuario:2,motivo:'Repetida'}),/finalizado/);
});

test('públicos: concurrencia, HTTP, cocina y caja funcionan sin importar modelos Mongo',{skip:!enabled},async()=>{
 const admin=await connect(),database=`publicos_prueba_${process.pid}_${Date.now()}`;
 let pool,apiPool,server;const log=console.log,warn=console.warn;
 const prev={};for(const key of ['MYSQL_DATABASE','JWT_SECRET_KEY','EMAIL_USER','EMAIL_PASS','EMAIL_PEDIDOS_RESTAURANTE'])prev[key]=process.env[key];
 try {
  for(const file of ['001_schema.sql','002_integridad.sql','003_datos_iniciales.sql','005_compras_pagos.sql','006_pedidos_publicos.sql']){
   const sql=(await readFile(new URL(`../../database/mysql/${file}`,import.meta.url),'utf8')).replaceAll('la_vieja_estacion',database);
   for(const statement of statements(sql))await admin.query(statement);
  }
  // Verificar que la actualización incremental puede repetirse sin borrar datos.
  const sql=(await readFile(new URL('../../database/mysql/006_pedidos_publicos.sql',import.meta.url),'utf8')).replaceAll('la_vieja_estacion',database);
  for(const statement of statements(sql))await admin.query(statement);
  pool=mysql.createPool({host:process.env.MYSQL_HOST||'127.0.0.1',port:Number(process.env.MYSQL_PORT||3306),user:process.env.MYSQL_USER||'root',password:process.env.MYSQL_PASSWORD||'',database,decimalNumbers:true,timezone:'Z'});
  const real=pedidosPublicosService(pool);
  const [[antes]]=await pool.execute('SELECT stock FROM productos WHERE id=1');
  const ambos=await Promise.all([real.crear(datos()),real.crear(datos())]);assert.equal(ambos[0].id,ambos[1].id);
  const [[despues]]=await pool.execute('SELECT stock FROM productos WHERE id=1');assert.equal(despues.stock,antes.stock-2);
  const escaso=await Promise.allSettled(['ultimo-stock-uno','ultimo-stock-dos'].map(solicitudId=>real.crear(datos({solicitudId,productos:[{producto:16,cantidad:1}]}))));
  assert.equal(escaso.filter(x=>x.status==='fulfilled').length,1);
  process.env.MYSQL_DATABASE=database;process.env.JWT_SECRET_KEY='clave-efimera-publicos';process.env.EMAIL_USER='';process.env.EMAIL_PASS='';process.env.EMAIL_PEDIDOS_RESTAURANTE='';
  const {default:express}=await import('express');const {default:jwt}=await import('jsonwebtoken');
  const {default:router}=await import('../../src/routes/pedidos.routes.js');apiPool=(await import('../../src/database/mysql/pool.js')).pool;
  const app=express();app.use(express.json());app.use('/api',router);
  server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
  const base=`http://127.0.0.1:${server.address().port}/api/pedidos`;
  console.log=()=>{};console.warn=()=>{};
  const body=datos({solicitudId:'http-pedido-prueba'});
  const r=await fetch(`${base}/publico`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});assert.equal(r.status,201);
  const {pedido}=await r.json();assert.equal(pedido.tipoPedido,'Domicilio');assert.equal(pedido.mesa,null);assert.equal(pedido.mozo,null);assert.equal(pedido.cliente.nombre,body.cliente.nombre);
  const retry=await fetch(`${base}/publico`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});assert.equal(retry.status,200);assert.equal((await retry.json()).pedido.id,pedido.id);
  const headers={Authorization:`Bearer ${jwt.sign({usuarioId:2,rol:'Gerente'},process.env.JWT_SECRET_KEY)}`};
  const lista=await fetch(base,{headers});assert.equal(lista.status,200);assert.ok((await lista.json()).some(p=>p.id===pedido.id));
  const caja=await fetch(`${base}/caja/pendientes`,{headers});assert.equal(caja.status,200);assert.ok((await caja.json()).some(p=>p.id===pedido.id));
  const [incidencias]=await pool.query('SELECT * FROM v_incidencias_integridad');assert.deepEqual(incidencias,[]);
 } finally {
  console.log=log;console.warn=warn;
  if(server)await new Promise(resolve=>server.close(resolve));if(apiPool)await apiPool.end();if(pool)await pool.end();
  for(const [key,value]of Object.entries(prev)){if(value===undefined)delete process.env[key];else process.env[key]=value;}
  await admin.query(`DROP DATABASE IF EXISTS \`${database}\``);await admin.end();
 }
});
