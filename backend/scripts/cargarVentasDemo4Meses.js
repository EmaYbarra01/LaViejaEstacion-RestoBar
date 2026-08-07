import mongoose from 'mongoose';
import 'dotenv/config';

import Pedido from '../src/models/pedidoSchema.js';
import Producto from '../src/models/productoSchema.js';
import Usuario from '../src/models/usuarioSchema.js';
import Mesa from '../src/models/mesaSchema.js';

const MONGODB_URI = process.env.MONGODB_URI;
const TAG_SEED = 'SEED_DASHBOARD_4M_2026_08';

if (!MONGODB_URI) {
  throw new Error('Falta MONGODB_URI en backend/.env');
}

function toStartOfDay(date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d;
}

function monthsAgoDate(monthsAgo, day) {
  const now = new Date();
  return toStartOfDay(new Date(now.getFullYear(), now.getMonth() - monthsAgo, day));
}

function buildNumeroPedido(idx) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `SEED-${y}${m}${d}-${String(idx + 1).padStart(4, '0')}`;
}

function pickFromCategory(category, productosByCategoria, fallbackProductos) {
  const list = productosByCategoria.get(category) || [];
  if (list.length > 0) return list[Math.floor(Math.random() * list.length)];
  return fallbackProductos[Math.floor(Math.random() * fallbackProductos.length)];
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Conectado a MongoDB');

  const [mozo, cajero, mesa, productos] = await Promise.all([
    Usuario.findOne({ rol: 'Mozo', activo: true }),
    Usuario.findOne({ rol: 'Cajero', activo: true }),
    Mesa.findOne({}),
    Producto.find({ disponible: true, activo: { $ne: false } }).lean()
  ]);

  if (!mozo) throw new Error('No se encontro un usuario con rol Mozo');
  if (!cajero) throw new Error('No se encontro un usuario con rol Cajero');
  if (!mesa) throw new Error('No se encontro al menos una mesa');
  if (!productos.length) throw new Error('No se encontraron productos disponibles');

  const productosByCategoria = new Map();
  for (const p of productos) {
    const cat = p.categoria || 'Otro';
    if (!productosByCategoria.has(cat)) productosByCategoria.set(cat, []);
    productosByCategoria.get(cat).push(p);
  }

  const plantillaVentas = [
    { monthsAgo: 3, day: 8, metodoPago: 'Efectivo', categorias: ['Comidas', 'Bebidas'] },
    { monthsAgo: 3, day: 21, metodoPago: 'Transferencia', categorias: ['Entradas', 'Bebidas'] },
    { monthsAgo: 2, day: 6, metodoPago: 'Efectivo', categorias: ['Comidas', 'Guarniciones', 'Bebidas Alcohólicas'] },
    { monthsAgo: 2, day: 19, metodoPago: 'Transferencia', categorias: ['Postres', 'Bebidas'] },
    { monthsAgo: 1, day: 11, metodoPago: 'Efectivo', categorias: ['Comidas', 'Postres'] },
    { monthsAgo: 1, day: 25, metodoPago: 'Transferencia', categorias: ['Entradas', 'Comidas', 'Bebidas Alcohólicas'] },
    { monthsAgo: 0, day: 3, metodoPago: 'Efectivo', categorias: ['Comidas', 'Bebidas', 'Postres'] }
  ];

  // Evita duplicar si ejecutas el script mas de una vez.
  const cleanup = await Pedido.deleteMany({ observacionesGenerales: TAG_SEED });
  console.log(`Pedidos seed previos eliminados: ${cleanup.deletedCount}`);

  let totalGeneral = 0;
  const docs = [];

  for (let i = 0; i < plantillaVentas.length; i++) {
    const venta = plantillaVentas[i];
    const fecha = monthsAgoDate(venta.monthsAgo, venta.day);

    const productosPedido = venta.categorias.map((categoria) => {
      const prod = pickFromCategory(categoria, productosByCategoria, productos);
      const cantidad = 1 + Math.floor(Math.random() * 2); // 1 o 2 unidades
      const precioUnitario = Number(prod.precio) || 0;

      return {
        producto: prod._id,
        nombre: prod.nombre,
        cantidad,
        precioUnitario,
        subtotal: cantidad * precioUnitario,
        observaciones: ''
      };
    });

    const subtotal = productosPedido.reduce((acc, p) => acc + p.subtotal, 0);
    const tieneDescuento = venta.metodoPago === 'Efectivo';
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
      metodoPago: venta.metodoPago,
      pago: {
        fecha,
        cajero: cajero._id,
        montoPagado: subtotal - descuentoMonto,
        cambio: 0
      },
      historialEstados: [
        { estado: 'Pendiente', fecha, usuario: mozo._id, observacion: 'Pedido creado' },
        { estado: 'Cobrado', fecha, usuario: cajero._id, observacion: `Cobrado por ${venta.metodoPago}` }
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
