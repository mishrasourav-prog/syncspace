import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import {
  acceptTaskAssignmentRequestRequest,
  createTaskAssignmentRequestRequest,
} from "../api/taskAssignmentRequest.api";
import { taskQueryKeys } from "../task.queryKeys";
import type { TaskAssignmentRequest } from "../types/taskAssignmentRequest.types";

function refreshTaskAssignmentState(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
  taskId: string,
) {
  void queryClient.invalidateQueries({
    queryKey: taskQueryKeys.assignmentRequests(projectId, taskId),
  });
  void queryClient.invalidateQueries({
    queryKey: taskQueryKeys.assignees(projectId, taskId),
  });
  void queryClient.invalidateQueries({
    queryKey: taskQueryKeys.detail(projectId, taskId),
  });
  void queryClient.invalidateQueries({
    queryKey: taskQueryKeys.projectList(projectId),
  });
}

export function useCreateTaskAssignmentRequestMutation(
  projectId: string,
  taskId: string,
) {
  const queryClient = useQueryClient();

  return useMutation<TaskAssignmentRequest, ApiErrorShape>({
    mutationFn: () => createTaskAssignmentRequestRequest(taskId),
    onSuccess: () => refreshTaskAssignmentState(queryClient, projectId, taskId),
  });
}

export function useAcceptTaskAssignmentRequestMutation(
  projectId: string,
  taskId: string,
) {
  const queryClient = useQueryClient();

  return useMutation<TaskAssignmentRequest, ApiErrorShape, string>({
    mutationFn: (requestId) =>
      acceptTaskAssignmentRequestRequest(taskId, requestId),
    onSuccess: () => refreshTaskAssignmentState(queryClient, projectId, taskId),
  });
}
