import {
  useQuery,
} from "@tanstack/react-query";

import type {
  ApiErrorShape,
} from "@/lib/axios";

import {
  getDeletionReadinessRequest,
  getMemberProfileRequest,
  getSelfProfileRequest,
} from "../api/profile.api";

import {
  profileQueryKeys,
} from "../profile.queryKeys";

import type {
  AccountDeletionReadiness,
  MemberProfile,
  MemberProfileQuery,
  SelfProfile,
} from "../types/profile.types";

/*
|--------------------------------------------------------------------------
| Authenticated Self Profile
|--------------------------------------------------------------------------
|
| `enabled` allows route/bootstrap code to delay this request until the
| authentication session has been resolved.
|
*/

export function useSelfProfileQuery(
  enabled:
    boolean =
      true
) {
  return useQuery<
    SelfProfile,
    ApiErrorShape
  >({
    queryKey:
      profileQueryKeys
        .self(),

    queryFn:
      getSelfProfileRequest,

    enabled,

    staleTime:
      30_000,
  });
}

/*
|--------------------------------------------------------------------------
| Account-Deletion Readiness
|--------------------------------------------------------------------------
|
| This query should normally be enabled only while the delete-account dialog
| or danger section is open. Ownership/admin blockers can change independently
| from ordinary profile fields, so it has its own cache key.
|
*/

export function useDeletionReadinessQuery(
  enabled:
    boolean =
      true
) {
  return useQuery<
    AccountDeletionReadiness,
    ApiErrorShape
  >({
    queryKey:
      profileQueryKeys
        .deletionReadiness(),

    queryFn:
      getDeletionReadinessRequest,

    enabled,

    staleTime:
      15_000,
  });
}

/*
|--------------------------------------------------------------------------
| Context-Authorized Member Profile
|--------------------------------------------------------------------------
|
| The request is valid only when:
|
| - a target user ID exists; and
| - workspaceId, projectId, or both are available.
|
| Keeping the authorization context in both the query key and request prevents
| cached role/context data from leaking across workspace or project views.
|
*/

export function useMemberProfileQuery(
  userId:
    string |
    undefined,

  query:
    MemberProfileQuery,

  enabled:
    boolean =
      true
) {
  const normalizedUserId =
    userId?.trim() ??
    "";

  const normalizedQuery:
    MemberProfileQuery = {
      workspaceId:
        query.workspaceId
          ?.trim() ||
        undefined,

      projectId:
        query.projectId
          ?.trim() ||
        undefined,
    };

  const hasContext =
    Boolean(
      normalizedQuery
        .workspaceId ||
      normalizedQuery
        .projectId
    );

  const canFetch =
    enabled &&
    normalizedUserId.length >
      0 &&
    hasContext;

  return useQuery<
    MemberProfile,
    ApiErrorShape
  >({
    queryKey:
      profileQueryKeys
        .member(
          normalizedUserId,
          normalizedQuery
        ),

    queryFn:
      () => {
        if (
          !normalizedUserId ||
          !hasContext
        ) {
          return Promise.reject(
            new Error(
              "A member ID and workspace or project context are required."
            )
          );
        }

        return getMemberProfileRequest(
          normalizedUserId,
          normalizedQuery
        );
      },

    enabled:
      canFetch,

    staleTime:
      30_000,
  });
}