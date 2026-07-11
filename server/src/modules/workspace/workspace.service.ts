import slugify from "slugify";
import mongoose from "mongoose";
import ApiError from "../../utils/ApiError";

import {
    CreateWorkspace,
    UseGetWorkspaceResponse,
    IWorkspace,
    WorkspaceUserResponse,
    UpdateWorkspace
} from "../../interfaces/workspace.interface";

import {
    Workspace,
    IWorkspaceDocument,
} from "./workspace.model";

import {
    WorkspaceMember,
    WorkspaceRole,
} from "../workspace-member/workspace-member.model";



export class WorkspaceService{

    private async generateUniqueSlug(name: string): Promise<string> {

    const baseSlug = slugify(name, {
        lower: true,
        strict: true,
        trim: true,
    });

    let slug = baseSlug;

    let counter = 1;

    while (await Workspace.exists({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}

private mapWorkspace(workspace:IWorkspaceDocument) : IWorkspace{
    return{
       _id: workspace._id.toString(),

        name: workspace.name,

        slug: workspace.slug,

        description: workspace.description,

        avatar: workspace.avatar,

        owner: workspace.owner.toString(),

        timezone: workspace.timezone,

        settings: workspace.settings,

        isArchived: workspace.isArchived,

        createdAt: workspace.createdAt,

        updatedAt: workspace.updatedAt,
    }

}


async createWorkspace(
    ownerId: string,
    data: CreateWorkspace
): Promise<IWorkspace> {

    const session = await mongoose.startSession();

    
    try {
        session.startTransaction();
        const slug = await this.generateUniqueSlug(data.name);

    

    // const workspace: IWorkspaceDocument =
    //     await Workspace.create({

    //         name: data.name,

    //         slug,

    //         description: data.description,

    //         timezone:
    //             data.timezone ?? "Asia/Kolkata",

    //         owner: ownerId,
    //     });
        
    //create workspace.........................
        const workspace : IWorkspaceDocument = new Workspace({
            name:data.name,
            slug,
            description:data.description,
            timezone:data.timezone??"Asia/Kolkata",
            owner: ownerId,
        });

    await workspace.save({ session });


    // await WorkspaceMember.create({

    //     workspace: workspace._id,

    //     user: ownerId,

    //     role: WorkspaceRole.OWNER,

    //     joinedAt: new Date(),
    // });

    //create owner membership.................
    const ownerMembership = new WorkspaceMember({
    workspace: workspace._id,
    user: ownerId,
    role: WorkspaceRole.OWNER,
});
await ownerMembership.save({ session });

//commit transaction.............................
await session.commitTransaction();
return this.mapWorkspace(workspace);

        
    } catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally{
        await session.endSession();
    }
}


async getUserWorkspaces(userId:string) : Promise<WorkspaceUserResponse[]>{
    const memberships = await WorkspaceMember
        .find({
            user: userId,
        })
        .populate<{ workspace: IWorkspaceDocument }>({
            path: "workspace",
        })
        .sort({
            createdAt: -1,
        });

    return memberships
    .filter((member) => member.workspace)
    .map((member) => {
      const workspace = member.workspace as IWorkspaceDocument;

      return {
        _id: workspace._id.toString(),
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        avatar: workspace.avatar,
        owner: workspace.owner.toString(),
        timezone: workspace.timezone,
        settings: workspace.settings,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
        isArchived: workspace.isArchived,
        role: member.role,
      };
    });

}

async getWorkspace(
    workspaceId: string,
    userId: string
): Promise<UseGetWorkspaceResponse> {

    const member = await WorkspaceMember.findOne({
        workspace: workspaceId,
        user: userId,
    })
    .populate("workspace");

    if (!member) {
        throw new ApiError(
            404,
            "Workspace not found."
        );
    }

    const workspace = member.workspace as IWorkspaceDocument;

    if (workspace.isArchived) {
        throw new ApiError(
            404,
            "Workspace not found."
        );
    }

    return {
        workspace: {
            _id: workspace._id.toString(),
            name: workspace.name,
            slug: workspace.slug,
            description: workspace.description,
            avatar: workspace.avatar,
            owner: workspace.owner.toString(),
            timezone: workspace.timezone,
            settings: workspace.settings,
            role: member.role,
            createdAt: workspace.createdAt,
        },
    };
}

async updateWorkspace(
    workspaceId: string,
    userId: string,
    data: UpdateWorkspace
): Promise<UseGetWorkspaceResponse> {

    const member = await WorkspaceMember.findOne({
        workspace: workspaceId,
        user: userId,
    }).populate("workspace");

    if (!member) {
        throw new ApiError(
            404,
            "Workspace not found."
        );
    }

    if (
        member.role !== "owner" &&
        member.role !== "admin"
    ) {
        throw new ApiError(
            403,
            "You don't have permission to update this workspace."
        );
    }

    const workspace =
        member.workspace as IWorkspaceDocument;

    if (workspace.isArchived) {
        throw new ApiError(
            404,
            "Workspace not found."
        );
    }

    if (data.name !== undefined) {
        workspace.name = data.name;
    }

    if (data.description !== undefined) {
        workspace.description = data.description;
    }

    if (data.avatar !== undefined) {
        workspace.avatar = data.avatar;
    }

    if (data.timezone !== undefined) {
        workspace.timezone = data.timezone;
    }

    await workspace.save();

    return {
        workspace: {
            _id: workspace._id.toString(),
            name: workspace.name,
            slug: workspace.slug,
            description: workspace.description,
            avatar: workspace.avatar,
            owner: workspace.owner.toString(),
            timezone: workspace.timezone,
            settings: workspace.settings,
            role: member.role,
            createdAt: workspace.createdAt,
        },
    };
}

async archiveWorkspace(
    workspaceId: string,
    userId: string
): Promise<void> {

    const workspace = await Workspace.findById(workspaceId);

if (!workspace) {
    throw new ApiError(404, "Workspace not found.");
}

if (workspace.isArchived) {
    throw new ApiError(
        409,
        "Workspace is already archived."
    );
}

if (workspace.owner.toString() !== userId) {
    throw new ApiError(
        403,
        "Only the workspace owner can archive the workspace."
    );
}

workspace.isArchived = true;
await workspace.save();

}

async restoreWorkspace(
    workspaceId: string,
    userId: string
): Promise<void> {

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
        throw new ApiError(
            404,
            "Workspace not found."
        );
    }

    if (workspace.owner.toString() !== userId) {
        throw new ApiError(
            403,
            "Only the workspace owner can restore the workspace."
        );
    }

    if (!workspace.isArchived) {
        throw new ApiError(
            409,
            "Workspace is already active."
        );
    }

    workspace.isArchived = false;

    await workspace.save();
}
// async getArchivedWorkspaces(
//     userId: string
// ): Promise<GetArchiveWorkspaceResponse> {

//     const memberships = await WorkspaceMember
//         .find({
//             user: userId,
//         })
//         .populate({
//             path: "workspace",
//             match: {
//                 isArchived: true,
//             },
//         });

//     const workspaces = memberships
//         .filter(member => member.workspace)
//         .map(member => {
//             const workspace =
//                 member.workspace as IWorkspaceDocument;

//             return {
//                 _id: workspace._id.toString(),
//                 name: workspace.name,
//                 slug: workspace.slug,
//                 description: workspace.description,
//                 avatar: workspace.avatar,
//                 owner: workspace.owner.toString(),
//                 timezone: workspace.timezone,
//                 settings: workspace.settings,
//                 isArchived: workspace.isArchived,
//                 createdAt: workspace.createdAt,
//                 updatedAt: workspace.updatedAt,
//                 role: member.role,
//             };
//         });

//     return {
//         workspaces,
//     };
// }
}

export default new WorkspaceService();