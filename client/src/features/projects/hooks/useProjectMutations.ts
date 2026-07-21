import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import {
  archiveProjectRequest,
  createProjectRequest,
  restoreProjectRequest,
  updateProjectRequest,
} from "../api/project.api";
import { projectQueryKeys } from "../project.queryKeys";
import type { CreateProjectPayload, Project, UpdateProjectPayload } from "../types/project.types";

export function useCreateProjectMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation<Project, ApiErrorShape, CreateProjectPayload>({
    mutationFn: (payload) => createProjectRequest(workspaceId, payload),
    onSuccess: (createdProject) => {
      queryClient.setQueryData<Project[]>(projectQueryKeys.workspaceList(workspaceId), (previous) =>
        previous ? [createdProject, ...previous] : [createdProject]
      );
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.workspaceList(workspaceId) });
    },
  });
}

export function useUpdateProjectMutation(projectId: string, workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation<Project, ApiErrorShape, UpdateProjectPayload>({
    mutationFn: (payload) => updateProjectRequest(projectId, payload),
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(projectQueryKeys.detail(projectId), updatedProject);
      queryClient.setQueryData<Project[]>(projectQueryKeys.workspaceList(workspaceId), (previous) =>
        previous?.map((project) => (project._id === updatedProject._id ? updatedProject : project))
      );
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.workspaceList(workspaceId) });
    },
  });
}

export function useArchiveProjectMutation(projectId: string, workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorShape, void>({
    mutationFn: () => archiveProjectRequest(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.workspaceList(workspaceId) });
    },
  });
}

export function useRestoreProjectMutation(projectId: string, workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorShape, void>({
    mutationFn: () => restoreProjectRequest(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.workspaceList(workspaceId) });
    },
  });
}
