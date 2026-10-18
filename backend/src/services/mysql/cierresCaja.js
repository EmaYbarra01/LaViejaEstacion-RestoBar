import { transaction, actor, positiveId, nextNumber, requireCondition as ensure } from '../../database/mysql/transaction.js';

export const TURNOS = ['Mañana', 'Tarde', 'Noche', 'Completo'];
export const ROLES_CAJA = ['Cajero', 'Gerente', 'SuperAdministrador'];
// Compatibilidad con las claves de la pantalla existente; SQL guarda el valor nominal.
export const BILLETES = { mil: 1000, doscientos: 2000, cien: 10000, cincuenta: 20000 };
const MAX_CENTAVOS = 999999999999;
const posee = (o, k) => Object.hasOwn(o, k);
function dinero(valor, nombre) {
  ensure(['string', 'number'].includes(typeof valor) && /^\d+(\.\d{1,2})?$/.test(String(valor)), `${nombre}: importe inválido (máximo dos decimales)`);
  const cents = Math.round(Number(valor) * 100);
  ensure(Number.isSafeInteger(cents) && cents <= MAX_CENTAVOS, `${nombre}: importe fuera de rango`);
  return cents / 100;
}
function texto(valor, nombre, max = 10000) {
  ensure(typeof valor === 'string' && valor.length <= max, `${nombre}: texto inválido`);
  return valor.trim();
}
// Los datetime-local sin zona corresponden al horario argentino. En SQL se guarda UTC.
export function fechaCaja(valor, finDia = false) {
  ensure(typeof valor === 'string', 'Fecha inválida');
  const dia = /^\d{4}-\d{2}-\d{2}$/.test(valor);
  const local = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/.test(valor);
  const zona = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/.test(valor);
  ensure(dia || local || zona, 'Fecha inválida');
  const f = new Date(dia ? valor + 'T00:00:00-03:00' : local ? valor + '-03:00' : valor);
  ensure(Number.isFinite(f.getTime()), 'Fecha inválida');
  // Date acepta algunos días inexistentes desplazándolos al mes siguiente.
  const calendario = new Date(valor.slice(0, 10) + 'T00:00:00Z');
  ensure(Number.isFinite(calendario.getTime()) && calendario.toISOString().slice(0, 10) === valor.slice(0, 10), 'Fecha inválida');
  if (dia && finDia) f.setTime(f.getTime() + 86400000);
  return f;
}
function periodo(body) {
  const inicio = fechaCaja(body.horaInicio), fin = fechaCaja(body.horaFin);
  ensure(fin > inicio, 'La hora de fin debe ser posterior al inicio');
  return { inicio, fin };
}
function desglose(valor) {
  ensure(valor && typeof valor === 'object' && !Array.isArray(valor), 'Desglose inválido');
  const filas = [], vistos = new Set();
  for (const [clave, item] of Object.entries(valor)) {
    const nominal = BILLETES[clave] ?? (/^\d+(\.\d{1,2})?$/.test(clave) ? Number(clave) : undefined);
    ensure(nominal > 0 && nominal <= 9999999999.99, 'Denominación inválida: use su valor nominal');
    const cantidad = Number(item?.cantidad ?? item);
    ensure(Number.isInteger(cantidad) && cantidad >= 0 && cantidad <= 4294967295, 'Cantidad de billetes inválida');
    ensure(!vistos.has(nominal), 'Denominación repetida'); vistos.add(nominal);
    // El total enviado por el cliente nunca se usa: lo calcula MySQL.
    if (cantidad) filas.push([nominal, cantidad]);
  }
  ensure(filas.length <= 100, 'Demasiadas denominaciones');
  return filas;
}
async function guardarDesglose(c, id, valor) {
  const filas = desglose(valor);
  await c.execute('DELETE FROM desglose_caja WHERE cierre_id=?', [id]);
  for (const [nominal, cantidad] of filas) await c.execute('INSERT INTO desglose_caja(cierre_id,denominacion,cantidad) VALUES(?,?,?)', [id, nominal, cantidad]);
}
async function guardarMovimientos(c, id, tipo, entradas) {
  ensure(Array.isArray(entradas) && entradas.length <= 1000, 'Lista de movimientos inválida');
  await c.execute('DELETE FROM movimientos_caja WHERE cierre_id=? AND tipo=?', [id, tipo]);
  for (const entrada of entradas) {
    ensure(entrada && typeof entrada === 'object', 'Movimiento inválido');
    const concepto = texto(entrada.concepto, 'Concepto', 255), monto = dinero(entrada.monto, 'Movimiento');
    ensure(concepto && monto > 0, 'Cada movimiento requiere concepto y monto mayor a cero');
    await c.execute(`INSERT INTO movimientos_caja(cierre_id,tipo,concepto,monto,comprobante,fecha)
      VALUES(?,?,?,?,?,?)`, [id, tipo, concepto, monto, texto(entrada.comprobante ?? '', 'Comprobante', 255), entrada.fecha ? fechaCaja(entrada.fecha) : new Date()]);
  }
}
async function conciliar(c, id, estado) {
  const [[ventas]] = await c.execute(`SELECT COALESCE(SUM(pg.monto_aplicado),0) ventas,
    COALESCE(SUM(IF(pg.metodo_pago='Efectivo',pg.monto_aplicado,0)),0) efectivo,
    COALESCE(SUM(p.descuento_monto),0) descuentos
    FROM cierre_pagos cp JOIN pagos_pedido pg ON pg.id=cp.pago_id JOIN pedidos p ON p.id=pg.pedido_id WHERE cp.cierre_id=?`, [id]);
  const [[mov]] = await c.execute(`SELECT COALESCE(SUM(IF(tipo='Gasto',monto,0)),0) gastos,
    COALESCE(SUM(IF(tipo='Ingreso',monto,0)),0) ingresos FROM movimientos_caja WHERE cierre_id=?`, [id]);
  const [[billetes]] = await c.execute('SELECT COUNT(*) cantidad,COALESCE(SUM(total),0) total FROM desglose_caja WHERE cierre_id=?', [id]);
  const [[caja]] = await c.execute('SELECT efectivo_contado FROM cierres_caja WHERE id=?', [id]);
  ensure(!billetes.cantidad || Number(billetes.total) === Number(caja.efectivo_contado), 'El desglose de billetes no coincide con el efectivo contado');
  const [[saldos]] = await c.execute(`SELECT monto_inicial + CAST(? AS DECIMAL(12,2)) + CAST(? AS DECIMAL(12,2)) - CAST(? AS DECIMAL(12,2)) esperado,
    efectivo_contado-(monto_entregado+monto_siguiente_turno) disponible FROM cierres_caja WHERE id=?`, [ventas.efectivo, mov.ingresos, mov.gastos, id]);
  ensure(Number(saldos.esperado) >= 0 && Number(saldos.esperado) <= 9999999999.99, 'El efectivo esperado queda fuera de rango: revise gastos e ingresos');
  ensure(Number(saldos.disponible) >= 0, 'Lo entregado y reservado no puede superar el efectivo contado');
  await c.execute(`UPDATE cierres_caja SET total_ventas=?,total_descuentos=?,total_gastos=?,total_ingresos_adicionales=?,
    efectivo_esperado=?,diferencia=efectivo_contado-CAST(? AS DECIMAL(12,2)),estado=? WHERE id=?`,
    [ventas.ventas, ventas.descuentos, mov.gastos, mov.ingresos, saldos.esperado, saldos.esperado, estado, id]);
}
async function asignarPagos(c, id, inicio, fin, pedidosIds) {
  const explicitos = pedidosIds !== undefined;
  ensure(!explicitos || (Array.isArray(pedidosIds) && pedidosIds.length <= 1000), 'Lista de pedidos inválida');
  const ids = explicitos ? pedidosIds.map(positiveId) : [];
  ensure(new Set(ids).size === ids.length, 'Hay pedidos repetidos');
  if (explicitos && !ids.length) return;
  const [pagos] = await c.execute(`SELECT pg.id,pg.pedido_id FROM pagos_pedido pg JOIN pedidos p ON p.id=pg.pedido_id
    WHERE p.estado='Cobrado' AND pg.fecha_pago>=? AND pg.fecha_pago<?
    ${explicitos ? 'AND pg.pedido_id IN (' + ids.map(() => '?').join(',') + ')' : ''} ORDER BY pg.id FOR UPDATE`, [inicio, fin, ...ids]);
  let asignados = [];
  if (pagos.length) [asignados] = await c.execute('SELECT pago_id FROM cierre_pagos WHERE pago_id IN (' + pagos.map(() => '?').join(',') + ') FOR UPDATE', pagos.map(p => p.id));
  const ocupados = new Set(asignados.map(p => p.pago_id));
  const libres = pagos.filter(p => !ocupados.has(p.id));
  ensure(!explicitos || libres.length === ids.length, 'Algún pedido no está cobrado, está fuera del período o ya pertenece a un cierre', 409);
  for (const pago of libres) await c.execute('INSERT INTO cierre_pagos(cierre_id,pago_id) VALUES(?,?)', [id, pago.id]);
}
async function bloqueo(c, id, usuario, roles) {
  const user = await actor(c, usuario, roles);
  const [[caja]] = await c.execute('SELECT * FROM cierres_caja WHERE id=? FOR UPDATE', [positiveId(id)]);
  ensure(caja, 'Cierre de caja no encontrado', 404);
  ensure(user.rol !== 'Cajero' || Number(caja.realizado_por_id) === Number(user.id), 'Solo puede modificar sus propios cierres', 403);
  return caja;
}

