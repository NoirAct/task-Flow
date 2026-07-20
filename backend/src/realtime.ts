import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "./config/env.js";
import { createNotification } from "./services/activity.service.js";

let io: Server | null = null;

export function initRealtime(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || origin === env.CLIENT_URL || /^http:\/\/localhost:\d+$/.test(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("CORS blocked"));
      },
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token =
      (socket.handshake.auth?.token as string | undefined) ||
      (socket.handshake.headers.authorization?.startsWith("Bearer ")
        ? socket.handshake.headers.authorization.slice(7)
        : undefined);

    if (!token) {
      next(new Error("Unauthorized"));
      return;
    }

    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string };
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    void socket.join(`user:${userId}`);
  });

  return io;
}

export function getIo() {
  return io;
}

export async function notifyUser(input: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
}) {
  const notification = await createNotification(input);
  io?.to(`user:${input.userId}`).emit("notification", {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    link: notification.link,
    createdAt: notification.createdAt,
    readAt: notification.readAt,
  });
  return notification;
}
