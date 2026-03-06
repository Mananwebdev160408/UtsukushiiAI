import { Server as SocketServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyAccessToken } from "../utils/jwt";
import { logger } from "../utils/logger";
import { config } from "../config";

let io: SocketServer;

export const initWebSocket = (server: HttpServer) => {
  io = new SocketServer(server, {
    cors: {
      origin: config.cors.origin,
      credentials: true,
    },
  });

  const renderNamespace = io.of("/render");

  // Authentication Middleware
  renderNamespace.use((socket: Socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = verifyAccessToken(token);
      socket.data.user = decoded;
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  // Room management
  renderNamespace.on("connection", (socket: Socket) => {
    const userId = socket.data.user.userId;
    logger.info(`WebSocket user connected: ${userId}`);

    // Join room for the specific user
    socket.join(`user:${userId}`);

    socket.on("disconnect", () => {
      logger.info(`WebSocket user disconnected: ${userId}`);
    });
  });
};

export const getIO = (): SocketServer => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.of("/render").to(`user:${userId}`).emit(event, data);
  } else {
    logger.warn(
      `Failed to emit event ${event} to user ${userId}: WebSocket not initialized`,
    );
  }
};
