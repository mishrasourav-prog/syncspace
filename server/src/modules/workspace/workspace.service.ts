import mongoose from "mongoose";
import slugify from "slugify";

import type {
  CreateWorkspace,
  GetWorkspaceResponse,
  IWorkspace,
  UpdateWorkspace,
  UseGetWorkspaceResponse,
  WorkspaceUserResponse,
} from "../../interfaces/workspace.interface";

import ApiError from "../../utils/ApiError";

import {
  WorkspaceMember,
  WorkspaceRole,
} from "../workspace-member/workspace-member.model";

import { Workspace, type IWorkspaceDocument } from "./workspace.model";

interface EditableWorkspaceAccess {
  workspace: IWorkspaceDocument;
  role: WorkspaceRole;
}

interface WorkspaceAvatarMutationResult {
  workspace: GetWorkspaceResponse;
  previousAvatarPublicId: string | null;
}

export class WorkspaceService {
  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug =
      slugify(name, {
        lower: true,
        strict: true,
        trim: true,
      }) || "workspace";

    let slug = baseSlug;

    let counter = 1;

    while (
      await Workspace.exists({
        slug,
      })
    ) {
      slug = `${baseSlug}-${counter}`;

      counter += 1;
    }

    return slug;
  }

  private mapWorkspace(workspace: IWorkspaceDocument): IWorkspace {
    return {
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
    };
  }

  private mapWorkspaceWithRole(
    workspace: IWorkspaceDocument,
    role: WorkspaceRole,
  ): GetWorkspaceResponse {
    return {
      _id: workspace._id.toString(),
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description,
      avatar: workspace.avatar,
      owner: workspace.owner.toString(),
      timezone: workspace.timezone,
      settings: workspace.settings,
      role,
      isArchived: workspace.isArchived,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }

  private async getEditableWorkspace(
    workspaceId: string,
    userId: string,
    includeAvatarPublicId = false,
  ): Promise<EditableWorkspaceAccess> {
    const member = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: userId,
    });

    if (!member) {
      throw new ApiError(404, "Workspace not found.");
    }

    if (
      member.role !== WorkspaceRole.OWNER &&
      member.role !== WorkspaceRole.ADMIN
    ) {
      throw new ApiError(
        403,
        "You don't have permission to update this workspace.",
      );
    }

    const workspaceQuery = Workspace.findById(workspaceId);

    if (includeAvatarPublicId) {
      workspaceQuery.select("+avatarPublicId");
    }

    const workspace = await workspaceQuery;

    if (!workspace) {
      throw new ApiError(404, "Workspace not found.");
    }

    if (workspace.isArchived) {
      throw new ApiError(409, "Archived workspaces cannot be updated.");
    }

    return {
      workspace,
      role: member.role,
    };
  }

  async createWorkspace(
    ownerId: string,
    data: CreateWorkspace,
  ): Promise<IWorkspace> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const slug = await this.generateUniqueSlug(data.name);

      const workspace = new Workspace({
        name: data.name,
        slug,
        description: data.description,
        timezone: data.timezone ?? "Asia/Kolkata",
        owner: ownerId,
      });

      await workspace.save({
        session,
      });

      const ownerMembership = new WorkspaceMember({
        workspace: workspace._id,
        user: ownerId,
        role: WorkspaceRole.OWNER,
      });

      await ownerMembership.save({
        session,
      });

      await session.commitTransaction();

      return this.mapWorkspace(workspace);
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      await session.endSession();
    }
  }

  async getUserWorkspaces(userId: string): Promise<WorkspaceUserResponse[]> {
    const memberships = await WorkspaceMember.find({
      user: userId,
    })
      .populate<{
        workspace: IWorkspaceDocument;
      }>({
        path: "workspace",
      })
      .sort({
        createdAt: -1,
      });

    return memberships
      .filter((member) => Boolean(member.workspace))
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
    userId: string,
  ): Promise<UseGetWorkspaceResponse> {
    const member = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: userId,
    });

    if (!member) {
      throw new ApiError(404, "Workspace not found.");
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      throw new ApiError(404, "Workspace not found.");
    }

    return {
      workspace: this.mapWorkspaceWithRole(workspace, member.role),
    };
  }

  async updateWorkspace(
    workspaceId: string,
    userId: string,
    data: UpdateWorkspace,
  ): Promise<UseGetWorkspaceResponse> {
    const { workspace, role } = await this.getEditableWorkspace(
      workspaceId,
      userId,
    );

    if (data.name !== undefined) {
      workspace.name = data.name;
    }

    if (data.description !== undefined) {
      workspace.description = data.description;
    }

    if (data.timezone !== undefined) {
      workspace.timezone = data.timezone;
    }

    await workspace.save();

    return {
      workspace: this.mapWorkspaceWithRole(workspace, role),
    };
  }

  async assertCanManageAvatar(
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    await this.getEditableWorkspace(workspaceId, userId);
  }

  async replaceWorkspaceAvatar(
    workspaceId: string,
    userId: string,
    avatarUrl: string,
    avatarPublicId: string,
  ): Promise<WorkspaceAvatarMutationResult> {
    const { workspace, role } = await this.getEditableWorkspace(
      workspaceId,
      userId,
      true,
    );

    const previousAvatarPublicId = workspace.avatarPublicId ?? null;

    workspace.avatar = avatarUrl;

    workspace.avatarPublicId = avatarPublicId;

    await workspace.save();

    return {
      workspace: this.mapWorkspaceWithRole(workspace, role),
      previousAvatarPublicId,
    };
  }

  async removeWorkspaceAvatar(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceAvatarMutationResult> {
    const { workspace, role } = await this.getEditableWorkspace(
      workspaceId,
      userId,
      true,
    );

    const previousAvatarPublicId = workspace.avatarPublicId ?? null;

    workspace.avatar = "";

    workspace.avatarPublicId = null;

    await workspace.save();

    return {
      workspace: this.mapWorkspaceWithRole(workspace, role),
      previousAvatarPublicId,
    };
  }

  async archiveWorkspace(workspaceId: string, userId: string): Promise<void> {
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      throw new ApiError(404, "Workspace not found.");
    }

    if (workspace.isArchived) {
      throw new ApiError(409, "Workspace is already archived.");
    }

    if (workspace.owner.toString() !== userId) {
      throw new ApiError(
        403,
        "Only the workspace owner can archive the workspace.",
      );
    }

    workspace.isArchived = true;

    await workspace.save();
  }

  async restoreWorkspace(workspaceId: string, userId: string): Promise<void> {
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      throw new ApiError(404, "Workspace not found.");
    }

    if (workspace.owner.toString() !== userId) {
      throw new ApiError(
        403,
        "Only the workspace owner can restore the workspace.",
      );
    }

    if (!workspace.isArchived) {
      throw new ApiError(409, "Workspace is already active.");
    }

    workspace.isArchived = false;

    await workspace.save();
  }
}

export default new WorkspaceService();
