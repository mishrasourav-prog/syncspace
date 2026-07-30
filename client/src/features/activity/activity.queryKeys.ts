export const activityQueryKeys = {
  all: ["activity"] as const,
  workspace: (workspaceId: string) =>
    [...activityQueryKeys.all, "workspace", workspaceId] as const,
  project: (projectId: string) =>
    [...activityQueryKeys.all, "project", projectId] as const,
};
