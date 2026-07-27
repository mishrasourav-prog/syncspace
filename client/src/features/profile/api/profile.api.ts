import type {
  ApiResponse,
} from "@/features/auth/types/api.types";

import {
  axiosClient,
} from "@/lib/axios";

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

/*
|--------------------------------------------------------------------------
| Authenticated Self Profile
|--------------------------------------------------------------------------
*/

export async function getSelfProfileRequest():
  Promise<SelfProfile> {
  const response =
    await axiosClient.get<
      ApiResponse<SelfProfile>
    >(
      "/users/me/profile"
    );

  return response.data.data;
}

/*
|--------------------------------------------------------------------------
| Update Self Profile
|--------------------------------------------------------------------------
*/

export async function updateSelfProfileRequest(
  payload:
    UpdateSelfProfilePayload
): Promise<SelfProfile> {
  const response =
    await axiosClient.patch<
      ApiResponse<SelfProfile>
    >(
      "/users/me/profile",
      payload
    );

  return response.data.data;
}

/*
|--------------------------------------------------------------------------
| Avatar Upload and Removal
|--------------------------------------------------------------------------
|
| Authentication cookies are handled by the shared Axios instance.
|
| The backend expects exactly one multipart file field named "avatar".
|
*/

export async function replaceAvatarRequest(
  payload:
    ReplaceAvatarPayload
): Promise<SelfProfile> {
  const formData =
    new FormData();

  formData.append(
    "avatar",
    payload.file
  );

  const response =
    await axiosClient.post<
      ApiResponse<SelfProfile>
    >(
      "/users/me/avatar",
      formData
    );

  return response.data.data;
}

export async function removeAvatarRequest():
  Promise<SelfProfile> {
  const response =
    await axiosClient.delete<
      ApiResponse<SelfProfile>
    >(
      "/users/me/avatar"
    );

  return response.data.data;
}

/*
|--------------------------------------------------------------------------
| Password Security
|--------------------------------------------------------------------------
|
| A successful password change revokes every account session. The mutation
| layer will clear the Query cache and Zustand authentication state after this
| request resolves.
|
*/

export async function changePasswordRequest(
  payload:
    ChangePasswordPayload
): Promise<void> {
  await axiosClient.patch<
    ApiResponse<void>
  >(
    "/users/me/password",
    payload
  );
}

/*
|--------------------------------------------------------------------------
| Account Deletion
|--------------------------------------------------------------------------
*/

export async function getDeletionReadinessRequest():
  Promise<AccountDeletionReadiness> {
  const response =
    await axiosClient.get<
      ApiResponse<AccountDeletionReadiness>
    >(
      "/users/me/deletion-readiness"
    );

  return response.data.data;
}

export async function deleteAccountRequest(
  payload:
    DeleteAccountPayload
): Promise<void> {
  await axiosClient.delete<
    ApiResponse<void>
  >(
    "/users/me",
    {
      data:
        payload,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Context-Authorized Read-Only Member Profile
|--------------------------------------------------------------------------
|
| The backend requires workspaceId, projectId, or both. Axios omits undefined
| query values and sends only the authorization context currently available.
|
*/

export async function getMemberProfileRequest(
  userId:
    string,
  query:
    MemberProfileQuery
): Promise<MemberProfile> {
  const response =
    await axiosClient.get<
      ApiResponse<MemberProfile>
    >(
      `/users/${userId}/profile`,
      {
        params: {
          workspaceId:
            query.workspaceId,

          projectId:
            query.projectId,
        },
      }
    );

  return response.data.data;
}