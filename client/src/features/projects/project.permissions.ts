import type { WorkspaceSummary } from "@/features/workspaces/types/workspace.types";
import type {
  ProjectMember,
  ProjectRole,
} from "@/features/project-members/types/projectMember.types";
import type { Project } from "./types/project.types";

function isWritable(project: Project, workspace: WorkspaceSummary): boolean {
  return !project.isArchived && !workspace.isArchived;
}

export function deriveProjectRole(
  members: ProjectMember[] | undefined,
  userId: string | undefined,
): ProjectRole | undefined {
  if (!members || !userId) return undefined;
  return members.find((member) => member.user._id === userId)?.role;
}

export function canEditProject(
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
): boolean {
  return role === "admin" && isWritable(project, workspace);
}

export function canArchiveProject(
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
): boolean {
  return role === "admin" && isWritable(project, workspace);
}

export function canRestoreProject(
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
): boolean {
  return role === "admin" && project.isArchived && !workspace.isArchived;
}

export function getProjectAdminCount(members: ProjectMember[]): number {
  return members.filter((member) => member.role === "admin").length;
}

export function isLastProjectAdmin(
  members: ProjectMember[],
  userId: string | undefined,
): boolean {
  if (!userId) return false;
  const admins = members.filter((member) => member.role === "admin");
  return admins.length === 1 && admins[0]?.user._id === userId;
}

export function canLeaveProject(
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
  members: ProjectMember[],
  userId: string | undefined,
): boolean {
  if (!role || !isWritable(project, workspace)) return false;
  return !isLastProjectAdmin(members, userId);
}

export function canManageProjectMembers(
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
): boolean {
  return role === "admin" && isWritable(project, workspace);
}

export function canInviteProjectMember(
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
): boolean {
  return canManageProjectMembers(project, workspace, role);
}

export function canCreateWorkItem(
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
): boolean {
  return Boolean(role) && isWritable(project, workspace);
}

export function canUpdateWorkItemStatus(
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
): boolean {
  return Boolean(role) && isWritable(project, workspace);
}
