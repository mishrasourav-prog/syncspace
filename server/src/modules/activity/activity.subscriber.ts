import {
    DomainEventName,
    eventBus,
} from "../../events";

import {
    ActivityAction,
    ActivityEntityType,
} from "./activity.model";

import activityService from "./activity.service";

let isRegistered =
    false;

export const registerActivitySubscribers =
    (): void => {
        /*
        Prevent duplicate subscriptions during
        development reloads or repeated test setup.
        */
        if (isRegistered) {
            return;
        }

        isRegistered =
            true;

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
                    ActivityAction.TASK_STATUS_CHANGED,

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
    };