import { getMySQLConnection } from '../database/mysql/pool.js';

const SELECT_PRODUCTOS = `
  SELECT p.*, c.nombre AS categoria
  FROM productos p INNER JOIN categorias c ON c.id = p.categoria_id`;
const UNIDADES = ['Unidad', 'Kg', 'Litro', 'Gramo', 'Ml', 'Porción'];

function errorPeticion(mensaje, status = 400) {
  return Object.assign(new Error(mensaje), { status });
}
function idValido(valor) {
  const id = Number(valor);
  if (!Number.isSafeInteger(id) || id <= 0) throw errorPeticion('Identificador inválido');
  return id;
}
function texto(valor, nombre, maximo, obligatorio = false) {
  if (valor == null && !obligatorio) return '';
  if (typeof valor !== 'string') throw errorPeticion(`${nombre}: valor inválido`);
  const resultado = valor.trim();
  if ((obligatorio && !resultado) || resultado.length > maximo) {
    throw errorPeticion(`${nombre}: campo vacío o demasiado largo`);
  }
  return resultado;
}
function decimal(valor, nombre, escala, enteros) {
  if (typeof valor !== 'string' && typeof valor !== 'number') {
    throw errorPeticion(`${nombre}: número inválido`);
  }
  const resultado = String(valor).trim();
  const patron = new RegExp(`^\\d{1,${enteros}}(?:\\.\\d{1,${escala}})?$`);
  if (!patron.test(resultado)) {
    throw errorPeticion(`${nombre}: debe ser no negativo y tener hasta ${escala} decimales`);
  }
  return resultado;
}
function booleano(valor, nombre) {
  if (typeof valor !== 'boolean') throw errorPeticion(`${nombre} debe ser verdadero o falso`);
  return valor;
}
function datosPublicos(p) {
  return {
    _id: String(p.id), id: String(p.id), nombre: p.nombre,
    descripcion: p.descripcion, categoria: p.categoria,
    precio: Number(p.precio), costo: Number(p.costo), stock: Number(p.stock),
    stockMinimo: Number(p.stock_minimo), unidadMedida: p.unidad_medida,
    disponible: Boolean(p.disponible), imagenUrl: p.imagen_url,
    codigo: p.codigo, createdAt: p.created_at, updatedAt: p.updated_at,
    margen: Number(p.costo) > 0
      ? ((Number(p.precio) - Number(p.costo)) / Number(p.costo) * 100).toFixed(2) : 0,
    necesitaReposicion: Number(p.stock) <= Number(p.stock_minimo),
  };
}
function datosMenu(p) {
  return {
    _id: String(p.id), id: String(p.id), nombre: p.nombre,
    descripcion: p.descripcion, categoria: p.categoria,
    precio: Number(p.precio), imagenUrl: p.imagen_url,
    disponible: Boolean(p.disponible), stock: Number(p.stock),
  };
}
async function autorizar(req, c) {
  const valor = req.user?.id ?? req.id;
  if (valor == null) throw errorPeticion('Usuario no autenticado', 401);
  const [rows] = await c.execute(
    `SELECT u.id, r.nombre AS rol FROM usuarios u
     JOIN roles r ON r.id = u.rol_id WHERE u.id = ? AND u.activo = TRUE`,
    [idValido(valor)]
  );
  if (!rows.length) throw errorPeticion('Sesión no válida', 401);
  if (!['SuperAdministrador', 'Gerente'].includes(rows[0].rol)) {
    throw errorPeticion('No tiene permiso para modificar productos', 403);
  }
  return rows[0].id;
}
async function buscar(c, id, bloquear = false) {
  const [rows] = await c.execute(
    `${SELECT_PRODUCTOS} WHERE p.id = ?${bloquear ? ' FOR UPDATE' : ''}`, [id]
  );
  if (!rows.length) throw errorPeticion('Producto no encontrado', 404);
  return rows[0];
}
function manejar(operacion, escritura = false) {
  return async (req, res) => {
    let c;
    let transaccion = false;
    try {
      c = await getMySQLConnection();
      if (escritura) { await c.beginTransaction(); transaccion = true; }
      const resultado = await operacion(req, c);
      if (transaccion) { await c.commit(); transaccion = false; }
      if (resultado.notificar) {
        try {
          req.app?.get('io')?.to('mozos').emit('productos-actualizados', {
            productos: [resultado.notificar],
          });
        } catch (error) { console.error('Notificación de producto:', error.message); }
      }
      return res.status(resultado.status || 200).json(resultado.body);
    } catch (error) {
      if (transaccion) await c.rollback();
      if (error.status) return res.status(error.status).json({ mensaje: error.message });
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ mensaje: 'Ya existe un producto con ese código' });
      }
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({
          mensaje: 'El producto tiene historial relacionado. Deshabilitalo desde disponibilidad para conservar ese historial',
        });
      }
      if (['ER_CHECK_CONSTRAINT_VIOLATED', 'ER_WARN_DATA_OUT_OF_RANGE'].includes(error.code)) {
        return res.status(400).json({ mensaje: 'La operación supera los límites permitidos de stock o importe' });
      }
      console.error('Error en productos MySQL:', error.code || error.message);
      return res.status(500).json({ mensaje: 'Error al procesar el producto' });
    } finally { c?.release(); }
  };
}
async function preparar(body, c, anterior) {
  body ||= {};
  const d = {
    nombre: texto(body.nombre ?? anterior?.nombre, 'Nombre', 100, true),
    descripcion: texto(body.descripcion ?? anterior?.descripcion, 'Descripción', 500),
    precio: decimal(body.precio ?? anterior?.precio, 'Precio', 2, 10),
    costo: decimal(body.costo ?? anterior?.costo ?? 0, 'Costo', 2, 10),
    stock: decimal(body.stock ?? anterior?.stock ?? 0, 'Stock', 3, 9),
    stockMinimo: decimal(body.stockMinimo ?? anterior?.stock_minimo ?? 0, 'Stock mínimo', 3, 9),
    unidad: body.unidadMedida ?? anterior?.unidad_medida ?? 'Unidad',
    disponible: Number(body.stock ?? anterior?.stock ?? 0) > 0
      && booleano(body.disponible ?? Boolean(anterior?.disponible ?? true), 'Disponible'),
    imagen: texto(body.imagenUrl ?? anterior?.imagen_url ?? '/images/productos/default.jpg', 'Imagen', 500),
    codigo: body.codigo === undefined ? (anterior?.codigo ?? null)
      : (texto(body.codigo, 'Código', 100) || null),
  };
  if (d.nombre.length < 3) throw errorPeticion('El nombre debe tener al menos 3 caracteres');
  if (!UNIDADES.includes(d.unidad)) throw errorPeticion('Unidad de medida inválida');
  const categoria = texto(body.categoria ?? anterior?.categoria, 'Categoría', 80, true);
  const [categorias] = await c.execute(
    'SELECT id FROM categorias WHERE nombre = ? AND activo = TRUE', [categoria]
  );
  if (!categorias.length) throw errorPeticion('Categoría inexistente o inactiva');
  d.categoriaId = categorias[0].id;
  return d;
}

