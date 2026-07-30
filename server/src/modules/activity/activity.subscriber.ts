import { DomainEventName, eventBus } from "../../events";

import type {
  DiscussionChangedEventPayload,
  DiscussionReplyChangedEventPayload,
  DocumentChangedEventPayload,
} from "../../events";

import { ActivityAction, ActivityEntityType } from "./activity.model";

import activityService from "./activity.service";

let isRegistered = false;

export const registerActivitySubscribers = (): void => {
  if (isRegistered) {
    return;
  }

  isRegistered = true;

  eventBus.subscribe(DomainEventName.TASK_CREATED, async (event) => {
    const activityId = await activityService.createActivity({
      workspaceId: event.payload.workspaceId,

      projectId: event.payload.projectId,

      actorId: event.payload.actorId,

      action: ActivityAction.TASK_CREATED,

      entityType: ActivityEntityType.TASK,

      entityId: event.payload.taskId,

      metadata: {
        title: event.payload.title,

        status: event.payload.status,

        taskType: event.payload.taskType,
      },
    });

    await eventBus.publish(DomainEventName.ACTIVITY_CREATED, {
      activityId,

      workspaceId: event.payload.workspaceId,

      projectId: event.payload.projectId,
    });
  });

  eventBus.subscribe(DomainEventName.TASK_STATUS_CHANGED, async (event) => {
    const activityId = await activityService.createActivity({
      workspaceId: event.payload.workspaceId,

      projectId: event.payload.projectId,

      actorId: event.payload.actorId,

      action: ActivityAction.TASK_STATUS_CHANGED,

      entityType: ActivityEntityType.TASK,

      entityId: event.payload.taskId,

      metadata: {
        title: event.payload.title,

        previousStatus: event.payload.previousStatus,

        currentStatus: event.payload.currentStatus,

        taskType: event.payload.taskType,
      },
    });

    await eventBus.publish(DomainEventName.ACTIVITY_CREATED, {
      activityId,

      workspaceId: event.payload.workspaceId,

      projectId: event.payload.projectId,
    });
  });

  const createDocumentActivity = async (
    payload: DocumentChangedEventPayload,
    action: ActivityAction,
  ): Promise<void> => {
    const activityId = await activityService.createActivity({
      workspaceId: payload.workspaceId,

      projectId: payload.projectId,

      actorId: payload.actorId,

      action,

      entityType: ActivityEntityType.DOCUMENT,

      entityId: payload.documentId,

      metadata: {
        title: payload.title,

        revision: payload.revision,
      },
    });

    await eventBus.publish(DomainEventName.ACTIVITY_CREATED, {
      activityId,

      workspaceId: payload.workspaceId,

      projectId: payload.projectId,
    });
  };

  eventBus.subscribe(DomainEventName.DOCUMENT_CREATED, async (event) => {
    await createDocumentActivity(
      event.payload,
      ActivityAction.DOCUMENT_CREATED,
    );
  });

  eventBus.subscribe(DomainEventName.DOCUMENT_UPDATED, async (event) => {
    await createDocumentActivity(
      event.payload,
      ActivityAction.DOCUMENT_UPDATED,
    );
  });

  eventBus.subscribe(DomainEventName.DOCUMENT_ARCHIVED, async (event) => {
    await createDocumentActivity(
      event.payload,
      ActivityAction.DOCUMENT_ARCHIVED,
    );
  });

  eventBus.subscribe(DomainEventName.DOCUMENT_RESTORED, async (event) => {
    await createDocumentActivity(
      event.payload,
      ActivityAction.DOCUMENT_RESTORED,
    );
  });

  const createDiscussionActivity = async (
    payload: DiscussionChangedEventPayload,
    action: ActivityAction,
  ): Promise<void> => {
    const activityId = await activityService.createActivity({
      workspaceId: payload.workspaceId,

      projectId: payload.projectId,

      actorId: payload.actorId,

      action,

      entityType: ActivityEntityType.DISCUSSION,

      entityId: payload.discussionId,

      metadata: {
        title: payload.title,
      },
    });

    await eventBus.publish(DomainEventName.ACTIVITY_CREATED, {
      activityId,

      workspaceId: payload.workspaceId,

      projectId: payload.projectId,
    });
  };

  const createDiscussionReplyActivity = async (
    payload: DiscussionReplyChangedEventPayload,
    action: ActivityAction,
  ): Promise<void> => {
    const activityId = await activityService.createActivity({
      workspaceId: payload.workspaceId,

      projectId: payload.projectId,

      actorId: payload.actorId,

      action,

      entityType: ActivityEntityType.DISCUSSION_REPLY,

      entityId: payload.replyId,

      metadata: {
        discussionId: payload.discussionId,

        title: payload.title,
      },
    });

    await eventBus.publish(DomainEventName.ACTIVITY_CREATED, {
      activityId,

      workspaceId: payload.workspaceId,

      projectId: payload.projectId,
    });
  };

  eventBus.subscribe(DomainEventName.DISCUSSION_CREATED, async (event) => {
    await createDiscussionActivity(
      event.payload,
      ActivityAction.DISCUSSION_CREATED,
    );
  });

  eventBus.subscribe(DomainEventName.DISCUSSION_UPDATED, async (event) => {
    await createDiscussionActivity(
      event.payload,
      ActivityAction.DISCUSSION_UPDATED,
    );
  });

  eventBus.subscribe(DomainEventName.DISCUSSION_DELETED, async (event) => {
    await createDiscussionActivity(
      event.payload,
      ActivityAction.DISCUSSION_DELETED,
    );
  });

  eventBus.subscribe(DomainEventName.DISCUSSION_PINNED, async (event) => {
    await createDiscussionActivity(
      event.payload,
      ActivityAction.DISCUSSION_PINNED,
    );
  });

  eventBus.subscribe(DomainEventName.DISCUSSION_UNPINNED, async (event) => {
    await createDiscussionActivity(
      event.payload,
      ActivityAction.DISCUSSION_UNPINNED,
    );
  });

  eventBus.subscribe(DomainEventName.DISCUSSION_LOCKED, async (event) => {
    await createDiscussionActivity(
      event.payload,
      ActivityAction.DISCUSSION_LOCKED,
    );
  });

  eventBus.subscribe(DomainEventName.DISCUSSION_UNLOCKED, async (event) => {
    await createDiscussionActivity(
      event.payload,
      ActivityAction.DISCUSSION_UNLOCKED,
    );
  });

  eventBus.subscribe(
    DomainEventName.DISCUSSION_REPLY_CREATED,
    async (event) => {
      await createDiscussionReplyActivity(
        event.payload,
        ActivityAction.DISCUSSION_REPLY_CREATED,
      );
    },
  );

  eventBus.subscribe(
    DomainEventName.DISCUSSION_REPLY_UPDATED,
    async (event) => {
      await createDiscussionReplyActivity(
        event.payload,
        ActivityAction.DISCUSSION_REPLY_UPDATED,
      );
    },
  );

  eventBus.subscribe(
    DomainEventName.DISCUSSION_REPLY_DELETED,
    async (event) => {
      await createDiscussionReplyActivity(
        event.payload,
        ActivityAction.DISCUSSION_REPLY_DELETED,
      );
    },
  );
};
