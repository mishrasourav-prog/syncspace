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
