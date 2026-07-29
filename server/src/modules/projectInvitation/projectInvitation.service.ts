import mongoose, { Types } from "mongoose";

import { DomainEventName, eventBus } from "../../events";
import {
  type ICreateProjectInvitation,
  type IProjectInvitationResponse,
  type IProjectInvitationsResponse,
} from "../../interfaces/projectInvitation.interface";
import { ProjectRole } from "../../interfaces/projectMember.interface";
import ApiError from "../../utils/ApiError";
import { User } from "../auth/auth.model";
import notificationService from "../notifications/notification.service";
import {
  NotificationEntityType,
  NotificationType,
} from "../notifications/notification.model";
import Project from "../project/project.model";
import ProjectMember from "../projectMember/projectMember.model";
import { WorkspaceMember } from "../workspace-member/workspace-member.model";
import { Workspace } from "../workspace/workspace.model";
import ProjectInvitation, {
  type IProjectInvitationDocument,
  ProjectInvitationStatus,
} from "./projectInvitation.model";

interface ProjectContext {
  projectId: string;
  projectName: string;
  workspaceId: string;
  workspaceName: string;
}

interface PopulatedProjectInvitation {
  _id: Types.ObjectId;
  project: {
    _id: Types.ObjectId;
    name: string;
    workspace: {
      _id: Types.ObjectId;
      name: string;
    } | Types.ObjectId;
  };
  invitedBy: {
    _id: Types.ObjectId;
    name?: string;
  } | Types.ObjectId;
}


export class ProjectInvitationService {
  private async markExpiredIfNeeded(
    invitationId: string,
    expiresAt: Date,
    now: Date
  ): Promise<void> {
    if (expiresAt.getTime() > now.getTime()) return;

    await ProjectInvitation.updateOne(
      {
        _id: invitationId,
        status: ProjectInvitationStatus.PENDING,
        expiresAt: { $lte: now },
      },
      { $set: { status: ProjectInvitationStatus.EXPIRED } }
    );

    throw new ApiError(410, "Invitation has expired.");
  }

  private mapInvitation(
    invitation: IProjectInvitationDocument,
    context?: ProjectContext,
    invitedByName?: string
  ): IProjectInvitationResponse {
    return {
      _id: invitation._id.toString(),
      project: invitation.project.toString(),
      projectName: context?.projectName,
      workspace: context?.workspaceId,
      workspaceName: context?.workspaceName,
      email: invitation.email,
      invitedBy: invitation.invitedBy.toString(),
      invitedByName,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      acceptedAt: invitation.acceptedAt ?? null,
      rejectedAt: invitation.rejectedAt ?? null,
      createdAt: invitation.createdAt,
      updatedAt: invitation.updatedAt,
    };
  }

  private async getContext(projectId: string): Promise<ProjectContext> {
    const project = await Project.findById(projectId).select("_id name workspace").lean();
    if (!project) throw new ApiError(404, "Project not found.");

    const workspace = await Workspace.findById(project.workspace).select("_id name").lean();
    if (!workspace) throw new ApiError(404, "Workspace not found.");

    return {
      projectId: project._id.toString(),
      projectName: project.name,
      workspaceId: workspace._id.toString(),
      workspaceName: workspace.name,
    };
  }

