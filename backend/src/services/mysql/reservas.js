import { createHash, randomBytes } from 'node:crypto';
import { transaction, requireCondition as check, positiveId } from '../../database/mysql/transaction.js';
import { CONFIGURACION_RESERVAS, validarHorarioAtencion, validarAnticipacion } from '../../config/reservasConfig.js';

const estados = ['Pendiente', 'Confirmada', 'Cancelada', 'Completada'];
const activa = estado => ['Pendiente', 'Confirmada'].includes(estado);
export const hashToken = token => createHash('sha256').update(token).digest('hex');
export function validarFecha(fecha) {
  check(typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha), 'Fecha inválida (YYYY-MM-DD)');
  const date = new Date(`${fecha}T12:00:00Z`);
  check(!Number.isNaN(+date) && date.toISOString().slice(0, 10) === fecha, 'Fecha inválida');
  return fecha;
}
export function validarHora(hora) {
  check(typeof hora === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(hora), 'Hora inválida (HH:MM)');
  return hora;
}
export function validarDatos(datos, { anticipacion = true } = {}) {
  check(datos && typeof datos === 'object' && !Array.isArray(datos), 'Datos de reserva inválidos');
  const text = (value, min, max, nombre) => {
    check(typeof value === 'string', `${nombre} inválido`);
    const result = value.trim();
    check(result.length >= min && result.length <= max, `${nombre} inválido`);
    return result;
  };
  const cliente = text(datos.cliente, 2, 100, 'Cliente');
  const email = text(datos.email, 3, 254, 'Email').toLowerCase();
  check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Email inválido');
  const telefono = text(datos.telefono, 10, 10, 'Teléfono');
  check(/^\d{10}$/.test(telefono), 'El teléfono debe tener 10 dígitos');
  const fecha = validarFecha(datos.fecha), hora = validarHora(datos.hora);
  const comensales = Number(datos.comensales);
  check(Number.isInteger(comensales) && comensales >= 1 && comensales <= 15, 'Comensales: entero entre 1 y 15');
  const comentarios = text(datos.comentarios ?? '', 0, 500, 'Comentarios');
  const horario = validarHorarioAtencion(fecha, hora);
  check(horario.valido, horario.mensaje);
  if (anticipacion) {
    const validacion = validarAnticipacion(fecha, hora);
    check(validacion.valido, validacion.mensaje);
  }
  return { cliente, email, telefono, fecha, hora, comensales, comentarios };
}
const seleccion = `SELECT r.id, r.cliente, r.email, r.telefono, DATE_FORMAT(r.fecha,'%Y-%m-%d') fecha,
  TIME_FORMAT(r.hora,'%H:%i') hora, r.comensales, r.estado, r.comentarios,
  r.token_expiry tokenExpiry, r.confirmed_at confirmedAt, r.cancelled_at cancelledAt,
  r.created_at createdAt, r.updated_at updatedAt,
  m.id mesaId, m.numero numeroMesa, m.capacidad, m.ubicacion, m.estado estadoMesa
  FROM reservas r LEFT JOIN mesas m ON m.id=r.mesa_id`;
const serializar = row => {
  if (!row) return null;
  const { mesaId, capacidad, ubicacion, estadoMesa, ...reserva } = row;
  return { ...reserva, _id: String(row.id), mesa: mesaId ? {
    id: mesaId, _id: String(mesaId), numero: row.numeroMesa, capacidad, ubicacion, estado: estadoMesa
  } : null };
};
const minutos = hora => Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5));
export function seSuperponen(a, b) {
  return Math.abs(minutos(a) - minutos(b)) < CONFIGURACION_RESERVAS.duracionReserva * 60;
}

