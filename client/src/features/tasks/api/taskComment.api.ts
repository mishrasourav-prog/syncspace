import { axiosClient } from "@/lib/axios";
import type { ApiResponse } from "@/features/auth/types/api.types";
import type {
  CreateTaskCommentPayload,
  TaskComment,
  TaskCommentsPage,
  UpdateTaskCommentPayload,
} from "../types/taskComment.types";

export interface GetTaskCommentsParams {
  cursor?: string;
  limit?: number;
}

export async function getTaskCommentsRequest(
  taskId: string,
  params: GetTaskCommentsParams = {}
): Promise<TaskCommentsPage> {
  return axiosClient
    .get<ApiResponse<TaskCommentsPage>>(`/tasks/${taskId}/comments`, {
      params: { cursor: params.cursor, limit: params.limit ?? 25 },
    })
    .then((res) => res.data.data);
}

export async function createTaskCommentRequest(
  taskId: string,
  payload: CreateTaskCommentPayload
): Promise<TaskComment> {
  return axiosClient
    .post<ApiResponse<TaskComment>>(`/tasks/${taskId}/comments`, payload)
    .then((res) => res.data.data);
}

export async function updateTaskCommentRequest(
  commentId: string,
  payload: UpdateTaskCommentPayload
): Promise<TaskComment> {
  return axiosClient
    .patch<ApiResponse<TaskComment>>(`/comments/${commentId}`, payload)
    .then((res) => res.data.data);
}

export async function deleteTaskCommentRequest(commentId: string): Promise<TaskComment> {
  return axiosClient.delete<ApiResponse<TaskComment>>(`/comments/${commentId}`).then((res) => res.data.data);
}
