// import type {
//     TaskStatus,
//     TaskType
// } from "../modules/tasks/task.model";

// /*
// |--------------------------------------------------------------------------
// | Shared Socket Response
// |--------------------------------------------------------------------------
// |
// | This is used by acknowledgement callbacks.
// |
// | The client sends an event and gives the server a callback.
// | The server calls that callback after completing the operation.
// |
// */

// export interface ISocketActionResponse {
//     success: boolean;

//     message: string;
// }

// export interface DocumentSocketPayload {
//     workspaceId: string;

//     projectId: string;

//     documentId: string;

//     actorId: string;

//     title: string;

//     revision: number;
// }

// export type DiscussionChange =
//     | "created"
//     | "updated"
//     | "deleted"
//     | "pinned"
//     | "unpinned"
//     | "locked"
//     | "unlocked";

// export type DiscussionReplyChange =
//     | "created"
//     | "updated"
//     | "deleted";

// export interface DiscussionSocketPayload {
//     workspaceId: string;

//     projectId: string;

//     discussionId: string;

//     actorId: string;

//     title: string;

//     change:
//         DiscussionChange;
// }

// export interface DiscussionReplySocketPayload {
//     workspaceId: string;

//     projectId: string;

//     discussionId: string;

//     replyId: string;

//     actorId: string;

//     title: string;

//     change:
//         DiscussionReplyChange;
// }

// /*
// |--------------------------------------------------------------------------
// | Server → Client Events
// |--------------------------------------------------------------------------
// |
// | These are events that the backend is allowed to send
// | to the connected frontend.
// |
// */

// export interface ServerToClientEvents {
//     "socket:ready": (payload: {
//         userId: string;

//         socketId: string;
//     }) => void;

//     "task:created": (payload: {
//         workspaceId: string;

//         projectId: string;

//         taskId: string;

//         actorId: string;

//         title: string;

//         status: TaskStatus;

//         taskType: TaskType;
//     }) => void;

//     "task:status-changed": (payload: {
//         workspaceId: string;

//         projectId: string;

//         taskId: string;

//         actorId: string;

//         title: string;

//         previousStatus: TaskStatus;

//         currentStatus: TaskStatus;

//         taskType: TaskType;
//     }) => void;

//     "task:assigned": (payload: {
//         workspaceId: string;

//         projectId: string;

//         taskId: string;

//         actorId: string;

//         assigneeId: string;

//         title: string;

//         taskType: TaskType;
//     }) => void;

//     "notification:new": (payload: {
//         notificationId: string;
//     }) => void;

//     "activity:new": (payload: {
//         activityId: string;

//         workspaceId: string;

//         projectId: string;
//     }) => void;

//     "document:created": (
//         payload:
//             DocumentSocketPayload
//     ) => void;

//     "document:updated": (
//         payload:
//             DocumentSocketPayload
//     ) => void;

//     "document:archived": (
//         payload:
//             DocumentSocketPayload
//     ) => void;

//     "document:restored": (
//         payload:
//             DocumentSocketPayload
//     ) => void;

//     "discussion:changed": (
//         payload:
//             DiscussionSocketPayload
//     ) => void;

//     "discussion:reply-changed": (
//         payload:
//             DiscussionReplySocketPayload
//     ) => void;

//         "tasks:reordered": (payload: {
//     workspaceId: string;

//     projectId: string;

//     actorId: string;

//     affectedStatuses:
//         TaskStatus[];
// }) => void;

//     "access:project-revoked": (
//         payload:
//             ProjectAccessRevokedSocketPayload
//     ) => void;

//     "access:workspace-revoked": (
//         payload:
//             WorkspaceAccessRevokedSocketPayload
//     ) => void;

// }

// /*
// |--------------------------------------------------------------------------
// | Client → Server Events
// |--------------------------------------------------------------------------
// |
// | These are events that the frontend is allowed to send
// | to the backend.
// |
// */

// export interface ClientToServerEvents {
//     "workspace:join": (
//         workspaceId: string,
//         acknowledge: (
//             response: ISocketActionResponse
//         ) => void
//     ) => void;

//     "workspace:leave": (
//         workspaceId: string,
//         acknowledge: (
//             response: ISocketActionResponse
//         ) => void
//     ) => void;

//     "project:join": (
//         projectId: string,
//         acknowledge: (
//             response: ISocketActionResponse
//         ) => void
//     ) => void;

//     "project:leave": (
//         projectId: string,
//         acknowledge: (
//             response: ISocketActionResponse
//         ) => void
//     ) => void;

