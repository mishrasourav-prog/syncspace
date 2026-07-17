import { axiosClient } from "@/lib/axios";
import type { ApiResponse } from "@/features/auth/types/api.types";
import type {
  CreatedWorkspace,
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
  WorkspaceSummary,
} from "../types/workspace.types";

export async function getUserWorkspacesRequest(): Promise<WorkspaceSummary[]> {
  return axiosClient
    .get<ApiResponse<{ workspaces: WorkspaceSummary[] }>>("/workspaces")
    .then((res) => res.data.data!.workspaces);
}

export async function getWorkspaceRequest(workspaceId: string): Promise<WorkspaceSummary> {
  return axiosClient
    .get<ApiResponse<{ workspace: WorkspaceSummary }>>(`/workspaces/${workspaceId}`)
    .then((res) => res.data.data!.workspace);
}

export async function createWorkspaceRequest(payload: CreateWorkspacePayload): Promise<CreatedWorkspace> {
  return axiosClient
    .post<ApiResponse<CreatedWorkspace>>("/workspaces", payload)
    .then((res) => res.data.data!);
}

export async function updateWorkspaceRequest(
  workspaceId: string,
  payload: UpdateWorkspacePayload
): Promise<WorkspaceSummary> {
  return axiosClient
    .patch<ApiResponse<{ workspace: WorkspaceSummary }>>(`/workspaces/${workspaceId}`, payload)
    .then((res) => res.data.data!.workspace);
}

export async function archiveWorkspaceRequest(workspaceId: string): Promise<void> {
  await axiosClient.patch<ApiResponse<void>>(`/workspaces/${workspaceId}/archive`);
}

export async function restoreWorkspaceRequest(workspaceId: string): Promise<void> {
  await axiosClient.patch<ApiResponse<void>>(`/workspaces/${workspaceId}/restore`);
}

export async function leaveWorkspaceRequest(workspaceId: string): Promise<void> {
  await axiosClient.post<ApiResponse<void>>(`/workspaces/${workspaceId}/leave`);
}
