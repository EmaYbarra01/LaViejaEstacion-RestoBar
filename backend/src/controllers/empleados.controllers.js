import Empleado from '../models/empleadoSchema.js';
import Usuario from '../models/usuarioSchema.js';

/**
 * Obtener todos los empleados con información de usuario
 * Muestra tanto usuarios MADRE como empleados creados
 */
export const obtenerEmpleados = async (req, res) => {
  try {
    // Obtener todos los usuarios del sistema
    const todosLosUsuarios = await Usuario.find({ activo: true })
      .select('-password')
      .sort({ fechaIngreso: 1 });

    // Obtener todos los empleados (con información extendida)
    const empleados = await Empleado.find()
      .populate('usuario', '-password')
      .sort({ fechaContratacion: -1 });

    // Crear un Map de empleados por ID de usuario para búsqueda rápida
    const empleadosMap = new Map();
    empleados.forEach(emp => {
      if (emp.usuario) {
        empleadosMap.set(emp.usuario._id.toString(), emp);
      }
    });

    const mesActual = new Date().getMonth() + 1;
    const anioActual = new Date().getFullYear();

    // Construir la lista combinada
    const listaCombinada = todosLosUsuarios.map(usuario => {
      const empleado = empleadosMap.get(usuario._id.toString());
      
      if (empleado) {
        // Es un empleado con registro completo
        const diasTrabajados = empleado.diasTrabajadosMes(mesActual, anioActual);
        const diasInasistencias = empleado.inasistenciasMes ? empleado.inasistenciasMes(mesActual, anioActual) : 0;
        const pagadoMesActual = empleado.estaPagadoMes(mesActual, anioActual);
        
        return {
          _id: empleado._id,
          usuario: usuario,
          cargo: empleado.cargo,
          salarioMensual: empleado.salarioMensual,
          fechaContratacion: empleado.fechaContratacion,
          activo: empleado.activo,
          esUsuarioMadre: false,
          tieneRegistroEmpleado: true,
          diasTrabajados,
          diasInasistencias,
          pagadoMesActual,
          totalAsistencias: empleado.asistencias.length,
          totalInasistencias: empleado.inasistencias ? empleado.inasistencias.length : 0,
          totalPagos: empleado.pagos.length
        };
      } else {
        // Es un usuario MADRE (sin registro de empleado)
        return {
          _id: usuario._id,
          usuario: usuario,
          cargo: usuario.rol,
          salarioMensual: 0,
          fechaContratacion: usuario.fechaIngreso,
          activo: usuario.activo,
          esUsuarioMadre: true,
          tieneRegistroEmpleado: false,
          diasTrabajados: 0,
          diasInasistencias: 0,
          pagadoMesActual: false,
          totalAsistencias: 0,
          totalInasistencias: 0,
          totalPagos: 0
        };
      }
    });

    res.json(listaCombinada);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ 
      message: 'Error al obtener empleados', 
      error: error.message 
    });
  }
};

/**
 * Obtener un empleado por ID
 */
export const obtenerEmpleadoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const empleado = await Empleado.findById(id).populate('usuario', '-password');

    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    res.json(empleado);
  } catch (error) {
    console.error('Error al obtener empleado:', error);
    res.status(500).json({ 
      message: 'Error al obtener empleado', 
      error: error.message 
    });
  }
};

/**
 * Crear un nuevo empleado (crea el usuario y el empleado)
 */
