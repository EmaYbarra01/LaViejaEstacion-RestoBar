import { getMySQLConnection } from '../database/mysql/pool.js';

const ESTADOS = ['Libre', 'Ocupada', 'Reservada'];
const ABIERTOS = "activo = TRUE AND estado NOT IN ('Cobrado','Cancelado')";
function errorPeticion(mensaje, status = 400) {
  return Object.assign(new Error(mensaje), { status });
}
function entero(valor, nombre) {
  const numero = Number(valor);
  if (!Number.isSafeInteger(numero) || numero < 1 || numero > 4294967295) {
    throw errorPeticion(`${nombre} debe ser un entero positivo`);
  }
  return numero;
}
function texto(valor, nombre, maximo, defecto = '') {
  if (valor == null) return defecto;
  if (typeof valor !== 'string' || valor.length > maximo) throw errorPeticion(`${nombre}: valor inválido`);
  return valor.trim();
}
function estadoValido(estado) {
  if (!ESTADOS.includes(estado)) throw errorPeticion('Estado inválido: use Libre, Ocupada o Reservada');
  return estado;
}
function datosMesa(m) {
  return {
    _id: String(m.id), id: String(m.id), numero: m.numero,
    capacidad: m.capacidad, estado: m.estado, ubicacion: m.ubicacion,
    codigoQR: m.codigo_qr, createdAt: m.created_at, updatedAt: m.updated_at,
  };
}
async function buscar(c, id, bloquear = false) {
  const [rows] = await c.execute(`SELECT * FROM mesas WHERE id = ?${bloquear ? ' FOR UPDATE' : ''}`, [id]);
  if (!rows.length) throw errorPeticion('Mesa no encontrada', 404);
  return rows[0];
}
async function autorizar(req, c, roles = ['SuperAdministrador', 'Gerente']) {
  const valor = req.user?.id ?? req.id;
  if (valor == null) throw errorPeticion('Usuario no autenticado', 401);
  const [rows] = await c.execute(
    `SELECT r.nombre rol FROM usuarios u JOIN roles r ON r.id=u.rol_id
     WHERE u.id=? AND u.activo=TRUE`, [entero(valor, 'Usuario')]
  );
  if (!rows.length) throw errorPeticion('Sesión no válida', 401);
  if (!roles.includes(rows[0].rol)) throw errorPeticion('No tiene permiso para esta operación', 403);
}
function manejar(operacion) {
  return async (req, res) => {
    let c, transaccion = false;
    try {
      c = await getMySQLConnection();
      // Las consultas de mesa, pedidos y cuenta comparten una misma transacción.
      await c.beginTransaction(); transaccion = true;
      const resultado = await operacion(req, c);
      await c.commit(); transaccion = false;
      if (resultado.notificar) {
        try {
          const m = resultado.notificar;
          req.app?.get('io')?.to('mozos').emit('mesa-actualizada', {
            mesaId: m._id, numeroMesa: m.numero, estado: m.estado, mesa: m,
          });
        } catch (error) { console.error('Notificación de mesa:', error.message); }
      }
      return res.status(resultado.status || 200).json(resultado.body);
    } catch (error) {
      if (transaccion) await c.rollback();
      if (error.status) return res.status(error.status).json({ mensaje: error.message });
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ mensaje: 'Ya existe una mesa con ese número' });
      }
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ mensaje: 'La mesa tiene pedidos o reservas relacionados y debe conservarse para mantener el historial' });
      }
      console.error('Error en mesas MySQL:', error.code || error.message);
      return res.status(500).json({ mensaje: 'Error al procesar la mesa' });
    } finally { c?.release(); }
  };
}
async function listado(c, filtro = {}) {
  const where = [], params = [];
  if (filtro.estado) { where.push('estado=?'); params.push(estadoValido(filtro.estado)); }
  if (filtro.ubicacion) { where.push('ubicacion=?'); params.push(texto(filtro.ubicacion,'Ubicación',150)); }
  const [rows] = await c.execute(
    `SELECT * FROM mesas${where.length ? ' WHERE '+where.join(' AND ') : ''} ORDER BY numero`, params
  );
  return rows.map(datosMesa);
}
async function pedidosActivos(c, mesas) {
  if (!mesas.length) return [];
  const marcas = mesas.map(() => '?').join(',');
  const [rows] = await c.execute(
    `SELECT p.*,u.nombre mozo_nombre,u.apellido mozo_apellido
     FROM pedidos p LEFT JOIN usuarios u ON u.id=p.mozo_id
     WHERE p.mesa_id IN (${marcas}) AND p.${ABIERTOS}
     ORDER BY p.fecha_creacion DESC,p.id DESC`, mesas
  );
  if (!rows.length) return [];
  const ids = rows.map(p => p.id), q = ids.map(() => '?').join(',');
  const [detalles] = await c.execute(
    `SELECT d.*,pr.nombre nombre_actual,pr.precio precio_actual,cat.nombre categoria
     FROM detalle_pedido d JOIN productos pr ON pr.id=d.producto_id
     JOIN categorias cat ON cat.id=pr.categoria_id WHERE d.pedido_id IN (${q})
     ORDER BY d.pedido_id,d.orden`, ids
  );
  const [eventos] = await c.execute(
    `SELECT * FROM historial_estados_pedido WHERE pedido_id IN (${q}) ORDER BY fecha,id`, ids
  );
  return rows.map(p => ({
    _id: String(p.id), id: String(p.id), numeroPedido: p.numero_pedido,
    mesa: String(p.mesa_id), numeroMesa: p.numero_mesa_historico,
    mozo: p.mozo_id===null?null:{ _id: String(p.mozo_id), id: String(p.mozo_id), nombre: p.mozo_nombre, apellido: p.mozo_apellido },
    nombreMozo: p.nombre_mozo_historico, estado: p.estado,
    estadoCocina: p.estado_cocina, estadoCaja: p.estado_caja,
    productos: detalles.filter(d => d.pedido_id === p.id).map(d => ({
      _id: String(d.id),
      producto: { _id: String(d.producto_id), id: String(d.producto_id), nombre: d.nombre_actual, precio: Number(d.precio_actual), categoria: d.categoria },
      nombre: d.nombre_historico, cantidad: Number(d.cantidad), precioUnitario: Number(d.precio_unitario),
      subtotal: Number(d.subtotal), observaciones: d.observaciones,
    })),
    subtotal: Number(p.subtotal), total: Number(p.total),
    descuento: { porcentaje: Number(p.descuento_porcentaje), monto: Number(p.descuento_monto), motivo: p.descuento_motivo },
    metodoPago: p.metodo_pago, pago: { cambio: 0 },
    historialEstados: eventos.filter(e => e.pedido_id === p.id).map(e => ({
      _id: String(e.id), estado: e.estado, fecha: e.fecha, usuario: e.usuario_id===null?null:String(e.usuario_id), observacion: e.observacion,
    })),
    observacionesGenerales: p.observaciones_generales, tiempoEstimado: p.tiempo_estimado,
    fechaCreacion: p.fecha_creacion, fechaListo: p.fecha_listo, fechaServido: p.fecha_servido,
    fechaCobrado: p.fecha_cobrado, activo: Boolean(p.activo),
    createdAt: p.created_at, updatedAt: p.updated_at, cancelado: { activo: false, motivo: '' },
  }));
}
async function comprobarEstado(c, mesaId, estado) {
  // Lectura actual con bloqueo: evita liberar una mesa mientras se crea un pedido.
  const [rows] = await c.execute(`SELECT id FROM pedidos WHERE mesa_id=? AND ${ABIERTOS} FOR UPDATE`, [mesaId]);
  if (rows.length && estado !== 'Ocupada') {
    throw errorPeticion('La mesa tiene pedidos pendientes y debe permanecer Ocupada', 409);
  }
  if (!rows.length && estado === 'Ocupada') {
    throw errorPeticion('El estado Ocupada se establece al registrar un pedido', 409);
  }
  return rows.length;
}
export const obtenerMesas = manejar(async (req, c) => ({ body: await listado(c, req.query || {}) }));
export const obtenerMesasDisponibles = manejar(async (req, c) => ({ body: await listado(c, { estado: 'Libre' }) }));
export const obtenerMesasLibres = obtenerMesasDisponibles;
export const obtenerMesasPorEstado = manejar(async (req, c) => ({ body: await listado(c, { estado: estadoValido(req.params.estado) }) }));
export const obtenerMesasPorUbicacion = manejar(async (req, c) => ({ body: await listado(c, { ubicacion: texto(req.params.ubicacion,'Ubicación',150) }) }));
export const obtenerUnaMesa = manejar(async (req, c) => {
  const id = entero(req.params.id, 'Mesa');
  const mesa = datosMesa(await buscar(c,id));
  return { body: { mesa, pedidosActivos: await pedidosActivos(c,[id]) } };
});
export const obtenerMesasOcupadas = manejar(async (req,c) => {
  const mesas = await listado(c,{estado:'Ocupada'});
  const pedidos = await pedidosActivos(c,mesas.map(m => Number(m.id)));
  return { body: mesas.map(m => ({ ...m, pedidos: pedidos.filter(p => p.mesa === m.id) })) };
});
export const obtenerCuentaMesa = manejar(async (req,c) => {
  const id = entero(req.params.id,'Mesa');
  const mesa = await buscar(c,id);
  const pedidos = await pedidosActivos(c,[id]);
  if (!pedidos.length) throw errorPeticion('No hay pedidos pendientes de pago para esta mesa',404);
  const [[resumen]] = await c.execute(
    `SELECT SUM(subtotal) subtotal,SUM(descuento_monto) descuentos,SUM(total) total,
     COUNT(*) cantidadPedidos FROM pedidos WHERE mesa_id=? AND ${ABIERTOS}`, [id]
  );
  return { body: { mesa: { numero: mesa.numero,ubicacion: mesa.ubicacion },pedidos,resumen } };
});
export const crearMesa = manejar(async (req,c) => {
  await autorizar(req,c);
  const b = req.body || {};
  const numero = entero(b.numero,'Número'), capacidad = entero(b.capacidad,'Capacidad');
  const [r] = await c.execute(
    `INSERT INTO mesas(numero,capacidad,ubicacion,codigo_qr) VALUES(?,?,?,?)`,
    [numero,capacidad,texto(b.ubicacion,'Ubicación',150,'Salón Principal') || 'Salón Principal',texto(b.codigoQR,'Código QR',10000)]
  );
  const mesa = datosMesa(await buscar(c,r.insertId));
  return { status:201,body:{mensaje:'Mesa creada exitosamente',mesa},notificar:mesa };
});
export const actualizarMesa = manejar(async (req,c) => {
  await autorizar(req,c);
  const id = entero(req.params.id,'Mesa'), anterior = await buscar(c,id,true), b = req.body || {};
  const numero = entero(b.numero ?? anterior.numero,'Número');
  const capacidad = entero(b.capacidad ?? anterior.capacidad,'Capacidad');
  const estado = estadoValido(b.estado ?? anterior.estado);
  const pendientes = await comprobarEstado(c,id,estado);
  if (pendientes && numero !== anterior.numero) throw errorPeticion('No se puede renumerar una mesa con pedidos pendientes',409);
  const [reservas] = await c.execute(
    "SELECT comensales FROM reservas WHERE mesa_id=? AND estado IN ('Pendiente','Confirmada') FOR UPDATE", [id]
  );
  if (reservas.some(r => r.comensales > capacidad)) throw errorPeticion('La capacidad no alcanza para una reserva asignada',409);
  await c.execute('UPDATE mesas SET numero=?,capacidad=?,estado=?,ubicacion=?,codigo_qr=? WHERE id=?',[
    numero,capacidad,estado,texto(b.ubicacion ?? anterior.ubicacion,'Ubicación',150),texto(b.codigoQR ?? anterior.codigo_qr,'Código QR',10000),id
  ]);
  const mesa = datosMesa(await buscar(c,id));
  return { body:{mensaje:'Mesa actualizada correctamente',mesa},notificar:mesa };
});
export const cambiarEstadoMesa = manejar(async (req,c) => {
  await autorizar(req,c,['Mozo','SuperAdministrador','Gerente']);
  const id = entero(req.params.id,'Mesa'), estado = estadoValido(req.body?.estado);
  await buscar(c,id,true);
  await comprobarEstado(c,id,estado);
  await c.execute('UPDATE mesas SET estado=? WHERE id=?',[estado,id]);
  const mesa = datosMesa(await buscar(c,id));
  return { body:{mensaje:'Estado actualizado correctamente',mesa},notificar:mesa };
});
export const eliminarMesa = manejar(async (req,c) => {
  await autorizar(req,c);
  const id = entero(req.params.id,'Mesa'), mesa = datosMesa(await buscar(c,id,true));
  const [pendientes] = await c.execute(`SELECT id FROM pedidos WHERE mesa_id=? AND ${ABIERTOS} FOR UPDATE`,[id]);
  if (pendientes.length) throw errorPeticion('No se puede eliminar una mesa con pedidos pendientes',409);
  await c.execute('DELETE FROM mesas WHERE id=?',[id]);
  return { body:{mensaje:'Mesa eliminada correctamente',mesa} };
});
