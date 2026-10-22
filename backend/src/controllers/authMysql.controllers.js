import bcrypt from 'bcryptjs';
import generarToken from '../auth/token-sign.js';
import { getMySQLConnection } from '../database/mysql/pool.js';

function datosPublicos(usuario) {
  return {
    id: String(usuario.id),
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    rol: usuario.rol,
    nombreCompleto: `${usuario.nombre} ${usuario.apellido}`,
    dni: usuario.dni,
    telefono: usuario.telefono,
    direccion: usuario.direccion,
  };
}

export async function loginMysql(req, res) {
  const { email, password } = req.body || {};

  if (typeof email !== 'string' || !email.trim() ||
      typeof password !== 'string' || !password) {
    return res.status(400).json({
      mensaje: 'Email y contraseña son requeridos',
    });
  }

  let connection;
  try {
    connection = await getMySQLConnection();
    const [usuarios] = await connection.execute(
      `SELECT u.id, u.nombre, u.apellido, u.email,
              u.password_hash, u.activo, u.dni,
              u.telefono, u.direccion, r.nombre AS rol
       FROM usuarios u
       INNER JOIN roles r ON r.id = u.rol_id
       WHERE u.email = ?
       LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    const usuario = usuarios[0];
    const passwordValido = usuario &&
      await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValido || !usuario.activo) {
      return res.status(401).json({
        mensaje: 'Correo o contraseña inválidos, o cuenta inactiva',
      });
    }

    const token = await generarToken(
      String(usuario.id), usuario.nombre, usuario.rol
    );

    await connection.execute(
      'UPDATE usuarios SET ultimo_acceso = UTC_TIMESTAMP(3) WHERE id = ?',
      [usuario.id]
    );

    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
    });

    return res.status(200).json({
      mensaje: 'Login exitoso',
      token,
      usuario: datosPublicos(usuario),
    });
  } catch (error) {
    console.error('Error en login MySQL:', error.code || error.message);
    return res.status(500).json({
      mensaje: 'Error al iniciar sesión',
    });
  } finally {
    connection?.release();
  }
}

export async function getMeMysql(req, res) {
  const id = Number(req.user?.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(401).json({ mensaje: 'Sesión no válida' });
  }

  let connection;
  try {
    connection = await getMySQLConnection();
    const [usuarios] = await connection.execute(
      `SELECT u.id, u.nombre, u.apellido, u.email,
              u.dni, u.telefono, u.direccion, r.nombre AS rol
       FROM usuarios u
       INNER JOIN roles r ON r.id = u.rol_id
       WHERE u.id = ? AND u.activo = TRUE
       LIMIT 1`,
      [id]
    );

    if (!usuarios.length) {
      return res.status(401).json({ mensaje: 'Sesión no válida' });
    }

    return res.status(200).json(datosPublicos(usuarios[0]));
  } catch (error) {
    console.error('Error al consultar usuario MySQL:', error.code || error.message);
    return res.status(500).json({
      mensaje: 'Error al consultar el usuario',
    });
  } finally {
    connection?.release();
  }
}
