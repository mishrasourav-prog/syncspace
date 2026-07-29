import { io, type Socket } from "socket.io-client";

import type { SessionRevokedPayload } from "@/features/auth/types/session.types";
import type { TaskStatus, TaskType } from "@/features/tasks/types/task.types";

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


export interface WorkspaceMemberChangedPayload {
  workspaceId: string;
  memberId: string;
  affectedUserId: string;
  actorId: string;
  role?: string;
}

export interface ProjectMemberChangedPayload extends WorkspaceMemberChangedPayload {
  projectId: string;
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
  "workspace:member-added": (payload: WorkspaceMemberChangedPayload) => void;
  "workspace:member-role-changed": (payload: WorkspaceMemberChangedPayload) => void;
  "project:member-added": (payload: ProjectMemberChangedPayload) => void;
  "project:member-role-changed": (payload: ProjectMemberChangedPayload) => void;
  "activity:new": (payload: { activityId: string; workspaceId: string; projectId: string }) => void;
  "task:created": (payload: {
    workspaceId: string;
    projectId: string;
    taskId: string;
    actorId: string;
    title: string;
    status: TaskStatus;
    taskType: TaskType;
  }) => void;
  "task:updated": (payload: {
    workspaceId: string;
    projectId: string;
    taskId: string;
    actorId: string;
    title: string;
    taskType: TaskType;
  }) => void;
  "task:status-changed": (payload: {
    workspaceId: string;
    projectId: string;
    taskId: string;
    actorId: string;
    title: string;
    previousStatus: TaskStatus;
    currentStatus: TaskStatus;
    taskType: TaskType;
  }) => void;
  "task:assigned": (payload: {
    workspaceId: string;
    projectId: string;
    taskId: string;
    actorId: string;
    assigneeId: string;
    title: string;
    taskType: TaskType;
  }) => void;
  "task:unassigned": (payload: {
    workspaceId: string;
    projectId: string;
    taskId: string;
    actorId: string;
    assigneeId: string;
    title: string;
    taskType: TaskType;
  }) => void;
  "task:comment-changed": (payload: {
    workspaceId: string;
    projectId: string;
    taskId: string;
    commentId: string;
    actorId: string;
    change: "created" | "updated" | "deleted";
  }) => void;
  "task:assignment-requested": (payload: {
    workspaceId: string;
    projectId: string;
    taskId: string;
    requestId: string;
    actorId: string;
    requesterId: string;
    title: string;
    taskType: TaskType;
  }) => void;
  "task:assignment-request-accepted": (payload: {
    workspaceId: string;
    projectId: string;
    taskId: string;
    requestId: string;
    actorId: string;
    requesterId: string;
    acceptedById: string;
    title: string;
    taskType: TaskType;
  }) => void;
  "tasks:reordered": (payload: {
    workspaceId: string;
    projectId: string;
    actorId: string;
    affectedStatuses: TaskStatus[];
  }) => void;
  "document:created": (payload: DocumentSocketPayload) => void;
  "document:updated": (payload: DocumentSocketPayload) => void;
  "document:archived": (payload: DocumentSocketPayload) => void;
  "document:restored": (payload: DocumentSocketPayload) => void;
  "discussion:changed": (payload: DiscussionSocketPayload) => void;
  "discussion:reply-changed": (payload: DiscussionReplySocketPayload) => void;
  "account:session-revoked": (payload: SessionRevokedPayload) => void;
}

interface ClientToServerEvents {
  "workspace:join": (workspaceId: string, acknowledge: (response: SocketActionResponse) => void) => void;
  "workspace:leave": (workspaceId: string, acknowledge: (response: SocketActionResponse) => void) => void;
  "project:join": (projectId: string, acknowledge: (response: SocketActionResponse) => void) => void;
  "project:leave": (projectId: string, acknowledge: (response: SocketActionResponse) => void) => void;
  "tasks:reordered": (payload: {
    workspaceId: string;
    projectId: string;
    actorId: string;
    affectedStatuses: TaskStatus[];
  }) => void;
}

/*
Single Socket.IO client instance for the whole application.

Authentication relies entirely on the HTTP-only `accessToken` cookie sent
by the browser during the handshake. No token is read from JavaScript.
*/
const socketUrl = import.meta.env.VITE_SOCKET_URL?.trim() || window.location.origin;

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(socketUrl, {
  autoConnect: false,
  withCredentials: true,
});

export type { SessionRevokedPayload } from "@/features/auth/types/session.types";
