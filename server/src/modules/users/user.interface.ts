import type {
  AuthProvider,
} from "../../interfaces/user.interface";

import type {
  ProjectRole,
} from "../../interfaces/projectMember.interface";

import type {
  WorkspaceRole,
} from "../workspace-member/workspace-member.model";

/*
|--------------------------------------------------------------------------
| Self-Profile Statistics
|--------------------------------------------------------------------------
*/

export interface UserProfileStats {
  workspaces: number;
  projects: number;
  tasksCompleted: number;
}

/*
|--------------------------------------------------------------------------
| Authenticated User Profile
|--------------------------------------------------------------------------
|
| This is the authoritative private profile returned only to the currently
| authenticated user.
|
| Never add password, refreshToken, providerId, passwordChangedAt,
| sessionVersion, deletedAt, or other internal account fields here.
|
*/

export interface SelfProfile {
  _id: string;

  name: string;

  username: string;

  email: string;

  avatar:
    string |
    null;

  headline:
    string |
    null;

  bio:
    string |
    null;

  location:
    string |
    null;

  provider:
    AuthProvider;

  createdAt: string;

  updatedAt: string;

  lastLoginAt:
    string |
    null;

  canChangePassword:
    boolean;

  stats:
    UserProfileStats;
}

/*
|--------------------------------------------------------------------------
| Update Self Profile
|--------------------------------------------------------------------------
|
| Email, provider, password, and internal account fields are intentionally
| absent. Blank optional profile strings are normalized to null by validation.
|
*/

export interface UpdateSelfProfilePayload {
  name?: string;

  username?: string;

  avatar?:
    string |
    null;

  headline?:
    string |
    null;

  bio?:
    string |
    null;

  location?:
    string |
    null;
}

/*
|--------------------------------------------------------------------------
| Change Password
|--------------------------------------------------------------------------
*/

export interface ChangePasswordPayload {
  currentPassword: string;

  newPassword: string;

  confirmPassword: string;
}

/*
|--------------------------------------------------------------------------
| Account Deletion Readiness
|--------------------------------------------------------------------------
*/

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

  workspace:
    LastAdminProjectWorkspace;
}

export interface AccountDeletionBlockers {
  ownedWorkspaces:
    OwnedWorkspaceDeletionBlocker[];

  lastAdminProjects:
    LastAdminProjectDeletionBlocker[];
}

export interface AccountDeletionReadiness {
  canDelete: boolean;

  blockers:
    AccountDeletionBlockers;
}

/*
|--------------------------------------------------------------------------
| Delete Account
|--------------------------------------------------------------------------
*/

export interface DeleteAccountPayload {
  confirmation:
    "DELETE";

  username:
    string;

  /*
  Required for active local-password accounts.
  Provider-only accounts do not have a local password.
  */
  currentPassword?:
    string;
}

/*
|--------------------------------------------------------------------------
| Member Profile Context Query
|--------------------------------------------------------------------------
|
| At least one of workspaceId or projectId is required by validation.
|
*/

export interface MemberProfileContextQuery {
  workspaceId?:
    string;

  projectId?:
    string;
}

/*
|--------------------------------------------------------------------------
| Context-Authorized Read-Only Member Profile
|--------------------------------------------------------------------------
|
| This response intentionally excludes email, provider, providerId,
| lastLoginAt, updatedAt, statistics, ownership data, deletion state, and all
| password/session fields.
|
*/

export interface MemberWorkspaceContext {
  _id: string;

  name: string;

  role:
    WorkspaceRole;

  joinedAt:
    string;
}

export interface MemberProjectContext {
  _id: string;

  name: string;

  role:
    ProjectRole;

  joinedAt:
    string;
}

export interface MemberProfileContext {
  workspace:
    MemberWorkspaceContext |
    null;

  project:
    MemberProjectContext |
    null;
}

export interface MemberProfile {
  _id: string;

  name: string;

  username: string;

  avatar:
    string |
    null;

  headline:
    string |
    null;

  bio:
    string |
    null;

  location:
    string |
    null;

  createdAt:
    string;

  context:
    MemberProfileContext;
}