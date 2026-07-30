import mongoose, { Types } from "mongoose";

import { DomainEventName, eventBus } from "../../events";
import type {
  InvitationListResponse,
  InvitationResponse,
  InviteUserRequest,
} from "../../interfaces/workspaceInvitation.interface";
import ApiError from "../../utils/ApiError";
import { User } from "../auth/auth.model";
import notificationService from "../notifications/notification.service";
import {
  NotificationEntityType,
  NotificationType,
} from "../notifications/notification.model";
import {
  WorkspaceMember,
  WorkspaceRole,
} from "../workspace-member/workspace-member.model";
import { Workspace } from "../workspace/workspace.model";
import {
  InvitationRole,
  InvitationStatus,
  type IWorkspaceInvitationDocument,
  WorkspaceInvitation,
} from "./workspaceInvitation.model";

class WorkspaceInvitationService {
  private mapInvitation(
    invitation: IWorkspaceInvitationDocument,
    workspaceName: string,
  ): InvitationResponse {
    return {
      _id: invitation._id.toString(),
      workspace: invitation.workspace.toString(),
      workspaceName,
      email: invitation.email,
      invitedBy: invitation.invitedBy.toString(),
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      acceptedAt: invitation.acceptedAt,
      createdAt: invitation.createdAt,
      updatedAt: invitation.updatedAt,
    };
  }

  private async markExpiredIfNeeded(
    invitationId: string,
    expiresAt: Date,
    now: Date,
  ): Promise<void> {
    if (expiresAt.getTime() > now.getTime()) return;

    await WorkspaceInvitation.updateOne(
      {
        _id: invitationId,
        status: InvitationStatus.PENDING,
        expiresAt: { $lte: now },
      },
      { $set: { status: InvitationStatus.EXPIRED } },
    );

    throw new ApiError(410, "Invitation has expired.");
  }

