// import {
//     DomainEventName,
//     eventBus,
// } from "../../events";

// import TaskAssignee from "../taskAssignee/taskAssignee.model";

// import {
//     NotificationEntityType,
//     NotificationType,
// } from "./notification.model";

// import notificationService from "./notification.service";

// import {
//     TaskType,
// } from "../tasks/task.model";

// let isRegistered =
//     false;

// export const registerNotificationSubscribers =
//     (): void => {
//         if (isRegistered) {
//             return;
//         }

//         isRegistered =
//             true;

//         /*
//         |--------------------------------------------------------------------------
//         | Task Assigned
//         |--------------------------------------------------------------------------
//         */

//         eventBus.subscribe(
//             DomainEventName.TASK_ASSIGNED,
//             async (event) => {
//                 /*
//                 Do not notify a user when they assign
//                 the task to themselves.
//                 */
//                 if (
//                     event.payload.actorId ===
//                     event.payload.recipientId
//                 ) {
//                     return;
//                 }
//                 const itemLabel =
//     event.payload.taskType ===
//     TaskType.ISSUE
//         ? "Issue"
//         : "Task";

//     //             const notificationId =
//     // await notificationService.createNotification({
//     //     recipientId:
//     //         event.payload.recipientId,

//     //     actorId:
//     //         event.payload.actorId,

//     //     type:
//     //         NotificationType.TASK_ASSIGNED,

//     //     title:
//     //         "Task assigned",

//     //     message:
//     //         `You were assigned to "${event.payload.title}".`,

//     //     workspaceId:
//     //         event.payload.workspaceId,

//     //     projectId:
//     //         event.payload.projectId,

//     //     entityType:
//     //         NotificationEntityType.TASK,

//     //     entityId:
//     //         event.payload.taskId,

//     //     metadata: {
//     //         taskTitle:
//     //             event.payload.title,
//     //     },
//     //      taskType:
//     //                 event.payload.taskType,

//     const notificationId =
//     await notificationService
//         .createNotification({
//             recipientId:
//                 event.payload.recipientId,

//             actorId:
//                 event.payload.actorId,

//             type:
//                 NotificationType.TASK_ASSIGNED,

//             title:
//                 `${itemLabel} assigned`,

//             message:
//                 `You were assigned to ${itemLabel.toLowerCase()} "${event.payload.title}".`,

//             workspaceId:
//                 event.payload.workspaceId,

//             projectId:
//                 event.payload.projectId,

//             entityType:
//                 NotificationEntityType.TASK,

//             entityId:
//                 event.payload.taskId,

//             metadata: {
//                 taskTitle:
//                     event.payload.title,

//                 taskType:
//                     event.payload.taskType,
//             },
//     });

// await eventBus.publish(
//     DomainEventName.NOTIFICATION_CREATED,
//     {
//         notificationId,

//         recipientId:
//             event.payload.recipientId,
//     }
// );
//             }
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | Task Status Changed
//         |--------------------------------------------------------------------------
//         */

//         eventBus.subscribe(
//             DomainEventName.TASK_STATUS_CHANGED,
//             async (event) => {
//                 const assignments =
//                     await TaskAssignee.find({
//                         task:
//                             event.payload.taskId,

//                         user: {
//                             $ne:
//                                 event.payload.actorId,
//                         },
//                     })
//                         .select(
//                             "user"
//                         )
//                         .lean();

//                 for (
//     const assignment of assignments
// ) {
//     const recipientId =
//         assignment.user.toString();

//     const notificationId =
//         await notificationService.createNotification({
//             recipientId,

//             actorId:
//                 event.payload.actorId,

//             type:
//                 NotificationType.TASK_STATUS_CHANGED,

//             title:
//                 "Task status changed",

//             message:
//                 `"${event.payload.title}" moved from ${event.payload.previousStatus} to ${event.payload.currentStatus}.`,

//             workspaceId:
//                 event.payload.workspaceId,

//             projectId:
//                 event.payload.projectId,

//             entityType:
//                 NotificationEntityType.TASK,

//             entityId:
//                 event.payload.taskId,

//             metadata: {
//                 taskTitle:
//                     event.payload.title,

//                 previousStatus:
//                     event.payload.previousStatus,

//                 currentStatus:
//                     event.payload.currentStatus,
//             },
//         });

//     await eventBus.publish(
//         DomainEventName.NOTIFICATION_CREATED,
//         {
//             notificationId,

//             recipientId,
//         }
//     );
//             /*
//         |--------------------------------------------------------------------------
//         | Discussion Reply Created
//         |--------------------------------------------------------------------------
//         |
//         | When someone replies to a discussion, notify the original
//         | discussion author.
//         |
//         */

