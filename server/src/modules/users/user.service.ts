import mongoose, { type ClientSession, Types } from "mongoose";

import { DomainEventName, eventBus } from "../../events";

import { ProjectRole } from "../../interfaces/projectMember.interface";

import ApiError from "../../utils/ApiError";

import AuthService from "../auth/auth.service";

import { User, type IUserDocument } from "../auth/auth.model";

import Notification from "../notifications/notification.model";

import { Otp } from "../otp/otp.model";

import Project from "../project/project.model";
import ProjectInvitation from "../projectInvitation/projectInvitation.model";
import ProjectMember from "../projectMember/projectMember.model";
import TaskAssignee from "../taskAssignee/taskAssignee.model";

import Task, { TaskStatus } from "../tasks/task.model";

import {
  WorkspaceMember,
  WorkspaceRole,
} from "../workspace-member/workspace-member.model";

import { Workspace } from "../workspace/workspace.model";

import { WorkspaceInvitation } from "../workspaceInvitation/workspaceInvitation.model";

import type {
  AccountDeletionReadiness,
  ChangePasswordPayload,
  DeleteAccountPayload,
  MemberProfile,
  MemberProfileContextQuery,
  SelfProfile,
  UpdateSelfProfilePayload,
  UserProfileStats,
} from "./user.interface";

interface MongoDuplicateKeyError {
  code: number;

  keyPattern?: Record<string, number>;
}

interface ProjectAdminCount {
  _id: Types.ObjectId;
  adminCount: number;
}

export interface ProfileMutationResult {
  profile: SelfProfile;

  previousAvatarPublicId: string | null;
}

export interface DeletedAccountCleanup {
  avatarPublicId: string | null;
}

export class UserService {
  private mapSelfProfile(
    user: IUserDocument,
    stats: UserProfileStats,
  ): SelfProfile {
    return {
      _id: user._id.toString(),

      name: user.name,

      username: user.username,

      email: user.email,

      avatar: user.avatar ?? null,

      headline: user.headline ?? null,

      bio: user.bio ?? null,

      location: user.location ?? null,

      provider: user.provider,

      createdAt: user.createdAt.toISOString(),

      updatedAt: user.updatedAt.toISOString(),

      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,

      canChangePassword: user.provider === "email" && Boolean(user.password),

      stats,
    };
  }

  private async getProfileStats(
    userId: Types.ObjectId,
  ): Promise<UserProfileStats> {
    const [workspaces, projects, tasksCompleted] = await Promise.all([
      WorkspaceMember.countDocuments({
        user: userId,
      }),

      ProjectMember.countDocuments({
        user: userId,
      }),

      Task.countDocuments({
        completedBy: userId,

        status: TaskStatus.DONE,
      }),
    ]);

    return {
      workspaces,
      projects,
      tasksCompleted,
    };
  }

  private memberProfileNotFound(): ApiError {
    return new ApiError(404, "Member profile not found.");
  }

