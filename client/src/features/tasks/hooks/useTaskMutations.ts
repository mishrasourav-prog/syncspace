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

/**
 * Writes a fresh task DTO into both the project task-list cache and, when a
 * detail query for it exists, the task-detail cache — keeping the
 * collection and detail views consistent per spec section 28.
 */
function writeTaskToCaches(queryClient: ReturnType<typeof useQueryClient>, projectId: string, task: Task) {
  queryClient.setQueryData<Task[]>(taskQueryKeys.projectList(projectId), (previous) =>
    previous?.map((existing) => (existing._id === task._id ? task : existing))
  );
  queryClient.setQueryData<Task>(taskQueryKeys.detail(projectId, task._id), task);
}

export function useCreateTaskMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<Task, ApiErrorShape, CreateTaskPayload>({
    mutationFn: (payload) => createTaskRequest(projectId, payload),
    onSuccess: (createdTask) => {
      queryClient.setQueryData<Task[]>(taskQueryKeys.projectList(projectId), (previous) => {
        const nextTasks = previous ? [...previous, createdTask] : [createdTask];
        return nextTasks.sort((a, b) => (a.position - b.position) || a._id.localeCompare(b._id));
      });
      void queryClient.invalidateQueries({ queryKey: taskQueryKeys.projectList(projectId) });
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
      writeTaskToCaches(queryClient, projectId, updatedTask);
      void queryClient.invalidateQueries({ queryKey });
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

  return useMutation<Task, ApiErrorShape, UpdateTaskStatusVariables, { previousTasks?: Task[]; previousDetail?: Task }>({
    mutationFn: ({ taskId, status }) => updateTaskStatusRequest(taskId, status),
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);
      const detailKey = taskQueryKeys.detail(projectId, taskId);
      const previousDetail = queryClient.getQueryData<Task>(detailKey);

      queryClient.setQueryData<Task[]>(queryKey, (previous) =>
        previous?.map((task) => (task._id === taskId ? { ...task, status } : task))
      );
      queryClient.setQueryData<Task>(detailKey, (previous) => (previous ? { ...previous, status } : previous));

      return { previousTasks, previousDetail };
    },
    onError: (_error, { taskId }, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(taskQueryKeys.detail(projectId, taskId), context.previousDetail);
      }
    },
    onSuccess: (updatedTask) => {
      writeTaskToCaches(queryClient, projectId, updatedTask);
    },
    onSettled: (_data, _error, { taskId }) => {
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(projectId, taskId) });
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
      queryClient.setQueryData<Task>(taskQueryKeys.detail(projectId, taskId), (previous) =>
        previous ? { ...previous, isArchived: true } : previous
      );
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(projectId, taskId) });
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
      queryClient.setQueryData<Task>(taskQueryKeys.detail(projectId, taskId), (previous) =>
        previous ? { ...previous, isArchived: false } : previous
      );
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(projectId, taskId) });
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
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}
