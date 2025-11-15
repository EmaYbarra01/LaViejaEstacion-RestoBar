import Empleado from '../models/empleadoSchema.js';
import Usuario from '../models/usuarioSchema.js';

/**
 * Obtener todos los empleados con información de usuario
 */
export const obtenerEmpleados = async (req, res) => {
  try {
    const empleados = await Empleado.find()
      .populate('usuario', '-password') // Excluir password
      .sort({ fechaContratacion: -1 });

    // Calcular días trabajados del mes actual
    const mesActual = new Date().getMonth() + 1;
    const anioActual = new Date().getFullYear();

    const empleadosConInfo = empleados.map(emp => {
      const diasTrabajados = emp.diasTrabajadosMes(mesActual, anioActual);
      const pagadoMesActual = emp.estaPagadoMes(mesActual, anioActual);
      
      return {
        _id: emp._id,
        usuario: emp.usuario,
        cargo: emp.cargo,
        salarioMensual: emp.salarioMensual,
        fechaContratacion: emp.fechaContratacion,
        activo: emp.activo,
        diasTrabajados,
        pagadoMesActual,
        totalAsistencias: emp.asistencias.length,
        totalPagos: emp.pagos.length
      };
    });

    res.json(empleadosConInfo);
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

    // Crear el usuario con la contraseña proporcionada
    const nuevoUsuario = new Usuario({
      nombre,
      apellido,
      email,
      password: password || 'empleado123', // Usar la contraseña proporcionada o una por defecto
      dni: dni || 'SIN-DNI-' + Date.now(), // Generar DNI temporal si no se proporciona
      telefono: telefono || '',
      rol: 'Mozo', // Rol por defecto para empleados
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
 * Eliminar un empleado (soft delete)
 */
export const eliminarEmpleado = async (req, res) => {
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
