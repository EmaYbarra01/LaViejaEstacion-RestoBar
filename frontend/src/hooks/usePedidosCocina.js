import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchPedidosCocina, updateEstadoPedido } from '../api/cocinaAPI';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

/**
 * Hook personalizado para manejar pedidos de cocina
 * Incluye:
 * - Carga inicial de pedidos
 * - Actualización en tiempo real vía socket.io
 * - Funciones para cambiar estados
 * - Polling de respaldo
 * 
 * @param {Object} options - Opciones de configuración
 * @param {string} options.estadoInicial - Estado inicial para filtrar (opcional)
 * @param {boolean} options.autoRefresh - Activar refresco automático (default: true)
 * @param {number} options.refreshInterval - Intervalo de refresco en ms (default: 30000)
 */
const usePedidosCocina = (options = {}) => {
  const {
    estadoInicial = null,
    autoRefresh = true,
    refreshInterval = 30000
  } = options;

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState(estadoInicial);
  
  const socketRef = useRef(null);
  const intervalRef = useRef(null);

  /**
   * Cargar pedidos desde la API
   */
  const cargarPedidos = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const params = {};
      if (filtroEstado) params.estado = filtroEstado;
      
      const data = await fetchPedidosCocina(params);
      
      if (data.success) {
        setPedidos(data.pedidos || []);
      } else {
        throw new Error(data.mensaje || 'Error al cargar pedidos');
      }
    } catch (err) {
      console.error('[usePedidosCocina] Error:', err);
      setError(err.message || 'Error al cargar pedidos');
      toast.error('Error al cargar pedidos de cocina');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [filtroEstado]);

  /**
   * Cambiar estado de un pedido
   */
  const cambiarEstado = useCallback(async (pedidoId, nuevoEstado, observacion = '') => {
    try {
      const data = await updateEstadoPedido(pedidoId, {
        estado: nuevoEstado,
        observacion
      });
      
      if (data.success) {
        toast.success(data.mensaje || `Pedido actualizado a ${nuevoEstado}`);
        
        // Actualizar estado local
        setPedidos(prev => {
          // Si el pedido ya no cumple el filtro, quitarlo
          const pedidoActualizado = data.pedido;
          if (filtroEstado && pedidoActualizado.estado !== filtroEstado) {
            return prev.filter(p => p._id !== pedidoId);
          }
          
          // Actualizar el pedido en la lista
          return prev.map(p => 
            p._id === pedidoId ? pedidoActualizado : p
          );
        });
        
        return data.pedido;
      } else {
        throw new Error(data.mensaje || 'Error al actualizar estado');
      }
    } catch (err) {
      console.error('[usePedidosCocina] Error al cambiar estado:', err);
      const mensaje = err.response?.data?.mensaje || err.message || 'Error al actualizar estado';
      toast.error(mensaje);
      throw err;
    }
  }, [filtroEstado]);

  /**
   * Funciones helper para estados específicos
   */
  const marcarEnPreparacion = useCallback((pedidoId) => {
    return cambiarEstado(pedidoId, 'En Preparación', 'Comenzando preparación');
  }, [cambiarEstado]);

  const marcarListo = useCallback((pedidoId) => {
    return cambiarEstado(pedidoId, 'Listo', 'Pedido terminado y listo para servir');
  }, [cambiarEstado]);

  const marcarEntregado = useCallback((pedidoId) => {
    return cambiarEstado(pedidoId, 'Entregado', 'Pedido entregado al cliente');
  }, [cambiarEstado]);

  /**
   * Configurar socket.io para actualizaciones en tiempo real
   */
  useEffect(() => {
    const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace('/api', '');
    
    const socket = io(BACKEND_URL, {
      auth: {
        rol: 'EncargadoCocina',
        modulo: 'cocina'
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket Cocina] Conectado:', socket.id);
    });

    // Evento: nuevo pedido creado
    socket.on('nuevo-pedido-cocina', (pedido) => {
      console.log('[Socket] Nuevo pedido recibido:', pedido.numeroPedido);
      
      // Si coincide con el filtro actual, agregarlo
      if (!filtroEstado || pedido.estado === filtroEstado) {
        setPedidos(prev => {
          // Evitar duplicados
          if (prev.some(p => p._id === pedido._id)) return prev;
          
          // Agregar y ordenar por fecha de creación
          const nuevaLista = [...prev, pedido];
          nuevaLista.sort((a, b) => 
            new Date(a.fechaCreacion) - new Date(b.fechaCreacion)
          );
          return nuevaLista;
        });
        
        toast.info(`Nuevo pedido: ${pedido.numeroPedido} - Mesa ${pedido.numeroMesa}`);
      }
    });

    // Evento: pedido actualizado
    socket.on('pedidoUpdated', (data) => {
      console.log('[Socket] Pedido actualizado:', data.pedidoId);
      
      setPedidos(prev => {
        // Si cambió a un estado fuera del filtro, removerlo
        if (filtroEstado && data.nuevoEstado !== filtroEstado) {
          return prev.filter(p => p._id !== data.pedidoId);
        }
        
        // Actualizar el pedido
        return prev.map(p => 
          p._id === data.pedidoId 
            ? { ...p, estado: data.nuevoEstado, ...data.pedido }
            : p
        );
      });
    });

    // Evento: pedido listo
    socket.on('pedido-listo', (data) => {
      console.log('[Socket] Pedido listo:', data.pedidoId);
      
      // Quitar de la lista si estamos filtrando por otro estado
      if (filtroEstado && filtroEstado !== 'Listo') {
        setPedidos(prev => prev.filter(p => p._id !== data.pedidoId));
      }
      
      // Reproducir sonido de notificación
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('No se pudo reproducir audio:', e));
      } catch (e) {
        // Ignorar si no hay audio
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket Cocina] Desconectado:', reason);
    });

    return () => {
      socket.disconnect();
    };
  }, [filtroEstado]);

  /**
   * Cargar pedidos al montar y cuando cambia el filtro
   */
  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  /**
   * Configurar polling de respaldo
   */
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        cargarPedidos(false); // Sin mostrar loading
      }, refreshInterval);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, cargarPedidos]);

  return {
    pedidos,
    loading,
    error,
    filtroEstado,
    setFiltroEstado,
    cargarPedidos,
    cambiarEstado,
    marcarEnPreparacion,
    marcarListo,
    marcarEntregado
  };
};

export default usePedidosCocina;
