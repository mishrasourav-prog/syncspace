import type {
    TaskStatus,
    TaskType
} from "../modules/tasks/task.model";

/*
|--------------------------------------------------------------------------
| Shared Socket Response
|--------------------------------------------------------------------------
|
| This is used by acknowledgement callbacks.
|
| The client sends an event and gives the server a callback.
| The server calls that callback after completing the operation.
|
*/

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

export type DiscussionReplyChange =
    | "created"
    | "updated"
    | "deleted";

export interface DiscussionSocketPayload {
    workspaceId: string;

    projectId: string;

    discussionId: string;

    actorId: string;

    title: string;

    change:
        DiscussionChange;
}

export interface DiscussionReplySocketPayload {
    workspaceId: string;

    projectId: string;

    discussionId: string;

    replyId: string;

    actorId: string;

    title: string;

    change:
        DiscussionReplyChange;
}

/*
|--------------------------------------------------------------------------
| Server → Client Events
|--------------------------------------------------------------------------
|
| These are events that the backend is allowed to send
| to the connected frontend.
|
*/

export interface ServerToClientEvents {
    "socket:ready": (payload: {
        userId: string;

        socketId: string;
    }) => void;

    "task:created": (payload: {
        workspaceId: string;

        projectId: string;

        taskId: string;

        actorId: string;

        title: string;

        status: TaskStatus;

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

    "notification:new": (payload: {
        notificationId: string;
    }) => void;

    "activity:new": (payload: {
        activityId: string;

        workspaceId: string;

        projectId: string;
    }) => void;

    "document:created": (
        payload:
            DocumentSocketPayload
    ) => void;

    "document:updated": (
        payload:
            DocumentSocketPayload
    ) => void;

    "document:archived": (
        payload:
            DocumentSocketPayload
    ) => void;

    "document:restored": (
        payload:
            DocumentSocketPayload
    ) => void;

    "discussion:changed": (
        payload:
            DiscussionSocketPayload
    ) => void;

    "discussion:reply-changed": (
        payload:
            DiscussionReplySocketPayload
    ) => void;

        "tasks:reordered": (payload: {
    workspaceId: string;

    projectId: string;

    actorId: string;

    affectedStatuses:
        TaskStatus[];
}) => void;

    "access:project-revoked": (
        payload:
            ProjectAccessRevokedSocketPayload
    ) => void;

    "access:workspace-revoked": (
        payload:
            WorkspaceAccessRevokedSocketPayload
    ) => void;

}

/*
|--------------------------------------------------------------------------
| Client → Server Events
|--------------------------------------------------------------------------
|
| These are events that the frontend is allowed to send
| to the backend.
|
*/

export interface ClientToServerEvents {
    "workspace:join": (
        workspaceId: string,
        acknowledge: (
            response: ISocketActionResponse
        ) => void
    ) => void;

    "workspace:leave": (
        workspaceId: string,
        acknowledge: (
            response: ISocketActionResponse
        ) => void
    ) => void;

    "project:join": (
        projectId: string,
        acknowledge: (
            response: ISocketActionResponse
        ) => void
    ) => void;

    "project:leave": (
        projectId: string,
        acknowledge: (
            response: ISocketActionResponse
        ) => void
    ) => void;

        "tasks:reordered": (payload: {
    workspaceId: string;

    projectId: string;

    actorId: string;

    affectedStatuses:
        TaskStatus[];
}) => void;


}

/*
|--------------------------------------------------------------------------
| Inter-Server Events
|--------------------------------------------------------------------------
|
| This will become useful when Redis connects multiple
| backend server instances.
|
| It is empty for the single-server MVP.
|
*/

export interface InterServerEvents {}

/*
|--------------------------------------------------------------------------
| Socket Data
|--------------------------------------------------------------------------
|
| socket.data stores server-trusted data associated
| with one authenticated connection.
|
*/

export interface SocketData {
    userId: string;

    email: string;

    username: string;
}

export interface ProjectAccessRevokedSocketPayload {
    workspaceId: string;

    projectId: string;

    reason:
        "removed" |
        "left";
}

export interface WorkspaceAccessRevokedSocketPayload {
    workspaceId: string;

    projectIds: string[];

    reason:
        "removed" |
        "left";
}