  async inviteUser(
    workspaceId: string,
    invitedBy: string,
    data: InviteUserRequest,
  ): Promise<InvitationResponse> {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new ApiError(404, "Workspace not found.");

    const inviter = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: invitedBy,
    });

    if (!inviter)
      throw new ApiError(403, "You are not a member of this workspace.");
    if (workspace.isArchived) {
      throw new ApiError(
        409,
        "Users cannot be invited to an archived workspace.",
      );
    }

    const requestedRole = data.role ?? InvitationRole.MEMBER;

    if (inviter.role === WorkspaceRole.GUEST) {
      throw new ApiError(403, "Guests are not allowed to invite users.");
    }

    if (inviter.role === WorkspaceRole.MEMBER) {
      if (!workspace.settings.allowMemberInvites) {
        throw new ApiError(
          403,
          "Workspace members are not allowed to invite users.",
        );
      }

      if (requestedRole === InvitationRole.ADMIN) {
        throw new ApiError(
          403,
          "Workspace members cannot invite administrators.",
        );
      }
    }

    if (
      requestedRole === InvitationRole.GUEST &&
      !workspace.settings.allowGuestInvites
    ) {
      throw new ApiError(
        403,
        "Guest invitations are disabled for this workspace.",
      );
    }

    const normalizedEmail = data.email.trim().toLowerCase();
    const invitedUser = await User.findOne({ email: normalizedEmail })
      .select("_id email")
      .lean();

    if (invitedUser) {
      const existingMember = await WorkspaceMember.exists({
        workspace: workspaceId,
        user: invitedUser._id,
      });

      if (existingMember) {
        throw new ApiError(409, "User is already a member of this workspace.");
      }
    }

    const now = new Date();
    await WorkspaceInvitation.updateMany(
      {
        workspace: workspaceId,
        email: normalizedEmail,
        status: InvitationStatus.PENDING,
        expiresAt: { $lte: now },
      },
      { $set: { status: InvitationStatus.EXPIRED } },
    );

    const existingInvitation = await WorkspaceInvitation.exists({
      workspace: workspaceId,
      email: normalizedEmail,
      status: InvitationStatus.PENDING,
      expiresAt: { $gt: now },
    });

    if (existingInvitation) {
      throw new ApiError(
        409,
        "An active invitation already exists for this email.",
      );
    }

    const invitation = await WorkspaceInvitation.create({
      workspace: workspaceId,
      email: normalizedEmail,
      invitedBy,
      role: requestedRole,
      status: InvitationStatus.PENDING,
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    });

    if (invitedUser) {
      try {
        await notificationService.createAndPublishNotification({
          recipientId: invitedUser._id.toString(),
          actorId: invitedBy,
          type: NotificationType.WORKSPACE_INVITATION,
          title: "Workspace invitation",
          message: `You were invited to join “${workspace.name}” as ${requestedRole}.`,
          workspaceId: workspace._id.toString(),
          entityType: NotificationEntityType.WORKSPACE_INVITATION,
          entityId: invitation._id.toString(),
          metadata: {
            invitationId: invitation._id.toString(),
            workspaceName: workspace.name,
            role: requestedRole,
          },
        });
      } catch (error) {
        await WorkspaceInvitation.deleteOne({ _id: invitation._id });
        throw error;
      }
    }

    return this.mapInvitation(invitation, workspace.name);
  }

  async getMyInvitations(userId: string): Promise<InvitationListResponse> {
    const user = await User.findById(userId).select("email").lean();
    if (!user) throw new ApiError(404, "User not found.");

    const normalizedEmail = user.email.trim().toLowerCase();
    const now = new Date();

    await WorkspaceInvitation.updateMany(
      {
        email: normalizedEmail,
        status: InvitationStatus.PENDING,
        expiresAt: { $lte: now },
      },
      { $set: { status: InvitationStatus.EXPIRED } },
    );

    const invitations = await WorkspaceInvitation.find({
      email: normalizedEmail,
      status: InvitationStatus.PENDING,
      expiresAt: { $gt: now },
    })
      .populate("workspace", "name")
      .sort({ createdAt: -1, _id: -1 });

    return {
      invitations: invitations
        .filter((invitation) => invitation.workspace)
        .map((invitation) => {
          const workspace = invitation.workspace as unknown as {
            _id: Types.ObjectId;
            name: string;
          };

          return {
            _id: invitation._id.toString(),
            workspace: workspace._id.toString(),
            workspaceName: workspace.name,
            email: invitation.email,
            invitedBy: invitation.invitedBy.toString(),
            role: invitation.role,
            status: invitation.status,
            expiresAt: invitation.expiresAt,
            acceptedAt: invitation.acceptedAt,
            createdAt: invitation.createdAt,
            updatedAt: invitation.updatedAt,
          };
        }),
    };
  }

  async acceptInvitation(invitationId: string, userId: string): Promise<void> {
    const user = await User.findById(userId).select("_id email name").lean();
    if (!user) throw new ApiError(404, "User not found.");

    const invitation = await WorkspaceInvitation.findById(invitationId);
    if (!invitation) throw new ApiError(404, "Invitation not found.");

    const normalizedEmail = user.email.trim().toLowerCase();
    if (invitation.email !== normalizedEmail) {
      throw new ApiError(403, "You cannot accept this invitation.");
    }
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ApiError(409, "Invitation has already been processed.");
    }

    const now = new Date();
    await this.markExpiredIfNeeded(
      invitation._id.toString(),
      invitation.expiresAt,
      now,
    );

    const session = await mongoose.startSession();
    let workspaceId: string | null = null;
    let workspaceName: string | null = null;
    let memberId: string | null = null;
    let inviterId: string | null = null;

    try {
      await session.withTransaction(async () => {
        const activeInvitation = await WorkspaceInvitation.findOne({
          _id: invitationId,
          email: normalizedEmail,
          status: InvitationStatus.PENDING,
          expiresAt: { $gt: now },
        }).session(session);

        if (!activeInvitation) {
          throw new ApiError(409, "Invitation is no longer available.");
        }

        const workspace = await Workspace.findById(activeInvitation.workspace)
          .select("_id name isArchived")
          .session(session);

        if (!workspace) throw new ApiError(404, "Workspace not found.");
        if (workspace.isArchived) {
          throw new ApiError(409, "Cannot join an archived workspace.");
        }

        const existingMember = await WorkspaceMember.exists({
          workspace: workspace._id,
          user: user._id,
        }).session(session);

        if (existingMember) {
          throw new ApiError(409, "User is already a member.");
        }

        const member = new WorkspaceMember({
          workspace: workspace._id,
          user: user._id,
          role: activeInvitation.role,
        });
        await member.save({ session });

        activeInvitation.status = InvitationStatus.ACCEPTED;
        activeInvitation.acceptedAt = now;
        await activeInvitation.save({ session });

        workspaceId = workspace._id.toString();
        workspaceName = workspace.name;
        memberId = member._id.toString();
        inviterId = activeInvitation.invitedBy.toString();
      });
    } finally {
      await session.endSession();
    }

    if (!workspaceId || !workspaceName || !memberId || !inviterId) {
      throw new ApiError(
        500,
        "Workspace invitation acceptance did not complete.",
      );
    }

    await eventBus.publish(DomainEventName.WORKSPACE_MEMBER_ADDED, {
      workspaceId,
      memberId,
      affectedUserId: user._id.toString(),
      actorId: inviterId,
    });
  }

  async rejectInvitation(invitationId: string, userId: string): Promise<void> {
    const user = await User.findById(userId).select("email").lean();
    if (!user) throw new ApiError(404, "User not found.");

    const invitation = await WorkspaceInvitation.findById(invitationId);
    if (!invitation) throw new ApiError(404, "Invitation not found.");

    if (invitation.email !== user.email.trim().toLowerCase()) {
      throw new ApiError(403, "You cannot reject this invitation.");
    }
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ApiError(409, "Invitation has already been processed.");
    }

    const now = new Date();
    await this.markExpiredIfNeeded(
      invitation._id.toString(),
      invitation.expiresAt,
      now,
    );

    invitation.status = InvitationStatus.REJECTED;
    await invitation.save();
  }
}

export default new WorkspaceInvitationService();