export const obtenerProductos = manejar(async (req, c) => {
  const query = req.query || {};
  const where = [], params = [];
  if (query.categoria) { where.push('c.nombre = ?'); params.push(texto(query.categoria, 'Categoría', 80, true)); }
  if (query.disponible !== undefined) {
    if (!['true', 'false'].includes(query.disponible)) throw errorPeticion('Filtro disponible inválido');
    where.push('p.disponible = ?'); params.push(query.disponible === 'true');
  }
  if (query.necesitaReposicion === 'true') where.push('p.stock <= p.stock_minimo');
  const [rows] = await c.execute(
    `${SELECT_PRODUCTOS}${where.length ? ' WHERE ' + where.join(' AND ') : ''} ORDER BY p.nombre`, params
  );
  return { body: rows.map(datosPublicos) };
});
export const obtenerUnProducto = manejar(async (req, c) => ({
  body: datosPublicos(await buscar(c, idValido(req.params.id))),
}));
export const obtenerProductosPorCategoria = manejar(async (req, c) => {
  const [rows] = await c.execute(
    `${SELECT_PRODUCTOS} WHERE c.nombre = ? AND p.disponible = TRUE ORDER BY p.nombre`,
    [texto(req.params.categoria, 'Categoría', 80, true)]
  );
  return { body: rows.map(datosMenu) };
});
export const obtenerProductosParaReposicion = manejar(async (req, c) => {
  await autorizar(req, c);
  const [rows] = await c.query(`${SELECT_PRODUCTOS} WHERE p.stock <= p.stock_minimo ORDER BY p.stock, p.nombre`);
  return { body: rows.map(datosPublicos) };
});
export const obtenerMenuPublico = manejar(async (req, c) => {
  // Se incluyen productos no disponibles para que el menú muestre sus etiquetas.
  const [rows] = await c.query(`${SELECT_PRODUCTOS} ORDER BY c.nombre, p.nombre`);
  return { body: rows.map(datosMenu) };
});
export const crearProducto = manejar(async (req, c) => {
  const usuario = await autorizar(req, c);
  const d = await preparar(req.body, c);
  const [r] = await c.execute(
    `INSERT INTO productos (categoria_id,nombre,descripcion,precio,costo,stock,
     stock_minimo,unidad_medida,disponible,imagen_url,codigo)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [d.categoriaId,d.nombre,d.descripcion,d.precio,d.costo,d.stock,
     d.stockMinimo,d.unidad,d.disponible,d.imagen,d.codigo]
  );
  if (Number(d.stock) > 0) await c.execute(
    `INSERT INTO movimientos_stock(producto_id,cantidad,motivo,registrado_por_id)
     VALUES (?,?,'Stock inicial al crear producto',?)`, [r.insertId,d.stock,usuario]
  );
  const producto = datosPublicos(await buscar(c, r.insertId));
  return { status: 201, body: { mensaje: 'Producto creado exitosamente', producto }, notificar: producto };
}, true);
export const actualizarProducto = manejar(async (req, c) => {
  const usuario = await autorizar(req, c);
  const id = idValido(req.params.id);
  const anterior = await buscar(c, id, true);
  const d = await preparar(req.body, c, anterior);
  // La diferencia de stock se calcula con DECIMAL en MySQL y se guarda atómicamente.
  await c.execute(
    `INSERT INTO movimientos_stock(producto_id,cantidad,motivo,registrado_por_id)
     SELECT id,CAST(? AS DECIMAL(12,3))-stock,'Ajuste desde edición de producto',?
     FROM productos WHERE id=? AND stock<>CAST(? AS DECIMAL(12,3))`,
    [d.stock,usuario,id,d.stock]
  );
  await c.execute(
    `UPDATE productos SET categoria_id=?,nombre=?,descripcion=?,precio=?,costo=?,
     stock=?,stock_minimo=?,unidad_medida=?,disponible=?,imagen_url=?,codigo=? WHERE id=?`,
    [d.categoriaId,d.nombre,d.descripcion,d.precio,d.costo,d.stock,
     d.stockMinimo,d.unidad,d.disponible,d.imagen,d.codigo,id]
  );
  const producto = datosPublicos(await buscar(c, id));
  return { body: { mensaje: 'Producto actualizado correctamente', producto }, notificar: producto };
}, true);
export const eliminarProducto = manejar(async (req, c) => {
  await autorizar(req, c);
  const id = idValido(req.params.id);
  const producto = datosPublicos(await buscar(c, id, true));
  await c.execute('DELETE FROM productos WHERE id=?', [id]);
  return { body: { mensaje: 'Producto eliminado correctamente', producto }, notificar: { ...producto, disponible: false } };
}, true);
export const actualizarStock = manejar(async (req, c) => {
  const usuario = await autorizar(req, c);
  const id = idValido(req.params.id);
  await buscar(c, id, true);
  const cantidad = decimal(req.body?.cantidad, 'Cantidad', 3, 9);
  if (Number(cantidad) <= 0) throw errorPeticion('La cantidad debe ser mayor que cero');
  const operacion = req.body?.operacion;
  if (!['sumar', 'restar'].includes(operacion)) throw errorPeticion("Operación inválida. Use 'sumar' o 'restar'");
  if (operacion === 'restar') {
    const [[r]] = await c.execute('SELECT stock >= CAST(? AS DECIMAL(12,3)) suficiente FROM productos WHERE id=?', [cantidad,id]);
    if (!r.suficiente) throw errorPeticion('Stock insuficiente');
  }
  const cambio = operacion === 'restar' ? '-' + cantidad : cantidad;
  await c.execute(
    `UPDATE productos SET disponible=(stock+CAST(? AS DECIMAL(12,3)) > 0),
     stock=stock+CAST(? AS DECIMAL(12,3)) WHERE id=?`,
    [cambio,cambio,id]
  );
  await c.execute(
    `INSERT INTO movimientos_stock(producto_id,cantidad,motivo,registrado_por_id)
     VALUES (?,?,'Ajuste manual de stock',?)`, [id,cambio,usuario]
  );
  const producto = datosPublicos(await buscar(c, id));
  return { body: { mensaje: 'Stock actualizado correctamente', producto }, notificar: producto };
}, true);
export const cambiarDisponibilidad = manejar(async (req, c) => {
  await autorizar(req, c);
  const id = idValido(req.params.id);
  const disponible = booleano(req.body?.disponible, 'Disponible');
  await buscar(c, id, true);
  await c.execute('UPDATE productos SET disponible=? WHERE id=?', [disponible,id]);
  const producto = datosPublicos(await buscar(c, id));
  return { body: { mensaje: `Producto ${disponible ? 'habilitado' : 'deshabilitado'} correctamente`, producto }, notificar: producto };
}, true);
