import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import { activityQueryKeys } from "@/features/activity/activity.queryKeys";
import {
  createDiscussionReplyRequest,
  deleteDiscussionReplyRequest,
  updateDiscussionReplyRequest,
} from "../api/discussion.api";
import { discussionQueryKeys } from "../discussion.queryKeys";
import { DISCUSSION_REPLY_PAGE_LIMIT } from "./useDiscussionQueries";
import type {
  CreateDiscussionReplyPayload,
  Discussion,
  DiscussionListResult,
  DiscussionReply,
  DiscussionReplyListResult,
} from "../types/discussion.types";

function patchReplyInPages(
  data: InfiniteData<DiscussionReplyListResult> | undefined,
  updated: DiscussionReply,
): InfiniteData<DiscussionReplyListResult> | undefined {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      replies: page.replies.map((reply) =>
        reply._id === updated._id ? updated : reply,
      ),
    })),
  };
}

function tombstoneReplyInPages(
  data: InfiniteData<DiscussionReplyListResult> | undefined,
  replyId: string,
): InfiniteData<DiscussionReplyListResult> | undefined {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      replies: page.replies.map((reply) =>
        reply._id === replyId
          ? { ...reply, isDeleted: true, body: null }
          : reply,
      ),
    })),
  };
}

function bumpDiscussionReplyCount(
  discussion: Discussion | undefined,
  delta: number,
): Discussion | undefined {
  if (!discussion) return discussion;

  return {
    ...discussion,
    replyCount: Math.max(0, discussion.replyCount + delta),
  };
}

function bumpInfiniteListReplyCount(
  data: InfiniteData<DiscussionListResult> | undefined,
  discussionId: string,
  delta: number,
): InfiniteData<DiscussionListResult> | undefined {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      discussions: page.discussions.map((discussion) =>
        discussion._id === discussionId
          ? (bumpDiscussionReplyCount(discussion, delta) ?? discussion)
          : discussion,
      ),
    })),
  };
}

function bumpPreviewReplyCount(
  data: DiscussionListResult | undefined,
  discussionId: string,
  delta: number,
): DiscussionListResult | undefined {
  if (!data) return data;

  return {
    ...data,
    discussions: data.discussions.map((discussion) =>
      discussion._id === discussionId
        ? (bumpDiscussionReplyCount(discussion, delta) ?? discussion)
        : discussion,
    ),
  };
}

function updateCachedReplyCount(
  queryClient: QueryClient,
  projectId: string,
  discussionId: string,
  delta: number,
): void {
  queryClient.setQueryData<Discussion>(
    discussionQueryKeys.detail(projectId, discussionId),
    (previous) => bumpDiscussionReplyCount(previous, delta),
  );

  queryClient.setQueriesData<InfiniteData<DiscussionListResult>>(
    { queryKey: discussionQueryKeys.infinite(projectId) },
    (previous) => bumpInfiniteListReplyCount(previous, discussionId, delta),
  );

  queryClient.setQueriesData<DiscussionListResult>(
    { queryKey: discussionQueryKeys.projectListAll(projectId) },
    (previous) => bumpPreviewReplyCount(previous, discussionId, delta),
  );
}

function invalidateReplyRelatedData(
  queryClient: QueryClient,
  projectId: string,
  discussionId: string,
): void {
  void queryClient.invalidateQueries({
    queryKey: discussionQueryKeys.replies(projectId, discussionId),
  });
  void queryClient.invalidateQueries({
    queryKey: discussionQueryKeys.detail(projectId, discussionId),
  });
  void queryClient.invalidateQueries({
    queryKey: discussionQueryKeys.infinite(projectId),
  });
  void queryClient.invalidateQueries({
    queryKey: discussionQueryKeys.projectListAll(projectId),
  });
  void queryClient.invalidateQueries({
    queryKey: activityQueryKeys.project(projectId),
  });
}

export function useCreateDiscussionReplyMutation(
  projectId: string,
  discussionId: string,
) {
  const queryClient = useQueryClient();
  const queryKey = discussionQueryKeys.repliesList(
    projectId,
    discussionId,
    DISCUSSION_REPLY_PAGE_LIMIT,
  );

  return useMutation<
    DiscussionReply,
    ApiErrorShape,
    CreateDiscussionReplyPayload
  >({
    mutationFn: (payload) =>
      createDiscussionReplyRequest(discussionId, payload),
    onSuccess: (createdReply) => {
      queryClient.setQueryData<InfiniteData<DiscussionReplyListResult>>(
        queryKey,
        (previous) => {
          if (!previous || previous.pages.length === 0) {
            return {
              pages: [{ replies: [createdReply], nextCursor: null }],
              pageParams: [undefined],
            };
          }

          const lastPage = previous.pages.at(-1);
          if (!lastPage || lastPage.nextCursor) {
            return previous;
          }

          const nextPages = [...previous.pages];
          nextPages[nextPages.length - 1] = {
            ...lastPage,
            replies: [...lastPage.replies, createdReply],
          };

          return { ...previous, pages: nextPages };
        },
      );

      updateCachedReplyCount(queryClient, projectId, discussionId, 1);
      invalidateReplyRelatedData(queryClient, projectId, discussionId);
    },
  });
}

export function useUpdateDiscussionReplyMutation(
  projectId: string,
  discussionId: string,
) {
  const queryClient = useQueryClient();
  const queryKey = discussionQueryKeys.repliesList(
    projectId,
    discussionId,
    DISCUSSION_REPLY_PAGE_LIMIT,
  );

  return useMutation<
    DiscussionReply,
    ApiErrorShape,
    { replyId: string; body: string }
  >({
    mutationFn: ({ replyId, body }) =>
      updateDiscussionReplyRequest(replyId, { body }),
    onSuccess: (updatedReply) => {
      queryClient.setQueryData<InfiniteData<DiscussionReplyListResult>>(
        queryKey,
        (previous) => patchReplyInPages(previous, updatedReply),
      );
      void queryClient.invalidateQueries({
        queryKey: activityQueryKeys.project(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: discussionQueryKeys.replies(projectId, discussionId),
      });
    },
  });
}

export function useDeleteDiscussionReplyMutation(
  projectId: string,
  discussionId: string,
) {
  const queryClient = useQueryClient();
  const queryKey = discussionQueryKeys.repliesList(
    projectId,
    discussionId,
    DISCUSSION_REPLY_PAGE_LIMIT,
  );

  return useMutation<void, ApiErrorShape, string>({
    mutationFn: (replyId) => deleteDiscussionReplyRequest(replyId),
    onSuccess: (_result, replyId) => {
      queryClient.setQueryData<InfiniteData<DiscussionReplyListResult>>(
        queryKey,
        (previous) => tombstoneReplyInPages(previous, replyId),
      );
      updateCachedReplyCount(queryClient, projectId, discussionId, -1);
      invalidateReplyRelatedData(queryClient, projectId, discussionId);
    },
  });
}
