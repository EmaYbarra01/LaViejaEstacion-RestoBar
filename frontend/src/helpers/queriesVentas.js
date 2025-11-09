import axios from "axios";

const URL_VENTAS = import.meta.env.VITE_API_VENTAS;

// Obtener el historial de ventas del usuario autenticado
export const getMyPurchases = async () => {
  try {
    const response = await axios.get(`${URL_VENTAS}/myhistory`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener mis compras:', error);
    throw error;
  }
};

// Obtener todas las ventas (solo para administradores)
export const getAllSales = async () => {
  try {
    const response = await axios.get(URL_VENTAS, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    throw error;
  }
};

// Obtener venta por ID
export const getSaleById = async (id) => {
  try {
    const response = await axios.get(`${URL_VENTAS}/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener venta:', error);
    throw error;
  }
};

// Obtener producto por ID
export const getSalesById = async (id) => {
  try {
    const response = await axios.get(`${URL_VENTAS}/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener venta:', error);
    throw error;
  }
};

// Crear nueva venta
export const createSale = async (saleData) => {
  try {
    const response = await axios.post(URL_VENTAS, saleData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear venta:', error);
    throw error;
  }
};

// Actualizar venta
export const updateSale = async (id, saleData) => {
  try {
    const response = await axios.put(`${URL_VENTAS}/${id}`, saleData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar venta:', error);
    throw error;
  }
};

// Eliminar venta
export const deleteSale = async (id) => {
  try {
    await axios.delete(`${URL_VENTAS}/${id}`, {
      withCredentials: true
    });
    return true;
  } catch (error) {
    console.error('Error al eliminar venta:', error);
    throw error;
  }
};
