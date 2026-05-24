import { useEffect, useRef, useCallback } from 'react';
import { getSocket } from '../services/socket';

export const useSocket = (eventHandlers = {}) => {
  const handlersRef = useRef(eventHandlers);
  handlersRef.current = eventHandlers;

  useEffect(() => {
    const socket = getSocket();

    const listeners = {};
    Object.entries(handlersRef.current).forEach(([event, handler]) => {
      const wrappedHandler = (...args) => handler(...args);
      listeners[event] = wrappedHandler;
      socket.on(event, wrappedHandler);
    });

    return () => {
      Object.entries(listeners).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, []); // Only register once

  const emit = useCallback((event, data) => {
    const socket = getSocket();
    socket.emit(event, data);
  }, []);

  return { emit, socket: getSocket() };
};
