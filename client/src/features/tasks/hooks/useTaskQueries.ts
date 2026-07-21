import { useQuery } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import { getProjectTasksRequest } from "../api/task.api";
import { taskQueryKeys } from "../task.queryKeys";
import type { Task } from "../types/task.types";

export function useProjectTasksQuery(projectId: string | undefined) {
  return useQuery<Task[], ApiErrorShape>({
    queryKey: taskQueryKeys.projectList(projectId ?? ""),
    queryFn: () => getProjectTasksRequest(projectId!),
    enabled: Boolean(projectId),
  });
}
