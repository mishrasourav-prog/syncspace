import { io, type Socket } from "socket.io-client";

export interface WorkspaceAccessRevokedPayload {
  workspaceId: string;
  projectIds: string[];
  reason: "removed" | "left";
}

export interface SocketActionResponse {
  success: boolean;
  message: string;
}

interface ServerToClientEvents {
  "socket:ready": (payload: { userId: string; socketId: string }) => void;
  "notification:new": (payload: { notificationId: string }) => void;
  "access:workspace-revoked": (payload: WorkspaceAccessRevokedPayload) => void;
}

interface ClientToServerEvents {
  "workspace:join": (workspaceId: string, acknowledge: (response: SocketActionResponse) => void) => void;
  "workspace:leave": (workspaceId: string, acknowledge: (response: SocketActionResponse) => void) => void;
}

/*
Single Socket.IO client instance for the whole application.

Authentication relies entirely on the HTTP-only `accessToken` cookie sent
automatically during the handshake — never on a token read from JavaScript.
*/
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000",
  {
    autoConnect: false,
    withCredentials: true,
  }
);
