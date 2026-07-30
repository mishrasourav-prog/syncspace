import { axiosClient } from "@/lib/axios";
import type { ApiResponse } from "@/features/auth/types/api.types";
import type {
  CreateTaskPayload,
  ReorderTasksPayload,
  ReorderTasksResult,
  Task,
  TaskStatus,
  UpdateTaskPayload,
} from "../types/task.types";

export async function getProjectTasksRequest(
  projectId: string,
): Promise<Task[]> {
  return axiosClient
    .get<ApiResponse<{ tasks: Task[] }>>(`/projects/${projectId}/tasks`)
    .then((res) => res.data.data.tasks);
}

export async function getTaskRequest(taskId: string): Promise<Task> {
  return axiosClient
    .get<ApiResponse<Task>>(`/tasks/${taskId}`)
    .then((res) => res.data.data);
}

export async function createTaskRequest(
  projectId: string,
  payload: CreateTaskPayload,
): Promise<Task> {
  return axiosClient
    .post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, payload)
    .then((res) => res.data.data);
}

export async function updateTaskRequest(
  taskId: string,
  payload: UpdateTaskPayload,
): Promise<Task> {
  return axiosClient
    .patch<ApiResponse<Task>>(`/tasks/${taskId}`, payload)
    .then((res) => res.data.data);
}

export async function updateTaskStatusRequest(
  taskId: string,
  status: TaskStatus,
): Promise<Task> {
  return axiosClient
    .patch<ApiResponse<Task>>(`/tasks/${taskId}/status`, { status })
    .then((res) => res.data.data);
}

export async function archiveTaskRequest(taskId: string): Promise<void> {
  await axiosClient.patch<ApiResponse<void>>(`/tasks/${taskId}/archive`);
}

export async function restoreTaskRequest(taskId: string): Promise<void> {
  await axiosClient.patch<ApiResponse<void>>(`/tasks/${taskId}/restore`);
}

export async function reorderProjectTasksRequest(
  projectId: string,
  payload: ReorderTasksPayload,
): Promise<ReorderTasksResult> {
  return axiosClient
    .patch<ApiResponse<ReorderTasksResult>>(
      `/projects/${projectId}/tasks/reorder`,
      payload,
    )
    .then((res) => res.data.data);
}
