import { axiosClient } from "@/lib/axios";
import type { ApiResponse } from "@/features/auth/types/api.types";
import type { WorkspaceInvitation } from "../workspaceInvitation.types";

export async function getMyInvitationsRequest(): Promise<WorkspaceInvitation[]> {
  return axiosClient
    .get<ApiResponse<{ invitations: WorkspaceInvitation[] }>>("/workspace-invitations")
    .then((res) => res.data.data!.invitations);
}

export async function acceptInvitationRequest(invitationId: string): Promise<void> {
  await axiosClient.post<ApiResponse<void>>(`/workspace-invitations/${invitationId}/accept`);
}

export async function rejectInvitationRequest(invitationId: string): Promise<void> {
  await axiosClient.post<ApiResponse<void>>(`/workspace-invitations/${invitationId}/reject`);
}
