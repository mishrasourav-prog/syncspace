import type { TaskStatus, TaskType } from "../modules/tasks/task.model";

export enum DomainEventName {
  TASK_CREATED = "task.created",
  TASK_UPDATED = "task.updated",
  TASK_STATUS_CHANGED = "task.status_changed",
  TASK_ASSIGNED = "task.assigned",
  TASK_UNASSIGNED = "task.unassigned",
  TASKS_REORDERED = "tasks.reordered",
  TASK_COMMENT_CREATED = "task.comment_created",
  TASK_COMMENT_UPDATED = "task.comment_updated",
  TASK_COMMENT_DELETED = "task.comment_deleted",
  TASK_ASSIGNMENT_REQUESTED = "task.assignment_requested",
  TASK_ASSIGNMENT_REQUEST_ACCEPTED = "task.assignment_request_accepted",

  DOCUMENT_CREATED = "document.created",
  DOCUMENT_UPDATED = "document.updated",
  DOCUMENT_ARCHIVED = "document.archived",
  DOCUMENT_RESTORED = "document.restored",

  DISCUSSION_CREATED = "discussion.created",
  DISCUSSION_UPDATED = "discussion.updated",
  DISCUSSION_DELETED = "discussion.deleted",
  DISCUSSION_PINNED = "discussion.pinned",
  DISCUSSION_UNPINNED = "discussion.unpinned",
  DISCUSSION_LOCKED = "discussion.locked",
  DISCUSSION_UNLOCKED = "discussion.unlocked",
  DISCUSSION_REPLY_CREATED = "discussion.reply_created",
  DISCUSSION_REPLY_UPDATED = "discussion.reply_updated",
  DISCUSSION_REPLY_DELETED = "discussion.reply_deleted",

  ACTIVITY_CREATED = "activity.created",
  NOTIFICATION_CREATED = "notification.created",

  PROJECT_MEMBER_ADDED = "project.member_added",
  WORKSPACE_MEMBER_ADDED = "workspace.member_added",
  PROJECT_MEMBER_ROLE_CHANGED = "project.member_role_changed",
  WORKSPACE_MEMBER_ROLE_CHANGED = "workspace.member_role_changed",
  PROJECT_MEMBERSHIP_ENDED = "project.membership_ended",
  WORKSPACE_MEMBERSHIP_ENDED = "workspace.membership_ended",

  USER_SESSION_REVOKED = "user.session_revoked",
}

export type MembershipEndReason = "removed" | "left";

export type UserSessionRevocationReason =
  "logout" | "password_changed" | "password_reset" | "account_deleted";

export interface TaskCreatedEventPayload {
  workspaceId: string;
  projectId: string;
  taskId: string;
  actorId: string;
  title: string;
  status: TaskStatus;
  taskType: TaskType;
}

export interface TaskUpdatedEventPayload {
  workspaceId: string;
  projectId: string;
  taskId: string;
  actorId: string;
  title: string;
  taskType: TaskType;
}

export interface TaskStatusChangedEventPayload {
  workspaceId: string;
  projectId: string;
  taskId: string;
  taskType: TaskType;
  actorId: string;
  title: string;
  previousStatus: TaskStatus;
  currentStatus: TaskStatus;
}

export interface TaskAssignedEventPayload {
  workspaceId: string;
  projectId: string;
  taskId: string;
  actorId: string;
  recipientId: string;
  title: string;
  taskType: TaskType;
}

export interface TaskUnassignedEventPayload {
  workspaceId: string;
  projectId: string;
  taskId: string;
  actorId: string;
  assigneeId: string;
  title: string;
  taskType: TaskType;
}

export interface TasksReorderedEventPayload {
  workspaceId: string;
  projectId: string;
  actorId: string;
  affectedStatuses: TaskStatus[];
}

export interface TaskCommentChangedEventPayload {
  workspaceId: string;
  projectId: string;
  taskId: string;
  commentId: string;
  actorId: string;
}

export interface TaskAssignmentRequestEventPayload {
  workspaceId: string;
  projectId: string;
  taskId: string;
  requestId: string;
  actorId: string;
  requesterId: string;
  title: string;
  taskType: TaskType;
}

export interface TaskAssignmentRequestAcceptedEventPayload extends TaskAssignmentRequestEventPayload {
  acceptedById: string;
}

export interface DocumentChangedEventPayload {
  workspaceId: string;
  projectId: string;
  documentId: string;
  actorId: string;
  title: string;
  revision: number;
}

export interface DiscussionChangedEventPayload {
  workspaceId: string;
  projectId: string;
  discussionId: string;
  actorId: string;
  title: string;
}

export interface DiscussionReplyChangedEventPayload {
  workspaceId: string;
  projectId: string;
  discussionId: string;
  replyId: string;
  actorId: string;
  discussionAuthorId: string;
  title: string;
}

export interface ActivityCreatedEventPayload {
  activityId: string;
  workspaceId: string;
  projectId: string;
}

export interface NotificationCreatedEventPayload {
  notificationId: string;
  recipientId: string;
}

export interface WorkspaceMemberAddedEventPayload {
  workspaceId: string;
  memberId: string;
  affectedUserId: string;
  actorId: string;
}

