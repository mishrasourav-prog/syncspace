import {
    DomainEventName,
    eventBus,
} from "../events";

import {
    getSocketServer,
} from "./socket.server";

import {
    getProjectRoom,
    getUserRoom,
    getWorkspaceRoom,
} from "./socket.rooms";

let isRegistered =
    false;

export const registerSocketSubscribers =
    (): void => {
        if (isRegistered) {
            return;
        }

        isRegistered =
            true;

        /*
        |--------------------------------------------------------------------------
        | Task Created
        |--------------------------------------------------------------------------
        */

        eventBus.subscribe(
            DomainEventName.TASK_CREATED,
            async (event) => {
                const io =
                    getSocketServer();

                io.to(
                    getProjectRoom(
                        event.payload.projectId
                    )
                ).emit(
                    "task:created",
                    event.payload
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Task Status Changed
        |--------------------------------------------------------------------------
        */

        eventBus.subscribe(
            DomainEventName.TASK_STATUS_CHANGED,
            async (event) => {
                const io =
                    getSocketServer();

                io.to(
                    getProjectRoom(
                        event.payload.projectId
                    )
                ).emit(
                    "task:status-changed",
                    event.payload
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Task Assigned
        |--------------------------------------------------------------------------
        */

        eventBus.subscribe(
            DomainEventName.TASK_ASSIGNED,
            async (event) => {
                const io =
                    getSocketServer();

                io.to(
                    getProjectRoom(
                        event.payload.projectId
                    )
                ).emit(
                    "task:assigned",
                    {
                        workspaceId:
                            event.payload.workspaceId,

                        projectId:
                            event.payload.projectId,

                        taskId:
                            event.payload.taskId,

                        actorId:
                            event.payload.actorId,

                        assigneeId:
                            event.payload.recipientId,

                        title:
                            event.payload.title,
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | New Notification
        |--------------------------------------------------------------------------
        */

        eventBus.subscribe(
            DomainEventName.NOTIFICATION_CREATED,
            async (event) => {
                const io =
                    getSocketServer();

                io.to(
                    getUserRoom(
                        event.payload.recipientId
                    )
                ).emit(
                    "notification:new",
                    {
                        notificationId:
                            event.payload.notificationId,
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | New Activity
        |--------------------------------------------------------------------------
        */

        eventBus.subscribe(
            DomainEventName.ACTIVITY_CREATED,
            async (event) => {
                const io =
                    getSocketServer();

                io.to(
                    getWorkspaceRoom(
                        event.payload.workspaceId
                    )
                )
                    .to(
                        getProjectRoom(
                            event.payload.projectId
                        )
                    )
                    .emit(
                        "activity:new",
                        {
                            activityId:
                                event.payload.activityId,

                            workspaceId:
                                event.payload.workspaceId,

                            projectId:
                                event.payload.projectId,
                        }
                    );
            }
        );
    };