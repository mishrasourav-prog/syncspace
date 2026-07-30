import type { WorkspaceRole } from "@/features/workspaces/types/workspace.types";

import type { ProjectRole } from "@/features/project-members/types/projectMember.types";

export type { ProjectRole, WorkspaceRole };

export type AuthProvider =
  "email" | "google" | "facebook" | "twitter" | "github";

export interface UserProfileStats {
  workspaces: number;
  projects: number;
  tasksCompleted: number;
}

export interface SelfProfile {
  _id: string;

  name: string;

  username: string;

  email: string;

  avatar: string | null;

  headline: string | null;

  bio: string | null;

  location: string | null;

  provider: AuthProvider;

  createdAt: string;

  updatedAt: string;

  lastLoginAt: string | null;

  canChangePassword: boolean;

  stats: UserProfileStats;
}

export interface UpdateSelfProfilePayload {
  name?: string;

  username?: string;

  headline?: string | null;

  bio?: string | null;

  location?: string | null;
}

export interface ReplaceAvatarPayload {
  file: File;
}

export interface ChangePasswordPayload {
  currentPassword: string;

  newPassword: string;

  confirmPassword: string;
}

export interface OwnedWorkspaceDeletionBlocker {
  _id: string;

  name: string;
}

export interface LastAdminProjectWorkspace {
  _id: string;

  name: string;
}

export interface LastAdminProjectDeletionBlocker {
  _id: string;

  name: string;

  workspace: LastAdminProjectWorkspace;
}

export interface AccountDeletionBlockers {
  ownedWorkspaces: OwnedWorkspaceDeletionBlocker[];

  lastAdminProjects: LastAdminProjectDeletionBlocker[];
}

export interface AccountDeletionReadiness {
  canDelete: boolean;

  blockers: AccountDeletionBlockers;
}

export interface DeleteAccountPayload {
  confirmation: "DELETE";

  username: string;

  currentPassword?: string;
}

export interface MemberWorkspaceContext {
  _id: string;

  name: string;

  role: WorkspaceRole;

  joinedAt: string;
}

export interface MemberProjectContext {
  _id: string;

  name: string;

  role: ProjectRole;

  joinedAt: string;
}

export interface MemberProfileContext {
  workspace: MemberWorkspaceContext | null;

  project: MemberProjectContext | null;
}

export interface MemberProfile {
  _id: string;

  name: string;

  username: string;

  avatar: string | null;

  headline: string | null;

  bio: string | null;

  location: string | null;

  createdAt: string;

  context: MemberProfileContext;
}

export interface MemberProfileQuery {
  workspaceId?: string;

  projectId?: string;
}

export type {
  SessionRevocationReason,
  SessionRevokedPayload,
} from "@/features/auth/types/session.types";
