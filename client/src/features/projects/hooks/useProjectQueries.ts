import { useQuery } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import { getProjectRequest, getWorkspaceProjectsRequest } from "../api/project.api";
import { projectQueryKeys } from "../project.queryKeys";
import type { Project } from "../types/project.types";

export function useWorkspaceProjectsQuery(workspaceId: string | undefined) {
  return useQuery<Project[], ApiErrorShape>({
    queryKey: projectQueryKeys.workspaceList(workspaceId ?? ""),
    queryFn: () => getWorkspaceProjectsRequest(workspaceId!),
    enabled: Boolean(workspaceId),
  });
}

export function useProjectQuery(projectId: string | undefined) {
  return useQuery<Project, ApiErrorShape>({
    queryKey: projectQueryKeys.detail(projectId ?? ""),
    queryFn: () => getProjectRequest(projectId!),
    enabled: Boolean(projectId),
  });
}