  async inviteMember(
    projectId: string,
    inviterId: string,
    data: ICreateProjectInvitation
  ): Promise<IProjectInvitationResponse> {
    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found.");

    const inviterProjectMembership = await ProjectMember.findOne({
      project: projectId,
      user: inviterId,
    })
      .select("role")
      .lean();

    if (!inviterProjectMembership) {
      throw new ApiError(403, "You are not a member of this project.");
    }
    if (inviterProjectMembership.role !== ProjectRole.ADMIN) {
      throw new ApiError(403, "Only project admins can invite members.");
    }

    const workspace = await Workspace.findById(project.workspace)
      .select("_id name isArchived")
      .lean();
    if (!workspace) throw new ApiError(404, "Workspace not found.");

    const inviterWorkspaceMembership = await WorkspaceMember.exists({
      workspace: workspace._id,
      user: inviterId,
    });
    if (!inviterWorkspaceMembership) {
      throw new ApiError(403, "You are no longer a member of this workspace.");
    }
    if (workspace.isArchived) {
      throw new ApiError(409, "Users cannot be invited while the workspace is archived.");
    }
    if (project.isArchived) {
      throw new ApiError(409, "Users cannot be invited to an archived project.");
    }

    const normalizedEmail = data.email.trim().toLowerCase();
    const invitedUser = await User.findOne({ email: normalizedEmail })
      .select("_id email")
      .lean();

    if (!invitedUser) {
      throw new ApiError(404, "No user was found with this email.");
    }
    if (invitedUser._id.toString() === inviterId) {
      throw new ApiError(409, "You cannot invite yourself.");
    }

    const invitedUserWorkspaceMembership = await WorkspaceMember.exists({
      workspace: workspace._id,
      user: invitedUser._id,
    });
    if (!invitedUserWorkspaceMembership) {
      throw new ApiError(409, "The user must join the workspace before being invited to this project.");
    }

    const existingProjectMember = await ProjectMember.exists({
      project: projectId,
      user: invitedUser._id,
    });
    if (existingProjectMember) {
      throw new ApiError(409, "User is already a member of this project.");
    }

    const now = new Date();
    await ProjectInvitation.updateMany(
      {
        project: projectId,
        email: normalizedEmail,
        status: ProjectInvitationStatus.PENDING,
        expiresAt: { $lte: now },
      },
      { $set: { status: ProjectInvitationStatus.EXPIRED } }
    );

    const existingInvitation = await ProjectInvitation.exists({
      project: projectId,
      email: normalizedEmail,
      status: ProjectInvitationStatus.PENDING,
      expiresAt: { $gt: now },
    });
    if (existingInvitation) {
      throw new ApiError(409, "An active invitation already exists for this user.");
    }

    const invitation = await ProjectInvitation.create({
      project: projectId,
      email: normalizedEmail,
      invitedBy: inviterId,
      role: data.role,
      status: ProjectInvitationStatus.PENDING,
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    });

    try {
      await notificationService.createAndPublishNotification({
        recipientId: invitedUser._id.toString(),
        actorId: inviterId,
        type: NotificationType.PROJECT_INVITATION,
        title: "Project invitation",
        message: `You were invited to join “${project.name}” in “${workspace.name}” as ${data.role}.`,
        workspaceId: workspace._id.toString(),
        projectId: project._id.toString(),
        entityType: NotificationEntityType.PROJECT_INVITATION,
        entityId: invitation._id.toString(),
        metadata: {
          invitationId: invitation._id.toString(),
          projectName: project.name,
          workspaceName: workspace.name,
          role: data.role,
        },
      });
    } catch (error) {
      // Keep invitation creation atomic from the user's perspective. A
      // registered recipient must never receive an invisible invitation.
      await ProjectInvitation.deleteOne({ _id: invitation._id });
      throw error;
    }

    return this.mapInvitation(invitation, {
      projectId: project._id.toString(),
      projectName: project.name,
      workspaceId: workspace._id.toString(),
      workspaceName: workspace.name,
    });
  }

