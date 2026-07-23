import { axiosClient } from "@/lib/axios";
import type { ApiResponse } from "@/features/auth/types/api.types";
import type { TaskAssignee } from "../types/taskAssignee.types";

/**
 * Detailed assignee records (email, assignedBy, assignedAt) for the Task
 * Detail page. Do not call this per-card on the collection page — the task
 * DTO already embeds a lightweight assignee preview for that.
 */
export async function getTaskAssigneesRequest(taskId: string): Promise<TaskAssignee[]> {
  return axiosClient
    .get<ApiResponse<{ assignees: TaskAssignee[] }>>(`/tasks/${taskId}/assignees`)
    .then((res) => res.data.data.assignees);
}

export async function assignTaskMemberRequest(taskId: string, userId: string): Promise<TaskAssignee> {
  return axiosClient
    .post<ApiResponse<TaskAssignee>>(`/tasks/${taskId}/assignees`, { userId })
    .then((res) => res.data.data);
}

export async function removeTaskAssigneeRequest(taskId: string, userId: string): Promise<void> {
  await axiosClient.delete<ApiResponse<void>>(`/tasks/${taskId}/assignees/${userId}`);
}
