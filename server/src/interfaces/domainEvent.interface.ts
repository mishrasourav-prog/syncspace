import type {
    TaskStatus,
} from "../modules/tasks/task.model";

import { TaskType } from "../modules/tasks/task.model";

export enum DomainEventName {
    TASK_CREATED =
        "task.created",

    TASK_STATUS_CHANGED =
        "task.status_changed",

    TASK_ASSIGNED =
        "task.assigned",

    ACTIVITY_CREATED =
        "activity.created",

    NOTIFICATION_CREATED =
        "notification.created",

    DISCUSSION_CREATED =
    "discussion.created",

DISCUSSION_UPDATED =
    "discussion.updated",

DISCUSSION_DELETED =
    "discussion.deleted",

DISCUSSION_PINNED =
    "discussion.pinned",

DISCUSSION_UNPINNED =
    "discussion.unpinned",

DISCUSSION_LOCKED =
    "discussion.locked",

DISCUSSION_UNLOCKED =
    "discussion.unlocked",

DISCUSSION_REPLY_CREATED =
    "discussion.reply_created",

DISCUSSION_REPLY_UPDATED =
    "discussion.reply_updated",

DISCUSSION_REPLY_DELETED =
    "discussion.reply_deleted",
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

export interface TaskCreatedEventPayload {
    workspaceId: string;

    projectId: string;

    taskId: string;

    actorId: string;

    title: string;

    status: TaskStatus;

    taskType:TaskType;
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

export interface ActivityCreatedEventPayload {
    activityId: string;

    workspaceId: string;

    projectId: string;
}

export interface NotificationCreatedEventPayload {
    notificationId: string;

    recipientId: string;
}

export interface DomainEventPayloadMap {
    [DomainEventName.TASK_CREATED]:
        TaskCreatedEventPayload;

    [DomainEventName.TASK_STATUS_CHANGED]:
        TaskStatusChangedEventPayload;

    [DomainEventName.TASK_ASSIGNED]:
        TaskAssignedEventPayload;

    
    [DomainEventName.ACTIVITY_CREATED]:
        ActivityCreatedEventPayload;

    [DomainEventName.NOTIFICATION_CREATED]:
        NotificationCreatedEventPayload;

        [DomainEventName.DOCUMENT_CREATED]:
        DocumentChangedEventPayload;

    [DomainEventName.DOCUMENT_UPDATED]:
        DocumentChangedEventPayload;

    [DomainEventName.DOCUMENT_ARCHIVED]:
        DocumentChangedEventPayload;

    [DomainEventName.DOCUMENT_RESTORED]:
        DocumentChangedEventPayload;
    
    [DomainEventName.DISCUSSION_CREATED]:
    DiscussionChangedEventPayload;

[DomainEventName.DISCUSSION_UPDATED]:
    DiscussionChangedEventPayload;

[DomainEventName.DISCUSSION_DELETED]:
    DiscussionChangedEventPayload;

[DomainEventName.DISCUSSION_PINNED]:
    DiscussionChangedEventPayload;

[DomainEventName.DISCUSSION_UNPINNED]:
    DiscussionChangedEventPayload;

[DomainEventName.DISCUSSION_LOCKED]:
    DiscussionChangedEventPayload;

[DomainEventName.DISCUSSION_UNLOCKED]:
    DiscussionChangedEventPayload;

[DomainEventName.DISCUSSION_REPLY_CREATED]:
    DiscussionReplyChangedEventPayload;

[DomainEventName.DISCUSSION_REPLY_UPDATED]:
    DiscussionReplyChangedEventPayload;

[DomainEventName.DISCUSSION_REPLY_DELETED]:
    DiscussionReplyChangedEventPayload;

    
}

export interface DomainEvent<
    TName extends
        keyof DomainEventPayloadMap
> {
    id: string;

    name: TName;

    occurredAt: Date;

    payload:
        DomainEventPayloadMap[TName];
}

export type AnyDomainEvent = {
    [TName in keyof DomainEventPayloadMap]:
        DomainEvent<TName>;
}[keyof DomainEventPayloadMap];

export type DomainEventHandler<
    TName extends
        keyof DomainEventPayloadMap
> = (
    event: DomainEvent<TName>
) => void | Promise<void>;

export interface TaskAssignedEventPayload {
    workspaceId: string;

    projectId: string;

    taskId: string;

    actorId: string;

    recipientId: string;

    title: string;

    taskType: TaskType;
}

export enum DomainEventName {
    // existing events...

    DOCUMENT_CREATED =
        "document.created",

    DOCUMENT_UPDATED =
        "document.updated",

    DOCUMENT_ARCHIVED =
        "document.archived",

    DOCUMENT_RESTORED =
        "document.restored",
}

export interface DocumentChangedEventPayload {
    workspaceId: string;

    projectId: string;

    documentId: string;

    actorId: string;

    title: string;

    revision: number;
}