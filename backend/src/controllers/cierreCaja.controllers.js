import { pool, getMySQLConnection } from '../database/mysql/pool.js';
import { actor, positiveId, requireCondition as ensure } from '../database/mysql/transaction.js';
import { cierreCajaService, fechaCaja, TURNOS, ROLES_CAJA, BILLETES } from '../services/mysql/cierresCaja.js';
import { consultarPedidos } from './pedidos.controllers.js';

const service = cierreCajaService(pool);
async function lectura(req, work) {
  const c = await getMySQLConnection();
  try {
    await c.beginTransaction();
    await actor(c, req.user?.id, ROLES_CAJA);
    const resultado = await work(c);
    await c.commit();
    return resultado;
  } catch (e) { await c.rollback(); throw e; }
  finally { c.release(); }
}
function filtros(query = {}, columna = 'c.fecha_cierre') {
  const where = [], args = [];
  if (query.fechaInicio) { where.push(columna + '>=?'); args.push(fechaCaja(query.fechaInicio)); }
  if (query.fechaFin) { where.push(columna + '<?'); args.push(fechaCaja(query.fechaFin, true)); }
  if (query.fechaInicio && query.fechaFin) ensure(fechaCaja(query.fechaFin, true) > fechaCaja(query.fechaInicio), 'Rango de fechas inválido');
  return { where, args };
}
async function consultarCierres(c, query = {}) {
  const { where, args } = filtros(query);
  if (query.id != null) { where.push('c.id=?'); args.push(positiveId(query.id)); }
  if (query.turno != null) { ensure(TURNOS.includes(query.turno), 'Turno inválido'); where.push('c.turno=?'); args.push(query.turno); }
  if (query.estado != null) {
    ensure(['Abierto', 'Cerrado', 'Revisado', 'Auditado'].includes(query.estado), 'Estado inválido');
    where.push('c.estado=?'); args.push(query.estado);
  }
  if (query.usuario != null) { where.push('c.realizado_por_id=?'); args.push(positiveId(query.usuario)); }
  const [rows] = await c.execute(`SELECT c.*,u.nombre cajero_nombre,u.apellido cajero_apellido,u.email cajero_email,
    r.nombre supervisor_nombre,r.apellido supervisor_apellido FROM cierres_caja c
    JOIN usuarios u ON u.id=c.realizado_por_id LEFT JOIN usuarios r ON r.id=c.revisado_por_id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY c.numero_cierre DESC${query.primero ? ' LIMIT 1' : ''}`, args);
  if (!rows.length) return [];
  const ids = rows.map(r => r.id), marcas = ids.map(() => '?').join(',');
  const [pagos] = await c.execute(`SELECT cp.cierre_id,pg.*,p.numero_pedido,p.numero_mesa_historico,p.nombre_mozo_historico,p.descuento_monto
    FROM cierre_pagos cp JOIN pagos_pedido pg ON pg.id=cp.pago_id JOIN pedidos p ON p.id=pg.pedido_id
    WHERE cp.cierre_id IN (${marcas}) ORDER BY pg.fecha_pago,pg.id`, ids);
  const [metodos] = await c.execute(`SELECT cp.cierre_id,pg.metodo_pago,COUNT(*) cantidad,SUM(pg.monto_aplicado) total
    FROM cierre_pagos cp JOIN pagos_pedido pg ON pg.id=cp.pago_id WHERE cp.cierre_id IN (${marcas}) GROUP BY cp.cierre_id,pg.metodo_pago`, ids);
  const [movs] = await c.execute(`SELECT * FROM movimientos_caja WHERE cierre_id IN (${marcas}) ORDER BY fecha,id`, ids);
  const [billetes] = await c.execute(`SELECT * FROM desglose_caja WHERE cierre_id IN (${marcas}) ORDER BY denominacion`, ids);
  return rows.map(caja => {
    const delCierre = items => items.filter(r => r.cierre_id === caja.id);
    const metodo = nombre => {
      const m = delCierre(metodos).find(r => r.metodo_pago === nombre);
      return { cantidad: Number(m?.cantidad ?? 0), total: Number(m?.total ?? 0) };
    };
    const movimientos = tipo => delCierre(movs).filter(m => m.tipo === tipo).map(m => ({ _id: String(m.id), concepto: m.concepto, monto: Number(m.monto), comprobante: m.comprobante, fecha: m.fecha }));
    const desgloseBilletes = {};
    for (const b of delCierre(billetes)) {
      const key = Object.keys(BILLETES).find(k => BILLETES[k] === Number(b.denominacion)) ?? String(b.denominacion);
      desgloseBilletes[key] = { denominacion: Number(b.denominacion), cantidad: Number(b.cantidad), total: Number(b.total) };
    }
    return {
      _id: String(caja.id), id: String(caja.id), numeroCierre: caja.numero_cierre, fechaCierre: caja.fecha_cierre, turno: caja.turno,
      realizadoPor: { _id: String(caja.realizado_por_id), id: String(caja.realizado_por_id), nombre: caja.cajero_nombre, apellido: caja.cajero_apellido, email: caja.cajero_email },
      horaInicio: caja.hora_inicio, horaFin: caja.hora_fin, montoInicial: Number(caja.monto_inicial),
      ventasPorMetodo: { efectivo: metodo('Efectivo'), transferencia: metodo('Transferencia') },
      totalVentas: Number(caja.total_ventas), totalDescuentos: Number(caja.total_descuentos),
      pedidos: delCierre(pagos).map(p => ({ pedidoId: { _id: String(p.pedido_id), id: String(p.pedido_id), numeroPedido: p.numero_pedido }, pagoId: String(p.id),
        numeroPedido: p.numero_pedido, mesa: p.numero_mesa_historico, mozo: p.nombre_mozo_historico,
        metodoPago: p.metodo_pago, monto: Number(p.monto_aplicado), descuento: Number(p.descuento_monto), horaPago: p.fecha_pago })),
      efectivoEnCaja: Number(caja.efectivo_esperado), efectivoContado: Number(caja.efectivo_contado), diferencia: Number(caja.diferencia), desgloseBilletes,
      gastos: movimientos('Gasto'), ingresosAdicionales: movimientos('Ingreso'), totalGastos: Number(caja.total_gastos), totalIngresosAdicionales: Number(caja.total_ingresos_adicionales),
      estado: caja.estado, observaciones: caja.observaciones,
      revisadoPor: caja.revisado_por_id ? { _id: String(caja.revisado_por_id), id: String(caja.revisado_por_id), nombre: caja.supervisor_nombre, apellido: caja.supervisor_apellido } : null,
      fechaRevision: caja.fecha_revision, observacionesRevision: caja.observaciones_revision,
      montoEntregado: Number(caja.monto_entregado), montoParaSiguienteTurno: Number(caja.monto_siguiente_turno), createdAt: caja.created_at, updatedAt: caja.updated_at,
    };
  });
}
const endpoint = work => async (req, res) => {
  try {
    const r = await work(req);
    return res.status(r.status ?? 200).json(r.body);
  } catch (e) {
    const conflicto = ['ER_DUP_ENTRY', 'ER_LOCK_DEADLOCK', 'ER_LOCK_WAIT_TIMEOUT'].includes(e.code);
    const datos = ['ER_SIGNAL_EXCEPTION', 'ER_CHECK_CONSTRAINT_VIOLATED', 'ER_WARN_DATA_OUT_OF_RANGE', 'ER_DATA_TOO_LONG'].includes(e.code);
    const status = e.status ?? (conflicto ? 409 : datos ? 400 : 500);
    if (status === 500) console.error('Error en cierres de caja MySQL:', e.code ?? e.name);
    return res.status(status).json({ mensaje: e.status ? e.message : conflicto ? 'El cierre cambió o algún cobro ya fue incluido. Actualice el listado e intente nuevamente.' : datos ? 'Revise los importes, billetes y fechas del cierre.' : 'Error interno al procesar el cierre de caja' });
  }
};
const lista = obtenerFiltros => endpoint(async req => ({ body: await lectura(req, c => consultarCierres(c, obtenerFiltros(req))) }));
export const obtenerCierresCaja = lista(req => req.query);
export const obtenerCierresCajaPorTurno = lista(req => ({ ...req.query, turno: req.params.turno }));
export const obtenerCierresCajaPorFecha = lista(req => {
  ensure(req.query.fechaInicio && req.query.fechaFin, 'Se requieren fechaInicio y fechaFin'); return req.query;
});
export const obtenerCierresPorFechas = obtenerCierresCajaPorFecha;
export const obtenerUnCierreCaja = endpoint(async req => {
  const [cierre] = await lectura(req, c => consultarCierres(c, { id: positiveId(req.params.id) }));
  ensure(cierre, 'Cierre de caja no encontrado', 404);
  return { body: cierre };
});
export const obtenerUltimoCierre = endpoint(async req => {
  const [cierre] = await lectura(req, c => consultarCierres(c, { primero: true }));
  ensure(cierre, 'No hay cierres registrados', 404);
  return { body: cierre };
});
export const obtenerCierreActivo = endpoint(async req => {
  const [cierre] = await lectura(req, c => consultarCierres(c, { estado: 'Abierto', primero: true }));
  return { body: cierre ?? null };
});
export const obtenerPedidosPendientesCierre = endpoint(async req => ({ body: await lectura(req, async c => {
  // El período corresponde al momento del cobro, aunque el pedido sea de otro día.
  const { where, args } = filtros(req.query, 'pg.fecha_pago');
  const [rows] = await c.execute(`SELECT pg.pedido_id FROM pagos_pedido pg JOIN pedidos p ON p.id=pg.pedido_id
    LEFT JOIN cierre_pagos cp ON cp.pago_id=pg.id WHERE cp.pago_id IS NULL AND p.estado='Cobrado'
    ${where.length ? 'AND ' + where.join(' AND ') : ''} ORDER BY pg.fecha_pago DESC,pg.id DESC`, args);
  const pedidos = [];
  for (const r of rows) { const [p] = await consultarPedidos(c, { id: r.pedido_id }); if (p) pedidos.push(p); }
  return pedidos;
}) }));
async function resultadoEscritura(req, accion, datos, mensaje, status = 200) {
  const { id } = await service[accion]({ usuario: req.user?.id, ...datos });
  const [cierre] = await lectura(req, c => consultarCierres(c, { id }));
  // COMMIT ya terminó; el cliente puede volver a consultar el cierre persistido.
  return { status, body: { mensaje, cierre } };
}
export const crearCierreCaja = endpoint(req => resultadoEscritura(req, 'crear', { datos: req.body }, 'Cierre de caja creado exitosamente', 201));
export const actualizarCierreCaja = endpoint(req => resultadoEscritura(req, 'actualizar', { id: req.params.id, datos: req.body }, 'Cierre de caja actualizado correctamente'));
export const agregarPedidoACierre = endpoint(req => resultadoEscritura(req, 'agregarPedido', { id: req.params.id, pedidoId: req.body?.pedidoId }, 'Pedido agregado exitosamente'));
export const revisarCierreCaja = endpoint(req => resultadoEscritura(req, 'revisar', { id: req.params.id, observaciones: req.body?.observaciones }, 'Cierre revisado exitosamente'));
export const reporteCierres = endpoint(async req => ({ body: await lectura(req, async c => {
  const cierres = await consultarCierres(c, req.query);
  // Suma en centavos para evitar diferencias de coma flotante en el informe JSON.
  const suma = campo => cierres.reduce((total, cierre) => total + Math.round(cierre[campo] * 100), 0) / 100;
  const totalVentas = suma('totalVentas'), totalIngresos = suma('totalIngresosAdicionales'), totalGastos = suma('totalGastos');
  return { cierres, resumen: { cantidadCierres: cierres.length, totalVentas, totalDescuentos: suma('totalDescuentos'), totalGastos,
    totalIngresos, totalDiferencias: suma('diferencia'), balanceGeneral: (Math.round(totalVentas * 100) + Math.round(totalIngresos * 100) - Math.round(totalGastos * 100)) / 100 } };
}) }));
