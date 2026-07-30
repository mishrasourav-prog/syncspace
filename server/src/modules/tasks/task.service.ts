import { Types } from "mongoose";

import ApiError from "../../utils/ApiError";

import Task, { ITaskDocument, TaskStatus } from "./task.model";

import Project from "../project/project.model";

import ProjectMember from "../projectMember/projectMember.model";

import { ProjectRole } from "../../interfaces/projectMember.interface";

import { Workspace } from "../workspace/workspace.model";

import TaskAssignee from "../taskAssignee/taskAssignee.model";

import {
  ICreateTask,
  ITaskAssigneePreview,
  ITaskResponse,
  ITasksResponse,
  IUpdateTask,
} from "../../interfaces/task.interface";

import { TaskType } from "./task.model";

import { DomainEventName, eventBus } from "../../events";

import mongoose from "mongoose";

import type {
  IReorderProjectTasksInput,
  IReorderProjectTasksResponse,
} from "../../interfaces/task.interface";

interface ITaskProjectContext {
  project: {
    _id: Types.ObjectId;

    workspace: Types.ObjectId;

    isArchived: boolean;
  };

  membership: {
    _id: Types.ObjectId;

    role: ProjectRole;
  };
}

interface ITaskForBoardReorder {
  _id: Types.ObjectId;

  title: string;

  type: TaskType;

  status: TaskStatus;

  position: number;

  completedAt?: Date | null;

  completedBy?: Types.ObjectId | null;
}

interface IChangedTaskStatus {
  taskId: string;

  title: string;

  taskType: TaskType;

  previousStatus: TaskStatus;

  currentStatus: TaskStatus;
}

interface ITaskHierarchyNode {
  _id: Types.ObjectId;

  project: Types.ObjectId;

  parentTask?: Types.ObjectId | null;

  isArchived: boolean;
}

interface IPopulatedAssigneeUser {
  _id: Types.ObjectId;

  name: string;

  username: string;

  avatar?: string;
}

export class TaskService {
  private async getProjectContext(
    projectId: string,
    userId: string,
    mutation: boolean,
  ): Promise<ITaskProjectContext> {
    const project = await Project.findById(projectId)
      .select("_id workspace isArchived")
      .lean<{
        _id: Types.ObjectId;

        workspace: Types.ObjectId;

        isArchived: boolean;
      }>()
      .exec();

    if (!project) {
      throw new ApiError(404, "Project not found.");
    }

    const membership = await ProjectMember.findOne({
      project: project._id,

      user: new Types.ObjectId(userId),
    })
      .select("_id role")
      .lean<{
        _id: Types.ObjectId;

        role: ProjectRole;
      }>()
      .exec();

    if (!membership) {
      throw new ApiError(404, "Project not found.");
    }

    if (mutation && project.isArchived) {
      throw new ApiError(409, "Archived projects are read-only.");
    }

    return {
      project,
      membership,
    };
  }

  private async validateParentTask(
    projectId: string,
    parentTaskId: string,
    currentTaskId?: string,
  ): Promise<void> {
    if (currentTaskId && parentTaskId === currentTaskId) {
      throw new ApiError(409, "A task cannot be its own parent.");
    }

    const visitedTaskIds = new Set<string>();

    let currentParentId: string | null = parentTaskId;

    let isDirectParent = true;

    while (currentParentId) {
      if (visitedTaskIds.has(currentParentId)) {
        throw new ApiError(
          409,
          "The existing task hierarchy contains a circular reference.",
        );
      }

      visitedTaskIds.add(currentParentId);

      if (currentTaskId && currentParentId === currentTaskId) {
        throw new ApiError(
          409,
          "This parent task would create a circular task hierarchy.",
        );
      }

      const parentNode: ITaskHierarchyNode | null = await Task.findById(
        currentParentId,
      )
        .select("_id project parentTask isArchived")
        .lean<ITaskHierarchyNode>()
        .exec();

      if (!parentNode) {
        if (isDirectParent) {
          throw new ApiError(404, "Parent task not found.");
        }

        throw new ApiError(
          409,
          "The existing task hierarchy contains a missing parent reference.",
        );
      }

      if (parentNode.project.toString() !== projectId) {
        throw new ApiError(
          409,
          "Parent tasks and their ancestors must belong to the same project.",
        );
      }

      if (isDirectParent && parentNode.isArchived) {
        throw new ApiError(409, "An archived task cannot be used as a parent.");
      }

      currentParentId = parentNode.parentTask?.toString() ?? null;

      isDirectParent = false;
    }
  }

