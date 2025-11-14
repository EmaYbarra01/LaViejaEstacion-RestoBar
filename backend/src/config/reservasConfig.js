/**
 * Configuración de horarios y restricciones del restaurante
 */

export const HORARIOS_ATENCION = {
  // Horarios por día de la semana (0 = Domingo, 6 = Sábado)
  0: { abre: '11:00', cierra: '23:00', cerrado: false }, // Domingo
  1: { abre: '11:00', cierra: '23:00', cerrado: false }, // Lunes
  2: { abre: '11:00', cierra: '23:00', cerrado: false }, // Martes
  3: { abre: '11:00', cierra: '23:00', cerrado: false }, // Miércoles
  4: { abre: '11:00', cierra: '23:00', cerrado: false }, // Jueves
  5: { abre: '11:00', cierra: '00:00', cerrado: false }, // Viernes
  6: { abre: '11:00', cierra: '00:00', cerrado: false }  // Sábado
};

export const CONFIGURACION_RESERVAS = {
  // Duración estimada de una reserva (en horas)
  duracionReserva: 2,
  
  // Tiempo mínimo de anticipación para reservar (en horas)
  anticipacionMinima: 2,
  
  // Tiempo máximo de anticipación para reservar (en días)
  anticipacionMaxima: 30,
  
  // Cantidad mínima de comensales
  comensalesMinimo: 1,
  
  // Cantidad máxima de comensales por reserva
  comensalesMaximo: 12,
  
  // Intervalo de tiempo entre reservas (en minutos)
  intervaloReservas: 30
};

export const FECHAS_ESPECIALES = {
  // Días festivos o fechas cerradas (formato: 'MM-DD')
  diasCerrados: [
    '01-01', // Año Nuevo
    '05-01', // Día del Trabajador
    '12-25'  // Navidad
  ],
  
  // Horarios especiales para fechas específicas
  horariosEspeciales: {
    '12-24': { abre: '11:00', cierra: '20:00' }, // Nochebuena
    '12-31': { abre: '19:00', cierra: '03:00' }  // Fin de año
  }
};

/**
 * Validar si el restaurante está abierto en una fecha y hora específica
 */
export const validarHorarioAtencion = (fecha, hora) => {
  const fechaObj = new Date(fecha);
  const diaSemana = fechaObj.getDay();
  const mesYDia = `${String(fechaObj.getMonth() + 1).padStart(2, '0')}-${String(fechaObj.getDate()).padStart(2, '0')}`;
  
  // Verificar si es un día cerrado
  if (FECHAS_ESPECIALES.diasCerrados.includes(mesYDia)) {
    return {
      valido: false,
      mensaje: 'El restaurante está cerrado en esa fecha (día festivo)'
    };
  }
  
  // Obtener horario del día
  let horario = HORARIOS_ATENCION[diaSemana];
  
  // Verificar si hay horario especial
  if (FECHAS_ESPECIALES.horariosEspeciales[mesYDia]) {
    horario = FECHAS_ESPECIALES.horariosEspeciales[mesYDia];
  }
  
  // Verificar si está cerrado ese día
  if (horario.cerrado) {
    return {
      valido: false,
      mensaje: 'El restaurante está cerrado ese día de la semana'
    };
  }
  
  // Validar que la hora esté dentro del horario
  const horaReserva = hora.substring(0, 5); // HH:MM
  
  if (horaReserva < horario.abre) {
    return {
      valido: false,
      mensaje: `El restaurante abre a las ${horario.abre}. Por favor, selecciona un horario posterior.`
    };
  }
  
  // Si cierra después de medianoche (ej: 00:00)
  if (horario.cierra === '00:00' || horario.cierra < horario.abre) {
    // Permitir reservas hasta las 23:30
    if (horaReserva > '23:30') {
      return {
        valido: false,
        mensaje: `Última reserva a las 23:30. El restaurante cierra a la ${horario.cierra}.`
      };
    }
  } else {
    // Calcular hora límite (1 hora antes del cierre para dar tiempo de cenar)
    const [horasCierre, minutosCierre] = horario.cierra.split(':').map(Number);
    const horaLimite = `${String(horasCierre - 1).padStart(2, '0')}:${String(minutosCierre).padStart(2, '0')}`;
    
    if (horaReserva > horaLimite) {
      return {
        valido: false,
        mensaje: `Última reserva a las ${horaLimite}. El restaurante cierra a las ${horario.cierra}.`
      };
    }
  }
  
  return {
    valido: true,
    horario: horario
  };
};

/**
 * Validar anticipación de la reserva
 */
export const validarAnticipacion = (fecha, hora) => {
  const ahora = new Date();
  const fechaHoraReserva = new Date(`${fecha}T${hora}`);
  
  const diferenciaHoras = (fechaHoraReserva - ahora) / (1000 * 60 * 60);
  const diferenciaDias = diferenciaHoras / 24;
  
  // Validar anticipación mínima
  if (diferenciaHoras < CONFIGURACION_RESERVAS.anticipacionMinima) {
    return {
      valido: false,
      mensaje: `Las reservas deben realizarse con al menos ${CONFIGURACION_RESERVAS.anticipacionMinima} horas de anticipación`
    };
  }
  
  // Validar anticipación máxima
  if (diferenciaDias > CONFIGURACION_RESERVAS.anticipacionMaxima) {
    return {
      valido: false,
      mensaje: `Las reservas solo pueden realizarse con hasta ${CONFIGURACION_RESERVAS.anticipacionMaxima} días de anticipación`
    };
  }
  
  return {
    valido: true
  };
};

/**
 * Validar cantidad de comensales
 */
export const validarComensales = (comensales) => {
  if (comensales < CONFIGURACION_RESERVAS.comensalesMinimo) {
    return {
      valido: false,
      mensaje: `La cantidad mínima de comensales es ${CONFIGURACION_RESERVAS.comensalesMinimo}`
    };
  }
  
  if (comensales > CONFIGURACION_RESERVAS.comensalesMaximo) {
    return {
      valido: false,
      mensaje: `La cantidad máxima de comensales por reserva es ${CONFIGURACION_RESERVAS.comensalesMaximo}. Para grupos más grandes, por favor contacta directamente al restaurante.`
    };
  }
  
  return {
    valido: true
  };
};

export default {
  HORARIOS_ATENCION,
  CONFIGURACION_RESERVAS,
  FECHAS_ESPECIALES,
  validarHorarioAtencion,
  validarAnticipacion,
  validarComensales
};