//         eventBus.subscribe(
//             DomainEventName.DISCUSSION_REPLY_CREATED,
//             async (event) => {
//                 /*
//                 Do not notify the discussion author when they
//                 reply to their own discussion.
//                 */

//                 if (
//                     event.payload.actorId ===
//                     event.payload.discussionAuthorId
//                 ) {
//                     return;
//                 }

//                 const notificationId =
//                     await notificationService
//                         .createNotification({
//                             recipientId:
//                                 event.payload
//                                     .discussionAuthorId,

//                             actorId:
//                                 event.payload.actorId,

//                             type:
//                                 NotificationType
//                                     .DISCUSSION_REPLY,

//                             title:
//                                 "New discussion reply",

//                             message:
//                                 `Someone replied to "${event.payload.title}".`,

//                             workspaceId:
//                                 event.payload.workspaceId,

//                             projectId:
//                                 event.payload.projectId,

//                             entityType:
//                                 NotificationEntityType
//                                     .DISCUSSION,

//                             entityId:
//                                 event.payload
//                                     .discussionId,

//                             metadata: {
//                                 discussionTitle:
//                                     event.payload.title,

//                                 replyId:
//                                     event.payload.replyId,
//                             },
//                         });

//                 /*
//                 The notification is now safely stored in MongoDB.

//                 Publish another event so the Socket.IO subscriber
//                 can tell the recipient's connected devices.
//                 */

//                 await eventBus.publish(
//                     DomainEventName.NOTIFICATION_CREATED,
//                     {
//                         notificationId,

//                         recipientId:
//                             event.payload
//                                 .discussionAuthorId,
//                     }
//                 );
//             }
//         );
// }
//             }
//         );
//     };


import {
    DomainEventName,
    eventBus,
} from "../../events";

import TaskAssignee from "../taskAssignee/taskAssignee.model";

import {
    TaskType,
} from "../tasks/task.model";

import {
    NotificationEntityType,
    NotificationType,
} from "./notification.model";

import notificationService from "./notification.service";

let isRegistered =
    false;

export const registerNotificationSubscribers =
    (): void => {
        if (
            isRegistered
        ) {
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

                const itemLabel =
                    event.payload.taskType ===
                    TaskType.ISSUE
                        ? "Issue"
                        : "Task";

                const notificationId =
                    await notificationService
                        .createNotification({
                            recipientId:
                                event.payload.recipientId,

                            actorId:
                                event.payload.actorId,

                            type:
                                NotificationType.TASK_ASSIGNED,

                            title:
                                `${itemLabel} assigned`,

                            message:
                                `You were assigned to ${itemLabel.toLowerCase()} "${event.payload.title}".`,

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

                                taskType:
                                    event.payload.taskType,
                            },
                        });

                await eventBus.publish(
                    DomainEventName.NOTIFICATION_CREATED,
                    {
                        notificationId,

                        recipientId:
                            event.payload.recipientId,
                    }
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
                    const assignment of assignments
                ) {
                    const recipientId =
                        assignment.user.toString();

                    const notificationId =
                        await notificationService
                            .createNotification({
                                recipientId,

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

                    await eventBus.publish(
                        DomainEventName.NOTIFICATION_CREATED,
                        {
                            notificationId,

                            recipientId,
                        }
                    );
                }
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Discussion Reply Created
        |--------------------------------------------------------------------------
        |
        | When someone replies to a discussion, notify the original
        | discussion author.
        |
        */

        eventBus.subscribe(
            DomainEventName.DISCUSSION_REPLY_CREATED,
            async (event) => {
                /*
                Do not notify the discussion author when they
                reply to their own discussion.
                */
                if (
                    event.payload.actorId ===
                    event.payload.discussionAuthorId
                ) {
                    return;
                }

                const notificationId =
                    await notificationService
                        .createNotification({
                            recipientId:
                                event.payload.discussionAuthorId,

                            actorId:
                                event.payload.actorId,

                            type:
                                NotificationType.DISCUSSION_REPLY,

                            title:
                                "New discussion reply",

                            message:
                                `Someone replied to "${event.payload.title}".`,

                            workspaceId:
                                event.payload.workspaceId,

                            projectId:
                                event.payload.projectId,

                            entityType:
                                NotificationEntityType.DISCUSSION,

                            entityId:
                                event.payload.discussionId,

                            metadata: {
                                discussionTitle:
                                    event.payload.title,

                                replyId:
                                    event.payload.replyId,
                            },
                        });

                await eventBus.publish(
                    DomainEventName.NOTIFICATION_CREATED,
                    {
                        notificationId,

                        recipientId:
                            event.payload.discussionAuthorId,
                    }
                );
            }
        );
    };