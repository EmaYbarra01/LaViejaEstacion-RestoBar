import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const useSocket = (room = null) => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Crear conexión con el servidor
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Evento de conexión exitosa
    socketRef.current.on('connect', () => {
      console.log('✅ Socket conectado:', socketRef.current.id);
      
      // Unirse a una sala específica si se proporciona
      if (room) {
        socketRef.current.emit('join-room', room);
        console.log(`📡 Uniéndose a la sala: ${room}`);
      }
    });

    // Evento de desconexión
    socketRef.current.on('disconnect', (reason) => {
      console.log('❌ Socket desconectado:', reason);
    });

    // Evento de error
    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Error de conexión Socket:', error);
    });

    // Cleanup al desmontar
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('🔌 Socket desconectado');
      }
    };
  }, [room]);

  // Función para escuchar eventos
  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  // Función para dejar de escuchar eventos
  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  // Función para emitir eventos
  const emit = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  return { socket: socketRef.current, on, off, emit };
};

export default useSocket;
