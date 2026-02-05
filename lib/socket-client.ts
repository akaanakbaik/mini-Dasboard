import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (url: string) => {
  if (!socket) {
    socket = io(url, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      transports: ["websocket"]
    });
  }
  return socket;
};
