import ApiError from "../../utils/ApiError";

import { User } from "../auth/auth.model";
import { Workspace } from "../workspace/workspace.model";
import { WorkspaceMember , WorkspaceRole } from "../workspace-member/workspace-member.model";

import {
    WorkspaceInvitation,
    InvitationRole,
    InvitationStatus,
} from "./workspaceInvitation.model";

import {
    InviteUserRequest,
    InvitationResponse,
    InvitationListResponse,
} from "../../interfaces/workspaceInvitation.interface";


class WorkspaceInvitationService {
    async inviteUser(
    workspaceId: string,
    invitedBy: string,
    data: InviteUserRequest
): Promise<InvitationResponse> {

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
        throw new ApiError(404, "Workspace not found.");
    }
    if(workspace.isArchived){
        throw new ApiError(404, "Workspace not found.");
    }

    const inviter = await WorkspaceMember.findOne({
        workspace: workspaceId,
        user: invitedBy,
    });

    if (!inviter) {
        throw new ApiError(
            403,
            "You are not a member of this workspace."
        );
    }

    if (
        inviter.role !== WorkspaceRole.OWNER &&
        inviter.role !== WorkspaceRole.ADMIN &&
        !workspace.settings.allowMemberInvites
    ) {
        throw new ApiError(
            403,
            "You are not allowed to invite members."
        );
    }

    const user = await User.findOne({
        email: data.email.toLowerCase(),
    });

    if (user) {
        const existingMember =
            await WorkspaceMember.findOne({
                workspace: workspaceId,
                user: user._id,
            });

        if (existingMember) {
            throw new ApiError(
                409,
                "User is already a member."
            );
        }
    }

    const existingInvitation =
        await WorkspaceInvitation.findOne({
            workspace: workspaceId,
            email: data.email.toLowerCase(),
            status: InvitationStatus.PENDING,
            expiresAt: { $gt: new Date() },
        });

    if (existingInvitation) {
        throw new ApiError(
            409,
            "An active invitation already exists."
        );
    }

    const invitation =
        await WorkspaceInvitation.create({
            workspace: workspaceId,
            email: data.email.toLowerCase(),
            invitedBy,
            role:
                data.role ??
                InvitationRole.MEMBER,
            status: InvitationStatus.PENDING,
            expiresAt: new Date(
                Date.now() +
                    7 *
                        24 *
                        60 *
                        60 *
                        1000
            ),
        });

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
}

async getMyInvitations(
    userId: string
): Promise<InvitationListResponse> {

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    const invitations = await WorkspaceInvitation.find({
        email: user.email,
        status: InvitationStatus.PENDING,
        expiresAt: {
            $gt: new Date(),
        },
    })
        .populate("workspace", "name")
        .sort({
            createdAt: -1,
        });

    return {
        invitations: invitations.map((invitation) => ({
            _id: invitation._id.toString(),

            workspace: invitation.workspace._id.toString(),

            workspaceName: (invitation.workspace as any).name,

            email: invitation.email,

            invitedBy: invitation.invitedBy.toString(),

            role: invitation.role,

            status: invitation.status,

            expiresAt: invitation.expiresAt,

            acceptedAt: invitation.acceptedAt,

            createdAt: invitation.createdAt,

            updatedAt: invitation.updatedAt,
        })),
    };
}

async acceptInvitation(
    invitationId: string,
    userId: string
): Promise<void> {

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    const invitation = await WorkspaceInvitation.findById(invitationId);

    if (!invitation) {
        throw new ApiError(404, "Invitation not found.");
    }

    if (invitation.status !== InvitationStatus.PENDING) {
        throw new ApiError(
            400,
            "Invitation has already been processed."
        );
    }

    if (invitation.expiresAt < new Date()) {
        invitation.status = InvitationStatus.EXPIRED;
        await invitation.save();

        throw new ApiError(
            400,
            "Invitation has expired."
        );
    }

    if (invitation.email !== user.email) {
        throw new ApiError(
            403,
            "You cannot accept this invitation."
        );
    }

    const existingMember = await WorkspaceMember.findOne({
        workspace: invitation.workspace,
        user: user._id,
    });

    if (existingMember) {
        throw new ApiError(
            409,
            "User is already a member."
        );
    }

    await WorkspaceMember.create({
        workspace: invitation.workspace,
        user: user._id,
        role: invitation.role,
        joinedAt: new Date(),
    });

    invitation.status = InvitationStatus.ACCEPTED;
    invitation.acceptedAt = new Date();

    await invitation.save();
}
async rejectInvitation(
    invitationId: string,
    userId: string
): Promise<void> {

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    const invitation = await WorkspaceInvitation.findById(invitationId);

    if (!invitation) {
        throw new ApiError(404, "Invitation not found.");
    }

    if (invitation.status !== InvitationStatus.PENDING) {
        throw new ApiError(
            400,
            "Invitation has already been processed."
        );
    }

    if (invitation.email !== user.email) {
        throw new ApiError(
            403,
            "You cannot reject this invitation."
        );
    }

    invitation.status = InvitationStatus.REJECTED;

    await invitation.save();
}

}

export default new WorkspaceInvitationService();  