import { Types } from "mongoose";

import { DomainEventName, eventBus } from "../../events";
import type {
  ITaskAssignmentRequestResponse,
  ITaskAssignmentRequestsResponse,
  ITaskAssignmentRequestUser,
} from "../../interfaces/taskAssignmentRequest.interface";
import { ProjectRole } from "../../interfaces/projectMember.interface";
import ApiError from "../../utils/ApiError";
import Project from "../project/project.model";
import ProjectMember from "../projectMember/projectMember.model";
import TaskAssignee from "../taskAssignee/taskAssignee.model";
import Task, { TaskType } from "../tasks/task.model";
import { Workspace } from "../workspace/workspace.model";
import { WorkspaceMember } from "../workspace-member/workspace-member.model";
import TaskAssignmentRequest, {
  TaskAssignmentRequestStatus,
  type ITaskAssignmentRequestDocument,
} from "./taskAssignmentRequest.model";

interface PopulatedUser {
  _id: Types.ObjectId;
  name: string;
  username: string;
  avatar?: string;
}

interface PopulatedRequest extends Omit<
  ITaskAssignmentRequestDocument,
  "requester" | "acceptedBy"
> {
  requester: PopulatedUser | null;
  acceptedBy?: PopulatedUser | null;
}

interface TaskRequestContext {
  task: {
    _id: Types.ObjectId;
    project: Types.ObjectId;
    title: string;
    type: TaskType;
    isArchived: boolean;
  };
  project: {
    _id: Types.ObjectId;
    workspace: Types.ObjectId;
    isArchived: boolean;
  };
  workspace: {
    _id: Types.ObjectId;
    isArchived: boolean;
  };
  membership: {
    _id: Types.ObjectId;
    role: ProjectRole;
  };
}

export class TaskAssignmentRequestService {
  private mapUser(user: PopulatedUser): ITaskAssignmentRequestUser {
    return {
      _id: user._id.toString(),
      name: user.name,
      username: user.username,
      avatar: user.avatar,
    };
  }

  private mapRequest(
    request: PopulatedRequest,
  ): ITaskAssignmentRequestResponse {
    if (!request.requester) {
      throw new ApiError(409, "The requesting member is no longer available.");
    }

    return {
      _id: request._id.toString(),
      task: request.task.toString(),
      requester: this.mapUser(request.requester),
      status: request.status,
      acceptedBy: request.acceptedBy ? this.mapUser(request.acceptedBy) : null,
      requestedAt: request.requestedAt,
      acceptedAt: request.acceptedAt ?? null,
    };
  }

  private async populateRequest(
    request: ITaskAssignmentRequestDocument,
  ): Promise<ITaskAssignmentRequestResponse> {
    const populated = await request.populate<{
      requester: PopulatedUser | null;
      acceptedBy?: PopulatedUser | null;
    }>([
      { path: "requester", select: "name username avatar" },
      { path: "acceptedBy", select: "name username avatar" },
    ]);

    return this.mapRequest(populated as unknown as PopulatedRequest);
  }

  private async getContext(
    taskId: string,
    userId: string,
  ): Promise<TaskRequestContext> {
    const task = await Task.findById(taskId)
      .select("_id project title type isArchived")
      .lean<TaskRequestContext["task"]>()
      .exec();

    if (!task) {
      throw new ApiError(404, "Task not found.");
    }

    const [project, membership] = await Promise.all([
      Project.findById(task.project)
        .select("_id workspace isArchived")
        .lean<TaskRequestContext["project"]>()
        .exec(),
      ProjectMember.findOne({ project: task.project, user: userId })
        .select("_id role")
        .lean<TaskRequestContext["membership"]>()
        .exec(),
    ]);

    if (!membership) {
      throw new ApiError(403, "You are not a member of this project.");
    }

    if (!project) {
      throw new ApiError(404, "Project not found.");
    }

    const [workspace, workspaceMembership] = await Promise.all([
      Workspace.findById(project.workspace)
        .select("_id isArchived")
        .lean<TaskRequestContext["workspace"]>()
        .exec(),
      WorkspaceMember.exists({ workspace: project.workspace, user: userId }),
    ]);

    if (!workspaceMembership) {
      throw new ApiError(403, "You are no longer a member of this workspace.");
    }

    if (!workspace) {
      throw new ApiError(404, "Workspace not found.");
    }

    return { task, project, workspace, membership };
  }

  private assertWritable(context: TaskRequestContext): void {
    if (
      context.workspace.isArchived ||
      context.project.isArchived ||
      context.task.isArchived
    ) {
      throw new ApiError(
        409,
        "Assignment requests cannot be changed on an archived resource.",
      );
    }
  }

