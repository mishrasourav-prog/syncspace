import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import {
  createTaskCommentRequest,
  deleteTaskCommentRequest,
  updateTaskCommentRequest,
} from "../api/taskComment.api";
import { taskCommentQueryKeys } from "../taskComment.queryKeys";
import type {
  CreateTaskCommentPayload,
  TaskComment,
  TaskCommentsPage,
} from "../types/taskComment.types";

const PAGE_LIMIT = 25;

function replaceCommentInPages(
  data: InfiniteData<TaskCommentsPage> | undefined,
  updated: TaskComment,
): InfiniteData<TaskCommentsPage> | undefined {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      comments: page.comments.map((comment) =>
        comment._id === updated._id ? updated : comment,
      ),
    })),
  };
}

export function useCreateTaskCommentMutation(
  projectId: string,
  taskId: string,
) {
  const queryClient = useQueryClient();
  const queryKey = taskCommentQueryKeys.list(projectId, taskId, PAGE_LIMIT);

  return useMutation<TaskComment, ApiErrorShape, CreateTaskCommentPayload>({
    mutationFn: (payload) => createTaskCommentRequest(taskId, payload),
    onSuccess: (createdComment) => {
      queryClient.setQueryData<InfiniteData<TaskCommentsPage>>(
        queryKey,
        (previous) => {
          if (!previous || previous.pages.length === 0) {
            return {
              pages: [
                {
                  comments: [createdComment],
                  nextCursor: null,
                  hasMore: false,
                },
              ],
              pageParams: [undefined],
            };
          }

          const lastPage = previous.pages.at(-1);
          if (!lastPage || lastPage.hasMore) {
            return previous;
          }

          const nextPages = [...previous.pages];
          nextPages[nextPages.length - 1] = {
            ...lastPage,
            comments: [...lastPage.comments, createdComment],
          };

          return {
            ...previous,
            pages: nextPages,
          };
        },
      );

      void queryClient.invalidateQueries({
        queryKey: taskCommentQueryKeys.task(projectId, taskId),
      });
    },
  });
}

export function useUpdateTaskCommentMutation(
  projectId: string,
  taskId: string,
) {
  const queryClient = useQueryClient();
  const queryKey = taskCommentQueryKeys.list(projectId, taskId, PAGE_LIMIT);

  return useMutation<
    TaskComment,
    ApiErrorShape,
    { commentId: string; body: string }
  >({
    mutationFn: ({ commentId, body }) =>
      updateTaskCommentRequest(commentId, { body }),
    onSuccess: (updatedComment) => {
      queryClient.setQueryData<InfiniteData<TaskCommentsPage>>(
        queryKey,
        (previous) => replaceCommentInPages(previous, updatedComment),
      );

      void queryClient.invalidateQueries({
        queryKey: taskCommentQueryKeys.task(projectId, taskId),
      });
    },
  });
}

export function useDeleteTaskCommentMutation(
  projectId: string,
  taskId: string,
) {
  const queryClient = useQueryClient();
  const queryKey = taskCommentQueryKeys.list(projectId, taskId, PAGE_LIMIT);

  return useMutation<TaskComment, ApiErrorShape, string>({
    mutationFn: (commentId) => deleteTaskCommentRequest(commentId),
    onSuccess: (deletedComment) => {
      queryClient.setQueryData<InfiniteData<TaskCommentsPage>>(
        queryKey,
        (previous) => replaceCommentInPages(previous, deletedComment),
      );

      void queryClient.invalidateQueries({
        queryKey: taskCommentQueryKeys.task(projectId, taskId),
      });
    },
  });
}
