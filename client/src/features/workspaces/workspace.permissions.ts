import type { WorkspaceSummary } from "./types/workspace.types";

export function canEditWorkspace(workspace: WorkspaceSummary): boolean {
  if (workspace.isArchived) return false;
  return workspace.role === "owner" || workspace.role === "admin";
}

export function canArchiveWorkspace(workspace: WorkspaceSummary): boolean {
  if (workspace.isArchived) return false;
  return workspace.role === "owner";
}

export function canRestoreWorkspace(workspace: WorkspaceSummary): boolean {
  if (!workspace.isArchived) return false;
  return workspace.role === "owner";
}

export function canLeaveWorkspace(workspace: WorkspaceSummary): boolean {
  if (workspace.isArchived) return false;
  return workspace.role !== "owner";
}

export function getInvitableWorkspaceRoles(
  workspace: WorkspaceSummary,
): Array<"admin" | "member" | "guest"> {
  if (workspace.isArchived) return [];

  const { role, settings } = workspace;
  const roles: Array<"admin" | "member" | "guest"> = [];

  if (role === "owner" || role === "admin") {
    roles.push("admin", "member");
    if (settings.allowGuestInvites) roles.push("guest");
  } else if (role === "member") {
    if (!settings.allowMemberInvites) return [];
    roles.push("member");
    if (settings.allowGuestInvites) roles.push("guest");
  }

  return roles;
}

export function canInviteWorkspaceMember(workspace: WorkspaceSummary): boolean {
  return getInvitableWorkspaceRoles(workspace).length > 0;
}

export function canCreateProject(workspace: WorkspaceSummary): boolean {
  if (workspace.isArchived) return false;
  return workspace.role === "owner" || workspace.role === "admin";
}

export function canManageWorkspaceMembers(
  workspace: WorkspaceSummary,
): boolean {
  if (workspace.isArchived) return false;
  return workspace.role === "owner";
}
