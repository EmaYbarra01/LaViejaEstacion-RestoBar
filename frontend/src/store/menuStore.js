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
      const ultimaActualizacion = new Date().toISOString();
      const productosRecibidos = Array.isArray(response.data)
        ? response.data
        : Object.values(response.data.menu || {}).flat();
      const menu = productosRecibidos.reduce((menuPorCategoria, producto) => {
        const categoria = producto.categoria || 'Otros';
        const productoNormalizado = {
          ...producto,
          id: producto.id || producto._id
        };
        menuPorCategoria[categoria] = menuPorCategoria[categoria] || [];
        menuPorCategoria[categoria].push(productoNormalizado);
        return menuPorCategoria;
      }, {});
      const categorias = Object.keys(menu);
      const primeraCategoria = categorias[0] || null;
      // Aplanar productos para búsquedas
      const todosLosProductos = [];
      Object.entries(menu).forEach(([categoria, productos]) => {
        productos.forEach(producto => {
          todosLosProductos.push({ ...producto, categoria });
        });
      });
      set({
        menu,
        categorias,
        productos: todosLosProductos,
        categoriaActiva: primeraCategoria,
        ultimaActualizacion,
        loading: false,
        error: null
      });
      return { success: true };
    } catch (error) {
      console.error('❌ Error al cargar el menú:', error);
      const errorMessage = error.response?.data?.mensaje || 'No se pudo cargar el menú. Por favor, intente nuevamente.';
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  setCategoriaActiva: (categoria) => {
    set({ categoriaActiva: categoria });
  },

  getProductosPorCategoria: (categoria) => {
    const { menu } = get();
    return menu[categoria] || [];
  },

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

  getProductoPorId: (id) => {
    const { productos } = get();
    return productos.find(p => p.id === id);
  },

  clearError: () => {
    set({ error: null });
  },

  refreshMenu: async () => {
    return await get().fetchMenu();
  },

  hayCategoriaConProductos: (categoria) => {
    const { menu } = get();
    return menu[categoria] && menu[categoria].length > 0;
  },

  getConteoCategoria: (categoria) => {
    const { menu } = get();
    return menu[categoria]?.length || 0;
  },

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
