export const projectQueryKeys = {
  all: ["projects"] as const,
  workspaceList: (workspaceId: string) => [...projectQueryKeys.all, "workspace", workspaceId] as const,
};
