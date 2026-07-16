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

                        taskType: event.payload.taskType,
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
            })
            eventBus.subscribe(
    DomainEventName.DOCUMENT_CREATED,
    async (event) => {
        const io =
            getSocketServer();

        io.to(
            getProjectRoom(
                event.payload.projectId
            )
        ).emit(
            "document:created",
            event.payload
        );
    }
);

eventBus.subscribe(
    DomainEventName.DOCUMENT_UPDATED,
    async (event) => {
        const io =
            getSocketServer();

        io.to(
            getProjectRoom(
                event.payload.projectId
            )
        ).emit(
            "document:updated",
            event.payload
        );
    }
);

eventBus.subscribe(
    DomainEventName.DOCUMENT_ARCHIVED,
    async (event) => {
        const io =
            getSocketServer();

        io.to(
            getProjectRoom(
                event.payload.projectId
            )
        ).emit(
            "document:archived",
            event.payload
        );
    }
);

eventBus.subscribe(
    DomainEventName.DOCUMENT_RESTORED,
    async (event) => {
        const io =
            getSocketServer();

        io.to(
            getProjectRoom(
                event.payload.projectId
            )
        ).emit(
            "document:restored",
            event.payload
        );
    }

        );

            /*
        |--------------------------------------------------------------------------
        | Discussion Socket Helper
        |--------------------------------------------------------------------------
        */

        const emitDiscussionChange = (
            payload: {
                workspaceId: string;

                projectId: string;

                discussionId: string;

                actorId: string;

                title: string;
            },
            change:
                | "created"
                | "updated"
                | "deleted"
                | "pinned"
                | "unpinned"
                | "locked"
                | "unlocked"
        ): void => {
            const io =
                getSocketServer();

            io.to(
                getProjectRoom(
                    payload.projectId
                )
            ).emit(
                "discussion:changed",
                {
                    workspaceId:
                        payload.workspaceId,

                    projectId:
                        payload.projectId,

                    discussionId:
                        payload.discussionId,

                    actorId:
                        payload.actorId,

                    title:
                        payload.title,

                    change,
                }
            );
        };

        /*
        |--------------------------------------------------------------------------
        | Discussion Reply Socket Helper
        |--------------------------------------------------------------------------
        */

        const emitDiscussionReplyChange = (
            payload: {
                workspaceId: string;

                projectId: string;

                discussionId: string;

                replyId: string;

                actorId: string;

                title: string;
            },
            change:
                | "created"
                | "updated"
                | "deleted"
        ): void => {
            const io =
                getSocketServer();

            io.to(
                getProjectRoom(
                    payload.projectId
                )
            ).emit(
                "discussion:reply-changed",
                {
                    workspaceId:
                        payload.workspaceId,

                    projectId:
                        payload.projectId,

                    discussionId:
                        payload.discussionId,

                    replyId:
                        payload.replyId,

                    actorId:
                        payload.actorId,

                    title:
                        payload.title,

                    change,
                }
            );
        };

                /*
        |--------------------------------------------------------------------------
        | Discussion Created
        |--------------------------------------------------------------------------
        */

        eventBus.subscribe(
            DomainEventName.DISCUSSION_CREATED,
            async (event) => {
                emitDiscussionChange(
                    event.payload,
                    "created"
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Discussion Updated
        |--------------------------------------------------------------------------
        */

        eventBus.subscribe(
            DomainEventName.DISCUSSION_UPDATED,
            async (event) => {
                emitDiscussionChange(
                    event.payload,
                    "updated"
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Discussion Deleted
        |--------------------------------------------------------------------------
        */

        eventBus.subscribe(
            DomainEventName.DISCUSSION_DELETED,
            async (event) => {
                emitDiscussionChange(
                    event.payload,
                    "deleted"
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Discussion Pinned
        |--------------------------------------------------------------------------
        */

        eventBus.subscribe(
            DomainEventName.DISCUSSION_PINNED,
            async (event) => {
                emitDiscussionChange(
                    event.payload,
                    "pinned"
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Discussion Unpinned
        |--------------------------------------------------------------------------
        */

        eventBus.subscribe(
            DomainEventName.DISCUSSION_UNPINNED,
            async (event) => {
                emitDiscussionChange(
                    event.payload,
                    "unpinned"
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Discussion Locked
        |--------------------------------------------------------------------------
        */

        eventBus.subscribe(
            DomainEventName.DISCUSSION_LOCKED,
            async (event) => {
                emitDiscussionChange(
                    event.payload,
                    "locked"
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Discussion Unlocked
        |--------------------------------------------------------------------------
        */

        eventBus.subscribe(
            DomainEventName.DISCUSSION_UNLOCKED,
            async (event) => {
                emitDiscussionChange(
                    event.payload,
                    "unlocked"
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Discussion Reply Created
        |--------------------------------------------------------------------------
        */

        eventBus.subscribe(
            DomainEventName.DISCUSSION_REPLY_CREATED,
            async (event) => {
                emitDiscussionReplyChange(
                    event.payload,
                    "created"
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Discussion Reply Updated
        |--------------------------------------------------------------------------
        */

        eventBus.subscribe(
            DomainEventName.DISCUSSION_REPLY_UPDATED,
            async (event) => {
                emitDiscussionReplyChange(
                    event.payload,
                    "updated"
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Discussion Reply Deleted
        |--------------------------------------------------------------------------
        */

        eventBus.subscribe(
            DomainEventName.DISCUSSION_REPLY_DELETED,
            async (event) => {
                emitDiscussionReplyChange(
                    event.payload,
                    "deleted"
                );
            }
        );

        /*
|--------------------------------------------------------------------------
| Tasks Reordered
|--------------------------------------------------------------------------
*/

eventBus.subscribe(
    DomainEventName.TASKS_REORDERED,
    async (event) => {
        const io =
            getSocketServer();

        io.to(
            getProjectRoom(
                event.payload.projectId
            )
        ).emit(
            "tasks:reordered",
            event.payload
        );
    }
);

        /*
        |--------------------------------------------------------------------------
        | Project Membership Ended
        |--------------------------------------------------------------------------
        |
        | Remove every active connection belonging to the affected
        | user from the project room.
        |
        */

        eventBus.subscribe(
            DomainEventName.PROJECT_MEMBERSHIP_ENDED,
            async (event) => {
                const io =
                    getSocketServer();

                const userRoom =
                    getUserRoom(
                        event.payload
                            .affectedUserId
                    );

                const projectRoom =
                    getProjectRoom(
                        event.payload.projectId
                    );

                /*
                Select all sockets belonging to this user and
                force those sockets to leave the project room.
                */

                io.in(
                    userRoom
                ).socketsLeave(
                    projectRoom
                );

                /*
                The sockets remain connected and remain inside
                their private user room.

                Notify them that project access has ended.
                */

                io.to(
                    userRoom
                ).emit(
                    "access:project-revoked",
                    {
                        workspaceId:
                            event.payload.workspaceId,

                        projectId:
                            event.payload.projectId,

                        reason:
                            event.payload.reason,
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Workspace Membership Ended
        |--------------------------------------------------------------------------
        |
        | Workspace removal also terminates access to every project
        | inside that workspace.
        |
        */

        eventBus.subscribe(
            DomainEventName.WORKSPACE_MEMBERSHIP_ENDED,
            async (event) => {
                const io =
                    getSocketServer();

                const userRoom =
                    getUserRoom(
                        event.payload
                            .affectedUserId
                    );

                /*
                First remove every active socket belonging to this
                user from the workspace room.
                */

                io.in(
                    userRoom
                ).socketsLeave(
                    getWorkspaceRoom(
                        event.payload.workspaceId
                    )
                );

                /*
                Then remove those sockets from every project room
                associated with the workspace.
                */

                for (
                    const projectId of
                    event.payload.projectIds
                ) {
                    io.in(
                        userRoom
                    ).socketsLeave(
                        getProjectRoom(
                            projectId
                        )
                    );
                }

                io.to(
                    userRoom
                ).emit(
                    "access:workspace-revoked",
                    {
                        workspaceId:
                            event.payload.workspaceId,

                        projectIds:
                            event.payload.projectIds,

                        reason:
                            event.payload.reason,
                    }
                );
            }
        );

    
    };