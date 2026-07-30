import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import {
  assignTaskMemberRequest,
  removeTaskAssigneeRequest,
} from "../api/taskAssignee.api";
import { taskQueryKeys } from "../task.queryKeys";
import type { Task, TaskAssigneePreview } from "../types/task.types";
import type { TaskAssignee } from "../types/taskAssignee.types";

function addPreviewToTask(task: Task, preview: TaskAssigneePreview): Task {
  if (task.assignees.some((existing) => existing._id === preview._id)) {
    return task;
  }

  return {
    ...task,
    assignees: [...task.assignees, preview],
  };
}

function removePreviewFromTask(task: Task, userId: string): Task {
  return {
    ...task,
    assignees: task.assignees.filter((assignee) => assignee._id !== userId),
  };
}

export function useAssignTaskMemberMutation(projectId: string) {
  const queryClient = useQueryClient();
  const projectListKey = taskQueryKeys.projectList(projectId);

  return useMutation<
    TaskAssignee,
    ApiErrorShape,
    { taskId: string; userId: string }
  >({
    mutationFn: ({ taskId, userId }) => assignTaskMemberRequest(taskId, userId),
    onSuccess: (assignee, { taskId }) => {
      const preview: TaskAssigneePreview = {
        _id: assignee.user._id,
        name: assignee.user.name,
        username: assignee.user.username,
        avatar: assignee.user.avatar,
      };

      queryClient.setQueryData<Task[]>(projectListKey, (previous) =>
        previous?.map((task) =>
          task._id === taskId ? addPreviewToTask(task, preview) : task,
        ),
      );

      queryClient.setQueryData<Task>(
        taskQueryKeys.detail(projectId, taskId),
        (previous) =>
          previous ? addPreviewToTask(previous, preview) : previous,
      );

      queryClient.setQueryData<TaskAssignee[]>(
        taskQueryKeys.assignees(projectId, taskId),
        (previous) =>
          previous &&
          !previous.some((existing) => existing.user._id === assignee.user._id)
            ? [...previous, assignee]
            : previous,
      );

      void queryClient.invalidateQueries({ queryKey: projectListKey });
      void queryClient.invalidateQueries({
        queryKey: taskQueryKeys.detail(projectId, taskId),
      });
      void queryClient.invalidateQueries({
        queryKey: taskQueryKeys.assignees(projectId, taskId),
      });
    },
  });
}

export function useRemoveTaskAssigneeMutation(projectId: string) {
  const queryClient = useQueryClient();
  const projectListKey = taskQueryKeys.projectList(projectId);

  return useMutation<void, ApiErrorShape, { taskId: string; userId: string }>({
    mutationFn: ({ taskId, userId }) =>
      removeTaskAssigneeRequest(taskId, userId),
    onSuccess: (_data, { taskId, userId }) => {
      queryClient.setQueryData<Task[]>(projectListKey, (previous) =>
        previous?.map((task) =>
          task._id === taskId ? removePreviewFromTask(task, userId) : task,
        ),
      );

      queryClient.setQueryData<Task>(
        taskQueryKeys.detail(projectId, taskId),
        (previous) =>
          previous ? removePreviewFromTask(previous, userId) : previous,
      );

      queryClient.setQueryData<TaskAssignee[]>(
        taskQueryKeys.assignees(projectId, taskId),
        (previous) =>
          previous?.filter((assignee) => assignee.user._id !== userId),
      );

      void queryClient.invalidateQueries({ queryKey: projectListKey });
      void queryClient.invalidateQueries({
        queryKey: taskQueryKeys.detail(projectId, taskId),
      });
      void queryClient.invalidateQueries({
        queryKey: taskQueryKeys.assignees(projectId, taskId),
      });
    },
  });
}
