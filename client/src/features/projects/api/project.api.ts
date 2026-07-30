import { axiosClient } from "@/lib/axios";
import type { ApiResponse } from "@/features/auth/types/api.types";
import type {
  CreateProjectPayload,
  Project,
  UpdateProjectPayload,
} from "../types/project.types";

export async function getWorkspaceProjectsRequest(
  workspaceId: string,
): Promise<Project[]> {
  return axiosClient
    .get<ApiResponse<{ projects: Project[] }>>(
      `/workspaces/${workspaceId}/projects`,
    )
    .then((res) => res.data.data.projects);
}

export async function createProjectRequest(
  workspaceId: string,
  payload: CreateProjectPayload,
): Promise<Project> {
  return axiosClient
    .post<ApiResponse<Project>>(`/workspaces/${workspaceId}/projects`, payload)
    .then((res) => res.data.data);
}

export async function getProjectRequest(projectId: string): Promise<Project> {
  return axiosClient
    .get<ApiResponse<Project>>(`/projects/${projectId}`)
    .then((res) => res.data.data);
}

export async function updateProjectRequest(
  projectId: string,
  payload: UpdateProjectPayload,
): Promise<Project> {
  return axiosClient
    .patch<ApiResponse<Project>>(`/projects/${projectId}`, payload)
    .then((res) => res.data.data);
}

export async function archiveProjectRequest(projectId: string): Promise<void> {
  await axiosClient.patch<ApiResponse<void>>(`/projects/${projectId}/archive`);
}

export async function restoreProjectRequest(projectId: string): Promise<void> {
  await axiosClient.patch<ApiResponse<void>>(`/projects/${projectId}/restore`);
}
