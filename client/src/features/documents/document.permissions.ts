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

/**
 * The Document Editor's exact banner text (spec section 10). Priority
 * follows the widest-scope resource first — an archived workspace's
 * banner takes precedence over the project's, which takes precedence
 * over the document's own archived state.
 */
export function getDocumentEditorReadOnlyBanner(
  document: ProjectDocument,
  project: Project,
  workspace: WorkspaceSummary
): string | null {
  if (workspace.isArchived) {
    return "This workspace is archived. This document is read-only.";
  }

  if (project.isArchived) {
    return "This project is archived. This document is read-only.";
  }

  if (document.isArchived) {
    return "This document is archived and read-only.";
  }

  return null;
}

/**
 * Whether the editor's title/content should be editable at all — combines
 * membership, the archived-state banner above, and (separately, by the
 * caller) legacy-content and unresolved-conflict states (spec section 39).
 */
export function canEditDocumentContent(
  document: ProjectDocument,
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined
): boolean {
  return canRenameDocument(document, project, workspace, role);
}
