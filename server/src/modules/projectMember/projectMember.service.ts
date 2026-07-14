import {IProjectMembersResponse,ProjectRole,IProjectMemberResponse } from "../../interfaces/projectMember.interface";
import Project from "../project/project.model";
import ApiError from "../../utils/ApiError";
import ProjectMember from "./projectMember.model";
import { Workspace } from "../workspace/workspace.model";
import mongoose from "mongoose";

import type {
    ClientSession,
    Types,
} from "mongoose";



import Task from "../tasks/task.model";

import TaskAssignee from "../taskAssignee/taskAssignee.model";

export class ProjectMemberService{

    private async revokeProjectMemberAccess(
    projectId: Types.ObjectId,
    membershipId: Types.ObjectId,
    targetUserId: Types.ObjectId,
    session: ClientSession
): Promise<void> {
    /*
    |--------------------------------------------------------------------------
    | Find All Tasks in the Project
    |--------------------------------------------------------------------------
    */

    const tasks = await Task.find({
        project: projectId,
    })
        .select("_id")
        .session(session)
        .lean();

    const taskIds = tasks.map(
        (task) => task._id
    );

    /*
    |--------------------------------------------------------------------------
    | Remove User's Task Assignments
    |--------------------------------------------------------------------------
    */

    if (taskIds.length > 0) {
        await TaskAssignee.deleteMany({
            task: {
                $in: taskIds,
            },

            user: targetUserId,
        }).session(session);
    }

    /*
    |--------------------------------------------------------------------------
    | Remove Project Membership
    |--------------------------------------------------------------------------
    */

    const deleteResult =
        await ProjectMember.deleteOne({
            _id: membershipId,
            project: projectId,
            user: targetUserId,
        }).session(session);

    if (deleteResult.deletedCount !== 1) {
        throw new ApiError(
            409,
            "Project membership changed before it could be removed. Please try again."
        );
    }
}

