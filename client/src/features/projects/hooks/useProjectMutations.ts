import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import { createProjectRequest } from "../api/project.api";
import { projectQueryKeys } from "../project.queryKeys";
import type { CreateProjectPayload, Project } from "../types/project.types";

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