export const crearEmpleado = async (req, res) => {
  try {
    const { nombre, apellido, email, dni, telefono, password, cargo, salarioMensual } = req.body;

    // Verificar que el email no exista
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ 
        message: 'Ya existe un usuario con ese email' 
      });
    }

    // Verificar que el DNI no exista (solo si se proporciona uno real)
    if (dni && dni.trim() !== '') {
      const dniExistente = await Usuario.findOne({ dni });
      if (dniExistente) {
        return res.status(400).json({ 
          message: 'Ya existe un usuario con ese DNI' 
        });
      }
    }

    // Mapear cargo a rol del sistema
    let rolSistema = 'Mozo'; // Rol por defecto
    if (cargo === 'Encargado de Cocina') {
      rolSistema = 'EncargadoCocina';
    } else if (cargo === 'Cajero') {
      rolSistema = 'Cajero';
    } else if (cargo === 'Gerente') {
      rolSistema = 'Gerente';
    } else if (cargo === 'Mozo') {
      rolSistema = 'Mozo';
    }

    // Crear el usuario con la contraseña proporcionada
    const nuevoUsuario = new Usuario({
      nombre,
      apellido,
      email,
      password: password || 'empleado123', // Usar la contraseña proporcionada o una por defecto
      dni: dni || 'SIN-DNI-' + Date.now(), // Generar DNI temporal si no se proporciona
      telefono: telefono || '',
      rol: rolSistema, // Asignar rol según el cargo
      activo: true,
      fechaIngreso: new Date()
    });

    await nuevoUsuario.save();

    // Crear el empleado vinculado al usuario
    const nuevoEmpleado = new Empleado({
      usuario: nuevoUsuario._id,
      cargo,
      salarioMensual: salarioMensual || 0,
      fechaContratacion: new Date()
    });

    await nuevoEmpleado.save();
    
    // Poblar la información del usuario
    await nuevoEmpleado.populate('usuario', '-password');

    res.status(201).json({
      message: 'Empleado creado exitosamente',
      empleado: nuevoEmpleado
    });
  } catch (error) {
    console.error('Error al crear empleado:', error);
    res.status(500).json({ 
      message: 'Error al crear empleado', 
      error: error.message 
    });
  }
};

/**
 * Actualizar datos de un empleado
 */
export const actualizarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { cargo, salarioMensual, activo } = req.body;

    const empleado = await Empleado.findById(id);
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    // Actualizar campos permitidos
    if (cargo !== undefined) empleado.cargo = cargo;
    if (salarioMensual !== undefined) empleado.salarioMensual = salarioMensual;
    if (activo !== undefined) empleado.activo = activo;

    await empleado.save();
    await empleado.populate('usuario', '-password');

    res.json({
      message: 'Empleado actualizado exitosamente',
      empleado
    });
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    res.status(500).json({ 
      message: 'Error al actualizar empleado', 
      error: error.message 
    });
  }
};

/**
 * Desactivar un empleado (soft delete)
 */
export const desactivarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;

    const empleado = await Empleado.findById(id);
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    empleado.activo = false;
    await empleado.save();

    res.json({
      message: 'Empleado desactivado exitosamente',
      empleado
    });
  } catch (error) {
    console.error('Error al desactivar empleado:', error);
    res.status(500).json({ 
      message: 'Error al desactivar empleado', 
      error: error.message 
    });
  }
};

/**
 * Eliminar un empleado permanentemente (solo SuperAdministrador)
 */
export const eliminarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;

    const empleado = await Empleado.findById(id).populate('usuario');
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    // Guardar información antes de eliminar
    const nombreCompleto = `${empleado.usuario.nombre} ${empleado.usuario.apellido}`;
    const usuarioId = empleado.usuario._id;

    // Eliminar primero el registro de empleado
    await Empleado.findByIdAndDelete(id);

    // Eliminar el usuario asociado
    await Usuario.findByIdAndDelete(usuarioId);

    res.json({
      message: 'Empleado y usuario eliminados permanentemente',
      eliminado: {
        nombre: nombreCompleto,
        cargo: empleado.cargo
      }
    });
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    res.status(500).json({ 
      message: 'Error al eliminar empleado', 
      error: error.message 
    });
  }
};

/**
 * Registrar asistencia de un empleado
 */
export const registrarAsistencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, presente = true, horaEntrada = '', horaSalida = '', observaciones = '' } = req.body;

    const empleado = await Empleado.findById(id);
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    empleado.asistencias.push({
      fecha: fecha || new Date(),
      presente,
      horaEntrada,
      horaSalida,
      observaciones
    });

    await empleado.save();

    res.json({
      message: 'Asistencia registrada exitosamente',
      asistencia: empleado.asistencias[empleado.asistencias.length - 1]
    });
  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    res.status(500).json({ 
      message: 'Error al registrar asistencia', 
      error: error.message 
    });
  }
};

/**
 * Registrar pago mensual de un empleado
 */