    async getProjectMembers(
    projectId: string,
    userId: string
): Promise<IProjectMembersResponse>{

    const project = await Project.findById(projectId);

      if (!project) {
            throw new ApiError(
                404,
                "Project not found."
            );
        }
        

        const membership = await ProjectMember.findOne({
            project: projectId,
            user: userId,
        });

         if (!membership) {
                throw new ApiError(
                    403,
                    "You are not a member of this project."
                );
            }

        const members = await ProjectMember.find({
            project: projectId,
        })
         .populate(
    "user",
    "name username email avatar"
)
.sort({
    joinedAt: 1,
    _id:1
});

return {
    members:members.map((member)=>({
        _id:member._id.toString(),
        project:member.project.toString(),
         user: {
                _id: (member.user as any)._id.toString(),
                name: (member.user as any).name,
                username: (member.user as any).username,
                email: (member.user as any).email,
                avatar: (member.user as any).avatar,
        },
        role:member.role,
        joinedAt:member.joinedAt,
    }))
}}

async updateMemberRole(
     projectId: string,
     memberId:string,
     userId: string,
     role:ProjectRole
):Promise<IProjectMemberResponse>{
    const project = await Project.findById(projectId);

      if (!project) {
            throw new ApiError(
                404,
                "Project not found."
            );
        }
        
        const workspace = await Workspace.findById(
    project.workspace
)
    .select("_id isArchived")
    .lean();

if (!workspace) {
    throw new ApiError(
        404,
        "Workspace not found."
    );
}
if (workspace.isArchived) {
    throw new ApiError(
        409,
        "Member roles cannot be changed inside an archived workspace."
    );
}
 if (project.isArchived) {
            throw new ApiError(
                400,
                "Project is archived."
            );
        }

        const requester = await ProjectMember.findOne({
    project: projectId,
    user: userId,
});


if (!requester) {
    throw new ApiError(
        403,
        "You are not a member of this project"
    )
}

if (requester.role !== ProjectRole.ADMIN) {
    throw new ApiError(
        403,
        "Only project admins can update member roles."
    );
}

        const member = await ProjectMember.findOne({
    _id: memberId,
    project: projectId,
}).populate(
    "user",
    "name username email avatar"
);





         if (!member) {
                throw new ApiError(
                    404,
                    "Member not found."
                );
            }
            
            if (member.user._id.toString() === userId) {
    throw new ApiError(
        400,
        "You cannot change your own role."
    );
}

            if (member.role === role) {
                throw new ApiError(
                    400,
                    `User is already a ${role}.`
                );
            }

            if (
    member.role === ProjectRole.ADMIN &&
    role === ProjectRole.MEMBER
) {

    const adminCount =
        await ProjectMember.countDocuments({
            project: projectId,
            role: ProjectRole.ADMIN,
        });

    if (adminCount <= 1) {
        throw new ApiError(
            409,
            "Project must have at least one admin."
        );
    }

}

            member.role = role;
            await member.save();

            return {
                _id: member._id.toString(),
                project: member.project.toString(),
                user: {
                    _id: (member.user as any)._id.toString(),
                    name: (member.user as any).name,
                    username: (member.user as any).username,
                    email: (member.user as any).email,
                    avatar: (member.user as any).avatar,
                },
                role: member.role,
                joinedAt: member.joinedAt,
            };
}

async removeMember(
    projectId: string,
    memberId: string,
    userId: string
): Promise<void> {
    const session =
        await mongoose.startSession();

    try {
        await session.withTransaction(
            async () => {
                /*
                |--------------------------------------------------------------------------
                | Verify Project
                |--------------------------------------------------------------------------
                */

                const project =
                    await Project.findById(
                        projectId
                    ).session(session);

                if (!project) {
                    throw new ApiError(
                        404,
                        "Project not found."
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Verify Requester Membership
                |--------------------------------------------------------------------------
                */

                const requester =
                    await ProjectMember.findOne({
                        project: projectId,
                        user: userId,
                    }).session(session);

                if (!requester) {
                    throw new ApiError(
                        403,
                        "You are not a member of this project."
                    );
                }

                if (
                    requester.role !==
                    ProjectRole.ADMIN
                ) {
                    throw new ApiError(
                        403,
                        "Only project admins can remove members."
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Verify Parent Workspace
                |--------------------------------------------------------------------------
                */

                const workspace =
                    await Workspace.findById(
                        project.workspace
                    )
                        .select(
                            "_id isArchived"
                        )
                        .session(session)
                        .lean();

                if (!workspace) {
                    throw new ApiError(
                        404,
                        "Workspace not found."
                    );
                }

                if (workspace.isArchived) {
                    throw new ApiError(
                        409,
                        "Members cannot be removed while the workspace is archived."
                    );
                }

                if (project.isArchived) {
                    throw new ApiError(
                        409,
                        "Members cannot be removed from an archived project."
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Find Target Member
                |--------------------------------------------------------------------------
                */

                const member =
                    await ProjectMember.findOne({
                        _id: memberId,
                        project: projectId,
                    }).session(session);

                if (!member) {
                    throw new ApiError(
                        404,
                        "Member not found."
                    );
                }

                /*
                The requester must use the dedicated
                leave-project endpoint for themselves.
                */
                if (
                    member.user.toString() ===
                    userId
                ) {
                    throw new ApiError(
                        409,
                        "Use the leave-project endpoint to leave the project."
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Protect Last Admin
                |--------------------------------------------------------------------------
                */

                if (
                    member.role ===
                    ProjectRole.ADMIN
                ) {
                    const adminCount =
                        await ProjectMember.countDocuments(
                            {
                                project:
                                    projectId,

                                role:
                                    ProjectRole.ADMIN,
                            }
                        ).session(session);

                    if (adminCount <= 1) {
                        throw new ApiError(
                            409,
                            "Project must have at least one admin."
                        );
                    }
                }

                /*
                |--------------------------------------------------------------------------
                | Remove Membership and Assignments
                |--------------------------------------------------------------------------
                */

                await this.revokeProjectMemberAccess(
                    project._id,
                    member._id,
                    member.user,
                    session
                );
            }
        );
    } finally {
        await session.endSession();
    }
}

async leaveProject(
    projectId: string,
    userId: string
): Promise<void> {
    const session =
        await mongoose.startSession();

    try {
        await session.withTransaction(
            async () => {
                /*
                |--------------------------------------------------------------------------
                | Verify Project
                |--------------------------------------------------------------------------
                */

                const project =
                    await Project.findById(
                        projectId
                    ).session(session);

                if (!project) {
                    throw new ApiError(
                        404,
                        "Project not found."
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Find Current User's Membership
                |--------------------------------------------------------------------------
                */

                const membership =
                    await ProjectMember.findOne({
                        project: projectId,
                        user: userId,
                    }).session(session);

                if (!membership) {
                    throw new ApiError(
                        404,
                        "Project membership not found."
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Verify Parent Workspace
                |--------------------------------------------------------------------------
                */

                const workspace =
                    await Workspace.findById(
                        project.workspace
                    )
                        .select(
                            "_id isArchived"
                        )
                        .session(session)
                        .lean();

                if (!workspace) {
                    throw new ApiError(
                        404,
                        "Workspace not found."
                    );
                }

                if (workspace.isArchived) {
                    throw new ApiError(
                        409,
                        "You cannot leave a project while its workspace is archived."
                    );
                }

                if (project.isArchived) {
                    throw new ApiError(
                        409,
                        "You cannot leave an archived project."
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Protect Last Admin
                |--------------------------------------------------------------------------
                */

                if (
                    membership.role ===
                    ProjectRole.ADMIN
                ) {
                    const adminCount =
                        await ProjectMember.countDocuments(
                            {
                                project:
                                    projectId,

                                role:
                                    ProjectRole.ADMIN,
                            }
                        ).session(session);

                    if (adminCount <= 1) {
                        throw new ApiError(
                            409,
                            "You are the last project admin. Assign another admin before leaving."
                        );
                    }
                }

                /*
                |--------------------------------------------------------------------------
                | Remove Membership and Assignments
                |--------------------------------------------------------------------------
                */

                await this.revokeProjectMemberAccess(
                    project._id,
                    membership._id,
                    membership.user,
                    session
                );
            }
        );
    } finally {
        await session.endSession();
    }
}

}

export default new ProjectMemberService();