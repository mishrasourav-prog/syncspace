import { useQuery } from "@tanstack/react-query";

import type { ApiErrorShape } from "@/lib/axios";

import {
  getDeletionReadinessRequest,
  getMemberProfileRequest,
  getSelfProfileRequest,
} from "../api/profile.api";

import { profileQueryKeys } from "../profile.queryKeys";

import type {
  AccountDeletionReadiness,
  MemberProfile,
  MemberProfileQuery,
  SelfProfile,
} from "../types/profile.types";

export function useSelfProfileQuery(enabled: boolean = true) {
  return useQuery<SelfProfile, ApiErrorShape>({
    queryKey: profileQueryKeys.self(),

    queryFn: getSelfProfileRequest,

    enabled,

    staleTime: 30_000,
  });
}

export function useDeletionReadinessQuery(enabled: boolean = true) {
  return useQuery<AccountDeletionReadiness, ApiErrorShape>({
    queryKey: profileQueryKeys.deletionReadiness(),

    queryFn: getDeletionReadinessRequest,

    enabled,

    staleTime: 15_000,
  });
}

export function useMemberProfileQuery(
  userId: string | undefined,

  query: MemberProfileQuery,

  enabled: boolean = true,
) {
  const normalizedUserId = userId?.trim() ?? "";

  const normalizedQuery: MemberProfileQuery = {
    workspaceId: query.workspaceId?.trim() || undefined,

    projectId: query.projectId?.trim() || undefined,
  };

  const hasContext = Boolean(
    normalizedQuery.workspaceId || normalizedQuery.projectId,
  );

  const canFetch = enabled && normalizedUserId.length > 0 && hasContext;

  return useQuery<MemberProfile, ApiErrorShape>({
    queryKey: profileQueryKeys.member(normalizedUserId, normalizedQuery),

    queryFn: () => {
      if (!normalizedUserId || !hasContext) {
        return Promise.reject(
          new Error(
            "A member ID and workspace or project context are required.",
          ),
        );
      }

      return getMemberProfileRequest(normalizedUserId, normalizedQuery);
    },

    enabled: canFetch,

    staleTime: 30_000,
  });
}
