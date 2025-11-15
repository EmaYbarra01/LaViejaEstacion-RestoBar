import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:4000').replace(/\/$/, '');
const URL_EMPLEADOS = `${API_BASE}/api/empleados`;

/**
 * Obtener todos los empleados
 */
export const getAllEmpleados = async () => {
  try {
    const response = await axios.get(URL_EMPLEADOS, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    throw error;
  }
};

/**
 * Obtener un empleado por ID
 */
export const getEmpleadoById = async (id) => {
  try {
    const response = await axios.get(`${URL_EMPLEADOS}/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener empleado:', error);
    throw error;
  }
};

/**
 * Crear un nuevo empleado
 */
export const createEmpleado = async (empleadoData) => {
  try {
    const response = await axios.post(URL_EMPLEADOS, empleadoData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear empleado:', error);
    throw error;
  }
};

/**
 * Actualizar un empleado
 */
export const updateEmpleado = async (id, empleadoData) => {
  try {
    const response = await axios.put(`${URL_EMPLEADOS}/${id}`, empleadoData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    throw error;
  }
};

/**
 * Desactivar un empleado (soft delete)
 */
export const desactivarEmpleado = async (id) => {
  try {
    const response = await axios.patch(`${URL_EMPLEADOS}/${id}/desactivar`, {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error al desactivar empleado:', error);
    throw error;
  }
};

/**
 * Eliminar permanentemente un empleado
 */
export const deleteEmpleado = async (id) => {
  try {
    const response = await axios.delete(`${URL_EMPLEADOS}/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    throw error;
  }
};

/**
 * Registrar asistencia de un empleado
 */
export const registrarAsistencia = async (id, asistenciaData) => {
  try {
    const response = await axios.post(`${URL_EMPLEADOS}/${id}/asistencia`, asistenciaData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    throw error;
  }
};

/**
 * Registrar pago de un empleado
 */
export const registrarPago = async (id, pagoData) => {
  try {
    const response = await axios.post(`${URL_EMPLEADOS}/${id}/pago`, pagoData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error al registrar pago:', error);
    throw error;
  }
};

/**
 * Obtener historial de asistencias de un empleado
 */
export const getAsistencias = async (id, mes = null, anio = null) => {
  try {
    let url = `${URL_EMPLEADOS}/${id}/asistencias`;
    if (mes && anio) {
      url += `?mes=${mes}&anio=${anio}`;
    }
    const response = await axios.get(url, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener asistencias:', error);
    throw error;
  }
};

/**
 * Obtener historial de pagos de un empleado
 */
export const getPagos = async (id) => {
  try {
    const response = await axios.get(`${URL_EMPLEADOS}/${id}/pagos`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    throw error;
  }
};

/**
 * Registrar inasistencia de un empleado
 */
export const registrarInasistencia = async (id, inasistenciaData) => {
  try {
    const response = await axios.post(`${URL_EMPLEADOS}/${id}/inasistencia`, inasistenciaData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error al registrar inasistencia:', error);
    throw error;
  }
};

/**
 * Obtener historial de inasistencias de un empleado
 */
export const getInasistencias = async (id, mes = null, anio = null) => {
  try {
    let url = `${URL_EMPLEADOS}/${id}/inasistencias`;
    if (mes && anio) {
      url += `?mes=${mes}&anio=${anio}`;
    }
    const response = await axios.get(url, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener inasistencias:', error);
    throw error;
  }
};


