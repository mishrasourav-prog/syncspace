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

/**
 * Body accepted by `PATCH /documents/:documentId` (spec section 8.2/37).
 * `title`/`content` are both optional but at least one must be present;
 * the server enforces that with a refinement, mirrored client-side.
 */
export interface UpdateDocumentPayload {
  title?: string;
  content?: unknown | null;
  expectedRevision: number;
}

/** Client-owned editor draft, kept separate from the server snapshot (spec section 18). */
export interface DocumentDraft {
  title: string;
  content: unknown;
}

/** The 409 conflict error shape returned by the update endpoint, used to drive the conflict dialog. */
export const DOCUMENT_CONFLICT_MESSAGE =
  "This document was modified by another user. Refresh it before saving again.";
