export const projectQueryKeys = {
  all: ["projects"] as const,
  workspaceList: (workspaceId: string) =>
    [...projectQueryKeys.all, "workspace", workspaceId] as const,
  detail: (projectId: string) =>
    [...projectQueryKeys.all, "detail", projectId] as const,
};