export function cierreCajaService(pool) {
  return {
    crear: ({ usuario, datos }) => transaction(pool, async c => {
      await actor(c, usuario, ROLES_CAJA);
      ensure(datos && typeof datos === 'object', 'Datos de cierre inválidos');
      ensure(TURNOS.includes(datos.turno), 'Turno inválido');
      const { inicio, fin } = periodo(datos), estado = datos.estado ?? 'Cerrado';
      ensure(['Abierto', 'Cerrado'].includes(estado), 'Estado inicial inválido');
      // Serializa numeración y asignación entre cierres concurrentes. Si falla, revierte todo.
      const numero = await nextNumber(c, 'cierre');
      const inicial = dinero(datos.montoInicial ?? 0, 'Monto inicial'), contado = dinero(datos.efectivoContado ?? 0, 'Efectivo contado');
      const [r] = await c.execute(`INSERT INTO cierres_caja(numero_cierre,realizado_por_id,turno,hora_inicio,hora_fin,monto_inicial,
        efectivo_esperado,efectivo_contado,diferencia,estado,observaciones,observaciones_revision,monto_entregado,monto_siguiente_turno)
        VALUES(?,?,?,?,?,?,0,?,?,'Abierto',?,'',?,?)`, [numero, positiveId(usuario), datos.turno, inicio, fin, inicial, contado, contado,
        texto(datos.observaciones ?? '', 'Observaciones'), dinero(datos.montoEntregado ?? 0, 'Monto entregado'), dinero(datos.montoParaSiguienteTurno ?? 0, 'Monto siguiente turno')]);
      const id = r.insertId;
      await asignarPagos(c, id, inicio, fin, datos.pedidosIds);
      await guardarMovimientos(c, id, 'Gasto', datos.gastos ?? []);
      await guardarMovimientos(c, id, 'Ingreso', datos.ingresosAdicionales ?? []);
      await guardarDesglose(c, id, datos.desgloseBilletes ?? {});
      await conciliar(c, id, estado);
      return { id };
    }),
    actualizar: ({ id, usuario, datos }) => transaction(pool, async c => {
      const caja = await bloqueo(c, id, usuario, ['Cajero', 'SuperAdministrador']);
      ensure(!['Revisado', 'Auditado'].includes(caja.estado), 'No se puede modificar un cierre revisado o auditado', 409);
      const campos = { observaciones: 'observaciones', montoEntregado: 'monto_entregado', montoParaSiguienteTurno: 'monto_siguiente_turno' };
      if (caja.estado === 'Abierto') Object.assign(campos, { montoInicial: 'monto_inicial', efectivoContado: 'efectivo_contado' });
      const especiales = caja.estado === 'Abierto' ? ['gastos', 'ingresosAdicionales', 'desgloseBilletes', 'estado'] : [];
      ensure(datos && Object.keys(datos).length > 0 && Object.keys(datos).every(k => posee(campos, k) || especiales.includes(k)),
        'Campo no modificable: los importes y el período de un cierre finalizado se conservan', 409);
      const sets = [], args = [];
      for (const [key, columna] of Object.entries(campos)) if (posee(datos, key)) {
        sets.push(columna + '=?'); args.push(key === 'observaciones' ? texto(datos[key], 'Observaciones') : dinero(datos[key], key));
      }
      // Efectivo contado y diferencia se actualizan juntos para respetar el CHECK.
      if (posee(datos, 'efectivoContado')) { sets.push('diferencia=?-efectivo_esperado'); args.push(dinero(datos.efectivoContado, 'Efectivo contado')); }
      if (sets.length) await c.execute('UPDATE cierres_caja SET ' + sets.join(',') + ' WHERE id=?', [...args, caja.id]);
      if (posee(datos, 'gastos')) await guardarMovimientos(c, caja.id, 'Gasto', datos.gastos);
      if (posee(datos, 'ingresosAdicionales')) await guardarMovimientos(c, caja.id, 'Ingreso', datos.ingresosAdicionales);
      if (posee(datos, 'desgloseBilletes')) await guardarDesglose(c, caja.id, datos.desgloseBilletes);
      const estado = datos.estado ?? caja.estado;
      ensure(['Abierto', 'Cerrado'].includes(estado), 'Estado inválido: la revisión se realiza por su ruta específica');
      await conciliar(c, caja.id, estado);
      return { id: caja.id };
    }),
    agregarPedido: ({ id, usuario, pedidoId }) => transaction(pool, async c => {
      const caja = await bloqueo(c, id, usuario, ['Cajero', 'SuperAdministrador']);
      ensure(caja.estado === 'Abierto', 'Solo se agregan pagos a cierres abiertos', 409);
      await asignarPagos(c, caja.id, caja.hora_inicio, caja.hora_fin, [pedidoId]);
      await conciliar(c, caja.id, 'Abierto');
      return { id: caja.id };
    }),
    revisar: ({ id, usuario, observaciones = '' }) => transaction(pool, async c => {
      const caja = await bloqueo(c, id, usuario, ['Gerente', 'SuperAdministrador']);
      ensure(caja.estado === 'Cerrado', 'Solo se pueden revisar cierres en estado Cerrado', 409);
      await c.execute("UPDATE cierres_caja SET estado='Revisado',revisado_por_id=?,fecha_revision=UTC_TIMESTAMP(3),observaciones_revision=? WHERE id=?",
        [positiveId(usuario), texto(observaciones, 'Observaciones de revisión'), caja.id]);
      return { id: caja.id };
    }),
  };
}
