export interface IDocumentUserPreview {
    _id: string;

    name: string;

    username: string;

    avatar?: string;
}

export interface IProjectDocumentResponse {
    _id: string;

    workspace: string;

    project: string;

    title: string;

    content: unknown;

    createdBy:
        IDocumentUserPreview |
        null;

    updatedBy:
        IDocumentUserPreview |
        null;

    revision: number;

    isArchived: boolean;

    archivedAt:
        Date |
        null;

    createdAt: Date;

    updatedAt: Date;
}

export interface ICreateProjectDocumentInput {
    title: string;

    content?: unknown;
}

export interface IUpdateProjectDocumentInput {
    title?: string;

    content?: unknown;

    expectedRevision: number;
}

export interface IProjectDocumentListQuery {
    isArchived?: boolean;

    search?: string;

    cursor?: string;

    limit: number;
}

export interface IProjectDocumentListResponse {
    documents:
        IProjectDocumentResponse[];

    nextCursor:
        string |
        null;
}