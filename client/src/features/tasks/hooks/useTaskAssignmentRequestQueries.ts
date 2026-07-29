import { useQuery } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import { getTaskAssignmentRequestsRequest } from "../api/taskAssignmentRequest.api";
import { taskQueryKeys } from "../task.queryKeys";
import type { TaskAssignmentRequest } from "../types/taskAssignmentRequest.types";

export function useTaskAssignmentRequestsQuery(
  projectId: string | undefined,
  taskId: string | undefined
) {
  return useQuery<TaskAssignmentRequest[], ApiErrorShape>({
    queryKey: taskQueryKeys.assignmentRequests(projectId ?? "", taskId ?? ""),
    queryFn: () => (taskId ? getTaskAssignmentRequestsRequest(taskId) : Promise.resolve([])),
    enabled: Boolean(projectId) && Boolean(taskId),
  });
}
