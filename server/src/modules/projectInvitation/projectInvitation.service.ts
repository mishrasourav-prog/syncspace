import ProjectInvitation, {
    IProjectInvitationDocument,
    ProjectInvitationStatus,
} from "./projectInvitation.model";

import Project from "../project/project.model";

import ProjectMember, {
    ProjectRole,
} from "../projectMember/projectMember.model";

import { WorkspaceMember } from "../workspace-member/workspace-member.model";

import { User } from "../auth/auth.model";

import ApiError from "../../utils/ApiError";

import mongoose from "mongoose";

import {
    ICreateProjectInvitation,
    IProjectInvitationResponse,
    IProjectInvitationsResponse
} from "../../interfaces/projectInvitation.interface";

import { getProjectOrThrow } from "../../helpers/project.helper";
import { getUserOrThrowByEmail } from "../../helpers/user.helper";


export class ProjectInvitationService {
    
    
    private mapInvitation(
    invitation: IProjectInvitationDocument
): IProjectInvitationResponse {

    return {
        _id: invitation._id.toString(),

        project: invitation.project.toString(),

        email: invitation.email,

        invitedBy: invitation.invitedBy.toString(),

        role: invitation.role,

        status: invitation.status,

        expiresAt: invitation.expiresAt,

        acceptedAt: invitation.acceptedAt ?? null,

        rejectedAt: invitation.rejectedAt ?? null,

        createdAt: invitation.createdAt,

        updatedAt: invitation.updatedAt,
    };
}


async inviteMember(
    projectId: string,
    inviterId: string,
    data: ICreateProjectInvitation
): Promise<IProjectInvitationResponse> {
    /*
|--------------------------------------------------------------------------
| Verify Project
|--------------------------------------------------------------------------
*/


const project = await getProjectOrThrow(projectId);

if (project.isArchived) {
    throw new ApiError(
        400,
        "Cannot invite members to an archived project."
    );
}

/*
|--------------------------------------------------------------------------
| Verify Project Admin
|--------------------------------------------------------------------------
*/

const projectMember = await ProjectMember.findOne({
    project: projectId,
    user: inviterId,
});

if (!projectMember) {
    throw new ApiError(
        403,
        "You are not a member of this project."
    );
}

if (projectMember.role !== ProjectRole.ADMIN) {
    throw new ApiError(
        403,
        "Only project admins can invite members."
    );
}

/*
|--------------------------------------------------------------------------
| Verify Invited User
|--------------------------------------------------------------------------
*/

const user = await getUserOrThrowByEmail(data.email);

if (user._id.toString() === inviterId) {
    throw new ApiError(
        400,
        "You cannot invite yourself."
    );
}

/*
|--------------------------------------------------------------------------
| Verify Workspace Membership
|--------------------------------------------------------------------------
*/

const workspaceMember = await WorkspaceMember.findOne({
    workspace: project.workspace,
    user: user._id,
});

if (!workspaceMember) {
    throw new ApiError(
        400,
        "User is not a member of this workspace."
    );
}

/*
|--------------------------------------------------------------------------
| Verify Project Membership
|--------------------------------------------------------------------------
*/

const existingProjectMember =
    await ProjectMember.findOne({
        project: projectId,
        user: user._id,
    });

if (existingProjectMember) {
    throw new ApiError(
        409,
        "User is already a project member."
    );
}

/*
|--------------------------------------------------------------------------
| Verify Pending Invitation
|--------------------------------------------------------------------------
*/

const existingInvitation =
    await ProjectInvitation.findOne({
        project: projectId,
        email: data.email,
        status: ProjectInvitationStatus.PENDING,
    });

if (existingInvitation) {
    throw new ApiError(
        409,
        "A pending invitation already exists."
    );
}

/*
|--------------------------------------------------------------------------
| Create Invitation
|--------------------------------------------------------------------------
*/

const invitation = new ProjectInvitation({
    project: projectId,

    email: data.email,

    invitedBy: inviterId,

    role: data.role,

    expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    ),
});

await invitation.save();

/*
|--------------------------------------------------------------------------
| Return Response
|--------------------------------------------------------------------------
*/

return this.mapInvitation(invitation);



}

