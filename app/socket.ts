import { io } from "socket.io-client";

export const initSocket = async () => {
  const options = {
    "force new connection": true,
    reconnectionAttempts: Infinity,
    timeout: 10000,
    transports: ["websocket"],
  };

  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
  if (!SOCKET_URL) throw new Error("SOCKET_SERVER_URL is not defined");

  return io(SOCKET_URL, options);
};
