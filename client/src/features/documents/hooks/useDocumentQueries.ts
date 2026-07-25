import {
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";

import type {
  ApiErrorShape,
} from "@/lib/axios";

import {
  getDocumentByIdRequest,
  getProjectDocumentsPageRequest,
  getProjectDocumentsRequest,
} from "../api/document.api";

import {
  documentQueryKeys,
} from "../document.queryKeys";

import type {
  ProjectDocument,
  ProjectDocumentListResult,
} from "../types/document.types";

function normalizeSearch(
  search: string
): string {
  return search.trim();
}

export function useProjectDocumentsQuery(
  projectId: string | undefined,
  search: string
) {
  const normalizedSearch =
    normalizeSearch(search);

  return useQuery<
    ProjectDocumentListResult,
    ApiErrorShape
  >({
    queryKey:
      documentQueryKeys.projectList(
        projectId ??
          "",
        normalizedSearch
      ),

    queryFn:
      () => {
        if (
          !projectId
        ) {
          throw new Error(
            "Project ID is required."
          );
        }

        return getProjectDocumentsRequest(
          projectId,
          normalizedSearch
        );
      },

    enabled:
      Boolean(
        projectId
      ),
  });
}

export const DOCUMENT_PAGE_LIMIT =
  20;

export function useProjectDocumentsInfiniteQuery(
  projectId: string | undefined,
  isArchived: boolean,
  search: string,
  enabled = true
) {
  const normalizedSearch =
    normalizeSearch(search);

  return useInfiniteQuery<
    ProjectDocumentListResult,
    ApiErrorShape
  >({
    queryKey:
      documentQueryKeys.infiniteList(
        projectId ??
          "",
        isArchived,
        normalizedSearch
      ),

    queryFn:
      ({
        pageParam,
      }) => {
        if (
          !projectId
        ) {
          throw new Error(
            "Project ID is required."
          );
        }

        return getProjectDocumentsPageRequest(
          projectId,
          {
            isArchived,
            search:
              normalizedSearch ||
              undefined,
            cursor:
              typeof pageParam ===
              "string"
                ? pageParam
                : undefined,
            limit:
              DOCUMENT_PAGE_LIMIT,
          }
        );
      },

    initialPageParam:
      undefined,

    getNextPageParam:
      (
        lastPage
      ) =>
        lastPage.nextCursor ??
        undefined,

    enabled:
      Boolean(
        projectId
      ) &&
      enabled,
  });
}

/**
 * Authoritative single-document detail query for the Document Editor
 * (spec sections 8.1, 36). `projectId` is required for the query key
 * because the detail key lives beneath the project prefix so the
 * existing project-access-revocation cleanup covers it automatically.
 */
export function useDocumentQuery(
  projectId: string | undefined,
  documentId: string | undefined,
  enabled = true
) {
  return useQuery<ProjectDocument, ApiErrorShape>({
    queryKey: documentQueryKeys.detail(projectId ?? "", documentId ?? ""),

    queryFn: () => {
      if (!documentId) {
        throw new Error("Document ID is required.");
      }

      return getDocumentByIdRequest(documentId);
    },

    enabled: Boolean(projectId) && Boolean(documentId) && enabled,
  });
}
