import {
    DomainEventName,
    eventBus,
} from "../../events";

import type {
    DiscussionChangedEventPayload,
    DiscussionReplyChangedEventPayload,
    DocumentChangedEventPayload,
} from "../../events";

import {
    ActivityAction,
    ActivityEntityType,
} from "./activity.model";

import activityService from "./activity.service";

let isRegistered = false;

export const registerActivitySubscribers =
    (): void => {
        /*
        Prevent duplicate subscriptions during
        development reloads or repeated test setup.
        */
        if (isRegistered) {
            return;
        }

        isRegistered = true;

        /*
        |--------------------------------------------------------------------------
        | Task Created
        |--------------------------------------------------------------------------
        */

        eventBus.subscribe(
            DomainEventName.TASK_CREATED,
            async (event) => {
                const activityId =
                    await activityService.createActivity({
                        workspaceId:
                            event.payload.workspaceId,

                        projectId:
                            event.payload.projectId,

                        actorId:
                            event.payload.actorId,

                        action:
                            ActivityAction.TASK_CREATED,

                        entityType:
                            ActivityEntityType.TASK,

                        entityId:
                            event.payload.taskId,

                        metadata: {
                            title:
                                event.payload.title,

                            status:
                                event.payload.status,

                            taskType:
                                event.payload.taskType,
                        },
                    });

                await eventBus.publish(
                    DomainEventName.ACTIVITY_CREATED,
                    {
                        activityId,

                        workspaceId:
                            event.payload.workspaceId,

                        projectId:
                            event.payload.projectId,
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
                const activityId =
                    await activityService.createActivity({
                        workspaceId:
                            event.payload.workspaceId,

                        projectId:
                            event.payload.projectId,

                        actorId:
                            event.payload.actorId,

                        action:
                            ActivityAction
                                .TASK_STATUS_CHANGED,

                        entityType:
                            ActivityEntityType.TASK,

                        entityId:
                            event.payload.taskId,

                        metadata: {
                            title:
                                event.payload.title,

                            previousStatus:
                                event.payload.previousStatus,

                            currentStatus:
                                event.payload.currentStatus,

                            taskType:
                                event.payload.taskType,
                        },
                    });

                await eventBus.publish(
                    DomainEventName.ACTIVITY_CREATED,
                    {
                        activityId,

                        workspaceId:
                            event.payload.workspaceId,

                        projectId:
                            event.payload.projectId,
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Document Activity Helper
        |--------------------------------------------------------------------------
        |
        | All document events perform almost the same operation.
        | This helper prevents repeating the activity creation
        | and ACTIVITY_CREATED publishing logic.
        |
        */

        const createDocumentActivity =
            async (
                payload:
                    DocumentChangedEventPayload,
                action:
                    ActivityAction
            ): Promise<void> => {
                const activityId =
                    await activityService.createActivity({
                        workspaceId:
                            payload.workspaceId,

                        projectId:
                            payload.projectId,

                        actorId:
                            payload.actorId,

                        action,

                        entityType:
                            ActivityEntityType.DOCUMENT,

                        entityId:
                            payload.documentId,

                        metadata: {
                            title:
                                payload.title,

                            revision:
                                payload.revision,
                        },
                    });

                await eventBus.publish(
                    DomainEventName.ACTIVITY_CREATED,
                    {
                        activityId,

                        workspaceId:
                            payload.workspaceId,

                        projectId:
                            payload.projectId,
                    }
                );
            };

        /*
        |--------------------------------------------------------------------------
        | Document Created
        |--------------------------------------------------------------------------
        */

        eventBus.subscribe(
            DomainEventName.DOCUMENT_CREATED,
            async (event) => {
                await createDocumentActivity(
                    event.payload,
                    ActivityAction.DOCUMENT_CREATED
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Document Updated
        |--------------------------------------------------------------------------
        */

        eventBus.subscribe(
            DomainEventName.DOCUMENT_UPDATED,
            async (event) => {
                await createDocumentActivity(
                    event.payload,
                    ActivityAction.DOCUMENT_UPDATED
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Document Archived
        |--------------------------------------------------------------------------
        */

        eventBus.subscribe(
            DomainEventName.DOCUMENT_ARCHIVED,
            async (event) => {
                await createDocumentActivity(
                    event.payload,
                    ActivityAction.DOCUMENT_ARCHIVED
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Document Restored
        |--------------------------------------------------------------------------
        */

        eventBus.subscribe(
            DomainEventName.DOCUMENT_RESTORED,
            async (event) => {
                await createDocumentActivity(
                    event.payload,
                    ActivityAction.DOCUMENT_RESTORED
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Discussion Activity Helper
        |--------------------------------------------------------------------------
        |
        | This helper creates activity records for changes made
        | directly to a discussion.
        |
        */

        const createDiscussionActivity =
            async (
                payload:
                    DiscussionChangedEventPayload,
                action:
                    ActivityAction
            ): Promise<void> => {
                const activityId =
                    await activityService.createActivity({
                        workspaceId:
                            payload.workspaceId,

                        projectId:
                            payload.projectId,

                        actorId:
                            payload.actorId,

                        action,

                        entityType:
                            ActivityEntityType.DISCUSSION,

                        entityId:
                            payload.discussionId,

                        metadata: {
                            title:
                                payload.title,
                        },
                    });

                await eventBus.publish(
                    DomainEventName.ACTIVITY_CREATED,
                    {
                        activityId,

                        workspaceId:
                            payload.workspaceId,

                        projectId:
                            payload.projectId,
                    }
                );
            };

        /*
        |--------------------------------------------------------------------------
        | Discussion Reply Activity Helper
        |--------------------------------------------------------------------------
        |
        | Reply activity uses the reply as the activity entity.
        | The parent discussion ID is retained inside metadata.
        |
        */

        const createDiscussionReplyActivity =
            async (
                payload:
                    DiscussionReplyChangedEventPayload,
                action:
                    ActivityAction
            ): Promise<void> => {
                const activityId =
                    await activityService.createActivity({
                        workspaceId:
                            payload.workspaceId,

                        projectId:
                            payload.projectId,

                        actorId:
                            payload.actorId,

                        action,

                        entityType:
                            ActivityEntityType
                                .DISCUSSION_REPLY,

                        entityId:
                            payload.replyId,

                        metadata: {
                            discussionId:
                                payload.discussionId,

                            title:
                                payload.title,
                        },
                    });

                await eventBus.publish(
                    DomainEventName.ACTIVITY_CREATED,
                    {
                        activityId,

                        workspaceId:
                            payload.workspaceId,

                        projectId:
                            payload.projectId,
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
                await createDiscussionActivity(
                    event.payload,
                    ActivityAction.DISCUSSION_CREATED
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
                await createDiscussionActivity(
                    event.payload,
                    ActivityAction.DISCUSSION_UPDATED
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
                await createDiscussionActivity(
                    event.payload,
                    ActivityAction.DISCUSSION_DELETED
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
                await createDiscussionActivity(
                    event.payload,
                    ActivityAction.DISCUSSION_PINNED
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
                await createDiscussionActivity(
                    event.payload,
                    ActivityAction.DISCUSSION_UNPINNED
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
                await createDiscussionActivity(
                    event.payload,
                    ActivityAction.DISCUSSION_LOCKED
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
                await createDiscussionActivity(
                    event.payload,
                    ActivityAction.DISCUSSION_UNLOCKED
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
                await createDiscussionReplyActivity(
                    event.payload,
                    ActivityAction
                        .DISCUSSION_REPLY_CREATED
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
                await createDiscussionReplyActivity(
                    event.payload,
                    ActivityAction
                        .DISCUSSION_REPLY_UPDATED
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
                await createDiscussionReplyActivity(
                    event.payload,
                    ActivityAction
                        .DISCUSSION_REPLY_DELETED
                );
            }
        );
    };