"use client";
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocketConnection(serverUrl: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionMessage, setConnectionMessage] = useState<string>('');

  useEffect(() => {
    const newSocket = io(serverUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      setConnectionMessage('');
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('connect_error', (err) => {
      setIsConnected(false);
      setConnectionMessage(`Connection failed: ${err.message}. Retrying...`);
      console.error('Socket connection error:', err);
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      setConnectionMessage(`Disconnected: ${reason}.`);
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        newSocket.connect(); // Attempt to reconnect if server initiated disconnect
      }
    });

    return () => {
      newSocket.off('connect');
      newSocket.off('connect_error');
      newSocket.off('disconnect');
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [serverUrl]);

  const connect = () => {
     if (socket && !socket.connected) {
         socket.connect();
     }
  };

  return { socket, isConnected, connectionMessage, connectSocket: connect };
}