  async getRequests(
    taskId: string,
    userId: string,
  ): Promise<ITaskAssignmentRequestsResponse> {
    const context = await this.getContext(taskId, userId);

    const filter: Record<string, unknown> = {
      task: context.task._id,
      status: TaskAssignmentRequestStatus.PENDING,
    };

    const requests = await TaskAssignmentRequest.find(filter)
      .sort({ requestedAt: 1, _id: 1 })
      .populate<{
        requester: PopulatedUser | null;
        acceptedBy?: PopulatedUser | null;
      }>([
        { path: "requester", select: "name username avatar" },
        { path: "acceptedBy", select: "name username avatar" },
      ])
      .exec();

    const mapped: ITaskAssignmentRequestResponse[] = [];
    for (const request of requests) {
      if (!request.requester) continue;
      mapped.push(this.mapRequest(request as unknown as PopulatedRequest));
    }

    return { requests: mapped };
  }

  async createRequest(
    taskId: string,
    userId: string,
  ): Promise<ITaskAssignmentRequestResponse> {
    const context = await this.getContext(taskId, userId);
    this.assertWritable(context);

    if (context.membership.role === ProjectRole.ADMIN) {
      throw new ApiError(409, "Project admins can assign themselves directly.");
    }

    const existingRequest = await TaskAssignmentRequest.findOne({
      task: context.task._id,
      status: TaskAssignmentRequestStatus.PENDING,
    });

    if (existingRequest) {
      return this.populateRequest(existingRequest);
    }

    let request: ITaskAssignmentRequestDocument;
    try {
      request = await TaskAssignmentRequest.create({
        task: context.task._id,
        requester: new Types.ObjectId(userId),
      });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        const concurrent = await TaskAssignmentRequest.findOne({
          task: context.task._id,
          status: TaskAssignmentRequestStatus.PENDING,
        });
        if (concurrent) return this.populateRequest(concurrent);
      }
      throw error;
    }

    await eventBus.publish(DomainEventName.TASK_ASSIGNMENT_REQUESTED, {
      workspaceId: context.workspace._id.toString(),
      projectId: context.project._id.toString(),
      taskId: context.task._id.toString(),
      requestId: request._id.toString(),
      actorId: userId,
      requesterId: userId,
      title: context.task.title,
      taskType: context.task.type,
    });

    return this.populateRequest(request);
  }

  async acceptRequest(
    taskId: string,
    requestId: string,
    userId: string,
  ): Promise<ITaskAssignmentRequestResponse> {
    const context = await this.getContext(taskId, userId);
    this.assertWritable(context);

    if (context.membership.role !== ProjectRole.ADMIN) {
      throw new ApiError(
        403,
        "Only a project admin can accept assignment requests.",
      );
    }

    const now = new Date();
    const request = await TaskAssignmentRequest.findOneAndUpdate(
      {
        _id: requestId,
        task: context.task._id,
        status: TaskAssignmentRequestStatus.PENDING,
      },
      {
        $set: {
          status: TaskAssignmentRequestStatus.ACCEPTED,
          acceptedBy: new Types.ObjectId(userId),
          acceptedAt: now,
        },
      },
      { new: true },
    );

    if (!request) {
      throw new ApiError(
        409,
        "This assignment request has already been handled.",
      );
    }

    let assignmentCreated = false;
    try {
      const assignmentResult = await TaskAssignee.updateOne(
        { task: context.task._id, user: userId },
        {
          $setOnInsert: {
            task: context.task._id,
            user: new Types.ObjectId(userId),
            assignedBy: new Types.ObjectId(userId),
            assignedAt: now,
          },
        },
        { upsert: true },
      );
      assignmentCreated = assignmentResult.upsertedCount > 0;
    } catch (error) {
      await TaskAssignmentRequest.updateOne(
        {
          _id: request._id,
          status: TaskAssignmentRequestStatus.ACCEPTED,
          acceptedBy: userId,
        },
        {
          $set: { status: TaskAssignmentRequestStatus.PENDING },
          $unset: { acceptedBy: 1, acceptedAt: 1 },
        },
      );
      throw error;
    }

    if (assignmentCreated) {
      await eventBus.publish(DomainEventName.TASK_ASSIGNED, {
        workspaceId: context.workspace._id.toString(),
        projectId: context.project._id.toString(),
        taskId: context.task._id.toString(),
        actorId: userId,
        recipientId: userId,
        title: context.task.title,
        taskType: context.task.type,
      });
    }

    await eventBus.publish(DomainEventName.TASK_ASSIGNMENT_REQUEST_ACCEPTED, {
      workspaceId: context.workspace._id.toString(),
      projectId: context.project._id.toString(),
      taskId: context.task._id.toString(),
      requestId: request._id.toString(),
      actorId: userId,
      requesterId: request.requester.toString(),
      acceptedById: userId,
      title: context.task.title,
      taskType: context.task.type,
    });

    return this.populateRequest(request);
  }
}

export default new TaskAssignmentRequestService();
