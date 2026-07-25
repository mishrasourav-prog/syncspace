import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import {
  getDiscussionByIdRequest,
  getDiscussionRepliesRequest,
  getProjectDiscussionsPageRequest,
  getProjectDiscussionsRequest,
} from "../api/discussion.api";
import { discussionQueryKeys } from "../discussion.queryKeys";
import type { Discussion, DiscussionListResult, DiscussionReplyListResult } from "../types/discussion.types";

function normalizeSearch(search: string): string {
  return search.trim().slice(0, 100);
}

/** Single-page query used by the Project Overview preview panel. */
export function useProjectDiscussionsQuery(projectId: string | undefined, search: string) {
  const normalizedSearch = normalizeSearch(search);

  return useQuery<DiscussionListResult, ApiErrorShape>({
    queryKey: discussionQueryKeys.projectList(projectId ?? "", normalizedSearch),
    queryFn: () => {
      if (!projectId) {
        throw new Error("Project ID is required.");
      }

      return getProjectDiscussionsRequest(projectId, normalizedSearch);
    },
    enabled: Boolean(projectId),
  });
}

export const DISCUSSION_PAGE_LIMIT = 20;

/** Cursor-paginated infinite query backing the Discussions List page. */
export function useProjectDiscussionsInfiniteQuery(projectId: string | undefined, search: string, enabled = true) {
  const normalizedSearch = normalizeSearch(search);

  return useInfiniteQuery<DiscussionListResult, ApiErrorShape>({
    queryKey: discussionQueryKeys.infiniteList(projectId ?? "", normalizedSearch),
    queryFn: ({ pageParam }) => {
      if (!projectId) {
        throw new Error("Project ID is required.");
      }

      return getProjectDiscussionsPageRequest(projectId, {
        cursor: typeof pageParam === "string" ? pageParam : undefined,
        search: normalizedSearch || undefined,
        limit: DISCUSSION_PAGE_LIMIT,
      });
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(projectId) && enabled,
  });
}

/**
 * Authoritative single-discussion detail query. `projectId` is required for the
 * query key because the detail key lives beneath the project prefix so the
 * existing project-access-revocation cleanup covers it automatically.
 */
export function useDiscussionQuery(projectId: string | undefined, discussionId: string | undefined, enabled = true) {
  return useQuery<Discussion, ApiErrorShape>({
    queryKey: discussionQueryKeys.detail(projectId ?? "", discussionId ?? ""),
    queryFn: () => {
      if (!discussionId) {
        throw new Error("Discussion ID is required.");
      }

      return getDiscussionByIdRequest(discussionId);
    },
    enabled: Boolean(projectId) && Boolean(discussionId) && enabled,
  });
}

export const DISCUSSION_REPLY_PAGE_LIMIT = 30;

export function useDiscussionRepliesQuery(
  projectId: string | undefined,
  discussionId: string | undefined,
  enabled = true
) {
  return useInfiniteQuery<DiscussionReplyListResult, ApiErrorShape>({
    queryKey: discussionQueryKeys.repliesList(projectId ?? "", discussionId ?? "", DISCUSSION_REPLY_PAGE_LIMIT),
    queryFn: ({ pageParam }) => {
      if (!discussionId) {
        throw new Error("Discussion ID is required.");
      }

      return getDiscussionRepliesRequest(discussionId, {
        cursor: typeof pageParam === "string" ? pageParam : undefined,
        limit: DISCUSSION_REPLY_PAGE_LIMIT,
      });
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(projectId) && Boolean(discussionId) && enabled,
  });
}