  async acceptInvitation(invitationId: string, userId: string): Promise<void> {
    const now = new Date();
    const user = await User.findById(userId).select("_id email name").lean();
    if (!user) throw new ApiError(404, "User not found.");

    const invitation = await ProjectInvitation.findById(invitationId);
    if (!invitation) throw new ApiError(404, "Invitation not found.");

    const normalizedEmail = user.email.trim().toLowerCase();
    if (invitation.email !== normalizedEmail) {
      throw new ApiError(403, "You cannot accept this invitation.");
    }
    if (invitation.status !== ProjectInvitationStatus.PENDING) {
      throw new ApiError(409, "Invitation has already been processed.");
    }
    await this.markExpiredIfNeeded(invitation._id.toString(), invitation.expiresAt, now);

    const session = await mongoose.startSession();
    let committedProjectId: string | null = null;
    let committedProjectName: string | null = null;
    let committedWorkspaceId: string | null = null;
    let committedWorkspaceName: string | null = null;
    let memberId: string | null = null;
    let inviterId: string | null = null;

    try {
      await session.withTransaction(async () => {
        const activeInvitation = await ProjectInvitation.findOne({
          _id: invitationId,
          email: normalizedEmail,
          status: ProjectInvitationStatus.PENDING,
          expiresAt: { $gt: now },
        }).session(session);

        if (!activeInvitation) {
          throw new ApiError(409, "Invitation is no longer available.");
        }

        const project = await Project.findById(activeInvitation.project).session(session);
        if (!project) throw new ApiError(404, "Project not found.");

        const workspace = await Workspace.findById(project.workspace)
          .select("_id name isArchived")
          .session(session);
        if (!workspace) throw new ApiError(404, "Workspace not found.");
        if (workspace.isArchived) {
          throw new ApiError(409, "Cannot join a project while its workspace is archived.");
        }
        if (project.isArchived) {
          throw new ApiError(409, "Cannot join an archived project.");
        }

        const workspaceMembership = await WorkspaceMember.exists({
          workspace: project.workspace,
          user: user._id,
        }).session(session);
        if (!workspaceMembership) {
          throw new ApiError(403, "You must be a workspace member before joining this project.");
        }

        const existingMember = await ProjectMember.exists({
          project: activeInvitation.project,
          user: user._id,
        }).session(session);
        if (existingMember) {
          throw new ApiError(409, "You are already a member of this project.");
        }

        const member = new ProjectMember({
          project: activeInvitation.project,
          user: user._id,
          role: activeInvitation.role,
        });
        await member.save({ session });

        activeInvitation.status = ProjectInvitationStatus.ACCEPTED;
        activeInvitation.acceptedAt = now;
        await activeInvitation.save({ session });

        committedProjectId = project._id.toString();
        committedProjectName = project.name;
        committedWorkspaceId = workspace._id.toString();
        committedWorkspaceName = workspace.name;
        memberId = member._id.toString();
        inviterId = activeInvitation.invitedBy.toString();
      });
    } finally {
      await session.endSession();
    }

    if (
      !committedProjectId ||
      !committedProjectName ||
      !committedWorkspaceId ||
      !committedWorkspaceName ||
      !memberId ||
      !inviterId
    ) {
      throw new ApiError(500, "Project invitation acceptance did not complete.");
    }

    await eventBus.publish(DomainEventName.PROJECT_MEMBER_ADDED, {
      workspaceId: committedWorkspaceId,
      projectId: committedProjectId,
      memberId,
      affectedUserId: user._id.toString(),
      actorId: inviterId,
    });
  }

  async rejectInvitation(invitationId: string, userId: string): Promise<void> {
    const user = await User.findById(userId).select("email").lean();
    if (!user) throw new ApiError(404, "User not found.");

    const invitation = await ProjectInvitation.findById(invitationId);
    if (!invitation) throw new ApiError(404, "Invitation not found.");

    if (invitation.email !== user.email.trim().toLowerCase()) {
      throw new ApiError(403, "You cannot reject this invitation.");
    }
    if (invitation.status !== ProjectInvitationStatus.PENDING) {
      throw new ApiError(409, "Invitation has already been processed.");
    }

    const now = new Date();
    await this.markExpiredIfNeeded(invitation._id.toString(), invitation.expiresAt, now);

    invitation.status = ProjectInvitationStatus.REJECTED;
    invitation.rejectedAt = now;
    await invitation.save();
  }