  private isMongoDuplicateKeyError(
    error: unknown,
  ): error is MongoDuplicateKeyError {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (
        error as {
          code?: unknown;
        }
      ).code === 11000
    );
  }

  async getSelfProfile(userId: string): Promise<SelfProfile> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new ApiError(404, "User profile not found.");
    }

    const objectId = new Types.ObjectId(userId);

    const [user, stats] = await Promise.all([
      User.findOne({
        _id: objectId,

        deletedAt: null,
      }).select(
        [
          "_id",
          "name",
          "username",
          "email",
          "avatar",
          "headline",
          "bio",
          "location",
          "provider",
          "createdAt",
          "updatedAt",
          "lastLoginAt",
          "+password",
        ].join(" "),
      ),

      this.getProfileStats(objectId),
    ]);

    if (!user) {
      throw new ApiError(404, "User profile not found.");
    }

    return this.mapSelfProfile(user, stats);
  }

  async updateSelfProfile(
    userId: string,
    data: UpdateSelfProfilePayload,
  ): Promise<ProfileMutationResult> {
    const user = await User.findOne({
      _id: userId,

      deletedAt: null,
    }).select("+avatarPublicId");

    if (!user) {
      throw new ApiError(404, "User profile not found.");
    }

    let previousAvatarPublicId: string | null = null;

    if (data.name !== undefined) {
      user.name = data.name;
    }

    if (data.username !== undefined) {
      user.username = data.username;
    }

    if (data.headline !== undefined) {
      user.headline = data.headline;
    }

    if (data.bio !== undefined) {
      user.bio = data.bio;
    }

    if (data.location !== undefined) {
      user.location = data.location;
    }

    if (data.avatar !== undefined) {
      previousAvatarPublicId = user.avatarPublicId ?? null;

      user.avatar = data.avatar;

      user.avatarPublicId = null;
    }

    try {
      await user.save();
    } catch (error) {
      if (this.isMongoDuplicateKeyError(error) && error.keyPattern?.username) {
        throw new ApiError(409, "Username is already taken.");
      }

      throw error;
    }

    return {
      profile: await this.getSelfProfile(userId),

      previousAvatarPublicId,
    };
  }

  async replaceAvatar(
    userId: string,
    avatarUrl: string,
    avatarPublicId: string,
  ): Promise<ProfileMutationResult> {
    const user = await User.findOne({
      _id: userId,

      deletedAt: null,
    }).select("+avatarPublicId");

    if (!user) {
      throw new ApiError(404, "User profile not found.");
    }

    const previousAvatarPublicId = user.avatarPublicId ?? null;

    user.avatar = avatarUrl;

    user.avatarPublicId = avatarPublicId;

    await user.save();

    return {
      profile: await this.getSelfProfile(userId),

      previousAvatarPublicId,
    };
  }

  async removeAvatar(userId: string): Promise<ProfileMutationResult> {
    const user = await User.findOne({
      _id: userId,

      deletedAt: null,
    }).select("+avatarPublicId");

    if (!user) {
      throw new ApiError(404, "User profile not found.");
    }

    const previousAvatarPublicId = user.avatarPublicId ?? null;

    user.avatar = null;

    user.avatarPublicId = null;

    await user.save();

    return {
      profile: await this.getSelfProfile(userId),

      previousAvatarPublicId,
    };
  }

  async changePassword(
    userId: string,
    data: ChangePasswordPayload,
  ): Promise<void> {
    const user = await User.findOne({
      _id: userId,

      deletedAt: null,
    }).select(["+password", "+refreshToken", "+sessionVersion"].join(" "));

    if (!user) {
      throw new ApiError(401, "User account is unavailable.");
    }

    if (user.provider !== "email" || !user.password) {
      throw new ApiError(
        409,
        "Password changes are unavailable for this account.",
      );
    }

    const currentPasswordIsValid = await AuthService.comparePassword(
      data.currentPassword,
      user.password,
    );

    if (!currentPasswordIsValid) {
      throw new ApiError(401, "Current password is incorrect.");
    }

    const isSamePassword = await AuthService.comparePassword(
      data.newPassword,
      user.password,
    );

    if (isSamePassword) {
      throw new ApiError(
        400,
        "New password cannot be the same as the current password.",
      );
    }

    const hashedPassword = await AuthService.hashPassword(data.newPassword);

    const changedAt = new Date();

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,

        password: user.password,

        sessionVersion: user.sessionVersion,

        deletedAt: null,
      },
      {
        $set: {
          password: hashedPassword,

          passwordChangedAt: changedAt,

          refreshToken: null,
        },

        $inc: {
          sessionVersion: 1,
        },
      },
      {
        new: true,

        runValidators: true,

        select: "_id email +sessionVersion",
      },
    );

    if (!updatedUser) {
      throw new ApiError(
        409,
        "The account changed before the password could be updated. Please try again.",
      );
    }

    await Otp.deleteMany({
      email: user.email,
    });

    await eventBus.publish(DomainEventName.USER_SESSION_REVOKED, {
      userId: updatedUser._id.toString(),

      reason: "password_changed",
    });
  }

  private async buildDeletionReadiness(
    userId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<AccountDeletionReadiness> {
    const ownedWorkspacesQuery = Workspace.find({
      owner: userId,
    })
      .select("_id name")
      .sort({
        name: 1,

        _id: 1,
      })
      .lean();

    const adminMembershipsQuery = ProjectMember.find({
      user: userId,

      role: ProjectRole.ADMIN,
    })
      .select("project")
      .lean();

    if (session) {
      ownedWorkspacesQuery.session(session);

      adminMembershipsQuery.session(session);
    }

    const [ownedWorkspaces, adminMemberships] = await Promise.all([
      ownedWorkspacesQuery,
      adminMembershipsQuery,
    ]);

    const candidateProjectIds = Array.from(
      new Map(
        adminMemberships.map((membership): [string, Types.ObjectId] => [
          membership.project.toString(),
          membership.project,
        ]),
      ).values(),
    );

    let lastAdminProjects: AccountDeletionReadiness["blockers"]["lastAdminProjects"] =
      [];

    if (candidateProjectIds.length > 0) {
      const adminCountAggregation = ProjectMember.aggregate<ProjectAdminCount>([
        {
          $match: {
            project: {
              $in: candidateProjectIds,
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
      ]);

      if (session) {
        adminCountAggregation.session(session);
      }

      const adminCounts = await adminCountAggregation.exec();

      const adminCountByProject = new Map(
        adminCounts.map((result) => [result._id.toString(), result.adminCount]),
      );

      const lastAdminProjectIds = candidateProjectIds.filter(
        (projectId) =>
          (adminCountByProject.get(projectId.toString()) ?? 0) <= 1,
      );

      if (lastAdminProjectIds.length > 0) {
        const projectsQuery = Project.find({
          _id: {
            $in: lastAdminProjectIds,
          },
        })
          .select("_id name workspace")
          .lean();

        if (session) {
          projectsQuery.session(session);
        }

        const projects = await projectsQuery;

        const workspaceIds = Array.from(
          new Map(
            projects.map((project): [string, Types.ObjectId] => [
              project.workspace.toString(),
              project.workspace,
            ]),
          ).values(),
        );

        const workspacesQuery = Workspace.find({
          _id: {
            $in: workspaceIds,
          },
        })
          .select("_id name")
          .lean();

        if (session) {
          workspacesQuery.session(session);
        }

        const workspaces = await workspacesQuery;

        const workspaceById = new Map(
          workspaces.map((workspace): [string, typeof workspace] => [
            workspace._id.toString(),
            workspace,
          ]),
        );

        lastAdminProjects = projects
          .map((project) => {
            const workspace = workspaceById.get(project.workspace.toString());

            return {
              _id: project._id.toString(),

              name: project.name,

              workspace: {
                _id: project.workspace.toString(),

                name: workspace?.name ?? "Unavailable workspace",
              },
            };
          })
          .sort((first, second) => first.name.localeCompare(second.name));
      }
    }

    const normalizedOwnedWorkspaces = ownedWorkspaces.map((workspace) => ({
      _id: workspace._id.toString(),

      name: workspace.name,
    }));

    return {
      canDelete:
        normalizedOwnedWorkspaces.length === 0 &&
        lastAdminProjects.length === 0,

      blockers: {
        ownedWorkspaces: normalizedOwnedWorkspaces,

        lastAdminProjects,
      },
    };
  }

  async getDeletionReadiness(
    userId: string,
  ): Promise<AccountDeletionReadiness> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new ApiError(404, "User account is unavailable.");
    }

    const objectId = new Types.ObjectId(userId);

    const userExists = await User.exists({
      _id: objectId,

      deletedAt: null,
    });

    if (!userExists) {
      throw new ApiError(404, "User account is unavailable.");
    }

    return this.buildDeletionReadiness(objectId);
  }

  async deleteAccount(
    userId: string,
    data: DeleteAccountPayload,
  ): Promise<DeletedAccountCleanup> {
    const session = await mongoose.startSession();

    let committedUserId: string | null = null;

    let avatarPublicId: string | null = null;

    try {
      await session.withTransaction(async () => {
        const user = await User.findOne({
          _id: userId,

          deletedAt: null,
        })
          .select(
            [
              "+password",
              "+refreshToken",
              "+sessionVersion",
              "+providerId",
              "+avatarPublicId",
            ].join(" "),
          )
          .session(session);

        if (!user) {
          throw new ApiError(401, "User account is unavailable.");
        }

        if (data.confirmation !== "DELETE") {
          throw new ApiError(400, 'Type "DELETE" to confirm account deletion.');
        }

        if (data.username !== user.username) {
          throw new ApiError(400, "Username confirmation does not match.");
        }

        if (user.provider === "email" && user.password) {
          if (!data.currentPassword) {
            throw new ApiError(
              400,
              "Current password is required to delete this account.",
            );
          }

          const passwordIsValid = await AuthService.comparePassword(
            data.currentPassword,
            user.password,
          );

          if (!passwordIsValid) {
            throw new ApiError(401, "Current password is incorrect.");
          }
        }

        const readiness = await this.buildDeletionReadiness(user._id, session);

        if (!readiness.canDelete) {
          throw new ApiError(
            409,
            "Account deletion is blocked. Transfer owned workspaces and assign another administrator to every affected project first.",
            [readiness.blockers],
          );
        }

        const oldEmail = user.email;

        avatarPublicId = user.avatarPublicId ?? null;

        const now = new Date();

        const tombstoneSuffix = user._id.toString();

        await Promise.all([
          WorkspaceMember.deleteMany({
            user: user._id,
          }).session(session),

          ProjectMember.deleteMany({
            user: user._id,
          }).session(session),

          TaskAssignee.deleteMany({
            user: user._id,
          }).session(session),

          Notification.deleteMany({
            recipient: user._id,
          }).session(session),

          Otp.deleteMany({
            email: oldEmail,
          }).session(session),

          WorkspaceInvitation.deleteMany({
            email: oldEmail,
          }).session(session),

          ProjectInvitation.deleteMany({
            email: oldEmail,
          }).session(session),
        ]);

        const anonymizeResult = await User.updateOne(
          {
            _id: user._id,

            deletedAt: null,

            sessionVersion: user.sessionVersion,
          },
          {
            $set: {
              name: "Deleted user",

              username: `Deleted${tombstoneSuffix}`,

              email: `deleted.${tombstoneSuffix}@syncspace.invalid`,

              avatar: null,

              headline: null,

              bio: null,

              location: null,

              provider: "email",

              refreshToken: null,

              lastLoginAt: null,

              passwordChangedAt: now,

              deletedAt: now,
            },

            $unset: {
              password: 1,

              providerId: 1,

              avatarPublicId: 1,
            },

            $inc: {
              sessionVersion: 1,
            },
          },
          {
            session,
            runValidators: true,
          },
        );

        if (anonymizeResult.modifiedCount !== 1) {
          throw new ApiError(
            409,
            "The account changed before it could be deleted. Please try again.",
          );
        }

        committedUserId = user._id.toString();
      });
    } finally {
      await session.endSession();
    }

    if (!committedUserId) {
      throw new ApiError(500, "Account deletion did not complete.");
    }

    await eventBus.publish(DomainEventName.USER_SESSION_REVOKED, {
      userId: committedUserId,

      reason: "account_deleted",
    });

    return {
      avatarPublicId,
    };
  }

  async getMemberProfile(
    requesterId: string,
    targetUserId: string,
    context: MemberProfileContextQuery,
  ): Promise<MemberProfile> {
    if (
      !Types.ObjectId.isValid(requesterId) ||
      !Types.ObjectId.isValid(targetUserId)
    ) {
      throw this.memberProfileNotFound();
    }

    const requesterObjectId = new Types.ObjectId(requesterId);

    const targetObjectId = new Types.ObjectId(targetUserId);

    let workspaceContext: MemberProfile["context"]["workspace"] = null;

    let projectContext: MemberProfile["context"]["project"] = null;

    if (context.projectId) {
      const project = await Project.findById(context.projectId).select(
        "_id name workspace",
      );

      if (!project) {
        throw this.memberProfileNotFound();
      }

      if (
        context.workspaceId &&
        project.workspace.toString() !== context.workspaceId
      ) {
        throw this.memberProfileNotFound();
      }

      const workspace = await Workspace.findById(project.workspace).select(
        "_id name owner createdAt",
      );

      if (!workspace) {
        throw this.memberProfileNotFound();
      }

      const [
        requesterProjectMembership,
        targetProjectMembership,
        requesterWorkspaceMembership,
        targetWorkspaceMembership,
      ] = await Promise.all([
        ProjectMember.findOne({
          project: project._id,

          user: requesterObjectId,
        }).select("role joinedAt"),

        ProjectMember.findOne({
          project: project._id,

          user: targetObjectId,
        }).select("role joinedAt"),

        WorkspaceMember.findOne({
          workspace: workspace._id,

          user: requesterObjectId,
        }).select("role joinedAt"),

        WorkspaceMember.findOne({
          workspace: workspace._id,

          user: targetObjectId,
        }).select("role joinedAt"),
      ]);

      const requesterIsWorkspaceOwner =
        workspace.owner.toString() === requesterId;

      const targetIsWorkspaceOwner =
        workspace.owner.toString() === targetUserId;

      if (
        !requesterProjectMembership ||
        !targetProjectMembership ||
        (!requesterIsWorkspaceOwner && !requesterWorkspaceMembership) ||
        (!targetIsWorkspaceOwner && !targetWorkspaceMembership)
      ) {
        throw this.memberProfileNotFound();
      }

      projectContext = {
        _id: project._id.toString(),

        name: project.name,

        role: targetProjectMembership.role,

        joinedAt: targetProjectMembership.joinedAt.toISOString(),
      };

      workspaceContext = {
        _id: workspace._id.toString(),

        name: workspace.name,

        role: targetIsWorkspaceOwner
          ? WorkspaceRole.OWNER
          : (targetWorkspaceMembership?.role ?? WorkspaceRole.MEMBER),

        joinedAt: targetIsWorkspaceOwner
          ? workspace.createdAt.toISOString()
          : (targetWorkspaceMembership?.joinedAt.toISOString() ??
            workspace.createdAt.toISOString()),
      };
    } else if (context.workspaceId) {
      const workspace = await Workspace.findById(context.workspaceId).select(
        "_id name owner createdAt",
      );

      if (!workspace) {
        throw this.memberProfileNotFound();
      }

      const [requesterWorkspaceMembership, targetWorkspaceMembership] =
        await Promise.all([
          WorkspaceMember.findOne({
            workspace: workspace._id,

            user: requesterObjectId,
          }).select("role joinedAt"),

          WorkspaceMember.findOne({
            workspace: workspace._id,

            user: targetObjectId,
          }).select("role joinedAt"),
        ]);

      const requesterIsOwner = workspace.owner.toString() === requesterId;

      const targetIsOwner = workspace.owner.toString() === targetUserId;

      if (
        (!requesterIsOwner && !requesterWorkspaceMembership) ||
        (!targetIsOwner && !targetWorkspaceMembership)
      ) {
        throw this.memberProfileNotFound();
      }

      workspaceContext = {
        _id: workspace._id.toString(),

        name: workspace.name,

        role: targetIsOwner
          ? WorkspaceRole.OWNER
          : (targetWorkspaceMembership?.role ?? WorkspaceRole.MEMBER),

        joinedAt: targetIsOwner
          ? workspace.createdAt.toISOString()
          : (targetWorkspaceMembership?.joinedAt.toISOString() ??
            workspace.createdAt.toISOString()),
      };
    } else {
      throw this.memberProfileNotFound();
    }

    const targetUser = await User.findOne({
      _id: targetObjectId,

      deletedAt: null,
    }).select(
      [
        "_id",
        "name",
        "username",
        "avatar",
        "headline",
        "bio",
        "location",
        "createdAt",
      ].join(" "),
    );

    if (!targetUser) {
      throw this.memberProfileNotFound();
    }

    return {
      _id: targetUser._id.toString(),

      name: targetUser.name,

      username: targetUser.username,

      avatar: targetUser.avatar ?? null,

      headline: targetUser.headline ?? null,

      bio: targetUser.bio ?? null,

      location: targetUser.location ?? null,

      createdAt: targetUser.createdAt.toISOString(),

      context: {
        workspace: workspaceContext,

        project: projectContext,
      },
    };
  }
}

export default new UserService();
