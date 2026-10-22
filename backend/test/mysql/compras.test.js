import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import { statements } from '../../scripts/mysql/sqlFile.js';
import { connect } from '../../scripts/mysql/connection.js';
import { comprasService, validarCompra, decimal } from '../../src/services/mysql/compras.js';
const datos = extra => ({proveedor:{nombre:'Proveedor de prueba'},productos:[{nombre:'Caja prueba',productoId:1,cantidad:2,unidadMedida:'Caja',factorStock:24,precioUnitario:10000}],...extra});
test('compras: cálculo en centavos, redondeo y rechazo de valores inválidos',()=>{
  const v=validarCompra(datos({productos:[{nombre:'Fraccionado',cantidad:'0.125',precioUnitario:'0.12',unidadMedida:'Kg'}]}));
  assert.equal(v.subtotal,2n); assert.equal(v.total,2n);
  assert.throws(()=>decimal(-1,2,'Monto'),/inválido/);
  assert.throws(()=>decimal('1.001',2,'Monto'),/decimales/);
  assert.throws(()=>validarCompra(datos({estado:'Recibida'})),/estado/);
  assert.throws(()=>validarCompra(datos({impuestos:{iva:{porcentaje:101}}})),/IVA/);
  assert.throws(()=>validarCompra(datos({productos:[{nombre:'Mal',cantidad:0,precioUnitario:2}]})),/Cantidad/);
});
const enabled=process.env.MYSQL_TESTS==='1';
let db,service;
before(async()=>{
  if(!enabled)return; db=await connect({database:true});
  const scoped={query:(...a)=>db.query(...a),execute:(...a)=>db.execute(...a),
    beginTransaction:()=>db.query('SAVEPOINT compra_test'),commit:()=>db.query('RELEASE SAVEPOINT compra_test'),
    rollback:async()=>{await db.query('ROLLBACK TO SAVEPOINT compra_test');await db.query('RELEASE SAVEPOINT compra_test');},release:()=>{}};
  service=comprasService({getConnection:async()=>scoped});
});
after(async()=>{if(db)await db.end();});
const scenario=(name,fn)=>test(name,{skip:!enabled},async()=>{
  await db.beginTransaction();try{await fn();}finally{await db.rollback();}
});
scenario('compras: carga inicial, permisos, filtros parametrizados y totales del servidor',async()=>{
  const inicial=await service.obtener(2,1); assert.equal(inicial.total,24200);assert.equal(inicial.productos[0].factorStock,24);
  const nueva=await service.crear(2,datos({total:1,subtotal:1,registradoPor:9}));
  assert.equal(nueva.total,24200);assert.equal(nueva.registradoPor.id,2);assert.ok(nueva.numeroCompra>1);
  assert.ok((await service.listar(2,{proveedor:'de prueba'})).some(c=>c.id===nueva.id));
  assert.equal((await service.listar(2,{proveedor:"' OR 1=1 --"})).length,0);
  await assert.rejects(service.crear(3,datos()),e=>e.status===403);
  await assert.rejects(service.listar(2,{estado:'Inventado'}),/Estado/);
  await assert.rejects(service.obtener(2,'abc'),/Identificador/);
  await assert.rejects(service.listar(2,{fechaInicio:'2026-02-30'}),/Fecha/);
});
scenario('compras: edición recalcula total y eliminación conserva integridad',async()=>{
  const compra=await service.crear(2,datos());
  const editada=await service.actualizar(2,compra.id,{productos:[{nombre:'Una caja',productoId:1,cantidad:1,unidadMedida:'Caja',factorStock:24,precioUnitario:15000}],impuestos:{iva:{porcentaje:10}}});
  assert.equal(editada.total,16500);
  await service.eliminar(2,compra.id);await assert.rejects(service.obtener(2,compra.id),e=>e.status===404);
  await assert.rejects(service.crear(2,datos({productos:[{nombre:'Caja sin conversión',productoId:1,cantidad:1,unidadMedida:'Caja',precioUnitario:2}]})),/factorStock/);
  const unidad=await service.crear(2,datos({productos:[{nombre:'Unidad',productoId:1,cantidad:1,unidadMedida:'Unidad',precioUnitario:2}]}));assert.equal(unidad.productos[0].factorStock,1);
});
scenario('compras: parcial y completa suman únicamente el incremento; reintentar no duplica stock',async()=>{
  const [[antes]]=await db.query('SELECT stock FROM productos WHERE id=1');
  const compra=await service.crear(2,datos()),detalle=compra.productos[0].id;
  const input={productosRecibidos:[{detalleId:detalle,cantidadRecibida:1}]};
  assert.equal((await service.recibir(2,compra.id,input)).estado,'Parcial');
  await service.recibir(2,compra.id,input);
  const [[mitad]]=await db.query('SELECT stock FROM productos WHERE id=1');assert.equal(mitad.stock,antes.stock+24);
  assert.equal((await service.recibir(2,compra.id,{productosRecibidos:[{productoId:detalle,cantidadRecibida:2}]})).estado,'Recibida');
  const [[despues]]=await db.query('SELECT stock FROM productos WHERE id=1');assert.equal(despues.stock,antes.stock+48);
  const [[historia]]=await db.execute('SELECT SUM(cantidad) cantidad,COUNT(*) registros FROM recepciones_compra WHERE detalle_compra_id=?',[detalle]);
  assert.equal(historia.cantidad,2);assert.equal(historia.registros,2);
  await assert.rejects(service.actualizar(2,compra.id,{observaciones:'Cambiar'}),/Pendiente/);
  await assert.rejects(service.cancelar(2,compra.id),/devolución/);
});
scenario('compras: un renglón inválido revierte toda la recepción y rechaza excesos o disminuciones',async()=>{
  const compra=await service.crear(2,datos()),detalle=compra.productos[0].id;
  await assert.rejects(service.recibir(2,compra.id,{productosRecibidos:[{detalleId:detalle,cantidadRecibida:1},{detalleId:999999,cantidadRecibida:1}]}),/ajeno/);
  assert.equal((await service.obtener(2,compra.id)).productos[0].cantidadRecibida,0);
  await assert.rejects(service.recibir(2,compra.id,{productosRecibidos:[{detalleId:detalle,cantidadRecibida:3}]}),/superar/);
  await assert.rejects(service.recibir(2,compra.id,{productosRecibidos:[{detalleId:detalle,cantidadRecibida:1},{detalleId:detalle,cantidadRecibida:1}]}),/repetido/);
  await service.recibir(2,compra.id,{productosRecibidos:[{detalleId:detalle,cantidadRecibida:1}]});
  await assert.rejects(service.recibir(2,compra.id,{productosRecibidos:[{detalleId:detalle,cantidadRecibida:0}]}),/disminuir/);
});
scenario('compras: pago parcial, idempotencia, saldo y protección de pagos confirmados',async()=>{
  const compra=await service.crear(2,datos());
  const pago={monto:10000,metodoPago:'Transferencia',referencia:'Prueba',idempotencyKey:'pago-prueba-0001'};
  const pagada=await service.pagar(2,compra.id,pago);assert.equal(pagada.totalPagado,10000);assert.equal(pagada.saldoPendiente,14200);
  assert.equal((await service.pagar(2,compra.id,pago)).pagos.length,1);
  await assert.rejects(service.pagar(2,compra.id,{...pago,monto:10001}),e=>e.status===409);
  await assert.rejects(service.pagar(2,compra.id,{...pago,monto:20000,idempotencyKey:'pago-prueba-0002'}),/saldo/);
  await assert.rejects(service.cancelar(2,compra.id),/reintegro/);
  await assert.rejects(service.actualizar(2,compra.id,{observaciones:'Cambio'}),/pagos/);
  await assert.rejects(db.execute('UPDATE pagos_compra SET monto=1 WHERE compra_id=?',[compra.id]),/inmutables/);
  await service.pagar(2,compra.id,{...pago,monto:14200,idempotencyKey:'pago-prueba-0002'});
  assert.equal((await service.obtener(2,compra.id)).saldoPendiente,0);
  assert.ok(!(await service.listar(2,{pendientesPago:true})).some(c=>c.id===compra.id));
});
scenario('compras: cancelación y reportes excluyen canceladas',async()=>{
  const compra=await service.crear(2,datos()),cancelada=await service.crear(2,datos());await service.cancelar(2,cancelada.id);
  const reporte=await service.reporte(2,{proveedor:'de prueba'});assert.equal(reporte[0].montoTotal,compra.total);assert.equal(reporte[0].totalCompras,1);
  await assert.rejects(service.recibir(2,cancelada.id,{productosRecibidos:[{detalleId:cancelada.productos[0].id,cantidadRecibida:1}]}),/cancelada/);
  const dia=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  assert.ok((await service.listar(2,{fechaInicio:dia,fechaFin:dia})).some(c=>c.id===compra.id));
});
test('compras: concurrencia y rutas HTTP con base aislada', {skip:!enabled}, async()=>{
  const admin=await connect();
  const database=`compras_prueba_${process.pid}_${Date.now()}`;
  let pool,http,apiPool;
  const log=console.log;
  const previousDatabase=process.env.MYSQL_DATABASE;
  const previousSecret=process.env.JWT_SECRET_KEY;
  try {
    for (const file of ['001_schema.sql','002_integridad.sql','003_datos_iniciales.sql','005_compras_pagos.sql']) {
      const sql=(await readFile(new URL(`../../database/mysql/${file}`,import.meta.url),'utf8')).replaceAll('la_vieja_estacion',database);
      for (const statement of statements(sql)) await admin.query(statement);
    }
    pool=mysql.createPool({host:process.env.MYSQL_HOST||'127.0.0.1',port:Number(process.env.MYSQL_PORT||3306),user:process.env.MYSQL_USER||'root',password:process.env.MYSQL_PASSWORD||'',database,decimalNumbers:true,timezone:'Z',connectionLimit:3});
    const real=comprasService(pool),[[antes]]=await pool.query('SELECT stock FROM productos WHERE id=1');
    const compra=await real.crear(2,datos({proveedor:{nombre:'Concurrencia compras'},productos:[{nombre:'Unidad concurrente',productoId:1,cantidad:1,precioUnitario:10,unidadMedida:'Unidad'}]}));
    const input={productosRecibidos:[{detalleId:compra.productos[0].id,cantidadRecibida:1}]};
    await Promise.all([real.recibir(2,compra.id,input),real.recibir(2,compra.id,input)]);
    const [[despues]]=await pool.query('SELECT stock FROM productos WHERE id=1');assert.equal(despues.stock,antes.stock+1);
    const pago={monto:12.1,metodoPago:'Efectivo',idempotencyKey:'concurrencia-pago-01'};
    await Promise.all([real.pagar(2,compra.id,pago),real.pagar(2,compra.id,pago)]);
    assert.equal((await real.obtener(2,compra.id)).pagos.length,1);
    const segunda=await real.crear(2,datos({productos:[{nombre:'Saldo concurrente',cantidad:1,precioUnitario:10}]}));
    const pagos=await Promise.allSettled([1,2].map(n=>real.pagar(2,segunda.id,{monto:8,metodoPago:'Efectivo',idempotencyKey:`pago-distinto-${n}`})));
    assert.equal(pagos.filter(p=>p.status==='fulfilled').length,1);
    assert.equal((await real.obtener(2,segunda.id)).totalPagado,8);

    process.env.MYSQL_DATABASE=database;process.env.JWT_SECRET_KEY='clave-efimera-exclusiva-pruebas-compras';
    const {default:express}=await import('express');
    const {default:jwt}=await import('jsonwebtoken');
    const {default:router}=await import('../../src/routes/compras.routes.js');
    apiPool=(await import('../../src/database/mysql/pool.js')).pool;
    const app=express();app.use(express.json());app.use('/api',router);
    http=await new Promise(resolve=>{const server=app.listen(0,'127.0.0.1',()=>resolve(server));});
    const base=`http://127.0.0.1:${http.address().port}/api/compras`;
    const auth=rol=>({Authorization:`Bearer ${jwt.sign({usuarioId:rol==='Gerente'?2:3,rol},process.env.JWT_SECRET_KEY)}`,'Content-Type':'application/json'});
    console.log=()=>{};
    assert.equal((await fetch(base)).status,401);
    assert.equal((await fetch(base,{headers:auth('Mozo')})).status,403);
    const lista=await fetch(base,{headers:auth('Gerente')});assert.equal(lista.status,200);assert.ok(Array.isArray(await lista.json()));
    assert.equal((await fetch(`${base}/pendientes-pago`,{headers:auth('Gerente')})).status,200);
    assert.equal((await fetch(`${base}/reporte/proveedor`,{headers:auth('Gerente')})).status,200);
    const creada=await fetch(base,{method:'POST',headers:auth('Gerente'),body:JSON.stringify(datos())});
    assert.equal(creada.status,201);
    const {compra:nueva}=await creada.json();
    const recibida=await fetch(`${base}/${nueva.id}/recepcion`,{method:'PATCH',headers:auth('Gerente'),body:JSON.stringify({productosRecibidos:[{detalleId:nueva.productos[0].id,cantidadRecibida:1}]})});
    assert.equal(recibida.status,200);assert.equal((await recibida.json()).compra.estado,'Parcial');
    const invalid=await fetch(`${base}/${nueva.id}/estado`,{method:'PATCH',headers:auth('Gerente'),body:JSON.stringify({estado:'Recibida'})});
    assert.equal(invalid.status,400);
  } finally {
    console.log=log;
    if (http) await new Promise(resolve=>http.close(resolve));
    if(apiPool)await apiPool.end();if(pool)await pool.end();
    if (previousDatabase===undefined)delete process.env.MYSQL_DATABASE;else process.env.MYSQL_DATABASE=previousDatabase;
    if (previousSecret===undefined)delete process.env.JWT_SECRET_KEY;else process.env.JWT_SECRET_KEY=previousSecret;
    await admin.query(`DROP DATABASE IF EXISTS \`${database}\``);
    await admin.end();
  }
});