//         "tasks:reordered": (payload: {
//     workspaceId: string;

//     projectId: string;

//     actorId: string;

//     affectedStatuses:
//         TaskStatus[];
// }) => void;


// }

// /*
// |--------------------------------------------------------------------------
// | Inter-Server Events
// |--------------------------------------------------------------------------
// |
// | This will become useful when Redis connects multiple
// | backend server instances.
// |
// | It is empty for the single-server MVP.
// |
// */

// export interface InterServerEvents {}

// /*
// |--------------------------------------------------------------------------
// | Socket Data
// |--------------------------------------------------------------------------
// |
// | socket.data stores server-trusted data associated
// | with one authenticated connection.
// |
// */

// export interface SocketData {
//     userId: string;

//     email: string;

//     username: string;
// }

// export interface ProjectAccessRevokedSocketPayload {
//     workspaceId: string;

//     projectId: string;

//     reason:
//         "removed" |
//         "left";
// }

// export interface WorkspaceAccessRevokedSocketPayload {
//     workspaceId: string;

//     projectIds: string[];

//     reason:
//         "removed" |
//         "left";
// }

import type {
    UserSessionRevocationReason,
} from "./domainEvent.interface";

import type {
    TaskStatus,
    TaskType,
} from "../modules/tasks/task.model";

/*
|--------------------------------------------------------------------------
| Shared Socket Response
|--------------------------------------------------------------------------
|
| Used by Socket.IO acknowledgement callbacks.
|
*/

export interface ISocketActionResponse {
    success: boolean;
    message: string;
}

/*
|--------------------------------------------------------------------------
| Shared Server Payloads
|--------------------------------------------------------------------------
*/

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
    reason:
        | "removed"
        | "left";
}

export interface WorkspaceAccessRevokedSocketPayload {
    workspaceId: string;
    projectIds: string[];
    reason:
        | "removed"
        | "left";
}

export interface AccountSessionRevokedSocketPayload {
    reason: UserSessionRevocationReason;
}

/*
|--------------------------------------------------------------------------
| Server → Client Events
|--------------------------------------------------------------------------
|
| Events the backend may emit to authenticated frontend clients.
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

    "tasks:reordered": (payload: {
        workspaceId: string;
        projectId: string;
        actorId: string;
        affectedStatuses: TaskStatus[];
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
        payload: DocumentSocketPayload
    ) => void;

    "document:updated": (
        payload: DocumentSocketPayload
    ) => void;

    "document:archived": (
        payload: DocumentSocketPayload
    ) => void;

    "document:restored": (
        payload: DocumentSocketPayload
    ) => void;

    "discussion:changed": (
        payload: DiscussionSocketPayload
    ) => void;

    "discussion:reply-changed": (
        payload: DiscussionReplySocketPayload
    ) => void;

    "access:project-revoked": (
        payload: ProjectAccessRevokedSocketPayload
    ) => void;

    "access:workspace-revoked": (
        payload: WorkspaceAccessRevokedSocketPayload
    ) => void;

    /**
     * Emitted immediately after the backend revokes every session for the
     * authenticated account because of logout, password change/reset, or
     * account deletion.
     *
     * The server disconnects all sockets in the user's private room after
     * emitting this event.
     */
    "account:session-revoked": (
        payload: AccountSessionRevokedSocketPayload
    ) => void;
}

/*
|--------------------------------------------------------------------------
| Client → Server Events
|--------------------------------------------------------------------------
|
| Events authenticated frontend clients may emit to the backend.
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

    /**
     * Retained for compatibility with the existing task-board socket
     * contract. Task reordering is normally persisted through the REST API;
     * the server broadcasts the corresponding server event after success.
     */
    "tasks:reordered": (payload: {
        workspaceId: string;
        projectId: string;
        actorId: string;
        affectedStatuses: TaskStatus[];
    }) => void;
}

/*
|--------------------------------------------------------------------------
| Inter-Server Events
|--------------------------------------------------------------------------
|
| Reserved for a future Redis Socket.IO adapter.
|
*/

export interface InterServerEvents {}

/*
|--------------------------------------------------------------------------
| Trusted Socket Data
|--------------------------------------------------------------------------
|
| Data populated by the server-side Socket.IO authentication middleware.
|
*/

export interface SocketData {
    userId: string;
    email: string;
    username: string;

    /**
     * Database session version verified during the socket handshake.
     * It allows later middleware/handlers to know which account session
     * version authenticated this connection.
     */
    sessionVersion: number;
}