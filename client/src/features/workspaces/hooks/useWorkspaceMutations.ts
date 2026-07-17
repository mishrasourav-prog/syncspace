import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import {
  archiveWorkspaceRequest,
  createWorkspaceRequest,
  leaveWorkspaceRequest,
  restoreWorkspaceRequest,
  updateWorkspaceRequest,
} from "../api/workspace.api";
import { workspaceQueryKeys } from "../workspace.queryKeys";
import type {
  CreatedWorkspace,
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
  WorkspaceSummary,
} from "../types/workspace.types";

export function useCreateWorkspaceMutation() {
  const queryClient = useQueryClient();

  return useMutation<CreatedWorkspace, ApiErrorShape, CreateWorkspacePayload>({
    mutationFn: createWorkspaceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list() });
    },
  });
}

export function useUpdateWorkspaceMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    WorkspaceSummary,
    ApiErrorShape,
    { workspaceId: string; payload: UpdateWorkspacePayload }
  >({
    mutationFn: ({ workspaceId, payload }) => updateWorkspaceRequest(workspaceId, payload),
    onSuccess: (updatedWorkspace, { workspaceId }) => {
      queryClient.setQueryData<WorkspaceSummary[]>(workspaceQueryKeys.list(), (previous) =>
        previous?.map((workspace) => (workspace._id === workspaceId ? updatedWorkspace : workspace))
      );
      queryClient.setQueryData(workspaceQueryKeys.detail(workspaceId), updatedWorkspace);
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.detail(workspaceId) });
    },
  });
}

export function useArchiveWorkspaceMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorShape, string>({
    mutationFn: archiveWorkspaceRequest,
    onSuccess: (_data, workspaceId) => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.detail(workspaceId) });
    },
  });
}

export function useRestoreWorkspaceMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorShape, string>({
    mutationFn: restoreWorkspaceRequest,
    onSuccess: (_data, workspaceId) => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.detail(workspaceId) });
    },
  });
}

export function useLeaveWorkspaceMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorShape, string>({
    mutationFn: leaveWorkspaceRequest,
    onSuccess: (_data, workspaceId) => {
      queryClient.setQueryData<WorkspaceSummary[]>(workspaceQueryKeys.list(), (previous) =>
        previous?.filter((workspace) => workspace._id !== workspaceId)
      );
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.list() });
      queryClient.removeQueries({ queryKey: workspaceQueryKeys.detail(workspaceId) });
    },
  });
}
