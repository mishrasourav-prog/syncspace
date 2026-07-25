import type { WorkspaceSummary } from "@/features/workspaces/types/workspace.types";
import type { Project } from "@/features/projects/types/project.types";
import type { ProjectRole } from "@/features/project-members/types/projectMember.types";
import type { Discussion, DiscussionReply } from "./types/discussion.types";

/** The parent workspace and project must both be active for any discussion mutation. */
function isWritable(project: Project, workspace: WorkspaceSummary): boolean {
  return !project.isArchived && !workspace.isArchived;
}

/** Any active project member may start a discussion. */
export function canCreateDiscussion(
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined
): boolean {
  return Boolean(role) && isWritable(project, workspace);
}

/** Matches the server: only the discussion's own author, and only while unlocked. */
export function canEditDiscussion(
  discussion: Discussion,
  project: Project,
  workspace: WorkspaceSummary,
  currentUserId: string | undefined
): boolean {
  if (discussion.isLocked || !isWritable(project, workspace)) return false;
  return Boolean(currentUserId) && discussion.author?._id === currentUserId;
}

/** Matches the server: author or project admin. Locking does not block delete. */
export function canDeleteDiscussion(
  discussion: Discussion,
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
  currentUserId: string | undefined
): boolean {
  if (!role || !isWritable(project, workspace)) return false;
  return role === "admin" || (Boolean(currentUserId) && discussion.author?._id === currentUserId);
}

/** Pin/unpin/lock/unlock are project-admin-only moderation actions. */
export function canModerateDiscussion(
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined
): boolean {
  return role === "admin" && isWritable(project, workspace);
}

export function canCreateReply(
  discussion: Discussion,
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined
): boolean {
  return Boolean(role) && !discussion.isLocked && isWritable(project, workspace);
}

/** Matches the server: only the reply's own author, and only while the parent discussion is unlocked. */
export function canEditReply(
  reply: DiscussionReply,
  discussion: Discussion,
  project: Project,
  workspace: WorkspaceSummary,
  currentUserId: string | undefined
): boolean {
  if (reply.isDeleted || discussion.isLocked || !isWritable(project, workspace)) return false;
  return Boolean(currentUserId) && reply.author?._id === currentUserId;
}

/** Matches the server: author or project admin. Locking does not block delete. */
export function canDeleteReply(
  reply: DiscussionReply,
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
  currentUserId: string | undefined
): boolean {
  if (reply.isDeleted || !isWritable(project, workspace)) return false;
  return role === "admin" || (Boolean(currentUserId) && reply.author?._id === currentUserId);
}
