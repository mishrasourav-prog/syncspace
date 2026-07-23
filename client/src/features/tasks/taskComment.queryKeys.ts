import { taskQueryKeys } from "./task.queryKeys";

export const taskCommentQueryKeys = {
  task: (projectId: string, taskId: string) =>
    [...taskQueryKeys.detail(projectId, taskId), "comments"] as const,

  list: (projectId: string, taskId: string, limit: number) =>
    [...taskCommentQueryKeys.task(projectId, taskId), "list", limit] as const,
};
