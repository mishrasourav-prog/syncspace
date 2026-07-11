import { ProjectRole } from "../modules/projectMember/projectMember.model";

export interface ICreateProjectInvitation {
    email: string;
    role: ProjectRole;
}

export interface IProjectInvitationResponse {
    _id: string;

    project: string;

    email: string;

    invitedBy: string;

    role: ProjectRole;

    status: string;

    expiresAt: Date;

    acceptedAt: Date | null;

    rejectedAt: Date | null;

    createdAt: Date;

    updatedAt: Date;
}

export interface IProjectInvitationsResponse {
    invitations: IProjectInvitationResponse[];
}