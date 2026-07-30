import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import type { ApiErrorShape } from "@/lib/axios";

import {
  archiveWorkspaceRequest,
  createWorkspaceRequest,
  leaveWorkspaceRequest,
  removeWorkspaceAvatarRequest,
  replaceWorkspaceAvatarRequest,
  restoreWorkspaceRequest,
  updateWorkspaceRequest,
} from "../api/workspace.api";

import { workspaceQueryKeys } from "../workspace.queryKeys";

import type {
  CreatedWorkspace,
  CreateWorkspacePayload,
  ReplaceWorkspaceAvatarPayload,
  UpdateWorkspacePayload,
  WorkspaceSummary,
} from "../types/workspace.types";

const synchronizeWorkspace = (
  queryClient: QueryClient,
  updatedWorkspace: WorkspaceSummary,
): void => {
  queryClient.setQueryData<WorkspaceSummary[]>(
    workspaceQueryKeys.list(),
    (previous) =>
      previous?.map((workspace) =>
        workspace._id === updatedWorkspace._id ? updatedWorkspace : workspace,
      ),
  );

  queryClient.setQueryData<WorkspaceSummary>(
    workspaceQueryKeys.detail(updatedWorkspace._id),
    updatedWorkspace,
  );

  void queryClient.invalidateQueries({
    queryKey: workspaceQueryKeys.list(),
  });

  void queryClient.invalidateQueries({
    queryKey: workspaceQueryKeys.detail(updatedWorkspace._id),
  });
};

export function useCreateWorkspaceMutation() {
  const queryClient = useQueryClient();

  return useMutation<CreatedWorkspace, ApiErrorShape, CreateWorkspacePayload>({
    mutationFn: createWorkspaceRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.list(),
      });
    },
  });
}

export function useUpdateWorkspaceMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    WorkspaceSummary,
    ApiErrorShape,
    {
      workspaceId: string;
      payload: UpdateWorkspacePayload;
    }
  >({
    mutationFn: ({ workspaceId, payload }) =>
      updateWorkspaceRequest(workspaceId, payload),
    onSuccess: (updatedWorkspace) => {
      synchronizeWorkspace(queryClient, updatedWorkspace);
    },
  });
}

export function useReplaceWorkspaceAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    WorkspaceSummary,
    ApiErrorShape,
    ReplaceWorkspaceAvatarPayload
  >({
    mutationFn: replaceWorkspaceAvatarRequest,
    onSuccess: (updatedWorkspace) => {
      synchronizeWorkspace(queryClient, updatedWorkspace);
    },
  });
}

export function useRemoveWorkspaceAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation<WorkspaceSummary, ApiErrorShape, string>({
    mutationFn: removeWorkspaceAvatarRequest,
    onSuccess: (updatedWorkspace) => {
      synchronizeWorkspace(queryClient, updatedWorkspace);
    },
  });
}

export function useArchiveWorkspaceMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorShape, string>({
    mutationFn: archiveWorkspaceRequest,
    onSuccess: (_data, workspaceId) => {
      void queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.list(),
      });

      void queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.detail(workspaceId),
      });
    },
  });
}

export function useRestoreWorkspaceMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorShape, string>({
    mutationFn: restoreWorkspaceRequest,
    onSuccess: (_data, workspaceId) => {
      void queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.list(),
      });

      void queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.detail(workspaceId),
      });
    },
  });
}

export function useLeaveWorkspaceMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorShape, string>({
    mutationFn: leaveWorkspaceRequest,
    onSuccess: (_data, workspaceId) => {
      queryClient.setQueryData<WorkspaceSummary[]>(
        workspaceQueryKeys.list(),
        (previous) =>
          previous?.filter((workspace) => workspace._id !== workspaceId),
      );

      void queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.list(),
      });

      queryClient.removeQueries({
        queryKey: workspaceQueryKeys.detail(workspaceId),
      });
    },
  });
}
