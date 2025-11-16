import Usuario from "../models/usuarioSchema.js";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import generarToken from "../auth/token-sign.js";

/**
 * Obtener todos los usuarios
 * GET /api/usuarios
 */
export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor al obtener usuarios' 
    });
  }
};

/**
 * Crear un nuevo usuario
 * POST /api/usuarios
 */
export const crearUsuario = async (req, res) => {
  try {
    // Validar datos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await Usuario.findOne({ email: req.body.email });
    if (usuarioExistente) {
      return res.status(400).json({
        mensaje: "El correo electrónico ya está registrado",
      });
    }

    // Verificar si el DNI ya existe
    const dniExistente = await Usuario.findOne({ dni: req.body.dni });
    if (dniExistente) {
      return res.status(400).json({
        mensaje: "El DNI ya está registrado",
      });
    }

    // Crear usuario
    const usuarioNuevo = new Usuario(req.body);
    
    // Hashear password
    const salt = bcrypt.genSaltSync(10);
    usuarioNuevo.password = bcrypt.hashSync(usuarioNuevo.password, salt);
    
    await usuarioNuevo.save();
    
    res.status(201).json({
      mensaje: "Usuario creado exitosamente",
      usuario: {
        id: usuarioNuevo._id,
        nombre: usuarioNuevo.nombre,
        apellido: usuarioNuevo.apellido,
        email: usuarioNuevo.email,
        rol: usuarioNuevo.rol
      }
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al crear usuario",
    });
  }
};

/**
 * Obtener un usuario por ID
 * GET /api/usuarios/:id
 */
export const obtenerUnUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-password');
    
    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado",
      });
    }
    
    res.status(200).json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al obtener el usuario",
    });
  }
};

/**
 * Actualizar un usuario
 * PUT /api/usuarios/:id
 */
export const actualizarUsuario = async (req, res) => {
  try {
    // Validar datos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }

    // Si se envía password, hashearlo
    if (req.body.password) {
      const salt = bcrypt.genSaltSync(10);
      req.body.password = bcrypt.hashSync(req.body.password, salt);
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!usuarioActualizado) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado",
      });
    }

    res.status(200).json({
      mensaje: "Usuario actualizado correctamente",
      usuario: usuarioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        mensaje: "El email o DNI ya está registrado",
      });
    }
    
    res.status(500).json({
      mensaje: "Error interno del servidor al actualizar usuario",
    });
  }
};

/**
 * Eliminar un usuario (borrado lógico)
 * DELETE /api/usuarios/:id
 */
export const eliminarUsuario = async (req, res) => {
  try {
    // Borrado lógico: marcar como inactivo
    const usuarioEliminado = await Usuario.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    ).select('-password');

    if (!usuarioEliminado) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado",
      });
    }

    res.status(200).json({
      mensaje: "Usuario desactivado correctamente",
      usuario: usuarioEliminado
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al eliminar usuario",
    });
  }
};

/**
 * Login de usuario
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar datos
    if (!email || !password) {
      return res.status(400).json({
        mensaje: "Email y contraseña son requeridos"
      });
    }

    // Buscar usuario por email
    const usuario = await Usuario.findOne({ email });
    
    if (!usuario) {
      return res.status(404).json({
        mensaje: "Correo o contraseña inválidos",
      });
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(403).json({
        mensaje: "Usuario desactivado. Contacte al administrador",
      });
    }

    // Verificar password usando el método del schema
    const passwordValido = await usuario.compararPassword(password);

    if (!passwordValido) {
      return res.status(404).json({
        mensaje: "Correo o contraseña inválidos",
      });
    }

    // Actualizar último acceso
    usuario.ultimoAcceso = new Date();
    await usuario.save();

    // Generar token
    const token = await generarToken(usuario._id, usuario.nombre, usuario.rol);

    // Configurar cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 3600000 // 1 hora
    });

    res.status(200).json({
      mensaje: "Login exitoso",
      token: token, // ⚠️ AGREGADO: Enviar token en response para clientes que no usan cookies
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        nombreCompleto: usuario.nombreCompleto
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      mensaje: "Error al iniciar sesión",
      error: error.message
    });
  }
};
/**
 * Obtener información del usuario autenticado
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const usuario = await Usuario.findById(userId).select('-password');
    
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json({
      id: usuario._id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol,
      nombreCompleto: usuario.nombreCompleto,
      dni: usuario.dni,
      telefono: usuario.telefono,
      direccion: usuario.direccion
    });
  } catch (error) {
    console.error('Error en /me:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

/**
 * Logout de usuario
 * POST /api/auth/logout
 */
export const logout = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    sameSite: 'strict',
    expires: new Date(0)
  });
  
  res.status(200).json({
    mensaje: "Logout exitoso"
  });
};

/**
 * Obtener usuarios por rol
 * GET /api/usuarios/rol/:rol
 */
export const obtenerUsuariosPorRol = async (req, res) => {
  try {
    const { rol } = req.params;
    
    const usuarios = await Usuario.find({ rol, activo: true })
      .select('-password')
      .sort({ nombre: 1 });
    
    res.status(200).json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};