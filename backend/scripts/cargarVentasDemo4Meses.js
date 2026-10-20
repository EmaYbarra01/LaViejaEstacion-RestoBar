import mongoose from 'mongoose';
import 'dotenv/config';

import Pedido from '../src/models/pedidoSchema.js';
import Producto from '../src/models/productoSchema.js';
import Usuario from '../src/models/usuarioSchema.js';
import Mesa from '../src/models/mesaSchema.js';

const MONGODB_URI = process.env.MONGODB_URI;
const TAG_SEED = `SEED_VENTAS_DIVERSAS_${new Date().getFullYear()}`;
const TAG_SEED_ANTERIOR = 'SEED_DASHBOARD_4M_2026_08';

if (!MONGODB_URI) {
  throw new Error('Falta MONGODB_URI en backend/.env');
}

function toStartOfDay(date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d;
}

function buildNumeroPedido(idx) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `SEED-${y}${m}${d}-${String(idx + 1).padStart(4, '0')}`;
}

function buildFechasVenta() {
  const now = new Date();
  const inicio = new Date(now.getFullYear(), 7, 1, 12, 0, 0, 0);
  const fechas = [];

  for (let fecha = inicio; fecha <= now; fecha.setDate(fecha.getDate() + 4)) {
    fechas.push(new Date(fecha));
  }

  const hoy = toStartOfDay(now);
  if (!fechas.some((fecha) => fecha.toDateString() === hoy.toDateString())) {
    fechas.push(hoy);
  }

  return fechas;
}

function pickFromCategory(category, productosByCategoria, fallbackProductos) {
  const list = productosByCategoria.get(category) || [];
  if (list.length > 0) return list[Math.floor(Math.random() * list.length)];
  return fallbackProductos[Math.floor(Math.random() * fallbackProductos.length)];
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Conectado a MongoDB');

  const [mozos, cajeros, mesas, productos] = await Promise.all([
    Usuario.find({ rol: 'Mozo', activo: true }).sort({ _id: 1 }),
    Usuario.find({ rol: 'Cajero', activo: true }).sort({ _id: 1 }),
    Mesa.find({}).sort({ numero: 1 }),
    Producto.find({ disponible: true, activo: { $ne: false } }).lean()
  ]);

  if (!mozos.length) throw new Error('No se encontraron usuarios con rol Mozo');
  if (!cajeros.length) throw new Error('No se encontraron usuarios con rol Cajero');
  if (!mesas.length) throw new Error('No se encontraron mesas');
  if (!productos.length) throw new Error('No se encontraron productos disponibles');

  const productosByCategoria = new Map();
  for (const p of productos) {
    const cat = p.categoria || 'Otro';
    if (!productosByCategoria.has(cat)) productosByCategoria.set(cat, []);
    productosByCategoria.get(cat).push(p);
  }

  const categorias = [...productosByCategoria.keys()];
  const fechas = buildFechasVenta();
  const cleanup = await Pedido.deleteMany({
    observacionesGenerales: { $in: [TAG_SEED, TAG_SEED_ANTERIOR] }
  });
  console.log(`Pedidos seed previos eliminados: ${cleanup.deletedCount}`);

  let totalGeneral = 0;
  const docs = [];

  for (let i = 0; i < fechas.length; i++) {
    const fecha = fechas[i];
    const metodoPago = i % 3 === 0 ? 'Efectivo' : 'Transferencia';
    const cantidadProductos = 2 + (i % 3);
    const categoriasVenta = Array.from({ length: cantidadProductos }, (_, offset) => (
      categorias[(i + offset * 2) % categorias.length]
    ));
    const mozo = mozos[i % mozos.length];
    const cajero = cajeros[i % cajeros.length];
    const mesa = mesas[i % mesas.length];
    const productosPedido = categoriasVenta.map((categoria, offset) => {
      const prod = pickFromCategory(categoria, productosByCategoria, productos);
      const cantidad = 1 + ((i + offset) % 3);
      const precioUnitario = Number(prod.precio) || 0;

      return {
        producto: prod._id,
        nombre: prod.nombre,
        cantidad,
        precioUnitario,
        subtotal: cantidad * precioUnitario,
        observaciones: i % 4 === 0 ? 'Pedido demo para analisis de ventas' : ''
      };
    });

    const subtotal = productosPedido.reduce((acc, p) => acc + p.subtotal, 0);
    const tieneDescuento = metodoPago === 'Efectivo';
    const descuentoMonto = tieneDescuento ? subtotal * 0.1 : 0;

    const pedido = new Pedido({
      numeroPedido: buildNumeroPedido(i),
      mesa: mesa._id,
      numeroMesa: mesa.numero,
      mozo: mozo._id,
      nombreMozo: `${mozo.nombre} ${mozo.apellido}`.trim(),
      estado: 'Cobrado',
      estadoCocina: 'Listo',
      estadoCaja: 'Cobrado',
      productos: productosPedido,
      subtotal,
      descuento: {
        porcentaje: tieneDescuento ? 10 : 0,
        monto: descuentoMonto,
        motivo: tieneDescuento ? 'Descuento por pago en efectivo' : ''
      },
      total: subtotal - descuentoMonto,
      metodoPago,
      pago: {
        fecha,
        cajero: cajero._id,
        montoPagado: subtotal - descuentoMonto,
        cambio: 0
      },
      historialEstados: [
        { estado: 'Pendiente', fecha, usuario: mozo._id, observacion: 'Pedido creado' },
        { estado: 'Cobrado', fecha, usuario: cajero._id, observacion: `Cobrado por ${metodoPago}` }
      ],
      observacionesGenerales: TAG_SEED,
      fechaCreacion: fecha,
      fechaListo: fecha,
      fechaServido: fecha,
      fechaCobrado: fecha,
      createdAt: fecha,
      updatedAt: fecha,
      activo: true
    });

    docs.push(pedido);
    totalGeneral += pedido.total;
  }

  await Pedido.insertMany(docs);

  console.log(`Ventas creadas: ${docs.length}`);
  console.log(`Total facturado seed: ${totalGeneral.toFixed(2)}`);

  const resumenMetodo = await Pedido.aggregate([
    { $match: { observacionesGenerales: TAG_SEED } },
    { $group: { _id: '$metodoPago', cantidad: { $sum: 1 }, total: { $sum: '$total' } } },
    { $sort: { _id: 1 } }
  ]);

  const resumenMes = await Pedido.aggregate([
    { $match: { observacionesGenerales: TAG_SEED } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        cantidad: { $sum: 1 },
        total: { $sum: '$total' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  console.log('Resumen por metodo de pago:', JSON.stringify(resumenMetodo, null, 2));
  console.log('Resumen por mes:', JSON.stringify(resumenMes, null, 2));

  await mongoose.disconnect();
  console.log('Proceso finalizado');
}

main().catch(async (error) => {
  console.error('Error al cargar ventas demo:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
