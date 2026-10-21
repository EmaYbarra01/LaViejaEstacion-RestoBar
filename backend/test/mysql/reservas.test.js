import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { connect } from '../../scripts/mysql/connection.js';
import { reservaService, validarFecha, validarHora, validarDatos, seSuperponen, hashToken } from '../../src/services/mysql/reservas.js';
import { validarAnticipacion, validarHorarioAtencion } from '../../src/config/reservasConfig.js';

const fechaFutura = () => {
  let date = new Date(Date.now()+7*86400000);
  while (['01-01','05-01','12-25'].includes(date.toISOString().slice(5,10))) date = new Date(+date+86400000);
  return date.toISOString().slice(0,10);
};
const datos = extra => ({ cliente:'Prueba Reservas', email:'reserva@laviejaestacion.example', telefono:'3811234567',
  fecha:fechaFutura(), hora:'19:00', comensales:2, ...extra });

test('rechaza fechas inexistentes, horas mal formadas y comensales fraccionarios', () => {
  assert.throws(()=>validarFecha('2026-02-30'), /Fecha inválida/);
  assert.throws(()=>validarFecha('2026-10-21 OR 1=1'), /Fecha inválida/);
  assert.throws(()=>validarHora('24:00'), /Hora inválida/);
  assert.throws(()=>validarDatos(datos({comensales:1.5})), /Comensales/);
  assert.throws(()=>validarDatos(datos({telefono:'123'})), /Teléfono/);
});
test('la ocupación dura dos horas y permite comenzar justo al finalizar', () => {
  assert.equal(seSuperponen('19:00','20:30'),true);
  assert.equal(seSuperponen('19:00','17:30'),true);
  assert.equal(seSuperponen('19:00','21:00'),false);
});
test('la anticipación interpreta la hora argentina aunque Node use UTC', () => {
  const future = new Date(Date.now()+25*3600000).toISOString();
  const argentina = new Date(+new Date(future)-3*3600000).toISOString();
  assert.equal(validarAnticipacion(argentina.slice(0,10),argentina.slice(11,16)).valido,true);
  assert.equal(validarAnticipacion('2000-01-01','19:00').valido,false);
});
test('el día de semana y los feriados no cambian por la zona horaria', () => {
  assert.equal(validarHorarioAtencion('2026-12-25','19:00').valido,false);
  assert.equal(validarHorarioAtencion('2026-10-23','22:00').valido,true);
  assert.equal(validarHorarioAtencion('2026-10-22','22:00').valido,false);
});

const enabled = process.env.MYSQL_TESTS === '1';
let db, service;
before(async () => {
  if (!enabled) return;
  db = await connect({database:true});
  const scoped = {
    query:(...args)=>db.query(...args), execute:(...args)=>db.execute(...args),
    beginTransaction:()=>db.query('SAVEPOINT reserva_test'), commit:()=>db.query('RELEASE SAVEPOINT reserva_test'),
    rollback:async()=>{await db.query('ROLLBACK TO SAVEPOINT reserva_test'); await db.query('RELEASE SAVEPOINT reserva_test');},
    release:()=>{}
  };
  service = reservaService({getConnection:async()=>scoped});
});
after(async()=>{ if(db) await db.end(); });
const scenario = (name, fn) => test(name, {skip:!enabled}, async()=>{
  await db.beginTransaction();
  try { await fn(); } finally { await db.rollback(); }
});
scenario('crear, listar por fecha/email, confirmar y completar sin MongoDB', async()=>{
  const {reserva,token} = await service.crear(datos());
  assert.equal(reserva.mesa,null);
  assert.equal(reserva.fecha,fechaFutura());
  assert.equal(reserva.hora,'19:00');
  assert.equal(reserva._id,String(reserva.id));
  assert.equal('confirmationToken' in reserva,false);
  const [[row]] = await db.execute('SELECT confirmation_token_hash FROM reservas WHERE id=?',[reserva.id]);
  assert.equal(row.confirmation_token_hash,hashToken(token));
  assert.notEqual(row.confirmation_token_hash,token);
  const listado = await service.listar({fecha:reserva.fecha,email:reserva.email});
  assert.ok(listado.reservas.some(r=>r.id===reserva.id));
  const confirmada = await service.porToken(token,'Confirmada');
  assert.equal(confirmada.reserva.estado,'Confirmada');
  assert.ok(confirmada.reserva.confirmedAt);
  assert.equal((await service.porToken(token,'Confirmada')).modificada,false);
  assert.equal((await service.cambiarEstado(reserva.id,'Completada')).estado,'Completada');
  await assert.rejects(service.porToken(token,'Cancelada'),/finalizada/);
});
scenario('rechaza superposición al crear y editar; permite el límite y cancelar libera el horario', async()=>{
  const {reserva:primera} = await service.crear(datos({numeroMesa:1}));
  await assert.rejects(service.crear(datos({numeroMesa:1,hora:'20:30'})),/reservada/);
  const {reserva:segunda} = await service.crear(datos({numeroMesa:1,hora:'21:00'}));
  await assert.rejects(service.actualizar(segunda.id,{hora:'20:00'}),/reservada/);
  assert.equal((await service.obtener(segunda.id)).hora,'21:00');
  const disponibilidad = await service.disponibilidad(primera.fecha,'20:00',2);
  assert.equal(disponibilidad.mesasDisponibles.some(m=>m.numero===1),false);
  await service.cambiarEstado(primera.id,'Cancelada');
  const libre = await service.disponibilidad(primera.fecha,'19:00',2);
  assert.equal(libre.mesasDisponibles.some(m=>m.numero===1),true);
});
scenario('capacidad, cambio de fecha, desasignación y reservas finalizadas', async()=>{
  await assert.rejects(service.crear(datos({numeroMesa:1,comensales:15})),/capacidad/);
  const {reserva} = await service.crear(datos({numeroMesa:1}));
  const cambio = await service.actualizar(reserva.id,{numeroMesa:null});
  assert.equal(cambio.reserva.mesa,null);
  assert.ok(cambio.token);
  await assert.rejects(service.actualizar(reserva.id,{fecha:'2000-01-02'}),/anticipación/);
  await service.cambiarEstado(reserva.id,'Cancelada');
  await assert.rejects(service.actualizar(reserva.id,{cliente:'Cambio'}),/finalizada/);
});
scenario('un token vencido no confirma ni cancela; paginación e IDs inválidos son 400', async()=>{
  const {reserva,token} = await service.crear(datos());
  await db.execute('UPDATE reservas SET token_expiry=? WHERE id=?',[new Date(Date.now()-1000),reserva.id]);
  await assert.rejects(service.porToken(token,'Confirmada'),/expirado/);
  await assert.rejects(service.porToken(token,'Cancelada'),/expirado/);
  await assert.rejects(service.listar({page:-1}),/Paginación/);
  await assert.rejects(service.obtener('abc'),/Identificador/);
  await assert.rejects(service.actualizar(reserva.id,{estado:'Inventado'}),/Estado/);
});