async acceptInvitation(
    invitationId: string,
    userId: string
): Promise<void>{
    const user = await User.findById(userId);

if (!user) {
    throw new ApiError(
        404,
        "User not found."
    );
}

const invitation =
    await ProjectInvitation.findById(invitationId);

if (!invitation) {
    throw new ApiError(
        404,
        "Invitation not found."
    );
}

const session = await mongoose.startSession();

try {

    session.startTransaction();

    /*
|--------------------------------------------------------------------------
| Verify Invitation Status
|--------------------------------------------------------------------------
*/

if (
    invitation.status !==
    ProjectInvitationStatus.PENDING
) {
    throw new ApiError(
        400,
        "Invitation has already been processed."
    );
}

/*
|--------------------------------------------------------------------------
| Verify Expiry
|--------------------------------------------------------------------------
*/

if (invitation.expiresAt < new Date()) {

    invitation.status =
        ProjectInvitationStatus.EXPIRED;

    await invitation.save({ session });

    throw new ApiError(
        400,
        "Invitation has expired."
    );
}

/*
|--------------------------------------------------------------------------
| Verify Invited User
|--------------------------------------------------------------------------
*/

if (invitation.email !== user.email) {
    throw new ApiError(
        403,
        "You cannot accept this invitation."
    );
}

/*
|--------------------------------------------------------------------------
| Verify Project
|--------------------------------------------------------------------------
*/

const project = await Project.findById(
    invitation.project
).session(session);

if (!project) {
    throw new ApiError(
        404,
        "Project not found."
    );
}

if (project.isArchived) {
    throw new ApiError(
        400,
        "Cannot join an archived project."
    );
}

/*
|--------------------------------------------------------------------------
| Verify Workspace Membership
|--------------------------------------------------------------------------
*/

const workspaceMember =
    await WorkspaceMember.findOne({
        workspace: project.workspace,
        user: user._id,
    }).session(session);

if (!workspaceMember) {
    throw new ApiError(
        403,
        "You are no longer a member of the workspace."
    );
}

/*
|--------------------------------------------------------------------------
| Verify Existing Membership
|--------------------------------------------------------------------------
*/

const existingMember =
    await ProjectMember.findOne({
        project: invitation.project,
        user: user._id,
    }).session(session);

if (existingMember) {
    throw new ApiError(
        409,
        "User is already a project member."
    );
}

/*
|--------------------------------------------------------------------------
| Create Project Member
|--------------------------------------------------------------------------
*/

const member = new ProjectMember({
    project: invitation.project,
    user: user._id,
    role: invitation.role,
});

await member.save({ session });

/*
|--------------------------------------------------------------------------
| Update Invitation
|--------------------------------------------------------------------------
*/

invitation.status =
    ProjectInvitationStatus.ACCEPTED;

invitation.acceptedAt = new Date();

await invitation.save({ session });

/*
|--------------------------------------------------------------------------
| Commit Transaction
|--------------------------------------------------------------------------
*/

await session.commitTransaction();

}

catch (error) {

    await session.abortTransaction();

    throw error;
}

finally {

    session.endSession();
}}

async rejectInvitation(
    invitationId: string,
    userId: string
): Promise<void>{
    const user = await User.findById(userId);

if (!user) {
    throw new ApiError(
        404,
        "User not found."
    );
}

const invitation =
    await ProjectInvitation.findById(invitationId);

if (!invitation) {
    throw new ApiError(
        404,
        "Invitation not found."
    );
}
/*
|--------------------------------------------------------------------------
| Verify Invitation Status
|--------------------------------------------------------------------------
*/

if (
    invitation.status !==
    ProjectInvitationStatus.PENDING
) {
    throw new ApiError(
        400,
        "Invitation has already been processed."
    );
}
/*
|--------------------------------------------------------------------------
| Verify Expiry
|--------------------------------------------------------------------------
*/

if (invitation.expiresAt < new Date()) {

    invitation.status =
        ProjectInvitationStatus.EXPIRED;

    await invitation.save();

    throw new ApiError(
        400,
        "Invitation has expired."
    );
}
/*
|--------------------------------------------------------------------------
| Verify User
|--------------------------------------------------------------------------
*/

if (invitation.email !== user.email) {
    throw new ApiError(
        403,
        "You cannot reject this invitation."
    );
}
/*
|--------------------------------------------------------------------------
| Reject Invitation
|--------------------------------------------------------------------------
*/

invitation.status =
    ProjectInvitationStatus.REJECTED;

invitation.rejectedAt =
    new Date();

await invitation.save();

}

async cancelInvitation(
    invitationId: string,
    userId: string
): Promise<void> {

    /*
    |--------------------------------------------------------------------------
    | Verify Invitation
    |--------------------------------------------------------------------------
    */

    const invitation =
        await ProjectInvitation.findById(invitationId);

    if (!invitation) {
        throw new ApiError(
            404,
            "Invitation not found."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Project
    |--------------------------------------------------------------------------
    */

    const project = await Project.findById(
        invitation.project
    );

    if (!project) {
        throw new ApiError(
            404,
            "Project not found."
        );
    }

    if (project.isArchived) {
        throw new ApiError(
            400,
            "Project is archived."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Project Admin
    |--------------------------------------------------------------------------
    */

    const projectMember =
        await ProjectMember.findOne({
            project: project._id,
            user: userId,
        });

    if (!projectMember) {
        throw new ApiError(
            403,
            "You are not a member of this project."
        );
    }

    if (projectMember.role !== ProjectRole.ADMIN) {
        throw new ApiError(
            403,
            "Only project admins can cancel invitations."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Invitation Status
    |--------------------------------------------------------------------------
    */

    if (
        invitation.status !==
        ProjectInvitationStatus.PENDING
    ) {
        throw new ApiError(
            400,
            "Invitation has already been processed."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Cancel Invitation
    |--------------------------------------------------------------------------
    */

    invitation.status =
        ProjectInvitationStatus.CANCELLED;

    await invitation.save();
}

async getPendingInvitations(
    projectId: string,
    userId: string
): Promise<IProjectInvitationsResponse> {

    /*
    |--------------------------------------------------------------------------
    | Verify Project
    |--------------------------------------------------------------------------
    */

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(
            404,
            "Project not found."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Project Member
    |--------------------------------------------------------------------------
    */

    const member = await ProjectMember.findOne({
        project: projectId,
        user: userId,
    });

    if (!member) {
        throw new ApiError(
            403,
            "You are not a member of this project."
        );
    }

    if (member.role !== ProjectRole.ADMIN) {
        throw new ApiError(
            403,
            "Only project admins can view invitations."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch Pending Invitations
    |--------------------------------------------------------------------------
    */

    const invitations =
        await ProjectInvitation.find({
            project: projectId,
            status: ProjectInvitationStatus.PENDING,
        })
        .sort({
            createdAt: -1,
        });

    /*
    |--------------------------------------------------------------------------
    | Return Response
    |--------------------------------------------------------------------------
    */

    return {
        invitations: invitations.map((invitation) =>
            this.mapInvitation(invitation)
        ),
    };
}


}

export default new ProjectInvitationService();