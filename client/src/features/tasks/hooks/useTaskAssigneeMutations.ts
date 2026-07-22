import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import { assignTaskMemberRequest, removeTaskAssigneeRequest } from "../api/taskAssignee.api";
import { taskQueryKeys } from "../task.queryKeys";
import type { Task } from "../types/task.types";
import type { TaskAssignee } from "../types/taskAssignee.types";

export function useAssignTaskMemberMutation(projectId: string) {
  const queryClient = useQueryClient();
  const queryKey = taskQueryKeys.projectList(projectId);

  return useMutation<TaskAssignee, ApiErrorShape, { taskId: string; userId: string }>({
    mutationFn: ({ taskId, userId }) => assignTaskMemberRequest(taskId, userId),
    onSuccess: (assignee, { taskId }) => {
      queryClient.setQueryData<Task[]>(queryKey, (previous) =>
        previous?.map((task) =>
          task._id === taskId && !task.assignees.some((existing) => existing._id === assignee.user._id)
            ? {
                ...task,
                assignees: [
                  ...task.assignees,
                  {
                    _id: assignee.user._id,
                    name: assignee.user.name,
                    username: assignee.user.username,
                    avatar: assignee.user.avatar,
                  },
                ],
              }
            : task
        )
      );
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useRemoveTaskAssigneeMutation(projectId: string) {
  const queryClient = useQueryClient();
  const queryKey = taskQueryKeys.projectList(projectId);

  return useMutation<void, ApiErrorShape, { taskId: string; userId: string }>({
    mutationFn: ({ taskId, userId }) => removeTaskAssigneeRequest(taskId, userId),
    onSuccess: (_data, { taskId, userId }) => {
      queryClient.setQueryData<Task[]>(queryKey, (previous) =>
        previous?.map((task) =>
          task._id === taskId
            ? { ...task, assignees: task.assignees.filter((assignee) => assignee._id !== userId) }
            : task
        )
      );
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
