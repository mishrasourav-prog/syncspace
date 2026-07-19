import { axiosClient } from "@/lib/axios";
import type { ApiResponse } from "@/features/auth/types/api.types";
import type { CreateProjectPayload, Project } from "../types/project.types";

export async function getWorkspaceProjectsRequest(workspaceId: string): Promise<Project[]> {
  return axiosClient
    .get<ApiResponse<{ projects: Project[] }>>(`/workspaces/${workspaceId}/projects`)
    .then((res) => res.data.data.projects);
}

export async function createProjectRequest(
  workspaceId: string,
  payload: CreateProjectPayload
): Promise<Project> {
  return axiosClient
    .post<ApiResponse<Project>>(`/workspaces/${workspaceId}/projects`, payload)
    .then((res) => res.data.data);
}
