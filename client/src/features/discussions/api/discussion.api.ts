import { axiosClient } from "@/lib/axios";
import type { ApiResponse } from "@/features/auth/types/api.types";
import type {
  CreateDiscussionPayload,
  CreateDiscussionReplyPayload,
  Discussion,
  DiscussionListResult,
  DiscussionReply,
  DiscussionReplyListResult,
  UpdateDiscussionPayload,
  UpdateDiscussionReplyPayload,
} from "../types/discussion.types";

/** Single-page fetch used by the Project Overview preview panel. */
export async function getProjectDiscussionsRequest(projectId: string, search: string): Promise<DiscussionListResult> {
  return axiosClient
    .get<ApiResponse<DiscussionListResult>>(`/projects/${projectId}/discussions`, {
      params: {
        limit: 50,
        ...(search ? { search } : {}),
      },
    })
    .then((res) => res.data.data);
}

export interface GetProjectDiscussionsPageParams {
  search?: string;
  cursor?: string;
  limit?: number;
}

/** Cursor-paginated fetch backing the Discussions List page. */
export async function getProjectDiscussionsPageRequest(
  projectId: string,
  params: GetProjectDiscussionsPageParams = {}
): Promise<DiscussionListResult> {
  return axiosClient
    .get<ApiResponse<DiscussionListResult>>(`/projects/${projectId}/discussions`, {
      params: {
        limit: params.limit ?? 20,
        ...(params.search ? { search: params.search } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
      },
    })
    .then((res) => res.data.data);
}

export async function createDiscussionRequest(
  projectId: string,
  payload: CreateDiscussionPayload
): Promise<Discussion> {
  return axiosClient
    .post<ApiResponse<Discussion>>(`/projects/${projectId}/discussions`, payload)
    .then((res) => res.data.data);
}

export async function getDiscussionByIdRequest(discussionId: string): Promise<Discussion> {
  return axiosClient.get<ApiResponse<Discussion>>(`/discussions/${discussionId}`).then((res) => res.data.data);
}

export async function updateDiscussionRequest(
  discussionId: string,
  payload: UpdateDiscussionPayload
): Promise<Discussion> {
  return axiosClient
    .patch<ApiResponse<Discussion>>(`/discussions/${discussionId}`, payload)
    .then((res) => res.data.data);
}

export async function deleteDiscussionRequest(discussionId: string): Promise<void> {
  await axiosClient.delete<ApiResponse>(`/discussions/${discussionId}`);
}

export async function pinDiscussionRequest(discussionId: string): Promise<Discussion> {
  return axiosClient.patch<ApiResponse<Discussion>>(`/discussions/${discussionId}/pin`).then((res) => res.data.data);
}

export async function unpinDiscussionRequest(discussionId: string): Promise<Discussion> {
  return axiosClient
    .patch<ApiResponse<Discussion>>(`/discussions/${discussionId}/unpin`)
    .then((res) => res.data.data);
}

export async function lockDiscussionRequest(discussionId: string): Promise<Discussion> {
  return axiosClient.patch<ApiResponse<Discussion>>(`/discussions/${discussionId}/lock`).then((res) => res.data.data);
}

export async function unlockDiscussionRequest(discussionId: string): Promise<Discussion> {
  return axiosClient
    .patch<ApiResponse<Discussion>>(`/discussions/${discussionId}/unlock`)
    .then((res) => res.data.data);
}

export interface GetDiscussionRepliesParams {
  cursor?: string;
  limit?: number;
}

export async function getDiscussionRepliesRequest(
  discussionId: string,
  params: GetDiscussionRepliesParams = {}
): Promise<DiscussionReplyListResult> {
  return axiosClient
    .get<ApiResponse<DiscussionReplyListResult>>(`/discussions/${discussionId}/replies`, {
      params: { cursor: params.cursor, limit: params.limit ?? 30 },
    })
    .then((res) => res.data.data);
}

export async function createDiscussionReplyRequest(
  discussionId: string,
  payload: CreateDiscussionReplyPayload
): Promise<DiscussionReply> {
  return axiosClient
    .post<ApiResponse<DiscussionReply>>(`/discussions/${discussionId}/replies`, payload)
    .then((res) => res.data.data);
}

export async function updateDiscussionReplyRequest(
  replyId: string,
  payload: UpdateDiscussionReplyPayload
): Promise<DiscussionReply> {
  return axiosClient
    .patch<ApiResponse<DiscussionReply>>(`/discussion-replies/${replyId}`, payload)
    .then((res) => res.data.data);
}

export async function deleteDiscussionReplyRequest(replyId: string): Promise<void> {
  await axiosClient.delete<ApiResponse>(`/discussion-replies/${replyId}`);
}
