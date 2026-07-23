import { useQuery } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import { getProjectTasksRequest, getTaskRequest } from "../api/task.api";
import { getTaskAssigneesRequest } from "../api/taskAssignee.api";
import { taskQueryKeys } from "../task.queryKeys";
import type { Task } from "../types/task.types";
import type { TaskAssignee } from "../types/taskAssignee.types";

export function useProjectTasksQuery(projectId: string | undefined) {
  return useQuery<Task[], ApiErrorShape>({
    queryKey: taskQueryKeys.projectList(projectId ?? ""),
    queryFn: () => {
      if (!projectId) {
        return Promise.resolve([]);
      }

      return getProjectTasksRequest(projectId);
    },
    enabled: Boolean(projectId),
  });
}

/**
 * Authoritative single-task query for the Task Detail page. It is nested
 * beneath the project task prefix so project-access revocation clears it.
 */
export function useTaskQuery(projectId: string | undefined, taskId: string | undefined) {
  return useQuery<Task, ApiErrorShape>({
    queryKey: taskQueryKeys.detail(projectId ?? "", taskId ?? ""),
    queryFn: () => {
      if (!taskId) {
        return Promise.reject(new Error("Task ID is required."));
      }

      return getTaskRequest(taskId);
    },
    enabled: Boolean(projectId) && Boolean(taskId),
  });
}

/**
 * Detailed assignment records are used only by Task Detail. Collection cards
 * continue using the previews already embedded in the task DTO.
 */
export function useTaskAssigneesQuery(
  projectId: string | undefined,
  taskId: string | undefined
) {
  return useQuery<TaskAssignee[], ApiErrorShape>({
    queryKey: taskQueryKeys.assignees(projectId ?? "", taskId ?? ""),
    queryFn: () => {
      if (!taskId) {
        return Promise.resolve([]);
      }

      return getTaskAssigneesRequest(taskId);
    },
    enabled: Boolean(projectId) && Boolean(taskId),
  });
}