export interface ProjectMemberAddedEventPayload {
  workspaceId: string;
  projectId: string;
  memberId: string;
  affectedUserId: string;
  actorId: string;
}

export interface WorkspaceMemberRoleChangedEventPayload {
  workspaceId: string;
  memberId: string;
  affectedUserId: string;
  actorId: string;
  role: string;
}

export interface ProjectMemberRoleChangedEventPayload {
  workspaceId: string;
  projectId: string;
  memberId: string;
  affectedUserId: string;
  actorId: string;
  role: string;
}

export interface ProjectMembershipEndedEventPayload {
  workspaceId: string;
  projectId: string;

  affectedUserId: string;

  actorId: string;

  reason: MembershipEndReason;
}

export interface WorkspaceMembershipEndedEventPayload {
  workspaceId: string;

  projectIds: string[];

  affectedUserId: string;
  actorId: string;
  reason: MembershipEndReason;
}

export interface UserSessionRevokedEventPayload {
  userId: string;
  reason: UserSessionRevocationReason;
}

export interface DomainEventPayloadMap {
  [DomainEventName.TASK_CREATED]: TaskCreatedEventPayload;

  [DomainEventName.TASK_UPDATED]: TaskUpdatedEventPayload;

  [DomainEventName.TASK_STATUS_CHANGED]: TaskStatusChangedEventPayload;

  [DomainEventName.TASK_ASSIGNED]: TaskAssignedEventPayload;

  [DomainEventName.TASK_UNASSIGNED]: TaskUnassignedEventPayload;

  [DomainEventName.TASKS_REORDERED]: TasksReorderedEventPayload;

  [DomainEventName.TASK_COMMENT_CREATED]: TaskCommentChangedEventPayload;

  [DomainEventName.TASK_COMMENT_UPDATED]: TaskCommentChangedEventPayload;

  [DomainEventName.TASK_COMMENT_DELETED]: TaskCommentChangedEventPayload;

  [DomainEventName.TASK_ASSIGNMENT_REQUESTED]: TaskAssignmentRequestEventPayload;

  [DomainEventName.TASK_ASSIGNMENT_REQUEST_ACCEPTED]: TaskAssignmentRequestAcceptedEventPayload;

  [DomainEventName.DOCUMENT_CREATED]: DocumentChangedEventPayload;

  [DomainEventName.DOCUMENT_UPDATED]: DocumentChangedEventPayload;

  [DomainEventName.DOCUMENT_ARCHIVED]: DocumentChangedEventPayload;

  [DomainEventName.DOCUMENT_RESTORED]: DocumentChangedEventPayload;

  [DomainEventName.DISCUSSION_CREATED]: DiscussionChangedEventPayload;

  [DomainEventName.DISCUSSION_UPDATED]: DiscussionChangedEventPayload;

  [DomainEventName.DISCUSSION_DELETED]: DiscussionChangedEventPayload;

  [DomainEventName.DISCUSSION_PINNED]: DiscussionChangedEventPayload;

  [DomainEventName.DISCUSSION_UNPINNED]: DiscussionChangedEventPayload;

  [DomainEventName.DISCUSSION_LOCKED]: DiscussionChangedEventPayload;

  [DomainEventName.DISCUSSION_UNLOCKED]: DiscussionChangedEventPayload;

  [DomainEventName.DISCUSSION_REPLY_CREATED]: DiscussionReplyChangedEventPayload;

  [DomainEventName.DISCUSSION_REPLY_UPDATED]: DiscussionReplyChangedEventPayload;

  [DomainEventName.DISCUSSION_REPLY_DELETED]: DiscussionReplyChangedEventPayload;

  [DomainEventName.ACTIVITY_CREATED]: ActivityCreatedEventPayload;

  [DomainEventName.NOTIFICATION_CREATED]: NotificationCreatedEventPayload;

  [DomainEventName.WORKSPACE_MEMBER_ADDED]: WorkspaceMemberAddedEventPayload;

  [DomainEventName.PROJECT_MEMBER_ADDED]: ProjectMemberAddedEventPayload;

  [DomainEventName.WORKSPACE_MEMBER_ROLE_CHANGED]: WorkspaceMemberRoleChangedEventPayload;

  [DomainEventName.PROJECT_MEMBER_ROLE_CHANGED]: ProjectMemberRoleChangedEventPayload;

  [DomainEventName.PROJECT_MEMBERSHIP_ENDED]: ProjectMembershipEndedEventPayload;

  [DomainEventName.WORKSPACE_MEMBERSHIP_ENDED]: WorkspaceMembershipEndedEventPayload;

  [DomainEventName.USER_SESSION_REVOKED]: UserSessionRevokedEventPayload;
}

export interface DomainEvent<TName extends keyof DomainEventPayloadMap> {
  id: string;
  name: TName;
  occurredAt: Date;
  payload: DomainEventPayloadMap[TName];
}

export type AnyDomainEvent = {
  [TName in keyof DomainEventPayloadMap]: DomainEvent<TName>;
}[keyof DomainEventPayloadMap];

export type DomainEventHandler<TName extends keyof DomainEventPayloadMap> = (
  event: DomainEvent<TName>,
) => void | Promise<void>;
