import { WorkspaceMember } from "./workspace-member.model";
import ApiError from "../../utils/ApiError";
import {
  WorkspaceMembersResponse,
  WorkspaceMemberResponse,
} from "../../interfaces/WorkspaceMemberResponse.interface";
import { Workspace } from "../workspace/workspace.model";
import { WorkspaceRole } from "./workspace-member.model";

import Project from "../project/project.model";
import ProjectMember from "../projectMember/projectMember.model";
import { ProjectRole } from "../../interfaces/projectMember.interface";

import Task from "../tasks/task.model";
import TaskAssignee from "../taskAssignee/taskAssignee.model";

import mongoose, { ClientSession, Types } from "mongoose";

import { DomainEventName, eventBus } from "../../events";

export class WorkspaceMembers {
  private async revokeWorkspaceAccess(
    workspaceId: Types.ObjectId,
    workspaceMemberId: Types.ObjectId,
    targetUserId: Types.ObjectId,
    session: ClientSession,
  ): Promise<void> {
    const projects = await Project.find({
      workspace: workspaceId,
    })
      .select("_id")
      .session(session)
      .lean();

    const projectIds = projects.map((project) => project._id);

    if (projectIds.length > 0) {
      const projectMemberships = await ProjectMember.find({
        project: {
          $in: projectIds,
        },
        user: targetUserId,
      })
        .select("_id project role")
        .session(session)
        .lean();

      const adminProjectIds = projectMemberships
        .filter((membership) => membership.role === ProjectRole.ADMIN)
        .map((membership) => membership.project);

      if (adminProjectIds.length > 0) {
        const adminCounts = await ProjectMember.aggregate<{
          _id: Types.ObjectId;
          adminCount: number;
        }>([
          {
            $match: {
              project: {
                $in: adminProjectIds,
              },
              role: ProjectRole.ADMIN,
            },
          },
          {
            $group: {
              _id: "$project",
              adminCount: {
                $sum: 1,
              },
            },
          },
        ]).session(session);

        const adminCountMap = new Map<string, number>(
          adminCounts.map((result) => [
            result._id.toString(),
            result.adminCount,
          ]),
        );

        const projectsWithoutAnotherAdmin = adminProjectIds.filter(
          (projectId) => (adminCountMap.get(projectId.toString()) ?? 0) <= 1,
        );

        if (projectsWithoutAnotherAdmin.length > 0) {
          throw new ApiError(
            409,
            "This member is the last admin of one or more projects. Assign another project admin before removing them from the workspace.",
          );
        }
      }

      const taskIds = await Task.distinct("_id", {
        project: {
          $in: projectIds,
        },
      }).session(session);

      if (taskIds.length > 0) {
        await TaskAssignee.deleteMany({
          task: {
            $in: taskIds,
          },
          user: targetUserId,
        }).session(session);
      }

      const projectMembershipIds = projectMemberships.map(
        (membership) => membership._id,
      );

      if (projectMembershipIds.length > 0) {
        await ProjectMember.deleteMany({
          _id: {
            $in: projectMembershipIds,
          },
        }).session(session);
      }
    }

    await WorkspaceMember.deleteOne({
      _id: workspaceMemberId,
      workspace: workspaceId,
      user: targetUserId,
    }).session(session);
  }

