import { axiosClient } from "@/lib/axios";
import type { ApiResponse } from "@/features/auth/types/api.types";
import type { ProjectMember, ProjectRole } from "../types/projectMember.types";

export async function getProjectMembersRequest(
  projectId: string,
): Promise<ProjectMember[]> {
  return axiosClient
    .get<ApiResponse<{ members: ProjectMember[] }>>(
      `/projects/${projectId}/members`,
    )
    .then((res) => res.data.data.members);
}

export async function updateProjectMemberRoleRequest(
  projectId: string,
  memberId: string,
  role: ProjectRole,
): Promise<ProjectMember> {
  return axiosClient
    .patch<ApiResponse<ProjectMember>>(
      `/projects/${projectId}/members/${memberId}/role`,
      { role },
    )
    .then((res) => res.data.data);
}

export async function removeProjectMemberRequest(
  projectId: string,
  memberId: string,
): Promise<void> {
  await axiosClient.delete<ApiResponse<void>>(
    `/projects/${projectId}/members/${memberId}`,
  );
}

export async function leaveProjectRequest(projectId: string): Promise<void> {
  await axiosClient.post<ApiResponse<void>>(`/projects/${projectId}/leave`);
}
