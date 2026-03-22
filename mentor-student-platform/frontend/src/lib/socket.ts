import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
  if (socketInstance) {
    return socketInstance;
  }

  const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

  socketInstance = io(socketUrl, {
    auth: {
      token,
    },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socketInstance.on('connect_error', (error: any) => {
    console.error('Socket connection error:', error);
  });

  socketInstance.on('disconnect', (reason: string) => {
    console.log('Socket disconnected:', reason);
    socketInstance = null;
  });

  return socketInstance;
};

export const getSocket = (): Socket | null => {
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
