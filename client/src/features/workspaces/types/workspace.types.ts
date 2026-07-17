export type WorkspaceRole = "owner" | "admin" | "member" | "guest";

export interface WorkspaceSettings {
  allowGuestInvites: boolean;
  defaultRole: "member" | "guest";
  allowPublicProjects: boolean;
  allowMemberInvites: boolean;
}

export interface WorkspaceSummary {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  avatar?: string;
  owner: string;
  timezone: string;
  settings: WorkspaceSettings;
  isArchived: boolean;
  role: WorkspaceRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
  timezone?: string;
}

export interface UpdateWorkspacePayload {
  name?: string;
  description?: string;
  avatar?: string;
  timezone?: string;
}

/*
The create endpoint returns the raw workspace model without a membership
role, since role is implicit (the creator is always the owner).
*/
export interface CreatedWorkspace {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  avatar?: string;
  owner: string;
  timezone: string;
  settings: WorkspaceSettings;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}
