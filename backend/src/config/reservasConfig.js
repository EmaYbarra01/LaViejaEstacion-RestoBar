/**
 * Configuración de horarios y restricciones del restaurante
 */

export const HORARIOS_ATENCION = {
  // Horarios por día de la semana (0 = Domingo, 6 = Sábado)
  0: { franjas: [{ abre: '09:00', cierra: '12:00' }, { abre: '20:00', cierra: '00:00' }], cerrado: false }, // Domingo
  1: { franjas: [{ abre: '09:00', cierra: '12:00' }, { abre: '20:00', cierra: '00:00' }], cerrado: false }, // Lunes
  2: { franjas: [{ abre: '09:00', cierra: '12:00' }, { abre: '20:00', cierra: '00:00' }], cerrado: false }, // Martes
  3: { franjas: [{ abre: '09:00', cierra: '12:00' }, { abre: '20:00', cierra: '00:00' }], cerrado: false }, // Miércoles
  4: { franjas: [{ abre: '09:00', cierra: '12:00' }, { abre: '20:00', cierra: '00:00' }], cerrado: false }, // Jueves
  5: { franjas: [{ abre: '09:00', cierra: '12:00' }, { abre: '20:00', cierra: '00:00' }], cerrado: false }, // Viernes
  6: { franjas: [{ abre: '09:00', cierra: '12:00' }, { abre: '20:00', cierra: '00:00' }], cerrado: false }  // Sábado
};

export const CONFIGURACION_RESERVAS = {
  // Duración estimada de una reserva (en horas)
  duracionReserva: 2,
  
  // Tiempo mínimo de anticipación para reservar (en horas)
  anticipacionMinima: 1, 
  
  // Tiempo máximo de anticipación para reservar (en días)
  anticipacionMaxima: 30,
  
  // Cantidad mínima de comensales
  comensalesMinimo: 1,
  
  // Cantidad máxima de comensales por reserva
  comensalesMaximo: 10,
  
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
    '12-24': { franjas: [{ abre: '11:00', cierra: '20:00' }] }, // Nochebuena
    '12-31': { franjas: [{ abre: '19:00', cierra: '03:00' }] }  // Fin de año
  }
};

/**
 * Validar si el restaurante está abierto en una fecha y hora específica
 */
export const validarHorarioAtencion = (fecha, hora) => {
  const fechaObj = new Date(`${fecha}T12:00:00Z`);
  const diaSemana = fechaObj.getUTCDay();
  const mesYDia = `${String(fechaObj.getUTCMonth() + 1).padStart(2, '0')}-${String(fechaObj.getUTCDate()).padStart(2, '0')}`;
  
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
  
  // Validar que la hora esté dentro de alguna franja de atención
  const horaReserva = hora.substring(0, 5); // HH:MM

  const minutosReserva = Number(horaReserva.slice(0, 2)) * 60 + Number(horaReserva.slice(3, 5));
  const franjaValida = horario.franjas.some(({ abre, cierra }) => {
    const minutosApertura = Number(abre.slice(0, 2)) * 60 + Number(abre.slice(3, 5));
    let minutosCierre = Number(cierra.slice(0, 2)) * 60 + Number(cierra.slice(3, 5));
    const cierraMedianoche = cierra === '00:00' || minutosCierre <= minutosApertura;
    if (cierraMedianoche) minutosCierre = 24 * 60;
    return minutosReserva >= minutosApertura && minutosReserva <= minutosCierre
      && (!cierraMedianoche || minutosReserva < minutosCierre);
  });

  if (!franjaValida) {
    return {
      valido: false,
      mensaje: 'La hora seleccionada está fuera del horario de atención. El restaurante atiende de 09:00 a 12:00 y de 20:00 a 00:00.'
    };
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
  const fechaHoraReserva = new Date(`${fecha}T${hora}:00-03:00`);
  
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
      mensaje: `La cantidad máxima de comensales por reserva es ${CONFIGURACION_RESERVAS.comensalesMaximo}. Para grupos de más de ${CONFIGURACION_RESERVAS.comensalesMaximo} personas, contacta directamente al restaurante para organizar un evento especial.`
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
