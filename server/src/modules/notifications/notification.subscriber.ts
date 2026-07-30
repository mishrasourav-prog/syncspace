import { DomainEventName, eventBus } from "../../events";

import { User } from "../auth/auth.model";
import Project from "../project/project.model";
import ProjectMember from "../projectMember/projectMember.model";
import { ProjectRole } from "../../interfaces/projectMember.interface";
import TaskAssignee from "../taskAssignee/taskAssignee.model";
import { TaskType } from "../tasks/task.model";
import { Workspace } from "../workspace/workspace.model";

import { NotificationEntityType, NotificationType } from "./notification.model";
import notificationService from "./notification.service";

let isRegistered = false;

export const registerNotificationSubscribers = (): void => {
  if (isRegistered) {
    return;
  }

  isRegistered = true;

  eventBus.subscribe(DomainEventName.TASK_CREATED, async (event) => {
    const members = await ProjectMember.find({
      project: event.payload.projectId,
      user: { $ne: event.payload.actorId },
    })
      .select("user")
      .lean();

    const itemLabel =
      event.payload.taskType === TaskType.ISSUE ? "Issue" : "Task";

    await Promise.all(
      members.map((member) =>
        notificationService.createAndPublishNotification({
          recipientId: member.user.toString(),
          actorId: event.payload.actorId,
          type: NotificationType.TASK_CREATED,
          title: `New ${itemLabel.toLowerCase()} created`,
          message: `${itemLabel} "${event.payload.title}" was created in your project.`,
          workspaceId: event.payload.workspaceId,
          projectId: event.payload.projectId,
          entityType: NotificationEntityType.TASK,
          entityId: event.payload.taskId,
          metadata: {
            taskTitle: event.payload.title,
            taskType: event.payload.taskType,
          },
        }),
      ),
    );
  });

  eventBus.subscribe(
    DomainEventName.TASK_ASSIGNMENT_REQUESTED,
    async (event) => {
      const admins = await ProjectMember.find({
        project: event.payload.projectId,
        role: ProjectRole.ADMIN,
        user: { $ne: event.payload.actorId },
      })
        .select("user")
        .lean();

      const itemLabel =
        event.payload.taskType === TaskType.ISSUE ? "issue" : "task";

      await Promise.all(
        admins.map((admin) =>
          notificationService.createAndPublishNotification({
            recipientId: admin.user.toString(),
            actorId: event.payload.actorId,
            type: NotificationType.TASK_ASSIGNMENT_REQUESTED,
            title: "Admin assignment requested",
            message: `A project member asked an admin to take ${itemLabel} "${event.payload.title}".`,
            workspaceId: event.payload.workspaceId,
            projectId: event.payload.projectId,
            entityType: NotificationEntityType.TASK,
            entityId: event.payload.taskId,
            metadata: {
              taskTitle: event.payload.title,
              taskType: event.payload.taskType,
              requestId: event.payload.requestId,
              requesterId: event.payload.requesterId,
            },
          }),
        ),
      );
    },
  );

  eventBus.subscribe(
    DomainEventName.TASK_ASSIGNMENT_REQUEST_ACCEPTED,
    async (event) => {
      if (event.payload.requesterId === event.payload.acceptedById) {
        return;
      }

      const itemLabel =
        event.payload.taskType === TaskType.ISSUE ? "issue" : "task";

      await notificationService.createAndPublishNotification({
        recipientId: event.payload.requesterId,
        actorId: event.payload.acceptedById,
        type: NotificationType.TASK_ASSIGNMENT_REQUEST_ACCEPTED,
        title: "Admin accepted your request",
        message: `An admin accepted your request and is now assigned to ${itemLabel} "${event.payload.title}".`,
        workspaceId: event.payload.workspaceId,
        projectId: event.payload.projectId,
        entityType: NotificationEntityType.TASK,
        entityId: event.payload.taskId,
        metadata: {
          taskTitle: event.payload.title,
          taskType: event.payload.taskType,
          requestId: event.payload.requestId,
          acceptedById: event.payload.acceptedById,
        },
      });
    },
  );

  eventBus.subscribe(DomainEventName.TASK_ASSIGNED, async (event) => {
    if (event.payload.actorId === event.payload.recipientId) {
      return;
    }

    const itemLabel =
      event.payload.taskType === TaskType.ISSUE ? "Issue" : "Task";

    await notificationService.createAndPublishNotification({
      recipientId: event.payload.recipientId,
      actorId: event.payload.actorId,
      type: NotificationType.TASK_ASSIGNED,
      title: `${itemLabel} assigned`,
      message: `You were assigned to ${itemLabel.toLowerCase()} "${event.payload.title}".`,
      workspaceId: event.payload.workspaceId,
      projectId: event.payload.projectId,
      entityType: NotificationEntityType.TASK,
      entityId: event.payload.taskId,
      metadata: {
        taskTitle: event.payload.title,
        taskType: event.payload.taskType,
      },
    });
  });

  eventBus.subscribe(DomainEventName.TASK_STATUS_CHANGED, async (event) => {
    const assignments = await TaskAssignee.find({
      task: event.payload.taskId,
      user: {
        $ne: event.payload.actorId,
      },
    })
      .select("user")
      .lean();

    for (const assignment of assignments) {
      await notificationService.createAndPublishNotification({
        recipientId: assignment.user.toString(),
        actorId: event.payload.actorId,
        type: NotificationType.TASK_STATUS_CHANGED,
        title: "Task status changed",
        message: `"${event.payload.title}" moved from ${event.payload.previousStatus} to ${event.payload.currentStatus}.`,
        workspaceId: event.payload.workspaceId,
        projectId: event.payload.projectId,
        entityType: NotificationEntityType.TASK,
        entityId: event.payload.taskId,
        metadata: {
          taskTitle: event.payload.title,
          previousStatus: event.payload.previousStatus,
          currentStatus: event.payload.currentStatus,
        },
      });
    }
  });

  eventBus.subscribe(DomainEventName.DISCUSSION_CREATED, async (event) => {
    const members = await ProjectMember.find({
      project: event.payload.projectId,
      user: { $ne: event.payload.actorId },
    })
      .select("user")
      .lean();

    await Promise.all(
      members.map((member) =>
        notificationService.createAndPublishNotification({
          recipientId: member.user.toString(),
          actorId: event.payload.actorId,
          type: NotificationType.DISCUSSION_CREATED,
          title: "New discussion started",
          message: `A new discussion, "${event.payload.title}", was started in your project.`,
          workspaceId: event.payload.workspaceId,
          projectId: event.payload.projectId,
          entityType: NotificationEntityType.DISCUSSION,
          entityId: event.payload.discussionId,
          metadata: {
            discussionTitle: event.payload.title,
          },
        }),
      ),
    );
  });

  eventBus.subscribe(
    DomainEventName.DISCUSSION_REPLY_CREATED,
    async (event) => {
      const members = await ProjectMember.find({
        project: event.payload.projectId,
        user: { $ne: event.payload.actorId },
      })
        .select("user")
        .lean();

      await Promise.all(
        members.map((member) =>
          notificationService.createAndPublishNotification({
            recipientId: member.user.toString(),
            actorId: event.payload.actorId,
            type: NotificationType.DISCUSSION_REPLY,
            title: "New discussion reply",
            message: `A new reply was added to "${event.payload.title}".`,
            workspaceId: event.payload.workspaceId,
            projectId: event.payload.projectId,
            entityType: NotificationEntityType.DISCUSSION,
            entityId: event.payload.discussionId,
            metadata: {
              discussionTitle: event.payload.title,
              replyId: event.payload.replyId,
            },
          }),
        ),
      );
    },
  );

  eventBus.subscribe(
    DomainEventName.WORKSPACE_MEMBER_ROLE_CHANGED,
    async (event) => {
      if (event.payload.actorId === event.payload.affectedUserId) {
        return;
      }

      const workspace = await Workspace.findById(event.payload.workspaceId)
        .select("name")
        .lean();

      if (!workspace) {
        return;
      }

      await notificationService.createAndPublishNotification({
        recipientId: event.payload.affectedUserId,
        actorId: event.payload.actorId,
        type: NotificationType.WORKSPACE_ROLE_CHANGED,
        title: "Workspace role updated",
        message: `Your role in “${workspace.name}” was changed to ${event.payload.role}.`,
        workspaceId: event.payload.workspaceId,
        entityType: NotificationEntityType.WORKSPACE,
        entityId: event.payload.workspaceId,
        metadata: {
          workspaceName: workspace.name,
          memberId: event.payload.memberId,
          role: event.payload.role,
        },
      });
    },
  );

  eventBus.subscribe(
    DomainEventName.PROJECT_MEMBER_ROLE_CHANGED,
    async (event) => {
      if (event.payload.actorId === event.payload.affectedUserId) {
        return;
      }

      const project = await Project.findById(event.payload.projectId)
        .select("name")
        .lean();

      if (!project) {
        return;
      }

      await notificationService.createAndPublishNotification({
        recipientId: event.payload.affectedUserId,
        actorId: event.payload.actorId,
        type: NotificationType.PROJECT_ROLE_CHANGED,
        title: "Project role updated",
        message: `Your role in “${project.name}” was changed to ${event.payload.role}.`,
        workspaceId: event.payload.workspaceId,
        projectId: event.payload.projectId,
        entityType: NotificationEntityType.PROJECT,
        entityId: event.payload.projectId,
        metadata: {
          projectName: project.name,
          memberId: event.payload.memberId,
          role: event.payload.role,
        },
      });
    },
  );

  eventBus.subscribe(DomainEventName.WORKSPACE_MEMBER_ADDED, async (event) => {
    if (event.payload.actorId === event.payload.affectedUserId) {
      return;
    }

    const [workspace, joinedUser] = await Promise.all([
      Workspace.findById(event.payload.workspaceId).select("name").lean(),
      User.findById(event.payload.affectedUserId).select("name").lean(),
    ]);

    if (!workspace || !joinedUser) {
      return;
    }

    await notificationService.createAndPublishNotification({
      recipientId: event.payload.actorId,
      actorId: event.payload.affectedUserId,
      type: NotificationType.WORKSPACE_MEMBER_JOINED,
      title: "Workspace invitation accepted",
      message: `${joinedUser.name} joined “${workspace.name}”.`,
      workspaceId: event.payload.workspaceId,
      entityType: NotificationEntityType.WORKSPACE,
      entityId: event.payload.workspaceId,
      metadata: {
        workspaceName: workspace.name,
        memberId: event.payload.memberId,
        joinedUserId: event.payload.affectedUserId,
      },
    });
  });

  eventBus.subscribe(DomainEventName.PROJECT_MEMBER_ADDED, async (event) => {
    if (event.payload.actorId === event.payload.affectedUserId) {
      return;
    }

    const [project, joinedUser] = await Promise.all([
      Project.findById(event.payload.projectId).select("name").lean(),
      User.findById(event.payload.affectedUserId).select("name").lean(),
    ]);

    if (!project || !joinedUser) {
      return;
    }

    await notificationService.createAndPublishNotification({
      recipientId: event.payload.actorId,
      actorId: event.payload.affectedUserId,
      type: NotificationType.PROJECT_MEMBER_JOINED,
      title: "Project invitation accepted",
      message: `${joinedUser.name} joined “${project.name}”.`,
      workspaceId: event.payload.workspaceId,
      projectId: event.payload.projectId,
      entityType: NotificationEntityType.PROJECT,
      entityId: event.payload.projectId,
      metadata: {
        projectName: project.name,
        memberId: event.payload.memberId,
        joinedUserId: event.payload.affectedUserId,
      },
    });
  });
};
