import type { ApiResponse } from "@/features/auth/types/api.types";

import { axiosClient } from "@/lib/axios";

import type {
  AccountDeletionReadiness,
  ChangePasswordPayload,
  DeleteAccountPayload,
  MemberProfile,
  MemberProfileQuery,
  ReplaceAvatarPayload,
  SelfProfile,
  UpdateSelfProfilePayload,
} from "../types/profile.types";

export async function getSelfProfileRequest(): Promise<SelfProfile> {
  const response =
    await axiosClient.get<ApiResponse<SelfProfile>>("/users/me/profile");

  return response.data.data;
}

export async function updateSelfProfileRequest(
  payload: UpdateSelfProfilePayload,
): Promise<SelfProfile> {
  const response = await axiosClient.patch<ApiResponse<SelfProfile>>(
    "/users/me/profile",
    payload,
  );

  return response.data.data;
}

export async function replaceAvatarRequest(
  payload: ReplaceAvatarPayload,
): Promise<SelfProfile> {
  const formData = new FormData();

  formData.append("avatar", payload.file);

  const response = await axiosClient.post<ApiResponse<SelfProfile>>(
    "/users/me/avatar",
    formData,
  );

  return response.data.data;
}

export async function removeAvatarRequest(): Promise<SelfProfile> {
  const response =
    await axiosClient.delete<ApiResponse<SelfProfile>>("/users/me/avatar");

  return response.data.data;
}

export async function changePasswordRequest(
  payload: ChangePasswordPayload,
): Promise<void> {
  await axiosClient.patch<ApiResponse<void>>("/users/me/password", payload);
}

export async function getDeletionReadinessRequest(): Promise<AccountDeletionReadiness> {
  const response = await axiosClient.get<ApiResponse<AccountDeletionReadiness>>(
    "/users/me/deletion-readiness",
  );

  return response.data.data;
}

export async function deleteAccountRequest(
  payload: DeleteAccountPayload,
): Promise<void> {
  await axiosClient.delete<ApiResponse<void>>("/users/me", {
    data: payload,
  });
}

export async function getMemberProfileRequest(
  userId: string,
  query: MemberProfileQuery,
): Promise<MemberProfile> {
  const response = await axiosClient.get<ApiResponse<MemberProfile>>(
    `/users/${userId}/profile`,
    {
      params: {
        workspaceId: query.workspaceId,

        projectId: query.projectId,
      },
    },
  );

  return response.data.data;
}
