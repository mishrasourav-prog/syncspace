import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import {
  archiveTaskRequest,
  createTaskRequest,
  reorderProjectTasksRequest,
  restoreTaskRequest,
  updateTaskRequest,
  updateTaskStatusRequest,
} from "../api/task.api";
import { taskQueryKeys } from "../task.queryKeys";
import type {
  CreateTaskPayload,
  ReorderTasksPayload,
  ReorderTasksResult,
  Task,
  TaskStatus,
  UpdateTaskPayload,
} from "../types/task.types";

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

interface UpdateTaskVariables {
  taskId: string;
  payload: UpdateTaskPayload;
}

export function useUpdateTaskMutation(projectId: string) {
  const queryClient = useQueryClient();
  const queryKey = taskQueryKeys.projectList(projectId);

  return useMutation<Task, ApiErrorShape, UpdateTaskVariables>({
    mutationFn: ({ taskId, payload }) => updateTaskRequest(taskId, payload),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData<Task[]>(queryKey, (previous) =>
        previous?.map((task) => (task._id === updatedTask._id ? updatedTask : task))
      );
      queryClient.invalidateQueries({ queryKey });
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

export function useArchiveTaskMutation(projectId: string) {
  const queryClient = useQueryClient();
  const queryKey = taskQueryKeys.projectList(projectId);

  return useMutation<void, ApiErrorShape, string>({
    mutationFn: (taskId) => archiveTaskRequest(taskId),
    onSuccess: (_data, taskId) => {
      queryClient.setQueryData<Task[]>(queryKey, (previous) =>
        previous?.map((task) => (task._id === taskId ? { ...task, isArchived: true } : task))
      );
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useRestoreTaskMutation(projectId: string) {
  const queryClient = useQueryClient();
  const queryKey = taskQueryKeys.projectList(projectId);

  return useMutation<void, ApiErrorShape, string>({
    mutationFn: (taskId) => restoreTaskRequest(taskId),
    onSuccess: (_data, taskId) => {
      queryClient.setQueryData<Task[]>(queryKey, (previous) =>
        previous?.map((task) => (task._id === taskId ? { ...task, isArchived: false } : task))
      );
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

interface ReorderVariables {
  payload: ReorderTasksPayload;
  /** The complete optimistic board (all active root tasks) to apply immediately. */
  optimisticTasks: Task[];
}

export function useReorderProjectTasksMutation(projectId: string) {
  const queryClient = useQueryClient();
  const queryKey = taskQueryKeys.projectList(projectId);

  return useMutation<ReorderTasksResult, ApiErrorShape, ReorderVariables, { previousTasks?: Task[] }>({
    mutationFn: ({ payload }) => reorderProjectTasksRequest(projectId, payload),
    onMutate: async ({ optimisticTasks }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);
      queryClient.setQueryData<Task[]>(queryKey, optimisticTasks);
      return { previousTasks };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
    },
    onSettled: () => {
      // The reorder response only contains a count, not fresh task DTOs, so
      // the definitive board state always comes from a refetch.
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
