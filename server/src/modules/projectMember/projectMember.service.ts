import {
  IProjectMembersResponse,
  ProjectRole,
  IProjectMemberResponse,
} from "../../interfaces/projectMember.interface";
import Project from "../project/project.model";
import ApiError from "../../utils/ApiError";
import ProjectMember from "./projectMember.model";
import { Workspace } from "../workspace/workspace.model";
import mongoose from "mongoose";

import type { ClientSession } from "mongoose";

import { Types } from "mongoose";

import Task from "../tasks/task.model";

import TaskAssignee from "../taskAssignee/taskAssignee.model";

import { DomainEventName, eventBus } from "../../events";

export class ProjectMemberService {
  private async revokeProjectMemberAccess(
    projectId: Types.ObjectId,
    membershipId: Types.ObjectId,
    targetUserId: Types.ObjectId,
    session: ClientSession,
  ): Promise<void> {
    const tasks = await Task.find({
      project: projectId,
    })
      .select("_id")
      .session(session)
      .lean();

    const taskIds = tasks.map((task) => task._id);

    if (taskIds.length > 0) {
      await TaskAssignee.deleteMany({
        task: {
          $in: taskIds,
        },

        user: targetUserId,
      }).session(session);
    }

    const deleteResult = await ProjectMember.deleteOne({
      _id: membershipId,
      project: projectId,
      user: targetUserId,
    }).session(session);

    if (deleteResult.deletedCount !== 1) {
      throw new ApiError(
        409,
        "Project membership changed before it could be removed. Please try again.",
      );
    }
  }

  async getProjectMembers(
    projectId: string,
    userId: string,
  ): Promise<IProjectMembersResponse> {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new ApiError(404, "Project not found.");
    }

    const membership = await ProjectMember.findOne({
      project: projectId,
      user: userId,
    });

    if (!membership) {
      throw new ApiError(403, "You are not a member of this project.");
    }

    const members = await ProjectMember.find({
      project: projectId,
    })
      .populate("user", "name username email avatar")
      .sort({
        joinedAt: 1,
        _id: 1,
      });

