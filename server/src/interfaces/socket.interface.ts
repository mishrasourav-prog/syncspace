import type {
    TaskStatus,
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
    }) => void;

    "task:status-changed": (payload: {
        workspaceId: string;

        projectId: string;

        taskId: string;

        actorId: string;

        title: string;

        previousStatus: TaskStatus;

        currentStatus: TaskStatus;
    }) => void;

    "task:assigned": (payload: {
        workspaceId: string;

        projectId: string;

        taskId: string;

        actorId: string;

        assigneeId: string;

        title: string;
    }) => void;

    "notification:new": (payload: {
        notificationId: string;
    }) => void;

    "activity:new": (payload: {
        activityId: string;

        workspaceId: string;

        projectId: string;
    }) => void;
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