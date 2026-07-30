import type { WorkspaceSummary } from "@/features/workspaces/types/workspace.types";
import type { Project } from "@/features/projects/types/project.types";
import type { ProjectRole } from "@/features/project-members/types/projectMember.types";
import type { Discussion, DiscussionReply } from "./types/discussion.types";

function isWritable(project: Project, workspace: WorkspaceSummary): boolean {
  return !project.isArchived && !workspace.isArchived;
}

export function canCreateDiscussion(
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
): boolean {
  return Boolean(role) && isWritable(project, workspace);
}

export function canEditDiscussion(
  discussion: Discussion,
  project: Project,
  workspace: WorkspaceSummary,
  currentUserId: string | undefined,
): boolean {
  if (discussion.isLocked || !isWritable(project, workspace)) return false;
  return Boolean(currentUserId) && discussion.author?._id === currentUserId;
}

export function canDeleteDiscussion(
  discussion: Discussion,
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
  currentUserId: string | undefined,
): boolean {
  if (!role || !isWritable(project, workspace)) return false;
  return (
    role === "admin" ||
    (Boolean(currentUserId) && discussion.author?._id === currentUserId)
  );
}

export function canModerateDiscussion(
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
): boolean {
  return role === "admin" && isWritable(project, workspace);
}

export function canCreateReply(
  discussion: Discussion,
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
): boolean {
  return (
    Boolean(role) && !discussion.isLocked && isWritable(project, workspace)
  );
}

export function canEditReply(
  reply: DiscussionReply,
  discussion: Discussion,
  project: Project,
  workspace: WorkspaceSummary,
  currentUserId: string | undefined,
): boolean {
  if (reply.isDeleted || discussion.isLocked || !isWritable(project, workspace))
    return false;
  return Boolean(currentUserId) && reply.author?._id === currentUserId;
}

export function canDeleteReply(
  reply: DiscussionReply,
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
  currentUserId: string | undefined,
): boolean {
  if (reply.isDeleted || !isWritable(project, workspace)) return false;
  return (
    role === "admin" ||
    (Boolean(currentUserId) && reply.author?._id === currentUserId)
  );
}
