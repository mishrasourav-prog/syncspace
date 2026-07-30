import { DomainEventName, eventBus } from "../events";

import type {
  DiscussionChangedEventPayload,
  DiscussionReplyChangedEventPayload,
} from "../interfaces/domainEvent.interface";

import type {
  DiscussionChange,
  DiscussionReplyChange,
} from "../interfaces/socket.interface";

import { getProjectRoom, getUserRoom, getWorkspaceRoom } from "./socket.rooms";

import { getSocketServer } from "./socket.server";

let isRegistered = false;

const emitDiscussionChange = (
  payload: DiscussionChangedEventPayload,
  change: DiscussionChange,
): void => {
  const io = getSocketServer();

  io.to(getProjectRoom(payload.projectId)).emit("discussion:changed", {
    ...payload,
    change,
  });
};

const emitDiscussionReplyChange = (
  payload: DiscussionReplyChangedEventPayload,
  change: DiscussionReplyChange,
): void => {
  const io = getSocketServer();

  io.to(getProjectRoom(payload.projectId)).emit("discussion:reply-changed", {
    workspaceId: payload.workspaceId,

    projectId: payload.projectId,

    discussionId: payload.discussionId,

    replyId: payload.replyId,

    actorId: payload.actorId,

    title: payload.title,

    change,
  });
};