  async getWorkspaceMembers(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMembersResponse> {
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      throw new ApiError(404, "Workspace not found.");
    }

    const isOwner = workspace.owner.toString() === userId;

    const membership = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: userId,
    });

    if (!isOwner && !membership) {
      throw new ApiError(403, "You are not a member of this workspace.");
    }

    const members = await WorkspaceMember.find({
      workspace: workspaceId,
    })
      .populate("user", "name username email avatar")
      .sort({
        joinedAt: 1,
        _id: 1,
      });

    return {
      members: members.map((member) => ({
        _id: member._id.toString(),

        user: {
          _id: (member.user as any)._id.toString(),
          name: (member.user as any).name,
          username: (member.user as any).username,
          email: (member.user as any).email,
          avatar: (member.user as any).avatar,
        },

        role: member.role,

        joinedAt: member.joinedAt,

        createdAt: member.createdAt,

        updatedAt: member.updatedAt,
      })),
    };
  }
  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    userId: string,
    role: WorkspaceRole,
  ): Promise<WorkspaceMemberResponse> {
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      throw new ApiError(404, "Workspace not found.");
    }

    if (workspace.owner.toString() !== userId) {
      throw new ApiError(
        403,
        "Only the workspace owner can update member roles.",
      );
    }

    if (workspace.isArchived) {
      throw new ApiError(
        409,
        "Member roles cannot be changed in an archived workspace.",
      );
    }

    const member = await WorkspaceMember.findOne({
      _id: memberId,
      workspace: workspaceId,
    }).populate("user", "name username email avatar");

    if (!member) {
      throw new ApiError(404, "Member not found.");
    }

    if (member.role === WorkspaceRole.OWNER) {
      throw new ApiError(409, "The workspace owner's role cannot be changed.");
    }

    if (member.role === role) {
      throw new ApiError(400, `User is already a ${role}.`);
    }

    member.role = role;

    await member.save();

    const affectedUserId = (member.user as any)._id.toString();

    await eventBus.publish(DomainEventName.WORKSPACE_MEMBER_ROLE_CHANGED, {
      workspaceId,
      memberId: member._id.toString(),
      affectedUserId,
      actorId: userId,
      role,
    });

    return {
      _id: member._id.toString(),

      user: {
        _id: (member.user as any)._id.toString(),
        name: (member.user as any).name,
        username: (member.user as any).username,
        email: (member.user as any).email,
        avatar: (member.user as any).avatar,
      },

      role: member.role,

      joinedAt: member.joinedAt,

      createdAt: member.createdAt,

      updatedAt: member.updatedAt,
    };
  }

  async removeMember(
    workspaceId: string,
    memberId: string,
    userId: string,
  ): Promise<void> {
    const session = await mongoose.startSession();

    let affectedUserId: string | null = null;

    let committedWorkspaceId: string | null = null;

    let committedProjectIds: string[] = [];

    try {
      await session.withTransaction(async () => {
        const workspace = await Workspace.findById(workspaceId)
          .select("_id owner isArchived")
          .session(session);

        if (!workspace) {
          throw new ApiError(404, "Workspace not found.");
        }

        if (workspace.isArchived) {
          throw new ApiError(
            409,
            "Members cannot be removed from an archived workspace.",
          );
        }

        if (workspace.owner.toString() !== userId) {
          throw new ApiError(
            403,
            "Only the workspace owner can remove members.",
          );
        }

        const member = await WorkspaceMember.findOne({
          _id: new Types.ObjectId(memberId),

          workspace: workspace._id,
        })
          .select("_id user role")
          .session(session);

        if (!member) {
          throw new ApiError(404, "Member not found.");
        }

        if (member.role === WorkspaceRole.OWNER) {
          throw new ApiError(409, "Workspace owner cannot be removed.");
        }

        if (member.user.toString() === userId) {
          throw new ApiError(
            409,
            "The workspace owner cannot remove themselves.",
          );
        }

        const projects = await Project.find({
          workspace: workspace._id,
        })
          .select("_id")
          .session(session)
          .lean<
            {
              _id: Types.ObjectId;
            }[]
          >()
          .exec();

        await this.revokeWorkspaceAccess(
          workspace._id,
          member._id,
          member.user,
          session,
        );

        affectedUserId = member.user.toString();

        committedWorkspaceId = workspace._id.toString();

        committedProjectIds = projects.map((project) => project._id.toString());
      });

      if (affectedUserId && committedWorkspaceId) {
        await eventBus.publish(DomainEventName.WORKSPACE_MEMBERSHIP_ENDED, {
          workspaceId: committedWorkspaceId,

          projectIds: committedProjectIds,

          affectedUserId,

          actorId: userId,

          reason: "removed",
        });
      }
    } finally {
      await session.endSession();
    }
  }

  async leaveWorkspace(workspaceId: string, userId: string): Promise<void> {
    const session = await mongoose.startSession();

    let committedWorkspaceId: string | null = null;

    let committedProjectIds: string[] = [];

    try {
      await session.withTransaction(async () => {
        const workspace = await Workspace.findById(workspaceId)
          .select("_id owner isArchived")
          .session(session);

        if (!workspace) {
          throw new ApiError(404, "Workspace not found.");
        }

        if (workspace.isArchived) {
          throw new ApiError(409, "You cannot leave an archived workspace.");
        }

        if (workspace.owner.toString() === userId) {
          throw new ApiError(
            409,
            "The workspace owner cannot leave. Transfer ownership before leaving.",
          );
        }

        const membership = await WorkspaceMember.findOne({
          workspace: workspace._id,

          user: new Types.ObjectId(userId),
        })
          .select("_id user role")
          .session(session);

        if (!membership) {
          throw new ApiError(404, "Workspace membership not found.");
        }

        if (membership.role === WorkspaceRole.OWNER) {
          throw new ApiError(
            409,
            "The workspace owner cannot leave. Transfer ownership before leaving.",
          );
        }

        const projects = await Project.find({
          workspace: workspace._id,
        })
          .select("_id")
          .session(session)
          .lean<
            {
              _id: Types.ObjectId;
            }[]
          >()
          .exec();

        await this.revokeWorkspaceAccess(
          workspace._id,
          membership._id,
          membership.user,
          session,
        );

        committedWorkspaceId = workspace._id.toString();

        committedProjectIds = projects.map((project) => project._id.toString());
      });

      if (committedWorkspaceId) {
        await eventBus.publish(DomainEventName.WORKSPACE_MEMBERSHIP_ENDED, {
          workspaceId: committedWorkspaceId,

          projectIds: committedProjectIds,

          affectedUserId: userId,

          actorId: userId,

          reason: "left",
        });
      }
    } finally {
      await session.endSession();
    }
  }
}

export default new WorkspaceMembers();
