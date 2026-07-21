import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import { createTaskRequest, updateTaskStatusRequest } from "../api/task.api";
import { taskQueryKeys } from "../task.queryKeys";
import type { CreateTaskPayload, Task, TaskStatus } from "../types/task.types";

export function useCreateTaskMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<Task, ApiErrorShape, CreateTaskPayload>({
    mutationFn: (payload) => createTaskRequest(projectId, payload),
    onSuccess: (createdTask) => {
      queryClient.setQueryData<Task[]>(taskQueryKeys.projectList(projectId), (previous) =>
        previous ? [createdTask, ...previous] : [createdTask]
      );
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.projectList(projectId) });
    },
  });
}

interface UpdateTaskStatusVariables {
  taskId: string;
  status: TaskStatus;
}

export function useUpdateTaskStatusMutation(projectId: string) {
  const queryClient = useQueryClient();
  const queryKey = taskQueryKeys.projectList(projectId);

  return useMutation<Task, ApiErrorShape, UpdateTaskStatusVariables, { previousTasks?: Task[] }>({
    mutationFn: ({ taskId, status }) => updateTaskStatusRequest(taskId, status),
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);

      queryClient.setQueryData<Task[]>(queryKey, (previous) =>
        previous?.map((task) => (task._id === taskId ? { ...task, status } : task))
      );

      return { previousTasks };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
    },
    onSuccess: (updatedTask) => {
      queryClient.setQueryData<Task[]>(queryKey, (previous) =>
        previous?.map((task) => (task._id === updatedTask._id ? updatedTask : task))
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