export function reservaService(pool) {
  const leer = async (db, id) => {
    const [[row]] = await db.execute(`${seleccion} WHERE r.id=?`, [positiveId(id)]);
    check(row, 'Reserva no encontrada', 404);
    return serializar(row);
  };
  // Bloqueo común, en orden fijo: serializa asignaciones y reprogramaciones,
  // incluso cuando no hay reservas previas (no depende de bloquear filas inexistentes).
  const bloquearMesas = db => db.query('SELECT id FROM mesas ORDER BY id FOR UPDATE');
  const asignar = async (db, numero, datos, excluir = 0) => {
    if (numero === null || numero === undefined || numero === '') return null;
    const [[mesa]] = await db.execute('SELECT * FROM mesas WHERE numero=?', [positiveId(numero)]);
    check(mesa, 'La mesa no existe', 404);
    check(mesa.capacidad >= datos.comensales, 'La mesa no tiene suficiente capacidad');
    if (activa(datos.estado ?? 'Pendiente')) {
      const [otras] = await db.execute(`SELECT TIME_FORMAT(hora,'%H:%i') hora FROM reservas
        WHERE mesa_id=? AND fecha=? AND estado IN ('Pendiente','Confirmada') AND id<>? FOR UPDATE`,
        [mesa.id, datos.fecha, excluir]);
      check(!otras.some(r => seSuperponen(r.hora, datos.hora)), 'La mesa ya está reservada en ese período', 409);
    }
    return mesa.id;
  };
  const guardar = async (db, id, datos) => {
    await db.execute(`UPDATE reservas SET mesa_id=?,cliente=?,email=?,telefono=?,fecha=?,hora=?,
      comensales=?,comentarios=?,estado=?,confirmed_at=IF(?='Confirmada',COALESCE(confirmed_at,UTC_TIMESTAMP(3)),confirmed_at),
      cancelled_at=IF(?='Cancelada',UTC_TIMESTAMP(3),cancelled_at) WHERE id=?`,
      [datos.mesaId, datos.cliente, datos.email, datos.telefono, datos.fecha, datos.hora, datos.comensales,
        datos.comentarios, datos.estado, datos.estado, datos.estado, id]);
    return leer(db, id);
  };
  return {
    async crear(datos) {
      const validos = validarDatos(datos);
      const token = randomBytes(32).toString('hex');
      const reserva = await transaction(pool, async db => {
        await bloquearMesas(db);
        const mesaId = await asignar(db, datos.numeroMesa, validos);
        const [result] = await db.execute(`INSERT INTO reservas
          (mesa_id,cliente,email,telefono,fecha,hora,comensales,comentarios,confirmation_token_hash,token_expiry)
          VALUES (?,?,?,?,?,?,?,?,?,?)`, [mesaId, validos.cliente, validos.email, validos.telefono,
          validos.fecha, validos.hora, validos.comensales, validos.comentarios, hashToken(token), new Date(Date.now() + 72*3600000)]);
        return leer(db, result.insertId);
      });
      return { reserva, token };
    },
    async listar({ estado, fecha, email, soloActivas = false, page = 1, limit = 50 } = {}) {
      page = Number(page); limit = Number(limit);
      check(Number.isSafeInteger(page) && page > 0 && Number.isSafeInteger(limit) && limit > 0 && limit <= 500, 'Paginación inválida');
      check(Number.isSafeInteger((page-1)*limit), 'Paginación inválida');
      const filtros = [], valores = [];
      if (estado) { check(estados.includes(estado), 'Estado inválido'); filtros.push('r.estado=?'); valores.push(estado); }
      if (fecha) { filtros.push('r.fecha=?'); valores.push(validarFecha(fecha)); }
      if (email) { filtros.push('r.email=?'); valores.push(String(email).trim().toLowerCase()); }
      if (soloActivas) filtros.push("r.estado IN ('Pendiente','Confirmada')");
      const where = filtros.length ? ` WHERE ${filtros.join(' AND ')}` : '';
      return transaction(pool, async db => {
        const [[{ total }]] = await db.execute(`SELECT COUNT(*) total FROM reservas r${where}`, valores);
        const [rows] = await db.query(`${seleccion}${where} ORDER BY r.fecha,r.hora,r.id LIMIT ? OFFSET ?`, [...valores, limit, (page-1)*limit]);
        return { success: true, total, page, totalPages: Math.ceil(total/limit), reservas: rows.map(serializar) };
      });
    },
    obtener: id => transaction(pool, db => leer(db, id)),
    async actualizar(id, datos) {
      id = positiveId(id);
      return transaction(pool, async db => {
        await bloquearMesas(db);
        const [[row]] = await db.execute('SELECT id FROM reservas WHERE id=? FOR UPDATE', [id]);
        check(row, 'Reserva no encontrada', 404);
        const anterior = await leer(db, id);
        check(activa(anterior.estado), 'No se puede modificar una reserva finalizada');
        const combinado = { ...anterior, ...datos };
        const cambiaFecha = combinado.fecha !== anterior.fecha || combinado.hora !== anterior.hora;
        const validos = validarDatos(combinado, { anticipacion: cambiaFecha });
        const estado = datos.estado ?? anterior.estado;
        check(estados.includes(estado), 'Estado inválido');
        const numero = datos.numeroMesa === undefined ? anterior.numeroMesa : datos.numeroMesa;
        const mesaId = await asignar(db, numero, { ...validos, estado }, id);
        const reserva = await guardar(db, id, { ...validos, estado, mesaId });
        // El token original solo existe en el correo. Rotarlo para un nuevo enlace.
        let token = null;
        if (activa(estado) && (numero !== anterior.numeroMesa || cambiaFecha || validos.email !== anterior.email)) {
          token = randomBytes(32).toString('hex');
          await db.execute('UPDATE reservas SET confirmation_token_hash=?,token_expiry=? WHERE id=?',
            [hashToken(token), new Date(Date.now()+72*3600000), id]);
        }
        return { reserva: await leer(db, reserva.id), token };
      });
    },
    async cambiarEstado(id, estado) {
      return transaction(pool, async db => {
        await bloquearMesas(db);
        const [[row]] = await db.execute('SELECT id FROM reservas WHERE id=? FOR UPDATE', [positiveId(id)]);
        check(row, 'Reserva no encontrada', 404);
        const anterior = await leer(db, id);
        check(activa(anterior.estado), 'La reserva ya está finalizada');
        check(['Confirmada', 'Completada', 'Cancelada'].includes(estado), 'Estado inválido');
        check(estado !== anterior.estado, 'La reserva ya está confirmada');
        const mesaId = await asignar(db, anterior.numeroMesa, { ...anterior, estado }, Number(id));
        return guardar(db, id, { ...anterior, estado, mesaId });
      });
    },
    async porToken(token, estado) {
      check(typeof token === 'string' && /^[a-f0-9]{64}$/i.test(token), 'Enlace inválido', 404);
      check(['Confirmada','Cancelada'].includes(estado), 'Estado inválido');
      return transaction(pool, async db => {
        await bloquearMesas(db);
        const [[row]] = await db.execute('SELECT id,token_expiry FROM reservas WHERE confirmation_token_hash=? FOR UPDATE', [hashToken(token)]);
        check(row, 'Reserva no encontrada', 404);
        check(row.token_expiry && +new Date(row.token_expiry) > Date.now(), 'El enlace ha expirado', 410);
        const anterior = await leer(db, row.id);
        if (anterior.estado === estado) return { reserva: anterior, modificada: false };
        check(activa(anterior.estado), 'La reserva ya está finalizada');
        const mesaId = await asignar(db, anterior.numeroMesa, { ...anterior, estado }, row.id);
        return { reserva: await guardar(db, row.id, { ...anterior, estado, mesaId }), modificada: true };
      });
    },
    async disponibilidad(fecha, hora, comensales = 1) {
      validarFecha(fecha); validarHora(hora);
      comensales = Number(comensales);
      check(Number.isInteger(comensales) && comensales >= 1 && comensales <= 15, 'Comensales inválidos');
      const validacion = validarHorarioAtencion(fecha, hora);
      check(validacion.valido, validacion.mensaje);
      return transaction(pool, async db => {
        const [mesas] = await db.query('SELECT id,numero,capacidad,ubicacion FROM mesas ORDER BY numero');
        const [reservas] = await db.execute(`SELECT mesa_id,TIME_FORMAT(hora,'%H:%i') hora FROM reservas
          WHERE fecha=? AND mesa_id IS NOT NULL AND estado IN ('Pendiente','Confirmada')`, [fecha]);
        const ocupadas = new Set(reservas.filter(r => seSuperponen(r.hora, hora)).map(r => r.mesa_id));
        const disponibles = mesas.filter(m => !ocupadas.has(m.id) && m.capacidad >= comensales);
        return { disponible: disponibles.length > 0, mensaje: disponibles.length ? `Hay ${disponibles.length} mesa(s) disponible(s)` : 'No hay mesas disponibles para esa fecha y hora',
          mesasDisponibles: disponibles.map(({ numero, capacidad, ubicacion }) => ({ numero, capacidad, ubicacion })),
          totalMesas: mesas.length, mesasOcupadas: ocupadas.size };
      });
    }
  };
}
