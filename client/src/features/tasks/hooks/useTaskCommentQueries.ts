import { useInfiniteQuery } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import { getTaskCommentsRequest } from "../api/taskComment.api";
import { taskCommentQueryKeys } from "../taskComment.queryKeys";
import type { TaskCommentsPage } from "../types/taskComment.types";

const PAGE_LIMIT = 25;

export function useTaskCommentsQuery(
  projectId: string | undefined,
  taskId: string | undefined
) {
  return useInfiniteQuery<TaskCommentsPage, ApiErrorShape>({
    queryKey: taskCommentQueryKeys.list(projectId ?? "", taskId ?? "", PAGE_LIMIT),
    queryFn: ({ pageParam }) => {
      if (!taskId) {
        return Promise.resolve({ comments: [], nextCursor: null, hasMore: false });
      }

      return getTaskCommentsRequest(taskId, {
        cursor: pageParam as string | undefined,
        limit: PAGE_LIMIT,
      });
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(projectId) && Boolean(taskId),
  });
}
