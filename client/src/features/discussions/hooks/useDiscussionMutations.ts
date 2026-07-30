import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import { activityQueryKeys } from "@/features/activity/activity.queryKeys";
import {
  createDiscussionRequest,
  deleteDiscussionRequest,
  lockDiscussionRequest,
  pinDiscussionRequest,
  unlockDiscussionRequest,
  unpinDiscussionRequest,
  updateDiscussionRequest,
} from "../api/discussion.api";
import { discussionQueryKeys } from "../discussion.queryKeys";
import type {
  CreateDiscussionPayload,
  Discussion,
  DiscussionListResult,
  UpdateDiscussionPayload,
} from "../types/discussion.types";

function patchDiscussionInPages(
  data: InfiniteData<DiscussionListResult> | undefined,
  updated: Discussion,
): InfiniteData<DiscussionListResult> | undefined {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      discussions: page.discussions.map((discussion) =>
        discussion._id === updated._id ? updated : discussion,
      ),
    })),
  };
}

function patchDiscussionInPreview(
  data: DiscussionListResult | undefined,
  updated: Discussion,
): DiscussionListResult | undefined {
  if (!data) return data;

  return {
    ...data,
    discussions: data.discussions.map((discussion) =>
      discussion._id === updated._id ? updated : discussion,
    ),
  };
}

function removeDiscussionFromPages(
  data: InfiniteData<DiscussionListResult> | undefined,
  discussionId: string,
): InfiniteData<DiscussionListResult> | undefined {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      discussions: page.discussions.filter(
        (discussion) => discussion._id !== discussionId,
      ),
    })),
  };
}

function removeDiscussionFromPreview(
  data: DiscussionListResult | undefined,
  discussionId: string,
): DiscussionListResult | undefined {
  if (!data) return data;

  return {
    ...data,
    discussions: data.discussions.filter(
      (discussion) => discussion._id !== discussionId,
    ),
  };
}

function patchAllCachedLists(
  queryClient: QueryClient,
  projectId: string,
  updated: Discussion,
): void {
  queryClient.setQueriesData<InfiniteData<DiscussionListResult>>(
    { queryKey: discussionQueryKeys.infinite(projectId) },
    (previous) => patchDiscussionInPages(previous, updated),
  );

  queryClient.setQueriesData<DiscussionListResult>(
    { queryKey: discussionQueryKeys.projectListAll(projectId) },
    (previous) => patchDiscussionInPreview(previous, updated),
  );
}

function removeFromAllCachedLists(
  queryClient: QueryClient,
  projectId: string,
  discussionId: string,
): void {
  queryClient.setQueriesData<InfiniteData<DiscussionListResult>>(
    { queryKey: discussionQueryKeys.infinite(projectId) },
    (previous) => removeDiscussionFromPages(previous, discussionId),
  );

  queryClient.setQueriesData<DiscussionListResult>(
    { queryKey: discussionQueryKeys.projectListAll(projectId) },
    (previous) => removeDiscussionFromPreview(previous, discussionId),
  );
}

function invalidateDiscussionData(
  queryClient: QueryClient,
  projectId: string,
): void {
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

export function useCreateDiscussionMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<Discussion, ApiErrorShape, CreateDiscussionPayload>({
    mutationFn: (payload) => createDiscussionRequest(projectId, payload),
    onSuccess: (createdDiscussion) => {
      queryClient.setQueryData<Discussion>(
        discussionQueryKeys.detail(projectId, createdDiscussion._id),
        createdDiscussion,
      );
      invalidateDiscussionData(queryClient, projectId);
    },
  });
}

export function useUpdateDiscussionMutation(
  projectId: string,
  discussionId: string,
) {
  const queryClient = useQueryClient();

  return useMutation<Discussion, ApiErrorShape, UpdateDiscussionPayload>({
    mutationFn: (payload) => updateDiscussionRequest(discussionId, payload),
    onSuccess: (updatedDiscussion) => {
      queryClient.setQueryData<Discussion>(
        discussionQueryKeys.detail(projectId, discussionId),
        updatedDiscussion,
      );
      patchAllCachedLists(queryClient, projectId, updatedDiscussion);
      invalidateDiscussionData(queryClient, projectId);
    },
  });
}

export function useDeleteDiscussionMutation(
  projectId: string,
  discussionId: string,
) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorShape, void>({
    mutationFn: () => deleteDiscussionRequest(discussionId),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: discussionQueryKeys.detail(projectId, discussionId),
      });
      queryClient.removeQueries({
        queryKey: discussionQueryKeys.replies(projectId, discussionId),
      });
      removeFromAllCachedLists(queryClient, projectId, discussionId);
      invalidateDiscussionData(queryClient, projectId);
    },
  });
}

type ModerationAction = "pin" | "unpin" | "lock" | "unlock";

const MODERATION_REQUESTS: Record<
  ModerationAction,
  (discussionId: string) => Promise<Discussion>
> = {
  pin: pinDiscussionRequest,
  unpin: unpinDiscussionRequest,
  lock: lockDiscussionRequest,
  unlock: unlockDiscussionRequest,
};

function useDiscussionModerationMutation(
  projectId: string,
  discussionId: string,
  action: ModerationAction,
) {
  const queryClient = useQueryClient();

  return useMutation<Discussion, ApiErrorShape, void>({
    mutationFn: () => MODERATION_REQUESTS[action](discussionId),
    onSuccess: (updatedDiscussion) => {
      queryClient.setQueryData<Discussion>(
        discussionQueryKeys.detail(projectId, discussionId),
        updatedDiscussion,
      );
      patchAllCachedLists(queryClient, projectId, updatedDiscussion);
      invalidateDiscussionData(queryClient, projectId);
    },
  });
}

export function usePinDiscussionMutation(
  projectId: string,
  discussionId: string,
) {
  return useDiscussionModerationMutation(projectId, discussionId, "pin");
}

export function useUnpinDiscussionMutation(
  projectId: string,
  discussionId: string,
) {
  return useDiscussionModerationMutation(projectId, discussionId, "unpin");
}

export function useLockDiscussionMutation(
  projectId: string,
  discussionId: string,
) {
  return useDiscussionModerationMutation(projectId, discussionId, "lock");
}

export function useUnlockDiscussionMutation(
  projectId: string,
  discussionId: string,
) {
  return useDiscussionModerationMutation(projectId, discussionId, "unlock");
}
