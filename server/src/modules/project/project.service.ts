import mongoose from "mongoose";

import Project, { IProjectDocument } from "./project.model";
import { Workspace } from "../workspace/workspace.model";
import { WorkspaceMember } from "../workspace-member/workspace-member.model";
import ProjectMember, { ProjectRole } from "../projectMember/projectMember.model";
import { WorkspaceRole } from "../workspace-member/workspace-member.model";
import { IUpdateProject } from "../../interfaces/project.interface";
import ApiError from "../../utils/ApiError";
import { ICreateProject , IProjectResponse , IWorkspaceProjectsResponse } from "../../interfaces/project.interface";

import slugify from "slugify";


export class ProjectService {
private async generateUniqueSlug(
    workspaceId: string,
    name: string
): Promise<string> {

    const baseSlug = slugify(name, {
        lower: true,
        strict: true,
        trim: true,
    });

    let slug = baseSlug;
    let counter = 1;

    while (
        await Project.exists({
            workspace: workspaceId,
            slug,
        })
    ) {
        slug = `${baseSlug}-${counter++}`;
    }

    return slug;
}

private mapProject(
    project: IProjectDocument
): IProjectResponse {

    return {
        _id: project._id.toString(),

        workspace: project.workspace.toString(),

        name: project.name,

        slug: project.slug,

        description: project.description,

        icon: project.icon,

        createdBy: project.createdBy.toString(),

        settings: {
            allowMemberInvites:
                project.settings.allowMemberInvites,

            allowTaskCreation:
                project.settings.allowTaskCreation,

            allowDocumentCreation:
                project.settings.allowDocumentCreation,

            allowFileUploads:
                project.settings.allowFileUploads,
        },

        isArchived: project.isArchived,

        createdAt: project.createdAt,

        updatedAt: project.updatedAt,
    };
}

async createProject(
    workspaceId: string,
    userId: string,
    data: ICreateProject
): Promise<IProjectResponse> {

    const session = await mongoose.startSession();

    try {

        session.startTransaction();

        /*
        |--------------------------------------------------------------------------
        | Verify Workspace
        |--------------------------------------------------------------------------
        */

        const workspace = await Workspace.findById(workspaceId).session(session);

        if (!workspace) {
            throw new ApiError(404, "Workspace not found.");
        }

        if (workspace.isArchived) {
            throw new ApiError(
                400,
                "Cannot create a project inside an archived workspace."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Permission
        |--------------------------------------------------------------------------
        */

        const workspaceMember = await WorkspaceMember.findOne({
            workspace: workspaceId,
            user: userId,
        }).session(session);

        if (!workspaceMember) {
            throw new ApiError(
                403,
                "You are not a member of this workspace."
            );
        }

        if (
            workspaceMember.role !== WorkspaceRole.OWNER &&
            workspaceMember.role !== WorkspaceRole.ADMIN
        ) {
            throw new ApiError(
                403,
                "You do not have permission to create projects."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Generate Slug
        |--------------------------------------------------------------------------
        */

        const slug = await this.generateUniqueSlug(
            workspaceId,
            data.name
        );

        /*
        |--------------------------------------------------------------------------
        | Create Project
        |--------------------------------------------------------------------------
        */

        const project = new Project({
            workspace: workspaceId,

            name: data.name,

            slug,

            description: data.description ?? "",

            icon: data.icon ?? "📁",

            createdBy: userId,
        });

        await project.save({ session });

        /*
        |--------------------------------------------------------------------------
        | Create First Project Member
        |--------------------------------------------------------------------------
        */

        const projectMember = new ProjectMember({
            project: project._id,

            user: userId,

            role: ProjectRole.ADMIN
        });

        await projectMember.save({ session });

        /*
        |--------------------------------------------------------------------------
        | Commit Transaction
        |--------------------------------------------------------------------------
        */

        await session.commitTransaction();

        return this.mapProject(project);

    } catch (error) {

        await session.abortTransaction();

        throw error;

    } finally {

        await session.endSession();

    }
}

async getWorkspaceProjects(
    workspaceId: string,
    userId: string
): Promise<IWorkspaceProjectsResponse> {

    /*
    |--------------------------------------------------------------------------
    | Verify Workspace
    |--------------------------------------------------------------------------
    */

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
        throw new ApiError(
            404,
            "Workspace not found."
        );
    }

    if (workspace.isArchived) {
        throw new ApiError(
            400,
            "Workspace is archived."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Membership
    |--------------------------------------------------------------------------
    */

    const workspaceMember =
        await WorkspaceMember.findOne({
            workspace: workspaceId,
            user: userId,
        });

    if (!workspaceMember) {
        throw new ApiError(
            403,
            "You are not a member of this workspace."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch Projects
    |--------------------------------------------------------------------------
    */

    const projects = await Project.find({
        workspace: workspaceId,
    }).sort({
        createdAt: -1,
    });

    /*
    |--------------------------------------------------------------------------
    | Return Response
    |--------------------------------------------------------------------------
    */

    return {
        projects: projects.map((project) =>
            this.mapProject(project)
        ),
    };
}


async getProject(
    projectId: string,
    userId: string
): Promise<IProjectResponse> {

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

    if (project.isArchived) {
        throw new ApiError(
            404,
            "Project not found."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Membership
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

    /*
    |--------------------------------------------------------------------------
    | Return Response
    |--------------------------------------------------------------------------
    */

    return this.mapProject(project);

}


async updateProject(
    projectId: string,
    userId: string,
    data: IUpdateProject
): Promise<IProjectResponse> {

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

    if (project.isArchived) {
        throw new ApiError(
            404,
            "Project not found."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Permission
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
            "Only project admins can update projects."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Update Name & Slug
    |--------------------------------------------------------------------------
    */

    if (
        data.name !== undefined &&
        data.name !== project.name
    ) {

        project.name = data.name;

        project.slug =
            await this.generateUniqueSlug(
                project.workspace.toString(),
                data.name
            );

    }

    /*
    |--------------------------------------------------------------------------
    | Update Description
    |--------------------------------------------------------------------------
    */

    if (data.description !== undefined) {
        project.description = data.description;
    }

    /*
    |--------------------------------------------------------------------------
    | Update Icon
    |--------------------------------------------------------------------------
    */

    if (data.icon !== undefined) {
        project.icon = data.icon;
    }

    /*
    |--------------------------------------------------------------------------
    | Save Changes
    |--------------------------------------------------------------------------
    */

    await project.save();

    /*
    |--------------------------------------------------------------------------
    | Return Response
    |--------------------------------------------------------------------------
    */

    return this.mapProject(project);

}

async archiveProject(
    projectId: string,
    userId: string
): Promise<void> {

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

    if (project.isArchived) {
        throw new ApiError(
            400,
            "Project is already archived."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Permission
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
            "Only project admins can archive projects."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Archive Project
    |--------------------------------------------------------------------------
    */

    project.isArchived = true;

    await project.save();

}

async restoreProject(
    projectId: string,
    userId: string
): Promise<void> {

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

    if (!project.isArchived) {
        throw new ApiError(
            400,
            "Project is not archived."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Permission
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
            "Only project admins can restore projects."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Restore Project
    |--------------------------------------------------------------------------
    */

    project.isArchived = false;

    await project.save();

}

}

export default new ProjectService();