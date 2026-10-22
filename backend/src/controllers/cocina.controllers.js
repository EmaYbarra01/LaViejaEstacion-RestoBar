import {
  consultarPedidos,
  leerPedidosSQL,
  normalizarEstado,
  cambiarEstadoPedido,
} from './pedidos.controllers.js';
import { positiveId, requireCondition as ensure } from '../database/mysql/transaction.js';

const ESTADOS_COCINA = ['Pendiente', 'En Preparación', 'Listo'];
function manejar(operacion) {
  return async (req, res) => {
    try {
      return res.status(200).json({ success: true, ...await operacion(req) });
    } catch (error) {
      if (error.status) return res.status(error.status).json({ success: false, mensaje: error.message });
      console.error('Error en cocina MySQL:', error.code || error.message);
      return res.status(500).json({ success: false, mensaje: 'Error al consultar cocina' });
    }
  };
}

export const getPedidosCocina = manejar(async req => {
  const query = req.query || {};
  const filtros = { limit: query.limit ?? 50 };
  if (query.estado) {
    const estado = normalizarEstado(query.estado);
    ensure(ESTADOS_COCINA.includes(estado), 'Estado no válido para cocina');
    filtros.estado = estado;
  } else {
    filtros.estados = ['Pendiente', 'En Preparación'];
  }
  const pedidos = await leerPedidosSQL(c => consultarPedidos(c, filtros, 'asc'));
  return { count: pedidos.length, pedidos };
});

export const getPedidoDetalle = manejar(async req => {
  const pedido = await leerPedidosSQL(async c => {
    const [resultado] = await consultarPedidos(c, { id: positiveId(req.params.id) });
    ensure(resultado, 'Pedido no encontrado', 404);
    return resultado;
  });
  return { pedido };
});

export const updateEstadoPedido = async (req, res) => {
  try {
    const estado = normalizarEstado(req.body?.estado);
    ensure(['En Preparación', 'Listo'].includes(estado), 'Cocina solo cambia el pedido a En Preparación o Listo');
  } catch (error) {
    return res.status(error.status || 400).json({ success: false, mensaje: error.message });
  }
  // Reutiliza las transacciones y notificaciones de pedidos; no duplica el cobro ni el stock.
  let status = 200;
  return cambiarEstadoPedido(req, {
    status(codigo) { status = codigo; return this; },
    json(body) { return res.status(status).json({ success: status >= 200 && status < 300, ...body }); },
  });
};

export const getEstadisticasCocina = manejar(async () => {
  const estadisticas = await leerPedidosSQL(async c => {
    // La jornada se delimita en hora argentina y se compara con las fechas UTC.
    const [[row]] = await c.query(`
      WITH dia AS (
        SELECT CONVERT_TZ(
          CONCAT(DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '-03:00')), ' 00:00:00'),
          '-03:00', '+00:00'
        ) inicio
      )
      SELECT
        COALESCE(SUM(p.estado = 'Pendiente'), 0) pendientes,
        COALESCE(SUM(p.estado = 'En Preparación'), 0) enPreparacion,
        COALESCE(SUM(p.estado = 'Listo'), 0) listos,
        COALESCE(SUM(p.estado <> 'Cancelado' AND p.fecha_creacion >= dia.inicio
          AND p.fecha_creacion < DATE_ADD(dia.inicio, INTERVAL 1 DAY)), 0) totalHoy
      FROM pedidos p CROSS JOIN dia WHERE p.activo = TRUE
    `);
    return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, Number(value)]));
  });
  return { estadisticas };
});

export default { getPedidosCocina, updateEstadoPedido, getEstadisticasCocina, getPedidoDetalle };