    return {
      members: members.map((member) => ({
        _id: member._id.toString(),
        project: member.project.toString(),
        user: {
          _id: (member.user as any)._id.toString(),
          name: (member.user as any).name,
          username: (member.user as any).username,
          email: (member.user as any).email,
          avatar: (member.user as any).avatar,
        },
        role: member.role,
        joinedAt: member.joinedAt,
      })),
    };
  }

  async updateMemberRole(
    projectId: string,
    memberId: string,
    userId: string,
    role: ProjectRole,
  ): Promise<IProjectMemberResponse> {
    const project = await Project.findById(projectId);

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
        "Member roles cannot be changed inside an archived workspace.",
      );
    }
    if (project.isArchived) {
      throw new ApiError(400, "Project is archived.");
    }

    const requester = await ProjectMember.findOne({
      project: projectId,
      user: userId,
    });

    if (!requester) {
      throw new ApiError(403, "You are not a member of this project");
    }

    if (requester.role !== ProjectRole.ADMIN) {
      throw new ApiError(403, "Only project admins can update member roles.");
    }

    const member = await ProjectMember.findOne({
      _id: memberId,
      project: projectId,
    }).populate("user", "name username email avatar");

    if (!member) {
      throw new ApiError(404, "Member not found.");
    }

    if (member.user._id.toString() === userId) {
      throw new ApiError(400, "You cannot change your own role.");
    }

    if (member.role === role) {
      throw new ApiError(400, `User is already a ${role}.`);
    }

    if (member.role === ProjectRole.ADMIN && role === ProjectRole.MEMBER) {
      const adminCount = await ProjectMember.countDocuments({
        project: projectId,
        role: ProjectRole.ADMIN,
      });

      if (adminCount <= 1) {
        throw new ApiError(409, "Project must have at least one admin.");
      }
    }

    member.role = role;
    await member.save();

    const affectedUserId = (member.user as any)._id.toString();
    const workspaceId = project.workspace.toString();

    await eventBus.publish(DomainEventName.PROJECT_MEMBER_ROLE_CHANGED, {
      workspaceId,
      projectId,
      memberId: member._id.toString(),
      affectedUserId,
      actorId: userId,
      role,
    });

    return {
      _id: member._id.toString(),
      project: member.project.toString(),
      user: {
        _id: (member.user as any)._id.toString(),
        name: (member.user as any).name,
        username: (member.user as any).username,
        email: (member.user as any).email,
        avatar: (member.user as any).avatar,
      },
      role: member.role,
      joinedAt: member.joinedAt,
    };
  }

  async removeMember(
    projectId: string,
    memberId: string,
    userId: string,
  ): Promise<void> {
    const session = await mongoose.startSession();

    let affectedUserId: string | null = null;

    let committedProjectId: string | null = null;

    let committedWorkspaceId: string | null = null;

    try {
      await session.withTransaction(async () => {
        const project = await Project.findById(projectId)
          .select("_id workspace isArchived")
          .session(session);

        if (!project) {
          throw new ApiError(404, "Project not found.");
        }

        const requester = await ProjectMember.findOne({
          project: project._id,

          user: new Types.ObjectId(userId),
        })
          .select("_id role")
          .session(session);

        if (!requester) {
          throw new ApiError(403, "You are not a member of this project.");
        }

        if (requester.role !== ProjectRole.ADMIN) {
          throw new ApiError(403, "Only project admins can remove members.");
        }

        const workspace = await Workspace.findById(project.workspace)
          .select("_id isArchived")
          .session(session)
          .lean<{
            _id: Types.ObjectId;

            isArchived: boolean;
          }>();

        if (!workspace) {
          throw new ApiError(404, "Workspace not found.");
        }

        if (workspace.isArchived) {
          throw new ApiError(
            409,
            "Members cannot be removed while the workspace is archived.",
          );
        }

        if (project.isArchived) {
          throw new ApiError(
            409,
            "Members cannot be removed from an archived project.",
          );
        }

        const member = await ProjectMember.findOne({
          _id: new Types.ObjectId(memberId),

          project: project._id,
        })
          .select("_id user role")
          .session(session);

        if (!member) {
          throw new ApiError(404, "Member not found.");
        }

        if (member.user.toString() === userId) {
          throw new ApiError(
            409,
            "Use the leave-project endpoint to leave the project.",
          );
        }

        if (member.role === ProjectRole.ADMIN) {
          const adminCount = await ProjectMember.countDocuments({
            project: project._id,

            role: ProjectRole.ADMIN,
          }).session(session);

          if (adminCount <= 1) {
            throw new ApiError(409, "Project must have at least one admin.");
          }
        }

        await this.revokeProjectMemberAccess(
          project._id,
          member._id,
          member.user,
          session,
        );

        affectedUserId = member.user.toString();

        committedProjectId = project._id.toString();

        committedWorkspaceId = workspace._id.toString();
      });

      if (!affectedUserId || !committedProjectId || !committedWorkspaceId) {
        throw new ApiError(
          500,
          "Project member removal completed without the required event context.",
        );
      }

      await eventBus.publish(DomainEventName.PROJECT_MEMBERSHIP_ENDED, {
        workspaceId: committedWorkspaceId,

        projectId: committedProjectId,

        affectedUserId,

        actorId: userId,

        reason: "removed",
      });
    } finally {
      await session.endSession();
    }
  }

  async leaveProject(projectId: string, userId: string): Promise<void> {
    const session = await mongoose.startSession();

    let committedProjectId: string | null = null;

    let committedWorkspaceId: string | null = null;

    try {
      await session.withTransaction(async () => {
        const project = await Project.findById(projectId)
          .select("_id workspace isArchived")
          .session(session);

        if (!project) {
          throw new ApiError(404, "Project not found.");
        }

        const membership = await ProjectMember.findOne({
          project: project._id,

          user: new Types.ObjectId(userId),
        })
          .select("_id user role")
          .session(session);

        if (!membership) {
          throw new ApiError(404, "Project membership not found.");
        }

        const workspace = await Workspace.findById(project.workspace)
          .select("_id isArchived")
          .session(session)
          .lean<{
            _id: Types.ObjectId;

            isArchived: boolean;
          }>();

        if (!workspace) {
          throw new ApiError(404, "Workspace not found.");
        }

        if (workspace.isArchived) {
          throw new ApiError(
            409,
            "You cannot leave a project while its workspace is archived.",
          );
        }

        if (project.isArchived) {
          throw new ApiError(409, "You cannot leave an archived project.");
        }

        if (membership.role === ProjectRole.ADMIN) {
          const adminCount = await ProjectMember.countDocuments({
            project: project._id,

            role: ProjectRole.ADMIN,
          }).session(session);

          if (adminCount <= 1) {
            throw new ApiError(
              409,
              "You are the last project admin. Assign another admin before leaving.",
            );
          }
        }

        await this.revokeProjectMemberAccess(
          project._id,
          membership._id,
          membership.user,
          session,
        );

        committedProjectId = project._id.toString();

        committedWorkspaceId = workspace._id.toString();
      });

      if (!committedProjectId || !committedWorkspaceId) {
        throw new ApiError(
          500,
          "Project leave operation completed without the required event context.",
        );
      }

      await eventBus.publish(DomainEventName.PROJECT_MEMBERSHIP_ENDED, {
        workspaceId: committedWorkspaceId,

        projectId: committedProjectId,

        affectedUserId: userId,

        actorId: userId,

        reason: "left",
      });
    } finally {
      await session.endSession();
    }
  }
}

export default new ProjectMemberService();
