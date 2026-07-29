import { axiosClient } from "@/lib/axios";
import type { ApiResponse } from "@/features/auth/types/api.types";
import type { ProjectInvitation, ProjectInvitationRole } from "../types/projectInvitation.types";

export interface InviteProjectMemberPayload {
  email: string;
  role: ProjectInvitationRole;
}

export async function inviteProjectMemberRequest(
  projectId: string,
  payload: InviteProjectMemberPayload
): Promise<ProjectInvitation> {
  return axiosClient
    .post<ApiResponse<ProjectInvitation>>(`/projects/${projectId}/invitations`, payload)
    .then((res) => res.data.data);
}

export async function getPendingProjectInvitationsRequest(
  projectId: string
): Promise<ProjectInvitation[]> {
  return axiosClient
    .get<ApiResponse<{ invitations: ProjectInvitation[] }>>(`/projects/${projectId}/invitations`)
    .then((res) => res.data.data.invitations);
}

export async function getMyProjectInvitationsRequest(): Promise<ProjectInvitation[]> {
  return axiosClient
    .get<ApiResponse<{ invitations: ProjectInvitation[] }>>("/project-invitations")
    .then((res) => res.data.data.invitations);
}

export async function acceptProjectInvitationRequest(invitationId: string): Promise<void> {
  await axiosClient.post<ApiResponse<void>>(`/project-invitations/${invitationId}/accept`);
}

export async function rejectProjectInvitationRequest(invitationId: string): Promise<void> {
  await axiosClient.post<ApiResponse<void>>(`/project-invitations/${invitationId}/reject`);
}

export async function cancelProjectInvitationRequest(invitationId: string): Promise<void> {
  await axiosClient.delete<ApiResponse<void>>(`/project-invitations/${invitationId}`);
}
