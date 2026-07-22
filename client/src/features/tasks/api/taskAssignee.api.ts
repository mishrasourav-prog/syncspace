import { axiosClient } from "@/lib/axios";
import type { ApiResponse } from "@/features/auth/types/api.types";
import type { TaskAssignee } from "../types/taskAssignee.types";

export async function assignTaskMemberRequest(taskId: string, userId: string): Promise<TaskAssignee> {
  return axiosClient
    .post<ApiResponse<TaskAssignee>>(`/tasks/${taskId}/assignees`, { userId })
    .then((res) => res.data.data);
}

export async function removeTaskAssigneeRequest(taskId: string, userId: string): Promise<void> {
  await axiosClient.delete<ApiResponse<void>>(`/tasks/${taskId}/assignees/${userId}`);
}
