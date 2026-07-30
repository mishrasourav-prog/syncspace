import { Types } from "mongoose";

import ApiError from "../../utils/ApiError";

import Activity, { ActivityAction, ActivityEntityType } from "./activity.model";

import Project from "../project/project.model";

import ProjectMember from "../projectMember/projectMember.model";

import { WorkspaceMember } from "../workspace-member/workspace-member.model";

import {
  IActivitiesResponse,
  IActivityActor,
  IActivityResponse,
} from "../../interfaces/activity.interface";

interface IPopulatedActivityActor {
  _id: Types.ObjectId;

  name: string;

  username: string;

  avatar?: string;
}

interface IActivityForResponse {
  _id: Types.ObjectId;

  workspace: Types.ObjectId;

  project: Types.ObjectId;

  actor: IPopulatedActivityActor | null;

  action: ActivityAction;

  entityType: ActivityEntityType;

  entityId: Types.ObjectId;

  metadata: Record<string, unknown>;

  createdAt: Date;
}

interface ICreateActivityInternal {
  workspaceId: string;

  projectId: string;

  actorId: string;

  action: ActivityAction;

  entityType: ActivityEntityType;

  entityId: string;

  metadata?: Record<string, unknown>;
}

export class ActivityService {
  private mapActivity(activity: IActivityForResponse): IActivityResponse {
    const actor: IActivityActor | null = activity.actor
      ? {
          _id: activity.actor._id.toString(),

          name: activity.actor.name,

          username: activity.actor.username,

          avatar: activity.actor.avatar,
        }
      : null;

    return {
      _id: activity._id.toString(),

      workspace: activity.workspace.toString(),

      project: activity.project.toString(),

      actor,

      action: activity.action,

      entityType: activity.entityType,

      entityId: activity.entityId.toString(),

      metadata: activity.metadata,

      createdAt: activity.createdAt,
    };
  }

  async createActivity(data: ICreateActivityInternal): Promise<string> {
    const activity = await Activity.create({
      workspace: new Types.ObjectId(data.workspaceId),

      project: new Types.ObjectId(data.projectId),

      actor: new Types.ObjectId(data.actorId),

      action: data.action,

      entityType: data.entityType,

      entityId: new Types.ObjectId(data.entityId),

      metadata: data.metadata ?? {},
    });
    return activity._id.toString();
  }

  async getProjectActivities(
    projectId: string,
    userId: string,
  ): Promise<IActivitiesResponse> {
    const project = await Project.findById(projectId)
      .select("_id workspace")
      .lean();

    if (!project) {
      throw new ApiError(404, "Project not found.");
    }

    const [projectMembership, workspaceMembership] = await Promise.all([
      ProjectMember.exists({
        project: projectId,

        user: userId,
      }),

      WorkspaceMember.exists({
        workspace: project.workspace,

        user: userId,
      }),
    ]);

    if (!projectMembership) {
      throw new ApiError(403, "You are not a member of this project.");
    }

    if (!workspaceMembership) {
      throw new ApiError(403, "You are no longer a member of this workspace.");
    }

    const activities = await Activity.find({
      project: projectId,
    })
      .sort({
        createdAt: -1,

        _id: -1,
      })
      .limit(50)
      .populate<{
        actor: IPopulatedActivityActor | null;
      }>("actor", "name username avatar")
      .exec();

    return {
      activities: activities.map((activity) => this.mapActivity(activity)),
    };
  }

  async getWorkspaceActivities(
    workspaceId: string,
    userId: string,
  ): Promise<IActivitiesResponse> {
    const membership = await WorkspaceMember.exists({
      workspace: workspaceId,

      user: userId,
    });

    if (!membership) {
      throw new ApiError(403, "You are not a member of this workspace.");
    }

    const activities = await Activity.find({
      workspace: workspaceId,
    })
      .sort({
        createdAt: -1,

        _id: -1,
      })
      .limit(50)
      .populate<{
        actor: IPopulatedActivityActor | null;
      }>("actor", "name username avatar")
      .exec();

    return {
      activities: activities.map((activity) => this.mapActivity(activity)),
    };
  }
}

export default new ActivityService();