  private async getTaskAssigneePreview(
    taskId: string,
  ): Promise<ITaskAssigneePreview[]> {
    const assignments = await TaskAssignee.find({
      task: taskId,
    })
      .populate<{
        user: IPopulatedAssigneeUser | null;
      }>("user", "name username avatar")
      .exec();

    const assignees: ITaskAssigneePreview[] = [];

    for (const assignment of assignments) {
      const user = assignment.user;

      if (!user) {
        continue;
      }

      assignees.push({
        _id: user._id.toString(),

        name: user.name,

        username: user.username,

        avatar: user.avatar,
      });
    }

    return assignees;
  }

  private mapTask(
    task: ITaskDocument,
    assignees: ITaskAssigneePreview[],
  ): ITaskResponse {
    return {
      _id: task._id.toString(),

      project: task.project.toString(),

      title: task.title,

      description: task.description,

      status: task.status,

      priority: task.priority,

      createdBy: task.createdBy.toString(),

      updatedBy: task.updatedBy?.toString(),

      completedBy: task.completedBy?.toString(),

      type: task.type ?? TaskType.TASK,

      startDate: task.startDate,

      dueDate: task.dueDate,

      completedAt: task.completedAt,

      parentTask: task.parentTask?.toString(),

      position: task.position,

      assignees,

      isArchived: task.isArchived,

      createdAt: task.createdAt,

      updatedAt: task.updatedAt,
    };
  }

  async createTask(
    projectId: string,
    userId: string,
    data: ICreateTask,
  ): Promise<ITaskResponse> {
    const project = await Project.findById(projectId)
      .select("_id workspace isArchived")
      .lean();

    if (!project) {
      throw new ApiError(404, "Project not found.");
    }

    const membershipExists = await ProjectMember.exists({
      project: projectId,

      user: userId,
    });

    if (!membershipExists) {
      throw new ApiError(403, "You are not a member of this project.");
    }

    const workspace = await Workspace.findById(project.workspace)
      .select("_id isArchived")
      .lean();

    if (!workspace) {
      throw new ApiError(404, "Workspace not found.");
    }

    if (workspace.isArchived) {
      throw new ApiError(
        409,
        "Tasks cannot be created while the workspace is archived.",
      );
    }

    if (project.isArchived) {
      throw new ApiError(
        409,
        "Tasks cannot be created inside an archived project.",
      );
    }

    if (data.parentTask) {
      await this.validateParentTask(projectId, data.parentTask);
    }

    if (
      data.startDate &&
      data.dueDate &&
      data.startDate.getTime() > data.dueDate.getTime()
    ) {
      throw new ApiError(400, "Due date cannot be before start date.");
    }

    const lastTask = await Task.findOne({
      project: projectId,
    })
      .sort({
        position: -1,
        _id: -1,
      })
      .select("position")
      .lean();

    const position = lastTask ? lastTask.position + 1000 : 1000;

    const task = await Task.create({
      project: new Types.ObjectId(projectId),

      title: data.title,

      description: data.description ?? "",

      priority: data.priority,

      type: data.type ?? TaskType.TASK,

      createdBy: new Types.ObjectId(userId),

      updatedBy: new Types.ObjectId(userId),

      startDate: data.startDate,

      dueDate: data.dueDate,

      parentTask: data.parentTask
        ? new Types.ObjectId(data.parentTask)
        : undefined,

      position,
    });

    await eventBus.publish(DomainEventName.TASK_CREATED, {
      workspaceId: workspace._id.toString(),

      projectId: project._id.toString(),

      taskId: task._id.toString(),

      actorId: userId,

      title: task.title,

      status: task.status,

      taskType: task.type,
    });

    return this.mapTask(task, []);
  }

  async getTask(taskId: string, userId: string): Promise<ITaskResponse> {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new ApiError(404, "Task not found.");
    }

    const membershipExists = await ProjectMember.exists({
      project: task.project,

      user: userId,
    });

    if (!membershipExists) {
      throw new ApiError(403, "You are not a member of this project.");
    }

    const assignees = await this.getTaskAssigneePreview(task._id.toString());

