import type { MemberProfileQuery } from "./types/profile.types";

export const profileQueryKeys = {
  all: ["profile"] as const,

  self: () => [...profileQueryKeys.all, "self"] as const,

  deletionReadiness: () =>
    [...profileQueryKeys.all, "deletion-readiness"] as const,

  members: () => [...profileQueryKeys.all, "members"] as const,

  memberRoot: (userId: string) =>
    [...profileQueryKeys.members(), userId] as const,

  member: (userId: string, query: MemberProfileQuery) =>
    [
      ...profileQueryKeys.memberRoot(userId),

      query.workspaceId ?? null,

      query.projectId ?? null,
    ] as const,
};
