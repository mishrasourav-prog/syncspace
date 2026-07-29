import { WorkspaceRole } from "../modules/workspace-member/workspace-member.model";

export interface IWorkspace {
  _id: string;

  name: string;

  slug: string;

  description?: string;

  avatar?: string;

  owner: string;

  timezone: string;

   settings: {
    allowGuestInvites: boolean;
    defaultRole: "member" | "guest";
    allowPublicProjects: boolean;
    allowMemberInvites:boolean;
  };

  isArchived: boolean;

  createdAt: Date;

  updatedAt: Date;
}

export interface CreateWorkspace {
  name: string;
  description?: string;
  timezone?: string;
}

export interface UpdateWorkspace {
  name?: string;
  description?: string;
  timezone?: string;
}

export interface WorkspaceResponse {
  workspace: IWorkspace;
}

export interface WorkspaceUserResponse {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    avatar?: string;
    timezone: string;
    owner: string;
    role: WorkspaceRole;
}


export interface GetWorkspaceResponse {
    _id: string;

    name: string;

    slug: string;

    description?: string;

    avatar?: string;

    owner: string;

    timezone: string;

    role: WorkspaceRole;

    settings: {
        allowGuestInvites: boolean;
        allowMemberInvites: boolean;
        allowPublicProjects: boolean;
        defaultRole: "guest" | "member";
    };

    isArchived: boolean;

    createdAt: Date;

    updatedAt: Date;
}
export interface UseGetWorkspaceResponse {
    workspace: GetWorkspaceResponse;
}

export interface GetArchiveWorkspaceResponse{
    workspaces:IWorkspace[];
}