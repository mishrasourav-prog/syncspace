import {
  axiosClient,
} from "@/lib/axios";

import type {
  ApiResponse,
} from "@/features/auth/types/api.types";

import type {
  CreateDocumentPayload,
  GetProjectDocumentsParams,
  ProjectDocument,
  ProjectDocumentListResult,
  RenameDocumentPayload,
  UpdateDocumentPayload,
} from "../types/document.types";

function normalizeSearch(
  search: string | undefined
): string | undefined {
  const normalized =
    search?.trim();

  return normalized
    ? normalized
    : undefined;
}

export async function getProjectDocumentsRequest(
  projectId: string,
  search: string
): Promise<ProjectDocumentListResult> {
  const normalizedSearch =
    normalizeSearch(search);

  return axiosClient
    .get<ApiResponse<ProjectDocumentListResult>>(
      `/projects/${projectId}/documents`,
      {
        params: {
          isArchived: false,
          limit: 50,
          ...(normalizedSearch
            ? {
                search:
                  normalizedSearch,
              }
            : {}),
        },
      }
    )
    .then(
      (
        response
      ) =>
        response.data.data
    );
}

export async function getProjectDocumentsPageRequest(
  projectId: string,
  params: GetProjectDocumentsParams
): Promise<ProjectDocumentListResult> {
  const normalizedSearch =
    normalizeSearch(
      params.search
    );

  return axiosClient
    .get<ApiResponse<ProjectDocumentListResult>>(
      `/projects/${projectId}/documents`,
      {
        params: {
          isArchived:
            params.isArchived ??
            false,
          limit:
            params.limit ??
            20,
          ...(normalizedSearch
            ? {
                search:
                  normalizedSearch,
              }
            : {}),
          ...(params.cursor
            ? {
                cursor:
                  params.cursor,
              }
            : {}),
        },
      }
    )
    .then(
      (
        response
      ) =>
        response.data.data
    );
}

export async function createDocumentRequest(
  projectId: string,
  payload: CreateDocumentPayload
): Promise<ProjectDocument> {
  return axiosClient
    .post<ApiResponse<ProjectDocument>>(
      `/projects/${projectId}/documents`,
      payload
    )
    .then(
      (
        response
      ) =>
        response.data.data
    );
}

/** Authoritative single-document detail request used by the Document Editor (spec section 8.1). */
export async function getDocumentByIdRequest(
  documentId: string
): Promise<ProjectDocument> {
  return axiosClient
    .get<ApiResponse<ProjectDocument>>(`/documents/${documentId}`)
    .then((response) => response.data.data);
}

/** Shared `PATCH /documents/:documentId` request (spec section 8.2/37). */
export async function updateDocumentRequest(
  documentId: string,
  payload: UpdateDocumentPayload
): Promise<ProjectDocument> {
  return axiosClient
    .patch<ApiResponse<ProjectDocument>>(`/documents/${documentId}`, payload)
    .then((response) => response.data.data);
}

/** Thin wrapper kept for the existing Documents List rename dialog; delegates to the shared update request. */
export async function renameDocumentRequest(
  documentId: string,
  payload: RenameDocumentPayload
): Promise<ProjectDocument> {
  return updateDocumentRequest(documentId, payload);
}

export async function archiveDocumentRequest(
  documentId: string
): Promise<ProjectDocument> {
  return axiosClient
    .patch<ApiResponse<ProjectDocument>>(
      `/documents/${documentId}/archive`
    )
    .then(
      (
        response
      ) =>
        response.data.data
    );
}

export async function restoreDocumentRequest(
  documentId: string
): Promise<ProjectDocument> {
  return axiosClient
    .patch<ApiResponse<ProjectDocument>>(
      `/documents/${documentId}/restore`
    )
    .then(
      (
        response
      ) =>
        response.data.data
    );
}
