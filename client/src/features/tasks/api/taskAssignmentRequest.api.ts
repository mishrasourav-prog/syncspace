import type { ApiResponse } from "@/features/auth/types/api.types";
import { axiosClient } from "@/lib/axios";
import type { TaskAssignmentRequest } from "../types/taskAssignmentRequest.types";

export async function getTaskAssignmentRequestsRequest(
  taskId: string
): Promise<TaskAssignmentRequest[]> {
  return axiosClient
    .get<ApiResponse<{ requests: TaskAssignmentRequest[] }>>(
      `/tasks/${taskId}/assignment-requests`
    )
    .then((response) => response.data.data.requests);
}

export async function createTaskAssignmentRequestRequest(
  taskId: string
): Promise<TaskAssignmentRequest> {
  return axiosClient
    .post<ApiResponse<TaskAssignmentRequest>>(
      `/tasks/${taskId}/assignment-requests`
    )
    .then((response) => response.data.data);
}

export async function acceptTaskAssignmentRequestRequest(
  taskId: string,
  requestId: string
): Promise<TaskAssignmentRequest> {
  return axiosClient
    .post<ApiResponse<TaskAssignmentRequest>>(
      `/tasks/${taskId}/assignment-requests/${requestId}/accept`
    )
    .then((response) => response.data.data);
}
