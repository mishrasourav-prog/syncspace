export const activityQueryKeys = {
  all: ["activity"] as const,
  workspace: (workspaceId: string) => [...activityQueryKeys.all, "workspace", workspaceId] as const,
};
