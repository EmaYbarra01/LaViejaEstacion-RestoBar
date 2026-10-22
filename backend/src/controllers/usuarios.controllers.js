import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { getMySQLConnection } from '../database/mysql/pool.js';

export {
  loginMysql as login,
  getMeMysql as getMe,
} from './authMysql.controllers.js';

const SELECT_USUARIOS = `
  SELECT u.id, u.nombre, u.apellido, u.email, u.dni,
         u.telefono, u.direccion, u.activo, u.fecha_ingreso,
         u.ultimo_acceso, u.created_at, u.updated_at,
         r.nombre AS rol
  FROM usuarios u
  INNER JOIN roles r ON r.id = u.rol_id`;

function errorPeticion(mensaje, status = 400) {
  return Object.assign(new Error(mensaje), { status });
}

function idValido(valor) {
  const id = Number(valor);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw errorPeticion('Identificador de usuario inválido');
  }
  return id;
}

function datosPublicos(u) {
  return {
    _id: String(u.id),
    id: String(u.id),
    nombre: u.nombre,
    apellido: u.apellido,
    nombreCompleto: `${u.nombre} ${u.apellido}`,
    email: u.email,
    dni: u.dni,
    rol: u.rol,
    telefono: u.telefono,
    direccion: u.direccion,
    activo: Boolean(u.activo),
    fechaIngreso: u.fecha_ingreso,
    ultimoAcceso: u.ultimo_acceso,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  };
}

function manejar(operacion) {
  return async (req, res) => {
    let connection;
    try {
      connection = await getMySQLConnection();
      return await operacion(req, res, connection);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          mensaje: 'El correo electrónico o el DNI ya está registrado',
        });
      }
      if (error.status) {
        return res.status(error.status).json({ mensaje: error.message });
      }
      console.error('Error en usuarios MySQL:', error.code || error.message);
      return res.status(500).json({ mensaje: 'Error al procesar el usuario' });
    } finally {
      connection?.release();
    }
  };
}

async function autorizar(req, connection, roles) {
  const valor = req.user?.id ?? req.id;
  if (valor == null) throw errorPeticion('Usuario no autenticado', 401);
  const id = idValido(valor);
  const [rows] = await connection.execute(
    `SELECT r.nombre AS rol
     FROM usuarios u INNER JOIN roles r ON r.id = u.rol_id
     WHERE u.id = ? AND u.activo = TRUE`,
    [id]
  );
  if (!rows.length) throw errorPeticion('Sesión no válida', 401);
  if (roles && !roles.includes(rows[0].rol)) {
    throw errorPeticion('No tiene permiso para esta operación', 403);
  }
}

function texto(valor, nombre, maximo, obligatorio = true) {
  if (valor == null && !obligatorio) return '';
  if (typeof valor !== 'string') {
    throw errorPeticion(`${nombre}: valor inválido`);
  }
  const resultado = valor.trim();
  if ((obligatorio && !resultado) || resultado.length > maximo) {
    throw errorPeticion(`${nombre}: campo vacío o demasiado largo`);
  }
  return resultado;
}

function validarPassword(password) {
  if (typeof password !== 'string' || password.length < 6 ||
      Buffer.byteLength(password, 'utf8') > 72) {
    throw errorPeticion('La contraseña debe tener al menos 6 caracteres y no superar 72 bytes');
  }
}

async function prepararDatos(req, connection, creacion) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw errorPeticion(errors.array()[0].msg);
  }
  const body = req.body || {};
  const datos = {
    nombre: texto(body.nombre, 'Nombre', 100),
    apellido: texto(body.apellido, 'Apellido', 100),
    email: texto(body.email, 'Email', 254).toLowerCase(),
    dni: texto(body.dni, 'DNI', 20),
    telefono: texto(body.telefono, 'Teléfono', 40, false),
    direccion: texto(body.direccion, 'Dirección', 255, false),
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
    throw errorPeticion('Email inválido');
  }
  const rol = texto(body.rol || (creacion ? 'Mozo' : ''), 'Rol', 40);
  const [roles] = await connection.execute(
    'SELECT id FROM roles WHERE nombre = ? LIMIT 1', [rol]
  );
  if (!roles.length) throw errorPeticion('El rol seleccionado no existe');
  datos.rolId = roles[0].id;
  if (body.activo !== undefined && typeof body.activo !== 'boolean') {
    throw errorPeticion('Activo debe ser verdadero o falso');
  }
  datos.activo = body.activo;
  if (creacion || (body.password != null && body.password !== '')) {
    validarPassword(body.password);
    datos.hash = await bcrypt.hash(body.password, 10);
  }
  if (body.fechaIngreso != null && body.fechaIngreso !== '') {
    const fecha = new Date(body.fechaIngreso);
    if (Number.isNaN(fecha.getTime())) throw errorPeticion('Fecha de ingreso inválida');
    datos.fechaIngreso = fecha;
  }
  return datos;
}

