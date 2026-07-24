import {
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";

import type {
  ApiErrorShape,
} from "@/lib/axios";

import {
  getProjectDocumentsPageRequest,
  getProjectDocumentsRequest,
} from "../api/document.api";

import {
  documentQueryKeys,
} from "../document.queryKeys";

import type {
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
