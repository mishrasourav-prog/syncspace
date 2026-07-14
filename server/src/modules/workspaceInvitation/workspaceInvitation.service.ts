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
import mongoose from "mongoose";


class WorkspaceInvitationService {

    private async markExpiredIfNeeded(
    invitationId: string,
    expiresAt: Date,
    now: Date
): Promise<void> {
    if (
        expiresAt.getTime() >
        now.getTime()
    ) {
        return;
    }

    await WorkspaceInvitation.updateOne(
        {
            _id: invitationId,

            status:
                InvitationStatus.PENDING,

            expiresAt: {
                $lte: now,
            },
        },
        {
            $set: {
                status:
                    InvitationStatus.EXPIRED,
            },
        }
    );

    throw new ApiError(
        410,
        "Invitation has expired."
    );
}
    
async inviteUser(
    workspaceId: string,
    invitedBy: string,
    data: InviteUserRequest
): Promise<InvitationResponse> {
    /*
    |--------------------------------------------------------------------------
    | Verify Workspace
    |--------------------------------------------------------------------------
    */

    const workspace = await Workspace.findById(
        workspaceId
    );

    if (!workspace) {
        throw new ApiError(
            404,
            "Workspace not found."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Inviter Membership
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Verify Workspace Is Writable
    |--------------------------------------------------------------------------
    */

    if (workspace.isArchived) {
        throw new ApiError(
            409,
            "Users cannot be invited to an archived workspace."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Resolve Requested Role
    |--------------------------------------------------------------------------
    */

    const requestedRole =
        data.role ?? InvitationRole.MEMBER;

    /*
    |--------------------------------------------------------------------------
    | Verify Invitation Permission
    |--------------------------------------------------------------------------
    */

    if (inviter.role === WorkspaceRole.GUEST) {
        throw new ApiError(
            403,
            "Guests are not allowed to invite users."
        );
    }

    if (inviter.role === WorkspaceRole.MEMBER) {
        if (
            !workspace.settings.allowMemberInvites
        ) {
            throw new ApiError(
                403,
                "Workspace members are not allowed to invite users."
            );
        }

        if (
            requestedRole ===
            InvitationRole.ADMIN
        ) {
            throw new ApiError(
                403,
                "Workspace members cannot invite administrators."
            );
        }
    }

    /*
    Owners and admins may invite admins and members.

    Members may invite members.

    Any permitted inviter may invite a guest only when
    guest invitations are enabled.
    */

    if (
        requestedRole ===
            InvitationRole.GUEST &&
        !workspace.settings.allowGuestInvites
    ) {
        throw new ApiError(
            403,
            "Guest invitations are disabled for this workspace."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Normalize Email
    |--------------------------------------------------------------------------
    */

    const normalizedEmail =
        data.email.trim().toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | Check Existing Membership
    |--------------------------------------------------------------------------
    */

    const user = await User.findOne({
        email: normalizedEmail,
    })
        .select("_id")
        .lean();

    if (user) {
        const existingMember =
            await WorkspaceMember.exists({
                workspace: workspaceId,
                user: user._id,
            });

        if (existingMember) {
            throw new ApiError(
                409,
                "User is already a member of this workspace."
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Check Existing Active Invitation
    |--------------------------------------------------------------------------
    */

    const existingInvitation =
        await WorkspaceInvitation.exists({
            workspace: workspaceId,
            email: normalizedEmail,
            status: InvitationStatus.PENDING,
            expiresAt: {
                $gt: new Date(),
            },
        });

    if (existingInvitation) {
        throw new ApiError(
            409,
            "An active invitation already exists for this email."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Create Invitation
    |--------------------------------------------------------------------------
    */

    const invitation =
        await WorkspaceInvitation.create({
            workspace: workspaceId,
            email: normalizedEmail,
            invitedBy,
            role: requestedRole,
            status:
                InvitationStatus.PENDING,
            expiresAt: new Date(
                Date.now() +
                    7 *
                        24 *
                        60 *
                        60 *
                        1000
            ),
        });

    /*
    |--------------------------------------------------------------------------
    | Return DTO
    |--------------------------------------------------------------------------
    */

    return {
        _id: invitation._id.toString(),

        workspace:
            workspace._id.toString(),

        workspaceName: workspace.name,

        email: invitation.email,

        invitedBy:
            invitation.invitedBy.toString(),

        role: invitation.role,

        status: invitation.status,

        expiresAt: invitation.expiresAt,

        acceptedAt:
            invitation.acceptedAt,

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
    const session = await mongoose.startSession();

    try {
    session.startTransaction();

    const user = await User.findById(userId);

    

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    const now = new Date();

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

    await this.markExpiredIfNeeded(
    invitation._id.toString(),
    invitation.expiresAt,
    now
);



    if (invitation.email !== user.email) {
        throw new ApiError(
            403,
            "You cannot accept this invitation."
        );
    }

    const existingMember = await WorkspaceMember.findOne({
        workspace: invitation.workspace,
        user: user._id,
    }).session(session);

    if (existingMember) {
        throw new ApiError(
            409,
            "User is already a member."
        );
    }

    const member = new WorkspaceMember({
    workspace: invitation.workspace,
    user: user._id,
    role: invitation.role,
});

await member.save({ session });

    invitation.status = InvitationStatus.ACCEPTED;
    invitation.acceptedAt = now;

    await invitation.save({session});

    await session.commitTransaction();

        
    } catch (error) {
         await session.abortTransaction();
        throw error;
        
    }
    finally{
        await session.endSession();

    }

    
}


async rejectInvitation(
    invitationId: string,
    userId: string
): Promise<void> {

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    const now = new Date();

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

    await this.markExpiredIfNeeded(
    invitation._id.toString(),
    invitation.expiresAt,
    now
);

    invitation.status = InvitationStatus.REJECTED;

    await invitation.save();
}

}

export default new WorkspaceInvitationService();  