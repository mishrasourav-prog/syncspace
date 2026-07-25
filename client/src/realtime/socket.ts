

import { io, type Socket } from "socket.io-client";

export interface WorkspaceAccessRevokedPayload {
  workspaceId: string;
  projectIds: string[];
  reason: "removed" | "left";
}

export interface ProjectAccessRevokedPayload {
  workspaceId: string;
  projectId: string;
  reason: "removed" | "left";
}

export interface SocketActionResponse {
  success: boolean;
  message: string;
}

export interface DocumentSocketPayload {
  workspaceId: string;
  projectId: string;
  documentId: string;
  actorId: string;
  title: string;
  revision: number;
}

export interface DiscussionSocketPayload {
  workspaceId: string;
  projectId: string;
  discussionId: string;
  actorId: string;
  title: string;
  change: "created" | "updated" | "deleted" | "pinned" | "unpinned" | "locked" | "unlocked";
}

export interface DiscussionReplySocketPayload {
  workspaceId: string;
  projectId: string;
  discussionId: string;
  replyId: string;
  actorId: string;
  title: string;
  change: "created" | "updated" | "deleted";
}

interface ServerToClientEvents {
  "socket:ready": (payload: { userId: string; socketId: string }) => void;
  "notification:new": (payload: { notificationId: string }) => void;
  "access:workspace-revoked": (payload: WorkspaceAccessRevokedPayload) => void;
  "access:project-revoked": (payload: ProjectAccessRevokedPayload) => void;
  "activity:new": (payload: { activityId: string; workspaceId: string; projectId: string }) => void;
  "task:created": (payload: { workspaceId: string; projectId: string; taskId: string }) => void;
  "task:status-changed": (payload: { workspaceId: string; projectId: string; taskId: string }) => void;
  "task:assigned": (payload: { workspaceId: string; projectId: string; taskId: string }) => void;
  "tasks:reordered": (payload: { workspaceId: string; projectId: string }) => void;
  "document:created": (payload: DocumentSocketPayload) => void;
  "document:updated": (payload: DocumentSocketPayload) => void;
  "document:archived": (payload: DocumentSocketPayload) => void;
  "document:restored": (payload: DocumentSocketPayload) => void;
  "discussion:changed": (payload: DiscussionSocketPayload) => void;
  "discussion:reply-changed": (payload: DiscussionReplySocketPayload) => void;
}

interface ClientToServerEvents {
  "workspace:join": (workspaceId: string, acknowledge: (response: SocketActionResponse) => void) => void;
  "workspace:leave": (workspaceId: string, acknowledge: (response: SocketActionResponse) => void) => void;
  "project:join": (projectId: string, acknowledge: (response: SocketActionResponse) => void) => void;
  "project:leave": (projectId: string, acknowledge: (response: SocketActionResponse) => void) => void;
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
