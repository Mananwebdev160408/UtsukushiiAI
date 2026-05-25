import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/auth-helpers";

let socket: Socket | null = null;

export function connectRenderSocket() {
  if (typeof window === "undefined") return null;
  if (socket && socket.connected) return socket;

  const base = process.env.NEXT_PUBLIC_WS_URL || window.location.origin;
  const token = getAccessToken();

  socket = io(`${base}/render`, {
    auth: { token },
    transports: ["websocket"],
  });

  return socket;
}

export function onRenderEvent(event: string, cb: (...args: any[]) => void) {
  if (!socket) connectRenderSocket();
  socket?.on(event, cb);
}

export function offRenderEvent(event: string, cb: (...args: any[]) => void) {
  socket?.off(event, cb);
}

export function disconnectRenderSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}

export function getRenderSocket() {
  return socket;
}
