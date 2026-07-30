import type { UserSessionRevocationReason } from "./domainEvent.interface";

import type { TaskStatus, TaskType } from "../modules/tasks/task.model";

export interface ISocketActionResponse {
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

export type DiscussionChange =
  | "created"
  | "updated"
  | "deleted"
  | "pinned"
  | "unpinned"
  | "locked"
  | "unlocked";

export type DiscussionReplyChange = "created" | "updated" | "deleted";

export interface DiscussionSocketPayload {
  workspaceId: string;
  projectId: string;
  discussionId: string;
  actorId: string;
  title: string;
  change: DiscussionChange;
}

export interface DiscussionReplySocketPayload {
  workspaceId: string;
  projectId: string;
  discussionId: string;
  replyId: string;
  actorId: string;
  title: string;
  change: DiscussionReplyChange;
}

export interface ProjectAccessRevokedSocketPayload {
  workspaceId: string;
  projectId: string;
  reason: "removed" | "left";
}

export interface WorkspaceAccessRevokedSocketPayload {
  workspaceId: string;
  projectIds: string[];
  reason: "removed" | "left";
}

export interface WorkspaceMemberChangedSocketPayload {
  workspaceId: string;
  memberId: string;
  affectedUserId: string;
  actorId: string;
  role?: string;
}

export interface ProjectMemberChangedSocketPayload {
  workspaceId: string;
  projectId: string;
  memberId: string;
  affectedUserId: string;
  actorId: string;
  role?: string;
}

export interface AccountSessionRevokedSocketPayload {
  reason: UserSessionRevocationReason;
}

export interface ServerToClientEvents {
  "socket:ready": (payload: { userId: string; socketId: string }) => void;

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

  "notification:new": (payload: { notificationId: string }) => void;

  "activity:new": (payload: {
    activityId: string;
    workspaceId: string;
    projectId: string;
  }) => void;

  "document:created": (payload: DocumentSocketPayload) => void;

  "document:updated": (payload: DocumentSocketPayload) => void;

  "document:archived": (payload: DocumentSocketPayload) => void;

  "document:restored": (payload: DocumentSocketPayload) => void;

  "discussion:changed": (payload: DiscussionSocketPayload) => void;

  "discussion:reply-changed": (payload: DiscussionReplySocketPayload) => void;

  "workspace:member-added": (
    payload: WorkspaceMemberChangedSocketPayload,
  ) => void;

  "workspace:member-role-changed": (
    payload: WorkspaceMemberChangedSocketPayload,
  ) => void;

  "project:member-added": (payload: ProjectMemberChangedSocketPayload) => void;

  "project:member-role-changed": (
    payload: ProjectMemberChangedSocketPayload,
  ) => void;

  "access:project-revoked": (
    payload: ProjectAccessRevokedSocketPayload,
  ) => void;

  "access:workspace-revoked": (
    payload: WorkspaceAccessRevokedSocketPayload,
  ) => void;

  "account:session-revoked": (
    payload: AccountSessionRevokedSocketPayload,
  ) => void;
}

export interface ClientToServerEvents {
  "workspace:join": (
    workspaceId: string,
    acknowledge: (response: ISocketActionResponse) => void,
  ) => void;

  "workspace:leave": (
    workspaceId: string,
    acknowledge: (response: ISocketActionResponse) => void,
  ) => void;

  "project:join": (
    projectId: string,
    acknowledge: (response: ISocketActionResponse) => void,
  ) => void;

  "project:leave": (
    projectId: string,
    acknowledge: (response: ISocketActionResponse) => void,
  ) => void;

  "tasks:reordered": (payload: {
    workspaceId: string;
    projectId: string;
    actorId: string;
    affectedStatuses: TaskStatus[];
  }) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  userId: string;
  email: string;
  username: string;

  sessionVersion: number;
}
