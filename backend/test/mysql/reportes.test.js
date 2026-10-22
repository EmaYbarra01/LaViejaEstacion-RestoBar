import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { connect } from '../../scripts/mysql/connection.js';
import { reportesService, periodoReporte, distribuirNeto } from '../../src/services/mysql/reportes.js';
import { comprasService } from '../../src/services/mysql/compras.js';
import { pedidoService } from '../../src/services/mysql/pedidos.js';

test('reportes: fechas argentinas, límites exclusivos y fechas inválidas',()=>{
  const {args}=periodoReporte({fechaInicio:'2026-10-17',fechaFin:'2026-10-17'});
  assert.equal(args[0].toISOString(),'2026-10-17T03:00:00.000Z');
  assert.equal(args[1].toISOString(),'2026-10-18T03:00:00.000Z');
  assert.throws(()=>periodoReporte({fechaInicio:'2026-02-30'}),/Fecha/);
  assert.throws(()=>periodoReporte({fechaInicio:'2026-10-20',fechaFin:'2026-10-19'}),/posterior/);
});
test('reportes: descuento distribuido concilia centavos y preserva renglones gratuitos',()=>{
  const result=distribuirNeto([{subtotal:0.01},{subtotal:0.01},{subtotal:0}],0.01);
  assert.deepEqual(result.map(r=>r.ingresoNeto),[0.01,0,0]);
  assert.equal(result.reduce((s,r)=>s+Math.round(r.ingresoNeto*100),0),1);
  assert.ok(result.every(r=>r.descuentoAsignado>=0));
  assert.throws(()=>distribuirNeto([{subtotal:1}],2),/concilia/);
});
const enabled=process.env.MYSQL_TESTS==='1';
let db,service,pedidos,compras;
before(async()=>{
  if(!enabled)return;db=await connect({database:true});
  const scoped={query:(...a)=>db.query(...a),execute:(...a)=>db.execute(...a),
    beginTransaction:()=>db.query('SAVEPOINT reporte_test'),commit:()=>db.query('RELEASE SAVEPOINT reporte_test'),
    rollback:async()=>{await db.query('ROLLBACK TO SAVEPOINT reporte_test');await db.query('RELEASE SAVEPOINT reporte_test');},release:()=>{}};
  const pool={getConnection:async()=>scoped};service=reportesService(pool);pedidos=pedidoService(pool);compras=comprasService(pool);
});
after(async()=>{if(db)await db.end();});
const scenario=(name,fn)=>test(name,{skip:!enabled},async()=>{
  await db.beginTransaction();try{await fn();}finally{await db.rollback();}
});
scenario('reportes: solo cobros reales y agrupaciones concilian sin multiplicar cabeceras',async()=>{
  const ventas=await service.ventas(2),mozos=await service.mozos(2),metodos=await service.metodos(2);
  assert.equal(ventas.resumen.cantidadPedidos,3);assert.equal(ventas.resumen.total,45700);
  assert.equal(mozos.reduce((s,m)=>s+m.totalVentas,0),45700);
  assert.equal(metodos.reduce((s,m)=>s+m.total,0),45700);
  assert.equal((await service.diarias(2)).reduce((s,m)=>s+m.totalVentas,0),45700);
  assert.equal((await service.mensuales(2)).reduce((s,m)=>s+m.totalVentas,0),45700);
  const productos=await service.productos(2,{limite:500}),categorias=await service.categorias(2);
  assert.equal(Math.round(productos.reduce((s,p)=>s+p.ingresoTotal,0)*100),4570000);
  assert.equal(Math.round(categorias.reduce((s,p)=>s+p.ingresoTotal,0)*100),4570000);
  assert.ok(ventas.pedidos.every(p=>p.estado==='Cobrado'));
  await assert.rejects(service.ventas(3),e=>e.status===403);
  await assert.rejects(service.ventas(2,{metodoPago:'Tarjeta'}),/Método/);
  await assert.rejects(service.productos(2,{limite:'0 OR 1=1'}),/Límite/);
  assert.equal((await service.ventas(2,{fechaInicio:'2000-01-01',fechaFin:'2000-01-01'})).resumen.total,0);
});
scenario('reportes: el día del cobro puede ser distinto del día de creación y se usa hora argentina',async()=>{
  const {id}=await pedidos.crear({usuario:3,mesa:1,productos:[{producto:1,cantidad:1}]});
  await pedidos.cambiarEstado({usuario:5,id,estado:'En Preparación'});await pedidos.cambiarEstado({usuario:5,id,estado:'Listo'});await pedidos.cambiarEstado({usuario:3,id,estado:'Entregado'});
  await db.execute("UPDATE pedidos SET fecha_creacion='2030-04-01 12:00:00' WHERE id=?",[id]);
  const [[order]]=await db.execute('SELECT subtotal FROM pedidos WHERE id=?',[id]);
  // El servicio registra el pago; los triggers impiden inventar un pedido cobrado.
  await pedidos.cobrar({usuario:4,id,metodoPago:'Efectivo',montoPagado:Number(order.subtotal)});
  const hoy=(await service.ventas(2)).pedidos.find(p=>p.id===id);
  assert.ok(hoy);
  assert.equal((await service.ventas(2,{fechaInicio:'2030-04-01',fechaFin:'2030-04-01'})).resumen.cantidadPedidos,0);
  const d=await service.dashboard(2,new Date(hoy.fechaCobrado));
  assert.ok(d.data.resumenMes.totalVentas>=hoy.total);
});
scenario('reportes: cierres y compras tienen fuentes diferentes de ventas; compras canceladas no inflan totales',async()=>{
  const cierres=await service.cierres(2);assert.equal(cierres.resumen.totalVentas,41200);assert.equal(cierres.resumen.cantidadCierres,1);
  const compra=await compras.crear(2,{proveedor:{nombre:'Cancelación reporte'},productos:[{nombre:'Gasto prueba',cantidad:1,precioUnitario:100}]});
  await compras.cancelar(2,compra.id);
  const r=await service.compras(2,{proveedor:'Cancelación reporte'});assert.equal(r.resumen.total,0);assert.equal(r.resumen.cantidadCanceladas,1);
  const inicial=await service.compras(2,{proveedor:'Distribuidora del Norte'});assert.equal(inicial.resumen.total,24200);
  assert.equal((await service.compras(2,{proveedor:"' OR 1=1 --"})).compras.length,0);
});
scenario('reportes: dashboard mantiene contrato y concilia gráficos con resumen mensual',async()=>{
  const d=await service.dashboard(2,new Date('2026-10-17T22:00:00Z'));
  assert.equal(d.success,true);assert.equal(d.data.ventasMensuales.length,12);
  assert.equal(d.data.resumenMes.totalVentas,45700);
  assert.equal(d.data.ventasMensuales[9].total,45700);
  assert.equal(d.data.ventasPorCategoria.reduce((s,p)=>s+p.total,0),45700);
  assert.equal(d.data.ventasPorMetodoPago.reduce((s,p)=>s+p.total,0),45700);
  const vacio=await service.dashboard(2,new Date('2000-01-02T00:00:00Z'));
  assert.equal(vacio.data.resumenMes.totalVentas,0);assert.equal(vacio.data.top10Productos.length,0);
  assert.ok(d.data.metricas.empleadosActivos>0);
  const inv=await service.inventario(2,{necesitaReposicion:'true'});assert.ok(inv.productos.every(p=>p.stock<=p.stockMinimo));
});

