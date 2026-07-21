import { axiosClient } from "@/lib/axios";
import type { ApiResponse } from "@/features/auth/types/api.types";
import type { CreateTaskPayload, Task, TaskStatus } from "../types/task.types";

export async function getProjectTasksRequest(projectId: string): Promise<Task[]> {
  return axiosClient
    .get<ApiResponse<{ tasks: Task[] }>>(`/projects/${projectId}/tasks`)
    .then((res) => res.data.data.tasks);
}

export async function createTaskRequest(projectId: string, payload: CreateTaskPayload): Promise<Task> {
  return axiosClient
    .post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, payload)
    .then((res) => res.data.data);
}

export async function updateTaskStatusRequest(taskId: string, status: TaskStatus): Promise<Task> {
  return axiosClient
    .patch<ApiResponse<Task>>(`/tasks/${taskId}/status`, { status })
    .then((res) => res.data.data);
}
