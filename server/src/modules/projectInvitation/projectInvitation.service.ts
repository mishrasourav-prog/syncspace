import mongoose from "mongoose";

import ApiError from "../../utils/ApiError";

import ProjectInvitation, {
    IProjectInvitationDocument,
    ProjectInvitationStatus,
} from "./projectInvitation.model";

import Project from "../project/project.model";

import ProjectMember from "../projectMember/projectMember.model";

import { ProjectRole } from "../../interfaces/projectMember.interface";

import {
    WorkspaceMember,
} from "../workspace-member/workspace-member.model";

import {
    Workspace,
} from "../workspace/workspace.model";

import {
    User,
} from "../auth/auth.model";

import {
    ICreateProjectInvitation,
    IProjectInvitationResponse,
    IProjectInvitationsResponse,
} from "../../interfaces/projectInvitation.interface";

export class ProjectInvitationService {
    /*
    |--------------------------------------------------------------------------
    | Mark Expired Invitation
    |--------------------------------------------------------------------------
    |
    | This intentionally runs outside an acceptance transaction.
    | Therefore, throwing afterward does not roll the EXPIRED update back.
    |
    */

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

        await ProjectInvitation.updateOne(
            {
                _id: invitationId,

                status:
                    ProjectInvitationStatus.PENDING,

                expiresAt: {
                    $lte: now,
                },
            },
            {
                $set: {
                    status:
                        ProjectInvitationStatus.EXPIRED,
                },
            }
        );

