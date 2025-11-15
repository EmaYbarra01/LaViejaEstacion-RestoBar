import axios from 'axios';

const URL_PRODUCTOS = import.meta.env.VITE_API_PRODUCTOS;

/**
 * Adaptador: convierte datos del backend (español) al formato frontend (inglés)
 */
const adaptProductFromBackend = (product) => {
  if (!product) return null;
  return {
    id: product._id || product.id,
    name: product.nombre,
    description: product.descripcion,
    category: product.categoria,
    price: product.precio,
    cost: product.costo,
    stock: product.stock,
    minimumStock: product.stockMinimo,
    unit: product.unidadMedida,
    available: product.disponible,
    imgUrl: product.imagenUrl,
    code: product.codigo,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

/**
 * Adaptador: convierte datos del frontend (inglés) al formato backend (español)
 */
const adaptProductToBackend = (product) => {
  const backendProduct = {
    nombre: product.name,
    descripcion: product.description || '',
    categoria: product.category,
    precio: parseFloat(product.price),
    costo: parseFloat(product.cost) || 0,
    stock: parseInt(product.stock) || 0,
    stockMinimo: parseInt(product.minimumStock) || 0,
    unidadMedida: product.unit || 'Unidad',
    disponible: product.available !== undefined ? product.available : true,
    imagenUrl: product.imgUrl || '/images/productos/default.jpg',
    codigo: product.code || '',
  };
  
  // Remover campos undefined o vacíos
  Object.keys(backendProduct).forEach(key => {
    if (backendProduct[key] === '' || backendProduct[key] === undefined) {
      delete backendProduct[key];
    }
  });
  
  return backendProduct;
};

// Obtener todos los productos
export const getAllProducts = async () => {
  try {
    const response = await axios.get(URL_PRODUCTOS,{
      withCredentials: true
    });
    // Adaptar cada producto del backend al formato frontend
    // El backend puede devolver un array directamente o un objeto con propiedad 'productos'
    const data = Array.isArray(response.data) ? response.data : (response.data.productos || []);
    return data.map(adaptProductFromBackend);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

// Obtener producto por ID
export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${URL_PRODUCTOS}/${id}`, {
      withCredentials: true
    });
    return adaptProductFromBackend(response.data);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    throw error;
  }
};

// Crear nuevo producto
export const createProduct = async (productData) => {
  try {
    // Convertir del formato frontend al backend
    const backendData = adaptProductToBackend(productData);
    const response = await axios.post(URL_PRODUCTOS, backendData, {
      withCredentials: true
    });
    // El backend devuelve { mensaje, producto }, extraemos solo producto
    const producto = response.data.producto || response.data;
    return adaptProductFromBackend(producto);
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }
};

// Actualizar producto
export const updateProduct = async (id, productData) => {
  try {
    // Convertir del formato frontend al backend
    const backendData = adaptProductToBackend(productData);
    const response = await axios.put(`${URL_PRODUCTOS}/${id}`, backendData, {
      withCredentials: true
    });
    // El backend devuelve { mensaje, producto }, extraemos solo producto
    const producto = response.data.producto || response.data;
    return adaptProductFromBackend(producto);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw error;
  }
};

// Eliminar producto
export const deleteProduct = async (id) => {
  try {
    await axios.delete(`${URL_PRODUCTOS}/${id}`, {
      withCredentials: true
    });
    return true;
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    throw error;
  }
};

// Verificar si un código de producto ya existe
export const checkProductCodeExists = async (code, excludeId = null) => {
  try {
    const products = await getAllProducts();
    return products.some(product => 
      product.code === code && product.id !== excludeId
    );
  } catch (error) {
    console.error('Error al verificar código:', error);
    return false;
  }
};

// Verificar si un nombre de producto ya existe
export const checkProductNameExists = async (name, excludeId = null) => {
  try {
    const products = await getAllProducts();
    return products.some(product => 
      product.name.toLowerCase() === name.toLowerCase() && product.id !== excludeId
    );
  } catch (error) {
    console.error('Error al verificar nombre:', error);
    return false;
  }
};
