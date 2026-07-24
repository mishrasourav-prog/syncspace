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
}

export interface RenameDocumentPayload {
  title: string;
  expectedRevision: number;
}