        throw new ApiError(
            410,
            "Invitation has expired."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Mapper
    |--------------------------------------------------------------------------
    */

    private mapInvitation(
        invitation: IProjectInvitationDocument
    ): IProjectInvitationResponse {
        return {
            _id:
                invitation._id.toString(),

            project:
                invitation.project.toString(),

            email:
                invitation.email,

            invitedBy:
                invitation.invitedBy.toString(),

            role:
                invitation.role,

            status:
                invitation.status,

            expiresAt:
                invitation.expiresAt,

            acceptedAt:
                invitation.acceptedAt ??
                null,

            rejectedAt:
                invitation.rejectedAt ??
                null,

            createdAt:
                invitation.createdAt,

            updatedAt:
                invitation.updatedAt,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Invite Member
    |--------------------------------------------------------------------------
    */

    async inviteMember(
        projectId: string,
        inviterId: string,
        data: ICreateProjectInvitation
    ): Promise<IProjectInvitationResponse> {
        const project =
            await Project.findById(
                projectId
            );

        if (!project) {
            throw new ApiError(
                404,
                "Project not found."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Project Admin
        |--------------------------------------------------------------------------
        */

        const inviterProjectMembership =
            await ProjectMember.findOne({
                project: projectId,
                user: inviterId,
            })
                .select("role")
                .lean();

        if (!inviterProjectMembership) {
            throw new ApiError(
                403,
                "You are not a member of this project."
            );
        }

        if (
            inviterProjectMembership.role !==
            ProjectRole.ADMIN
        ) {
            throw new ApiError(
                403,
                "Only project admins can invite members."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Workspace
        |--------------------------------------------------------------------------
        */

        const workspace =
            await Workspace.findById(
                project.workspace
            )
                .select(
                    "_id isArchived"
                )
                .lean();

        if (!workspace) {
            throw new ApiError(
                404,
                "Workspace not found."
            );
        }

        /*
        A project admin must also remain a current
        workspace member.
        */
        const inviterWorkspaceMembership =
            await WorkspaceMember.exists({
                workspace: workspace._id,
                user: inviterId,
            });

        if (!inviterWorkspaceMembership) {
            throw new ApiError(
                403,
                "You are no longer a member of this workspace."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Resources Are Writable
        |--------------------------------------------------------------------------
        */

        if (workspace.isArchived) {
            throw new ApiError(
                409,
                "Users cannot be invited while the workspace is archived."
            );
        }

        if (project.isArchived) {
            throw new ApiError(
                409,
                "Users cannot be invited to an archived project."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Normalize Email
        |--------------------------------------------------------------------------
        */

        const normalizedEmail =
            data.email
                .trim()
                .toLowerCase();

        /*
        |--------------------------------------------------------------------------
        | Verify Invited User
        |--------------------------------------------------------------------------
        |
        | Project membership requires existing workspace membership,
        | so the target user must already have an account.
        |
        */

        const invitedUser =
            await User.findOne({
                email: normalizedEmail,
            })
                .select("_id email")
                .lean();

        if (!invitedUser) {
            throw new ApiError(
                404,
                "No user was found with this email."
            );
        }

        if (
            invitedUser._id.toString() ===
            inviterId
        ) {
            throw new ApiError(
                409,
                "You cannot invite yourself."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Workspace Membership
        |--------------------------------------------------------------------------
        */

        const invitedUserWorkspaceMembership =
            await WorkspaceMember.exists({
                workspace:
                    workspace._id,

                user:
                    invitedUser._id,
            });

        if (
            !invitedUserWorkspaceMembership
        ) {
            throw new ApiError(
                409,
                "The user must join the workspace before being invited to this project."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Existing Project Membership
        |--------------------------------------------------------------------------
        */

        const existingProjectMember =
            await ProjectMember.exists({
                project: projectId,
                user: invitedUser._id,
            });

        if (existingProjectMember) {
            throw new ApiError(
                409,
                "User is already a member of this project."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Expire Old Pending Invitations
        |--------------------------------------------------------------------------
        |
        | The partial unique index permits only one PENDING invitation
        | for the same project/email. Therefore expired pending records
        | must first be updated to EXPIRED.
        |
        */

        const now = new Date();

        await ProjectInvitation.updateMany(
            {
                project: projectId,

                email: normalizedEmail,

                status:
                    ProjectInvitationStatus.PENDING,

                expiresAt: {
                    $lte: now,
                },
            },
            {
                $set: {
                    status:
                        ProjectInvitationStatus.EXPIRED,
                },
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Verify Active Pending Invitation
        |--------------------------------------------------------------------------
        */

        const existingInvitation =
            await ProjectInvitation.exists({
                project: projectId,

                email: normalizedEmail,

                status:
                    ProjectInvitationStatus.PENDING,

                expiresAt: {
                    $gt: now,
                },
            });

        if (existingInvitation) {
            throw new ApiError(
                409,
                "An active invitation already exists for this user."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Create Invitation
        |--------------------------------------------------------------------------
        */

        const invitation =
            await ProjectInvitation.create({
                project: projectId,

                email:
                    normalizedEmail,

                invitedBy:
                    inviterId,

                role:
                    data.role,

                status:
                    ProjectInvitationStatus.PENDING,

                expiresAt:
                    new Date(
                        now.getTime() +
                            7 *
                                24 *
                                60 *
                                60 *
                                1000
                    ),
            });

        return this.mapInvitation(
            invitation
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Accept Invitation
    |--------------------------------------------------------------------------
    */

    async acceptInvitation(
        invitationId: string,
        userId: string
    ): Promise<void> {
        const now = new Date();

        const user =
            await User.findById(
                userId
            )
                .select("_id email")
                .lean();

        if (!user) {
            throw new ApiError(
                404,
                "User not found."
            );
        }

        const invitation =
            await ProjectInvitation.findById(
                invitationId
            );

        if (!invitation) {
            throw new ApiError(
                404,
                "Invitation not found."
            );
        }

        const normalizedUserEmail =
            user.email
                .trim()
                .toLowerCase();

        /*
        Verify ownership before exposing status or modifying
        the invitation.
        */
        if (
            invitation.email !==
            normalizedUserEmail
        ) {
            throw new ApiError(
                403,
                "You cannot accept this invitation."
            );
        }

        if (
            invitation.status !==
            ProjectInvitationStatus.PENDING
        ) {
            throw new ApiError(
                409,
                "Invitation has already been processed."
            );
        }

        await this.markExpiredIfNeeded(
            invitation._id.toString(),
            invitation.expiresAt,
            now
        );

        const session =
            await mongoose.startSession();

        try {
            await session.withTransaction(
                async () => {
                    /*
                    Re-fetch inside the transaction so stale
                    invitation data is not used.
                    */
                    const activeInvitation =
                        await ProjectInvitation.findOne({
                            _id:
                                invitationId,

                            email:
                                normalizedUserEmail,

                            status:
                                ProjectInvitationStatus.PENDING,

                            expiresAt: {
                                $gt: now,
                            },
                        }).session(session);

                    if (!activeInvitation) {
                        throw new ApiError(
                            409,
                            "Invitation is no longer available."
                        );
                    }

                    const project =
                        await Project.findById(
                            activeInvitation.project
                        ).session(session);

                    if (!project) {
                        throw new ApiError(
                            404,
                            "Project not found."
                        );
                    }

                    const workspace =
                        await Workspace.findById(
                            project.workspace
                        )
                            .select(
                                "_id isArchived"
                            )
                            .session(
                                session
                            )
                            .lean();

                    if (!workspace) {
                        throw new ApiError(
                            404,
                            "Workspace not found."
                        );
                    }

                    if (
                        workspace.isArchived
                    ) {
                        throw new ApiError(
                            409,
                            "Cannot join a project while its workspace is archived."
                        );
                    }

                    if (
                        project.isArchived
                    ) {
                        throw new ApiError(
                            409,
                            "Cannot join an archived project."
                        );
                    }

                    /*
                    The invited user must still belong
                    to the parent workspace.
                    */
                    const workspaceMembership =
                        await WorkspaceMember.exists({
                            workspace:
                                project.workspace,

                            user:
                                user._id,
                        }).session(session);

                    if (
                        !workspaceMembership
                    ) {
                        throw new ApiError(
                            403,
                            "You must be a workspace member before joining this project."
                        );
                    }

                    const existingMember =
                        await ProjectMember.exists({
                            project:
                                activeInvitation.project,

                            user:
                                user._id,
                        }).session(session);

                    if (existingMember) {
                        throw new ApiError(
                            409,
                            "You are already a member of this project."
                        );
                    }

                    const member =
                        new ProjectMember({
                            project:
                                activeInvitation.project,

                            user:
                                user._id,

                            role:
                                activeInvitation.role,
                        });

                    await member.save({
                        session,
                    });

                    activeInvitation.status =
                        ProjectInvitationStatus.ACCEPTED;

                    activeInvitation.acceptedAt =
                        now;

                    await activeInvitation.save({
                        session,
                    });
                }
            );
        } finally {
            await session.endSession();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Reject Invitation
    |--------------------------------------------------------------------------
    */

    async rejectInvitation(
        invitationId: string,
        userId: string
    ): Promise<void> {
        const user =
            await User.findById(
                userId
            )
                .select("_id email")
                .lean();

        if (!user) {
            throw new ApiError(
                404,
                "User not found."
            );
        }

        const invitation =
            await ProjectInvitation.findById(
                invitationId
            );

        if (!invitation) {
            throw new ApiError(
                404,
                "Invitation not found."
            );
        }

        const normalizedUserEmail =
            user.email
                .trim()
                .toLowerCase();

        if (
            invitation.email !==
            normalizedUserEmail
        ) {
            throw new ApiError(
                403,
                "You cannot reject this invitation."
            );
        }

        if (
            invitation.status !==
            ProjectInvitationStatus.PENDING
        ) {
            throw new ApiError(
                409,
                "Invitation has already been processed."
            );
        }

        const now = new Date();

        await this.markExpiredIfNeeded(
            invitation._id.toString(),
            invitation.expiresAt,
            now
        );

        invitation.status =
            ProjectInvitationStatus.REJECTED;

        invitation.rejectedAt =
            now;

        await invitation.save();
    }

    /*
    |--------------------------------------------------------------------------
    | Cancel Invitation
    |--------------------------------------------------------------------------
    */

    async cancelInvitation(
        invitationId: string,
        userId: string
    ): Promise<void> {
        const invitation =
            await ProjectInvitation.findById(
                invitationId
            );

        if (!invitation) {
            throw new ApiError(
                404,
                "Invitation not found."
            );
        }

        const project =
            await Project.findById(
                invitation.project
            );

        if (!project) {
            throw new ApiError(
                404,
                "Project not found."
            );
        }

        /*
        Cancelling remains allowed for archived projects because
        it revokes a pending access path rather than granting access.
        */

        const projectMembership =
            await ProjectMember.findOne({
                project:
                    project._id,

                user:
                    userId,
            })
                .select("role")
                .lean();

        if (!projectMembership) {
            throw new ApiError(
                403,
                "You are not a member of this project."
            );
        }

        if (
            projectMembership.role !==
            ProjectRole.ADMIN
        ) {
            throw new ApiError(
                403,
                "Only project admins can cancel invitations."
            );
        }

        if (
            invitation.status !==
            ProjectInvitationStatus.PENDING
        ) {
            throw new ApiError(
                409,
                "Invitation has already been processed."
            );
        }

        const now = new Date();

        await this.markExpiredIfNeeded(
            invitation._id.toString(),
            invitation.expiresAt,
            now
        );

        invitation.status =
            ProjectInvitationStatus.CANCELLED;

        await invitation.save();
    }

    /*
    |--------------------------------------------------------------------------
    | Get Pending Invitations
    |--------------------------------------------------------------------------
    */

    async getPendingInvitations(
        projectId: string,
        userId: string
    ): Promise<IProjectInvitationsResponse> {
        const project =
            await Project.findById(
                projectId
            );

        if (!project) {
            throw new ApiError(
                404,
                "Project not found."
            );
        }

        const member =
            await ProjectMember.findOne({
                project: projectId,
                user: userId,
            })
                .select("role")
                .lean();

        if (!member) {
            throw new ApiError(
                403,
                "You are not a member of this project."
            );
        }

        if (
            member.role !==
            ProjectRole.ADMIN
        ) {
            throw new ApiError(
                403,
                "Only project admins can view invitations."
            );
        }

        /*
        Reading pending invitations remains allowed for an
        archived project.
        */

        const now = new Date();

        await ProjectInvitation.updateMany(
            {
                project:
                    projectId,

                status:
                    ProjectInvitationStatus.PENDING,

                expiresAt: {
                    $lte: now,
                },
            },
            {
                $set: {
                    status:
                        ProjectInvitationStatus.EXPIRED,
                },
            }
        );

        const invitations =
            await ProjectInvitation.find({
                project:
                    projectId,

                status:
                    ProjectInvitationStatus.PENDING,

                expiresAt: {
                    $gt: now,
                },
            }).sort({
                createdAt: -1,
                _id: -1,
            });

        return {
            invitations:
                invitations.map(
                    (invitation) =>
                        this.mapInvitation(
                            invitation
                        )
                ),
        };
    }
}

export default new ProjectInvitationService();