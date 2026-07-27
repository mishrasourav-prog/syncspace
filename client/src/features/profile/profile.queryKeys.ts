import type {
  MemberProfileQuery,
} from "./types/profile.types";

/*
|--------------------------------------------------------------------------
| Profile Query Keys
|--------------------------------------------------------------------------
|
| These keys keep self-profile data, account-deletion readiness, and
| context-authorized member profiles in separate cache branches.
|
*/

export const profileQueryKeys = {
  all:
    [
      "profile",
    ] as const,

  /*
  |--------------------------------------------------------------------------
  | Authenticated Self Profile
  |--------------------------------------------------------------------------
  */

  self: () =>
    [
      ...profileQueryKeys
        .all,

      "self",
    ] as const,

  /*
  |--------------------------------------------------------------------------
  | Account Deletion Readiness
  |--------------------------------------------------------------------------
  |
  | Kept outside `self()` so profile edits do not unnecessarily invalidate
  | the ownership/admin blocker query.
  |
  */

  deletionReadiness: () =>
    [
      ...profileQueryKeys
        .all,

      "deletion-readiness",
    ] as const,

  /*
  |--------------------------------------------------------------------------
  | Read-Only Member Profiles
  |--------------------------------------------------------------------------
  |
  | Member visibility and role information depend on the supplied workspace
  | and/or project context. The context IDs must therefore be part of the
  | query key to prevent one authorized response being reused for another
  | context.
  |
  */

  members: () =>
    [
      ...profileQueryKeys
        .all,

      "members",
    ] as const,

  memberRoot: (
    userId:
      string
  ) =>
    [
      ...profileQueryKeys
        .members(),

      userId,
    ] as const,

  member: (
    userId:
      string,
    query:
      MemberProfileQuery
  ) =>
    [
      ...profileQueryKeys
        .memberRoot(
          userId
        ),

      query.workspaceId ??
        null,

      query.projectId ??
        null,
    ] as const,
};