  async cancelInvitation(invitationId: string, userId: string): Promise<void> {
    const invitation = await ProjectInvitation.findById(invitationId);
    if (!invitation) throw new ApiError(404, "Invitation not found.");

    const project = await Project.findById(invitation.project);
    if (!project) throw new ApiError(404, "Project not found.");

    const membership = await ProjectMember.findOne({
      project: project._id,
      user: userId,
    })
      .select("role")
      .lean();

    if (!membership) throw new ApiError(403, "You are not a member of this project.");
    if (membership.role !== ProjectRole.ADMIN) {
      throw new ApiError(403, "Only project admins can cancel invitations.");
    }
    if (invitation.status !== ProjectInvitationStatus.PENDING) {
      throw new ApiError(409, "Invitation has already been processed.");
    }

    const now = new Date();
    await this.markExpiredIfNeeded(invitation._id.toString(), invitation.expiresAt, now);

    invitation.status = ProjectInvitationStatus.CANCELLED;
    await invitation.save();
  }

  async getPendingInvitations(
    projectId: string,
    userId: string
  ): Promise<IProjectInvitationsResponse> {
    const project = await Project.findById(projectId).select("_id name workspace").lean();
    if (!project) throw new ApiError(404, "Project not found.");

    const member = await ProjectMember.findOne({ project: projectId, user: userId })
      .select("role")
      .lean();
    if (!member) throw new ApiError(403, "You are not a member of this project.");
    if (member.role !== ProjectRole.ADMIN) {
      throw new ApiError(403, "Only project admins can view invitations.");
    }

    const workspace = await Workspace.findById(project.workspace).select("_id name").lean();
    if (!workspace) throw new ApiError(404, "Workspace not found.");

    const now = new Date();
    await ProjectInvitation.updateMany(
      {
        project: projectId,
        status: ProjectInvitationStatus.PENDING,
        expiresAt: { $lte: now },
      },
      { $set: { status: ProjectInvitationStatus.EXPIRED } }
    );

    const invitations = await ProjectInvitation.find({
      project: projectId,
      status: ProjectInvitationStatus.PENDING,
      expiresAt: { $gt: now },
    }).sort({ createdAt: -1, _id: -1 });

    const context: ProjectContext = {
      projectId: project._id.toString(),
      projectName: project.name,
      workspaceId: workspace._id.toString(),
      workspaceName: workspace.name,
    };

    return { invitations: invitations.map((item) => this.mapInvitation(item, context)) };
  }

  async getMyInvitations(userId: string): Promise<IProjectInvitationsResponse> {
    const user = await User.findById(userId).select("email").lean();
    if (!user) throw new ApiError(404, "User not found.");

    const normalizedEmail = user.email.trim().toLowerCase();
    const now = new Date();

    await ProjectInvitation.updateMany(
      {
        email: normalizedEmail,
        status: ProjectInvitationStatus.PENDING,
        expiresAt: { $lte: now },
      },
      { $set: { status: ProjectInvitationStatus.EXPIRED } }
    );

    const invitations = await ProjectInvitation.find({
      email: normalizedEmail,
      status: ProjectInvitationStatus.PENDING,
      expiresAt: { $gt: now },
    })
      .populate({
        path: "project",
        select: "name workspace",
        populate: { path: "workspace", select: "name" },
      })
      .populate("invitedBy", "name")
      .sort({ createdAt: -1, _id: -1 });

    return {
      invitations: invitations
        .filter((item) => item.project)
        .map((item) => {
          const populated = item as unknown as PopulatedProjectInvitation;
          const project = populated.project;
          const workspace = project.workspace as { _id: Types.ObjectId; name: string };
          const inviter = populated.invitedBy as { _id: Types.ObjectId; name?: string };

          return {
            _id: item._id.toString(),
            project: project._id.toString(),
            projectName: project.name,
            workspace: workspace._id.toString(),
            workspaceName: workspace.name,
            email: item.email,
            invitedBy: inviter._id.toString(),
            invitedByName: inviter.name,
            role: item.role,
            status: item.status,
            expiresAt: item.expiresAt,
            acceptedAt: item.acceptedAt ?? null,
            rejectedAt: item.rejectedAt ?? null,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          };
        }),
    };
  }
}

export default new ProjectInvitationService();
