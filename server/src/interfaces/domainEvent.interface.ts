import type {
    TaskStatus,
} from "../modules/tasks/task.model";

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
}

export interface TaskCreatedEventPayload {
    workspaceId: string;

    projectId: string;

    taskId: string;

    actorId: string;

    title: string;

    status: TaskStatus;
}

export interface TaskStatusChangedEventPayload {
    workspaceId: string;

    projectId: string;

    taskId: string;

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
}

