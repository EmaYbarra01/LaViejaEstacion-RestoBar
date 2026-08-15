import Mensaje from '../models/mensajeSchema.js';
import Usuario from '../models/usuarioSchema.js';

export const listarMensajesEntreRoles = async (req, res) => {
  try {
    const rolActual = req.user?.rol || req.rol;
    const rolesPermitidos = ['Gerente', 'SuperAdministrador'];

    if (!rolActual || !rolesPermitidos.includes(rolActual)) {
      return res.status(403).json({ mensaje: 'No tienes permisos para ver mensajes internos' });
    }

    const consulta = {
      $or: [
        { remitenteRol: 'Gerente', destinatarioRol: 'SuperAdministrador' },
        { remitenteRol: 'SuperAdministrador', destinatarioRol: 'Gerente' }
      ]
    };

    const mensajes = await Mensaje.find(consulta)
      .populate('remitente', 'nombre apellido rol')
      .populate('destinatario', 'nombre apellido rol')
      .sort({ createdAt: 1 });

    return res.status(200).json({ mensajes });
  } catch (error) {
    console.error('Error al listar mensajes internos:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor al listar mensajes' });
  }
};

export const crearMensaje = async (req, res) => {
  try {
    const usuarioActualId = req.user?.id || req.id;
    const usuarioActualRol = req.user?.rol || req.rol;

    const texto = (req.body?.texto || '').trim();
    const destinatarioRol = req.body?.destinatarioRol || (
      usuarioActualRol === 'Gerente' ? 'SuperAdministrador' : 'Gerente'
    );

    if (!usuarioActualId) {
      return res.status(401).json({ mensaje: 'Usuario no autenticado' });
    }

    if (!texto) {
      return res.status(400).json({ mensaje: 'El mensaje no puede estar vacío' });
    }

    if (!['Gerente', 'SuperAdministrador'].includes(usuarioActualRol)) {
      return res.status(403).json({ mensaje: 'Solo Gerente y SuperAdministrador pueden enviar mensajes internos' });
    }

    if (!['Gerente', 'SuperAdministrador'].includes(destinatarioRol)) {
      return res.status(400).json({ mensaje: 'El destinatario debe ser Gerente o SuperAdministrador' });
    }

    const destinatario = await Usuario.findOne({ rol: destinatarioRol, activo: true }).select('_id nombre apellido rol');

    if (!destinatario) {
      return res.status(404).json({ mensaje: 'No existe un destinatario activo para ese rol' });
    }

    const mensaje = await Mensaje.create({
      remitente: usuarioActualId,
      destinatario: destinatario._id,
      remitenteRol: usuarioActualRol,
      destinatarioRol,
      texto
    });

    const mensajeCompleto = await Mensaje.findById(mensaje._id)
      .populate('remitente', 'nombre apellido rol')
      .populate('destinatario', 'nombre apellido rol');

    return res.status(201).json({
      mensaje: 'Mensaje enviado correctamente',
      data: mensajeCompleto
    });
  } catch (error) {
    console.error('Error al crear mensaje interno:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor al enviar el mensaje' });
  }
};
