export interface UserPreview {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface ProjectDocument {
  _id: string;
  workspace: string;
  project: string;
  title: string;
  content: unknown;
  createdBy: UserPreview | null;
  updatedBy: UserPreview | null;
  revision: number;
  isArchived: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDocumentListResult {
  documents: ProjectDocument[];
  nextCursor: string | null;
}

export interface GetProjectDocumentsParams {
  isArchived?: boolean;
  search?: string;
  cursor?: string;
  limit?: number;
}

export interface CreateDocumentPayload {
  title: string;
  content?: unknown;
}

export interface RenameDocumentPayload {
  title: string;
  expectedRevision: number;
}

export interface UpdateDocumentPayload {
  title?: string;
  content?: unknown | null;
  expectedRevision: number;
}

export interface DocumentDraft {
  title: string;
  content: unknown;
}

export const DOCUMENT_CONFLICT_MESSAGE =
  "This document was modified by another user. Refresh it before saving again.";
