/**
 * menuStore.js
 * HU2 - Ver fotos, descripción y precio
 * Store de Zustand para manejar el estado del menú digital
 */

import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const useMenuStore = create((set, get) => ({
  // ===== ESTADO =====
  menu: {},
  categorias: [],
  productos: [],
  categoriaActiva: null,
  loading: false,
  error: null,
  ultimaActualizacion: null,
  
  // ===== ACCIONES =====
  
  /**
   * Obtener el menú completo desde la API pública
   */
  fetchMenu: async () => {
    set({ loading: true, error: null });
    
    try {
      console.log('🔄 Iniciando fetch del menú desde:', `${API_BASE_URL}/api/menu`);
      const response = await axios.get(`${API_BASE_URL}/api/menu`);
      
      console.log('✅ Respuesta recibida:', response.data);
      
      const { menu, ultimaActualizacion } = response.data;
      const categorias = Object.keys(menu);
      const primeraCategoria = categorias[0] || null;
      
      console.log('📋 Categorías encontradas:', categorias);
      console.log('📦 Total de categorías:', categorias.length);
      
      // Aplanar productos para búsquedas
      const todosLosProductos = [];
      Object.entries(menu).forEach(([categoria, productos]) => {
        productos.forEach(producto => {
          todosLosProductos.push({
            ...producto,
            categoria
          });
        });
      });
      
      console.log('🍽️ Total de productos:', todosLosProductos.length);
      
      set({
        menu,
        categorias,
        productos: todosLosProductos,
        categoriaActiva: primeraCategoria,
        ultimaActualizacion,
        loading: false,
        error: null
      });
      
      console.log('✅ Estado actualizado exitosamente');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error al cargar el menú:', error);
      const errorMessage = error.response?.data?.mensaje || 
        'No se pudo cargar el menú. Por favor, intente nuevamente.';
      
      set({
        loading: false,
        error: errorMessage
      });
      
      return { success: false, error: errorMessage };
    }
  },
  
  /**
   * Cambiar la categoría activa
   */
  setCategoriaActiva: (categoria) => {
    set({ categoriaActiva: categoria });
  },
  
  /**
   * Obtener productos de una categoría específica
   */
  getProductosPorCategoria: (categoria) => {
    const { menu } = get();
    return menu[categoria] || [];
  },
  
  /**
   * Buscar productos por nombre o descripción
   */
  buscarProductos: (termino) => {
    const { productos } = get();
    
    if (!termino || termino.trim() === '') {
      return productos;
    }
    
    const terminoLower = termino.toLowerCase();
    
    return productos.filter(producto => 
      producto.nombre.toLowerCase().includes(terminoLower) ||
      (producto.descripcion && producto.descripcion.toLowerCase().includes(terminoLower))
    );
  },
  
  /**
   * Obtener un producto por ID
   */
  getProductoPorId: (id) => {
    const { productos } = get();
    return productos.find(p => p.id === id);
  },
  
  /**
   * Limpiar errores
   */
  clearError: () => {
    set({ error: null });
  },
  
  /**
   * Refrescar el menú
   */
  refreshMenu: async () => {
    return await get().fetchMenu();
  },
  
  /**
   * Verificar si hay productos en una categoría
   */
  hayCategoriaConProductos: (categoria) => {
    const { menu } = get();
    return menu[categoria] && menu[categoria].length > 0;
  },
  
  /**
   * Obtener conteo de productos por categoría
   */
  getConteoCategoria: (categoria) => {
    const { menu } = get();
    return menu[categoria]?.length || 0;
  },
  
  /**
   * Resetear store
   */
  reset: () => {
    set({
      menu: {},
      categorias: [],
      productos: [],
      categoriaActiva: null,
      loading: false,
      error: null,
      ultimaActualizacion: null
    });
  }
}));

export default useMenuStore;