    return this.mapTask(task, assignees);
  }

  async getProjectTasks(
    projectId: string,
    userId: string,
  ): Promise<ITasksResponse> {
    const project = await Project.findById(projectId)
      .select("_id isArchived")
      .lean();

    if (!project) {
      throw new ApiError(404, "Project not found.");
    }

    const membershipExists = await ProjectMember.exists({
      project: projectId,

      user: userId,
    });

    if (!membershipExists) {
      throw new ApiError(403, "You are not a member of this project.");
    }

    const tasks = await Task.find({
      project: projectId,
    }).sort({
      position: 1,
      _id: 1,
    });

    if (tasks.length === 0) {
      return {
        tasks: [],
      };
    }

    const taskIds = tasks.map((task) => task._id);

    const assignments = await TaskAssignee.find({
      task: {
        $in: taskIds,
      },
    })
      .populate<{
        user: IPopulatedAssigneeUser | null;
      }>("user", "name username avatar")
      .exec();

    const assigneeMap = new Map<string, ITaskAssigneePreview[]>();

    for (const assignment of assignments) {
      const user = assignment.user;

      if (!user) {
        continue;
      }

      const assignmentTaskId = assignment.task.toString();

      const currentAssignees = assigneeMap.get(assignmentTaskId) ?? [];

      currentAssignees.push({
        _id: user._id.toString(),

        name: user.name,

        username: user.username,

        avatar: user.avatar,
      });

      assigneeMap.set(assignmentTaskId, currentAssignees);
    }

    return {
      tasks: tasks.map((task) =>
        this.mapTask(
          task,

          assigneeMap.get(task._id.toString()) ?? [],
        ),
      ),
    };
  }

  async updateTask(
    taskId: string,
    userId: string,
    data: IUpdateTask,
  ): Promise<ITaskResponse> {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new ApiError(404, "Task not found.");
    }

    const membershipExists = await ProjectMember.exists({
      project: task.project,

      user: userId,
    });

    if (!membershipExists) {
      throw new ApiError(403, "You are not a member of this project.");
    }

    const project = await Project.findById(task.project)
      .select("_id workspace isArchived")
      .lean();

    if (!project) {
      throw new ApiError(404, "Project not found.");
    }

    const workspace = await Workspace.findById(project.workspace)
      .select("_id isArchived")
      .lean();

    if (!workspace) {
      throw new ApiError(404, "Workspace not found.");
    }

    if (workspace.isArchived) {
      throw new ApiError(
        409,
        "Tasks cannot be updated while the workspace is archived.",
      );
    }

    if (project.isArchived) {
      throw new ApiError(
        409,
        "Tasks cannot be updated inside an archived project.",
      );
    }

    if (task.isArchived) {
      throw new ApiError(409, "Archived tasks cannot be updated.");
    }

    if (data.parentTask !== undefined && data.parentTask !== null) {
      await this.validateParentTask(
        task.project.toString(),
        data.parentTask,
        task._id.toString(),
      );
    }

    const effectiveStartDate = data.startDate ?? task.startDate;

    const effectiveDueDate = data.dueDate ?? task.dueDate;

    if (
      effectiveStartDate &&
      effectiveDueDate &&
      effectiveStartDate.getTime() > effectiveDueDate.getTime()
    ) {
      throw new ApiError(400, "Due date cannot be before start date.");
    }

    if (data.title !== undefined) {
      task.title = data.title;
    }

    if (data.description !== undefined) {
      task.description = data.description;
    }

    if (data.priority !== undefined) {
      task.priority = data.priority;
    }

    if (data.type !== undefined) {
      task.type = data.type;
    }

    if (data.startDate !== undefined) {
      task.startDate = data.startDate ?? undefined;
    }

    if (data.dueDate !== undefined) {
      task.dueDate = data.dueDate ?? undefined;
    }

    if (data.parentTask !== undefined) {
      if (data.parentTask === null) {
        task.parentTask = undefined;
      } else {
        task.parentTask = new Types.ObjectId(data.parentTask);
      }
    }

    task.updatedBy = new Types.ObjectId(userId);

    await task.save();

    await eventBus.publish(DomainEventName.TASK_UPDATED, {
      workspaceId: workspace._id.toString(),
      projectId: project._id.toString(),
      taskId: task._id.toString(),
      actorId: userId,
      title: task.title,
      taskType: task.type,
    });

    const assignees = await this.getTaskAssigneePreview(task._id.toString());

    return this.mapTask(task, assignees);
  }

  async updateTaskStatus(
    taskId: string,
    userId: string,
    status: TaskStatus,
  ): Promise<ITaskResponse> {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new ApiError(404, "Task not found.");
    }

    const membershipExists = await ProjectMember.exists({
      project: task.project,

      user: userId,
    });

    if (!membershipExists) {
      throw new ApiError(403, "You are not a member of this project.");
    }

    const project = await Project.findById(task.project)
      .select("_id workspace isArchived")
      .lean();

    if (!project) {
      throw new ApiError(404, "Project not found.");
    }

    const workspace = await Workspace.findById(project.workspace)
      .select("_id isArchived")
      .lean();

    if (!workspace) {
      throw new ApiError(404, "Workspace not found.");
    }

    if (workspace.isArchived) {
      throw new ApiError(
        409,
        "Task status cannot be changed while the workspace is archived.",
      );
    }

    if (project.isArchived) {
      throw new ApiError(
        409,
        "Task status cannot be changed inside an archived project.",
      );
    }

    if (task.isArchived) {
      throw new ApiError(409, "Status cannot be changed on an archived task.");
    }

    if (task.status === status) {
      const assignees = await this.getTaskAssigneePreview(task._id.toString());

      return this.mapTask(task, assignees);
    }

    const previousStatus = task.status;

    task.status = status;

    task.updatedBy = new Types.ObjectId(userId);

    if (status === TaskStatus.DONE) {
      task.completedAt = new Date();

      task.completedBy = new Types.ObjectId(userId);
    } else {
      task.completedAt = undefined;

      task.completedBy = undefined;
    }

    await task.save();

    await eventBus.publish(DomainEventName.TASK_STATUS_CHANGED, {
      workspaceId: workspace._id.toString(),

      projectId: project._id.toString(),

      taskId: task._id.toString(),

      actorId: userId,

      title: task.title,

      previousStatus,

      currentStatus: task.status,

      taskType: task.type,
    });

    const assignees = await this.getTaskAssigneePreview(task._id.toString());

    return this.mapTask(task, assignees);
  }

  async archiveTask(taskId: string, userId: string): Promise<void> {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new ApiError(404, "Task not found.");
    }

    const membership = await ProjectMember.findOne({
      project: task.project,

      user: userId,
    })
      .select("role")
      .lean();

    if (!membership) {
      throw new ApiError(403, "You are not a member of this project.");
    }

    const canManageTask =
      membership.role === ProjectRole.ADMIN ||
      task.createdBy.toString() === userId;

    if (!canManageTask) {
      throw new ApiError(
        403,
        "You do not have permission to archive this task.",
      );
    }

    const project = await Project.findById(task.project)
      .select("_id workspace isArchived")
      .lean();

    if (!project) {
      throw new ApiError(404, "Project not found.");
    }

    const workspace = await Workspace.findById(project.workspace)
      .select("_id isArchived")
      .lean();

    if (!workspace) {
      throw new ApiError(404, "Workspace not found.");
    }

    if (workspace.isArchived) {
      throw new ApiError(
        409,
        "Tasks cannot be archived while the workspace is archived.",
      );
    }

    if (project.isArchived) {
      throw new ApiError(
        409,
        "Tasks cannot be archived inside an archived project.",
      );
    }

    if (task.isArchived) {
      throw new ApiError(409, "Task is already archived.");
    }

    task.isArchived = true;

    task.updatedBy = new Types.ObjectId(userId);

    await task.save();
  }

  async restoreTask(taskId: string, userId: string): Promise<void> {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new ApiError(404, "Task not found.");
    }

    const membership = await ProjectMember.findOne({
      project: task.project,

      user: userId,
    })
      .select("role")
      .lean();

    if (!membership) {
      throw new ApiError(403, "You are not a member of this project.");
    }

    const canManageTask =
      membership.role === ProjectRole.ADMIN ||
      task.createdBy.toString() === userId;

    if (!canManageTask) {
      throw new ApiError(
        403,
        "You do not have permission to restore this task.",
      );
    }

    const project = await Project.findById(task.project)
      .select("_id workspace isArchived")
      .lean();

    if (!project) {
      throw new ApiError(404, "Project not found.");
    }

    const workspace = await Workspace.findById(project.workspace)
      .select("_id isArchived")
      .lean();

    if (!workspace) {
      throw new ApiError(404, "Workspace not found.");
    }

    if (workspace.isArchived) {
      throw new ApiError(
        409,
        "Restore the workspace before restoring this task.",
      );
    }

    if (project.isArchived) {
      throw new ApiError(
        409,
        "Restore the project before restoring this task.",
      );
    }

    if (!task.isArchived) {
      throw new ApiError(409, "Task is already active.");
    }

    task.isArchived = false;

    task.updatedBy = new Types.ObjectId(userId);

    await task.save();
  }

  async reorderProjectTasks(
    projectId: string,
    userId: string,
    data: IReorderProjectTasksInput,
  ): Promise<IReorderProjectTasksResponse> {
    const context = await this.getProjectContext(projectId, userId, true);

    const session = await mongoose.startSession();

    const changedStatuses: IChangedTaskStatus[] = [];

    let updatedTaskCount = 0;

    try {
      await session.withTransaction(async () => {
        const affectedStatuses = data.columns.map((column) => column.status);

        const suppliedTaskIds = data.columns.flatMap(
          (column) => column.taskIds,
        );

        const currentTasks = await Task.find({
          project: context.project._id,

          status: {
            $in: affectedStatuses,
          },

          parentTask: null,

          isArchived: false,
        })
          .select("_id title type status position completedAt completedBy")
          .session(session)
          .lean<ITaskForBoardReorder[]>()
          .exec();

        if (currentTasks.length !== suppliedTaskIds.length) {
          throw new ApiError(
            409,
            "The task board changed. Refresh it before reordering again.",
          );
        }

        const currentTaskMap = new Map(
          currentTasks.map((task) => [task._id.toString(), task]),
        );

        for (const taskId of suppliedTaskIds) {
          if (!currentTaskMap.has(taskId)) {
            throw new ApiError(
              409,
              "The task board changed. Refresh it before reordering again.",
            );
          }
        }

        const now = new Date();

        const actorObjectId = new Types.ObjectId(userId);

        const operations: Parameters<typeof Task.bulkWrite>[0] = [];

        for (const column of data.columns) {
          column.taskIds.forEach((taskId, index) => {
            const task = currentTaskMap.get(taskId);

            if (!task) {
              throw new ApiError(
                409,
                "The task board changed. Refresh it before reordering again.",
              );
            }

            const position = (index + 1) * 1000;

            const statusChanged = task.status !== column.status;

            const setFields: Record<string, unknown> = {
              position,

              status: column.status,

              updatedBy: actorObjectId,
            };

            if (statusChanged && column.status === TaskStatus.DONE) {
              setFields.completedAt = now;

              setFields.completedBy = actorObjectId;
            }

            if (
              statusChanged &&
              task.status === TaskStatus.DONE &&
              column.status !== TaskStatus.DONE
            ) {
              setFields.completedAt = null;

              setFields.completedBy = null;
            }

            operations.push({
              updateOne: {
                filter: {
                  _id: task._id,

                  project: context.project._id,

                  isArchived: false,
                },

                update: {
                  $set: setFields,
                },
              },
            });

            if (statusChanged) {
              changedStatuses.push({
                taskId: task._id.toString(),

                title: task.title,

                taskType: task.type,

                previousStatus: task.status,

                currentStatus: column.status,
              });
            }
          });
        }

        if (operations.length > 0) {
          const result = await Task.bulkWrite(operations, {
            session,
          });

          updatedTaskCount = result.modifiedCount;
        }
      });
    } finally {
      await session.endSession();
    }

    for (const changedTask of changedStatuses) {
      await eventBus.publish(DomainEventName.TASK_STATUS_CHANGED, {
        workspaceId: context.project.workspace.toString(),

        projectId: context.project._id.toString(),

        taskId: changedTask.taskId,

        actorId: userId,

        title: changedTask.title,

        taskType: changedTask.taskType,

        previousStatus: changedTask.previousStatus,

        currentStatus: changedTask.currentStatus,
      });
    }

    await eventBus.publish(DomainEventName.TASKS_REORDERED, {
      workspaceId: context.project.workspace.toString(),

      projectId: context.project._id.toString(),

      actorId: userId,

      affectedStatuses: data.columns.map((column) => column.status),
    });

    return {
      updatedTaskCount,
    };
  }
}

export default new TaskService();
