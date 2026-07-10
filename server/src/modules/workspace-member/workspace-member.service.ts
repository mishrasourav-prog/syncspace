import { WorkspaceMember } from "./workspace-member.model";
import ApiError from "../../utils/ApiError";
import { WorkspaceMembersResponse , WorkspaceMemberResponse } from "../../interfaces/WorkspaceMemberResponse.interface";
import { Workspace } from "../workspace/workspace.model";
import { WorkspaceRole } from "./workspace-member.model";



export class WorkspaceMembers{
    
async getWorkspaceMembers(
    workspaceId: string,
    userId: string
): Promise<WorkspaceMembersResponse> {

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace || workspace.isArchived) {
        throw new ApiError(
            404,
            "Workspace not found."
        );
    }

    const isOwner =
        workspace.owner.toString() === userId;

    const membership =
        await WorkspaceMember.findOne({
            workspace: workspaceId,
            user: userId,
        });

    if (!isOwner && !membership) {
        throw new ApiError(
            403,
            "You are not a member of this workspace."
        );
    }

    const members = await WorkspaceMember.find({
        workspace: workspaceId,
    })
        .populate(
            "user",
            "name username email avatar"
        )
        .sort({
            joinedAt: 1,
        });

    return {
        members: members.map((member) => ({
            _id: member._id.toString(),

            user: {
                _id: (member.user as any)._id.toString(),
                name: (member.user as any).name,
                username: (member.user as any).username,
                email: (member.user as any).email,
                avatar: (member.user as any).avatar,
            },

            role: member.role,

            joinedAt: member.joinedAt,

            createdAt: member.createdAt,

            updatedAt: member.updatedAt,
        })),
    };
}
async updateMemberRole(
    workspaceId: string,
    memberId: string,
    userId: string,
    role: WorkspaceRole
): Promise<WorkspaceMemberResponse> {

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace || workspace.isArchived) {
        throw new ApiError(
            404,
            "Workspace not found."
        );
    }

    if (workspace.owner.toString() !== userId) {
        throw new ApiError(
            403,
            "Only the workspace owner can update member roles."
        );
    }

    const member = await WorkspaceMember.findOne({
        _id: memberId,
        workspace: workspaceId,
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

    if (member.role === WorkspaceRole.OWNER) {
        throw new ApiError(
            400,
            "Owner role cannot be changed."
        );
    }

    if (member.role === role) {
    throw new ApiError(
        400,
        `User is already a ${role}.`
    );
}

    member.role = role;

    await member.save();

    return {
        _id: member._id.toString(),

        user: {
            _id: (member.user as any)._id.toString(),
            name: (member.user as any).name,
            username: (member.user as any).username,
            email: (member.user as any).email,
            avatar: (member.user as any).avatar,
        },

        role: member.role,

        joinedAt: member.joinedAt,

        createdAt: member.createdAt,

        updatedAt: member.updatedAt,
    };
}
async removeMember(
    workspaceId: string,
    memberId: string,
    userId: string
): Promise<void> {

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace || workspace.isArchived) {
        throw new ApiError(
            404,
            "Workspace not found."
        );
    }

    if (workspace.owner.toString() !== userId) {
        throw new ApiError(
            403,
            "Only the workspace owner can remove members."
        );
    }

    const member = await WorkspaceMember.findOne({
        _id: memberId,
        workspace: workspaceId,
    });

    if (!member) {
        throw new ApiError(
            404,
            "Member not found."
        );
    }

    if (member.role === WorkspaceRole.OWNER) {
        throw new ApiError(
            400,
            "Workspace owner cannot be removed."
        );
    }

    await member.deleteOne();
}

async leaveWorkspace(
    workspaceId: string,
    userId: string
): Promise<void> {

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace || workspace.isArchived) {
        throw new ApiError(
            404,
            "Workspace not found."
        );
    }

    if (workspace.owner.toString() === userId) {
        throw new ApiError(
            400,
            "Workspace owner cannot leave the workspace."
        );
    }

    const membership =
        await WorkspaceMember.findOne({
            workspace: workspaceId,
            user: userId,
        });

    if (!membership) {
        throw new ApiError(
            404,
            "Membership not found."
        );
    }

    await membership.deleteOne();
}
}

export default new WorkspaceMembers();