async function buscar(connection, id) {
  const [rows] = await connection.execute(`${SELECT_USUARIOS} WHERE u.id = ?`, [id]);
  if (!rows.length) throw errorPeticion('Usuario no encontrado', 404);
  return datosPublicos(rows[0]);
}

export const obtenerUsuarios = manejar(async (req, res, connection) => {
  await autorizar(req, connection, ['SuperAdministrador', 'Gerente']);
  const [rows] = await connection.query(`${SELECT_USUARIOS} ORDER BY u.created_at DESC, u.id DESC`);
  return res.status(200).json(rows.map(datosPublicos));
});

export const obtenerUnUsuario = manejar(async (req, res, connection) => {
  await autorizar(req, connection);
  const usuario = await buscar(connection, idValido(req.params.id));
  return res.status(200).json(usuario);
});

export const obtenerUsuariosPorRol = manejar(async (req, res, connection) => {
  await autorizar(req, connection, ['SuperAdministrador', 'Gerente']);
  const rol = texto(req.params.rol, 'Rol', 40);
  const [rows] = await connection.execute(
    `${SELECT_USUARIOS} WHERE r.nombre = ? AND u.activo = TRUE ORDER BY u.nombre, u.apellido`,
    [rol]
  );
  return res.status(200).json(rows.map(datosPublicos));
});

export const crearUsuario = manejar(async (req, res, connection) => {
  // Las cuentas del personal se crean desde administración autenticada.
  await autorizar(req, connection, ['SuperAdministrador', 'Gerente']);
  const d = await prepararDatos(req, connection, true);
  const [resultado] = await connection.execute(
    `INSERT INTO usuarios
      (rol_id, nombre, apellido, email, password_hash, dni, telefono,
       direccion, activo, fecha_ingreso)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [d.rolId, d.nombre, d.apellido, d.email, d.hash, d.dni,
     d.telefono, d.direccion, d.activo ?? true, d.fechaIngreso ?? new Date()]
  );
  const usuario = await buscar(connection, resultado.insertId);
  return res.status(201).json({ mensaje: 'Usuario creado exitosamente', usuario });
});

export const actualizarUsuario = manejar(async (req, res, connection) => {
  await autorizar(req, connection, ['SuperAdministrador', 'Gerente']);
  const id = idValido(req.params.id);
  await buscar(connection, id);
  const d = await prepararDatos(req, connection, false);
  await connection.execute(
    `UPDATE usuarios SET rol_id = ?, nombre = ?, apellido = ?, email = ?,
       dni = ?, telefono = ?, direccion = ?,
       activo = COALESCE(?, activo),
       password_hash = COALESCE(?, password_hash),
       fecha_ingreso = COALESCE(?, fecha_ingreso)
     WHERE id = ?`,
    [d.rolId, d.nombre, d.apellido, d.email, d.dni,
     d.telefono, d.direccion, d.activo ?? null,
     d.hash ?? null, d.fechaIngreso ?? null, id]
  );
  const usuario = await buscar(connection, id);
  return res.status(200).json({ mensaje: 'Usuario actualizado correctamente', usuario });
});

export const eliminarUsuario = manejar(async (req, res, connection) => {
  await autorizar(req, connection, ['SuperAdministrador']);
  const id = idValido(req.params.id);
  await buscar(connection, id);
  await connection.execute('UPDATE usuarios SET activo = FALSE WHERE id = ?', [id]);
  const usuario = await buscar(connection, id);
  return res.status(200).json({ mensaje: 'Usuario desactivado correctamente', usuario });
});

export const logout = (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
  return res.status(200).json({ mensaje: 'Logout exitoso' });
};
