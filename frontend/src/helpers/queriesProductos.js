import axios from 'axios';

const URL_PRODUCTOS = import.meta.env.VITE_API_PRODUCTOS;

// Obtener todos los productos
export const getAllProducts = async () => {
  try {
    const response = await axios.get(URL_PRODUCTOS);
    return response.data;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

// Obtener producto por ID
export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${URL_PRODUCTOS}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener producto:', error);
    throw error;
  }
};

// Crear nuevo producto
export const createProduct = async (productData) => {
  try {
    const response = await axios.post(URL_PRODUCTOS, productData);
    return response.data;
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }
};

// Actualizar producto
export const updateProduct = async (id, productData) => {
  try {
    const response = await axios.put(`${URL_PRODUCTOS}/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw error;
  }
};

// Eliminar producto
export const deleteProduct = async (id) => {
  try {
    await axios.delete(`${URL_PRODUCTOS}/${id}`);
    return true;
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    throw error;
  }
};
