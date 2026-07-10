import { InvitationRole, InvitationStatus } from "../modules/workspaceInvitation/workspaceInvitation.model";

export interface InviteUserRequest {
    email: string;
    role?: InvitationRole;
}

export interface InvitationResponse {
    _id: string;

    workspace: string;

    workspaceName: string;

    email: string;

    invitedBy: string;

    role: InvitationRole;

    status: InvitationStatus;

    expiresAt: Date;

    acceptedAt?: Date;

    createdAt: Date;

    updatedAt: Date;
}

export interface InvitationListResponse {
    invitations: InvitationResponse[];
}

