import { pool } from '../database/mysql/pool.js';
import { reservaService } from '../services/mysql/reservas.js';
import { enviarEmailConfirmacion, enviarEmailCancelacion, enviarNotificacionRestobar } from '../helpers/emailHelper.js';

const service = reservaService(pool);
// Los correos salen después del COMMIT. Un fallo de SMTP no revierte la reserva.
const notificar = (fn, ...args) => {
  Promise.resolve().then(() => fn(...args)).then(resultado => {
    if (!resultado?.success) console.warn('[RESERVAS] No se pudo enviar el correo');
  }).catch(error => console.warn('[RESERVAS] Error de correo:', error.message));
};
const manejar = fn => async (req, res) => {
  try { await fn(req, res); }
  catch (error) {
    console.error('[RESERVAS]', error.message);
    res.status(error.status || 500).json({ success: false, mensaje: error.status ? error.message : 'Error al procesar la reserva' });
  }
};
export const crearReserva = manejar(async (req, res) => {
  const { reserva } = await service.crear(req.body);
  notificar(enviarNotificacionRestobar, reserva);
  res.status(201).json({ success: true, mensaje: '¡Solicitud de reserva recibida! Te enviaremos un email cuando confirmemos la disponibilidad.', reserva,
    mesaAsignada: reserva.mesa ? { numero: reserva.mesa.numero, capacidad: reserva.mesa.capacidad, ubicacion: reserva.mesa.ubicacion } : null });
});
export const obtenerReservas = manejar(async (req, res) => res.json(await service.listar(req.query)));
export const obtenerReservaPorId = manejar(async (req, res) => res.json({ success: true, reserva: await service.obtener(req.params.id) }));
export const actualizarReserva = manejar(async (req, res) => {
  const { reserva, token } = await service.actualizar(req.params.id, req.body);
  if (token && reserva.estado === 'Confirmada') notificar(enviarEmailConfirmacion, reserva, token);
  res.json({ success: true, mensaje: 'Reserva actualizada exitosamente', reserva });
});
const cambiar = (estado, mensaje) => manejar(async (req, res) => {
  const reserva = await service.cambiarEstado(req.params.id, estado);
  if (estado === 'Cancelada') notificar(enviarEmailCancelacion, reserva);
  if (estado === 'Confirmada') notificar(enviarEmailConfirmacion, reserva);
  res.json({ success: true, mensaje, reserva });
});
export const cancelarReserva = cambiar('Cancelada', 'Reserva cancelada exitosamente');
export const confirmarReserva = cambiar('Confirmada', 'Reserva confirmada exitosamente');
export const completarReserva = cambiar('Completada', 'Reserva completada exitosamente');
export const obtenerReservasPorFecha = manejar(async (req, res) => {
  const resultado = await service.listar({ fecha: req.params.fecha, soloActivas: true, limit: 500 });
  res.json({ ...resultado, fecha: req.params.fecha });
});
export const obtenerReservasPorCliente = manejar(async (req, res) => {
  const primera = await service.listar({ email: req.params.email, limit: 500 });
  const reservas = [...primera.reservas];
  for (let page = 2; page <= primera.totalPages; page++) {
    reservas.push(...(await service.listar({ email: req.params.email, page, limit: 500 })).reservas);
  }
  reservas.sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`));
  res.json({ success: true, reservas, estadisticas: {
    total: reservas.length,
    pendientes: reservas.filter(r => r.estado === 'Pendiente').length,
    confirmadas: reservas.filter(r => r.estado === 'Confirmada').length,
    canceladas: reservas.filter(r => r.estado === 'Cancelada').length,
    completadas: reservas.filter(r => r.estado === 'Completada').length
  } });
});
export const verificarDisponibilidad = manejar(async (req, res) => {
  res.json(await service.disponibilidad(req.params.fecha, req.params.hora, req.query.comensales));
});
const escapar = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const pagina = (titulo, contenido) => `<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapar(titulo)}</title><style>body{font:18px system-ui;background:#f5f5f5;margin:0;padding:24px}main{max-width:560px;margin:40px auto;padding:32px;background:white;border-radius:16px}h1{color:#574232}dt{font-weight:bold;margin-top:14px}dd{margin-left:0}</style></head><body><main><h1>${escapar(titulo)}</h1>${contenido}<p>La Vieja Estación RestoBar</p></main></body></html>`;
const conToken = estado => async (req, res) => {
  try {
    const { reserva, modificada } = await service.porToken(req.params.token, estado);
    if (estado === 'Cancelada' && modificada) notificar(enviarEmailCancelacion, reserva);
    const titulo = estado === 'Confirmada' ? 'Reserva confirmada' : 'Reserva cancelada';
    res.type('html').send(pagina(titulo, `<dl><dt>Cliente</dt><dd>${escapar(reserva.cliente)}</dd><dt>Fecha y hora</dt><dd>${escapar(reserva.fecha)} ${escapar(reserva.hora)}</dd><dt>Comensales</dt><dd>${reserva.comensales}</dd><dt>Mesa</dt><dd>${reserva.numeroMesa ?? 'Pendiente de asignación'}</dd></dl>`));
  } catch (error) {
    res.status(error.status || 500).type('html').send(pagina('No se pudo procesar el enlace', `<p>${escapar(error.status ? error.message : 'Ocurrió un error. Volvé a intentar más tarde.')}</p>`));
  }
};
export const confirmarReservaToken = conToken('Confirmada');
export const cancelarReservaToken = conToken('Cancelada');
