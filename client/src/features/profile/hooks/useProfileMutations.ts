import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import { useAuthStore } from "@/app/store";

import { activityQueryKeys } from "@/features/activity/activity.queryKeys";

import { endAuthenticatedSession } from "@/features/auth/session/endAuthenticatedSession";

import { useNavigate } from "react-router-dom";

import { authQueryKeys } from "@/features/auth/hooks/useAuthQueries";

import type { AuthUser } from "@/features/auth/types/auth.types";

import { discussionQueryKeys } from "@/features/discussions/discussion.queryKeys";

import { documentQueryKeys } from "@/features/documents/document.queryKeys";

import { notificationQueryKeys } from "@/features/notifications/notification.queryKeys";

import { projectMemberQueryKeys } from "@/features/project-members/projectMember.queryKeys";

import { taskQueryKeys } from "@/features/tasks/task.queryKeys";

import { workspaceMemberQueryKeys } from "@/features/workspace-members/workspaceMember.queryKeys";

import type { ApiErrorShape } from "@/lib/axios";

import {
  changePasswordRequest,
  deleteAccountRequest,
  removeAvatarRequest,
  replaceAvatarRequest,
  updateSelfProfileRequest,
} from "../api/profile.api";

import { profileQueryKeys } from "../profile.queryKeys";

import type {
  ChangePasswordPayload,
  DeleteAccountPayload,
  ReplaceAvatarPayload,
  SelfProfile,
  UpdateSelfProfilePayload,
} from "../types/profile.types";

const toAuthUser = (profile: SelfProfile): AuthUser => ({
  _id: profile._id,

  name: profile.name,

  username: profile.username,

  email: profile.email,

  avatar: profile.avatar ?? undefined,
});

const synchronizeProfile = async (
  queryClient: QueryClient,

  setUser: (user: AuthUser | null) => void,

  profile: SelfProfile,
): Promise<void> => {
  const authUser = toAuthUser(profile);

  queryClient.setQueryData<SelfProfile>(profileQueryKeys.self(), profile);

  queryClient.setQueryData<AuthUser>(authQueryKeys.currentUser, authUser);

  setUser(authUser);

  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: profileQueryKeys.members(),
    }),

    queryClient.invalidateQueries({
      queryKey: workspaceMemberQueryKeys.all,
    }),

    queryClient.invalidateQueries({
      queryKey: projectMemberQueryKeys.all,
    }),

    queryClient.invalidateQueries({
      queryKey: activityQueryKeys.all,
    }),

    queryClient.invalidateQueries({
      queryKey: taskQueryKeys.all,
    }),

    queryClient.invalidateQueries({
      queryKey: documentQueryKeys.all,
    }),

    queryClient.invalidateQueries({
      queryKey: discussionQueryKeys.all,
    }),

    queryClient.invalidateQueries({
      queryKey: notificationQueryKeys.all,
    }),
  ]);
};

export function useUpdateSelfProfileMutation() {
  const queryClient = useQueryClient();

  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<SelfProfile, ApiErrorShape, UpdateSelfProfilePayload>({
    mutationFn: updateSelfProfileRequest,

    onSuccess: async (profile) => {
      await synchronizeProfile(queryClient, setUser, profile);
    },
  });
}

export function useReplaceAvatarMutation() {
  const queryClient = useQueryClient();

  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<SelfProfile, ApiErrorShape, ReplaceAvatarPayload>({
    mutationFn: replaceAvatarRequest,

    onSuccess: async (profile) => {
      await synchronizeProfile(queryClient, setUser, profile);
    },
  });
}

export function useRemoveAvatarMutation() {
  const queryClient = useQueryClient();

  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<SelfProfile, ApiErrorShape, void>({
    mutationFn: removeAvatarRequest,

    onSuccess: async (profile) => {
      await synchronizeProfile(queryClient, setUser, profile);
    },
  });
}

export function useChangePasswordMutation() {
  const navigate = useNavigate();

  return useMutation<void, ApiErrorShape, ChangePasswordPayload>({
    mutationFn: changePasswordRequest,
    onSuccess: () => {
      endAuthenticatedSession({
        navigate,
        reason: "password_changed",
        message: "Password changed successfully. Sign in again.",
        tone: "success",
      });
    },
  });
}

export function useDeleteAccountMutation() {
  const navigate = useNavigate();

  return useMutation<void, ApiErrorShape, DeleteAccountPayload>({
    mutationFn: deleteAccountRequest,
    onSuccess: () => {
      endAuthenticatedSession({
        navigate,
        reason: "account_deleted",
        message: "Account deleted successfully.",
        tone: "success",
      });
    },
  });
}