export const registerSocketSubscribers = (): void => {
  if (isRegistered) {
    return;
  }

  isRegistered = true;

  eventBus.subscribe(DomainEventName.TASK_CREATED, async (event) => {
    const io = getSocketServer();

    io.to(getProjectRoom(event.payload.projectId)).emit(
      "task:created",
      event.payload,
    );
  });

  eventBus.subscribe(DomainEventName.TASK_UPDATED, async (event) => {
    const io = getSocketServer();
    io.to(getProjectRoom(event.payload.projectId)).emit(
      "task:updated",
      event.payload,
    );
  });

  eventBus.subscribe(DomainEventName.TASK_STATUS_CHANGED, async (event) => {
    const io = getSocketServer();

    io.to(getProjectRoom(event.payload.projectId)).emit(
      "task:status-changed",
      event.payload,
    );
  });

  eventBus.subscribe(DomainEventName.TASK_ASSIGNED, async (event) => {
    const io = getSocketServer();

    io.to(getProjectRoom(event.payload.projectId)).emit("task:assigned", {
      workspaceId: event.payload.workspaceId,

      projectId: event.payload.projectId,

      taskId: event.payload.taskId,

      actorId: event.payload.actorId,

      assigneeId: event.payload.recipientId,

      title: event.payload.title,

      taskType: event.payload.taskType,
    });
  });

  eventBus.subscribe(DomainEventName.TASK_UNASSIGNED, async (event) => {
    const io = getSocketServer();
    io.to(getProjectRoom(event.payload.projectId)).emit(
      "task:unassigned",
      event.payload,
    );
  });

  eventBus.subscribe(
    DomainEventName.TASK_ASSIGNMENT_REQUESTED,
    async (event) => {
      const io = getSocketServer();
      io.to(getProjectRoom(event.payload.projectId)).emit(
        "task:assignment-requested",
        event.payload,
      );
    },
  );

  eventBus.subscribe(
    DomainEventName.TASK_ASSIGNMENT_REQUEST_ACCEPTED,
    async (event) => {
      const io = getSocketServer();
      io.to(getProjectRoom(event.payload.projectId)).emit(
        "task:assignment-request-accepted",
        event.payload,
      );
    },
  );

  const emitTaskCommentChange = (
    event: {
      payload: {
        workspaceId: string;
        projectId: string;
        taskId: string;
        commentId: string;
        actorId: string;
      };
    },
    change: "created" | "updated" | "deleted",
  ) => {
    const io = getSocketServer();
    io.to(getProjectRoom(event.payload.projectId)).emit(
      "task:comment-changed",
      { ...event.payload, change },
    );
  };

  eventBus.subscribe(DomainEventName.TASK_COMMENT_CREATED, async (event) =>
    emitTaskCommentChange(event, "created"),
  );

  eventBus.subscribe(DomainEventName.TASK_COMMENT_UPDATED, async (event) =>
    emitTaskCommentChange(event, "updated"),
  );

  eventBus.subscribe(DomainEventName.TASK_COMMENT_DELETED, async (event) =>
    emitTaskCommentChange(event, "deleted"),
  );

  eventBus.subscribe(DomainEventName.TASKS_REORDERED, async (event) => {
    const io = getSocketServer();

    io.to(getProjectRoom(event.payload.projectId)).emit(
      "tasks:reordered",
      event.payload,
    );
  });

  eventBus.subscribe(DomainEventName.NOTIFICATION_CREATED, async (event) => {
    const io = getSocketServer();

    io.to(getUserRoom(event.payload.recipientId)).emit("notification:new", {
      notificationId: event.payload.notificationId,
    });
  });

  eventBus.subscribe(DomainEventName.ACTIVITY_CREATED, async (event) => {
    const io = getSocketServer();

    io.to(getWorkspaceRoom(event.payload.workspaceId))
      .to(getProjectRoom(event.payload.projectId))
      .emit("activity:new", {
        activityId: event.payload.activityId,

        workspaceId: event.payload.workspaceId,

        projectId: event.payload.projectId,
      });
  });

  eventBus.subscribe(DomainEventName.DOCUMENT_CREATED, async (event) => {
    const io = getSocketServer();

    io.to(getProjectRoom(event.payload.projectId)).emit(
      "document:created",
      event.payload,
    );
  });

  eventBus.subscribe(DomainEventName.DOCUMENT_UPDATED, async (event) => {
    const io = getSocketServer();

    io.to(getProjectRoom(event.payload.projectId)).emit(
      "document:updated",
      event.payload,
    );
  });

  eventBus.subscribe(DomainEventName.DOCUMENT_ARCHIVED, async (event) => {
    const io = getSocketServer();

    io.to(getProjectRoom(event.payload.projectId)).emit(
      "document:archived",
      event.payload,
    );
  });

  eventBus.subscribe(DomainEventName.DOCUMENT_RESTORED, async (event) => {
    const io = getSocketServer();

    io.to(getProjectRoom(event.payload.projectId)).emit(
      "document:restored",
      event.payload,
    );
  });

  eventBus.subscribe(DomainEventName.DISCUSSION_CREATED, async (event) => {
    emitDiscussionChange(event.payload, "created");
  });

  eventBus.subscribe(DomainEventName.DISCUSSION_UPDATED, async (event) => {
    emitDiscussionChange(event.payload, "updated");
  });

  eventBus.subscribe(DomainEventName.DISCUSSION_DELETED, async (event) => {
    emitDiscussionChange(event.payload, "deleted");
  });

  eventBus.subscribe(DomainEventName.DISCUSSION_PINNED, async (event) => {
    emitDiscussionChange(event.payload, "pinned");
  });

  eventBus.subscribe(DomainEventName.DISCUSSION_UNPINNED, async (event) => {
    emitDiscussionChange(event.payload, "unpinned");
  });

  eventBus.subscribe(DomainEventName.DISCUSSION_LOCKED, async (event) => {
    emitDiscussionChange(event.payload, "locked");
  });

  eventBus.subscribe(DomainEventName.DISCUSSION_UNLOCKED, async (event) => {
    emitDiscussionChange(event.payload, "unlocked");
  });

  eventBus.subscribe(
    DomainEventName.DISCUSSION_REPLY_CREATED,
    async (event) => {
      emitDiscussionReplyChange(event.payload, "created");
    },
  );

  eventBus.subscribe(
    DomainEventName.DISCUSSION_REPLY_UPDATED,
    async (event) => {
      emitDiscussionReplyChange(event.payload, "updated");
    },
  );

  eventBus.subscribe(
    DomainEventName.DISCUSSION_REPLY_DELETED,
    async (event) => {
      emitDiscussionReplyChange(event.payload, "deleted");
    },
  );

  eventBus.subscribe(DomainEventName.WORKSPACE_MEMBER_ADDED, async (event) => {
    const io = getSocketServer();
    const userRoom = getUserRoom(event.payload.affectedUserId);
    const workspaceRoom = getWorkspaceRoom(event.payload.workspaceId);

    io.in(userRoom).socketsJoin(workspaceRoom);
    io.to(workspaceRoom).emit("workspace:member-added", event.payload);
  });

  eventBus.subscribe(DomainEventName.PROJECT_MEMBER_ADDED, async (event) => {
    const io = getSocketServer();
    const userRoom = getUserRoom(event.payload.affectedUserId);
    const projectRoom = getProjectRoom(event.payload.projectId);

    io.in(userRoom).socketsJoin(projectRoom);
    io.to(projectRoom).emit("project:member-added", event.payload);
  });

  eventBus.subscribe(
    DomainEventName.WORKSPACE_MEMBER_ROLE_CHANGED,
    async (event) => {
      const io = getSocketServer();
      io.to(getWorkspaceRoom(event.payload.workspaceId))
        .to(getUserRoom(event.payload.affectedUserId))
        .emit("workspace:member-role-changed", event.payload);
    },
  );

  eventBus.subscribe(
    DomainEventName.PROJECT_MEMBER_ROLE_CHANGED,
    async (event) => {
      const io = getSocketServer();
      io.to(getProjectRoom(event.payload.projectId))
        .to(getUserRoom(event.payload.affectedUserId))
        .emit("project:member-role-changed", event.payload);
    },
  );

  eventBus.subscribe(
    DomainEventName.PROJECT_MEMBERSHIP_ENDED,
    async (event) => {
      const io = getSocketServer();

      const userRoom = getUserRoom(event.payload.affectedUserId);

      io.in(userRoom).socketsLeave(getProjectRoom(event.payload.projectId));

      io.to(userRoom).emit("access:project-revoked", {
        workspaceId: event.payload.workspaceId,

        projectId: event.payload.projectId,

        reason: event.payload.reason,
      });
    },
  );

  eventBus.subscribe(
    DomainEventName.WORKSPACE_MEMBERSHIP_ENDED,
    async (event) => {
      const io = getSocketServer();

      const userRoom = getUserRoom(event.payload.affectedUserId);

      io.in(userRoom).socketsLeave(getWorkspaceRoom(event.payload.workspaceId));

      for (const projectId of event.payload.projectIds) {
        io.in(userRoom).socketsLeave(getProjectRoom(projectId));
      }

      io.to(userRoom).emit("access:workspace-revoked", {
        workspaceId: event.payload.workspaceId,

        projectIds: event.payload.projectIds,

        reason: event.payload.reason,
      });
    },
  );

  eventBus.subscribe(DomainEventName.USER_SESSION_REVOKED, async (event) => {
    const io = getSocketServer();

    const userRoom = getUserRoom(event.payload.userId);

    io.to(userRoom).emit("account:session-revoked", {
      reason: event.payload.reason,
    });

    io.in(userRoom).disconnectSockets(true);
  });
};
