import axios from 'axios';

const URL_USUARIOS = import.meta.env.VITE_API_USUARIOS;
const URL_LOGIN = import.meta.env.VITE_API_LOGIN;

// Obtener todos los usuarios
export const getAllUsers = async () => {
  try {
    const response = await axios.get(URL_USUARIOS);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

// Crear nuevo usuario
export const createUser = async (userData) => {
  try {
    const response = await axios.post(URL_USUARIOS, userData);
    return response.data;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};

// Actualizar usuario
export const updateUser = async (id, userData) => {
  try {
    const response = await axios.put(`${URL_USUARIOS}/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

// Eliminar usuario
export const deleteUser = async (id) => {
  try {
    await axios.delete(`${URL_USUARIOS}/${id}`);
    return true;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(URL_LOGIN, { email, password });
    return response.data;
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error;
  }
}