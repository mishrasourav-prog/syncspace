import type { WorkspaceRole } from "@/features/workspaces/types/workspace.types";

export interface WorkspaceMemberUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface WorkspaceMember {
  _id: string;
  user: WorkspaceMemberUser;
  role: WorkspaceRole;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

/** Roles a workspace member can be changed to. The owner role is never assignable. */
export type AssignableWorkspaceRole = "admin" | "member" | "guest";