test('reportes: rutas HTTP activas, permisos y contrato de estadísticas', {skip:!enabled}, async()=>{
  const previousSecret=process.env.JWT_SECRET_KEY;
  process.env.JWT_SECRET_KEY='clave-efimera-reportes';
  const {default:express}=await import('express');
  const {default:jwt}=await import('jsonwebtoken');
  const {default:router}=await import('../../src/routes/reportes.routes.js');
  const {default:dashboard}=await import('../../src/routes/dashboard.routes.js');
  const {pool}=await import('../../src/database/mysql/pool.js');
  const app=express();app.use('/api',router);app.use('/api',dashboard);
  const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
  const base=`http://127.0.0.1:${server.address().port}/api`;
  const token=rol=>({Authorization:`Bearer ${jwt.sign({usuarioId:rol==='Gerente'?2:3,rol},process.env.JWT_SECRET_KEY)}`});
  const log=console.log;console.log=()=>{};
  try {
    assert.equal((await fetch(`${base}/reportes/ventas`)).status,401);
    assert.equal((await fetch(`${base}/reportes/ventas`,{headers:token('Mozo')})).status,403);
    for(const ruta of ['ventas','ventas/fecha','ventas/producto','ventas/mozo','ventas/metodo-pago','ventas/diario','ventas/mensual','ventas/categoria','inventario','compras','productos/mas-vendidos','productos/bajo-stock','cierres-caja','resumen-diario','dashboard']) {
      const response=await fetch(`${base}/reportes/${ruta}`,{headers:token('Gerente')});assert.equal(response.status,200,ruta);
    }
    const d=await fetch(`${base}/dashboard/estadisticas`,{headers:token('Gerente')});
    assert.equal(d.status,200);assert.equal((await d.json()).data.ventasMensuales.length,12);
    assert.equal((await fetch(`${base}/reportes/ventas?fechaInicio=2026-02-30`,{headers:token('Gerente')})).status,400);
  } finally {
    console.log=log;await new Promise(resolve=>server.close(resolve));await pool.end();
    if(previousSecret===undefined)delete process.env.JWT_SECRET_KEY;else process.env.JWT_SECRET_KEY=previousSecret;
  }
});
