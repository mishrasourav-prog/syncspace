import type { WorkspaceSummary } from "@/features/workspaces/types/workspace.types";
import type { ProjectRole } from "@/features/project-members/types/projectMember.types";
import type { Project } from "@/features/projects/types/project.types";
import type { ProjectDocument } from "./types/document.types";

/**
 * The document service enforces project membership and project archived
 * state, but not the parent workspace's archived state (spec section 8).
 * The client fills that gap so an archived workspace's documents are
 * read-only even though the server would otherwise allow the mutation.
 */
function isProjectWritable(project: Project, workspace: WorkspaceSummary): boolean {
  return !project.isArchived && !workspace.isArchived;
}

/** Any project member may create a document while the project/workspace are active. */
export function canCreateDocument(
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined
): boolean {
  return Boolean(role) && isProjectWritable(project, workspace);
}

/** Any project member may rename an active document while the project/workspace are active. */
export function canRenameDocument(
  document: ProjectDocument,
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined
): boolean {
  return Boolean(role) && !document.isArchived && isProjectWritable(project, workspace);
}

export function canArchiveDocument(
  document: ProjectDocument,
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
  userId: string | undefined
): boolean {
  const isCreatorOrAdmin = document.createdBy?._id === userId || role === "admin";
  return isCreatorOrAdmin && !document.isArchived && isProjectWritable(project, workspace);
}

export function canRestoreDocument(
  document: ProjectDocument,
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
  userId: string | undefined
): boolean {
  const isCreatorOrAdmin = document.createdBy?._id === userId || role === "admin";
  return isCreatorOrAdmin && document.isArchived && isProjectWritable(project, workspace);
}

/** Message shown in place of disabled write controls, per spec section 8. */
export function getDocumentsReadOnlyReason(project: Project, workspace: WorkspaceSummary): string | null {
  if (workspace.isArchived) {
    return "This workspace is archived. Documents are read-only.";
  }

  if (project.isArchived) {
    return "This project is archived. Documents are read-only.";
  }

  return null;
}
