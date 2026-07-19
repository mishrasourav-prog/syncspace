import { axiosClient } from "@/lib/axios";
import type { ApiResponse } from "@/features/auth/types/api.types";
import type { AssignableWorkspaceRole, WorkspaceMember } from "../types/workspaceMember.types";

export async function getWorkspaceMembersRequest(workspaceId: string): Promise<WorkspaceMember[]> {
  return axiosClient
    .get<ApiResponse<{ members: WorkspaceMember[] }>>(`/workspaces/${workspaceId}/members`)
    .then((res) => res.data.data.members);
}

export async function updateWorkspaceMemberRoleRequest(
  workspaceId: string,
  memberId: string,
  role: AssignableWorkspaceRole
): Promise<WorkspaceMember> {
  return axiosClient
    .patch<ApiResponse<WorkspaceMember>>(`/workspaces/${workspaceId}/members/${memberId}`, { role })
    .then((res) => res.data.data);
}

export async function removeWorkspaceMemberRequest(workspaceId: string, memberId: string): Promise<void> {
  await axiosClient.delete<ApiResponse<void>>(`/workspaces/${workspaceId}/members/${memberId}`);
}
