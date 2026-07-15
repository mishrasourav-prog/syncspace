import {
    DomainEventName,
    eventBus,
} from "../../events";

import TaskAssignee from "../taskAssignee/taskAssignee.model";

import {
    NotificationEntityType,
    NotificationType,
} from "./notification.model";

import notificationService from "./notification.service";

let isRegistered =
    false;

export const registerNotificationSubscribers =
    (): void => {
        if (isRegistered) {
            return;
        }

        isRegistered =
            true;

        /*
        |--------------------------------------------------------------------------
        | Task Assigned
        |--------------------------------------------------------------------------
        */

        eventBus.subscribe(
            DomainEventName.TASK_ASSIGNED,
            async (event) => {
                /*
                Do not notify a user when they assign
                the task to themselves.
                */
                if (
                    event.payload.actorId ===
                    event.payload.recipientId
                ) {
                    return;
                }

                await notificationService
                    .createNotification({
                        recipientId:
                            event.payload.recipientId,

                        actorId:
                            event.payload.actorId,

                        type:
                            NotificationType.TASK_ASSIGNED,

                        title:
                            "Task assigned",

                        message:
                            `You were assigned to "${event.payload.title}".`,

                        workspaceId:
                            event.payload.workspaceId,

                        projectId:
                            event.payload.projectId,

                        entityType:
                            NotificationEntityType.TASK,

                        entityId:
                            event.payload.taskId,

                        metadata: {
                            taskTitle:
                                event.payload.title,
                        },
                    });
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
                const assignments =
                    await TaskAssignee.find({
                        task:
                            event.payload.taskId,

                        user: {
                            $ne:
                                event.payload.actorId,
                        },
                    })
                        .select(
                            "user"
                        )
                        .lean();

                for (
                    const assignment of
                    assignments
                ) {
                    await notificationService
                        .createNotification({
                            recipientId:
                                assignment.user.toString(),

                            actorId:
                                event.payload.actorId,

                            type:
                                NotificationType.TASK_STATUS_CHANGED,

                            title:
                                "Task status changed",

                            message:
                                `"${event.payload.title}" moved from ${event.payload.previousStatus} to ${event.payload.currentStatus}.`,

                            workspaceId:
                                event.payload.workspaceId,

                            projectId:
                                event.payload.projectId,

                            entityType:
                                NotificationEntityType.TASK,

                            entityId:
                                event.payload.taskId,

                            metadata: {
                                taskTitle:
                                    event.payload.title,

                                previousStatus:
                                    event.payload.previousStatus,

                                currentStatus:
                                    event.payload.currentStatus,
                            },
                        });
                }
            }
        );
    };