export const registrarPago = async (req, res) => {
  try {
    const { id } = req.params;
    const { mes, anio, monto, metodoPago = 'Efectivo', observaciones = '' } = req.body;

    const empleado = await Empleado.findById(id);
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    // Verificar si ya existe un pago para ese mes/año
    const pagoExistente = empleado.pagos.find(p => p.mes === mes && p.anio === anio);
    if (pagoExistente) {
      return res.status(400).json({ 
        message: 'Ya existe un pago registrado para este mes/año' 
      });
    }

    empleado.pagos.push({
      mes,
      anio,
      monto,
      metodoPago,
      observaciones,
      fechaPago: new Date()
    });

    await empleado.save();

    res.json({
      message: 'Pago registrado exitosamente',
      pago: empleado.pagos[empleado.pagos.length - 1]
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ 
      message: 'Error al registrar pago', 
      error: error.message 
    });
  }
};

/**
 * Obtener historial de asistencias de un empleado
 */
export const obtenerAsistencias = async (req, res) => {
  try {
    const { id } = req.params;
    const { mes, anio } = req.query;

    const empleado = await Empleado.findById(id).populate('usuario', '-password');
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    let asistencias = empleado.asistencias;

    // Filtrar por mes/año si se proporcionan
    if (mes && anio) {
      asistencias = asistencias.filter(a => {
        const fecha = new Date(a.fecha);
        return fecha.getMonth() + 1 === parseInt(mes) && 
               fecha.getFullYear() === parseInt(anio);
      });
    }

    res.json({
      empleado: {
        _id: empleado._id,
        usuario: empleado.usuario,
        cargo: empleado.cargo
      },
      asistencias: asistencias.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    });
  } catch (error) {
    console.error('Error al obtener asistencias:', error);
    res.status(500).json({ 
      message: 'Error al obtener asistencias', 
      error: error.message 
    });
  }
};

/**
 * Obtener historial de pagos de un empleado
 */
export const obtenerPagos = async (req, res) => {
  try {
    const { id } = req.params;

    const empleado = await Empleado.findById(id).populate('usuario', '-password');
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    res.json({
      empleado: {
        _id: empleado._id,
        usuario: empleado.usuario,
        cargo: empleado.cargo,
        salarioMensual: empleado.salarioMensual
      },
      pagos: empleado.pagos.sort((a, b) => {
        if (a.anio !== b.anio) return b.anio - a.anio;
        return b.mes - a.mes;
      })
    });
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ 
      message: 'Error al obtener pagos', 
      error: error.message 
    });
  }
};

/**
 * Registrar inasistencia de un empleado
 */
export const registrarInasistencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, motivo = 'Sin registrar asistencia', observaciones = '' } = req.body;

    const empleado = await Empleado.findById(id);
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    empleado.inasistencias.push({
      fecha: fecha || new Date(),
      motivo,
      observaciones
    });

    await empleado.save();

    res.json({
      message: 'Inasistencia registrada exitosamente',
      inasistencia: empleado.inasistencias[empleado.inasistencias.length - 1]
    });
  } catch (error) {
    console.error('Error al registrar inasistencia:', error);
    res.status(500).json({ 
      message: 'Error al registrar inasistencia', 
      error: error.message 
    });
  }
};

/**
 * Obtener historial de inasistencias de un empleado
 */
export const obtenerInasistencias = async (req, res) => {
  try {
    const { id } = req.params;
    const { mes, anio } = req.query;

    const empleado = await Empleado.findById(id).populate('usuario', '-password');
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    let inasistencias = empleado.inasistencias || [];

    // Filtrar por mes/año si se proporcionan
    if (mes && anio) {
      inasistencias = inasistencias.filter(i => {
        const fecha = new Date(i.fecha);
        return fecha.getMonth() + 1 === parseInt(mes) && 
               fecha.getFullYear() === parseInt(anio);
      });
    }

    res.json({
      empleado: {
        _id: empleado._id,
        usuario: empleado.usuario,
        cargo: empleado.cargo
      },
      inasistencias: inasistencias.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    });
  } catch (error) {
    console.error('Error al obtener inasistencias:', error);
    res.status(500).json({ 
      message: 'Error al obtener inasistencias', 
      error: error.message 
    });
  }
};
