import {IProjectMembersResponse,ProjectRole,IProjectMemberResponse } from "../../interfaces/projectMember.interface";
import Project from "../project/project.model";
import ApiError from "../../utils/ApiError";
import ProjectMember from "./projectMember.model";

export class ProjectMemberService{

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
         if (project.isArchived) {
            throw new ApiError(
                400,
                "Project is archived."
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
                    403,
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

    if (adminCount === 1) {
        throw new ApiError(
            400,
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

    const project = await Project.findById(projectId);

    
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

    const remover = await ProjectMember.findOne({
        project:projectId,
        user:userId
    })

    if (!remover) {
    throw new ApiError(
        403,
        "You are not a member of this project."
    );
}


if (remover.role !== ProjectRole.ADMIN) {
    throw new ApiError(
        403,
        "Only project admins can remove members."
    );
}



   

    const member = await ProjectMember.findOne({
        _id: memberId,
        project: projectId,
    });

    if (!member) {
        throw new ApiError(
            404,
            "Member not found."
        );
    }

    if (member.user.toString() === userId) {
    throw new ApiError(
        400,
        "Use the leave project endpoint to leave the project."
    );
}

  if (member.role === ProjectRole.ADMIN) {

    const adminCount =
        await ProjectMember.countDocuments({
            project: projectId,
            role: ProjectRole.ADMIN,
        });

    if (adminCount === 1) {
        throw new ApiError(
            400,
            "Project must have at least one admin."
        );
    }

}

    await member.deleteOne();
}

async leaveProject(
    projectId: string,
    userId: string
): Promise<void> {

    const project = await Project.findById(projectId);

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

    const membership =
        await ProjectMember.findOne({
            project: projectId,
            user: userId,
        });

    if (!membership) {
        throw new ApiError(
            404,
            "Membership not found."
        );
    }

    if (membership.user.toString() === userId) {
    throw new ApiError(
        400,
        "Use the leave project endpoint or another admin to change your role."
    );
}

    if (membership.role === ProjectRole.ADMIN) {

    const adminCount =
        await ProjectMember.countDocuments({
            project: projectId,
            role: ProjectRole.ADMIN,
        });

    if (adminCount === 1) {
        throw new ApiError(
            400,
            "Project must have at least one admin."
        );
    }

}



    await membership.deleteOne();
}

}

export default new ProjectMemberService();