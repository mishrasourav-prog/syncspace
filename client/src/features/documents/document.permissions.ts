import type { WorkspaceSummary } from "@/features/workspaces/types/workspace.types";
import type { ProjectRole } from "@/features/project-members/types/projectMember.types";
import type { Project } from "@/features/projects/types/project.types";
import type { ProjectDocument } from "./types/document.types";

function isProjectWritable(
  project: Project,
  workspace: WorkspaceSummary,
): boolean {
  return !project.isArchived && !workspace.isArchived;
}

export function canCreateDocument(
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
): boolean {
  return Boolean(role) && isProjectWritable(project, workspace);
}

export function canRenameDocument(
  document: ProjectDocument,
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
): boolean {
  return (
    Boolean(role) &&
    !document.isArchived &&
    isProjectWritable(project, workspace)
  );
}

export function canArchiveDocument(
  document: ProjectDocument,
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
  userId: string | undefined,
): boolean {
  const isCreatorOrAdmin =
    document.createdBy?._id === userId || role === "admin";
  return (
    isCreatorOrAdmin &&
    !document.isArchived &&
    isProjectWritable(project, workspace)
  );
}

export function canRestoreDocument(
  document: ProjectDocument,
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
  userId: string | undefined,
): boolean {
  const isCreatorOrAdmin =
    document.createdBy?._id === userId || role === "admin";
  return (
    isCreatorOrAdmin &&
    document.isArchived &&
    isProjectWritable(project, workspace)
  );
}

export function getDocumentsReadOnlyReason(
  project: Project,
  workspace: WorkspaceSummary,
): string | null {
  if (workspace.isArchived) {
    return "This workspace is archived. Documents are read-only.";
  }

  if (project.isArchived) {
    return "This project is archived. Documents are read-only.";
  }

  return null;
}

export function getDocumentEditorReadOnlyBanner(
  document: ProjectDocument,
  project: Project,
  workspace: WorkspaceSummary,
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

export function canEditDocumentContent(
  document: ProjectDocument,
  project: Project,
  workspace: WorkspaceSummary,
  role: ProjectRole | undefined,
): boolean {
  return canRenameDocument(document, project, workspace, role);
}
